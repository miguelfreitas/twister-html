// interface_localization.js
//
// uses JavaScript to detect browser language
// uses Polyglot.js ( https://github.com/airbnb/polyglot.js ) to translate interface

// translators: add your language code here such as "es" for Spanish, "ru" for Russian
var knownLanguages = ["en","nl","it","fr","ru","de","zh","ja"];

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
      "Your message was sent!": "Your message was sent!",
      "twister login": "twister login",
      "Existing local users": "Existing local users",
      "Or...": "Or...",
      "Create a new user": "Create a new user",
      "Login": "Login",
      "Check availability": "Check availability",
      "Create this nickname": "Create this nickname",
      "Type nickname here": "Type nickname here",
      "Import secret key": "Import secret key",
      "52-characters secret": "52-characters secret",
      "With nickname": "With nickname",
      "Import key": "Import key",
      "Client Version:": "Client Version:",
      "Mining difficulty:": "Mining difficulty:",
      "Block generation status": "Block generation status",
      "Current hash rate:": "Current hash rate:",
      "Terminate Daemon:": "Terminate Daemon:",
      "Exit": "Exit",
      "Save Changes": "Save Changes",
      "Secret key:": "Secret key:"
    };
}

if(preferredLanguage == "zh"){
    polyglot.locale("zh");
    wordset = {
      "Actions ▼": "操作 ▼",
      "Active DHT nodes:": "活动的DHT节点： ",
      "Add DNS": "添加DNS",
      "Add peer": "添加节点",
      "ajax_error": "Ajax错误: %{error}", // JavaScript error
      "All users publicly followed by": "所有用户均被关注",
      "Available": "可用", // username is available
      "Block chain information": "块链信息",
      "Block chain is up-to-date, twister is ready to use!": "块链已经更新，Twister已经可以使用！",
      "Block generation": "块生成器 ",
      "Cancel": "取消",
      "Change user": "切换用户",
      "Checking...": "检查中...", // checking if username is available
      "Collapse": "Collapse", // smaller view of a post
      "Configure block generation": "配置块生成器",
      "Connections:": "连接数：", // to network
      "Connection lost.": "链接中断。",
      "days": "%{smart_count} 天",
      "Detailed information": "详细信息",
      "DHT network down.": "DHT网络中断。",
      "Direct Messages": "即时消息",
      "Disable": "关闭",
      "Display mentions to @": "显示@",
      "Display retransmissions": "显示转发",
      "DNS to obtain list of peers:": "获取节点列表的DNS：",
      "downloading_block_chain": "下载块链中，请等待下载完成（块链已经落后 %{days} 天）。",
      "download_posts_status": "已下载 %{portion} 推文", // Downloaded 10/30 posts
      "Enable": "开启",
      "error": "错误：%{error}",
      "error_connecting_to_daemon": "连接本地Twister守护进程错误",
      "Error in 'createwalletuser' RPC.": "PRC 'createwalletuser' 错误",
      "Error in 'importprivkey'": "'importprivkey' 错误 RPC: %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "RPC 'sendnewusertransaction' 错误。",
      "Expand": "扩展", // larger view of a post
      "Favorite": "收藏",
      "File APIs not supported in this browser.": "这个浏览器不支持文件APIs",
      "Follow": "关注",
      "Followed by": "被关注",
      "followed_by": "被 %{username} 关注",
      "Followers": "粉丝",
      "Following": "关注中",
      "Following users": "关注的人",
      "Force connection to peer:": "强制连接到节点：",
      "General information": "常规信息",
      "Generate blocks (send promoted messages)": "生成快（发送上行信息）",
      "Home": "主页", // homepage
      "hours": "%{smart_count} hour |||| %{smart_count} 小时",
      "Internal error: lastPostId unknown (following yourself may fix!)": "内部错误：最后推文Id位置（尝试关注你自己进行修复！）",
      "Known peers:": "已知节点：",
      "Last block is ahead of your computer time, check your clock.": "最后的块已经慢于你的系统时间，请检查你的系统时间。",
      "mentions_at": "提到 @%{user}",
      "minutes": "%{smart_count} 分钟",
      "Must be 16 characters or less.": "必须少于16个字符", // username
      "Network": "网络",
      "Network config": "网络配置",
      "Network status": "网络状态",
      "New direct message...": "新的即时信息...",
      "New Post...": "新推文...",
      "new_posts": "%{smart_count} 新推文",
      "nobody": "nobody", // used to promote a post without attaching the user
      "Not available": "用户名不可用", // username is not available
      "Number of blocks in block chain:": "块链中的块数：",
      "Number of CPUs to use": "使用CPU数目 ",
      "Only alphanumeric and underscore allowed.": "只允许字母和下划线",
      "peer address": "节点地址",
      "Private": "私人",
      "Profile": "个人信息",
      "Postboard": "信息流",
      "post": "发送", // verb - button to post a message
      "Post to promote:": "上行信息内容：",
      "Posts": "推文",
      "propagating_nickname": "Propagating nickname %{username} to the network...",
      "Public": "公共",
      "Refresh": "刷新",
      "retransmit_this": "转发推文给你的粉丝？",
      "Reply": "回复",
      "Reply...": "回复...",
      "reply_to": "回复 %{fullname}",
      "Retransmit": "转发",
      "Retransmits": "转发",
      "Retransmitted by": "转发于",
      "search": "搜索",
      "seconds": "%{smart_count} 秒",
      "send": "发送",
      "Send post with username": "发送推文的用户名 ",
      "Sent Direct Message": "发送即时消息",
      "Sent Post to @": "发送推文 @",
      "Setup account": "设置帐号",
      "switch_to_network": "本地守护进程没有连接网络或\n" +
        "块链已经过时。如果你留着此页\n" +
        "你的操作将不会生效\n" +
        "你要马上跳转到网络状态页吗？",
      "The File APIs are not fully supported in this browser.": "这个浏览器不能完全支持文件APIs",
      "time_ago": "%{time} 之前", // 5 minutes ago
      "Time of the last block:": "最新块的时间：",
      "Type message here": "输入你的消息内容",
      "Unfollow": "取消关注",
      "Update": "更新",
      "Updating status...": "更新状态中...", // status of block chain
      "user_not_yet_accepted": "其他节点还没有接受新用户。\n" +
        "很抱歉，现在你还不能保存你的个人简介\n" +
        "或发送新的推文。\n\n" +
        "请稍等几分钟再试试。\n\n" +
        "当节点接受用户操作完成后\n" +
        "“保存”将会自动转换为可以。（我保证这是\n"+
        "在你使用Twister前的最后一次等待。\n\n" +
        "提示：现在先选好你的头像！ ",
      "users_mentions": "提到 @%{username}",
      "users_profile": "%{username} 的简介",
      "username_undefined": "用户名未设置，请先登录！",
      "View": "查看",
      "View All": "查看全部",
      "Who to Follow": "推荐关注",
      "Your message was sent!": "你的信息已经发送！",
      "twister login": "登录Twister",
      "Existing local users": "已有本地用户",
      "Or...": "或...",
      "Create a new user": "创建一个新用户",
      "Login": "登录",
      "Check availability": "检查是否可用",
      "Create this nickname": "使用这个昵称",
      "Type nickname here": "输入你的昵称",
      "Import secret key": "导入密钥",
      "52-characters secret": "52位密钥串",
      "With nickname": "With nickname",
      "Import key": "导入密钥",
      "Client Version:": "客户端版本：",
      "Mining difficulty:": "挖矿难度：",
      "Block generation status": "块链状态",
      "Current hash rate:": "当前hash速率：",
      "Terminate Daemon:": "断开守护进程数：",
      "Exit": "退出",
      "Save Changes": "保存设置",
      "Secret key:": "密钥："
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
      "search": "Zoeken",
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
      "Your message was sent!": "Je bericht is verzonden!",
      "twister login": "twister login",
      "Existing local users": "Bestaande lokale gebruikers",
      "Or...": "Of...",
      "Create a new user": "Maak een nieuwe gebruiker aan",
      "Login": "Inloggen",
      "Check availability": "Controleer beschikbaarheid",
      "Create this nickname": "Maak deze gebruiker aan",
      "Type nickname here": "Gebruikersnaam",
      "Import secret key": "Importeer geheime sleutel",
      "52-characters secret": "52-tekens geheim",
      "With nickname": "Met gebruikersnaam",
      "Import key": "Importeer sleutel",
      "Client Version:": "Client versie:",
      "Mining difficulty:": "Mining moeilijkheid:",
      "Block generation status": "Block genereer status",
      "Current hash rate:": "Huidige hash snelheid:",
      "Terminate Daemon:": "Daemon beëindigen",
      "Exit": "Beëindigen",
      "Save Changes": "Opslaan",
      "Secret key:": "Geheime sleutel:"
    };
}

if(preferredLanguage == "it"){
    polyglot.locale("it");
    wordset = {
      "Actions ▼": "Azioni ▼",
      "Active DHT nodes:": "Nodi DHT attivi:",
      "Add DNS": "Connetti DNS",
      "Add peer": "Connetti nodo",
      "ajax_error": "Errore AJAX: %{error}", // JavaScript error
      "All users publicly followed by": "Utenti seguiti pubblicamente da",
      "Available": "Disponibile", // username is available
      "Block chain information": "Informazioni sulla catena di blocchi",
      "Block chain is up-to-date, twister is ready to use!": "Catena di blocchi aggiornata, Twister è pronto per l'uso!",
      "Block generation": "Generatore di blocchi:",
      "Cancel": "Cancella",
      "Change user": "Cambia utente",
      "Checking...": "Controllo in corso...", // checking if username is available
      "Collapse": "Chiudi", // smaller view of a post
      "Configure block generation": "Configura generatore di blocchi",
      "Connections:": "Connessioni: ", // to network
      "Connection lost.": "Connessione interrotta.",
      "days": "%{smart_count} giorno |||| %{smart_count} giorni",
      "Detailed information": "Informazioni dettagliate",
      "DHT network down.": "DHT network inaccessibile.",
      "Direct Messages": "Messaggi Diretti",
      "Disable": "Disabilitato",
      "Display mentions to @": "Mostra le menzioni di @",
      "Display retransmissions": "Mostra Ripubblicazioni",
      "DNS to obtain list of peers:": "DNS per la lista dei nodi:",
      "downloading_block_chain": "Scaricamento della catena di blocchi in corso, attendere prego (la catena risale a %{days} giorni fa).",
      "download_posts_status": "Scaricati %{portion} messaggi", // Downloaded 10/30 posts
      "Enable": "Attivato",
      "error": "Errore: %{error}",
      "error_connecting_to_daemon": "Errore nella connessione al servizio Twister locale.",
      "Error in 'createwalletuser' RPC.": "Errore in 'createwalletuser' RPC.",
      "Error in 'importprivkey'": "Errore in 'importprivkey' RPC: %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Errore in 'sendnewusertransaction' RPC.",
      "Expand": "Espandi", // larger view of a post
      "Favorite": "Preferito",
      "File APIs not supported in this browser.": "File APIs non supportati in questo browser.",
      "Follow": "Segui",
      "Followed by": "Seguito da",
      "followed_by": "Seguiti da %{username}",
      "Followers": "Lettori",
      "Following": "Seguiti",
      "Following users": "Utenti seguiti",
      "Force connection to peer:": "Forza connessione al nodo:",
      "General information": "Informazioni",
      "Generate blocks (send promoted messages)": "Genera blocchi (invia messaggi pubblicitari)",
      "Home": "Twister", // homepage -- no direct translation in Italian...?
      "hours": "%{smart_count} ora |||| %{smart_count} ore",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Errore interno: lastPostId sconosciuto (prova a seguire te stesso per risolvere!)",
      "Known peers:": "Nodi conosciuti: ",
      "Last block is ahead of your computer time, check your clock.": "L'ultimo blocco è più recente del tuo orario, controlla l'orologio di sistema.",
      "mentions_at": "Chi menziona @%{user}",
      "minutes": "%{smart_count} minuto |||| %{smart_count} minuti",
      "Must be 16 characters or less.": "Massimo 16 caratteri.", // username
      "Network": "Rete",
      "Network config": "Configurazione della rete",
      "Network status": "Status della rete",
      "New direct message...": "Nuovo messaggio diretto...",
      "New Post...": "Nuovo messaggio...",
      "new_posts": "%{smart_count} nuovo messaggio |||| %{smart_count} nuovi messaggi",
      "nobody": "nessuno", // used to promote a post without attaching the user
      "Not available": "Non disponibile", // username is not available
      "Number of blocks in block chain:": "Numero di blocchi nella catena: ",
      "Number of CPUs to use": "Numero di processori da usare:",
      "Only alphanumeric and underscore allowed.": "Sono permessi solo caratteri alfanumerici e '_'",
      "peer address": "Indirizzo del nodo",
      "Private": "Privato",
      "Profile": "Profilo",
      "Postboard": "Bacheca",
      "post": "Invia", // verb - button to post a message
      "Post to promote:": "Messaggio pubblicitario: ",
      "Posts": "Messaggi",
      "propagating_nickname": "Propagazione sul network del nome %{username} in corso...",
      "Public": "Pubblico",
      "Refresh": "Ricarica",
      "retransmit_this": "Ripubblica questo post ai tuoi lettori?",
      "Reply": "Rispondi",
      "Reply...": "Rispondi...",
      "reply_to": "Rispondi a %{fullname}",
      "Retransmit": "Ripubblica",
      "Retransmits": "Ripubblicati",
      "Retransmitted by": "Ripubblicato da",
      "search": "Cerca",
      "seconds": "%{smart_count} secondo |||| %{smart_count} secondi",
      "send": "Invia",
      "Send post with username": "Pubblica come utente ",
      "Sent Direct Message": "Messaggi Diretti inviati",
      "Sent Post to @": "Messaggi inviati a @",
      "Setup account": "Configurazione Utente",
      "switch_to_network": "Il servizio locale non è connesso alla rete Twister o la catena di blocchi è vecchia.\n" +
                "Se rimani su questa pagina, Twister potrebbe non funzionare.\n" +
                "Vuoi controllare lo stato della rete Twister, invece?",
      "The File APIs are not fully supported in this browser.": "Le API File non sono interamente supportate da questo browser.",
      "time_ago": "%{time} fa", // 5 minutes ago
      "Time of the last block:": "Orario del blocco più recente: ",
      "Type message here": "Scrivi qui",
      "Unfollow": "Smetti di seguire",
      "Update": "Aggiorna",
      "Updating status...": "Aggiornamento in corso...", // status of block chain
      "user_not_yet_accepted": "Gli altri nodi non hanno ancora accettato il nuovo utente.\n" +
                "Al momento non puoi salvare il profilo o spedire messaggi.\n" +
                "Attendi qualche minuto prima di continuare.\n\n" +
                "Please wait a few minutes to continue.\n\n" +
                "Il pulsante 'Salva modifiche' sarà abilitato automaticamente appena il processo sarà completato.\n" +
                "(Prometto che è l'ultima attesa prima di poter usare Twister!).\n\n" +
                "Suggerimento: nel frattempo, trova un'immagine da usare come avatar!",
      "users_mentions": "Menzioni di @%{username}",
      "users_profile": "Profilo di %{username}",
      "username_undefined": "Utente non specificato, è necessario il login.",
      "View": "Vedi",
      "View All": "Mostra tutti",
      "Who to Follow": "Chi seguire?",
      "Your message was sent!": "Il messaggio è stato inviato!",
      "twister login": "twister login",
      "Existing local users": "Existing local users",
      "Or...": "Or...",
      "Create a new user": "Create a new user",
      "Login": "Login",
      "Check availability": "Check availability",
      "Create this nickname": "Create this nickname",
      "Type nickname here": "Type nickname here",
      "Import secret key": "Import secret key",
      "52-characters secret": "52-characters secret",
      "With nickname": "With nickname",
      "Import key": "Import key",
      "Client Version:": "Client Version:",
      "Mining difficulty:": "Mining difficulty:",
      "Block generation status": "Block generation status",
      "Current hash rate:": "Current hash rate:",
      "Terminate Daemon:": "Terminate Daemon:",
      "Exit": "Exit",
      "Save Changes": "Save Changes",
      "Secret key:": "Secret key:"
    };
}


if(preferredLanguage == "fr"){
    polyglot.locale("fr");
    wordset = {
      "Actions ▼": "Actions ▼",
      "Active DHT nodes:": "Noeuds DHT actifs: ",
      "Add DNS": "Ajouter un DNS",
      "Add peer": "Ajouter un pair",
      "ajax_error": "Erreur ajax: %{error}", // JavaScript error
      "All users publicly followed by": "Tous les utilisateurs suivis publiquement par",
      "Available": "Disponible", // username is available
      "Block chain information": "Informations à propos de la chaîne de blocs",
      "Block chain is up-to-date, twister is ready to use!": "La chaîne de blocs est à jour, Twister est maintenant fonctionnel!",
      "Block generation": "Production de blocs",
      "Cancel": "Annuler",
      "Change user": "Changer d'utilisateur",
      "Checking...": "Vérification...", // checking if username is available
      "Collapse": "Fermer", // smaller view of a post
      "Configure block generation": "Configuration de la production de blocs",
      "Connections:": "Connexions: ", // to network
      "Connection lost.": "Connexion perdue.",
      "days": "%{smart_count} jour |||| %{smart_count} jours",
      "Detailed information": "Informations détaillées",
      "DHT network down.": "Panne du réseau DHT.",
      "Direct Messages": "Messages directs",
      "Disable": "Désactiver",
      "Display mentions to @": "Afficher les mentions pour @",
      "Display retransmissions": "Afficher les retransmissions",
      "DNS to obtain list of peers:": "DNS pour obtenir la liste des pairs:",
      "downloading_block_chain": "Téléchargement de la chaîne de blocs, s'il vous plaît attendre avant de continuer (la chaîne de blocs a %{days} jours de retard).",
      "download_posts_status": "%{portion} billets téléchargés", // Downloaded 10/30 posts
      "Enable": "Activer",
      "error": "Erreur: %{error}",
      "error_connecting_to_daemon": "Erreur de connection, impossible de joindre le démon Twister.",
      "Error in 'createwalletuser' RPC.": "Erreur RPC dans 'createwalletuser'.",
      "Error in 'importprivkey'": "Erreur RPC dans 'importprivkey': %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Error RPC dans 'sendnewusertransaction'.",
      "Expand": "Ouvrir", // larger view of a post
      "Favorite": "Favori",
      "File APIs not supported in this browser.": "L'API de fichiers n'est pas pris en charge dans votre navigateur.",
      "Follow": "Suivre",
      "Followed by": "Suivi par",
      "followed_by": "Suivi par %{username}",
      "Followers": "Followers",
      "Following": "Following",
      "Following users": "Following users",
      "Force connection to peer:": "Forcer la connection à un pair:",
      "General information": "Informations générales",
      "Generate blocks (send promoted messages)": "Produire des blocs (envoyer des messages promus)",
      "Home": "Début", // homepage
      "hours": "%{smart_count} heure |||| %{smart_count} heures",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Erreur interne: lastPostId inconnu",
      "Known peers:": "Pairs connus: ",
      "Last block is ahead of your computer time, check your clock.": "Le dernier bloc est en avance sur le l'heure de votre machine, vérifiez votre horloge.",
      "mentions_at": "Mentions @%{user}",
      "minutes": "%{smart_count} minute |||| %{smart_count} minutes",
      "Must be 16 characters or less.": "Doit contenir de 16 caractères ou moins.", // username
      "Network": "Réseau",
      "Network config": "Configuration réseau",
      "Network status": "Etat du réseau",
      "New direct message...": "Nouveau message direct...",
      "New Post...": "Nouveau billet...",
      "new_posts": "%{smart_count} nouveau billet |||| %{smart_count} nouveaux billets",
      "nobody": "nobody", // used to promote a post without attaching the user
      "Not available": "Non disponible", // username is not available
      "Number of blocks in block chain:": "Nombre de blocs dans la chaîne de blocs: ",
      "Number of CPUs to use": "Nombre de processeurs à utiliser",
      "Only alphanumeric and underscore allowed.": "Seulement les caractères alphanumérique et la barre de soulignement sont permis.",
      "peer address": "adresse des pairs",
      "Private": "Privé",
      "Profile": "Profil",
      "Postboard": "Billets",
      "post": "envoyer", // verb - button to post a message
      "Post to promote:": "Billet à promouvoir: ",
      "Posts": "Posts",
      "propagating_nickname": "Multiplication de votre pseudo %{username} sur le réseau...",
      "Public": "Public",
      "Refresh": "Actualiser",
      "retransmit_this": "Retransmettre ce billet à tes followers?",
      "Reply": "Répondre",
      "Reply...": "Répondre...",
      "reply_to": "Répondre à %{fullname}",
      "Retransmit": "Retransmission",
      "Retransmits": "Retransmissions",
      "Retransmitted by": "Retransmis par",
      "search": "recherche",
      "seconds": "%{smart_count} seconde |||| %{smart_count} secondes",
      "send": "envoyer",
      "Send post with username": "Envoyer le billet avec le pseudo",
      "Sent Direct Message": "Message direct envoyé",
      "Sent Post to @": "Envoyé un billet à @",
      "Setup account": "Configuration du compte",
      "switch_to_network": "Le démon local n'est pas connecté au réseau ou\n" +
                "la chaîne de blocs n'est pas à jour. Si vous restez dans cette page\n" +
                "vos actions peuvent ne pas fonctionner.\n" +
                "Voulez-vous consulter la page d'état du réseau au lieu?",
      "The File APIs are not fully supported in this browser.": "L'API de fichier n'est pas entièrement pris en charge dans votre navigateur.",
      "time_ago": "Il y a %{time}", // 5 minutes ago
      "Time of the last block:": "Heure du dernier bloc: ",
      "Type message here": "Tapez votre message ici",
      "Unfollow": "Unfollow",
      "Update": "Mettre à jour",
      "Updating status...": "Mise à jour du statut...", // status of block chain
      "user_not_yet_accepted": "Les autres pairs n'ont pas encore accepté ce nouvel utilisateur.\n" +
                "Malheureusement, il n'est pas possible d'enregistrer le profil\n" +
                "ou envoyer des billets dans cet état.\n\n" +
                "S'il vous plaît attendre quelques minutes avant de continuer.\n\n" +
                "L'action 'enregistrer' sera automatiquement activé\n" +
                "lorsque le processus sera terminé. (Je vous promets que\n"+
                "c'est la dernière fois que vous devrez attendre avant d'utiliser\n" +
                "Twister).\n\n" +
                "Astuce: choisissez votre avatar entre temps!",
      "users_mentions": "Mentions de @%{username}",
      "users_profile": "Profil de %{username}",
      "username_undefined": "Nom d'utilisateur indéfini, login requis.",
      "View": "Voir",
      "View All": "Voir tous",
      "Who to Follow": "Qui suivre",
      "Your message was sent!": "Votre message a été envoyé!",
      "twister login": "twister login",
      "Existing local users": "Existing local users",
      "Or...": "Or...",
      "Create a new user": "Create a new user",
      "Login": "Login",
      "Check availability": "Check availability",
      "Create this nickname": "Create this nickname",
      "Type nickname here": "Type nickname here",
      "Import secret key": "Import secret key",
      "52-characters secret": "52-characters secret",
      "With nickname": "With nickname",
      "Import key": "Import key",
      "Client Version:": "Client Version:",
      "Mining difficulty:": "Mining difficulty:",
      "Block generation status": "Block generation status",
      "Current hash rate:": "Current hash rate:",
      "Terminate Daemon:": "Terminate Daemon:",
      "Exit": "Exit",
      "Save Changes": "Save Changes",
      "Secret key:": "Secret key:"
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
       "Actions ▼": "Действия ▼", // , comma after each match except the last
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
       "Connections:": "Соединений: ", // to network
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
       "error_connecting_to_daemon": "Ошибка  к локальному демону twisterd.",
       "Error in 'createwalletuser' RPC.": "Ошибка при обращении к RPC - при попытке выполнить 'createwalletuser'.",
       "Error in 'importprivkey'": "Ошибка при обращении к RPC - при попытке выполнить 'importprivkey' %{rpc}",
       "Error in 'sendnewusertransaction' RPC.": "Ошибка при обращении к RPC - при попытке выполнить 'sendnewusertransaction'",
       "Expand": "Развернуть", // larger view of a post
       "Favorite": "Избранное",
       "File APIs not supported in this browser.": "Ваш браузер не поддерживает File APIs.",
       "Follow": "Подписаться",
       "Followed by": "Подписчик у",
       "followed_by": "%{username} подписан",
       "Followers": "Читателей",
       "Following": "Читаемых",
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
       "Your message was sent!": "Ваше сообщение было отправлено!",
       "twister login": "Вход в twister",
       "Existing local users": "Уже зарегистрированные",
       "Or...": "Или...",
       "Create a new user": "Зарегистрировать нового пользователя",
       "Login": "Войти",
       "Check availability": "Проверить на доступность",
       "Create this nickname": "Зарегистировать этот ник",
       "Type nickname here": "Введите ваш ник тут",
       "Import secret key": "Импортировать секретный ключ",
       "52-characters secret": "52-значный ключ",
       "With nickname": "С от логина",
       "Import key": "Импортировать ключ",
       "Client Version:": "Версия клиента:",
       "Mining difficulty:": "Сложность майнинга:",
       "Block generation status": "Статус майнинга блоков",
       "Current hash rate:": "Текущая скорость хэширования:",
       "Terminate Daemon:": "Остановить twister:",
       "Exit": "Выход",
       "Save Changes": "Сохранить изменения",
       "Secret key:": "Секретный ключ:"
    };
}

if(preferredLanguage == "de"){
    polyglot.locale("de");
    wordset = {
      "Actions ▼": "Actions ▼",
      "Active DHT nodes:": "Aktive DHT-Nodes: ",
      "Add DNS": "DNS hinzufügen",
      "Add peer": "Peer hinzufügen",
      "ajax_error": "Ajax error: %{error}", // JavaScript error
      "All users publicly followed by": "Alle öffentlich gefolgten Benutzer von",
      "Available": "Verfügbar", // username is available
      "Block chain information": "Block-Chain Informationen",
      "Block chain is up-to-date, twister is ready to use!": "Block-Chain ist aktuell, twister ist benutzbar!",
      "Block generation": "Block-Generierung ",
      "Cancel": "Abbrechen",
      "Change user": "Benutzer wechseln",
      "Checking...": "Überprüfe...", // checking if username is available
      "Collapse": "Einklappen", // smaller view of a post
      "Configure block generation": "Block-Generierung einstellen",
      "Connections:": "Verbindungen: ", // to network
      "Connection lost.": "Verbindung verloren.",
      "days": "%{smart_count} Tag |||| %{smart_count} Tage",
      "Detailed information": "Detaillierte Informationen",
      "DHT network down.": "DHT-Netzwerk nicht verfügbar.",
      "Direct Messages": "Direktnachrichten",
      "Disable": "Deaktivieren",
      "Display mentions to @": "Zeige Erwähnungen von @", //Ist das richtig? Ich weiß nicht, in welchem Zusammenhang das benutzt wird.
      "Display retransmissions": "Weiterleitungen anzeigen",
      "DNS to obtain list of peers:": "DNS um Peer-Liste abzurufen:",
      "downloading_block_chain": "Block-Chain wird heruntergeladen, bitte warten (Block-Chain ist %{days} Tage alt).",
      "download_posts_status": "%{portion} Posts heruntergeladen", // Downloaded 10/30 posts
      "Enable": "Aktivieren",
      "error": "Fehler: %{error}",
      "error_connecting_to_daemon": "Fehler beim Verbinden zum lokalen twister-daemon.",
      "Error in 'createwalletuser' RPC.": "Fehler in 'createwalletuser' RPC.",
      "Error in 'importprivkey'": "Fehler in 'importprivkey' RPC: %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Fehler in 'sendnewusertransaction' RPC.",
      "Expand": "Ausklappen", // larger view of a post
      "Favorite": "Favorisieren",
      "File APIs not supported in this browser.": "File APIs werden von diesem Browser nicht unterstützt.",
      "Follow": "Folgen",
      "Followed by": "Gefolgt von",
      "followed_by": "Gefolgt von %{username}",
      "Followers": "Followers",
      "Following": "Folgt",
      "Following users": "Folgt Benutzern",
      "Force connection to peer:": "Ertzwinge Verbindung zu Peer:",
      "General information": "Generelle Informationen",
      "Generate blocks (send promoted messages)": "Blöcke generieren (Promoted-Messages senden)",
      "Home": "Home", // homepage
      "hours": "%{smart_count} Stunde |||| %{smart_count} Stunden",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Internen Fehler: lastPostId unbekannt (Dir selbst volgen kann den Fehler beheben!)",
      "Known peers:": "Bekannte Peers: ",
      "Last block is ahead of your computer time, check your clock.": "Letzter Block ist deiner Computerzeit voraus, überprüfe deine Uhrzeit.",
      "mentions_at": "Erwähnt @%{user}",
      "minutes": "%{smart_count} Minute |||| %{smart_count} Minuten",
      "Must be 16 characters or less.": "Darf höchstens 16 Zeichen lang sein.", // username
      "Network": "Netzwerk",
      "Network config": "Netzwerkeinstellungen",
      "Network status": "Netzwerkstatus",
      "New direct message...": "Neue Direktnachricht...",
      "New Post...": "Neuer Post...",
      "new_posts": "%{smart_count} neuer Post |||| %{smart_count} neue Posts",
      "nobody": "nobody", // used to promote a post without attaching the user
      "Not available": "Nicht verfügbar", // username is not available
      "Number of blocks in block chain:": "Anzahl der Blöcke in der Block-Chain: ",
      "Number of CPUs to use": "Anzahl der zu benutzenden CPU's ",
      "Only alphanumeric and underscore allowed.": "Nur Buchstaben, Zahlen und Unterstrich erlaubt.",
      "peer address": "Peer-Adresse",
      "Private": "Privat",
      "Profile": "Profil",
      "Postboard": "Postboard",
      "post": "senden", // verb - button to post a message
      "Post to promote:": "Post zum senden: ",
      "Posts": "Posts",
      "propagating_nickname": "Mache nickname %{username} dem Netzwerk bekannt...",
      "Public": "Öffentlich",
      "Refresh": "Erneuern",
      "retransmit_this": "Diesen Post an deine Follower weiterleiten?",
      "Reply": "Antworten",
      "Reply...": "Antworten...",
      "reply_to": "%{fullname} antworten",
      "Retransmit": "Weiterleiten",
      "Retransmits": "Weiterleitungen",
      "Retransmitted by": "Weitergeleitet von",
      "search": "suchen",
      "seconds": "%{smart_count} Sekunde |||| %{smart_count} Sekunden",
      "send": "senden",
      "Send post with username": "Sende Post mit Benutzernamen ",
      "Sent Direct Message": "Direktnachricht senden",
      "Sent Post to @": "Sende Post an @",
      "Setup account": "Accounteinstellungen",
      "switch_to_network": "Lokaler daemon ist nicht mit dem Netzwerk verbunden oder\n" +
                "Block-Chain ist veraltet. Wenn du auf dieser Seite bleibst\n" +
                "können deine Handlungen nicht funktionieren.\n" +
                "Möchtest du stattdessen den Netzwerkstatus überprüfen?",
      "The File APIs are not fully supported in this browser.": "Die File-API's werden von diesem Browser nicht vollständig unterstützt.",
      "time_ago": "vor %{time}", // 5 minutes ago
      "Time of the last block:": "Zeit des letzten Blocks: ",
      "Type message here": "Nachricht hier eingeben",
      "Unfollow": "Unfollow",
      "Update": "Aktualisieren",
      "Updating status...": "Status wird aktualisiert...", // status of block chain
      "user_not_yet_accepted": "Andere Peers haben diesen Benutzter noch nicht akzeptiert.\n" +
                "Leider ist es nicht möglich, das Profil zu speichern\n" +
                "oder Nachrichten zu senden.\n\n" +
                "Bitte warten ein paar Minuten, um fortzufahen.\n\n" +
                "'Änderungen speichern' wird automatisch aktiviert\n" +
                "wenn der Prozess abgeschlossen ist. (Ich verspreche,\n"+
                "das ist das letzte Mal, dass du warten musst, bevor\n" +
                "du twister benutzten kannst).\n\n" +
                "Tip: Wähle in der Zwischenzeit deinen Avatar aus!",
      "users_mentions": "Erwähnungen von @%{username}",
      "users_profile": "%{username}'s Profil",
      "username_undefined": "Benutzername nicht gesetzt, Login nötig.",
      "View": "Ansehen",
      "View All": "Alle ansehen",
      "Who to Follow": "Wem Folgen?",
      "Your message was sent!": "Deine Nachricht wurde gesendet!",
      "twister login": "twister login",
      "Existing local users": "Existierende lokale Benutzer",
      "Or...": "Oder...",
      "Create a new user": "Neuen Benutzer erstellen",
      "Login": "Einloggen",
      "Check availability": "Verfügbarkeit überprüfen",
      "Create this nickname": "Nichnamen erstellen",
      "Type nickname here": "Nicknamen hier eingeben",
      "Import secret key": "Privaten Schlüssel hier importieren",
      "52-characters secret": "52 Zeichen Geheimniss",
      "With nickname": "Mit Nicknamen",
      "Import key": "Schlüssel importieren",
      "Client Version:": "Client Version:",
      "Mining difficulty:": "Mining Schwierigkeit:",
      "Block generation status": "Status der Block-Generierung",
      "Current hash rate:": "Aktuelle Hash-Rate:",
      "Terminate Daemon:": "Daemon beenden:",
      "Exit": "Beenden",
      "Save Changes": "Änderungen speichern",
      "Secret key:": "Privater Schlüssel:"
    };
}

if(preferredLanguage == "ja"){
    polyglot.locale("ja");
    wordset = {
      "Actions ▼": "アクション ▼",
      "Active DHT nodes:": "アクティブなDHTノード: ",
      "Add DNS": "DNSを追加",
      "Add peer": "ピアを追加",
      "ajax_error": "Ajax error: %{error}", // JavaScript error
      "All users publicly followed by": "All users publicly followed by",
      "Available": "Available", // username is available
      "Block chain information": "ブロックチェイン",
      "Block chain is up-to-date, twister is ready to use!": "ブロックチェインは最新の状態です。",
      "Block generation": "ブロック生成",
      "Cancel": "キャンセル",
      "Change user": "ユーザーを変更",
      "Checking...": "チェック...", // checking if username is available
      "Collapse": "閉じる", // smaller view of a post
      "Configure block generation": "ブロック生成の設定",
      "Connections:": "接続数: ", // to network
      "Connection lost.": "Connection lost.",
      "days": "%{smart_count} day |||| %{smart_count} days",
      "Detailed information": "詳細",
      "DHT network down.": "DHTネットワークがダウンしています",
      "Direct Messages": "ダイレクトメッセージ",
      "Disable": "停止",
      "Display mentions to @": "メンションを表示する",
      "Display retransmissions": "リトランスミットを表示する",
      "DNS to obtain list of peers:": "ピア取得のためのDNS:",
      "downloading_block_chain": "ブロックチェインをダウンロードしています。しばらくお待ちください。(block chain is %{days} days old).",
      "download_posts_status": "ダウンロード済みの投稿 %{portion}", // Downloaded 10/30 posts
      "Enable": "有効",
      "error": "Error: %{error}",
      "error_connecting_to_daemon": "Error connecting to local twister daemon.",
      "Error in 'createwalletuser' RPC.": "Error in 'createwalletuser' RPC.",
      "Error in 'importprivkey'": "Error in 'importprivkey' RPC: %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Error in 'sendnewusertransaction' RPC.",
      "Expand": "開く", // larger view of a post
      "Favorite": "お気に入り",
      "File APIs not supported in this browser.": "利用しているブラウザはファイルAPIをサポートしていません。",
      "Follow": "フォロー",
      "Followed by": "Followed by",
      "followed_by": "Followed by %{username}",
      "Followers": "フォロワー",
      "Following": "フォロー",
      "Following users": "フォローしているユーザー",
      "Force connection to peer:": "強制的に経由するピア:",
      "General information": "概略",
      "Generate blocks (send promoted messages)": "ブロックチェインを生成する (プロモートメッセージを送信する)",
      "Home": "ホーム", // homepage
      "hours": "%{smart_count} hour |||| %{smart_count} hours",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Internal error: lastPostId unknown (following yourself may fix!)",
      "Known peers:": "ネットワーク全体のピア: ",
      "Last block is ahead of your computer time, check your clock.": "Last block is ahead of your computer time, check your clock.",
      "mentions_at": "@%{user}へのメンション",
      "minutes": "%{smart_count} minute |||| %{smart_count} minutes",
      "Must be 16 characters or less.": "Must be 16 characters or less.", // username
      "Network": "ネットワーク",
      "Network config": "ネットワーク設定",
      "Network status": "ネットワークステータス",
      "New direct message...": "ダイレクトメッセージ...",
      "New Post...": "投稿する",
      "new_posts": "%{smart_count} new post |||| %{smart_count} new posts",
      "nobody": "nobody", // used to promote a post without attaching the user
      "Not available": "Not available", // username is not available
      "Number of blocks in block chain:": "全ブロック数: ",
      "Number of CPUs to use": "利用するCPUの数",
      "Only alphanumeric and underscore allowed.": "アルファベットとアンダースコア(_)が利用可能です",
      "peer address": "ピア・アドレス",
      "Private": "プライベート",
      "Profile": "プロフィール",
      "Postboard": "Postboard",
      "post": "投稿する", // verb - button to post a message
      "Post to promote:": "プロモートメッセージ: ",
      "Posts": "投稿",
      "propagating_nickname": "Propagating nickname %{username} to the network...",
      "Public": "公開",
      "Refresh": "リフレッシュ",
      "retransmit_this": "この投稿をリトランスミットしますか？",
      "Reply": "返信",
      "Reply...": "返信...",
      "reply_to": "%{fullname}への返信",
      "Retransmit": "リトランスミット",
      "Retransmits": "リトランスミット",
      "Retransmitted by": "Retransmitted by",
      "search": "検索",
      "seconds": "%{smart_count} second |||| %{smart_count} seconds",
      "send": "送信",
      "Send post with username": "プロモートメッセージの送信元",
      "Sent Direct Message": "ダイレクトメッセージを送る",
      "Sent Post to @": "メンションを投稿する",
      "Setup account": "アカウント設定",
      "switch_to_network": "Local daemon is not connected to the network or\n" +
                "block chain is outdated. If you stay in this page\n" +
                "your actions may not work.\n" +
                "Do you want to check Network Status page instead?",
      "The File APIs are not fully supported in this browser.": "The File APIs are not fully supported in this browser.",
      "time_ago": "%{time} ago", // 5 minutes ago
      "Time of the last block:": "最新ブロックの生成日時: ",
      "Type message here": "ここにメッセージを書いてね",
      "Unfollow": "解除",
      "Update": "アップデート",
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
      "users_mentions": "@%{username}へのメンション",
      "users_profile": "%{username}のプロフィール",
      "username_undefined": "ログインしてください。",
      "View": "見る",
      "View All": "すべて見る",
      "Who to Follow": "おすすめユーザー",
      "Your message was sent!": "投稿が送信されました！",
      "twister login": "Twisterログイン",
      "Existing local users": "既存のローカルユーザー",
      "Or...": "もしくは...",
      "Create a new user": "新規ユーザーを作成",
      "Login": "ログイン",
      "Check availability": "取得可能かチェック",
      "Create this nickname": "作成",
      "Type nickname here": "ニックネーム",
      "Import secret key": "シークレットキーをインポートする",
      "52-characters secret": "52文字からなるシークレット",
      "With nickname": "このニックネームで",
      "Import key": "キーをインポートする",
      "Client Version:": "クライアントのヴァージョン:",
      "Mining difficulty:": "採掘の難しさ:",
      "Block generation status": "ブロック生成の状態",
      "Current hash rate:": "現在のハッシュレート:",
      "Terminate Daemon:": "デーモンを終了する:",
      "Exit": "終了",
      "Save Changes": "変更を保存",
      "Secret key:": "シークレットキー:"
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
  ".network ul li label",
  ".network label",
  ".network textarea, .network input, .network option",

  // login page
  ".login h2, .login h3",
  ".login ul li span",
  ".module span",
  ".login span",
  ".login-local-username",
  ".login input"
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
