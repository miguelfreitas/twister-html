// mobile_abstract.js
// 2013 Miguel Freitas
//
// Mobile Abstration Layer
// Try to sort out lowlevel differences between jquery and jquery mobile twister interfaces

var MAL = function()
{
    this.postboardLoading = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.showPageLoadingMsg();
            /*
            setTimeout(function(){
              $.mobile.hidePageLoadingMsg();
            }, 10 * 1000);
            */
        } else {
            $(".postboard-loading").show();
        }
    }

    this.postboardLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.hidePageLoadingMsg();
            var curPage = $.mobile.activePage.attr("id");
            $( '#'+curPage+' .content ul.posts').listview('refresh');

            installPostboardClick();
        } else {
            $(".postboard-loading").hide();  // FIXME need to decide which one we need to hide actually
        }
    }

    this.commonDMsListLoaded = function () {
        if ($.hasOwnProperty('mobile')) {
            $.mobile.hidePageLoadingMsg();
            $('#directmsg .direct-messages-list').listview('refresh');
        } else {
        }
    };

    this.dmConversationLoaded = function (dmConvo) {
        if ($.hasOwnProperty('mobile')) {
            $.mobile.hidePageLoadingMsg();
            $('#dmchat .direct-messages-thread').listview('refresh');
            $.mobile.silentScroll($('.dm-form').offset().top);
        } else {
            var modalContent = dmConvo.closest('.modal-content');
            modalContent.scrollTop(modalContent[0].scrollHeight);
        }
    };

    this.relatedPostLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.hidePageLoadingMsg();
            var curPage = $.mobile.activePage.attr("id");
            $( '#'+curPage+' .content ul.posts').listview('refresh');
        } else {
            $(".postboard-loading").hide();
        }
    }

    this.warnFollowingNotAny = function(cbFunc, cbReq) {
        if ($.hasOwnProperty('mobile'))
            alert(polyglot.t('warn_following_not_any'));
        else
            alertPopup({
                //txtTitle: polyglot.t(''), add some title (not 'error', please) or KISS
                txtMessage: polyglot.t('warn_following_not_any'),
                cbConfirm: cbFunc,
                cbConfirmReq: cbReq,
                cbClose: 'cbConfirm'
            });
    };

    this.listLoaded = function (list) {
        if ($.hasOwnProperty('mobile')) {
            $.mobile.hidePageLoadingMsg();
            list.listview('refresh');
        } else
            list.find('.loading-roller').hide();
    };

    this.searchUserListLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.hidePageLoadingMsg();
            $(".userMenu-search-profiles").listview('refresh');
        } else {
            var $searchResultsModal = $( ".search-results" );
            $searchResultsModal.slideDown( "fast" );
        }
    }

    this.reportNewPosts = function(newPosts) {
        if( $.hasOwnProperty("mobile") ) {
            var newTweetsBar = $(".timeline-refresh .ui-btn-text");
            if( newPosts ) {
                document.title = "(" + String(newPosts) + ") twister";
                newTweetsBar.text("(" + String(newPosts) + ")");
            } else {
                document.title = "twister";
                newTweetsBar.text("Refresh");
            }
        } else {
            var newTweetsBar = $(".wrapper").find(".postboard-news");
            var newTweetsBarMenu = $(".userMenu").find(".menu-news"); // added for home menu entry
            if( newPosts ) {
                document.title = "(" + String(newPosts) + ") twister";
                newTweetsBar.text(polyglot.t("new_posts", newPosts));
                newTweetsBar.fadeIn("slow");
                newTweetsBarMenu.text(String(newPosts));
                newTweetsBarMenu.addClass("show");

                if ($.Options.showDesktopNotifPosts.val === 'enable') {
                    this.showDesktopNotification({
                        body: polyglot.t('You got') + ' ' + polyglot.t('new_posts', newPosts) + ' '
                            + polyglot.t('in postboard') + '.',
                        tag: 'twister_notification_new_posts',
                        timeout: $.Options.showDesktopNotifPostsTimer.val,
                        funcClick: (function() {
                            requestTimelineUpdate('pending', this.postsCount, followingUsers, promotedPostsOnly);
                        }).bind({postsCount: newPosts})
                    });
                }
            } else {
                newTweetsBar.hide();
                newTweetsBar.text("");
                newTweetsBarMenu.text("");
                newTweetsBarMenu.removeClass("show");
                document.title = "twister";
            }
        }
    }

    this.getStreamPostsParent = function() {
        if( $.hasOwnProperty("mobile") ) {
            return $( '.timeline ul');
        } else {
            return $("#posts");
        }
    }

    this.setPostTemplate = function(p) {
        if( $.hasOwnProperty("mobile") ) {
            this.postTemplate = p;
        }
    }

    this.getPostTemplate = function() {
        if( $.hasOwnProperty("mobile") ) {
            return this.postTemplate;
        } else {
            return $("#post-template");
        }
    }

    // how do we map usernames into urls
    this.userUrl = function(username) {
        //if( $.hasOwnProperty("mobile") ) {
        //    return "#profile?user=" + username;
        //} else {
            if (username[0] === '*')
                return "#profile?group=" + username;
            else
                return "#profile?user=" + username;
        //}
    };

    // recover username from url (only for hash)
    this.urlToUser = function(url) {
        var dummyUrl = this.userUrl("");
        var urlIdx = url.indexOf(dummyUrl);
        if( urlIdx >= 0 )
            return url.substr(urlIdx + dummyUrl.length);
        else
            return "";
    }

    this.followingUrlToUser = function(url) {
        var dummyUrl = this.followingUrl("");
        var urlIdx = url.indexOf(dummyUrl);
        if( urlIdx >= 0 )
            return url.substr(urlIdx + dummyUrl.length);
        else
            return "";
    }

    this.mentionsUrl = function(username) {
        if( $.hasOwnProperty("mobile") ) {
            return "#mentions?user=" + username;
        } else {
            return "#mentions?user=" + username;
        }
    }

    this.hashtagUrl = function(h) {
        if( $.hasOwnProperty("mobile") ) {
            return "#hashtag?hashtag=" + h;
        } else {
            return "#hashtag?hashtag=" + h;
        }
    }

    this.dmchatUrl = function (alias) {
        if ($.hasOwnProperty('mobile')) {
            return '#dmchat?user=' + alias;
        } else {
            return '#directmessages?' + (alias[0] === '*' ? 'group' : 'user') + '=' + alias;
        }
    };

    this.followingUrl = function(username) {
        if( $.hasOwnProperty("mobile") ) {
            return "#following?user=" + username;
        } else {
            return "#following?user=" + username;
        }
    }

    this.followUrl = function(username) {
        if( $.hasOwnProperty("mobile") ) {
            return "#following?follow=" + username;
        } else {
            return "#following?follow=" + username;
        }
    }

    this.unfollowUrl = function(username) {
        if( $.hasOwnProperty("mobile") ) {
            return "#following?unfollow=" + username;
        } else {
            return "#following?unfollow=" + username;
        }
    }

    this.newPostToUrl = function(username) {
        if( $.hasOwnProperty("mobile") ) {
            return "#newmsg?replyto=" + encodeURIComponent("@"+username);
        } else {
            return "#newmsg?replyto=" + encodeURIComponent("@"+username);
        }
    }

    this.newPostHashtagToUrl = function(hashtag) {
        if( $.hasOwnProperty("mobile") ) {
            return "#newmsg?replyto=" + encodeURIComponent("#"+hashtag);
        } else {
            return "#newmsg?replyto=" + encodeURIComponent("#"+hashtag);
        }
    }


    this.updateNewMentionsUI = function(newMentions) {
        if( $.hasOwnProperty("mobile") ) {
            var $mentionsCounterBtnText = $(".mentions-count .ui-btn-text");
            if( newMentions ) {
                $mentionsCounterBtnText.text("@ (" + newMentions + ")");
            } else {
                $mentionsCounterBtnText.text("@");
            }
        } else {
            var $mentionsCounter = $(".userMenu-connections .messages-qtd");
            if( newMentions ) {
                $mentionsCounter.text(newMentions);
                $mentionsCounter.fadeIn();
            } else {
                $mentionsCounter.hide();
            }
        }
    }

    this.updateNewDMsUI = function(newDMs) {
        if( $.hasOwnProperty("mobile") ) {
            var $DMsCounterAllPages = $(".newdms-count");
            for( var i = 0; i < $DMsCounterAllPages.length; i++) {
                var $textElement = $DMsCounterAllPages.eq(i).find(".ui-btn-text");
                if( !$textElement.length ) $textElement =  $DMsCounterAllPages.eq(i);
                if( newDMs ) {
                    $textElement.text("Direct Msg (" + newDMs + ")");
                } else {
                    $textElement.text("Direct Msg");
                }
            }
        } else {
            var $DMsCounter = $(".userMenu-messages .messages-qtd");
            if( newDMs ) {
                $DMsCounter.text(newDMs);
                $DMsCounter.fadeIn();
            } else {
                $DMsCounter.hide();
            }
        }
    }

    this.updateNewGroupDMsUI = function(newDMs) {
        if( $.hasOwnProperty('mobile') ) {
        } else {
            var DMsCounter = $('.userMenu-groupmessages .messages-qtd');
            if (newDMs) {
                DMsCounter.text(newDMs).fadeIn();
            } else {
                DMsCounter.hide();
            }
        }
    }

    this.updateMyOwnPostCount = function(numPosts) {
        if( $.hasOwnProperty("mobile") ) {
            console.log("FIXME: implement MAL_updateMyOwnPostCount");
        } else {
            $(".mini-profile .posts-count").text(numPosts);
        }
    }

    this.goHome = function(clearTimeline) {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.navigate( "#home" );
        } else {
            window.location.href = "home.html";
        }
    }

    this.goLogin = function() {
        if ($.hasOwnProperty('mobile')) {
            $.mobile.navigate('#login');
        } else {
            window.location.hash = '#/login';
        }
    };

    this.goNetwork = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.navigate( "#network" );
        } else {
            window.location.href = "network.html";
        }
    }

    this.goProfileEdit = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.navigate( "#profile-edit" );
        } else {
            window.location.href = "profile-edit.html";
        }
    }

    this.showMentions = function(username) {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.navigate( this.mentionsUrl(username) );
        } else {
            if ($(".postboard").length) {
                openMentionsModal();
            } else {
                window.location.href = 'home.html'+this.mentionsUrl(username);
            }
        }
    }

    this.showDMchat = function(req) {
        if (typeof req !== 'object')
            req = {};
        if (req.alias) {
            if ($.hasOwnProperty('mobile')) {
                $.mobile.navigate(this.dmchatUrl(req.alias));
            } else {
                if ($('.postboard').length) {
                    window.location.hash = this.dmchatUrl(req.alias);
                } else {
                    window.location.href = 'home.html'+this.dmchatUrl(req.alias);
                }
            }
        } else {
            if ($.hasOwnProperty('mobile')) {
                $.mobile.navigate('#' + (req.group ? '' : 'directmsg'));  // FIXME add group messages to tmobile
            } else {
                if ($('.postboard').length) {
                    window.location.hash = '#' + (req.group ? 'groupmessages' : 'directmessages');
                } else {
                    window.location.href = 'home.html#' + (req.group ? 'groupmessages' : 'directmessages');
                }
            }
        }
    };

    this.setNetworkStatusMsg = function(msg, statusGood) {
        if( $.hasOwnProperty("mobile") ) {
            $(".network-status").text(msg);
            if( statusGood ) {
                $(".connection-status").addClass("connected");
            } else {
                $(".connection-status").removeClass("connected");
            }
        } else {
            $(".network-status").text(msg);
            if( statusGood ) {
                $(".connection-status").addClass("connected");
            } else {
                $(".connection-status").removeClass("connected");
            }
        }
    }

    this.enableButton = function( $button ) {
         if( $.hasOwnProperty("mobile") ) {
             $button.button("enable");
         } else {
             $button.removeClass("disabled");
             $button.removeAttr("disabled");
         }
    }

    this.disableButton = function( $button ) {
         if( $.hasOwnProperty("mobile") ) {
             $button.button("disable");
         } else {
             $button.addClass("disabled");
             $button.attr("disabled","true");
         }
     }

    this.processCreateAccount = function (peerAlias, secretKey) {
        defaultScreenName = peerAlias;
        if (defaultScreenName) {
            saveScreenName();
        }

        if ($.hasOwnProperty('mobile')) {
            $('.secret-key').text(secretKey);
            sendNewUserTransaction(peerAlias);
            $.mobile.navigate('#new-user-modal');
        } else {
            var modal = confirmPopup({
                classAdd: 'new-account-briefing',
                txtTitle: polyglot.t('propagating_nickname', {username: peerAlias}),
                txtMessage: polyglot.t('new_account_briefing', {secretKey: secretKey}),
                txtConfirm: polyglot.t('Login'),
                cbConfirm: $.MAL.goProfileEdit,
                addBlackout: true,
                removeCancel: true,
                removeClose: true
            });

            modal.content.find('.confirm').attr('disabled', true);

            sendNewUserTransaction(peerAlias,
                function (accountCreatedModal) {
                    accountCreatedModal.content.find('.confirm').attr('disabled', false);
                }, modal
            );
        }
    };

    this.changedUser = function() {
        if( $.hasOwnProperty("mobile") ) {
            timelineChangedUser();
            $("#home .posts").html("");
            newmsgsChangedUser();
            followingChangedUser();
            twisterInitialized = false;
        } else {
            window.location.href = "home.html";
        }
    }

    this.soundNotifyMentions = function() {
        if ($.mobile) {
        } else {
            if ($.Options.sndMention.val !== 'false')
                playSound('player', $.Options.sndMention.val);
        }
    };

    this.soundNotifyDM = function() {
        if ($.mobile) {
        } else {
            if ($.Options.sndDM.val !== 'false')
                playSound('playerSec', $.Options.sndDM.val);
        }
    };

    this.showDesktopNotification = function(req) {
        if (Notify.needsPermission) {
            Notify.requestPermission(false, req.funcPermDenied);
            return;
        }

        if (!req.title)
            req.title = polyglot.t('notify_desktop_title');
        if (!req.icon)
            req.icon = '../img/twister_mini.png';
        if (!req.tag)
            req.tag = 'twister_notification';
        if (!req.timeout)
            req.timeout = 2592000;  // 60 * 60 * 24 * 30, one month

        if (typeof req.funcClick === 'function')
            req.funcClick = (function() {window.focus(); this.funcClick();})
                .bind({funcClick: req.funcClick});
        else
            req.funcClick = function() {window.focus();}

        var desktopNotification = new Notify(req.title, {
            body: req.body,
            icon: req.icon,
            tag: req.tag,
            timeout: req.timeout,
            notifyClick: req.funcClick,
            notifyError: function() {alert(polyglot.t('notify_desktop_error'));}
        });
        desktopNotification.show();
    };

    this.reqRepAfterCB = function(postLi, postsFromJson) {
        if ($.hasOwnProperty("mobile")) {
            for( var i = 0; i < postsFromJson.length; i++) {
                var newStreamPost = postToElem(postsFromJson[i], "related");
                newStreamPost.hide();
                postLi.after(newStreamPost);
                newStreamPost.slideDown("fast");
            }
        } else {
            var $replist = $('<ol class="sub-replies"></ol>');
            var $newli = $('<li class="post-replies"></li>');
            postLi.after($newli);
            $newli.append($replist);
            for (var i = 0; i < postsFromJson.length && $.MAL.getExpandedPostsCount(postLi) < maxExpandPost; i++) {
                var newStreamPost = postToElem(postsFromJson[i], "related");
                newStreamPost.hide();
                $replist.prepend(newStreamPost);
                newStreamPost.slideDown("fast");
                requestRepliesAfter(newStreamPost);
            }
        }
        $.MAL.relatedPostLoaded();
    };

    this.getExpandedPostsCount = function(postLi) {
        if ($.hasOwnProperty('mobile')) {
            return postLi.siblings().length;
        } else {
            return postLi.closest('.module.post.original.open').find('.post.related').length;
        }
    };
}

jQuery.MAL = new MAL;

function playSound(player, sound, volume) {
    if ($.mobile) {
    } else {
        var player = $('#'+player);
        if (player.length) {
            player[0].pause();
            //player.empty();

            if (player[0].canPlayType('audio/mpeg;'))
                player.attr({type: 'audio/mpeg', src: 'sound/' + sound + '.mp3'});
            else
                player.attr({type: 'audio/ogg', src: 'sound/' + sound + '.ogg'});

            player[0].volume = (typeof volume === 'number') ? volume : $.Options.playerVol.val;
            player[0].play();
        } else
            console.warn('cannot find player to play sound, selector: #'+player);
    }
}

function filterLang(string) {
    var langFilterMode = $.Options.filterLang.val;

    if (langFilterMode !== 'disable') {
        var langFilterSubj = '';
        var langFilterProb = [];
        var langFilterPass = true;
        var langFilterReason = '';
        var langFilterList = $.Options.filterLangList.val;

        if (!string) {
            langFilterReason = polyglot.t('this is undefined', {'this': 'string'});
        } else if (langFilterList.length > 0) {
            var langFilterAccuracy = $.Options.filterLangAccuracy.val;
            langFilterPass = (langFilterMode === 'whitelist') ? false : true;
            langFilterReason = polyglot.t('this doesnt contain that', {'this': polyglot.t(langFilterMode), 'that': polyglot.t('language of this')});

            // before detection attempts we cut out any mentions, links and /me directives and replace _ with space
            langFilterSubj = string.replace(/@\S\w*|https?:\/\/\S*|twist:\S\S\S\S\S\S\S\S\S\S\S=|^\/me\s/g, '').replace(/_+/g, ' ')
            // cut out common frequently used words FIXME I believe there is a list of similar international stuff somewhere outside which is waiting for us, we should just find it
                .replace(/\btwister|tox|github|linux|ubuntu|debian|windows|google|twitter|facebook|microsoft|ping|pong|email|javascript\b/ig, '')
            // replace zero-width word boundaries, such as between letters from different alphabets [or other symbols], with spaces
                  // FIXME not so good idea because 'Za pomocą białej listy' may turn into 'Za pomoc ą bia ł ej listy' for e.g.
                  // FIXME but first one was recognized as 'hrv' and second as 'pol' and you know it's 'pol' actually
                .replace(/\b/g, ' ')
            // cut out some more symbols
                .replace(/[#<>\.,:;\?\!\*\[\]\(\)\{\}\-\+\=\^\\\/0-9\u201C\u201D\u2026\u2014\u4E00\u3002\uFF0C\uFF1A\uFF1F\uFF01\u3010\u3011]/g, '')  // unicode escaped stuff is '“”…—一。，：？！【】'
            // clear unwanted spaces
                .replace(/\s+/g, ' ').trim();

            langFilterProb = franc.all(langFilterSubj, {'minLength': 2}); // FIXME minLength may become configurable option at some time
            for (var i = 0; i < langFilterProb.length; i++) {
                if (langFilterProb[i][1] > langFilterAccuracy) {
                    if (langFilterProb[i][0] === 'und') { // e.g. digits-only string will be detected as undefined and thereby will be allowed
                        langFilterPass = true;
                        langFilterReason = polyglot.t('its undefined language');
                        break;
                    } else if (langFilterList.indexOf(langFilterProb[i][0]) > -1) {
                        if (langFilterMode === 'whitelist') {
                            langFilterPass = true;
                            langFilterReason = polyglot.t('its this, whitelisted', {'this': '\''+langFilterProb[i][0]+'\''});
                            break;
                        } else {
                            langFilterPass = false;
                            langFilterReason = polyglot.t('its this, blacklisted', {'this': '\''+langFilterProb[i][0]+'\''});
                            break;
                        }
                    }
                }
            }
        } else {
            langFilterReason = polyglot.t('this is undefined', {'this': polyglot.t(langFilterMode)});
        }

        //console.log('langFilter | status: '+((langFilterPass === true) ? polyglot.t('passed') : polyglot.t('blocked'))+' | reason: '+langFilterReason+' | subject: \''+langFilterSubj+'\'');
        return {'subj': langFilterSubj, 'prob': langFilterProb, 'pass': langFilterPass, 'reason': langFilterReason};
    }
}

function checkUpdatesClient(alertIfNoUpdates) {
    function handleGetFail(jqXHR) {
        twister.var.updatesCheckClient.isOngoing = false;

        console.warn(polyglot.t('cant_get_requested_resourse', {link: this.url, status: jqXHR.status + ', \'' + jqXHR.statusText + '\''}));

        if (alertIfNoUpdates) {
            if ($.hasOwnProperty('mobile'))
                alert(polyglot.t('updates_not_available') + '.\n\n'
                    + polyglot.t('cant_get_requested_resourse', {link: this.url, status: jqXHR.status + ', \'' + jqXHR.statusText + '\''})
                );
            else
                alertPopup({
                    txtTitle: polyglot.t('updates_not_available'),
                    txtMessage: polyglot.t('cant_get_requested_resourse', {link: this.url, status: jqXHR.status + ', ~' + jqXHR.statusText + '~'})
                });
        }
    }

    if (twister.var.updatesCheckClient.isOngoing)
        return;

    twister.var.updatesCheckClient.isOngoing = true;

    $.get('.git/HEAD', function (ret) {
        if (ret.slice(0, 16) !== 'ref: refs/heads/') {
            twister.var.updatesCheckClient.isOngoing = false;
            if (alertIfNoUpdates)
                alert(polyglot.t('updates_not_available') + '.\n\nCan\'t parse local HEAD: unknown syntax, FUBAR!');

            return;
        }

        var branch = ret.slice(16).trim();

        $.get('.git/refs/heads/' + branch, function (ret) {
            var commit = ret.trim();
            if (!commit) {
                twister.var.updatesCheckClient.isOngoing = false;
                if (alertIfNoUpdates)
                    alert(polyglot.t('updates_not_available') + '.\n\nCan\'t parse local HEAD: \'' + '.git/refs/heads/' + branch + '\' is empty, FUBAR!');

                return;
            }

            var repo = 'twister-html';  // TODO source repo selection in options
            var repoOwner = 'miguelfreitas';

            // TODO notification if local branch was changed ('r u wanna reload the page?')
            /*if (!twister.var.updatesCheckClient.formerBranch || !twister.var.updatesCheckClient.formerCommit) {
                twister.var.updatesCheckClient.formerBranch = branch;
                twister.var.updatesCheckClient.formerCommit = commit;
            }*/

            console.log('currently we are on the branch \'' + branch + '\' of ' + repo + ' at the commit ' + commit);

            $.get('https://api.github.com/repos/' + repoOwner + '/' + repo + '/branches', function (ret) {
                for (var i = 0; i < ret.length; i++) {
                    if (ret[i].name === branch) {
                        if (ret[i].commit.sha === commit) {
                            twister.var.updatesCheckClient.isOngoing = false;

                            console.log(polyglot.t('updates_upstream_isnt_changed'));

                            if (alertIfNoUpdates) {
                                if ($.hasOwnProperty('mobile'))
                                    alert(polyglot.t('updates_not_available') + '.\n\n'
                                        + polyglot.t('updates_upstream_isnt_changed')
                                    );
                                else
                                    alertPopup({
                                        txtTitle: polyglot.t('updates_not_available'),
                                        txtMessage: polyglot.t('updates_upstream_isnt_changed')
                                    });
                            }
                        } else {
                            console.log('source branch has a different HEAD: ' + ret[i].commit.sha);

                            var commitUpstream = ret[i].commit.sha;

                            $.get('https://api.github.com/repos/' + repoOwner + '/' + repo + '/git/commits/' + commit, function (ret) {
                                if (ret.sha !== commit) {  // the response is wrong if so, should be 404 instead
                                    twister.var.updatesCheckClient.isOngoing = false;
                                    console.log('upstream tree doesn\'t have our most recent commit,\nlooks like we are in the process of development locally.');
                                    if (alertIfNoUpdates)
                                        alert(polyglot.t('updates_not_available') + '.\n\nUpstream tree doesn\'t have our most recent commit,\nlooks like we are in the process of development locally.');

                                    return;
                                }

                                commit = ret;

                                $.get('https://api.github.com/repos/' + repoOwner + '/' + repo + '/git/commits/' + commitUpstream, function (ret) {
                                    twister.var.updatesCheckClient.isOngoing = false;

                                    if (ret.sha !== commitUpstream) {  // the response is wrong if so, should be 404 instead
                                        console.warn('upstream tree doesn\'t have the commit which is named most recent in the list of branches, FUBAR!');
                                        if (alertIfNoUpdates)
                                            alert(polyglot.t('updates_not_available') + '.\n\nUpstream tree doesn\'t have the commit which is named most recent in the list of branches, FUBAR!');

                                        return;
                                    }

                                    commitUpstream = ret;
                                    var linkGitHubDiff = 'https://github.com/' + repoOwner + '/' + repo + '/compare/' + commit.sha + '...' + repoOwner + ':' + branch;

                                    console.log(polyglot.t('updates_checkout_diff_nfmt', {link: linkGitHubDiff}));

                                    if ($.hasOwnProperty('mobile'))
                                        alert(polyglot.t('updates_are_available') + '.\n\n'
                                            + polyglot.t('updates_repo_overview', {
                                                branch: '\'' + branch + '\'',
                                                repo: repo,
                                                commit: commit.sha,
                                                date: new Date(commit.author.date).toString().replace(/ GMT.*/g, ''),
                                                commitUpstream: commitUpstream.sha,
                                                dateUpstream: new Date(commitUpstream.author.date).toString().replace(/ GMT.*/g, '')
                                            }) + '\n\n'
                                            + polyglot.t('updates_checkout_diff_nfmt', {link: linkGitHubDiff})
                                        );
                                    else
                                        alertPopup({
                                            txtTitle: polyglot.t('updates_are_available'),
                                            txtMessage: polyglot.t('updates_repo_overview', {
                                                branch: '~' + branch + '~',
                                                repo: repo,
                                                commit: '*' + commit.sha + '*',
                                                date: new Date(commit.author.date).toString().replace(/ GMT.*/g, ''),
                                                commitUpstream: '*' + commitUpstream.sha + '*',
                                                dateUpstream: new Date(commitUpstream.author.date).toString().replace(/ GMT.*/g, '')
                                            }) + '\n\n'
                                            + polyglot.t('updates_checkout_diff', {link: linkGitHubDiff})
                                        });
                                }).fail(function (jqXHR) {
                                    if (jqXHR.status === 404) {
                                        twister.var.updatesCheckClient.isOngoing = false;
                                        console.warn('upstream tree doesn\'t have the commit which is named most recent in the list of branches, FUBAR!');
                                        if (alertIfNoUpdates)
                                            alert(polyglot.t('updates_not_available') + '.\n\nUpstream tree doesn\'t have the commit which is named most recent in the list of branches, FUBAR!');
                                    } else
                                        handleGetFail(jqXHR);
                                });
                            }).fail(function (jqXHR) {
                                if (jqXHR.status === 404) {
                                    twister.var.updatesCheckClient.isOngoing = false;
                                    console.log('upstream tree doesn\'t have our most recent commit,\nlooks like we are in the process of development locally.');
                                    if (alertIfNoUpdates)
                                        alert(polyglot.t('updates_not_available') + '.\n\nUpstream tree doesn\'t have our most recent commit,\nlooks like we are in the process of development locally.');
                                } else
                                    handleGetFail(jqXHR);
                            });
                        }
                        return;
                    }
                }
                twister.var.updatesCheckClient.isOngoing = false;
                console.log('upstream tree doesn\'t have our branch,\nlooks like we are in the process of development locally.');
                if (alertIfNoUpdates)
                    alert(polyglot.t('updates_not_available') + '.\n\nUpstream tree doesn\'t have our branch,\nlooks like we are in the process of development locally.');
            }).fail(handleGetFail);
        }).fail(handleGetFail);
    }).fail(handleGetFail);
}
