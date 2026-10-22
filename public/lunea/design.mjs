export const charms=[{id:'sun',name:'Sole',meaning:'Un nuovo inizio',price:14,symbol:'☼'},{id:'moon',name:'Luna',meaning:'Un desiderio segreto',price:12,symbol:'☽'},{id:'heart',name:'Cuore',meaning:'Chi porti con te',price:14,symbol:'♡'},{id:'pearl',name:'Perla',meaning:'La tua luce gentile',price:16,symbol:'●'},{id:'star',name:'Stella',meaning:'La tua direzione',price:12,symbol:'✧'},{id:'initial',name:'Iniziale',meaning:'Una lettera speciale',price:18,symbol:'A'}];
export const finishes={gold:{name:'Oro',color:'#b89144'},silver:{name:'Argento',color:'#aeb5b9'},rose:{name:'Rosé',color:'#b77b65'}};
export const chains={fine:{name:'Sottile',price:0},links:{name:'Maglie ovali',price:8},pearls:{name:'Perle',price:12}};
export const sizes={necklace:[40,45,50],bracelet:[16,18,20]};
export const initialDesign={base:'necklace',chain:'fine',finish:'gold',length:45,initial:'A',charms:['sun','pearl','initial']};
export const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
export function normalize(raw={}){raw=raw&&typeof raw==='object'?raw:{};const base=raw.base==='bracelet'?'bracelet':'necklace',length=typeof raw.length==='string'||typeof raw.length==='number'?Number(raw.length):NaN,initial=typeof raw.initial==='string'?raw.initial.toUpperCase():'';return {base,chain:typeof raw.chain==='string'&&Object.hasOwn(chains,raw.chain)?raw.chain:'fine',finish:typeof raw.finish==='string'&&Object.hasOwn(finishes,raw.finish)?raw.finish:'gold',length:sizes[base].includes(length)?length:sizes[base][1],initial:/^[A-Z]$/.test(initial)?initial:'A',charms:Array.isArray(raw.charms)?raw.charms.filter(id=>charms.some(c=>c.id===id)).slice(0,5):[...initialDesign.charms]};}
export function price(raw){const d=normalize(raw),lines=[{name:d.base==='necklace'?'Base collana':'Base bracciale',price:d.base==='necklace'?38:28}];if(chains[d.chain].price)lines.push({name:'Catena '+chains[d.chain].name,price:chains[d.chain].price});for(const id of d.charms){const c=charms.find(c=>c.id===id);lines.push({name:c.name+(id==='initial'?' '+d.initial:''),price:c.price})}return {lines,total:lines.reduce((sum,l)=>sum+l.price,0)}}
export function designKey(d){return JSON.stringify(normalize(d))}
let svgSerial=0;
export function svgDesign(raw){
 const d=normalize(raw),serial=++svgSerial,gradient='lunea-metal-'+serial,pearl='lunea-pearl-'+serial,color=finishes[d.finish].color;
 const light={gold:'#fff4d2',silver:'#ffffff',rose:'#ffe7dc'}[d.finish],shade={gold:'#775322',silver:'#65717b',rose:'#814f40'}[d.finish];
 const measure=d.length/(d.base==='bracelet'?18:45),rx=(d.base==='bracelet'?94:71)*measure,ry=(d.base==='bracelet'?81:92)*measure,cx=180,cy=123;
 const f=n=>Number(n.toFixed(3)),metal=`url(#${gradient})`,bead=`url(#${pearl})`;
 let chain='';
 const count=d.chain==='pearls'?68:d.chain==='links'?76:132;
 for(let i=0;i<count;i++){
  const t=i/count*Math.PI*2,x=f(cx+rx*Math.sin(t)),y=f(cy-ry*Math.cos(t));
  if(d.chain==='pearls')chain+=`<circle cx="${x}" cy="${y}" r="3.5" fill="${bead}" stroke="#c7bcab" stroke-width=".35"/>`;
  else{const angle=f(Math.atan2(ry*Math.sin(t),rx*Math.cos(t))*180/Math.PI);chain+=`<ellipse cx="${x}" cy="${y}" rx="${d.chain==='links'?4.4:2.4}" ry="${i%2?1.15:d.chain==='links'?2.7:1.6}" transform="rotate(${angle} ${x} ${y})" fill="none" stroke="${metal}" stroke-width="${d.chain==='links'?1.15:.8}"/>`}
 }
 const star=Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,r=i%2?5.3:12;return `${i?'L':'M'}${f(Math.cos(a)*r)} ${f(Math.sin(a)*r)}`}).join(' ')+'Z';
 const items=d.charms.map((id,i)=>{
  const a=(i-(d.charms.length-1)/2)*.33,x=f(cx+rx*Math.sin(a)),y=f(cy+ry*Math.cos(a));
  let body='';
  if(id==='pearl')body=`<ellipse cx="0" cy="0" rx="7.4" ry="8.6" fill="${bead}" stroke="#c8bba6" stroke-width=".4"/><circle cy="-9" r="1.7" fill="${metal}"/>`;
  else if(id==='heart')body=`<path d="M0 11C-4 7-17-1-10-9C-5-15 0-8 0-5C0-8 5-15 10-9C17-1 4 7 0 11Z" fill="${metal}" stroke="${shade}" stroke-width=".45"/>`;
  else if(id==='star')body=`<path d="${star}" fill="${metal}" stroke="${shade}" stroke-width=".45"/>`;
  else if(id==='moon')body=`<path d="M6.5-10.5A12.3 12.3 0 1 0 6.5 10.5C-6.5 10-6.5-10 6.5-10.5Z" fill="${metal}" stroke="${shade}" stroke-width=".45"/>`;
  else{body=`<circle r="10.7" fill="${metal}" stroke="${shade}" stroke-width=".45"/><circle r="9.2" fill="none" stroke="${light}" stroke-width=".65"/>`;
   if(id==='initial')body+=`<text y="5.4" text-anchor="middle" fill="${shade}" font-family="Georgia,serif" font-size="16.5">${d.initial}</text>`;
   else{body+=`<circle r="3.2" fill="${metal}" stroke="${shade}" stroke-width=".55"/>`;for(let n=0;n<12;n++){const t=n/12*Math.PI*2;body+=`<path d="M${f(Math.sin(t)*5)} ${f(Math.cos(t)*5)}L${f(Math.sin(t)*7.8)} ${f(Math.cos(t)*7.8)}" stroke="${shade}" stroke-width=".65" stroke-linecap="round"/>`}}
  }
  return `<g data-charm="${id}" transform="translate(${x} ${y})"><ellipse cy="3" rx="2.5" ry="3.3" fill="none" stroke="${metal}" stroke-width="1.1"/><g transform="translate(0 16)">${body}</g></g>`;
 }).join('');
 return `<svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${d.base==='necklace'?'Collana':'Bracciale'} Lunéa, ${finishes[d.finish].name}, ${d.length} cm" data-base="${d.base}" data-length="${d.length}"><defs><linearGradient id="${gradient}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${light}"/><stop offset=".28" stop-color="${color}"/><stop offset=".55" stop-color="${light}"/><stop offset=".78" stop-color="${color}"/><stop offset="1" stop-color="${shade}"/></linearGradient><radialGradient id="${pearl}" cx="32%" cy="25%" r="75%"><stop stop-color="#ffffff"/><stop offset=".35" stop-color="#f6f1e8"/><stop offset=".75" stop-color="#ded4c3"/><stop offset="1" stop-color="#b2a48f"/></radialGradient></defs><g data-chain="${d.chain}">${chain}</g><ellipse cx="${cx}" cy="${f(cy-ry)}" rx="3.2" ry="4.2" fill="${metal}" stroke="${shade}" stroke-width=".55"/>${items}</svg>`;
}
