// twister_formatpost.js
// 2013 Miguel Freitas
//
// Format JSON posts and DMs to HTML.


// format "userpost" to html element
// kind = "original"/"ancestor"/"descendant"
function postToElem( post, kind ) {
    /*
    "userpost" :
    {
            "n" : username,
            "k" : seq number,
            "t" : "post" / "dm" / "rt"
            "msg" : message (post/rt)
            "time" : unix utc
            "height" : best height at user
            "dm" : encrypted message (dm) -opt
            "rt" : original userpost - opt
            "sig_rt" : sig of rt - opt
            "reply" : - opt
            {
                    "n" : reference username
                    "k" : reference k
            }
    }
    "sig_userpost" : signature by userpost.n
    */

    // Obtain data from userpost
    var postJson = $.toJSON(post);
    var userpost = post["userpost"];
    if( "rt" in userpost ) {
        var rt = userpost["rt"];
        var n = rt["n"];
        var k = rt["k"];
        var t = rt["time"];
        var msg = rt["msg"];
        var content_to_rt = $.toJSON(rt);
        var content_to_sigrt = userpost["sig_rt"];
        var retweeted_by = userpost["n"];
    } else {
        var n = userpost["n"];
        var k = userpost["k"];
        var t = userpost["time"];
        var msg = userpost["msg"]
        var content_to_rt = $.toJSON(userpost);
        var content_to_sigrt = post["sig_userpost"];
        var retweeted_by = undefined;
    }

    // Now create the html elements
    var elem = $.MAL.getPostTemplate().clone(true);
    elem.removeAttr('id');
    elem.addClass(kind);
    elem.attr('data-time', t);

    var postData = elem.find(".post-data");
    postData.addClass(kind);
    postData.attr('data-userpost', postJson);
    postData.attr('data-content_to_rt', content_to_rt);
    postData.attr('data-content_to_sigrt', content_to_sigrt);
    postData.attr('data-screen-name', n);
    postData.attr('data-id', k);
    postData.attr('data-text', msg);
    if( "reply" in userpost ) {
        postData.attr('data-replied-to-screen-name', userpost["reply"]["n"]);
        postData.attr('data-replied-to-id', userpost["reply"]["k"]);
    }

    var postInfoName = elem.find(".post-info-name");
    postInfoName.attr('href',$.MAL.userUrl(n));
    postInfoName.text(n);
    getFullname( n, postInfoName );
    elem.find(".post-info-tag").text = "@" + n;
    getAvatar( n, elem.find(".avatar") );
    elem.find(".post-info-time").text(timeGmtToText(t));

    var mentions = [];
    htmlFormatMsg( msg, elem.find(".post-text"), mentions);
    postData.attr('data-text-mentions', mentions);

    var replyTo = "";
    if( n != defaultScreenName )
        replyTo += "@" + n + " ";
    for( var i = 0; i < mentions.length; i++ ) {
        if( mentions[i] != n && mentions[i] != defaultScreenName ) {
            replyTo += "@" + mentions[i] + " ";
        }
    }
    elem.find(".post-area-new textarea").attr("placeholder","Reply to " + replyTo + "...");
    elem.find(".post-area-new textarea").attr("data-reply-to",replyTo);
    postData.attr("data-reply-to",replyTo);

    if( retweeted_by != undefined ) {
        elem.find(".post-context").show();
        var retweetedByElem = elem.find(".post-retransmited-by");
        retweetedByElem.attr("href", $.MAL.userUrl(retweeted_by));
        retweetedByElem.text(retweeted_by);
    }

    return elem;
}

// format dmdata (returned by getdirectmsgs) to display in "snippet" per user list
function dmDataToSnippetItem(dmData, remoteUser) {
    var dmItem = $("#dm-snippet-template").clone(true);
    dmItem.removeAttr('id');
    dmItem.attr("data-dm-screen-name",remoteUser);
    dmItem.attr("data-last_id", dmData.id);

    dmItem.find(".post-info-tag").text("@" + remoteUser);
    dmItem.find("a.post-info-name").attr("href", $.MAL.userUrl(remoteUser));
    dmItem.find("a.dm-chat-link").attr("href", $.MAL.dmchatUrl(remoteUser));
    getAvatar( remoteUser, dmItem.find(".post-photo").find("img") );
    getFullname( remoteUser, dmItem.find("a.post-info-name") );
    dmItem.find(".post-text").text(escapeHtmlEntities(dmData.text));
    dmItem.find(".post-info-time").text(timeGmtToText(dmData.time));

    return dmItem;
}

// format dmdata (returned by getdirectmsgs) to display in conversation thread
function dmDataToConversationItem(dmData, localUser, remoteUser) {
    var classDm = dmData.fromMe ? "sent" : "received";
    var dmItem = $("#dm-chat-template").clone(true);
    dmItem.removeAttr('id');
    dmItem.addClass(classDm);
    getAvatar(dmData.fromMe ? localUser : remoteUser, dmItem.find(".post-photo").find("img") );
    dmItem.find(".post-info-time").text(timeGmtToText(dmData.time));
    var mentions = [];
    htmlFormatMsg( dmData.text, dmItem.find(".post-text"), mentions);
    return dmItem;
}

// convert message text to html, featuring @users and links formating.
// todo: hashtags
function htmlFormatMsg( msg, output, mentions ) {
    var tmp;
    msg = escapeHtmlEntities(msg);
    while( msg != undefined && msg.length ) {
        var atindex = msg.indexOf("@");
        if( atindex != -1 ) {
            output.append(msg.substr(0, atindex));
            tmp = msg.substr(atindex+1);
            var username = _extractUsername(tmp);
            if( username.length ) {
                if( mentions.indexOf(username) < 0 )
                    mentions.push(username);
                var userLinkTemplate = $("#msg-user-link-template").clone(true);
                userLinkTemplate.removeAttr("id");
                userLinkTemplate.attr("href",$.MAL.userUrl(username));
                userLinkTemplate.text("@"+username);
                output.append(userLinkTemplate);
                msg = tmp.substr(String(username).length);
                continue;
            }
        }

        var httpindex = msg.indexOf("http://");
        var httpsindex = msg.indexOf("https://");
        if (httpsindex != -1) {
            httpindex = httpsindex;
        }
        if( httpindex != -1 ) {
            output.append(msg.substr(0, httpindex));
            tmp = msg.substring(httpindex);
            var space = tmp.indexOf(" ");
            var url;
            if( space != -1 ) url = tmp.substring(0,space); else url = tmp;
            if( url.length ) {
                var extLinkTemplate = $("#external-page-link-template").clone(true);
                extLinkTemplate.removeAttr("id");
                extLinkTemplate.attr("href",url);
                extLinkTemplate.text(url);
                extLinkTemplate.attr("title",url);
                output.append(extLinkTemplate);
                msg = tmp.substr(String(url).length);
                continue;
            }
        }

        var hashindex = msg.indexOf("#");
        if( hashindex != -1 ) {
            output.append(msg.substr(0, hashindex));
            tmp = msg.substr(hashindex+1);
            var hashtag = _extractUsername(tmp);
            if( hashtag.length ) {
                var hashtagLinkTemplate = $("#hashtag-link-template").clone(true);
                hashtagLinkTemplate.removeAttr("id");
                hashtagLinkTemplate.attr("href",$.MAL.hashtagUrl(hashtag));
                hashtagLinkTemplate.text("#"+hashtag);
                output.append(hashtagLinkTemplate);
                msg = tmp.substr(String(hashtag).length);
                continue;
            }
        }

        output.append(msg);
        msg = "";
    }
}

// internal function for htmlFormatMsg
function _extractUsername(s) {
    var username = "";
    for( var i = 0; i < s.length; i++ ) {
        var c = s.charCodeAt(i);
        if( (c >= 'a'.charCodeAt(0) && c <= 'z'.charCodeAt(0)) ||
            (c >= 'A'.charCodeAt(0) && c <= 'Z'.charCodeAt(0)) ||
            (c >= '0'.charCodeAt(0) && c <= '9'.charCodeAt(0)) ||
            c == '_'.charCodeAt(0) ) {
            username += s[i];
        } else {
            break;
        }
    }
    return username.toLowerCase();
}

function escapeHtmlEntities(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

