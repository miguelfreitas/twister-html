$(function() {
	
});

var _desktopNotificationTimeout = 10; // it should be an option

var TwisterOptions = function()
{
    this.getOption = function(optionName, defaultValue) {
        var keyName = "options:" + optionName;
        if( $.localStorage.isSet(keyName) )
            return $.localStorage.get(keyName);
        else
            return defaultValue;
    }

    this.setOption = function(optionName, value) {
        var keyName = "options:" + optionName;
        $.localStorage.set(keyName, value);
    }
    
    this.soundNotifOptions = function() {
        $('#notifyForm select').each(function(){
            this.value = $.Options.getOption(this.id, "false");
        });
        
        var player = $('#player');
        player[0].pause();
        $('#player').empty();

        $('form#notifyForm').on('change','select',function(){
            $.Options.setOption(this.id, this.value);
            
            if(this.value == false) {player[0].pause(); return;}
            if (player[0].canPlayType('audio/mpeg;')) {
                player.attr('type', 'audio/mpeg');
                player.attr('src', 'sound/'+this.value+'.mp3');
            } else {
                player.attr('type', 'audio/ogg');
                player.attr('src', 'sound/'+this.value+'.ogg');
            }
            
            player[0].play();
        });
    }

    this.volumeControl = function() {
        var playerVol = $('#playerVol');
        playerVol[0].value = $.Options.getOption(playerVol[0].id, 1);
        $('.volValue').text((playerVol[0].value * 100).toFixed());

        playerVol.on('change',function(){
            $.Options.setOption(this.id, this.value);
            $('#player')[0].volume = (this.value);
            $('.volValue').text((this.value * 100).toFixed());
        });
    }

    this.DMsNotif = function() {
        var sndDM = $.Options.getOption('sndDM', "false");
        if( sndDM == "false") return;
        var player = $('#player');
        $('#player').empty();

        if (player[0].canPlayType('audio/mpeg;')) {
            player.attr('type', 'audio/mpeg');
            player.attr('src', 'sound/'+sndDM+'.mp3');
        } else {
            player.attr('type', 'audio/ogg');
            player.attr('src', 'sound/'+sndDM+'.ogg');
        }
        player[0].volume = $.Options.getOption('playerVol',1);
        player[0].play();
    }

    this.mensNotif = function() {
        var sndMention = $.Options.getOption('sndMention', "false");
        if(sndMention == "false") return;
        var player = $('#playerSec');
        $('#playerSec').empty();

        if (player[0].canPlayType('audio/mpeg;')) {
            player.attr('type', 'audio/mpeg');
            player.attr('src', 'sound/'+sndMention+'.mp3');
        } else {
            player.attr('type', 'audio/ogg');
            player.attr('src', 'sound/'+sndMention+'.ogg');
        }
        player[0].volume = $.Options.getOption('playerVol',1);
        player[0].play();
    }

    this.getShowDesktopNotifPostsOpt = function() {
        return $.Options.getOption('showDesktopNotifPosts','enable');
    }

    this.setShowDesktopNotifPostsOpt = function () {
        function showDesktopNotifPostsDesc() {
            if ($.Options.getShowDesktopNotifPostsOpt() === 'enable') {
                $('#showDesktopNotifPostsDesc')[0].style.display= 'inline';
            } else {
                $('#showDesktopNotifPostsDesc')[0].style.display= 'none';
            }
        }
        $('#showDesktopNotifPosts').val(this.getShowDesktopNotifPostsOpt());
        showDesktopNotifPostsDesc();
        $('#showDesktopNotifPosts').on('change', function() {
            $.Options.setOption(this.id, this.value);
            showDesktopNotifPostsDesc();
        });
    }

    this.getShowDesktopNotifPostsTimerOpt = function () {
        return parseInt($.Options.getOption('showDesktopNotifPostsTimer', '6'));
    }

    this.setShowDesktopNotifPostsTimerOpt = function () {
        $('#showDesktopNotifPostsTimer')[0].value = this.getShowDesktopNotifPostsTimerOpt().toString();

        $('#showDesktopNotifPostsTimer').on('keyup', function () {setElemValNumeric(this, polyglot.t('second(s)'));});
    }

    this.getShowDesktopNotifPostsModalOpt = function() {
        return $.Options.getOption('showDesktopNotifPostsModal','enable');
    }

    this.setShowDesktopNotifPostsModalOpt = function () {
        function showDesktopNotifPostsModalDesc() {
            if ($.Options.getShowDesktopNotifPostsModalOpt() === 'enable') {
                $('#showDesktopNotifPostsModalDesc')[0].style.display= 'inline';
            } else {
                $('#showDesktopNotifPostsModalDesc')[0].style.display= 'none';
            }
        }
        $('#showDesktopNotifPostsModal').val(this.getShowDesktopNotifPostsModalOpt());
        showDesktopNotifPostsModalDesc();
        $('#showDesktopNotifPostsModal').on('change', function() {
            $.Options.setOption(this.id, this.value);
            showDesktopNotifPostsModalDesc();
        });
    }

    this.getShowDesktopNotifPostsModalTimerOpt = function () {
        return parseInt($.Options.getOption('showDesktopNotifPostsModalTimer', '6'));
    }

    this.setShowDesktopNotifPostsModalTimerOpt = function () {
        $('#showDesktopNotifPostsModalTimer')[0].value = this.getShowDesktopNotifPostsModalTimerOpt().toString();

        $('#showDesktopNotifPostsModalTimer').on('keyup', function () {setElemValNumeric(this, polyglot.t('second(s)'));});
    }

    this.getShowDesktopNotifMentionsOpt = function() {
        return $.Options.getOption('showDesktopNotifMentions','enable');
    }

    this.setShowDesktopNotifMentionsOpt = function () {
        function showDesktopNotifMentionsDesc() {
            if ($.Options.getShowDesktopNotifMentionsOpt() === 'enable') {
                $('#showDesktopNotifMentionsDesc')[0].style.display= 'inline';
            } else {
                $('#showDesktopNotifMentionsDesc')[0].style.display= 'none';
            }
        }
        $('#showDesktopNotifMentions').val(this.getShowDesktopNotifMentionsOpt());
        showDesktopNotifMentionsDesc();
        $('#showDesktopNotifMentions').on('change', function() {
            $.Options.setOption(this.id, this.value);
            showDesktopNotifMentionsDesc();
        });
    }

    this.getShowDesktopNotifMentionsTimerOpt = function () {
        return parseInt($.Options.getOption('showDesktopNotifMentionsTimer', '60'));
    }

    this.setShowDesktopNotifMentionsTimerOpt = function () {
        $('#showDesktopNotifMentionsTimer')[0].value = this.getShowDesktopNotifMentionsTimerOpt().toString();

        $('#showDesktopNotifMentionsTimer').on('keyup', function () {setElemValNumeric(this, polyglot.t('second(s)'));});
    }

    this.getShowDesktopNotifDMsOpt = function() {
        return $.Options.getOption('showDesktopNotifDMs','enable');
    }

    this.setShowDesktopNotifDMsOpt = function () {
        function showDesktopNotifDMsDesc() {
            if ($.Options.getShowDesktopNotifDMsOpt() === 'enable') {
                $('#showDesktopNotifDMsDesc')[0].style.display= 'inline';
            } else {
                $('#showDesktopNotifDMsDesc')[0].style.display= 'none';
            }
        }
        $('#showDesktopNotifDMs').val(this.getShowDesktopNotifDMsOpt());
        showDesktopNotifDMsDesc();
        $('#showDesktopNotifDMs').on('change', function() {
            $.Options.setOption(this.id, this.value);
            showDesktopNotifDMsDesc();
        });
    }

    this.getShowDesktopNotifDMsTimerOpt = function () {
        return parseInt($.Options.getOption('showDesktopNotifDMsTimer', '60'));
    }

    this.setShowDesktopNotifDMsTimerOpt = function () {
        $('#showDesktopNotifDMsTimer')[0].value = this.getShowDesktopNotifDMsTimerOpt().toString();

        $('#showDesktopNotifDMsTimer').on('keyup', function () {setElemValNumeric(this, polyglot.t('second(s)'));});
    }

    this.setTestDesktopNotif = function() {
        $('#testDesktopNotif').on('click', function() {
            $.MAL.showDesktopNotif(false, polyglot.t('notify_desktop_test'), false,'twister_notification_test', false, false, function() { alert(polyglot.t('notify_desktop_perm_denied')) })
        })
    }

    this.keysSendDefault = "ctrlenter";
    this.keysSend = function() {
        $('#keysOpt select')[0].value = $.Options.getOption('keysSend',this.keysSendDefault);

        $('#keysOpt select').on('change', function(){
            $.Options.setOption(this.id, this.value);
        })
    }

    this.keyEnterToSend = function() {
        return $.Options.getOption('keysSend',this.keysSendDefault) == "enter";
    }

    this.setLang = function() {
        $('#language').val($.Options.getOption('locLang','auto'))
        $('#language').on('change', function(){
            $.Options.setOption('locLang', $(this).val());
            location.reload();
        })
    }

    this.getTheme = function() {
        return $.Options.getOption('theme','original');
    }

    this.setTheme = function() {
        $('#theme').val(this.getTheme())
        $('#theme').on('change', function(){
            $.Options.setOption('theme', $(this).val());
            location.reload();
        });
    }

    this.getLineFeedsOpt = function() {
        return $.Options.getOption('displayLineFeeds',"disable");
    }

    this.setLineFeedsOpt = function() {
        $('#lineFeedsOpt select')[0].value = this.getLineFeedsOpt();

        $('#lineFeedsOpt select').on('change', function(){
            $.Options.setOption(this.id, this.value);
        })
    }

    this.getShowPreviewOpt = function() {
        return $.Options.getOption('displayPreview',"disable");
    }

    this.setShowPreviewOpt = function () {
        $('#showPreviewOpt select')[0].value = this.getShowPreviewOpt();

        $('#showPreviewOpt select').on('change', function(){
            $.Options.setOption(this.id, this.value);
        });
    }

    this.getUnicodeConversionOpt = function () {
        return $.Options.getOption('unicodeConversion', "disable");
    }

    this.setUnicodeConversionOpt = function () {
        $("#unicodeConversion")[0].value = this.getUnicodeConversionOpt();

        if (this.getUnicodeConversionOpt() === "custom")
            $("#unicodeConversionOpt .suboptions")[0].style.height = "230px";

        $("#unicodeConversion").on('change', function () {
            $.Options.setOption(this.id, this.value);
            if (this.value === "custom")
                $("#unicodeConversionOpt .suboptions")[0].style.height = "230px";
            else
                $("#unicodeConversionOpt .suboptions")[0].style.height = "0px";
        });
    }

    this.getConvertPunctuationsOpt = function() {
        return $.Options.getOption('convertPunctuationsOpt', false);
    }

    this.setConvertPunctuationsOpt = function () {
        $('#convertPunctuationsOpt')[0].checked = this.getConvertPunctuationsOpt();

        $('#convertPunctuationsOpt').on('change', function(){
            $.Options.setOption(this.id, this.checked);
        });
    }

    this.getConvertEmotionsOpt = function() {
        return $.Options.getOption('convertEmotionsOpt', false);
    }

    this.setConvertEmotionsOpt = function () {
        $('#convertEmotionsOpt')[0].checked = this.getConvertEmotionsOpt();

        $('#convertEmotionsOpt').on('change', function(){
            $.Options.setOption(this.id, this.checked);
        });
    }

    this.getConvertSignsOpt = function() {
        return $.Options.getOption('convertSignsOpt', false);
    }

    this.setConvertSignsOpt = function () {
        $('#convertSignsOpt')[0].checked = this.getConvertSignsOpt();

        $('#convertSignsOpt').on('change', function(){
            $.Options.setOption(this.id, this.checked);
        });
    }

    this.getConvertFractionsOpt = function() {
        return $.Options.getOption('convertFractionsOpt', false);
    }

    this.setConvertFractionsOpt = function () {
        $('#convertFractionsOpt')[0].checked = this.getConvertFractionsOpt();

        $('#convertFractionsOpt').on('change', function(){
            $.Options.setOption(this.id, this.checked);
        });
    }

    this.getUseProxyOpt = function () {
        return $.Options.getOption('useProxy', 'disable');
    }

    this.setUseProxyOpt = function () {
        $('#useProxy')[0].value = this.getUseProxyOpt();

        if (this.getUseProxyOpt() === 'disable')
            $('#useProxyForImgOnly').attr('disabled','disabled');

        $('#useProxy').on('change', function () {
            $.Options.setOption(this.id, this.value);

            if (this.value === 'disable')
                $('#useProxyForImgOnly').attr('disabled','disabled');
            else
                $('#useProxyForImgOnly').removeAttr('disabled');
        });
    }

    this.getUseProxyForImgOnlyOpt = function () {
        return $.Options.getOption('useProxyForImgOnly', false);
    }

    this.setUseProxyForImgOnlyOpt = function () {
        $('#useProxyForImgOnly')[0].checked = this.getUseProxyForImgOnlyOpt();

        $('#useProxyForImgOnly').on('change', function () {
            $.Options.setOption(this.id, this.checked);
        });
    }

    this.getSplitPostsOpt = function (){
        return $.Options.getOption('splitPosts', 'disable');
    }

    this.setSplitPostsOpt = function () {
        $('#splitPosts')[0].value = this.getSplitPostsOpt();

        $('#splitPosts').on('change', function () {
            $.Options.setOption(this.id, this.value);
        });
    }

    this.getHideRepliesOpt = function () {
        return $.Options.getOption('hideReplies', 'following');
    }

    this.setHideRepliesOpt = function () {
        $('#hideReplies')[0].value = this.getHideRepliesOpt();

        $('#hideReplies').on('change', function () {
            $.Options.setOption(this.id, this.value);
        });
    }

    this.getHideCloseRTsOpt = function () {
        return $.Options.getOption('hideCloseRTs', 'disable');
    };

    this.setHideCloseRTsOpt = function () {
        $('#hideCloseRTs')[0].value = this.getHideCloseRTsOpt();

        if (this.getHideCloseRTsOpt() === 'disable') {
            $('#hideCloseRTsDesc')[0].style.display = 'none';
        } else {
            $('#hideCloseRTsDesc')[0].style.display = 'inline';
        }

        $('#hideCloseRTs').on('change', function () {
            $.Options.setOption(this.id, this.value);

            if (this.value === 'disable') {
                $('#hideCloseRTsDesc')[0].style.display = 'none';
            } else {
                $('#hideCloseRTsDesc')[0].style.display = 'inline';
            }
        });
    };

    this.getHideCloseRTsHourOpt = function () {
        return parseInt($.Options.getOption('hideCloseRtsHour', '1'));
    };

    this.setHideCloseRTsHourOpt = function () {
        $('#hideCloseRtsHour')[0].value = this.getHideCloseRTsHourOpt().toString();

        $('#hideCloseRtsHour').on('keyup', function () {setElemValNumeric(this, polyglot.t('hour(s)'));});
    };

    this.getIsFollowingMeOpt = function () {
        return $.Options.getOption('isFollowingMe');
    };

    this.getFilterLangOpt = function() {
        return $.Options.getOption('filterLang','disable');
    }

    this.setFilterLangOpt = function () {
        function filterLangListCont() {
            if ( $.Options.getFilterLangOpt() !== 'disable' ) {
                $('#filterLangListCont')[0].style.display= 'block';
            } else {
                $('#filterLangListCont')[0].style.display= 'none';
            }
        }
        $('#filterLang').val(this.getFilterLangOpt());
        filterLangListCont();
        $('#filterLang').on('change', function() {
            $.Options.setOption(this.id, this.value);
            filterLangListCont();
        });
    }

    this.getFilterLangListOpt = function () {
        return $.Options.getOption('filterLangList', '').replace(/\s+/g, '').split(/\s*,\s*/);
    }

    this.setFilterLangListOpt = function () {
        $('#filterLangList').val(this.getFilterLangListOpt());

        $('#filterLangList').on('keyup', function () {$.Options.setOption(this.id, this.value);});
    }

    this.getFilterLangAccuracyOpt = function () {
        return parseFloat($.Options.getOption('filterLangAccuracy', '0.82'));
    }

    this.setFilterLangAccuracyOpt = function () {
        $('#filterLangAccuracy').val(this.getFilterLangAccuracyOpt());
        $('#filterLangAccuracyVal').text(this.getFilterLangAccuracyOpt());
        $('#filterLangAccuracy').on('change', function () {
            $.Options.setOption(this.id, this.value);
            $('#filterLangAccuracyVal').text(this.value);
        });
    }

    this.getFilterLangForPostboardOpt = function () {
        return $.Options.getOption('filterLangForPostboard', true);
    }

    this.setFilterLangForPostboardOpt = function () {
        $('#filterLangForPostboard').prop('checked', $.Options.getFilterLangForPostboardOpt());

        $('#filterLangForPostboard').on('click', function () {$.Options.setOption(this.id, this.checked);});
    }

    this.getFilterLangForSearchingOpt = function () {
        return $.Options.getOption('filterLangForSearching', true);
    }

    this.setFilterLangForSearchingOpt = function () {
        $('#filterLangForSearching').prop('checked', $.Options.getFilterLangForSearchingOpt());

        $('#filterLangForSearching').on('click', function () {$.Options.setOption(this.id, this.checked);});
    }

    this.getFilterLangForTopTrendsOpt = function () {
        return $.Options.getOption('filterLangForTopTrends', true);
    }

    this.setFilterLangForTopTrendsOpt = function () {
        $('#filterLangForTopTrends').prop('checked', $.Options.getFilterLangForTopTrendsOpt());

        $('#filterLangForTopTrends').on('click', function () {$.Options.setOption(this.id, this.checked);});
    }

    this.getFilterLangSimulateOpt = function () {
        return $.Options.getOption('filterLangSimulate', false);
    }

    this.setFilterLangSimulateOpt = function () {
        $('#filterLangSimulate').prop('checked', $.Options.getFilterLangSimulateOpt());

        $('#filterLangSimulate').on('click', function () {$.Options.setOption(this.id, this.checked);});
    }

    this.setIsFollowingMeOpt = function () {
        $('#isFollowingMe')[0].value = this.getIsFollowingMeOpt();

        $('#isFollowingMe').on('change', function () {
            $.Options.setOption(this.id, this.value);
        });
    };

    this.getDMCopySelfOpt = function() {
        return $.Options.getOption('dmCopySelf',"enable");
    }
    
    this.setDMCopySelfOpt = function () {
        $('#dmCopySelfOpt select')[0].value = this.getDMCopySelfOpt();

        $('#dmCopySelfOpt select').on('change', function(){
            $.Options.setOption(this.id, this.value);
        });
    }

    this.InitOptions = function() {
        this.soundNotifOptions();
        this.volumeControl();
        this.keysSend();
        this.setLang();
        this.setTheme();
        this.setShowDesktopNotifPostsOpt();
        this.setShowDesktopNotifPostsTimerOpt();
        this.setShowDesktopNotifPostsModalOpt();
        this.setShowDesktopNotifPostsModalTimerOpt();
        this.setShowDesktopNotifMentionsOpt();
        this.setShowDesktopNotifMentionsTimerOpt();
        this.setShowDesktopNotifDMsOpt();
        this.setShowDesktopNotifDMsTimerOpt();
        this.setTestDesktopNotif();
        this.setLineFeedsOpt();
        this.setShowPreviewOpt();
        this.setUnicodeConversionOpt();
        this.setConvertPunctuationsOpt();
        this.setConvertEmotionsOpt();
        this.setConvertSignsOpt();
        this.setConvertFractionsOpt();
        this.setUseProxyOpt();
        this.setUseProxyForImgOnlyOpt();
        this.setSplitPostsOpt();
        this.setHideRepliesOpt();
        this.setHideCloseRTsHourOpt();
        this.setHideCloseRTsOpt();
        this.setFilterLangOpt();
        this.setFilterLangListOpt();
        this.setFilterLangAccuracyOpt();
        this.setFilterLangForPostboardOpt();
        this.setFilterLangForSearchingOpt();
        this.setFilterLangForTopTrendsOpt();
        this.setFilterLangSimulateOpt();
        this.setIsFollowingMeOpt();
        this.setDMCopySelfOpt();
    }

    function setElemValNumeric(elem, mes) {
        //var elem = $(elem_nm);
        if (/^\d+$/.test(elem.value)) {
            elem.style.backgroundColor = '';
            $.Options.setOption(elem.id, elem.value);
            $(elem).next('span').text(mes);
        } else {
            elem.style.backgroundColor = '#f00';
            $(elem).next('span').text(polyglot.t('only numbers are allowed!'));
        }
    };
}

jQuery.Options = new TwisterOptions;

function localizeLabels()
{
    $("label[for=tab_language]").text(polyglot.t("Language"));
    $("label[for=t-2]").text(polyglot.t("Theme"));
    $("label[for=t-3]").text(polyglot.t("Notifications"));
    $("label[for=t-4]").text(polyglot.t("Keys"));
    $("label[for=t-5]").text(polyglot.t("Postboard"));
    $("label[for=t-6]").text(polyglot.t("Users"));
}

$(document).ready(localizeLabels);
