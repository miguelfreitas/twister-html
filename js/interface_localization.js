// interface_localization.js
//
// uses JavaScript to detect browser language
// uses Polyglot.js ( https://github.com/airbnb/polyglot.js ) to translate interface

// translators: add your language code here such as "es" for Spanish, "ru" for Russian
var knownLanguages = ["en","es","nl","it","fr","ru","de","zh","ja","pt-BR","tr","uk"];

if( $.Options.getOption('locLang','auto') == 'auto'){
  // detect language with JavaScript
  preferredLanguage = window.navigator.userLanguage || window.navigator.language || "en";
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
}else{
  preferredLanguage = $.Options.getOption('locLang','en');
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
      "Secret key:": "Secret key:",
      "You have to log in to post messages.": "You have to log in to post messages.",
      "You have to log in to post replies.": "You have to log in to post replies.",
      "You have to log in to retransmit messages.": "You have to log in to retransmit messages.",
      "You have to log in to use direct messages.": "You have to log in to use direct messages.",
      "You have to log in to follow users.": "You have to log in to follow users.",
      "You are not following anyone because you are not logged in.": "You are not following anyone because you are not logged in.",
      "You don't have any followers because you are not logged in.": "You don't have any followers because you are not logged in.",      
      "No one can mention you because you are not logged in.": "No one can mention you because you are not logged in.",
      "You don't have any profile because you are not logged in.": "You don't have any profile because you are not logged in.",
      "Options": "Options",
      "Switch to Promoted posts": "Switch to Promoted posts",
      "Switch to Normal posts": "Switch to Promoted posts",
      "Use language": "Use language",
      "Ignore": "Ignore",
      "Theme": "Theme",
      "Keys": "Keys",
      "Sound notifications": "Sound notifications",
      "Send key": "Send key",
      "Posts display": "Posts display",
      "Post editor": "Post editor",
      "Inline image preview": "Inline image preview",
      "Display": "Display",
      "Line feeds": "Line feeds",
      "Supported punctuations:": "Supported punctuations:",
      "Supported emotions:": "Supported emotions:",
      "Supported signs:": "Supported signs:",
      "Supported fractions:": "Supported fractions:",
      "Automatic unicode conversion options": "Automatic unicode conversion options",
      "Convert punctuations to unicode": "Convert punctuations to unicode",
      "Convert emotions codes to unicode symbols": "Convert emotions codes to unicode symbols",
      "Convert common signs to unicode": "Convert common signs to unicode",
      "Convert fractions to unicode": "Convert fractions to unicode",
      "Convert all": "Convert all",
      "Auto": "Auto",
      "Original": "Original",
      "none": "none",
      "Custom": "Custom",
      "Mentions": "Mentions",
      "Use proxy for image preview only": "Use proxy for image preview only",
      "Use external links behind a proxy": "Use external links behind a proxy",
      "There aren't any posts with this hashtag.": "There aren't any posts with this hashtag.",
      "Split only new post": "Split only new post",
      "Split all": "Split all",
      "Don't split": "Don't split",
      "Split long posts": "Split long posts",
      "Posts that begin with mention": "Posts that begin with mention",
      "Show all": "Show all",
      "Show only if I am in": "Show only if I am in",
      "Show if it's between users I follow": "Show if it's between users I follow",
      "Postboard displays": "Postboard displays",
      "RTs those are close to original twist": "RTs those are close to original twist",
      "Show if the original is older than": "Show if the original is older than",
      "hour(s)": "hour(s)",
      "only numbers are allowed!": "only numbers are allowed!",
      "Show with every user name": "Show with every user name",
      "Show at profile modal only": "Show at profile modal only",
      "Show if a user follows me": "Show if a user follows me",
      "follows you": "follows you",
      "Show conversation": "Show conversation",
      "Mark all as read": "Mark all as read",
      "show_more_count": "%{count} more...",
      "hide": "hide"
    };
}
if(preferredLanguage == "es"){
    polyglot.locale("es");
    wordset = {
      "Actions ▼": "Acciones ▼",
      "Active DHT nodes:": "Nodos DHT activos: ",
      "Add DNS": "Agregar DNS",
      "Add peer": "Agragar pares",
      "ajax_error": "Error ajax: %{error}", // JavaScript error
      "All users publicly followed by": "Todos los usuarios seguidos públicamente por",
      "Available": "Available", // username is available
      "Block chain information": "Información de la cadena de bloques",
      "Block chain is up-to-date, twister is ready to use!": "La cadena de bloques está puesta al día, twister está listo para usar!",
      "Block generation": "Generación de bloques ",
      "Cancel": "Cancelar",
      "Change user": "Cambiar de usuario",
      "Checking...": "Comprobando ...", // checking if username is available
      "Collapse": "Colapsar", // smaller view of a post
      "Configure block generation": "Configure la generación de bloques",
      "Connections:": "Conexiones: ", // to network
      "Connection lost.": "Conexión perdida.",
      "days": "%{smart_count} día |||| %{smart_count} días",
      "Detailed information": "Información detallada",
      "DHT network down.": "Red DHT caida.",
      "Direct Messages": "Mensajes directos",
      "Disable": "Inhabilitar",
      "Display mentions to @": "Visualización de menciones a @",
      "Display retransmissions": "Visualización de retransmisiones",
      "DNS to obtain list of peers:": "DNS para obtener la lista de los pares:",
      "downloading_block_chain": "Descarga de la cadena de bloques, por favor espere antes de continuar (la cadena de bloques esta %{days} días).",
      "download_posts_status": "Post %{portion} descargados", // Downloaded 10/30 posts
      "Enable": "Permitir",
      "error": "Error: %{error}",
      "error_connecting_to_daemon": "Error al conectar con el demonio twister local.",
      "Error in 'createwalletuser' RPC.": "Error en RPC 'createwalletuser'.",
      "Error in 'importprivkey'": "Error en RPC 'importprivkey': %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Error en 'sendnewusertransaction' RPC.",
      "Expand": "Expandir", // larger view of a post
      "Favorite": "Favorito",
      "File APIs not supported in this browser.": "Los archivos API no compatibles con este navegador",
      "Follow": "Seguir",
      "Followed by": "Seguido por",
      "followed_by": "Seguido por %{username}",
      "Followers": "Seguidores",
      "Following": "Siguiendo",
      "Following users": "Siguiendo los usuarios",
      "Force connection to peer:": "Forzar la conexión a  los pares:",
      "General information": "Información general",
      "Generate blocks (send promoted messages)": "Generar bloques (enviar mensajes promovidos)",
      "Home": "Inicio", // homepage
      "hours": "%{smart_count} hora |||| %{smart_count} horas",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Error interno: Último Mensaje Id desconocido (siguiendo a usted mismo lo puede solucionar!)",
      "Known peers:": "Pares conocidos: ",
      "Last block is ahead of your computer time, check your clock.": "El último bloque está por delante de su tiempo en la computadora, compruebe su reloj.",
      "mentions_at": "Menciones @%{user}",
      "minutes": "%{smart_count} minuto |||| %{smart_count} minutos",
      "Must be 16 characters or less.": "Debe tener 16 caracteres o menos.", // username
      "Network": "Red",
      "Network config": "Configuración de la red",
      "Network status": "Estado de la red",
      "New direct message...": "Nuevo mensaje directo...",
      "New Post...": "Nuevo Post...",
      "new_posts": "%{smart_count} nuevo post |||| %{smart_count} nuevos posts",
      "nobody": "Nadie", // used to promote a post without attaching the user
      "Not available": "No disponible", // username is not available
      "Number of blocks in block chain:": "Número de bloques en la cadena de bloques: ",
      "Number of CPUs to use": "Número de CPUs para utilizar ",
      "Only alphanumeric and underscore allowed.": "Sólo alfanuméricos y subrayados permitido.",
      "peer address": "dirección de pares",
      "Private": "Privado",
      "Profile": "Perfil",
      "Postboard": "Postboard",
      "post": "post", // verb - button to post a message
      "Post to promote:": "Post para promover: ",
      "Posts": "Posts",
      "propagating_nickname": "La propagación de seudónimo %{username} a la red...",
      "Public": "Publicar",
      "Refresh": "Recargar",
      "retransmit_this": "¿Retransmitir este mensaje a tus seguidores?",
      "Reply": "Responder",
      "Reply...": "Responder...",
      "reply_to": "Responder a %{fullname}",
      "Retransmit": "Retransmicion",
      "Retransmits": "Retransmiciones",
      "Retransmitted by": "Retransmitido por",
      "search": "search",
      "seconds": "%{smart_count} segundos |||| %{smart_count} segundos",
      "send": "send",
      "Send post with username": "Enviar post con nombre de usuario ",
      "Sent Direct Message": "Mensaje directo",
      "Sent Post to @": "El Post enviado a @",
      "Setup account": "Configuración de la cuenta",
      "switch_to_network": "Demonio local no está conectado a la red o\n" +
                "la cadena de bloques no está actualizada. Si te quedas en esta página\n" +
                "tus acciones pueden no funcionar.\n" +
                "¿Quieres comprobar la página de estado de la red en su lugar?",
      "The File APIs are not fully supported in this browser.": "Las API de archivos no son totalmente compatibles con este navegador.",
      "time_ago": "hace %{time}", // 5 minutes ago
      "Time of the last block:": "Hora del último bloque: ",
      "Type message here": "Escriba el mensaje aquí",
      "Unfollow": "Dejar de seguir",
      "Update": "Actualizar",
      "Updating status...": "Actualización del estado ...", // status of block chain
      "user_not_yet_accepted": "Otros pares no han aceptado este nuevo usuario.\n" +
                "Por desgracia, no es posible guardar el perfil\n" +
                "o enviar ningún mensaje en este estado.\n\n" +
                "Espera unos minutos para continuar.\n\n" +
                "El 'Guardar cambios' se activará automáticamente\n" +
                "cuando el proceso se complete. (Prometo esto es\n"+
                "la última vez que tendrá que esperar antes de usar\n" +
                "twister).\n\n" +
                "Consejo: elija su avatar mientras tanto!",
      "users_mentions": "Las menciones de @%{username}",
      "users_profile": "%{username}'s Profile",
      "username_undefined": "Usuario no definido, es necesario iniciar sesión.",
      "View": "Ver",
      "View All": "Ver todos",
      "Who to Follow": "A quién seguir",
      "Your message was sent!": "¡Tu mensaje ha sido enviado!",
      "twister login": "twister inicio de sesión",
      "Existing local users": "Los actuales usuarios locales",
      "Or...": "O...",
      "Create a new user": "Crear un nuevo usuario",
      "Login": "Iniciar sesión",
      "Check availability": "Consultar disponibilidad",
      "Create this nickname": "Crear este seudónimo",
      "Type nickname here": "Escriba seudónimo aquí",
      "Import secret key": "Importar clave secreta",
      "52-characters secret": "52-carácteres secretos",
      "With nickname": "Con seudónimo",
      "Import key": "Importar llave",
      "Client Version:": "Versión del cliente:",
      "Mining difficulty:": "Dificultad Minado:",
      "Block generation status": "Estado de generación de bloques",
      "Current hash rate:": "Tasa de hash actual:",
      "Terminate Daemon:": "Terminar Demonio:",
      "Exit": "Salir",
      "Save Changes": "Guardar cambios",
      "Secret key:": "Clave secreta:"
    };
}

if(preferredLanguage == "uk"){
    polyglot.locale("uk");
    wordset = {
      "Actions ▼": "Дії ▼",
      "Active DHT nodes:": "Активних вузлів DHT: ",
      "Add DNS": "Додати DNS",
      "Add peer": "Додати пір",
      "ajax_error": "Помилка Ajax: %{error}", // JavaScript error
      "All users publicly followed by": "Усі публічні користувачі яких читають",
      "Available": "Доступний", // username is available
      "Block chain information": "Інформація про ланцюжок блоків",
      "Block chain is up-to-date, twister is ready to use!": "Ланцюг блоків оновлено, twister готовий до використання!",
      "Block generation": "Генерація блоку ",
      "Cancel": "Відміна",
      "Change user": "Змінити користувача",
      "Checking...": "Перевірка...", // checking if username is available
      "Collapse": "Згорнути", // smaller view of a post
      "Configure block generation": "Налаштувати генерацію блоку",
      "Connections:": "З’єднання: ", // to network
      "Connection lost.": "З’єднання втрачеон.",
      "days": "%{smart_count} день |||| %{smart_count} днів",
      "Detailed information": "Детальна інформація",
      "DHT network down.": "Мережа DHT недоступна.",
      "Direct Messages": "Особисті повідомлення",
      "Disable": "Відключено",
      "Display mentions to @": "Показати згадування @",
      "Display retransmissions": "Показати пересилання",
      "DNS to obtain list of peers:": "DNS для отримання пірів:",
      "dns address": "адреса dns",
      "downloading_block_chain": "Завантаження ланцюга блоків, будьласка, зачекайте перед продовженням (ланцюг блоків віком %{days} днів).",
      "download_posts_status": "Завантажено %{portion} повідомлень", // Downloaded 10/30 posts
      "Enable": "Включено",
      "error": "Помилка: %{error}",
      "error_connecting_to_daemon": "Помилка з’єднання з локальним сервером twister.",
      "Error in 'createwalletuser' RPC.": "Помилка у 'createwalletuser' RPC.",
      "Error in 'importprivkey'": "Помилка у 'importprivkey' RPC: %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Помилка у 'sendnewusertransaction' RPC.",
      "Expand": "Розгорнути", // larger view of a post
      "Favorite": "Улюблені",
      "File APIs not supported in this browser.": "File APIs не підтримуєтся цим браузером.",
      "Follow": "Підписатись",
      "Followed by": "Підписаний на",
      "followed_by": "%{username} підписан",
      "Followers": "Читачі",
      "Following": "Читаємі",
      "Following users": "Підписані користувачі",
      "Force connection to peer:": "Примусове з’єднання з піром:",
      "General information": "Загальна інформація",
      "Generate blocks (send promoted messages)": "Генерація блоків (відправка рекламних повідомень)",
      "Home": "Головна", // homepage
      "hours": "%{smart_count} година |||| %{smart_count} годин",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Внутрішня помилка: lastPostId невизначено (підписка на себе може виправити!)",
      "Known peers:": "Відомі піри: ",
      "Last block is ahead of your computer time, check your clock.": "Останній блок датований майбутнім часом, перевірте свій годинник.",
      "mentions_at": "Згадування @%{user}",
      "minutes": "%{smart_count} хвилина |||| %{smart_count} хвилин",
      "Must be 16 characters or less.": "Повинно бути не більше 16 символів.", // username
      "Network": "Мережа",
      "Network config": "Налаштування мережі",
      "Network status": "Статус мережі",
      "New direct message...": "Нове особисте повідомлення...",
      "New Post...": "Нове повідомлення...",
      "new_posts": "%{smart_count} нове повідомлення |||| %{smart_count} нових повідомлень",
      "nobody": "nobody", // used to promote a post without attaching the user
      "Not available": "Не доступне", // username is not available
      "Number of blocks in block chain:": "Кількість блоків у ланцюгу: ",
      "Number of CPUs to use": "Кількість CPUs до використання ",
      "Only alphanumeric and underscore allowed.": "Тільки літеро-численні сиволи та нижнє підкреслення дозволені.",
      "peer address": "адреса піру",
      "Private": "Особистий",
      "Profile": "Проіфль",
      "Postboard": "Стрічка оновлень",
      "post": "відістати", // verb - button to post a message
      "Post to promote:": "Рекламне повідомлення: ",
      "Posts": "Повідомлення",
      "propagating_nickname": "Поширення інформації шо до %{username} у мережі...",
      "Public": "Публічний",
      "Refresh": "Оновити",
      "retransmit_this": "Переслати це повідомлення читачам?",
      "Reply": "Відповісти",
      "Reply...": "Відповісти...",
      "reply_to": "Відповісти %{fullname}",
      "Retransmit": "Переслати",
      "Retransmits": "Пересилання",
      "Retransmitted by": "Переслано ",
      "search": "пошук",
      "seconds": "%{smart_count} секунда |||| %{smart_count} секунд",
      "send": "відіслати",
      "Send post with username": "Відіслати повідомлення з ім’ям ",
      "Sent Direct Message": "Відіслати особисте повідомлення",
      "Sent Post to @": "Відіслати повідомлення @",
      "Setup account": "Налаштувати акаунт",
      "switch_to_network": "Локальний сервер не підєднаний до мережі або \n" +
                "ланцюг блоків не актуальний. Якщо ви залишитесь на цій сторінці\n" +
                "ваші дії можуть не спрацювати.\n" +
                "Чи бажаєта ви перевірити сторінку зі статусом мережі?",
      "The File APIs are not fully supported in this browser.": "File APIs не повністью підтримуєтся браузером.",
      "time_ago": "%{time} тому", // 5 minutes ago
      "Time of the last block:": "Час останнього блоку: ",
      "Type message here": "Напишіть повідомлення тут",
      "Unfollow": "Відписатись",
      "Update": "Оновити",
      "Updating status...": "Оновлення статусу...", // status of block chain
      "user_not_yet_accepted": "Інші піри ще не прийняли цього користувача.\n" +
                "Нажаль, у цьому стані не можливо зберегти профіль\n" +
                "або послати якісь повідомлення.\n\n" +
                "Будьласка, зачекайте декілька хвилин для продовження.\n\n" +
                "Кнопка 'Зберегти зміни' стане доступною автоматично,\n" +
                "коли цей процес завершится. (Я обіцяю, це останній раз,\n"+
                "коли ви змушені чекати перед використанням twister).\n\n" +
                "Підказка: тим часом ви можете вибрати аватар!",
      "users_mentions": "Згадування @%{username}",
      "users_profile": "Профіль %{username}",
      "username_undefined": "Користувач невизначений, потрібен логін.",
      "View": "Дивитись",
      "View All": "Дивитись все",
      "Who to Follow": "Кого читати",
      "Your message was sent!": "Ваше повідомлення відправлене!",
      "twister login": "Вхід до twister",
      "Existing local users": "Вже зареєстровані",
      "Or...": "Або...",
      "Create a new user": "Створити нового користувача",
      "Login": "Увійти",
      "Check availability": "Перевірити доступність",
      "Create this nickname": "Створити цей нік",
      "Type nickname here": "Напишіть нік тут",
      "Import secret key": "Імпортувати секретний ключ",
      "52-characters secret": "52-символьний ключ",
      "With nickname": "З ніком",
      "Import key": "Імпортувати",
      "Client Version:": "Версія клієнту:",
      "Mining difficulty:": "Складність майнінгу:",
      "Block generation status": "Статус генерації блоків",
      "Current hash rate:": "Поточна швидкість хешування:",
      "Terminate Daemon:": "Зупинити twister:",
      "Exit": "Вихід",
      "Save Changes": "Зберегти зміни",
      "Secret key:": "Секретний ключ:"
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
       "DNS to obtain list of peers:": "DNS адрес для получения пиров:",
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
       "Internal error: lastPostId unknown (following yourself may fix!)": "Внутренняя ошибка: lastPostId неизвестен (Попробуйте подписаться сами на себя, это должно помочь!)",
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
       "Only alphanumeric and underscore allowed.": "Разрешены только латинские буквы, цифры и подчеркивания.",
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
       "Switch to Promoted posts": "Отображать только рекламные сообщения",
       "switch_to_network": "Локальный демон не подключен к сети или\n" +
                 "цепочка блоков устарела. Если вы останетесь на этой странице\n" +
                 "ваши действия могут быть не выполнены.\n" +
                 "Не хотите перейти на страницу настройки сети?",
       "The File APIs are not fully supported in this browser.": "File APIs не полностью поддерживается этим браузером.",
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
                 "Кнопка 'Сохранить' будет доступна автоматически после того,\n" +
                 "как процес регистрации завершится. (Я обещаю, это\n"+
                 "последний раз, когда вы ждете перед использованием\n" +
                 "twister'a).\n\n" +
                 "Хозяйке на заметку: Сейчас вы можете выбрать аватар!",
       "users_mentions": "Ответ от @%{username}",
       "users_profile": "%{username}'s профиль",
       "username_undefined": "Имя пользователя не определено, требуется войти.",
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
       "With nickname": "С логином",
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
      "Unfollow": "Nicht mehr folgen",
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
      "Secret key:": "Privater Schlüssel:",
      "Options": "Einstellungen",
      "new_posts": "%{smart_count} neue Nachricht |||| %{smart_count} neue Nachrichten",
      "Use language": "Sprache einstellen",
      "Sound notifications": "Audioeinstellungen",
      "Switch to Promoted posts": "Wechsle zu Promoted Nachrichten",
      "none": "kein(e)",
      "Show if a user follows me": "Zeige an, wenn mir ein Benutzer folgt",
      "Show with every user name": "Zeige mit jedem Benutzernamen",
      "Split long posts": "Teile längere Nachrichten auf",
      "Split only new post": "Teile nur neue Nachrichten auf",
      "Split all": "Alle aufteilen",
      "Don't split": "Nicht aufteilen",
      "Post editor": "Nachrichten-Editor",
      "Convert all": "Alle konvertieren",
      "Custom": "Benutzerdefiniert",
      "Ignore": "Ignorieren",
      "Automatic unicode conversion options": "Automatische Unicode Konvertierungseinstellungen",
      "Use proxy for image preview only": "Benutze Proxy nur für Bildvorschau",
      "Use external links behind a proxy": "Benutze externe Links hinter einem Proxy"
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

// Brazilian Portuguese translation
if(preferredLanguage == "pt-BR"){
    polyglot.locale("pt-BR");
    wordset = {
      "Actions ▼": "Ações ▼",
      "Active DHT nodes:": "Nós DHT ativos: ",
      "Add DNS": "Adicionar DNS",
      "Add peer": "Adicionar nó",
      "ajax_error": "Erro Ajax: %{error}", // JavaScript error
      "All users publicly followed by": "Todos os usuários seguidos publicamente por",
      "Available": "Disponível", // username is available
      "Block chain information": "Informações da Cadeia de Blocos",
      "Block chain is up-to-date, twister is ready to use!": "A Cadeida de Blocos está sincronizada, Twister está pronto para uso!",
      "Block generation": "Geração de blocos ",
      "Cancel": "Cancelar",
      "Change user": "Trocar usuário",
      "Checking...": "Verificando...", // checking if username is available
      "Collapse": "Recolher", // smaller view of a post
      "Configure block generation": "Configurar a geração de blocos",
      "Connections:": "Conexões: ", // to network
      "Connection lost.": "Conexão perdida.",
      "days": "%{smart_count} dia |||| %{smart_count} dias",
      "Detailed information": "Informações detalhadas",
      "DHT network down.": "Falha na rede DHT",
      "Direct Messages": "Mensagens Diretas", // Layout issue: need to enlarge width of the button in Profile page.
      "Disable": "Desabilitado",
      "Display mentions to @": "Exibir menções a @",
      "Display retransmissions": "Exibir retransmissões",
      "DNS to obtain list of peers:": "DNS para obter a lista de nós:",
      "downloading_block_chain": "Baixando a Cadeia de Blocos, por favor aguarde (A Cadeia de Blocos está %{days} dias desatualizada).",
      "download_posts_status": "%{portion} postagens carregadas.", // Downloaded 10/30 posts
      "Enable": "Habilitado",
      "error": "Erro: %{error}",
      "error_connecting_to_daemon": "Erro ao tentar se conectar com o Cliente do Twister.",
      "Error in 'createwalletuser' RPC.": "Erro ao executar a RPC 'createwalletuser'.",
      "Error in 'importprivkey'": "Erro ao executar a RPC 'importprivkey' : %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "Erro ao executar a RPC 'sendnewusertransaction'",
      "Expand": "Expandir", // larger view of a post
      "Favorite": "Favorito",
      "File APIs not supported in this browser.": "O gerenciamento de arquivos não é suportado neste navegador.",
      "Follow": "Seguir",
      "Followed by": "Seguido por",
      "followed_by": "Seguido por %{username}",
      "Followers": "Seguidores",
      "Following": "Seguindo",
      "Following users": "Usuários que sigo",
      "Force connection to peer:": "Forçar conexão com o nó:",
      "General information": "Informações gerais",
      "Generate blocks (send promoted messages)": "Gerar blocos (enviar mensagens promovidas)",
      "Home": "Início", // homepage
      "hours": "%{smart_count} hora |||| %{smart_count} horas",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Erro interno: lastPostId desconhecido (seguir você mesmo pode corrigir este erro!)",
      "Known peers:": "Nós conhecidos: ",
      "Last block is ahead of your computer time, check your clock.": "O último bloco está adiantado em relação ao horário do seu computador, verifique seu relógio.",
      "mentions_at": "Menções @%{user}",
      "minutes": "%{smart_count} minuto |||| %{smart_count} minutos",
      "Must be 16 characters or less.": "Deve conter 16 caracteres ou menos.", // username
      "Network": "Rede",
      "Network config": "Configuração de rede",
      "Network status": "Estado da rede",
      "New direct message...": "Nova mensagem direta...",
      "New Post...": "Nova Postagem...",
      "new_posts": "%{smart_count} nova postagem |||| %{smart_count} novas postagens",
      "nobody": "nobody", // used to promote a post without attaching the user
      "Not available": "Indisponível", // username is not available
      "Number of blocks in block chain:": "Número de blocos: ",
      "Number of CPUs to use": "Número de CPUs a serem utilizados ",
      "Only alphanumeric and underscore allowed.": "Permitido apenas caracteres alfanuméricos e underscore '_'.",
      "peer address": "endereço do nó",
      "dns address": "endereço do DNS", // não existia
      "Private": "Privado",
      "Profile": "Perfil",
      "Postboard": "Postagens",
      "post": "Postar", // verb - button to post a message
      "Post to promote:": "Mensagem a ser promovida: ",
      "Posts": "Postagens",
      "propagating_nickname": "Propagando o nome de usuário %{username} para a rede...",
      "Public": "Público",
      "Refresh": "Atualizar",
      "retransmit_this": "Retransmitir esta postagem para seus seguidores?",
      "Reply": "Responder",
      "Reply...": "Responder...",
      "reply_to": "Responder à %{fullname}",
      "Retransmit": "Retransmitir",
      "Retransmits": "Retransmissões",
      "Retransmitted by": "Retransmitido por",
      "search": "procurar",
      "seconds": "%{smart_count} segundo |||| %{smart_count} segundos",
      "send": "enviar",
      "Send post with username": "Promover esta mensagem como usuário",
      "Sent Direct Message": "Mensagens Diretas trocadas",
      "Sent Post to @": "Postagens enviadas para @",
      "Setup account": "Configurar conta",
      "switch_to_network": "O Cliente do Twister não está conectado à rede ou\n" +
                "a cadeia de blocos está desatualizada. Se permanecer \n" +
                "nesta página suas ações podem não ter efeito.\n" +
                "Gostaria de verificar o Estado da Rede ao invés disso?",
      "The File APIs are not fully supported in this browser.": "O gerenciamento de arquivos não é completamente suportado neste navegador.",
      "time_ago": "%{time} atrás", // 5 minutes ago
      "Time of the last block:": "Horário do último bloco: ",
      "Type message here": "Escreva sua mensagem aqui",
      "Unfollow": "Deixar de seguir",
      "Update": "Atualizar",
      "Updating status...": "Atualizando estado da Cadeia de Blocos...", // status of block chain
      "user_not_yet_accepted": "Outros nós ainda não aceitaram este novo usuário.\n" +
                "Infelizmente não é possível salvar o perfil\n" +
                "ou realizar postagens neste estado.\n\n" +
                "Por favor, aguarde alguns minutos para continuar.\n\n" +
                "O botão 'Salvar Alterações' será habilitado automaticamente\n" +
                "qundo o processo for completado (Eu prometo que\n"+
                "está será a última vez que você terá que esperar\n" +
                "antes de utilizar o Twister).\n\n" +
                "Dica: escolha uma foto para o seu avatar enquanto espera!",
      "users_mentions": "Menções de @%{username}",
      "users_profile": "Perfil de %{username}",
      "username_undefined": "Nome de usuário indefinido, login requerido.",
      "View": "Visualizar",
      "View All": "Visualizar Todos",
      "Who to Follow": "Quem seguir",
      "Your message was sent!": "Sua mensagem foi enviada!",
      "twister login": "Login no Twister",
      "Existing local users": "Usuários recentes",
      "Or...": "Ou...",
      "Create a new user": "Crie um novo usuário",
      "Login": "Login",
      "Check availability": "Verificar disponibilidade",
      "Create this nickname": "Criar este usuário",
      "Type nickname here": "Digite o nome aqui",
      "Import secret key": "Importe uma chave secreta",
      "52-characters secret": "Digite aqui os 52 caracteres da chave",
      "With nickname": "Com o nome de usuário",
      "Import key": "Importar chave",
      "Client Version:": "Versão do Cliente:",
      "Mining difficulty:": "Dificulade de mineração:",
      "Block generation status": "Estado da geração de blocos",
      "Current hash rate:": "Taxa de 'hash' atual:",
      "Terminate Daemon:": "Encerrar a execução do Cliente do Twister",
      "Exit": "Sair",
      "Save Changes": "Salvar Alterações",
      "Secret Key": "Chave Secreta", // não existia
      "Secret key:": "Chave secreta:"
    };
}

if(preferredLanguage == "tr"){
    polyglot.locale("tr");
    wordset = {
      "Actions ▼": "Eylemler ▼",
      "Active DHT nodes:": "Aktif DHT düğümleri: ",
      "Add DNS": "DNS ekle",
      "Add peer": "Eş ekle",
      "ajax_error": "Ajax hatası: %{error}", // JavaScript error
      "All users publicly followed by": "Açık olarak takip edilen tüm kullanıcılar",
      "Available": "Kullanılabilir", // username is available
      "Block chain information": "Blok zincir bilgisi",
      "Block chain is up-to-date, twister is ready to use!": "Blok zinciri güncel, twister kullanıma hazır!",
      "Block generation": "Blok üretimi ",
      "Cancel": "İptal",
      "Change user": "Kullanıcı değiştir",
      "Checking...": "Denetleniyor...", // checking if username is available
      "Collapse": "Kapat", // smaller view of a post
      "Configure block generation": "Blok üretim ayarları",
      "Connections:": "Bağlantılar: ", // to network
      "Connection lost.": "Bağlantı koptu.",
      "days": "%{smart_count} gün |||| %{smart_count} gün",
      "Detailed information": "Detaylı bilgi",
      "DHT network down.": "DHT ağı çalışmıyor.",
      "Direct Messages": "Direk Mesajlar",
      "Disable": "Kullanılmaz",
      "Display mentions to @": "@ adının geçtiği gönderiler",
      "Display retransmissions": "Tekrar iletimleri göster",
      "DNS to obtain list of peers:": "Eş listesini almak için DNS:",
      "downloading_block_chain": "Blok zinciri indiriliyor, devam edebilmek için lütfen bekleyiniz (blok zinciri %{days} günlük).",
      "download_posts_status": "Göderilerin indirilme oranı: %{portion}", // Downloaded 10/30 posts
      "Enable": "Kullanılabilir",
      "error": "Hata: %{error}",
      "error_connecting_to_daemon": "Yerel twister servisine bağlanma hatası.",
      "Error in 'createwalletuser' RPC.": "'createwalletuser' RPC'de (Uzak Yordam Çağrısında) hata.",
      "Error in 'importprivkey'": "'importprivkey' RPC'de (Uzak Yordam Çağrısında) hata: %{rpc}",
      "Error in 'sendnewusertransaction' RPC.": "'sendnewusertransaction' RPC'de (Uzak Yordam Çağrısında) hata.",
      "Expand": "Aç", // larger view of a post
      "Favorite": "Favori",
      "File APIs not supported in this browser.": "Tarayıcınızda dosya API'si desteklenmiyor.",
      "Follow": "Takip et",
      "Followed by": "Takip edenler",
      "followed_by": "%{username} tarafından takip edilenler",
      "Followers": "Takipçiler",
      "Following": "Takip edilenler",
      "Following users": "Takip edilen kullanıcılar",
      "Force connection to peer:": "Bağlantı için zorlanacak eş:",
      "General information": "Genel bilgi",
      "Generate blocks (send promoted messages)": "Blok oluştur (destekli mesaj gönder)",
      "Home": "Anasayfa", // homepage
      "hours": "%{smart_count} saat |||| %{smart_count} saat",
      "Internal error: lastPostId unknown (following yourself may fix!)": "Dahili hata: lastPostId bilinmiyor (kendinizi takip etmek bu sorunu giderebilir!)",
      "Known peers:": "Bilinen eşler: ",
      "Last block is ahead of your computer time, check your clock.": "Son blok zamanı sistem saatinden daha ileride, saatinizi kontrol ediniz.",
      "mentions_at": "@%{user} kullanıcısından bahsedenler",
      "minutes": "%{smart_count} dakika |||| %{smart_count} dakika",
      "Must be 16 characters or less.": "16 karakterden daha uzun olamaz.", // username
      "Network": "Ağ",
      "Network config": "Ağ ayarları",
      "Network status": "Ağ durumu",
      "New direct message...": "Yeni direk mesaj...",
      "New Post...": "Yeni gönderi...",
      "new_posts": "%{smart_count} yeni gönederi |||| %{smart_count} yeni gönderi",
      "nobody": "hiçkimse", // used to promote a post without attaching the user
      "Not available": "Kullanılamaz", // username is not available
      "Number of blocks in block chain:": "Blok zincirindeki blok sayısı: ",
      "Number of CPUs to use": "Kullanılacak CPU sayısı ",
      "Only alphanumeric and underscore allowed.": "Sadece harf ve alt çizgi kullanılabilir.",
      "peer address": "eş adresi",
      "Private": "Özel",
      "Profile": "Profil",
      "Postboard": "Gönderiler",
      "post": "gönder", // verb - button to post a message
      "Post to promote:": "Desteklenecek gönderi: ",
      "Posts": "Gönderiler",
      "propagating_nickname": "%{username} kullanıcı adı ağda yayımlanıyor...",
      "Public": "Genel",
      "Refresh": "Yenile",
      "retransmit_this": "Bu gönderi, takipçilerine takrar iletilsin mi?",
      "Reply": "Cevapla",
      "Reply...": "Cevapla...",
      "reply_to": "%{fullname} kullancısını cevapla",
      "Retransmit": "Tekar ilet",
      "Retransmits": "Tekrar iletenler",
      "Retransmitted by": "Tekrar ileten",
      "search": "ara",
      "seconds": "%{smart_count} saniye |||| %{smart_count} saniye",
      "send": "gönder",
      "Send post with username": "İletiyi kullanıcı adıyla gönder ",
      "Sent Direct Message": "Direk Mesaj Gönder",
      "Sent Post to @": "@ Kullanıcıya Gönder",
      "Setup account": "Hesap ayarları",
      "switch_to_network": "Yerel servis ağa bağlı değil ya da\n" +
                "blok zinciri güncel değil. Eğer bu sayfada kalırsanız\n" +
                "eylemlerinizi işlemeyebilir.\n" +
                "Bunun yerine Ağ Durumu sayfasını kontrol etmek ister misiniz?",
      "The File APIs are not fully supported in this browser.": "Dosya API'si tarayıcınızda tam olarak desteklenmiyor.",
      "time_ago": "%{time} önce", // 5 minutes ago
      "Time of the last block:": "Son blok saati: ",
      "Type message here": "Mesajı buraya yazınız",
      "Unfollow": "Takibi bırak",
      "Update": "Güncelle",
      "Updating status...": "Durum güncelleniyor...", // status of block chain
      "user_not_yet_accepted": "Diğer eşler bu yeni kullanıcıyı henüz kabul etmediler.\n" +
                "Malesef profili kaydetmek ya da bu durumda\n" +
                "ileti gönedermek mümkün değil.\n\n" +
                "Lütfen devam etmek için bir kaç dakika bekleyin.\n\n" +
                "İşlem tamamlandığında 'Değişiklikleri Kaydet'\n" +
                "kediliğinden kullanılabilir olacaktır. (Twister'ı kullanmak için\n"+
                "bu son bekleyişiniz olduğu konusunda size teminat veriyorum).\n\n" +
                "İpucu: beklerken profil resminizi seçiniz!",
      "users_mentions": "@%{username} kullanıcısından bahsedenler",
      "users_profile": "%{username} kullanıcısının Profili",
      "username_undefined": "Kullanıcı adı belirsiz, giriş gerekli.",
      "View": "Göster",
      "View All": "Hepsini Göster",
      "Who to Follow": "Kimi takip etmeli",
      "Your message was sent!": "Mesajınız gönderildi!",
      "twister login": "twister girişi",
      "Existing local users": "Var olan yerel kullanıcılar",
      "Or...": "Ya da...",
      "Create a new user": "Yeni bir kullanıcı oluştur",
      "Login": "Giriş",
      "Check availability": "Kullanılabilirliliği denetle",
      "Create this nickname": "Bu takma ismi oluştur",
      "Type nickname here": "Takma ismi buraya yazınınız",
      "Import secret key": "Gizli anahtarı içeri aktar",
      "52-characters secret": "52-karakterli gizli anahtar",
      "With nickname": "Takma ismi kullanarak",
      "Import key": "Anahtarı içe aktar",
      "Client Version:": "İstemci versiyonu:",
      "Mining difficulty:": "Madencilik zorluğu:",
      "Block generation status": "Block oluşturma durumu",
      "Current hash rate:": "Geçerli özet oranı:",
      "Terminate Daemon:": "Servisi Durdur:",
      "Exit": "Çıkış",
      "Save Changes": "Değişiklikleri Kaydet",
      "Secret key:": "Gizli anahtar:",
      "Options": "Ayarlar",
      "Switch to Promoted posts": "Destekli Mesajlara Geç",
      "Switch to Normal posts": "Normal Mesajlara Geç",
      "Use language": "Dil ayarla",
      "Ignore": "Görmezden gel",
      "Theme": "Tema",
      "Keys": "Tuşlar",
      "Sound notifications": "Sesli uyarılar",
      "Send key": "Gönderme tuşu",
      "Posts display": "Gönderiler",
      "Post editor": "Gönderi düzenleyici",
      "Inline image preview": "Dahili resim ön izleme",
      "Display": "Göster",
      "Line feeds": "Satır sonları",
      "Supported punctuations:": "Desteklenen noktalama işaretleri:",
      "Supported emotions:": "Desteklenen duygu simgeleri:",
      "Supported signs:": "Desteklenen işaretler:",
      "Supported fractions:": "Desteklenen kesirler:",
      "Automatic unicode conversion options": "Otomatik unicode dönüştürme seçenekleri",
      "Convert punctuations to unicode": "Noktalama işaretlerini unicode'a dönüştür",
      "Convert emotions codes to unicode symbols": "Duygu simge kodlarını unicode simgelerine dönüştür",
      "Convert common signs to unicode": "Yaygın işaretleri unicode'a dönüştür",
      "Convert fractions to unicode": "Kesirleri unicode'a dönüştür",
      "Convert all": "Hepsini dönüştür",
      "Auto": "Otomatik",
      "Original": "Orjinal",
      "none": "Hiçbiri",
      "Custom": "Özel",
      "Mentions": "Bahsedenler",
      "You have to log in to post messages.": "Mesaj göndermek için giriş yapmalısınız.",
      "You have to log in to post replies.": "Cevap göndermek için giriş yapmalısınız.",
      "You have to log in to retransmit messages.": "Yeniden iletmek için giriş yapmalısınız.",
      "You have to log in to use direct messages.": "Direk masajları kullanabilmek için giriş yapmalısınız.",
      "You have to log in to follow users.": "Kullanıcı takip etmek için giriş yapmalısınız.",
      "You are not following anyone because you are not logged in.": "Giriş yapmadığınız için kimseyi takip etmiyorsunuz.",
      "You don't have any followers because you are not logged in.": "Giriş yapmadığınız için hiç takipçiniz yok.",
      "No one can mention you because you are not logged in.": "Giriş yapmadığınız için kimse adınıza mesaj gönderemiyor.",
      "You don't have any profile because you are not logged in.": "Giriş yapmadığınız için profiliniz yok.",
      "Use proxy for image preview only": "Vekil sunucuyu sadece resim ön izleme için kullan",
      "Use external links behind a proxy": "Harici bağlantılar için vekil sunucu kullan",
      "There aren't any posts with this hashtag.": "Bu etiketle ilgili gönderi yok.",
      "Split only new post": "Sadece yeni postaları böl",
      "Split all": "Hepsini böl",
      "Don't split": "Bölme",
      "Split long posts": "Uzun gönderileri böl",
      "Posts that begin with mention": "Bahsettiği kullanıcının adıyla başlayan gönderiler",
      "Show all": "Hepsini göster",
      "Show only if I am in": "Sadece ben içindeysem göster",
      "Show if it's between users I follow": "Takip ettiğim kullanıcılar arasında ise göster",
      "Postboard displays": "Zaman çizelgesinde",
      "RTs those are close to original twist": "Orjinal twist'e yakın olan RTler",
      "Show if the original is older than": "Orjinali yandaki süreden daha eskiyse göster",
      "hour(s)": "saat",
      "only numbers are allowed!": "sadece rakam girilebilir!",
      "Show with every user name": "Tüm kullanıcı adlarının yanında göster",
      "Show at profile modal only": "Sadece profilinde göster",
      "Show if a user follows me": "Bir kullanıcının beni takip edip etmediğini göster",
      "follows you": "seni takip ediyor",
      "Show conversation": "Sohbeti göster",
      "Mark all as read": "hepsini okundu olarak işaretle",
      "show_more_count": "%{count} tane daha...",
      "hide": "gizle"
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
  ".postboard span",

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
  ".login input",

  //options page
  "option"
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
