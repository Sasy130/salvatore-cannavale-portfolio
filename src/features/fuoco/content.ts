// Contenuti del concept: sostituire con ricette, storia e contatti approvati
// dal locale prima di una pubblicazione come sito di una pizzeria reale.
import { restaurant } from "./restaurant";

export const fuoco = {
  ritual: `Ci sono gesti semplici che sanno di casa. Le mani nell’impasto, il profumo del pomodoro, il calore del forno. È da qui che immaginiamo ${restaurant.name}: dal piacere di fare bene le cose, e di condividerle a tavola.`,
};

export const ingredients = [
  { number: "01", name: "Pomodoro", detail: "Il carattere.", image: "tomatoes.webp", alt: "Pomodori rossi freschi, fotografia di repertorio" },
  { number: "02", name: "Mozzarella", detail: "La delicatezza.", image: "mozzarella.webp", alt: "Mozzarella fresca, fotografia di repertorio" },
  { number: "03", name: "Basilico", detail: "L’anima.", image: "basil.webp", alt: "Foglie di basilico fresco, fotografia di repertorio" },
];

// Descrizioni indicative, non un menu commerciale né dichiarazioni allergeni.
export const pizzas = [
  { name: "Margherita", note: "L’essenziale, fatto bene.", description: "Pomodoro, mozzarella, basilico. L’incontro da cui tutto comincia.", image: "margherita.webp", alt: "Pizza Margherita con pomodoro, mozzarella e basilico", label: "L’ICONICA" },
  { name: "Marinara", note: "Semplicemente intramontabile.", description: "Pomodoro, aglio e origano. Pochi ingredienti, un carattere inconfondibile.", image: "marinara.webp", alt: "Pizza Marinara al pomodoro", label: "LA TRADIZIONE" },
  { name: "Diavola", note: "Un po’ di fuoco in più.", description: "Pomodoro, mozzarella e salame piccante. Per chi ama un gusto deciso.", image: "diavola.webp", alt: "Pizza con pomodoro, mozzarella e salame piccante", label: "IL CARATTERE" },
];

export const story = [
  { number: "01", name: "L’impasto", copy: "Tutto comincia dalle mani.", image: "dough.webp", alt: "Mani al lavoro con l’impasto della pizza" },
  { number: "02", name: "La preparazione", copy: "Ogni ingrediente trova il suo posto.", image: "preparation.webp", alt: "Pomodoro, farina e ingredienti su un piano di lavoro" },
  { number: "03", name: "Il forno", copy: "È qui che il calore diventa sapore.", image: "oven.webp", alt: "Il calore di un forno per la pizza" },
  { number: "04", name: "A tavola", copy: "Il momento più bello è condividerla.", image: "hero.webp", alt: "Una pizza appena sfornata pronta da condividere" },
];
