import type { Metadata } from 'next';
import './globals.css';
import { Navbar, Footer } from '@/components/site';
export const metadata: Metadata = {title: {default:'A&J Rent Car | Napoli, al tuo ritmo — Concept', template:'%s | A&J Rent Car — Concept'}, description:'Proposta indipendente di redesign per A&J Rent Car a Napoli. Auto, scooter e tour: esplora il concept e prova la richiesta dimostrativa.', icons:{icon:'/icon.svg'}, robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="it"><body><a className="skip-link" href="#main">Vai al contenuto</a><Navbar/>{children}<Footer/></body></html>}
