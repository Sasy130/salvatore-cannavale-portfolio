export const categories = [
  { id: "classiche", label: "Le classiche" },
  { id: "speciali", label: "Le speciali" },
  { id: "fritti", label: "Fritti" },
  { id: "bevande", label: "Bevande" },
] as const;

export type MenuCategory = (typeof categories)[number]["id"];

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategory;
  description: string;
  ingredients: string[];
  allergens: string[];
  /** Importi illustrativi in euro; null nasconde il prezzo numerico. */
  price: number | null;
  image?: string;
  alt?: string;
};

// Ricette, prezzi e allergeni dimostrativi: non costituiscono un'offerta reale.
// Confermare ingredienti, fornitori e possibili contaminazioni con il ristoratore.
export const menuItems: MenuItem[] = [
  {
    id: "margherita",
    name: "Margherita",
    category: "classiche",
    description: "Il pomodoro, la morbidezza della mozzarella, una foglia di basilico. La bellezza di ritrovarsi nell’essenziale.",
    ingredients: ["Impasto per pizza", "Pomodoro", "Mozzarella", "Basilico", "Olio d’oliva"],
    allergens: ["Cereali contenenti glutine", "Latte e derivati"],
    price: 7.5,
    image: "margherita.webp",
    alt: "Pizza con pomodoro, mozzarella e basilico, fotografia di repertorio",
  },
  {
    id: "marinara",
    name: "Marinara",
    category: "classiche",
    description: "Il carattere del pomodoro incontra aglio e origano. Un classico che lascia parlare ogni ingrediente.",
    ingredients: ["Impasto per pizza", "Pomodoro", "Aglio", "Origano", "Olio d’oliva"],
    allergens: ["Cereali contenenti glutine"],
    price: 6.5,
    image: "marinara.webp",
    alt: "Pizza Marinara con pomodoro, aglio e origano, fotografia di repertorio",
  },
  {
    id: "diavola",
    name: "Diavola",
    category: "classiche",
    description: "Pomodoro, mozzarella e salame piccante. Una proposta dal carattere deciso, per chi cerca un po’ di fuoco in più.",
    ingredients: ["Impasto per pizza", "Pomodoro", "Mozzarella", "Salame piccante", "Olio d’oliva"],
    allergens: ["Cereali contenenti glutine", "Latte e derivati", "Composizione del salame da verificare"],
    price: 9,
    image: "diavola.webp",
    alt: "Pizza con pomodoro, mozzarella e salame, fotografia illustrativa della Diavola",
  },
  {
    id: "quattro-formaggi",
    name: "Quattro Formaggi",
    category: "speciali",
    description: "Morbida, intensa, avvolgente. Quattro formaggi in una composizione bianca da definire con il locale.",
    ingredients: ["Impasto per pizza", "Mozzarella", "Gorgonzola", "Provola", "Formaggio stagionato"],
    allergens: ["Cereali contenenti glutine", "Latte e derivati"],
    price: 10,
  },
  {
    id: "capricciosa",
    name: "Capricciosa",
    category: "speciali",
    description: "Un incontro generoso di sapori, tra pomodoro, mozzarella e una selezione di ingredienti della tradizione.",
    ingredients: ["Impasto per pizza", "Pomodoro", "Mozzarella", "Prosciutto cotto", "Funghi", "Carciofi", "Olive"],
    allergens: ["Cereali contenenti glutine", "Latte e derivati", "Ingredienti delle conserve e del prosciutto da verificare"],
    price: 10,
  },
  {
    id: "salsiccia-e-friarielli",
    name: "Salsiccia e Friarielli",
    category: "speciali",
    description: "Il gusto della salsiccia e il carattere vegetale dei friarielli, in una proposta ispirata alla cucina napoletana.",
    ingredients: ["Impasto per pizza", "Mozzarella", "Salsiccia", "Friarielli", "Olio d’oliva"],
    allergens: ["Cereali contenenti glutine", "Latte e derivati", "Composizione della salsiccia da verificare"],
    price: 10.5,
  },
  {
    id: "crocche",
    name: "Crocchè di patate",
    category: "fritti",
    description: "Un piccolo inizio da condividere: patate e formaggio in una crosta dorata. Porzione e preparazione da confermare.",
    ingredients: ["Patate", "Mozzarella", "Formaggio stagionato", "Uovo", "Pangrattato", "Olio per frittura da definire"],
    allergens: ["Cereali contenenti glutine", "Latte e derivati", "Uova", "Olio e contaminazioni da verificare"],
    price: 4.5,
  },
  {
    id: "frittatina",
    name: "Frittatina di pasta",
    category: "fritti",
    description: "Una proposta di street food napoletano, con un cuore di pasta e besciamella. Ricetta illustrativa da confermare.",
    ingredients: ["Pasta", "Besciamella", "Piselli", "Prosciutto cotto", "Farina", "Olio per frittura da definire"],
    allergens: ["Cereali contenenti glutine", "Latte e derivati", "Composizione della pasta e del prosciutto da verificare"],
    price: 4.5,
  },
  {
    id: "acqua",
    name: "Acqua minerale",
    category: "bevande",
    description: "Naturale o frizzante. Formato e produttore saranno indicati nel menu confermato dal locale.",
    ingredients: ["Acqua minerale; prodotto da definire"],
    allergens: [],
    price: 2,
  },
  {
    id: "bibita",
    name: "Bibita analcolica",
    category: "bevande",
    description: "Una pausa fresca da accompagnare alla pizza. Gusti, ingredienti e formato da confermare.",
    ingredients: ["Prodotto e composizione da definire"],
    allergens: [],
    price: 3,
  },
  {
    id: "birra",
    name: "Birra",
    category: "bevande",
    description: "Una proposta da abbinare ai sapori del forno. Stile, produttore e formato saranno definiti dal locale.",
    ingredients: ["Acqua", "Malto d’orzo", "Luppolo", "Lievito; ricetta da verificare"],
    allergens: ["Cereali contenenti glutine; verificare l’etichetta del prodotto"],
    price: 5.5,
  },
];
