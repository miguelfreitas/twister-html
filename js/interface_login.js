// interface_login.js
// 2013 Miguel Freitas

function processCreateUser(username, secretKey) {
    defaultScreenName = username;
    if (defaultScreenName)
        saveScreenName();

    openModal({
        classAdd: 'new-user',
        content: $('#new-user-modal-template').children().clone(true),
        title: polyglot.t('propagating_nickname', {username: username})
    })
        .content.find('.secret-key').text(secretKey);

    sendNewUserTransaction(username, processSendnewusertransaction);
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


