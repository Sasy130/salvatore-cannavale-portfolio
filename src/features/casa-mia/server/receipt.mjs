// A payment acknowledgment, never a fiscal invoice. Data originates in a verified webhook.
const euros = (n) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(
    n / 100,
  );
const html = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function emailMessage(payload) {
  const { booking: b, receipt: r } = payload,
    paid = r?.amount || 0;
  const title = r
    ? "Ricevuta del pagamento · TEST"
    : "Conferma della prenotazione · DEMO";
  const lines = [
    `Ciao ${b.name},`,
    r
      ? "il pagamento di prova è stato verificato. Trovi la ricevuta PDF in allegato."
      : "la tua prenotazione dimostrativa è confermata.",
    `Riferimento: ${b.id}`,
    `Arrivo: ${b.checkin}`,
    `Partenza: ${b.checkout}`,
    `Ospiti: ${b.guests}`,
    `Totale soggiorno: ${euros(b.total)}`,
    `Pagamento online verificato: ${euros(paid)}`,
    `Saldo soggiorno: ${euros(Math.max(0, b.total - paid))}`,
    r && b.status === "payment_review_required"
      ? "ATTENZIONE: il pagamento è arrivato dopo la scadenza o la cancellazione. Il soggiorno NON è confermato: il proprietario deve verificare le date."
      : "",
    !r ? "Pagamento in struttura: nessun pagamento online ricevuto." : "",
    "AMBIENTE DI PROVA: nessun denaro reale è stato incassato o accreditato.",
    "Ricevuta di pagamento non fiscale. Non sostituisce fattura o altri documenti fiscali.",
  ].filter(Boolean);
  return {
    subject: `CASA MIA · ${title} · ${b.id}`,
    text: lines.join("\n"),
    html: `<div style="font-family:Arial,sans-serif;background:#f4f5f0;padding:32px;color:#233e32"><div style="max-width:560px;margin:auto;background:#fff;padding:32px;border-radius:12px"><p style="letter-spacing:3px;font-size:12px">CASA MIA</p><h1 style="font-size:25px">${html(title)}</h1>${lines.map((l) => `<p style="font-size:14px;line-height:1.7">${html(l)}</p>`).join("")}</div></div>`,
  };
}
function latin(s) {
  return String(s ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const literal = (s) => latin(s).replace(/[\\()]/g, "\\$&");
export function receiptPDF(receipt) {
  const b = JSON.parse(receipt.snapshot),
    commands = [];
  const text = (x, y, size, value, font = "F1") =>
    commands.push(
      `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${literal(value)}) Tj ET`,
    );
  commands.push(
    "0.96 0.97 0.94 rg 0 0 595 842 re f",
    "1 1 1 rg 40 45 515 752 re f",
    "0.13 0.25 0.20 rg",
  );
  text(68, 754, 23, "CASA MIA", "F2");
  text(68, 728, 10, "RICEVUTA DI PAGAMENTO NON FISCALE");
  commands.push("0.92 0.94 0.88 rg 68 654 459 46 re f", "0.13 0.25 0.20 rg");
  text(82, 674, 11, "TEST - NESSUN PAGAMENTO O ACCREDITO REALE", "F2");
  const rows = [
    ["Documento", receipt.id],
    ["Emesso il", new Date(receipt.issued).toISOString().slice(0, 10)],
    ["Prenotazione", b.id],
    ["Ospite", b.name],
    ["Soggiorno", b.checkin + " / " + b.checkout],
    ["Numero ospiti", b.guests],
    [
      "Modalita",
      b.payment === "deposit"
        ? "Acconto online - Stripe TEST"
        : "Pagamento online - Stripe TEST",
    ],
    ["Totale soggiorno", `EUR ${(b.total / 100).toFixed(2)}`],
    ["Importo verificato", `EUR ${(receipt.amount / 100).toFixed(2)}`],
    [
      "Saldo soggiorno",
      `EUR ${(Math.max(0, b.total - receipt.amount) / 100).toFixed(2)}`,
    ],
  ];
  let y = 621;
  for (const [label, value] of rows) {
    text(68, y, 10, label);
    const valueLines = latin(value).match(/.{1,38}(?:\s|$)|.{1,38}/g) || [""];
    valueLines.forEach((line, index) =>
      text(
        215,
        y - index * 12,
        9,
        line.trim(),
        label === "Importo verificato" ? "F2" : "F1",
      ),
    );
    y -= Math.max(30, valueLines.length * 12 + 10);
  }
  commands.push("0.8 0.84 0.78 RG 68 289 m 527 289 l S");
  text(
    68,
    265,
    9,
    "Pagamento verificato dal server tramite evento Stripe firmato.",
  );
  text(
    68,
    244,
    9,
    "Questo documento non e una fattura e non sostituisce documenti fiscali.",
  );
  text(68, 223, 9, "L importo e simulato: non attesta un incasso reale.");
  if (b.status === "payment_review_required") {
    text(
      68,
      188,
      10,
      "SOGGIORNO DA VERIFICARE - nessuna conferma delle date.",
      "F2",
    );
  }
  text(68, 100, 8, "Riferimento Stripe: " + receipt.stripe_session);
  const content = commands.join("\n"),
    objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
      `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
    ];
  let file = "%PDF-1.4\n",
    offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(file));
    file += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(file);
  file +=
    `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((n) => String(n).padStart(10, "0") + " 00000 n \n")
      .join("") +
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(file);
}
