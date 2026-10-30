import type { Metadata } from "next";
import { PageIntro, ContactBlock } from "@/components/layout";
import { RequestForm } from "@/components/request";
export const metadata: Metadata = { title: "Organizza il viaggio — demo" };
export default function RequestPage() {
  return (
    <main id="main">
      <PageIntro
        eyebrow="LA TUA PROSSIMA PARTENZA / DEMO"
        title={
          <>
            Metti in moto
            <br />
            <span className="serif">la tua idea.</span>
          </>
        }
        text="Auto, scooter, bagagli o tour. Prova il nuovo percorso di richiesta, un passo alla volta."
      />
      <section className="section request-section">
        <RequestForm />
      </section>
      <ContactBlock />
    </main>
  );
}
