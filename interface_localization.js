// interface_localization.js
//
// uses JavaScript to detect browser language
// uses Polyglot.js ( https://github.com/airbnb/polyglot.js ) to translate interface

// translators: add your language code here such as "es" for Spanish, "ru" for Russian
var knownLanguages = ["en","nl","it", "fr"];

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
      "Your message was sent!": "Il messaggio è stato inviato!"
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
      "Your message was sent!": "Votre message a été envoyé!"
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
