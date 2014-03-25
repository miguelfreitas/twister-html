$(function(){
	$('.dropdown-menu').on('keydown', function(e){
		e = event || window.event;
		e.stopPropagation();
	})
	$('.post-text').on('click', 'a', function(e){
		e.stopPropagation();
	});
	$('#showqr').on('click', function(){
		if($('#qrcode img')[0]) return;
         var skey = document.getElementById('skey').innerText;
         new QRCode(document.getElementById("qrcode"), skey);
    });
    $('.tox-ctc').on('click', function(){
    	window.prompt('Press Ctrl/Cmd+C to copy then Enter to close', $(this).attr('data'))
    })
    $('.bitmessage-ctc').on('click', function(){
    	window.prompt('Press Ctrl/Cmd+C to copy then Enter to close', $(this).attr('data'))
    })
})


	function dhtIndicatorBg(){
		var bgcolor = '';
			  if(twisterDhtNodes <= 20){bgcolor = '#770900'
		}else if(twisterDhtNodes <= 60){bgcolor = '#773400'
		}else if(twisterDhtNodes <= 90){bgcolor = '#774c00'
		}else if(twisterDhtNodes <= 120){bgcolor = '#776400'
		}else if(twisterDhtNodes <= 150){bgcolor = '#707500'
		}else if(twisterDhtNodes <= 180){bgcolor = '#3f6900'
		}else if(twisterDhtNodes <= 210){bgcolor = '#005f15'
		}else if(twisterDhtNodes >= 250){bgcolor = '#009922'
		}
		$('.userMenu-dhtindicator').animate({'background-color': bgcolor });
	};
	setTimeout(dhtIndicatorBg, 300);
	setTimeout(function() {setInterval(dhtIndicatorBg, 2000)}, 400);

function modalDMIntr() {
	$(".cancel").on('click', function(event){
		if(!$(event.target).hasClass("cancel")) return;
		if($(".modal-content").attr("style") != undefined){$(".modal-content").removeAttr("style")};
		$('.modal-back').css('display', 'none');
	});
	$('.modal-back').on('click', function(){
		if($('.modal-content .direct-messages-list')[0]) return;
		directMessagesPopup();
		$(".modal-content").removeAttr("style");
	});
};

function mensAutocomplete() {
	var suggests = [];
	
	for(var i = 0; i < followingUsers.length; i++){
		if(followingUsers[i] == localStorage.defaultScreenName) continue;
		suggests.push(followingUsers[i]);
	}
	suggests.reverse();
	$('textarea').textcomplete([
    { // html
        mentions: suggests,
        match: /\B@(\w*)$/,
        search: function (term, callback) {
            callback($.map(this.mentions, function (mention) {
                return mention.indexOf(term) === 0 ? mention : null;
            }));
        },
        index: 1,
        replace: function (mention) {
            return '@' + mention + ' ';
        }
    }
])
}

function changeStyle() {
	var style, profile, menu;
	var theme = $.Options.getTheme();
	if(theme == 'original')
	{
		style = 'css/style.css';
		profile = 'css/profile.css';
		menu = '.original_menu';
		$(".userMenu-dhtindicator").hide();
	}else 
	{
		style = 'css/calm/style.css';
		profile = 'css/calm/profile.css';
		menu = '.calm_menu';
	}
	$('#stylecss').attr('href', style);
	$('#profilecss').attr('href', profile);
	setTimeout(function(){$(menu).removeAttr('style')}, 0);
}

function homeIntInit () {
	modalDMIntr ();
	setTimeout(mensAutocomplete, 800);
}
