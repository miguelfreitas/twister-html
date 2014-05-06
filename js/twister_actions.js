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
var maxExpandPost = 20;
var _hashtagProcessedMap = {};
var _hashtagPendingPosts = [];
var autoUpdateHashtag = false;

// ----------------

function requestRepliedBefore(postLi)
{
    if(postLi.siblings().length >= maxExpandPost)
        return;

    var originalPost = postLi.find(".post-data");
    var reply_n = originalPost.attr('data-replied-to-screen-name');
    var reply_k = originalPost.attr('data-replied-to-id');

    if( reply_n != undefined && reply_k != undefined ) {
        dhtget( reply_n, "post" + reply_k, "s",
               function(postLi, postFromJson) {
                   var newStreamPost = postToElem(postFromJson, "related");
                   newStreamPost.hide();
                   postLi.before(newStreamPost);
                   newStreamPost.slideDown("fast");
                   $.MAL.relatedPostLoaded();
                   requestRepliedBefore(newStreamPost);
               }, postLi);
    }
}

function requestRepliesAfter(postLi)
{
    if(postLi.siblings().length >= maxExpandPost)
        return;

    var originalPost = postLi.find(".post-data");
    var original_n = originalPost.attr('data-screen-name');
    var original_k = originalPost.attr('data-id');

    if( original_n != undefined && original_k != undefined ) {
        dhtget( original_n, "replies" + original_k, "m",
               function(postLi, postsFromJson) {
                   for( var i = 0; i < postsFromJson.length; i++) {
                       var newStreamPost = postToElem(postsFromJson[i], "related");
                       newStreamPost.hide();
                       postLi.after(newStreamPost);
                       newStreamPost.slideDown("fast");
                   }
                   $.MAL.relatedPostLoaded();
               }, postLi);
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

var profilePostsLoading = false;

function requestPostRecursively(containerToAppend,username,resource,count)
{
    if( !resource ) {
        var streamItems = containerToAppend.children();
        if( streamItems.length != 0 ) {
            var lastItem = streamItems.eq(streamItems.length-1);
            resource = "post" + lastItem.find(".post-data").attr("data-lastk");
        }
    }

    profilePostsLoading = true;
    dhtget( username, resource, "s",
            function(args, postFromJson) {
               if( postFromJson ) {
                   var newStreamPost = postToElem(postFromJson, "original");
                   newStreamPost.hide();
                   args.containerToAppend.append( newStreamPost );
                   newStreamPost.slideDown("fast");
                   $.MAL.postboardLoaded();

                   if( args.count > 1 ) {
                       var userpost = postFromJson["userpost"];
                       var n = userpost["n"];
                       var lastk = userpost["lastk"];
                       if( lastk == undefined )
                           lastk = userpost["k"] - 1; // not true with directmsgs in stream

                       requestPostRecursively(args.containerToAppend, n, "post"+lastk, count-1);
                   } else {
                       profilePostsLoading = false;
                   }
               } else {
                   profilePostsLoading = false;
               }
           }, {containerToAppend:containerToAppend, count:count} );
}


function newPostMsg(msg, $postOrig) {
    if( lastPostId != undefined ) {
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

function newRtMsg($postOrig) {
    var content_to_rt = $postOrig.attr('data-content_to_rt');
    var content_to_sigrt = $postOrig.attr('data-content_to_sigrt');

    var sig_userpost = String(content_to_sigrt);
    var userpost = $.evalJSON(String(content_to_rt));
    var rtObj = { sig_userpost :sig_userpost, userpost : userpost };

    if( lastPostId != undefined ) {
        var params = [defaultScreenName, lastPostId+1, rtObj]

        twisterRpc("newrtmsg", params,
                   function(arg, ret) { incLastPostId(); }, null,
                   function(arg, ret) { var msg = ("message" in ret) ? ret.message : ret;
                                        alert(polyglot.t("ajax_error", { error: msg })); }, null);
    } else {
        alert(polyglot.t("Internal error: lastPostId unknown (following yourself may fix!)"));
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
    getBio( username, profileModalContent.find(".profile-bio") );
    getTox( username, profileModalContent.find(".profile-tox") );
    getBitmessage( username, profileModalContent.find(".profile-bitmessage") );
    getAvatar( username, profileModalContent.find(".profile-card-photo") );
    getPostsCount( username,  profileModalContent.find(".posts-count") );
    getFollowers( username, profileModalContent.find(".followers-count") );
    getNumFollowing( username, profileModalContent.find(".following-count") );
    getWhoFollows ( username, profileModalContent.find(".who-follow") );
    
    profileModalContent.find(".following-count").parent().attr("href", $.MAL.followingUrl(username));

    var postsView = profileModalContent.find(".postboard-posts");
    requestPostRecursively(postsView,username,"status",10);

    postsView.scroll(function(){
        if (!profilePostsLoading) {
            var $this = $(this);
            if ($this.scrollTop() >= this.scrollHeight - $this.height() - 20) {
                requestPostRecursively($this,username,"",10);
            }
        }
     });
}

function updateFollowingData(followingModalContent, username) {
    followingModalContent.find(".following-screen-name b").text(username);
    loadFollowingIntoList( username, $(followingModalContent[1]) );
}

function clearHashtagProcessed() {
    _hashtagProcessedMap = {};
    _hashtagPendingPosts = [];
}

function requestHashtag(postboard,hashtag,resource) {
    dhtget( hashtag, resource, "m",
           function(args, data) {
               processHashtag(args.postboard, args.hashtag, data);
           }, {postboard:postboard,hashtag:hashtag}, 
           [10000,2000,3]); // use extended timeout parameters (requires twister_core >= 0.9.14)

}

function processHashtag(postboard, hashtag, data) {
    if( data ) {
        for( var i = data.length-1; i >= 0; i-- ) {
            var userpost = data[i]["userpost"];
            var key = userpost["n"] + ";" + userpost["time"];
            if( !(key in _hashtagProcessedMap) ) {
                _hashtagProcessedMap[key] = true;
                _hashtagPendingPosts.push(data[i]);
            }
        }
        
        if(!postboard.children().length&&!_hashtagPendingPosts.length)
            postboard.closest("div").find(".no-posts-found-message").show();

        if( _hashtagPendingPosts.length ) {
            if( !postboard.children().length || autoUpdateHashtag ) {
                displayHashtagPending(postboard);
            } else {
                var newTweetsBar = postboard.closest("div").find(".postboard-news");
                newTweetsBar.text(polyglot.t("new_posts", _hashtagPendingPosts.length));
                newTweetsBar.fadeIn("slow");
            }
            postboard.closest("div").find(".no-posts-found-message").hide();
        }
    }
}

function displayHashtagPending(postboard) {
    for( var i = 0; i < _hashtagPendingPosts.length; i++ ) {
        var streamPost = postToElem(_hashtagPendingPosts[i], "original");
        var timePost = _hashtagPendingPosts[i]["userpost"]["time"];

        var streamItems = postboard.children();
        if( streamItems.length == 0) {
            postboard.prepend( streamPost );
        } else {
            var j = 0;
            for( j = 0; j < streamItems.length; j++) {
                var streamItem = streamItems.eq(j);
                var timeItem = streamItem.attr("data-time");
                if( timeItem == undefined ||
                    timePost > parseInt(timeItem) ) {
                    // this post in stream is older, so post must be inserted above
                    streamItem.before(streamPost);
                    break;
                }
            }
            if( j == streamItems.length ) {
                postboard.append( streamPost );
            }
        }
    }
    $.MAL.postboardLoaded();
    _hashtagPendingPosts = [];
}

