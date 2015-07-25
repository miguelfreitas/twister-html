// twister_formatpost.js
// 2013 Miguel Freitas
//
// Format JSON posts and DMs to HTML.

var _htmlFormatMsgLinkTemplateExternal;
var _htmlFormatMsgLinkTemplateUser;
var _htmlFormatMsgLinkTemplateHashtag;

$(document).ready(function() {
    // we're setting it here for perfomance improvement purpose  // to not search and prepare it for for every post every time
    _htmlFormatMsgLinkTemplateExternal = $('#external-page-link-template')
    if (_htmlFormatMsgLinkTemplateExternal.length) {
        _htmlFormatMsgLinkTemplateExternal = _htmlFormatMsgLinkTemplateExternal[0].cloneNode();
        _htmlFormatMsgLinkTemplateExternal.removeAttribute('id');
    }
    _htmlFormatMsgLinkTemplateUser = $('#msg-user-link-template')
    if (_htmlFormatMsgLinkTemplateUser.length) {
        _htmlFormatMsgLinkTemplateUser = _htmlFormatMsgLinkTemplateUser[0].cloneNode();
        _htmlFormatMsgLinkTemplateUser.removeAttribute('id');
    }
    _htmlFormatMsgLinkTemplateHashtag = $('#hashtag-link-template')
    if (_htmlFormatMsgLinkTemplateHashtag.length) {
        _htmlFormatMsgLinkTemplateHashtag = _htmlFormatMsgLinkTemplateHashtag[0].cloneNode();
        _htmlFormatMsgLinkTemplateHashtag.removeAttribute('id');
    }
});

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
    dmItem.find(".post-text").html(htmlFormatMsg(dmData.text, []));
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
    // TODO: add options for emotions; msg = $.emotions(msg);
    // TODO make markup optionally mutable ?

    function getSubStrStart(str, startPoint, stopChars, isStopCharMustExist, stopCharsTrailing) {
        for (var i = startPoint; i > -1; i--) {
            if (stopChars.indexOf(str[i]) > -1)
                break;
        }

        if (i !== -1 || !isStopCharMustExist) {
            for (i += 1; i < startPoint + 1; i++) {
                if (stopCharsTrailing.indexOf(str[i]) === -1)
                    break;
            }
        } else
            i = startPoint + 1;

        return i;
    }

    function getSubStrEnd(str, startPoint, stopChars, isStopCharMustExist, stopCharsTrailing) {
        for (var i = startPoint; i < str.length; i++) {
            if (stopChars.indexOf(str[i]) > -1)
                break;
        }

        if (i !== str.length || !isStopCharMustExist) {
            for (i -= 1; i > startPoint - 1; i--) {
                if (stopCharsTrailing.indexOf(str[i]) === -1)
                    break;
            }
        } else
            i = startPoint - 1;

        return i;
    }

    function markout(msg, chr, tag) {
        if ($.Options.postsMarkout.val === 'ignore')
            return msg;

        function isWhiteSpacesBetween(i, j) {
            j++;
            for (i += 1; i < j; i++) {
                if (p[i].w)
                    return true;
            }

            return false;
        }

        var i, j, t, l, r, htmlEntityEncoded;
        var w = false;
        var p = [];

        // collecting chars position data
        for (i = 0; i < msg.str.length; i++) {
            if (msg.str[i] === chr) {
                for (j = i + 1; j < msg.str.length; j++) {
                    if (msg.str[j] !== chr)
                        break;
                }
                if (i === 0) {
                    p.push({i: i, k: j - i, t: -1, w: w, a: -1, p: -1});
                    w = false;
                } else if (j === msg.str.length) {
                    p.push({i: i, k: j - i, t: 1, w: w, a: -1, p: -1});
                    w = false;
                } else {
                    if (stopCharsMarkout.indexOf(msg.str[i - 1]) > -1) {
                        l = 1;
                        for (t = i - 2; t > -1; t--) {
                            if (msg.str[t] === chr) {
                                l = -1;
                                break;
                            } else if (stopCharsMarkout.indexOf(msg.str[t]) === -1) {
                                l = whiteSpaces.indexOf(msg.str[t]);
                                break;
                            }
                        }
                    } else
                        l = whiteSpaces.indexOf(msg.str[i - 1]);
                    if (stopCharsMarkout.indexOf(msg.str[j]) > -1) {
                        r = 1;
                        for (t = j + 1; t < msg.str.length; t++) {
                            if (msg.str[t] === chr) {
                                r = -1;
                                break;
                            } else if (stopCharsMarkout.indexOf(msg.str[t]) === -1) {
                                r = whiteSpaces.indexOf(msg.str[t]);
                                break;
                            }
                        }
                    } else
                        r = whiteSpaces.indexOf(msg.str[j]);
                    if (l > -1) {
                        if (r > -1) {
                            if (j - i > 2) {
                                l = p.push({i: i, k: j - i - 1, t: -1, w: w, a: -1, p: -1}) - 1;
                                p[l].a = p.push({i: j - 1, k: 1, t: 1, w: false, a: l, p: -1}) - 1;
                            }
                            t = 10;
                        } else
                            t = -1;
                    } else {
                        if (r > -1)
                            t = 1;
                        else
                            t = 0;
                    }
                    if (t !== 10)
                        p.push({i: i, k: j - i, t: t, w: w, a: -1, p: -1});
                    w = false;
                }
                i = j - 1;
            } else if (!w && whiteSpaces.indexOf(msg.str[i]) > -1) {
                w = true;
            }
        }

        // calculating dependencies
        for (i = 0; i < p.length; i++) {
            if (p[i].t < 1 && p[i].a === -1) {
                t = i;
                for (j = i + 1; j < p.length; j++) {
                    if (p[i].t === 0 && isWhiteSpacesBetween(i, j)) {
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
                    if (isWhiteSpacesBetween(i, j)) {
                        i = j - 1;
                        break;
                    } else if (p[j].t === 0
                        && !(p[j].p > -1 && p[p[j].p].t === 0 && !isWhiteSpacesBetween(j, p[j].p))) {
                        p[j].a = i;
                        p[i].a = j;
                        i = j;
                        break;
                    }
                }
            }
        }

        // changing the string
        if (chr === '`' && $.Options.postsMarkout.val === 'apply') {  // if $.Options.postsMarkout.val === 'clear' then ` does not escapes anythyng so it needs to be handled like other tags
            for (i = 0; i < p.length; i++) {
                if (p[i].a > -1) {
                    if (p[i].t === -1 || (p[i].t === 0 && p[i].a > i)) {
                        if (p[i].k > 1)
                            t = Array(p[i].k).join(chr);
                        else
                            t = '';
                        j = p[i].a;
                        t = t + msg.str.slice(p[i].i + p[i].k, p[j].i);
                        if (p[j].k > 1)
                            t = t + Array(p[i].k).join(chr);
                        t = '<' + tag + '>' + t + '</' + tag + '>';
                        msg.htmlEntities.push(t.replace(/&(?!lt;|gt;)/g, '&amp;'));
                        htmlEntityEncoded = '>' + (msg.htmlEntities.length - 1).toString() + '<';
                        msg.str = msg.str.slice(0, p[i].i) + htmlEntityEncoded + msg.str.slice(p[j].i + p[j].k);
                        l = htmlEntityEncoded.length - p[j].i - p[j].k + p[i].i;
                        i = j;
                        for (j += 1; j < p.length; j++)
                            p[j].i += l;
                    }
                }
            }
        } else {
            if ($.Options.postsMarkout.val === 'apply') {
                t = '</' + tag + '>';
                tag = '<' + tag + '>';
            } else {  // $.Options.postsMarkout.val === 'clear' so we're clearing markup
                t = '';
                tag = '';
            }
            for (i = 0; i < p.length; i++) {
                if (p[i].a > -1) {
                    if (p[i].t === -1 || (p[i].t === 0 && p[i].a > i)) {
                        if (p[i].k > 1)
                            msg.htmlEntities.push(tag + Array(p[i].k).join(chr));
                        else
                            msg.htmlEntities.push(tag);
                    } else if (p[i].t === 1 || (p[i].t === 0 && p[i].a < i)) {
                        if (p[i].k > 1)
                            msg.htmlEntities.push(Array(p[i].k).join(chr) + t);
                        else
                            msg.htmlEntities.push(t);
                    }
                        htmlEntityEncoded = '>' + (msg.htmlEntities.length - 1).toString() + '<';
                        msg.str = msg.str.slice(0, p[i].i) + htmlEntityEncoded + msg.str.slice(p[i].i + p[i].k);
                        l = htmlEntityEncoded.length - p[i].k;
                        for (j = i + 1; j < p.length; j++)
                            p[j].i += l;
                }
            }
        }

        return msg;
    }

    function newHtmlEntityLink(template, urlTarget, urlName) {
        template.href = urlTarget;
        template.innerHTML = urlName;  // .innerHTML instead .text to allow markup inside [] of [url name](target)

        return template.outerHTML;
    }

    function msgAddHtmlEntity(msg, strSliceLeft, strSliceRigth, htmlEntity) {
        msg.htmlEntities.push(htmlEntity);
        var htmlEntityEncoded = '>' + (msg.htmlEntities.length - 1).toString() + '<';
        msg.str = msg.str.slice(0, strSliceLeft) + htmlEntityEncoded + msg.str.slice(strSliceRigth);
        msg.i = strSliceLeft + htmlEntityEncoded.length - 1;

        return msg;
    }

    function applyHtml(msg) {
        var t;

        for (var i = 0; i < msg.str.length - 2; i++) {
            if (msg.str[i] === '>') {
                for (var j = i + 2; j < msg.str.length; j++) {
                    if (msg.str[j] === '<')
                        break;
                }
                t = msg.htmlEntities[parseInt(msg.str.slice(i + 1, j))];
                msg.str = msg.str.slice(0, i) + t + msg.str.slice(j + 1);
                i = i + t.length - 1;
            }
        }

        return msg.str;
    }

    var mentionsChars = 'abcdefghijklmnopqrstuvwxyz_0123456789';
    var stopCharsTrailing = '/\\*~_-`.,:;?!%\'"[](){}^|«»…\u201C\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3010\u3011\u2047\u2048\u2049';
    var stopCharsTrailingUrl = stopCharsTrailing.slice(1);
    var whiteSpaces = ' \f\n\r\t\v​\u00A0\u1680\u180E\u2000​\u2001\u2002​\u2003\u2004\u2005\u2006​\u2007\u2008​\u2009\u200A\u2028\u2029​\u202F\u205F\u3000';
    var whiteSpacesUrl = '\'\"' + whiteSpaces;
    var stopCharsLeft = '<' + whiteSpaces;
    var stopCharsRight = '>' + whiteSpaces;
    var stopCharsRightHashtags = '>/\\.,:;?!%\'"[](){}^|«»…\u201C\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3010\u3011\u2047\u2048\u2049'  // same as stopCharsTrailing but without '*~_-`' plus '>'
        + whiteSpaces;
    var stopCharsMarkout = '/\\*~_-`.,:;?!%+=&\'"[](){}^|«»…\u201C\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3010\u3011\u2047\u2048\u2049';
    var i, j, k, str;

    msg = {str: escapeHtmlEntities(msg), htmlEntities: []};

    msg = markout(msg, '`', 'samp');  // <samp> tag is kind of monospace, here sequence of chars inside it will be escaped from markup

    // handling links
    for (i = 0; i < msg.str.length - 7; i++) {
        if (msg.str.slice(i, i + 2) === '](' && $.Options.postsMarkout.val !== 'ignore') {
            // FIXME there can be text with [] inside [] or links with () we need to handle it too
            j = getSubStrStart(msg.str, i - 2, '[', true, '');
            if (j < i - 1) {
                k = getSubStrEnd(msg.str, i + 3, ')', true, whiteSpaces);
                if (k > i + 2) {
                    var linkName = msg.str.slice(j, i);  // name of possiible link
                    for (i += 2; i < k; i++) {
                        if (whiteSpacesUrl.indexOf(msg.str[i]) === -1)  // drop whitespaces and ' and "  // apostrophes and quotes to prevent injection of js events
                            break;
                    }
                    if (i < k) {
                        var x = getSubStrEnd(msg.str, i, ':', false, '') + 1;
                        // following check is NOT for real protection (we have blocking CSP rule instead), it's just to aware people
                        if (msg.str[i] === '#' || (x > i && x < k && (msg.str.slice(x - 6, x).toLowerCase() === 'script'  // other things would be added when W3C and all the people invent it
                            || msg.str.slice(x - 4, x).toLowerCase() === 'data'))) {
                            msg = msgAddHtmlEntity(msg, j - 1, getSubStrEnd(msg.str, k + 1, ')', true, '') + 2,
                                '…<br><b><i>' + polyglot.t('busted_oh') + '</i> '
                                + polyglot.t('busted_avowal') + ':</b><br><samp>'
                                + msg.str.slice(i, k + 1)
                                    .replace(/&(?!lt;|gt;)/g, '&amp;')
                                    .replace(/"/g, '&quot;')
                                    .replace(/'/g, '&apos;')
                                + '</samp><br>'
                            );
                        } else {
                            if (getSubStrEnd(msg.str, i + 1, whiteSpacesUrl, false, '') < k)  // use only first word as href target, others drop silently
                                k = getSubStrEnd(msg.str, i + 1, whiteSpacesUrl, false, '');
                            if ($.Options.postsMarkout.val === 'apply') {
                                msg = msgAddHtmlEntity(msg, j - 1, getSubStrEnd(msg.str, k + 1, ')', true, '') + 2,
                                    newHtmlEntityLink(_htmlFormatMsgLinkTemplateExternal,
                                        proxyURL(msg.str.slice(i, k + 1)),
                                        applyHtml(  // we're trying markup inside [] of []()
                                            markout(markout(markout(markout(
                                                {str: linkName, htmlEntities: msg.htmlEntities},
                                                    '*', 'b'),  // bold
                                                    '~', 'i'),  // italic
                                                    '_', 'u'),  // underlined
                                                    '-', 's')  // striketrough
                                        )
                                            .replace(/&(?!lt;|gt;)/g, '&amp;')
                                    )
                                );
                            } else {  // $.Options.postsMarkout.val === 'clear' so we're clearing markup
                                str = msg.str.slice(i, k + 1);
                                msg = msgAddHtmlEntity(msg, j - 1, getSubStrEnd(msg.str, k + 1, ')', true, '') + 2,
                                    applyHtml(  // we're trying to clear markup inside [] of []()
                                        markout(markout(markout(markout(
                                            {str: linkName, htmlEntities: msg.htmlEntities},
                                                '*', 'b'),  // bold
                                                '~', 'i'),  // italic
                                                '_', 'u'),  // underlined
                                                '-', 's')  // striketrough
                                    )
                                        .replace(/&(?!lt;|gt;)/g, '&amp;')
                                );
                                // here we put link target as plain text to handle it usual way (search http[s]:// and so on)
                                i = msg.i + 1
                                msg.str = msg.str.slice(0, i) + ' ' + str + msg.str.slice(i);
                                /* alternatively we could set up it as link itself but I suppose you don't want it
                                msg = msgAddHtmlEntity(msg, msg.i + 1, msg.i + 1,
                                    ' ' + newHtmlEntityLink(_htmlFormatMsgLinkTemplateExternal,
                                        proxyURL(str), str)
                                ); */
                            }
                        }
                        i = msg.i + 1;
                    }
                }
            }
        } else if (msg.str.slice(i, i + 4).toLowerCase() === 'http') {
            if (msg.str.slice(i + 4, i + 7) === '://' && stopCharsRight.indexOf(msg.str[i + 7]) === -1) {
                j = getSubStrEnd(msg.str, i + 7, stopCharsRight, false, stopCharsTrailingUrl);
                if (j > i + 6) {
                    str = msg.str.slice(i, j + 1);
                    msg = msgAddHtmlEntity(msg, i, i + str.length,
                        newHtmlEntityLink(_htmlFormatMsgLinkTemplateExternal,
                            proxyURL(str), str)
                    );
                    i = msg.i;
                }
            } else if (msg.str.slice(i + 4, i + 8).toLowerCase() === 's://' && stopCharsRight.indexOf(msg.str[i + 8]) === -1) {
                j = getSubStrEnd(msg.str, i + 8, stopCharsRight, false, stopCharsTrailingUrl);
                if (j > i + 7) {
                    str = msg.str.slice(i, j + 1);
                    msg = msgAddHtmlEntity(msg, i, i + str.length,
                        newHtmlEntityLink(_htmlFormatMsgLinkTemplateExternal,
                            proxyURL(str), str)
                    );
                    i = msg.i;
                }
            }
        }
    }

    // handling mails
    for (i = 1; i < msg.str.length - 1; i++) {
        if (msg.str[i] === '@' && stopCharsLeft.indexOf(msg.str[i - 1]) === -1
            && stopCharsTrailing.indexOf(msg.str[i - 1]) === -1 && stopCharsRight.indexOf(msg.str[i + 1]) === -1) {
            j = getSubStrStart(msg.str, i - 1, stopCharsLeft, false, stopCharsTrailing);
            if (j < i) {
                k = getSubStrEnd(msg.str, i + 1, stopCharsRight, false, stopCharsTrailing);
                if (k > i) {
                    str = msg.str.slice(j, k + 1);
                    msg = msgAddHtmlEntity(msg, j, j + str.length,
                        newHtmlEntityLink(_htmlFormatMsgLinkTemplateExternal,
                            'mailto:' + str.toLowerCase(), str)
                    );
                    i = msg.i;
                }
            }
        }
    }

    // handling mentions
    for (i = 0; i < msg.str.length - 1; i++) {
        if (msg.str[i] === '@' && mentionsChars.indexOf(msg.str[i + 1].toLowerCase()) > -1) {
            for (j = i + 2; j < msg.str.length; j++) {
                if (mentionsChars.indexOf(msg.str[j].toLowerCase()) === -1)
                    break;
            }
            str = msg.str.slice(i + 1, j).toLowerCase();
            mentions.push(str);  // FIXME
            msg = msgAddHtmlEntity(msg, i, i + str.length + 1,
                newHtmlEntityLink(_htmlFormatMsgLinkTemplateUser,
                    $.MAL.userUrl(str), '@' + str)
            );
            i = msg.i;
        }
    }

    // handling hashtags
    for (i = 0; i < msg.str.length - 1; i++) {
        if (msg.str[i] === '#' && msg.str[i + 1] !== '#' && stopCharsRight.indexOf(msg.str[i + 1]) === -1) {
            j = getSubStrEnd(msg.str, i + 1, stopCharsRightHashtags, false, stopCharsTrailing);
            if (j > i) {
                str = msg.str.slice(i + 1, j + 1);
                msg = msgAddHtmlEntity(msg, i, i + str.length + 1,
                    newHtmlEntityLink(_htmlFormatMsgLinkTemplateHashtag,
                        $.MAL.hashtagUrl(encodeURIComponent(str.toLowerCase())), '#' + str.replace(/&amp;/g, '&'))
                );
                i = msg.i;
            }
        }
    }

    // handling text style markup
    msg = markout(markout(markout(markout(msg,
            '*', 'b'),  // bold
            '~', 'i'),  // italic
            '_', 'u'),  // underlined
            '-', 's')  // striketrough
    ;

    // handling splitted posts numbering and escaping ampersands, qoutes and apostrophes
    msg.str = msg.str
        .replace(/\(\d{1,2}\/\d{1,2}\)$/, function (str) {
            msg.htmlEntities.push('<span class="splited-post-counter">' + str + '</span>');  // FIXME

            return '>' + (msg.htmlEntities.length - 1).toString() + '<';
        })
        .replace(/&(?!lt;|gt;)/g, '&amp;')  // FIXME in many cases there is no need to escape ampersand in HTML 5
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')

    // applying html entities to msg.str and converting msg to string back
    msg = applyHtml(msg);

    // handling linebreaks
    if ($.Options.displayLineFeeds.val === 'enable')
        msg = msg.replace(/\n/g, '<br />');

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
