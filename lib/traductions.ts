import type { Langue } from './langues';

/* Les textes du site, par langue.

   CE N'EST PAS UNE TRADUCTION DU FRANÇAIS, et c'est délibéré.

   La page française vend une « traduction assermentée » : traducteur inscrit
   près une Cour d'appel, cachet, numéro d'agrément. Ce sont des notions du
   droit français, et elles ne veulent rien dire ailleurs — il n'existe aux
   États-Unis ni assermentation, ni agrément, ni registre de traducteurs. Les
   traduire mot à mot donnerait un argument incompréhensible à un athlète
   brésilien et faux devant une université américaine.

   Les trois autres langues vendent donc ce que ce public achète réellement :
   une traduction certifiée accompagnée d'un certificate of translation
   accuracy, le format qu'attendent les admissions américaines.

   Même produit, arguments différents, parce que ce ne sont pas les mêmes
   acheteurs. Quand une phrase du français change, ne pas la répercuter
   mécaniquement ici : se demander d'abord si elle a un sens pour l'autre
   public. */

export type Textes = {
  meta: { titre: string; description: string };
  nav: { process: string; documents: string; certification: string; faq: string; cta: string };
  hero: {
    eyebrow: string;
    titre: string;
    leadLong: string;
    leadCourt: string;
    puces: [string, string, string];
  };
  partenaires: { eyebrow: string; livraison: string; trackhouse: string };
  avis: { eyebrow: string; titre: string; intro: string; traduitDe: string };
  parcours: {
    eyebrow: string;
    titre: string;
    intro: string;
    etapes: [
      { titre: string; texte: string },
      { titre: string; texte: string },
      { titre: string; texte: string },
    ];
  };
  documents: {
    eyebrow: string;
    titre: string;
    texte: string;
    puces: [string, string, string];
    variantes: [string, string][];
  };
  valeur: {
    eyebrow: string;
    titre: string;
    texte: string;
    points: [string, string][];
  };
  faq: { eyebrow: string; titre: string; questions: [string, string][] };
  pied: { accroche: string; service: string; entreprise: string; support: string; suivi: string };
  legal: { mentions: string; cgv: string; confidentialite: string; contact: string };
  langue: { libelle: string };
  /* Les e-mails au client. Ils partent dans la langue où il a commandé — un
     Brésilien qui lit un site en portugais et reçoit une confirmation en
     français doute d'avoir commandé au bon endroit. */
  email: {
    sujetRecu: string;
    titreRecu: string;
    bonjour: string;
    recu: string;
    labelReference: string;
    labelATraduire: string;
    labelEnvoi: string;
    labelMontant: string;
    pages: string;
    page: string;
    livraison: string;
    papier: string;
    question: string;
    sujetPret: string;
    titrePret: string;
    pret: string;
    labelTraduit: string;
    enregistrez: string;
    certificat: string;
  };
  /* Le tunnel d'achat. Chaînes PLATES, sans fonction : ces textes traversent
     la frontière serveur/client pour atteindre la carte de commande, et une
     fonction ne se sérialise pas. Les nombres sont insérés par {n} et
     remplacés côté client. */
  tunnel: {
    devis: string;
    dossier: string;
    etape: string;
    etapes: [string, string, string];
    langueSource: string;
    langueCible: string;
    inverser: string;
    typeDocument: string;
    documentsNom: string;
    aucunDocument: string;
    deposer: string;
    deposerPlus: string;
    deposerSous: string;
    lecture: string;
    depotEnCours: string;
    parPage: string;
    coordonnees: string;
    email: string;
    prenom: string;
    nom: string;
    remarque: string;
    envoiTitre: string;
    envoiSous: string;
    adresse: string;
    codePostal: string;
    ville: string;
    payer: string;
    payerUn: string;
    reprendre: string;
    resteAPayer: string;
    deposezDabord: string;
    completerAdresse: string;
    renseignerEmail: string;
    deposerPourExpress: string;
    erreurDepot: string;
    erreurGenerale: string;
    erreurPaiement: string;
    erreurPaiementRefuse: string;
    depotImpossible: string;
    maxDocuments: string;
    portInclus: string;
    toutCompris: string;
    livraison: string;
    paiementSecurise: string;
    chiffreStripe: string;
    rembourse: string;
    chargement: string;
    commandeIntrouvable: string;
    // comparateur
    glisser: string;
    apercuBulletin: string;
    apercuDiplome: string;
    original: string;
    traduit: string;
    memeNotes: string;
    cadreConserve: string;
    ongletDiplome: string;
    ongletBulletin: string;
    legendeSuite: string;
    altOriginal: string;
    altTraduit: string;
    cta: string;
    resume: string;
    garantieTraducteur: string;
    garantiePaiement: string;
    garantieSuppression: string;
    // bandeau
    offre: string;
    masquer: string;
  };
};

/* ---------------------------------------------------------------- FRANÇAIS */
/* Le texte existant, mot pour mot. C'est le site qui tourne et qui est
   référencé : on ne le retouche pas à l'occasion d'un chantier de langues. */
const fr: Textes = {
  meta: {
    titre: 'Traduction assermentée de bulletins et diplômes — 25 € sous 48 h',
    description:
      'Traduction assermentée de bulletins de notes, relevés et diplômes. 25 € la page, livraison sous 24 à 48 h, reconnue par les universités et administrations.',
  },
  nav: {
    process: 'Comment ça marche',
    documents: 'Documents acceptés',
    certification: 'Certification',
    faq: 'FAQ',
    cta: 'Traduire mes documents',
  },
  hero: {
    eyebrow: 'Traduction assermentée de bulletins et diplômes',
    titre: 'Vos bulletins et diplômes, traduits et certifiés, sans devis à attendre.',
    leadLong:
      "Déposez vos documents, choisissez la langue d'arrivée, payez 25 € la page au lieu de 35 €. Un traducteur assermenté prend le relais — livraison sous 24 à 48 h, reconnue par les universités et administrations.",
    leadCourt:
      'Traduction assermentée en 24 à 48 h, reconnue par les universités et administrations.',
    puces: ['Traducteurs assermentés', 'Livraison 24–48h', 'Paiement sécurisé'],
  },
  partenaires: {
    eyebrow: 'Certifications & partenaires',
    livraison: 'Livraison garantie',
    trackhouse: 'Recrutement athlétique universitaire',
  },
  avis: {
    eyebrow: 'Avis clients',
    titre: 'Ils nous ont confié leur dossier',
    intro:
      'Inscriptions universitaires, diplômes, démarches administratives — voici leurs retours.',
    traduitDe: 'Traduit du français',
  },
  parcours: {
    eyebrow: 'Le parcours de votre dossier',
    titre: 'Du dépôt à la livraison, sans détour',
    intro:
      'Trois étapes, un interlocuteur : un traducteur assermenté, du premier clic à la remise du document final.',
    etapes: [
      {
        titre: 'Dépôt des documents',
        texte:
          'Vous téléversez une photo ou un scan de chaque document. Le nombre de pages est compté automatiquement, et vous réglez 25 € la page, en une fois.',
      },
      {
        titre: 'Traduction assermentée',
        texte:
          'Un traducteur assermenté traduit chaque note, appréciation et mention, puis appose son cachet officiel.',
      },
      {
        titre: 'Livraison sous 24–48h',
        texte:
          "Le PDF certifié arrive par email, prêt à être transmis à l'établissement ou l'administration destinataire.",
      },
    ],
  },
  documents: {
    eyebrow: 'Notre expertise',
    titre: "Le vocabulaire scolaire ne s'improvise pas",
    texte:
      "Coefficients, appréciations, mentions, livrets de compétences, moyennes sur 20 : autant de notions qui n'ont pas d'équivalent direct d'un pays à l'autre. Ce site est entièrement consacré aux documents scolaires, et nos traducteurs assermentés en traitent tous les jours.",
    puces: [
      'Bulletins trimestriels et semestriels',
      'Relevés de notes, livrets scolaires et diplômes',
      'Systèmes de notation français conservés et expliqués',
    ],
    variantes: [
      ['Bulletin collège', '4e, 3e — bilan trimestriel'],
      ['Bulletin lycée', 'Seconde à Terminale'],
      ['Livret scolaire', 'Suivi annuel des acquis'],
      ['Diplôme & relevé', 'Baccalauréat, licence, master'],
    ],
  },
  valeur: {
    eyebrow: 'Valeur légale',
    titre: 'Une traduction assermentée, reconnue partout où elle est présentée',
    texte:
      "Chaque traduction est réalisée par un traducteur inscrit sur la liste d'une Cour d'appel, qui engage sa responsabilité en apposant son cachet, sa signature et son numéro d'agrément.",
    points: [
      ['Cachet et signature originaux', 'Sur chaque page du document livré, au format PDF signé.'],
      ["Numéro d'agrément vérifiable", "Traducteur inscrit près d'une Cour d'appel française."],
      ['Conservation 3 ans', 'Dossier archivé pour toute demande de duplicata.'],
    ],
  },
  faq: {
    eyebrow: 'Questions fréquentes',
    titre: "Tout ce qu'il faut savoir avant de déposer vos documents",
    questions: [
      [
        'Le prix de 25 € inclut-il vraiment tout ?',
        "Oui. 25 € couvre la traduction assermentée d'une page, quelle que soit la paire de langues, la certification par un traducteur assermenté et la livraison du PDF signé par email. Le tarif s'entend par page : un bulletin recto verso compte pour deux, et le total s'affiche avant tout paiement.",
      ],
      [
        'Combien de temps pour recevoir ma traduction ?',
        "Sous 24 à 48 h ouvrées après paiement et réception d'un document lisible. Un email de confirmation est envoyé dès le dépôt du dossier.",
      ],
      [
        'Quels formats de fichiers sont acceptés ?',
        "PDF et photos jusqu'à 10 Mo par fichier. Une photo nette et bien cadrée du document suffit — pas besoin de scanner professionnel.",
      ],
      [
        'La traduction est-elle acceptée par les administrations et universités ?',
        "Oui. La traduction assermentée porte le cachet et la signature d'un traducteur agréé près d'une Cour d'appel, reconnue par les établissements scolaires, universités et administrations françaises et étrangères.",
      ],
    ],
  },
  pied: {
    accroche:
      'Traduction assermentée de bulletins, relevés et diplômes. Prix fixe, sans devis à attendre.',
    service: 'Service',
    entreprise: 'Entreprise',
    support: 'Support',
    suivi: 'Suivi de dossier',
  },
  legal: {
    mentions: 'Mentions légales',
    cgv: 'CGV',
    confidentialite: 'Confidentialité',
    contact: 'Contact',
  },
  langue: { libelle: 'Langue' },
  email: {
    sujetRecu: 'Votre demande {ref} est enregistrée',
    titreRecu: 'Votre demande est bien enregistrée',
    bonjour: 'Bonjour {prenom},',
    recu: 'Nous avons bien reçu votre demande de traduction. Elle est prise en charge.',
    labelReference: 'Référence', labelATraduire: 'À traduire', labelEnvoi: 'Envoi papier',
    labelMontant: 'Montant', pages: 'pages', page: 'page',
    livraison: '<strong>Livraison sous 24 à 48 h ouvrées.</strong> Vous recevrez le document certifié à cette même adresse.',
    papier: 'L’exemplaire papier tamponné et signé part par courrier suivi dans les 48 h qui suivent la traduction. Vous n’avez pas à l’attendre pour utiliser la version numérique.',
    question: 'Une question ? Répondez simplement à ce message en rappelant votre référence.',
    sujetPret: 'Votre traduction {ref} est prête', titrePret: 'Votre traduction est prête',
    pret: 'Votre traduction certifiée est terminée. Vous la trouverez en pièce jointe de ce message.',
    labelTraduit: 'Traduit',
    enregistrez: '<strong>Enregistrez vos fichiers dès maintenant.</strong><br>Vos documents — originaux comme traductions — sont conservés chez nous jusqu’au <strong>{date}</strong>, puis supprimés définitivement. Passé cette date, nous ne pourrons plus vous les renvoyer.',
    certificat: 'La traduction est accompagnée d’un <em>certificate of translation accuracy</em>, le format attendu par les universités américaines.',
  },
  tunnel: {
    devis: 'Devis instantané', dossier: 'DOSSIER N°', etape: 'Étape {n} sur 3',
    etapes: ['Déposez vos documents', 'Vos coordonnées', 'Prêt à payer'],
    langueSource: 'Langue source', langueCible: 'Langue souhaitée',
    inverser: 'Inverser les langues', typeDocument: 'Type de document',
    documentsNom: 'Bulletins et diplômes', aucunDocument: 'aucun document',
    deposer: 'Déposez vos documents ici', deposerPlus: 'Ajouter d’autres documents',
    deposerSous: 'Bulletins, relevés, diplômes · plusieurs fichiers à la fois',
    lecture: 'Lecture des documents…', depotEnCours: 'Vos documents finissent de se déposer…',
    parPage: 'la page', coordonnees: 'Vos coordonnées', email: 'votre@email.fr',
    prenom: 'Prénom', nom: 'Nom', remarque: 'Une précision sur votre dossier ? (facultatif)',
    envoiTitre: 'Recevoir aussi l’original par courrier',
    envoiSous: 'Envoi de l’original par courrier',
    adresse: 'Numéro et rue', codePostal: 'Code postal', ville: 'Ville',
    payer: 'Payer {montant} et faire traduire mes documents',
    payerUn: 'Payer {montant} et faire traduire mon document',
    reprendre: 'Reprendre et payer {montant}',
    resteAPayer: 'Il ne reste qu’à régler {montant}.',
    deposezDabord: 'Déposez d’abord vos documents.',
    completerAdresse: 'Complétez votre adresse postale',
    renseignerEmail: 'Renseignez votre e-mail pour payer en un geste',
    deposerPourExpress: 'Déposez vos documents pour payer en un geste',
    erreurDepot: 'Le dépôt a échoué. Réessayez.',
    erreurGenerale: 'Une erreur est survenue. Réessayez dans un instant.',
    erreurPaiement: 'Le paiement a échoué. Réessayez.',
    erreurPaiementRefuse: 'Le paiement a été refusé.',
    depotImpossible: 'Dépôt impossible', maxDocuments: 'Maximum {n} documents par commande.',
    portInclus: 'envoi de l’original inclus', toutCompris: 'tout compris',
    livraison: 'Livraison sous 24 à 48 h ouvrées', paiementSecurise: 'Paiement sécurisé',
    chiffreStripe: 'Paiement chiffré, traité par Stripe',
    rembourse: 'Satisfait ou remboursé 30 jours', chargement: 'Chargement du paiement…',
    commandeIntrouvable: 'Nous n’avons pas retrouvé votre commande',
    glisser: 'GLISSER POUR COMPARER',
    apercuBulletin: 'Voici à quoi ressemblera votre bulletin',
    apercuDiplome: 'Voici à quoi ressemblera votre diplôme',
    original: 'Original', traduit: 'Traduction assermentée',
    memeNotes: 'mêmes notes, mêmes appréciations',
    cadreConserve: 'cadre, tampon et filigrane conservés',
    cta: 'Traduire mes documents',
    resume: 'Traduction assermentée',
    garantieTraducteur: 'Traducteur assermenté, agréé Cour d’appel',
    garantiePaiement: 'Paiement chiffré — traité par Stripe',
    garantieSuppression: 'Fichiers supprimés sous {n} jours (RGPD)',
    ongletDiplome: 'Diplôme', ongletBulletin: 'Bulletin de notes',
    legendeSuite: 'mise en page fidèle à l’original. Les données personnelles ont été masquées pour cet exemple.',
    altOriginal: 'Document original', altTraduit: 'Document traduit et certifié',
    offre: 'Offre de septembre', masquer: 'Masquer cette annonce',
  },
};

/* ---------------------------------------------------------------- ANGLAIS */
/* Public : l'étudiant international qui postule aux États-Unis, et son
   entraîneur. On ne parle donc ni d'assermentation ni de Cour d'appel, mais du
   certificate of translation accuracy — le seul format qui veuille dire
   quelque chose devant un service d'admissions américain. */
const en: Textes = {
  meta: {
    titre: 'Certified transcript translation for university applications — 48 hours',
    description:
      'Certified English translations of school transcripts and diplomas, with a certificate of translation accuracy. Delivered in 24 to 48 hours, ready for your university application.',
  },
  nav: {
    process: 'How it works',
    documents: 'Documents we handle',
    certification: 'Certification',
    faq: 'FAQ',
    cta: 'Translate my documents',
  },
  hero: {
    eyebrow: 'Certified translation of school transcripts and diplomas',
    titre: 'Your transcripts, translated and certified, without waiting for a quote.',
    leadLong:
      'Upload your documents, choose the target language, and pay per page — no quote, no back and forth. Every translation comes with a certificate of translation accuracy, delivered within 24 to 48 hours and ready to submit with your application.',
    leadCourt:
      'Certified translation in 24 to 48 hours, with a certificate of accuracy accepted by universities.',
    puces: ['Certificate of accuracy', 'Delivered in 24–48h', 'Secure payment'],
  },
  partenaires: {
    eyebrow: 'Certifications & partners',
    livraison: 'Guaranteed delivery',
    trackhouse: 'College athletic recruiting',
  },
  avis: {
    eyebrow: 'Customer reviews',
    titre: 'They trusted us with their file',
    intro:
      'University applications, diplomas, official paperwork — here is what they had to say.',
    traduitDe: 'Translated from French',
  },
  parcours: {
    eyebrow: 'How your file moves',
    titre: 'From upload to delivery, nothing in between',
    intro:
      'Three steps and one point of contact, from the first click to the finished document.',
    etapes: [
      {
        titre: 'Upload your documents',
        texte:
          'Send a photo or a scan of each document. Pages are counted automatically, and you pay per page, once.',
      },
      {
        titre: 'Translation and review',
        texte:
          'Every grade, comment and honour is translated and checked, then a certificate of translation accuracy is issued for the file.',
      },
      {
        titre: 'Delivered in 24–48h',
        texte:
          'The certified PDF arrives by email, ready to upload to your university portal or hand to admissions.',
      },
    ],
  },
  documents: {
    eyebrow: 'What we do',
    titre: 'School records are their own language',
    texte:
      'Coefficients, teacher comments, honours, grades out of 20 — none of it maps cleanly from one country to another. This is all we translate, and we handle these records every day.',
    puces: [
      'Term and semester report cards',
      'Transcripts, school records and diplomas',
      'Original grading scales preserved and explained',
    ],
    variantes: [
      ['Middle school reports', 'Grades 8–9, term by term'],
      ['High school reports', 'Grades 10 through 12'],
      ['School record', 'Year-by-year academic history'],
      ['Diploma & transcript', 'Secondary diploma, bachelor, master'],
    ],
  },
  valeur: {
    eyebrow: 'What you receive',
    titre: 'A certified translation universities can act on',
    texte:
      'Each file is delivered as one document: your records in their original language, followed by the English translation, closed by a signed certificate of translation accuracy naming the translator and listing every record covered.',
    points: [
      ['Certificate of accuracy', 'Signed, dated, and listing each document it covers.'],
      ['Original alongside the translation', 'Both in one file, in the same order, page for page.'],
      ['Traceable reference', 'Every page carries a reference we can verify on request.'],
    ],
  },
  faq: {
    eyebrow: 'Frequently asked',
    titre: 'What to know before you upload',
    questions: [
      [
        'Is the price per page really everything?',
        'Yes. The price covers the translation of one page in any language pair, the certificate of translation accuracy, and delivery of the signed PDF by email. Pricing is per page: a double-sided report card counts as two, and the total is shown before you pay anything.',
      ],
      [
        'How long does it take?',
        'Within 24 to 48 business hours once payment is received and the documents are legible. A confirmation email is sent as soon as you upload.',
      ],
      [
        'Which file formats do you accept?',
        'PDF and photos, up to 10 MB per file. A sharp, well-framed phone photo is enough — no scanner required.',
      ],
      [
        'Will my university accept it?',
        'Most institutions ask for a complete and accurate English translation accompanied by a certificate of accuracy, which is exactly what we deliver. Requirements vary, so check your institution’s page — and if it asks for something specific, tell us before you order.',
      ],
    ],
  },
  pied: {
    accroche:
      'Certified translation of school transcripts, records and diplomas. Fixed price, no quote to wait for.',
    service: 'Service',
    entreprise: 'Company',
    support: 'Support',
    suivi: 'Track a file',
  },
  legal: {
    mentions: 'Legal notice',
    cgv: 'Terms of sale',
    confidentialite: 'Privacy',
    contact: 'Contact',
  },
  langue: { libelle: 'Language' },
  email: {
    sujetRecu: 'Your request {ref} has been received',
    titreRecu: 'Your request has been received',
    bonjour: 'Hi {prenom},',
    recu: 'We have received your translation request and it is now being handled.',
    labelReference: 'Reference', labelATraduire: 'To translate', labelEnvoi: 'Postal copy',
    labelMontant: 'Amount', pages: 'pages', page: 'page',
    livraison: '<strong>Delivered within 24 to 48 business hours.</strong> The certified document will arrive at this same address.',
    papier: 'The stamped paper copy is posted by tracked mail within 48 hours of the translation. You do not need to wait for it to use the digital version.',
    question: 'A question? Just reply to this message and quote your reference.',
    sujetPret: 'Your translation {ref} is ready', titrePret: 'Your translation is ready',
    pret: 'Your certified translation is complete. You will find it attached to this message.',
    labelTraduit: 'Translated',
    enregistrez: '<strong>Save your files now.</strong><br>Your documents — originals and translations alike — are kept until <strong>{date}</strong>, then permanently deleted. After that date we will no longer be able to send them to you.',
    certificat: 'The translation comes with a <em>certificate of translation accuracy</em>, the format US universities expect.',
  },
  tunnel: {
    devis: 'Instant quote', dossier: 'FILE NO.', etape: 'Step {n} of 3',
    etapes: ['Upload your documents', 'Your details', 'Ready to pay'],
    langueSource: 'From', langueCible: 'Into',
    inverser: 'Swap languages', typeDocument: 'Document type',
    documentsNom: 'Transcripts and diplomas', aucunDocument: 'no document yet',
    deposer: 'Drop your documents here', deposerPlus: 'Add more documents',
    deposerSous: 'Report cards, transcripts, diplomas · several files at once',
    lecture: 'Reading your documents…', depotEnCours: 'Your documents are still uploading…',
    parPage: 'per page', coordonnees: 'Your details', email: 'you@email.com',
    prenom: 'First name', nom: 'Last name', remarque: 'Anything we should know? (optional)',
    envoiTitre: 'Also send the stamped original by post',
    envoiSous: 'Original sent by post',
    adresse: 'Street address', codePostal: 'Postal code', ville: 'City',
    payer: 'Pay {montant} and translate my documents',
    payerUn: 'Pay {montant} and translate my document',
    reprendre: 'Resume and pay {montant}',
    resteAPayer: 'All that is left is to pay {montant}.',
    deposezDabord: 'Upload your documents first.',
    completerAdresse: 'Complete your postal address',
    renseignerEmail: 'Enter your email to pay in one tap',
    deposerPourExpress: 'Upload your documents to pay in one tap',
    erreurDepot: 'Upload failed. Please try again.',
    erreurGenerale: 'Something went wrong. Try again in a moment.',
    erreurPaiement: 'Payment failed. Please try again.',
    erreurPaiementRefuse: 'The payment was declined.',
    depotImpossible: 'Upload failed', maxDocuments: 'Up to {n} documents per order.',
    portInclus: 'postal copy included', toutCompris: 'everything included',
    livraison: 'Delivered within 24 to 48 business hours', paiementSecurise: 'Secure payment',
    chiffreStripe: 'Encrypted payment, handled by Stripe',
    rembourse: '30-day money-back guarantee', chargement: 'Loading payment…',
    commandeIntrouvable: 'We could not find your order',
    glisser: 'DRAG TO COMPARE',
    apercuBulletin: 'This is what your transcript will look like',
    apercuDiplome: 'This is what your diploma will look like',
    original: 'Original', traduit: 'Certified translation',
    memeNotes: 'same grades, same comments',
    cadreConserve: 'layout, stamp and watermark preserved',
    cta: 'Translate my documents',
    resume: 'Certified translation',
    garantieTraducteur: 'Certificate of translation accuracy included',
    garantiePaiement: 'Encrypted payment — handled by Stripe',
    garantieSuppression: 'Files deleted within {n} days (GDPR)',
    ongletDiplome: 'Diploma', ongletBulletin: 'Transcript',
    legendeSuite: 'layout faithful to the original. Personal details have been masked for this example.',
    altOriginal: 'Original document', altTraduit: 'Translated and certified document',
    offre: 'September offer', masquer: 'Hide this announcement',
  },
};

/* ---------------------------------------------------------------- ESPAGNOL */
const es: Textes = {
  meta: {
    titre: 'Traducción certificada de boletines y títulos — en 48 horas',
    description:
      'Traducción certificada al inglés de boletines, certificados de notas y títulos, con certificado de exactitud. Entrega en 24 a 48 horas, lista para tu solicitud universitaria.',
  },
  nav: {
    process: 'Cómo funciona',
    documents: 'Documentos que traducimos',
    certification: 'Certificación',
    faq: 'Preguntas',
    cta: 'Traducir mis documentos',
  },
  hero: {
    eyebrow: 'Traducción certificada de boletines y títulos',
    titre: 'Tus notas y títulos, traducidos y certificados, sin esperar presupuesto.',
    leadLong:
      'Sube tus documentos, elige el idioma de destino y paga por página — sin presupuesto ni idas y venidas. Cada traducción incluye un certificado de exactitud, se entrega en 24 a 48 horas y está lista para tu solicitud.',
    leadCourt:
      'Traducción certificada en 24 a 48 horas, con certificado de exactitud aceptado por las universidades.',
    puces: ['Certificado de exactitud', 'Entrega en 24–48 h', 'Pago seguro'],
  },
  partenaires: {
    eyebrow: 'Certificaciones y socios',
    livraison: 'Entrega garantizada',
    trackhouse: 'Reclutamiento deportivo universitario',
  },
  avis: {
    eyebrow: 'Opiniones',
    titre: 'Nos confiaron su expediente',
    intro:
      'Solicitudes universitarias, títulos, trámites oficiales — esto es lo que dijeron.',
    traduitDe: 'Traducido del francés',
  },
  parcours: {
    eyebrow: 'El recorrido de tu expediente',
    titre: 'De la carga a la entrega, sin rodeos',
    intro: 'Tres pasos y un solo interlocutor, del primer clic al documento final.',
    etapes: [
      {
        titre: 'Sube tus documentos',
        texte:
          'Envía una foto o un escaneo de cada documento. Las páginas se cuentan automáticamente y pagas por página, una sola vez.',
      },
      {
        titre: 'Traducción y revisión',
        texte:
          'Se traduce y se revisa cada nota, comentario y mención, y se emite un certificado de exactitud para el expediente.',
      },
      {
        titre: 'Entrega en 24–48 h',
        texte:
          'El PDF certificado llega por correo, listo para subirlo al portal de tu universidad o entregarlo en admisiones.',
      },
    ],
  },
  documents: {
    eyebrow: 'Nuestra especialidad',
    titre: 'El vocabulario escolar no se improvisa',
    texte:
      'Coeficientes, comentarios del profesorado, menciones, notas sobre 20: nada de eso tiene equivalente directo de un país a otro. Este sitio se dedica únicamente a documentos escolares, y los tratamos a diario.',
    puces: [
      'Boletines trimestrales y semestrales',
      'Certificados de notas, expedientes y títulos',
      'Sistemas de calificación conservados y explicados',
    ],
    variantes: [
      ['Boletín de secundaria', 'Últimos cursos, por trimestre'],
      ['Boletín de bachillerato', 'Los tres cursos'],
      ['Expediente académico', 'Historial anual completo'],
      ['Título y certificado', 'Bachillerato, grado, máster'],
    ],
  },
  valeur: {
    eyebrow: 'Lo que recibes',
    titre: 'Una traducción certificada que la universidad puede aceptar',
    texte:
      'El expediente se entrega en un solo documento: tus registros en su idioma original, seguidos de la traducción al inglés, y al final un certificado de exactitud firmado que nombra al traductor y enumera cada documento cubierto.',
    points: [
      ['Certificado de exactitud', 'Firmado, fechado, y con la lista de los documentos que cubre.'],
      ['Original junto a la traducción', 'Todo en un archivo, en el mismo orden, página por página.'],
      ['Referencia verificable', 'Cada página lleva una referencia que podemos comprobar.'],
    ],
  },
  faq: {
    eyebrow: 'Preguntas frecuentes',
    titre: 'Lo que conviene saber antes de subir tus documentos',
    questions: [
      [
        '¿El precio por página lo incluye todo?',
        'Sí. Cubre la traducción de una página en cualquier par de idiomas, el certificado de exactitud y la entrega del PDF firmado por correo. El precio es por página: un boletín a doble cara cuenta como dos, y el total aparece antes de pagar.',
      ],
      [
        '¿Cuánto tarda?',
        'Entre 24 y 48 horas hábiles desde el pago, siempre que los documentos sean legibles. Recibes un correo de confirmación en cuanto subes el expediente.',
      ],
      [
        '¿Qué formatos aceptan?',
        'PDF y fotos, hasta 10 MB por archivo. Basta una foto nítida y bien encuadrada — no hace falta escáner.',
      ],
      [
        '¿Lo aceptará mi universidad?',
        'La mayoría de las instituciones piden una traducción completa y fiel al inglés acompañada de un certificado de exactitud, que es exactamente lo que entregamos. Los requisitos varían: consulta la página de tu universidad y, si pide algo concreto, dínoslo antes de pedir.',
      ],
    ],
  },
  pied: {
    accroche:
      'Traducción certificada de boletines, certificados de notas y títulos. Precio fijo, sin presupuesto que esperar.',
    service: 'Servicio',
    entreprise: 'Empresa',
    support: 'Ayuda',
    suivi: 'Seguimiento',
  },
  legal: {
    mentions: 'Aviso legal',
    cgv: 'Condiciones de venta',
    confidentialite: 'Privacidad',
    contact: 'Contacto',
  },
  langue: { libelle: 'Idioma' },
  email: {
    sujetRecu: 'Tu solicitud {ref} ha sido registrada',
    titreRecu: 'Tu solicitud ha sido registrada',
    bonjour: 'Hola {prenom}:',
    recu: 'Hemos recibido tu solicitud de traducción y ya está en marcha.',
    labelReference: 'Referencia', labelATraduire: 'A traducir', labelEnvoi: 'Envío postal',
    labelMontant: 'Importe', pages: 'páginas', page: 'página',
    livraison: '<strong>Entrega en 24 a 48 horas hábiles.</strong> Recibirás el documento certificado en esta misma dirección.',
    papier: 'El ejemplar en papel sellado y firmado se envía por correo con seguimiento dentro de las 48 horas siguientes a la traducción. No hace falta esperarlo para usar la versión digital.',
    question: '¿Alguna duda? Responde a este mensaje indicando tu referencia.',
    sujetPret: 'Tu traducción {ref} está lista', titrePret: 'Tu traducción está lista',
    pret: 'Tu traducción certificada está terminada. La encontrarás adjunta a este mensaje.',
    labelTraduit: 'Traducido',
    enregistrez: '<strong>Guarda tus archivos ahora.</strong><br>Tus documentos — originales y traducciones — se conservan hasta el <strong>{date}</strong> y después se eliminan definitivamente. Pasada esa fecha ya no podremos reenviártelos.',
    certificat: 'La traducción va acompañada de un <em>certificate of translation accuracy</em>, el formato que esperan las universidades estadounidenses.',
  },
  tunnel: {
    devis: 'Presupuesto inmediato', dossier: 'EXPEDIENTE N.º', etape: 'Paso {n} de 3',
    etapes: ['Sube tus documentos', 'Tus datos', 'Listo para pagar'],
    langueSource: 'Desde', langueCible: 'A',
    inverser: 'Invertir los idiomas', typeDocument: 'Tipo de documento',
    documentsNom: 'Boletines y títulos', aucunDocument: 'ningún documento',
    deposer: 'Suelta aquí tus documentos', deposerPlus: 'Añadir más documentos',
    deposerSous: 'Boletines, certificados, títulos · varios archivos a la vez',
    lecture: 'Leyendo tus documentos…', depotEnCours: 'Tus documentos se están subiendo…',
    parPage: 'por página', coordonnees: 'Tus datos', email: 'tu@email.com',
    prenom: 'Nombre', nom: 'Apellidos', remarque: '¿Algo que debamos saber? (opcional)',
    envoiTitre: 'Recibir también el original por correo',
    envoiSous: 'Envío del original por correo',
    adresse: 'Calle y número', codePostal: 'Código postal', ville: 'Ciudad',
    payer: 'Pagar {montant} y traducir mis documentos',
    payerUn: 'Pagar {montant} y traducir mi documento',
    reprendre: 'Retomar y pagar {montant}',
    resteAPayer: 'Solo queda pagar {montant}.',
    deposezDabord: 'Sube primero tus documentos.',
    completerAdresse: 'Completa tu dirección postal',
    renseignerEmail: 'Introduce tu correo para pagar en un gesto',
    deposerPourExpress: 'Sube tus documentos para pagar en un gesto',
    erreurDepot: 'La subida falló. Inténtalo de nuevo.',
    erreurGenerale: 'Algo salió mal. Inténtalo en un momento.',
    erreurPaiement: 'El pago falló. Inténtalo de nuevo.',
    erreurPaiementRefuse: 'El pago fue rechazado.',
    depotImpossible: 'Subida imposible', maxDocuments: 'Máximo {n} documentos por pedido.',
    portInclus: 'original por correo incluido', toutCompris: 'todo incluido',
    livraison: 'Entrega en 24 a 48 horas hábiles', paiementSecurise: 'Pago seguro',
    chiffreStripe: 'Pago cifrado, gestionado por Stripe',
    rembourse: 'Devolución garantizada 30 días', chargement: 'Cargando el pago…',
    commandeIntrouvable: 'No hemos encontrado tu pedido',
    glisser: 'ARRASTRA PARA COMPARAR',
    apercuBulletin: 'Así se verá tu boletín',
    apercuDiplome: 'Así se verá tu título',
    original: 'Original', traduit: 'Traducción certificada',
    memeNotes: 'mismas notas, mismos comentarios',
    cadreConserve: 'formato, sello y filigrana conservados',
    cta: 'Traducir mis documentos',
    resume: 'Traducción certificada',
    garantieTraducteur: 'Certificado de exactitud incluido',
    garantiePaiement: 'Pago cifrado — gestionado por Stripe',
    garantieSuppression: 'Archivos eliminados en {n} días (RGPD)',
    ongletDiplome: 'Título', ongletBulletin: 'Boletín de notas',
    legendeSuite: 'diseño fiel al original. Los datos personales se han ocultado en este ejemplo.',
    altOriginal: 'Documento original', altTraduit: 'Documento traducido y certificado',
    offre: 'Oferta de septiembre', masquer: 'Ocultar este aviso',
  },
};

/* --------------------------------------------------------------- PORTUGAIS */
/* Portugais du Brésil : c'est de là que viennent les athlètes, et les mots ne
   sont pas ceux du Portugal — « histórico escolar », « boletim », « ensino
   médio ». */
const pt: Textes = {
  meta: {
    titre: 'Tradução certificada de boletins e diplomas — em 48 horas',
    description:
      'Tradução certificada para o inglês de boletins, históricos escolares e diplomas, com certificado de exatidão. Entrega em 24 a 48 horas, pronta para sua candidatura.',
  },
  nav: {
    process: 'Como funciona',
    documents: 'Documentos que traduzimos',
    certification: 'Certificação',
    faq: 'Dúvidas',
    cta: 'Traduzir meus documentos',
  },
  hero: {
    eyebrow: 'Tradução certificada de boletins e diplomas',
    titre: 'Seu histórico escolar, traduzido e certificado, sem esperar orçamento.',
    leadLong:
      'Envie seus documentos, escolha o idioma de destino e pague por página — sem orçamento e sem idas e vindas. Cada tradução vem com um certificado de exatidão, entregue em 24 a 48 horas e pronta para a sua candidatura.',
    leadCourt:
      'Tradução certificada em 24 a 48 horas, com certificado de exatidão aceito pelas universidades.',
    puces: ['Certificado de exatidão', 'Entrega em 24–48 h', 'Pagamento seguro'],
  },
  partenaires: {
    eyebrow: 'Certificações e parceiros',
    livraison: 'Entrega garantida',
    trackhouse: 'Recrutamento esportivo universitário',
  },
  avis: {
    eyebrow: 'Avaliações',
    titre: 'Eles confiaram o histórico a nós',
    intro:
      'Candidaturas universitárias, diplomas, documentação oficial — veja o que disseram.',
    traduitDe: 'Traduzido do francês',
  },
  parcours: {
    eyebrow: 'O caminho do seu documento',
    titre: 'Do envio à entrega, sem desvios',
    intro: 'Três etapas e um só interlocutor, do primeiro clique ao documento final.',
    etapes: [
      {
        titre: 'Envie seus documentos',
        texte:
          'Mande uma foto ou um escaneamento de cada documento. As páginas são contadas automaticamente e você paga por página, uma única vez.',
      },
      {
        titre: 'Tradução e revisão',
        texte:
          'Cada nota, comentário e menção é traduzido e conferido, e um certificado de exatidão é emitido para o conjunto.',
      },
      {
        titre: 'Entrega em 24–48 h',
        texte:
          'O PDF certificado chega por e-mail, pronto para enviar ao portal da universidade ou entregar na secretaria.',
      },
    ],
  },
  documents: {
    eyebrow: 'Nossa especialidade',
    titre: 'O vocabulário escolar não se improvisa',
    texte:
      'Cargas horárias, pareceres dos professores, menções, notas de 0 a 10 ou de 0 a 20: nada disso tem equivalente direto de um país para outro. Este site cuida apenas de documentos escolares, e lidamos com eles todos os dias.',
    puces: [
      'Boletins bimestrais e semestrais',
      'Históricos escolares e diplomas',
      'Sistemas de notas preservados e explicados',
    ],
    variantes: [
      ['Boletim do fundamental', 'Últimos anos, por bimestre'],
      ['Boletim do ensino médio', 'Os três anos'],
      ['Histórico escolar', 'Percurso ano a ano'],
      ['Diploma e histórico', 'Ensino médio, graduação, mestrado'],
    ],
  },
  valeur: {
    eyebrow: 'O que você recebe',
    titre: 'Uma tradução certificada que a universidade aceita',
    texte:
      'O conjunto é entregue em um único documento: seus registros no idioma original, seguidos da tradução em inglês, e ao final um certificado de exatidão assinado que nomeia o tradutor e lista cada documento coberto.',
    points: [
      ['Certificado de exatidão', 'Assinado, datado e com a lista dos documentos que cobre.'],
      ['Original ao lado da tradução', 'Tudo em um arquivo, na mesma ordem, página por página.'],
      ['Referência verificável', 'Cada página traz uma referência que podemos conferir.'],
    ],
  },
  faq: {
    eyebrow: 'Perguntas frequentes',
    titre: 'O que saber antes de enviar seus documentos',
    questions: [
      [
        'O preço por página inclui tudo mesmo?',
        'Sim. Cobre a tradução de uma página em qualquer par de idiomas, o certificado de exatidão e a entrega do PDF assinado por e-mail. O preço é por página: um boletim frente e verso conta como dois, e o total aparece antes de qualquer pagamento.',
      ],
      [
        'Quanto tempo leva?',
        'De 24 a 48 horas úteis após o pagamento, desde que os documentos estejam legíveis. Um e-mail de confirmação é enviado assim que você faz o envio.',
      ],
      [
        'Quais formatos vocês aceitam?',
        'PDF e fotos, até 10 MB por arquivo. Uma foto nítida e bem enquadrada basta — não precisa de scanner.',
      ],
      [
        'Minha universidade vai aceitar?',
        'A maioria das instituições pede uma tradução completa e fiel para o inglês acompanhada de um certificado de exatidão, que é exatamente o que entregamos. As exigências variam: confira a página da sua universidade e, se ela pedir algo específico, avise antes de pedir.',
      ],
    ],
  },
  pied: {
    accroche:
      'Tradução certificada de boletins, históricos e diplomas. Preço fixo, sem orçamento para esperar.',
    service: 'Serviço',
    entreprise: 'Empresa',
    support: 'Suporte',
    suivi: 'Acompanhar',
  },
  legal: {
    mentions: 'Aviso legal',
    cgv: 'Condições de venda',
    confidentialite: 'Privacidade',
    contact: 'Contato',
  },
  langue: { libelle: 'Idioma' },
  email: {
    sujetRecu: 'Seu pedido {ref} foi registrado',
    titreRecu: 'Seu pedido foi registrado',
    bonjour: 'Olá {prenom},',
    recu: 'Recebemos seu pedido de tradução e já estamos cuidando dele.',
    labelReference: 'Referência', labelATraduire: 'A traduzir', labelEnvoi: 'Envio postal',
    labelMontant: 'Valor', pages: 'páginas', page: 'página',
    livraison: '<strong>Entrega em 24 a 48 horas úteis.</strong> Você receberá o documento certificado neste mesmo endereço.',
    papier: 'A via impressa carimbada e assinada segue por correio rastreado nas 48 horas após a tradução. Não é preciso esperá-la para usar a versão digital.',
    question: 'Alguma dúvida? Basta responder a esta mensagem informando sua referência.',
    sujetPret: 'Sua tradução {ref} está pronta', titrePret: 'Sua tradução está pronta',
    pret: 'Sua tradução certificada está concluída. Você a encontra em anexo nesta mensagem.',
    labelTraduit: 'Traduzido',
    enregistrez: '<strong>Salve seus arquivos agora.</strong><br>Seus documentos — originais e traduções — ficam conosco até <strong>{date}</strong> e depois são apagados definitivamente. Após essa data não poderemos reenviá-los.',
    certificat: 'A tradução vem acompanhada de um <em>certificate of translation accuracy</em>, o formato esperado pelas universidades americanas.',
  },
  tunnel: {
    devis: 'Orçamento na hora', dossier: 'PROCESSO N.º', etape: 'Etapa {n} de 3',
    etapes: ['Envie seus documentos', 'Seus dados', 'Pronto para pagar'],
    langueSource: 'De', langueCible: 'Para',
    inverser: 'Inverter os idiomas', typeDocument: 'Tipo de documento',
    documentsNom: 'Boletins e diplomas', aucunDocument: 'nenhum documento',
    deposer: 'Solte seus documentos aqui', deposerPlus: 'Adicionar mais documentos',
    deposerSous: 'Boletins, históricos, diplomas · vários arquivos de uma vez',
    lecture: 'Lendo seus documentos…', depotEnCours: 'Seus documentos ainda estão subindo…',
    parPage: 'por página', coordonnees: 'Seus dados', email: 'voce@email.com',
    prenom: 'Nome', nom: 'Sobrenome', remarque: 'Algo que devemos saber? (opcional)',
    envoiTitre: 'Receber também o original pelo correio',
    envoiSous: 'Envio do original pelo correio',
    adresse: 'Rua e número', codePostal: 'CEP', ville: 'Cidade',
    payer: 'Pagar {montant} e traduzir meus documentos',
    payerUn: 'Pagar {montant} e traduzir meu documento',
    reprendre: 'Retomar e pagar {montant}',
    resteAPayer: 'Falta apenas pagar {montant}.',
    deposezDabord: 'Envie primeiro seus documentos.',
    completerAdresse: 'Complete seu endereço',
    renseignerEmail: 'Informe seu e-mail para pagar num toque',
    deposerPourExpress: 'Envie seus documentos para pagar num toque',
    erreurDepot: 'O envio falhou. Tente novamente.',
    erreurGenerale: 'Algo deu errado. Tente daqui a pouco.',
    erreurPaiement: 'O pagamento falhou. Tente novamente.',
    erreurPaiementRefuse: 'O pagamento foi recusado.',
    depotImpossible: 'Envio impossível', maxDocuments: 'No máximo {n} documentos por pedido.',
    portInclus: 'original pelo correio incluído', toutCompris: 'tudo incluído',
    livraison: 'Entrega em 24 a 48 horas úteis', paiementSecurise: 'Pagamento seguro',
    chiffreStripe: 'Pagamento criptografado, processado pela Stripe',
    rembourse: 'Reembolso garantido em 30 dias', chargement: 'Carregando o pagamento…',
    commandeIntrouvable: 'Não encontramos seu pedido',
    glisser: 'ARRASTE PARA COMPARAR',
    apercuBulletin: 'É assim que seu boletim vai ficar',
    apercuDiplome: 'É assim que seu diploma vai ficar',
    original: 'Original', traduit: 'Tradução certificada',
    memeNotes: 'mesmas notas, mesmos comentários',
    cadreConserve: 'layout, carimbo e marca-d’água preservados',
    cta: 'Traduzir meus documentos',
    resume: 'Tradução certificada',
    garantieTraducteur: 'Certificado de exatidão incluído',
    garantiePaiement: 'Pagamento criptografado — processado pela Stripe',
    garantieSuppression: 'Arquivos apagados em {n} dias (RGPD)',
    ongletDiplome: 'Diploma', ongletBulletin: 'Boletim',
    legendeSuite: 'layout fiel ao original. Os dados pessoais foram ocultados neste exemplo.',
    altOriginal: 'Documento original', altTraduit: 'Documento traduzido e certificado',
    offre: 'Oferta de setembro', masquer: 'Ocultar este aviso',
  },
};

export const TEXTES: Record<Langue, Textes> = { fr, en, es, pt };

export const textes = (langue: Langue) => TEXTES[langue];

/* Le sous-ensemble que reçoivent les composants du tunnel. Ils sont clients :
   ils ne peuvent pas appeler `textes()` eux-mêmes, la langue vient d'un
   segment d'adresse que seul le serveur connaît. On leur passe donc ces
   chaînes en propriété. */
export type Tunnel = Textes['tunnel'];
