$(function(){

    $( ".promoted-posts-only").click(function() {
        $(this).text( promotedPostsOnly ? polyglot.t('Switch to Normal posts') : polyglot.t('Switch to Promoted posts') );
    });

});

