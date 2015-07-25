// twister_directmsg.js
// 2013 Miguel Freitas
//
// Handle direct messages modal

function requestDMsnippetList(dmThreadList) {
    var followList = [];
    for (var i = 0; i < followingUsers.length; i++)
        followList.push({username:followingUsers[i]});
    for (var i = 0; i < groupChatAliases.length; i++)
        followList.push({username:groupChatAliases[i]});

    twisterRpc('getdirectmsgs', [defaultScreenName, 1, followList],
        function(req, ret) {processDMsnippet(ret, dmThreadList);}, dmThreadList,
        function(req, ret) {console.log('ajax error:' + ret);}, null
    );
}

function processDMsnippet(dmUsers, dmThreadList) {
    dmThreadList.empty();

    for (var u in dmUsers) {
        // convert snipped to html and add it to date-sorted list
        var dmItem = dmDataToSnippetItem(dmUsers[u][0], u);
        var timeDmItem = parseInt(dmItem.attr('data-time'));
        var existingItems = dmThreadList.children();
        for (var j = 0; j < existingItems.length; j++) {
            var streamItem = existingItems.eq(j);
            var timeExisting = streamItem.attr('data-time');
            if (typeof timeExisting === 'undefined' || timeDmItem > parseInt(timeExisting)) {
                // this post in stream is older, so post must be inserted above
                streamItem.before(dmItem);
                break;
            }
        }
        if (j === existingItems.length)
            dmThreadList.append(dmItem);
    }
    $.MAL.dmThreadListLoaded();
}

function requestDmConversationModal(postboard, dm_screenname) {
    if (postboard.is('html *')) {
        requestDmConversation(postboard, dm_screenname);
        setTimeout(requestDmConversationModal, 1000, postboard, dm_screenname);
    }
}

function requestDmConversation(postboard, dm_screenname) {
    var since_id = undefined;

    var oldItems = postboard.children();
    if (oldItems.length)
        since_id = parseInt(oldItems.eq(oldItems.length - 1).attr('data-id'));

    var userDmReq = [{username: dm_screenname}];
    if (typeof since_id !== 'undefined')
        userDmReq[0].since_id = since_id;

    var count = 100;
    twisterRpc('getdirectmsgs', [defaultScreenName, count, userDmReq],
        function(args, ret) {processDmConversation(args.postboard, args.dm_screenname, ret);},
            {postboard: postboard, dm_screenname: dm_screenname},
        function(arg, ret) {
            var msg = (ret.message) ? ret.message : ret;
            alert(polyglot.t('ajax_error', {error: msg}));
        }, null
    );
}

function processDmConversation(postboard, dm_screenname, dmData) {
    var lastId = undefined;

    if (dmData[dm_screenname]) {
        var dmList = dmData[dm_screenname];
        if (dmList.length) {
            for (var i = 0; i < dmList.length; i++) {
                var dmItem = dmDataToConversationItem(dmList[i], defaultScreenName, dm_screenname)
                    .attr('data-id', dmList[i].id)
                    .appendTo(postboard)
                ;
                lastId = dmList[i].id;
            }
            $.MAL.dmChatListLoaded(postboard);
        }
    }
    if (typeof lastId !== 'undefined')
        resetNewDMsCountForUser(dm_screenname, lastId);
}

function directMsgSubmit(e) {
    e.stopPropagation();
    e.preventDefault();

    var replyText = $(this).closest('.post-area-new').find('textarea');

    replyText.siblings('#post-preview').hide();

    newDirectMsg(replyText.val(), $('.directMessages').attr('data-dm-screen-name'));

    replyText.val('');
}

function newDirectMsg(msg,  dm_screenname) {
    if (typeof lastPostId !== 'undefined') {
        var paramsOrig = [defaultScreenName, lastPostId + 1, dm_screenname, msg];
        var paramsOpt = paramsOrig;
        var copySelf = $.Options.dmCopySelf.val === 'enable';
        if (copySelf && dm_screenname[0] !== '*')
            paramsOpt = paramsOrig.concat(true)

        twisterRpc('newdirectmsg', paramsOpt,
            function(arg, ret) {
                incLastPostId();
                if (arg.copySelf)
                    incLastPostId();
            }, {copySelf: copySelf},
            function(arg, ret) {
                // fallback for older twisterd (error: no copy_self parameter)
                twisterRpc('newdirectmsg', arg.paramsOrig,
                    function(arg, ret) {incLastPostId();}, null,
                    function(arg, ret) {
                        var msg = (ret.message) ? ret.message : ret;
                        alert('Ajax error: ' + msg);
                    }, null
                );
            }, {paramsOrig: paramsOrig}
        );
    } else
        alert(polyglot.t('Internal error: lastPostId unknown (following yourself may fix!)'));
}

// dispara o modal de direct messages
function directMessagesPopup() {
    if (!defaultScreenName) {
      alert(polyglot.t('You have to log in to use direct messages.'));
      return;
    }

    modal = openModal({
        classAdd: 'directMessages',
        content: $('.direct-messages-template').children().clone(true),
        title: polyglot.t('Direct Messages')
    });

    requestDMsnippetList(modal.content.find('.direct-messages-list'));

    modal.self.find('.mark-all-as-read')
        .css('display', 'inline')
        .attr('title', polyglot.t('Mark all as read'))
        .on('click', function() {
            for (var user in _newDMsPerUser) {
                _newDMsPerUser[user] = 0;
            }
            saveDMsToStorage();
            $.MAL.updateNewDMsUI(getNewDMsCount());
        })
    ;
}

function openDmWithUserModal(dm_screenname) {
    if (!defaultScreenName) {
        alert(polyglot.t('You have to log in to use direct messages.'));
        return;
    }

    modal = openModal({
        classAdd: 'directMessages',
        content: $('.messages-thread-template').children().clone(true),
        title: polyglot.t('direct_messages_with', {username: '<span>' + dm_screenname + '</span>'})
    });

    modal.self.attr('data-dm-screen-name', dm_screenname);

    if (dm_screenname.length && dm_screenname[0] === '*')
        getGroupChatName(dm_screenname, modal.self.find('.modal-header h3 span'));
    else
        getFullname(dm_screenname, modal.self.find('.modal-header h3 span'));

    requestDmConversationModal(modal.self.find('.direct-messages-thread').empty(), dm_screenname);

    $('.dm-form-template').children().clone(true)
        .addClass('open').appendTo(modal.content).fadeIn('fast');
}

function initInterfaceDirectMsg() {
    $('.direct-messages').attr('href','#directmessages');
    $('.userMenu-messages a').attr('href','#directmessages');

    $('#dm-snippet-template').on('click', function() {
        window.location.hash = '#directmessages?user=' + $(this).attr('data-dm-screen-name');
    });

    $('.dm-submit').on('click', directMsgSubmit);
    $('.direct-messages-with-user').on('click', function() {
        window.location.hash = '#directmessages?user=' +
            $(this).closest('[data-screen-name]').attr('data-screen-name');
    });
}

