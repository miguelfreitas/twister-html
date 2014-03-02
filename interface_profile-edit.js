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
      alert(polyglot.t("The File APIs are not fully supported in this browser."));
    }
    
    initInterfaceCommon();

    $(".profile-card-photo.forEdition").click( function() { $('#avatar-file').click(); } );
    $("#avatar-file").bind( "change", handleAvatarFileSelect);
    $(".submit-changes").click( saveProfile );
    $(".cancel-changes").click( $.MAL.goHome );

    initUser( function() {
        if( !defaultScreenName ) {
            alert(polyglot.t("username_undefined"));
            $.MAL.goLogin();
            return;
        }
        checkNetworkStatusAndAskRedirect(verifyUserAlreadyInBlockchain);

        if( defaultScreenName ) {
            loadFollowing( function() {
                initMentionsCount();
                initDMsCount();
            });
        }

        $(".profile-card-main h2").text("@" + defaultScreenName);
        loadAvatarForEdit();
        loadProfileForEdit();
        
        dumpPrivkey(defaultScreenName, function(args, key) {
            $(".secret-key-container").hide();
            $(".secret-key").text(key);

            $(".toggle-priv-key").click(function () {
              $(".secret-key-container").fadeToggle();
            });
        }, {});
    });
}

function handleAvatarFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var f = files[0];

     // Only process image files.
     if (f.type.match('image.*')) {
        var reader = new FileReader();

        reader.onload=function(e){
           var img=new Image();
           img.onload=function(){
               var MAXWidthHeight=64;
               var r=MAXWidthHeight/Math.max(this.width,this.height),
               w=Math.round(this.width*r),
               h=Math.round(this.height*r),
               c=document.createElement("canvas");
               c.width=w;c.height=h;
               c.getContext("2d").drawImage(this,0,0,w,h);

               var imgURL = undefined;
               for(var q = 0.9; (!imgURL || imgURL.length > 4096) && q > 0.1; q -= 0.01) {
                   imgURL = c.toDataURL("image/jpeg", q);
               }
               $(".profile-card-photo.forEdition").attr("src", imgURL );
           }
           img.src=e.target.result;
        }

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}


function verifyUserAlreadyInBlockchain()
{
    $.MAL.disableButton($(".submit-changes"));
    
    dumpPubkey(defaultScreenName, function(args, pubkey) {
                    //pubkey = "";
                    if( pubkey.length > 0 ) {
                        follow('twister', true, function() {
                            $.MAL.enableButton($(".submit-changes"));
                        });
                    } else {
                        if( !newUserWarnDisplayed ) {
                            alert(polyglot.t("user_not_yet_accepted"));
                            newUserWarnDisplayed = true;
                        }
                        setTimeout("verifyUserAlreadyInBlockchain()", 5000);
                    }
                }, {} );
}
