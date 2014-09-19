$(function(){ 
    
	$('#closeModal').html('');
    $('.profile-card-main').attr('style', '');
    $('img[src$="img/tornado_avatar.png"]').attr("src","theme_nin/img/tornado_avatar.png");
    $('.userMenu-search-profiles button').html('').attr('title','Follow');
    $('.mini-profile-actions span').html('');

	$('.post-context').each(function(){
    	$(this).prependTo($(this).parent());
	});


	$( '.userMenu-home.current a' ).on( 'click', function() { 
        $('html, body').animate({scrollTop:0},300);
        return false
    });

    $(window).scroll(function(){
        posScroll = $(document).scrollTop();
        if(posScroll >= 250)
            $('.left .post-area-new').slideDown(300);
        else 
            $('.left .post-area-new').slideUp(150);
    }); 


});

