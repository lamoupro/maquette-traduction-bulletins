/* Marque, partagée entre la page d'accueil et les pages légales. Le balisage
   est identique à celui de la maquette : ne pas y toucher sans vérifier
   l'en-tête et le pied de page sur mobile. */
export default function Logo() {
  return (
    <div className="logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="seal" src="/logo.svg" width={30} height={30} alt="" aria-hidden="true" />
      <span className="lg">
        <span className="lg-a">pro</span>
        <span className="lg-b">translayte</span>
      </span>
    </div>
  );
}
