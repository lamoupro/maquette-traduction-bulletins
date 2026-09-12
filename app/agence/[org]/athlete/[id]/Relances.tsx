'use client';

import RelanceWhatsApp from '@/components/portail/RelanceWhatsApp';

/* Les deux boutons de relance, qui notent au passage qu'un message est parti.

   Ils n'envoient rien eux-mêmes : ils ouvrent WhatsApp ou la messagerie avec
   le texte déjà écrit, et c'est la personne qui appuie sur « envoyer ». C'est
   voulu — le message part de son numéro et de son adresse, pas des nôtres, et
   l'étudiant répond à quelqu'un qu'il connaît.

   Ce qu'on note, c'est donc « une relance a été déclenchée », pas « un message
   a été remis ». La nuance compte pour ce qu'on affiche : on dit la date, pas
   un accusé de réception qu'on n'a pas. */

export default function Relances({
  texte,
  telephone,
  adresseEmail,
  onRappel,
}: {
  texte: string;
  telephone?: string;
  adresseEmail: string;
  onRappel: (canal: 'email' | 'whatsapp') => Promise<void>;
}) {
  return (
    <div className="pt-relance">
      <RelanceWhatsApp
        texte={texte}
        telephone={telephone}
        avant={() => {
          void onRappel('whatsapp');
        }}
        enfants="Remind on WhatsApp"
      />
      <a
        className="pt-bouton"
        href={adresseEmail}
        onClick={() => {
          void onRappel('email');
        }}
      >
        Remind by email
      </a>
    </div>
  );
}
