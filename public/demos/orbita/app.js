'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const money = value => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
const dateFormat = (value, opts = {}) => new Intl.DateTimeFormat('it-IT', opts).format(new Date(`${value}T12:00:00`));
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const baseDate = new Date();
baseDate.setHours(12, 0, 0, 0);
const days = Array.from({length: 7}, (_, index) => { const d = new Date(baseDate); d.setDate(d.getDate() + index); return dateKey(d); });
const films = [
  { id:'dune', title:'Dune: Parte due', director:'Denis Villeneuve', year:2024, genre:'Fantascienza', duration:166, image:'dune.jpg', tag:'GRANDE SCHERMO, GRANDI MONDI', hall:1, times:['16:30','20:15'], country:'USA', original:'Inglese', rating:'12+', trailer:'Way9Dexny3w', cast:'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem', synopsis:'Arrakis, un pianeta che contiene tutti i destini. Paul Atreides si unisce a Chani e ai Fremen in un viaggio tra amore, vendetta e una scelta capace di cambiare il futuro dell’universo. L’immaginazione di Denis Villeneuve trova la sua dimensione naturale: il grande schermo.' },
  { id:'perfect-days', title:'Perfect Days', director:'Wim Wenders', year:2023, genre:'Drammatico', duration:124, image:'perfect-days.jpg', tag:'PICCOLE COSE, GRANDISSIMO CINEMA', hall:2, times:['15:30','20:15'], country:'Giappone / Germania', original:'Giapponese', rating:'T', trailer:'HTgWYojq-z8', cast:'Kōji Yakusho, Tokio Emoto, Arisa Nakano', synopsis:'Una canzone in macchina, la luce tra le foglie, un libro prima di dormire. A Tokyo, Hirayama custodisce la bellezza delle cose di ogni giorno. Wim Wenders firma un viaggio delicato e luminoso che invita a guardare la vita con occhi nuovi.' },
  { id:'poor-things', title:'Povere creature!', director:'Yorgos Lanthimos', year:2023, genre:'Fantastico', duration:141, image:'poor-things.jpg', tag:'VISIONI FUORI DAGLI SCHEMI', hall:3, times:['15:00','20:15'], country:'Regno Unito / Irlanda / USA', original:'Inglese', rating:'14+', trailer:'RlbR5N6veqw', cast:'Emma Stone, Mark Ruffalo, Willem Dafoe', synopsis:'Bella Baxter ha un mondo intero da scoprire e nessuna intenzione di seguire le sue regole. Tra città impossibili, incontri inattesi e una curiosità senza limiti, una fiaba visionaria sull’indipendenza e sulla libertà di inventarsi.' },
  { id:'interstellar', title:'Interstellar', director:'Christopher Nolan', year:2014, genre:'Fantascienza', duration:169, image:'interstellar.jpg', tag:'ORBITA REWIND', hall:1, times:['13:00','23:30'], country:'USA / Regno Unito', original:'Inglese', rating:'T', trailer:'zSWdZVtXT7E', cast:'Matthew McConaughey, Anne Hathaway, Jessica Chastain', synopsis:'Quando la Terra non basta più, un gruppo di esploratori attraversa i confini dello spazio conosciuto. Un viaggio tra galassie lontane, il tempo che scorre e i legami che resistono a qualsiasi distanza. Il ritorno sul grande schermo di una visione indimenticabile.' },
  { id:'budapest', title:'The Grand Budapest Hotel', director:'Wes Anderson', year:2014, genre:'Commedia', duration:100, image:'budapest.jpg', tag:'MONDI D’AUTORE', hall:2, times:['18:00','22:45'], country:'Germania / Regno Unito / USA', original:'Inglese', rating:'T', trailer:'1Fg5iWmQjwk', cast:'Ralph Fiennes, Tony Revolori, Saoirse Ronan', synopsis:'Un concierge leggendario, un giovane lobby boy e un’eredità che scompiglia ogni cosa. Nel cuore di un’Europa immaginaria, Wes Anderson apre le porte di un hotel dove ogni stanza contiene una storia, e ogni inquadratura un piccolo universo.' },
  { id:'lalaland', title:'La La Land', director:'Damien Chazelle', year:2016, genre:'Musical', duration:128, image:'lalaland.jpg', tag:'DA RIVEDERE. DA RISENTIRE.', hall:3, times:['17:45','23:00'], country:'USA', original:'Inglese', rating:'T', trailer:'0pdqf4P9MB8', cast:'Emma Stone, Ryan Gosling, John Legend', synopsis:'Una città che sogna a colori. Mia vuole recitare, Sebastian vuole suonare jazz. Le loro strade si incrociano in una Los Angeles che balla, si innamora e a volte chiede di scegliere. Una lettera d’amore al cinema e a tutte le vite possibili.' }
];
const getFilm = id => films.find(film => film.id === id);
const state = { day:0, genre:'all', original:false, expanded:false, booking:null };
let toastTimer;
let heroIndex = 0;
const quickState = {film:'dune',time:null};
const heroFilms = [
  {id:'dune',image:'dune-cinema.jpg',alt:'Paul e Chani tra le dune di Arrakis',title:'DUNE',subtitle:'PARTE DUE',tagline:'Il deserto chiama.<br><span>Rispondi dal grande schermo.</span>',titleClass:''},
  {id:'interstellar',image:'interstellar-scene.jpg',alt:'Una navicella davanti alle onde gigantesche del pianeta di Miller',title:'INTERSTELLAR',subtitle:'ORBITA REWIND',tagline:'Oltre lo spazio. Oltre il tempo.<br><span>Di nuovo, sul grande schermo.</span>',titleClass:'hero-title-long'},
  {id:'budapest',image:'wes-scene.jpg',alt:'La hall simmetrica del Grand Budapest Hotel',title:'GRAND<br>BUDAPEST',subtitle:'HOTEL',tagline:'Certe porte aprono altri mondi.<br><span>Questa sera, entra in quello di Wes.</span>',titleClass:'hero-title-stacked'}
];
function renderFeatured(index, syncBooking = true) {
  heroIndex=(index+heroFilms.length)%heroFilms.length;
  const featured=heroFilms[heroIndex],film=getFilm(featured.id),image=$('.hero-image');
  $('.cinema-stage').dataset.world=featured.id;
  const heading=$('#hero-film-title');heading.innerHTML=featured.title;heading.className=featured.titleClass;
  $('#hero-film-subtitle').textContent=featured.subtitle;
  $('#hero-film-tagline').innerHTML=featured.tagline;
  $('#hero-film-meta').innerHTML=`${film.director.toUpperCase()} <span>·</span> ${film.genre.toUpperCase()} <span>·</span> ${film.duration} MIN`;
  $('.feature-film').dataset.film=film.id;$('.feature-film').setAttribute('aria-label',`Scopri ${film.title}`);
  $('.hero-trailer').dataset.trailer=film.id;
  $('#hero-buy').setAttribute('aria-label',`Acquista biglietti per ${film.title}: scegli i posti nella biglietteria demo`);
  $('.feature-index').textContent=`${String(heroIndex+1).padStart(2,'0')} / 03`;
  $$('.reel-film').forEach((button,i)=>{button.classList.toggle('active',i===heroIndex);button.setAttribute('aria-pressed',String(i===heroIndex));});
  const show=()=>image.classList.remove('is-switching');
  if(!image.src.endsWith(featured.image)){
    image.classList.add('is-switching');const requestedIndex=heroIndex;const preload=new Image();
    preload.onload=()=>{if(heroIndex!==requestedIndex)return;image.src=preload.src;image.alt=featured.alt;image.addEventListener('load',show,{once:true});if(image.complete)show();};
    preload.onerror=show;preload.src=`/demos/orbita/assets/${featured.image}`;
  }
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    $('.hero-title-wrap').animate([{opacity:.1,transform:'translateY(20px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'cubic-bezier(.19,1,.22,1)'});
  }
  if(syncBooking){quickState.film=film.id;quickState.time=null;syncQuickBooking();}
}
function switchHero(direction){renderFeatured(heroIndex+direction);}
function availableScreenings(film, day=state.day){return schedule(film,day).filter(screening=>!isPast(screening.time,days[day]));}
function nextScreening(film, fromDay=state.day){
  for(let day=fromDay;day<days.length;day++){const screening=availableScreenings(film,day)[0];if(screening)return {...screening,day};}
  return null;
}
function syncQuickBooking(){
  if(!$('#quick-film'))return;
  const film=getFilm(quickState.film)||films[0];quickState.film=film.id;
  if($('#quick-film').options.length!==films.length)$('#quick-film').innerHTML=films.map(f=>`<option value="${f.id}">${f.title}</option>`).join('');
  $('#quick-film').value=film.id;
  if($('#quick-day').options.length!==days.length)$('#quick-day').innerHTML=days.map((date,i)=>`<option value="${i}">${i===0?'Oggi':i===1?'Domani':dateFormat(date,{weekday:'short'})} · ${dateFormat(date,{day:'numeric',month:'short'})}</option>`).join('');
  $('#quick-day').value=String(state.day);
  const screenings=availableScreenings(film);
  const selected=screenings.find(screening=>screening.time===quickState.time)||screenings[0];quickState.time=selected?.time||null;
  $('#quick-time').innerHTML=screenings.length?screenings.map(screening=>`<option value="${screening.time}">${screening.time} · ${screening.original?'V.O. sott. ITA':'Italiano'}</option>`).join(''):'<option value="">Nessun orario oggi</option>';
  if(selected)$('#quick-time').value=selected.time;
  $('#quick-time').disabled=!selected;$('.quick-buy').disabled=!selected;$('#dock-buy').disabled=!selected;
  const member=readLocal('orbita-club-v1',false);
  $('#quick-price').textContent=member?'Orbita Club 8,40 €':'Intero 10,50 € · Under 26 a 7 €';
  $('#quick-status').textContent=selected?`${film.title}, ${dateFormat(days[state.day],{weekday:'long',day:'numeric',month:'long'})}, ore ${selected.time}, ${selected.original?'versione originale sottotitolata':'in italiano'}.`: 'Nessuno spettacolo disponibile nel giorno selezionato. Scegli un altro giorno.';
  $('#dock-title').textContent=film.title;$('#dock-poster').src=`/demos/orbita/assets/${film.image}`;
  $('#dock-session').textContent=selected?`${state.day===0?'Oggi':state.day===1?'Domani':dateFormat(days[state.day],{day:'numeric',month:'short'})} · ${selected.time} · ${selected.original?'V.O.':'ITA'}`:'Scegli un altro giorno';
  $('.dock-price').innerHTML=member?'<span>Socio <strong>8,40 €</strong></span><small>Tariffa Orbita Club</small>':'<span>Intero <strong>10,50 €</strong></span><small>Under 26 a 7 €</small>';
}
function buyQuickTicket(){
  const film=getFilm(quickState.film),screening=availableScreenings(film).find(s=>s.time===quickState.time);
  if(!screening){showToast('Scegli un giorno e un orario disponibili.');$('#quick-day').focus();return;}
  openBooking(film.id,screening.time,screening.original);
}
function buyHeroTicket(){
  const film=getFilm(heroFilms[heroIndex].id),chosen=quickState.film===film.id?availableScreenings(film).find(s=>s.time===quickState.time):null,screening=chosen?{...chosen,day:state.day}:nextScreening(film);
  if(!screening){showToast('Aggiorna la pagina per scoprire i prossimi spettacoli.');return;}
  state.day=screening.day;quickState.film=film.id;quickState.time=screening.time;renderDates();renderFilms();
  openBooking(film.id,screening.time,screening.original);
}
function focusTicketPicker(){
  closeDialogs();$('#biglietti').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'center'});
  $('#quick-film').focus({preventScroll:true});
}
function suggestAdjacentSeats(){
  const b=state.booking;if(!b)return;
  let pair=null;
  for(const row of ['D','C','E','B','A','F']){
    for(const columns of [[3,4],[5,6],[2,3],[6,7],[1,2],[7,8]]){
      if(row==='F'&&columns.some(column=>column<=2))continue;
      if(columns.every(column=>!seatOccupied(row,column))){pair=columns.map(column=>`${row}${column}`);break;}
    }
    if(pair)break;
  }
  if(!pair){$('#seat-status').textContent='Non ci sono due posti vicini disponibili. Puoi scegliere i singoli posti sulla mappa.';return;}
  b.seats=pair;$$('[data-seat]').forEach(button=>{const selected=pair.includes(button.dataset.seat);button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
  $('#seat-status').textContent=`Due posti vicini selezionati: ${pair.join(' e ')}. Puoi cambiarli sulla mappa.`;updateSeatSummary();
}

function readLocal(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; }
}
function writeLocal(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
}
function getTickets() {
  const tickets = readLocal('orbita-tickets-v1', []);
  return Array.isArray(tickets) ? tickets.filter(t => t && typeof t.id === 'string' && getFilm(t.film) && /^\d{4}-\d{2}-\d{2}$/.test(t.date) && Array.isArray(t.seats) && t.seats.every(s => /^[A-F][1-8]$/.test(s)) && Number.isFinite(t.total)).slice(0, 30) : [];
}
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4200);
}
function openDialog(id) {
  $$('dialog[open]').forEach(dialog => dialog.close());
  const dialog = $(`#${id}`);
  if (!dialog.open) dialog.showModal();
}
function closeDialogs() { $$('dialog[open]').forEach(dialog => dialog.close()); }

function schedule(film, day = state.day) {
  const offset = (day % 3) * 10;
  return film.times.map((time, index) => {
    const [hour, minute] = time.split(':').map(Number);
    const mins = hour * 60 + minute + offset;
    const shiftedTime = `${String(Math.floor(mins / 60)).padStart(2,'0')}:${String(mins % 60).padStart(2,'0')}`;
    return { time:shiftedTime, original:index === (day % 2), hall:film.hall };
  });
}
function isPast(time, date = days[state.day]) {
  return new Date(`${date}T${time}:00`).getTime() < Date.now();
}
function showtimeButton(film, screening, extra = '') {
  const past = isPast(screening.time);
  return `<button class="time-button ${extra}" data-book="${film.id}" data-time="${screening.time}" data-original="${screening.original}" ${past ? 'disabled title="Spettacolo già iniziato"' : ''} aria-label="${escapeHTML(film.title)}, ore ${screening.time}, ${screening.original ? 'versione originale con sottotitoli' : 'in italiano'}${past ? ', già iniziato' : ', scegli i posti'}">${screening.time}${screening.original ? '<span>V.O.</span>' : ''}</button>`;
}
function renderDates() {
  $('#date-tabs').innerHTML = days.map((date, index) => `<button class="date-tab" data-day="${index}" aria-pressed="${state.day === index}" aria-label="${index === 0 ? 'Oggi, ' : ''}${dateFormat(date,{weekday:'long',day:'numeric',month:'long'})}"><span class="day-name">${index === 0 ? 'Oggi' : index === 1 ? 'Domani' : dateFormat(date,{weekday:'short'})}</span><span class="day-num">${dateFormat(date,{day:'2-digit'})}</span><span class="day-month">${dateFormat(date,{month:'short'})}</span></button>`).join('');
}
function renderFilms() {
  const filtered = films.filter(film => (state.genre === 'all' || film.genre === state.genre) && (!state.original || schedule(film).some(s => s.original)));
  const shown = state.expanded ? filtered : filtered.slice(0, 4);
  $('#film-grid').innerHTML = shown.map((film, index) => {
    const screenings = schedule(film).filter(s => !state.original || s.original);
    const allPast = screenings.every(s => isPast(s.time));
    return `<article class="film-card reveal"><button class="film-poster" data-film="${film.id}" aria-label="Scopri ${escapeHTML(film.title)}"><img src="/demos/orbita/assets/${film.image}" alt="Locandina di ${escapeHTML(film.title)}" loading="lazy" width="500" height="750"><span class="poster-tag ${index === 0 && state.genre === 'all' ? 'highlight' : ''}">${film.id === 'dune' ? '4K LASER' : film.id === 'interstellar' ? 'DI NUOVO AL CINEMA' : film.id === 'perfect-days' ? 'DA NON PERDERE' : film.id === 'poor-things' ? 'VISIONI D’AUTORE' : 'ORBITA REWIND'}</span><span class="poster-arrow">${icon('arrow')}</span></button><div class="film-meta"><span>${film.genre}</span><span>${film.duration} MIN · ${film.year}</span></div><h3><button class="film-title-button" data-film="${film.id}">${film.title}</button></h3><p class="film-director">di ${film.director}</p><div class="film-times">${screenings.map(s => showtimeButton(film,s)).join('')}</div><p class="film-format">${allPast ? 'OGGI GIÀ INIZIATO · SCOPRI DOMANI' : `SALA ${String(film.hall).padStart(2,'0')} · ${state.original ? 'V.O. CON SOTTOTITOLI ITA' : 'ITA / V.O. SOTTOTITOLATA'}`}</p></article>`;
  }).join('');
  $('#film-results').textContent = filtered.length ? `${filtered.length} ${filtered.length === 1 ? 'STORIA' : 'STORIE'}. IL TUO PROSSIMO VIAGGIO.` : 'NESSUN FILM CON QUESTI FILTRI.';
  $('#program-empty').hidden = filtered.length > 0;
  const more = $('#more-films');
  more.hidden = filtered.length <= 4;
  more.innerHTML = `${state.expanded ? 'Mostra meno film' : 'Tutta la programmazione'} ${icon(state.expanded ? 'chevron' : 'arrow')}`;
  more.setAttribute('aria-expanded', String(state.expanded));
  syncQuickBooking();
  observeReveals();
}
function renderFilmDetail(id) {
  const film = getFilm(id);
  if (!film) return;
  $('#film-detail').innerHTML = `<div class="film-detail-layout"><div class="detail-poster"><img src="/demos/orbita/assets/${film.image}" alt="Locandina di ${escapeHTML(film.title)}" width="500" height="750"></div><div class="detail-content"><span class="eyebrow">${film.tag}</span><h2>${film.title}</h2><p class="detail-director">Un film di ${film.director}</p><div class="detail-tags"><span>${film.year}</span><span>${film.genre.toUpperCase()}</span><span>${film.duration} MIN</span><span>4K LASER</span></div><p class="detail-synopsis">${film.synopsis}</p><p class="detail-cast"><strong>Con</strong> ${film.cast}<br><strong>Origine</strong> ${film.country} · V.O. in ${film.original.toLowerCase()}</p><div class="detail-actions"><button class="text-link" data-trailer="${film.id}">Guarda il trailer ${icon('play')}</button><span class="small-label">4K LASER · SALA ${String(film.hall).padStart(2,'0')}</span></div><div class="detail-booking"><span class="small-label">${dateFormat(days[state.day],{weekday:'long',day:'numeric',month:'long'}).toUpperCase()} · SCEGLI UN ORARIO</span><div class="film-times">${schedule(film).map(s => showtimeButton(film,s)).join('')}</div><p class="detail-booking-note">V.O. = versione originale con sottotitoli in italiano.<br>Prenotazioni dimostrative, nessun pagamento.</p></div></div></div>`;
  openDialog('film-dialog');
}
function renderSearch(query = '') {
  const normalized = query.toLocaleLowerCase('it').trim();
  const matches = films.filter(film => `${film.title} ${film.director} ${film.genre} ${film.cast}`.toLocaleLowerCase('it').includes(normalized));
  $('#search-results').innerHTML = `<span class="search-results-label">${normalized ? `${matches.length} ${matches.length === 1 ? 'MONDO TROVATO' : 'MONDI TROVATI'}` : 'LA NOSTRA SELEZIONE, TUTTA DA ESPLORARE.'}</span>${matches.map(film => `<button class="search-result" data-film="${film.id}"><img src="/demos/orbita/assets/${film.image}" alt="" width="48" height="65"><span class="search-result-copy"><h3>${film.title}</h3><p>${film.director} · ${film.genre} · ${film.duration} min</p></span>${icon('arrow')}</button>`).join('')}${matches.length ? '' : '<p class="search-no-results">Questo mondo non è ancora nel nostro universo. Prova un altro titolo, regista o genere.</p>'}`;
}
function openSearch() {
  $('#film-search').value = '';
  renderSearch();
  openDialog('search-dialog');
  $('#film-search').focus();
}
function openTrailer(id) {
  const film = getFilm(id);
  if (!film) return;
  $('#trailer-content').innerHTML = `<div class="trailer-inner"><h2>${film.title} · Trailer ufficiale</h2><div class="trailer-video"><iframe src="https://www.youtube-nocookie.com/embed/${film.trailer}?rel=0&autoplay=1" title="Trailer ufficiale di ${escapeHTML(film.title)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><p class="trailer-fallback"><span>Il trailer è ospitato da YouTube.</span><a href="https://www.youtube.com/watch?v=${film.trailer}" target="_blank" rel="noopener noreferrer">Apri su YouTube ↗</a></p></div>`;
  openDialog('trailer-dialog');
}

const tariffs = { full:{name:'Intero',price:10.5}, reduced:{name:'Ridotto',price:8}, under26:{name:'Under 26',price:7}, club:{name:'Orbita Club',price:8.4} };
function bookingTotal() { return state.booking.seats.length * tariffs[state.booking.tariff].price; }
function bookingSide() {
  const b = state.booking, film = getFilm(b.film);
  return `<aside class="booking-side"><div class="booking-side-brand">${icon('orbit')} ORBITA</div><img src="/demos/orbita/assets/${film.image}" alt="Locandina di ${escapeHTML(film.title)}" width="139" height="200"><h3>${film.title}</h3><p>${film.director} · ${film.duration} min<br>${b.original ? `Versione originale (${film.original}) · sottotitoli ITA` : 'Versione italiana'}</p><div class="booking-session"><strong>${dateFormat(b.date,{weekday:'long',day:'numeric',month:'long'})}</strong><span>Ore ${b.time} · Sala ${String(film.hall).padStart(2,'0')}</span></div><button class="booking-session-change" id="change-booking-session">Cambia giorno o orario ↗</button><p class="demo-note">UN BIGLIETTO PER IMMAGINARE.<br>Questa è una prenotazione dimostrativa. Nessun pagamento e nessun posto riservato in un cinema reale.</p></aside>`;
}
function bookingSteps(step) { return `<div class="booking-steps"><span class="${step === 1 ? 'active' : ''}"><b>${step > 1 ? '✓' : '1'}</b> IL TUO POSTO</span><span aria-hidden="true">—</span><span class="${step === 2 ? 'active' : ''}"><b>2</b> IL TUO BIGLIETTO</span></div>`; }
function seatOccupied(row, column) {
  const b = state.booking;
  const hash = [...`${b.film}${b.date}${b.time}`].reduce((sum, ch) => sum + ch.charCodeAt(0),0);
  const saved = getTickets().some(t => t.film === b.film && t.date === b.date && t.time === b.time && t.seats.includes(`${row}${column}`));
  const generated = ((row.charCodeAt(0)*13 + column*7 + hash) % 17) < 4;
  return saved || (row === 'F' && column <= 2 ? false : generated);
}
function openBooking(id, time, original, options = {}) {
  const film = getFilm(id);
  if (!film) return;
  const date = options.date || days[state.day];
  if (isPast(time,date)) { showToast('Questo spettacolo è già iniziato. Scegli un altro orario.'); return; }
  state.booking = {film:id,time,original:original === true || original === 'true',date,seats:[],tariff:readLocal('orbita-club-v1',false) ? 'club' : 'full',step:1};
  quickState.film=id;quickState.time=time;syncQuickBooking();
  renderBookingSeats();
  openDialog('booking-dialog');
}
function renderBookingSeats() {
  const b = state.booking;
  b.step = 1;
  const rows = ['A','B','C','D','E','F'];
  const map = rows.map(row => `<div class="seat-row"><span class="row-label" aria-hidden="true">${row}</span>${Array.from({length:8},(_,i) => {
    const col = i + 1, seatId = `${row}${col}`, occupied = seatOccupied(row,col), chosen = b.seats.includes(seatId), accessible = row === 'F' && col <= 2;
    return `${i === 4 ? '<span class="seat-aisle" aria-hidden="true"></span>' : ''}<button class="seat ${occupied ? 'occupied' : ''} ${chosen ? 'selected' : ''} ${accessible ? 'accessible' : ''}" data-seat="${seatId}" ${occupied ? 'disabled' : ''} aria-pressed="${chosen}" aria-label="Fila ${row}, posto ${col}${accessible ? ', spazio accessibile in carrozzina' : ''}${occupied ? ', occupato' : ''}">${accessible ? '♿' : col}</button>`;
  }).join('')}<span class="row-label" aria-hidden="true">${row}</span></div>`).join('');
  $('#booking-content').innerHTML = `<div class="booking-layout">${bookingSide()}<div class="booking-main">${bookingSteps(1)}<h2>Il tuo posto <span class="serif-word">è qui.</span></h2><p class="booking-lead">Scegli fino a 6 posti. Il viaggio sta per cominciare.</p><div class="cinema-screen">LO SCHERMO, IL TUO ALTROVE.</div><div class="seat-map" role="group" aria-label="Mappa della sala: sei file da A a F, otto posti per fila. Posti accessibili F1 e F2.">${map}</div><div class="seat-legend"><span><i class="legend-box"></i> Disponibile</span><span><i class="legend-box chosen"></i> Il tuo posto</span><span><i class="legend-box taken"></i> Occupato</span><span>♿ Accessibile</span></div><div class="seat-tools"><button class="seat-suggest" id="suggest-seats">${icon('star')} Consigliami 2 posti vicini</button></div><div class="booking-tariff"><label for="tariff-select">Il tuo biglietto</label><select id="tariff-select">${Object.entries(tariffs).filter(([key]) => key !== 'club' || readLocal('orbita-club-v1',false)).map(([key,t])=>`<option value="${key}" ${b.tariff === key ? 'selected' : ''}>${t.name} · ${money(t.price)}</option>`).join('')}</select></div><div class="booking-summary"><div><small id="seat-count">NESSUN POSTO SELEZIONATO</small><strong id="seat-selection">Dove vuoi sederti?</strong></div><div><small>TOTALE</small><strong id="booking-total" class="booking-total">${money(bookingTotal())}</strong></div></div><button class="button button-orange" id="booking-continue" disabled>Continua verso il tuo biglietto ${icon('right')}</button><p id="seat-status" class="seat-status" role="status" aria-live="polite"></p></div></div>`;
  updateSeatSummary();
}
function updateSeatSummary() {
  const b = state.booking;
  const count = b.seats.length;
  $('#seat-count').textContent = count ? `${count} ${count === 1 ? 'POSTO SELEZIONATO' : 'POSTI SELEZIONATI'}` : 'NESSUN POSTO SELEZIONATO';
  $('#seat-selection').textContent = count ? b.seats.join(' · ') : 'Dove vuoi sederti?';
  $('#booking-total').textContent = money(bookingTotal());
  $('#booking-continue').disabled = !count;
  $('#booking-continue').innerHTML=`${count?`Continua · ${money(bookingTotal())}`:'Scegli almeno un posto'} ${icon('right')}`;
}
function toggleSeat(button) {
  const b = state.booking, seat = button.dataset.seat;
  if (b.seats.includes(seat)) b.seats = b.seats.filter(s => s !== seat);
  else {
    if (b.seats.length >= 6) { $('#seat-status').textContent = 'Puoi scegliere fino a 6 posti per prenotazione.'; return; }
    b.seats.push(seat);
    b.seats.sort();
  }
  button.classList.toggle('selected', b.seats.includes(seat));
  button.setAttribute('aria-pressed', String(b.seats.includes(seat)));
  $('#seat-status').textContent = b.seats.length ? `${b.seats.length} ${b.seats.length === 1 ? 'posto selezionato' : 'posti selezionati'}: ${b.seats.join(', ')}.` : 'Selezione annullata.';
  updateSeatSummary();
}
function renderBookingForm() {
  const b = state.booking;
  if (!b || !b.seats.length) return;
  b.step = 2;
  $('#booking-content').innerHTML = `<div class="booking-layout">${bookingSide()}<div class="booking-main">${bookingSteps(2)}<h2>Quasi <span class="serif-word">altrove.</span></h2><p class="booking-lead">Manca soltanto un nome sul tuo biglietto.</p><div class="order-review"><div>${b.seats.length} ${b.seats.length === 1 ? 'posto' : 'posti'} · ${tariffs[b.tariff].name}<strong>${b.seats.join(' · ')}</strong></div><span>${money(bookingTotal())}</span></div><form class="booking-form" id="booking-form"><label for="booking-name">Nome sul biglietto<input id="booking-name" name="name" placeholder="Il tuo nome o un soprannome" required maxlength="60" autocomplete="given-name" value="${escapeHTML(b.name || '')}"></label><p class="mini-note">È un'esperienza dimostrativa: non ti chiediamo dati di pagamento o email. Il biglietto verrà salvato solo in questo browser. Non è valido per l'accesso a una sala reale.</p><button class="button button-orange" type="submit">Crea il mio biglietto demo ${icon('ticket')}</button><button class="back-button" id="booking-back" type="button">${icon('right')} Torna alla scelta dei posti</button></form></div></div>`;
  $('#booking-name').focus();
  $('#booking-dialog').scrollTop = 0;
}
function confirmBooking(event) {
  event.preventDefault();
  const b = state.booking;
  if (!b || !b.seats.length) return;
  const name = $('#booking-name').value.trim();
  if (!name) { $('#booking-name').setCustomValidity('Inserisci un nome o un soprannome.'); $('#booking-name').reportValidity(); return; }
  const conflict = b.seats.some(seat => seatOccupied(seat[0],Number(seat.slice(1))));
  if (conflict) { showToast('Un posto risulta già occupato in questo browser. Scegli di nuovo i tuoi posti.'); b.seats=[]; renderBookingSeats(); return; }
  const ticket = {id:`ORB-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).slice(2,5).toUpperCase()}`, film:b.film, date:b.date,time:b.time,original:b.original,seats:[...b.seats],tariff:b.tariff,total:bookingTotal(),name:name.slice(0,60),created:new Date().toISOString()};
  const tickets = getTickets();
  tickets.unshift(ticket);
  const saved = writeLocal('orbita-tickets-v1', tickets.slice(0,30));
  state.lastTicket = ticket;
  updateTicketCount();
  renderBookingSuccess(ticket,saved);
}
function barcodeSVG(id) {
  const bars = [...id].flatMap((letter,index) => Array.from({length:3},(_,i) => `<rect x="${index*8+i*2.5}" y="0" width="${(letter.charCodeAt(0)+i)%2 ? 1 : 1.8}" height="32" fill="#f4f1e9"/>`)).join('');
  return `<svg viewBox="0 0 ${id.length*8} 32" aria-hidden="true">${bars}</svg>`;
}
function ticketMarkup(ticket) {
  const film = getFilm(ticket.film);
  return `<div class="demo-ticket"><div class="demo-ticket-top"><span class="demo-ticket-logo">ORBITA CINEMA</span><span>DEMO / NON VALIDO PER L'ACCESSO</span></div><h3>${film.title}</h3><div class="demo-ticket-meta"><div><span>QUANDO</span>${dateFormat(ticket.date,{day:'numeric',month:'long'})} · ${ticket.time}</div><div><span>DOVE</span>Sala ${film.hall} · ${ticket.seats.join(', ')}</div><div><span>OSPITE</span>${escapeHTML(ticket.name)}</div><div><span>TARIFFA DEMO</span>${money(ticket.total)} · ${tariffs[ticket.tariff]?.name || 'Intero'}</div></div><div class="demo-ticket-bottom">${barcodeSVG(ticket.id)}<span>${escapeHTML(ticket.id)}<br>CI VEDIAMO IN UN ALTRO MONDO.</span></div></div>`;
}
function renderBookingSuccess(ticket,saved) {
  $('#booking-content').innerHTML = `<div class="success-inner"><div class="success-orbit">${icon('check')}</div><span class="eyebrow" style="justify-content:center">IL PROSSIMO VIAGGIO HA IL TUO NOME.</span><h2>Buona <span class="serif-word">visione.</span></h2><p>Il tuo biglietto dimostrativo è pronto.<br>${saved ? 'Lo ritrovi anche in “I tuoi biglietti”, in questo browser.' : 'Il browser non consente il salvataggio: scaricalo ora per conservarlo.'}</p>${ticketMarkup(ticket)}<div class="success-actions"><button class="button button-orange" data-download="${ticket.id}">Scarica il biglietto ${icon('ticket')}</button><button class="button button-outline" data-close>Torna al cinema ${icon('arrow')}</button></div></div>`;
  $('#booking-dialog').scrollTop = 0;
}
function updateTicketCount() {
  const count = getTickets().length;
  $$('.ticket-count').forEach(el => { el.textContent = count; el.hidden = !count; });
}
function renderTickets() {
  const tickets = getTickets();
  $('#tickets-list').innerHTML = tickets.length ? `${tickets.map(t => {
    const film = getFilm(t.film);
    return `<article class="saved-ticket"><img src="/demos/orbita/assets/${film.image}" alt="" width="80" height="115"><div class="saved-ticket-copy"><span class="small-label">PRENOTAZIONE DEMO · ${escapeHTML(t.id)}</span><h3>${film.title}</h3><p>${dateFormat(t.date,{weekday:'short',day:'numeric',month:'long'})} · Ore ${escapeHTML(t.time)} · Sala ${film.hall}<br>Posti ${t.seats.join(', ')} · ${money(t.total)} · ${t.original ? 'V.O. sottotitolata' : 'ITA'}</p><div class="saved-ticket-actions"><button data-download="${escapeHTML(t.id)}">Scarica biglietto ↗</button><button class="delete-ticket" data-delete="${escapeHTML(t.id)}">Rimuovi demo</button></div></div></article>`;
  }).join('')}<p class="ticket-note">Questi biglietti sono dimostrativi e non consentono l'accesso a proiezioni reali. Sono salvati esclusivamente nel tuo browser. Puoi rimuoverli in qualsiasi momento.</p>` : `<div class="tickets-empty">${icon('orbit')}<h3>La prossima storia ti aspetta.</h3><p>Il tuo primo biglietto per un altro mondo non è ancora qui.</p><button class="button button-orange" data-go-program>Trova il tuo film ${icon('arrow')}</button></div>`;
  openDialog('tickets-dialog');
}
function downloadTicket(id) {
  const ticket = getTickets().find(t => t.id === id) || (state.lastTicket?.id === id ? state.lastTicket : null);
  if (!ticket) { showToast('Questo biglietto non è più disponibile.'); return; }
  const film = getFilm(ticket.film);
  const xml = escapeHTML;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520"><rect width="900" height="520" fill="#f4f1e9"/><rect x="25" y="25" width="850" height="470" fill="#1c1e1a"/><rect x="25" y="25" width="12" height="470" fill="#ff5a2b"/><g font-family="Arial, sans-serif" fill="#f4f1e9"><text x="65" y="88" font-size="30" font-weight="bold" letter-spacing="4">ORBITA CINEMA</text><text x="65" y="125" font-size="12" fill="#ff5a2b" letter-spacing="2">BIGLIETTO DIMOSTRATIVO</text><text x="65" y="200" font-size="35" font-weight="bold">${xml(film.title)}</text><text x="65" y="235" font-size="16" fill="#c2c7b9">${xml(film.director)} · ${film.duration} min · ${ticket.original ? 'V.O. con sottotitoli ITA' : 'Versione italiana'}</text><path d="M65 270h770" stroke="#727b65" stroke-dasharray="5 5"/><text x="65" y="309" font-size="12" fill="#b0b7a5">DATA E ORA</text><text x="65" y="340" font-size="21">${xml(dateFormat(ticket.date,{day:'numeric',month:'long',year:'numeric'}))} · ${xml(ticket.time)}</text><text x="480" y="309" font-size="12" fill="#b0b7a5">SALA E POSTI</text><text x="480" y="340" font-size="21">Sala ${film.hall} · ${xml(ticket.seats.join(', '))}</text><text x="65" y="386" font-size="14">${xml(ticket.name)} · ${xml(money(ticket.total))} · ${xml(tariffs[ticket.tariff]?.name || 'Intero')}</text><text x="65" y="431" font-size="12" letter-spacing="2" fill="#ff5a2b">NON VALIDO PER L'ACCESSO A PROIEZIONI REALI.</text><text x="65" y="461" font-size="11" fill="#aab3a0">${xml(ticket.id)} · Progetto di portfolio · Nessun pagamento effettuato.</text></g></svg>`;
  const blob = new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a'); anchor.href=url; anchor.download=`ORBITA-${ticket.id}.svg`; document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}

const infoContent = {
  cinema: () => `<span class="eyebrow">UN CINEMA. INFINITI UNIVERSI.</span><h2>Benvenuto<br>nel tuo <span class="serif-word">altrove.</span></h2><p class="info-highlight">ORBITA è il cinema che vorremmo trovare dietro l'angolo.</p><p>Un luogo indipendente dove il cinema d'autore incontra le grandi visioni. Tre sale, un foyer dove fermarsi a parlare e una programmazione che mescola nuove ossessioni e film da riscoprire.</p><ul><li><span>Proiezione</span><strong>4K Laser</strong></li><li><span>Audio</span><strong>Suono immersivo</strong></li><li><span>Sale</span><strong>3 universi da esplorare</strong></li><li><span>Accessibilità</span><strong>Spazi dedicati in ogni sala</strong></li></ul><p class="mini-note">ORBITA è un concept immaginario realizzato per un portfolio. Le caratteristiche descritte illustrano il progetto.</p><button class="button button-orange" data-go-program>Scegli il tuo prossimo film ${icon('arrow')}</button>`,
  tariffe: () => `<span class="eyebrow">UN MONDO DI STORIE. UN BIGLIETTO.</span><h2>Ci vediamo<br><span class="serif-word">in sala.</span></h2><p>Ogni giorno apriamo 30 minuti prima del primo spettacolo. Scegli un orario nella programmazione per esplorare la prenotazione.</p><ul><li><span>Intero</span><strong>€10,50</strong></li><li><span>Ridotto · over 65</span><strong>€8,00</strong></li><li><span>Under 26</span><strong>€7,00</strong></li><li><span>Soci Orbita Club</span><strong>€8,40</strong></li><li><span>Rassegne speciali</span><strong>Prezzo nella scheda evento</strong></li></ul><p class="mini-note">Tariffe dimostrative. Il sito non effettua vendite, addebiti o prenotazioni reali.</p><button class="button button-orange" data-go-program>Guarda la programmazione ${icon('arrow')}</button>`,
  posizione: () => `<span class="eyebrow">MILANO, TERRA. IL RESTO È CINEMA.</span><h2>Un punto<br>di <span class="serif-word">incontro.</span></h2><p class="info-highlight">Il nostro quartiere immaginato: Isola, Milano.</p><p>Tra cinema, librerie e conversazioni che continuano dopo i titoli di coda, ORBITA nasce come idea di uno spazio culturale di quartiere, aperto a sguardi e generazioni diverse.</p><p>Il progetto immagina un cinema accessibile con i mezzi pubblici, con un foyer aperto prima degli spettacoli e spazi senza barriere.</p><p class="mini-note">Non esiste una sede fisica di ORBITA. Per evitare indicazioni errate non sono presenti indirizzi, numeri di telefono o una mappa verso un'attività reale.</p>`,
  club: () => `<span class="eyebrow">IL CINEMA È PIÙ BELLO QUANDO RITORNI.</span><h2>Un posto nel<br>nostro <span class="serif-word">universo.</span></h2><p>Per chi dice sempre “ancora un film”. Una tessera, tante buone ragioni per tornare al cinema.</p><div class="info-price">35€ <span>/ anno, nel concept</span></div><ul><li><span>Ogni proiezione ordinaria</span><strong>20% sul biglietto intero</strong></li><li><span>Film & conversazioni</span><strong>Anteprime dedicate</strong></li><li><span>La tua passione</span><strong>Una comunità con cui condividerla</strong></li></ul><p class="mini-note">Puoi attivare gratuitamente una tessera dimostrativa in questo browser. Non è un abbonamento reale e non prevede addebiti.</p><button class="button button-dark" id="activate-club">${readLocal('orbita-club-v1',false) ? 'Tessera demo già attiva ✓' : 'Attiva la tessera demo'} ${icon('orbit')}</button>`,
  privacy: () => `<span class="eyebrow">TRASPARENZA, ANCHE QUANDO SI SPENGONO LE LUCI.</span><h2>Privacy<br>& <span class="serif-word">crediti.</span></h2><div class="legal-section"><h3>Un progetto di portfolio</h3><p>ORBITA Cinema è un'attività immaginaria. Programmazione, eventi, prezzi, servizi e biglietti sono illustrativi. Non vengono effettuati pagamenti né prenotazioni per spettacoli reali.</p></div><div class="legal-section"><h3>I tuoi dati restano nel browser</h3><p>Il sito salva nel localStorage di questo browser solo i biglietti dimostrativi (incluso il nome o soprannome scelto) e l'eventuale tessera demo. Non invia questi dati a un server e non utilizza strumenti di analisi o cookie pubblicitari propri. Puoi rimuovere i biglietti singolarmente o cancellare tutti i dati dimostrativi qui sotto.</p></div><div class="legal-section"><h3>Video esterni</h3><p>I trailer vengono caricati da YouTube in modalità privacy avanzata solo quando decidi di aprirli. La riproduzione è soggetta alle condizioni e all'informativa privacy di YouTube.</p></div><div class="legal-section"><h3>Immagini & tipografia</h3><p>Locandine e fotogrammi appartengono ai rispettivi autori e distributori. Materiali promozionali da TMDB, NEON, Warner Bros., Searchlight Pictures e fonti editoriali, utilizzati per illustrare questo concept. Fotografie della sala: Unsplash. Font: Barlow Condensed e DM Sans, distribuiti con SIL Open Font License. Nessuna affiliazione con i titolari dei film.</p></div><button class="button button-outline" id="clear-local-data">Cancella tutti i dati demo ${icon('close')}</button>`
};
function openInfo(kind) {
  const content = infoContent[kind];
  if (!content) return;
  $('#info-content').innerHTML = `<div class="info-inner">${content()}</div>`;
  $('#info-dialog').setAttribute('aria-label', {cinema:'Il cinema ORBITA',tariffe:'Orari e tariffe',posizione:'Dove immaginiamo ORBITA',club:'Orbita Club',privacy:'Privacy e crediti'}[kind]);
  openDialog('info-dialog');
}
function openEvent(kind) {
  const isNolan = kind === 'nolan';
  const html = isNolan ? `<span class="eyebrow">ORBITA REWIND / 31 OTTOBRE 2026</span><h2>Una notte<br>con <span class="serif-word">Nolan.</span></h2><img class="info-event-cover" src="/demos/orbita/assets/interstellar-scene.jpg" alt="Fotogramma di Interstellar"><p>Il tempo si piega, i sogni si moltiplicano, lo spazio non ha più confini. Una maratona immaginaria dedicata al cinema di Christopher Nolan, da vivere in versione originale con sottotitoli italiani.</p><ul><li><span>18:00</span><strong>The Prestige</strong></li><li><span>20:45</span><strong>Inception</strong></li><li><span>23:45</span><strong>Interstellar</strong></li></ul><p class="mini-note">Evento dimostrativo · €24 per la maratona nel concept.<br>Puoi esplorare anche la scheda di Interstellar nella programmazione ordinaria.</p><button class="button button-orange" data-film="interstellar">Riscopri Interstellar ${icon('arrow')}</button>` : `<span class="eyebrow">MONDI D'AUTORE / 7 NOVEMBRE 2026</span><h2>Il mondo<br>è di <span class="serif-word">Wes.</span></h2><img class="info-event-cover" src="/demos/orbita/assets/wes-scene.jpg" alt="Il Grand Budapest Hotel di Wes Anderson"><p>Simmetrie impossibili, personaggi irripetibili e colori che sembrano inventati apposta per noi. Una serata immaginaria dedicata a Wes Anderson, tra cinema e conversazioni.</p><ul><li><span>19:30</span><strong>Introduzione al mondo di Wes</strong></li><li><span>20:00</span><strong>The Grand Budapest Hotel · V.O.</strong></li><li><span>21:45</span><strong>Conversazione dopo il film</strong></li></ul><p class="mini-note">Evento dimostrativo · €12 nel concept.<br>Scopri il film anche nella programmazione ordinaria.</p><button class="button button-orange" data-film="budapest">Entra al Grand Budapest ${icon('arrow')}</button>`;
  $('#info-content').innerHTML = `<div class="info-inner">${html}</div>`;
  $('#info-dialog').setAttribute('aria-label',isNolan ? 'Rassegna Una notte con Nolan' : 'Rassegna Il mondo è di Wes');
  openDialog('info-dialog');
}

let revealObserver;
function observeReveals() {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('revealed'); revealObserver.unobserve(entry.target); } }), {threshold:.06});
  }
  $$('.reveal:not(.revealed)').forEach(el => revealObserver.observe(el));
}

document.addEventListener('click', event => {
  const target = event.target.closest('button,a');
  if (!target) return;
  if (target.matches('[data-close]')) { target.closest('dialog')?.close(); return; }
  if (target.matches('[data-film]')) { renderFilmDetail(target.dataset.film); return; }
  if (target.matches('[data-book]')) { openBooking(target.dataset.book,target.dataset.time,target.dataset.original); return; }
  if (target.matches('[data-trailer]')) { openTrailer(target.dataset.trailer); return; }
  if (target.matches('[data-info]')) { openInfo(target.dataset.info); return; }
  if (target.matches('[data-event]')) { openEvent(target.dataset.event); return; }
  if (target.matches('[data-hero-index]')) { renderFeatured(Number(target.dataset.heroIndex)); return; }
  if (target.matches('[data-hero-step]')) { switchHero(Number(target.dataset.heroStep)); return; }
  if (target.matches('.search-trigger')) { openSearch(); return; }
  if (target.matches('.ticket-trigger')) { renderTickets(); return; }
  if (target.matches('[data-day]')) { state.day=Number(target.dataset.day); renderDates(); renderFilms(); return; }
  if (target.matches('[data-seat]')) { toggleSeat(target); return; }
  if (target.matches('[data-download]')) { downloadTicket(target.dataset.download); return; }
  if (target.matches('[data-delete]')) { const updated = getTickets().filter(t=>t.id !== target.dataset.delete); if(writeLocal('orbita-tickets-v1',updated)){updateTicketCount();renderTickets();showToast('Biglietto dimostrativo rimosso.');}else{showToast('Il browser non consente di modificare i dati locali.');} return; }
  if (target.matches('[data-go-program]')) { closeDialogs(); $('#programmazione').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}); return; }
  if (target.id === 'hero-buy') { buyHeroTicket();return; }
  if (target.id === 'dock-buy') { buyQuickTicket();return; }
  if (target.id === 'dock-change') { focusTicketPicker();return; }
  if (target.id === 'suggest-seats') { suggestAdjacentSeats();return; }
  if (target.id === 'change-booking-session') { quickState.film=state.booking.film;quickState.time=state.booking.time;syncQuickBooking();focusTicketPicker();return; }
  if (target.id === 'more-films') { const previous=state.expanded;state.expanded=!state.expanded;renderFilms();if(previous)$('#programmazione').scrollIntoView({behavior:'smooth'});return; }
  if (target.id === 'reset-filters') { state.genre='all';state.original=false;$('#genre-filter').value='all';$('#original-filter').checked=false;renderFilms();return; }
  if (target.id === 'booking-continue') { renderBookingForm();return; }
  if (target.id === 'booking-back') { state.booking.name=$('#booking-name').value;renderBookingSeats();return; }
  if (target.id === 'activate-club') { if(writeLocal('orbita-club-v1',true)){target.innerHTML=`Tessera demo attiva ${icon('check')}`;syncQuickBooking();showToast('Benvenuto in Orbita Club. La tariffa demo è disponibile nella prenotazione.');}else{showToast('Il browser non consente il salvataggio della tessera demo.');}return; }
  if (target.id === 'clear-local-data') { try{localStorage.removeItem('orbita-tickets-v1');localStorage.removeItem('orbita-club-v1');state.lastTicket=null;updateTicketCount();syncQuickBooking();showToast('Tutti i biglietti e la tessera demo sono stati cancellati.');}catch{showToast('Il browser non consente di cancellare i dati locali.');}return; }
  if (target.matches('.menu-toggle')) { const expanded=target.getAttribute('aria-expanded')==='true';target.setAttribute('aria-expanded',String(!expanded));target.setAttribute('aria-label',expanded?'Apri menu':'Chiudi menu');$('#mobile-nav').hidden=expanded;return; }
  if (target.closest('#mobile-nav')) { $('#mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Apri menu'); }
});
$('#genre-filter').addEventListener('change',event=>{state.genre=event.target.value;renderFilms();});
$('#original-filter').addEventListener('change',event=>{state.original=event.target.checked;renderFilms();});
$('#film-search').addEventListener('input',event=>renderSearch(event.target.value));
document.addEventListener('change',event=>{if(event.target.id==='tariff-select' && tariffs[event.target.value]){state.booking.tariff=event.target.value;updateSeatSummary();}});
document.addEventListener('submit',event=>{if(event.target.id==='booking-form')confirmBooking(event);});
document.addEventListener('input',event=>{if(event.target.id==='booking-name')event.target.setCustomValidity('');});
$$('dialog').forEach(dialog=>{
  dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();});
  dialog.addEventListener('close',()=>{if(dialog.id==='trailer-dialog')$('#trailer-content').innerHTML='';});
});
document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;const dialog=$('dialog[open]');if(dialog){event.preventDefault();dialog.close();return;}$('#mobile-nav').hidden=true;$('.menu-toggle').setAttribute('aria-expanded','false');$('.menu-toggle').setAttribute('aria-label','Apri menu');},true);
window.addEventListener('storage',event=>{if(event.key==='orbita-tickets-v1'){updateTicketCount();if($('#tickets-dialog').open)renderTickets();}});
$('#quick-film').addEventListener('change',event=>{quickState.film=event.target.value;quickState.time=null;const index=heroFilms.findIndex(f=>f.id===quickState.film);if(index>=0)renderFeatured(index,false);syncQuickBooking();});
$('#quick-day').addEventListener('change',event=>{state.day=Number(event.target.value);quickState.time=null;renderDates();renderFilms();});
$('#quick-time').addEventListener('change',event=>{quickState.time=event.target.value;syncQuickBooking();});
$('#biglietti').addEventListener('submit',event=>{event.preventDefault();buyQuickTicket();});
$('#copyright-year').textContent=String(new Date().getFullYear());
renderDates();
renderFilms();
updateTicketCount();
