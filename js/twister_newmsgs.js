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
                    twister.mentions.lengthCached++;
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
                    twister.mentions.lengthCached++;
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
            twister.res[req].lengthCached++;
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
    if (!twister.mentions.lengthNew)
        return;

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

        twisterRpc('getmentions', [twister.mentions.query, postsPerRefresh,
            {max_id: twister.mentions.lastTorrentId - twister.mentions.lengthFromTorrent}],
            function (req, res) {
                twister.res[req].scrollQueryActive = false;
                twister.res[req].boardAutoAppend = true;  // FIXME all pending twists will be appended
                queryProcess(req, res);
                twister.res[req].boardAutoAppend = false;
            }, twister.mentions.query + '@' + twister.mentions.resource,
            function () {console.warn('getmentions API requires twister-core > 0.9.27');}
        );
    }
}

// --- direct messages ---

function saveDMsToStorage() {
    var pool = {};

    for (var peerAlias in twister.DMs) {
        var twists = [], length = 0;
        for (var j in twister.DMs[peerAlias].twists.cached) {
            for (var i = 0; i < length; i++)
                if (twister.DMs[peerAlias].twists.cached[j].id > twists[i].id) {
                    twists.splice(i, 0, twister.DMs[peerAlias].twists.cached[j]);
                    break;
                }

            if (length === twists.length)
                twists.push(twister.DMs[peerAlias].twists.cached[j]);

            length++;
        }
        pool[peerAlias] = {
            twists: twists.slice(0, 100),  // TODO add an option to specify number of DMs to cache
            lastId: twister.DMs[peerAlias].lastId,
        };
    }

    if ($.Options.get('dmEncryptCache') === 'enable') {
        pool = twister.var.key.pub.encrypt(JSON.stringify(pool));
        delete pool.orig;  // WORKAROUND the decrypt function does .slice(0, orig) but something goes wrong in process of buffer decoding (if original string contains non-ASCII characters) and orig may be smaller than the actual size, if it is undefined .slice gets it whole
    }
    $.initNamespaceStorage(defaultScreenName).localStorage.set('DMs', pool);
}

function loadDMsFromStorage() {
    var storage = $.initNamespaceStorage(defaultScreenName).localStorage;

    if (storage.isSet('DMs')) {
        var pool = storage.get('DMs');
        if (pool.key && pool.body && pool.mac) {
            if (pool = twister.var.key.decrypt(pool))
                pool = JSON.parse(pool.toString());
            else
                console.warn('can\'t decrypt DMs\' data cache');
        }
        if (typeof pool === 'object') {
            for (var peerAlias in pool) {
                if (!twister.DMs[peerAlias])
                    twister.DMs[peerAlias] = queryCreateRes(peerAlias, 'direct',
                        {boardAutoAppend: true, lastId: 0, lengthNew: 0});

                for (var i = 0; i < pool[peerAlias].twists.length; i++) {
                    var j = pool[peerAlias].twists[i].from + '/' + pool[peerAlias].twists[i].time;
                    if (typeof twister.DMs[peerAlias].twists.cached[j] === 'undefined') {
                        twister.DMs[peerAlias].twists.cached[j] = pool[peerAlias].twists[i];
                        twister.DMs[peerAlias].lengthCached++;
                        if (twister.DMs[peerAlias].twists.cached[j].isNew)
                            twister.DMs[peerAlias].lengthNew++;
                    }
                }
                twister.DMs[peerAlias].lastId = pool[peerAlias].lastId;
            }
        }
    }

    // WARN all following storage keys are deprecated (see commit FIXME)
    if (storage.isSet('lastDMIdPerUser')) {
        var pool = storage.get('lastDMIdPerUser');
        if (typeof pool === 'object')
            for (var peerAlias in pool) {
                if (!twister.DMs[peerAlias])
                    twister.DMs[peerAlias] = queryCreateRes(peerAlias, 'direct',
                        {boardAutoAppend: true, lastId: 0, lengthNew: 0});

                twister.DMs[peerAlias].lastId = pool[peerAlias];
            }

        storage.remove('lastDMIdPerUser');
    }
    if (storage.isSet('newDMsPerUser')) {
        var pool = storage.get('newDMsPerUser');
        if (typeof pool === 'object')
            for (var peerAlias in pool) {
                if (!twister.DMs[peerAlias])
                    twister.DMs[peerAlias] = queryCreateRes(peerAlias, 'direct',
                        {boardAutoAppend: true, lastId: 0, lengthNew: 0});

                twister.DMs[peerAlias].lengthNew = pool[peerAlias];
            }

        storage.remove('newDMsPerUser');
    }
}

function queryPendingPushDMs(res) {
    var lengthNew = 0;
    var lengthPending = 0;

    for (var peerAlias in res) {
        if (!res[peerAlias] || !res[peerAlias].length || !twister.DMs[peerAlias])
            continue;

        for (var i = 0; i < res[peerAlias].length; i++) {
            var j = res[peerAlias][i].from + '/' + res[peerAlias][i].time;
            if (typeof twister.DMs[peerAlias].twists.cached[j] === 'undefined') {
                twister.DMs[peerAlias].twists.cached[j] = res[peerAlias][i];
                twister.DMs[peerAlias].lengthCached++;
                twister.DMs[peerAlias].twists.pending.push(j);
                lengthPending++;
                if (twister.DMs[peerAlias].lastId < res[peerAlias][i].id) {
                    twister.DMs[peerAlias].lastId = res[peerAlias][i].id;
                    if ((!twister.DMs[peerAlias].board || !twister.DMs[peerAlias].board.is('html *'))
                        && !res[peerAlias][i].fromMe && res[peerAlias][i].from !== defaultScreenName) {
                        lengthNew++;
                        twister.DMs[peerAlias].lengthNew += 1;
                        twister.DMs[peerAlias].twists.cached[j].isNew = true;
                    }
                }
            }
        }
    }

    if (lengthPending)
        saveDMsToStorage();

    return lengthNew;
}

function requestDMsCount() {
    var list = [];
    for (var i = 0; i < followingUsers.length; i++)
        list.push({username: followingUsers[i]});
    for (var i = 0; i < groupChatAliases.length; i++)
        list.push({username: groupChatAliases[i]});

    twisterRpc('getdirectmsgs', [defaultScreenName, 1, list],
        function (req, res) {
            var lengthNew = 0, lengthNewMax = 0;
            var list = [];

            for (var peerAlias in res) {
                if (!res[peerAlias] || !res[peerAlias].length)
                    continue;

                if (!twister.DMs[peerAlias])
                    twister.DMs[peerAlias] = queryCreateRes(peerAlias, 'direct',
                        {boardAutoAppend: true, lastId: 0, lengthNew: 0});

                if (res[peerAlias][0].id > twister.DMs[peerAlias].lastId) {
                    lengthNew = res[peerAlias][0].id - twister.DMs[peerAlias].lastId;
                    if (lengthNewMax < lengthNew)
                        lengthNewMax = lengthNew;

                    list.push({username: peerAlias});
                } else if (!twister.DMs[peerAlias].lengthCached)
                    queryPendingPushDMs(res);
            }

            if (list.length === 1)
                queryProcess(list[0].username + '@direct', res);
            else if (lengthNewMax === 1) {
                if (queryPendingPushDMs(res))
                    DMsSummaryProcessNew();
            } else if (lengthNewMax) {
                twisterRpc('getdirectmsgs', [defaultScreenName, lengthNewMax, list],
                    function (req, res) {
                        if (typeof res !== 'object' || $.isEmptyObject(res))
                            return;

                        if (queryPendingPushDMs(res))
                            DMsSummaryProcessNew();
                    }, undefined,
                    function (req, res) {
                        console.warn(polyglot.t('ajax_error',
                            {error: (res && res.message) ? res.message : res}));
                    }
                );
            }
        }, undefined,
        function (req, res) {
            console.warn(polyglot.t('ajax_error', {error: (res && res.message) ? res.message : res}));
        }
    );
}

function DMsSummaryProcessNew() {
    var lengthNew = getNewDMsCount();
    if (lengthNew) {
        $.MAL.updateNewDMsUI(lengthNew);
        $.MAL.soundNotifyDM();
        if (!$.mobile) {
            if ($.Options.showDesktopNotifDMs.val === 'enable') {
                $.MAL.showDesktopNotification({
                    body: polyglot.t('You got') + ' ' + polyglot.t('new_direct_messages', lengthNew) + '.',
                    tag: 'twister_notification_new_DMs',
                    timeout: $.Options.showDesktopNotifDMsTimer.val,
                    funcClick: function () {$.MAL.showDMchat();}
                });
            }
            var elem = getElem('.directMessages .direct-messages-list');
            if (isModalWithElemExists(elem))
                modalDMsSummaryDraw(elem);
        } else if ($.mobile.activePage.attr('id') !== 'directmsg')
            modalDMsSummaryDraw($('#directmsg .direct-messages-list'));
    }
    lengthNew = getNewGroupDMsCount();
    if (lengthNew) {
        $.MAL.updateNewGroupDMsUI(lengthNew);
        $.MAL.soundNotifyDM();
        if (!$.mobile) {
            if ($.Options.showDesktopNotifDMs.val === 'enable') {
                $.MAL.showDesktopNotification({
                    body: polyglot.t('You got') + ' ' + polyglot.t('new_group_messages', lengthNew) + '.',
                    tag: 'twister_notification_new_DMs',
                    timeout: $.Options.showDesktopNotifDMsTimer.val,
                    funcClick: function () {$.MAL.showDMchat({group: true});}
                });
            }
            var elem = getElem('.groupMessages .direct-messages-list');
            if (isModalWithElemExists(elem))
                modalDMsSummaryDraw(elem, true);
        } else if ($.mobile.activePage.attr('id') !== 'directmsg')
            modalDMsSummaryDraw($('#directmsg .direct-messages-list'), true);
    }
}

function getNewDMsCount() {
    var lengthNew = 0;

    for (var peerAlias in twister.DMs)
        if (peerAlias[0] !== '*' && twister.DMs[peerAlias].lengthNew)
            lengthNew += twister.DMs[peerAlias].lengthNew;

    return lengthNew;
}

function getNewGroupDMsCount() {
    var lengthNew = 0;

    for (var peerAlias in twister.DMs)
        if (peerAlias[0] === '*' && twister.DMs[peerAlias].lengthNew)
            lengthNew += twister.DMs[peerAlias].lengthNew;

    return lengthNew;
}

function resetNewDMsCount() {
    var isNewDetected;

    for (var peerAlias in twister.DMs)
        if (twister.DMs[peerAlias].lengthNew && peerAlias[0] !== '*') {
            twister.DMs[peerAlias].lengthNew = 0;
            for (var j in twister.DMs[peerAlias].twists.cached)
                delete twister.DMs[peerAlias].twists.cached[j].isNew;

            isNewDetected = true;
        }

    if (!isNewDetected)
        return;

    saveDMsToStorage();
    $.MAL.updateNewDMsUI(getNewDMsCount());
}

function resetNewDMsCountGroup() {
    var isNewDetected;

    for (var peerAlias in twister.DMs)
        if (twister.DMs[peerAlias].lengthNew && peerAlias[0] === '*') {
            twister.DMs[peerAlias].lengthNew = 0;
            for (var j in twister.DMs[peerAlias].twists.cached)
                delete twister.DMs[peerAlias].twists.cached[j].isNew;

            isNewDetected = true;
        }

    if (!isNewDetected)
        return;

    saveDMsToStorage();
    $.MAL.updateNewGroupDMsUI(getNewGroupDMsCount());
}

function resetNewDMsCountForPeer(peerAlias) {
    if (!twister.DMs[peerAlias].lengthNew)
        return;

    twister.DMs[peerAlias].lengthNew = 0;
    for (var j in twister.DMs[peerAlias].twists.cached)
        delete twister.DMs[peerAlias].twists.cached[j].isNew;

    saveDMsToStorage();
    if (peerAlias[0] !== '*')
        $.MAL.updateNewDMsUI(getNewDMsCount());
    else
        $.MAL.updateNewGroupDMsUI(getNewGroupDMsCount());
}

function updateGroupList() {
    twisterRpc('listgroups', [],
        function(req, ret) {groupChatAliases = ret;}, null,
        function(req, ret) {console.warn('twisterd >= 0.9.30 required for listgroups');}, null
    );
}

function initDMsCount() {
    twister.DMs = {};
    dumpPrivkey(defaultScreenName, function (req, res) {
        twister.var.key = TwisterCrypto.PrivKey.fromWIF(res);

        loadDMsFromStorage();
        $.MAL.updateNewDMsUI(getNewDMsCount());
        $.MAL.updateNewGroupDMsUI(getNewGroupDMsCount());
        //quick hack to obtain list of group chat aliases
        updateGroupList();
        setInterval(updateGroupList, 60000);

        setTimeout(requestDMsCount, 200);
        //polling not needed: processNewPostsConfirmation will call requestDMsCount.
        //setInterval('requestDMsCount()', 5000);
    });
}

function newmsgsChangedUser() {
    clearInterval(twister.mentions.interval);
}

function handleDMsModalScroll(event) {
    if (!event || !event.data.req || !twister.DMs[event.data.req]
        || twister.DMs[event.data.req].scrollQueryActive)
        return;

    var length = twister.DMs[event.data.req].lastId - twister.DMs[event.data.req].lengthCached + 1;
    if (!length)
        return;

    var elem = $(event.target);
    if (elem.scrollTop() < 100) {
        twister.DMs[event.data.req].scrollQueryActive = true;

        twisterRpc('getdirectmsgs', [defaultScreenName, Math.min(length, postsPerRefresh),
            [{username: twister.DMs[event.data.req].query, max_id: length - 1}]],
            function (req, res) {
                twister.res[req.k].scrollQueryActive = false;
                //twister.res[req.k].boardAutoAppend = true;  // FIXME all pending twists will be appended
                queryProcess(req.k, res);
                //twister.res[req.k].boardAutoAppend = false;
                if (req.container[0].scrollHeight !== req.containerScrollHeightPrev)
                    req.container.scrollTop(req.container[0].scrollHeight - req.containerScrollHeightPrev);
            }, {
                k: twister.DMs[event.data.req].query + '@' + twister.DMs[event.data.req].resource,
                container: elem,
                containerScrollHeightPrev: elem[0].scrollHeight
            },
            function (req, res) {
                console.warn(polyglot.t('ajax_error',
                    {error: (res && res.message) ? res.message : res}));
            }
        );
    }
}
