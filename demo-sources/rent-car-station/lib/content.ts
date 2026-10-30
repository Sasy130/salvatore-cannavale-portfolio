export const brand = {
  name: "Rent Car Station",
  address: "Corso Arnaldo Lucci, 173",
  city: "80142 Napoli",
  phone: "+393347121252",
  phoneLabel: "+39 334 712 1252",
  email: "info@rentcarstation.it",
  vat: "03139590214",
  official: "https://rentcarstation.it/",
};
export const vehicles = [
  {
    slug: "citycar",
    name: "Piccola auto. Grandi giornate.",
    label: "Citycar",
    type: "Auto",
    category: "Compatta",
    model: "Fiat 500 o similare",
    image: "/demos/rent-car-station/images/fiat.webp",
    imageAlt: "Fiat 500, foto stock illustrativa",
    description:
      "Per un weekend in città o una deviazione verso il mare. Una categoria compatta da concordare con il team.",
    reference: "https://rentcarstation.it/noleggio-auto/",
  },
  {
    slug: "scooter",
    name: "Due ruote. Tutta Napoli.",
    label: "Scooter",
    type: "Scooter",
    category: "Due ruote",
    model: "Vespa 125 o similare",
    image: "/demos/rent-car-station/images/vespa.webp",
    imageAlt:
      "Vespa arancione, foto stock illustrativa di una versione diversa dal mezzo da confermare",
    description:
      "Lasciati ispirare dai vicoli, dalle piazze e dal lungomare. Chiedi al team il mezzo e i requisiti adatti al tuo percorso.",
    reference: "https://rentcarstation.it/noleggio-scooter/",
  },
];
export type Vehicle = (typeof vehicles)[number];
export const faqs = [
  {
    q: "Come posso richiedere un veicolo?",
    a: "Nel concept puoi provare il modulo e ottenere un riepilogo locale. Per una richiesta reale, contatta Rent Car Station tramite i recapiti ufficiali: il team confermerà disponibilità, preventivo e condizioni.",
  },
  {
    q: "Posso scegliere un modello preciso?",
    a: "Il sito ufficiale presenta veicoli per categoria e indica modelli “o similari”. Il modello effettivo va confermato con l’attività. Le fotografie del concept sono stock illustrative.",
  },
  {
    q: "Quali documenti, cauzione e carte servono?",
    a: "Prima della prenotazione verifica con il team patente richiesta, età minima, documenti, carte accettate, deposito e coperture. Il concept non sostituisce le condizioni contrattuali dell’attività.",
  },
  {
    q: "Dove si trova la sede?",
    a: "L’indirizzo riportato sul sito ufficiale è Corso Arnaldo Lucci, 173, Napoli, in zona Stazione Centrale. Concorda direttamente luogo e orario di ritiro.",
  },
  {
    q: "Posso lasciare anche i bagagli?",
    a: "Sì, il deposito bagagli è un servizio presentato sul sito ufficiale. Dimensioni ammesse, orari, tariffe e disponibilità vanno verificati direttamente con l’attività.",
  },
];
export const services = {
  bagagli: {
    eyebrow: "DEPOSITO BAGAGLI / NAPOLI CENTRALE",
    title: "Lascia le valigie.\nTieni la giornata.",
    lead: "Il treno parte più tardi? C’è ancora una città da scoprire.",
    text: "Rent Car Station presenta un servizio di deposito bagagli in zona Napoli Centrale. Contatta il team per concordare consegna, ritiro e condizioni.",
    image: "/demos/rent-car-station/images/bagagli.webp",
    alt: "Bagagli e viaggiatori, foto stock illustrativa",
    points: [
      "Sede in Corso Arnaldo Lucci, 173",
      "Richieste per una giornata o più giorni",
      "Orari, dimensioni e tariffe da confermare",
    ],
    request: "bagagli",
    source: "https://rentcarstation.it/deposito-bagagli-napoli/",
  },
  tour: {
    eyebrow: "ESPERIENZE / NAPOLI, POMPEI, AMALFI",
    title: "Non fermarti\nalla destinazione.",
    lead: "Una città da sentire. Una storia da attraversare. Un orizzonte da inseguire.",
    text: "Sul sito ufficiale trovi proposte dedicate a Napoli, Pompei e alla Costiera Amalfitana. Chiedi al team itinerario, modalità di svolgimento, accompagnamento e requisiti.",
    image: "/demos/rent-car-station/images/road.webp",
    alt: "Strada e mare lungo la Costiera Amalfitana, foto stock illustrativa",
    points: [
      "Proposte per Napoli, Pompei e Costiera",
      "Itinerario e modalità da concordare",
      "Nessuna data o tariffa simulata",
    ],
    request: "tour",
    source: "https://rentcarstation.it/servizi/",
  },
};
