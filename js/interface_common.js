// interface_common.js
// 2013 Lucas Leal, Miguel Freitas
//
// Common interface functions to all pages, modal manipulation, button manipulation etc
// Profile, mentions and hashtag modal
// Post actions: submit, count characters

var window_scrollY = 0;

function openModal(modal) {
    window_scrollY = window.pageYOffset;

    $('body').css('overflow', 'hidden');

    if (!modal.classBase)
        modal.classBase = '.modal-wrapper';

    $(modal.classBase + ':not(#templates *)').remove();

    modal.self = $('#templates ' + modal.classBase).clone(true)
        .addClass(modal.classAdd);

    if (modal.title)
        modal.self.find('.modal-header h3').html(modal.title);
    if (modal.content)
        modal.content = modal.self.find('.modal-content')
            .append(modal.content);
    else
        modal.content = modal.self.find('.modal-content');

    modal.self.prependTo('body').fadeIn('fast');

    if (modal.classBase === '.modal-wrapper') {
        modal.content.outerHeight(modal.self.height() - modal.self.find('.modal-header').outerHeight());

        var windowHeight = $(window).height();
        if (modal.self.outerHeight() > windowHeight) {
            modal.content.outerHeight(modal.content.outerHeight() - modal.self.outerHeight() + windowHeight);
            modal.self.outerHeight(windowHeight);
            modal.self.css('margin-top', - windowHeight / 2);
        }
    }

    return modal;
}

function closeModal() {
    closeModalHandler('.modal-wrapper');
    window.location.hash = '#';
    window.scroll(window.pageXOffset, window_scrollY);
}

function closeModalHandler(classBase) {
    var modalWindows = $(classBase+':not(#templates *)');

    modalWindows.fadeOut('fast', function() {modalWindows.remove();});
    $('body').css({
        'overflow': 'auto',
        'margin-right': '0'
    });
}

function checkNetworkStatusAndAskRedirect(cbFunc, cbArg) {
    networkUpdate(function(args) {
        if (!twisterdConnectedAndUptodate) {
            var redirect = window.confirm(polyglot.t('switch_to_network'));
            if (redirect)
                $.MAL.goNetwork();
        } else {
            if (args.cbFunc)
                args.cbFunc(args.cbArg);
        }
    }, {cbFunc:cbFunc,cbArg:cbArg});
}

function timeGmtToText(t) {
    var d = new Date(0);
    d.setUTCSeconds(t);
    return d.toString().replace(/GMT.*/g, '');
}

function timeSincePost(t) {
    var d = new Date(0);
    d.setUTCSeconds(t);
    var now = new Date();
    var t_delta = Math.ceil((now - d) / 1000);
    var expression;
    if (t_delta < 60)
        expression = polyglot.t('seconds', t_delta);
    else if (t_delta < 3600)  // 60 * 60
        expression = polyglot.t('minutes', Math.floor(t_delta / 60));
    else if (t_delta < 86400)  // 24 * 60 * 60
        expression = polyglot.t('hours', Math.floor(t_delta / 3600));  // 60 * 60
    else
        expression = polyglot.t('days', Math.floor(t_delta / 86400));  // 24 * 60 * 60

    return polyglot.t('time_ago', {time: expression});
}

function openProfileModalWithUsernameHandler(username) {
    var content = $('#profile-modal-template').children().clone(true);

    updateProfileData(content, username);
    // FIXME following ctc could be part of updateProfileData() when mobile will be ready for this
    content.find('.tox-ctc').attr('title', polyglot.t('Copy to clipboard'));
    content.find('.bitmessage-ctc').attr('title', polyglot.t('Copy to clipboard'));

    var modal = openModal({
        classAdd: 'profile-modal',
        content: content,
        title: polyglot.t('users_profile', {username: username})
    });

    // setup follow button in profile modal window
    var button = modal.content.find('.profile-card-buttons .follow');
    if (button) {
        if (followingUsers.indexOf(username) !== -1)
            toggleFollowButton(username, true, function() {setTimeout(loadModalFromHash, 500);});
        else
            button.on('click', userClickFollow);
    }

    var postboard = modal.content.find('.postboard');
    var postboardHeight = modal.content.outerHeight() - modal.content.find('.profile-card').outerHeight();
    if (postboardHeight > 0) {  // FIXME actually it's here to exclude nin theme
        postboard.outerHeight(postboardHeight)
            .find('ol').outerHeight(postboard.outerHeight() - postboard.find('h2').outerHeight() - 20);  // FIXME 20px for margin, need to fix CSS for it
    } else
        postboard.outerHeight(modal.content.outerHeight());
}

function openHashtagModalFromSearchHandler(hashtag) {
    var modal = openModal({
        classAdd: 'hashtag-modal',
        content: $('#hashtag-modal-template').children().clone(true),
        title: '#' + hashtag
    });

    clearHashtagProcessed();
    updateHashtagModal(modal.content.find('.postboard-posts'), hashtag, 'hashtag');
}

function updateHashtagModal(postboard, hashtag, resource, timeoutArgs) {
    if (postboard.is('html *')) {
        requestHashtag(postboard, hashtag, resource, timeoutArgs);

        if (_hashtagPendingPostsUpdated) {
            if (resource !== 'mention' && $.Options.showDesktopNotifPostsModal.val === 'enable') {
                $.MAL.showDesktopNotif (false, polyglot.t('You got')+' '+polyglot.t('new_posts', _hashtagPendingPostsUpdated)+' '+polyglot.t('in search result')+'.', false,'twister_notification_new_posts_modal', $.Options.showDesktopNotifPostsModalTimer.val, function() {
                        $('.postboard-news').hide();
                        displayHashtagPending($('.hashtag-modal .postboard-posts'));
                    }, false)
            }
            _hashtagPendingPostsUpdated = 0;
        }

        // use extended timeout parameters on modal refresh (requires twister_core >= 0.9.14).
        // our first query above should be faster (with default timeoutArgs of twisterd),
        // then we may possibly collect more posts on our second try by waiting more.
        setTimeout(updateHashtagModal, 5000, postboard, hashtag, resource, [10000,2000,3]);
    }
}

function openMentionsModal(e) {
    if (e && e.stopPropagation) {
        e.stopPropagation();
        e.preventDefault();
    }

    var userInfo = $(this).closest('[data-screen-name]');
    if (userInfo.length)
        var username = userInfo.attr('data-screen-name');
    else if (defaultScreenName)
        var username = defaultScreenName;
    else {
        alert(polyglot.t('No one can mention you because you are not logged in.'));
        return;
    }

    window.location.hash = '#mentions?user=' + username;
}

function openMentionsModalHandler(username) {
    var modal = openModal({
        classAdd: 'hashtag-modal',
        content: $('#hashtag-modal-template').children().clone(true),
        title: polyglot.t('users_mentions', {username: username})
    });

    clearHashtagProcessed();
    updateHashtagModal(modal.content.find('.postboard-posts'), username, 'mention');

    if (username === defaultScreenName) {
        // obtain already cached mention posts from twister_newmsgs.js
        processHashtag(modal.content.find('.postboard-posts'), defaultScreenName, getMentionsData());
        resetMentionsCount();
    }
}

function openFollowingModal(username) {
    var content = $('#following-modal-template').children().clone(true);

    content.find('.following-screen-name b').text(username);
    loadFollowingIntoList(username, content.closest('ol'));

    openModal({
        classAdd: 'following-modal',
        content: content,
        title: polyglot.t('followed_by', {username: username})
    });
}

function fillWhoToFollowModal(list, hlist, start) {
    var itemTmp = $('#follow-suggestion-template').clone(true)
        .removeAttr('id');

    for (var i = 0; i < followingUsers.length && list.length < start + 20; i++) {
        if (typeof twisterFollowingO.followingsFollowings[followingUsers[i]] !== 'undefined') {
            for (var j = 0; j < twisterFollowingO.followingsFollowings[followingUsers[i]].following.length && list.length < start + 25; j++) {
                var utf = twisterFollowingO.followingsFollowings[followingUsers[i]].following[j];
                if (followingUsers.indexOf(utf) < 0 && list.indexOf(utf) < 0) {
                    list.push(utf);

                    var item = itemTmp.clone(true);

                    item.find('.twister-user-info').attr('data-screen-name', utf);
                    item.find('.twister-user-name').attr('href', $.MAL.userUrl(utf));
                    item.find('.twister-by-user-name').attr('href', $.MAL.userUrl(followingUsers[i]));
                    item.find('.twister-user-tag').text('@' + utf);

                    getAvatar(utf, item.find('.twister-user-photo'));
                    getFullname(utf, item.find('.twister-user-full'));
                    getBio(utf, item.find('.bio'));
                    getFullname(followingUsers[i], item.find('.followed-by').text(followingUsers[i]));

                    item.find('.twister-user-remove').remove();

                    hlist.append(item);
                }
            }
        }
    }
    itemTmp.remove();

    if (i >= followingUsers.length - 1)
        return false;

    // returns true, if there are more...
    return true;
}

function openWhoToFollowModal() {
    var modal = openModal({
        classAdd: 'who-to-follow-modal',
        title: polyglot.t('Who to Follow')
    });

    var tmplist = [];
    var hlist = $('<ol class="follow-suggestions"></ol>')
        .appendTo(modal.content);

    modal.content.on('scroll', function() {
        if (modal.content.scrollTop() >= hlist.height() - modal.content.height() - 20) {
            if (!fillWhoToFollowModal(tmplist, hlist, tmplist.length))
                modal.content.off('scroll');
        }
    });

    fillWhoToFollowModal(tmplist, hlist, 0);
}

function newConversationModal(username, resource) {
    var content = $('#hashtag-modal-template').children().clone(true);

    requestPost(content.find('.postboard-posts'), username, resource,
        function(args) {
            var postboard = args.content.find('.postboard-posts');
            var postLi = postboard.children().first()
                .css('display', 'none');
            getTopPostOfConversation(postLi, null, postboard);
        }, {content:content}
    );

    content.find('.postboard-news').on('click', function () {
        $(this).hide();
        displayHashtagPending($('.conversation-modal .postboard-posts'));
    });

    return content;
}

function openConversationClick(e) {
    e.stopPropagation();
    e.preventDefault();

    var postData = $(this).parents('.module.post.original.open .module.post.original .post-data');

    window.location.hash = '#conversation?post=' + postData.attr('data-screen-name') +
        ':post' + postData.attr('data-id');
}

function openConversationModal(username,resource) {
    openModal({
        classAdd: 'conversation-modal',
        content: newConversationModal(username, resource),
        title: polyglot.t('conversation_title', {username: username})
    });
}

function watchHashChange(e) {
    if (e != null) {
        var prevurlsplit = e.oldURL.split('#');
        var prevhashstring = prevurlsplit[1];

        var notFirstModalView = (prevhashstring !== undefined && prevhashstring.length > 0);
        var notNavigatedBackToFirstModalView = (window.history.state == null ||
            (window.history.state != null && window.history.state.showCloseButton !== false));

        if (notFirstModalView && notNavigatedBackToFirstModalView) {
            $('.modal-back').css('display', 'inline');
        } else {
            window.history.pushState({showCloseButton: false}, null, null);
            $('.modal-back').css('display', 'none');
        }
    }

    loadModalFromHash();
}

function loadModalFromHash() {
    var hashstring = decodeURIComponent(window.location.hash);
    var hashdata = hashstring.split(':');

    if (hashdata[0] !== '#web+twister')
        hashdata = hashstring.match(/(hashtag|profile|mentions|directmessages|following|conversation)\?(?:user|hashtag|post)=(.+)/);

    if (hashdata && hashdata[1] !== undefined && hashdata[2] !== undefined) {
        if (hashdata[1] === 'profile')
            openProfileModalWithUsernameHandler(hashdata[2]);
        else if (hashdata[1] === 'hashtag')
            openHashtagModalFromSearchHandler(hashdata[2]);
        else if (hashdata[1] === 'mentions')
            openMentionsModalHandler(hashdata[2]);
        else if (hashdata[1] === 'directmessages')
            openDmWithUserModal(hashdata[2]);
        else if (hashdata[1] === 'following')
            openFollowingModal(hashdata[2]);
        else if (hashdata[1] === 'conversation') {
            splithashdata2 = hashdata[2].split(':');
            openConversationModal(splithashdata2[0], splithashdata2[1]);
        }
    } else if (hashstring === '#directmessages')
        directMessagesPopup();
    else if (hashstring === '#whotofollow')
        openWhoToFollowModal();
}

function initHashWatching() {
    // register custom protocol handler
    if (window.navigator && window.navigator.registerProtocolHandler &&
        !_getResourceFromStorage('twister_protocol_registered')) {
            window.navigator.registerProtocolHandler(
                'web+twister',
                window.location.protocol + '//' + window.location.host + '/home.html#%s',
                'Twister'
            );
            _putResourceIntoStorage('twister_protocol_registered', true);
    }

    // register hash spy and launch it once
    window.addEventListener('hashchange', watchHashChange, false);
    setTimeout(watchHashChange, 1000);
}

function reTwistPopup(e) {
    e.stopPropagation();
    if (!defaultScreenName) {
        alert(polyglot.t('You have to log in to retransmit messages.'));
        return;
    }

    openModal({
        classBase: '.prompt-wrapper',
        classAdd: 'reTwist',
        title: polyglot.t('retransmit_this')
    })
        .content
            .append(postToElem($.evalJSON($(this).parents('.post-data').attr('data-userpost')), ''));
}

// Expande Área do Novo post
function replyInitPopup(e, post) {
    var modal = openModal({
        classBase: '.prompt-wrapper',
        classAdd: 'reply',
        title: polyglot.t('reply_to', {fullname: '<span class="fullname">'+post.userpost.n+'</span>'})
    });

    getFullname(post.userpost.n, modal.self.find('h3 .fullname'));

    modal.content
        .append($('#reply-modal-template').children().clone(true))
        .append(postToElem(post, ''))
    ;

    // FIXME passing data through attributes may result in a mess like following
    var replyArea = modal.content.find('.post-area .post-area-new').addClass('open');
    var replyText = replyArea.find('textarea');
    var postInlineReplyText = modal.content.find('.post .post-area-new textarea');
    $.each(['placeholder', 'data-reply-to'], function(i, attribute) {
        replyText.attr(attribute, postInlineReplyText.attr(attribute));
    });

    composeNewPost(e, replyArea);
}

// abre o menu dropdown de configurações
function dropDownMenu() {
    $('.config-menu').slideToggle('fast');
}

// fecha o config menu ao clicar em qualquer lugar da tela
function closeThis() {
    $(this).slideUp('fast');
}

function toggleFollowButton(username, toggleUnfollow, bindFunc) {
    if (!username)
        return;

    if (toggleUnfollow) {
        $('[data-screen-name="'+username+'"]').find('.follow')
            .removeClass('follow')
            .addClass('unfollow')
            .off('click')
            .on('click',
                (function(e) {
                    e.stopPropagation();

                    unfollow(this.username.toString(),
                        (function() {
                            toggleFollowButton(this.username);
                            if (this.bindFunc)
                                this.bindFunc;
                        }).bind({username: this.username, bindFunc: this.bindFunc})
                    );
                }).bind({username: username, bindFunc: bindFunc})
            )
            .text(polyglot.t('Unfollow'))
            .trigger('eventToggleUnfollow')
        ;
    } else {
        $('[data-screen-name="'+username+'"]').find('.unfollow')
            .removeClass('unfollow')
            .addClass('follow')
            .off('click')
            .on('click',
                (function(e) {
                    userClickFollow(e);
                    if (this.bindFunc)
                        this.bindFunc;
                }).bind({bindFunc: bindFunc})
            )
            .text(polyglot.t('Follow'))
            .trigger('eventToggleFollow');
    }
}

function postExpandFunction(e, postLi) {
    if (!postLi.hasClass('original'))
        return;

    var openClass = 'open';
    var originalPost = postLi.find('.post-data.original');
    var postInteractionText = originalPost.find('.post-expand');
    var postExpandedContent = originalPost.find('.expanded-content');
    var postsRelated = postLi.find('.related');

    if (!postLi.hasClass(openClass)) {
        originalPost.detach();
        postLi.empty();
        postLi.addClass(openClass);
        postInteractionText.text(polyglot.t('Collapse'));

        var itemOl = $('<ol/>', {class:'expanded-post'}).appendTo(postLi);
        var originalLi = $('<li/>', {class: 'module post original'}).appendTo(itemOl)
            .append(originalPost);

        postExpandedContent.slideDown('fast');

        if ($.Options.displayPreview.val === 'enable') {
            var previewContainer = postExpandedContent.find('.preview-container')[0];
            /* was the preview added before... */
            if ($(previewContainer).children().length === 0) {
                var link = originalPost.find('a[rel="nofollow"]');
                /*is there any link in the post?*/
                for (var i = 0; i < link.length; i++) {
                    if (/^[^?]+\.(?:jpe?g|gif|png)$/i.test(link[i].href)) {
                        var url = proxyURL(link[i].href);
                        $(previewContainer).append($('<img src="' + url + '" class="image-preview" />'));
                    }
                }
            }
        }
        // insert 'reply_to' before
        requestRepliedBefore(originalLi);
        // insert replies to this post after
        requestRepliesAfter(originalLi);
        // RTs faces and counter
        requestRTs(originalLi);
    } else {
        postLi.removeClass(openClass);

        postInteractionText.text(
            (typeof postLi.find('.post-data.original').attr('data-replied-to-id') === 'undefined') ?
                polyglot.t('Expand') : polyglot.t('Show conversation')
        );

        if (postsRelated)
            postsRelated.slideUp('fast');

        postExpandedContent.slideUp('fast', function() {
            originalPost.detach().appendTo(postLi.empty());
        });
    }

    e.stopPropagation();
}

function postReplyClick(e) {
    if (!defaultScreenName) {
        e.stopPropagation();
        alert(polyglot.t('You have to log in to post replies.'));
        return;
    }

    var post = $(this).closest('.post');
    if (!post.hasClass('original'))
        replyInitPopup(e, $.evalJSON(post.find('.post-data').attr('data-userpost')));
    else {
        if (!post.parents('.post.open').length)
            postExpandFunction(e, post);
        composeNewPost(e, post.find('.post-area-new'));
    }

    e.stopPropagation();
}

// Expande Área do Novo post
function composeNewPost(e, postAreaNew) {
    e.stopPropagation();
    if (!postAreaNew.hasClass('open')) {
        postAreaNew.addClass('open');
        //se o usuário clicar fora é pra fechar
        postAreaNew.clickoutside(unfocusThis);

        if ($.Options.splitPosts.val === 'enable')
            usePostSpliting = true;
        else if ($.Options.splitPosts.val === 'only-new') {
            var postOrig = postAreaNew.closest('.post-data');

            if (!postOrig.length)
                postOrig = postAreaNew.closest('.modal-content').find('.post-data');

            if (postOrig.length)
                usePostSpliting = false;
            else
                usePostSpliting = true;
        } else
            usePostSpliting = false;
    }

    var textArea = postAreaNew.find('textarea');
    if (textArea.attr('data-reply-to') && !textArea.val().length) {
        textArea.val(textArea.attr('data-reply-to'));
        posPostPreview(e);
    }
    if (!postAreaNew.find('textarea:focus').length)
        postAreaNew.find('textarea:last').focus();
}

function posPostPreview(event) {
    if (!$.Options.postPreview.val)
        return;

    var textArea = $(event.target);
    var postPreview = textArea.siblings('#post-preview');
    if (!postPreview.length) {
        postPreview = $('#post-preview-template').children().clone()
            .css('margin-left', textArea.css('margin-left'))
            .css('margin-right', textArea.css('margin-right'))
        ;
        postPreview.width(textArea.width());
        postPreview.width(postPreview.width()  // width is not accurate if we do it with textArea.width() directly, don't know why
            - postPreview.css('padding-left') - postPreview.css('padding-right'));
    }
    if (textArea[0].value.length)
        postPreview.html(htmlFormatMsg(textArea[0].value, [])).show();
    else
        postPreview.hide();
    textArea.before(postPreview);
}

// Reduz Área do Novo post
function unfocusThis() {
    $(this).removeClass('open');
}

function checkPostForMentions(post, mentions, max) {
    return new RegExp('^.{0,' + max.toString() + '}(?:' + mentions.trim().replace(/ /g, '|') + ')').test(post);
}

var splitedPostsCount = 1; // FIXME it could be property of future textAreaInput and composeNewPost united thing; currently stuff is hell
var usePostSpliting = false;

function replyTextInput(event) {
    var textArea = $(event.target);
    var textAreaForm = textArea.parents('form');
    if (textAreaForm.length) {
        if ($.Options.unicodeConversion.val !== 'disable')
            textArea.val(convert2Unicodes(textArea.val(), textArea));

        if (usePostSpliting && !textArea.parents('.directMessages').length) {
            var caretPos = textArea.caret();
            var reply_to = textArea.attr('data-reply-to');
            var tas = textAreaForm.find('textarea');
            splitedPostsCount = tas.length;
            var icurrentta = tas.index(event.target); // current textarea tas index
            var i = 0;
            var pml = getPostSplitingPML();
            var cci = getPostSpittingCI(icurrentta);

            for (; i < tas.length; i++) {
                pml = getPostSplitingPML();
                if (tas[i].value.length > pml) {
                    var ci = getPostSpittingCI(i);
                    if (i < splitedPostsCount - 1) {
                        tas[i + 1].value = tas[i].value.substr(ci) + tas[i + 1].value;
                        tas[i].value = tas[i].value.substr(0, ci);
                        if (caretPos > cci) {
                            caretPos -= ci;
                            icurrentta += 1;
                            cci = getPostSpittingCI(icurrentta);
                            var targetta = $(tas[icurrentta]);
                        } else if (i === icurrentta)
                            $(tas[i]).caret(caretPos);
                    } else {
                        var oldta = $(tas[i]);
                        if ($.fn.textcomplete) {
                            oldta.textcomplete('destroy');
                            event.stopImmediatePropagation(); // something goes wrong in $.fn.textcomplete if we don't stop this immediately
                        }
                        var cp = oldta.val();
                        var newta = $(oldta).clone(true)
                            .val(cp.substr(ci))
                            .insertAfter(oldta)
                        ;
                        oldta.val(cp.substr(0, ci))
                            .addClass('splited-post')
                            .on('focus', function() {this.style.height = '80px';})
                            .on('focusout', function() {this.style.height = '28px';}) // FIXME move this to CSS
                        ;

                        tas = textAreaForm.find('textarea');
                        splitedPostsCount = tas.length;
                        pml = getPostSplitingPML();

                        if (caretPos > cci) {
                            caretPos -= ci;
                            icurrentta += 1;
                            cci = getPostSpittingCI(icurrentta);
                            var targetta = newta;
                            oldta[0].style.height = '28px'; // FIXME move this to CSS
                        } else if (i === icurrentta) {
                            $(tas[i]).caret(caretPos);
                            replyTextUpdateRemaining(tas[i]);
                            if ($.fn.textcomplete)
                                setTextcompleteOnElement(tas[i]);
                        }
                    }
                } else if (tas.length > 1 && tas[i].value.length === 0) {
                    if (i === tas.length - 1) {
                        tas[i].value = tas[i - 1].value;
                        $(tas[i - 1]).remove();
                    } else
                        $(tas[i]).remove();
                    tas = textAreaForm.find('textarea');
                    i--;
                    splitedPostsCount = tas.length;
                    pml = getPostSplitingPML();
                    caretPos = -1;
                    if (icurrentta >= i && icurrentta > 0) {
                        icurrentta -= 1;
                        cci = getPostSpittingCI(icurrentta);
                    }
                    var targetta = $(tas[icurrentta]);
                }
            }

            if (typeof targetta !== 'undefined' && targetta[0] !== document.activeElement) {
                textArea = targetta;
                textArea.focus();
                textArea.caret(caretPos);
            }
        }

        if (textArea[0].value.length)
            textAreaForm.find('#post-preview').html(htmlFormatMsg(textArea[0].value, [])).show();
        else
            textAreaForm.find('#post-preview').html('').hide();
    }

    function getPostSplitingPML() {
        if (splitedPostsCount > 1) {
            var pml = 140 - (i+1).toString().length - splitedPostsCount.toString().length - 4;

            // if mention exists, we shouldn't add it while posting.
            if (typeof reply_to !== 'undefined' &&
                !checkPostForMentions(tas[i].value, reply_to, pml -reply_to.length)) {
                pml -= reply_to.length;
            }
        } else
            var pml = 140;
        return pml;
    }

    function getPostSpittingCI(ita) {
        var ci;
        var endings = tas[ita].value.match(/[\\\/\.,:;\?\!\*'"\]\)\}\^\|%\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3011>\s]/g)  // unicode escaped stuff is '”…—一。，：？！】

        if (endings) {
            ci = tas[ita].value.lastIndexOf(endings[endings.length - 1]);
            for (var j = endings.length - 2; j >= 0 && ci > pml; j--)
                ci = tas[ita].value.lastIndexOf(endings[j], ci - 1);
        }
        if (!(ci > 0))
            ci = pml;

        return (ci > pml) ? pml : ci;
    }
}

function replyTextUpdateRemaining(ta) {
    if (ta.target)
        ta = ta.target;
    if (ta === document.activeElement) {
        var textArea = $(ta);
        var textAreaForm = textArea.parents('form');
        if (textAreaForm.length) {
            var remainingCount = textAreaForm.find('.post-area-remaining');
            var c = replyTextCountRemaining(ta);

            if (usePostSpliting && !textArea.parents('.directMessages').length && splitedPostsCount > 1)
                remainingCount.text((textAreaForm.find('textarea').index(ta) + 1).toString()
                    + '/' + splitedPostsCount.toString() + ': ' + c.toString());
            else
                remainingCount.text(c.toString());

            var buttonSend = textAreaForm.find('.post-submit');
            if (!buttonSend.length)
                buttonSend = textAreaForm.find('.dm-submit');

            var disable = false;
            textAreaForm.find('textarea').each(function() {
                if (replyTextCountRemaining(this) < 0) {
                    disable = true; // alternatively we could call replyTextInput()
                    return false;
                }
            });
            if (!disable && c >= 0 && c < 140 && textArea.val() !== textArea.attr('data-reply-to')) {
                remainingCount.removeClass('warn');
                $.MAL.enableButton(buttonSend);
            } else {
                if (disable)
                    remainingCount.addClass('warn');
                $.MAL.disableButton(buttonSend);
            }
        }
    }
}

function replyTextCountRemaining(ta) {
    var textArea = $(ta);
    var c;

    if (usePostSpliting && !textArea.parents('.directMessages').length && splitedPostsCount > 1) {
        c = 140 - ta.value.length - (textArea.parents('form').find('textarea').index(ta) + 1).toString().length - splitedPostsCount.toString().length - 4;
        var reply_to = textArea.attr('data-reply-to');
        if (typeof reply_to !== 'undefined' &&
            !checkPostForMentions(ta.value, reply_to, 140 -c -reply_to.length))
                c -= reply_to.length;
    } else
        c = 140 - ta.value.length;

    return c;
}

function replyTextKeySend(event) {
    if (event.keyCode === 13) {
        if ((!event.metaKey && !event.ctrlKey && $.Options.keysSend.val === 'enter' &&
                $('.dropdown-menu').css('display') === 'none')
            || ((event.metaKey || event.ctrlKey) && $.Options.keysSend.val === 'ctrlenter')) {
                var textArea = $(event.target);
                var textAreaForm = textArea.parents('form');
                var buttonSend = textAreaForm.find('.post-submit');
                if (!buttonSend.length)
                    buttonSend = textAreaForm.find('.dm-submit');

                if (buttonSend.length) {
                    textArea.val(textArea.val().trim());

                    if (!buttonSend.hasClass('disabled'))
                        buttonSend.click();
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
    'punctuation': [
        {
            'k': /\.\.\./,
            'u': '\u2026',
            'n': -1
        },
        {
            'k': /\.\../,
            'u': '\u2025',
            'n': 2
        },
        {
            'k': /\?\?/,
            'u': '\u2047',
            'n': -1
        },
        {
            'k': /\?!/,
            'u': '\u2048',
            'n': -1
        },
        {
            'k': /!\?/,
            'u': '\u2049',
            'n': -1
        },
        {
            'k': /!!/,
            'u': '\u203C',
            'n': -1
        },
        {
            'k': /--/,
            'u': '\u2014',
            'n': -1
        },
        {
            'k': /~~/,
            'u': '\u2053',
            'n': -1
        }
    ],
    'emotions': [
        {
            'k': /:.{0,1}D/,
            'u': '\uD83D\uDE03',
            'n': -1
        },
        {
            'k': /(0|O):-{0,1}\)/i,
            'u': '\uD83D\uDE07',
            'n': -1
        },
        {
            'k': /:beer:/,
            'u': '\uD83C\uDF7A',
            'n': -1
        },
        {
            'k': /3:-{0,1}\)/,
            'u': '\uD83D\uDE08',
            'n': -1
        },
        {
            'k': /<3/,
            'u':'\u2764',
            'n': -1
        },
// disabled due to urls :/
//        {
//            'k': /o.O|:\/|:\\/,
//            'u': '\uD83D\uDE15',
//            'n': -1
//        },
        {
            'k': /:\'\(/,
            'u': '\uD83D\uDE22',
            'n': -1
        },
        {
            'k': /(:|=)-{0,1}\(/,
            'u': '\uD83D\uDE1E',
            'n': -1
        },
        {
            'k': /8(\)<|\|)/,
            'u': '\uD83D\uDE0E',
            'n': -1
        },
        {
            'k': /(:|=)-{0,1}(\)|\])/,
            'u': '\uD83D\uDE0A',
            'n': -1
        },
        {
            'k': /(\(|\[)-{0,1}(:|=)/,
            'u': '\uD83D\uDE0A',
            'n': -1
        },
        {
            'k': /:\*/,
            'u': '\uD83D\uDE17',
            'n': -1
        },
        {
            'k': /\^-{0,1}\^/,
            'u': '\uD83D\uDE06',
            'n': -1
        },
        {
            'k': /:p/i,
            'u': '\uD83D\uDE1B',
            'n': -1
        },
        {
            'k': /;-{0,1}\)/,
            'u': '\uD83D\uDE09',
            'n': -1
        },
        {
            'k': /\(-{0,1};/,
            'u': '\uD83D\uDE09',
            'n': -1
        },
        {
            'k': /:(O|0)/,
            'u': '\uD83D\uDE2E',
            'n': -1
        },
        {
            'k': /:@/,
            'u': '\uD83D\uDE31',
            'n': -1
        },
        {
            'k': /:\|/,
            'u': '\uD83D\uDE10',
            'n': -1
        }
    ],
    'signs': [
        {
            'k': / tel(|:|=)/i,
            'u': ' \u2121',
            'n': 4
        },
        {
            'k': /^tel(|:|=)/i,
            'u': '\u2121',
            'n': 3
        },
        {
            'k': / fax(|:|=)/i,
            'u': ' \u213B',
            'n': 4
        },
        {
            'k': /^fax(|:|=)/i,
            'u': '\u213B',
            'n': 3
        }
    ],
    'fractions': [
        {
            'k': /1\/2/,
            'u': '\u00BD',
            'n': -1
        },
        {
            'k': /1\/3/,
            'u': '\u2153',
            'n': -1
        },
        {
            'k': /2\/3/,
            'u': '\u2154',
            'n': -1
        },
        {
            'k': /1\/4/,
            'u': '\u00BC',
            'n': -1
        },
        {
            'k': /3\/4/,
            'u': '\u00BE',
            'n': -1
        },
        {
            'k': /1\/5/,
            'u': '\u2155',
            'n': -1
        },
        {
            'k': /2\/5/,
            'u': '\u2156',
            'n': -1
        },
        {
            'k': /3\/5/,
            'u': '\u2157',
            'n': -1
        },
        {
            'k': /4\/5/,
            'u': '\u2158',
            'n': -1
        },
        {
            'k': /1\/6/,
            'u': '\u2159',
            'n': -1
        },
        {
            'k': /5\/6/,
            'u': '\u215A',
            'n': -1
        },
        {
            'k': /1\/7/,
            'u': '\u2150',
            'n': -1
        },
        {
            'k': /1\/8/,
            'u': '\u215B',
            'n': -1
        },
        {
            'k': /3\/8/,
            'u': '\u215C',
            'n': -1
        },
        {
            'k': /5\/8/,
            'u': '\u215D',
            'n': -1
        },
        {
            'k': /7\/8/,
            'u': '\u215E',
            'n': -1
        },
        {
            'k': /1\/9/,
            'u': '\u2151',
            'n': -1
        },
        {
            'k': /1\/10/,
            'u': '\u2152',
            'n': -1
        }
    ]};

// Marks ranges in a message where unicode replacements will be ignored (inside URLs).
function getRangesForUnicodeConversion(msg) {
    if (!msg)
        return;

    var tempMsg = msg;
    var results = [];
    var regexHttpStart = /http[s]?:\/\//;
    var regexHttpEnd = /[ \n\t]/;
    var start = 0, end, position, rep = true;

    position = tempMsg.search(regexHttpStart);
    while (position !== -1) {
        end = start + position;
        if (end > start)
            results.push({start: start, end: end, replace: rep});
        rep = !rep;
        start = end;
        tempMsg = tempMsg.substring(position, tempMsg.length);

        if (rep === true)
            position = tempMsg.search(regexHttpStart);
        else
            position = tempMsg.search(regexHttpEnd);
    }

    end = msg.length;
    if (end > start)
        results.push({start: start, end: end, replace: rep});

    return results;
}

function getUnicodeReplacement(msg, list, ranges, ta) {
   if (!msg || !list || !ranges)
       return;
   if (ranges.length === 0)
       return '';

   var position, substrings = [];
   for (var j = 0; j < ranges.length; j++) {
      substrings[j] = msg.substring(ranges[j].start, ranges[j].end);
      if (ranges[j].replace === true) {
          for (var i = 0; i < list.length; i++) {
              position = substrings[j].search(list[i].k);
              if (position !== -1 && ta.data('disabledUnicodeRules').indexOf(list[i].u) === -1) {
                  var oldSubstring = substrings[j];
                  substrings[j] = substrings[j].replace(list[i].k, list[i].u);

                  var len = oldSubstring.length - substrings[j].length + list[i].u.length;
                  ta.data('unicodeConversionStack').unshift({
                      'k': oldSubstring.substr(position, len),
                      'u': list[i].u,
                      'p': ranges[j].start + position
                  });
              }
          }
      }
   }
   var returnString = substrings[0];
   for (var j = 1; j < ranges.length; j++) {
       returnString += substrings[j];
   }
   return returnString;
}

function convert2Unicodes(s, ta) {
    if (!ta.data('unicodeConversionStack'))      // A stack of undo steps
        ta.data('unicodeConversionStack', []);
    if (!ta.data('disabledUnicodeRules'))        // A list of conversion rules that are temporarily disabled
        ta.data('disabledUnicodeRules', []);
    var ranges = getRangesForUnicodeConversion(s);

    if ($.Options.unicodeConversion.val === 'enable' || $.Options.convertPunctuationsOpt.val)
        s = getUnicodeReplacement(s, unicodeConversionList.punctuation, ranges, ta);
    if ($.Options.unicodeConversion.val === 'enable' || $.Options.convertEmotionsOpt.val)
        s = getUnicodeReplacement(s, unicodeConversionList.emotions, ranges, ta);
    if ($.Options.unicodeConversion.val === 'enable' || $.Options.convertSignsOpt.val)
        s = getUnicodeReplacement(s, unicodeConversionList.signs, ranges, ta);
    if ($.Options.unicodeConversion.val === 'enable' || $.Options.convertFractionsOpt.val)
        s = getUnicodeReplacement(s, unicodeConversionList.fractions, ranges, ta);

    if (ta.data('unicodeConversionStack').length > 0) {
        var ub = ta.closest('.post-area-new').find('.undo-unicode');
        ub.text(polyglot.t('undo') + ': ' + ta.data('unicodeConversionStack')[0].u);
        $.MAL.enableButton(ub);
    } else
        $.MAL.disableButton(ta.closest('.post-area-new').find('.undo-unicode'));

    return s;
}

function undoLastUnicode(e) {
    e.stopPropagation();
    e.preventDefault();

    var $ta = $(this).closest('.post-area-new').find('textarea');
    if ($ta.data('unicodeConversionStack').length === 0)
        return;

    var uc = $ta.data('unicodeConversionStack').shift();

    var pt = $ta.val();

    // If the text was shifted, and character is no longer at the saved position, this function
    // searches for it to the right. If it is not there, it searches in the oposite direction.
    // if it's not there either, it means it was deleted, so it is skipped.
    var substrLeft = pt.substring(0, uc.p);
    var substrRight = pt.substring(uc.p, pt.length);
    if (substrRight.search(uc.u) !== -1) {
        substrRight = substrRight.replace(uc.u, uc.k);
        $ta.val(substrLeft + substrRight);
        $ta.data('disabledUnicodeRules').push(uc.u);
    } else if (substrLeft.search(uc.u) !== -1) {
        var closestToTheLeft = substrLeft.lastIndexOf(uc.u);
        var substrCenter = substrLeft.substring(closestToTheLeft, substrLeft.length).replace(uc.u, uc.k);
        substrLeft = substrLeft.substring(0, closestToTheLeft);
        $ta.val(substrLeft + substrCenter + substrRight);
        $ta.data('disabledUnicodeRules').push(uc.u);
    }

    if ($ta.data('unicodeConversionStack').length > 0)
        $(this).text(polyglot.t('undo') + ': ' + $ta.data('unicodeConversionStack')[0].u);
    else {
        $(this).text('undo');
        $.MAL.disableButton($(this));
    }
}

function postSubmit(e, oldLastPostId) {
    if (e instanceof $) {
        var $this = e;
        //check if previous part was sent...
        if (oldLastPostId === lastPostId) {
            setTimeout(postSubmit, 1000, $this, oldLastPostId);
            return;
        }
    } else {
        e.stopPropagation();
        e.preventDefault();
        var $this = $(this);
    }
    $.MAL.disableButton($this);

    var $replyText = $this.closest('.post-area-new').find('textarea');

    $replyText.siblings('#post-preview').hide();

    var $postOrig = $this.closest('.post-data');
    if (!$postOrig.length) {
        $postOrig = $this.closest('.modal-content').find('.post-data');
    }

    if (splitedPostsCount > 1) {
        if ($replyText.length < splitedPostsCount) {
            //current part will be sent as reply to the previous part...
            $postOrig = $('<div data-id="' + lastPostId + '" data-screen-name="' + defaultScreenName + '"></div>');
        }
    }

    if ($replyText.length <= 1) {
        if (splitedPostsCount > 1) {
            var postxt = '';
            var reply_to = $replyText.attr('data-reply-to');
            var val = $replyText.val();
            if (typeof reply_to === 'undefined' || checkPostForMentions(val, reply_to, 140))
                postxt = val + ' (' + splitedPostsCount.toString() + '/' + splitedPostsCount.toString() + ')';
            else
                postxt = reply_to + val + ' (' + splitedPostsCount.toString() + '/' + splitedPostsCount.toString() + ')';

            newPostMsg(postxt, $postOrig);
        } else
            newPostMsg($replyText.val(), $postOrig);

        splitedPostsCount = 1;
    } else {
        var postxt = '';
        var reply_to = $replyText.attr('data-reply-to');
        var val = $replyText[0].value;
        if (typeof reply_to === 'undefined' || checkPostForMentions(val, reply_to, 140))
            postxt = val + ' (' + (splitedPostsCount - $replyText.length + 1).toString() + '/' + splitedPostsCount.toString() + ')';
        else
            postxt = reply_to + val + ' (' + (splitedPostsCount - $replyText.length + 1).toString() + '/' + splitedPostsCount.toString() + ')';

        $($replyText[0]).remove();

        oldLastPostId = lastPostId;
        newPostMsg(postxt, $postOrig);
        setTimeout(postSubmit, 1000, $this, oldLastPostId);

        return;
    }

    $replyText.val('').attr('placeholder', polyglot.t('Your message was sent!'));
    var tweetForm = $this.parents('form');
    var remainingCount = tweetForm.find('.post-area-remaining');
    remainingCount.text(140);

    if ($this.parents('.modal-wrapper').length)
        closeModal();
    else if ($this.parents('.prompt-wrapper').length)
        closeModalHandler('.prompt-wrapper');

    if ($this.closest('.post-area,.post-reply-content')) {
        $('.post-area-new').removeClass('open').find('textarea').blur();
    };
    $replyText.data('unicodeConversionStack', []);
    $replyText.data('disabledUnicodeRules', []);
}

function retweetSubmit(e) {
    e.stopPropagation();
    e.preventDefault();

    newRtMsg($(this).closest('.prompt-wrapper').find('.post-data'));

    closeModalHandler('.prompt-wrapper');
}

function changeStyle() {
    var style, profile, menu;
    var theme = $.Options.theme.val;

    if (theme === 'nin') {
        style = 'theme_nin/css/style.css';
        profile = 'theme_nin/css/profile.css';
        $.getScript('theme_nin/js/theme_option.js');
    } else if (theme === 'nin2') {
        style = 'theme_nin2/css/style.css';
        profile = 'theme_nin2/css/profile.css';
    } else if (theme === 'calm') {
        style = 'theme_calm/css/style.css';
        profile = 'theme_calm/css/profile.css';
    } else if (theme === 'original') {
        style = 'css/style.css';
        profile = 'css/profile.css';
        $.getScript('theme_original/js/theme_option.js');
    }

    $('#stylecss').attr('href', style);
    $('#profilecss').attr('href', profile);
    $('<style type="text/css"> .selectable_theme:not(.theme_' + theme + ')' +
      '{display:none!important;}\n</style>').appendTo('head');
    setTimeout(function() {$(menu).removeAttr('style');}, 0);
}

function getMentionsForAutoComplete() {
    if (defaultScreenName && typeof followingUsers !== 'undefined') {
        var suggests = followingUsers.slice();

        if (suggests.indexOf(defaultScreenName) > -1)
            suggests.splice(suggests.indexOf(defaultScreenName), 1);
        if (suggests.length > 0) {
            suggests.sort();

            return [{
                mentions: suggests,
                match: /\B@(\w*)$/,
                search: function (term, callback) {
                    callback($.map(this.mentions, function (mention) {
                        return mention.indexOf(term) === 0 ? mention : null;
                    }));
                },
                index: 1,
                replace: function (mention) {
                    return '@'+mention+' ';
                }
            }];
        }
    }
}

function replaceDashboards() {
    var width = $(window).width();
    var wrapper = $('.wrapper');

    if (width >= 1200 && !wrapper.hasClass('w1200')) {
        wrapper.addClass('w1200');
        $('.userMenu').addClass('w1200');
        $('.module.who-to-follow').detach().appendTo($('.dashboard.right'));
        $('.module.twistday-reminder').detach().appendTo($('.dashboard.right'));
    } else if (width < 1200 && wrapper.hasClass('w1200')) {
        wrapper.removeClass('w1200');
        $('.userMenu').removeClass('w1200');
        $('.module.who-to-follow').detach().insertAfter($('.module.mini-profile'));
        $('.module.twistday-reminder').detach().insertAfter($('.module.toptrends'));
    }
}

function initInterfaceCommon() {
    $('.cancel').on('click', function() {
        if ($('.modal-content').attr('style') != undefined)
            $('.modal-content').removeAttr('style');
        $('.modal-back').css('display', 'none');
        $('.mark-all-as-read').css('display', 'none');
        closeModal();
    });

    $('.modal-back').on('click', function() {history.back();});

    $('.prompt-close').on('click', function(e) {
        e.stopPropagation();
        closeModalHandler('.prompt-wrapper');
    });

    /*
    $('.modal-back').on('click', function() {
        if ($('.modal-content .direct-messages-list')[0]) return;
        directMessagesPopup();
        $('.modal-content').removeAttr('style');
    });
    */

    $('.post-text').on('click', 'a', function(e) {e.stopPropagation();});
    $('.post-reply').on('click', postReplyClick);
    $('.post-propagate').on('click', reTwistPopup);
    $('.userMenu-config').clickoutside(closeThis.bind($('.config-menu')));
    $('.userMenu-config-dropdown').on('click', dropDownMenu);
    $('.module.post').on('click', function(e) {
        if (e.button === 0 && window.getSelection() == 0)
            postExpandFunction(e,$(this));
    });
    $('.post-area-new')
        .on('click', function(e) {composeNewPost(e, $(this));})
        .clickoutside(unfocusThis)
        .children('textarea')
            .on({
                'focus': posPostPreview,
                'input': replyTextInput,  // input event fires in modern browsers (IE9+) on any changes in textarea (and copypasting with mouse too)
                'input focus': replyTextUpdateRemaining,
                'keyup': replyTextKeySend
            })
    ;
    $('.post-submit').on('click', postSubmit);
    $('.modal-propagate').on('click', retweetSubmit);
    $('.expanded-content .show-more').on('click', openConversationClick);

    if ($.Options.unicodeConversion.val === 'disable')
        $('.undo-unicode').on('click', undoLastUnicode).css('display', 'none');
    else
        $('.undo-unicode').on('click', undoLastUnicode);

    $('.open-profile-modal').on('click', function(e) {e.stopPropagation();});
    //$('.open-hashtag-modal').on('click', openHashtagModal);
    //$('.open-following-modal').on('click', openFollowingModal);
    $('.userMenu-connections a').on('click', openMentionsModal);
    $('.mentions-from-user').on('click', openMentionsModal);

    $('#hashtag-modal-template .postboard-news').on('click', function () {
        $(this).hide();
        displayHashtagPending($('.hashtag-modal .postboard-posts'));
    });

    replaceDashboards();
    $(window).resize(replaceDashboards);

    $('.tox-ctc').on('click', promptCopyAttrData);
    $('.bitmessage-ctc').on('click', promptCopyAttrData);

    if ($.fn.textcomplete) {
        $('textarea').on({
            'focus': setTextcompleteOnEventTarget,
            'focusout': function () {$(this).textcomplete('destroy');}
        });
    }
}

function promptCopyAttrData(event) {
    window.prompt(polyglot.t('copy_to_clipboard'), $(event.target).attr('data'));
}

function initInterfaceModule(module) {
    return $('.module.'+module).html($('#'+module+'-template').html()).show();
}

function killInterfaceModule(module) {
    $('.module.'+module).empty().hide();
}

function setTextcompleteOnEventTarget(event) {
    // cursor has not set yet and we need to wait 100ms to skip global click event
    setTimeout(setTextcompleteOnElement, 100, event.target);
}

function setTextcompleteOnElement(elem) {
    elem = $(elem);
    elem.textcomplete(getMentionsForAutoComplete(), {
        appendTo: (elem.parents('.dashboard').length) ? elem.parent() : $('body'),
        listPosition: setTextcompleteDropdownListPos
    });
}

// following workaround function is for calls from $.fn.textcomplete only
// we need this because currently implementation of caret position detection is way too imperfect
function setTextcompleteDropdownListPos(position) {
    position = this._applyPlacement(position);

    if (this.option.appendTo.parents('.dashboard').length > 0) {
        position.position = 'fixed';
        position.top = (parseFloat(position.top) - window.pageYOffset).toString() + 'px';
    } else
        position.position = 'absolute';

    this.$el.css(position);

    return this;
}

$(document).ready(function()
{
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if (page.indexOf("following.html") === 0) {
        initInterfaceFollowing();
    } else if (page.indexOf("login.html") === 0) {
        initInterfaceLogin();
    } else if (page.indexOf("network.html") === 0) {
        initInterfaceNetwork();
    } else if (page.indexOf('options.html') === 0) {
        initInterfaceCommon();
        $.Options.initControls();
    } else if (page.indexOf("profile-edit.html") === 0) {
        initProfileEdit();
    }

    changeStyle();
});
