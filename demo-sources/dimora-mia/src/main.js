import './local-fonts.css';
import {localAPI} from './local-api.js';
import './style.css';
import './experience.css';
import {initExperience,augmentTimeline} from './experience.js';
import gsap from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n/100);
const dateString=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const today=dateString(new Date()), tomorrow=dateString(new Date(Date.now()+86400000));
let sharedBooking=false,reservationKey=null;
const forceLocalDemo=new URLSearchParams(location.search).get('demo')==='1';
const bookingService=forceLocalDemo?Promise.resolve({enabled:false,localDemo:true}):fetch('/api/casa-mia/status',{cache:'no-store'}).then(async r=>r.status===404?{enabled:false}:r.ok?r.json():{enabled:false,unavailable:true}).catch(()=>({enabled:false,unavailable:true}));
function useSharedBooking(){if(sharedBooking)return;sharedBooking=true;$('.booking-heading small').innerHTML='PRENOTAZIONI DIRETTE · AMBIENTE DI PROVA<br>Calendario condiviso con il proprietario. Nessun pagamento reale.';$('.status-dot').textContent='BOOKING TEST';$('#availability-form button[type=submit]').innerHTML='Verifica disponibilità <span>↗</span>'}

let motion=localStorage.getItem('dimora-motion')!=='reduced'&&!matchMedia('(prefers-reduced-motion: reduce)').matches, timeline, context;
function setupMotion(){
 context?.revert();document.body.classList.toggle('reduced',!motion);$('#motion-toggle').textContent=motion?'Riduci movimento':'Attiva esperienza';
 if(!motion)return;
 const mobile=matchMedia('(max-width:700px)').matches;
 context=gsap.context(()=>{
 const wrap=$('.portal-wrap'), rect={left:wrap.offsetLeft,top:wrap.offsetTop,width:wrap.offsetWidth,height:wrap.offsetHeight}, scale=Math.max(innerWidth/rect.width,innerHeight/rect.height)*1.05;
 timeline=gsap.timeline({scrollTrigger:{trigger:'.journey',start:'top top',end:'bottom bottom',scrub:.7,invalidateOnRefresh:true,onUpdate:self=>{const p=self.progress;$('.nav').classList.toggle('scrolled',p>.025||scrollY>80);$('.index-current').textContent=String(p<.32?1:p<.55?2:p<.8?3:4).padStart(2,'0');$('.chapter-label').textContent=p<.32?'LA DIMORA':p<.55?'L’INTIMITÀ':p<.8?'IL TEMPO RITROVATO':'IL TUO PROSSIMO CAPITOLO';gsap.set('.index-track i',{height:`${p*100}%`});}}});
 timeline.to('.hero-copy,.arrival-line',{autoAlpha:0,y:-35,duration:.7},.1)
 .to('.hero-bottom,.portal-caption,.vertical-note',{autoAlpha:0,duration:.4},.2)
 .to('.door-left',{rotationY:-105,transformPerspective:1000,duration:1.5,ease:'power1.inOut'},0)
 .to('.door-right',{rotationY:105,transformPerspective:1000,duration:1.5,ease:'power1.inOut'},0)
 .to('.door-light',{opacity:0,duration:1},.4)
 .to('.portal-outline',{opacity:0,duration:.7},.5)
 .to('.portal-wrap',{x:innerWidth/2-(rect.left+rect.width/2),y:innerHeight/2-(rect.top+rect.height/2),scale,duration:2,ease:'power2.inOut'},.45)
 .to('.portal',{borderRadius:'0%',duration:1.4},.8)
 .to('.living-img',{scale:1.12,xPercent:mobile?-3:-6,duration:2.3,ease:'none'},1)
 .to('.living-shade',{background:'linear-gradient(90deg,rgba(27,37,26,.65),transparent 85%)',duration:1},1.2)
 .fromTo('.copy-living',{y:24},{autoAlpha:1,y:0,duration:.6},1.65)
 .to('.scene-index,.chapter-label',{opacity:1,duration:.5},1.7)
 .to('.copy-living',{autoAlpha:0,y:-20,duration:.5},3)
 .set('.bedroom',{visibility:'visible'},3)
 .to('.bedroom',{clipPath:'inset(0% 0% 0% 0% round 0% 0% 0% 0%)',duration:1.7,ease:'power2.inOut'},3)
 .fromTo('.bedroom .scene-image',{scale:1.1,xPercent:2},{scale:1.01,xPercent:0,duration:2.3,ease:'none'},3)
 .fromTo('.copy-bedroom',{y:24},{autoAlpha:1,y:0,duration:.7},4.1)
 .to('.copy-bedroom',{autoAlpha:0,y:-20,duration:.5},5.5)
 .set('.terrace',{visibility:'visible'},5.5)
 .to('.terrace',{clipPath:'inset(0% 0% 0% 0%)',duration:1.2,ease:'power2.inOut'},5.5)
 .fromTo('.terrace-composite',{scale:1.12},{scale:1.02,duration:3.6,ease:'none'},5.5)
 .fromTo('.copy-terrace',{y:20},{autoAlpha:1,y:0,duration:.7},6.3)
 .to('.sunset-sky',{opacity:1,duration:1.6},6.8)
 .to('.terrace-image',{filter:'brightness(.7) saturate(.78)',duration:2},6.9)
 .to('.night-shade',{opacity:1,duration:2},7.1)
 .to('.night-sky',{opacity:1,duration:1.7},7.4)
 .to('.warm-lights',{opacity:1,duration:1.7},7.4)
 .to('.time-indicator i',{width:'100%',duration:2.3,ease:'none'},6.8)
 .to('.copy-terrace',{autoAlpha:0,y:-20,duration:.6},9.1)
 .to({}, {duration:.5},9.2);
 augmentTimeline(timeline,mobile);
 });
}
const experience=initExperience({goScene,isMotion:()=>motion,openGallery:()=>openGallery()});
setupMotion();let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(setupMotion,200)});
addEventListener('scroll',()=>$('.nav').classList.toggle('scrolled',scrollY>80),{passive:true});
function goScene(p=.2){if(motion){scrollTo({top:$('.journey').offsetTop+($('.journey').offsetHeight-innerHeight)*p,behavior:'smooth'})}else $('#story').scrollIntoView({behavior:'smooth'})}
$('#enter').onclick=e=>{e.preventDefault();goScene()};$('#scroll-cue').onclick=e=>{e.preventDefault();goScene(.08)};
$('#motion-toggle').onclick=()=>{motion=!motion;localStorage.setItem('dimora-motion',motion?'full':'reduced');setupMotion();ScrollTrigger.refresh()};
const photos=[{src:'/demos/dimora-mia/assets/living.webp',name:'La luce, protagonista',alt:'Soggiorno dimostrativo con divani e materiali naturali'},{src:'/demos/dimora-mia/assets/bedroom.webp',name:'Il tuo rifugio',alt:'Camera dimostrativa con letto matrimoniale e grandi finestre'},{src:'/demos/dimora-mia/assets/terrace.webp',name:'A cielo aperto',alt:'Terrazza dimostrativa con piscina'},{src:'/demos/dimora-mia/assets/detail.webp',name:'La bellezza delle cose semplici',alt:'Dettaglio di un interno dimostrativo'}];
let photo=0;const gallery=$('#gallery-dialog');function showPhoto(){const p=photos[photo];$('#gallery-image').src=p.src;$('#gallery-image').alt=p.alt;$('#gallery-name').textContent=p.name;$('#gallery-count').textContent=`0${photo+1} / 0${photos.length}`}
function openGallery(i=0){photo=i;showPhoto();gallery.showModal();document.body.style.overflow='hidden'}
$$('[data-gallery]').forEach(b=>b.onclick=()=>openGallery());$$('[data-photo]').forEach(b=>b.onclick=()=>openGallery(+b.dataset.photo));
$('#gallery-prev').onclick=()=>{photo=(photo+photos.length-1)%photos.length;showPhoto()};$('#gallery-next').onclick=()=>{photo=(photo+1)%photos.length;showPhoto()};
$$('.close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());gallery.addEventListener('close',()=>document.body.style.overflow='');gallery.addEventListener('keydown',e=>{if(e.key==='ArrowRight')$('#gallery-next').click();if(e.key==='ArrowLeft')$('#gallery-prev').click()});
function info(html){$('#info-content').innerHTML=html;$('#info-dialog').showModal()}
$('#privacy').onclick=()=>info(`<h2>Un concept, con trasparenza.</h2><p>Questo sito è una dimostrazione di ospitalità. Le immagini sono fotografie di esempio, non foto della struttura DIMORA MIA. Non sono dichiarate una posizione o dotazioni reali.</p><br><p>Fotografie: <a href="https://unsplash.com/license" target="_blank" rel="noopener">Unsplash — licenza e crediti</a>. Immagini: photo-1600210492486-724fe5c67fb0, photo-1611892440504-42a792e24d32, photo-1613977257363-707ba9348227, photo-1600607687920-4e2a09cf159d.</p><br><p>Questa copia portfolio salva simulazioni solo nel browser (localStorage). Usa dati di prova. Non esistono prenotazioni condivise né disponibilità reale. Nessun pagamento viene dichiarato ricevuto senza verifica Stripe. Preferenza di movimento: salvata solo nel browser. Il pannello locale non è un’area amministratore protetta e non usa credenziali reali. Prima dell'apertura commerciale occorrono dati del titolare, informative definitive e condizioni di soggiorno.</p>`);
$('#language').onclick=()=>{$('#language').textContent='ANTEPRIMA IN ITALIANO'};
// Booking uses only server quotes; calendar fetches server inventory.
async function api(path,data){const service=await bookingService;if(service.unavailable)throw new Error('Il servizio prenotazioni non è raggiungibile. Riprova tra poco. Nessuna richiesta è stata salvata.');if(!service.enabled)return localAPI(path,data);useSharedBooking();const r=await fetch('/api/casa-mia/'+path,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});const b=await r.json();if(!r.ok)throw new Error(b.error||'Servizio non disponibile. Riprova.');return b}
let month=new Date(new Date().getFullYear(),new Date().getMonth(),1), inventory=[],quote=null, config=null,selectingEnd=false;
const checkin=$('[name=checkin]'),checkout=$('[name=checkout]');checkin.min=today;checkout.min=tomorrow;
async function loadCalendar(){try{const s=await api(`availability?month=${dateString(month).slice(0,7)}`);inventory=s.blocked;config=s.config;applyAssets(config.assets);renderCalendar()}catch(e){$('#booking-message').textContent=e.message}}
function renderCalendar(){const label=month.toLocaleDateString('it-IT',{month:'long',year:'numeric'});$('#calendar-label').textContent=label[0].toUpperCase()+label.slice(1);$('#prev-month').disabled=month<=new Date(new Date().getFullYear(),new Date().getMonth(),1);const count=new Date(month.getFullYear(),month.getMonth()+1,0).getDate(),offset=(month.getDay()+6)%7;
 $('#calendar').innerHTML=Array.from({length:offset},()=>'<span></span>').join('')+Array.from({length:count},(_,i)=>{const date=dateString(new Date(month.getFullYear(),month.getMonth(),i+1)),off=inventory.includes(date),disabled=date<today||off;return `<button type="button" data-date="${date}" ${disabled?'disabled':''} class="${off?'off ':''}${date===checkin.value||date===checkout.value?'selected ':''}${date>checkin.value&&date<checkout.value?'inrange':''}" aria-label="${i+1} ${label}${off?', non disponibile':''}" ${date===checkin.value||date===checkout.value?'aria-pressed="true"':''}>${i+1}</button>`}).join('');
 $$('[data-date]').forEach(b=>b.onclick=()=>{if(!selectingEnd||b.dataset.date<=checkin.value){checkin.value=b.dataset.date;checkout.value='';checkout.min=dateString(new Date(new Date(b.dataset.date+'T12:00:00').getTime()+86400000));selectingEnd=true}else{checkout.value=b.dataset.date;selectingEnd=false}invalidateQuote();renderCalendar()})}
$('#prev-month').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);loadCalendar()};$('#next-month').onclick=()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);loadCalendar()};
function invalidateQuote(){quote=null;reservationKey=null;$('#quote').textContent='Seleziona le date per scoprire la tua tariffa.';$('#booking-message').textContent='';$('#availability-form button[type=submit]').innerHTML=(sharedBooking?'Verifica disponibilità':'Simula disponibilità')+' <span>↗</span>'}
[checkin,checkout,$('#guests')].forEach(el=>el.addEventListener('change',()=>{if(el===checkin){checkout.min=dateString(new Date(new Date(checkin.value+'T12:00:00').getTime()+86400000));if(checkout.value<=checkin.value)checkout.value=''}invalidateQuote();renderCalendar()}));
$('#availability-form').onsubmit=async e=>{e.preventDefault();const btn=$('button[type=submit]',e.currentTarget);if(quote){showCheckout();return}btn.disabled=true;$('#booking-message').textContent='Simulazione delle date…';try{quote=await api('quote',{checkin:checkin.value,checkout:checkout.value,guests:+$('#guests').value});$('#quote').innerHTML=`<div class="quote-line"><span>${quote.nights} notti · ${quote.seasonLabel}</span><span>${money(quote.subtotal)}</span></div><div class="quote-line"><span>Pulizia finale</span><span>${money(quote.cleaning)}</span></div><div class="quote-line quote-total"><span>Totale soggiorno</span><span>${money(quote.total)}</span></div>`;btn.innerHTML='Continua con la prenotazione <span>↗</span>';$('#booking-message').textContent=sharedBooking?'Disponibilità verificata nel calendario condiviso. Ambiente di prova.':'Date disponibili nella simulazione di questo browser. Nessuna disponibilità reale.'}catch(err){$('#booking-message').textContent=err.message;quote=null;loadCalendar()}finally{btn.disabled=false}};
function showCheckout(){if(!quote)return;$('#availability-form').hidden=true;const el=$('#checkout');el.hidden=false;el.innerHTML=`<button class="back-button">← Torna alle date</button><h3>Il tuo prossimo ricordo.</h3><p class="checkout-note">${checkin.value} → ${checkout.value} · ${$('#guests').value} ospiti<br>${sharedBooking?'Totale del preventivo':'Totale della simulazione'}: <strong>${money(quote.total)}</strong></p><form id="reservation-form"><label>NOME E COGNOME<input name="name" autocomplete="name" placeholder="Il tuo nome" required maxlength="100"></label><label>EMAIL<input type="email" name="email" autocomplete="email" placeholder="nome@esempio.it" required maxlength="150"></label><label>MODALITÀ DI PRENOTAZIONE<select name="payment">${config.payOnArrival?'<option value="arrival">Pagamento in struttura · richiesta demo</option>':''}${config.fullOnline?'<option value="full">Pagamento completo · Stripe test</option>':''}${config.depositOnline?`<option value="deposit">Acconto ${config.depositPercent}% · Stripe test</option>`:''}</select></label><p class="checkout-note">${config.manualConfirmation?'La richiesta sarà confermata manualmente dal proprietario.':'La prenotazione demo sarà confermata secondo le regole del proprietario.'} Non usare dati personali reali.</p><label class="check-label"><input type="checkbox" required>Ho compreso che questa è una prenotazione dimostrativa e autorizzo la registrazione dei dati di prova.</label><button class="primary" type="submit">Prenota ora · demo <span>↗</span></button><p id="checkout-message" class="checkout-note" role="status"></p></form>`;$('.back-button',el).onclick=()=>{el.hidden=true;$('#availability-form').hidden=false;invalidateQuote();loadCalendar()};$('#reservation-form').onsubmit=reserve}
async function reserve(e){e.preventDefault();const b=$('button[type=submit]',e.currentTarget);b.disabled=true;const f=new FormData(e.currentTarget);try{const r=await api('book',{checkin:checkin.value,checkout:checkout.value,guests:+$('#guests').value,name:f.get('name'),email:f.get('email'),payment:f.get('payment'),expectedTotal:quote.total,idempotency:reservationKey||(reservationKey=crypto.randomUUID())});if(r.url){location.assign(r.url);return}$('#checkout').innerHTML=`<div class="success-symbol">✳</div><h3>${r.status==='confirmed'?'Il tuo soggiorno demo è confermato.':'La tua richiesta demo è arrivata.'}</h3><p class="checkout-note">Riferimento: <strong>${r.id}</strong><br>${checkin.value} → ${checkout.value}<br>Totale: ${money(r.total)}<br>Nessun pagamento è stato ricevuto.<br>${r.emailSent?'Conferma accettata dal servizio email.':r.emailQueued?'Conferma salvata nella coda email. Nessun invio ancora completato.':sharedBooking?'Richiesta salvata nel calendario condiviso. Email non inviata: servizio da configurare.':'Simulazione salvata solo in questo browser. Nessuna email inviata.'}</p><button class="primary" id="new-booking">Un altro soggiorno <span>↗</span></button>`;$('#new-booking').onclick=()=>{$('#checkout').hidden=true;$('#availability-form').hidden=false;invalidateQuote();loadCalendar()};loadCalendar()}catch(err){$('#checkout-message').textContent=err.message;b.disabled=false}}
loadCalendar();
if(forceLocalDemo){const ownerLink=document.querySelector('a[href="/casa-mia/gestione"]');if(ownerLink)ownerLink.href='/casa-mia/gestione?demo=1';}
if(new URLSearchParams(location.search).has('payment')){info('<h2>Stato del pagamento</h2><p>Il pagamento viene verificato esclusivamente dal server tramite webhook Stripe. Il ritorno su questa pagina non costituisce conferma di pagamento. Consulta lo stato nel pannello proprietario.</p>')}
addEventListener('pagehide',event=>{if(event.persisted)return;context?.revert();ScrollTrigger.getAll().forEach(t=>t.kill());clearTimeout(resizeTimer);experience.destroy()});

function applyAssets(assets){if(!assets)return;experience.setAssets(assets);for(const [key,index] of [['living',0],['bedroom',1],['terrace',2]]){const url=assets[key];if(key==='terrace'&&url)document.documentElement.style.setProperty('--terrace-image',`url("${url.replaceAll('\"','%22')}")`);if(!url||url===photos[index].src)continue;const previous=photos[index].src;photos[index].src=url;document.querySelectorAll('img').forEach(img=>{if(img.getAttribute('src')===previous)img.src=url})}}
