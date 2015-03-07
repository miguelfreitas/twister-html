$(function(){

    $('.modal-close').html('');
    $('.modal-back').html('');
    $('.twister-user-remove').html('');
    $('.profile-card-main').attr('style', '');
    $('img[src$="img/tornado_avatar.png"]').attr("src","theme_nin/img/tornado_avatar.png");
    $('.userMenu-search-profiles button').html('').attr('title',polyglot.t('Follow'));
    $('.mini-profile-actions span').html('');

    $('.post-context').each(function(){
        $(this).prependTo($(this).parent());
    });


    $( '.userMenu-home.current a' ).on( 'click', function() {
        $('html, body').animate({scrollTop:0},300);
        return false
    });

    $( ".promoted-posts-only").click(function() {
    // modify the way promoted posts are shown
        //active promoted posts tab
        $(this).children('.promoted-posts').addClass(promotedPostsOnly ? "active" : "disabled");
        $(this).children('.normal-posts').addClass(promotedPostsOnly ? "disabled" : "active");
        $('#postboard-top').removeClass(promotedPostsOnly ? "show" : "hide");
        //active normal posts
        $(this).children('.promoted-posts').removeClass(promotedPostsOnly ? "disabled" : "active");
        $(this).children('.normal-posts').removeClass(promotedPostsOnly ? "active" : "disabled");
        $('#postboard-top').addClass(promotedPostsOnly ? "hide" : "show");
    });

    $(window).scroll(function(){
        posScroll = $(document).scrollTop();
        if(posScroll >= 250)
            $('.left .post-area-new').slideDown(300);
        else
            $('.left .post-area-new').slideUp(150);
    });

    $(".userMenu-search-profiles .follow")
        .on("eventToggleFollow", function() {
            $(this).text('').attr('title', polyglot.t('Follow'));
        })
        .on("eventToggleUnfollow", function() {
            $(this).text('').attr('title', polyglot.t('Unfollow'));
        });

});

