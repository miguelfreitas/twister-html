// twister_user.js
// 2013 Miguel Freitas
//
// Load/save current user to localStorage
// keep track of lastPostId (used for posting as defaultScreenName)
// Load/save profile (profile-edit.html)

var defaultScreenName = undefined;
var localUsernames = [];
var lastPostId = undefined;

// basic user functions
// -------------------------------

function initUser(cbFunc, cbArg) {
    loadWalletlUsers( function() {
                       var $localUsersList = $("select.local-usernames");
                       if( $localUsersList.length ) {
                           for( var i = 0; i < localUsernames.length; i++ ) {
                               var $existingOption = $localUsersList.find("option[value='" + localUsernames[i] + "']");
                               if( !$existingOption.length ) {
                                   var $userOption = $("<option/>");
                                   $userOption.val(localUsernames[i]);
                                   $userOption.text(localUsernames[i]);
                                   $localUsersList.append($userOption);
                               }
                           }
                       }

                       loadScreenName();
                       if( !defaultScreenName || localUsernames.indexOf(defaultScreenName) < 0 ) {
                           defaultScreenName = undefined;
                       } else {
                           var $localUsersLogin = $("select.local-usernames.login-user");
                           if( $localUsersLogin.length ) {
                               $localUsersLogin.val(defaultScreenName);
                           }

                           var $userMenuConfig = $(".userMenu-config");
                           if( $userMenuConfig.length ) {
                               $userMenuConfig.find("a.mini-profile-name").attr("href",$.MAL.userUrl(defaultScreenName));
                               $userMenuConfig.find(".mini-profile-name").text(defaultScreenName);
                               getFullname( defaultScreenName, $userMenuConfig.find(".mini-profile-name") );
                           }
                       }
                       lastPostId = undefined;
                       if( cbFunc )
                           cbFunc(cbArg);
    });
}

function incLastPostId( optionalNewValue ) {
    if( optionalNewValue != undefined ) {
        if( lastPostId == undefined || optionalNewValue > lastPostId ) {
            lastPostId = optionalNewValue;
        }
    } else {
        lastPostId++;
    }
    $.MAL.updateMyOwnPostCount(lastPostId+1);
}

function loadWalletlUsers(cbFunc, cbArg) {
    twisterRpc("listwalletusers", [],
               function(args, ret) {
                   localUsernames = ret;
                   args.cbFunc(args.cbArg);
               }, {cbFunc:cbFunc, cbArg:cbArg},
               function(args, ret) {
                   alert(polyglot.t("error_connecting_to_daemon"));
               }, {});
}

function loadScreenName() {
    if( $.localStorage.isSet("defaultScreenName") ) {
        defaultScreenName = $.localStorage.get("defaultScreenName");
    }
}

function saveScreenName() {
    $.localStorage.set("defaultScreenName", defaultScreenName);
}


// user-related functions used by login page (desktop/mobile)
// ----------------------------------------------------------

function loginLocalUsername() {
    defaultScreenName = $("select.local-usernames.login-user").val();
    if(defaultScreenName) {
        saveScreenName();
        $.MAL.changedUser();
        $.MAL.goHome();
    }
}

function checkUsernameAvailability() {
    var $newUsername = $(".new-username");
    var username = $newUsername.val().toLowerCase();
    $newUsername.val(username);
    var $availField = $(".availability");

    if( !username.length )
        return;
    if( username.length > 16 ) {
        $availField.text(polyglot.t("Must be 16 characters or less."));
        return;
    }

    //Check for non-alphabetic characters and space
    if(username.search(/[^a-z0-9_]/) != -1) {
        $availField.text(polyglot.t("Only alphanumeric and underscore allowed."));
        return;
    }

    $availField.text(polyglot.t("Checking..."));

    dumpPubkey(username, function(dummy, pubkey) {
                            var notAvailable =  pubkey.length > 0
                            var $availField = $(".availability");
                            if( notAvailable ) {
                                $availField.text(polyglot.t("Not available"));
                            } else {
                                $availField.text(polyglot.t("Available"));

                                var $createButton = $(".create-user");
                                $.MAL.enableButton( $createButton );
                            }
                        }, null);
}

function newUserNameKeypress() {
    var $availField = $(".availability");
    $availField.text("");
    var $createButton = $(".create-user");
    $.MAL.disableButton( $createButton );
}

// create user and call cbFunc(username, privkey)
function createUserClick(cbFunc) {
    var $newUsername = $(".new-username");
    var username = $newUsername.val().toLowerCase();

    if( localUsernames.indexOf(username) < 0 ) {
        twisterRpc("createwalletuser", [username],
                   function(args, ret) {
                       args.cbFunc(args.username, ret);
                   }, {username:username, cbFunc:cbFunc},
                   function(args, ret) {
                       alert(polyglot.t("Error in 'createwalletuser' RPC."));
                   }, {cbFunc:cbFunc});
    } else {
        // user exists in wallet but transaction not sent
        dumpPrivkey(username,
                    function(args, ret) {
                       args.cbFunc(args.username, ret);
                    }, {username:username, cbFunc:cbFunc});
    }
}

function sendNewUserTransaction(username, cbFunc) {
    twisterRpc("sendnewusertransaction", [username],
               function(args, ret) {
                   args.cbFunc();
               }, {cbFunc:cbFunc},
               function(args, ret) {
                   alert(polyglot.t("Error in 'sendnewusertransaction' RPC."));
               }, {});
}


function importSecretKeypress() {
    var secretKey = $(".secret-key-import").val();
    var username = $(".username-import").val().toLowerCase();
    var $importButton = $(".import-secret-key");

    if( secretKey.length == 52 && username.length ) {
        $.MAL.enableButton( $importButton );
    } else {
        $.MAL.disableButton( $importButton );
    }
}

function importSecretKeyClick() {
    var secretKey = $(".secret-key-import").val();
    var username = $(".username-import").val().toLowerCase();

    twisterRpc("importprivkey", [secretKey,username],
               function(args, ret) {
                   processNewSecretKeyImported(args.username);
               }, {username:username},
               function(args, ret) {
                   alert(polyglot.t("Error in 'importprivkey'", {rpc: ret.message }));
               }, {});
}

function processNewSecretKeyImported(username) {
    defaultScreenName = username;
    saveScreenName();
    $.MAL.changedUser();
    $.MAL.goHome();
}

// handlers common to both desktop and mobile
function interfaceCommonLoginHandlers() {
    $( ".login-local-username" ).bind( "click", loginLocalUsername );
    $( ".check-availability").bind( "click", checkUsernameAvailability );
    /* must specialize: $( ".create-user").bind( "click", function() { createUserClick( processCreateUser ); } ); */
    /* must specialize: $( ".login-created-user").bind( "click", loginCreatedUser ); */
    $( ".new-username" ).keyup( newUserNameKeypress );
    $( ".secret-key-import" ).keyup( importSecretKeypress );
    $( ".username-import" ).keyup( importSecretKeypress );
    $( ".import-secret-key").bind( "click", importSecretKeyClick );
}

// profile-related functions used by profile-edit
// ----------------------------------------------
var avatarSeqNum = 0;
var profileSeqNum = 0;

function loadAvatarForEdit() {
    dhtget( defaultScreenName, "avatar", "s",
           function(args, imagedata, rawdata) {
               if( rawdata ) {
                   var seq = parseInt(rawdata[0]["p"]["seq"]);
                   if( seq > avatarSeqNum ) avatarSeqNum = seq;
               }
               if( imagedata && imagedata.length ) {
                   $(".profile-card-photo.forEdition").attr("src", imagedata);
               }
           }, {} );
}

function loadProfileForEdit() {
    dhtget( defaultScreenName, "profile", "s",
           function(args, profile, rawdata) {
               if( rawdata ) {
                   var seq = parseInt(rawdata[0]["p"]["seq"]);
                   if( seq > profileSeqNum ) profileSeqNum = seq;
               }
               if( profile ) {
                   if( "fullname" in profile)
                       $(".input-name").val(profile.fullname);
                   if( "bio" in profile)
                       $(".input-description").val(profile.bio);
                   if( "location" in profile)
                       $(".input-city").val(profile.location);
                   if( "url" in profile)
                       $(".input-website").val(profile.url);
                   if( "tox" in profile)
                       $(".input-tox").val(profile.tox);
                   if( "bitmessage" in profile)
                       $(".input-bitmessage").val(profile.bitmessage);
               }
           }, {} );
}

function saveProfile(e)
{
    var profile = {};
    profile["fullname"] = $(".input-name").val();
    profile["bio"]      = $(".input-description").val();
    profile["location"] = $(".input-city").val();
    profile["url"]      = $(".input-website").val();
    var tox = $(".input-tox").val();
    if( tox.length )
        profile["tox"]  = tox;
    var bitmessage = $(".input-bitmessage").val();
    if( bitmessage.length )
        profile["bitmessage"] = bitmessage;
    dhtput( defaultScreenName, "profile", "s",
            profile, defaultScreenName, ++profileSeqNum );
    var avatarData = $(".profile-card-photo.forEdition").attr("src");
    dhtput( defaultScreenName, "avatar", "s",
           avatarData, defaultScreenName, ++avatarSeqNum );
    clearAvatarAndProfileCache(defaultScreenName);
}

