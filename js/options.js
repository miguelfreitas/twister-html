$(function() {
	
});

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
        playerVol[0].value = $.Options.getOption(playerVol[0].id, 100);
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
        player[0].volume = $.Options.getOption('playerVol',100);
        player[0].play();
    }

    this.mensNotif = function() {
        var sndMention = $.Options.getOption('sndMention', "false");
        if(sndMention == "false") return;
        var player = $('#player');
        $('#playerSec').empty();

        if (player[0].canPlayType('audio/mpeg;')) {
            player.attr('type', 'audio/mpeg');
            player.attr('src', 'sound/'+sndMention+'.mp3');
        } else {
            player.attr('type', 'audio/ogg');
            player.attr('src', 'sound/'+sndMention+'.ogg');
        }
        player[0].volume = $.Options.getOption('playerVol',100);
        player[0].play();
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

        $('#hideCloseRtsHour').on('keyup', function () {
            if (/^\d+$/.test(this.value)) {
                this.style.backgroundColor = '';
                $.Options.setOption(this.id, this.value);
                $(this).next('span').text(polyglot.t('hour(s)'));
            } else {
                this.style.backgroundColor = '#f00';
                $(this).next('span').text(polyglot.t('only numbers are allowed!'));
            }
        });
    };

    this.getIsFollowingMeOpt = function () {
        return $.Options.getOption('isFollowingMe');
    };

    this.setIsFollowingMeOpt = function () {
        $('#isFollowingMe')[0].value = this.getIsFollowingMeOpt();

        $('#isFollowingMe').on('change', function () {
            $.Options.setOption(this.id, this.value);
        });
    };

    this.InitOptions = function() {
        this.soundNotifOptions();
        this.volumeControl();
        this.keysSend();
        this.setLang();
        this.setTheme();
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
        this.setIsFollowingMeOpt();
    }
}

jQuery.Options = new TwisterOptions;

