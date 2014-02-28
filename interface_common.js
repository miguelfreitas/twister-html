// interface_common.js
// 2013 Lucas Leal, Miguel Freitas
//
// Common interface functions to all pages, modal manipulation, button manipulation etc
// Profile, mentions and hashtag modal
// Post actions: submit, count characters

//dispara o modal genérico
//o modalClass me permite fazer tratamentos específicos de CSS para cada modal
function openModal( modalClass )
{
    var $oldModal = $("body").children(".modal-blackout");
    var $template = $( "#templates" );
    var $templateModal = $template.find( ".modal-blackout" ).clone(true);

    $templateModal.addClass( modalClass );
    if( $oldModal.length ) {
        $templateModal.show();
        $oldModal.replaceWith($templateModal);
    } else {
        $templateModal.prependTo( "body" ).fadeIn( "fast" );
    }

    //escondo o overflow da tela
    var $body = $( "body" );
    $body.css({
        "overflow": "hidden",
    })
}

//fecha o modal removendo o conteúdo por detach
function closeModal($this)
{
    var $body = $( "body" );
    var $modalWindows = $( "body" ).children( ".modal-blackout" );

    $modalWindows.fadeOut( "fast", function()
    {
        $modalWindows.detach();
    });
    $body.css({
        "overflow": "auto",
        "margin-right": "0"
    });
}

function checkNetworkStatusAndAskRedirect(cbFunc, cbArg) {
    networkUpdate(function(args) {
                      if( !twisterdConnectedAndUptodate ) {
                          var redirect =
                              window.confirm(polyglot.t("switch_to_network"));
                          if( redirect )
                              $.MAL.goNetwork();
                      } else {
                        if( args.cbFunc )
                            args.cbFunc(args.cbArg);
                      }
                  }, {cbFunc:cbFunc,cbArg:cbArg});
}

function timeGmtToText(t) {
    var d = new Date(0);
    d.setUTCSeconds(t);
    return d.toString().replace(/GMT.*/g,"");
}

function timeSincePost(t) {
    var d = new Date(0);
    d.setUTCSeconds(t);
    var now = new Date();
    var t_delta = Math.ceil((now - d) / 1000);
    var expression = "";
    if(t_delta < 60) {
        expression = polyglot.t("seconds", t_delta);
    }
    else if(t_delta < 60 * 60) {
        expression = polyglot.t("minutes", Math.floor(t_delta/60));
    }
    else if(t_delta < 24 * 60 * 60) {
        expression = polyglot.t("hours", Math.floor(t_delta/60/60));
    }
    else {
        expression = polyglot.t("days", Math.floor(t_delta/24/60/60));
    }
    return polyglot.t("time_ago", { time: expression });
}

//
// Profile, mentions, hashtag, and following modal
// -----------------------------------

function newProfileModal(username) {
    var profileModalContent = $( "#profile-modal-template" ).children().clone(true);

    updateProfileData(profileModalContent, username);

    return profileModalContent;
}

function openProfileModal(e)
{
    e.stopPropagation();
    e.preventDefault();

    var $this = $( this );
    var username = $.MAL.urlToUser( $this.attr("href") );

    var profileModalClass = "profile-modal";
    openModal( profileModalClass );

    var profileModalContent = newProfileModal( username );
    profileModalContent.appendTo("." +profileModalClass + " .modal-content");

    //título do modal
    $( "."+profileModalClass + " h3" ).text( polyglot.t("users_profile", { username: username }) );
}

function newHashtagModal(hashtag) {
    var hashtagModalContent = $( "#hashtag-modal-template" ).children().clone(true);
    hashtagModalContent.find( ".postboard-news").click(function (){
        $(this).hide();
        displayHashtagPending($(".hashtag-modal .postboard-posts"));
    });

    clearHashtagProcessed();
    updateHashtagModal( hashtagModalContent.find(".postboard-posts"), hashtag );

    return hashtagModalContent;
}

function openHashtagModal(e)
{
    e.stopPropagation();
    e.preventDefault();

    var $this = $( this );
    var hashtag = $this.text().substring(1);

    var hashtagModalClass = "hashtag-modal";
    openModal( hashtagModalClass );
    $( "."+hashtagModalClass ).attr("data-resource","hashtag");

    var hashtagModalContent = newHashtagModal( hashtag );
    hashtagModalContent.appendTo("." +hashtagModalClass + " .modal-content");

    //título do modal
    $( "."+hashtagModalClass + " h3" ).text( "#" + hashtag );
}

function updateHashtagModal(postboard,hashtag) {
    var $hashtagModalClass = $(".hashtag-modal");
    if( !$hashtagModalClass.length || $hashtagModalClass.css("display") == 'none' )
        return;

    var resource = $hashtagModalClass.attr("data-resource");

    requestHashtag(postboard,hashtag,resource);
    setTimeout( function() {updateHashtagModal(postboard,hashtag);}, 5000);
}

function openMentionsModal(e)
{
    e.stopPropagation();
    e.preventDefault();

    // reuse the same hashtag modal to show mentions
    var hashtagModalClass = "hashtag-modal";
    openModal( hashtagModalClass );
    $( "."+hashtagModalClass ).attr("data-resource","mention");

    var username;
    var $userInfo = $(this).closest("[data-screen-name]");
    if( $userInfo.length )
        username = $userInfo.attr("data-screen-name");
    else
        username = defaultScreenName;

    var hashtagModalContent = newHashtagModal( username );
    hashtagModalContent.appendTo("." +hashtagModalClass + " .modal-content");

    //título do modal
    $( "."+hashtagModalClass + " h3" ).text( polyglot.t("users_mentions", { username: username }) );

    // obtain already cached mention posts from twister_newmsgs.js
    processHashtag(hashtagModalContent.find(".postboard-posts"), defaultScreenName, getMentionsData() );
    resetMentionsCount();
}

function newFollowingModal(username) {
    var followingModalContent = $( "#following-modal-template" ).children().clone(true);

    updateFollowingData(followingModalContent, username);

    return followingModalContent;
}

function openFollowingModal(e)
{
    e.stopPropagation();
    e.preventDefault();

    var $this = $( this );
    var username = $.MAL.followingUrlToUser( $this.attr("href") );

    var followingModalClass = "following-modal";
    openModal( followingModalClass );

    var followingModalContent = newFollowingModal( username );
    followingModalContent.appendTo("." +followingModalClass + " .modal-content");

    //título do modal
    $( "."+followingModalClass + " h3" ).text( polyglot.t("followed_by", { username: username }) );
}

//
// Post actions, submit, count characters
// --------------------------------------
//dispara o modal de retweet
var reTwistPopup = function( e )
{
    var reTwistClass = "reTwist";
    openModal( reTwistClass );

    //título do modal
    $( ".reTwist h3" ).text( polyglot.t("retransmit_this") );

    var postdata = $(this).parents(".post-data").attr("data-userpost");
    var postElem = postToElem($.evalJSON(postdata),"");
    postElem.appendTo( ".reTwist .modal-content" );

    e.stopPropagation();
}

//Expande Área do Novo post
var replyInitPopup = function(e, post)
{
    var replyClass = "reply";
    openModal( replyClass );

    //título do modal
    var fullname = post.find(".post-info-name").text();
    $( ".reply h3" ).text( polyglot.t("reply_to", { fullname: fullname }) );

    //para poder exibir a thread selecionada...
    var replyModalContent = $(".reply .modal-content").hide();
    var retweetContent = $( "#reply-modal-template" ).children().clone(true);
    retweetContent.appendTo(replyModalContent);

    var postdata = post.find(".post-data").attr("data-userpost");
    var postElem = postToElem($.evalJSON(postdata),"");
    postElem.appendTo(replyModalContent);

    var replyArea = $(".reply .post-area .post-area-new");
    replyArea.addClass("open");
    var replyText = replyArea.find("textarea");
    var postInlineReplyText = $(".reply .post .post-area-new textarea");

    var attrToCopy = ["placeholder", "data-reply-to"];
    $.each(attrToCopy, function( i, attribute ) {
        replyText.attr( attribute, postInlineReplyText.attr(attribute) );
    });
    composeNewPost(e, replyArea);

    replyModalContent.fadeIn( "fast" );
}

//abre o menu dropdown de configurações
var dropDownMenu = function( e )
{
    var $configMenu = $( ".config-menu" );
    $configMenu.slideToggle( "fast" );
    e.stopPropagation();
}

//fecha o config menu ao clicar em qualquer lugar da tela
var closeThis = function()
{
    $( this ).slideUp( "fast" );
};

var postExpandFunction = function( e, postLi )
{
    if( !postLi.hasClass( "original" ) ) {
        return;
    }

    var originalPost = postLi.find(".post-data.original");
    var $postInteractionText = originalPost.find( ".post-expand" );
    var $postExpandedContent = originalPost.find( ".expanded-content" );
    var $postsRelated = postLi.find(".related");

    var openClass = "open";
    if( !postLi.hasClass( openClass ) ) {
        originalPost.detach();
        postLi.empty();
        postLi.addClass( openClass );
        $postInteractionText.text( polyglot.t("Collapse") );

        var itemOl = $("<ol/>", {class:"expanded-post"}).appendTo(postLi);
        var originalLi = $("<li/>", {class: "module post original"}).appendTo(itemOl);
        originalLi.append(originalPost);

        $postExpandedContent.slideDown( "fast" );

        // insert "reply_to" before
        requestRepliedBefore(originalLi);
        // insert replies to this post after
        requestRepliesAfter(originalLi);
        // RTs faces and counter
        requestRTs(originalLi);
    }
    else
    {
        postLi.removeClass( openClass );
        $postInteractionText.text( polyglot.t("Expand") );

        if( $postsRelated ) $postsRelated.slideUp( "fast" );
        $postExpandedContent.slideUp( "fast", function()
        {
            originalPost.detach();
            postLi.empty();
            postLi.append(originalPost);
        });
    }

    e.stopPropagation();
}

var postReplyClick = function( e )
{
    var post = $(this).closest(".post");
    if( !post.hasClass( "original" ) ) {
        replyInitPopup(e, post);
    } else {
        var postLiOpen = post.parents(".post.open");
        if( !postLiOpen.length ) {
            postExpandFunction(e, post);
        }
        var postAreaNew = post.find(".post-area-new")
        composeNewPost(e, postAreaNew);
    }
    e.stopPropagation();
}

//Expande Área do Novo post
var composeNewPost = function( e, postAreaNew )
{
    e.stopPropagation();
    if( !postAreaNew.hasClass("open") ) {
        postAreaNew.addClass( "open" );
        //se o usuário clicar fora é pra fechar
        postAreaNew.clickoutside( unfocusThis )
    }

    var textArea = postAreaNew.find("textarea");
    textArea.focus();
    if( textArea.attr("data-reply-to") && !textArea.val().length ) {
        textArea.val(textArea.attr("data-reply-to"));
    }
}

//Reduz Área do Novo post
var unfocusThis = function()
{
    var $this = $( this );
    $this.removeClass( "open" );
}

function replyTextKeypress(e) {
    e = e || event;
    var $this = $( this );
    var tweetForm = $this.parents("form");
    if( tweetForm != undefined ) {
        var c = 140 - $this.val().length;
        var remainingCount = tweetForm.find(".post-area-remaining");
        remainingCount.text(c);
        if( c < 0 ) remainingCount.addClass("warn");
        else        remainingCount.removeClass("warn");

        var tweetAction = tweetForm.find(".post-submit");
        if( !tweetAction.length ) tweetAction = tweetForm.find(".dm-submit");
        if( c >= 0 && c < 140 &&
            $this.val() != $this.attr("data-reply-to") ) {
            $.MAL.enableButton(tweetAction);
        } else {
            $.MAL.disableButton(tweetAction);
        }

        if (false/*ywr e.keyCode === 13*/) {
            if (!e.ctrlKey) {
                $this.val($this.val().trim());
                if( !tweetAction.hasClass("disabled") ) {
                    tweetAction.click();
                }
            } else {
                $this.val($this.val() + "\r");
            }
        }
    }
}

var postSubmit = function(e)
{
    e.stopPropagation();
    e.preventDefault();
    var $this = $( this );
    var $replyText = $this.closest(".post-area-new").find("textarea");

    var $postOrig = $this.closest(".post-data");

    if (!$postOrig.length) {
        $postOrig = $this.closest(".modal-content").find(".post-data");
    }

    newPostMsg($replyText.val(), $postOrig);

    $replyText.val("");
    $replyText.attr("placeholder", polyglot.t("Your message was sent!"));
    var tweetForm = $this.parents("form");
    var remainingCount = tweetForm.find(".post-area-remaining");
    remainingCount.text(140);
    $replyText.attr("placeholder", "Your message was sent!");
    closeModal($this);
}


var retweetSubmit = function(e)
{
    e.stopPropagation();
    e.preventDefault();
    var $this = $( this );

    var $postOrig = $this.closest(".modal-wrapper").find(".post-data");

    newRtMsg($postOrig);

    closeModal($this);
}



function initInterfaceCommon() {
    $( "body" ).on( "click", ".cancel" , function() { closeModal($(this)); } );
    $( ".post-reply" ).bind( "click", postReplyClick );
    $( ".post-propagate" ).bind( "click", reTwistPopup );
    $( ".userMenu-config-dropdown" ).bind( "click", dropDownMenu );
    $( ".config-menu" ).clickoutside( closeThis );
    $( ".module.post" ).bind( "click", function(e) {
        postExpandFunction(e,$(this)); });
    $( ".post-area-new" ).bind( "click", function(e) {
        composeNewPost(e,$(this));} );
    $( ".post-area-new" ).clickoutside( unfocusThis );
    $( ".post-submit").click( postSubmit );
    $( ".modal-propagate").click( retweetSubmit );

    var $replyText = $( ".post-area-new textarea" );
    $replyText.keyup( replyTextKeypress );

    $( ".open-profile-modal").bind( "click", openProfileModal );
    $( ".open-hashtag-modal").bind( "click", openHashtagModal );
    $( ".open-following-modal").bind( "click", openFollowingModal );
    $( ".userMenu-connections a").bind( "click", openMentionsModal );
}
