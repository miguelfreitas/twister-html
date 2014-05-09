// tmobile.js
// 2013 Miguel Freitas
//
// mobile interface for twister using jquery mobile + router

var twisterInitialized = false;
var handlersInstalled = false;
function initializeTwister( redirectNetwork, redirectLogin, cbFunc, cbArg ) {
    if( !handlersInstalled ) {
        interfaceNetworkHandlers();
        interfaceCommonLoginHandlers();
        installUserSearchHandler();
        installProfileEditHandlers();
        // install scrollbottom handler to load more posts as needed
        $(window).scroll(function(){
            if  ($(window).scrollTop() >= $(document).height() - $(window).height() - 20){
              reachedScrollBottom();
            }
        });
        // home screen timeline refresh button
        $( ".timeline-refresh").click(function(e) {
            $.MAL.setPostTemplate( $("#post-template-home") );
            requestTimelineUpdate("latest",postsPerRefresh,followingUsers);
            $.mobile.silentScroll(0);
        });
        // reply text counter both newmsg and dmchat
        var $replyText = $( ".post-area-new textarea" );
        $replyText.unbind('keyup').keyup( replyTextKeypress );
        
        setInterval("tmobileTick()", 2000);
        handlersInstalled = true;
    }

    if( twisterInitialized ) {
        if( cbFunc )
            cbFunc(cbArg);
    } else {
        networkUpdate( function() {
            if( redirectNetwork && !twisterdConnectedAndUptodate ) {
                $.MAL.goNetwork();
                return;
            }

            initUser(function() {
                if( redirectLogin && !defaultScreenName ) {
                    $.MAL.goLogin();
                    return;
                }

                if( defaultScreenName ) {
                    loadFollowing( function(args) {
                        requestLastHave();
                        initMentionsCount();
                        initDMsCount();
                        twisterFollowingO = TwisterFollowing(defaultScreenName);
                    
                        twisterInitialized = true;
                        if( cbFunc )
                            cbFunc(cbArg);
                    });
                } else {
                    if( cbFunc )
                        cbFunc(cbArg);
                }
            });
        });
    }
}

var router=new $.mobile.Router(
    [
        { "#index" : {handler: "index", events: "bc"} },
        { "#home": {handler: "home", events: "bs" } },
        { "#profile": {handler: "profile", events: "bs" } },
        { "#profile-edit": {handler: "profileedit", events: "bs" } },
        { "#following": {handler: "following", events: "bs" } },
        { "#post": {handler: "post", events: "bs" } },
        { "#newmsg": {handler: "newmsg", events: "bs" } },
        { "#rt": {handler: "rt", events: "bs" } },
        { "#mentions": {handler: "mentions", events: "bs" } },
        { "#hashtag": {handler: "hashtag", events: "bs" } },
        { "#login": {handler: "login", events: "bs" } },
        { "#network": {handler: "network", events: "bs" } },
        { "#directmsg": {handler: "directmsg", events: "bs" } },
        { "#dmchat": {handler: "dmchat", events: "bs" } },
        { "#search": {handler: "search", events: "bs" } },
        { "#new-user-modal": {handler: "newusermodal", events: "bs" } },
    ],{
        index: function(type,match,ui) {
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, true, function() {
                //$.MAL.goHome();
            });
        },
        home: function(type,match,ui) {
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, true, function() {
                if( !$("#home .posts").children().length ) {
                    $.mobile.showPageLoadingMsg();
                    getFullname( defaultScreenName, $("#home .rtitle"));
                    $.MAL.setPostTemplate( $("#post-template-home") );
                    requestTimelineUpdate("latestFirstTime",postsPerRefresh,followingUsers);
                }
            });
        },
        profile: function(type,match,ui) {
            var params=router.getParams(match[1]);
            clearProfilePage();
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, true, function() {
                var user;
                if( params && params.hasOwnProperty("user") ) {
                    user = params.user;
                } else {
                    user = defaultScreenName;
                }
                var $newmsgLink = $("a.profile-newmsg");
                if( user != defaultScreenName ) {
                    $newmsgLink.attr("href",$.MAL.newPostToUrl(user)).show();
                } else {
                    $newmsgLink.hide();
                }

                $.mobile.showPageLoadingMsg();
                $.MAL.setPostTemplate( $("#post-template-home") );
                updateProfileData( $("#profile"), user);
            });
        },
        profileedit: function(type,match,ui) {
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, true, function() {
                loadAvatarForEdit();
                loadProfileForEdit();
                dumpPrivkey(defaultScreenName, function(args, key) {
                    $(".secret-key").text(key);
                }, {});
            });
        },
        following: function(type,match,ui) {
            var params=router.getParams(match[1]);
            clearProfilePage();
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, true, function() {
                var user;
                if( params && params.hasOwnProperty("user") ) {
                    user = params.user;
                } else {
                    user = defaultScreenName;
                }
                if( params && params.hasOwnProperty("follow") ) {
                    follow(params.follow);
                }
                if( params && params.hasOwnProperty("unfollow") ) {
                    unfollow(params.unfollow);
                }
                $.mobile.showPageLoadingMsg();
                $("#following a.ui-btn").removeClass("ui-btn-active");
                showFollowingUsers();
            });
        },
        post: function(type,match,ui) {
            var params=router.getParams(match[1]);
            initializeTwister( true, true, function() {
                var $ulPost = $("#post ul.posts");
                $ulPost.text("");
                $.MAL.setPostTemplate( $("#post-template-post") );
                var originalLi = postToElem($.evalJSON(params.userpost), "original");
                $ulPost.append(originalLi);
                $ulPost.find(".post-interactions").trigger('create');
                $ulPost.listview('refresh');
                installReplyClick();
                installRetransmitClick();

                // insert replies to this post after
                requestRepliesAfter(originalLi);
                // RTs faces and counter
                requestRTs(originalLi);
            });
        },
        newmsg: function(type,match,ui) {
            var params=router.getParams(match[1]);
            initializeTwister( true, true, function() {
                var $replyTextarea = $("#newmsg .post-area-new textarea");
                $replyTextarea.attr("placeholder", polyglot.t("New Post..."));
                if( params && params.hasOwnProperty("replyto") ) {
                    $replyTextarea.val(params.replyto);
                } else {
                    $replyTextarea.val("");
                }
                $.MAL.disableButton($("#newmsg .post-submit"));

                var $replyOriginal = $(".reply-original-post")
                $replyOriginal.html("");
                if( params && params.hasOwnProperty("userpost") ) {
                    $.MAL.setPostTemplate( $("#post-template-home") );
                    var originalLi = postToElem($.evalJSON(params.userpost), "original");
                    $replyOriginal.append(originalLi);
                    $replyOriginal.listview('refresh');
                }

                installSubmitClick();
            });
        },
        rt: function(type,match,ui) {
            var params=router.getParams(match[1]);
            initializeTwister( true, true, function() {
                var $rtOriginal = $(".rt-original-post")
                $rtOriginal.html("");
                $.MAL.setPostTemplate( $("#post-template-home") );
                var originalLi = postToElem($.evalJSON(params.userpost), "original");
                $rtOriginal.append(originalLi);
                $rtOriginal.listview('refresh');

                installRetransmitConfirmClick();
            });
        },
        mentions: function(type,match,ui) {
            var params=router.getParams(match[1]);
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, true, function() {
                var user;
                var $newmsgLink = $("a.mention-newmsg");
                if( params && params.hasOwnProperty("user") ) {
                    user = params.user;
                    $newmsgLink.attr("href",$.MAL.newPostToUrl(user));
                } else {
                    user = defaultScreenName;
                    $newmsgLink.attr("href","#newmsg");
                    resetMentionsCount();
                }
                $("#mentions .rtitle").text(polyglot.t("mentions_at", { user: user }));
                var $ulMentions = $("#mentions ul.posts");
                setupHashtagOrMention( $ulMentions, user, "mention");
            });
        },
        hashtag: function(type,match,ui) {
            var params=router.getParams(match[1]);
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, true, function() {
                $("#hashtag .rtitle").text("#" + params.hashtag);
                $("a.hashtag-newmsg").attr("href",$.MAL.newPostHashtagToUrl(params.hashtag));
                var $ulHashtag = $("#hashtag ul.posts");
                setupHashtagOrMention($ulHashtag,params.hashtag,"hashtag");
            });
        },
        login: function(type,match,ui) {
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, false, function() {
                $.mobile.hidePageLoadingMsg();
                $("select.local-usernames.login-user").selectmenu("refresh", true);
                installCreateUserClick();
            });
        },
        network: function(type,match,ui) {
            $.mobile.showPageLoadingMsg();
            initializeTwister( false, false, function() {
                $.mobile.hidePageLoadingMsg();
                $("select.local-usernames.spam-user").selectmenu("refresh", true);
                getSpamMsg();
                getGenerate();
            });
        },
        directmsg: function(type,match,ui) {
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, true, function() {
                var $dmThreadList = $("#directmsg ul.direct-messages-thread");
                $.mobile.showPageLoadingMsg();
                requestDMsnippetList($dmThreadList);
            });
        },
        dmchat: function(type,match,ui) {
            var params=router.getParams(match[1]);
            $.mobile.showPageLoadingMsg();
            initializeTwister( true, true, function() {
                var user = params.user;
                var dmConvo = $("#dmchat ul.direct-messages-list");
                $("#dmchat .rtitle").text("Chat @" + user);
                $("#dmchat textarea").val("");
                dmConvo.html("");
                installDMSendClick();
                
                $.mobile.showPageLoadingMsg();
                dmChatUser = user;
                requestDmConversation(dmConvo,user);
            });
        },
        search: function(type,match,ui) {
            initializeTwister( true, true, function() {
                /**/
            });
        },
        newusermodal: function(type,match,ui) {
            initializeTwister( false, false, function() {
                /* dumpPrivkey(defaultScreenName, function(args, key) {
                    $(".secret-key").text(key);
                }, {}); */
            });
        },
    }, {
        defaultHandler: function(type, ui, page) {
            console.log("Default handler called due to unknown route (" 
                        + type + ", " + ui + ", " + page + ")" );
            console.log(ui);
            console.log(page);
        },
        defaultHandlerEvents: "s",
        defaultArgsRe: true
    }
);

function installPostboardClick() {
    var $postDatas = $(".post-data");
    $postDatas.unbind('click').click(function(e){
        e.stopPropagation();
        e.preventDefault();
        var userpost = $(this).attr("data-userpost");
        var url = "#post?userpost=" + encodeURIComponent(userpost);
        $.mobile.showPageLoadingMsg();
        $.mobile.navigate( url );
    });
    
    $(".post a").unbind('click').click(function(e) {
        e.stopPropagation();
        
        // stopPropagation is supposed to be enough, but in Android the 
        // default action is not called so we reimplement it here as a hack.
        e.preventDefault();
        $.mobile.showPageLoadingMsg();
        $.mobile.navigate( $(this).attr("href") );
    });
}

function installReplyClick() {
    var $postReply = $("#post .post-reply");
    $postReply.unbind('click').click(function(e){
        e.stopPropagation();
        e.preventDefault();

        var $postData = $(this).closest(".post-data");
        var userpost = $postData.attr("data-userpost");
        var replyTo = $postData.attr("data-reply-to");
        var url = "#newmsg?replyto=" + encodeURIComponent(replyTo) +
                  "&userpost=" + encodeURIComponent(userpost);
        $.mobile.showPageLoadingMsg();
        $.mobile.navigate( url );
    });
}

function installRetransmitClick() {
    var $postRt = $("#post .post-propagate");
    $postRt.unbind('click').click(function(e){
        e.stopPropagation();
        e.preventDefault();

        var $postData = $(this).closest(".post-data");
        var userpost = $postData.attr("data-userpost");
        var url = "#rt?userpost=" + encodeURIComponent(userpost);
        $.mobile.showPageLoadingMsg();
        $.mobile.navigate( url );
    });
}


function installSubmitClick() {
    var $postSubmit = $(".post-submit");
    $postSubmit.unbind('click').click(function(e){
        e.stopPropagation();
        e.preventDefault();

        var $this = $( this );
        var $replyText = $this.closest(".post-area-new").find("textarea");

        var $postOrig = $("#newmsg .reply-original-post .post-data");

        var s = encode_utf8($replyText.val());
        newPostMsg(s, $postOrig);

        $replyText.val("");
        $replyText.attr("placeholder", polyglot.t("Your message was sent!"));

        setTimeout( function() {$.MAL.goHome();}, 1000);
    });
}

function installDMSendClick() {
    var $postSubmit = $(".dm-submit");
    $postSubmit.unbind('click').click(function(e){
        e.stopPropagation();
        e.preventDefault();
        var $this = $( this );
        var $replyText = $this.closest(".post-area-new").find("textarea");

        var $dmConversation = $(".directMessages");

        var s = encode_utf8($replyText.val());
        newDirectMsg(s, dmChatUser);
        $replyText.val("");
    });
}


function installRetransmitConfirmClick() {
    var $postConfirmRt = $(".retransmit-confirm");
    $postConfirmRt.unbind('click').click(function(e){
        e.stopPropagation();
        e.preventDefault();

        var $postOrig = $("#rt .rt-original-post .post-data");

        $.mobile.showPageLoadingMsg();
        newRtMsg($postOrig);
        $.MAL.goHome();
    });
}

function installCreateUserClick() {
    $( ".create-user").unbind('click').click( function(e) {
        createUserClick( function(username, secretKey) { 
            defaultScreenName = username;
            if(defaultScreenName) {
                saveScreenName();
            }
            $(".secret-key").text(secretKey);
            sendNewUserTransaction( username, function() {} );
            $.mobile.navigate( "#new-user-modal" ); } );
    });
}

function installUserSearchHandler() {
    var $userSearchField = $( ".userMenu-search-field" );
    $userSearchField.unbind('keyup').keyup( userSearchKeypress );
    $userSearchField.unbind('click').bind( "click", userSearchKeypress );
}

function installProfileEditHandlers() {
    $(".profile-card-photo.forEdition").click( function() { $('#avatar-file').click(); } );
    $("#avatar-file").bind( "change", handleAvatarFileSelectMobile);
    $(".submit-changes").click( function() { 
        saveProfile();
        setTimeout( function() {$.MAL.goHome();}, 1000);
    } );
    $(".cancel-changes").click( $.mobile.back );
}

function handleAvatarFileSelectMobile(evt) {
    var files = evt.target.files; // FileList object
    var f = files[0];

     // Only process image files.
     if (f.type === undefined || f.type.match('image.*')) {
        var reader;
        try {
            reader = new FileReader();
        } catch(e) {
            alert(polyglot.t('File APIs not supported in this browser.'));
            return;
        }

        reader.onload=function(e){
           var img=new Image();
           img.onload=function(){
               var MAXWidthHeight=64;
               var r=MAXWidthHeight/Math.max(this.width,this.height),
               w=Math.round(this.width*r),
               h=Math.round(this.height*r),
               c=document.createElement("canvas");
               c.width=w;c.height=h;
               c.getContext("2d").drawImage(this,0,0,w,h);

               var imgURL = undefined;
               var encoder = new JPEGEncoder();
               for(var q = 90; (!imgURL || imgURL.length > 4096) && q > 10; q -= 1) {
                   imgURL = encoder.encode(c.getContext("2d").getImageData(0,0,w,h), q);
                   console.log( "q: " + q + " url size: " + imgURL.length );
               }
               $(".profile-card-photo.forEdition").attr("src", imgURL );
           }
           img.src=e.target.result;
        }

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}



function clearProfilePage() {
    $("#profile .profile-card-photo").attr("src","img/grayed_avatar_placeholder_24.png");
    $("#profile .profile-name").text("");
    $("#profile .profile-location").text("");
    $("#profile .profile-url").text("");
    $("#profile .profile-url").attr("href","");
    $("#profile .profile-location").text("");
    $("#profile .posts").text("");
}

// handler of scroll bottom to request older posts
function reachedScrollBottom() {
    var curPage = $.mobile.activePage.attr("id");
    if( curPage == "home" ) {
        if( timelineLoaded ) {
            $.MAL.setPostTemplate( $("#post-template-home") );
            requestTimelineUpdate("older", postsPerRefresh, followingUsers);
        }
    }
}

function encode_utf8(s) {
    // only needed in android 2.3 - why?
    var ua = navigator.userAgent;
    if( ua.indexOf("Android") >= 0 )
    {
        var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8)); 
        if (androidversion < 3.0)
        {
            return unescape(encodeURIComponent(s));
        }
    }
    return s;
}

var hashtag_elem;
var hashtag_tag;
var hashtag_res;
function setupHashtagOrMention( ulElem, tag, res) {
    hashtag_elem = ulElem;
    hashtag_tag = tag;
    hashtag_res = res;
    hashtag_elem.text("");
    $.MAL.setPostTemplate( $("#post-template-home") );
    $.mobile.showPageLoadingMsg();
    clearHashtagProcessed();
    if( tag == defaultScreenName && res == "mention" ) {
        // obtain already cached mention posts from twister_newmsgs.js
        processHashtag(hashtag_elem, defaultScreenName, getMentionsData() );
    }
    requestHashtag(hashtag_elem,hashtag_tag,hashtag_res);
}

// every 2 seconds do something page specific.
function tmobileTick() {
    var curPage = $.mobile.activePage.attr("id");
    if( curPage == "network" ) {
        networkUpdate();
    }
    if( curPage == "home" ) {
        requestLastHave();
    }
    if( curPage == "new-user-modal" ) {
        dumpPubkey(defaultScreenName, function(args, pubkey) {
                    //pubkey = "";
                    if( pubkey.length > 0 ) {
                        follow('twister', true, function() {
                            $.MAL.goProfileEdit();
                        });
                    }
                }, {} );
    }
    if( curPage == "mentions" ||  curPage == "hashtag" ) {
        autoUpdateHashtag = true;
        requestHashtag(hashtag_elem,hashtag_tag,hashtag_res);
    }
    if( curPage == "dmchat" ) {
        requestDmConversation($("#dmchat ul.direct-messages-list"),dmChatUser);
    }
}

