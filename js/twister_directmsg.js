// twister_directmsg.js
// 2013 Miguel Freitas
//
// Handle direct messages modal

var _groupMsgInviteToGroupQueue = [];

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

function modalDMsSummaryDraw(elem, group) {
    elem.empty();

    for (var peerAlias in twister.DMs)
        if (group ? peerAlias[0] === '*' : peerAlias[0] !== '*')
            for (var j in twister.DMs[peerAlias].twists.cached)
                if (twister.DMs[peerAlias].lastId === twister.DMs[peerAlias].twists.cached[j].id) {
                    addToCommonDMsList(elem, peerAlias, twister.DMs[peerAlias].twists.cached[j]);
                    break;
                }

    $.MAL.commonDMsListLoaded();
}

// dispara o modal de direct messages
function openCommonDMsModal() {
    if (!defaultScreenName) {
      alert(polyglot.t('You have to log in to use direct messages.'));
      return;
    }

    var modal = openModal({
        classAdd: 'directMessages',
        content: twister.tmpl.commonDMsList.clone(true),
        title: polyglot.t('Direct Messages')
    });

    modalDMsSummaryDraw(modal.content.find('.direct-messages-list'));

    modal.self.find('.mark-all-as-read')
        .css('display', 'inline')
        .attr('title', polyglot.t('Mark all as read'))
        .on('click', function (event) {
            resetNewDMsCount();
            var elem = $(event.target).closest('.directMessages').find('.direct-messages-list');
            elem.find('.messages-qtd').hide();
            elem.find('.post.new').removeClass('new');
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

    queryStart(modal.content.find('.direct-messages-thread'),
        peerAlias, 'direct', undefined, 2000, {
            boardAutoAppend: true,
            lastId: 0,
            lengthNew: 0,
            ready: function (req, peerAlias) {
                twister.DMs[peerAlias] = twister.res[req];
            },
            readyReq: peerAlias,
            drawFinish: function (req) {
                $.MAL.dmConversationLoaded(twister.res[req].board);
            }
        }
    );
    modal.content.on('scroll', {req: peerAlias}, handleDMsModalScroll);

    $('.dm-form-template').children().clone(true)
        .addClass('open').appendTo(modal.content).fadeIn('fast')
            .find('textarea').focus();
}

function openGroupMessagesModal(groupAlias) {
    if (!defaultScreenName) {
        alert(polyglot.t('You have to log in to use group messages.'));
        return;
    }

    if (typeof groupAlias === 'undefined') {
        var modal = openModal({
            classAdd: 'directMessages groupMessages',
            content: twister.tmpl.commonDMsList.clone(true),
            title: polyglot.t('Group Messages')
        });

        modal.content.prepend($('#group-messages-profile-modal-control-template').children().clone(true));

        modalDMsSummaryDraw(modal.content.find('.direct-messages-list'), true);

        modal.self.find('.mark-all-as-read')
            .css('display', 'inline')
            .attr('title', polyglot.t('Mark all as read'))
            .on('click', function (event) {
                resetNewDMsCountGroup();
                var elem = $(event.target).closest('.groupMessages').find('.direct-messages-list');
                elem.find('.messages-qtd').hide();
                elem.find('.post.new').removeClass('new');
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
                    queryStart(req.modal.content.find('.direct-messages-thread'),
                        req.groupAlias, 'direct', undefined, 2000, {
                            boardAutoAppend: true,
                            lastId: 0,
                            lengthNew: 0,
                            ready: function (req, peerAlias) {
                                twister.DMs[peerAlias] = twister.res[req];
                            },
                            readyReq: req.groupAlias,
                            drawFinish: function (req) {
                                $.MAL.dmConversationLoaded(twister.res[req].board);
                            }
                        }
                    );
                    modal.content.on('scroll', {req: req.groupAlias}, handleDMsModalScroll);

                    var control = $('#group-messages-messages-modal-control-template').children().clone(true)
                        .appendTo(req.modal.content);
                    control.find('.profile').on('click',  {groupAlias: req.groupAlias},
                        function (event) {window.location.href = $.MAL.userUrl(event.data.groupAlias);}
                    );

                    $('.dm-form-template').children().clone(true)
                        .addClass('open').appendTo(req.modal.content).fadeIn('fast')
                            .find('textarea').focus();
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

        closeModal(event);
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

        closeModal(event);
    });

    modal.content.find('.secret-key-import').on('input',
        {parentSelector: '.module', enterSelector: '.import-secret-key'}, inputEnterActivator);

    modal.content.find('.import-secret-key').on('click', function (event) {
        groupMsgImportKey($(event.target).closest('.module').find('.secret-key-import').val());

        closeModal(event);
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

function groupMsgImportKey(key) {
    if (parseInt(twisterVersion) < 93800) {
        alertPopup({
            //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
            txtMessage: polyglot.t('group_key_cant_import') + ' —\n'
                + polyglot.t('daemon_is_obsolete', {versionReq: '0.9.38'})
        });
        return;
    }

    twisterRpc('creategroup', ['whatever', key],
        function(req, ret) {
            if (!ret) {
                alertPopup({
                    //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
                    txtMessage: polyglot.t('group_key_cant_import') + ' —\n'
                        + polyglot.t('group_key_is_invalid_perhaps')
                });
                return;
            }

            groupMsgInviteToGroup(ret, [defaultScreenName],
                function () {
                    twisterRpc('rescandirectmsgs', [defaultScreenName],
                        function () {}, undefined, function () {});
                }
            );
            alertPopup({
                //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
                txtMessage: polyglot.t('group_key_was_imported', {alias: ret})
            });
        }, undefined,
        function(req, ret) {
            alertPopup({
                //txtTitle: polyglot.t(''), add some title (not 'error', please) or just KISS
                txtMessage: polyglot.t('group_key_cant_import') + ' —\n' + ret.message
            });
        }
    );
}

function groupMsgInviteToGroup(groupAlias, peersToInvite, cbFunc, cbReq) {
    _groupMsgInviteToGroupQueue.push({
        groupAlias: groupAlias,
        peersToInvite: peersToInvite,
        cbFunc: cbFunc,
        cbReq: cbReq
    });

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

            if (typeof req.cbFunc === 'function')
                req.cbFunc(req.cbReq);
        }, {cbFunc: _groupMsgInviteToGroupQueue[0].cbFunc, cbReq: _groupMsgInviteToGroupQueue[0].cbReq},
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
        var elemLeave = $(event.target);
        var groupAlias = elemLeave.closest('[data-screen-name]').attr('data-screen-name');
        event.data = {
            txtTitle: polyglot.t('сonfirm_group_leaving_header'),
            txtMessage: polyglot.t('сonfirm_group_leaving_body', {alias: groupAlias}),
            cbConfirm: function (req) {
                groupMsgLeaveGroup(req.groupAlias, closeModal, req.elem);
            },
            cbConfirmReq: {groupAlias: groupAlias, elem: elemLeave}
        };
        confirmPopup(event);
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
