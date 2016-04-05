// twister_newmsgs.js
// 2013 Miguel Freitas
//
// Periodically check for new mentions and private messages (DMs)
// Update UI counters in top bar. Load/save state to localStorage.

// --- mentions ---

var _knownMentions = {}
var _lastMentionTime = 0;
var _newMentions = 0;
var _lastLocalMentionId = -1;
var PURGE_OLD_MENTIONS_TIMEOUT = 3600 * 24 * 30; // one month
var _newMentionsUpdated = false;
var _newDMsUpdated = false;
var groupChatAliases = []

// process a mention received to check if it is really new
function processMention(user, mentionTime, data) {
    var key = user + ';' + mentionTime;
    var curTime = new Date().getTime() / 1000;
    if (mentionTime > curTime + 7200)  // 3600 * 2
        console.warn('ignoring mention from the future');
    else {
        if (!_knownMentions[key]) {
            // mention must be somewhat recent compared to last known one to be considered new
            if (mentionTime + 259200 > _lastMentionTime) {  // 3600 * 24 * 3
                _newMentions++;
                _newMentionsUpdated = true;
                _lastMentionTime = Math.max(mentionTime, _lastMentionTime);
                data.isNew = true;

                var reqId = defaultScreenName + '@mention';
                if (typeof _queryPendingPosts[reqId] !== 'object')
                    _queryPendingPosts[reqId] = [];
                _queryPendingPosts[reqId].push(data);
            }
            _knownMentions[key] = {mentionTime: mentionTime, data: data};
            purgeOldMentions();
            saveMentionsToStorage();
        }
    }
}

function purgeOldMentions() {
    for (var key in _knownMentions) {
        if (_knownMentions[key]) {
            if (!_knownMentions[key].mentionTime || !_knownMentions[key].data ||
                _knownMentions[key].mentionTime + PURGE_OLD_MENTIONS_TIMEOUT < _lastMentionTime) {
                delete _knownMentions[key];
            }
        }
    }
}

function saveMentionsToStorage() {
    var ns = $.initNamespaceStorage(defaultScreenName);
    ns.localStorage.set('knownMentions', _knownMentions);
    ns.localStorage.set('lastMentionTime', _lastMentionTime);
    ns.localStorage.set('newMentions', _newMentions);
    ns.localStorage.set('lastLocalMentionId', _lastLocalMentionId);
}

function loadMentionsFromStorage() {
    var ns = $.initNamespaceStorage(defaultScreenName);
    if (ns.localStorage.isSet('knownMentions'))
        _knownMentions = ns.localStorage.get('knownMentions');
    if (ns.localStorage.isSet('lastMentionTime'))
        _lastMentionTime = ns.localStorage.get('lastMentionTime');
    if (ns.localStorage.isSet('newMentions'))
        _newMentions = ns.localStorage.get('newMentions');
    if (ns.localStorage.isSet('lastLocalMentionId'))
        _lastLocalMentionId = ns.localStorage.get('lastLocalMentionId');
}

function requestMentionsCount() {
    // first: getmentions from torrents we follow
    twisterRpc('getmentions', [defaultScreenName, 100, {since_id: _lastLocalMentionId}],
        function(args, data) {
            if (data) {
                for (var i = 0; i < data.length; i++) {
                    _lastLocalMentionId = Math.max(_lastLocalMentionId, data[i].id);
                    var userpost = data[i].userpost;
                    processMention(userpost.n, userpost.time, data[i]);
                }
                $.MAL.updateNewMentionsUI(_newMentions);
            }
        }, null,
        function(req, ret) {console.warn('getmentions API requires twister-core > 0.9.27');}, null
    );
    // second: get mentions from dht (not-following)
    dhtget(defaultScreenName, 'mention', 'm',
            function(args, data) {
                if (data) {
                    for (var i = 0; i < data.length; i++) {
                        var userpost = data[i].userpost;
                        processMention(userpost.n, userpost.time, data[i]);
                    }
                    $.MAL.updateNewMentionsUI(_newMentions);
                }
            }, {},
            [10000, 2000, 3]  // use extended timeout parameters (requires twister_core >= 0.9.14)
    );

    if (_newMentionsUpdated) {
        _newMentionsUpdated = false;

        if (_newMentions) {
            $.MAL.soundNotifyMentions();

            if (!$.hasOwnProperty('mobile') && $.Options.showDesktopNotifMentions.val === 'enable')
                $.MAL.showDesktopNotification({
                    body: polyglot.t('You got') + ' ' + polyglot.t('new_mentions', _newMentions) + '.',
                    tag: 'twister_notification_new_mentions',
                    timeout: $.Options.showDesktopNotifMentionsTimer.val,
                    funcClick: function () {
                        var postboardSelector =
                            '.postboard-posts[data-request-id="' + defaultScreenName + '@mention"]';
                        if (!focusModalWithElement(postboardSelector,
                            function (req) {
                                var postboard = $(req.postboardSelector);
                                postboard.closest('.postboard').find('.postboard-news').hide();
                                displayQueryPending(postboard);
                                resetMentionsCount();
                            }, {postboardSelector: postboardSelector}
                        ))
                            $.MAL.showMentions(defaultScreenName);
                    }
                });
        }
    }

    // was moved here from requestDMsCount() because that is not ticking right
    // we would place it with other notifications into separate notification center
    if (_newDMsUpdated) {
        _newDMsUpdated = false;

        var newDMs = getNewDMsCount();
        if (newDMs) {
            $.MAL.soundNotifyDM();

            if (!$.hasOwnProperty('mobile') && $.Options.showDesktopNotifDMs.val === 'enable') {
                $.MAL.showDesktopNotification({
                    body: polyglot.t('You got') + ' ' + polyglot.t('new_direct_messages', newDMs) + '.',
                    tag: 'twister_notification_new_DMs',
                    timeout: $.Options.showDesktopNotifDMsTimer.val,
                    funcClick: function () {$.MAL.showDMchat();}
                });
            }
        }
        var newDMs = getNewGroupDMsCount();
        if (newDMs) {
            $.MAL.soundNotifyDM();

            if (!$.hasOwnProperty('mobile') && $.Options.showDesktopNotifDMs.val === 'enable') {
                $.MAL.showDesktopNotification({
                    body: polyglot.t('You got') + ' ' + polyglot.t('new_group_messages', newDMs) + '.',
                    tag: 'twister_notification_new_DMs',
                    timeout: $.Options.showDesktopNotifDMsTimer.val,
                    funcClick: function () {$.MAL.showDMchat({group: true});}
                });
            }
        }
    }
}

function resetMentionsCount() {
    _newMentions = 0;
    for (var key in _knownMentions) {
        if (_knownMentions[key] && _knownMentions[key].data)
            delete _knownMentions[key].data.isNew
    }
    saveMentionsToStorage();
    $.MAL.updateNewMentionsUI(_newMentions);
}

function initMentionsCount() {
    // polling mentions is a temporary solution
    loadMentionsFromStorage();
    $.MAL.updateNewMentionsUI(_newMentions);
    requestMentionsCount();
    setInterval(requestMentionsCount, 10000);
}

function getMentionsData() {
    mentions = []
    for (var key in _knownMentions) {
        if (_knownMentions[key] && _knownMentions[key].data) {
            mentions.push(_knownMentions[key].data);
        }
    }
    return mentions;
}

// --- direct messages ---

var _lastDMIdPerUser = {};
var _newDMsPerUser = {};

function saveDMsToStorage() {
    var ns = $.initNamespaceStorage(defaultScreenName);
    ns.localStorage.set('lastDMIdPerUser', _lastDMIdPerUser);
    ns.localStorage.set('newDMsPerUser', _newDMsPerUser);
}

function loadDMsFromStorage() {
    var ns = $.initNamespaceStorage(defaultScreenName);
    if (ns.localStorage.isSet('lastDMIdPerUser'))
        _lastDMIdPerUser = ns.localStorage.get('lastDMIdPerUser');
    if (ns.localStorage.isSet('newDMsPerUser'))
        _newDMsPerUser = ns.localStorage.get('newDMsPerUser');
}

function requestDMsCount() {
    var followList = [];
    for (var i = 0; i < followingUsers.length; i++)
        followList.push({username: followingUsers[i]});
    for (var i = 0; i < groupChatAliases.length; i++ )
        followList.push({username: groupChatAliases[i]});

    twisterRpc('getdirectmsgs', [defaultScreenName, 1, followList],
        function(req, dmUsers) {
            for (var u in dmUsers) {
                if (dmUsers[u]) {
                    var dmData = dmUsers[u][0];
                    if (u in _lastDMIdPerUser && u in _newDMsPerUser) {
                        if (dmData.id !== _lastDMIdPerUser[u]) {
                            _newDMsPerUser[u] += dmData.id - _lastDMIdPerUser[u];
                            _newDMsUpdated = true;
                        }
                    } else {
                        _newDMsPerUser[u] = dmData.id + 1;
                        _newDMsUpdated = true;
                    }
                    _lastDMIdPerUser[u] = dmData.id;
                }
            }
            if (_newDMsUpdated) {
                saveDMsToStorage();
                $.MAL.updateNewDMsUI(getNewDMsCount());
                $.MAL.updateNewGroupDMsUI(getNewGroupDMsCount());
            }
        }, null,
        function(req, ret) {console.warn('ajax error:' + ret);}, null
    );
}

function getNewDMsCount() {
    var newDMs = 0;

    for (var user in _newDMsPerUser) {
        if (user[0] !== '*' && _newDMsPerUser[user])
            newDMs += _newDMsPerUser[user];
    }

    return newDMs;
}

function getNewGroupDMsCount() {
    var newDMs = 0;

    for (var user in _newDMsPerUser) {
        if (user[0] === '*' && _newDMsPerUser[user])
            newDMs += _newDMsPerUser[user];
    }

    return newDMs;
}

function resetNewDMsCountForUser(user, lastId) {
    _newDMsPerUser[user] = 0;
    _lastDMIdPerUser[user] = lastId;

    saveDMsToStorage();
    $.MAL.updateNewDMsUI(getNewDMsCount());
    $.MAL.updateNewGroupDMsUI(getNewGroupDMsCount());
}

function updateGroupList() {
    twisterRpc('listgroups', [],
        function(req, ret) {groupChatAliases = ret;}, null,
        function(req, ret) {console.warn('twisterd >= 0.9.30 required for listgroups');}, null
    );
}

function initDMsCount() {
    loadDMsFromStorage();
    $.MAL.updateNewDMsUI(getNewDMsCount());
    $.MAL.updateNewGroupDMsUI(getNewGroupDMsCount());
    //quick hack to obtain list of group chat aliases
    updateGroupList();
    setInterval(updateGroupList, 60000);

    setTimeout(requestDMsCount, 200);
    //polling not needed: processNewPostsConfirmation will call requestDMsCount.
    //setInterval('requestDMsCount()', 5000);
}

function newmsgsChangedUser() {
    _knownMentions = {}
    _lastMentionTime = 0;
    _newMentions = 0;
}
