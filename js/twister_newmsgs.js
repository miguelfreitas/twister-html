// twister_newmsgs.js
// 2013 Miguel Freitas
//
// Periodically check for new mentions and private messages (DMs)
// Update UI counters in top bar. Load/save state to localStorage.

// --- mentions ---

var _knownMentions = {}
var _lastMentionTime = 0;
var _newMentions = 0;
var PURGE_OLD_MENTIONS_TIMEOUT = 3600 * 24 * 30; // one month

// process a mention received to check if it is really new
function processMention(user, mentionTime, data) {
    var key = user + ";" + mentionTime;
    var curTime = new Date().getTime() / 1000;
    if( mentionTime > curTime + 3600 ) {
        console.log("mention from the future will be ignored");
    } else {
        var newMentionsUpdated = false;
        if( !(key in _knownMentions) ) {
            // mention must be somewhat recent compared to last known one to be considered new
            if( mentionTime + 3600 > _lastMentionTime ) {
                _newMentions++;
                newMentionsUpdated = true;
                _lastMentionTime = mentionTime;
            }
            _knownMentions[key] = {mentionTime:mentionTime, data:data};
            purgeOldMentions();
            saveMentionsToStorage();
        }
        if( newMentionsUpdated ) {
            $.MAL.soundNotifyMentions();
        }
    }
}

function purgeOldMentions() {
    for( var key in _knownMentions ) {
        if( _knownMentions.hasOwnProperty(key) ) {
            if( !_knownMentions[key].mentionTime || !_knownMentions[key].data ||
                _knownMentions[key].mentionTime + PURGE_OLD_MENTIONS_TIMEOUT < _lastMentionTime ) {
                delete _knownMentions[key];
            }
        }
    }
}

function saveMentionsToStorage() {
    var ns=$.initNamespaceStorage(defaultScreenName);
    ns.localStorage.set("knownMentions", _knownMentions);
    ns.localStorage.set("lastMentionTime", _lastMentionTime);
    ns.localStorage.set("newMentions", _newMentions);
}

function loadMentionsFromStorage() {
    var ns=$.initNamespaceStorage(defaultScreenName);
    if( ns.localStorage.isSet("knownMentions") )
        _knownMentions = ns.localStorage.get("knownMentions");
    if( ns.localStorage.isSet("lastMentionTime") )
        _lastMentionTime = ns.localStorage.get("lastMentionTime");
    if( ns.localStorage.isSet("newMentions") )
        _newMentions = ns.localStorage.get("newMentions");
}

function requestMentionsCount() {
    dhtget( defaultScreenName, "mention", "m",
           function(args, data) {
               if( data ) {
                   for( var i = 0; i < data.length; i++ ) {
                       var userpost = data[i]["userpost"];
                       processMention( userpost["n"], userpost["time"], data[i]);
                   }
                   $.MAL.updateNewMentionsUI(_newMentions);
               }
           }, {},
           [10000,2000,3]); // use extended timeout parameters (requires twister_core >= 0.9.14)
}

function resetMentionsCount() {
    _newMentions = 0;
    saveMentionsToStorage();
    $.MAL.updateNewMentionsUI(_newMentions);
}

function initMentionsCount() {
    // polling mentions is a temporary solution
    loadMentionsFromStorage();
    $.MAL.updateNewMentionsUI(_newMentions);
    requestMentionsCount();
    setInterval("requestMentionsCount()", 10000);
}

function getMentionsData() {
    mentions = []
    for( var key in _knownMentions ) {
        if( _knownMentions.hasOwnProperty(key) && _knownMentions[key].data ) {
            mentions.push(_knownMentions[key].data);
        }
    }
    return mentions;
}

// --- direct messages ---

var _lastDMIdPerUser = {};
var _newDMsPerUser = {};

function saveDMsToStorage() {
    var ns=$.initNamespaceStorage(defaultScreenName);
    ns.localStorage.set("lastDMIdPerUser", _lastDMIdPerUser);
    ns.localStorage.set("newDMsPerUser", _newDMsPerUser);
}

function loadDMsFromStorage() {
    var ns=$.initNamespaceStorage(defaultScreenName);
    if( ns.localStorage.isSet("lastDMIdPerUser") )
        _lastDMIdPerUser = ns.localStorage.get("lastDMIdPerUser");
    if( ns.localStorage.isSet("newDMsPerUser") )
        _newDMsPerUser = ns.localStorage.get("newDMsPerUser");
}

function requestDMsCount() {
    var followList = [];
    for( var i = 0; i < followingUsers.length; i++ ) {
        followList.push({username:followingUsers[i]});
    }

    twisterRpc("getdirectmsgs", [defaultScreenName, 1, followList],
           function(req, dmUsers) {
               var updated = false;
               for( var u in dmUsers ) {
                   if( dmUsers.hasOwnProperty(u) ) {
                       var dmData = dmUsers[u][0];
                       if( (u in _lastDMIdPerUser) && (u in _newDMsPerUser) ) {
                           if( dmData.id != _lastDMIdPerUser[u] ) {
                               _newDMsPerUser[u] += (dmData.id - _lastDMIdPerUser[u]);
                               updated = true;
                           }
                       } else {
                           _newDMsPerUser[u] = dmData.id+1;
                           updated = true;
                       }
                       _lastDMIdPerUser[u] = dmData.id;
                   }
               }
               if( updated ) {
                 saveDMsToStorage();
                 $.MAL.updateNewDMsUI(getNewDMsCount());
               }
           }, null,
           function(req, ret) {console.log("ajax error:" + ret);}, null);
}

function getNewDMsCount() {
    var newDMs = 0;

    for( var key in _newDMsPerUser ) {
        if( _newDMsPerUser.hasOwnProperty(key) ) {
            newDMs += _newDMsPerUser[key];
        }
    }
    return newDMs;
}

function resetNewDMsCountForUser(user, lastId) {
    _newDMsPerUser[user] = 0;
    _lastDMIdPerUser[user] = lastId;

    saveDMsToStorage();
    $.MAL.updateNewDMsUI(getNewDMsCount());
}

function initDMsCount() {
    loadDMsFromStorage();
    $.MAL.updateNewDMsUI(getNewDMsCount());
    requestDMsCount();
    //polling not needed: processNewPostsConfirmation will call requestDMsCount.
    //setInterval("requestDMsCount()", 5000);
}

function newmsgsChangedUser() {
    _knownMentions = {}
    _lastMentionTime = 0;
    _newMentions = 0;
}
