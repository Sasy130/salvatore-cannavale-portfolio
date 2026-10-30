import type {Metadata} from 'next';
import {FleetExplorer} from '@/components/fleet';
import {BookingForm} from '@/components/booking';
import {Contact} from '@/components/site';
export const metadata:Metadata={title:'La flotta'};
export default function FleetPage(){return <main id="main"><section className="page-intro section"><span className="eyebrow">A&J RENT CAR / LA FLOTTA</span><h1>Il viaggio è tuo.<br/><em>Anche la scelta.</em></h1><div className="page-intro-bottom"><p>Auto o scooter. Un weekend in città o una nuova strada da scoprire.<br/>Trova l’ispirazione per la tua prossima partenza.</p><span className="outline-badge">CATALOGO DIMOSTRATIVO</span></div></section><section className="section fleet-catalog"><div className="catalog-note"><strong>Una proposta di presentazione della flotta.</strong><p>Le categorie e le fotografie seguenti sono illustrative: non rappresentano un inventario verificato. Modelli, caratteristiche, tariffe e disponibilità devono essere confermati dall’attività.</p></div><FleetExplorer/></section><BookingForm/><Contact/></main>}
