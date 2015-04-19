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
        $('#notifyForm select').each(function() {
            this.value = $.Options.getOption(this.id, 'false');
        });
        
        var player = $('#player');
        player[0].pause();
        $('#player').empty();

        $('form#notifyForm').on('change', 'select', function() {
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
        playerVol[0].value = this.getOption(playerVol[0].id, 1);
        $('.volValue').text((playerVol[0].value * 100).toFixed());

        playerVol.on('change', function() {
            $.Options.setOption(this.id, this.value);
            $('#player')[0].volume = (this.value);
            $('.volValue').text((this.value * 100).toFixed());
        });
    }

    this.DMsNotif = function() {
        var sndDM = this.getOption('sndDM', 'false');
        if ( sndDM === 'false') return;
        var player = $('#player');
        $('#player').empty();

        if (player[0].canPlayType('audio/mpeg;')) {
            player.attr('type', 'audio/mpeg');
            player.attr('src', 'sound/'+sndDM+'.mp3');
        } else {
            player.attr('type', 'audio/ogg');
            player.attr('src', 'sound/'+sndDM+'.ogg');
        }
        player[0].volume = this.getOption('playerVol',1);
        player[0].play();
    }

    this.mensNotif = function() {
        var sndMention = this.getOption('sndMention', 'false');
        if (sndMention === 'false') return;
        var player = $('#playerSec');
        $('#playerSec').empty();

        if (player[0].canPlayType('audio/mpeg;')) {
            player.attr('type', 'audio/mpeg');
            player.attr('src', 'sound/'+sndMention+'.mp3');
        } else {
            player.attr('type', 'audio/ogg');
            player.attr('src', 'sound/'+sndMention+'.ogg');
        }
        player[0].volume = this.getOption('playerVol',1);
        player[0].play();
    }

    this.getShowDesktopNotifPostsOpt = function() {
        return this.getOption('showDesktopNotifPosts', 'enable');
    }

    this.setShowDesktopNotifPostsOpt = function () {
        function showDesktopNotifPostsDesc() {
            if ($.Options.getShowDesktopNotifPostsOpt() === 'enable')
                $('#showDesktopNotifPostsDesc').css('display', 'inline');
            else
                $('#showDesktopNotifPostsDesc').css('display', 'none');
        }
        $('#showDesktopNotifPosts').val( this.getShowDesktopNotifPostsOpt() );
        showDesktopNotifPostsDesc();
        $('#showDesktopNotifPosts').on('change', function() {
            $.Options.setOption(this.id, this.value);
            showDesktopNotifPostsDesc();
        });
    }

    this.getShowDesktopNotifPostsTimerOpt = function () {
        return parseInt(this.getOption('showDesktopNotifPostsTimer', '6'));
    }

    this.setShowDesktopNotifPostsTimerOpt = function () {
        $('#showDesktopNotifPostsTimer').val( this.getShowDesktopNotifPostsTimerOpt().toString() );
        $('#showDesktopNotifPostsTimer').on('keyup', function () { setElemValNumeric(this, polyglot.t('second(s)')); });
    }

    this.getShowDesktopNotifPostsModalOpt = function() {
        return this.getOption('showDesktopNotifPostsModal', 'enable');
    }

    this.setShowDesktopNotifPostsModalOpt = function () {
        function showDesktopNotifPostsModalDesc() {
            if ($.Options.getShowDesktopNotifPostsModalOpt() === 'enable')
                $('#showDesktopNotifPostsModalDesc').css('display', 'inline');
            else
                $('#showDesktopNotifPostsModalDesc').css('display', 'none');
        }
        $('#showDesktopNotifPostsModal').val( this.getShowDesktopNotifPostsModalOpt() );
        showDesktopNotifPostsModalDesc();
        $('#showDesktopNotifPostsModal').on('change', function() {
            $.Options.setOption(this.id, this.value);
            showDesktopNotifPostsModalDesc();
        });
    }

    this.getShowDesktopNotifPostsModalTimerOpt = function () {
        return parseInt(this.getOption('showDesktopNotifPostsModalTimer', '6'));
    }

    this.setShowDesktopNotifPostsModalTimerOpt = function () {
        $('#showDesktopNotifPostsModalTimer').val( this.getShowDesktopNotifPostsModalTimerOpt().toString() );
        $('#showDesktopNotifPostsModalTimer').on('keyup', function () { setElemValNumeric(this, polyglot.t('second(s)')); });
    }

    this.getShowDesktopNotifMentionsOpt = function() {
        return this.getOption('showDesktopNotifMentions', 'enable');
    }

    this.setShowDesktopNotifMentionsOpt = function () {
        function showDesktopNotifMentionsDesc() {
            if ($.Options.getShowDesktopNotifMentionsOpt() === 'enable')
                $('#showDesktopNotifMentionsDesc').css('display', 'inline');
            else
                $('#showDesktopNotifMentionsDesc').css('display', 'none');
        }
        $('#showDesktopNotifMentions').val( this.getShowDesktopNotifMentionsOpt() );
        showDesktopNotifMentionsDesc();
        $('#showDesktopNotifMentions').on('change', function() {
            $.Options.setOption(this.id, this.value);
            showDesktopNotifMentionsDesc();
        });
    }

    this.getShowDesktopNotifMentionsTimerOpt = function () {
        return parseInt(this.getOption('showDesktopNotifMentionsTimer', '60'));
    }

    this.setShowDesktopNotifMentionsTimerOpt = function () {
        $('#showDesktopNotifMentionsTimer').val( this.getShowDesktopNotifMentionsTimerOpt().toString() );
        $('#showDesktopNotifMentionsTimer').on('keyup', function () {setElemValNumeric(this, polyglot.t('second(s)'));});
    }

    this.getShowDesktopNotifDMsOpt = function() {
        return this.getOption('showDesktopNotifDMs', 'enable');
    }

    this.setShowDesktopNotifDMsOpt = function () {
        function showDesktopNotifDMsDesc() {
            if ($.Options.getShowDesktopNotifDMsOpt() === 'enable')
                $('#showDesktopNotifDMsDesc').css('display', 'inline');
            else
                $('#showDesktopNotifDMsDesc').css('display', 'none');
        }
        $('#showDesktopNotifDMs').val( this.getShowDesktopNotifDMsOpt() );
        showDesktopNotifDMsDesc();
        $('#showDesktopNotifDMs').on('change', function() {
            $.Options.setOption(this.id, this.value);
            showDesktopNotifDMsDesc();
        });
    }

    this.getShowDesktopNotifDMsTimerOpt = function () {
        return parseInt(this.getOption('showDesktopNotifDMsTimer', '60'));
    }

    this.setShowDesktopNotifDMsTimerOpt = function () {
        $('#showDesktopNotifDMsTimer').val( this.getShowDesktopNotifDMsTimerOpt().toString() );
        $('#showDesktopNotifDMsTimer').on('keyup', function () { setElemValNumeric(this, polyglot.t('second(s)')); });
    }

    this.setTestDesktopNotif = function() {
        $('#testDesktopNotif').on('click', function() {
            $.MAL.showDesktopNotif(false, polyglot.t('notify_desktop_test'), false,'twister_notification_test', false, false, function() { alert(polyglot.t('notify_desktop_perm_denied', {'this_domain': document.domain})) })
        })
    }

    this.keysSendDefault = 'ctrlenter';
    this.keysSend = function() {
        $('#keysOpt select').val( this.getOption('keysSend',this.keysSendDefault) );
        $('#keysOpt select').on('change', function() { $.Options.setOption(this.id, this.value); });
    }

    this.keyEnterToSend = function() {
        return this.getOption('keysSend', this.keysSendDefault) === 'enter';
    }

    this.setLang = function() {
        $('#language').val( this.getOption('locLang', 'auto') );
        $('#language').on('change', function() {
            $.Options.setOption('locLang', $(this).val());
            if($(this).val() != 'auto') {
                twisterRpc("setpreferredspamlang", [$(this).val()]);
            }
            location.reload();
        })
    }

    this.getTheme = function() {
        return this.getOption('theme', 'original');
    }

    this.setTheme = function() {
        $('#theme').val( this.getTheme() )
        $('#theme').on('change', function() {
            $.Options.setOption('theme', $(this).val());
            location.reload();
        });
    }

    this.getLineFeedsOpt = function() {
        return this.getOption('displayLineFeeds', 'disable');
    }

    this.setLineFeedsOpt = function() {
        $('#lineFeedsOpt select').val( this.getLineFeedsOpt() );
        $('#lineFeedsOpt select').on('change', function() { $.Options.setOption(this.id, this.value); });
    }

    this.getShowPreviewOpt = function() {
        return this.getOption('displayPreview', 'disable');
    }

    this.setShowPreviewOpt = function () {
        $('#showPreviewOpt select').val( this.getShowPreviewOpt() );
        $('#showPreviewOpt select').on('change', function() { $.Options.setOption(this.id, this.value); });
    }

    this.getUnicodeConversionOpt = function () {
        return this.getOption('unicodeConversion', 'disable');
    }

    this.setUnicodeConversionOpt = function () {
        $('#unicodeConversion').val( this.getUnicodeConversionOpt() );

        if (this.getUnicodeConversionOpt() === 'custom')
            $('#unicodeConversionOpt .suboptions').css('height', 'auto');

        $('#unicodeConversion').on('change', function () {
            $.Options.setOption(this.id, this.value);
            if (this.value === 'custom')
                $('#unicodeConversionOpt .suboptions').css('height', 'auto');
            else
                $('#unicodeConversionOpt .suboptions').css('height', '0px');
        });
    }

    this.getConvertPunctuationsOpt = function() {
        return this.getOption('convertPunctuationsOpt', false);
    }

    this.setConvertPunctuationsOpt = function () {
        $('#convertPunctuationsOpt').prop('checked', this.getConvertPunctuationsOpt());
        $('#convertPunctuationsOpt').on('change', function() { $.Options.setOption(this.id, this.checked); });
    }

    this.getConvertEmotionsOpt = function() {
        return this.getOption('convertEmotionsOpt', false);
    }

    this.setConvertEmotionsOpt = function () {
        $('#convertEmotionsOpt').prop('checked', this.getConvertEmotionsOpt());
        $('#convertEmotionsOpt').on('change', function() { $.Options.setOption(this.id, this.checked); });
    }

    this.getConvertSignsOpt = function() {
        return this.getOption('convertSignsOpt', false);
    }

    this.setConvertSignsOpt = function () {
        $('#convertSignsOpt').prop('checked', this.getConvertSignsOpt());
        $('#convertSignsOpt').on('change', function() { $.Options.setOption(this.id, this.checked); });
    }

    this.getConvertFractionsOpt = function() {
        return this.getOption('convertFractionsOpt', false);
    }

    this.setConvertFractionsOpt = function () {
        $('#convertFractionsOpt').prop('checked', this.getConvertFractionsOpt());
        $('#convertFractionsOpt').on('change', function() { $.Options.setOption(this.id, this.checked); });
    }

    this.getUseProxyOpt = function () {
        return this.getOption('useProxy', 'disable');
    }

    this.setUseProxyOpt = function () {
        $('#useProxy').val( this.getUseProxyOpt() );

        if (this.getUseProxyOpt() === 'disable')
            $('#useProxyForImgOnly').attr('disabled', 'disabled');

        $('#useProxy').on('change', function () {
            $.Options.setOption(this.id, this.value);
            if (this.value === 'disable')
                $('#useProxyForImgOnly').attr('disabled', 'disabled');
            else
                $('#useProxyForImgOnly').removeAttr('disabled');
        });
    }

    this.getUseProxyForImgOnlyOpt = function () {
        return this.getOption('useProxyForImgOnly', false);
    }

    this.setUseProxyForImgOnlyOpt = function () {
        $('#useProxyForImgOnly').prop('checked', this.getUseProxyForImgOnlyOpt());
        $('#useProxyForImgOnly').on('change', function () { $.Options.setOption(this.id, this.checked); });
    }

    this.getTopTrendsOpt = function() {
        return this.getOption('TopTrends', 'enable');
    }

    this.setTopTrendsOpt = function () {
        function TopTrendsCfg() {
            if ($.Options.getTopTrendsOpt() === 'enable')
                $('#TopTrendsCont').show();
            else
                $('#TopTrendsCont').hide();
        }
        $('#TopTrends').val( this.getTopTrendsOpt() );
        TopTrendsCfg();
        $('#TopTrends').on('change', function() {
            $.Options.setOption(this.id, this.value);
            TopTrendsCfg();
        });
    }

    this.getTopTrendsAutoUpdateOpt = function() {
        return this.getOption('TopTrendsAutoUpdate', 'enable');
    }

    this.setTopTrendsAutoUpdateOpt = function () {
        function TopTrendsAutoUpdateCfg() {
            if ($.Options.getTopTrendsAutoUpdateOpt() === 'enable')
                $('#TopTrendsAutoUpdateOpt').css('display', 'inline');
            else
                $('#TopTrendsAutoUpdateOpt').css('display', 'none');
        }
        $('#TopTrendsAutoUpdate').val( this.getTopTrendsAutoUpdateOpt() );
        TopTrendsAutoUpdateCfg();
        $('#TopTrendsAutoUpdate').on('change', function() {
            $.Options.setOption(this.id, this.value);
            TopTrendsAutoUpdateCfg();
        });
    }

    this.getTopTrendsAutoUpdateTimerOpt = function () {
        return parseInt(this.getOption('TopTrendsAutoUpdateTimer', '120'));
    }

    this.setTopTrendsAutoUpdateTimerOpt = function () {
        $('#TopTrendsAutoUpdateTimer').val( this.getTopTrendsAutoUpdateTimerOpt().toString() );
        $('#TopTrendsAutoUpdateTimer').on('keyup', function () { setElemValNumeric(this, polyglot.t('second(s)')); });
    }

    this.getWhoToFollowOpt = function() {
        return this.getOption('WhoToFollow', 'enable');
    }

    this.setWhoToFollowOpt = function () {
        $('#WhoToFollow').val(this.getWhoToFollowOpt());
        $('#WhoToFollow').on('change', function() { $.Options.setOption(this.id, this.value); });
    }

    this.getSplitPostsOpt = function () {
        return this.getOption('splitPosts', 'disable');
    }

    this.setSplitPostsOpt = function () {
        $('#splitPosts').val( this.getSplitPostsOpt() );
        $('#splitPosts').on('change', function () { $.Options.setOption(this.id, this.value); });
    }

    this.getHideRepliesOpt = function () {
        return this.getOption('hideReplies', 'following');
    }

    this.setHideRepliesOpt = function () {
        $('#hideReplies').val( this.getHideRepliesOpt() );
        $('#hideReplies').on('change', function () { $.Options.setOption(this.id, this.value); });
    }

    this.getHideCloseRTsOpt = function () {
        return this.getOption('hideCloseRTs', 'disable');
    };

    this.setHideCloseRTsOpt = function () {
        function hideCloseRTsCfg() {
            if ($.Options.getHideCloseRTsOpt() === 'disable')
                $('#hideCloseRTsDesc').css('display', 'none');
            else
                $('#hideCloseRTsDesc').css('display', 'inline');
        }
        $('#hideCloseRTs').val( this.getHideCloseRTsOpt() );
        hideCloseRTsCfg();
        $('#hideCloseRTs').on('change', function () {
            $.Options.setOption(this.id, this.value);
            hideCloseRTsCfg();
        });
    };

    this.getHideCloseRTsHourOpt = function () {
        return parseInt(this.getOption('hideCloseRtsHour', '1'));
    };

    this.setHideCloseRTsHourOpt = function () {
        $('#hideCloseRtsHour').val( this.getHideCloseRTsHourOpt().toString() );
        $('#hideCloseRtsHour').on('keyup', function () { setElemValNumeric(this, polyglot.t('hour(s)')); });
    };

    this.getFilterLangOpt = function() {
        return this.getOption('filterLang', 'disable');
    }

    this.setFilterLangOpt = function () {
        function filterLangListCont() {
            if ( $.Options.getFilterLangOpt() !== 'disable' )
                $('#filterLangListCont').css('display', 'block');
            else
                $('#filterLangListCont').css('display', 'none');
        }
        $('#filterLang').val( this.getFilterLangOpt() );
        filterLangListCont();
        $('#filterLang').on('change', function() {
            $.Options.setOption(this.id, this.value);
            filterLangListCont();
        });
    }

    this.getFilterLangListOpt = function () {
        return this.getOption('filterLangList', '').replace(/\s+/g, '').split(/\s*,\s*/);
    }

    this.setFilterLangListOpt = function () {
        $('#filterLangList').val( this.getFilterLangListOpt() );

        $('#filterLangList').on('keyup', function () { $.Options.setOption(this.id, this.value); });
    }

    this.getFilterLangAccuracyOpt = function () {
        return parseFloat(this.getOption('filterLangAccuracy', '0.82'));
    }

    this.setFilterLangAccuracyOpt = function () {
        $('#filterLangAccuracy').val( this.getFilterLangAccuracyOpt() );
        $('#filterLangAccuracyVal').text( this.getFilterLangAccuracyOpt() );
        $('#filterLangAccuracy').on('change', function () {
            $.Options.setOption(this.id, this.value);
            $('#filterLangAccuracyVal').text(this.value);
        });
    }

    this.getFilterLangForPostboardOpt = function () {
        return this.getOption('filterLangForPostboard', true);
    }

    this.setFilterLangForPostboardOpt = function () {
        $('#filterLangForPostboard').prop('checked', this.getFilterLangForPostboardOpt());
        $('#filterLangForPostboard').on('click', function () { $.Options.setOption(this.id, this.checked); });
    }

    this.getFilterLangForSearchingOpt = function () {
        return this.getOption('filterLangForSearching', true);
    }

    this.setFilterLangForSearchingOpt = function () {
        $('#filterLangForSearching').prop('checked', this.getFilterLangForSearchingOpt());
        $('#filterLangForSearching').on('click', function () { $.Options.setOption(this.id, this.checked); });
    }

    this.getFilterLangForTopTrendsOpt = function () {
        return this.getOption('filterLangForTopTrends', true);
    }

    this.setFilterLangForTopTrendsOpt = function () {
        $('#filterLangForTopTrends').prop('checked', this.getFilterLangForTopTrendsOpt());
        $('#filterLangForTopTrends').on('click', function () { $.Options.setOption(this.id, this.checked); });
    }

    this.getFilterLangSimulateOpt = function () {
        return this.getOption('filterLangSimulate', true);
    }

    this.setFilterLangSimulateOpt = function () {
        $('#filterLangSimulate').prop('checked', this.getFilterLangSimulateOpt());
        $('#filterLangSimulate').on('click', function () { $.Options.setOption(this.id, this.checked); });
    }

    this.getIsFollowingMeOpt = function () {
        return this.getOption('isFollowingMe', 'in-profile');
    };

    this.setIsFollowingMeOpt = function () {
        $('#isFollowingMe').val( this.getIsFollowingMeOpt() );
        $('#isFollowingMe').on('change', function () { $.Options.setOption(this.id, this.value); });
    };

    this.getDMCopySelfOpt = function() {
        return this.getOption('dmCopySelf', 'enable');
    }
    
    this.setDMCopySelfOpt = function () {
        $('#dmCopySelfOpt select').val( this.getDMCopySelfOpt() );
        $('#dmCopySelfOpt select').on('change', function() { $.Options.setOption(this.id, this.value); });
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
        this.setTopTrendsAutoUpdateOpt();
        this.setTopTrendsOpt();
        this.setTopTrendsAutoUpdateTimerOpt();
        this.setWhoToFollowOpt();
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
        if (/^\d+$/.test(elem.value) && parseFloat(elem.value) > 0) {
            elem.style.backgroundColor = '';
            $.Options.setOption(elem.id, elem.value);
            $(elem).next('span').text(mes);
        } else {
            elem.style.backgroundColor = '#f00';
            $(elem).next('span').text(polyglot.t('only positive numbers!'));
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
    $("label[for=t-5]").text(polyglot.t("Appearance"));
    $("label[for=t-6]").text(polyglot.t("Users"));
}

$(document).ready(localizeLabels);
