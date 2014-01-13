// twister_io.js
// 2013 Miguel Freitas
//
// low-level twister i/o.
// implements requests of dht resources. multiple pending requests to the same resource are joined.
// cache results (profile, avatar, etc) in memory.
// avatars are cached in localstored (expiration = 24 hours)

// main json rpc method. receives callbacks for success and error
function twisterRpc(method, params, resultFunc, resultArg, errorFunc, errorArg) {
    var foo = new $.JsonRpcClient({ ajaxUrl: '/', username: 'user', password: 'pwd'});
    foo.call(method, params,
        function(ret) { resultFunc(resultArg, ret); },
        function(ret) { if(ret != null) errorFunc(errorArg, ret); }
    );
}

// join multiple dhtgets to the same resources in this map
var _dhtgetPendingMap = {};

// memory cache for profile and avatar
var _profileMap = {};
var _avatarMap = {};

// number of dhtgets in progress (requests to the daemon)
var _dhtgetsInProgress = 0;

// keep _maxDhtgets smaller than the number of daemon/browser sockets
// most browsers limit to 6 per domain (see http://www.browserscope.org/?category=network)
var _maxDhtgets = 5;

// requests not yet sent to the daemon due to _maxDhtgets limit
var _queuedDhtgets = [];

// private function to define a key in _dhtgetPendingMap
function _dhtgetLocator(username, resource, multi) {
    return username+";"+resource+";"+multi;
}

function _dhtgetAddPending(locator, cbFunc, cbArg)
{
    if( !(locator in _dhtgetPendingMap) ) {
        _dhtgetPendingMap[locator] = [];
    }
    _dhtgetPendingMap[locator].push( {cbFunc:cbFunc, cbArg:cbArg} );
}

function _dhtgetProcessPending(locator, multi, ret)
{
    if( locator in _dhtgetPendingMap ) {
        for( var i = 0; i < _dhtgetPendingMap[locator].length; i++) {
            var cbFunc = _dhtgetPendingMap[locator][i].cbFunc;
            var cbArg  = _dhtgetPendingMap[locator][i].cbArg;

            if( multi == 's' ) {
                if( ret[0] != undefined ) {
                     cbFunc(cbArg, ret[0]["p"]["v"], ret);
                } else {
                     cbFunc(cbArg, null);
                }
            } else {
                var multiret = [];
                for (var j = 0; j < ret.length; j++) {
                    multiret.push(ret[j]["p"]["v"]);
                }
                cbFunc(cbArg, multiret, ret);
            }
        }
        delete _dhtgetPendingMap[locator];
    } else {
        console.log("warning: _dhtgetProcessPending with unknown locator "+locator);
    }
}

function _dhtgetAbortPending(locator)
{
    if( locator in _dhtgetPendingMap ) {
        for( var i = 0; i < _dhtgetPendingMap[locator].length; i++) {
            var cbFunc = _dhtgetPendingMap[locator][i].cbFunc;
            var cbArg  = _dhtgetPendingMap[locator][i].cbArg;
            cbFunc(cbArg, null);
        }
        delete _dhtgetPendingMap[locator];
    } else {
        console.log("warning: _dhtgetAbortPending with unknown locator "+locator);
    }
}

// get data from dht resource
// the value ["v"] is extracted from response and returned to callback
// null is passed to callback in case of an error
function dhtget( username, resource, multi, cbFunc, cbArg ) {
    var locator = _dhtgetLocator(username, resource, multi);
    if( locator in _dhtgetPendingMap) {
        _dhtgetAddPending(locator, cbFunc, cbArg);
    } else {
        _dhtgetAddPending(locator, cbFunc, cbArg);
        // limit the number of simultaneous dhtgets.
        // this should leave some sockets for other non-blocking daemon requests.
        if( _dhtgetsInProgress < _maxDhtgets ) {
            _dhtgetInternal( username, resource, multi );
        } else {
            // just queue the locator. it will be unqueue when some dhtget completes.
            _queuedDhtgets.push(locator);
        }
    }
}

function _dhtgetInternal( username, resource, multi ) {
    var locator = _dhtgetLocator(username, resource, multi);
    _dhtgetsInProgress++;
    twisterRpc("dhtget", [username,resource,multi],
               function(args, ret) {
                   _dhtgetsInProgress--;
                   _dhtgetProcessPending(args.locator, args.multi, ret);
                   _dhtgetDequeue();
               }, {locator:locator,multi:multi},
               function(cbArg, ret) {
                   console.log("ajax error:" + ret);
                   _dhtgetsInProgress--;
                   _dhtgetAbortPending(locator);
                   _dhtgetDequeue();
               }, locator);
}

function _dhtgetDequeue() {
    if( _queuedDhtgets.length ) {
        var locatorSplit = _queuedDhtgets.pop().split(";");
        _dhtgetInternal(locatorSplit[0], locatorSplit[1], locatorSplit[2]);
    }
}

// removes queued dhtgets (requests that have not been made to the daemon)
// this is used by user search dropdown to discard old users we are not interested anymore
function removeUserFromDhtgetQueue(username) {
    var resources = ["profile","avatar"]
    for (var i = 0; i < resources.length; i++) {
        var locator = _dhtgetLocator(username,resources[i],"s");
        var locatorIndex = _queuedDhtgets.indexOf(locator);
        if( locatorIndex > -1 ) {
            _queuedDhtgets.splice(locatorIndex,1);
            delete _dhtgetPendingMap[locator];
        }
    }
}

function removeUsersFromDhtgetQueue(users) {
    for (var i = 0; i < users.length; i++ ) {
        removeUserFromDhtgetQueue( users[i] );
    }
}

// store value at the dht resource
function dhtput( username, resource, multi, value, sig_user, seq, cbFunc, cbArg ) {
    twisterRpc("dhtput", [username,resource,multi, value, sig_user, seq],
               function(args, ret) {
                   if( args.cbFunc )
                       args.cbFunc(args.cbArg, true);
               }, {cbFunc:cbFunc, cbArg:cbArg},
               function(args, ret) {
                   console.log("ajax error:" + ret);
                   if( args.cbFunc )
                       args.cbFunc(args.cbArg, false);
               }, cbArg);
}

// get something from profile and store it in item.text or do callback
function getProfileResource( username, resource, item, cbFunc, cbArg ){
    var profile = undefined;
    if( username in _profileMap ) {
        profile = _profileMap[username];
    } else {
        profile = _getResourceFromStorage("profile:" + username);
    }
    if( profile ) {
        _profileMap[username] = profile;
        if( item )
            item.text(profile[resource]);
        if( cbFunc )
            cbFunc(cbArg, profile[resource]);
    } else {
        dhtget( username, "profile", "s",
               function(args, profile) {
                   if( profile ) {
                       _profileMap[args.username] = profile;
                       _putResourceIntoStorage("profile:" + username, profile);
                       if( args.item )
                           args.item.text(profile[resource]);
                       if( args.cbFunc )
                           args.cbFunc(args.cbArg, profile[resource]);
                   } else {
                       if( args.cbFunc )
                           args.cbFunc(args.cbArg, null);
                   }
               }, {username:username,item:item,cbFunc:cbFunc,cbArg:cbArg});
    }
}

// get fullname and store it in item.text
function getFullname( username, item ){
    getProfileResource( username, "fullname", item);
}

// get bio and store it in item.text
function getBio( username, item ){
    getProfileResource( username, "bio", item);
}

// get location and store it in item.text
function getLocation( username, item ){
    getProfileResource( username, "location", item);
}

// get location and store it in item.text
function getWebpage( username, item ){
    getProfileResource( username, "url", item,
                      function(args, val) {
                           if( val.indexOf("://") < 0 ) {
                               val = "http://" + val;
                           }
                           args.item.attr("href", val);
                      }, {item:item} );
}

// we must cache avatar results to disk to lower bandwidth on
// other peers. dht server limits udp rate so requesting too much
// data will only cause new requests to fail.
function _getResourceFromStorage(locator) {
    var storage = $.localStorage;
    if( storage.isSet(locator) ) {
        var storedResource = storage.get(locator);
        var curTime = new Date().getTime() / 1000;
        // avatar is downloaded once per day
        if( storedResource.time + 3600*24 > curTime ) {
            return storedResource.data;
        }
    }
    return null;
}

function _putResourceIntoStorage(locator, data) {
    var curTime = new Date().getTime() / 1000;
    var storedResource = {time: curTime, data: data};

    var storage = $.localStorage;
    storage.set(locator, storedResource);
}

// get avatar and set it in img.attr("src")
function getAvatar( username, img ){
    if( username == "nobody" ) {
        img.attr('src', "img/tornado_avatar.png");
        return;
    }

    if( username in _avatarMap ) {
        //img.attr('src', "data:image/jpg;base64,"+avatarMap[username]);
        img.attr('src', _avatarMap[username]);
    } else {
        var data = _getResourceFromStorage("avatar:" + username);
        if( data ) {
            _avatarMap[username] = data;
            img.attr('src', data);
        } else {
            dhtget( username, "avatar", "s",
                   function(args, imagedata) {
                       if( imagedata && imagedata.length ) {
                           _avatarMap[args.username] = imagedata;
                           _putResourceIntoStorage("avatar:" + username, imagedata);
                           args.img.attr('src', imagedata);
                       }
                   }, {username:username,img:img} );
        }
    }
}

function clearAvatarAndProfileCache(username) {
    var storage = $.localStorage;
    storage.remove("avatar:" + username);
    storage.remove("profile:" + username);
    if( username in _avatarMap ) {
        delete _avatarMap[username];
    }
    if( username in _profileMap ) {
        delete _profileMap[username];
    }
}

// get estimative for number of followers (use known peers of torrent tracker)
function getFollowers( username, item ) {
    dhtget( username, "tracker", "m",
           function(args, ret) {
               if( ret && ret.length && ret[0]["followers"] ) {
                   args.item.text(ret[0]["followers"])
               }
           }, {username:username,item:item} );
}

function getPostsCount( username, item ) {
    dhtget( username, "status", "s",
           function(args, v) {
               var count = 0;
               if( v && v["userpost"] ) {
                   count = v["userpost"]["k"]+1;
               }
               var oldCount = parseInt(args.item.text());
               if( !oldCount || count > oldCount ) {
                   args.item.text(count);
               }
               if( username == defaultScreenName && count ) {
                   incLastPostId( v["userpost"]["k"] );
               }
           }, {username:username,item:item} );
}


function checkPubkeyExists(username, cbFunc, cbArg) {
    // pubkey is checked in block chain db.
    // so only accepted registrations are reported (local wallet users are not)
    twisterRpc("dumppubkey", [username],
               function(args, ret) {
                   args.cbFunc(args.cbArg, ret.length > 0);
               }, {cbFunc:cbFunc, cbArg:cbArg},
               function(args, ret) {
                   alert(polyglot.t("error_connecting_to_daemon"));
               }, {cbFunc:cbFunc, cbArg:cbArg});
}

// pubkey is obtained from block chain db.
// so only accepted registrations are reported (local wallet users are not)
// cbFunc is called as cbFunc(cbArg, pubkey)
// if user doesn't exist then pubkey.length == 0
function dumpPubkey(username, cbFunc, cbArg) {
    twisterRpc("dumppubkey", [username],
               function(args, ret) {
                   args.cbFunc(args.cbArg, ret);
               }, {cbFunc:cbFunc, cbArg:cbArg},
               function(args, ret) {
                   alert(polyglot.t("error_connecting_to_daemon"));
               }, {cbFunc:cbFunc, cbArg:cbArg});
}

// privkey is obtained from wallet db
// so privkey is returned even for unsent transactions
function dumpPrivkey(username, cbFunc, cbArg) {
    twisterRpc("dumpprivkey", [username],
               function(args, ret) {
                   args.cbFunc(args.cbArg, ret);
               }, {cbFunc:cbFunc, cbArg:cbArg},
               function(args, ret) {
                   args.cbFunc(args.cbArg, "");
                   console.log("dumpprivkey: user unknown");
               }, {cbFunc:cbFunc, cbArg:cbArg});
}

