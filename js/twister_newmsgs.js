// twister_newmsgs.js
// 2013 Miguel Freitas
//
// Periodically check for new mentions and private messages (DMs)
// Update UI counters in top bar. Load/save state to localStorage.

// --- mentions ---

var groupChatAliases = []

function saveMentionsToStorage() {
    var twists = [], length = 0;
    for (var j in twister.mentions.twists.cached) {
        for (var i = 0; i < length; i++)
            if (twister.mentions.twists.cached[j].userpost.time > twists[i].userpost.time) {
                twists.splice(i, 0, twister.mentions.twists.cached[j]);
                break;
            }

        if (length === twists.length)
            twists.push(twister.mentions.twists.cached[j]);

        length++;
    }

    $.initNamespaceStorage(defaultScreenName).localStorage
        .set('mentions', {
            twists: twists.slice(0, 100),  // TODO add an option to specify number of mentions to cache
            lastTime: twister.mentions.lastTime,
            lastTorrentId: twister.mentions.lastTorrentId
        })
    ;
}

function loadMentionsFromStorage() {
    var storage = $.initNamespaceStorage(defaultScreenName).localStorage;

    if (storage.isSet('mentions')) {
        var mentions = storage.get('mentions');
        if (typeof mentions === 'object') {
            for (var i = 0; i < mentions.twists.length; i++) {
                var j = mentions.twists[i].userpost.n + '/' + mentions.twists[i].userpost.time;
                if (typeof twister.mentions.twists.cached[j] === 'undefined') {
                    twister.mentions.twists.cached[j] = mentions.twists[i];
                    if (twister.mentions.twists.cached[j].isNew)
                        twister.mentions.lengthNew++;

                    twister.mentions.lengthFromTorrent++;
                }
            }
            twister.mentions.lastTime = mentions.lastTime;
            twister.mentions.lastTorrentId = mentions.lastTorrentId;
        }
    }

    // WARN all following storage keys are deprecated (see commit dc8cfc20ef10ff3008b4abfdb30d31e7fcbec0cd)
    if (storage.isSet('knownMentions')) {
        var mentions = storage.get('knownMentions');
        if (typeof mentions === 'object')
            for (var i in mentions) {
                var j = mentions[i].data.userpost.n + '/' + mentions[i].mentionTime;
                if (typeof twister.mentions.twists.cached[j] === 'undefined') {
                    twister.mentions.twists.cached[j] = mentions[i].data;
                    if (twister.mentions.twists.cached[j].isNew)
                        twister.mentions.lengthNew++;

                    twister.mentions.lengthFromTorrent++;
                }
            }

        storage.remove('knownMentions');
    }
    if (storage.isSet('lastMentionTime')) {
        twister.mentions.lastTime = storage.get('lastMentionTime');
        storage.remove('lastMentionTime');
    }
    if (storage.isSet('lastLocalMentionId')) {
        twister.mentions.lastTorrentId = storage.get('lastLocalMentionId');
        storage.remove('lastLocalMentionId');
    }
    if (storage.isSet('newMentions'))
        storage.remove('newMentions');
}

function queryPendingPushMentions(req, res) {
    var lengthNew = 0;
    var lengthPending = twister.res[req].twists.pending.length;
    var timeCurrent = new Date().getTime() / 1000 + 7200;  // 60 * 60 * 2
    var timeLastMention = twister.res[req].lastTime;

    for (var i = 0; i < res.length; i++) {
        if (res[i].userpost.time > timeCurrent) {
            console.warn('ignoring mention from the future:');
            console.log(res[i]);
            continue;
        }

        if (res[i].id) {
            twister.res[req].lastTorrentId = Math.max(twister.res[req].lastTorrentId, res[i].id);
            delete res[i].id;
            twister.res[req].lengthFromTorrent++;
        }

        var j = res[i].userpost.n + '/' + res[i].userpost.time;
        if (typeof twister.res[req].twists.cached[j] === 'undefined') {
            twister.res[req].twists.cached[j] = res[i];
            twister.res[req].twists.pending.push(j);

            // mention must be somewhat recent compared to last known one to be considered new
            if (res[i].userpost.time + 259200 > timeLastMention) {  // 3600 * 24 * 3
                lengthNew++;
                twister.res[req].lastTime = Math.max(res[i].userpost.time, twister.res[req].lastTime);
                twister.res[req].twists.cached[j].isNew = true;
            }
        }
    }

    if (lengthNew)
        twister.res[req].lengthNew += lengthNew;

    if (twister.res[req].twists.pending.length > lengthPending)
        saveMentionsToStorage();

    return lengthNew;
}

function resetMentionsCount() {
    twister.mentions.lengthNew = 0;

    for (var j in twister.mentions.twists.cached)
        if (twister.mentions.twists.cached[j].isNew)
            delete twister.mentions.twists.cached[j].isNew;

    saveMentionsToStorage();
    $.MAL.updateNewMentionsUI(twister.mentions.lengthNew);
}

function initMentionsCount() {
    var req = queryStart('', defaultScreenName, 'mention', [10000, 2000, 3], 10000, {
        lastTime: 0,
        lastTorrentId: -1,
        lengthNew: 0,
        ready: function (req) {
            twister.mentions = twister.res[req];
            twister.mentions.lengthFromTorrent = 0;
            loadMentionsFromStorage();
        },
        skidoo: function () {return false;}
    });

    $.MAL.updateNewMentionsUI(twister.mentions.lengthNew);
}

function handleMentionsModalScroll(event) {
    if (!event || twister.mentions.scrollQueryActive)
        return;

    var elem = $(event.target);
    if (elem.scrollTop() >= elem[0].scrollHeight - elem.height() - 50) {
        twister.mentions.scrollQueryActive = true;

        twisterRpc('getmentions', [twister.mentions.query, 10,
            {max_id: twister.mentions.lastTorrentId - twister.mentions.lengthFromTorrent}],
            function (req, res) {
                twister.mentions.scrollQueryActive = false;
                twister.res[req].boardAutoAppend = true;  // FIXME all pending twists will be appended
                queryProcess(req, res);
                twister.res[req].boardAutoAppend = false;
            }, twister.mentions.query + '@' + twister.mentions.resource,
            function () {console.warn('getmentions API requires twister-core > 0.9.27');}
        );
    }
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
            var newDMsUpdated;

            for (var u in dmUsers) {
                if (dmUsers[u]) {
                    var dmData = dmUsers[u][0];
                    if (u in _lastDMIdPerUser && u in _newDMsPerUser) {
                        if (dmData.id !== _lastDMIdPerUser[u]) {
                            _newDMsPerUser[u] += dmData.id - _lastDMIdPerUser[u];
                            newDMsUpdated = true;
                        }
                    } else {
                        _newDMsPerUser[u] = dmData.id + 1;
                        newDMsUpdated = true;
                    }
                    _lastDMIdPerUser[u] = dmData.id;
                }
            }
            if (newDMsUpdated) {
                saveDMsToStorage();
                var newDMs = getNewDMsCount();
                if (newDMs) {
                    $.MAL.updateNewDMsUI(newDMs);
                    $.MAL.soundNotifyDM();

                    if (!$.mobile && $.Options.showDesktopNotifDMs.val === 'enable') {
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
                    $.MAL.updateNewGroupDMsUI(newDMs);
                    $.MAL.soundNotifyDM();

                    if (!$.mobile && $.Options.showDesktopNotifDMs.val === 'enable') {
                        $.MAL.showDesktopNotification({
                            body: polyglot.t('You got') + ' ' + polyglot.t('new_group_messages', newDMs) + '.',
                            tag: 'twister_notification_new_DMs',
                            timeout: $.Options.showDesktopNotifDMsTimer.val,
                            funcClick: function () {$.MAL.showDMchat({group: true});}
                        });
                    }
                }
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
    clearInterval(twister.mentions.interval);
}
