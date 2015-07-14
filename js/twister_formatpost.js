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
    function getStrStart(str, startPoint, stopChars, stopCharsTrailing) {
        for (var i = startPoint; i > -1; i--) {
            if (stopChars.indexOf(str[i]) > -1)
                break;
        }

        for (i += 1; i < startPoint + 1; i++) {
            if (stopCharsTrailing.indexOf(str[i]) === -1)
                break;
        }

        return i;
    }

    function getStrEnd(str, startPoint, stopChars, stopCharsTrailing) {
        for (var i = startPoint; i < str.length; i++) {
            if (stopChars.indexOf(str[i]) > -1)
                break;
        }

        for (i -= 1; i > startPoint - 1; i--) {
            if (stopCharsTrailing.indexOf(str[i]) === -1)
                break;
        }

        return i;
    }

    function markdown(str, chr, tag) {
        function whiteSpace(i, j) {
            j++;
            for (i += 1; i < j; i++) {
                if (p[i].w)
                    return true;
            }

            return false;
        }

        var i, j, t;
        var w = false;
        var p = [];

        // collecting chars position data
        for (i = 0; i < str.length; i++) {
            if (str[i] === chr) {
                for (j = i + 1; j < str.length; j++) {
                    if (str[j] !== chr)
                        break;
                }
                if (whiteSpaces.indexOf(str[i - 1]) === -1 || whiteSpaces.indexOf(str[j]) === -1) {
                    if (whiteSpaces.indexOf(str[i - 1]) > -1 || i === 0)
                        t = -1;
                    else if (whiteSpaces.indexOf(str[j]) > -1 || i === str.length - 1)
                        t = 1;
                    else if (stopCharsMarkDown.indexOf(str[i - 1]) > -1) {
                        if (stopCharsMarkDown.indexOf(str[j]) === -1)
                            t = -1;
                        else {
                            for (t = j + 1; t < str.length; t++) {
                                if (whiteSpaces.indexOf(str[t]) > -1) {
                                    if ((2 * j - t) < 0 || whiteSpaces.indexOf(str[2 * j - t]) === -1) {
                                        t = 1;
                                        break;
                                    }
                                } else if (stopCharsMarkDown.indexOf(str[t]) === -1) {
                                    if ((2 * j - t) < 0 || whiteSpaces.indexOf(str[2 * j - t]) > -1) {
                                        t = -1;
                                        break;
                                    }
                                }
                            }
                            if (t = str.length)
                                t = 1;
                        }
                    } else if (stopCharsMarkDown.indexOf(str[j]) > -1)
                        t = 1;
                    else
                        t = 0;
                    p.push({i: i, k: j - i, t: t, w: w, a: -1, p: -1});
                    w = false;
                }
                i = j;
            } else if (!w && whiteSpaces.indexOf(str[i]) > -1) {
                w = true;
            }
        }

        // calculating dependencies
        for (i = 0; i < p.length; i++) {
            if (p[i].t < 1 && p[i].a === -1) {
                t = i;
                for (j = i + 1; j < p.length; j++) {
                    if (p[i].t === 0 && whiteSpace(i, j)) {
                        i = j - 1;
                        break;
                    } else if (p[j].t < 1 && p[j].a === -1) {
                        p[t].p = j;
                        t = j;
                    } else if (p[j].t === 1 && p[j].a === -1) {
                        p[i].a = j;
                        p[j].a = i;
                        i = j;
                        break;
                    }
                }
            }
        }
        for (i = 0; i < p.length; i++) {
            if (p[i].t === -1 && p[i].a === -1) {
                for (j = p[i].p; j > -1; j = p[j].p) {
                    if (whiteSpace(i, j)) {
                        i = j - 1;
                        break;
                    } else if (p[j].t === 0
                        && !(p[j].p > -1 && p[p[j].p].t === 0 && !whiteSpace(j, p[j].p))) {
                        p[j].a = i;
                        p[i].a = j;
                        i = j;
                        break;
                    }
                }
            }
        }

        // changing the string
        for (i = 0; i < p.length; i++) {
            if (p[i].a > -1) {
                if (p[i].t === -1 || (p[i].t === 0 && p[i].a > i)) {
                    if (p[i].k > 1)
                        html.push('<' + tag + '>' + Array(p[i].k).join(chr));
                    else
                        html.push('<' + tag + '>');
                } else if (p[i].t === 1 || (p[i].t === 0 && p[i].a < i)) {
                    if (p[i].k > 1)
                        html.push(Array(p[i].k).join(chr) + '</' + tag + '>');
                    else
                        html.push('</' + tag + '>');
                } else {
                    if (p[i].k > 1)
                        html.push(Array(p[i].k + 1).join(chr));
                    else
                        html.push(chr);
                }
                    strEncoded = '>' + (html.length - 1).toString() + '<';
                    str = str.slice(0, p[i].i) + strEncoded + str.slice(p[i].i + p[i].k);
                    l = strEncoded.length - p[i].k;
                    for (j = i + 1; j < p.length; j++)
                        p[j].i += l;
            }
        }

        return str;
    }

    function htmlSplitCounter(str) {
        html.push('<span class="splited-post-counter">' + str + '</span>');

        return '>' + (html.length - 1).toString() + '<';
    }

    var mentionsChars = 'abcdefghijklmnopqrstuvwxyz_0123456789';
    var stopCharsTrailing = '/\\*.,:;?!%\'"[](){}^|«»…\u201C\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3010\u3011';
    var stopCharsTrailingUrl = stopCharsTrailing.slice(1);
    var whiteSpaces = ' \f\n\r\t\v​\u00A0\u1680\u180E\u2000​\u2001\u2002​\u2003\u2004\u2005\u2006​\u2007\u2008​\u2009\u200A\u2028\u2029​\u202F\u205F\u3000';
    var stopCharsLeft = '<' + whiteSpaces;
    var stopCharsRight = '>' + whiteSpaces;
    var stopCharsRightHashtags = stopCharsRight + stopCharsTrailing;
    var stopCharsMarkDown = '~_-`+=<>&' + stopCharsTrailing + whiteSpaces;
    var j, str, strEncoded;
    var html = [];

    msg = escapeHtmlEntities(msg);

    for (var i = 0; i < msg.length - 7; i++) {
        if (msg.slice(i, i + 2) === '](') {
            // FIXME there can be text with [] inside [] or links with () wee need to handle it too
            j = getStrStart(msg, i - 1, '[', '');
            if (j < i) {
                var k = getStrEnd(msg, i + 2, ')', '');
                if (k > i + 1) {
                    html.push($('#external-page-link-template')[0].outerHTML
                        .replace(/\bid\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('id')
                        //.replace(/\bhref\s*=\s*"[^]*?"+/ig, '')  // $().removeAttr('href')
                        .replace(/<a\s+/ig, '<a href="' + proxyURL(msg.slice(i + 2, k + 1)) + '" ')  // $().closest('a').attr('href', proxyURL(url))
                        .replace(/(<a\s+[^]*?>)[^]*?(<\/a>)/ig, '$1' + msg.slice(j, i) + '$2')  // $().closest('a').text(url)
                    );
                    strEncoded = '>' + (html.length - 1).toString() + '<';
                    msg = msg.slice(0, j - 1) + strEncoded + msg.slice(k + 2);
                    i = j + strEncoded.length - 1;
                }
            }
        } else if (msg.slice(i, i + 4).toLowerCase() === 'http') {
            if (msg.slice(i + 4, i + 7) === '://' && stopCharsRight.indexOf(msg[i + 7]) === -1) {
                j = getStrEnd(msg, i + 7, stopCharsRight, stopCharsTrailingUrl);
                if (j > i + 6) {
                    str = msg.slice(i, j + 1);
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
                }
            } else if (msg.slice(i + 4, i + 8).toLowerCase() === 's://' && stopCharsRight.indexOf(msg[i + 8]) === -1) {
                j = getStrEnd(msg, i + 8, stopCharsRight, stopCharsTrailingUrl);
                if (j > i + 7) {
                    str = msg.slice(i, j + 1);
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
    }

    for (var i = 1; i < msg.length - 1; i++) {
        if (msg[i] === '@' && stopCharsLeft.indexOf(msg[i - 1]) === -1
            && stopCharsTrailing.indexOf(msg[i - 1]) === -1 && stopCharsRight.indexOf(msg[i + 1]) === -1) {
            j = getStrStart(msg, i - 1, stopCharsLeft, stopCharsTrailing);
            if (j < i) {
                var k = getStrEnd(msg, i + 1, stopCharsRight, stopCharsTrailing);
                if (k > i) {
                    str = msg.slice(j, k + 1);
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
        if (msg[i] === '#' && msg[i + 1] !== '#' && stopCharsRight.indexOf(msg[i + 1]) === -1) {
            j = getStrEnd(msg, i + 1, stopCharsRightHashtags, stopCharsTrailing);
            if (j > i) {
                str = msg.slice(i + 1, j + 1);
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
    }

    msg = markdown(markdown(markdown(markdown(markdown(msg,
        '*', 'b'),  // bold
        '~', 'i'),  // italic
        '_', 'u'),  // underlined
        '-', 's'),  // striketrough
        '`', 'samp')  // kind of monospace
        .replace(/\(\d{1,2}\/\d{1,2}\)$/, htmlSplitCounter)
        .replace(/&(?!lt;|gt;)/g, '&amp;')  // FIXME in many cases there is no need to escape ampersand in HTML 5
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    ;

    for (var i = 0; i < msg.length - 2; i++) {
        if (msg[i] === '>') {
            for (var j = i + 2; j < msg.length; j++) {
                if (msg[j] === '<')
                    break;
            }
            str = html[parseInt(msg.slice(i + 1, j))];
            msg = msg.slice(0, i) + str + msg.slice(j + 1);
            i = i + str.length - 1;
        }
    }

    if ($.Options.displayLineFeeds.val === 'enable')
        msg = msg.replace(/\n/g, '<br />');

    // TODO: add options for emotions; msg = $.emotions(msg);
    // TODO make markdown optionally mutable ?
        // some escaping tag

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
        //.replace(/"/g, '&quot;')
        //.replace(/'/g, '&apos;')
    ;
}

function reverseHtmlEntities(str) {
    return str
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&apos;/g, "'")
                .replace(/&amp;/g, '&');
}

