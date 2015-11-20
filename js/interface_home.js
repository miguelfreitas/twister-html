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
            $(".userMenu-profile > a").text(polyglot.t("Login"));
            $(".userMenu-profile > a").attr("href","login.html");
            $(".post-area-new > textarea").attr("placeholder",polyglot.t("You have to log in to post messages."));
            $(".post-area-new > textarea").attr("disabled","true");
            $miniProfile.find(".mini-profile-name").text("guest");
            $miniProfile.find(".posts-count").text("0");
            $miniProfile.find(".following-count").text("0");
            $miniProfile.find(".followers-count").text("0");
            $miniProfile.find("a.open-following-page").attr("href","#");
            $miniProfile.find("a.open-following-page").bind("click", function()
            { alert(polyglot.t("You are not following anyone because you are not logged in."))} );
            $miniProfile.find("a.open-followers").bind("click", function()
            { alert(polyglot.t("You don't have any followers because you are not logged in."))} );
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

            $(window)
                .on('eventFollow', function(e, user) {
                    $('.mini-profile .following-count').text(followingUsers.length - 1);
                    setTimeout(requestTimelineUpdate, 1000, 'latest', postsPerRefresh, [user], promotedPostsOnly);
                })
                .on('eventUnfollow', function(e, user) {
                    $('.mini-profile .following-count').text(followingUsers.length - 1);
                    $('.wrapper .postboard .post').each( function() {
                        var elem = $(this);
                        if ((elem.find('[data-screen-name="' + user + '"]').length
                            && !elem.find(".post-rt-by .open-profile-modal").text())
                            || elem.find(".post-rt-by .open-profile-modal").text() === '@' + user)
                                elem.remove();
                    });
                });

            if ($.Options.WhoToFollow.val === 'enable')
                initWhoToFollow();
            else
                killInterfaceModule('who-to-follow');

            if ($.Options.TwistdayReminder.val === 'enable')
                initTwistdayReminder();
            else
                killInterfaceModule('twistday-reminder');
        }
        if ($.Options.TopTrends.val === 'enable')
            initTopTrends();
        else
            killInterfaceModule('toptrends');
    }
}

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
                    var todayYear = d.getUTCFullYear();
                    var todayMonth = d.getUTCMonth();
                    var todayDate = d.getUTCDate();
                    var todaySec = Date.UTC(todayYear, todayMonth, todayDate,
                        d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()) /1000;
                    var thatSec;

                    posts.sort(function(a, b) {
                        return (parseInt(a.userpost.time) > parseInt(b.userpost.time)) ? 1 : -1;
                    });

                    for (var i = 0; i < posts.length; i++) {
                        if (followingUsers.indexOf(posts[i].userpost.n) > -1) {
                            d.setTime(0);
                            d.setUTCSeconds(posts[i].userpost.time);
                            if (d.getUTCMonth() === todayMonth && d.getUTCDate() === todayDate) {
                                addLuckyToList(listCurrent, posts[i]);
                                removeLuckyFromList(listUpcoming, posts[i].userpost.n);
                            } else if (showUpcomingTimer > 0) {
                                thatSec = Date.UTC(todayYear, d.getUTCMonth(), d.getUTCDate(),
                                    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()) /1000;
                                if (thatSec > todaySec && thatSec -todaySec <= showUpcomingTimer) {
                                    d.setTime(0);
                                    d.setUTCSeconds(thatSec);
                                    addLuckyToList(listUpcoming, posts[i], d.getTime() /1000);
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

//***********************************************
//******************* INIT **************
//***********************************************
var interfaceFunctions = new InterfaceFunctions;
$( document ).ready( interfaceFunctions.init );
