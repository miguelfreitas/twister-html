// interface_login.js
// 2013 Miguel Freitas



function processCreateUser(username, secretKey) {
    defaultScreenName = username;
    if(defaultScreenName) {
        saveScreenName();
    }

    var newUserClass = "new-user";
    openModal( newUserClass );

    //título do modal
    $( "." + newUserClass + " h3" ).text( "Передаю информацио о регистрации '"+ username + "' в сеть..." );

    var modalContent = $("." + newUserClass + " .modal-content");
    var templateContent = $( "#new-user-modal-template" ).children().clone(true);
    templateContent.appendTo(modalContent);

    $( "." + newUserClass + " .secret-key" ).text(secretKey);

    sendNewUserTransaction( username, processSendnewusertransaction );
}

function processSendnewusertransaction() {
    $( ".login-created-user").show();
}

function loginCreatedUser() {
    $.MAL.goProfileEdit();
}

function initInterfaceLogin() {
    initUser();
    initInterfaceCommon();
    checkNetworkStatusAndAskRedirect();

    interfaceCommonLoginHandlers();
    $( ".create-user").bind( "click", function() { createUserClick( processCreateUser ); } );
    $( ".login-created-user").bind( "click", loginCreatedUser );
}


