// twister_io.js
// 2013 Miguel Freitas
//
// low-level twister i/o.
// implements requests of dht resources. multiple pending requests to the same resource are joined.
// cache results (profile, avatar, etc) in memory.
// avatars are cached in localstored (expiration = 24 hours)

// main json rpc method. receives callbacks for success and error
function twisterRpc(method, params, resultFunc, resultArg, errorFunc, errorArg) {
    // removing hardcoded username from javascript: please use url http://user:pwd@localhost:28332 instead
    //var foo = new $.JsonRpcClient({ ajaxUrl: '/', username: 'user', password: 'pwd'});
    var foo = new $.JsonRpcClient({ajaxUrl: window.location.pathname.replace(/[^\/]*$/, '')});
    foo.call(method, params,
        function(ret) {resultFunc(resultArg, ret);},
        function(ret) {errorFunc(errorArg, ret);}  // FIXME why only if "(ret != null)"?
    );
}

// join multiple dhtgets to the same resources in this map
var _dhtgetPendingMap = {};

var _pubkeyMap = {};

// number of dhtgets in progress (requests to the daemon)
var _dhtgetsInProgress = 0;

// keep _maxDhtgets smaller than the number of daemon/browser sockets
// most browsers limit to 6 per domain (see http://www.browserscope.org/?category=network)
var _maxDhtgets = 5;

// requests not yet sent to the daemon due to _maxDhtgets limit
var _queuedDhtgets = [];

// private function to define a key in _dhtgetPendingMap
function _dhtgetLocator(peerAlias, resource, multi) {
    return peerAlias + ';' + resource + ';' + multi;
}

function _dhtgetAddPending(locator, cbFunc, cbReq) {
    if (!_dhtgetPendingMap[locator]) {
        _dhtgetPendingMap[locator] = [];
    }
    _dhtgetPendingMap[locator].push({cbFunc: cbFunc, cbReq: cbReq});
}

function _dhtgetProcessPending(locator, multi, ret) {
    if (_dhtgetPendingMap[locator]) {
        for (var i = 0; i < _dhtgetPendingMap[locator].length; i++) {
            var cbFunc = _dhtgetPendingMap[locator][i].cbFunc;
            var cbReq  = _dhtgetPendingMap[locator][i].cbReq;

            if (multi === 'url') {
                cbFunc(cbReq, ret);  // here is decodeshorturl case
            } else if (multi === 's') {
                if (typeof ret[0] !== 'undefined') {
                    cbFunc(cbReq, ret[0].p.v, ret);
                } else {
                    cbFunc(cbReq);
                }
            } else {
                var multiret = [];
                for (var j = 0; j < ret.length; j++) {
                    multiret.push(ret[j].p.v);
                }
                cbFunc(cbReq, multiret, ret);
            }
        }
        delete _dhtgetPendingMap[locator];
    } else {
        console.warn('_dhtgetProcessPending(): unknown locator ' + locator);
    }
}

function _dhtgetAbortPending(locator) {
    if (_dhtgetPendingMap[locator]) {
        for (var i = 0; i < _dhtgetPendingMap[locator].length; i++) {
            var cbFunc = _dhtgetPendingMap[locator][i].cbFunc;
            var cbReq  = _dhtgetPendingMap[locator][i].cbReq;
            cbFunc(cbReq);
        }
        delete _dhtgetPendingMap[locator];
    } else {
        console.warn('_dhtgetAbortPending(): unknown locator ' + locator);
    }
}

// get data from dht resource
// the value ["v"] is extracted from response and returned to callback
// null is passed to callback in case of an error
function dhtget(peerAlias, resource, multi, cbFunc, cbReq, timeoutArgs) {
    //console.log('dhtget ' + peerAlias + ' ' + resource + ' ' + multi);
    var locator = _dhtgetLocator(peerAlias, resource, multi);
    if (_dhtgetPendingMap[locator]) {
        _dhtgetAddPending(locator, cbFunc, cbReq);
    } else {
        _dhtgetAddPending(locator, cbFunc, cbReq);
        // limit the number of simultaneous dhtgets.
        // this should leave some sockets for other non-blocking daemon requests.
        if (_dhtgetsInProgress < _maxDhtgets) {
            _dhtgetInternal(peerAlias, resource, multi, timeoutArgs);
        } else {
            // just queue the locator. it will be unqueue when some dhtget completes.
            _queuedDhtgets.push(locator);
        }
    }
}

// decode shortened url
// the expanded url is returned to callback
// null is passed to callback in case of an error
function decodeShortURI(locator, cbFunc, cbReq, timeoutArgs) {
    if (!locator) return;
    if (parseInt(twisterVersion) < 93500) {
        console.warn('can\'t fetch URI "' + req + '" — '
            + polyglot.t('daemon_is_obsolete', {versionReq: '0.9.35'}));
        return;
    }

    if (_dhtgetPendingMap[locator]) {
        _dhtgetAddPending(locator, cbFunc, cbReq);
    } else {
        _dhtgetAddPending(locator, cbFunc, cbReq);
        // limit the number of simultaneous decodeshorturl's and dhtgets.
        // this should leave some sockets for other non-blocking daemon requests.
        if (_dhtgetsInProgress < _maxDhtgets) {
            _decodeshorturlInternal(locator, timeoutArgs);
        } else {
            // just queue the locator. it will be unqueue when some dhtget completes.
            _queuedDhtgets.push(locator);
        }
    }
}

function _dhtgetInternal(peerAlias, resource, multi, timeoutArgs) {
    var locator = _dhtgetLocator(peerAlias, resource, multi);
    _dhtgetsInProgress++;
    argsList = [peerAlias, resource, multi];
    if (typeof timeoutArgs !== 'undefined') {
        argsList = argsList.concat(timeoutArgs);
    }
    twisterRpc('dhtget', argsList,
        function(req, ret) {
            _dhtgetsInProgress--;
            _dhtgetProcessPending(req.locator, req.multi, ret);
            _dhtgetDequeue();
        }, {locator: locator, multi: multi},
        function(req, ret) {
            console.warn('RPC "dhtget" error: ' + (ret && ret.message ? ret.message : ret));
            _dhtgetsInProgress--;
            _dhtgetAbortPending(req);
            _dhtgetDequeue();
        }, locator
    );
}

function _decodeshorturlInternal(locator, timeoutArgs) {
    _dhtgetsInProgress++;
    argsList = [locator];
    if (typeof timeoutArgs !== 'undefined') {
        argsList = argsList.concat(timeoutArgs);
    }
    twisterRpc('decodeshorturl', argsList,
        function(req, ret) {
            _dhtgetsInProgress--;
            _dhtgetProcessPending(req, 'url', ret);
            _dhtgetDequeue();
        }, locator,
        function(req, ret) {
            console.warn('RPC "decodeshorturl" error: ' + (ret && ret.message ? ret.message : ret));
            _dhtgetsInProgress--;
            _dhtgetAbortPending(req);
            _dhtgetDequeue();
        }, locator
    );
}

function _dhtgetDequeue() {
    if (_queuedDhtgets.length) {
        var locator = _queuedDhtgets.pop();
        var locatorSplit = locator.split(';');
        if (locatorSplit.length === 3) {
            _dhtgetInternal(locatorSplit[0], locatorSplit[1], locatorSplit[2]);
        } else {
            _decodeshorturlInternal( locator )
        }
    }
}

// removes queued dhtgets (requests that have not been made to the daemon)
// this is used by user search dropdown to discard old users we are not interested anymore
function removeUserFromDhtgetQueue(peerAlias) {
    var resources = ['profile', 'avatar']
    for (var i = 0; i < resources.length; i++) {
        var locator = _dhtgetLocator(peerAlias, resources[i], 's');
        var locatorIndex = _queuedDhtgets.indexOf(locator);
        if (locatorIndex > -1) {
            _queuedDhtgets.splice(locatorIndex, 1);
            delete _dhtgetPendingMap[locator];
        }
    }
}

function removeUsersFromDhtgetQueue(users) {
    for (var i = 0; i < users.length; i++) {
        removeUserFromDhtgetQueue(users[i]);
    }
}

// store value at the dht resource
function dhtput(peerAlias, resource, multi, value, sig_user, seq, cbFunc, cbReq) {
    twisterRpc('dhtput', [peerAlias, resource, multi, value, sig_user, seq],
        function(req, ret) {
            if (req.cbFunc)
                req.cbFunc(req.cbReq, true);
        }, {cbFunc: cbFunc, cbReq: cbReq},
        function(req, ret) {
            console.warn('RPC "dhtput" error: ' + (ret && ret.message ? ret.message : ret));
            if (req.cbFunc)
                req.cbFunc(req.cbReq, false);
        }, {cbFunc: cbFunc, cbReq: cbReq}
    );
}

// get something from profile and store it in elem.text or do callback
function getProfileResource(peerAlias, resource, elem, cbFunc, cbReq) {
    var profile;
    if (twister.profiles[peerAlias]) {
        profile = twister.profiles[peerAlias];
    } else {
        profile = _getResourceFromStorage('profile:' + peerAlias);
        if (profile)
            twister.profiles[peerAlias] = profile;
    }
    if (profile) {
        if (elem)
            elem.text(profile[resource]);
        if (cbFunc)
            cbFunc(cbReq, profile[resource]);
    } else {
        loadProfile(peerAlias,
            function (peerAlias, req, res) {
                if (req.elem)
                    req.elem.text(res[req.resource]);
                if (typeof req.cbFunc === 'function')
                    req.cbFunc(req.cbReq, res[req.resource]);
            },
            {elem: elem, resource: resource, cbFunc: cbFunc, cbReq: cbReq}
        );
    }
}

// get fullname and store it in elem.text
function getFullname(peerAlias, elem) {
    elem.text(peerAlias);  // fallback: set the peerAlias first in case the profile has no fullname
    getProfileResource(peerAlias, 'fullname', undefined,
        function(req, name) {
            if (name && (name = name.trim()))
                req.elem.text(name);

            if (typeof twisterFollowingO !== 'undefined' &&  // FIXME delete this check when you fix client init sequence
                ($.Options.isFollowingMe.val === 'everywhere' || req.elem.hasClass('profile-name'))) {
                // here we try to detect if peer follows us and then display it
                if (twisterFollowingO.knownFollowers.indexOf(req.peerAlias) > -1) {
                    req.elem.addClass('isFollowing');
                    req.elem.attr('title', polyglot.t('follows you'));
                } else if (twisterFollowingO.notFollowers.indexOf(req.peerAlias) === -1) {
                    if (twisterFollowingO.followingsFollowings[req.peerAlias] &&
                        twisterFollowingO.followingsFollowings[req.peerAlias].following) {
                        if (twisterFollowingO.followingsFollowings[req.peerAlias].following.indexOf(defaultScreenName) > -1) {
                            if (twisterFollowingO.knownFollowers.indexOf(req.peerAlias) === -1) {
                                twisterFollowingO.knownFollowers.push(req.peerAlias);
                                twisterFollowingO.save();
                                addPeerToFollowersList(getElem('.followers-modal .followers-list'), req.peerAlias, true);
                                $('.module.mini-profile .open-followers')
                                    .attr('title', twisterFollowingO.knownFollowers.length.toString());
                            }
                            req.elem.addClass('isFollowing');
                            req.elem.attr('title', polyglot.t('follows you'));
                        }
                    } else {
                        loadFollowingFromDht(req.peerAlias, 1, [], 0,
                            function (req, following, seqNum) {
                                if (following.indexOf(defaultScreenName) > -1) {
                                    if (twisterFollowingO.knownFollowers.indexOf(req.peerAlias) === -1) {
                                        twisterFollowingO.knownFollowers.push(req.peerAlias);
                                        addPeerToFollowersList(getElem('.followers-modal .followers-list'), req.peerAlias, true);
                                        $('.module.mini-profile .open-followers')
                                            .attr('title', twisterFollowingO.knownFollowers.length.toString());
                                    }
                                    req.elem.addClass('isFollowing');
                                    req.elem.attr('title', polyglot.t('follows you'));
                                } else if (twisterFollowingO.notFollowers.indexOf(req.peerAlias) === -1)
                                    twisterFollowingO.notFollowers.push(req.peerAlias);

                                twisterFollowingO.save();
                            }, {elem: req.elem, peerAlias: req.peerAlias}
                        );
                    }
                }
            }
        }, {elem: elem, peerAlias: peerAlias}
    );
}

// get bio, format it as post message and store result to elem
function getBioToElem(peerAlias, elem) {
    getProfileResource(peerAlias, 'bio', undefined, fillElemWithTxt, elem);
}

// get tox address and store it in elem.text
function getTox(peerAlias, elem) {
    getProfileResource(peerAlias, 'tox', false,
        function(elem, val) {
            if (val) {
                elem.attr('href', 'tox:' + val);
                elem.next().attr('data', val).attr('title', 'Copy to clipboard');
                elem.parent().css('display', 'inline-block').parent().show();
            }
        }, elem
    );
}

// get bitmessage address and store it in elem.text
function getBitmessage(peerAlias, elem) {
    getProfileResource(peerAlias, 'bitmessage', false,
        function(elem, val) {
            if (val) {
                elem.attr('href', 'bitmsg:' + val + '?action=add&label=' + peerAlias);
                elem.next().attr('data', val).attr('title', 'Copy to clipboard');
                elem.parent().css('display', 'inline-block').parent().show();
            }
        }, elem
    );
}

// get location and store it in elem.text
function getLocation(peerAlias, elem) {
    getProfileResource(peerAlias, 'location', elem);
}

// get location and store it in elem.text
function getWebpage(peerAlias, elem) {
    getProfileResource(peerAlias, 'url', elem,
        function(elem, val) {
            if (typeof(val) !== 'undefined') {
                if (val.indexOf('://') < 0) {
                    val = 'http://' + val;
                }
                elem.attr('href', val);
            }
        }, elem
    );
}

function getGroupChatName(groupAlias, elem) {
    twisterRpc('getgroupinfo', [groupAlias],
        function(elem, ret) {
            elem.text(ret.description);
        }, elem,
        function(req, ret) {
            console.warn('RPC "getgroupinfo" error: ' + (ret && ret.message ? ret.message : ret));
            req.elem.text(req.groupAlias);
        }, {elem: elem, groupAlias: groupAlias}
    );
}

// we must cache avatar results to disk to lower bandwidth on
// other peers. dht server limits udp rate so requesting too much
// data will only cause new requests to fail.
function _getResourceFromStorage(locator) {
    var storage = $.localStorage;
    if (storage.isSet(locator)) {
        var storedResource = storage.get(locator);
        var curTime = new Date().getTime() / 1000;
        // avatar is downloaded once per day    FIXME why once per day? what about profiles?
        // FIXME need to check what type of data is requested and what time is allowed for it
        if (storedResource.time + 86400 > curTime) {  // 3600 * 24
            return storedResource.data;
        }
    }
    return null;
}

function _putResourceIntoStorage(locator, data) {
    $.localStorage.set(locator, {
        time: Math.trunc(new Date().getTime() / 1000),
        data: data
    });
}

function cleanupStorage() {
    var curTime = new Date().getTime() / 1000;
    var storage = $.localStorage, keys = storage.keys(), item = '';
    var delAvatars = delProfiles = 0;

    for (var i = 0; i < keys.length; i++) {
        item = keys[i];
        // FIXME need to decide what time for type of data is allowed
        if (item.substr(0, 7) === 'avatar:') {
            if (storage.get(item).time + 86400 < curTime) {  // 3600 * 24 hours
                storage.remove(item);
                delAvatars++;
                //console.log('local storage item \'' + item + '\' was too old, deleted');
            }
        } else if (item.substr(0, 8) === 'profile:') {
            if (storage.get(item).time + 86400 < curTime) {  // 3600 * 24 hours
                storage.remove(item);
                delProfiles++;
                //console.log('local storage item \'' + item + '\' was too old, deleted');
            }
        }
    }

    console.log('cleaning of storage is completed for ' + (new Date().getTime() / 1000 - curTime) + 's');
    if (delAvatars) console.log('  ' + delAvatars + ' cached avatars was too old, deleted');
    if (delProfiles) console.log('  ' + delProfiles + ' cached profiles was too old, deleted');
    console.log('  ' + 'there was ' + i + ' items in total, now ' + (i - delAvatars - delProfiles));
}

// get avatar and set it in img.attr("src")
// TODO rename to getAvatarImgToELem(), move nin theme related stuff to nin's theme_option.js
function getAvatar(peerAlias, img) {
    if (!img.length)
        return;

    if (peerAlias === 'nobody') {

        var avatar = 'img/tornado_avatar.png';

        switch ($.Options.theme.val) {
          case 'nin':
            avatar = 'theme_nin/img/tornado_avatar.png';
          break;
          case 'nin_original':
            avatar = 'theme_nin_original/img/tornado_avatar.png';
          break;
        }

        img.attr('src', avatar);

        return;
    }

    if (twister.avatars[peerAlias]) {
        img.attr('src', twister.avatars[peerAlias].src);
    } else {
        var data = _getResourceFromStorage('avatar:' + peerAlias);

        if (data) {
            if (typeof data !== 'object')
                data = {src: data, version: 0};

            switch (data.src.substr(0, 4)) {
                case 'jpg/':
                    data.src = 'data:image/jpeg;base64,/9j/' + window.btoa(data.src.slice(4));
                    break;
                case 'png/':
                    data.src = 'data:image/png;base64,' + window.btoa(data.src.slice(4));
                    break;
                case 'gif/':
                    data.src = 'data:image/gif;base64,' + window.btoa(data.src.slice(4));
                    break;
            }
            twister.avatars[peerAlias] = data;
            img.attr('src', data.src);
        } else {
            loadAvatar(peerAlias,
                function (peerAlias, req, res) {
                    req.attr('src', res);
                },
                img
            );
        }
    }
}

function loadProfile(peerAlias, cbFunc, cbReq) {
    dhtget(peerAlias, 'profile', 's',
        function(req, res, resRaw) {
            if (!resRaw || typeof res !== 'object')
                return;

            res.version = parseInt(resRaw[0].p.seq);

            if (!twister.profiles[req.peerAlias] || !twister.profiles[req.peerAlias].version
                || res.version > twister.profiles[req.peerAlias].version) {
                console.log('got ' + req.peerAlias + '\'s profile version ' + res.version + ' — going to cache and redraw globally');
                cacheProfile(req.peerAlias, res);
                redrawProfile(req.peerAlias, res);
            }

            if (typeof req.cbFunc === 'function')
                req.cbFunc(req.peerAlias, req.cbReq, res);
        },
        {peerAlias: peerAlias, cbFunc: cbFunc, cbReq: cbReq}
    );
}

function loadAvatar(peerAlias, cbFunc, cbReq) {
    dhtget(peerAlias, 'avatar', 's',
        function(req, res, resRaw) {
            if (!resRaw)
                return;

            if (!res)
                res = 'img/genericPerson.png';

            var version = parseInt(resRaw[0].p.seq);

            if (!twister.avatars[req.peerAlias] || !twister.avatars[req.peerAlias].version
                || version > twister.avatars[req.peerAlias].version) {
                console.log('got ' + req.peerAlias + '\'s avatar version ' + version + ' — going to cache and redraw globally');
                cacheAvatar(req.peerAlias, res, version);
                redrawAvatar(req.peerAlias, res);
            }

            if (typeof req.cbFunc === 'function')
                req.cbFunc(req.peerAlias, req.cbReq, res);
        },
        {peerAlias: peerAlias, cbFunc: cbFunc, cbReq: cbReq}
    );
}

function cacheProfile(peerAlias, req) {
    var dat = {};
    for (var i in req)
        if (req[i])
            dat[i] = req[i];

    twister.profiles[peerAlias] = dat;

    _putResourceIntoStorage('profile:' + peerAlias, dat);
}

function cacheAvatar(peerAlias, req, version) {
    twister.avatars[peerAlias] = {src: req, version: version};

    if (req === 'img/genericPerson.png')
        return;

    if (req.substr(0, 27) === 'data:image/jpeg;base64,/9j/') {
        req = 'jpg/' + window.atob(req.slice(27));
    } else {
        var s = req.substr(0, 22);
        if (s === 'data:image/png;base64,' || s === 'data:image/gif;base64,')
            req = req.substr(11, 3) + '/' + window.atob(req.slice(22));
    }
    _putResourceIntoStorage('avatar:' + peerAlias, {src: req, version: version});
}

function saveProfile(peerAlias, req, cbFunc, cbReq, cbErrFunc, cbErrReq) {
    if (twister.profiles[peerAlias] && twister.profiles[peerAlias].version)
        req.version = ++twister.profiles[peerAlias].version;
    else
        req.version = 1;

    cacheProfile(peerAlias, req);

    var dat = {};
    for (var i in req)
        if (i !== 'version' && req[i])
            dat[i] = req[i];

    dhtput(peerAlias, 'profile', 's', dat,
        peerAlias, req.version,
        function (req, res) {
            if (!res) {
                if (typeof req.cbErrFunc === 'function')
                    req.cbErrFunc(req.cbErrReq);

                return;
            }

            if (typeof req.cbFunc === 'function')
                req.cbFunc(req.cbReq);
        },
        {cbFunc: cbFunc, cbReq: cbReq, cbErrFunc: cbErrFunc, cbErrReq: cbErrReq}
    );
}

function saveAvatar(peerAlias, req, cbFunc, cbReq, cbErrFunc, cbErrReq) {
    if (twister.avatars[peerAlias] && twister.avatars[peerAlias].version)
        var version = ++twister.avatars[peerAlias].version;
    else
        var version = 1;

    cacheAvatar(peerAlias, req, version);

    dhtput(peerAlias, 'avatar', 's', req,
        peerAlias, version,
        function (req, res) {
            if (!res) {
                if (typeof req.cbErrFunc === 'function')
                    req.cbErrFunc(req.cbErrReq);

                return;
            }

            if (typeof req.cbFunc === 'function')
                req.cbFunc(req.cbReq);
        },
        {cbFunc: cbFunc, cbReq: cbReq, cbErrFunc: cbErrFunc, cbErrReq: cbErrReq}
    );
}

// get estimative for number of followers (use known peers of torrent tracker)
function getFollowers(peerAlias, elem) {
    dhtget(peerAlias, 'tracker', 'm',
        function(elem, ret) {
            if (ret && ret.length && ret[0].followers) {
                elem.text(ret[0].followers)
            }
        }, elem
    );
}

function getPostsCount(peerAlias, elem) {
    dhtget(peerAlias, 'status', 's',
        function(req, v) {
            var count = 0;
            if (v && v.userpost) {
                count = v.userpost.k + 1;
            }
            var oldCount = parseInt(req.elem.text());
            if (!oldCount || count > oldCount) {
                req.elem.text(count);
            }
            if (peerAlias === defaultScreenName && count) {
                incLastPostId(v.userpost.k);
            }
        }, {peerAlias: peerAlias, elem: elem}
    );
}

function getStatusTime(peerAlias, elem) {
    dhtget(peerAlias, 'status', 's',
        function (req, ret) {
            if (!ret || !ret.userpost)
                return;

            req.elem.text(timeGmtToText(ret.userpost.time))
                .closest('.latest-activity')
                    .attr('data-screen-name', req.peerAlias)
                    .attr('data-id', ret.userpost.k)
                    .attr('data-time', ret.userpost.time)
            ;
        }, {peerAlias: peerAlias, elem: elem}
    );
}

function getPostMaxAvailability(peerAlias, k, cbFunc, cbReq) {
    twisterRpc('getpiecemaxseen', [peerAlias, k],
        function(req, ret) {
            req.cbFunc(req.cbReq, ret);
        }, {cbFunc: cbFunc, cbReq: cbReq},
        function(req, ret) {
            console.warn('RPC "getpiecemaxseen" error: ' + (ret && ret.message ? ret.message : ret));
        }
    );
}

function checkPubkeyExists(peerAlias, cbFunc, cbReq) {
    // pubkey is checked in block chain db.
    // so only accepted registrations are reported (local wallet users are not)
    twisterRpc('dumppubkey', [peerAlias],
        function(req, ret) {
            req.cbFunc(req.cbReq, ret.length > 0);
        }, {cbFunc: cbFunc, cbReq: cbReq},
        function(req, ret) {
            console.warn('RPC "dumppubkey" error: ' + (ret && ret.message ? ret.message : ret));
            alert(polyglot.t('error_connecting_to_daemon'));
        }
    );
}

// pubkey is obtained from block chain db.
// so only accepted registrations are reported (local wallet users are not)
// cbFunc is called as cbFunc(cbReq, pubkey)
// if user doesn't exist then pubkey.length == 0
function dumpPubkey(peerAlias, cbFunc, cbReq) {
    if (_pubkeyMap[peerAlias]) {
        if (cbFunc)
            cbFunc(cbReq, _pubkeyMap[peerAlias]);
    } else {
        twisterRpc('dumppubkey', [peerAlias],
            function (req, ret) {
                if (ret.length > 0) {
                    _pubkeyMap[peerAlias] = ret;
                }
                if (req.cbFunc) {
                    req.cbFunc(req.cbReq, ret);
                }
            }, {cbFunc: cbFunc, cbReq: cbReq},
            function (req, ret) {
                console.warn('RPC "dumppubkey" error: ' + (ret && ret.message ? ret.message : ret));
                alert(polyglot.t('error_connecting_to_daemon'));
            }
        );
    }
}

// privkey is obtained from wallet db
// so privkey is returned even for unsent transactions
function dumpPrivkey(peerAlias, cbFunc, cbReq) {
    twisterRpc('dumpprivkey', [peerAlias],
        function(req, ret) {
            req.cbFunc(req.cbReq, ret);
        }, {cbFunc: cbFunc, cbReq: cbReq},
        function(req, ret) {
            req.cbFunc(req.cbReq, '');
            console.warn('user unknown — RPC "dumppubkey" error: ' + (ret && ret.message ? ret.message : ret));
        }, {cbFunc: cbFunc, cbReq: cbReq}
    );
}
