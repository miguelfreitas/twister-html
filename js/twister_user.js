// twister_user.js
// 2013 Miguel Freitas
//
// Load/save current user to localStorage
// keep track of lastPostId (used for posting as defaultScreenName)
// Load/save profile (profile-edit.html)

var defaultScreenName = undefined;
var lastPostId = undefined;

// basic user functions
// -------------------------------

function initUser(cbFunc, cbReq) {
    loadWalletlUsers(
        function (req) {
            var elemAccountsList = getElem('select.local-usernames', true);
            if (elemAccountsList.length) {
                for (var i = 0; i < twister.var.localAccounts.length; i++) {
                    if (!elemAccountsList.find('option[value=\'' + twister.var.localAccounts[i] + '\']').length) {
                        $('<option/>')
                            .val(twister.var.localAccounts[i])
                            .text(twister.var.localAccounts[i])
                            .appendTo(elemAccountsList)
                        ;
                    }
                }
            }

            loadScreenName();
            if (!defaultScreenName || twister.var.localAccounts.indexOf(defaultScreenName) < 0) {
                defaultScreenName = undefined;
            } else {
                getElem('select.local-usernames', true).val(defaultScreenName);

                var userMenuConfig = $('.userMenu-config');
                if (userMenuConfig.length) {
                    var elem = userMenuConfig.find('.mini-profile-name')
                        .attr('href', $.MAL.userUrl(defaultScreenName)).text(defaultScreenName);
                    getFullname(defaultScreenName, elem);
                }
            }

            lastPostId = undefined;

            if (typeof req.cbFunc === 'function') {
                req.cbFunc(req.cbReq);
            }
        }, {cbFunc: cbFunc, cbReq: cbReq}
    );
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

function loadWalletlUsers(cbFunc, cbReq) {
    twisterRpc('listwalletusers', [],
        function (req, ret) {
            twister.var.localAccounts = [];
            for (var i = 0; i < ret.length; i++) {
                if (ret.length && ret[i][0] !== '*') { // filter out group aliases (starting with '*')
                    twister.var.localAccounts.push(ret[i]);
                }
            }

            if (typeof req.cbFunc === 'function') {
                req.cbFunc(req.cbReq);
            }
        }, {cbFunc: cbFunc, cbReq: cbReq},
        function (req, ret) {
            alert(polyglot.t('error_connecting_to_daemon'));
        }
    );
}

function loadScreenName() {
    if ($.localStorage.isSet('defaultScreenName')) {
        defaultScreenName = $.localStorage.get('defaultScreenName').toString();
    }
}

function saveScreenName() {
    $.localStorage.set('defaultScreenName', defaultScreenName);
}


// user-related functions used by login page (desktop/mobile)
// ----------------------------------------------------------

function loginToAccount(peerAlias) {
    if (!peerAlias) {
        console.warn('can\'t login to account: empty alias was given');
        return;
    }

    defaultScreenName = peerAlias;
    saveScreenName();
    $.MAL.changedUser();
    $.MAL.goHome();
}

function createAccount(peerAlias) {
    if (!peerAlias) {
        console.warn('can\'t create account: empty alias was given');
        return;
    }

    twisterRpc('createwalletuser', [peerAlias],
        function(req, ret) {
            $.MAL.processCreateAccount(req.peerAlias, ret);
        }, {peerAlias: peerAlias},
        function(req, ret) {
            alert(polyglot.t('Error in \'createwalletuser\' RPC.'));
        }
    );
}

function importAccount(peerAlias, secretKey) {
    if (!peerAlias) {
        console.warn('can\'t import account: empty alias was given');
        return;
    }
    if (!secretKey) {
        console.warn('can\'t import account: empty secret key was given');
        return;
    }

    twisterRpc('importprivkey', [secretKey, peerAlias],
        function (req, ret) {
            defaultScreenName = req.peerAlias;
            saveScreenName();
            $.MAL.changedUser();
            $.MAL.goHome();
        }, {peerAlias: peerAlias},
        function (req, ret) {
            alert(polyglot.t('Error in \'importprivkey\'', {rpc: ret.message}));
        }
    );
}

function sendNewUserTransaction(peerAlias, cbFunc, cbReq) {
    twisterRpc('sendnewusertransaction', [peerAlias],
        function (req, ret) {
            if (typeof req.cbFunc === 'function') {
                req.cbFunc(req.cbReq);
            }
        }, {cbFunc: cbFunc, cbReq: cbReq},
        function (req, ret) {
            alert(polyglot.t('Error in \'sendnewusertransaction\' RPC.'));
        }
    );
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

function saveProfile(e) {
    function saveAvatar(req, isProfileDataSaved) {
        dhtput(defaultScreenName, 'avatar', 's',
            req.avatarImgSrc,
            defaultScreenName, ++avatarSeqNum,
            completeProfileSaving, {isProfileDataSaved: isProfileDataSaved}
        );
    }

    function completeProfileSaving(req, isAvatarDataSaved) {
        if (req.isProfileDataSaved && isAvatarDataSaved) {
            clearAvatarAndProfileCache(defaultScreenName);
            var txtTitle = '';
            var txtMessage = polyglot.t('profile_saved');
        } else {
            var txtTitle = polyglot.t('error', {error: ''});
            var txtMessage = polyglot.t('profile_not_saved');
        }
        alertPopup({
            txtTitle: txtTitle,
            txtMessage: txtMessage,
            cbConfirm: $.MAL.enableButton,
            cbConfirmReq: $('.submit-changes'),
            cbClose: 'cbConfirm'
        });
    }

    $.MAL.disableButton($('.submit-changes'));

    dhtput(defaultScreenName, 'profile', 's',
        setObjPropFromElemVal({}, {
            fullname:   '.input-name',
            bio:        '.input-description',
            location:   '.input-city',
            url:        '.input-website',
            tox:        '.input-tox',
            bitmessage: '.input-bitmessage'
        }),
        defaultScreenName, ++profileSeqNum,
        saveAvatar, {avatarImgSrc: $('.profile-card-photo.forEdition').attr('src')}
    );
}

function setObjPropFromElemVal(object, req) {
    var props = Object.getOwnPropertyNames(req);  // req's props names will be object's props names

    for (var i = 0; i < props.length; i++) {
        elem = $(req[props[i]]);  // req's props values are elements selectors
        if (elem.length && elem.val())
            object[props[i]] = elem.val();
    }

    return object;
}
