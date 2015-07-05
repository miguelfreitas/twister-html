// interface_profile-edit.js
// 2013 Miguel Freitas
//
// Profile editing interface (profile-edit.html)

var newUserWarnDisplayed = false;

function initProfileEdit() {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
    } else {
        alert('The File APIs are not fully supported in this browser.');
    }

    initInterfaceCommon();

    $('.profile-card-photo.forEdition').on('click', function() { $('#avatar-file').click(); });
    $('#avatar-file').on('change', handleAvatarFileSelect);
    $('.submit-changes').on('click', saveProfile);
    $('.cancel-changes').on('click', $.MAL.goHome);

    initUser(function() {
        if (!defaultScreenName) {
            alert(polyglot.t('username_undefined'));
            $.MAL.goLogin();
            return;
        }
        checkNetworkStatusAndAskRedirect();

        loadFollowing(function() {
            twisterFollowingO = TwisterFollowing(defaultScreenName);
            verifyUserAlreadyInBlockchain();
            initMentionsCount();
            initDMsCount();
        });

        $('.profile-card-main h2').text('@' + defaultScreenName);
        loadAvatarForEdit();
        loadProfileForEdit();

        $('.secret-key-container').hide();

        $('.toggle-priv-key').on('click', function () {
            if ($('.secret-key-container').is(':visible')) {
                $('.secret-key-container').fadeOut(function () {
                    $('.secret-key').text('');
                });
            } else {
                dumpPrivkey(defaultScreenName, function(args, key) {
                    $('.secret-key').text(key);
                    $('.secret-key-container').fadeIn();
                }, {});
            }
        });
    });
}

function handleAvatarFileSelect(event) {
    var files = event.target.files; // FileList object
    var file = files[0];

     // Only process image files.
     if (file.type.match('image.*')) {
        var reader = new FileReader();

        reader.onload = function(event) {
            var img = new Image();
            img.onload = function() {
                var MAXWidthHeight = 64;
                var ratio = MAXWidthHeight / Math.max(this.width, this.height);
                var canvas = document.createElement('canvas');
                canvas.width = Math.round(this.width * ratio);
                canvas.height = Math.round(this.height * ratio);
                canvas.getContext('2d').drawImage(this, 0, 0, canvas.width, canvas.height);

                var imgURL = undefined;
                for (var quality = 1.0; (!imgURL || imgURL.length > 4096) && quality > 0.1; quality -= 0.01) {
                    imgURL = canvas.toDataURL('image/jpeg', quality);
                }
                $('.profile-card-photo.forEdition').attr('src', imgURL);
            }
            img.src = event.target.result;
        }

        // Read in the image file as a data URL.
        reader.readAsDataURL(file);
    }
}


function verifyUserAlreadyInBlockchain() {
    $.MAL.disableButton($('.submit-changes'));

    dumpPubkey(defaultScreenName, function(args, pubkey) {
        if (pubkey.length > 0) {
            follow('twister', true, function() {
                $.MAL.enableButton($('.submit-changes'));
            });
        } else {
            if (!newUserWarnDisplayed) {
                alert(polyglot.t('user_not_yet_accepted'));
                newUserWarnDisplayed = true;
            }
            setTimeout(verifyUserAlreadyInBlockchain, 5000);
        }
    }, {});
}

function localizePlaceholders() {
    $('.input-name').attr('placeholder', polyglot.t('Full name here'));
    $('.input-description').attr('placeholder', polyglot.t('Describe yourself'));
    $('.input-city').attr('placeholder', polyglot.t('Location'));
    $('.input-website').attr('placeholder', polyglot.t('website'));
    $('.input-tox').attr('placeholder', polyglot.t('Tox address'));
    $('.input-bitmessage').attr('placeholder', polyglot.t('Bitmessage address'));
}

$(document).ready(localizePlaceholders);
