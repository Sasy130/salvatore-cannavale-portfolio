import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
export const metadata: Metadata = {
  title: {
    default: "Rent Car Station — Napoli, si parte. | Concept",
    template: "%s | Rent Car Station — Concept",
  },
  description:
    "Proposta indipendente di redesign per Rent Car Station Napoli. Auto, scooter, deposito bagagli ed esperienze in un nuovo percorso digitale.",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.svg" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <a href="#main" className="skip">
          Vai al contenuto
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
