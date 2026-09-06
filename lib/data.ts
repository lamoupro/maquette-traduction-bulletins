/* Données du site.

   Les avis sont RÉELS, et leurs fautes sont CONSERVÉES. Accords, singuliers,
   prénoms en minuscules, ponctuation expressive : tout reste. C'est ce qui
   fait qu'un avis se lit comme écrit par un client — douze témoignages sans
   une seule aspérité se lisent comme de la publicité, et sur un site qui vend
   de la rigueur documentaire c'est le pire endroit pour ça.

   Deux exceptions seulement, arrêtées le 6 septembre 2026, et pour la même
   raison dans les deux cas : elles gênaient la COMPRÉHENSION, pas la forme.

   — « assermente » → « assermentée » : sans l'accent, le mot ne se lit plus
     comme un mot, et c'est justement celui que le site vend.
   — « au moins de 24 heures » → « en moins de » : « au moins » dit le
     contraire de ce que la cliente voulait dire, et retourne son éloge.

   La règle, si on y revient : on ne corrige que ce qui empêche de comprendre. */

export type Avis = {
  e: number;
  /** Le texte ORIGINAL, tel que la personne l'a écrit. */
  texte: string;
  nom: string;
  /** La langue dans laquelle il a été écrit. */
  ecritEn: 'fr' | 'en';
  /* Traductions. Un avis écrit en anglais n'en a pas : il reste en anglais
     partout, y compris sur le site français. Un avis traduit est affiché avec
     la mention « traduit du français » — une traduction n'est pas une
     citation, et la présenter comme telle serait faire dire à quelqu'un des
     mots qu'il n'a pas écrits. */
  en?: string;
  es?: string;
  pt?: string;
};

export const AVIS: Avis[] = [
    { e:5, texte:"J\u2019avais besoin d\u2019un document en anglais ( inscription dans une universit\u00e9) avec une traduction certifi\u00e9e, j\u2019ai tout fait en ligne et command\u00e9 sans suppl\u00e9ment pour acc\u00e9l\u00e9rer la traduction vu que j\u2019avais le temps, c\u2019est arriv\u00e9 en 24 heures. Nickel", nom:"Caroline J.", ecritEn:"fr", en:"I needed a document in English (for a university application) with a certified translation. I did everything online and ordered without paying extra to speed it up, since I had time — it arrived in 24 hours. Perfect.", es:"Necesitaba un documento en inglés (para una solicitud universitaria) con traducción certificada. Lo hice todo en línea y pedí sin pagar suplemento por urgencia, porque tenía tiempo, y llegó en 24 horas. Impecable.", pt:"Eu precisava de um documento em inglês (para uma inscrição universitária) com tradução certificada. Fiz tudo online e pedi sem pagar a mais pela urgência, porque tinha tempo, e chegou em 24 horas. Perfeito." },
    { e:5, texte:"traduction, ultrarapide, r\u00e9alis\u00e9e par un traducteur asserment\u00e9 (allemand -> fran\u00e7ais). \u00c0 recommander vivement.", nom:"Thomas W.", ecritEn:"fr", en:"Very fast translation, done by a sworn translator (German to French). Highly recommended.", es:"Traducción ultrarrápida, realizada por un traductor jurado (alemán a francés). Muy recomendable.", pt:"Tradução ultrarrápida, feita por um tradutor juramentado (alemão para francês). Recomendo muito." },
    { e:5, texte:"Travail professionnel, d\u00e9lai respecter. Merci", nom:"D.", ecritEn:"fr", en:"Professional work, deadline met. Thank you.", es:"Trabajo profesional, plazo cumplido. Gracias.", pt:"Trabalho profissional, prazo cumprido. Obrigado." },
    { e:5, texte:"Super, je suis ravie, je voulais les deux semestres de BTS traduit pour mon fils. Je pensais que \u00e7a allait prendre plusieurs jours mais en moins de 24 heures je l\u2019ai re\u00e7u.", nom:"sophie b.", ecritEn:"fr", en:"Great, I am delighted. I wanted my son's two college semesters translated. I thought it would take several days, but I had it in under 24 hours.", es:"Genial, estoy encantada. Quería los dos semestres de mi hijo traducidos. Pensaba que tardaría varios días, pero lo recibí en menos de 24 horas.", pt:"Ótimo, fiquei muito satisfeita. Eu queria os dois semestres do meu filho traduzidos. Achei que levaria vários dias, mas recebi em menos de 24 horas." },
    { e:5, texte:"Je recommande vivement!! C\u2019est la deuxi\u00e8me fois je compte sur eux pour des documents. La rapidit\u00e9 et la qualit\u00e9 de leurs services et 10/10", nom:"lorea a.", ecritEn:"fr", en:"I highly recommend them! This is the second time I have relied on them for documents. The speed and the quality of their service are 10/10.", es:"¡Los recomiendo muchísimo! Es la segunda vez que cuento con ellos para documentos. La rapidez y la calidad de su servicio son un 10/10.", pt:"Recomendo muito! É a segunda vez que conto com eles para documentos. A rapidez e a qualidade do serviço são 10/10." },
    { e:5, texte:"Protranslayte was useful when I needed a certified translation. The process felt simple, and the final document looked properly prepared.", nom:"Saif R.", ecritEn:"en" },
    { e:4, texte:"I needed a translated document for personal use and Protranslayte handled it well. The result was clear and delivered faster than expected.", nom:"Dave A.", ecritEn:"en" },
    { e:5, texte:"C\u2019est un service impeccable avec une traduction asserment\u00e9e parfaite et qui r\u00e9pond aux normes administratives. Bravo! Je recommande sans h\u00e9sitation.", nom:"Kristin C.", ecritEn:"fr", en:"An impeccable service with a perfect certified translation that meets administrative requirements. Bravo! I recommend them without hesitation.", es:"Un servicio impecable con una traducción certificada perfecta que cumple las exigencias administrativas. ¡Bravo! Los recomiendo sin dudarlo.", pt:"Um serviço impecável, com uma tradução certificada perfeita e conforme as exigências administrativas. Parabéns! Recomendo sem hesitar." },
    { e:5, texte:"Je n\u2019aurai qu\u2019un seul mot \u00e0 vous dire: Merci, oui merci infiniment! Je devais d\u00e9panner un ami avec une traduction de derni\u00e8re minute et vous avez \u00e9t\u00e9 les seuls \u00e0 \u00eatre aussi bien sur le rapport qualit\u00e9 / prix / rapidit\u00e9. Je ne pense pas qu\u2019il y ait de traducteur sur le net, alors merci encore.", nom:"Olivier", ecritEn:"fr", en:"I have only one word for you: thank you — truly, thank you so much. I had to help out a friend with a last-minute translation and you were the only ones that good on value, price and speed. I doubt there is a better translator online, so thank you again.", es:"Solo tengo una palabra para ustedes: gracias, de verdad, ¡muchísimas gracias! Tenía que sacar de un apuro a un amigo con una traducción de última hora y fueron los únicos tan buenos en calidad, precio y rapidez. No creo que haya mejor traductor en internet, así que gracias otra vez.", pt:"Só tenho uma palavra a dizer: obrigado, de verdade, muito obrigado! Eu precisava ajudar um amigo com uma tradução de última hora e vocês foram os únicos tão bons em qualidade, preço e rapidez. Não acho que exista tradutor melhor na internet, então obrigado mais uma vez." },
    { e:5, texte:"Je suis \u00e9tonnamment satisfaite de la rapidit\u00e9 de leur service de qualit\u00e9. J\u2019ai envoy\u00e9 mon document ce matin et il \u00e9tait disponible le m\u00eame jour \u00e0 18h. Ils sont tr\u00e8s \u00e0 l\u2019\u00e9coute. Prix raisonnable vraiment, je recommande fortement.", nom:"cliente", ecritEn:"fr", en:"I am surprisingly pleased with how fast their quality service is. I sent my document this morning and it was ready the same day at 6 pm. They really listen. Genuinely reasonable price — I strongly recommend them.", es:"Estoy sorprendentemente satisfecha con la rapidez de su servicio de calidad. Envié mi documento esta mañana y estuvo listo el mismo día a las 18 h. Están muy pendientes. Precio realmente razonable, lo recomiendo mucho.", pt:"Estou surpreendentemente satisfeita com a rapidez do serviço. Enviei meu documento de manhã e ele estava pronto no mesmo dia às 18h. São muito atenciosos. Preço realmente justo, recomendo fortemente." },
    { e:5, texte:"J\u2019ai fait appel \u00e0 ce site pour la traduction en anglais de mon dipl\u00f4me et de mon bulletin. J\u2019ai re\u00e7u les documents tr\u00e8s rapidement avec une traduction de grande qualit\u00e9 fid\u00e8le \u00e0 l\u2019original et certifi\u00e9e. Le service est efficace et professionnel. Je suis pleinement satisfaite et je recommande vivement.", nom:"nour a.", ecritEn:"fr", en:"I used this site to have my diploma and my transcript translated into English. I received the documents very quickly, with a high-quality translation faithful to the original and certified. The service is efficient and professional. I am completely satisfied and recommend them warmly.", es:"Recurrí a este sitio para la traducción al inglés de mi título y mi boletín. Recibí los documentos muy rápido, con una traducción de gran calidad, fiel al original y certificada. El servicio es eficaz y profesional. Estoy plenamente satisfecha y lo recomiendo.", pt:"Recorri a este site para a tradução do meu diploma e do meu boletim para o inglês. Recebi os documentos muito rápido, com uma tradução de grande qualidade, fiel ao original e certificada. O serviço é eficiente e profissional. Estou plenamente satisfeita e recomendo." },
    { e:4, texte:"Tr\u00e8s r\u00e9actif au niveau de la compr\u00e9hension de la demande et la r\u00e9ponse apport\u00e9e. Apr\u00e8s avoir re\u00e7u mon document dans un d\u00e9lais tr\u00e8s raisonnable, on peut toujours les contacter pour des pr\u00e9cisions et ils r\u00e9pondent tr\u00e8s vite.", nom:"Abdullah R.", ecritEn:"fr", en:"Very responsive in understanding the request and answering it. After receiving my document within a very reasonable time, you can still contact them for clarifications and they reply very quickly.", es:"Muy receptivos a la hora de entender la petición y responderla. Después de recibir mi documento en un plazo muy razonable, siempre se les puede contactar para precisiones y responden muy rápido.", pt:"Muito atenciosos na compreensão do pedido e na resposta. Depois de receber meu documento num prazo bem razoável, dá para continuar entrando em contato para esclarecimentos e eles respondem muito rápido." }
  ];

/* Notifications d'achat — CONTENU DE DÉMONSTRATION.
   200 acheteurs fictifs, à brancher sur les vraies commandes. */
export const ACHETEURS: string[] = 'Camille D.|Toulouse|FR;Karim B.|Marseille|FR;Élodie R.|Nantes|FR;Thomas D.|Lyon|FR;Naïma S.|Lille|FR;Vincent L.|Bordeaux|FR;Fatou D.|Paris|FR;Marc-Antoine P.|Rennes|FR;Leïla H.|Montpellier|FR;Julien F.|Strasbourg|FR;Amandine C.|Grenoble|FR;Sofiane B.|Nice|FR;Claire M.|Dijon|FR;Hugo T.|Angers|FR;Inès A.|Toulon|FR;Mathieu G.|Le Havre|FR;Sarah K.|Reims|FR;Antoine V.|Clermont-Ferrand|FR;Yasmine O.|Saint-Étienne|FR;Pierre N.|Brest|FR;Manon L.|Tours|FR;Nicolas E.|Limoges|FR;Aïcha M.|Amiens|FR;Guillaume R.|Metz|FR;Chloé B.|Besançon|FR;Adrien S.|Perpignan|FR;Nadia T.|Orléans|FR;Romain C.|Mulhouse|FR;Émilie P.|Caen|FR;Kevin A.|Nancy|FR;Salma R.|Argenteuil|FR;Benoît D.|Rouen|FR;Laura F.|Montreuil|FR;Mehdi Z.|Nanterre|FR;Céline V.|Avignon|FR;Alexandre M.|Poitiers|FR;Lucie G.|Versailles|FR;Rachid E.|Créteil|FR;Pauline H.|Pau|FR;Maxime B.|La Rochelle|FR;Nour B.|Colombes|FR;Damien L.|Vitry-sur-Seine|FR;Sabrina M.|Aubervilliers|FR;Olivier T.|Asnières|FR;Jade R.|Courbevoie|FR;Théo P.|Cergy|FR;Myriam L.|Saint-Denis|FR;Baptiste N.|Calais|FR;Anaïs D.|Béziers|FR;Samir K.|Vénissieux|FR;Justine C.|Quimper|FR;Florian M.|Valence|FR;Assia B.|Antibes|FR;Clément V.|Chambéry|FR;Marine S.|Lorient|FR;Walid H.|Roubaix|FR;Océane G.|Troyes|FR;Raphaël D.|Niort|FR;Hanane A.|Tourcoing|FR;Quentin B.|Annecy|FR;Sonia L.|Montauban|FR;Arthur F.|Saint-Nazaire|FR;Dounia M.|Évry|FR;Loïc P.|Bayonne|FR;Élise T.|Chartres|FR;Bilal S.|Sarcelles|FR;Camille V.|Belfort|FR;Nathan R.|Blois|FR;Imane C.|Meaux|FR;Gaëlle D.|Vannes|FR;Younes T.|Massy|FR;Charlotte B.|Beauvais|FR;Ismaël D.|Melun|FR;Audrey N.|Albi|FR;Farid L.|Villeurbanne|FR;Solène M.|Cholet|FR;Anis B.|Bobigny|FR;Margaux P.|Arras|FR;Zakaria E.|Drancy|FR;Estelle R.|Laval|FR;Hamza N.|Épinay|FR;Lucas D.|Bourges|FR;Rania S.|Antony|FR;Victor M.|Ajaccio|FR;Amine T.|Clichy|FR;Noémie L.|Saint-Malo|FR;Khadija B.|Aulnay|FR;Simon G.|Périgueux|FR;Meriem A.|Nîmes|FR;Baptiste R.|Agen|FR;Sofia L.|Levallois|FR;Corentin V.|Vichy|FR;Assma K.|Garges|FR;Étienne B.|Auxerre|FR;Lina M.|Ivry|FR;Paul-Henri D.|Compiègne|FR;Djamila R.|Montfermeil|FR;Grégoire T.|Saumur|FR;Wassim B.|Pantin|FR;Alice C.|Angoulême|FR;Youssef E.|Casablanca|MA;Salma B.|Rabat|MA;Mehdi A.|Marrakech|MA;Imane T.|Tanger|MA;Othmane R.|Fès|MA;Kenza L.|Agadir|MA;Anas M.|Meknès|MA;Ghita B.|Oujda|MA;Reda S.|Kénitra|MA;Nisrine H.|Tétouan|MA;Ayoub K.|Salé|MA;Hajar Z.|Mohammédia|MA;Zineb A.|El Jadida|MA;Ilyas B.|Nador|MA;Soukaina M.|Safi|MA;Badr T.|Béni Mellal|MA;Amine L.|Alger|DZ;Lydia B.|Oran|DZ;Sofiane M.|Constantine|DZ;Nesrine A.|Annaba|DZ;Yacine K.|Blida|DZ;Meriem T.|Sétif|DZ;Riad H.|Tlemcen|DZ;Amel S.|Béjaïa|DZ;Karim Z.|Batna|DZ;Sabrina D.|Tizi Ouzou|DZ;Farid B.|Sidi Bel Abbès|DZ;Naïla M.|Mostaganem|DZ;Nizar B.|Tunis|TN;Emna S.|Sfax|TN;Skander M.|Sousse|TN;Rim T.|Bizerte|TN;Aymen L.|Kairouan|TN;Ines B.|Gabès|TN;Malek H.|Monastir|TN;Dorra K.|Nabeul|TN;Hatem A.|Ariana|TN;Yosra M.|La Marsa|TN;Chaima R.|Médenine|TN;Bilel N.|Gafsa|TN;Marie-Ange L.|Bruxelles|BE;Thibault V.|Liège|BE;Sophie D.|Anvers|BE;Maxence B.|Charleroi|BE;Aurélie J.|Gand|BE;Nabil E.|Molenbeek|BE;Florence M.|Namur|BE;Jérôme C.|Bruges|BE;Céline W.|Louvain|BE;Dimitri P.|Mons|BE;Fanny R.|Tournai|BE;Ahmed B.|Schaerbeek|BE;Loïc B.|Genève|CH;Andrea S.|Lausanne|CH;Nicolas H.|Zurich|CH;Valérie M.|Fribourg|CH;Julien R.|Neuchâtel|CH;Sandra K.|Sion|CH;Patrick B.|Bâle|CH;Laetitia D.|Montreux|CH;Fabio C.|Lugano|CH;Noémie A.|Yverdon|CH;Stéphane T.|Vevey|CH;Carole G.|Nyon|CH;Marie-Ève T.|Montréal|CA;Samuel L.|Québec|CA;Andréanne G.|Laval|CA;Jean-Philippe R.|Gatineau|CA;Catherine B.|Sherbrooke|CA;Olivier D.|Longueuil|CA;Frédérique M.|Trois-Rivières|CA;Mathieu C.|Ottawa|CA;Sarah-Jeanne P.|Saguenay|CA;Vincent H.|Lévis|CA;Camille B.|Terrebonne|CA;Karim A.|Brossard|CA;Élodie N.|Toronto|CA;Antoine G.|Drummondville|CA;Rosalie F.|Granby|CA;Aminata D.|Dakar|SN;Ousmane F.|Thiès|SN;Mariama S.|Saint-Louis|SN;Cheikh N.|Ziguinchor|SN;Kouassi A.|Abidjan|CI;Aya K.|Yamoussoukro|CI;Ibrahim T.|Bouaké|CI;Nadège B.|Cocody|CI;Emma W.|Londres|GB;Oliver H.|Manchester|GB;Sofía G.|Madrid|ES;Álvaro M.|Barcelone|ES;Giulia R.|Milan|IT;Lorenzo B.|Rome|IT;Layla A.|Dubaï|AE;Omar S.|Abu Dhabi|AE'.split(';');

export const TARIFS: Record<string, [string, number]> = {
    FR:['EUR',25], BE:['EUR',25], ES:['EUR',25], IT:['EUR',25],
    CH:['CHF',24], GB:['GBP',21], CA:['CAD',37],
    MA:['MAD',270], DZ:['DZD',3600], TN:['TND',84],
    SN:['XOF',16400], CI:['XOF',16400], AE:['AED',99]
  };

export const PAYS: Record<string, string> = {FR:'France',BE:'Belgique',CH:'Suisse',CA:'Canada',MA:'Maroc',DZ:'Algérie',
    TN:'Tunisie',SN:'Sénégal',CI:"Côte d'Ivoire",GB:'Royaume-Uni',ES:'Espagne',IT:'Italie',AE:'Émirats'};

/* [nombre de documents, libellé, poids dans le tirage] */
export const COMMANDES: [number, string, number][] = [
    [12,'4 ans · trimestres',5], [8,'4 ans · semestres',5],
    [15,'5 ans · trimestres',4], [10,'5 ans · semestres',3],
    [18,'6 ans · trimestres',2], [12,'6 ans · semestres',2],
    [13,'4 ans + université',3],   [16,'5 ans + université',2],
    [9,'3 ans · trimestres',3],  [6,'3 ans · semestres',2],
    [3,'1 an · trimestres',1],   [2,'1 an · semestres',1]
  ];

/* Les prix s'entendent PAR PAGE, pas par fichier. Un bulletin de lycée en
   fait souvent deux, un livret scolaire jusqu'à six : facturer au fichier
   revenait à traduire gratuitement tout ce qui dépasse la première page. */
export const PRIX_NORMAL = 35;
export const PRIX_OFFRE = 25;

/* Option d'envoi de l'original papier, France métropolitaine.

   Le timbre nu est à 1,52 € en 2026, 2,02 € avec suivi. On facture 4,90 €
   parce que l'envoi comprend aussi l'enveloppe, l'impression de l'exemplaire
   tamponné et le dépôt en bureau de poste — et parce qu'un original perdu
   oblige à refaire la prestation entière : le suivi n'est pas une option.

   Un seul chiffre à changer ici pour ajuster le tarif partout. */
export const PRIX_ENVOI = 4.9;
/** Nombre de fichiers acceptés dans une même commande. */
export const MAX_DOCS = 40;

/* Plafond de pages par commande. Un cursus complet de quatre ans tourne
   autour de vingt pages ; au-delà de soixante, mieux vaut un échange par
   e-mail qu'un dépôt automatique. */
export const MAX_PAGES = 60;
export const FIN_OFFRE = new Date(2026, 8, 30, 23, 59, 59);
