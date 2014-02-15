// interface_home.js
// 2013 Lucas Leal, Miguel Freitas
//
// Specific interface functions for home.html

//***********************************************
//******************* DECLARATIONS **************
//***********************************************
var InterfaceFunctions = function()
{
    //faço os binds no init
    this.init = function()
    {
        $( ".wrapper .postboard-news").click(function() {
            requestTimelineUpdate("latest",postsPerRefresh,followingUsers);});

        initInterfaceCommon();
        initUserSearch();
        initInterfaceDirectMsg();

        initUser(initHome);
    }

    function initHome(cbFunc, cbArg) {
        if( !defaultScreenName ) {
            alert(polyglot.t("username_undefined"));
            $.MAL.goLogin();
            return;
        }
        checkNetworkStatusAndAskRedirect();

        //$("span.screen-name").text('@' + user);
        var $miniProfile = $(".mini-profile");
        $miniProfile.find("a.mini-profile-name").attr("href",$.MAL.userUrl(defaultScreenName));
        $miniProfile.find("a.open-profile-modal").attr("href",$.MAL.userUrl(defaultScreenName));
        $miniProfile.find(".mini-profile-name").text(defaultScreenName);
        getFullname( defaultScreenName, $miniProfile.find(".mini-profile-name") );
        getAvatar( defaultScreenName, $miniProfile.find(".mini-profile-photo").find("img") );
        getPostsCount( defaultScreenName,  $miniProfile.find(".posts-count") );
        getFollowers( defaultScreenName, $miniProfile.find(".followers-count") );

        loadFollowing( function(args) {
                     $(".mini-profile .following-count").text(followingUsers.length-1);
                     requestLastHave();
                     setInterval("requestLastHave()", 1000);
                     initMentionsCount();
                     initDMsCount();
                     requestTimelineUpdate("latestFirstTime",postsPerRefresh,followingUsers);

                     // install scrollbottom handler to load more posts as needed
                     $(window).scroll(function(){
                        if  ($(window).scrollTop() >= $(document).height() - $(window).height() - 20){
                            if( timelineLoaded ) {
                                requestTimelineUpdate("older", postsPerRefresh, followingUsers);
                            }
                        }
                     });

                     setTimeout("getRandomFollowSuggestion(processSuggestion)", 1000);
                     setTimeout("getRandomFollowSuggestion(processSuggestion)", 1000);
                     setTimeout("getRandomFollowSuggestion(processSuggestion)", 1000);
                     
                     twisterRpc("gettrendinghashtags", [10],
                                function(args, ret) {
                                    for( var i = 0; i < ret.length; i++ ) {
                                    
                                       var $li = $("<li>");
                                       var hashtagLinkTemplate = $("#hashtag-link-template").clone(true);
                                       hashtagLinkTemplate.removeAttr("id");
                                       hashtagLinkTemplate.attr("href",$.MAL.hashtagUrl(ret[i]));
                                       hashtagLinkTemplate.text("#"+ret[i]);
                                       $li.append(hashtagLinkTemplate);
                                       $(".toptrends-list").append($li);
                                    }
                                }, {},
                                function(args, ret) {
                                   console.log("Error with gettrendinghashtags. Older twister daemon?");
                                }, {});
                     
                     if( args.cbFunc )
                        args.cbFunc(args.cbArg);
                 }, {cbFunc:cbFunc, cbArg:cbArg});
    }
}

//***********************************************
//******************* INIT **************
//***********************************************
var interfaceFunctions = new InterfaceFunctions;
$( document ).ready( interfaceFunctions.init );


//função no window que fixa o header das postagens
function fixDiv()
{
  var $cache = $('.postboard h2');
  if ($(window).scrollTop() > 26) 
    $cache.addClass( "fixed" ); 
  else
    $cache.removeClass( "fixed" );
}

$(window).scroll(fixDiv);
