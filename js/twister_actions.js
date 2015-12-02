// twister_actions.js
// 2013 Miguel Freitas
//
// This file contains some twister "actions" like requesting
// posts from dht, sending posts, replies. It seems to be a
// intermediate layer between twister_io and interface, but
// separation is not clearly defined. Perhaps it would be better
// to get rid of this file altogether.

// global variables

var postsPerRefresh = 10;
var maxExpandPost = 8;
var maxExpandPostTop = 4;
var _queryProcessedMap = {};
var _queryPendingPosts = {};
var autoUpdateQuery = false;

// ----------------

function requestRepliedBefore(postLi)
{
    if(postLi.siblings().length >= maxExpandPostTop)
        return;

    var originalPost = postLi.find(".post-data");
    var reply_n = originalPost.attr('data-replied-to-screen-name');
    var reply_k = originalPost.attr('data-replied-to-id');

    if( reply_n != undefined && reply_k != undefined ) {
        if (reply_n[0] !== '!') {
            dhtget(reply_n, "post" + reply_k, "s",
                function (postLi, postFromJson) {
                    if (postFromJson) {
                        postLi.find('textarea').textcomplete('destroy'); // FIXME maybe we need to reset position instead (but curently it's cheaper)
                        var newStreamPost = postToElem(postFromJson, "related");
                        newStreamPost.hide();
                        postLi.before(newStreamPost);
                        newStreamPost.slideDown("fast");
                        $.MAL.relatedPostLoaded();
                        requestRepliedBefore(newStreamPost);
                    }
                }, postLi);
        } else {
            //replied to a promoted post... try to get it..
            var params = [1, parseInt(reply_k)];
            twisterRpc("getspamposts", params,
                function (postLi, postFromJson) {
                    if (postFromJson) {
                        postLi.find('textarea').textcomplete('destroy'); // FIXME maybe we need to reset position instead (but curently it's cheaper)
                        var newStreamPost = postToElem(postFromJson[0], "related", 1);
                        newStreamPost.hide();
                        postLi.before(newStreamPost);
                        newStreamPost.slideDown("fast");
                        $.MAL.relatedPostLoaded();
                        requestRepliedBefore(newStreamPost);
                    }
                }, postLi, function(arg,ret) {console.log(ret)});
        }
    }
}

function requestRepliesAfter(postLi)
{
    if($.MAL.getExpandedPostsCount(postLi) >= maxExpandPost)
        return;

    var originalPost = postLi.find(".post-data");
    var original_n = originalPost.attr('data-screen-name');
    var original_k = originalPost.attr('data-id');

    if( original_n != undefined && original_k != undefined ) {
        dhtget( original_n, "replies" + original_k, "m", $.MAL.reqRepAfterCB, postLi);
    }
}

function getTopPostOfConversation(postLi, post, postboard) {
    var reply_n;
    var reply_k;

    if (post && typeof(post) !== 'undefined' && "reply" in post["userpost"]) {
        reply_k = post["userpost"]["reply"]["k"];
        reply_n = post["userpost"]["reply"]["n"];
    } else if (postLi && typeof(postLi) !== 'undefined') {
        var originalPost = postLi.find(".post-data");
        reply_n = originalPost.attr('data-replied-to-screen-name');
        reply_k = originalPost.attr('data-replied-to-id');
    }

    if( reply_n != undefined && reply_k != undefined ) {
        dhtget( reply_n, "post" + reply_k, "s",
            function(postLi, postFromJson) {
                getTopPostOfConversation(null, postFromJson, postboard);
            }, postLi);
    } else {
        var newStreamPost;
        if (post)
            newStreamPost = postToElem(post, "related");
        else {
            newStreamPost = postLi.clone(true);
            newStreamPost.removeClass('original');
            newStreamPost.addClass('related');
            newStreamPost.find('.expanded-content').hide();
            newStreamPost.find('.show-more').hide();
        }
        requestRepliesAfterAll(newStreamPost);
        newStreamPost.find('.post-expand').remove();
        newStreamPost.unbind('click');
        newStreamPost.hide();
        postboard.append(newStreamPost);
        newStreamPost.slideDown("fast");
    }
}

function requestRepliesAfterAll(postLi)
{
    var originalPost = postLi.find(".post-data");
    var original_n = originalPost.attr('data-screen-name');
    var original_k = originalPost.attr('data-id');

    if( original_n != undefined && original_k != undefined ) {
        dhtget( original_n, "replies" + original_k, "m", $.MAL.reqRepAfterCB, postLi);
    }
}

function requestRTs(postLi)
{
    var originalPost = postLi.find(".post-data");

    var original_n = originalPost.attr('data-screen-name');
    var original_k = originalPost.attr('data-id');

    if( original_n != undefined && original_k != undefined ) {
        dhtget( original_n, "rts" + original_k, "m",
               function(originalPost, postsFromJson) {

                    if( postsFromJson.length ) {
                        var statCountValue = originalPost.find(".stat-count-value");
                        statCountValue.text( postsFromJson.length );

                        var avatarRow = originalPost.find(".avatar-row");
                        avatarRow.empty();
                        for( var i = 0; i < postsFromJson.length && i < 8; i++) {
                            var n = postsFromJson[i]["userpost"]["n"];
                            var elemUser = $("#avatar-row-template").clone(true);
                            elemUser.removeAttr('id');
                            elemUser.attr('href',$.MAL.userUrl(n));
                            getFullname(n,elemUser.find(".user-name-tooltip"));
                            getAvatar(n,elemUser.find(".size24"));
                            avatarRow.append( elemUser );
                        }

                        originalPost.find(".post-stats").slideDown("fast");
                    }
               }, originalPost);
    }
}

function appendPostToContainer(postFromJson, containerToAppend)
{
    var newStreamPost = postToElem(postFromJson, "original");
    newStreamPost.hide();
    containerToAppend.append( newStreamPost );
    newStreamPost.slideDown("fast");
    $.MAL.postboardLoaded();
}

var profilePostsLoading = false;

function requestPost(containerToAppend,username,resource,cbFunc,cbArgs){

    //console.log('dhtget '+username+' '+resource);

    dhtget( username, resource, "s",
        function(args, postFromJson) {
            if( postFromJson ) {

            //console.log(postFromJson);

            appendPostToContainer(postFromJson,args.containerToAppend);

            if(args.cbFunc!=undefined) args.cbFunc(args.cbArgs);

            }
        },
        {containerToAppend:containerToAppend,cbFunc:cbFunc,cbArgs:cbArgs}
    );

}

function requestPostRecursively(containerToAppend,username,resource,count,useGetposts)
{
    var max_id = -1;
    if( !resource ) {
        var streamItems = containerToAppend.children();
        if( streamItems.length != 0 ) {
            var lastItem = streamItems.eq(streamItems.length-1);
            resource = "post" + lastItem.find(".post-data").attr("data-lastk");
            max_id = parseInt(lastItem.find(".post-data").attr("data-lastk"));
        }
    }

    profilePostsLoading = true;

    if( useGetposts ) {
        req = {username: username}
        if( max_id != -1 ) {
            req.max_id = max_id;
        }

        twisterRpc("getposts", [count,[req]],
                       function(args, posts) {
                           for( var i = 0; i < posts.length; i++ ) {
                              appendPostToContainer(posts[i],args.containerToAppend);
                           }
                           profilePostsLoading = false;
                       }, {containerToAppend:containerToAppend},
                       function(args, ret) {
                           profilePostsLoading = false;
                       }, {});
    } else {
        dhtget( username, resource, "s",
            function(args, postFromJson) {
               if( postFromJson ) {
                   appendPostToContainer(postFromJson,args.containerToAppend);

                   if( args.count > 1 ) {
                       var userpost = postFromJson["userpost"];
                       var n = userpost["n"];
                       var lastk = userpost["lastk"];
                       if( lastk == undefined )
                           lastk = userpost["k"] - 1; // not true with directmsgs in stream

                       requestPostRecursively(args.containerToAppend, n, "post"+lastk, count-1);
                   } else {
                       profilePostsLoading = false;
                       args.containerToAppend.scroll();
                   }
               } else {
                   profilePostsLoading = false;
               }
           }, {containerToAppend:containerToAppend, count:count} );
    }
}

function newPostMsg(msg, $postOrig) {
    if( lastPostId != undefined ) {
        if ( typeof _sendedPostIDs !== 'undefined' )
            _sendedPostIDs.push(lastPostId + 1);

        var params = [defaultScreenName, lastPostId + 1, msg]
        if( $postOrig.length ) {
            params.push($postOrig.attr('data-screen-name'));
            params.push(parseInt($postOrig.attr('data-id')));
        }
        twisterRpc("newpostmsg", params,
                   function(arg, ret) { incLastPostId(); }, null,
                   function(arg, ret) { var msg = ("message" in ret) ? ret.message : ret;
                                        alert(polyglot.t("ajax_error", { error: msg })); }, null);
    } else {
        alert(polyglot.t("Internal error: lastPostId unknown (following yourself may fix!)"));
    }
}

function newRtMsg(postData, msg) {
    var userpost = $.evalJSON(postData.attr('data-content_to_rt'));
    var sig_userpost;

    if (userpost.rt) {
        if (parseInt(twisterVersion) <= 93000) {
            alert(polyglot.t('error',
                {error: 'can\'t handle retwisting of commented retwisted twists with daemon version '
                    + twisterDisplayVersion + ' and below of that. Please upgrade it.'}
            ));

            return;
        } else {
            // dropping of rt to avoid overquoting
            sig_userpost = userpost.sig_wort;
            userpost.rt = undefined;
            userpost.sig_rt = undefined;
        }
    } else {
        sig_userpost = postData.attr('data-content_to_sigrt');
    }

    if (typeof sig_userpost === 'undefined') {
        alert(polyglot.t('error',
            {error: 'can\'t sig_userpost is not deifned'}
        ));

        return;
    }

    userpost.sig_wort = undefined;

    var rtObj = {sig_userpost: sig_userpost, userpost: userpost};

    if (typeof lastPostId !== 'undefined') {
        if (typeof _sendedPostIDs !== 'undefined')
            _sendedPostIDs.push(lastPostId + 1);

        var params = [defaultScreenName, lastPostId + 1, rtObj];

        if (typeof msg !== 'undefined')
            params.push(msg);

        twisterRpc('newrtmsg', params,
            function(arg, ret) {incLastPostId();}, null,
            function(arg, ret) {var msg = ('message' in ret) ? ret.message : ret;
                alert(polyglot.t('ajax_error', {error: msg}));
            }, null
        );
    } else {
        alert(polyglot.t('Internal error: lastPostId unknown (following yourself may fix!)'));
    }
}

function updateProfileData(profileModalContent, username) {

    //profileModalContent.find("a").attr("href",$.MAL.userUrl(username));
    profileModalContent.filter(".profile-card").attr("data-screen-name", username);
    profileModalContent.find(".profile-screen-name b").text(username);
    profileModalContent.find("a.follow").attr("href", $.MAL.followUrl(username));
    profileModalContent.find("a.direct-messages-with-user").attr("href", $.MAL.dmchatUrl(username));
    profileModalContent.find("a.new-post-to").attr("href", $.MAL.newPostToUrl(username));
    profileModalContent.find("a.mentions-from-user").attr("href", $.MAL.mentionsUrl(username));
    getFullname( username, profileModalContent.find(".profile-name") );
    getLocation( username, profileModalContent.find(".profile-location") );
    getWebpage( username, profileModalContent.find(".profile-url") );
    getBioToElem(username, profileModalContent.find('.profile-bio'));
    getTox( username, profileModalContent.find(".profile-tox") );
    getBitmessage( username, profileModalContent.find(".profile-bitmessage") );
    getAvatar( username, profileModalContent.find(".profile-card-photo") );
    getPostsCount( username,  profileModalContent.find(".posts-count") );
    getFollowers( username, profileModalContent.find(".followers-count") );
    getNumFollowing( username, profileModalContent.find(".following-count") );
    getWhoFollows ( username, profileModalContent.find(".who-follow") );

    profileModalContent.find(".following-count").parent().attr("href", $.MAL.followingUrl(username));

    var postsView = profileModalContent.find(".postboard-posts");

    // try using getposts first. fallback to dht.
    twisterRpc("getposts", [1,[{username: username}]],
                       function(args, posts) {
                           updateProfilePosts(postsView, username, posts.length);
                       }, {},
                       function(args, ret) {
                           updateProfilePosts(postsView, username, false);
                       }, {});
}

function updateProfilePosts(postsView, username, useGetposts) {
    requestPostRecursively(postsView,username,"status",postsPerRefresh, useGetposts);

    postsView.scroll(function(){
        if (!profilePostsLoading) {
            var $this = $(this);
            if ($this.scrollTop() >= this.scrollHeight - $this.height() - 20) {
                requestPostRecursively($this,username,"",postsPerRefresh, useGetposts);
            }
        }
     });
}

function clearQueryProcessed(id) {
    if (!id) return;

    _queryProcessedMap[id] = {};
    _queryPendingPosts[id] = [];
}

function requestQuery(req) {
    req.postboard.closest('div').find('.postboard-loading').show();
    dhtget(req.query, req.resource, 'm',
        function(req, posts) {
            req.posts = posts;
            processQuery(req);
        },
        req,
        req.timeoutArgs
    );
}

function processQuery(req) {
    if (!isModalWithElemExists(req.postboard) || !req.posts || !req.posts.length)
        return;

    if (!req.id)
        req.id = req.query + '@' + req.resource;
    if (typeof _queryProcessedMap[req.id] !== 'object')
        _queryProcessedMap[req.id] = {};
    if (typeof _queryPendingPosts[req.id] !== 'object')
        _queryPendingPosts[req.id] = [];

    for (var i = req.posts.length - 1; i >= 0; i--) {
        var userpost = req.posts[i].userpost;
        var key = userpost.n + ';' + userpost.time;

        if (!_queryProcessedMap[req.id][key]) {
            _queryProcessedMap[req.id][key] = true;

            if ($.Options.filterLang.val !== 'disable' && $.Options.filterLangForSearching.val) {
                if (typeof userpost.rt !== 'undefined') {
                    var msg = userpost.rt.msg;
                } else {
                    var msg = userpost.msg;
                }
                langFilterData = filterLang(msg);
                if ($.Options.filterLangSimulate.val) {
                    req.posts[i].langFilter = langFilterData;
                } else {
                    if (!langFilterData.pass)
                        continue;
                }
            }

            _queryPendingPosts[req.id].push(req.posts[i]);
        }
    }

    if (_queryPendingPosts[req.id].length) {
        if (!$.hasOwnProperty('mobile') && $.Options.showDesktopNotifPostsModal.val === 'enable'
            && (req.resource !== 'mention' || req.query !== defaultScreenName)) {
            $.MAL.showDesktopNotification({
                body: polyglot.t('You got') + ' ' + polyglot.t('new_posts', _queryPendingPosts[req.id].length) + ' '
                    + polyglot.t('in search result') + '.',
                tag: 'twister_notification_new_posts_modal',
                timeout: $.Options.showDesktopNotifPostsModalTimer.val,
                funcClick: (function() {
                    focusModalWithElement(this.postboard,
                        function (req) {
                            req.postboard.closest('.postboard').find('.postboard-news').hide();
                            displayQueryPending(req.postboard);
                        }, {postboard: this.postboard}
                    );
                }).bind({postboard: req.postboard})
            });
        }

        if (!req.postboard.children().length || autoUpdateQuery) {
            displayQueryPending(req.postboard);
        } else {
            req.postboard.closest('div').find('.postboard-news')  // FIXME we'd replace 'div' with '.postboard' but need to dig through tmobile first
                .text(polyglot.t('new_posts', _queryPendingPosts[req.id].length))
                .fadeIn('slow')
            ;
            req.postboard.closest('div').find('.postboard-loading').hide();
        }
    }
}

function displayQueryPending(postboard) {
    var reqId = postboard.attr('data-request-id');

    attachPostsToStream(postboard, _queryPendingPosts[reqId], false);
    _queryPendingPosts[reqId] = [];

    $.MAL.postboardLoaded();
}
