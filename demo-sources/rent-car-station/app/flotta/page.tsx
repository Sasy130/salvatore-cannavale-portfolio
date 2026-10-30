import type { Metadata } from "next";
import { PageIntro, ContactBlock } from "@/components/layout";
import { FleetExplorer } from "@/components/catalog";
export const metadata: Metadata = { title: "Auto & scooter" };
export default function FleetPage() {
  return (
    <main id="main">
      <PageIntro
        eyebrow="AUTO & SCOOTER / NAPOLI CENTRALE"
        title={
          <>
            La direzione è tua.
            <br />
            <span className="serif">Scegli come andarci.</span>
          </>
        }
        text="Una selezione di categorie per immaginare il tuo viaggio. Il mezzo giusto si concorda con il team."
      />
      <section className="section catalog-section">
        <div className="editorial-note">
          <span className="eyebrow orange-text">
            UNA SELEZIONE, NON UNA DISPONIBILITÀ
          </span>
          <p>
            I modelli citati sono riferimenti presenti sul sito ufficiale, non
            mezzi prenotabili tramite il concept. Foto stock illustrative;
            dotazioni, tariffe e disponibilità da confermare. La selezione non
            rappresenta l’intera flotta.
          </p>
        </div>
        <FleetExplorer />
      </section>
      <ContactBlock />
    </main>
  );
}
