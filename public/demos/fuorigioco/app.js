(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const fields = { '3': { name: 'LA GABBIA', players: 6, price: 3600 }, '5': { name: 'IL CLASSICO', players: 10, price: 6000 }, '7': { name: 'IL GRANDE', players: 14, price: 8400 } };
  const rome = { timeZone: 'Europe/Rome' };
  const money = cents => `${(cents / 100).toLocaleString('it-IT', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })} €`;
  const integer = (value, min, max, fallback = min) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Math.trunc(Number(value)))) : fallback;
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const dateKey = (date = new Date()) => {
    const parts = new Intl.DateTimeFormat('en-CA', { ...rome, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    return ['year', 'month', 'day'].map(part => parts.find(item => item.type === part).value).join('-');
  };
  const parseDate = key => new Date(`${key}T12:00:00Z`);
  const addDays = (key, days) => { const date = parseDate(key); date.setUTCDate(date.getUTCDate() + days); return date.toISOString().slice(0, 10); };
  const formatDate = (key, options = {}) => new Intl.DateTimeFormat('it-IT', { ...rome, ...options }).format(parseDate(key));
  const today = dateKey();
  const lastDate = addDays(today, 59);
  const state = { field: '5', date: today, time: null, duration: 60, kind: 'Amichevole', splitPeople: 10, offset: 0, extras: { referee: false, water: 0, bibs: false, video: false, balls: 0, food: 0 } };
  const listeners = new Set();
  let organizerReport = () => '';
  const dateInputs = [$('#quick-date'), $('#booking-date')];
  dateInputs.forEach(input => { input.min = today; input.max = lastDate; input.value = today; });
  $('#year').textContent = new Date().getFullYear();
  const clockTime = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  const timeRange = () => state.time === null ? 'Scegli un orario' : `${clockTime(state.time)} — ${clockTime(state.time + state.duration)}`;
  const snapshot = () => JSON.parse(JSON.stringify(state));
  function available(minute) {
    const now = new Date();
    if (state.date < dateKey(now) || minute + state.duration > 1440) return false;
    if (state.date === dateKey(now)) {
      const parts = new Intl.DateTimeFormat('en-GB', { ...rome, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
      const current = Number(parts.find(p => p.type === 'hour').value) * 60 + Number(parts.find(p => p.type === 'minute').value);
      if (minute <= current) return false;
    }
    const seed = Math.floor(parseDate(state.date).getTime() / 86400000) + Number(state.field) * 3;
    for (let offset = 0; offset < state.duration / 30; offset++) {
      const slot = minute / 30 + offset;
      if ((slot + seed) % 13 === 0 || (slot * 3 + seed) % 17 === 0) return false;
    }
    return true;
  }
  function totals() {
    const e = state.extras;
    const lines = [{ label: `Campo · ${state.duration} minuti`, cents: fields[state.field].price * state.duration / 60 }];
    if (e.referee) lines.push({ label: 'Arbitro', cents: 2500 });
    if (e.water) lines.push({ label: `${e.water} ${e.water === 1 ? 'cassa' : 'casse'} d’acqua`, cents: e.water * 600 });
    if (e.bibs) lines.push({ label: 'Set casacche', cents: 400 });
    if (e.video) lines.push({ label: 'Ripresa partita · demo', cents: 1500 });
    if (e.balls) lines.push({ label: `${e.balls} palloni extra`, cents: e.balls * 300 });
    if (e.food) lines.push({ label: `${e.food} menu terzo tempo`, cents: e.food * 800 });
    const total = lines.reduce((sum, line) => sum + line.cents, 0);
    return { lines, total, perPerson: Math.ceil(total / state.splitPeople), allocation: index => index >= state.splitPeople ? 0 : Math.floor(total / state.splitPeople) + (index < total % state.splitPeople ? 1 : 0) };
  }
  function announce(message) { $('#booking-feedback').textContent = message; }
  function emit() { listeners.forEach(callback => callback(snapshot())); }
  function renderDays() {
    const grid = $('#date-grid'); grid.replaceChildren();
    const start = addDays(today, state.offset); const end = addDays(start, 6);
    $('#week-label').textContent = `${formatDate(start, { day: 'numeric', month: 'short' })} — ${formatDate(end, { day: 'numeric', month: 'short', year: 'numeric' })}`;
    $('#prev-week').disabled = state.offset === 0; $('#next-week').disabled = state.offset + 7 > 59;
    for (let index = 0; index < 7; index++) {
      const day = addDays(start, index); const button = document.createElement('button');
      button.type = 'button'; button.className = 'date-button'; button.dataset.date = day; button.disabled = day > lastDate;
      button.setAttribute('aria-pressed', String(day === state.date)); button.setAttribute('aria-label', formatDate(day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }));
      const weekday = document.createElement('span'); weekday.textContent = day === today ? 'Oggi' : formatDate(day, { weekday: 'short' }).replace('.', '');
      const number = document.createElement('strong'); number.textContent = formatDate(day, { day: 'numeric' });
      button.append(weekday, number);
      button.addEventListener('click', () => { state.date = day; state.time = null; syncDates(); renderDays(); renderTimes(); renderSummary(); $(`[data-date="${day}"]`).focus({ preventScroll: true }); announce('Giorno aggiornato. Scegli un orario.'); });
      grid.append(button);
    }
  }
  function renderTimes() {
    const grid = $('#time-grid'); grid.replaceChildren();
    for (let minute = 540; minute <= 1380; minute += 30) {
      const button = document.createElement('button'); const label = clockTime(minute);
      button.type = 'button'; button.className = 'time-button'; button.textContent = label; button.dataset.minute = minute;
      button.disabled = !available(minute); button.setAttribute('aria-pressed', String(state.time === minute));
      button.setAttribute('aria-label', `${label}${button.disabled ? ', occupato, trascorso o durata non disponibile' : `, disponibile per ${state.duration} minuti`}`);
      button.addEventListener('click', () => { state.time = minute; $$('.time-button').forEach(item => item.setAttribute('aria-pressed', String(Number(item.dataset.minute) === minute))); renderSummary(); announce(`Orario ${label} selezionato. Totale di esempio ${money(totals().total)}.`); });
      grid.append(button);
    }
    if (![...grid.children].some(button => !button.disabled)) {
      const message = document.createElement('p'); message.className = 'empty-slots'; message.textContent = 'Nessun orario per questa durata. Prova un altro giorno o una durata diversa.'; grid.append(message);
    }
  }
  function renderSummary() {
    const field = fields[state.field]; const costs = totals();
    $('#summary-title').textContent = field.name; $('#summary-format').textContent = `CALCIO A ${state.field} · ${field.players} GIOCATORI`;
    $('#summary-date').textContent = formatDate(state.date, { day: 'numeric', month: 'long' }); $('#summary-time').textContent = timeRange(); $('#summary-duration').textContent = `${state.duration} minuti`;
    $('#summary-price').textContent = money(costs.total); $('#summary-person').textContent = `Fino a ${money(costs.perPerson)} a testa · ${state.splitPeople} quote`;
    $('#summary-costs').innerHTML = costs.lines.map(line => `<div><span>${escape(line.label)}</span><strong>${money(line.cents)}</strong></div>`).join('');
    $('#split-people').value = state.splitPeople;
    $('#water-detail').textContent = state.extras.water ? `${state.extras.water * 12} bottiglie · ${state.extras.water * 6} litri in totale` : 'L’idratazione prima di tutto.';
    const button = $('#continue-booking'); button.disabled = state.time === null;
    button.innerHTML = `${state.time === null ? 'Seleziona un orario' : 'Continua · simulazione'} <span aria-hidden="true">↗</span>`;
    $$('[data-pick]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.pick === state.field)));
    $('#quick-field').value = state.field;
    emit();
  }
  function syncDates() { dateInputs.forEach(input => { input.value = state.date; }); }
  function setField(value) { state.field = value; state.splitPeople = fields[value].players; state.time = null; renderTimes(); renderSummary(); }
  $$('[data-pick]').forEach(button => button.addEventListener('click', () => { setField(button.dataset.pick); announce(`Calcio a ${state.field} selezionato. Scegli giorno e orario.`); }));
  $$('[data-field]').forEach(button => button.addEventListener('click', () => { setField(button.dataset.field); $('#prenota').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); $(`[data-pick="${state.field}"]`).focus({ preventScroll: true }); }));
  $('#booking-date').addEventListener('change', event => {
    if (!event.target.value || !event.target.checkValidity()) { event.target.reportValidity(); return; }
    state.date = event.target.value; state.time = null; state.offset = Math.floor((parseDate(state.date) - parseDate(today)) / 86400000 / 7) * 7;
    syncDates(); renderDays(); renderTimes(); renderSummary(); announce('Data aggiornata. Scegli un orario disponibile.');
  });
  $('#quick-form').addEventListener('submit', event => {
    event.preventDefault(); if (!event.currentTarget.reportValidity()) return;
    if (state.field !== $('#quick-field').value) state.splitPeople = fields[$('#quick-field').value].players;
    state.field = $('#quick-field').value; state.date = $('#quick-date').value; state.time = null; state.offset = Math.floor((parseDate(state.date) - parseDate(today)) / 86400000 / 7) * 7;
    syncDates(); renderDays(); renderTimes(); renderSummary(); $('#prenota').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); $(`[data-pick="${state.field}"]`).focus({ preventScroll: true });
  });
  $('#prev-week').addEventListener('click', () => { state.offset = Math.max(0, state.offset - 7); renderDays(); });
  $('#next-week').addEventListener('click', () => { state.offset = Math.min(56, state.offset + 7); renderDays(); });
  $('#match-duration').addEventListener('change', event => { state.duration = Number(event.target.value); state.time = null; renderTimes(); renderSummary(); announce(`Durata aggiornata a ${state.duration} minuti. Scegli un nuovo orario.`); });
  $('#match-kind').addEventListener('change', event => { state.kind = event.target.value; renderSummary(); });
  $('#split-people').addEventListener('change', event => { state.splitPeople = integer(event.target.value, 1, 40, fields[state.field].players); renderSummary(); });
  ['referee', 'bibs', 'video'].forEach(key => $(`#extra-${key}`).addEventListener('change', event => { state.extras[key] = event.target.checked; renderSummary(); }));
  const limits = { water: 6, balls: 4, food: 30 };
  Object.keys(limits).forEach(key => $(`#extra-${key}`).addEventListener('change', event => { state.extras[key] = integer(event.target.value, 0, limits[key]); event.target.value = state.extras[key]; renderSummary(); }));
  $$('[data-step]').forEach(button => button.addEventListener('click', () => { const key = button.dataset.step; state.extras[key] = integer(state.extras[key] + Number(button.dataset.delta), 0, limits[key]); $(`#extra-${key}`).value = state.extras[key]; renderSummary(); }));
  function download(content, filename, type = 'text/plain;charset=utf-8') { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 10000); }
  function baseReport() {
    const c = totals();
    return `FUORIGIOCO — ORGANIZZAZIONE DIMOSTRATIVA\nNON È UNA PRENOTAZIONE · NESSUN PAGAMENTO\n\nCampo: ${fields[state.field].name} — Calcio a ${state.field}\nData: ${formatDate(state.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\nOrario: ${timeRange()} (Europe/Rome)\nDurata: ${state.duration} minuti\nPartita: ${state.kind}\n\nCOSTI DI ESEMPIO\n${c.lines.map(line => `${line.label}: ${money(line.cents)}`).join('\n')}\nTotale: ${money(c.total)}\nDivisione: ${state.splitPeople} quote, fino a ${money(c.perPerson)} a testa\nLe quote possono differire di 1 centesimo per chiudere il totale esatto.\n\nNessun campo o servizio riservato. Nessun ordine o pagamento. Disponibilità e tariffe simulate.\n`;
  }
  function receiptMarkup() {
    const costs = totals();
    return `<div class="receipt"><div><span>Campo</span><strong>${fields[state.field].name} · ${state.field} vs ${state.field}</strong></div><div><span>Giorno</span><strong>${formatDate(state.date, { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div><div><span>Orario</span><strong>${timeRange()}</strong></div><div><span>Durata</span><strong>${state.duration} minuti</strong></div>${costs.lines.slice(1).map(line => `<div><span>${escape(line.label)}</span><strong>${money(line.cents)}</strong></div>`).join('')}<div class="receipt-total"><span>Totale di esempio</span><strong>${money(costs.total)}</strong></div><div><span>${state.splitPeople} quote</span><strong>Fino a ${money(costs.perPerson)} a testa</strong></div></div>`;
  }
  const bookingDialog = $('#booking-dialog'); const bookingBody = $('#booking-dialog-body');
  $('#continue-booking').addEventListener('click', () => {
    if (!$('#booking-date').reportValidity()) return;
    if (state.time === null || !available(state.time)) { state.time = null; renderTimes(); renderSummary(); announce('Questo orario non è più selezionabile. Scegli un altro orario.'); return; }
    bookingBody.innerHTML = `<p class="eyebrow">ULTIMO PASSAGGIO / DEMO</p><h2 id="booking-dialog-title">TUTTI IN CAMPO?</h2><p>Campo, durata ed extra sono riassunti qui. Le formazioni si organizzano nella panchina digitale, anche senza completare questa prova.</p>${receiptMarkup()}<form id="booking-form"><label>Nome del gruppo (usa un nome di fantasia)<input name="team" placeholder="Es. Gli Ultimi Minuti" required minlength="2" maxlength="60" autocomplete="off"></label><label class="checkbox-label"><input type="checkbox" required><span>Ho capito che è una simulazione: nessun campo, arbitro, acqua o altro servizio viene prenotato e nessun importo viene addebitato.</span></label><button class="button" type="submit">Conferma la simulazione <span aria-hidden="true">↗</span></button></form>`;
    bookingDialog.showModal();
    $('#booking-form').addEventListener('submit', event => {
      event.preventDefault(); if (!event.currentTarget.reportValidity()) return;
      const team = new FormData(event.currentTarget).get('team').trim();
      if (team.length < 2) { const input = $('[name=team]', event.currentTarget); input.setCustomValidity('Inserisci almeno due caratteri, oltre agli spazi.'); input.reportValidity(); return; }
      const report = baseReport() + `\nGruppo: ${team}\n` + organizerReport(); const selectedDate = state.date;
      bookingBody.innerHTML = `<div class="success-mark" aria-hidden="true">✓</div><p class="eyebrow" style="margin-top:20px">SIMULAZIONE COMPLETATA</p><h2 id="booking-dialog-title" tabindex="-1">BELLA PARTITA,<br><span id="team-name"></span>!</h2><p class="demo-note"><strong>Nessuna prenotazione reale.</strong> Nessun campo o servizio è stato riservato, nessun pagamento effettuato e nessuna email inviata.</p>${receiptMarkup()}<button class="button" id="download-summary">Scarica il riepilogo demo <span aria-hidden="true">↓</span></button><button class="secondary-button" id="go-organizer">Prepara squadre e formazioni ↗</button><button class="secondary-button" id="new-match">Scegli un altro orario</button>`;
      $('#team-name').textContent = team; $('#booking-dialog-title').focus();
      $('#download-summary').addEventListener('click', () => download(report, `fuorigioco-demo-${selectedDate}.txt`));
      $('#go-organizer').addEventListener('click', () => { bookingDialog.close(); $('#organizza').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); $('#tab-squads').focus({ preventScroll: true }); });
      $('#new-match').addEventListener('click', () => { bookingDialog.close(); state.time = null; renderTimes(); renderSummary(); $(`[data-pick="${state.field}"]`).focus({ preventScroll: true }); });
    });
    $('[name=team]', bookingBody).addEventListener('input', event => event.target.setCustomValidity(''));
  });
  const contactDialog = $('#contact-dialog');
  $('#contact-open').addEventListener('click', () => { $('#contact-status').textContent = ''; contactDialog.showModal(); });
  $('#contact-form').addEventListener('submit', event => { event.preventDefault(); if (!event.currentTarget.reportValidity()) return; $('#contact-status').textContent = 'Prova completata. Nessun messaggio è stato inviato e nessun dato è stato salvato.'; event.currentTarget.reset(); });
  $$('dialog').forEach(dialog => {
    $('.close-dialog', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { const rect = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close(); });
    dialog.addEventListener('close', () => { if (dialog === contactDialog) { $('#contact-form').reset(); $('#contact-status').textContent = ''; } if (dialog === bookingDialog) bookingBody.replaceChildren(); });
  });
  const menu = $('.menu-toggle'); const nav = $('#navigation');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Apri menu'); nav.classList.remove('is-open'); }
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu'); nav.classList.toggle('is-open', open); });
  $$('a', nav).forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
  document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
  window.addEventListener('focus', () => { if (state.time !== null && !available(state.time)) { state.time = null; renderSummary(); } renderTimes(); });
  window.FG = {
    get: snapshot, totals, money, escape, integer, formatDate, clockTime, timeRange, fields, download, baseReport,
    subscribe(callback) { listeners.add(callback); return () => listeners.delete(callback); },
    setReport(callback) { organizerReport = callback; },
    setSplit(value) { state.splitPeople = integer(value, 1, 40, fields[state.field].players); renderSummary(); },
    restore(data) {
      if (!data || typeof data !== 'object') return;
      if (Object.hasOwn(fields, String(data.field))) state.field = String(data.field);
      state.duration = [60, 90, 120].includes(data.duration) ? data.duration : 60;
      state.kind = ['Amichevole', 'Allenamento', 'Sfida di campionato'].includes(data.kind) ? data.kind : 'Amichevole';
      const validDate = typeof data.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(data.date) && data.date >= today && data.date <= lastDate && !Number.isNaN(parseDate(data.date).getTime()) && dateKey(parseDate(data.date)) === data.date;
      state.date = validDate ? data.date : today;
      state.splitPeople = integer(data.splitPeople, 1, 40, fields[state.field].players);
      if (data.extras && typeof data.extras === 'object') {
        ['referee', 'bibs', 'video'].forEach(key => { state.extras[key] = data.extras[key] === true; });
        Object.keys(limits).forEach(key => { state.extras[key] = integer(data.extras[key], 0, limits[key]); });
      }
      state.time = validDate && Number.isInteger(data.time) && data.time >= 540 && data.time <= 1380 && data.time % 30 === 0 && available(data.time) ? data.time : null;
      state.offset = Math.floor((parseDate(state.date) - parseDate(today)) / 86400000 / 7) * 7;
      $('#match-duration').value = state.duration; $('#match-kind').value = state.kind;
      ['referee', 'bibs', 'video'].forEach(key => { $(`#extra-${key}`).checked = state.extras[key]; });
      Object.keys(limits).forEach(key => { $(`#extra-${key}`).value = state.extras[key]; });
      syncDates(); renderDays(); renderTimes(); renderSummary();
    }
  };
  renderDays(); renderTimes(); renderSummary();
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('js');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.remove('waiting'); observer.unobserve(entry.target); } }), { threshold: 0.07 });
    $$('.reveal').forEach(element => { element.classList.add('waiting'); observer.observe(element); });
  }
})();
