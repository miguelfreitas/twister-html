// twister_formatpost.js
// 2013 Miguel Freitas
//
// Format JSON posts and DMs to HTML.


// format "userpost" to html element
// kind = "original"/"ancestor"/"descendant"
function postToElem( post, kind, promoted ) {
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
    elem.removeAttr('id')
        .addClass(kind)
        .attr('data-time', t)
    ;

    if( post['isNew'] )
        elem.addClass('new');

    var postData = elem.find('.post-data');
    postData.addClass(kind)
        .attr('data-userpost', postJson)
        .attr('data-content_to_rt', content_to_rt)
        .attr('data-content_to_sigrt', content_to_sigrt)
        .attr('data-screen-name', n)
        .attr('data-id', k)
        .attr('data-lastk', userpost["lastk"])
        .attr('data-text', msg)
    ;
    if( 'reply' in userpost ) {
        postData.attr('data-replied-to-screen-name', userpost.reply.n)
            .attr('data-replied-to-id', userpost.reply.k)
            .find('.post-expand').text(polyglot.t('Show conversation'))
        ;
    } else if ( 'rt' in userpost && 'reply' in userpost.rt ) {
        postData.attr('data-replied-to-screen-name', userpost.rt.reply.n)
            .attr('data-replied-to-id', userpost.rt.reply.k)
            .find('.post-expand').text(polyglot.t('Show conversation'))
        ;
    }

    var postInfoName = elem.find('.post-info-name');
    postInfoName.text(n).attr('href', $.MAL.userUrl(n));
    getFullname( n, postInfoName );
    //elem.find('.post-info-tag').text("@" + n);
    setPostInfoSent(n,k,elem.find('.post-info-sent'));
    getAvatar( n, elem.find('.avatar') );
    elem.find('.post-info-time').text(timeGmtToText(t)).attr('title', timeSincePost(t));

    var mentions = [];
    elem.find('.post-text').html(htmlFormatMsg(msg, mentions));
    postData.attr('data-text-mentions', mentions);

    var replyTo = '';
    if( n !== defaultScreenName )
        replyTo += '@' + n + ' ';
    for (var i = 0; i < mentions.length; i++) {
        if (mentions[i] !== n && mentions[i] !== defaultScreenName)
            replyTo += '@' + mentions[i] + ' ';
    }

    var postTextArea = elem.find('.post-area-new textarea');
    postTextArea.attr('data-reply-to', replyTo);
    if (!defaultScreenName)
        postTextArea.attr('placeholder', polyglot.t('You have to log in to post replies.'));
    else
        postTextArea.attr('placeholder', polyglot.t('reply_to', { fullname: replyTo })+ '...');

    postData.attr('data-reply-to', replyTo);

    if( retweeted_by != undefined ) {
        elem.find('.post-context').show();
        elem.find('.post-retransmited-by')
            .attr('href', $.MAL.userUrl(retweeted_by))
            .text('@' + retweeted_by)
        ;
    }

    if (typeof(promoted) !== 'undefined' && promoted) {
        elem.find('.post-propagate').remove();
    } else {
        if ($.Options.filterLang.val !== 'disable' && $.Options.filterLangSimulate.val) {
            // FIXME it's must be stuff from template actually
            if (typeof(post['langFilter']) !== 'undefined') {
                if (typeof(post['langFilter']['prob'][0]) !== 'undefined')
                    var mlm = '  //  '+polyglot.t('Most possible language: this', {'this': '<em>'+post['langFilter']['prob'][0].toString()+'</em>'});
                else
                    var mlm = '';

                elem.append('<div class="langFilterSimData">'+polyglot.t('This post is treated by language filter', {'treated': '<em>'+((post['langFilter']['pass']) ? polyglot.t('passed') : polyglot.t('blocked'))+'</em>'})+'</div>')
                    .append('<div class="langFilterSimData">'+polyglot.t('Reason: this', {'this': '<em>'+post['langFilter']['reason']+'</em>'})+mlm+'</div>')
                ;
            } else {
                elem.append('<div class="langFilterSimData">'+polyglot.t('This post is treated by language filter', {'treated': '<em>'+polyglot.t('not analyzed')+'</em>'})+'</div>');
            }
        }
    }

    return elem;
}

function setPostInfoSent(n, k, item) {
    if( n === defaultScreenName && k >= 0 ) {
        getPostMaxAvailability(n,k,
            function(args,count) {
                if( count >= 3 ) { // assume 3 peers (me + 2) is enough for "sent"
                    args.item.text("\u2713"); // check mark
                } else {
                    args.item.text("\u231B"); // hour glass
                    setTimeout(setPostInfoSent,2000,n,k,item);
                }
            }, {n:n,k:k,item:item});
    }
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
    if( remoteUser.length && remoteUser[0] === '*' )
        getGroupChatName( remoteUser, dmItem.find("a.post-info-name") );
    else
        getFullname( remoteUser, dmItem.find("a.post-info-name") );
    dmItem.find(".post-text").html(escapeHtmlEntities(dmData.text));
    dmItem.find(".post-info-time").text(timeGmtToText(dmData.time)).attr("title",timeSincePost(dmData.time));

    return dmItem;
}

// format dmdata (returned by getdirectmsgs) to display in conversation thread
function dmDataToConversationItem(dmData, localUser, remoteUser) {
    var from = (dmData.from && dmData.from.length && dmData.from.charCodeAt(0))
               ? dmData.from
               : (dmData.fromMe ? localUser : remoteUser);
    var classDm = dmData.fromMe ? "sent" : "received";
    var dmItem = $("#dm-chat-template").clone(true);
    dmItem.removeAttr('id');
    dmItem.addClass(classDm);
    getAvatar(from, dmItem.find(".post-photo").find("img") );
    dmItem.find(".post-info-time").text(timeGmtToText(dmData.time)).attr("title",timeSincePost(dmData.time));
    setPostInfoSent(from,dmData.k,dmItem.find('.post-info-sent'));
    var mentions = [];
    dmItem.find('.post-text').html(htmlFormatMsg(dmData.text, mentions));

    return dmItem;
}

// convert message text to html, featuring @users and links formating.
function htmlFormatMsg(msg, mentions) {
    function getStrStart(str, i, stopChars) {
        for (; i > -1; i--) {
            if (stopChars.indexOf(str[i]) > -1)
                return i + 1;
        }

        return 0;
    }

    function getStrEnd(str, i, stopChars) {
        for (; i < str.length; i++) {
            if (stopChars.indexOf(str[i]) > -1)
                return i - 1;
        }

        return str.length;
    }

    function extractStr(str, startPoint, endPoint, stopChars) {
        for (var i = endPoint; i > startPoint - 1; i--) {
            if (stopChars.indexOf(str[i]) === -1) {
                endPoint = i;
                break;
            }
        }

        return str.slice(startPoint, endPoint + 1);
    }

    function htmlSplitCounter(str) {
        html.push('<span class="splited-post-counter">' + str + '</span>');

        return '>' + (html.length - 1).toString() + '<';
    }

    var mentionsChars = 'abcdefghijklmnopqrstuvwxyz_0123456789';
    var stopCharsTrailing = '/\\.,:;?!*%\'"[](){}^|«»…\u201C\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3010\u3011';
    var stopCharsTrailingUrl = stopCharsTrailing.slice(1);
    var whiteSpaces = ' \f\n\r\t\v​\u00A0\u1680\u180E\u2000​\u2001\u2002​\u2003\u2004\u2005\u2006​\u2007\u2008​\u2009\u200A\u2028\u2029​\u202F\u205F\u3000';
    var stopCharsRight = '>' + whiteSpaces;
    var stopCharsLeft = '<' + whiteSpaces;
    var j, str, strEncoded;
    var html = [];

    msg = escapeHtmlEntities(msg);

    for (var i = 0; i < msg.length - 7; i++) {
        if (msg.slice(i, i + 4).toLowerCase() === 'http') {
            if (msg.slice(i + 4, i + 7) === '://' && stopCharsRight.indexOf(msg[i + 7]) === -1) {
                str = extractStr(msg, i, getStrEnd(msg, i + 7, stopCharsRight), stopCharsTrailingUrl);
                // FIXME we're trying to not interact with DOM, coz' we want to run really fast [to hell of RegExps]
                // FIXME actually we should avoid it by dropping a template idea and construct html right here
                html.push($('#external-page-link-template')[0].outerHTML
                    .replace(/\bid\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('id')
                    //.replace(/\bhref\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('href')
                    .replace(/<a\s+/ig, '<a href="' + proxyURL(str) + '" ')  // $().closest('a').attr('href', proxyURL(url))
                    .replace(/(<a\s+[^]*?>)[^]*?(<\/a>)/ig, '$1' + str + '$2')  // $().closest('a').text(url)
                );
                strEncoded = '>' + (html.length - 1).toString() + '<';
                msg = msg.slice(0, i) + strEncoded + msg.slice(i + str.length);
                i = i + strEncoded.length - 1;
            } else if (msg.slice(i + 4, i + 8).toLowerCase() === 's://' && stopCharsRight.indexOf(msg[i + 8]) === -1) {
                str = extractStr(msg, i, getStrEnd(msg, i + 8, stopCharsRight), stopCharsTrailingUrl);
                html.push($('#external-page-link-template')[0].outerHTML
                    .replace(/\bid\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('id')
                    //.replace(/\bhref\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('href')
                    .replace(/<a\s+/ig, '<a href="' + proxyURL(str) + '" ')  // $().closest('a').attr('href', proxyURL(url))
                    .replace(/(<a\s+[^]*?>)[^]*?(<\/a>)/ig, '$1' + str + '$2')  // $().closest('a').text(url)
                );
                strEncoded = '>' + (html.length - 1).toString() + '<';
                msg = msg.slice(0, i) + strEncoded + msg.slice(i + str.length);
                i = i + strEncoded.length - 1;
            }
        }
    }

    for (var i = 1; i < msg.length - 1; i++) {
        if (msg[i] === '@' && stopCharsLeft.indexOf(msg[i - 1]) === -1
            && stopCharsTrailing.indexOf(msg[i - 1]) === -1 && stopCharsRight.indexOf(msg[i + 1]) === -1) {
            j = getStrStart(msg, i, stopCharsLeft);
            str = extractStr(msg, j, getStrEnd(msg, i + 1, stopCharsRight), stopCharsTrailing);
            html.push($('#external-page-link-template')[0].outerHTML
                .replace(/\bid\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('id')
                //.replace(/\bhref\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('href')
                .replace(/<a\s+/ig, '<a href="mailto:' + str.toLowerCase() + '" ')  // $().closest('a').attr('href', 'mailto:'+url)
                .replace(/(<a\s+[^]*?>)[^]*?(<\/a>)/ig, '$1' + str + '$2')  // $().closest('a').text(url)
            );
            strEncoded = '>' + (html.length - 1).toString() + '<';
            msg = msg.slice(0, j) + strEncoded + msg.slice(j + str.length);
            i = j + strEncoded.length - 1;
        }
    }

    for (var i = 0; i < msg.length - 1; i++) {
        if (msg[i] === '@' && mentionsChars.indexOf(msg[i + 1].toLowerCase()) > -1) {
            for (j = i + 2; j < msg.length; j++) {
                if (mentionsChars.indexOf(msg[j].toLowerCase()) === -1)
                    break;
            }
            str = msg.slice(i + 1, j).toLowerCase();
            mentions.push(str);  // FIXME
            html.push($('#msg-user-link-template')[0].outerHTML
                .replace(/\bid\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('id')
                //.replace(/\bhref\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('href')
                .replace(/<a\s+(?=[^>]*?\bclass\s*=\s*"(?=[^"]*?\bopen-profile-modal\b))/ig, '<a href="' + $.MAL.userUrl(str) + '" ')  // $().closest('a.open-profile-modal').attr('href', $.MAL.userUrl(username))
                .replace(/(<a\s+(?=[^>]*?\bclass\s*=\s*"(?=[^"]*?\bopen-profile-modal\b))[^]*?>)[^]*?(<\/a>)/ig, '$1@' + str + '$2')  // $().closest('a.open-profile-modal').text('@'+username)
            );
            strEncoded = '>' + (html.length - 1).toString() + '<';
            msg = msg.slice(0, i) + strEncoded + msg.slice(i + str.length + 1);
            i = i + strEncoded.length - 1;
        }
    }

    for (var i = 0; i < msg.length - 1; i++) {
        j = i + 1;
        if (msg[i] === '#' && msg[j] !== '#' && stopCharsRight.indexOf(msg[j]) === -1) {
            str = extractStr(msg, j, getStrEnd(msg, j, '/' + stopCharsRight), stopCharsTrailing);
            html.push($('#hashtag-link-template')[0].outerHTML
                .replace(/\bid\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('id')
                //.replace(/\bhref\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('href')
                .replace(/<a\s+(?=[^>]*?\bclass\s*=\s*"(?=[^"]*?\bopen-hashtag-modal\b))/ig, '<a href="' + $.MAL.hashtagUrl(encodeURIComponent(str.toLowerCase())) + '" ')  // $().closest('a.open-profile-modal').attr('href', $.MAL.hashtagUrl(hashtag))
                .replace(/(<a\s+(?=[^>]*?\bclass\s*=\s*"(?=[^"]*?\bopen-hashtag-modal\b))[^]*?>)[^]*?(<\/a>)/ig, '$1#' + str.replace(/&amp;/g, '&') + '$2')  // $().closest('a.open-profile-modal').text('#'+hashtag)
            );
            strEncoded = '>' + (html.length - 1).toString() + '<';
            msg = msg.slice(0, i) + strEncoded + msg.slice(i + str.length + 1);
            i = i + strEncoded.length - 1;
        }
    }

    msg = msg
        .replace(/\(\d{1,2}\/\d{1,2}\)$/, htmlSplitCounter)
        .replace(/&(?!lt;|gt;|quot;|apos;)/g, '&amp;')  // FIXME in many cases there is no need to escape ampersand in HTML 5
    ;

    for (var i = 0; i < msg.length - 2; i++) {
        if (msg[i] === '>') {
            j = getStrEnd(msg, i + 2, '<');
            str = html[parseInt(msg.slice(i + 1, j + 1))];
            msg = msg.slice(0, i) + str + msg.slice(j + 2);
            i = i + str.length - 1;
        }
    }

    if ($.Options.displayLineFeeds.val === 'enable')
        msg = msg.replace(/\n/g, '<br />');

    // TODO: add options for emotions; msg = $.emotions(msg);
    // TODO: add at least basic markdown (optional) with syntax like this:
        // *text* -> bold text
        // ~text~ -> italic text
        // _text_ -> underlined text
        // -text- -> strikethrough text

    return msg;
}

function proxyURL(url) {
    var proxyOpt = $.Options.useProxy.val;
    if (proxyOpt !== 'disable' && !$.Options.useProxyForImgOnly.val) {
        // proxy alternatives may be added to options page FIXME currently not; and we need more fresh proxies
        if (proxyOpt === 'ssl-proxy-my-addr') {
            url = 'https://ssl-proxy.my-addr.org/myaddrproxy.php/' +
                url.substring(0, url.indexOf(':')) + url.substr(url.indexOf('/') + 1);
        } else if (proxyOpt === 'anonymouse')
            url = 'http://anonymouse.org/cgi-bin/anon-www.cgi/' + url;
    }

    return url;
}

function escapeHtmlEntities(str) {
    return str
                //.replace(/&/g, '&amp;') we do it not here
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
}

function reverseHtmlEntities(str) {
    return str
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                .replace(/&amp;/g, '&');
}

