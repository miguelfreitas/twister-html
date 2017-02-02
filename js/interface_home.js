// interface_home.js
// 2013 Lucas Leal, Miguel Freitas
//
// Specific interface functions for home.html

//***********************************************
//******************* DECLARATIONS **************
//***********************************************
var InterfaceFunctions = function() {
    //faço os binds no init
    this.init = function()
    {
        $( ".wrapper .postboard-news").click(function() {
            var newPosts = parseInt($(".userMenu .menu-news").text());
            if (!newPosts)
                newPosts = postsPerRefresh;
            requestTimelineUpdate('pending',newPosts,followingUsers,promotedPostsOnly);
        });

        // Add refresh posts for home link in menu
        $( ".userMenu-home.current a").click(function() {
            var newPosts = parseInt($(".userMenu .menu-news").text());
            if (!newPosts)
                newPosts = postsPerRefresh;
            requestTimelineUpdate('pending',newPosts,followingUsers,promotedPostsOnly);
        });

        $( ".promoted-posts-only").click(function() {
            promotedPostsOnly = !promotedPostsOnly;

            timelineChangedUser();
            $.MAL.getStreamPostsParent().empty();
            requestTimelineUpdate("latestFirstTime",postsPerRefresh,followingUsers,promotedPostsOnly);
        });

        cleanupStorage();

        initInterfaceCommon();
        initUserSearch();
        initInterfaceDirectMsg();

        initUser(initHome);
        initHashWatching();
    };

    function initHome(cbFunc, cbArg) {
        checkNetworkStatusAndAskRedirect();

        //$("span.screen-name").text('@' + user);
        var $miniProfile = $(".mini-profile");
        if (!defaultScreenName) {
            $('.userMenu-profile > a').attr('href', '#/login').text(polyglot.t('Login'));
            $(".post-area-new > textarea").attr("placeholder",polyglot.t("You have to log in to post messages."));
            $(".post-area-new > textarea").attr("disabled","true");
            $miniProfile.find(".mini-profile-name").text("guest");
            $miniProfile.find(".posts-count").text("0");
            $miniProfile.find(".following-count").text("0");
            $miniProfile.find(".followers-count").text("0");
            $(".dropdown-menu-following").attr("href","#");
            $(".dropdown-menu-following").bind("click", function()
            { alert(polyglot.t("You are not following anyone because you are not logged in."))} );
        } else {
            $miniProfile.find("a.mini-profile-name").attr("href",$.MAL.userUrl(defaultScreenName));
            $miniProfile.find("a.open-profile-modal").attr("href",$.MAL.userUrl(defaultScreenName));
            $miniProfile.find(".mini-profile-name").text(defaultScreenName);
            getFullname( defaultScreenName, $miniProfile.find(".mini-profile-name") );
            getAvatar( defaultScreenName, $miniProfile.find(".mini-profile-photo").find("img") );
            getAvatar(defaultScreenName, $('.userMenu-config .mini-profile-photo img'));
            // add avatar in postboard-top
            getAvatar( defaultScreenName, $("#postboard-top").find("img") );
            getPostsCount( defaultScreenName,  $miniProfile.find(".posts-count") );
            getFollowers( defaultScreenName, $miniProfile.find(".followers-count") );

            loadFollowing( function(args) {
                     $(".mini-profile .following-count").text(followingUsers.length-1);
                     requestLastHave();
                     setInterval(requestLastHave, 1000);
                     initMentionsCount();
                     initDMsCount();
                     requestTimelineUpdate("latestFirstTime",postsPerRefresh,followingUsers,promotedPostsOnly);

                     // install scrollbottom handler to load more posts as needed
                     $(window).scroll(function(){
                        if  ($(window).scrollTop() >= $(document).height() - $(window).height() - 20){
                            if( timelineLoaded ) {
                                requestTimelineUpdate("older", postsPerRefresh, followingUsers, promotedPostsOnly);
                            }
                        }
                     });

                     twisterFollowingO = TwisterFollowing(defaultScreenName);

                     if( args.cbFunc )
                        args.cbFunc(args.cbArg);
                 }, {cbFunc:cbFunc, cbArg:cbArg});

            if ($.Options.WhoToFollow.val === 'enable')
                initWhoToFollow();
            else
                killInterfaceModule('who-to-follow');

            if ($.Options.NewUsers.val === 'enable')
                initNewUsers();
            else
                killInterfaceModule('new-users');

            if ($.Options.TwistdayReminder.val === 'enable')
                initTwistdayReminder();
            else
                killInterfaceModule('twistday-reminder');
        }
        if ($.Options.TopTrends.val === 'enable')
            initTopTrends();
        else
            killInterfaceModule('toptrends');

        if ($.Options.WebTorrent.val === 'enable')
            initWebTorrent();
    }
};

function initTopTrends() {
    var $tt = initInterfaceModule('toptrends');

    if ($tt.length) {
        var $ttRefresh = $tt.find('.refresh-toptrends');
            $ttRefresh.on('click', updateTrendingHashtags);
            setTimeout(function() { $ttRefresh.click() }, 100);
    }
}

function updateTrendingHashtags() {
    var $module = $('.module.toptrends');
    var $list = $module.find('.toptrends-list');

    if ($list.length) {
        $list.empty().hide();
        $module.find('.refresh-toptrends').hide();
        $module.find('.loading-roller').show();
        twisterRpc('gettrendinghashtags', [10],
            function(args, ret) {
                //console.log('hashtags trends: '+ret);
                for( var i = 0; i < ret.length; i++ ) {
                    if ($.Options.filterLang.val !== 'disable' && $.Options.filterLangForTopTrends.val)
                        var langFilterData = filterLang(ret[i]);
                    if (typeof(langFilterData) === 'undefined' || langFilterData['pass'] || $.Options.filterLangSimulate.val) {
                        var $li = $('<li>');
                        var hashtagLinkTemplate = $('#hashtag-link-template').clone(true);

                        hashtagLinkTemplate.removeAttr('id');
                        hashtagLinkTemplate.attr('href',$.MAL.hashtagUrl(ret[i]));
                        hashtagLinkTemplate.text('#'+ret[i]);

                        $li.append(hashtagLinkTemplate);
                        if ($.Options.filterLang.val !== 'disable' && $.Options.filterLangSimulate.val) {
                            if (typeof(langFilterData) !== 'undefined') {
                                $li.append(' <span class="langFilterSimData"><em>'+((langFilterData['pass']) ? polyglot.t('passed') : polyglot.t('blocked'))+'</em>: '+langFilterData['prob'][0].toString()+'</span>');
                            } else {
                                $li.append(' <span class="langFilterSimData"><em>'+polyglot.t('not analyzed')+'</em></span>');
                            }
                        }

                        $list.append($li);
                    }
                }

                if ($list.children().length)
                    $list.show();
                $module.find('.refresh-toptrends').show();
                $module.find('.loading-roller').hide();
            }, {},
            function(args, ret) {
                console.log('Error with gettrendinghashtags. Older twister daemon?');
            }, {}
        );
        if ($list.children().length && $.Options.TopTrendsAutoUpdate.val === 'enable' && $.Options.TopTrendsAutoUpdateTimer.val > 0)
            setTimeout(updateTrendingHashtags, $.Options.TopTrendsAutoUpdateTimer.val * 1000);
    }
}

function initWhoToFollow() {
    var wtf = initInterfaceModule('who-to-follow');

    if (wtf.length) {
        var wtfRefresh = wtf.find('.refresh-users');
            wtfRefresh.on('click', refreshWhoToFollow);
            setTimeout(function() {wtfRefresh.click();}, 100);
        //wtf.find('.view-all-users').on('click', function() {window.location.hash = '#whotofollow';});
    }
}

function refreshWhoToFollow() {
    var module = $('.module.who-to-follow');
    var list = module.find('.follow-suggestions');

    if (list.length) {
        list.empty().hide();
        module.find('.refresh-users').hide();
        module.find('.loading-roller').show();

        getRandomFollowSuggestion();
        getRandomFollowSuggestion();
        getRandomFollowSuggestion();
    }
}

function initNewUsers() {
    var nus = initInterfaceModule('new-users');

    newUsers = NewUserSearch();
    if (nus.length) {
        var nusRefresh = nus.find('.refresh-users');
        nusRefresh.on('click', refreshNewUsers);
        setTimeout(function() {nusRefresh.click();}, 100);
    }
}

function refreshNewUsers() {
    var module = $('.module.new-users');
    var list = module.find('.follow-suggestions');

    if (list.length) {
        list.empty().hide();
        module.find('.refresh-users').hide();
        module.find('.loading-roller').show();

        newUsers.getLastNUsers(3, 0, module, true);
    }
}

function initTwistdayReminder() {
    var $module = initInterfaceModule('twistday-reminder');

    if ($module.length) {
        var $moduleRefresh = $module.find('.refresh');
            $moduleRefresh.on('click', refreshTwistdayReminder);
            setTimeout(function() { $moduleRefresh.click() }, 100);
        $module.find('.current').hide();
        $module.find('.upcoming').hide();
    }
}

function refreshTwistdayReminder() {
    var module = $('.module.twistday-reminder');
    var list = module.find('.list');

    if (list.length) {
        module.find('.refresh').hide();
        module.find('.loading-roller').show();
        if (defaultScreenName && typeof followingUsers !== 'undefined' && followingUsers.length) {
            var suggests = [];
            for (var i = 0; i < followingUsers.length; i++) {
                suggests[i] = {username: followingUsers[i], max_id: 0};
            }
            twisterRpc('getposts', [suggests.length + 1, suggests],
                function(arg, posts) {
                    function addLuckyToList(list, post, time) {
                        var lucky = post.userpost.n;
                        if (!list.find('[data-screen-name=' + lucky + ']').length) {
                            var item = $('#twistday-reminder-suggestion-template').clone(true)
                                .removeAttr('id');
                            item.find('.twister-user-info').attr('data-screen-name', lucky);
                            item.find('.twister-user-name').attr('href', $.MAL.userUrl(lucky));
                            item.find('.twister-user-tag').text('@' + lucky);
                            itemTwisterday = item.find('.twisterday');
                            itemTwisterday.on('click', (function(e) {replyInitPopup(e, post);}).bind(post));
                            if (typeof time !== 'undefined')
                                itemTwisterday.text(timeGmtToText(time));
                            else
                                itemTwisterday.text(timeGmtToText(post.userpost.time));

                            getAvatar(lucky, item.find('.twister-user-photo'));
                            getFullname(lucky, item.find('.twister-user-full'));

                            list.append(item);
                        }
                    }
                    function removeLuckyFromList(list, lucky) {
                        list.find('[data-screen-name=' + lucky + ']').closest('li').remove();
                    }

                    var showUpcomingTimer = ($.Options.TwistdayReminderShowUpcoming.val === 'enable') ?
                        $.Options.TwistdayReminderShowUpcomingTimer.val * 3600 : 0;
                    var listCurrent = module.find('.current .list');
                    var listUpcoming = module.find('.upcoming .list');
                    var d = new Date();
                    var curYear = d.getFullYear(), curYearUTC = d.getUTCFullYear();
                    var curMonth = d.getMonth();
                    var curDate = d.getDate();
                    var curSecUTC = Date.UTC(curYearUTC, d.getUTCMonth(), d.getUTCDate(),
                        d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()) / 1000;
                    var upcSecUTC;

                    posts.sort(function(a, b) {
                        return (parseInt(a.userpost.time) > parseInt(b.userpost.time)) ? 1 : -1;
                    });

                    for (var i = 0; i < posts.length; i++) {
                        if (followingUsers.indexOf(posts[i].userpost.n) > -1
                            && posts[i].userpost.height !== posts[i].userpost.k)  // to filter possible promoted twists which may appear suddenly (shame on you Miguel!)
                        {
                            d.setTime(0);
                            d.setUTCSeconds(posts[i].userpost.time);
                            if (d.getMonth() === curMonth && d.getDate() === curDate) {
                                addLuckyToList(listCurrent, posts[i]);
                                removeLuckyFromList(listUpcoming, posts[i].userpost.n);
                            } else if (showUpcomingTimer > 0) {
                                upcSecUTC = Date.UTC(curYearUTC, d.getUTCMonth(), d.getUTCDate(),
                                    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()) / 1000;
                                if (upcSecUTC > curSecUTC && upcSecUTC - curSecUTC <= showUpcomingTimer) {
                                    d.setTime(0);
                                    d.setUTCSeconds(upcSecUTC);
                                    addLuckyToList(listUpcoming, posts[i], d.getTime() / 1000);
                                } else {
                                    removeLuckyFromList(listCurrent, posts[i].userpost.n);
                                    removeLuckyFromList(listUpcoming, posts[i].userpost.n);
                                }
                            } else {
                                removeLuckyFromList(listCurrent, posts[i].userpost.n);
                                removeLuckyFromList(listUpcoming, posts[i].userpost.n);
                            }
                        }
                    }

                    listCurrent.parent().css('display', listCurrent.children().length ? 'block' : 'none')
                    listUpcoming.parent().css('display', listUpcoming.children().length ? 'block' : 'none')
                    module.find('.refresh').show();
                    module.find('.loading-roller').hide();
                }, null,
                function(arg, ret) {console.log('ajax error:' + ret);}, null
            );
        }
        if ($.Options.TwistdayReminderAutoUpdate.val === 'enable' && $.Options.TwistdayReminderAutoUpdateTimer.val > 0)
            setTimeout(refreshTwistdayReminder, $.Options.TwistdayReminderAutoUpdateTimer.val * 1000);
    }
}

function initWebTorrent() {
    //localStorage.debug = '*'
    //localStorage.removeItem('debug')

    if ($.localStorage.isSet('torrentIds'))
        twister.torrentIds = $.localStorage.get('torrentIds');

    WEBTORRENT_ANNOUNCE = $.Options.WebTorrentTrackers.val.split(/[ ,]+/)
    $.getScript('js/webtorrent.min.js', function() {
        WebTorrentClient = new WebTorrent();
        console.log("WebTorrent started")
        WebTorrentClient.on('error', function (err) {
            console.error('ERROR: ' + err.message);
        });
        WebTorrentClient.on('warning', function (err) {
            console.error('WARNING: ' + err.message);
        });

        $.getScript('js/localforage.min.js', function() {
            localforage.setDriver([localforage.INDEXEDDB,localforage.WEBSQL]).then(function() {
                for (var torrentId in twister.torrentIds) {
                    if( twister.torrentIds[torrentId] ) {
                        if (typeof(twister.torrentIds[torrentId]) === "string") {
                            // get blob file to restart seeding this file
                            var onGetItem = function(torrentId, err, data) {
                                console.log("onget:", torrentId, err, data)
                                if (err || data === null) {
                                    // error reading blob, just add torrentId
                                    console.log("WebTorrent auto-download: " + torrentId +
                                                " (previously seeded as: " + twister.torrentIds[torrentId] + ")" );
                                    WebTorrentClient.add(torrentId);
                                } else {
                                    var fileBlob = new File([data], twister.torrentIds[torrentId]);
                                    console.log('WebTorrent seeding: "' + twister.torrentIds[torrentId] +
                                                '" size: ' + data.size);
                                    WebTorrentClient.seed(fileBlob);
                                }
                            }
                            localforage.getItem(torrentId, onGetItem.bind(null, torrentId));
                        } else if ($.Options.WebTorrentAutoDownload.val === 'enable') {
                            console.log("WebTorrent auto-download: " + torrentId);
                            WebTorrentClient.add(torrentId);
                        }
                    }
                }

                // setup attach button
                $(".post-area-attach").show();
                var fileInput = $("#fileInputAttach");
                fileInput.on('change', function(event) {
                    var file = fileInput[0].files[0];
                    var seedingTorrent = undefined;
                    for (var i = 0; i < WebTorrentClient.torrents.length; i++) {
                        var torrent = WebTorrentClient.torrents[i];
                        if (torrent.length === file.size &&
                            torrent.files[0].name === file.name) {
                            seedingTorrent = torrent;
                        }
                    }
                    var saveBlobFile = function(infoHash,file) {
                        var magnetLink = "magnet:?xt=urn:btih:" + infoHash
                        var blobFile = new Blob([file]);
                        localforage.setItem(magnetLink, blobFile);
                        twister.torrentIds[magnetLink] = file.name;
                        $.localStorage.set('torrentIds', twister.torrentIds);
                        return magnetLink;
                    }
                    if (seedingTorrent) {
                        var magnetLink = saveBlobFile(seedingTorrent.infoHash,file);
                        console.log('Already seeding ' + magnetLink);
                        shortenMagnetLink(event,magnetLink);
                    } else {
                        WebTorrentClient.seed(file, function (torrent) {
                            var magnetLink = saveBlobFile(torrent.infoHash,file);
                            console.log('Client is seeding ' + magnetLink);
                            shortenMagnetLink(event,magnetLink);
                        });
                    }
                });
            });
        });
    });
}

function shortenMagnetLink(event,magnetLink) {
    var uri = prompt(polyglot.t('shorten_URI_enter_link'), magnetLink);
    var textArea = $(event.target).closest('form').find('textarea');
    newShortURI(uri, function(long,short) {
        textArea.append(short);
    });
}

//***********************************************
//******************* INIT **************
//***********************************************
var interfaceFunctions = new InterfaceFunctions;
$( document ).ready( interfaceFunctions.init );
