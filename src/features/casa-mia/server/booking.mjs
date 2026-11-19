export const defaults = {
  baseRate: 18000,
  cleaning: 6000,
  minStay: 2,
  summerRate: 26000,
  summerMinStay: 3,
  depositPercent: 30,
  payOnArrival: true,
  fullOnline: false,
  depositOnline: false,
  manualConfirmation: false,
  assets: {
    living: "/demos/dimora-mia/assets/living.webp",
    bedroom: "/demos/dimora-mia/assets/bedroom.webp",
    terrace: "/demos/dimora-mia/assets/terrace.webp",
  },
  blockedDates: [],
};
export function nightsBetween(start, end) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(start || "") ||
    !/^\d{4}-\d{2}-\d{2}$/.test(end || "")
  )
    throw Error("Scegli le date di arrivo e partenza.");
  const a = new Date(start + "T00:00:00Z"),
    b = new Date(end + "T00:00:00Z");
  if (
    isNaN(+a) ||
    isNaN(+b) ||
    a.toISOString().slice(0, 10) !== start ||
    b.toISOString().slice(0, 10) !== end
  )
    throw Error("Le date non sono valide.");
  const count = (b - a) / 86400000;
  if (count < 1 || count > 30)
    throw Error("Il soggiorno deve durare da 1 a 30 notti.");
  return Array.from({ length: count }, (_, i) =>
    new Date(+a + i * 86400000).toISOString().slice(0, 10),
  );
}
export function quoteBooking(input, settings, now = new Date()) {
  const dates = nightsBetween(input.checkin, input.checkout);
  if (input.checkin < now.toISOString().slice(0, 10))
    throw Error("Scegli una data di arrivo futura.");
  if (
    input.checkout > new Date(+now + 730 * 86400000).toISOString().slice(0, 10)
  )
    throw Error("Le date sono disponibili fino a due anni da oggi.");
  if (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > 4)
    throw Error("La dimora può accogliere da 1 a 4 ospiti.");
  const summer = dates.some((d) => [6, 7, 8, 9].includes(+d.slice(5, 7))),
    minimum = summer
      ? Math.max(settings.minStay, settings.summerMinStay)
      : settings.minStay;
  if (dates.length < minimum)
    throw Error(`Il soggiorno minimo per queste date è di ${minimum} notti.`);
  if (dates.some((d) => settings.blockedDates.includes(d)))
    throw Error("Queste date non sono disponibili. Scegli un altro periodo.");
  const subtotal = dates.reduce(
    (s, d) =>
      s +
      ([6, 7, 8, 9].includes(+d.slice(5, 7))
        ? settings.summerRate
        : settings.baseRate),
    0,
  );
  return {
    dates,
    nights: dates.length,
    subtotal,
    cleaning: settings.cleaning,
    total: subtotal + settings.cleaning,
    seasonLabel: summer ? "Tariffa stagionale" : "Tariffa dimora",
  };
}
