import type { Metadata } from "next";
import Link from "@/components/static-link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Info, Check, MapPin } from "lucide-react";
import { vehicles, faqs } from "@/lib/content";
import { VehicleRequestLink } from "@/components/catalog";
import { FAQ, ContactBlock } from "@/components/layout";
export function generateStaticParams() {
  return vehicles.map((v) => ({ slug: v.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: vehicles.find((v) => v.slug === slug)?.label || "Categoria" };
}
export default async function Detail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const v = vehicles.find((v) => v.slug === slug);
  if (!v) notFound();
  return (
    <main id="main">
      <section className="section vehicle-detail">
        <Link href="/flotta/" className="text-link back">
          <ArrowLeft size={16} /> Tutte le categorie
        </Link>
        <div className="detail-grid">
          <div className="detail-photo">
            <img src={v.image} alt={v.imageAlt} width="1400" height="1000" />
            <span className="image-label">
              FOTO STOCK ILLUSTRATIVA · NON È IL MEZZO PRENOTATO
            </span>
            <span className="detail-photo-label">
              {v.type === "Auto" ? "01" : "02"}
              <span>{v.type.toUpperCase()}</span>
            </span>
          </div>
          <div className="detail-copy">
            <span className="eyebrow orange-text">
              {v.type} / {v.category} / CONCEPT
            </span>
            <h1>
              {v.name.split(". ")[0]}.<br />
              <span className="serif">
                {v.name.split(". ").slice(1).join(". ")}
              </span>
            </h1>
            <p>{v.description}</p>
            <div className="model-reference">
              <span className="eyebrow">
                ESEMPIO PUBBLICATO SUL SITO UFFICIALE
              </span>
              <strong>{v.model}</strong>
              <a href={v.reference} target="_blank" rel="noreferrer">
                Verifica la fonte <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="detail-meta">
              <p>
                <MapPin size={16} /> Sede: zona Napoli Centrale
              </p>
              <p>
                <Check size={16} /> Modello e dotazioni da concordare
              </p>
              <p>
                <Info size={16} /> Nessun prezzo o stock simulato
              </p>
            </div>
            <VehicleRequestLink type={v.type} slug={v.slug} />
            <p className="fine-print">
              La foto può mostrare una versione diversa. Nessun modello
              specifico viene garantito dal concept.
            </p>
          </div>
        </div>
      </section>
      <section className="section faq-section detail-faq">
        <div>
          <span className="eyebrow orange-text">PRIMA DI PARTIRE</span>
          <h2>
            Tutto chiaro.
            <br />
            <span className="serif">Fin dall’inizio.</span>
          </h2>
        </div>
        <FAQ items={faqs.slice(0, 4)} />
      </section>
      <ContactBlock />
    </main>
  );
}
