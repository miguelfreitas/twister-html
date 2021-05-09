$(window).on('resize', function () {
    testRightSide();
    reAppendModules();
});

$(window).on('load', function () {
    testRightSide();
});

$(function () {
    testRightSide();
    reOrganizeTemplates();

    // indirect eval call in hope to execute code globally
    (1, eval)(postToElem.toString().replace(/postContext.append\(twister\.tmpl\.postRtBy/,
        'postContext.prependTo(postContext.parent()).append(twister.tmpl.postRtBy'));

    (1, eval)(openModal.toString().replace(/window_scrollY = window\.pageYOffset;/, '')
        .replace(/\$\('body'\)\.css\('overflow', 'hidden'\);/, ''));

    $('.userMenu-home.current a').on('click', function () {
        $('html, body').animate({scrollTop:0},300);
        return false
    });

    // modify the way promoted posts are shown
    $('.promoted-posts-only').on('click', function () {
        //active promoted posts tab
        $(this).children('.promoted-posts').addClass(promotedPostsOnly ? "active" : "disabled");
        $(this).children('.normal-posts').addClass(promotedPostsOnly ? "disabled" : "active");
        $('#postboard-top').removeClass(promotedPostsOnly ? "show" : "hide");
        //active normal posts
        $(this).children('.promoted-posts').removeClass(promotedPostsOnly ? "disabled" : "active");
        $(this).children('.normal-posts').removeClass(promotedPostsOnly ? "active" : "disabled");
        $('#postboard-top').addClass(promotedPostsOnly ? "hide" : "show");
    });

    if (/\/options.html$/i.test(document.location))
        localizeLabels();

    $(window).on('scroll', function () {
        window_scrollY = window.pageYOffset; // declare variable here for screen not to scroll when closing modals
    });

    // Collapse all .post.open
    var allPostButton = $('<li></li>').addClass('userMenu-collapsePosts').append('<a href="#">Collapse All</a>');
    $('.mini-profile-indicators').append(allPostButton);
    $(allPostButton).children('a').on('click', function(e) {
        var allPost =  $('#posts .post.open');
        allPost.each(function(){
        if (e.button === 0 && window.getSelection() == 0)
            postExpandFunction(e, $(this));
        });
        return false
    });
});

function testRightSide() { // if rightside is empty, don't show it and engarge postboard
    var container = $('.dashboard.right');

    if (container.children('.module:not(:empty)').length) {
        container.show();
        $('.wrapper .postboard').removeClass('large');
    } else {
        container.hide();
        $('.wrapper .postboard').addClass('large');
    }
}

function reOrganizeTemplates() { // for nin's templating

    reAppendModules();

    //removes unused html
    $('.modal-close').html('');
    $('.modal-back').html('');
    $('.twister-user-remove').html('');
    $('.profile-card-main').attr('style', '');
    $('.mini-profile-actions span').html('');

    //group chat
    $('.mini-profile-indicators li.userMenu-groupmessages a span:last-child ').html('Group Msg');

    $('button.invite').html('invite');
    $('button.leave').html('leave');
    $('.secret-key').attr('title', 'copy secret key');

    //re-organizes
    $('.promoted-posts-only').detach().appendTo($('.left .mini-profile'));
    $('.mini-profile .open-following-page').parent('li').detach().appendTo($('.mini-profile-indicators'));
    $('.mini-profile-indicators').detach().insertAfter($('.dashboard.left .profile-data'));

    twister.tmpl.accountMC.find('.alias')
        .insertBefore(twister.tmpl.accountMC.find('.avatar'));

    //loader
    newLoader()

    // new post button
    $('<li></li>')
        .addClass('userMenu-newPost')
        .prependTo('.mini-profile-indicators');
    $('<a href="#">New post</a>')
        .addClass('ion')
        .addClass('ion-plus')
        .appendTo('.userMenu-newPost')
        .on('click', function () {
            if(!$('.mini-profile .post-area').hasClass('display')) {$('.mini-profile .post-area').addClass('display');}
            else  {$('.mini-profile .post-area').removeClass('display');}
            return false;
    });

    // new post prompt
    $('<div><h3>New post</h3><span class="modal-close prompt-close"></span></div>')
        .addClass('modal-header')
        .prependTo('.mini-profile .post-area');

    $('.mini-profile .post-area .post-submit').on('click', function () {
        $('.mini-profile .post-area').removeClass('display');
    });
    $('.mini-profile .post-area .modal-close').on('click', function () {
        $('.mini-profile .post-area').removeClass('display');
    });

    // button "follow" in search
    // not very nice but works
    $('li:not(.twister-user) button.follow').html('+').attr('title',polyglot.t('Follow'));
    $('li:not(.twister-user) button.follow')
        .on("eventToggleFollow", function() {
            $(this).text('+').attr('title', polyglot.t('Follow'));
        })
        .on("eventToggleUnfollow", function() {
            $(this).text('-').attr('title', polyglot.t('Unfollow'));
        });
}

// Close new post prompt with esc key
$(document).on('keyup', function (e) {
    if (e.keyCode == 27) {
        $('.mini-profile .post-area').removeClass('display');
        closeModal();
    }
});

function reAppendModules() { // avoid w1200 things
    $('.dashboard.right')
        .append($('.module.toptrends'))
        .append($('.module.who-to-follow'))
        .append($('.module.twistday-reminder'))
        .append($('.module.new-users'))
    ;
}

function newLoader() { // create divs for new loader
    $('<div></div>').appendTo('.postboard-loading');
    $('<div></div>').appendTo('.postboard-loading');
    $('<div></div>').appendTo('.postboard-loading');
}

function localizeLabels() {
    $('label.tabs').each(function (i, elem) {
        var elem = $(elem);
        elem.text(polyglot.t(elem.text()));
    });
}
