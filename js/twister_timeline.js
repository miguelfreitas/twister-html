// twister_timeline.js
// 2013 Miguel Freitas
//
// Provides objects to keep track of timeline display state to request new posts efficiently.
//
// Currently is being used only for "home" timeline, but the list of users can be an arbitrary
// subset of users we follow. In other words: this objects may be used for displaying profiles
// of those users more efficiently than iterating through dht posts.


var promotedPostsOnly = false;
var _idTrackerMap = {};
var _idTrackerSpam = new idTrackerObj();
var _lastHaveMap = {};
var _refreshInProgress = false;
var _newPostsPending = [];
var _sendedPostIDs = [];
var timelineLoaded = false;

/* object to keep tracking of post ids for a given user, that is, which
 * posts have already been received, processed, shown + which ones to request.
 * modes of operation:
 * "latestFirstTime" this is the first time the timeline is obtained, we known
 *                   nothing about the last post ids. there will be no gap since
 *                   timeline is empty on screen.
 * "latest" this is used when we have a timeline on screen but we want to update
 *          it with the latest posts. since getposts rpc may limit the number of
 *          posts to receive, a gap may be created. that is, between the most
 *          recent post of the previous update and the lower id received by getposts.
 * "fillgap" this is used to fill the gap after "latest" was used.
 * "older"  this is used to scroll down the timeline, to older posts than are
 *          currently being shown on screen.
 */
function idTrackerObj()
{
    this.latest = -1;
    this.oldest = -1;
    this.gapHigh = -1;
    this.gapLow = -1;

    // getRequest method creates a single user item of getposts rpc list parameter
    this.getRequest = function (mode) {
        if( mode == 'latest' || mode == 'latestFirstTime' ) {
            this.gapHigh = -1;
            this.gapLow = this.latest;
            return { since_id: this.latest };
        } else if( mode == 'fillgap') {
            return { max_id: this.gapHigh-1, since_id: this.gapLow };
        } else if( mode == 'older') {
            return ( this.oldest >= 0 ) ? { max_id: this.oldest-1 } : {};
        } else {
           console.log("getRequest: unknown mode");
        }
    }

    // receiveId method notifies that a post was received (and possibly shown)
    this.receivedId = function (mode, id, shown){
        if( id > this.latest ) this.latest = id;
        if( shown ) {
            if( this.oldest < 0 || id < this.oldest ) this.oldest = id;
        }
        if( mode == 'latest' ||
            mode == 'latestFirstTime' ||
            mode == 'fillgap') {
            if( this.gapHigh < 0 || id < this.gapHigh )
                this.gapHigh = id;
        } else if( mode == 'older') {
            // no gaps: posts are already received in descending order
        } else {
           console.log("receivedId: unknown mode");
        }
    }
}

/* object to maintain a request state for several users.
 * each user is tracked by idTrackerObj in global _idTrackerMap.
 */
function requestObj(users, mode, count, getspam)
{
    this.users = users;
    this.mode = mode; // 'latest', 'latestFirstTime' or 'older'
    this.count = count;
    this.getspam = getspam;

    // getRequest method returns the list parameter expected by getposts rpc
    this.getRequest = function() {
        var req = [];
        if( this.mode == 'done')
            return req;
        if( this.getspam ) {
            return _idTrackerSpam.getRequest(this.mode);
        }
        for( var i = 0; i < this.users.length; i++ ) {
            var user = this.users[i];
            if( !(user in _idTrackerMap) )
                _idTrackerMap[user] = new idTrackerObj();
            var r = _idTrackerMap[user].getRequest(this.mode);
            r.username = user;
            req.push(r);
        }
        return req;
    }

    // receiveId method notifies that a post was received (and possibly shown)
    this.reportProcessedPost = function(user, id, shown) {
        if( this.getspam ) {
            _idTrackerSpam.receivedId(this.mode, id, shown);
        } else if( this.users.indexOf(user) >= 0 ) {
            _idTrackerMap[user].receivedId(this.mode, id, shown);
        }
    }

    // doneReportProcessing is called after an getposts response is processed
    // mode changing may require a new request (to fill gaps)
    this.doneReportProcessing = function(receivedCount) {
        if (receivedCount >= this.count) {
            this.mode = 'done';
        } else {
            if (this.mode === 'latest' || this.mode === 'latestFirstTime') {
                this.mode = 'fillgap';
            } else if (this.mode === 'fillgap') {
                this.mode = 'older';
            }
        }
        //console.log('we got '+receivedCount+' posts from requested '+this.count+', status of processing: '+this.mode);
    }
}

// json rpc with requestObj as parameter
function requestGetposts(req)
{
    //console.log('requestGetposts');
    //console.log(req);
    var r = req.getRequest();
    if( !req.getspam ) {
        if( r.length ) {
            twisterRpc("getposts", [req.count,r],
                       function(req, posts) {processReceivedPosts(req, posts);}, req,
                       function(req, ret) {console.log("ajax error:" + ret);}, req);
        }
    } else {
        twisterRpc("getspamposts", [req.count,r.max_id?r.max_id:-1,r.since_id?r.since_id:-1],
                   function(req, posts) {processReceivedPosts(req, posts);}, req,
                   function(req, ret) {console.log("ajax error:" + ret);}, req);
    }
}

// callback to getposts rpc when updating the timeline
// process the received posts (adding them to screen) and do another
// request if needed
function processReceivedPosts(req, posts)
{
    //console.log('processReceivedPosts:');
    //console.log(posts);
    //hiding posts can cause empty postboard, so we have to track the count...
    for( var i = 0; i < posts.length; i++ ) {
        if (willBeHidden(posts[i])) {
            req.reportProcessedPost(posts[i]["userpost"]["n"],posts[i]["userpost"]["k"], true)
            posts.splice(i, 1);
            i--;
        }
    }
    updateTimeline(req, posts);
    req.doneReportProcessing(posts.length);

    //if the count of recieved posts less or equals to requested then...
    if (req.mode === 'done') {
        timelineLoaded = true;
        $.MAL.postboardLoaded();
        _refreshInProgress = false;
    } else {
        //we will request more older post...
        req.count -= posts.length;
        if (req.count > 0) {
            //console.log('we are requesting '+req.count+' more posts...');
            setTimeout((function (){requestGetposts(this)}).bind(req), 1000);
        } else {
            timelineLoaded = true;
            $.MAL.postboardLoaded();
            _refreshInProgress = false;
        }
    }
}

function updateTimeline(req, posts) {
    attachPostsToStream($.MAL.getStreamPostsParent(), posts, true,
        function (twist, promoted) {
            return {item: postToElem(twist, 'original', promoted), time: twist.userpost.time};
        },
        req.getspam
    );
    for (var i = 0; i < posts.length; i++) {
        req.reportProcessedPost(posts[i]['userpost']['n'], posts[i]['userpost']['k'], true);
    }
}

function attachPostsToStream(stream, posts, descendingOrder, createElem, createElemReq) {
    //console.log('attachPostsToStream:');
    //console.log(posts);

    var streamItems = stream.children();
    var streamPosts = [];

    for (var i = 0; i < streamItems.length; i++) {
        var streamItem = streamItems.eq(i);
        streamPosts.push({item: streamItem, time: parseInt(streamItem.attr('data-time'))});
    }

    for (var i = 0; i < posts.length; i++) {
        //console.log(posts[i]);
        var isAttached = false;
        var intrantPost = createElem(posts[i], createElemReq);
        intrantPost.item.attr('data-time', intrantPost.time);

        if (streamPosts.length) {
            // check to avoid twist duplication and insert the post in timeline ordered by (you guessed) time
            for (var j = 0; j < streamPosts.length; j++) {
                if (intrantPost.time === streamPosts[j].time &&
                    intrantPost.item[0].innerHTML === streamPosts[j].item[0].innerHTML) {
                        isAttached = true;
                        console.warn('appending of duplicate twist prevented');
                        break;
                } else if (descendingOrder ?
                    intrantPost.time > streamPosts[j].time : intrantPost.time < streamPosts[j].time) {
                    intrantPost.item.insertBefore(streamPosts[j].item).show();
                    streamPosts.splice(j, 0, intrantPost);
                    isAttached = true;
                    break;
                }
            }
        }
        if (!isAttached) {
            intrantPost.item.appendTo(stream).show();
            streamPosts.push(intrantPost);
        }
    }
}

// request timeline update for a given list of users
function requestTimelineUpdate(mode, count, timelineUsers, getspam)
{
    //console.log(mode+' timeline update request: '+count+' posts for following users - '+timelineUsers);
    if( _refreshInProgress || !defaultScreenName)
        return;
    $.MAL.postboardLoading();
    _refreshInProgress = true;
    if( timelineUsers.length ) {
        var req = new requestObj(timelineUsers, mode, count, getspam);
        if (mode === 'pending') {
            req.mode = 'latest';
            updateTimeline(req, _newPostsPending);
            _newPostsPending = [];
            $.MAL.reportNewPosts(_newPostsPending.length);
            $.MAL.postboardLoaded();
            _refreshInProgress = false;
        } else {
            requestGetposts(req);
        }
    } else {
        console.log("requestTimelineUpdate: not following any users");
    }
}

// getlasthave is called every second to check if followed users have posted anything new
function requestLastHave() {
    twisterRpc("getlasthave", [defaultScreenName],
           function(req, ret) {processLastHave(ret);}, null,
           function(req, ret) {console.log("ajax error:" + ret);}, null);
}

// handle getlasthave response. the increase in lasthave cannot be assumed to
// produce new items for timeline since some posts might be directmessages (which
// won't be returned by getposts, normally).
function processLastHave(userHaves)
{
    var reqConfirmNewPosts = [];
    var newPostsLocal = 0;
    for( var user in userHaves ) {
        if( userHaves.hasOwnProperty(user) ) {
            // checks for _idTrackerMap as well. the reason is that getlasthave
            // returns all users we follow, but the current timeline might be
            // for just a single user.
            if( user in _lastHaveMap && user in _idTrackerMap) {
                if( userHaves[user] > _lastHaveMap[user] ) {
                    newPostsLocal += userHaves[user] - _lastHaveMap[user];
                    reqConfirmNewPosts.push( {username:user, since_id:_lastHaveMap[user]} );
                }
            }
            _lastHaveMap[user] = userHaves[user];

            if( user == defaultScreenName ) {
                if( lastPostId == undefined || userHaves[user] > lastPostId ) {
                    incLastPostId(userHaves[user]);
                }
            }
        }
    }

    // now do a getposts to confirm the number of new haves with are effectively new public posts
    if( newPostsLocal ) {
        //console.log('processLastHave(): requesting '+newPostsLocal);
        //console.log(reqConfirmNewPosts);
        twisterRpc("getposts", [newPostsLocal, reqConfirmNewPosts],
               function(expected, posts) {processNewPostsConfirmation(expected, posts);}, newPostsLocal,
               function(req, ret) {console.log("ajax error:" + ret);}, null);
    }
}

// callback for getposts to update the number of new pending posts not shown in timeline
function processNewPostsConfirmation(expected, posts)
{
    //console.log('we got '+posts.length+' posts from expected '+expected+' for confirmation');
    //console.log(posts);
    // we want to report about new posts that would be displayed
    var rnp = 0;
    // we want to display sended posts immediately
    var sendedPostsPending = [];
    for( var i = posts.length-1; i >= 0; i-- ) {
        if ( !willBeHidden(posts[i]) ) {
            if ( _sendedPostIDs.indexOf(posts[i]['userpost']['k']) > -1 ) {
                sendedPostsPending.push(posts[i]);
            } else {
                _newPostsPending.push(posts[i]);
                rnp++;
            }
        }
    }
    if ( rnp > 0 ) {
        $.MAL.reportNewPosts(_newPostsPending.length);
    }
    if ( sendedPostsPending.length > 0 ) {
        var req = new requestObj([defaultScreenName],'latest',sendedPostsPending.length,promotedPostsOnly);
        updateTimeline(req, sendedPostsPending);
    }

    if( posts.length < expected ) {
        // new DMs have probably been produced by users we follow.
        // check with getdirectmsgs
        requestDMsCount();
    }
}

function timelineChangedUser()
{
    _idTrackerMap = {};
    _idTrackerSpam = new idTrackerObj();
    _lastHaveMap = {};
    _refreshInProgress = false;
    _newPostsPending = [];
    _sendedPostIDs = [];
    timelineLoaded = false;
}

function willBeHidden(post) {
    // posts without non-empty strings in both 'msg' and 'rt.msg' may be used for metadata like 'url' and are not meant to be displayed
    if ((typeof post.userpost.msg !== 'string' || post.userpost.msg === '')
        && (typeof post.userpost.rt !== 'object'
            || typeof post.userpost.rt.msg !== 'string' || post.userpost.rt.msg === ''))
        return true;

    if (post.userpost.n === defaultScreenName)
        return false;

    // currently we don't need to filter promoted posts anyhow
    if (typeof post.userpost.lastk === 'undefined')
        return false;

    if (typeof post.userpost.msg !== 'string' || post.userpost.msg === '') {
        // hope it is not too egocentric to overcome hideCloseRtsHour this way
        if (post.userpost.rt.n === defaultScreenName)
            return false;

        if ($.Options.hideCloseRTs.val !== 'disable' && followingUsers.indexOf(post.userpost.rt.n) > -1
            && parseInt(post.userpost.time) - parseInt(post.userpost.rt.time) < $.Options.hideCloseRtsHour.val * 3600)
            return true;

        var msg = post.userpost.rt.msg;
    } else {
        var msg = post.userpost.msg;

        if ($.Options.hideReplies.val !== 'disable' && /^\@/.test(msg) &&
            !(new RegExp('@' + defaultScreenName + '( |,|;|\\.|:|\\/|\\?|\\!|\\\\|\'|"|\\n|\\t|$)').test(msg)))
        {
            if ($.Options.hideReplies.val === 'only-me' ||
                ($.Options.hideReplies.val === 'following' &&
                 followingUsers.indexOf(msg.substring(1, msg.search(/ |,|;|\.|:|\/|\?|\!|\\|'|"|\n|\t|$/))) === -1 ))
            {
                return true;
            }
        }
    }

    if ($.Options.filterLang.val !== 'disable' && $.Options.filterLangForPostboard.val) {
        post.langFilter = filterLang(msg);
        if (!post.langFilter.pass && !$.Options.filterLangSimulate.val) {
            // TODO maybe we need a counter of posts blocked by language filter and even caching of them and button to show?
            //console.log('post by @'+post['userpost']['n']+' was hidden because it didn\'t passed by language filter:');
            return true;
        }
    }

    return false;
}
