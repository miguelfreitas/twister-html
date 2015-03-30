$(function(){
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
