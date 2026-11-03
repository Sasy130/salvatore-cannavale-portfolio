/** Dati del locale. Inserire solo informazioni confermate dal cliente.
 * I valori null non generano contatti o posizioni fittizi.
 */
export type RestaurantConfig = {
  name: string;
  tagline: string;
  demo: boolean;
  siteUrl: string;
  allowIndexing: boolean;
  verifiedBusiness: boolean;
  stockPhotography: boolean;
  logoImage: string | null;
  locationImage: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  address: string | null;
  openingHours: Array<{ day: string; hours: string }> | null;
  socials: { instagram: string | null; facebook: string | null };
};

export const restaurant: RestaurantConfig = {
  name: "FUOCO",
  tagline: "L’ARTE DELLA PIZZA",
  demo: true,
  siteUrl: "https://www.salvatorecannavale.it/fuoco",
  allowIndexing: false,
  verifiedBusiness: false,
  stockPhotography: true,
  logoImage: null, // Percorso locale completo, es. /images/fuoco/logo.svg
  locationImage: null, // Solo una fotografia autorizzata del locale reale.
  phone: null, // Formato internazionale, con prefisso paese.
  whatsappNumber: null, // Formato internazionale, con prefisso paese.
  address: null,
  openingHours: null, // Es. [{ day: "Lunedì", hours: "Chiuso" }], solo dati reali.
  socials: { instagram: null, facebook: null },
};

export const fuocoPaths = {
  home: "/fuoco",
  menu: "/fuoco/menu",
  story: "/fuoco/storia",
  contacts: "/fuoco/contatti",
};

function internationalNumber(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.replace(/[\s().-]/g, "");
  if (!/^\+?[1-9]\d{6,14}$/.test(normalized)) return null;
  return normalized.replace(/^\+/, "");
}

export function getWhatsAppUrl(pizzaName?: string, number: string | null = restaurant.whatsappNumber): string | null {
  const digits = internationalNumber(number);
  if (!digits) return null;
  const message = pizzaName?.trim()
    ? `Ciao! Vorrei informazioni sulla pizza ${pizzaName.trim()}.`
    : "Ciao! Vorrei avere informazioni sul menu della pizzeria.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function getPhoneUrl(phone: string | null = restaurant.phone): string | null {
  const digits = internationalNumber(phone);
  return digits ? `tel:+${digits}` : null;
}

export function getDirectionsUrl(address: string | null = restaurant.address): string | null {
  return address?.trim()
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.trim())}`
    : null;
}

export function getSocialUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const hosts = ["instagram.com", "www.instagram.com", "facebook.com", "www.facebook.com"];
    return url.protocol === "https:" && hosts.includes(url.hostname) && !url.username && !url.password && !url.port ? url.href : null;
  } catch { return null; }
}

export function getMenuPrice(price: number | null): { value: string; caption: string } {
  if (price === null || !Number.isFinite(price) || price < 0) return { value: "Da definire", caption: "Prezzo" };
  return {
    value: new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(price),
    caption: restaurant.demo ? "Prezzo demo" : "Prezzo",
  };
}
