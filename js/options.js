function twisterOptions() {
    this.add({
        name: 'locLang',
        selector: '#language',
        valDefault: 'auto',
        tickMethod: function (elem) {
            if (elem.value !== 'auto')
                twisterRpc('setpreferredspamlang', [elem.value]);
            location.reload();
        },
        tickNotOnInit: 1
    });
    this.add({
        name: 'theme',
        valDefault: 'original',
        tickMethod: function () {location.reload();},
        tickNotOnInit: 1
    });
    this.add({
        name: 'TopTrends',
        valDefault: 'enable',
        tickMethod: function (elem) {
            $('#TopTrendsCont').css('display', (elem.value === 'enable') ? 'block' : 'none');
        }
    });
    this.add({
        name: 'TopTrendsAutoUpdate',
        valDefault: 'enable',
        tickMethod: function (elem) {
            $('#TopTrendsAutoUpdateOpt').css('display', (elem.value === 'enable') ? 'inline' : 'none');
        }
    });
    this.add({
        name: 'TopTrendsAutoUpdateTimer',
        type: 'numeric',
        valDefault: '120',
        valMes: 'second(s)',
        getMethod: function (val) {return parseInt(val);}
    });
    this.add({
        name: 'WhoToFollow',
        valDefault: 'enable'
    });
    this.add({
        name: 'TwistdayReminder',
        valDefault: 'enable',
        tickMethod: function (elem) {
            $('#TwistdayReminderCont').css('display', (elem.value === 'enable') ? 'block' : 'none');
        }
    });
    this.add({
        name: 'TwistdayReminderAutoUpdate',
        valDefault: 'enable',
        tickMethod: function (elem) {
            $('#TwistdayReminderAutoUpdateOpt').css('display', (elem.value === 'enable') ? 'inline' : 'none');
        }
    });
    this.add({
        name: 'TwistdayReminderAutoUpdateTimer',
        type: 'numeric',
        valDefault: '3600',
        valMes: 'second(s)',
        getMethod: function (val) {return parseInt(val);}
    });
    this.add({
        name: 'TwistdayReminderShowUpcoming',
        valDefault: 'enable',
        tickMethod: function (elem) {
            $('#TwistdayReminderShowUpcomingOpt').css('display', (elem.value === 'enable') ? 'inline' : 'none');
        }
    });
    this.add({
        name: 'TwistdayReminderShowUpcomingTimer',
        type: 'numeric',
        valDefault: '72',
        valMes: 'hour(s)',
        getMethod: function (val) {return parseInt(val);}
    });
    this.add({
        name: 'showDesktopNotifPosts',
        valDefault: 'enable',
        tickMethod: function (elem) {
            $('#showDesktopNotifPostsDesc').css('display', (elem.value === 'enable') ? 'inline' : 'none');
        }
    });
    this.add({
        name: 'showDesktopNotifPostsTimer',
        type: 'numeric',
        valDefault: '6',
        valMes: 'second(s)',
        getMethod: function (val) {return parseInt(val);}
    });
    this.add({
        name: 'showDesktopNotifPostsModal',
        valDefault: 'enable',
        tickMethod: function (elem) {
            $('#showDesktopNotifPostsModalDesc').css('display', (elem.value === 'enable') ? 'inline' : 'none');
        }
    });
    this.add({
        name: 'showDesktopNotifPostsModalTimer',
        type: 'numeric',
        valDefault: '6',
        valMes: 'second(s)',
        getMethod: function (val) {return parseInt(val);}
    });
    this.add({
        name: 'showDesktopNotifMentions',
        valDefault: 'enable',
        tickMethod: function (elem) {
            $('#showDesktopNotifMentionsDesc').css('display', (elem.value === 'enable') ? 'inline' : 'none');
        }
    });
    this.add({
        name: 'showDesktopNotifMentionsTimer',
        type: 'numeric',
        valDefault: '60',
        valMes: 'second(s)',
        getMethod: function (val) {return parseInt(val);}
    });
    this.add({
        name: 'showDesktopNotifDMs',
        valDefault: 'enable',
        tickMethod: function (elem) {
            $('#showDesktopNotifDMsDesc').css('display', (elem.value === 'enable') ? 'inline' : 'none');
        }
    });
    this.add({
        name: 'showDesktopNotifDMsTimer',
        type: 'numeric',
        valDefault: '60',
        valMes: 'second(s)',
        getMethod: function (val) {return parseInt(val);}
    });
    this.add({
        name: 'displayLineFeeds',
        valDefault: 'enable'
    });
    this.add({
        name: 'postsMarkout',
        selector: '#optPostsMarkout',
        valDefault: 'apply'
    });
    this.add({
        name: 'displayPreview',  // it's inline image preview  // FIXME we need some mechanism to rename options safely
        valDefault: 'disable'
    });
    this.add({
        name: 'postPreview',
        selector: '#optPostPreview',
        type: 'checkbox',
        valDefault: true
    });
    this.add({
        name: 'unicodeConversion',
        valDefault: 'disable',
        tickMethod: function (elem) {
            $('#unicodeConversionOpt .suboptions').css('height', (elem.value === 'custom') ? 'auto' : '0');
        }
    });
    this.add({
        name: 'convertPunctuationsOpt',
        type: 'checkbox',
        valDefault: false
    });
    this.add({
        name: 'convertEmotionsOpt',
        type: 'checkbox',
        valDefault: false
    });
    this.add({
        name: 'convertSignsOpt',
        type: 'checkbox',
        valDefault: false
    });
    this.add({
        name: 'convertFractionsOpt',
        type: 'checkbox',
        valDefault: false
    });
    this.add({
        name: 'useProxy',
        valDefault: 'disable',
        tickMethod: function (elem) {
            $('#useProxyForImgOnly').attr('disabled', (elem.value === 'disable') ? true : false);
        }
    });
    this.add({
        name: 'useProxyForImgOnly',
        type: 'checkbox',
        valDefault: false
    });
    this.add({
        name: 'splitPosts',
        valDefault: 'disable'
    });
    this.add({
        name: 'isFollowingMe',
        valDefault: 'in-profile'
    });
    this.add({
        name: 'dmCopySelf',
        valDefault: 'enable'
    });
    this.add({
        name: 'hideReplies',
        valDefault: 'following'
    });
    this.add({
        name: 'hideCloseRTs',
        valDefault: 'disable',
        tickMethod: function (elem) {
            $('#hideCloseRTsDesc').css('display', (elem.value === 'show-if') ? 'inline' : 'none');
        }
    });
    this.add({
        name: 'hideCloseRtsHour',
        type: 'numeric',
        valDefault: '1',
        valMes: 'hour(s)',
        getMethod: function (val) {return parseInt(val);}
    });
    this.add({
        name: 'filterLang',
        valDefault: 'disable',
        tickMethod: function (elem) {
            $('#filterLangListCont').css('display', (elem.value === 'disable') ? 'none' : 'block');
        }
    });
    this.add({
        name: 'filterLangList',
        valDefault: '',
        getMethod: function (val) {return val.split(/\s*,\s*/);}
    });
    this.add({
        name: 'filterLangAccuracy',
        valDefault: '0.82',
        getMethod: function (val) {return parseFloat(val);},
        tickMethod: function (elem) {$('#filterLangAccuracyVal').text(elem.value);}
    });
    this.add({
        name: 'filterLangForPostboard',
        type: 'checkbox',
        valDefault: true
    });
    this.add({
        name: 'filterLangForSearching',
        type: 'checkbox',
        valDefault: true
    });
    this.add({
        name: 'filterLangForTopTrends',
        type: 'checkbox',
        valDefault: true
    });
    this.add({
        name: 'filterLangSimulate',
        type: 'checkbox',
        valDefault: true
    });
    this.add({
        name: 'keysSend',
        valDefault: 'ctrlenter'
    });
    this.add({
        name: 'sndMention',
        valDefault: 'false',
        tickMethod: function () {$.MAL.soundNotifyMentions();},  // FIXME it's wrapped because $.MAL may be not loaded yet; $.MAL methods should be static
        tickNotOnInit: 1
    });
    this.add({
        name: 'sndDM',
        valDefault: 'false',
        tickMethod: function () {$.MAL.soundNotifyDM();},  // FIXME it's wrapped because $.MAL may be not loaded yet; $.MAL methods should be static
        tickNotOnInit: 1
    });
    this.add({
        name: 'playerVol',
        valDefault: 1,
        getMethod: function (val) {return parseFloat(val);},
        tickMethod: function (elem) {$('.volValue').text((elem.value * 100).toFixed());}
    });
}

twisterOptions.prototype.add = function (option) {
    if (option.name && !this[option.name])
        this[option.name] = new twisterOption(option);
};

twisterOptions.prototype.initControls = function () {
    for (var option in this) {
        if (typeof this[option] === 'object') {
            var elem = $(this[option].option.selector);
            if (elem.length) {
                if (elem.attr('type') && elem.attr('type').toLowerCase() === 'checkbox')
                    elem.prop('checked', /^\s*1|true\s*$/i.test(this[option].val))
                        .on('change', (this[option].tick).bind(this[option]))
                    ;
                else {
                    elem.val(this[option].val)
                        .on((elem[0].tagName === 'SELECT') ? 'change' : 'input', (this[option].tick).bind(this[option]))
                    ;
                }
                if (!this[option].option.tickNotOnInit && typeof this[option].option.tickMethod === 'function')
                        this[option].option.tickMethod(elem[0]);
            } else
                console.warn('cannot find option \''+option+'\' controls, selector: '+this[option].option.selector);
        }
    }

    $('#testDesktopNotif').on('click', function() {
        $.MAL.showDesktopNotif(false, polyglot.t('notify_desktop_test'), false,'twister_notification_test', false, false, function() { alert(polyglot.t('notify_desktop_perm_denied', {'this_domain': document.domain})) })
    });
};

function twisterOption(option) {
    this.option = option;

    if (!option.selector)
        this.option.selector = '#' + option.name;
    if (option.valRaw) {
        this.set(option.valRaw);
    } else {
        var keyName = 'options:' + option.name;
        if ($.localStorage.isSet(keyName))
            this.option.valRaw = $.localStorage.get(keyName);
        else
            this.option.valRaw = option.valDefault;
        this.val = (this.option.getMethod) ? this.option.getMethod(this.option.valRaw) : this.option.valRaw;
    }
}

twisterOption.prototype.val = undefined;

twisterOption.prototype.set = function (val) {
    this.val = (this.option.getMethod) ? this.option.getMethod(val) : val;
    this.option.valRaw = val;

    $.localStorage.set('options:' + this.option.name, val);
};

twisterOption.prototype.tick = function (event) {
    if (this.option.type !== 'numeric' || checkForNumeric(event.target)) {
        this.set((this.option.type === 'checkbox') ? event.target.checked : event.target.value);
        if (this.option.valMes)
            $(event.target).next('span').text(polyglot.t(this.option.valMes));
        if (typeof this.option.tickMethod === 'function')
            this.option.tickMethod(event.target);
    }
};

jQuery.Options = new twisterOptions();


function checkForNumeric(elem) {
    if (/^\d+\.?\d*$/.test(elem.value) && parseFloat(elem.value) > 0) {
        elem.style.backgroundColor = '';
        return true;
    } else {
        elem.style.backgroundColor = '#f00';
        $(elem).next('span').text(polyglot.t('only positive numbers!'));
        return false;
    }
}
