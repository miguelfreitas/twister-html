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
            $(".postboard-loading").hide();
        }
    }

    this.dmThreadListLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.hidePageLoadingMsg();
            var $dmThreadList = $("#directmsg ul.direct-messages-thread");
            $dmThreadList.listview('refresh');
        } else {
        }
    }

    this.dmChatListLoaded = function(dmConvo) {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.hidePageLoadingMsg();
            var $dmChatList = $("#dmchat ul.direct-messages-list");
            $dmChatList.listview('refresh');
            $.mobile.silentScroll( $(".dm-form").offset().top );
        } else {
            var modalContent = dmConvo.parents(".modal-content");
            modalContent.scrollTop(modalContent[0].scrollHeight);
        }
    }


    this.relatedPostLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.hidePageLoadingMsg();
            var curPage = $.mobile.activePage.attr("id");
            $( '#'+curPage+' .content ul.posts').listview('refresh');
        } else {
            $(".postboard-loading").hide();
        }
    }


    this.followingListLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.hidePageLoadingMsg();
            $(".following-list").listview('refresh');
        } else {
            $(".postboard-loading").hide();
        }
    }

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
                document.title = "Twister";
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

                if ($.Options.getShowDesktopNotifPostsOpt() === 'enable') {
                    this.showDesktopNotif(false, polyglot.t('You got')+' '+polyglot.t('new_posts', newPosts)+' '+polyglot.t('in postboard')+'.', false,'twister_notification_new_posts', $.Options.getShowDesktopNotifPostsTimerOpt(), (function() {
                            requestTimelineUpdate('pending',this,followingUsers,promotedPostsOnly);
                        }).bind(newPosts), false)
                }
            } else {
                newTweetsBar.hide();
                newTweetsBar.text("");
                newTweetsBarMenu.text("");
                newTweetsBarMenu.removeClass("show");
                document.title = "Twister";
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
        if( $.hasOwnProperty("mobile") ) {
            return "#profile?user=" + username;
        } else {
            return "#profile?user=" + username;
        }
    }

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

    this.dmchatUrl = function(username) {
        if( $.hasOwnProperty("mobile") ) {
            return "#dmchat?user=" + username;
        } else {
            return "#directmessages?user=" + username;
        }
    }

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
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.navigate( "#login" );
        } else {
            window.location.href = "login.html";
        }
    }

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

    this.showDMchat = function(username) {
        if (username) {
            if( $.hasOwnProperty("mobile") ) {
                $.mobile.navigate( this.dmchatUrl(username) );
            } else {
                if ($(".postboard").length) {
                    window.location.hash = this.dmchatUrl(username);
                } else {
                    window.location.href = 'home.html'+this.dmchatUrl(username);
                }
            }
        } else {
            if( $.hasOwnProperty("mobile") ) {
                $.mobile.navigate( '#directmsg' );
            } else {
                if ($(".postboard").length) {
                    window.location.hash = '#directmessages';
                } else {
                    window.location.href = 'home.html#directmessages';
                }
            }
        }
    }

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
         if( $.hasOwnProperty("mobile") ) {
         } else {
             $.Options.mensNotif();
         }
    }

    this.soundNotifyDM = function() {
         if( $.hasOwnProperty("mobile") ) {
         } else {
             $.Options.DMsNotif();
         }
    }

    this.showDesktopNotif = function(notifyTitle, notifyBody, notifyIcon, notifyTag, notifyTimer, actionOnClick, actionOnPermDenied) {
        function doNotification() {
            if (!notifyTitle) {
                notifyTitle = polyglot.t('notify_desktop_title');
            }
            if (!notifyIcon) {
                notifyIcon = '../img/twister_mini.png';
            }
            if (!notifyTag) {
                notifyTag = 'twister_notification';
            }
            if (!notifyTimer) {
                notifyTimer = 3600 * 24 * 30; // one month
            }
            var doActionOnClick = false;
            if (typeof actionOnClick === 'function') {
                doActionOnClick = function() {
                    actionOnClick();
                    window.focus();
                }
            }

            var desktopNotification = new Notify(notifyTitle, {
                body: notifyBody,
                icon: notifyIcon,
                tag: notifyTag,
                timeout: notifyTimer,
                notifyClick: doActionOnClick,
                notifyError: function() { alert(polyglot.t('notify_desktop_error')) }
            });
            desktopNotification.show();
        }

        if (Notify.needsPermission) {
            Notify.requestPermission(false, actionOnPermDenied);
        } else {
            doNotification();
        }
    }

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
            return postLi.parents('.module.post.original.open').find('.post.related').length;
        }
    };
}

jQuery.MAL = new MAL;

function filterLang(string) {
    var langFilterMode = $.Options.getFilterLangOpt();

    if (langFilterMode !== 'disable') {
        var langFilterSubj = '';
        var langFilterProb = [];
        var langFilterPass = true;
        var langFilterReason = '';
        var langFilterList = $.Options.getFilterLangListOpt();

        if (langFilterList.length > 0) {
            var langFilterAccuracy = $.Options.getFilterLangAccuracyOpt();
            langFilterPass = (langFilterMode === 'whitelist') ? false : true;
            langFilterReason = polyglot.t('this doesnt contain that', {'this': polyglot.t(langFilterMode), 'that': polyglot.t('language of this')});

            // before detection attempts we cut out any mentions and links, and replace _ with space
            langFilterSubj = string.replace(/@\S\w*|https?:\/\/\S*/g, '').replace(/_+/g, ' ')
            // cut out common frequently used words FIXME I believe there is a list of similar international stuff somewhere outside which is waiting for us, we should just find it
                .replace(/\btwister|github|google|twitter\b/g, '')
            // replace zero-width word boundaries, such as between letters from different alphabets [or other symbols], with spaces
                  // FIXME not so good idea because 'Za pomocą białej listy' may turn into 'Za pomoc ą bia ł ej listy' for e.g.
                  // FIXME but first one was recognized as 'hrv' and second as 'pol' and you know it's 'pol' actually
                .replace(/\b/g, ' ')
            // cut out some more symbols
                .replace(/[#\[\]\(\)\{\}\-\+\=\^\:\;\\\/0-9]/g, '')
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

