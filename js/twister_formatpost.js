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
    postData.attr('data-lastk', userpost["lastk"]);
    postData.attr('data-text', msg);
    if( "reply" in userpost ) {
        postData.attr('data-replied-to-screen-name', userpost["reply"]["n"]);
        postData.attr('data-replied-to-id', userpost["reply"]["k"]);

        postData.find('.post-expand').text(polyglot.t("Show conversation"));
    }

    var postInfoName = elem.find(".post-info-name");
    postInfoName.attr('href',$.MAL.userUrl(n));
    postInfoName.text(n);
    getFullname( n, postInfoName );
    elem.find(".post-info-tag").text = "@" + n;
    getAvatar( n, elem.find(".avatar") );
    elem.find(".post-info-time").text(timeGmtToText(t));
    elem.find(".post-info-time").attr("title",timeSincePost(t));

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
    if(!defaultScreenName)
    {
	elem.find(".post-area-new textarea").attr("placeholder", polyglot.t("You have to log in to post replies."));
    }
    else
    {
	elem.find(".post-area-new textarea").attr("placeholder", polyglot.t("reply_to", { fullname: replyTo })+ "...");
    }
    elem.find(".post-area-new textarea").attr("data-reply-to",replyTo);
    postData.attr("data-reply-to",replyTo);

    if( retweeted_by != undefined ) {
        elem.find(".post-context").show();
        var retweetedByElem = elem.find(".post-retransmited-by");
        retweetedByElem.attr("href", $.MAL.userUrl(retweeted_by));
        retweetedByElem.text('@'+retweeted_by);
    }

    return elem;
}

// format dmdata (returned by getdirectmsgs) to display in "snippet" per user list
function dmDataToSnippetItem(dmData, remoteUser) {
    var dmItem = $("#dm-snippet-template").clone(true);
    dmItem.removeAttr('id');
    dmItem.attr("data-dm-screen-name",remoteUser);
    dmItem.attr("data-last_id", dmData.id);
    dmItem.attr("data-time", dmData.time);

    dmItem.find(".post-info-tag").text("@" + remoteUser);
    dmItem.find("a.post-info-name").attr("href", $.MAL.userUrl(remoteUser));
    dmItem.find("a.dm-chat-link").attr("href", $.MAL.dmchatUrl(remoteUser));
    getAvatar( remoteUser, dmItem.find(".post-photo").find("img") );
    getFullname( remoteUser, dmItem.find("a.post-info-name") );
    dmItem.find(".post-text").html(escapeHtmlEntities(dmData.text));
    dmItem.find(".post-info-time").text(timeGmtToText(dmData.time));
    dmItem.find(".post-info-time").attr("title",timeSincePost(dmData.time));

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
    dmItem.find(".post-info-time").attr("title",timeSincePost(dmData.time));
    var mentions = [];
    htmlFormatMsg( dmData.text, dmItem.find(".post-text"), mentions);
    return dmItem;
}

// convert message text to html, featuring @users and links formating.
// todo: hashtags
function htmlFormatMsg( msg, output, mentions ) {
    var tmp;
    var match = null;
    var index;
    var strUrlRegexp = "http[s]?://";
    var strEmailRegexp = "\\S+@\\S+\\.\\S+";
    var strSplitCounterR = "\\(\\d{1,2}\\/\\d{1,2}\\)$";
    var reAll = new RegExp("(?:^|[ \\n\\t.,:\\/?!])(#|@|" + strUrlRegexp + "|" + strEmailRegexp + "|" + strSplitCounterR + ")");
    var reHttp = new RegExp(strUrlRegexp);
    var reEmail = new RegExp(strEmailRegexp);
    var reSplitCounter = new RegExp(strSplitCounterR);
    
    msg = escapeHtmlEntities(msg);

    while( msg != undefined && msg.length ) {
        
        match = reAll.exec(msg);
        if( match ) {
            index = (match[0] === match[1]) ? match.index : match.index + 1;
            if( match[1] == "@" ) {
                output.append(_formatText(msg.substr(0, index)));
                tmp = msg.substr(index+1);
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
                output.append('@');
                msg = tmp;
                continue;
            }
    
            if( reHttp.exec(match[1]) ) {
                output.append(_formatText(msg.substr(0, index)));
                tmp = msg.substring(index);
                var space = tmp.search(/[ \n\t]/);
                var url;
                if( space != -1 ) url = tmp.substring(0,space); else url = tmp;
                if( url.length ) {
                    msg = tmp.substr(String(url).length);
                    url = url.replace('&amp;', '&');
                    var extLinkTemplate = $("#external-page-link-template").clone(true);
                    extLinkTemplate.removeAttr("id");

                    if ($.Options.getUseProxyOpt() !== 'disable' && !$.Options.getUseProxyForImgOnlyOpt()){
                        //proxy alternatives may be added to options page...
                        if ($.Options.getUseProxyOpt() === 'ssl-proxy-my-addr') {
                            extLinkTemplate.attr('href', 'https://ssl-proxy.my-addr.org/myaddrproxy.php/' +
                                                         url.substring(0, url.indexOf(':')) +
                                                         url.substr(url.indexOf('/') + 1));
                        } else if ($.Options.getUseProxyOpt() ==='anonymouse') {
                            extLinkTemplate.attr('href', 'http://anonymouse.org/cgi-bin/anon-www.cgi/' + url);
                        }
                    } else {
                        extLinkTemplate.attr("href",url);
                    }

                    extLinkTemplate.text(url);
                    extLinkTemplate.attr("title",url);
                    output.append(extLinkTemplate);
                    continue;
                }
            }

            if( reEmail.exec(match[1]) ) {
                output.append(_formatText(msg.substr(0, index)));
                tmp = msg.substring(index);
                var space = tmp.search(/[ \n\t]/);
                var email;
                if( space != -1 ) email = tmp.substring(0,space); else email = tmp;
                if( email.length ) {
                    var extLinkTemplate = $("#external-page-link-template").clone(true);
                    extLinkTemplate.removeAttr("id");
                    extLinkTemplate.attr("href","mailto:" + email);
                    extLinkTemplate.text(email);
                    extLinkTemplate.attr("title",email);
                    output.append(extLinkTemplate);
                    msg = tmp.substr(String(email).length);
                    continue;
                }
            }
    
            if( match[1] == "#" ) {
                output.append(_formatText(msg.substr(0, index)));
                tmp = msg.substr(index+1);
                var hashtag = _extractHashtag(tmp);
                if( hashtag.length ) {
                    var hashtag_lc='';
                    for( var i = 0; i < hashtag.length; i++ ) {
                        var c = hashtag[i];
                        hashtag_lc += (c >= 'A' && c <= 'Z') ? c.toLowerCase() : c;
                    }
                    var hashtagLinkTemplate = $("#hashtag-link-template").clone(true);
                    hashtagLinkTemplate.removeAttr("id");
                    hashtagLinkTemplate.attr("href",$.MAL.hashtagUrl(hashtag_lc));
                    hashtagLinkTemplate.text("#"+hashtag);
                    output.append(hashtagLinkTemplate);
                    msg = tmp.substr(String(hashtag).length);
                    continue;
                }
                output.append('#');
                msg = tmp;
                continue;
            }

            if (reSplitCounter.exec(match[1])) {
                output.append(_formatText(msg.substr(0, index)));
                tmp = msg.substring(index);
                if( tmp.length ) {
                    var splitCounter = $('<span class="splited-post-counter"></span>');
                    splitCounter.text(tmp);
                    output.append(splitCounter);
                    msg = "";
                    continue;
                }
            }
        }

        output.append(_formatText(msg));
        msg = "";
    }
}

// internal function for htmlFormatMsg
function _formatText(msg)
{
    // TODO: add options for emotions and linefeeds
    //msg = $.emotions(msg);
    if( $.Options.getLineFeedsOpt() == "enable" )
        msg = msg.replace(/\n/g, '<br />');
    return msg;
}

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

// internal function for htmlFormatMsg
function _extractHashtag(s) {
    var hashtag = "";
    for( var i = 0; i < s.length; i++ ) {
        if( " \n\t.,:/?!".indexOf(s[i]) < 0 ) {
            hashtag += s[i];
        } else {
            break;
        }
    }
    return hashtag;
}

function escapeHtmlEntities(str) {
    return str.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;').replace("'", '&apos;');
}

