// twister_directmsg.js
// 2013 Miguel Freitas
//
// Handle direct messages modal

var _groupMsgInviteToGroupQueue = [];

function requestDMsnippetList(dmThreadList, forGroup) {
    var followList = [];
    for (var i = 0; i < followingUsers.length; i++)
        followList.push({username: followingUsers[i]});
    for (var i = 0; i < groupChatAliases.length; i++)
        followList.push({username: groupChatAliases[i]});

    twisterRpc('getdirectmsgs', [defaultScreenName, 1, followList],
        function(req, ret) {processDMsnippet(ret, req.dmThreadList, req.forGroup);},
            {dmThreadList: dmThreadList, forGroup: forGroup},
        function(req, ret) {console.log('ajax error:' + ret);}, null
    );
}

function processDMsnippet(dmUsers, dmThreadList, forGroup) {
    dmThreadList.empty();

    for (var u in dmUsers) {
        if ((forGroup && u[0] !== '*') || (!forGroup && u[0] === '*'))
            continue;

        // convert snipped to html and add it to date-sorted list
        var dmItem = dmDataToSnippetItem(dmUsers[u][0], u);
        if (_newDMsPerUser[u] > 0) {
            dmItem.addClass('new')
                .find('.messages-qtd').text(_newDMsPerUser[u]).show();
        }
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

function requestDmConversationModal(postboard, peerAlias) {
    if (!isModalWithElemExists(postboard))
        return;

    requestDmConversation(postboard, peerAlias);
    setTimeout(requestDmConversationModal, 1000, postboard, peerAlias);
}

function requestDmConversation(postboard, peerAlias) {
    var since_id = undefined;

    var oldItems = postboard.children();
    if (oldItems.length)
        since_id = parseInt(oldItems.eq(oldItems.length - 1).attr('data-id'));

    var userDmReq = [{username: peerAlias}];
    if (typeof since_id !== 'undefined')
        userDmReq[0].since_id = since_id;

    var count = 100;
    twisterRpc('getdirectmsgs', [defaultScreenName, count, userDmReq],
        function(req, ret) {processDmConversation(req.postboard, req.peerAlias, ret);},
            {postboard: postboard, peerAlias: peerAlias},
        function(req, ret) {
            var msg = (ret.message) ? ret.message : ret;
            alert(polyglot.t('ajax_error', {error: msg}));
        }
    );
}

function processDmConversation(stream, peerAlias, posts) {
    if (!isModalWithElemExists(stream))
        return;

    var streamItems = stream.children();
    var streamPostsIDs = [];
    var newPosts = 0;

    for (var i = 0; i < streamItems.length; i++) {
        streamPostsIDs.push(parseInt(streamItems.eq(i).attr('data-id')));
    }

    if (posts[peerAlias] && posts[peerAlias].length) {
        for (var i = 0; i < posts[peerAlias].length; i++) {
            if (streamPostsIDs.indexOf(posts[peerAlias][i].id) === -1) {
                var lastPostID = posts[peerAlias][i].id;
                newPosts++;
                postToElemDM(posts[peerAlias][i], defaultScreenName, peerAlias)
                    .attr('data-id', lastPostID)
                    .appendTo(stream)
                ;
                streamPostsIDs.push(lastPostID);
            }
        }
        $.MAL.dmChatListLoaded(stream);
    }

    if (newPosts) {
        resetNewDMsCountForUser(peerAlias, lastPostID);

        if (getHashOfMinimizedModalWithElem(stream)) {
            $.MAL.soundNotifyDM();
            _newDMsPerUser[peerAlias] += newPosts;
            if (peerAlias[0] === '*')
                $.MAL.updateNewGroupDMsUI(getNewGroupDMsCount());
            else
                $.MAL.updateNewDMsUI(getNewDMsCount());

            if (!$.hasOwnProperty('mobile') && $.Options.showDesktopNotifDMs.val === 'enable')
                $.MAL.showDesktopNotification({
                    body: peerAlias[0] === '*' ?
                        polyglot.t('You got') + ' ' + polyglot.t('new_group_messages', newPosts) + '.'
                        : polyglot.t('You got') + ' ' + polyglot.t('new_direct_messages', newPosts) + '.',
                    tag: 'twister_notification_new_DMs',
                    timeout: $.Options.showDesktopNotifDMsTimer.val,
                    funcClick: (function() {
                        focusModalWithElement(this.postboard,
                            function (peerAlias) {
                                _newDMsPerUser[peerAlias] = 0;
                                if (peerAlias[0] === '*')
                                    $.MAL.updateNewGroupDMsUI(getNewGroupDMsCount());
                                else
                                    $.MAL.updateNewDMsUI(getNewDMsCount());
                            }, this.peerAlias);
                    }).bind({postboard: stream, peerAlias: peerAlias})
                });
            // TODO here we need to set new DMs counter on minimized modal button
        }
    }
}

function directMsgSubmit(e) {
    e.stopPropagation();
    e.preventDefault();

    var replyText = $(this).closest('.post-area-new').find('textarea');

    replyText.siblings('#post-preview').hide();

    newDirectMsg(replyText.val(), $('.directMessages').attr('data-screen-name'));

    replyText.val('');
}

function newDirectMsg(msg, peerAlias) {
    if (typeof lastPostId !== 'undefined') {
        var paramsOrig = [defaultScreenName, lastPostId + 1, peerAlias, msg];
        var paramsOpt = paramsOrig;
        var copySelf = $.Options.dmCopySelf.val === 'enable';
        if (copySelf && peerAlias[0] !== '*')
            paramsOpt = paramsOrig.concat(true)

        twisterRpc('newdirectmsg', paramsOpt,
            function(req, ret) {
                incLastPostId();
                if (req.copySelf)
                    incLastPostId();
            }, {copySelf: copySelf},
            function(req, ret) {
                // fallback for older twisterd (error: no copy_self parameter)
                twisterRpc('newdirectmsg', req.paramsOrig,
                    function(req, ret) {incLastPostId();}, null,
                    function(req, ret) {
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

    var modal = openModal({
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
                if (user[0] !== '*')
                    _newDMsPerUser[user] = 0;
            }
            saveDMsToStorage();
            $.MAL.updateNewDMsUI(getNewDMsCount());
        })
    ;
}

function openDmWithUserModal(peerAlias) {
    if (!defaultScreenName) {
        alert(polyglot.t('You have to log in to use direct messages.'));
        return;
    }

    var modal = openModal({
        classAdd: 'directMessages',
        content: $('.messages-thread-template').children().clone(true),
        title: polyglot.t('direct_messages_with', {username: '<span>' + peerAlias + '</span>'})
    });

    modal.self.attr('data-screen-name', peerAlias);

    if (peerAlias.length && peerAlias[0] === '*')
        getGroupChatName(peerAlias, modal.self.find('.modal-header h3 span'));
    else
        getFullname(peerAlias, modal.self.find('.modal-header h3 span'));

    requestDmConversationModal(modal.self.find('.direct-messages-thread').empty(), peerAlias);

    $('.dm-form-template').children().clone(true)
        .addClass('open').appendTo(modal.content).fadeIn('fast');
}

function openGroupMessagesModal(groupAlias) {
    if (!defaultScreenName) {
        alert(polyglot.t('You have to log in to use group messages.'));
        return;
    }

    if (typeof groupAlias === 'undefined') {
        var modal = openModal({
            classAdd: 'directMessages groupMessages',
            content: $('.direct-messages-template').children().clone(true),
            title: polyglot.t('Group Messages')
        });

        modal.content.prepend($('#group-messages-profile-modal-control-template').children().clone(true));

        requestDMsnippetList(modal.content.find('.direct-messages-list'), true);

        modal.self.find('.mark-all-as-read')
            .css('display', 'inline')
            .attr('title', polyglot.t('Mark all as read'))
            .on('click', function() {
                for (var user in _newDMsPerUser) {
                    if (user[0] === '*')
                        _newDMsPerUser[user] = 0;
                }
                saveDMsToStorage();
                $.MAL.updateNewGroupDMsUI(getNewGroupDMsCount());
            })
        ;
    } else {
        var modal = openModal({
            classAdd: 'directMessages groupMessages',
            title: polyglot.t('direct_messages_with', {username: '<span>' + groupAlias + '</span>'})
        });

        modal.self.attr('data-screen-name', groupAlias);

        getGroupChatName(groupAlias, modal.self.find('.modal-header h3 span'));

        groupMsgGetGroupInfo(groupAlias,
            function(req, ret) {
                if (ret && ret.members.indexOf(defaultScreenName) !== -1) {
                    req.modal.content.append($('.messages-thread-template').children().clone(true));
                    requestDmConversationModal(req.modal.content.find('.direct-messages-thread'), req.groupAlias);

                    var control = $('#group-messages-messages-modal-control-template').children().clone(true)
                        .appendTo(req.modal.content);
                    control.find('.profile').on('click',  {groupAlias: req.groupAlias},
                        function (event) {window.location.href = $.MAL.userUrl(event.data.groupAlias);}
                    );

                    $('.dm-form-template').children().clone(true)
                        .addClass('open').appendTo(req.modal.content).fadeIn('fast');
                }
            }, {groupAlias: groupAlias, modal: modal}
        );
    }
}

function openGroupMessagesNewGroupModal() {
    if (!defaultScreenName) {
        alert(polyglot.t('You have to log in to use group messages.'));
        return;
    }

    var modal = openModal({
        classAdd: 'group-messages-new-group',
        content: $('#group-messages-new-group-template').children().clone(true),
        title: polyglot.t('Group Messages — New Group Creation')
    });

    modal.content.find('.description').on('input',
        {parentSelector: '.module', enterSelector: '.create'}, inputEnterActivator);
    modal.content.find('.invite')
        .on('input', {handleRet: groupMsgInviteFormInputHandleUserSearchRet}, userSearchKeypress)
        .on('focus', {req: groupMsgInviteFormInputSetTextcompleteReq}, setTextcompleteOnEventTarget)
        .on('focusout', unsetTextcompleteOnEventTarget)
    ;
    modal.content.find('.create').on('click', function (event) {
        var elemEvent = $(event.target);
        var elemForm = elemEvent.closest('.module');

        var peersToInvite = elemForm.find('.invite').val().toLowerCase().match(/@\w+/g);
        if (peersToInvite)
            peersToInvite = peersToInvite.join('').slice(1).split('@');

        groupMsgCreateGroup(elemForm.find('.description').val(), peersToInvite);

        closeModal();
    });
}

function openGroupMessagesJoinGroupModal() {
    if (!defaultScreenName) {
        alert(polyglot.t('You have to log in to use group messages.'));
        return;
    }

    var modal = openModal({
        classAdd: 'group-messages-join-group',
        content: $('#group-messages-join-group-template').children().clone(true),
        title: polyglot.t('Group Messages — Join Group')
    });

    var elemGroupsList = modal.content.find('.groups-list');
    var elemGroupTemplate = $('#groups-list-item-template').children();
    groupMsgGetGroupsForPeer(defaultScreenName,
        function(req, ret) {
            if (ret) {
                for (var i = 0; i < groupChatAliases.length; i++) {
                    if (ret.indexOf(groupChatAliases[i]) === -1) {
                        var item = req.elemGroupTemplate.clone(true).appendTo(req.elemGroupsList);

                        item.find('input')
                            .attr('data-screen-name', groupChatAliases[i])
                            .on('click', function (event) {
                                var elemEvent = $(event.target);
                                elemEvent.closest('.module').find('.join')
                                    .attr('disabled',
                                        !elemEvent.closest('.groups-list').find('input:checked').length);
                            })
                        ;
                        item.find('.twister-user-name')
                            .text(groupChatAliases[i])
                            .attr('href', $.MAL.userUrl(groupChatAliases[i]))
                        ;
                        getGroupChatName(groupChatAliases[i], item.find('.description'));  // FIXME
                    }
                }
            }
        }, {elemGroupsList: elemGroupsList, elemGroupTemplate: elemGroupTemplate}
    );

    modal.content.find('.join').on('click', function (event) {
        var elemEvent = $(event.target);
        var groups = elemEvent.closest('.module').find('.groups-list input:checked');
        for (var i = 0; i < groups.length; i++)
            groupMsgInviteToGroup(groups[i].getAttribute('data-screen-name'), [defaultScreenName]);

        closeModal();
    });

    modal.content.find('.secret-key-import, .username-import').on('input', importSecretKeypress);

    modal.content.find('.import-secret-key').on('click', function (event) {
        var elemModule = $(event.target).closest('.module');
        var groupAlias = elemModule.find('.username-import').val().toLowerCase();
        var secretKey = elemModule.find('.secret-key-import').val();

        twisterRpc('importprivkey', [secretKey, groupAlias],
            function(req, ret) {
                groupMsgInviteToGroup(req.groupAlias, [defaultScreenName]);
                closeModal();
            }, {groupAlias: groupAlias},
            function(req, ret) {
                alert(polyglot.t('Error in \'importprivkey\'', {rpc: ret.message}));
            }
        );
    });
}

function groupMsgCreateGroup(description, peersToInvite) {
    if (!peersToInvite)
        peersToInvite = [];

    twisterRpc('creategroup', [description],
        function(peersToInvite, ret) {
            groupMsgInviteToGroup(ret, peersToInvite.concat([defaultScreenName]));
        }, peersToInvite,
        function(req, ret) {
            alert(polyglot.t('error', {error: 'can\'t create group — ' + ret.message}));
        }
    );
}

function groupMsgInviteToGroup(groupAlias, peersToInvite) {
    _groupMsgInviteToGroupQueue.push({groupAlias: groupAlias, peersToInvite: peersToInvite});

    if (_groupMsgInviteToGroupQueue.length === 1)
        doGroupMsgInviteToGroup();
}

function doGroupMsgInviteToGroup() {
    twisterRpc('newgroupinvite',
        [defaultScreenName, lastPostId + 1,
            _groupMsgInviteToGroupQueue[0].groupAlias, _groupMsgInviteToGroupQueue[0].peersToInvite],
        function(req, ret) {
            incLastPostId();
            _groupMsgInviteToGroupQueue.shift();
            if (_groupMsgInviteToGroupQueue.length)
                setTimeout(doGroupMsgInviteToGroup, 200);
        }, null,
        function(req, ret) {
            alert(polyglot.t('error',
                {error: 'can\'t invite ' + req[1] + ' to ' + req[0] + ' group — ' + ret.message}));
            _groupMsgInviteToGroupQueue.shift();
            if (_groupMsgInviteToGroupQueue.length)
                setTimeout(doGroupMsgInviteToGroup, 200);
        }, [_groupMsgInviteToGroupQueue[0].groupAlias, _groupMsgInviteToGroupQueue[0].peersToInvite]
    );
}

function groupMsgSetGroupDescription(groupAlias, description, cbFunc, cbArgs) {
    twisterRpc('newgroupdescription',
        [defaultScreenName, lastPostId + 1, groupAlias, description],
        function (req) {
            incLastPostId();
            req.cbFunc(req.cbArgs);
        }, {cbFunc: cbFunc, cbArgs: cbArgs},
        function(req, ret) {alert(polyglot.t('error', {error: 'can\'t set group description — ' + ret.message}));}, null
    );
}

function groupMsgLeaveGroup(groupAlias, cbFunc, cbArgs) {
    twisterRpc('leavegroup', [defaultScreenName, groupAlias],
        cbFunc, cbArgs,
        function(req, ret) {alert(polyglot.t('error', {error: 'can\'t leave group — ' + ret.message}));}, null
    );
}

function groupMsgGetGroupsForPeer(peer, cbFunc, cbArgs) {
    twisterRpc('listgroups', [peer],
        cbFunc, cbArgs,
        function(req, ret) {alert(polyglot.t('error', {error: 'can\'t list groups — ' + ret.message}));}, null
    );
}

function groupMsgGetGroupInfo(groupAlias, cbFunc, cbArgs) {
    twisterRpc('getgroupinfo', [groupAlias],
        cbFunc, cbArgs,
        function(req, ret) {alert(polyglot.t('error', {error: 'can\'t get group info — ' + ret.message}));}, null
    );
}

function groupMsgInviteFormInputHandleUserSearchRet() {
    // working with global results because of search function in textcomplete strategy, see groupMsgInviteFormInputSetTextcompleteReq
    var i = _lastSearchUsersResults.indexOf(defaultScreenName);
    if (i !== -1)
        _lastSearchUsersResults.splice(i, 1);
}

function groupMsgInviteFormInputSetTextcompleteReq() {
    return [{
            match: /\B@(\w*)$/,
            search: function (term, callback) {
                callback($.map(_lastSearchUsersResults, function (mention) {
                    return mention.indexOf(term) === 0 ? mention : null;
                }));
            },
            index: 1,
            replace: function (mention) {return '@' + mention + ' ';}
        }]
}

function initInterfaceDirectMsg() {
    $('.direct-messages').attr('href', '#directmessages');
    $('.userMenu-messages a').attr('href', '#directmessages');
    $('.groupmessages').attr('href', '#groupmessages');
    $('.userMenu-groupmessages a').attr('href', '#groupmessages');

    $('#dm-snippet-template').on('click', function() {
        var alias = $(this).attr('data-screen-name');
        window.location.hash = '#directmessages?' + (alias[0] === '*' ? 'group' : 'user') + '=' + alias;
    });

    $('.dm-submit').on('click', directMsgSubmit);
    $('.direct-messages-with-user').on('click', function() {
        window.location.hash = '#directmessages?user=' +
            $(this).closest('[data-screen-name]').attr('data-screen-name');
    });

    $('.group-messages-control .invite').on('click', function (event) {
        $(event.target).siblings('.invite-form').toggle();
    });

    $('.group-messages-control .invite-form textarea')
        .on('input', {parentSelector: '.invite-form', enterSelector: 'button',
            handleRet: groupMsgInviteFormInputHandleUserSearchRet},
            function (event) {
                inputEnterActivator(event);
                userSearchKeypress(event);
            }
        )
        .on('focus', {req: groupMsgInviteFormInputSetTextcompleteReq}, setTextcompleteOnEventTarget)
        .on('focusout', unsetTextcompleteOnEventTarget)
    ;

    $('.group-messages-control .invite-form button').on('click', function (event) {
        var elemEvent = $(event.target);
        var elemInput = elemEvent.siblings('textarea');
        var peersToInvite = elemInput.val().toLowerCase().match(/@\w+/g);
        if (peersToInvite)
            peersToInvite = peersToInvite.join('').slice(1).split('@');

        groupMsgInviteToGroup(elemEvent.closest('[data-screen-name]').attr('data-screen-name'),
            peersToInvite);

        elemInput.val('');
        elemEvent.closest('.invite-form').toggle();

        // TODO reload group members list
    });

    $('.group-messages-control .join').on('click', function () {
        window.location.hash = '#groupmessages+joingroup';
    });

    $('.group-messages-control .leave').on('click', function (event) {
        var elemEvent = $(event.target);
        var groupAlias = elemEvent.closest('[data-screen-name]').attr('data-screen-name');
        confirmPopup(event, {
            titleTxt: polyglot.t('сonfirm_group_leaving_header'),
            messageTxt: polyglot.t('сonfirm_group_leaving_body', {alias: groupAlias}),
            confirmFunc: function (groupAlias) {
                groupMsgLeaveGroup(groupAlias, function () {history.back();});
            },
            confirmFuncArgs: groupAlias
        });
    });

    $('.group-messages-control .new').on('click', function () {
        window.location.hash = '#groupmessages+newgroup';
    });

    $('.group-messages-control .secret-key').on('click', promptCopyAttrData);

    $('.group-messages-control .show-secret-key').on('click', function (event) {
        var elemEvent = $(event.target);
        var elemSecretKey = elemEvent.siblings('.secret-key')
            .toggle();
        if (elemSecretKey.css('display') !== 'none') {
            dumpPrivkey(elemEvent.closest('[data-screen-name]').attr('data-screen-name'),
                function(req, ret) {req.text(ret).attr('data', ret);},
                elemSecretKey
            );
        } else
            elemSecretKey.text('').attr('data', '');
    });
}
