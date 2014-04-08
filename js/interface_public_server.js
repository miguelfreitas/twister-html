// interface_public_server.js

function initInterfaceLogin() {
    $(".announcement-title").text(polyglot.t("This is a read-only server"));
    $(".public-sercer-line-1 > p").text(polyglot.t("The website you are now viewing is a public, read-only server."));
    $(".public-sercer-line-2 > p").text(polyglot.t("If you want to be active on the network, download and run your own Twister."));
    $(".download-page-link").text(polyglot.t("Click here to start"));
    $(".download-page-link").bind( "click", function() {window.location.href = "http://twister.net.co/?page_id=23";} );
}
