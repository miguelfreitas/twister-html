// interface_localization.js
//
// uses JavaScript to detect browser language
// uses Polyglot.js ( https://github.com/airbnb/polyglot.js ) to translate interface

// translators: add your language code here such as "es" for Spanish, "ru" for Russian
var knownLanguages = ["en","nl","ru"];

// detect language with JavaScript
var preferredLanguage = window.navigator.userLanguage || window.navigator.language || "en";
if(knownLanguages.indexOf(preferredLanguage) > -1){
  // en for en or similar
  preferredLanguage = preferredLanguage;
}
else if(knownLanguages.indexOf(preferredLanguage.split("-")[0]) > -1){
  // en for en-US or similar
  preferredLanguage = preferredLanguage.split("-")[0];
}
else{
  // did not find match
  preferredLanguage = "en";
}

// set up Polyglot
polyglot = new Polyglot();
var wordset = {};

if(preferredLanguage == "en"){
    polyglot.locale("en");
    wordset = {
      "Actions ▼": "Actions ▼",
      "Active DHT nodes:": "Active DHT nodes: ",
      "Add DNS": "Add DNS",
      "Add peer": "Add peer",
      "ajax_error": "Ajax error: %{error}", // JavaScript error
      "All users publicly followed by": "All users publicly followed by",
      "Available": "Available", // username is available
      "Block chain information": "Block chain information",
      "Block chain is up-to-date, twister is ready to use!": "Block chain is up-to-date, twister is ready to use!",
      "Block generation": "Block generation ",
      "Cancel": "Cancel",
      "Change user": "Change user",
      "Checking...": "Checking...", // checking if username is available
      "Collapse": "Collapse", // smaller view of a post
      "Configure block generation": "Configure block generation",
      "Connections:": "Connections: ", // to network
      "Connection lost.": "Connection lost.",
      "days": "%{smart_count} day |||| %{smart_count} days",
      "Detailed information": "Detailed information",
      "DHT network down.": "DHT network down.",
      "Direct Messages": "Direct Messages",
      "Disable": "Disable",
      "Display mentions to @": "Display mentions to @",
      "Display retransmissions": "Display retransmissions",
      "DNS to obtain list of peers:": "DNS to obtain list of peers:",
      "downloading_block_chain": "Downloading block chain, please wait before continuing (block chain is %{days} days old).",
      "download_posts_status": "Downloaded %{portion} posts", // Downloaded 10/30 posts
      "Enable": "Enable",
      "error": "Error: %{error}",
      "error_connecting_to_daemon": "Error connecting to local twister daemon.",
      "Error in 'createwalletuser' RPC.": "Error in 'createwalletuser' RPC.",
      "Error in 'importprivkey'": "Error in 'importprivkey' RPC: %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Error in 'sendnewusertransaction' RPC.",
      "Expand": "Expand", // larger view of a post
      "Favorite": "Favorite",
      "File APIs not supported in this browser.": "File APIs not supported in this browser.",
      "Follow": "Follow",
      "Followed by": "Followed by",
      "followed_by": "Followed by %{username}",
      "Followers": "Followers",
      "Following": "Following",
      "Following users": "Following users",
      "Force connection to peer:": "Force connection to peer:",
      "General information": "General information",
      "Generate blocks (send promoted messages)": "Generate blocks (send promoted messages)",
      "Home": "Home", // homepage
      "hours": "%{smart_count} hour |||| %{smart_count} hours",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Internal error: lastPostId unknown (following yourself may fix!)",
      "Known peers:": "Known peers: ",
      "Last block is ahead of your computer time, check your clock.": "Last block is ahead of your computer time, check your clock.",
      "mentions_at": "Mentions @%{user}",
      "minutes": "%{smart_count} minute |||| %{smart_count} minutes",
      "Must be 16 characters or less.": "Must be 16 characters or less.", // username
      "Network": "Network",
      "Network config": "Network config",
      "Network status": "Network status",
      "New direct message...": "New direct message...",
      "New Post...": "New Post...",
      "new_posts": "%{smart_count} new post |||| %{smart_count} new posts",
      "nobody": "nobody", // used to promote a post without attaching the user
      "Not available": "Not available", // username is not available
      "Number of blocks in block chain:": "Number of blocks in block chain: ",
      "Number of CPUs to use": "Number of CPUs to use ",
      "Only alphanumeric and underscore allowed.": "Only alphanumeric and underscore allowed.",
      "peer address": "peer address",
      "Private": "Private",
      "Profile": "Profile",
      "Postboard": "Postboard",
      "post": "post", // verb - button to post a message
      "Post to promote:": "Post to promote: ",
      "Posts": "Posts",
      "propagating_nickname": "Propagating nickname %{username} to the network...",
      "Public": "Public",
      "Refresh": "Refresh",
      "retransmit_this": "Retransmit this post to your followers?",
      "Reply": "Reply",
      "Reply...": "Reply...",
      "reply_to": "Reply to %{fullname}",
      "Retransmit": "Retransmit",
      "Retransmits": "Retransmits",
      "Retransmitted by": "Retransmitted by",
      "search": "search",
      "seconds": "%{smart_count} second |||| %{smart_count} seconds",
      "send": "send",
      "Send post with username": "Send post with username ",
      "Sent Direct Message": "Sent Direct Message",
      "Sent Post to @": "Sent Post to @",      
      "Setup account": "Setup account",
      "switch_to_network": "Local daemon is not connected to the network or\n" +
                "block chain is outdated. If you stay in this page\n" +
                "your actions may not work.\n" +
                "Do you want to check Network Status page instead?",
      "The File APIs are not fully supported in this browser.": "The File APIs are not fully supported in this browser.",
      "time_ago": "%{time} ago", // 5 minutes ago
      "Time of the last block:": "Time of the last block: ",
      "Type message here": "Type message here",
      "Unfollow": "Unfollow",
      "Update": "Update",
      "Updating status...": "Updating status...", // status of block chain
      "user_not_yet_accepted": "Other peers have not yet accepted this new user.\n" +
                "Unfortunately it is not possible to save profile\n" +
                "or send any posts in this state.\n\n" +
                "Please wait a few minutes to continue.\n\n" +
                "The 'Save Changes' will be automatically enabled\n" +
                "when the process completes. (I promise this is\n"+
                "the last time you will have to wait before using\n" +
                "twister).\n\n" +
                "Tip: choose your avatar in the meantime!",
      "users_mentions": "Mentions of @%{username}",
      "users_profile": "%{username}'s Profile",
      "username_undefined": "Username undefined, login required.",
      "View": "View",
      "View All": "View All",
      "Who to Follow": "Who to Follow",
      "Your message was sent!": "Your message was sent!"
    };
}

if(preferredLanguage == "nl"){
    polyglot.locale("nl");
    wordset = {
      "Actions ▼": "Acties ▼",
      "Active DHT nodes:": "Actieve DHT nodes: ",
      "Add DNS": "DNS toevoegen",
      "Add peer": "Peer toevoegen",
      "ajax_error": "Ajax error: %{error}", // JavaScript error
      "All users publicly followed by": "Alle gebruikers openbaarlijk gevolgd door",
      "Available": "Beschikbaar", // username is available
      "Block chain information": "Block chain informatie",
      "Block chain is up-to-date, twister is ready to use!": "Block chain is up-to-date, twister is klaar voor gebruik!",
      "Block generation": "Block productie",
      "Cancel": "Annuleren",
      "Change user": "Gebruiker wijzigen",
      "Checking...": "Controleren...", // checking if username is available
      "Collapse": "Uitklappen", // smaller view of a post
      "Configure block generation": "Block productie configureren",
      "Connections:": "Connecties: ", // to network
      "Connection lost.": "Verbinding kwijt.",
      "days": "%{smart_count} dag |||| %{smart_count} dagen",
      "Detailed information": "Gedetailleerde informatie",
      "DHT network down.": "DHT netwerk down.",
      "Direct Messages": "Privéberichten",
      "Disable": "Uitschakelen",
      "Display mentions to @": "Toon vermeldingen voor @",
      "Display retransmissions": "Toon retransmissions",
      "DNS to obtain list of peers:": "DNS om peers lijst op te halen:",
      "downloading_block_chain": "Bezig met downloaden block chain, wacht a.u.b. voordat je doorgaat (block chain is %{days} dagen oud).",
      "download_posts_status": "%{portion} berichten gedownload", // Downloaded 10/30 posts
      "Enable": "Activeren",
      "error": "Error: %{error}",
      "error_connecting_to_daemon": "Error connecting to local twister daemon.",
      "Error in 'createwalletuser' RPC.": "Error in 'createwalletuser' RPC.",
      "Error in 'importprivkey'": "Error in 'importprivkey' RPC: %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Error in 'sendnewusertransaction' RPC.",
      "Expand": "Uitklappen", // larger view of a post
      "Favorite": "Favoriet",
      "File APIs not supported in this browser.": "File APIs worden nie ondersteund in deze browser.",
      "Follow": "Volgen",
      "Followed by": "Gevolgd door",
      "followed_by": "Gevolgd door %{username}",
      "Followers": "Volgers",
      "Following": "Volgend",
      "Following users": "Volgende gebruikers",
      "Force connection to peer:": "Forceer connectie met peer:",
      "General information": "Algemene informatie",
      "Generate blocks (send promoted messages)": "Blocks genereren (verstuur promotie berichten)",
      "Home": "Home", // homepage
      "hours": "%{smart_count} uur |||| %{smart_count} uren",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Internal error: lastPostId unknown (following yourself may fix!)",
      "Known peers:": "Bekende peers: ",
      "Last block is ahead of your computer time, check your clock.": "Last block is ahead of your computer time, check your clock.",
      "mentions_at": "Vermeldingen @%{user}",
      "minutes": "%{smart_count} minuut |||| %{smart_count} minuten",
      "Must be 16 characters or less.": "Moet 16 tekens zijn, of minder.", // username
      "Network": "Netwerk",
      "Network config": "Netwerk configuratie",
      "Network status": "Netwerkstatus",
      "New direct message...": "Nieuw privébericht...",
      "New Post...": "Nieuw bericht...",
      "new_posts": "%{smart_count} nieuw bericht |||| %{smart_count} nieuwe berichten",
      "nobody": "nobody", // used to promote a post without attaching the user
      "Not available": "Niet beschikbaar", // username is not available
      "Number of blocks in block chain:": "Aantal blocks in block chain: ",
      "Number of CPUs to use": "Aantal CPUs om te gebruiken ",
      "Only alphanumeric and underscore allowed.": "Alleen alphanumeriek en underscore toegestaan.",
      "peer address": "peer adres",
      "Private": "Privé",
      "Profile": "Profiel",
      "Postboard": "Postboard",
      "post": "post", // verb - button to post a message
      "Post to promote:": "Bericht om te promoten: ",
      "Posts": "Berichten",
      "propagating_nickname": "Gebruikersnaam %{username} verspreiden op het netwerk...",
      "Public": "Publiek",
      "Refresh": "Vernieuwen",
      "retransmit_this": "Retransmit dit bericht naar je volgers?",
      "Reply": "Beantwoorden",
      "Reply...": "Beantwoord...",
      "reply_to": "Beantwoord %{fullname}",
      "Retransmit": "Retransmit",
      "Retransmits": "Retransmits",
      "Retransmitted by": "Retransmitted door",
      "search": "zoeken",
      "seconds": "%{smart_count} seconde |||| %{smart_count} seconden",
      "send": "Verstuur",
      "Send post with username": "Verstuur bericht met gebruikersnaam ",
      "Sent Direct Message": "Verstuur privébericht",
      "Sent Post to @": "Verstuur bericht naar @",      
      "Setup account": "Account instellingen",
      "switch_to_network": "Local daemon is not connected to the network or\n" +
                "block chain is outdated. If you stay in this page\n" +
                "your actions may not work.\n" +
                "Do you want to check Network Status page instead?",
      "The File APIs are not fully supported in this browser.": "The File APIs are not fully supported in this browser.",
      "time_ago": "%{time} geleden", // 5 minutes ago
      "Time of the last block:": "Tijd van de laatste block: ",
      "Type message here": "Type bericht hier",
      "Unfollow": "Ontvolgen",
      "Update": "Update",
      "Updating status...": "Status aan het updaten...", // status of block chain
      "user_not_yet_accepted": "Other peers have not yet accepted this new user.\n" +
                "Unfortunately it is not possible to save profile\n" +
                "or send any posts in this state.\n\n" +
                "Please wait a few minutes to continue.\n\n" +
                "The 'Save Changes' will be automatically enabled\n" +
                "when the process completes. (I promise this is\n"+
                "the last time you will have to wait before using\n" +
                "twister).\n\n" +
                "Tip: choose your avatar in the meantime!",
      "users_mentions": "Vermeldingen voor @%{username}",
      "users_profile": "%{username}'s profiel",
      "username_undefined": "Gebruikersnaam niet opgegeven, inloggen verplicht.",
      "View": "Toon",
      "View All": "Toon alles",
      "Who to Follow": "Wie volgen?",
      "Your message was sent!": "Je bericht is verzonden!"
    };
}

// translators: sample adding a language
if(preferredLanguage == "ru"){
    // polyglot.locale() is used to support plurals
    // locales currently known by Polyglot.js:
    /*
      chinese:   ['id', 'ja', 'ko', 'ms', 'th', 'tr', 'zh'],
      german:    ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
      french:    ['fr', 'tl'],
      russian:   ['hr', 'ru'],
      czech:     ['cs'],
      polish:    ['pl'],
      icelandic: ['is']
    */
    
    polyglot.locale("ru");

    // list of the English words and translations
    wordset = {
      "Actions ▼": "Действия ▼" // , comma after each match except the last
      "Active DHT nodes:": "Активные узлы DHT: ",
      "Add DNS": "Добавить DNS",
      "Add peer": "Добавить пира",
      "ajax_error": "Ajax ошибка: %{error}", // JavaScript error
      "All users publicly followed by": "Все публичные пользователи на которых подписан",
      "Available": "Доступно", // username is available
      "Block chain information": "Информация цепочки блоков",
      "Block chain is up-to-date, twister is ready to use!": "Цепочка блоков обновлена, twister готов к использованию!",
      "Block generation": "Майнинг блоков ",
      "Cancel": "Отменить",
      "Change user": "Сменить пользователя",
      "Checking...": "Проверка...", // checking if username is available
      "Collapse": "Свернуть", // smaller view of a post
      "Configure block generation": "Настройка майнинга",
      "Connections:": "Подключения: ", // to network
      "Connection lost.": "Соединение с сетью было потеряно.",
      "days": "%{smart_count} день |||| %{smart_count} дней",
      "Detailed information": "Подробная информация",
      "DHT network down.": "Недоступна DHT сеть.",
      "Direct Messages": "Личные сообщения",
      "Disable": "Отключено",
      "Display mentions to @": "Показать ответы для @",
      "Display retransmissions": "Показать репосты",
      "DNS to obtain list of peers:": "DNS адресс для получения пиров:",
      "downloading_block_chain": "Загрузка цепочки блоков, пожалуйста подождите, (Цепочка блоков устарела на %{days} дней).",
      "download_posts_status": "Загружено %{portion} постов", // Downloaded 10/30 posts
      "Enable": "Включено",
      "error": "Ошибка: %{error}",
      "error_connecting_to_daemon": "Ошибка подключения к локальному демону twisterd.",
      "Error in 'createwalletuser' RPC.": "Ошибка при обращении к RPC - при попытке выполнить 'createwalletuser'.",
      "Error in 'importprivkey'": "Ошибка при обращении к RPC - при попытке выполнить 'importprivkey' %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Ошибка при обращении к RPC - при попытке выполнить 'sendnewusertransaction'",
      "Expand": "Развернуть", // larger view of a post
      "Favorite": "Избранное",
      "File APIs not supported in this browser.": "Ваш браузер не поддерживает File APIs.",
      "Follow": "Подписаться",
      "Followed by": "Следят",
      "followed_by": "%{username} подписан",
      "Followers": "Подписчиков",
      "Following": "Подписанных",
      "Following users": "Подписанные пользователи",
      "Force connection to peer:": "Принудительно подключиться к пиру:",
      "General information": "Основное",
      "Generate blocks (send promoted messages)": "Майнинг (отправка рекламных сообщений)",
      "Home": "Главная", // homepage
      "hours": "%{smart_count} час |||| %{smart_count} часов",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Внутренняя ошибка: lastPostId неизвестен (Попробуйте подписаться сами на себя, это должно помоч!)",
      "Known peers:": "Известные пиры: ",
      "Last block is ahead of your computer time, check your clock.": "Последний полученный блок опережает время вашего компьютера, проверьте правильно ли работают часы.",
      "mentions_at": "Упоминания @%{user}",
      "minutes": "%{smart_count} минута |||| %{smart_count} минут",
      "Must be 16 characters or less.": "Должно быть не более 16 знаков.", // username
      "Network": "Сеть",
      "Network config": "Настройка сети",
      "Network status": "Состояние сети",
      "New direct message...": "Новое личное сообщение...",
      "New Post...": "Новый пост...",
      "new_posts": "%{smart_count} новый пост |||| %{smart_count} новых постов",
      "nobody": "Никто", // used to promote a post without attaching the user
      "Not available": "Недоступно", // username is not available
      "Number of blocks in block chain:": "Количество блоков в цепочке: ",
      "Number of CPUs to use": "Сколько использовать ядер процессора",
      "Only alphanumeric and underscore allowed.": "Разрешены только латинские буквы и цифры.",
      "peer address": "адрес пира",
      "Private": "Приватный",
      "Profile": "Профиль",
      "Postboard": "Лента",
      "post": "отправить", // verb - button to post a message
      "Post to promote:": "Рекламное сообщение: ",
      "Posts": "Посты",
      "propagating_nickname": "Распространяю информацию о регистрации %{username} в сеть...",
      "Public": "Публичный",
      "Refresh": "Обновить",
      "retransmit_this": "Перепостить данное сообщение своим подписчикам?",
      "Reply": "Ответить",
      "Reply...": "Ответить...",
      "reply_to": "Ответить %{fullname}",
      "Retransmit": "Перепостить",
      "Retransmits": "Репосты",
      "Retransmitted by": "Перепощено ",
      "search": "поиск",
      "seconds": "%{smart_count} секунда |||| %{smart_count} секунд",
      "send": "отправить",
      "Send post with username": "Отправить сообщение от имени",
      "Sent Direct Message": "Отправить личное сообщение",
      "Sent Post to @": "Отправить сообщение для @",      
      "Setup account": "Настроить аккаунт",
      "switch_to_network": "Локальный демон не подключен к сети или\n" +
                "цепочка блоков устарела. Если вы останитесь на этой странице\n" +
                "ваши действия могут быть не выполнеными.\n" +
                "Не хотите перейти на страницу настройки сети?",
      "The File APIs are not fully supported in this browser.": "The File APIs are not fully supported in this browser.",
      "time_ago": "%{time} назад", // 5 minutes ago
      "Time of the last block:": "Время последнего блока: ",
      "Type message here": "Введите ваше сообщение тут",
      "Unfollow": "Отписаться",
      "Update": "Обновить",
      "Updating status...": "Обновление информации...", // status of block chain
      "user_not_yet_accepted": "Другие участники сети еще не получили информацию о новом пользователе.\n" +
                "К сожалению, сейчас вы не можете редактировать ваш профиль\n" +
                "или отправлять сообщение.\n\n" +
                "Пожалуйста подождите пару минут.\n\n" +
                "Кнопка 'Сохранить' будет доступна автоматически того,\n" +
                "когда процес регистрации будет завершен. (Я обещаю, это\n"+
                "последний раз, когда вы ждете перед использованием\n" +
                "twister'a).\n\n" +
                "Хозяйке на заметку: Сейчас вы можете выбрать аватар!",
      "users_mentions": "Ответ от @%{username}",
      "users_profile": "%{username}'s профиль",
      "username_undefined": "Имя пользователя не определено, требуеться войти.",
      "View": "Просмотреть",
      "View All": "Просмотреть Всё",
      "Who to Follow": "Кого почитать",
      "Your message was sent!": "Ваше сообщение было отправлено!"
    };
}

// uncomment to see all translated words replaced with filler
//for(var word in wordset){
//  wordset[word] = "AAAA";
//}

polyglot.extend(wordset);

// Text from HTML and not JavaScript is selected and translated at $(document).ready
// Add selectors here to translate the text and placeholders inside new UI
var fixedLabels = [
  // An easy way to include new items in translation is to add the "label" class
  ".label",

  // navbar and home
  "button",
  ".userMenu > ul > li > a",
  ".postboard-news",
  ".post-area-new textarea",
  ".refresh-users, .view-all-users",
  ".who-to-follow h3",
  ".userMenu-search-field",
  "a.dropdown-menu-item, a.direct-messages",
  ".post-interactions span",
  ".post-expand",
  ".post-context span",
  ".post-stats .stat-count span",
  ".postboard h2",

  // following page
  ".following h2",
  ".mini-profile-actions span, .mini-profile-actions li",

  // network page
  ".network h2, .network h3",
  ".network ul li span",
  ".network label",
  ".network textarea, .network input, .network option",
];
$(document).ready(function(){
  for(var i=0;i<fixedLabels.length;i++){
    var elems = $(fixedLabels[i]);
    for(var e=0;e<elems.length;e++){
      var content = $.trim($(elems[e]).text());
      if(wordset[content]){
        $(elems[e]).text( polyglot.t(content) );
      }
      else{
        // uncomment to see translations not found
        //console.log(content);
      }
      if(typeof $(elems[e]).attr("placeholder") != "undefined" && wordset[ $(elems[e]).attr("placeholder")]){
        $(elems[e]).attr("placeholder", polyglot.t( $(elems[e]).attr("placeholder") ) );
      }
    }
  }
});
