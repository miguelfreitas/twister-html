// twister_following.js
// 2013 Miguel Freitas
//
// Manage list of following users. Load/Save to localstorage and DHT.
// Provides random user suggestions to follow.

var followingUsers = [];
var _isFollowPublic = {};
var _followsPerPage = 200;
var _maxFollowingPages = 50;
var _followingSeqNum = 0;
var _followSuggestions = [];
var _searchingPartialName = '';
var _searchKeypressTimer = undefined;
var _lastSearchUsersResults = [];
var _lastSearchUsersResultsRemovedFromDHTgetQueue = true;
var _lastLoadFromDhtTime = 0;

var twisterFollowingO = undefined;
var newUsers = undefined;

var TwisterFollowing = function (user) {
    if (!(this instanceof TwisterFollowing))
        return new TwisterFollowing(user);

    this.init(user);
};

TwisterFollowing.minUpdateInterval = 43200;  // 1/2 day
TwisterFollowing.maxUpdateInterval = 691200; // 8 days

TwisterFollowing.prototype = {
    user: undefined,
    init: function (user) {
        this.user = user;
        this.load();
        this.update();
    },
    knownFollowers: [],
    knownFollowersResetTime: new Date().getTime() / 1000,
    notFollowers: [],
    /*
    followinsFollowings = {
        "username": {
            "lastUpdate": <updatetime>,
            "updateInterval": <updateinterval>,
            "following": []
        }
    }
     */
    followingsFollowings: {},

    load: function () {
        var ns = $.initNamespaceStorage(this.user);

        if (ns.localStorage.isSet("followingsFollowings"))
            this.followingsFollowings = ns.localStorage.get("followingsFollowings");

        if (ns.localStorage.isSet("knownFollowersResetTime"))
            this.knownFollowersResetTime = ns.localStorage.get("knownFollowersResetTime");

        var ctime = new Date().getTime() / 1000;
        if (ctime - this.knownFollowersResetTime < TwisterFollowing.maxUpdateInterval &&
            ns.localStorage.isSet("knownFollowers")) {
            this.knownFollowers = ns.localStorage.get("knownFollowers");
        } else {
            this.knownFollowers = [];
            this.knownFollowersResetTime = ctime;
            ns.localStorage.set("knownFollowersResetTime", this.knownFollowersResetTime);
        }

        if (ns.sessionStorage.isSet("notFollowers"))
            this.notFollowers = ns.sessionStorage.get("notFollowers");
    },

    save: function () {
        var ns = $.initNamespaceStorage(this.user);
        ns.localStorage.set("followingsFollowings", this.followingsFollowings);
        ns.sessionStorage.set("notFollowers", this.notFollowers);
        ns.localStorage.set("knownFollowers", this.knownFollowers);
        ns.localStorage.set("knownFollowersResetTime", this.knownFollowersResetTime);
    },

    update: function (username) {
        var oneshot = false;
        var i = 0;
        if (typeof(username) !== 'undefined') {
            //activate updating for only one user...
            i = followingUsers.indexOf(username);

            if (i > -1) {
                oneshot = true;
            } else {
                if (typeof(this.followingsFollowings[username]) !== 'undefined') {
                    delete this.followingsFollowings[username];
                    this.save();
                }
                if (typeof _idTrackerMap !== 'undefined' && username in _idTrackerMap)
                   delete _idTrackerMap[username];
                if (typeof _lastHaveMap !== 'undefined' && username in _lastHaveMap)
                   delete _lastHaveMap[username];
                return;
            }
        }

        var updated = false;
        for (var user in this.followingsFollowings) {
            if (followingUsers.indexOf(user) < 0) {
                delete this.followingsFollowings[user];
                updated = true;
            }
        }
        if (updated)
            this.save();

        if (typeof _idTrackerMap !== 'undefined')
            for (var user in _idTrackerMap) {
                if (followingUsers.indexOf(user) < 0)
                    delete _idTrackerMap[user];
            }
        if (typeof _lastHaveMap !== 'undefined')
            for (var user in _lastHaveMap) {
                if (followingUsers.indexOf(user) < 0)
                    delete _lastHaveMap[user];
            }

        for (; i < followingUsers.length; i++) {
            var ctime = new Date().getTime() / 1000;

            if (typeof(this.followingsFollowings[followingUsers[i]]) === 'undefined' ||
                ctime - this.followingsFollowings[followingUsers[i]]["lastUpdate"] >= this.followingsFollowings[followingUsers[i]]["updateInterval"]) {
                loadFollowingFromDht(followingUsers[i], 1, [], 0, function (args, following, seqNum) {
                    if (following.indexOf(args.tf.user) > -1) {
                        if (args.tf.knownFollowers.indexOf(args.fu) < 0) {
                            args.tf.knownFollowers.push(args.fu);
                            addPeerToFollowersList(getElem('.followers-modal .followers-list'), args.fu, true);
                        }
                    } else {
                        if (args.tf.notFollowers.indexOf(args.fu) < 0) {
                            args.tf.notFollowers.push(args.fu);
                        }
                        var tmpi = args.tf.knownFollowers.indexOf(args.fu);
                        if (tmpi > -1) {
                            args.tf.knownFollowers.splice(tmpi, 1);
                            getElem('.followers-modal .followers-list')
                                .find('li[data-peer-alias="' + args.fu + '"]').remove();
                        }
                    }
                    $('.module.mini-profile .open-followers')
                        .attr('title', args.tf.knownFollowers.length.toString());

                    var ctime = new Date().getTime() / 1000;
                    if (typeof(args.tf.followingsFollowings[args.fu]) === 'undefined' ||
                        typeof(args.tf.followingsFollowings[args.fu]["following"]) === 'undefined') {
                        args.tf.followingsFollowings[args.fu] = {};
                        args.tf.followingsFollowings[args.fu]["lastUpdate"] = ctime;
                        args.tf.followingsFollowings[args.fu]["updateInterval"] = TwisterFollowing.minUpdateInterval;
                        args.tf.followingsFollowings[args.fu]["following"] = following;
                    } else {
                        var diff = []; //diff for following
                        var difu = []; //diff for unfollowing
                        var ff = args.tf.followingsFollowings[args.fu]["following"];

                        //is there any new following?
                        for (var j = 0; j < following.length; j++) {
                            if (ff.indexOf(following[j]) === -1) {
                                diff.push(following[j]);
                                ff.push(following[j]);
                            }
                        }
                        //did user unfollow someone?
                        for (var j = ff.length - 1; j >= 0 && ff.length > following.length; j--) {
                            if (following.indexOf(ff[j]) === -1) {
                                difu.push(ff[j]);
                                ff.splice(j, 1);
                            }
                        }

                        if (diff.length > 0 || difu.length > 0) {
                            args.tf.followingsFollowings[args.fu]["updateInterval"] = TwisterFollowing.minUpdateInterval;
                            args.tf.followingsFollowings[args.fu]["lastUpdate"] = ctime;
                        } else if (args.tf.followingsFollowings[args.fu]["updateInterval"] < TwisterFollowing.maxUpdateInterval) {
                            args.tf.followingsFollowings[args.fu]["updateInterval"] *= 2;
                        } else {
                            args.tf.followingsFollowings[args.fu]["lastUpdate"] = ctime;
                        }
                    }
                    args.tf.save();
                }, {"tf": this, "fu": followingUsers[i]});
            }
            if (oneshot)
                break;
        }
    }
};

// load followingUsers from localStorage
function loadFollowingFromStorage() {
    var ns=$.initNamespaceStorage(defaultScreenName);
    if( ns.localStorage.isSet("followingUsers") )
        followingUsers = ns.localStorage.get("followingUsers");
    if( ns.localStorage.isSet("isFollowPublic") )
        _isFollowPublic = ns.localStorage.get("isFollowPublic");
    if( ns.localStorage.get("followingSeqNum") > _followingSeqNum)
        _followingSeqNum = ns.localStorage.get("followingSeqNum");
    if( ns.localStorage.isSet("lastLoadFromDhtTime") )
        _lastLoadFromDhtTime = ns.localStorage.get("lastLoadFromDhtTime");
    // follow ourselves
    if(followingUsers.indexOf(defaultScreenName) < 0) {
        followingUsers.push(defaultScreenName);
    }
}

// save list of following to localStorage
function saveFollowingToStorage() {
    var ns=$.initNamespaceStorage(defaultScreenName);
    ns.localStorage.set("followingUsers", followingUsers);
    ns.localStorage.set("isFollowPublic", _isFollowPublic);
    ns.localStorage.set("followingSeqNum", _followingSeqNum);
    ns.localStorage.set("lastLoadFromDhtTime", _lastLoadFromDhtTime);
}

// load public list of following users from dht resources
// "following1", "following2" etc.
// it will stop loading when resource is empty
// callback is called as: doneCb(doneArg, followingList, seqNum)
function loadFollowingFromDht(username, pageNumber, followingList, seqNum, doneCb, doneArg) {
    if( !pageNumber ) pageNumber = 1;

    dhtget( username, "following" + pageNumber, "s",
           function(args, following, rawdata) {
               if( rawdata ) {
                   var seq = parseInt(rawdata[0]["p"]["seq"]);
                   if( seq > args.seqNum ) args.seqNum = seq;
               }

               if( following ) {
                   for( var i = 0; i < following.length; i++ ) {
                       if( args.followingList.indexOf(following[i]) < 0 ) {
                           args.followingList.push(following[i]);
                       }
                    }
               }

               if( following && following.length && args.pageNumber < _maxFollowingPages) {
                   loadFollowingFromDht(username, args.pageNumber,
                                        args.followingList, args.seqNum,
                                        args.doneCb, args.doneArg);
               } else {
                   if( args.doneCb )
                       args.doneCb(args.doneArg, args.followingList, args.seqNum);
               }
           }, {pageNumber:pageNumber+1, followingList:followingList, seqNum:seqNum,
               doneCb:doneCb, doneArg:doneArg});
}

// get number of following from dht and set item.text()
function getNumFollowing( username, item ) {
    loadFollowingFromDht( username, 1, [], 0,
                          function(args, following, seqNum) {
                             item.text( following.length );
                         }, null);
}

function loadFollowingIntoList( username, html_list ) {
    loadFollowingFromDht( username, 1, [], 0,
        function(args, following, seqNum) {
            html_list.html("");
            $.each(following, function(i, following_user){
                var following_user_li = $( "#following-by-user-template" ).children().clone(true);

                // link follower to profile page
                $(following_user_li.children()[0]).attr("data-screen-name", following_user);
                $(following_user_li.children()[0]).attr("href", $.MAL.userUrl(following_user));

                following_user_li.find(".following-screen-name b").text(following_user);
                getAvatar( following_user, following_user_li.find(".mini-profile-photo") );
                var $followingName = following_user_li.find(".mini-following-name");
                $followingName.text(following_user);
                getFullname( following_user, $followingName );

                html_list.append( following_user_li );
            });
        }, null);
}

// load following list from localStorage and then from the dht resource
function loadFollowing(cbFunc, cbArg) {
    loadFollowingFromStorage();
    updateFollowing();

    var curTime = new Date().getTime() / 1000;

    // optimization to avoid costly dht lookup everytime the home is loaded
    if( curTime > _lastLoadFromDhtTime + 3600*24 ||
        document.URL.indexOf("following") >= 0 ) {
        var numFollow = followingUsers.length;
        loadFollowingFromDht( defaultScreenName, 1, [], _followingSeqNum,
                              function(args, following, seqNum) {
                                 var curTime = new Date().getTime() / 1000;
                                 _lastLoadFromDhtTime = curTime;

                                 for( var i = 0; i < following.length; i++ ) {
                                     if( followingUsers.indexOf(following[i]) < 0 ) {
                                         followingUsers.push(following[i]);
                                     }
                                     _isFollowPublic[following[i]] = true;
                                  }

                                 if( args.numFollow != followingUsers.length ||
                                     seqNum != _followingSeqNum ) {
                                     _followingSeqNum = seqNum;
                                     // new following loaded from dht
                                     saveFollowingToStorage();
                                     updateFollowing();
                                 }

                                 if( args.cbFunc )
                                     args.cbFunc(args.cbArg);
                             }, {numFollow:numFollow, cbFunc:cbFunc, cbArg:cbArg} );
    } else {
        if( cbFunc )
            cbFunc(cbArg);
    }
}

// save list of following to dht resource. each page ("following1", following2"...)
// constains up to _followsPerPage elements. alternatively we might keep track
// of total strings size to optimize the maximum storage (8kb in node.cpp, but 4kb is
// probably a good target).
function saveFollowingToDht() {
    var following = [];
    var pageNumber = 1;
    for( var i = 0; i < followingUsers.length; i++ ) {
        if( followingUsers[i] in _isFollowPublic &&
            _isFollowPublic[followingUsers[i]] ) {
            following.push(followingUsers[i]);
        }
        if( following.length == _followsPerPage || i == followingUsers.length-1) {
            dhtput( defaultScreenName, "following" + pageNumber, "s",
                   following, defaultScreenName, _followingSeqNum+1 );
            pageNumber++;
            following = [];
        }
    }
    dhtput( defaultScreenName, "following" + pageNumber, "s",
           following, defaultScreenName, _followingSeqNum+1 );

    _followingSeqNum++;
}

// save following to local storage, dht and json rpc
function saveFollowing(cbFunc, cbArg) {
    saveFollowingToDht();
    saveFollowingToStorage();
    updateFollowing(cbFunc, cbArg);
}

// update json rpc with current list of following
function updateFollowing(cbFunc, cbArg) {
    twisterRpc("follow", [defaultScreenName,followingUsers],
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

// follow a new single user.
// it is safe to call this even if username is already in followingUsers.
// may also be used to set/clear publicFollow.
function follow(user, publicFollow, cbFunc, cbArg) {
    //console.log('we are following @'+user);
    if( followingUsers.indexOf(user) < 0 ) {
        followingUsers.push(user);
        twisterFollowingO.update(user);
    }
    if( publicFollow == undefined || publicFollow )
        _isFollowPublic[user] = true;
    else
        delete _isFollowPublic[user];
    saveFollowing(cbFunc, cbArg);
}

// unfollow a single user
function unfollow(user, cbFunc, cbArg) {
    //console.log('we are not following @'+user+' anymore');
    var i = followingUsers.indexOf(user);
    if (i >= 0) {
        followingUsers.splice(i, 1);
        twisterFollowingO.update(user);
    }
    delete _isFollowPublic[user];
    saveFollowing();

    twisterRpc("unfollow", [defaultScreenName,[user]],
               function(args, ret) {
                   if( args.cbFunc )
                       args.cbFunc(args.cbArg, true);
               }, {cbFunc:cbFunc, cbArg:cbArg},
               function(args, ret) {
                   console.log("ajax error:" + ret);
                   if( args.cbFunc )
                       args.cbFunc(args.cbArg, false);
               }, {cbFunc:cbFunc, cbArg:cbArg});
}

// check if public following
function isPublicFollowing(user) {
    if( followingUsers.indexOf(user) < 0 ) {
        return false;
    }
    if( (user in _isFollowPublic) && _isFollowPublic[user] == true ) {
        //console.log("isPublicFollowing( " +user +" ) = "+true);
        return true;
    } else {
        //console.log("isPublicFollowing( " +user +" ) = "+false);
        return false;
    }
}

// check if following list is empty
function followingEmptyOrMyself() {
    return (!followingUsers.length || (followingUsers.length === 1 && followingUsers[0] === defaultScreenName))
}

/* NEW USER SEARCH */
var NewUserSearch = function(){
    if (!(this instanceof NewUserSearch))
        return new NewUserSearch();

    this.init();
};

NewUserSearch.knownNewUsers = [];
NewUserSearch.isNewUserThRunning = false;
NewUserSearch.isNewUserModalOpen = false;
NewUserSearch.startProcessedBlock = -1;
NewUserSearch.lastProcessedBlock = -1;
NewUserSearch.processBlockUsersProxy = function(block, args){
    if (args.obj instanceof NewUserSearch)
        args.obj.processBlockUsers(block, args);
};
NewUserSearch.live = function(module) {
    newUsers.getNewUsers(module);
};
NewUserSearch.processBestBlockUsersProxy = function(block, args){
    if (block.height > NewUserSearch.startProcessedBlock) {
        if (args.obj instanceof NewUserSearch)
            args.obj.processBlockUsers(block, {obj: args.obj, args: {n: 0, offset: 0, module: args.args.module, prepend: true, live: true}});
    }
};

NewUserSearch.prototype = {
    storage: undefined,
    isForced: false,

    init: function() {
        this.storage = $.initNamespaceStorage(defaultScreenName).sessionStorage;
        if (this.storage.isSet("knownNewUsers"))
            NewUserSearch.knownNewUsers = this.storage.get("knownNewUsers");
        if (this.storage.isSet("lastProcessedBlock"))
            NewUserSearch.lastProcessedBlock = this.storage.get("lastProcessedBlock");
        if (this.storage.isSet("startProcessedBlock"))
            NewUserSearch.startProcessedBlock = this.storage.get("startProcessedBlock");

        if ($.Options.NewUsersLiveTracking.val === 'enable')
            setInterval(function(){NewUserSearch.live($('.module.new-users'));}, 10000);
    },

    save: function(){
        this.storage.set("knownNewUsers", NewUserSearch.knownNewUsers);
        this.storage.set("lastProcessedBlock", NewUserSearch.lastProcessedBlock);
        this.storage.set("startProcessedBlock", NewUserSearch.startProcessedBlock);
    },

    getNewUsers: function(module) {
        requestBestBlock(NewUserSearch.processBestBlockUsersProxy, {obj: this, args: {module: module}});
    },

    getLastNUsers: function (n, offset, module, forced) {
        for (var i = offset; i < NewUserSearch.knownNewUsers.length && i < offset + n; i++)
            processWhoToFollowSuggestion(module, NewUserSearch.knownNewUsers[i]);

        if (NewUserSearch.knownNewUsers.length >= n + offset) {
            NewUserSearch.isNewUserThRunning = false;
            return true;
        }

        if (NewUserSearch.isNewUserThRunning)
            return false;

        NewUserSearch.isNewUserThRunning = true;
        this.isForced = forced;

        if (NewUserSearch.lastProcessedBlock == -1)
            requestBestBlock(NewUserSearch.processBlockUsersProxy, {obj: this, args: {n: n, offset: offset, module: module}});
        else
            requestNthBlock(NewUserSearch.lastProcessedBlock - 1, NewUserSearch.processBlockUsersProxy, {obj: this, args: {n: n, offset: offset, module: module}});

        return true;
    },

    processBlockUsers: function (block, args) {
        if (NewUserSearch.startProcessedBlock === -1)
            NewUserSearch.startProcessedBlock = block.height;
        if (NewUserSearch.lastProcessedBlock === -1 || block.height < NewUserSearch.lastProcessedBlock)
            NewUserSearch.lastProcessedBlock = block.height;

        if ((this.isForced || NewUserSearch.isNewUserModalOpen) &&
            NewUserSearch.knownNewUsers.length + block.usernames.length < args.args.n + args.args.offset &&
            typeof block.previousblockhash !== 'undefined') {

            setTimeout(function () {
                requestBlock(block.previousblockhash, NewUserSearch.processBlockUsersProxy, {obj: args.obj, args: args.args});
            }, 10);

        } else {
            NewUserSearch.isNewUserThRunning = false;
            this.isForced = false;
        }

        var i = 0;
        for (; i < block.usernames.length; i++) {
            if (NewUserSearch.knownNewUsers.indexOf(block.usernames[i]) == -1) {
                processWhoToFollowSuggestion(args.args.module, block.usernames[i], undefined, args.args.prepend);
                if (args.args.prepend)
                    NewUserSearch.knownNewUsers.unshift(block.usernames[i]);
                else
                    NewUserSearch.knownNewUsers.push(block.usernames[i]);
                if (!args.args.live && NewUserSearch.knownNewUsers.length >= args.args.n + args.args.offset)
                    break;
            }
        }
        for (; i < block.usernames.length; i++) {
            if (NewUserSearch.knownNewUsers.indexOf(block.usernames[i]) == -1) {
                if (args.args.prepend)
                    NewUserSearch.knownNewUsers.unshift(block.usernames[i]);
                else
                    NewUserSearch.knownNewUsers.push(block.usernames[i]);
            }
        }

        this.save();
    }
};

// randomly choose a user we follow, get "following1" from him and them
// choose a suggestion from their list. this function could be way better, but
// that's about the simplest we may get to start with.
function getRandomFollowSuggestion() {
    if (followingEmptyOrMyself())
        return;

    var i = Math.floor(Math.random() * followingUsers.length);  // Math.floor(Math.random() * (max - min + 1)) + min for getting inclusive random from min to max; our min and max are 0 and followingUsers.length - 1
    while (followingUsers[i] === defaultScreenName)
        i = Math.floor(Math.random() * followingUsers.length);

    if (typeof twisterFollowingO === 'undefined' ||
        typeof twisterFollowingO.followingsFollowings[followingUsers[i]] === 'undefined') {
            setTimeout(getRandomFollowSuggestion, 500);
            return;
    }

    var suggested = false;
    var j = Math.floor(Math.random() * twisterFollowingO.followingsFollowings[followingUsers[i]].following.length);
    var module = $('.module.who-to-follow');
    for( ; j < twisterFollowingO.followingsFollowings[followingUsers[i]].following.length; j++ ) {
        if( followingUsers.indexOf(twisterFollowingO.followingsFollowings[followingUsers[i]].following[j]) < 0 &&
            _followSuggestions.indexOf(twisterFollowingO.followingsFollowings[followingUsers[i]].following[j]) < 0) {
                processWhoToFollowSuggestion(module, twisterFollowingO.followingsFollowings[followingUsers[i]].following[j], followingUsers[i]);
                _followSuggestions.push(twisterFollowingO.followingsFollowings[followingUsers[i]].following[j]);
                suggested = true;
                break;
        }
    }
    if (!suggested)
        setTimeout(getRandomFollowSuggestion, 500);
}

function whoFollows(username) {
    var list = [];

    for (var following in twisterFollowingO.followingsFollowings) {
        if (twisterFollowingO.followingsFollowings[following]["following"].indexOf(username) > -1) {
            list.push(following);
        }
    }
    return list;
}

function fillWhoFollows(list, item, offset, size) {
    for (var i = offset; i < offset + size; i++) {
        var follower_link = $('<a class="mini-follower-link"></a>')
            .on('click', muteEvent).on('mouseup', handleClickOpenProfileModal);

        // link follower to profile page
        follower_link.attr("data-screen-name", list[i]);
        follower_link.attr("href", $.MAL.userUrl(list[i]));
        follower_link.text(list[i]);
        getFullname( list[i], follower_link );

        item.append( follower_link );
    }
}

function getWhoFollows(peerAlias, elem) {
    if (!defaultScreenName)
        return;

    var list = whoFollows(peerAlias);

    fillWhoFollows(list, elem, 0, (list.length > 5 ? 5 : list.length));

    if (list.length > 5)
        twister.tmpl.profileShowMoreFollowers.clone(true)
            .text(polyglot.t('show_more_count', {'smart_count': list.length - 5}))
            .on('mouseup', {route: '#followers?user=' + peerAlias}, routeOnClick)
            .appendTo(elem)
        ;
}

function processWhoToFollowSuggestion(module, peerAlias, followedBy, prepend) {
    if (!peerAlias) {
        console.warn('nothing to proceed: no twisters to follow was suggested');
        return;
    }

    var list = module.find('.follow-suggestions');
    var item = twister.tmpl.whoTofollowPeer.clone(true);

    item.find('.twister-user-info').attr('data-screen-name', peerAlias);
    item.find('.twister-user-name').attr('href', $.MAL.userUrl(peerAlias));
    item.find('.twister-user-tag').text('@' + peerAlias);

    getAvatar(peerAlias, item.find('.twister-user-photo'));
    getStatusTime(peerAlias, item.find('.latest-activity .time'));

    if (module.hasClass('who-to-follow') || module.hasClass('who-to-follow-modal')) {
        item.find('.twister-by-user-name').attr('href', $.MAL.userUrl(followedBy));
        getFullname(followedBy, item.find('.followed-by').text(followedBy));
        item.find('.twister-user-remove').on('click', {item: item}, function (event) {
            event.data.item.remove();
            getRandomFollowSuggestion();
        });
    } else if (module.hasClass('new-users') || module.hasClass('new-users-modal')) {
        item.find('.followers').remove();
        item.find('.twister-user-remove').remove();
    }

    if (module.hasClass('modal-wrapper')) {
        getFullname(peerAlias, item.find('.twister-user-full'));
        getBioToElem(peerAlias, item.find('.bio'));
        item.find('.twister-user-remove').remove();
    }

    if (prepend)
        list.prepend(item).show();
    else
        list.append(item).show();

    while (module.hasClass('new-users') && list.children().length > 3)
        list.children().last().remove();

    module.find('.refresh-users').show();
    module.find('.loading-roller').hide();
}

function closeSearchDialog(event) {
    var elemEvent = event ? $(event.target) : this;
    elemEvent.siblings('.search-results').slideUp('fast');
    if (!_lastSearchUsersResultsRemovedFromDHTgetQueue) {
        removeUsersFromDhtgetQueue(_lastSearchUsersResults);
        _lastSearchUsersResultsRemovedFromDHTgetQueue = true;
    }
}

function userSearchKeypress(event) {
    var elemEvent = $(event.target);
    var partialName = elemEvent.val().toLowerCase();

    if (event.data.hashtags && partialName[0] === '#') {
        var searchResults = elemEvent.siblings('.search-results');
        if (searchResults.is(':visible'))
            searchResults.slideUp('fast');

        return;
    }

    var words = partialName.match(/\b\w+/g);
    if (words && words.length) {
        partialName = words.pop();

        if (typeof _searchKeypressTimer !== 'undefined')
            clearTimeout(_searchKeypressTimer);

        if (_searchingPartialName.length) {
            _searchingPartialName = partialName;
        } else {
            _searchKeypressTimer = setTimeout(function () {
                    _searchKeypressTimer = undefined;
                    event.data.partialName = partialName;
                    searchPartialUsername(event);
                }, 600);
        }
    } else
        closeSearchDialog(event);
}

function searchPartialUsername(event) {
    _searchingPartialName = event.data.partialName;
    twisterRpc('listusernamespartial', [event.data.partialName, 10],
        function(event, ret) {
            if (event.data.partialName !== _searchingPartialName)
                setTimeout(searchPartialUsername, 100, event);
            else {
                if (!_lastSearchUsersResultsRemovedFromDHTgetQueue)
                    removeUsersFromDhtgetQueue(_lastSearchUsersResults);
                else
                    _lastSearchUsersResultsRemovedFromDHTgetQueue = false;
                _lastSearchUsersResults = ret;

                if (ret && ret.length) {
                    if (event.data.handleRet)
                        event.data.handleRet(event, ret);
                } else {
                    if (event.data.handleRetZero)
                        event.data.handleRetZero(event);
                }

                _searchingPartialName = '';
            }
        }, event,
        function(req, ret) {
            console.warn('RPC "listusernamespartial" error: ' + (ret && ret.message ? ret.message : ret));
        }, null
    );
}

function processDropdownUserResults(event, results) {
    var container = $('.userMenu-search-profiles').empty();
    var template = $('#search-profile-template').children();

    for (var i = 0; i < results.length; i++) {
        if (results[i] === defaultScreenName)
            continue;

        var item = template.clone(true);
        item.find('.mini-profile-info').attr('data-screen-name', results[i]);
        item.find('.mini-screen-name b').text(results[i]);
        item.find('a.open-profile-modal').attr('href', $.MAL.userUrl(results[i]));
        getAvatar(results[i], item.find('.mini-profile-photo'));
        getFullname(results[i], item.find('.mini-profile-name'));
        item.appendTo(container);

        toggleFollowButton({
            button: item.find('.follow'),
            peerAlias: results[i],
            toggleUnfollow: followingUsers.indexOf(results[i]) !== -1 ? true : false
        });
    }

    $.MAL.searchUserListLoaded();
}

function initUserSearch() {
    var elem = $('.userMenu-search-field')
        .on('click input',
            {hashtags: true, handleRet: processDropdownUserResults,
                handleRetZero: closeSearchDialog}, userSearchKeypress)
        .on('keyup', userSearchEnter)
    ;
    $('.userMenu-search').clickoutside(closeSearchDialog.bind(elem));
}

function userSearchEnter(event) {
    if (event.which === 13) {
        var str = $(event.target).val().toLowerCase().trim();
        if (str[0] === '#')
            window.location.hash = '#hashtag?hashtag=' + encodeURIComponent(str.slice(1));
    }
}

function requestSwarmProgress() {
    twisterRpc("getlasthave", [defaultScreenName],
           function(args, ret) {processSwarmProgressPartial(ret);}, null,
           function(args, ret) {console.log("ajax error:" + ret);}, null);
}

function processSwarmProgressPartial(lastHaves)
{
    if( defaultScreenName in lastHaves ) {
        incLastPostId(lastHaves[defaultScreenName]);
    }

    twisterRpc("getnumpieces", [defaultScreenName],
           function(args, ret) {processSwarmProgressFinal(args.lastHaves, ret);},
               {lastHaves:lastHaves},
           function(args, ret) {console.log("ajax error:" + ret);}, null);
}

function processSwarmProgressFinal(lastHaves, numPieces)
{
    for( var user in lastHaves ) {
        if( lastHaves.hasOwnProperty(user) && numPieces.hasOwnProperty(user) ) {
            var $userDiv = $(".mini-profile-info[data-screen-name='" + user + "']");
            if( $userDiv.length ) {
                var $status = $userDiv.find(".swarm-status");
                $status.text(polyglot.t("download_posts_status", { portion: numPieces[user] + "/" + (lastHaves[user]+1) }));
                $status.fadeIn();
            }
        }
    }
    window.setTimeout(requestSwarmProgress, 2000);
}

function followingChangedUser() {
    followingUsers = [];
    _isFollowPublic = {};
    _followingSeqNum = 0;
    _followSuggestions = [];
    _lastLoadFromDhtTime = 0;
}
