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

    this.keysSend = function() {
        $('#keysOpt select')[0].value = $.Options.getOption('keysSend',"ctrlenter");

        $('#keysOpt select').on('change', function(){
            $.Options.setOption(this.id, this.value);
        })
    }
    
    this.keyEnterToSend = function() {
        return $.Options.getOption('keysSend',"enter") == "enter";
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

    this.InitOptions = function() {
        this.soundNotifOptions();
        this.volumeControl();
        this.keysSend();
        this.setLang();
        this.setTheme();
        this.setLineFeedsOpt();
    }
}

jQuery.Options = new TwisterOptions;

