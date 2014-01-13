// interface_localization.js
//
// uses JavaScript to detect browser language
// uses Polyglot.js ( https://github.com/airbnb/polyglot.js ) to translate interface

// translators: add your language code here such as "es" for Spanish, "ru" for Russian
var knownLanguages = ["en"];

// detect language with JavaScript
var preferredLanguage = window.navigator.userLanguage || window.navigator.language || "en";
if(knownLanguages.indexOf(preferredLanguage) > -1){
  // en for en or similar
  preferredLanguage = preferredLanguage;
}
else if(knownLanguages.indexOf(preferredLanguage.split("-")[0]) > -1){
  // en for en-US or similar
  preferredLanguage = preferredLanguage.split("-")[0];
}
else{
  // did not find match
  preferredLanguage = "en";
}

// set up Polyglot
polyglot = new Polyglot();
var wordset = {};

if(preferredLanguage == "en"){
    polyglot.locale("en");
    wordset = {
      "Actions ▼": "Actions ▼",
      "Active DHT nodes:": "Active DHT nodes: ",
      "Add DNS": "Add DNS",
      "Add peer": "Add peer",
      "ajax_error": "Ajax error: %{error}", // JavaScript error
      "All users publicly followed by": "All users publicly followed by",
      "Available": "Available", // username is available
      "Block chain information": "Block chain information",
      "Block chain is up-to-date, twister is ready to use!": "Block chain is up-to-date, twister is ready to use!",
      "Block generation": "Block generation ",
      "Cancel": "Cancel",
      "Change user": "Change user",
      "Checking...": "Checking...", // checking if username is available
      "Collapse": "Collapse", // smaller view of a post
      "Configure block generation": "Configure block generation",
      "Connections:": "Connections: ", // to network
      "Connection lost.": "Connection lost.",
      "days": "%{days} day |||| %{days} days",
      "Detailed information": "Detailed information",
      "DHT network down.": "DHT network down.",
      "Direct Messages": "Direct Messages",
      "Disable": "Disable",
      "Display mentions to @": "Display mentions to @",
      "Display retransmissions": "Display retransmissions",
      "DNS to obtain list of peers:": "DNS to obtain list of peers:",
      "downloading_block_chain": "Downloading block chain, please wait before continuing (block chain is %{days} days old).",
      "download_posts_status": "Downloaded %{portion} posts", // Downloaded 10/30 posts
      "Enable": "Enable",
      "error": "Error: %{error}",
      "error_connecting_to_daemon": "Error connecting to local twister daemon.",
      "Error in 'createwalletuser' RPC.": "Error in 'createwalletuser' RPC.",
      "Error in 'importprivkey'": "Error in 'importprivkey' RPC: %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Error in 'sendnewusertransaction' RPC.",
      "Expand": "Expand", // larger view of a post
      "Favorite": "Favorite",
      "File APIs not supported in this browser.": "File APIs not supported in this browser.",
      "Follow": "Follow",
      "Followed by": "Followed by",
      "followed_by": "Followed by %{username}",
      "Followers": "Followers",
      "Following": "Following",
      "Following users": "Following users",
      "Force connection to peer:": "Force connection to peer:",
      "General information": "General information",
      "Generate blocks (send promoted messages)": "Generate blocks (send promoted messages)",
      "Home": "Home", // homepage
      "hours": "%{hours} hour |||| %{hours} hours",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Internal error: lastPostId unknown (following yourself may fix!)",
      "Known peers:": "Known peers: ",
      "Last block is ahead of your computer time, check your clock.": "Last block is ahead of your computer time, check your clock.",
      "mentions_at": "Mentions @%{user}",
      "minutes": "%{minutes} minute |||| %{minutes} minutes",
      "Must be 16 characters or less.": "Must be 16 characters or less.", // username
      "Network": "Network",
      "Network config": "Network config",
      "Network status": "Network status",
      "New direct message...": "New direct message...",
      "New Post...": "New Post...",
      "new_posts": "%{count} new post |||| %{count} new posts",
      "nobody": "nobody", // used to promote a post without attaching the user
      "Not available": "Not available", // username is not available
      "Number of blocks in block chain:": "Number of blocks in block chain: ",
      "Number of CPUs to use": "Number of CPUs to use ",
      "Only alphanumeric and underscore allowed.": "Only alphanumeric and underscore allowed.",
      "peer address": "peer address",
      "Private": "Private",
      "Profile": "Profile",
      "Postboard": "Postboard",
      "post": "post", // verb - button to post a message
      "Post to promote:": "Post to promote: ",
      "Posts": "Posts",
      "propagating_nickname": "Propagating nickname %{username} to the network...",
      "Public": "Public",
      "Refresh": "Refresh",
      "retransmit_this": "Retransmit this post to your followers?",
      "Reply": "Reply",
      "Reply...": "Reply...",
      "reply_to": "Reply to %{fullname}",
      "Retransmit": "Retransmit",
      "Retransmits": "Retransmits",
      "Retransmitted by": "Retransmitted by",
      "search": "search",
      "seconds": "%{seconds} second |||| %{seconds} seconds",
      "send": "send",
      "Send post with username": "Send post with username ",
      "Sent Direct Message": "Sent Direct Message",
      "Sent Post to @": "Sent Post to @",      
      "Setup account": "Setup account",
      "switch_to_network": "Local daemon is not connected to the network or\n" +
                "block chain is outdated. If you stay in this page\n" +
                "your actions may not work.\n" +
                "Do you want to check Network Status page instead?",
      "The File APIs are not fully supported in this browser.": "The File APIs are not fully supported in this browser.",
      "time_ago": "%{time} ago", // 5 minutes ago
      "Time of the last block:": "Time of the last block: ",
      "Type message here": "Type message here",
      "Unfollow": "Unfollow",
      "Update": "Update",
      "Updating status...": "Updating status...", // status of block chain
      "user_not_yet_accepted": "Other peers have not yet accepted this new user.\n" +
                "Unfortunately it is not possible to save profile\n" +
                "or send any posts in this state.\n\n" +
                "Please wait a few minutes to continue.\n\n" +
                "The 'Save Changes' will be automatically enabled\n" +
                "when the process completes. (I promise this is\n"+
                "the last time you will have to wait before using\n" +
                "twister).\n\n" +
                "Tip: choose your avatar in the meantime!",
      "users_mentions": "Mentions of @%{username}",
      "users_profile": "%{username}'s Profile",
      "username_undefined": "Username undefined, login required.",
      "View": "View",
      "View All": "View All",
      "Who to Follow": "Who to Follow",
      "Your message was sent!": "Your message was sent!"
    };
}

// translators: sample adding a language
if(preferredLanguage == "ru"){
    // polyglot.locale() is used to support plurals
    // locales currently known by Polyglot.js:
    /*
      chinese:   ['id', 'ja', 'ko', 'ms', 'th', 'tr', 'zh'],
      german:    ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
      french:    ['fr', 'tl'],
      russian:   ['hr', 'ru'],
      czech:     ['cs'],
      polish:    ['pl'],
      icelandic: ['is']
    */
    
    polyglot.locale("ru");

    // list of the English words and translations
    wordset = {
      "Actions ▼": "Действия ▼" // , comma after each match except the last
    };
}

// uncomment to see all translated words replaced with filler
//for(var word in wordset){
//  wordset[word] = "AAAA";
//}

polyglot.extend(wordset);

// Text from HTML and not JavaScript is selected and translated at $(document).ready
// Add selectors here to translate the text and placeholders inside new UI
var fixedLabels = [
  // An easy way to include new items in translation is to add the "label" class
  ".label",

  // navbar and home
  "button",
  ".userMenu > ul > li > a",
  ".postboard-news",
  ".post-area-new textarea",
  ".refresh-users, .view-all-users",
  ".who-to-follow h3",
  ".userMenu-search-field",
  "a.dropdown-menu-item, a.direct-messages",
  ".post-interactions span",
  ".post-expand",
  ".post-context span",
  ".post-stats .stat-count span",
  ".postboard h2",

  // following page
  ".following h2",
  ".mini-profile-actions span, .mini-profile-actions li",

  // network page
  ".network h2, .network h3",
  ".network ul li span",
  ".network label",
  ".network textarea, .network input, .network option",
];
$(document).ready(function(){
  for(var i=0;i<fixedLabels.length;i++){
    var elems = $(fixedLabels[i]);
    for(var e=0;e<elems.length;e++){
      var content = $.trim($(elems[e]).text());
      if(wordset[content]){
        $(elems[e]).text( polyglot.t(content) );
      }
      else{
        // uncomment to see translations not found
        //console.log(content);
      }
      if(typeof $(elems[e]).attr("placeholder") != "undefined" && wordset[ $(elems[e]).attr("placeholder")]){
        $(elems[e]).attr("placeholder", polyglot.t( $(elems[e]).attr("placeholder") ) );
      }
    }
  }
});