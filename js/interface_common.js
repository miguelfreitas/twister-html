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
        "overflow": "hidden"
    });
}

//fecha o modal removendo o conteúdo por detach
function closeModal($this)
{
    closeModalHandler($this);
    window.location.hash = '';
}

function closeModalHandler($this)
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
// Profile, mentions, hashtag, and following modal, who to follow
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
    openProfileModalWithUsername(username);
}

function openProfileModalWithUsername(username)
{
    if(!username)
    {
        alert(polyglot.t("You don't have any profile because you are not logged in."));
        return;
    }
    window.location.hash = '#profile?user=' + username;
}

function openProfileModalWithUsernameHandler(username)
{
    var profileModalClass = "profile-modal";
    openModal( profileModalClass );

    var profileModalContent = newProfileModal( username );
    profileModalContent.appendTo("." +profileModalClass + " .modal-content");

    //título do modal
    $( "."+profileModalClass + " h3" ).text( polyglot.t("users_profile", { username: username }) );

    //hed//add dinamic follow button in profile modal window
    if(followingUsers.indexOf(username) != -1){
        $('.profile-card button.followButton').first().removeClass('follow').addClass('profileUnfollow').text(polyglot.t('Unfollow')).on('click', function(){
            unfollow(username);
        });
    };

    $(".tox-ctc").attr("title", polyglot.t("Copy to clipboard"));
    $(".bitmessage-ctc").attr("title", polyglot.t("Copy to clipboard"));
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
    var hashtag = $this.text().substring(1).toLowerCase();
    openHashtagModalFromSearch(hashtag);
}

function openHashtagModalFromSearch(hashtag)
{
    window.location.hash = '#hashtag?hashtag=' + hashtag;
}

function openHashtagModalFromSearchHandler(hashtag)
{
    var hashtagModalClass = "hashtag-modal";
    openModal( hashtagModalClass );
    $( "."+hashtagModalClass ).attr("data-resource","hashtag");

    var hashtagModalContent = newHashtagModal( hashtag );
    hashtagModalContent.appendTo("." +hashtagModalClass + " .modal-content");

    //título do modal
    $( "."+hashtagModalClass + " h3" ).text( "#" + hashtag );
}

function updateHashtagModal(postboard,hashtag,timeoutArgs) {
    var $hashtagModalClass = $(".hashtag-modal");
    if( !$hashtagModalClass.length || $hashtagModalClass.css("display") == 'none' )
        return;

    var resource = $hashtagModalClass.attr("data-resource");

    requestHashtag(postboard,hashtag,resource,timeoutArgs);
    // use extended timeout parameters on modal refresh (requires twister_core >= 0.9.14).
    // our first query above should be faster (with default timeoutArgs of twisterd),
    // then we may possibly collect more posts on our second try by waiting more.
    setTimeout( function() {updateHashtagModal(postboard,hashtag,[10000,2000,3]);}, 5000);
}

function openMentionsModal(e)
{
    e.stopPropagation();
    e.preventDefault();

    if(!defaultScreenName)
    {
	alert(polyglot.t("No one can mention you because you are not logged in."));
	return;
    }

    var username;
    var $userInfo = $(this).closest("[data-screen-name]");
    if( $userInfo.length )
        username = $userInfo.attr("data-screen-name");
    else
        username = defaultScreenName;

    window.location.hash = '#mentions?user=' + username;
}

function openMentionsModalHandler(username)
{
    // reuse the same hashtag modal to show mentions
    var hashtagModalClass = "hashtag-modal";
    openModal( hashtagModalClass );
    $( "."+hashtagModalClass ).attr("data-resource","mention");

    var hashtagModalContent = newHashtagModal( username );
    hashtagModalContent.appendTo("." +hashtagModalClass + " .modal-content");

    //título do modal
    $( "."+hashtagModalClass + " h3" ).text( polyglot.t("users_mentions", { username: username }) );

    if( username == defaultScreenName ) {
        // obtain already cached mention posts from twister_newmsgs.js
        processHashtag(hashtagModalContent.find(".postboard-posts"), defaultScreenName, getMentionsData() );
        resetMentionsCount();
    }
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

function refreshWhoToFollow(e) {
    e.stopPropagation();
    e.preventDefault();

    $('.follow-suggestions').html('');

    getRandomFollowSuggestion(processSuggestion);
    getRandomFollowSuggestion(processSuggestion);
    getRandomFollowSuggestion(processSuggestion);
}

function fillWhoToFollowModal(list, hlist, start) {
    var i;
    for (i = 0; i < followingUsers.length && list.length < start + 20; i++) {
        if (typeof(twisterFollowingO.followingsFollowings[followingUsers[i]]) !== 'undefined') {
            for (var j = 0; j < twisterFollowingO.followingsFollowings[followingUsers[i]]["following"].length && list.length < start + 25; j++) {

                var utf = twisterFollowingO.followingsFollowings[followingUsers[i]]["following"][j];
                if (followingUsers.indexOf(utf) < 0 &&
                    list.indexOf(utf) < 0) {
                    list.push(utf);

                    var item = $("#follow-suggestion-template").clone(true);
                    item.removeAttr("id");

                    item.find(".twister-user-info").attr("data-screen-name", utf);

                    item.find(".twister-user-name").attr("href", $.MAL.userUrl(utf));
                    item.find(".twister-by-user-name").attr("href", $.MAL.userUrl(followingUsers[i]));
                    item.find(".twister-user-tag").text("@" + utf);

                    getAvatar(utf, item.find(".twister-user-photo"));
                    getFullname(utf, item.find(".twister-user-full"));
                    getBio(utf, item.find(".bio"));

                    var $spanFollowedBy = item.find(".followed-by");
                    $spanFollowedBy.text(followingUsers[i]);
                    getFullname(followingUsers[i], $spanFollowedBy);

                    item.find('.twister-user-remove').remove();

                    hlist.append(item);
                }
            }
        }
    }

    if (i >= followingUsers.length - 1) {
        return false;
    }
    // returns true, if there are more...
    return true;
}

function openWhoToFollowModal(e) {
    e.stopPropagation();
    e.preventDefault();

    var whoToFollowModalClass = "who-to-follow-modal";
    openModal( whoToFollowModalClass );

    var content = $("." + whoToFollowModalClass + " .modal-content");
    var hlist = $('<ol class="follow-suggestions"></ol>');
    var tmplist = [];

    content.scroll(function(){
        if  (content.scrollTop() >= hlist.height() - content.height() - 20){
            if (!fillWhoToFollowModal(tmplist, hlist, tmplist.length))
                content.unbind("scroll");
        }
    });

    fillWhoToFollowModal(tmplist, hlist, 0);

    hlist.appendTo( "." + whoToFollowModalClass + " .modal-content" );
    $( "." + whoToFollowModalClass + " h3" ).text( polyglot.t("Who to Follow") );
}

function newConversationModal(postLi) {
    var hashtagModalContent = $( "#hashtag-modal-template" ).children().clone(true);
    hashtagModalContent.find( ".postboard-news").click(function (){
        $(this).hide();
        displayHashtagPending($(".conversation-modal .postboard-posts"));
    });

    getTopPostOfConversation(postLi, null, hashtagModalContent.find(".postboard-posts"));

    return hashtagModalContent;
}

function openConversationModal(e)
{
    e.stopPropagation();
    e.preventDefault();

    var $this = $( this );
    var postLi = $this.parents(".module.post.original.open").find('.module.post.original');

    var conversationModalClass = "conversation-modal";
    openModal( conversationModalClass );
    //$( "." + threadingModalClass ).attr("data-resource","hashtag");

    var hashtagModalContent = newConversationModal( postLi );
    hashtagModalContent.appendTo("." + conversationModalClass + " .modal-content");

    //título do modal
    $( "." + conversationModalClass + " h3" ).text( polyglot.t('conversation_title', {'username': postLi.find('.post-data').attr('data-screen-name')}) );
}


function watchHashChange(e)
{
    var hashstring = window.location.hash
    hashstring = decodeURIComponent(hashstring);

    var hashdata = hashstring.split(':');
    if (hashdata[0] != '#web+twister') {
        hashdata = hashstring.match(/(hashtag|profile|mentions)\?(?:user|hashtag)=(.+)/);
    }

    if (hashdata && hashdata[1] != undefined && hashdata[2] != undefined)
    {
        if(hashdata[1] == 'profile') {
            openProfileModalWithUsernameHandler(hashdata[2]);
        }else if (hashdata[1] == 'hashtag') {
            openHashtagModalFromSearchHandler(hashdata[2]);
        }else if (hashdata[1] == 'mentions') {
            openMentionsModalHandler(hashdata[2]);
        }
    } else {
        closeModalHandler();
    }
}


function initHashWatching()
{
    // Register custom protocol handler
    already_registered = _getResourceFromStorage("twister_protocol_registered");
    
    if (window.navigator && window.navigator.registerProtocolHandler && !already_registered){
        var local_twister_url = window.location.protocol + '//' + window.location.host + '/home.html#%s';
        window.navigator.registerProtocolHandler('web+twister', local_twister_url, 'Twister');
	_putResourceIntoStorage("twister_protocol_registered", true);
    }

    // Register hash spy and launch it once
    window.addEventListener('hashchange', watchHashChange, false);
    watchHashChange(null);
}


//
// Post actions, submit, count characters
// --------------------------------------
//dispara o modal de retweet
var reTwistPopup = function( e )
{
    if(!defaultScreenName)
    {
	e.stopPropagation();
	alert(polyglot.t("You have to log in to retransmit messages."));
	return;
    }

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

        if ($.Options.getShowPreviewOpt() == 'enable'){
            var previewContainer=$postExpandedContent.find(".preview-container")[0];
            /* was the preview added before... */
            if ($(previewContainer).children().length == 0) {
                var link = originalPost.find("a[rel='nofollow']");
                /*is there any link in the post?*/
                for (var i=0; i<link.length; i++){
                    if (/((\.jpe{0,1}g)|(\.gif)|(\.png))$/i.test(link[i].href)){
                        var url = link[i].href;
                        if ($.Options.getUseProxyOpt() !== 'disable' && $.Options.getUseProxyForImgOnlyOpt()){
                            //proxy alternatives may be added to options page...
                            if ($.Options.getUseProxyOpt() === 'ssl-proxy-my-addr') {
                                url = 'https://ssl-proxy.my-addr.org/myaddrproxy.php/' +
                                     url.substring(0, url.indexOf(':')) +
                                     url.substr(url.indexOf('/') + 1);
                            } else if ($.Options.getUseProxyOpt() ==='anonymouse') {
                                url = 'http://anonymouse.org/cgi-bin/anon-www.cgi/' + url;
                            }
                        }
                        $(previewContainer).append($("<img src='" + url + "' class='image-preview' />"));
                    }
                }
            }
        }
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

        var postData = postLi.find('.post-data.original');

        if (typeof(postData.attr('data-replied-to-id')) === 'undefined')
            $postInteractionText.text( polyglot.t("Expand") );
        else
            $postInteractionText.text( polyglot.t("Show conversation") );

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
    if(!defaultScreenName)
    {
	e.stopPropagation();
	alert(polyglot.t("You have to log in to post replies."));
	return;
    }
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
        postAreaNew.clickoutside( unfocusThis );

        if ($.Options.getSplitPostsOpt() === "enable")
            usePostSpliting = true;
        else if ($.Options.getSplitPostsOpt() === "only-new") {
            var $postOrig = postAreaNew.closest(".post-data");

            if (!$postOrig.length) {
                $postOrig = postAreaNew.closest(".modal-content").find(".post-data");
            }

            if ($postOrig.length)
                usePostSpliting = false;
            else
                usePostSpliting = true;
        } else
            usePostSpliting = false;
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

function checkPostForMentions(post, mentions, max) {
    var m = mentions.trim();
    var ml = m.split(' ').join('|');
    return new RegExp('^.{0,' + max.toString() + '}(' + ml + ')').test(post);
}

var splitedPostsCount = 1;
var usePostSpliting = false;

function replyTextKeypress(e) {
    e = e || event;
    var $this = $( this );
    var tweetForm = $this.parents("form");
    if( tweetForm != undefined ) {
        if ($.Options.getUnicodeConversionOpt() !== "disable")
            $this.val(convert2Unicodes($this.val(), $this));
        var c = 140 - $this.val().length;
        if (usePostSpliting && !$this.parents('.directMessages').length) {
            var $tas = tweetForm.find("textarea");
            splitedPostsCount = $tas.length;
            if ($this.hasClass('splited-post'))
                $this.css('height', '28px');

            var reply_to = $this.attr('data-reply-to');
            for (var i = 0; i < $tas.length; i++) {
                var pml = 140 - (i+1).toString().length - splitedPostsCount.toString().length - 4;
                //if mention exists, we shouldn't add it while posting.
                if (typeof(reply_to) !== 'undefined' &&
                    !checkPostForMentions($tas[i].value, reply_to, pml - reply_to.length)) {
                    pml -= reply_to.length;
                }

                if ($tas[i].value.length > pml) {
                    var endings = $tas[i].value.match(/ |,|;|\.|:|\/|\?|\!|\\|'|"|\n|\t/g);
                    var ci = $tas[i].value.lastIndexOf(endings[endings.length - 1]);
                    for (var j = endings.length - 2; j >= 0 && ci > pml; j--) {
                        ci = $tas[i].value.lastIndexOf(endings[j], ci - 1);
                    }
                    ci = (ci > pml ? pml : ci);
                    if (i < splitedPostsCount - 1) {
                        $tas[i + 1].value = $tas[i].value.substr(ci) + $tas[i + 1].value;
                        $tas[i].value = $tas[i].value.substr(0, ci);
                    } else {
                        var $oldta = $($tas[i]);
                        var $newta = $($oldta).clone(true);
                        var cp = $oldta.val();

                        $oldta.val(cp.substr(0, ci));
                        $oldta.on("click", function(e) {
                            e.stopPropagation();
                            this.style.height = '80px';
                        });
                        $oldta.unbind("keyup");
                        $oldta.on("blur", replyTextKeypress);
                        $oldta.addClass('splited-post');

                        tweetForm.find(".textcomplete-wrapper").append($newta);
                        $newta.val(cp.substr(ci));
                        $newta.focus();
                        if ($newta[0].setSelectionRange)
                            $newta[0].setSelectionRange($newta.val().length, $newta.val().length);
                        else if ($newta[0].createTextRange)
                            $newta[0].createTextRange().moveEnd('character', $newta.val().length);

                        $tas = tweetForm.find("textarea");
                        splitedPostsCount = $tas.length;
                    }

                } else if ($tas.length > 1 && $tas[i].value.length === 0) {
                    if (i === $tas.length - 1) {
                        $tas[i].value = $tas[i - 1].value;
                        $($tas[i - 1]).remove();
                    } else {
                        $($tas[i]).remove();
                    }
                    $tas = tweetForm.find("textarea");
                    splitedPostsCount = $tas.length;
                }
            }

            c = 140 - $tas[$tas.length - 1].value.length - (2 * splitedPostsCount.toString().length) - 4;
            if (typeof(reply_to) !== 'undefined' &&
                !checkPostForMentions($tas[$tas.length - 1].value, reply_to, 140 - c - reply_to.length))
                c -=  reply_to.length;
        }
        var remainingCount = tweetForm.find(".post-area-remaining");

        if( c < 0 )
            remainingCount.addClass("warn");
        else
            remainingCount.removeClass("warn");

        if (usePostSpliting && !$this.parents('.directMessages').length)
            remainingCount.text(splitedPostsCount.toString() + ". post: " + c.toString());
        else
            remainingCount.text(c.toString());

        var tweetAction = tweetForm.find(".post-submit");
        if( !tweetAction.length ) tweetAction = tweetForm.find(".dm-submit");
        if( c >= 0 && c < 140 &&
            $this.val() != $this.attr("data-reply-to") ) {
            $.MAL.enableButton(tweetAction);
        } else {
            $.MAL.disableButton(tweetAction);
        }

        if( $.Options.keyEnterToSend() && $('.dropdown-menu').css('display') == 'none'){
            if (e.keyCode === 13 && (!e.metaKey && !e.ctrlKey)) {
                $this.val($this.val().trim());
                if( !tweetAction.hasClass("disabled")) {
                    tweetAction.click();
                }
            }
        }else if( !$.Options.keyEnterToSend() ){
            if (e.keyCode === 13 && (e.metaKey || e.ctrlKey)) {

                $this.val($this.val().trim());
                if( !tweetAction.hasClass("disabled") ) {
                    tweetAction.click();
                }
            }
        }
    }
}

/*
 *  unicode convertion list
 *  k: original string to be replaced
 *  u: unicode
 *  n: index of char to be stored and appended to result
 */
var unicodeConversionList = {
    "punctuation": [
        {
            "k": /\.\.\./,
            "u": "\u2026",
            "n": -1
        },
        {
            "k": /\.\../,
            "u": "\u2025",
            "n": 2
        },
        {
            "k": /\?\?/,
            "u": "\u2047",
            "n": -1
        },
        {
            "k": /\?!/,
            "u": "\u2048",
            "n": -1
        },
        {
            "k": /!\?/,
            "u": "\u2049",
            "n": -1
        },
        {
            "k": /!!/,
            "u": "\u203C",
            "n": -1
        },
        {
            "k": /--/,
            "u": "\u2014",
            "n": -1
        },
        {
            "k": /~~/,
            "u": "\u2053",
            "n": -1
        }
    ],
    "emotions": [
        {
            "k": /:.{0,1}D/,
            "u": "\uD83D\uDE03",
            "n": -1
        },
        {
            "k": /(0|O):-{0,1}\)/i,
            "u": "\uD83D\uDE07",
            "n": -1
        },
        {
            "k": /:beer:/,
            "u": "\uD83C\uDF7A",
            "n": -1
        },
        {
            "k": /3:-{0,1}\)/,
            "u": "\uD83D\uDE08",
            "n": -1
        },
        {
            "k": /<3/,
            "u":"\u2764",
            "n": -1
        },
// disabled due to urls :/
//        {
//            "k": /o.O|:\/|:\\/,
//            "u": "\uD83D\uDE15",
//            "n": -1
//        },
        {
            "k": /:\'\(/,
            "u": "\uD83D\uDE22",
            "n": -1
        },
        {
            "k": /(:|=)-{0,1}\(/,
            "u": "\uD83D\uDE1E",
            "n": -1
        },
        {
            "k": /8(\)<|\|)/,
            "u": "\uD83D\uDE0E",
            "n": -1
        },
        {
            "k": /(:|=)-{0,1}(\)|\])/,
            "u": "\uD83D\uDE0A",
            "n": -1
        },
        {
            "k": /(\(|\[)-{0,1}(:|=)/,
            "u": "\uD83D\uDE0A",
            "n": -1
        },
        {
            "k": /:\*/,
            "u": "\uD83D\uDE17",
            "n": -1
        },
        {
            "k": /\^-{0,1}\^/,
            "u": "\uD83D\uDE06",
            "n": -1
        },
        {
            "k": /:p/i,
            "u": "\uD83D\uDE1B",
            "n": -1
        },
        {
            "k": /;-{0,1}\)/,
            "u": "\uD83D\uDE09",
            "n": -1
        },
        {
            "k": /\(-{0,1};/,
            "u": "\uD83D\uDE09",
            "n": -1
        },
        {
            "k": /:(O|0)/,
            "u": "\uD83D\uDE2E",
            "n": -1
        },
        {
            "k": /:@/,
            "u": "\uD83D\uDE31",
            "n": -1
        },
        {
            "k": /:\|/,
            "u": "\uD83D\uDE10",
            "n": -1
        }
    ],
    "signs": [
        {
            "k": / tel( |:|=)/i,
            "u": " \u2121",
            "n": 4
        },
        {
            "k": /^tel( |:|=)/i,
            "u": "\u2121",
            "n": 3
        },
        {
            "k": / fax( |:|=)/i,
            "u": " \u213B",
            "n": 4
        },
        {
            "k": /^fax( |:|=)/i,
            "u": "\u213B",
            "n": 3
        }
    ],
    "fractions": [
        {
            "k": /1\/2/,
            "u": "\u00BD",
            "n": -1
        },
        {
            "k": /1\/3/,
            "u": "\u2153",
            "n": -1
        },
        {
            "k": /2\/3/,
            "u": "\u2154",
            "n": -1
        },
        {
            "k": /1\/4/,
            "u": "\u00BC",
            "n": -1
        },
        {
            "k": /3\/4/,
            "u": "\u00BE",
            "n": -1
        },
        {
            "k": /1\/5/,
            "u": "\u2155",
            "n": -1
        },
        {
            "k": /2\/5/,
            "u": "\u2156",
            "n": -1
        },
        {
            "k": /3\/5/,
            "u": "\u2157",
            "n": -1
        },
        {
            "k": /4\/5/,
            "u": "\u2158",
            "n": -1
        },
        {
            "k": /1\/6/,
            "u": "\u2159",
            "n": -1
        },
        {
            "k": /5\/6/,
            "u": "\u215A",
            "n": -1
        },
        {
            "k": /1\/7/,
            "u": "\u2150",
            "n": -1
        },
        {
            "k": /1\/8/,
            "u": "\u215B",
            "n": -1
        },
        {
            "k": /3\/8/,
            "u": "\u215C",
            "n": -1
        },
        {
            "k": /5\/8/,
            "u": "\u215D",
            "n": -1
        },
        {
            "k": /7\/8/,
            "u": "\u215E",
            "n": -1
        },
        {
            "k": /1\/9/,
            "u": "\u2151",
            "n": -1
        },
        {
            "k": /1\/10/,
            "u": "\u2152",
            "n": -1
        }
    ]
};

// Marks ranges in a message where unicode replacements will be ignored (inside URLs).
function getRangesForUnicodeConversion(msg)
{
    if(!msg) return;

    var tempMsg = msg;
    var results = [];
    var regexHttpStart = /http[s]?:\/\//;
    var regexHttpEnd = /[ \n\t]/;
    var start=0, end, position, rep = true;

    position = tempMsg.search(regexHttpStart);

    while(position!=-1)
    {
        end = start + position;
        if(end > start)
        {
            results.push({start: start, end: end, replace: rep});
        }
        rep = !rep;
        start = end;
        tempMsg = tempMsg.substring(position, tempMsg.length);

        if(rep == true)
            position = tempMsg.search(regexHttpStart);
        else
            position = tempMsg.search(regexHttpEnd);
    }
    end = msg.length;
    if(end > start)
        results.push({start: start, end: end, replace: rep});

    return results;
}

function getUnicodeReplacement(msg, list, ranges, ta)
{
   if(!msg || !list || !ranges) return;
   if(ranges.length===0) return "";

   var position, substrings = [];
   for (var j=0; j<ranges.length; j++)
   {
      substrings[j] = msg.substring(ranges[j].start, ranges[j].end);
      if(ranges[j].replace==true)
      {
          for (var i=0; i<list.length; i++)
          {
              position = substrings[j].search(list[i].k);
              if(position!=-1 && ta.data("disabledUnicodeRules").indexOf(list[i].u)==-1)
              {
                  var oldSubstring = substrings[j];
                  substrings[j] = substrings[j].replace(list[i].k, list[i].u);

                  var len = oldSubstring.length - substrings[j].length + list[i].u.length;
                  ta.data("unicodeConversionStack").unshift({
                      "k": oldSubstring.substr(position, len),
                      "u": list[i].u,
                      "p": ranges[j].start + position
                  });
              }
          }
      }
   }
   var returnString = substrings[0];
   for (var j=1; j<ranges.length; j++)
   {
       returnString += substrings[j];
   }
   return returnString;
}

function convert2Unicodes(s, ta)
{
    if(!ta.data("unicodeConversionStack"))      // A stack of undo steps
        ta.data("unicodeConversionStack", []);
    if(!ta.data("disabledUnicodeRules"))        // A list of conversion rules that are temporarily disabled
        ta.data("disabledUnicodeRules", []);
    var ranges = getRangesForUnicodeConversion(s);
    var list;
    if ($.Options.getUnicodeConversionOpt() === "enable" || $.Options.getConvertPunctuationsOpt())
    {
        list = unicodeConversionList.punctuation;
        s = getUnicodeReplacement(s, list, ranges, ta);
    }
    if ($.Options.getUnicodeConversionOpt() === "enable"|| $.Options.getConvertEmotionsOpt())
    {
        list = unicodeConversionList.emotions;
        s = getUnicodeReplacement(s, list, ranges, ta);
    }
    if ($.Options.getUnicodeConversionOpt() === "enable"|| $.Options.getConvertSignsOpt())
    {
        list = unicodeConversionList.signs;
        s = getUnicodeReplacement(s, list, ranges, ta);
    }
    if ($.Options.getUnicodeConversionOpt() === "enable"|| $.Options.getConvertFractionsOpt())
    {
        list = unicodeConversionList.fractions;
        s = getUnicodeReplacement(s, list, ranges, ta);
    }

    if (ta.data("unicodeConversionStack").length > 0)
    {
        var ub = ta.closest(".post-area-new").find(".undo-unicode");
        ub.text(polyglot.t("undo") + ": " + ta.data("unicodeConversionStack")[0].u);
        $.MAL.enableButton(ub);
    }
    else
    {
        $.MAL.disableButton(ta.closest(".post-area-new").find(".undo-unicode"));
    }

    return s;
}

function undoLastUnicode(e) {
    e.stopPropagation();
    e.preventDefault();

    var $ta = $(this).closest(".post-area-new").find("textarea");
    if ($ta.data("unicodeConversionStack").length === 0)
        return;

    var uc = $ta.data("unicodeConversionStack").shift();

    var pt = $ta.val();

    // If the text was shifted, and character is no longer at the saved position, this function
    // searches for it to the right. If it is not there, it searches in the oposite direction.
    // if it's not there either, it means it was deleted, so it is skipped.
    var substrLeft = pt.substring(0, uc.p);
    var substrRight = pt.substring(uc.p, pt.length);
    if(substrRight.search(uc.u)!=-1)
    {
        substrRight = substrRight.replace(uc.u, uc.k);
        $ta.val(substrLeft + substrRight);
        $ta.data("disabledUnicodeRules").push(uc.u);
    }
    else if(substrLeft.search(uc.u)!=-1)
    {
        var closestToTheLeft = substrLeft.lastIndexOf(uc.u);
        var substrCenter = substrLeft.substring(closestToTheLeft, substrLeft.length).replace(uc.u, uc.k);
        substrLeft = substrLeft.substring(0, closestToTheLeft);
        $ta.val(substrLeft + substrCenter + substrRight);
        $ta.data("disabledUnicodeRules").push(uc.u);
    }

    if ($ta.data("unicodeConversionStack").length > 0)
        $(this).text(polyglot.t("undo") + ": " + $ta.data("unicodeConversionStack")[0].u);
    else
    {
        $(this).text("undo");
        $.MAL.disableButton($(this));
    }
}

var postSubmit = function(e, oldLastPostId)
{
    var $this = $( this );
    if (e instanceof $) {
        $this = e;
        //check if previous part was sent...
        if ( oldLastPostId === lastPostId) {
            setTimeout(function () {
                postSubmit($this, oldLastPostId);
            }, 1000);
            return;
        }
    } else {
        e.stopPropagation();
        e.preventDefault();
    }
    $.MAL.disableButton($this);

    var $replyText = $this.closest(".post-area-new").find("textarea");

    var $postOrig = $this.closest(".post-data");
    if (!$postOrig.length) {
        $postOrig = $this.closest(".modal-content").find(".post-data");
    }

    if (splitedPostsCount > 1) {
        if ($replyText.length < splitedPostsCount) {
            //current part will be sent as reply to the previous part...
            $postOrig = $("<div data-id='" + lastPostId + "' data-screen-name='" + defaultScreenName + "'></div>");
        }
    }

    if ($replyText.length <= 1) {
        if (splitedPostsCount > 1) {
            var postxt = "";
            var reply_to = $replyText.attr('data-reply-to');
            var val = $replyText.val();
            if (typeof(reply_to) === 'undefined' || checkPostForMentions(val, reply_to, 140))
                postxt = val + " (" + splitedPostsCount.toString() + "/" + splitedPostsCount.toString() + ")";
            else
                postxt = reply_to + val + " (" + splitedPostsCount.toString() + "/" + splitedPostsCount.toString() + ")";

            newPostMsg(postxt, $postOrig);
        } else
            newPostMsg($replyText.val(), $postOrig);

        splitedPostsCount = 1;
    } else {
        var postxt = "";
        var reply_to = $replyText.attr('data-reply-to');
        var val = $replyText[0].value;
        if (typeof(reply_to) === 'undefined' || checkPostForMentions(val, reply_to, 140))
            postxt = val + " (" + (splitedPostsCount - $replyText.length + 1).toString() + "/" + splitedPostsCount.toString() + ")";
        else
            postxt = reply_to + val + " (" + (splitedPostsCount - $replyText.length + 1).toString() + "/" + splitedPostsCount.toString() + ")";

        $($replyText[0]).remove();

        oldLastPostId = lastPostId;
        newPostMsg(postxt, $postOrig);
        setTimeout(function() {postSubmit($this, oldLastPostId);}, 1000);

        return;
    }

    $replyText.val("");
    $replyText.attr("placeholder", polyglot.t("Your message was sent!"));
    var tweetForm = $this.parents("form");
    var remainingCount = tweetForm.find(".post-area-remaining");
    remainingCount.text(140);
    $replyText.attr("placeholder", "Your message was sent!");
    closeModal($this);
    if($this.closest('.post-area,.post-reply-content')){
        $('.post-area-new').removeClass('open').find('textarea').blur();
    };
    setTimeout('requestTimelineUpdate("latest",postsPerRefresh,followingUsers,promotedPostsOnly)', 1000);
    $replyText.data("unicodeConversionStack", []);
    $replyText.data("disabledUnicodeRules", []);
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

function changeStyle() {
    var style, profile, menu;
    var theme = $.Options.getTheme();

    if(theme == 'nin')
    {
        style = 'theme_nin/css/style.css';
        profile = 'theme_nin/css/profile.css';
        $.getScript('theme_nin/js/theme_option.js');

    }

    if(theme == 'calm')
    {
        style = 'theme_calm/css/style.css';
        profile = 'theme_calm/css/profile.css';
    }

    if(theme == 'original')
    {
        style = 'css/style.css';
        profile = 'css/profile.css';
        $.getScript('theme_original/js/theme_option.js');
    }

    $('#stylecss').attr('href', style);
    $('#profilecss').attr('href', profile);
    $("<style type='text/css'> .selectable_theme:not(.theme_" + theme + ")" +
      "{display:none!important;}\n</style>").appendTo("head");
    setTimeout(function(){$(menu).removeAttr('style')}, 0);
}

function mensAutocomplete() {
        var suggests = [];

        for(var i = 0; i < followingUsers.length; i++){
                if(followingUsers[i] == localStorage.defaultScreenName) continue;
                suggests.push(followingUsers[i]);
        }
        suggests.reverse();
        $('textarea').textcomplete([
    { // html
        mentions: suggests,
        match: /\B@(\w*)$/,
        search: function (term, callback) {
            callback($.map(this.mentions, function (mention) {
                return mention.indexOf(term) === 0 ? mention : null;
            }));
        },
        index: 1,
        replace: function (mention) {
            return '@' + mention + ' ';
        }
    }
])
}

function replaceDashboards() {
    if ($(window).width() >= 1200 && !$('.wrapper').hasClass('w1200')) {
        $('.wrapper').addClass('w1200');
        $('.userMenu').addClass('w1200');
        var wf = $('.module.who-to-follow');
        wf.remove();
        wf.appendTo($('.dashboard.right'));
    } else if ($(window).width() < 1200 && $('.wrapper').hasClass('w1200')) {
        $('.wrapper').removeClass('w1200');
        $('.userMenu').removeClass('w1200');
        var wf = $('.module.who-to-follow');
        wf.remove();
        $('.module.mini-profile').after(wf);
    }

    $( ".who-to-follow .refresh-users" ).bind( "click", refreshWhoToFollow );
    $( ".who-to-follow .view-all-users" ).bind( "click", openWhoToFollowModal );
}

function initInterfaceCommon() {
    $( "body" ).on( "click", function(event) {
        if($(event.target).hasClass('cancel')) closeModal($(this));
    });
    $(".cancel").on('click', function(event){
        if(!$(event.target).hasClass("cancel")) return;
        if($(".modal-content").attr("style") != undefined){$(".modal-content").removeAttr("style")};
        $('.modal-back').css('display', 'none');
        $('.mark-all-as-read').css('display', 'none');
    });
    $('.modal-back').on('click', function(){
        if($('.modal-content .direct-messages-list')[0]) return;
        directMessagesPopup();
        $(".modal-content").removeAttr("style");
    });
    $('.dropdown-menu').on('keydown', function(e){
            e = event || window.event;
            e.stopPropagation();
    })
    $('.post-text').on('click', 'a', function(e){
            e.stopPropagation();
    });
    $( ".post-reply" ).bind( "click", postReplyClick );
    $( ".post-propagate" ).bind( "click", reTwistPopup );
    $( ".userMenu-config-dropdown" ).bind( "click", dropDownMenu );
    $( ".config-menu" ).clickoutside( closeThis );
    $( ".module.post" ).bind( "click", function(e) {
        if(window.getSelection() == 0)postExpandFunction(e,$(this)); });
    $( ".post-area-new" ).bind( "click", function(e) {
        composeNewPost(e,$(this));} );
    $( ".post-area-new" ).clickoutside( unfocusThis );
    $( ".post-submit").click( postSubmit );
    $( ".modal-propagate").click( retweetSubmit );
    $( ".expanded-content .show-more").bind('click', openConversationModal);

    if ($.Options.getUnicodeConversionOpt() === "disable")
        $( ".undo-unicode" ).click( undoLastUnicode ).css("display", "none");
    else
        $( ".undo-unicode" ).click( undoLastUnicode );

    var $replyText = $( ".post-area-new textarea" );
    $replyText.on("keyup", replyTextKeypress );

    $( ".open-profile-modal").bind( "click", openProfileModal );
    $( ".open-hashtag-modal").bind( "click", openHashtagModal );
    $( ".open-following-modal").bind( "click", openFollowingModal );
    $( ".userMenu-connections a").bind( "click", openMentionsModal );
    $( ".mentions-from-user").bind( "click", openMentionsModal );

    replaceDashboards();

    $('.tox-ctc').on('click', function(){
        window.prompt(polyglot.t('copy_to_clipboard'), $(this).attr('data'))
    });
    $('.bitmessage-ctc').on('click', function(){
        window.prompt(polyglot.t('copy_to_clipboard'), $(this).attr('data'))
    });
}
