// twister_directmsg.js
// 2013 Miguel Freitas
//
// Handle direct messages modal

function requestDMsnippetList(dmThreadList) {
    var followList = [];
    for( var i = 0; i < followingUsers.length; i++ ) {
        followList.push({username:followingUsers[i]});
    }

    twisterRpc("getdirectmsgs", [defaultScreenName, 1, followList],
           function(req, ret) {processDMsnippet(ret, dmThreadList);}, dmThreadList,
           function(req, ret) {console.log("ajax error:" + ret);}, null);
}

function processDMsnippet(dmUsers, dmThreadList) {
    dmThreadList.empty();

    for( var u in dmUsers ) {
        if( dmUsers.hasOwnProperty(u) ) {
            // convert snipped to html and add it to date-sorted list
            var dmItem = dmDataToSnippetItem(dmUsers[u][0], u);
            var timeDmItem = parseInt(dmItem.attr("data-time"));
            var existingItems = dmThreadList.children();
            var j = 0;
            for( j = 0; j < existingItems.length; j++) {
                var streamItem = existingItems.eq(j);
                var timeExisting = streamItem.attr("data-time");
                if( timeExisting == undefined ||
                    timeDmItem > parseInt(timeExisting) ) {
                    // this post in stream is older, so post must be inserted above
                    streamItem.before(dmItem);
                    break;
                }
            }
            if( j == existingItems.length ) {
                dmThreadList.append(dmItem);
            }
        }
    }
    $.MAL.dmThreadListLoaded();
}

function openDmConversation(dm_screenname, dmTitleName, dmConversation) {
    getFullname( dm_screenname, dmTitleName );
    dmConversation.attr("data-dm-screen-name", dm_screenname);

    var dmConvo = dmConversation.find(".direct-messages-thread");
    dmConvo.empty();

    requestDmConversationModal(dmConvo,dm_screenname);
}

function requestDmConversationModal(dmConvo,dm_screenname) {
    if( dmConvo.parents(".modal-blackout").css("display") == 'none' )
        return;

    requestDmConversation(dmConvo,dm_screenname);
    setTimeout( function() {requestDmConversationModal(dmConvo,dm_screenname);}, 1000);
}

function requestDmConversation(dmConvo,dm_screenname) {
    var since_id = undefined;

    var oldItems = dmConvo.children();
    if( oldItems.length ) {
        since_id = parseInt(oldItems.eq(oldItems.length-1).attr("data-id"));
    }

    var userDmReq = [{username:dm_screenname}];
    if( since_id != undefined ) userDmReq[0].since_id = since_id;
    var count = 100;
    twisterRpc("getdirectmsgs", [defaultScreenName,count,userDmReq],
               function(args, ret) { processDmConversation(args.dmConvo, args.dmUser, ret); }, 
                                   {dmConvo:dmConvo,dmUser:dm_screenname},
               function(arg, ret) { var msg = ("message" in ret) ? ret.message : ret;
                                    alert(polyglot.t("ajax_error", { error: msg })); }, null);
}

function processDmConversation(dmConvo, dm_screenname, dmData) {
    var lastId = undefined;
    if(dm_screenname in dmData) {
        var dmList = dmData[dm_screenname];
        if( dmList.length ) {
            for( var i = 0; i < dmList.length; i++) {;
                var dmItem = dmDataToConversationItem(dmList[i],defaultScreenName,dm_screenname);
                dmItem.attr("data-id",dmList[i].id);
                dmConvo.append(dmItem);
                lastId = dmList[i].id;
            }
            $.MAL.dmChatListLoaded(dmConvo);
        }
    }
    if( lastId != undefined ) {
        resetNewDMsCountForUser(dm_screenname, lastId);
    }
}

function directMsgSubmit(e)
{
    e.stopPropagation();
    e.preventDefault();
    var $this = $( this );
    var $replyText = $this.closest(".post-area-new").find("textarea");

    var $dmConversation = $(".directMessages");

    newDirectMsg($replyText.val(), $dmConversation.attr("data-dm-screen-name"));

    $replyText.val("");
}

function newDirectMsg(msg,  dm_screenname) {
    if( lastPostId != undefined ) {
        var params = [defaultScreenName, lastPostId + 1, dm_screenname, msg]
        twisterRpc("newdirectmsg", params,
                   function(arg, ret) { incLastPostId(); }, null,
                   function(arg, ret) { var msg = ("message" in ret) ? ret.message : ret;
                                        alert("Ajax error: " + msg); }, null);
    } else {
        alert(polyglot.t("Internal error: lastPostId unknown (following yourself may fix!)"));
    }
}

//dispara o modal de direct messages
function directMessagesPopup()
{
    if(!defaultScreenName)
    {
      alert(polyglot.t("You have to log in to use direct messages."));
      return;
    }
    var directMessagesClass = "directMessages";
    openModal( directMessagesClass );

    var directMessagesContent = $( ".direct-messages-template" ).html();
    $( directMessagesContent ).clone().appendTo( ".directMessages .modal-content" );

    //título do modal
    $( ".directMessages h3" ).text( polyglot.t("Direct Messages") );

    requestDMsnippetList($(".directMessages").find(".direct-messages-list"));
    $('.modal-back').css('display','inline');
    $('.mark-all-as-read').css('display', 'inline');
    $('.mark-all-as-read').attr('title', polyglot.t("Mark all as read"));

    $('.mark-all-as-read').on('click', function() {
        for (var k in _newDMsPerUser) {
            _newDMsPerUser[k] = 0;
        }
        saveDMsToStorage();
        $.MAL.updateNewDMsUI(getNewDMsCount());
    });
}


//exibe a thread de mensagens individual
function hideDmSnippetShowDmThread()
{
    var $this = $( this );

    //escondo a listagem de mensagens diretas...
    var containerToAnimate = $this.parents( ".direct-messages-list" );
    containerToAnimate.hide();

    var dm_screenname = $this.attr("data-dm-screen-name");
    openDmWithUserModal(dm_screenname);
}


function directMessagesWithUserPopup()
{
    if(!defaultScreenName)
    {
      alert(polyglot.t("You have to log in to use direct messages."));
      return;
    }
    var $userInfo = $(this).closest("[data-screen-name]");
    var dm_screenname = $userInfo.attr("data-screen-name");
    openDmWithUserModal( dm_screenname );
}

function openDmWithUserModal(dm_screenname)
{
    var directMessagesClass = "directMessages";
    openModal( directMessagesClass );

    //para poder exibir a thread selecionada...
    var retweetContent = $( ".messages-thread-template" ).html();
    $( retweetContent ).clone().appendTo( ".directMessages .modal-content" ).hide().fadeIn( "fast" );

    var dmTitle = $( ".directMessages h3" );
    dmTitle.html("Direct messages with <span></span>");
    dmTitle = dmTitle.find("span");
    var dmConversation = $(".directMessages");
    openDmConversation(dm_screenname, dmTitle, dmConversation);

    var $dmForm = $( ".dm-form-template" ).children().clone(true);
    $dmForm.addClass("open");
    $dmForm.appendTo( ".directMessages .modal-wrapper" ).hide().fadeIn( "fast" );
}


function initInterfaceDirectMsg() {
    $( ".direct-messages" ).bind( "click", directMessagesPopup );
    $( "#dm-snippet-template" ).bind( "click", hideDmSnippetShowDmThread );
    $( ".dm-submit").click( directMsgSubmit );
    $( ".userMenu-messages a" ).bind( "click", directMessagesPopup );
    $( ".direct-messages-with-user" ).bind( "click", directMessagesWithUserPopup );
}

