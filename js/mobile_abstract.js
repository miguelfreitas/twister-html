// mobile_abstract.js
// 2013 Miguel Freitas
//
// Mobile Abstration Layer
// Try to sort out lowlevel differences between jquery and jquery mobile twister interfaces

var MAL = function()
{
    this.postboardLoading = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.loading('show');
            /*
            setTimeout(function(){
              $.mobile.loading('hide');
            }, 10 * 1000);
            */
        } else {
            $(".postboard-loading").show();
        }
    }

    this.postboardLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.loading('hide');
            var curPage = $('body').pagecontainer('getActivePage').attr("id");
            $( '#'+curPage+' .ui-content ul.posts').listview('refresh');

            installPostboardClick();
        } else {
            $(".postboard-loading").hide();
        }
    }

    this.dmThreadListLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.loading('hide');
            var $dmThreadList = $("#directmsg ul.direct-messages-thread");
            $dmThreadList.listview('refresh');
        } else {
        }
    }

    this.dmChatListLoaded = function(dmConvo) {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.loading('hide');
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
            $.mobile.loading('hide');
            var curPage = $('body').pagecontainer('getActivePage').attr("id");
            $( '#'+curPage+' .ui-content ul.posts').listview('refresh');
        } else {
            $(".postboard-loading").hide();
        }
    }

    this.followingListLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.loading('hide');
            $(".following-list").listview('refresh');
        } else {
            $(".postboard-loading").hide();
        }
    }

    this.searchUserListLoaded = function() {
        if( $.hasOwnProperty("mobile") ) {
            $.mobile.loading('hide');
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
            return "#dmchat?user=" + username;
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
         if( $button.data( "mobile-button" ) !== undefined ) {
             $button.button("enable");
         } else {
             $button.removeClass("ui-disabled")
             .prop("disabled",false);
         }
    }

    this.disableButton = function( $button ) {
         if( $button.data( "mobile-button" ) !== undefined ) {
             $button.button("disable");
         } else {
             $button.addClass("ui-disabled")
             .prop("disabled",true);
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

