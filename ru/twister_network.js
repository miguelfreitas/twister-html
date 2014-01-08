// twister_network.js
// 2013 Miguel Freitas
//
// Provides functions for periodic network status check
// Interface to network.html page.

var twisterdConnections = 0;
var twisterdAddrman = 0;
var twisterDhtNodes = 0;
var twisterdBlocks = 0;
var twisterdLastBlockTime = 0;
var twisterdConnectedAndUptodate = false;

// ---

function requestNetInfo(cbFunc, cbArg) {
    twisterRpc("getinfo", [],
               function(args, ret) {
                   twisterdConnections = ret.connections;
                   twisterdAddrman     = ret.addrman_total;
                   twisterdBlocks      = ret.blocks;
                   twisterDhtNodes     = ret.dht_nodes;

                   $(".connection-count").text(twisterdConnections);
                   $(".known-peers").text(twisterdAddrman);
                   $(".blocks").text(twisterdBlocks);
                   $(".dht-nodes").text(twisterDhtNodes);

                   if( !twisterdConnections ) {
                       $.MAL.setNetworkStatusMsg("Соединение потеряно.", false);
                       twisterdConnectedAndUptodate = false;
                   }

                   if( args.cbFunc )
                       args.cbFunc(args.cbArg);
               }, {cbFunc:cbFunc, cbArg:cbArg},
               function(args, ret) {
                   console.log("Ошибка подключения к локальному демону twisterd.");
               }, {});
}

function peerKeypress() {
    var peer = $(".new-peer-addr").val();
    var $button = $(".add-peer");
    if( peer.length ) {
        $.MAL.enableButton( $button );
    } else {
        $.MAL.disableButton( $button );
    }
}

function dnsKeypress() {
    var peer = $(".new-dns-addr").val();
    var $button = $(".add-dns");
    if( peer.length ) {
        $.MAL.enableButton( $button );
    } else {
        $.MAL.disableButton( $button );
    }
}

function addPeerClick() {
    var peer = $(".new-peer-addr").val();
    twisterRpc("addnode", [peer, "onetry"],
               function(args, ret) {
                   $(".new-peer-addr").val("")
               }, {},
               function(args, ret) {
                   alert("Error: " + ret.message);
               }, {});
}

function addDNSClick() {
    var dns = $(".new-dns-addr").val();
    twisterRpc("adddnsseed", [dns],
               function(args, ret) {
                   $(".new-dns-addr").val("")
               }, {},
               function(args, ret) {
                   alert("Error: " + ret.message);
               }, {});
}

function requestBestBlock(cbFunc, cbArg) {
    twisterRpc("getbestblockhash", [],
               function(args, hash) {
                   requestBlock(hash, args.cbFunc, args.cbArg);
               }, {cbFunc:cbFunc, cbArg:cbArg},
               function(args, ret) {
                   console.log("getbestblockhash error");
               }, {});
}

function requestBlock(hash, cbFunc, cbArg) {
    twisterRpc("getblock", [hash],
               function(args, block) {
                   twisterdLastBlockTime = block.time;
                   $(".last-block-time").text( timeGmtToText(twisterdLastBlockTime) );

                   if( args.cbFunc )
                       args.cbFunc(args.cbArg);
               }, {cbFunc:cbFunc, cbArg:cbArg},
               function(args, ret) {
                   console.log("requestBlock error");
               }, {});
}


function networkUpdate(cbFunc, cbArg) {
    requestNetInfo(function () {
        requestBestBlock(function(args) {
            var curTime = new Date().getTime() / 1000;
            if( twisterdConnections ) {
                if( twisterdLastBlockTime > curTime + 3600 ) {
                    $.MAL.setNetworkStatusMsg("Несоответствие времени создания блока, проверьте время на вашем компьютере.", false);
                    twisterdConnectedAndUptodate = false;
                } else if( twisterdLastBlockTime > curTime - (2 * 3600) ) {
                    if( twisterDhtNodes ) {
                        $.MAL.setNetworkStatusMsg("Цепочка блоков в актуальном состоянии, twister готов к использованию!", true);
                        twisterdConnectedAndUptodate = true;
                     } else {
                        $.MAL.setNetworkStatusMsg("Нет доступа к сети DHT.", false);
                        twisterdConnectedAndUptodate = true;
                     }
                } else {
                    var daysOld = (curTime - twisterdLastBlockTime) / (3600*24);
                    $.MAL.setNetworkStatusMsg("Идет загрузка цепочки блоков, пожалуйста подождите перед тем как продолжить " +
                                              "(последний полученный блок был сгенерирован " +
                                              daysOld.toFixed(2) +
                                              " дней назад).", false);
                    twisterdConnectedAndUptodate = false;
                }
            }
            if( args.cbFunc )
                args.cbFunc(args.cbArg)
        }, {cbFunc:cbFunc, cbArg:cbArg} );
    });
}

function getGenerate() {
    twisterRpc("getgenerate", [],
               function(args, ret) {
                   var $genblock = $("select.genblock");
                   if( ret ) {
                       $genblock.val("enable");
                   } else {
                       $genblock.val("disable");
                   }
               }, {},
               function(args, ret) {
                   console.log("getgenerate error");
               }, {});
}

function setGenerate() {
    var params = [];
    params.push($("select.genblock").val() == "enable");
    params.push(parseInt($(".genproclimit").val()));
    twisterRpc("setgenerate", params,
               function(args, ret) {
                   console.log("setgenerate updated");
               }, {},
               function(args, ret) {
                   console.log("getgenerate error");
               }, {});
}

function getSpamMsg() {
    twisterRpc("getspammsg", [],
               function(args, ret) {
                   var $postArea = $(".spam-msg");
                   var $localUsersList = $("select.local-usernames.spam-user");
                   $postArea.val(ret[1]);
                   $localUsersList.val(ret[0]);
               }, {},
               function(args, ret) {
                   console.log("getgenerate error");
               }, {});
}

function setSpamMsg() {
    var $postArea = $(".spam-msg");
    var $localUsersList = $("select.local-usernames.spam-user");
    var params = [$localUsersList.val(), $postArea.val()]
    twisterRpc("setspammsg", params,
               function(args, ret) {
                   console.log("setspammsg updated");
               }, {},
               function(args, ret) {
                   console.log("setspammsg error");
               }, {});
}

// handlers common to both desktop and mobile
function interfaceNetworkHandlers() {
    $( ".new-peer-addr" ).keyup( peerKeypress );
    $( ".new-dns-addr" ).keyup( dnsKeypress );
    $( ".add-peer").bind( "click", addPeerClick );
    $( ".add-dns").bind( "click", addDNSClick );
    $( "select.genblock").change( setGenerate );
    $( ".update-spam-msg").bind( "click", setSpamMsg );
}


function initInterfaceNetwork() {
    initInterfaceCommon();
    initUser( function () {
        getSpamMsg();

        if( defaultScreenName ) {
            loadFollowing( function() {
                initMentionsCount();
                initDMsCount();
            });
        }
    });
    networkUpdate();
    setInterval("networkUpdate()", 2000);
    getGenerate();

    interfaceNetworkHandlers();
}
