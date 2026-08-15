/* Données du site. Extraites de la maquette, non modifiées.
   Les avis sont RÉELS : conserver l'orthographe d'origine telle quelle. */

export type Avis = { e: number; texte: string; nom: string };

export const AVIS: Avis[] = [
    { e:5, texte:"J\u2019avais besoin d\u2019un document en anglais ( inscription dans une universit\u00e9) avec une traduction certifi\u00e9e, j\u2019ai tout fait en ligne et command\u00e9 sans suppl\u00e9ment pour acc\u00e9l\u00e9rer la traduction vu que j\u2019avais le temps, c\u2019est arriv\u00e9 en 24 heures. Nickel", nom:"Caroline J." },
    { e:5, texte:"traduction, ultrarapide, r\u00e9alis\u00e9e par un traducteur asserment\u00e9 (allemand -> fran\u00e7ais). \u00c0 recommander vivement.", nom:"Thomas W." },
    { e:5, texte:"Travail professionnel, d\u00e9lai respecter. Merci", nom:"D." },
    { e:5, texte:"Super, je suis ravie, je voulais les deux semestres de BTS traduit pour mon fils. Je pensais que \u00e7a allait prendre plusieurs jours mais au moins de 24 heures je l\u2019ai re\u00e7u.", nom:"sophie b." },
    { e:5, texte:"Je recommande vivement!! C\u2019est la deuxi\u00e8me fois je compte sur eux pour des documents. La rapidit\u00e9 et la qualit\u00e9 de leurs services et 10/10", nom:"lorea a." },
    { e:5, texte:"Protranslayte was useful when I needed a certified translation. The process felt simple, and the final document looked properly prepared.", nom:"Saif R." },
    { e:4, texte:"I needed a translated document for personal use and Protranslayte handled it well. The result was clear and delivered faster than expected.", nom:"Dave A." },
    { e:5, texte:"C\u2019est un service impeccable avec une traduction assermente parfaite et qui r\u00e9pond aux normes administratives. Bravo! Je recommande sans h\u00e9sitation.", nom:"Kristin C." },
    { e:5, texte:"Je n\u2019aurai qu\u2019un seul mot \u00e0 vous dire: Merci, oui merci infiniment! Je devais d\u00e9panner un ami avec une traduction de derni\u00e8re minute et vous avez \u00e9t\u00e9 les seuls \u00e0 \u00eatre aussi bien sur le rapport qualit\u00e9 / prix / rapidit\u00e9. Je ne pense pas qu\u2019il y ait de traducteur sur le net, alors merci encore.", nom:"Olivier" },
    { e:5, texte:"Je suis \u00e9tonnamment satisfaite de la rapidit\u00e9 de leur service de qualit\u00e9. J\u2019ai envoy\u00e9 mon document ce matin et il \u00e9tait disponible le m\u00eame jour \u00e0 18h. Ils sont tr\u00e8s \u00e0 l\u2019\u00e9coute. Prix raisonnable vraiment, je recommande fortement.", nom:"cliente" },
    { e:5, texte:"J\u2019ai fait appel \u00e0 ce site pour la traduction en anglais de mon dipl\u00f4me et de mon bulletin. J\u2019ai re\u00e7u les documents tr\u00e8s rapidement avec une traduction de grande qualit\u00e9 fid\u00e8le \u00e0 l\u2019original et certifi\u00e9e. Le service est efficace et professionnel. Je suis pleinement satisfaite et je recommande vivement.", nom:"nour a." },
    { e:4, texte:"Tr\u00e8s r\u00e9actif au niveau de la compr\u00e9hension de la demande et la r\u00e9ponse apport\u00e9e. Apr\u00e8s avoir re\u00e7u mon document dans un d\u00e9lais tr\u00e8s raisonnable, on peut toujours les contacter pour des pr\u00e9cisions et ils r\u00e9pondent tr\u00e8s vite.", nom:"Abdullah R." }
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
export const FIN_OFFRE = new Date(2026, 7, 31, 23, 59, 59);
