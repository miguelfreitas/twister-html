// twister_formatpost.js
// 2013 Miguel Freitas
//
// Format JSON posts and DMs to HTML.

var _htmlFormatMsgLinkTemplateExternal;
var _htmlFormatMsgLinkTemplateUser;
var _htmlFormatMsgLinkTemplateHashtag;

$(document).ready(function() {
    // we're setting it here for perfomance improvement purpose
    // to not search and prepare it for for every post every time
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
    twister.tmpl.linkShortened = extractTemplate('#template-link-shortened')[0];
});

// format "userpost" to html element
// kind = "original"/"ancestor"/"descendant"
function postToElem(post, kind, promoted) {
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
            "fav" : original userpost - opt
            "sif_fav" : sig of fav - opt
            "reply" : - opt
            {
                    "n" : reference username
                    "k" : reference k
            }
    }
    "sig_userpost" : signature by userpost.n
    */

    var username, k, time, msg, rt, content_to_rt, content_to_sigrt, retweeted_by;

    // Obtain data from userpost
    var userpost = post.userpost;

    //TODO: favorites may have comment also...
    if (userpost.fav)
        userpost = userpost.fav;

    if (post.sig_wort)
        userpost.sig_wort = post.sig_wort;

    if (userpost.rt && typeof userpost.rt.msg === 'string' && userpost.rt.msg !== '') {
        rt = userpost.rt;
        if (userpost.msg) {
            username = userpost.n;
            k = userpost.k;
            time = userpost.time;
            msg = userpost.msg + (userpost.msg2 || '');
            content_to_rt = $.toJSON(userpost);
            content_to_sigrt = post.sig_userpost;
        } else {
            username = rt.n;
            k = rt.k;
            time = rt.time;
            msg = rt.msg + (rt.msg2 || '');
            content_to_rt = $.toJSON(rt);
            content_to_sigrt = userpost.sig_rt;
        }
        retweeted_by = userpost.n;
    } else {
        username = userpost.n;
        k = userpost.k;
        time = userpost.time;
        msg = userpost.msg + (userpost.msg2 || '');
        content_to_rt = $.toJSON(userpost);
        content_to_sigrt = post.sig_userpost;
    }
    if (typeof msg !== 'string')
        msg = '';

    if (msg.length > $.Options.MaxPostDisplayChars.val) {
        msg = msg.slice(0,$.Options.MaxPostDisplayChars.val) + "\u2026";
    }

    // Now create the html elements
    var elem = $.MAL.getPostTemplate().clone(true).appendTo(twister.html.detached);
    elem.removeAttr('id')
        .addClass(kind)
        .attr('data-time', time)
    ;

    if (post.isNew)
        elem.addClass('new');

    var postData = elem.find('.post-data');
    postData.addClass(kind)
        .attr('data-userpost', $.toJSON(post))
        .attr('data-content_to_rt', content_to_rt)
        .attr('data-content_to_sigrt', content_to_sigrt)
        .attr('data-screen-name', username)
        .attr('data-id', k)
        .attr('data-lastk', userpost.lastk)
        .attr('data-text', msg)
    ;
    if (userpost.reply) {
        postData.attr('data-replied-to-screen-name', userpost.reply.n)
            .attr('data-replied-to-id', userpost.reply.k)
            .find('.post-expand').text(polyglot.t('Show conversation'))
        ;
    } else if (userpost.rt && userpost.rt.reply) {
        postData.attr('data-replied-to-screen-name', userpost.rt.reply.n)
            .attr('data-replied-to-id', userpost.rt.reply.k)
            .find('.post-expand').text(polyglot.t('Show conversation'))
        ;
    }

    setPostCommon(elem, username, time);

    msg = fillElemWithTxt(elem.find('.post-text'), msg);  // fillElemWithTxt() returns result of htmlFormatMsg(msg)
    postData.attr('data-text-mentions', msg.mentions.join());  // FIXME no idea why do we need this attribute since we don't use it but use data-reply-to instead

    if (username !== defaultScreenName) {
        if (msg.mentions.indexOf(username) === -1)
            msg.mentions.splice(0, 0, username);
    }
    for (var i = msg.mentions.indexOf(defaultScreenName); i !== -1; i = msg.mentions.indexOf(defaultScreenName))
        msg.mentions.splice(i, 1);

    if (msg.mentions.length)
        var replyTo = '@' + msg.mentions.join(' @') + ' ';
    else
        var replyTo = '';

    var postTextArea = elem.find('.post-area-new textarea');
    postTextArea.attr('data-reply-to', replyTo);

    if (!defaultScreenName)
        postTextArea.attr('placeholder', polyglot.t('You have to log in to post replies.'));
    else
        postTextArea.attr('placeholder', polyglot.t('reply_to', {fullname: replyTo})+ '...');

    postData.attr('data-reply-to', replyTo);

    if (typeof retweeted_by !== 'undefined') {
        var postContext = elem.find('.post-context');
        if (userpost.msg) {
            setPostReference(postContext, rt, userpost.sig_rt);
        } else {
            postContext.append(twister.tmpl.postRtBy.clone(true)).addClass('post-rt-by')
                .find('.post-rt-sign .prep').text(polyglot.t('post_rt_sign_prep'))
                .siblings('.open-profile-modal')
                    .attr('href', $.MAL.userUrl(retweeted_by)).text('@' + retweeted_by)
            ;
            postContext.find('.post-rt-time .prep').text(polyglot.t('post_rt_time_prep'))
                .siblings('.time').text(timeGmtToText(post.userpost.time));
            // let's check original post and grab some possible RT
            dhtget(username, 'post' + k, 's',
                function(args, post) {
                    if (post && post.userpost.msg && post.userpost.rt) {
                        var postContext = $('<div class="post-context"></div>');
                        setPostReference(postContext, post.userpost.rt, post.userpost.sig_rt);
                        args.elem.find('.post-text').after(postContext);
                    }
                }, {elem: elem}
            );
        }
        postContext.show();
    }

    if (typeof promoted !== 'undefined' && promoted) {
        elem.find('.post-propagate').remove();
        postData.attr('data-promoted', 1);
        postData.attr('data-screen-name', '!' + username);
    } else {
        setPostInfoSent(userpost.n, userpost.k, elem.find('.post-info-sent'));
        if ($.Options.filterLang.val !== 'disable' && $.Options.filterLangSimulate.val) {
            // FIXME it's must be stuff from template actually
            if (typeof post.langFilter !== 'undefined') {
                if (typeof post.langFilter.prob[0] !== 'undefined')
                    var mlm = '  //  ' + polyglot.t('Most possible language: this',
                        {'this': '<em>' + post.langFilter.prob[0].toString() + '</em>'});
                else
                    var mlm = '';

                elem.append('<div class="langFilterSimData">'
                        + polyglot.t('This post is treated by language filter',
                            {'treated': '<em>' + (post.langFilter.pass ? polyglot.t('passed') : polyglot.t('blocked')) + '</em>'})
                        + '</div>'
                    )
                    .append('<div class="langFilterSimData">'
                        + polyglot.t('Reason: this', {'this': '<em>' + post.langFilter.reason + '</em>'})
                        + mlm +'</div>'
                    )
                ;
            } else {
                elem.append('<div class="langFilterSimData">'
                        + polyglot.t('This post is treated by language filter',
                            {'treated': '<em>' + polyglot.t('not analyzed') + '</em>'})
                        + '</div>'
                    )
                ;
            }
        }
    }

    return elem;
}

function setPostCommon(elem, username, time) {
    var postInfoName = elem.find('.post-info-name')
        .text(username).attr('href', $.MAL.userUrl(username));

    getFullname(username, postInfoName);
    //elem.find('.post-info-tag').text("@" + username);  // FIXME
    getAvatar(username, elem.find('.avatar'));

    elem.find('.post-info-time')
        .attr('title', timeSincePost(time))
        .find('span:last')
            .text(timeGmtToText(time))
    ;
}

function setPostReference(elem, rt, sig_rt) {
    elem.append(twister.tmpl.postRtReference.clone(true))
        .find('.post-rt-reference')
            .attr('data-screen-name', rt.n)
            .attr('data-id', rt.k)
            .attr('data-userpost', $.toJSON({userpost: rt, sig_userpost: sig_rt}))
            .find('.post-text').each(function (i, elem) {fillElemWithTxt($(elem), rt.msg + (rt.msg2 || ''));})
    ;
    setPostCommon(elem, rt.n, rt.time);
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

// format dmdata (returned by getdirectmsgs) to display in conversation thread
function postToElemDM(dmData, localUser, remoteUser) {
    var senderAlias = (dmData.from && dmData.from.length && dmData.from.charCodeAt(0))
        ? dmData.from : (dmData.fromMe || dmData.from === localUser ? localUser : remoteUser);
    var elem = $('#dm-chat-template').clone(true).appendTo(twister.html.detached)
        .removeAttr('id')
        .addClass(dmData.fromMe || dmData.from === localUser ? 'sent' : 'received')
    ;

    var elemName = elem.find('.post-info-name')
        .attr('href', $.MAL.userUrl(senderAlias));
    if (senderAlias[0] === '*' )
        getGroupChatName(senderAlias, elemName);
    else
        getFullname(senderAlias, elemName);

    getAvatar(senderAlias, elem.find('.post-photo').find('img'));
    elem.find('.post-info-time')
        .attr('title', timeSincePost(dmData.time))
        .find('span:last')
            .text(timeGmtToText(dmData.time))
    ;
    setPostInfoSent(senderAlias, dmData.k, elem.find('.post-info-sent'));
    fillElemWithTxt(elem.find('.post-text'), dmData.text);

    return elem;
}

// convert message text to html, featuring @users and links formating.
function htmlFormatMsg(msg, opt) {
    // TODO: add options for emotions; msg = $.emotions(msg);

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

    function markout(msg, markoutOpt, chr, tag) {
        if (markoutOpt === 'ignore')
            return msg;

        function isWhiteSpacesBetween(i, j) {
            j++;
            for (i += 1; i < j; i++) {
                if (p[i].w)
                    return true;
            }

            return false;
        }

        function kindOfL(i) {
            if (stopCharsMarkout.indexOf(msg.str[i]) > -1) {
                for (var j = i - 1; j > -1; j--) {
                    if (msg.str[j] === chr) {
                        return -1;
                    } else if (stopCharsMarkout.indexOf(msg.str[j]) === -1) {
                        return whiteSpaces.indexOf(msg.str[j]);
                    }
                }
            } else if (msg.str[i] === '<') {
                for (var j = i - 1; j > -1; j--) {
                    if (msg.str[j] === '>') {
                        if (j === 0) {
                            return -10;
                        } else {
                            if (msg.str[j - 1] === chr) {
                                return -1;
                            } else {
                                return kindOfL(j - 1);
                            }
                        }
                    }
                }
            } else {
                return whiteSpaces.indexOf(msg.str[i]);
            }

            return 0;
        }

        function kindOfR(i) {
            if (stopCharsMarkout.indexOf(msg.str[i]) > -1) {
                for (var j = i + 1; j < msg.str.length; j++) {
                    if (msg.str[j] === chr) {
                        return -1;
                    } else if (stopCharsMarkout.indexOf(msg.str[j]) === -1) {
                        return whiteSpaces.indexOf(msg.str[j]);
                    }
                }
            } else if (msg.str[i] === '>') {
                for (var j = i + 1; j < msg.str.length; j++) {
                    if (msg.str[j] === '<') {
                        if (j === msg.str.length - 1) {
                            return -10;
                        } else {
                            if (msg.str[j + 1] === chr) {
                                return -1;
                            } else {
                                return kindOfR(j + 1);
                            }
                        }
                    }
                }
            } else {
                return whiteSpaces.indexOf(msg.str[i]);
            }

            return 0;
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

                if (i !== 0) {
                    l = kindOfL(i - 1);
                } else {
                    l = 0;
                }
                if (j !== msg.str.length) {
                    r = kindOfR(j);
                } else {
                    r = 0;
                }

                if ((i === 0 && r < 0) || l === -10) {
                    p.push({i: i, k: j - i, t: -1, w: w, a: -1, p: -1});
                    w = false;
                } else if ((j === msg.str.length && l < 0) || r === -10) {
                    p.push({i: i, k: j - i, t: 1, w: w, a: -1, p: -1});
                    w = false;
                } else {
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
        if (markoutOpt === 'apply') {
            t = '</' + tag + '>';
            tag = '<' + tag + '>';
        } else {  // markoutOpt === 'clear' so we're clearing markup
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

    if (!msg)
        return {html: '', mentions: []};

    if (opt && opt.markout)
        var markoutOpt = opt.markout;
    else
        var markoutOpt = $.Options.postsMarkout.val;

    var mentionsChars = 'abcdefghijklmnopqrstuvwxyz_0123456789';
    var stopCharsTrailing = '/\\*~_-`.,:;?!%\'"[](){}^|«»…\u201C\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3010\u3011\u2047\u2048\u2049';
    var stopCharsTrailingUrl = stopCharsTrailing.slice(1);
    var whiteSpaces = ' \f\n\r\t\v​\u00A0\u1680\u180E\u2000​\u2001\u2002​\u2003\u2004\u2005\u2006​\u2007\u2008​\u2009\u200A\u2028\u2029​\u202F\u205F\u3000';
    var whiteSpacesUrl = '\'\"' + whiteSpaces;
    var stopCharsLeft = '<' + whiteSpaces;
    var stopCharsRight = '>' + whiteSpaces;
    var stopCharsRightHashtags = '>/\\.,:;?!%\'"[](){}^|«»…\u201C\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3010\u3011\u2047\u2048\u2049'  // same as stopCharsTrailing but without '*~_-`' plus '>'
        + whiteSpaces;
    var stopCharsRightHashtagsBase64 = stopCharsRightHashtags.replace('/','').replace('+','') // exclude valid base64 chars used in shortened urls
    var stopCharsMarkout = '/\\*~_-`.,:;?!%+=&\'"[](){}^|«»…\u201C\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3010\u3011\u2047\u2048\u2049';
    var i, j, k, str;
    var mentions = [];

    msg = {str: escapeHtmlEntities(msg), htmlEntities: []};

    // markout is not applied for chars inside of ``; to escape ` use backslash
    if (markoutOpt === 'apply')
        msg.str = msg.str.replace(/`(?:[^`\\]|\\.)*`/g, function (s) {
            msg.htmlEntities.push('<samp>' + s.slice(1, -1).replace(/\\`/g, '`')
                .replace(/&(?!lt;|gt;)/g, '&amp;') + '</samp>');
            return '>' + (msg.htmlEntities.length - 1).toString() + '<';
        });
    else if (markoutOpt === 'clear')
        msg.str = msg.str.replace(/`((?:[^`\\]|\\.)*)`/g, function (s) {
            return s.slice(1, -1).replace(/\\`/g, '`');
        });

    // handling links
    for (i = 0; i < msg.str.length - 7; i++) {
        if (msg.str.slice(i, i + 2) === '](' && markoutOpt !== 'ignore') {
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
                        // following check is NOT for real protection (we have blocking CSP rule instead), it's just to aware people
                        if (isUriSuspicious(msg.str.slice(i, k + 1))) {
                            msg = msgAddHtmlEntity(msg, j - 1, getSubStrEnd(msg.str, k + 1, ')', true, '') + 2,
                                '…<br><b><i>' + polyglot.t('busted_oh') + '</i> '
                                + polyglot.t('busted_avowal') + ':</b><br><samp>['
                                + linkName
                                    .replace(/&(?!lt;|gt;)/g, '&amp;')
                                    .replace(/"/g, '&quot;')
                                    .replace(/'/g, '&apos;')
                                + ']('
                                + msg.str.slice(i, k + 1)
                                    .replace(/&(?!lt;|gt;)/g, '&amp;')
                                    .replace(/"/g, '&quot;')
                                    .replace(/'/g, '&apos;')
                                + ')</samp><br>…<br>'
                            );
                        } else {
                            var x = getSubStrEnd(msg.str, i + 1, whiteSpacesUrl, false, '');
                            if (x < k)  // use only first word as href target, others drop silently
                                k = x;
                            linkName = applyHtml(  // we're handling markup inside [] of []()
                                markout(markout(markout(markout(
                                    {str: linkName, htmlEntities: msg.htmlEntities},
                                        markoutOpt, '*', 'b'),  // bold
                                        markoutOpt, '~', 'i'),  // italic
                                        markoutOpt, '_', 'u'),  // underlined
                                        markoutOpt, '-', 's')  // striketrough
                            )
                                .replace(/&(?!lt;|gt;)/g, '&amp;');
                            if (markoutOpt === 'apply') {
                                if (msg.str.slice(i, i + 6).toLowerCase() === 'twist:' && msg.str[i + 17] === '='
                                    && getSubStrStart(msg.str, i + 16, stopCharsRightHashtagsBase64, false, '') === i + 6)
                                    msg = msgAddHtmlEntity(msg, j - 1, getSubStrEnd(msg.str, k + 1, ')', true, '') + 2,
                                        newHtmlEntityLink(twister.tmpl.linkShortened,
                                            msg.str.slice(i, i + 18), linkName)
                                    );
                                else
                                    msg = msgAddHtmlEntity(msg, j - 1, getSubStrEnd(msg.str, k + 1, ')', true, '') + 2,
                                        newHtmlEntityLink(_htmlFormatMsgLinkTemplateExternal,
                                            proxyURL(msg.str.slice(i, k + 1)), linkName)
                                    );
                            } else {  // markoutOpt === 'clear' so we're clearing markup
                                str = msg.str.slice(i, k + 1);
                                msg = msgAddHtmlEntity(msg, j - 1, getSubStrEnd(msg.str, k + 1, ')', true, '') + 2,
                                    linkName);
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
        } else if (msg.str.slice(i, i + 6).toLowerCase() === 'twist:' && msg.str[i + 17] === '='
            && getSubStrStart(msg.str, i + 16, stopCharsRightHashtagsBase64, false, '') === i + 6) {
            str = msg.str.slice(i, i + 18);
            msg = msgAddHtmlEntity(msg, i, i + str.length,
                newHtmlEntityLink(twister.tmpl.linkShortened, str, str));
            i = msg.i;
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
            mentions.push(str);
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
            markoutOpt, '*', 'b'),  // bold
            markoutOpt, '~', 'i'),  // italic
            markoutOpt, '_', 'u'),  // underlined
            markoutOpt, '-', 's')  // striketrough
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
    ;

    // applying html entities to msg.str and converting msg to string back
    msg = applyHtml(msg);

    // handling linebreaks
    if ($.Options.displayLineFeeds.val === 'enable')
        msg = msg.replace(/\n/g, '<br />');

    return {html: msg, mentions: mentions};
}

function isUriSuspicious(req) {
    var colonPos = req.search(/:|%3A/gi);
    if (colonPos === 0)
        return true;

    var hashPos = req.search(/#|%23/g);

    if (colonPos === -1)
        if (hashPos > -1)
            return req = req.slice(hashPos + 1),
                (req.search(/^(?:hashtag|profile|conversation|mentions|favs|directmessages|groupmessages|newusers|followers|following|whotofollow|groupmessages\+newgroup|groupmessages\+joingroup\/uri\-shortener)\b/) > -1) ? false : true;
        else
            return false;  //(req.search(/^\s*@[A-Za-z0-9]+\/\d/g) === 0) ? false : true;

    if (hashPos > -1 && hashPos < colonPos)
        return true;

    return req = req.slice(req.search(/\S/g), colonPos),
        req.search(/[^A-Za-z0-9\+\.\-]/) > -1 || req.search(/(?:script|data)$/i) > -1;
}

function proxyURL(url) {
    var proxyOpt = $.Options.useProxy.val;
    if (proxyOpt !== 'disable' && !$.Options.useProxyForImgOnly.val
        && url[0] !== '/' && url.indexOf(location.origin) !== 0) {
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

function setPostImagePreview(elem, links) {
    if ($.Options.displayPreview.val === 'enable') {
        var previewContainer = elem.find('.preview-container');
        // was the preview added before...
        if (!previewContainer.children().length) {
            // is there any links to images in the post?
            for (var i = 0; i < links.length; i++) {
                if (/^[^?]+\.(?:jpe?g|gif|png)$/i.test(links[i].href)) {
                    var url = proxyURL(links[i].href);
                    previewContainer.append($('<img src="' + url + '" class="image-preview" />'));
                }
            }
        }
        if (previewContainer.children().length)
            previewContainer.show();
        else
            previewContainer.hide();
    }
}
