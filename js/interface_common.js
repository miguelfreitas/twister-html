// interface_common.js
// 2013 Lucas Leal, Miguel Freitas
//
// Common interface functions to all pages, modal manipulation, button manipulation etc
// Profile, mentions and hashtag modal
// Post actions: submit, count characters

var twister = {
    URIs: {},  // shortened URIs are cached here after fetching
    torrentIds: {},  // auto-download torrentIds
    focus: {},  // focused elements are counted here
    html: {
        detached: $('<div>'),  // here elements go to detach themself
        blanka: $('<a rel="nofollow noreferrer" target="_blank">')  // to open stuff in new tab, see routeOnClick()
    },
    tmpl: {  // templates pointers are stored here
        root: $('<div>')  // templates should be detached from DOM and attached here; use extractTemplate()
    },
    modal: {},
    res: {},  // reses for various reqs are cached here
    var: {
        localAccounts: [],
        updatesCheckClient: {}
    }
};
var window_scrollY = 0;
var _watchHashChangeRelaxDontDoIt = window.location.hash === '' ? true : false;

// FIXME so looks like it's wrapper over $; it's here to select and manipulate detached elements too
// and actually I'm talking about 'so called \'detached\'' elements which appended to twister.html.detached
// we may just append twister.html.detached to document instead and remove this weird shit (or I need to
// improve my google skills to find native jQuery way to dig through all detached elemets with one query)
function getElem(req, searchInTmpl) {
    var elem = $(req);
    var h = twister.html.detached.find(req);

    for (var i = 0; i < h.length; i++)
        elem[elem.length++] = h[i];

    if (searchInTmpl) {
        h = twister.tmpl.root.find(req);
        for (var i = 0; i < h.length; i++)
            elem[elem.length++] = h[i];
    }

    return elem;
}

function openModal(modal) {
    if (!modal.classBase) {
        modal.classBase = '.modal-wrapper';

        window_scrollY = window.pageYOffset;
        $('body').css('overflow', 'hidden');
    }

    if (modal.classBase !== '.prompt-wrapper')
        closeModal($(modal.classBase + ':not(#templates *)'), true);

    modal.self = $('#templates ' + modal.classBase).clone(true)
        .addClass(modal.classAdd);

    if (modal.removeBlackout)
        modal.self.find('.modal-blackout').remove();

    if (modal.title)
        modal.self.find('.modal-header h3').html(modal.title);
    if (modal.content)
        modal.content = modal.self.find('.modal-content')
            .append(modal.content);
    else
        modal.content = modal.self.find('.modal-content');

    if (modal.warn && modal.warn.name && modal.warn.text) {
        var elem = twister.tmpl.modalComponentWarn.clone(true)
            .attr('data-warn-name', modal.warn.name)
            .toggle(!$.Options.get('skipWarn' + modal.warn.name))
        ;
        fillElemWithTxt(elem.find('.text'), modal.warn.text, {markout: 'apply'});
        elem.find('.options .never-again + span').text(polyglot.t('do_not_show_it_again'));
        elem.insertBefore(modal.content);
    }

    modal.self.appendTo('body').fadeIn('fast');  // FIXME maybe it's better to append it to some container inside body

    if (modal.classBase === '.modal-wrapper') {
        twister.modal[window.location.hash] = modal;
        modal.self.attr('data-modal-id', window.location.hash);

        modal.drapper = $('<div>').appendTo(twister.html.detached);  // here modal goes instead detaching

        modal.content.outerHeight(modal.self.height() - modal.self.find('.modal-header').outerHeight()
            - modal.self.find('.inline-warn').outerHeight()
            * (modal.warn && !$.Options.get('skipWarn' + modal.warn.name) ? 1 : 0));

        var windowHeight = $(window).height();
        if (modal.self.outerHeight() > windowHeight) {
            modal.content.outerHeight(modal.content.outerHeight() - modal.self.outerHeight() + windowHeight);
            modal.self.outerHeight(windowHeight);
            modal.self.css('margin-top', - windowHeight / 2);
        }
    }

    return modal;
}

function closeModal(req, switchMode) {
    if (typeof req === 'undefined')
        var elem = $('.modal-wrapper:not(#templates *)');  // select active modal(s)
    else if (req.jquery)
        var elem = req;
    else if (req.target)
        var elem = getElem(req.target);  // getElem() to search in minimized too
    else if (typeof req === 'string' || req.outerHTML)
        var elem = getElem(req);

    if (!elem || !elem.length)
        return;

    // we close all modals which are containing element(s)
    elem.closest('.modal-wrapper:not(.closed)').addClass('closed')
        .fadeOut(switchMode ? 10 : 'fast', function () {
            var i = this.getAttribute('data-modal-id');

            if (twister.modal[i].minimized)
                twister.modal[i].btnResume.fadeOut('fast', function () {this.remove();});
            else
                this.remove();  // if it's minimized it will be removed with twister.modal[i].drapper

            if (typeof twister.modal[i].onClose === 'function')
                twister.modal[i].onClose(twister.modal[i].onCloseReq);

            twister.modal[i].drapper.remove();
            twister.modal[i] = undefined;
        }
    );

    if (!switchMode) {
        if (window.location.hash !== '') {
            _watchHashChangeRelaxDontDoIt = true;
            window.location.hash = '#';
        }
        window.scroll(window.pageXOffset, window_scrollY);
        $('body').css({
            'overflow': 'auto',
            'margin-right': '0'
        });
    }
}

function closePrompt(req) {
    if (typeof req === 'undefined')
        var elem = $('.prompt-wrapper:not(#templates *)');
    else if (req.jquery)
        var elem = req;
    else if (req.target)
        var elem = $(req.target);
    else if (typeof req === 'string' || req.outerHTML)
        var elem = $(req);

    if (!elem || !elem.length)
        return;

    if (typeof req.stopPropagation === 'function') {
        req.preventDefault();
        req.stopPropagation();
        req = req.data;
    }

    // we close all prompts which are containing element(s)
    elem.closest('.prompt-wrapper:not(.closed)').addClass('closed')
        .fadeOut('fast', function() {this.remove();});

    if (req && typeof req.cbFunc === 'function')  // FIXME maybe bind to ^ prompt fadeout function
        req.cbFunc(req.cbReq);
}

function minimizeModal(modal, switchMode) {

    function minimize(modal, scroll) {
        var i = modal.attr('data-modal-id');

        modal.appendTo(twister.modal[i].drapper);

        twister.modal[i].minimized = true;
        twister.modal[i].scroll = scroll;
        twister.modal[i].btnResume = $('<li>' + modal.find('.modal-header h3').text() + '</li>')
            .on('click', {hashString: window.location.hash}, function (event) {
                if (!event.button)  // only if left mouse (button is 0) or elem.click() (button is undefined)
                    resumeModal(event);
            })
            .on('mouseup', {route: window.location.hash, blankOnly: true}, routeOnClick)
            .appendTo($('#modals-minimized'))
        ;
    }

    if (modal.is('.closed')) return;

    var scroll;  // MUST be setted before modal.detach(), modal.fadeOut() and so on
    if (modal.is('.profile-modal')) {
        if (modal.find('.profile-card').attr('data-screen-name')[0] === '*')
            scroll = {
                targetSelector: '.modal-content .members',
                top: modal.find('.modal-content .members').scrollTop()
            };
        else
            scroll = {
                targetSelector: '.modal-content .postboard-posts',
                top: modal.find('.modal-content .postboard-posts').scrollTop()
            };
    } else
        scroll = {
            targetSelector: '.modal-content',
            top: modal.find('.modal-content').scrollTop()
        };

    if (switchMode)
        minimize(modal, scroll);
    else
        modal.fadeOut('fast', function () {
            minimize(modal, scroll);

            _watchHashChangeRelaxDontDoIt = true;
            window.location.hash = '#';
            window.scroll(window.pageXOffset, window_scrollY);
            $('body').css({
                'overflow': 'auto',
                'margin-right': '0'
            });
        });
}

function resumeModal(event) {
    $(event.target).fadeOut('fast', function () {this.remove();});

    var modalActive = $('.modal-wrapper:not(#templates *)').not('.closed');
    if (modalActive.length)
        minimizeModal(modalActive, true);
    else {
        window_scrollY = window.pageYOffset;
        $('body').css('overflow', 'hidden');
    }

    var modal = twister.modal[event.data.hashString];
    if (modal.self.not('.closed') && modal.minimized) {
        modal.minimized = false;
        modal.btnResume = undefined;
        if (window.location.hash !== event.data.hashString) {
            _watchHashChangeRelaxDontDoIt = true;
            window.location.hash = event.data.hashString;
        }
        modal.self.prependTo('body').fadeIn('fast', function () {
            // TODO also need reset modal height here maybe and then compute new scroll
            if (modal.scroll)
                modal.self.find($(modal.scroll.targetSelector).scrollTop(modal.scroll.top));

            if (typeof modal.onResume === 'function')
                modal.onResume(modal.onResumeReq);
        });
    }
}

function focusModalWithElement(elem, cbFunc, cbReq) {
    if (elem.jquery ? elem.is('html *') : $(elem).is('html *')) {
        if (typeof cbFunc === 'function')
            cbFunc(cbReq);
        return true;
    }

    var i = getHashOfMinimizedModalWithElem(elem);
    if (i) {
        if (typeof i === 'object') i = i[0]; // several modals, but only one may be active currently
        twister.modal[i].onResume = cbFunc;
        twister.modal[i].onResumeReq = cbReq;
        twister.modal[i].btnResume.click();
        return true;
    }

    return false;
}

function getHashOfMinimizedModalWithElem(req) {
    var hashes = [];

    for (var i in twister.modal)
        if (twister.modal[i] && twister.modal[i].minimized && twister.modal[i].drapper.find(req).length)
            hashes[hashes.length++] = i;

    return hashes.length > 1 ? hashes : hashes[0];
}

function isModalWithElemExists(elem) {
    if (elem.jquery ? elem.is('html *') : $(elem).is('html *'))
        return true;
    else
        return getHashOfMinimizedModalWithElem(elem) ? true : false;
}

function confirmPopup(req) {
    if (!req) return;

    if (typeof req.stopPropagation === 'function') {
        req.preventDefault();
        req.stopPropagation();
        if (req.data)
            req = req.data;
        else
            return;
    }

    var modal = openModal({
        classBase: '.prompt-wrapper',
        classAdd: req.classAdd ? 'confirm-popup ' + req.classAdd : 'confirm-popup',
        content: $('#confirm-popup-template').children().clone(true),
        removeBlackout: !req.addBlackout,
        title: req.txtTitle
    });

    if (req.txtMessage) {
        if (req.txtMessage.polyglot)
            req.txtMessage = polyglot.t(req.txtMessage.polyglot, req.txtMessage.polyglotReq);
        fillElemWithTxt(modal.content.find('.message'), req.txtMessage, {markout: 'apply'});
    }

    var btn = modal.content.find('.confirm');
    if (req.removeConfirm)
        btn.remove();
    else {
        if (req.txtConfirm)
            btn.text(req.txtConfirm);
        else
            btn.text(polyglot.t('Confirm'));

        if (req.cbConfirm)
            btn.on('click', {cbFunc: req.cbConfirm, cbReq: req.cbConfirmReq}, closePrompt);
        else
            btn.on('click', closePrompt);
    }
    var btn = modal.content.find('.cancel');
    if (req.removeCancel)
        btn.remove();
    else {
        if (req.txtCancel)
            btn.text(req.txtCancel);
        else
            btn.text(polyglot.t('Cancel'));

        if (req.cbCancel)
            btn.on('click', {cbFunc: req.cbCancel, cbReq: req.cbCancelReq}, closePrompt);
        else
            btn.on('click', closePrompt);
    }
    var btn = modal.self.find('.prompt-close');
    if (req.removeClose)
        btn.remove();
    else {
        if (req.cbClose) {
            if (typeof req.cbClose === 'string')
                if (req.cbClose === 'cbConfirm') {
                    req.cbClose = req.cbConfirm;
                    req.cbCloseReq = req.cbConfirmReq;
                } else if (req.cbClose === 'cbCancel') {
                    req.cbClose = req.cbCancel;
                    req.cbCloseReq = req.cbCancelReq;
                }

            btn.on('click', {cbFunc: req.cbClose, cbReq: req.cbCloseReq}, closePrompt);
        }
    }

    return modal;
}

function alertPopup(req) {
    if (!req) return;

    if (typeof req.stopPropagation === 'function') {
        if (typeof req.data !== 'object') return;
        if (!req.data.txtConfirm)
            req.data.txtConfirm = polyglot.t('btn_ok');
        req.data.removeCancel = true;
    } else {
        if (!req.txtConfirm)
            req.txtConfirm = polyglot.t('btn_ok');
        req.removeCancel = true;
    }

    return confirmPopup(req);
}

function checkNetworkStatusAndAskRedirect(cbFunc, cbReq) {
    networkUpdate(function(req) {
        if (!twisterdConnectedAndUptodate) {
            confirmPopup({
                txtMessage: polyglot.t('confirm_switch_to_network', {page: '/network.html'}),
                cbConfirm: $.MAL.goNetwork
            });
        } else {
            if (req.cbFunc)
                req.cbFunc(req.cbReq);
        }
    }, {cbFunc: cbFunc, cbReq: cbReq});
}

function timeGmtToText(t) {
    if (t == 0) return '-';
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

function openModalLogin() {
    var modal = openModal({
        classAdd: 'login-modal',
        content: twister.tmpl.loginMC.clone(true),
        title: polyglot.t('twister login')
    });
}

function handleClickAccountLoginLogin(event) {
    loginToAccount($(event.target).closest('.module').find('select.local-usernames').val());
}

function handleInputAccountCreateSetReq(event) {
    var container = $(event.target).closest('.module');

    container.find('.availability').text('');
    $.MAL.enableButton(container.find('.check'));
    $.MAL.disableButton(container.find('.create'));
}

function handleClickAccountCreateCheckReq(event) {
    var container = $(event.target).closest('.module');
    var peerAliasElem = container.find('.alias');
    var peerAlias = peerAliasElem.val().toLowerCase();
    var availField = container.find('.availability');

    peerAliasElem.val(peerAlias);
    $.MAL.disableButton(container.find('.check'));

    if (!peerAlias.length)
        return;
    if (peerAlias.length > 16) {
        availField.text(polyglot.t('Must be 16 characters or less.'));
        return;
    }

    // check for non-alphabetic characters and space
    if (peerAlias.search(/[^a-z0-9_]/) !== -1) {
        availField.text(polyglot.t('Only alphanumeric and underscore allowed.'));
        return;
    }

    availField.text(polyglot.t('Checking...'));

    dumpPubkey(peerAlias,
        function(req, ret) {
            if (ret) {
                req.container.find('.availability').text(polyglot.t('Not available'));
            } else {
                req.container.find('.availability').text(polyglot.t('Available'));
                $.MAL.enableButton(req.container.find('.create'));
            }
        }, {container: container}
    );
}

function handleClickAccountCreateCreate(event) {
    var container = $(event.target).closest('.module');
    var peerAlias = container.find('.alias').val().toLowerCase();

    if (twister.var.localAccounts.indexOf(peerAlias) < 0) {
        createAccount(peerAlias);
    } else {
        // user exists in wallet but transaction not sent
        dumpPrivkey(peerAlias,
            function (req, ret) {
                $.MAL.processCreateAccount(req.peerAlias, ret);
            }, {peerAlias: peerAlias}
        );
    }
}

function handleInputAccountImportSetReq(event) {
    var container = $(event.target).closest('.module');

    if (container.find('.secret-key').val().length === 52
        && container.find('.alias').val().toLowerCase().length)
        $.MAL.enableButton(container.find('.import'));
    else
        $.MAL.disableButton(container.find('.import'));
}

function handleClickAccountImportImport(event) {
    var container = $(event.target).closest('.module');

    importAccount(container.find('.alias').val().toLowerCase(), container.find('.secret-key').val())
}

function openGroupProfileModalWithNameHandler(groupAlias) {
    var modal = openModal({
        classAdd: 'profile-modal',
        content: $('#group-profile-modal-template').children().clone(true),
        title: polyglot.t('users_profile', {username: '<span>' + groupAlias + '</span>'})
    });

    modal.content.find('.profile-card').attr('data-screen-name', groupAlias);

    groupMsgGetGroupInfo(groupAlias,
        function(req, ret) {
            if (ret) {
                req.modal.content.find('.profile-bio .group-description')
                    .val(ret.description)
                    .attr('val-origin', ret.description)
                ;

                if (ret.members.indexOf(defaultScreenName) !== -1)
                    req.modal.content.find('.group-messages-control').children('button').attr('disabled', false);

                var membersList = req.modal.content.find('.members');
                var memberTemplate = $('#group-profile-member-template').children();
                for (var i = 0; i < ret.members.length; i++) {
                    var item = memberTemplate.clone(true).appendTo(membersList);

                    item.find('.twister-user-info').attr('data-screen-name', ret.members[i]);
                    item.find('.twister-user-name').attr('href', $.MAL.userUrl(ret.members[i]));

                    getAvatar(ret.members[i], item.find('.twister-user-photo'));
                    getFullname(ret.members[i], item.find('.twister-user-full'));
                    getBioToElem(ret.members[i], item.find('.bio'));
                }

                elemFitNextIntoParentHeight(req.modal.content.find('.profile-card'));
            }
        }, {modal: modal}
    );

    elemFitNextIntoParentHeight(modal.content.find('.profile-card'));
}

function openUserProfileModalWithNameHandler(peerAlias) {
    var content = $('#profile-modal-template').children().clone(true);

    updateProfileData(content, peerAlias);
    // FIXME following ctc could be part of updateProfileData() when mobile will be ready for this
    content.find('.tox-ctc').attr('title', polyglot.t('Copy to clipboard'));
    content.find('.bitmessage-ctc').attr('title', polyglot.t('Copy to clipboard'));

    content.find('.open-followers').on('mouseup', {route: '#followers?user=' + peerAlias}, routeOnClick);

    var modal = openModal({
        classAdd: 'profile-modal',
        content: content,
        title: polyglot.t('users_profile', {username: peerAlias})
    });

    toggleFollowButton({
        button: modal.content.find('.profile-card-buttons .follow'),
        peerAlias: peerAlias,
        toggleUnfollow: followingUsers.indexOf(peerAlias) !== -1 ? true : false
    });

    elemFitNextIntoParentHeight(modal.content.find('.profile-card'));

    var postboard = modal.content.find('.postboard');
    postboard.find('ol').outerHeight(postboard.actual('height')
        - postboard.find('h2').actual('outerHeight', {includeMargin: true}));
}

function openHashtagModalFromSearchHandler(hashtag) {
    var modal = openModal({
        classAdd: 'hashtag-modal',
        content: $('#hashtag-modal-template').children().clone(true),
        title: '#' + hashtag
    });

    var req = queryStart(modal.content.find('.postboard-posts'), hashtag, 'hashtag');
    modal.content.find('.postboard-news').on('click', {req: req}, handleClickDisplayPendingTwists);
}

function handleClickDisplayPendingTwists(event) {
    if (!event || !event.data || !event.data.req)
        return;

    $(event.target).hide();

    queryPendingDraw(event.data.req);

    if (typeof event.data.cbFunc === 'function')
        event.data.cbFunc(event.data.cbReq);
}

function openFavsModal(event) {
    if (event && typeof event.stopPropagation === 'function') {
        event.preventDefault();
        event.stopPropagation();
    }

    var userInfo = $(this).closest('[data-screen-name]');
    var peerAlias = '';
    if (userInfo.length)
        peerAlias = userInfo.attr('data-screen-name');
    else if (defaultScreenName)
        peerAlias = defaultScreenName;
    else {
        alertPopup({
            //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
            txtMessage: polyglot.t('No favs here because you are not logged in.')
        });
        return;
    }

    window.location.hash = '#favs?user=' + peerAlias;
}

function openFavsModalHandler(peerAlias) {
    var modal = openModal({
        classAdd: 'hashtag-modal',
        content: $('#hashtag-modal-template').children().clone(true),
        title: polyglot.t('users_favs', {username: peerAlias})
    });

    var req = queryStart(modal.content.find('.postboard-posts'), peerAlias, 'fav');
    modal.content.find('.postboard-news').on('click', {req: req}, handleClickDisplayPendingTwists);
}

function openMentionsModal(event) {
    if (event && typeof event.stopPropagation === 'function') {
        event.preventDefault();
        event.stopPropagation();
    }

    var userInfo = $(this).closest('[data-screen-name]');
    if (userInfo.length)
        var peerAlias = userInfo.attr('data-screen-name');
    else if (defaultScreenName)
        var peerAlias = defaultScreenName;
    else {
        alertPopup({
            //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
            txtMessage: polyglot.t('No one can mention you because you are not logged in.')
        });
        return;
    }

    window.location.hash = '#mentions?user=' + peerAlias;
}

function openMentionsModalHandler(peerAlias) {
    var modal = openModal({
        classAdd: 'hashtag-modal',
        content: $('#hashtag-modal-template').children().clone(true),
        title: polyglot.t('users_mentions', {username: peerAlias})
    });

    var req = queryStart(modal.content.find('.postboard-posts'), peerAlias, 'mention');
    modal.content.find('.postboard-news').on('click', {req: req}, handleClickDisplayPendingTwists);

    if (peerAlias === defaultScreenName)
        modal.content.on('scroll', handleMentionsModalScroll);
}

function openFollowersModal(peerAlias) {
    var followers, title, warn;

    if (!peerAlias || peerAlias === defaultScreenName) {
        if (!defaultScreenName) {
            alertPopup({
                //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
                txtMessage: polyglot.t('You don\'t have any followers because you are not logged in.')
            });
            history.back();
            return;
        }
        title = polyglot.t('Followers');
        followers = twisterFollowingO.knownFollowers.slice();
        warn = {
            name: 'FollowersNotAll',
            text: '* ' + polyglot.t('warn_followers_not_all')
        };
    } else {
        title = polyglot.t('Followers_of', {alias: peerAlias});
        followers = whoFollows(peerAlias);
        warn = {
            name: 'FollowersNotAllOf',
            text: polyglot.t('warn_followers_not_all_of', {alias: peerAlias})
        };
    }

    var modal = openModal({
        classAdd: 'followers-modal',
        content: twister.tmpl.followersList.clone(true),
        title: title,
        warn: warn
    });

    appendFollowersToElem(modal.content.find('ol'), followers);
}

function appendFollowersToElem(list, followers) {
    for (var i = 0; i < followers.length; i++)
        addPeerToFollowersList(list, followers[i]);

    $.MAL.listLoaded(list);
}

function addPeerToFollowersList(list, peerAlias, isCheckNeeded) {
    if (typeof list !== 'object' || !list.length)
        return;
    if (isCheckNeeded && list.find('li[data-peer-alias="' + peerAlias + '"]').length)
        return;

    var item = twister.tmpl.followersPeer.clone(true).attr('data-peer-alias', peerAlias);

    item.find('.alias').text('@' + peerAlias);
    item.find('.alias, .avatar, .name').on('mouseup', {route: $.MAL.userUrl(peerAlias)}, routeOnClick);
    getAvatar(peerAlias, item.find('.avatar img'));
    getFullname(peerAlias, item.find('.name'));
    getBioToElem(peerAlias, item.find('.bio'));

    item.prependTo(list);
}

function openFollowingModal(peerAlias) {
    if (!peerAlias || peerAlias === defaultScreenName) {
        if (!defaultScreenName) {
            alertPopup({
                //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
                txtMessage: polyglot.t('You are not following anyone because you are not logged in.')
            });
            history.back();
            return;
        }

        var modal = openModal({
            classAdd: 'following-own-modal',
            content: twister.tmpl.followingList.clone(true),
            title: polyglot.t('Following')
        });
        appendFollowingToElem(modal.content.find('.following-list'));
        requestSwarmProgress();
    } else {
        var modal = openModal({
            classAdd: 'following-modal',
            content: $('#following-modal-template').children().clone(true),
            title: polyglot.t('followed_by', {username: peerAlias})
        });
        modal.content.find('.following-screen-name b').text(peerAlias);
        loadFollowingIntoList(peerAlias, modal.content.find('ol'));
    }
}

function appendFollowingToElem(list) {
    if (followingEmptyOrMyself())
        $.MAL.warnFollowingNotAny(closeModal, list);
    else
        for (var i = 0; i < followingUsers.length; i++)
            addPeerToFollowingList(list, followingUsers[i]);

    $.MAL.listLoaded(list);
}

function addPeerToFollowingList(list, peerAlias) {
    var item = twister.tmpl.followingPeer.clone(true).attr('data-peer-alias', peerAlias);

    item.find('.mini-profile-info').attr('data-screen-name', peerAlias)
    item.find('.following-screen-name').text(peerAlias);
    item.find('a.open-profile-modal').attr('href', $.MAL.userUrl(peerAlias));
    item.find('.direct-messages-with-user').text(polyglot.t('send_DM'))
        .on('mouseup', {route: $.MAL.dmchatUrl(peerAlias)}, routeOnClick);
    item.find('.mentions-from-user').text(polyglot.t('display_mentions'))
        .on('mouseup', {route: $.MAL.mentionsUrl(peerAlias)}, routeOnClick);
    getAvatar(peerAlias, item.find('.mini-profile-photo'));
    getFullname(peerAlias, item.find('.mini-profile-name'));
    getStatusTime(peerAlias, item.find('.latest-activity .time'));

    if (peerAlias === defaultScreenName)
        item.find('.following-config').hide();

    toggleFollowButton({
        button: item.find('.follow'),
        peerAlias: peerAlias,
        toggleUnfollow: true
    });
    var elem = item.find('.public-following').on('click', followingListPublicCheckbox);
    if (isPublicFollowing(peerAlias))
        elem.text(polyglot.t('Public'));
    else
        elem.text(polyglot.t('Private')).addClass('private');

    item.prependTo(list);
}

function fillWhoToFollowModal(list, hlist, start) {
    for (var i = 0; i < followingUsers.length && list.length < start + 20; i++) {
        if (typeof twisterFollowingO.followingsFollowings[followingUsers[i]] !== 'undefined') {
            for (var j = 0; j < twisterFollowingO.followingsFollowings[followingUsers[i]].following.length && list.length < start + 25; j++) {
                var utf = twisterFollowingO.followingsFollowings[followingUsers[i]].following[j];
                if (followingUsers.indexOf(utf) < 0 && list.indexOf(utf) < 0) {
                    list.push(utf);

                    processWhoToFollowSuggestion(hlist, utf, followingUsers[i]);
                }
            }
        }
    }

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
            if (!fillWhoToFollowModal(tmplist, modal.self, tmplist.length))
                modal.content.off('scroll');
        }
    });

    fillWhoToFollowModal(tmplist, modal.self, 0);
}

function openNewUsersModal() {
    var modal = openModal({
        classAdd: 'new-users-modal',
        title: polyglot.t('New Users'),
        onClose: function() {
            NewUserSearch.isNewUserModalOpen = false;
        }
    });

    var hlist = $('<ol class="follow-suggestions"></ol>')
        .appendTo(modal.content);
    var count = 15;

    modal.content.on('scroll', function() {
        if (modal.content.scrollTop() >= hlist.height() - modal.content.height() - 20) {
            if (newUsers.getLastNUsers(5, count, modal.self))
                count += 5;
        }
    });

    NewUserSearch.isNewUserModalOpen = true;
    newUsers.getLastNUsers(15, 0, modal.self);
}

function openModalUriShortener()
{
    var modal = openModal({
        classAdd: 'uri-shortener-modal',
        content: twister.tmpl.uriShortenerMC.clone(true),
        title: polyglot.t('URI_shortener')
    });

    modal.content.find('.uri-shortener-control .shorten-uri').text(polyglot.t('shorten_URI'));
    modal.content.find('.uri-shortener-control .clear-cache').text(polyglot.t('clear_cache'));

    var urisList = modal.content.find('.uris-list');
    //var i = 0;
    for (var short in twister.URIs) {
        //i++;
        var long = twister.URIs[short] instanceof Array ? twister.URIs[short][0] : twister.URIs[short];
        var item = twister.tmpl.uriShortenerUrisListItem.clone(true);
        item.find('.short').text(short);
        item.find('.long').text(long).attr('href', long);
        item.appendTo(urisList);
    }
    //i + URIs are cached
}

function newConversationModal(peerAlias, resource) {
    var content = $('#hashtag-modal-template').children().clone(true);

    requestPost(content.find('.postboard-posts'), peerAlias, resource,
        function(args) {
            var postboard = args.content.find('.postboard-posts');
            var postLi = postboard.children().first()
                .css('display', 'none');
            getTopPostOfConversation(postLi, null, postboard);
        }, {content: content}
    );

    return content;
}

function addToCommonDMsList(list, targetAlias, message) {
    var item = twister.tmpl.commonDMsListItem.clone(true)
        .attr('data-screen-name', targetAlias)
        .attr('data-last_id', message.id)
        .attr('data-time', message.time)
    ;

    item.find('.post-info-tag').text('@' + targetAlias);
    item.find('.post-info-name').attr('href', $.MAL.userUrl(targetAlias));
    fillElemWithTxt(item.find('.post-text'), message.text);
    item.find('.post-info-time')
        .attr('title', timeSincePost(message.time))
        .find('span:last')
            .text(timeGmtToText(message.time))
    ;
    if (targetAlias[0] === '*') {
        getAvatar(message.from, item.find('.post-photo img'));  // it's impossible yet to get group avatar
        getGroupChatName(targetAlias, item.find('a.post-info-name'));
    } else {
        getAvatar(targetAlias, item.find('.post-photo img'));
        getFullname(targetAlias, item.find('a.post-info-name'));
    }

    if (twister.DMs[targetAlias].lengthNew > 0)
        item.addClass('new')
            .find('.messages-qtd').text(twister.DMs[targetAlias].lengthNew).show();

    var items = list.children();
    for (var i = 0; i < items.length; i++) {
        var elem = items.eq(i);
        var time = elem.attr('data-time');
        if (typeof time === 'undefined' || message.time > parseInt(time)) {
            elem.before(item);
            break;
        }
    }
    if (i === items.length)  // equals to !item.parent().length
        list.append(item);
}

function handleClickOpenProfileModal(event) {
    event.data = {route: $(this).attr('href')};
    routeOnClick(event);
}

function handleClickOpenConversation(event) {
    var elem = $(event.target).closest(event.data.feeder);
    if (!elem.length) {
        muteEvent(event, true);
        return;
    }

    var post = {
        writer: elem.attr('data-screen-name'),
        id: elem.attr('data-id')
    };
    if (!post.writer || !post.id) {
        muteEvent(event, true);
        return;
    }

    event.data.route = '#conversation?post=' + post.writer + ':post' + post.id;
    routeOnClick(event);
}

function openConversationModal(peerAlias, resource) {
    openModal({
        classAdd: 'conversation-modal',
        content: newConversationModal(peerAlias, resource),
        title: polyglot.t('conversation_title', {username: peerAlias})
    });
}

function openRequestShortURIForm(event) {
    if (event) muteEvent(event);

    if (!defaultScreenName) {
        alertPopup({
            //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
            txtMessage: 'You can\'t shorten links because you are not logged in.'
        });
        return;
    }
    if (parseInt(twisterVersion) < 93500) {
        alertPopup({
            //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
            txtMessage: 'You can\'t shorten links —\n'
                + polyglot.t('daemon_is_obsolete', {versionReq: '0.9.35'})
        });
        return;
    }

    var uri = prompt(polyglot.t('shorten_URI_enter_link'));  // FIXME replace native prompt

    if (event && event.data && typeof event.data.cbFunc === 'function')
        newShortURI(uri, event.data.cbFunc, event.data.cbReq);
    else
        newShortURI(uri, showURIPair);
}

function showURIPair(uriLong, uriShort) {  // FIXME req
    if (uriShort)
        alertPopup({
            txtTitle: polyglot.t('URI_shortener'),
            txtMessage: uriLong + ' — `' + uriShort + '`'
        });
    else
        showURIShortenerErrorRPC(uriShort);
}

function showURIShortenerErrorRPC(ret) {
    alertPopup({
        txtTitle: polyglot.t('URI_shortener'),
        txtMessage: 'something went wrong. RPC error message:\n' + (ret && ret.message ? ret.message : ret)
    });
}

function fillElemWithTxt(elem, txt, htmlFormatMsgOpt) {
    var formatted = htmlFormatMsg(txt, htmlFormatMsgOpt);

    elem.html(formatted.html);
    elem.find('a').each(function (i, elem) {
        var href = elem.getAttribute('href');
        if (elem.classList.contains('link-shortened')) {
            $(elem).on('click mouseup', {href: href},
                function (event) {
                    muteEvent(event, true);
                    fetchShortenedURI(event.data.href);
                }
            );
            fetchShortenedURI(href);
        } else if (href && href[0] === '#')
            $(elem)
                .on('click', {preventDefault: true}, muteEvent)
                .on('mouseup', {route: href}, routeOnClick)
            ;
        else
            $(elem).on('click mouseup', muteEvent);
    });

    return formatted;
}

function fetchShortenedURI(req, attemptCount) {
    if (twister.URIs[req]) {
        applyShortenedURI(req, twister.URIs[req]);
        return;
    }

    decodeShortURI(req,
        function (req, ret) {
            if (ret) {
                twister.URIs[req.shortURI] = ret;
                $.localStorage.set('twistaURIs', twister.URIs);
                applyShortenedURI(req.shortURI, ret);
            } else {
                console.warn('can\'t fetch URI "' + req.shortURI + '": null response');
                if ((req.attemptCount ? ++req.attemptCount : req.attemptCount = 1) < 3)  // < $.Options.decodeShortURITriesMax
                    fetchShortenedURI(req.shortURI, req.attemptCount);
            }
        }, {shortURI: req, attemptCount: attemptCount}
    );
}

function applyShortenedURI(short, uriAndMimetype) {
    var long = (uriAndMimetype instanceof Array) ? uriAndMimetype[0] : uriAndMimetype;
    var mimetype = (uriAndMimetype instanceof Array) ? uriAndMimetype[1] : undefined;
    var elems = getElem('.link-shortened[href="' + short + '"]');

    if (isUriSuspicious(long)) {
        elems.replaceWith(
            '…<br><b><i>' + polyglot.t('busted_oh') + '</i> '
            + polyglot.t('busted_avowal') + ':</b><br><samp>'
            + long
                .replace(/&(?!lt;|gt;)/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;')
            + '</samp><br>…<br>'
        );
        return;
    }

    elems
        .attr('href', long)
        .removeClass('link-shortened')
        .off('click mouseup')
        .on('click mouseup', muteEvent)
    ;

    var cropped = (/*$.Options.cropLongURIs &&*/ long.length > 23) ? long.slice(0, 23) + '…' : undefined;
    for (var i = 0; i < elems.length; i++) {
        if (elems[i].text === short)  // there may be some other text, possibly formatted, so we check it
            if (cropped)
                $(elems[i])
                    .text(cropped)
                    .on('mouseover', {uri: long}, function (event) {event.target.text = event.data.uri;})
                    .on('mouseout', {uri: cropped}, function (event) {event.target.text = event.data.uri;})
                ;
            else
                elems[i].text = long;

        if (long.lastIndexOf('magnet:?xt=urn:btih:') === 0) {
            var previewContainer = $(elems[i]).parents(".post-data").find(".preview-container");
            var fromUser = $(elems[i]).parents(".post-data").attr("data-screen-name");
            var isMedia = mimetype !== undefined &&
                          (mimetype.lastIndexOf('video') === 0 ||
                           mimetype.lastIndexOf('image') === 0 ||
                           mimetype.lastIndexOf('audio') === 0);
            if ($.Options.WebTorrent.val === 'enable') {
                if ($.Options.WebTorrentAutoDownload.val === 'enable' &&
                    followingUsers.indexOf(fromUser) !==-1) {
                    if(!(long in twister.torrentIds)) {
                        twister.torrentIds[long] = true;
                        $.localStorage.set('torrentIds', twister.torrentIds);
                    }
                    startTorrentDownloadAndPreview(long, previewContainer, isMedia);
                } else {
                    // webtorrent enabled but no auto-download. provide a link to start manually.
                    var startTorrentLink = $('<a href="#">Start WebTorrent download of this media</a>');
                    startTorrentLink.on('click', function(event) {
                        event.stopPropagation();
                        startTorrentDownloadAndPreview(long, previewContainer, isMedia)
                    });
                    previewContainer.append(startTorrentLink);
                }
            } else {
                var enableWebTorrentWarning = $('<span>' +
                    polyglot.t('Enable WebTorrent support in options page to display this content') +
                    '</span>');
                previewContainer.append(enableWebTorrentWarning);
            }
        }
    }
}

function startTorrentDownloadAndPreview(torrentId, previewContainer, isMedia) {
    if (typeof WebTorrentClient !== 'undefined') {
        _startTorrentDownloadAndPreview(torrentId, previewContainer, isMedia);
    } else {
        // delay execution until WebTorrent is loaded/initialized
        setTimeout(_startTorrentDownloadAndPreview,1000,torrentId, previewContainer, isMedia)
    }
}

function _startTorrentDownloadAndPreview(torrentId, previewContainer, isMedia) {
    var torrent = WebTorrentClient.get(torrentId);
    if( torrent === null )
        torrent = WebTorrentClient.add(torrentId);

    previewContainer.empty();
    var speedStatus = $('<span class="post-text"/>');
    previewContainer.append(speedStatus);
    function updateSpeed () {
        var progress = (100 * torrent.progress).toFixed(1)
        speedStatus[0].innerHTML =
            '<b>Peers:</b> ' + torrent.numPeers + ' ' +
            '<b>Progress:</b> ' + progress + '% ' +
            '<b>Download:</b> ' + torrent.downloadSpeed + '/s ' +
            '<b>Upload:</b> ' + torrent.uploadSpeed + '/s';
    }
    setInterval(updateSpeed, 1000);
    updateSpeed();

    if( torrent.files.length ) {
        webtorrentFilePreview(torrent.files[0], previewContainer, isMedia)
    } else {
        torrent.on('metadata', function () {
            webtorrentFilePreview(torrent.files[0], previewContainer, isMedia)
        });
    }
}

function webtorrentFilePreview(file, previewContainer, isMedia) {
    if (!isMedia) {
        // try guessing by filename extension
        isMedia = /^[^?]+\.(?:jpe?g|gif|png|mp4|webm|mp3|ogg|wav|)$/i.test(file.name)
    }

    if (isMedia) {
        var imagePreview = $('<div class="image-preview" />');
        previewContainer.append(imagePreview);
        file.appendTo(imagePreview[0], function (err, elem) {
            if ('pause' in elem) {
                elem.pause();
            }
        });
        var $vid = imagePreview.find("video");
        $vid.removeAttr("autoplay");
        $vid.on('click mouseup', muteEvent);
    } else {
        file.getBlobURL(function (err, url) {
            if (err) return console.error(err)
            var blobLink = $('<a href="' + url + '" download="'+file.name+'">' +
                'Download ' + file.name + '</a>');
            previewContainer.append(blobLink);
        })
    }
}

function routeOnClick(event) {

    function routeNewTab(event) {
        if (event.target.href) {
            // we can't prevent hyperlink navigation on middle button in Firefox via event.preventDefault(), see https://bugzilla.mozilla.org/show_bug.cgi?id=1249970
            // so we need to delete href to make element not hyperlink and add it again after 200 ms
            setTimeout((function () {this.elem.setAttribute('href', this.href);})
                .bind({elem: event.target, href: event.target.getAttribute('href')}), 200);
            event.target.removeAttribute('href');
        }
        twister.html.blanka.attr('href', event.data.route)[0].click();  // opens .route in new tab
    }

    if (!event || !event.data || !event.data.route)
        return;

    if (event.button === 0 && window.getSelection().toString() !== '')
        return;

    event.stopPropagation();
    event.preventDefault();

    if (event.button === 0 && !event.data.blankOnly)  // left mouse button
        window.location = event.data.route;  // closes modal(s) in watchHashChange() and opens .route
    else if (event.button === 1) // middle mouse button
        if (event.data.blankOnly || event.metaKey || event.ctrlKey)
            routeNewTab(event);
        else {
            var modal = $(event.target).closest('.modal-wrapper:not(.closed)');
            if (modal.length && window.location.hash !== event.data.route) {
                minimizeModal(modal, true);  // yep, we minimize current modal before .route opening
                window.location.hash = event.data.route;
            } else
                routeNewTab(event);
        }
}

function watchHashChange(event) {
    if (typeof event !== 'undefined') {
        var prevurlsplit = event.oldURL.split('#');
        var prevhashstring = prevurlsplit[1];

        // FIXME need to move back button handling to special function and call it in openModal() and resumeModal()
        var notFirstModalView = (prevhashstring !== undefined && prevhashstring.length > 0);
        var notNavigatedBackToFirstModalView = (window.history.state == null ||
            (window.history.state != null && window.history.state.showCloseButton !== false));

        if (notFirstModalView && notNavigatedBackToFirstModalView) {
            $('.modal-back').css('display', 'inline');
        } else {
            window.history.replaceState({showCloseButton: false}, '', window.location.pathname + window.location.hash);
            $('.modal-back').css('display', 'none');
        }
    }

    if (_watchHashChangeRelaxDontDoIt)
        _watchHashChangeRelaxDontDoIt = false;
    else
        loadModalFromHash();
}

function loadModalFromHash() {
    var i = window.location.hash;
    if (twister.modal[i] && twister.modal[i].minimized) {
        // need to close active modal(s) before btnResume.click() or it will be minimized in resumeModal()
        // e.g. for case when you click on profile link in some modal having this profile's modal minimized already
        closeModal(undefined, true);
        twister.modal[i].btnResume.click();
        return;
    }

    var hashstring = decodeURIComponent(window.location.hash);
    if (hashstring === '') {
        closeModal();  // close active modal(s)
        return;
    }
    var hashdata = hashstring.split(':');

    // FIXME rework hash scheme from '#following?user=twister' to something like '#/@twister/following'
    if (hashdata[0] !== '#web+twister')
        hashdata = hashstring.match(/(hashtag|profile|mentions|directmessages|followers|following|conversation|favs)\?(?:group|user|hashtag|post)=(.+)/);

    if (hashdata && hashdata[1] !== undefined && hashdata[2] !== undefined) {
        if (hashdata[1] === 'profile')
            if (hashdata[2][0] === '*')
                openGroupProfileModalWithNameHandler(hashdata[2]);
            else
                openUserProfileModalWithNameHandler(hashdata[2]);

        else if (hashdata[1] === 'hashtag')
            openHashtagModalFromSearchHandler(hashdata[2]);
        else if (hashdata[1] === 'mentions')
            openMentionsModalHandler(hashdata[2]);
        else if (hashdata[1] === 'directmessages') {
            if (hashdata[2][0] === '*')
                openGroupMessagesModal(hashdata[2]);
            else
                openDmWithUserModal(hashdata[2]);

        } else if (hashdata[1] === 'followers')
            openFollowersModal(hashdata[2]);
        else if (hashdata[1] === 'following')
            openFollowingModal(hashdata[2]);
        else if (hashdata[1] === 'conversation') {
            splithashdata2 = hashdata[2].split(':');
            openConversationModal(splithashdata2[0], splithashdata2[1]);
        }
        else if (hashdata[1] === 'favs')
            openFavsModalHandler(hashdata[2]);
    } else if (hashstring === '#directmessages')
        openCommonDMsModal();
    else if (hashstring === '#followers')
        openFollowersModal();
    else if (hashstring === '#following')
        openFollowingModal();
    else if (hashstring === '#groupmessages')
        openGroupMessagesModal();
    else if (hashstring === '#groupmessages+newgroup')
        openGroupMessagesNewGroupModal();
    else if (hashstring === '#groupmessages+joingroup')
        openGroupMessagesJoinGroupModal();
    else if (hashstring === '#/login')
        openModalLogin();
    else if (hashstring === '#whotofollow')
        openWhoToFollowModal();
    else if (hashstring === '#/uri-shortener')
        openModalUriShortener();
    else if (hashstring === '#newusers')
        openNewUsersModal();
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

function reTwistPopup(event, post, textArea) {
    event.stopPropagation();

    if (!defaultScreenName) {
        alertPopup({
            //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
            txtMessage: polyglot.t('You have to log in to retransmit messages.')
        });
        return;
    }

    if (typeof post === 'undefined')
        post = $.evalJSON($(event.target).closest('.post-data').attr('data-userpost'));

    var modal = openModal({
        classBase: '.prompt-wrapper',
        classAdd: 'reTwist',
        title: polyglot.t('retransmit_this')
    });

    modal.content
        .append(postToElem(post, ''))
        .append($('#reTwist-modal-template').children().clone(true))
    ;

    modal.content.find('.switch-mode')
        .text(polyglot.t('Switch to Reply'))
        .on('click', {post: post},
            function(event) {
                var textArea = $(event.target).closest('form').find('textarea').detach();
                closePrompt(event.target);
                replyInitPopup(event, event.data.post, textArea);
            }
        )
    ;

    var replyArea = modal.content.find('.post-area .post-area-new');
    if (typeof textArea === 'undefined') {
        textArea = replyArea.find('textarea');
        var textAreaPostInline = modal.content.find('.post .post-area-new textarea');
        $.each(['placeholder', 'data-reply-to'], function(i, attribute) {
            textArea.attr(attribute, textAreaPostInline.attr(attribute));
        });
    } else {
        replyArea.find('textarea').replaceWith(textArea);
        if (textArea.val()) {
            textArea.focus();
            replyArea.addClass('open');
        }
    }
    replyArea.find('.post-submit').addClass('with-reference');
}

function favPopup(event, post, textArea) {
    event.stopPropagation();

    if (!defaultScreenName) {
        alertPopup({
            txtMessage: polyglot.t('You have to log in to favorite messages.')
        });
        return;
    }

    if (typeof post === 'undefined')
        post = $.evalJSON($(event.target).closest('.post-data').attr('data-userpost'));

    var modal = openModal({
        classBase: '.prompt-wrapper',
        classAdd: 'fav-this',
        title: polyglot.t('fav_this')
    });

    modal.content
        .append(postToElem(post, ''))
        .append($('#fav-modal-template').children().clone(true))
    ;
    /*
    //TODO: favs can be also commented
    var replyArea = modal.content.find('.post-area .post-area-new');
    if (typeof textArea === 'undefined') {
        textArea = replyArea.find('textarea');
        var textAreaPostInline = modal.content.find('.post .post-area-new textarea');
        $.each(['placeholder', 'data-reply-to'], function(i, attribute) {
            textArea.attr(attribute, textAreaPostInline.attr(attribute));
        });
    } else {
        replyArea.find('textarea').replaceWith(textArea);
        if (textArea.val()) {
            textArea.focus();
            replyArea.addClass('open');
        }
    }
    replyArea.find('.post-submit').addClass('with-reference');
    */
}

// Expande Área do Novo post
function replyInitPopup(e, post, textArea) {
    var modal = openModal({
        classBase: '.prompt-wrapper',
        classAdd: 'reply',
        title: polyglot.t('reply_to', {fullname: '<span class="fullname">'+post.userpost.n+'</span>'})
    });

    getFullname(post.userpost.n, modal.self.find('h3 .fullname'));

    modal.content
        .append(postToElem(post, ''))
        .append($('#reply-modal-template').children().clone(true))
    ;

    modal.content.find('.switch-mode')
        .text(polyglot.t('Switch to Retransmit'))
        .on('click',  {post: post},
            function(event) {
                var textArea = $(event.target).closest('form').find('textarea').detach();
                closePrompt(event.target);
                reTwistPopup(event, event.data.post, textArea);
            }
        )
    ;

    var replyArea = modal.content.find('.post-area .post-area-new').addClass('open');
    if (typeof textArea === 'undefined') {
        textArea = replyArea.find('textarea');
        var textAreaPostInline = modal.content.find('.post .post-area-new textarea');
        $.each(['placeholder', 'data-reply-to'], function(i, attribute) {
            textArea.attr(attribute, textAreaPostInline.attr(attribute));
        });
    } else {
        replyArea.find('textarea').replaceWith(textArea);
    }
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

function muteEvent(event, preventDefault) {
    event.stopPropagation();
    if (preventDefault || (event.data && event.data.preventDefault))
        event.preventDefault();
}

function toggleFollowButton(req) {
    if (!req || !req.peerAlias)
        return;

    if (req.toggleUnfollow) {
        if (!req.button || !req.button.jquery)
            req.button = getElem('[data-screen-name="' + req.peerAlias + '"]').find('.follow');
        req.button
            .text(polyglot.t('Unfollow'))
            .removeClass('follow')
            .addClass('unfollow')
            .off('click')
            .on('click', {peerAlias: req.peerAlias}, clickUnfollow)
        ;
    } else {
        if (!req.button || !req.button.jquery)
            req.button = getElem('[data-screen-name="' + req.peerAlias + '"]').find('.unfollow');
        req.button
            .text(polyglot.t('Follow'))
            .removeClass('unfollow')
            .addClass('follow')
            .off('click')
            .on('click', {peerAlias: req.peerAlias}, clickFollow)
        ;
    }
}

function clickFollow(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!defaultScreenName) {
        alertPopup({
            //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
            txtMessage: polyglot.t('You have to log in to follow users.')
        });
        return;
    }

    var peerAlias = (event.data && event.data.peerAlias) ? event.data.peerAlias
        : $(event.target).closest('[data-screen-name]').attr('data-screen-name');
    var content = $('#following-config-modal-template').children().clone(true);

    content.closest('.following-config-modal-content').attr('data-screen-name', peerAlias);
    fillElemWithTxt(content.find('.following-config-method-message'),
        polyglot.t('select_way_to_follow_@', {alias: peerAlias}), {markout: 'apply'});
    content.find('.following-screen-name b').text(peerAlias);

    openModal({
        classBase: '.prompt-wrapper',  // FIXME it will be modal with advanced following set up in future
        classAdd: 'following-config-modal',
        content: content,
        title: polyglot.t('Following config')
    });
}

function clickUnfollow(event) {
    event.preventDefault();
    event.stopPropagation();

    var peerAlias = (event.data && event.data.peerAlias) ? event.data.peerAlias
        : $(event.target).closest('[data-screen-name]').attr('data-screen-name');

    confirmPopup({
        txtMessage: polyglot.t('confirm_unfollow_@', {alias: peerAlias}),
        cbConfirm: function (peerAlias) {
            unfollow(peerAlias,
                function(req) {
                    $('.mini-profile .following-count').text(followingUsers.length - 1);
                    $('.wrapper .postboard .post').each(function() {
                        var elem = $(this);
                        if ((elem.find('[data-screen-name="' + req.peerAlias + '"]').length
                            && !elem.find(".post-rt-by .open-profile-modal").text())
                            || elem.find(".post-rt-by .open-profile-modal").text() === '@' + req.peerAlias)
                                elem.remove();
                    }); // FIXME also need to check list of pending posts to remove from there
                    toggleFollowButton({peerAlias: req.peerAlias});
                    var followingList = getElem('.following-own-modal .following-list');
                    if (followingList.length)
                        followingList.find('li[data-peer-alias="' + req.peerAlias + '"]').remove();
                }, {peerAlias: peerAlias}
            );
        },
        cbConfirmReq: peerAlias
    });
}

function setFollowingMethod(event) {
    event.preventDefault();
    event.stopPropagation();

    var button = $(event.target);
    var peerAlias = button.closest('.following-config-modal-content').attr('data-screen-name');

    follow(peerAlias, button.hasClass('private') ? false : true,
        function(req) {
            $('.mini-profile .following-count').text(followingUsers.length - 1);
            setTimeout(requestTimelineUpdate, 1000, 'latest', postsPerRefresh, [req.peerAlias], promotedPostsOnly);
            toggleFollowButton({peerAlias: req.peerAlias, toggleUnfollow: req.toggleUnfollow});
            var followingList = getElem('.following-own-modal .following-list');
            if (followingList.length)
                addPeerToFollowingList(followingList, req.peerAlias);
        }, {peerAlias: peerAlias, toggleUnfollow: true}
    );
}

function followingListPublicCheckbox(event) {
    event.preventDefault();
    event.stopPropagation();

    var tickSelection = function (req) {
        if (req.isPublic === req.wasPublic) return;

        var elem = $('.mini-profile-info[data-screen-name="' + req.peerAlias + '"] .public-following');
        elem.toggleClass('private');
        if (!req.isPublic)
            elem.text(polyglot.t('Private'));
        else
            elem.text(polyglot.t('Public'));

        //console.log('set following method of @' + peerAlias + ' for ' + isPublic);
        follow(req.peerAlias, req.isPublic);
    };
    var elem = $(event.target);
    var peerAlias = elem.closest('.mini-profile-info').attr('data-screen-name');
    var wasPublic = !elem.hasClass('private');

    confirmPopup({
        txtMessage: polyglot.t('select_way_to_follow_@', {alias: peerAlias}),
        txtConfirm: polyglot.t('Public'),
        cbConfirm: tickSelection,
        cbConfirmReq: {isPublic: true, wasPublic: wasPublic, peerAlias: peerAlias},
        txtCancel: polyglot.t('Private'),
        cbCancel: tickSelection,
        cbCancelReq: {isPublic: false, wasPublic: wasPublic, peerAlias: peerAlias}
    });
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

        setPostImagePreview(postExpandedContent, originalPost.find('a[rel^="nofollow"]'));

        postExpandedContent.slideDown('fast');

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

function postReplyClick(event) {
    if (!defaultScreenName) {
        event.stopPropagation();
        alertPopup({
            //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
            txtMessage: polyglot.t('You have to log in to post replies.')
        });
        return;
    }

    var post = $(this).closest('.post');
    if (!post.hasClass('original'))
        replyInitPopup(event, $.evalJSON(post.find('.post-data').attr('data-userpost')));
    else {
        if (!post.closest('.post.open').length)
            postExpandFunction(event, post);
        composeNewPost(event, post.find('.post-area-new'));
    }

    event.stopPropagation();
}

// Expande Área do Novo post
function composeNewPost(e, postAreaNew) {
    e.stopPropagation();
    if (!postAreaNew.hasClass('open')) {
        postAreaNew.addClass('open');
        //se o usuário clicar fora é pra fechar
        postAreaNew.clickoutside(unfocusPostAreaNew);

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
        poseTextareaPostTools(textArea);
    }
    if (!postAreaNew.find('textarea:focus').length)
        postAreaNew.find('textarea:last').focus();
}

function poseTextareaPostTools(event) {
    if (event.jquery)
        var textArea = event;
    else
        var textArea = $(event.target);

    posePostPreview(textArea);
    poseTextareaEditBar(textArea);
}

function posePostPreview(textArea) {
    if (!$.Options.postPreview.val)
        return;

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
        fillElemWithTxt(postPreview.show(), textArea[0].value);
    else
        postPreview.hide();
    textArea.before(postPreview);
}

function poseTextareaEditBar(textArea) {
    var editBar = textArea.siblings('.post-textarea-edit-bar');
    if (!editBar.length) {
        editBar = twister.tmpl.postTextareaEditBar.clone(true)
            .css('margin-left', textArea.css('margin-left'))
            .css('margin-right', textArea.css('margin-right'))
        ;
        editBar.find('.shorten-uri').text(polyglot.t('shorten_URI'));
    }
    editBar.insertAfter(textArea).show();
}

// Reduz Área do Novo post
function unfocusPostAreaNew() {
    var postAreaNew = $(this).removeClass('open');
    postAreaNew.find('#post-preview').slideUp('fast');
    postAreaNew.find('.post-textarea-edit-bar').hide();
}

function checkPostForMentions(post, mentions, max) {
    return new RegExp('^.{0,' + max.toString() + '}(?:' + mentions.trim().replace(/ /g, '|') + ')').test(post);
}

var splitedPostsCount = 1; // FIXME it could be property of future textAreaInput and composeNewPost united thing; currently stuff is hell
var usePostSpliting = false;

function replyTextInput(event) {
    var textArea = $(event.target);
    var textAreaForm = textArea.closest('form');
    if (textAreaForm.length) {
        if ($.Options.unicodeConversion.val !== 'disable')
            textArea.val(convert2Unicodes(textArea.val(), textArea));

        if (usePostSpliting && !textArea.closest('.directMessages').length) {
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
                                setTextcompleteOnElement(tas[i], getMentionsForAutoComplete());
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

        if ($.Options.postPreview.val) {
            if (textArea[0].value.length)
                fillElemWithTxt(textAreaForm.find('#post-preview').show(), textArea[0].value);
            else
                textAreaForm.find('#post-preview').html('').slideUp('fast');
        }
    }

    function getPostSplitingPML() {
        var MaxPostSize = $.Options.MaxPostEditorChars.val;
        if (splitedPostsCount > 1) {
            var pml = MaxPostSize - (i+1).toString().length - splitedPostsCount.toString().length - 4;

            // if mention exists, we shouldn't add it while posting.
            if (typeof reply_to !== 'undefined' &&
                !checkPostForMentions(tas[i].value, reply_to, pml -reply_to.length)) {
                pml -= reply_to.length;
            }
        } else
            var pml = MaxPostSize;
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
        var textAreaForm = textArea.closest('form');
        if (textAreaForm.length) {
            var remainingCount = textAreaForm.find('.post-area-remaining');
            var c = replyTextCountRemaining(ta);

            if (usePostSpliting && !textArea.closest('.directMessages').length && splitedPostsCount > 1)
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
            if (!disable && c >= 0 && c < $.Options.MaxPostEditorChars.val &&
                 textArea.val() !== textArea.attr('data-reply-to')) {
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

    var MaxPostSize = $.Options.MaxPostEditorChars.val;
    if (usePostSpliting && !textArea.closest('.directMessages').length && splitedPostsCount > 1) {
        c = MaxPostSize - ta.value.length - (textArea.closest('form').find('textarea').index(ta) + 1).toString().length - splitedPostsCount.toString().length - 4;
        var reply_to = textArea.attr('data-reply-to');
        if (typeof reply_to !== 'undefined' &&
            !checkPostForMentions(ta.value, reply_to, MaxPostSize -c -reply_to.length))
                c -= reply_to.length;
    } else
        c = MaxPostSize - ta.value.length;

    return c;
}

function replyTextKeySend(event) {
    if (event.keyCode === 13) {
        if ((!event.metaKey && !event.ctrlKey && $.Options.keysSend.val === 'enter' &&
                $('.dropdown-menu').css('display') === 'none')
            || ((event.metaKey || event.ctrlKey) && $.Options.keysSend.val === 'ctrlenter')) {
                var textArea = $(event.target);
                var textAreaForm = textArea.closest('form');
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
    var btnPostSubmit;

    if (e instanceof $) {
        btnPostSubmit = e;
        //check if previous part was sent...
        if (oldLastPostId === lastPostId) {
            setTimeout(postSubmit, 1000, btnPostSubmit, oldLastPostId);
            return;
        }
    } else {
        e.stopPropagation();
        e.preventDefault();
        btnPostSubmit = $(this);
    }
    $.MAL.disableButton(btnPostSubmit);

    var textArea = btnPostSubmit.closest('.post-area-new').find('textarea');

    textArea.siblings('#post-preview').slideUp('fast');

    var postData = btnPostSubmit.closest('.post-data');
    if (!postData.length) {
        postData = btnPostSubmit.closest('.modal-content').find('.post-data');
    }

    if (btnPostSubmit.hasClass('with-reference')) {
        var doSubmitPost = function (postText, postData) {
            newRtMsg(postData, postText);
        }
    } else {
        if (splitedPostsCount > 1) {
            if (textArea.length < splitedPostsCount) {
                //current part will be sent as reply to the previous part...
                postData = $('<div data-id="' + lastPostId + '" data-screen-name="' + defaultScreenName + '"></div>');
            }
        }

        var doSubmitPost = function (postText, postData) {
            newPostMsg(postText, postData);
        }
    }

    if (textArea.length <= 1) {
        if (splitedPostsCount > 1) {
            var postText = '';
            var reply_to = textArea.attr('data-reply-to');
            var val = textArea.val();
            if (typeof reply_to === 'undefined' || checkPostForMentions(val, reply_to, $.Options.MaxPostEditorChars.val))
                postText = val + ' (' + splitedPostsCount.toString() + '/' + splitedPostsCount.toString() + ')';
            else
                postText = reply_to + val + ' (' + splitedPostsCount.toString() + '/' + splitedPostsCount.toString() + ')';

            doSubmitPost(postText, postData);
        } else
            doSubmitPost(textArea.val(), postData);

        splitedPostsCount = 1;
    } else {
        var postText = '';
        var reply_to = textArea.attr('data-reply-to');
        var val = textArea[0].value;
        if (typeof reply_to === 'undefined' || checkPostForMentions(val, reply_to, $.Options.MaxPostEditorChars.val))
            postText = val + ' (' + (splitedPostsCount - textArea.length + 1).toString() + '/' + splitedPostsCount.toString() + ')';
        else
            postText = reply_to + val + ' (' + (splitedPostsCount - textArea.length + 1).toString() + '/' + splitedPostsCount.toString() + ')';

        $(textArea[0]).remove();

        doSubmitPost(postText, postData);
        setTimeout(postSubmit, 1000, btnPostSubmit, lastPostId);

        return;
    }

    if (btnPostSubmit.closest('.prompt-wrapper').length)
        closePrompt(btnPostSubmit);
    else {
        textArea.val('').attr('placeholder', polyglot.t('Your message was sent!'));
        btnPostSubmit.closest('form').find('.post-area-remaining').text('');

        if (btnPostSubmit.closest('.post-area,.post-reply-content')) {
            $('.post-area-new').removeClass('open').find('textarea').blur();
        };
        textArea.data('unicodeConversionStack', []);
        textArea.data('disabledUnicodeRules', []);
    }
}

function retweetSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    var prompt = $(event.target).closest('.prompt-wrapper');

    newRtMsg(prompt.find('.post-data'));
    closePrompt(prompt);
}

function favSubmit(event) {
    event.preventDefault();
    event.stopPropagation();

    var prompt = $(event.target).closest('.prompt-wrapper');
    var priv = (event.target.className.indexOf('private') > -1);

    newFavMsg(prompt.find('.post-data'), priv);
    closePrompt(prompt);
}

function changeStyle() {
    var style, profile, menu;
    var theme = $.Options.theme.val;

    if (theme === 'nin') {
        style = 'theme_nin/css/style.css';
        profile = 'theme_nin/css/profile.css';
        $.getScript('theme_nin/js/theme_option.js');
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
        $('#modals-minimized').addClass('w1200');
    } else if (width < 1200 && wrapper.hasClass('w1200')) {
        wrapper.removeClass('w1200');
        $('.userMenu').removeClass('w1200');
        $('.module.who-to-follow').detach().insertAfter($('.module.mini-profile'));
        $('.module.twistday-reminder').detach().insertAfter($('.module.toptrends'));
        $('#modals-minimized').removeClass('w1200');
    }
}

function initInterfaceCommon() {
    twister.tmpl.modalComponentWarn = extractTemplate('#template-inline-warn');
    twister.tmpl.modalComponentWarn.find('.close').on('click',
        function(event) {
            var i = $(event.target).closest('.modal-wrapper').attr('data-modal-id');

            if (!i || !twister.modal[i]) return;

            var modal = twister.modal[i];

            modal.self.find('.inline-warn').hide();

            modal.content.outerHeight(modal.self.height() - modal.self.find('.modal-header').outerHeight());

            var windowHeight = $(window).height();
            if (modal.self.outerHeight() > windowHeight) {
                modal.content.outerHeight(modal.content.outerHeight() - modal.self.outerHeight() + windowHeight);
                modal.self.outerHeight(windowHeight);
                modal.self.css('margin-top', - windowHeight / 2);
            }
        }
    );
    twister.tmpl.modalComponentWarn.find('.options .never-again').on('change',
        function(event) {
            $.Options.set('skipWarn' + $(event.target).closest('.inline-warn')
                .attr('data-warn-name'), event.target.checked);  // e.g. 'skipWarnFollowersNotAll'
        }
    );
    twister.tmpl.commonDMsList = extractTemplate('#template-direct-messages-list');
    twister.tmpl.uriShortenerMC = extractTemplate('#template-uri-shortener-modal-content');
    twister.tmpl.uriShortenerMC
        .find('.shorten-uri').on('click',
            {cbFunc:
                function (long, short) {
                    if (short) {
                        var urisList = getElem('.uri-shortener-modal .uris-list');
                        if (urisList.length) {
                            var item = urisList.find('.short:contains("' + short + '")').closest('li');
                            if (!item.length) {
                                item = twister.tmpl.uriShortenerUrisListItem.clone(true);
                                item.find('.short').text(short);
                                item.find('.long').text(long).attr('href', long);
                                item.appendTo(urisList);
                            }
                            urisList.children('.highlighted').removeClass('highlighted');
                            item.addClass('highlighted');
                            var mc = urisList.closest('.modal-content');
                            mc.scrollTop(item.offset().top - mc.offset().top + mc.scrollTop());
                        }
                        showURIPair(long, short);
                    } else
                        showURIShortenerErrorRPC(short);
                }
            },
            function (event) {
                muteEvent(event);
                openRequestShortURIForm(event);
            }
        )
        .siblings('.clear-cache').on('click',
            function () {
                confirmPopup({
                    txtMessage: polyglot.t('confirm_uri_shortener_clear_cache'),
                    cbConfirm: function () {
                        twister.URIs = {};
                        $.localStorage.set('twistaURIs', twister.URIs);
                        getElem('.uri-shortener-modal .uris-list').empty();
                    }
                });
            }
        )
    ;
    twister.tmpl.uriShortenerUrisListItem = extractTemplate('#template-uri-shortener-uris-list-item')
        .on('click', function (event) {
            var elem = $(event.target);
            elem.closest('.uris-list').children('.highlighted').removeClass('highlighted');
            elem.addClass('highlighted');
        })
    ;

    getElem('.modal-wrapper .modal-close, .modal-wrapper .modal-blackout').on('click', closeModal);

    $('.minimize-modal').on('click', function (event) {
        minimizeModal($(event.target).closest('.modal-wrapper'));
    });

    $('.modal-back').on('click', function() {history.back();});

    $('.prompt-close').on('click', closePrompt);

    getElem('button.follow', true).on('click', clickFollow);

    $('.following-config-method-buttons .public-following').on('click', function(event) {
        setFollowingMethod(event);
        closePrompt(event);
    });

    $('.module.mini-profile .open-followers').on('mouseup', {route: '#followers'}, routeOnClick);

    $('.post-text').on('click', 'a', muteEvent);
    $('.post-reply').on('click', postReplyClick);
    $('.post-propagate').on('click', reTwistPopup);
    $('.post-favorite').on('click', favPopup);
    $('.userMenu-config').clickoutside(closeThis.bind($('.config-menu')));
    $('.userMenu-config-dropdown').on('click', dropDownMenu);
    $('#post-template.module.post').on('click', function(event) {
        if (event.button === 0 && window.getSelection() == 0)
            postExpandFunction(event, $(this));
    });
    $('.post-area-new')
        .on('click', function(e) {composeNewPost(e, $(this));})
        .clickoutside(unfocusPostAreaNew)
        .children('textarea')
            .on({
                'focus': poseTextareaPostTools,
                'input': replyTextInput,  // input event fires in modern browsers (IE9+) on any changes in textarea (and copypasting with mouse too)
                'input focus': replyTextUpdateRemaining,
                'keyup': replyTextKeySend
            })
    ;
    $('.post-submit').on('click', postSubmit);
    $('.modal-propagate').on('click', retweetSubmit);
    $('.modal-fav-public').on('click', favSubmit);
    $('.modal-fav-private').on('click', favSubmit);
    $('.expanded-content .show-more').on('mouseup',
        {feeder: '.module.post.original.open .module.post.original .post-data'}, handleClickOpenConversation)
        .on('click', muteEvent)  // to prevent post collapsing
    ;
    if ($.Options.unicodeConversion.val === 'disable')
        $('.undo-unicode').on('click', undoLastUnicode).css('display', 'none');
    else
        $('.undo-unicode').on('click', undoLastUnicode);

    getElem('.open-profile-modal', true)
        .on('click', muteEvent).on('mouseup', handleClickOpenProfileModal);
    //$('.open-hashtag-modal').on('click', openHashtagModal);
    //$('.open-following-modal').on('click', openFollowingModal);
    $('.userMenu-connections a').on('click', openMentionsModal);
    $('.mentions-from-user').on('click', openMentionsModal);
    $('.userMenu-favs a').on('click', openFavsModal);
    $('.favs-from-user').on('click', openFavsModal);

    getElem('.latest-activity', true).on('mouseup',
        {feeder: '.latest-activity'}, handleClickOpenConversation);

    replaceDashboards();
    $(window).resize(replaceDashboards);

    $('.profile-card .profile-bio .group-description')
        .on('focus', function (event) {
            $(event.target)
                .siblings('.save').show()
                .siblings('.cancel').show()
            ;
        })
        .on('input',
            {parentSelector: '.profile-bio', enterSelector: '.save'}, inputEnterActivator)
        .siblings('.save').on('click', function (event) {
            var elemEvent = $(event.target);
            var descElem = elemEvent.siblings('.group-description');

            groupMsgSetGroupDescription(elemEvent.closest('.profile-card').attr('data-screen-name'),
                descElem.val().trim(),
                function(req) {
                    req.descElem.attr('val-origin', req.descElem.val().trim())
                        .siblings('.save').hide()
                        .siblings('.cancel').hide()
                    ;
                }, {descElem: descElem}
            );
        })
        .siblings('.cancel').on('click', function (event) {  // FIXME it would be nice to bind some 'clickoutside' event instead and remove cancel button, but current implementation of that doesn't unbind events when element dies
            var descElem = $(event.target).hide()
                .siblings('.save').hide()
                .siblings('.group-description')
            ;

            descElem.val(descElem.attr('val-origin'));
        })
    ;

    $('.tox-ctc').on('click', promptCopyAttrData);
    $('.bitmessage-ctc').on('click', promptCopyAttrData);

    $('.uri-shortener').on('mouseup', {route: '#/uri-shortener'}, routeOnClick);

    $('.updates-check-client').text(polyglot.t('updates_check_client'))
        .on('mouseup', function (event) {
            muteEvent(event);
            checkUpdatesClient(true);
        }
    );

    $('.post-area-new textarea')
        .on('focus',
            function (event) {
                twister.focus.textareaPostCur = $(event.target);
                if ($.fn.textcomplete) {  // because some pages don't have that. // network.html
                    event.data = {req: getMentionsForAutoComplete};
                    setTextcompleteOnEventTarget(event);
                }
            }
        )
        .on('focusout',
            function (event) {
                twister.focus.textareaPostCur = undefined;
                twister.focus.textareaPostPrev = $(event.target);
                if ($.fn.textcomplete)  // because some pages don't have that. // network.html
                    unsetTextcompleteOnEventTarget(event);
            }
        )
    ;
}

function extractTemplate(selector) {
    return $(selector).appendTo(twister.tmpl.root).children();
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

function elemFitNextIntoParentHeight(elem) {
    var parent = elem.parent();
    var elemNext = elem.nextAll();
    var elemNextHeight = parent.actual('height') - elem.actual('outerHeight', {includeMargin: true});

    if (elemNextHeight > 0)  // FIXME actually it's here because of nin theme's two vertical columns layout of profile modal
        elemNext.outerHeight(elemNextHeight);
    else
        elemNext.outerHeight(parent.actual('outerHeight'));
}

function inputEnterActivator(event) {
    var elemEvent = $(event.target);
    elemEvent.closest(event.data.parentSelector).find(event.data.enterSelector)
        .attr('disabled', elemEvent.val().trim() === '');
}

function pasteToTextarea(ta, p) {
    if (!ta || typeof ta.val !== 'function') return;

    var s = ta.val();
    var c = ta.caret();

    if (s.length) {
        if (c < 1)
            ta.val(p + (s[c].match(/\s/) ? '' : ' ') + s);
        else if (c < s.length)
            ta.val(s.slice(0, c) + (s[c - 1].match(/\s/) ? '' : ' ') + p + (s[c].match(/\s/) ? '' : ' ') + s.slice(c));
        else
            ta.val(s + (s[c - 1].match(/\s/) ? '' : ' ') + p + ' ');
    } else
        ta.val(p + ' ');

    ta.focus().caret(c + p.length + ((ta.val().length - s.length - p.length) > 1 ? 2 : 1));
}

function setTextcompleteOnEventTarget(event) {
    // cursor has not set yet and we need to wait 100ms to skip global click event
    setTimeout(setTextcompleteOnElement, 100, event.target,
        typeof event.data.req === 'function' ? event.data.req() : event.data.req);
}

function setTextcompleteOnElement(elem, req) {
    elem = $(elem);
    elem.textcomplete(req, {
        appendTo: (elem.closest('.dashboard').length) ? elem.parent() : $('body'),
        listPosition: setTextcompleteDropdownListPos
    });
}

function unsetTextcompleteOnEventTarget(event) {
    $(event.target).textcomplete('destroy');
}

// following workaround function is for calls from $.fn.textcomplete only
// we need this because currently implementation of caret position detection is way too imperfect
function setTextcompleteDropdownListPos(position) {
    position = this._applyPlacement(position);

    if (this.option.appendTo.closest('.dashboard').length > 0) {
        position.position = 'fixed';
        position.top = (parseFloat(position.top) - window.pageYOffset).toString() + 'px';
    } else
        position.position = 'absolute';

    this.$el.css(position);

    return this;
}

$(document).ready(function () {
    if ($.localStorage.isSet('twistaURIs'))
        twister.URIs = $.localStorage.get('twistaURIs');
    twister.html.blanka.appendTo('body').hide();
    twister.tmpl.loginMC = extractTemplate('#template-login-modal');
    twister.tmpl.loginMC.find('.login').on('click', handleClickAccountLoginLogin);
    var module = twister.tmpl.loginMC.closest('.create-account');
        module.find('.alias').on('input', handleInputAccountCreateSetReq);
        module.find('.check').on('click', handleClickAccountCreateCheckReq);
        module.find('.create').on('click', handleClickAccountCreateCreate);
    module = twister.tmpl.loginMC.closest('.import-account');
        module.find('.secret-key').on('input', handleInputAccountImportSetReq);
        module.find('.alias').on('input', handleInputAccountImportSetReq);
        module.find('.import').on('click', handleClickAccountImportImport);
    twister.tmpl.followersList = extractTemplate('#template-followers-list');
    twister.tmpl.followersPeer = extractTemplate('#template-followers-peer');
    twister.tmpl.followingList = extractTemplate('#template-following-list');
    twister.tmpl.followingPeer = extractTemplate('#template-following-peer');
    twister.tmpl.whoTofollowPeer = extractTemplate('#template-whotofollow-peer');
    twister.tmpl.commonDMsListItem = extractTemplate('#template-direct-messages-list-item')
        .on('mouseup', function (event) {
            event.data = {route:
                $.MAL.dmchatUrl($(event.target).closest('.module').attr('data-screen-name'))};
            routeOnClick(event);
        })
    ;
    twister.tmpl.shortenUri = extractTemplate('#template-shorten-uri')
        .on('click',
            {cbFunc:
                function (uriLong, uriShort, textArea) {
                    if (uriShort)
                        pasteToTextarea(textArea, uriShort);
                    else
                        showURIShortenerErrorRPC(uriShort);
                }
            },
            function (event) {
                muteEvent(event);

                var postAreaNew = $(event.target).closest('.post-area-new');
                var textArea = postAreaNew.find(twister.focus.textareaPostCur);
                if (!textArea.length) textArea = postAreaNew.find(twister.focus.textareaPostPrev);
                if (!textArea.length) textArea = postAreaNew.find('textarea:last');

                event.data.cbReq = textArea;
                if (postAreaNew.closest('.directMessages').length)
                    confirmPopup({
                        txtMessage: polyglot.t('shorten_URI_its_public_is_it_ok'),
                        txtConfirm: polyglot.t('shorten_URI'),
                        cbConfirm: openRequestShortURIForm,
                        cbConfirmReq: event
                    });
                else if ($.mobile && postAreaNew.closest('.dm-form').length) {
                    if (confirm(polyglot.t('shorten_URI_its_public_is_it_ok')))
                        openRequestShortURIForm(event);
                } else
                    openRequestShortURIForm(event);
            }
        )
    ;
    twister.tmpl.postTextareaEditBar = extractTemplate('#template-post-textarea-edit-bar')
        .append(twister.tmpl.shortenUri.clone(true))
    ;
    twister.tmpl.postRtReference = extractTemplate('#template-post-rt-reference')
        .on('mouseup', {feeder: '.post-rt-reference'}, handleClickOpenConversation)
        .on('click', muteEvent)  // to prevent post expanding or collapsing
    ;
    twister.tmpl.postRtBy = extractTemplate('#template-post-rt-by');
    twister.tmpl.profileShowMoreFollowers = extractTemplate('#template-profile-show-more-followers');

    var path = window.location.pathname;
    var page = path.split("/").pop();
    if (page.indexOf('network.html') === 0) {
        initInterfaceNetwork();
    } else if (page.indexOf('options.html') === 0) {
        initInterfaceCommon();
        $.Options.initControls();
    } else if (page.indexOf("profile-edit.html") === 0) {
        initProfileEdit();
    }

    changeStyle();

    // need to play something once in result of click on Firefox to be able to play sound notifications
    // FXIME it's just workaround of FF's bug, see https://bugzilla.mozilla.org/show_bug.cgi?id=1197631
    $('body').on('click', function () {
        playSound('player', $.Options.sndMention.val, 0.001);
        setTimeout(function () {$('body').off('click');}, 10000);  // sound must be played before unbinding
    });
});
