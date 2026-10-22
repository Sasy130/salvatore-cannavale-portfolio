import {finishes, money, normalize, price} from './design.mjs';

const freezeDesign=raw=>{const d=normalize(raw);Object.freeze(d.charms);return Object.freeze(d)};
const detail=(label,value)=>Object.freeze({label,value});
const necklace=(id,name,tag,description,design,imageIndex)=>{
 const normalized=freezeDesign(design);
 return Object.freeze({id,name,category:'necklace',tag,description,imageIndex,design:normalized,price:price(normalized).total,details:Object.freeze([
  detail('Silhouette','Collana con charm componibili'),
  detail('Lunghezza iniziale',normalized.length+' cm · modificabile nell’atelier'),
  detail('Il tuo dettaglio','Finitura e simboli personalizzabili')
 ])});
};
const earrings=(id,name,tag,description,amount,imageIndex,shape)=>Object.freeze({id,name,category:'earrings',tag,description,imageIndex,price:amount,details:Object.freeze([
 detail('Il gioiello','Un paio di orecchini'),
 detail('La forma',shape),
 detail('La tua palette','Oro, Argento e Rosé · colori di esempio')
])});

export const products=Object.freeze([
 necklace('soleil','Soleil','UN PICCOLO SOLE, TUTTO TUO','Una catena sottile, un sole e una perla. Una luce intima da portare vicino, anche nei giorni più semplici.',{base:'necklace',chain:'fine',finish:'gold',length:45,initial:'A',charms:['sun','pearl']},0),
 necklace('atoi','À toi','UNA LETTERA. UNA PERSONA.','Maglie ovali, un cuore e un’iniziale. Un piccolo racconto personale, da comporre per te o per qualcuno che ami.',{base:'necklace',chain:'links',finish:'gold',length:45,initial:'A',charms:['initial','heart']},1),
 necklace('perles','Perle de lune','PER LA TUA LUCE PIÙ QUIETA','Il ritmo delicato delle perle incontra una luna e un ultimo pendente. Una composizione morbida, da rendere soltanto tua.',{base:'necklace',chain:'pearls',finish:'gold',length:45,initial:'A',charms:['moon','pearl']},2),
 earrings('aura','Aura','LA BELLEZZA DI UN GESTO','Piccoli cerchi e un pendente dalla forma di una perla barocca. Una linea delicata, con un dettaglio che si fa notare.',48,3,'Piccoli cerchi con pendente a perla'),
 earrings('eclat','Éclat','IL TUO ACCENTO SCULTOREO','Una forma floreale, quasi un tulipano, raccolta in un piccolo volume luminoso. Da indossare come un accento, ogni giorno.',56,4,'Bottoni scultorei a forma di fiore'),
 earrings('sillage','Sillage','LASCIA UNA TRACCIA DI LUCE','Gocce organiche, superfici sinuose e una presenza essenziale. La forma segue il movimento e completa il tuo modo di essere.',62,5,'Pendenti a goccia organica')
]);

export function findProduct(value){
 const id=typeof value==='string'?value:value&&typeof value==='object'&&Object.hasOwn(value,'id')?value.id:undefined;
 return typeof id==='string'?products.find(p=>p.id===id):undefined;
}
export function productPrice(value){const p=findProduct(value);return p?p.category==='necklace'?price(p.design).total:p.price:0}
export function productName(value,finish){const p=findProduct(value);if(!p)return '';return p.name+(typeof finish==='string'&&Object.hasOwn(finishes,finish)?' · '+finishes[finish].name:'')}

const element=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el};
const imageFor=(product,className='')=>{const image=element('div','catalogue-image '+className);image.dataset.imageIndex=String(product.imageIndex);image.setAttribute('role','img');image.setAttribute('aria-label',product.name+', '+(product.category==='necklace'?'collana':'orecchini')+' nella variante colore Oro');return image};

export function initBoutique({onConfigure=()=>{},onAdd=()=>{},openDialog=d=>d.showModal(),closeDialog=d=>d.close()}={}){
 const grid=document.querySelector('#products'),dialog=document.querySelector('#product-dialog'),detailRoot=document.querySelector('#product-detail'),count=document.querySelector('#collection-count');
 if(!grid||!dialog||!detailRoot)return {render:()=>{},openProduct:()=>{},destroy:()=>{}};
 const filters=[...document.querySelectorAll('button[data-category]')],listeners=[];
 let category='all';

 function openProduct(value,requestedFinish='gold'){
  const product=findProduct(value);if(!product)return;
  let finish=typeof requestedFinish==='string'&&Object.hasOwn(finishes,requestedFinish)?requestedFinish:'gold';
  const photo=element('div','product-detail-visual');photo.append(imageFor(product,'product-detail-image'));
  photo.append(element('p','product-image-note','Immagine della variante colore Oro'));
  const info=element('div','product-detail-copy'),eyebrow=element('p','eyebrow',product.tag),heading=element('h2','',product.name);heading.id='product-detail-title';
  dialog.setAttribute('aria-labelledby',heading.id);
  const amount=element('p','product-detail-price',money(productPrice(product))),description=element('p','product-detail-description',product.description);
  const specifications=element('dl','product-specifications');
  for(const item of product.details){const row=element('div');row.append(element('dt','',item.label),element('dd','',item.value));specifications.append(row)}
  info.append(eyebrow,heading,amount,description,specifications);
  if(product.category==='earrings'){
   const fieldset=element('fieldset','product-finishes'),legend=element('legend','','Scegli il tuo colore');fieldset.append(legend);
   const options=element('div','product-finish-options'),selection=element('p','product-finish-status','Finitura scelta: '+finishes[finish].name+'.');selection.setAttribute('aria-live','polite');
   for(const [key,value] of Object.entries(finishes)){
    const button=element('button','product-finish'),swatch=element('i','');button.type='button';button.dataset.productFinish=key;button.setAttribute('aria-pressed',key===finish?'true':'false');swatch.setAttribute('aria-hidden','true');swatch.style.backgroundColor=value.color;button.append(swatch,element('span','',value.name));
    button.addEventListener('click',()=>{finish=key;for(const option of options.children)option.setAttribute('aria-pressed',option.dataset.productFinish===key?'true':'false');selection.textContent='Finitura scelta: '+value.name+'.'});options.append(button);
   }
   fieldset.append(options,selection,element('p','product-finish-note','La fotografia resta in Oro. Le altre finiture sono opzioni illustrative di questo concept.'));info.append(fieldset);
  }
  const action=element('button','button dark product-detail-action',product.category==='necklace'?'Personalizza nell’atelier ↗':'Aggiungi alla selezione · '+money(productPrice(product)));action.type='button';
  action.addEventListener('click',()=>{closeDialog(dialog);if(product.category==='necklace')onConfigure(normalize(product.design));else onAdd({kind:'catalog',productId:product.id,finish,quantity:1})});
  const note=element('p','product-detail-note',product.category==='necklace'?'Scegli finitura, lunghezza e simboli. Il prezzo segue la tua composizione.':'Un paio · Prezzo dimostrativo. Nessun pagamento viene effettuato.');info.append(action,note);
  detailRoot.replaceChildren(photo,info);openDialog(dialog);
 }

 function render(nextCategory=category){
  category=['all','tutti','necklace','earrings'].includes(nextCategory)?nextCategory:'all';if(category==='tutti')category='all';
  const selected=category==='all'?products:products.filter(p=>p.category===category);
  for(const button of filters){const active=(button.dataset.category==='tutti'?'all':button.dataset.category)===category;button.setAttribute('aria-pressed',active?'true':'false');button.classList.toggle('active',active)}
  grid.replaceChildren(...selected.map(product=>{
   const card=element('article','boutique-card');card.dataset.productId=product.id;
   const visual=element('button','product-art');visual.type='button';visual.setAttribute('aria-label','Scopri '+product.name+', '+(product.category==='necklace'?'collana personalizzabile':'un paio di orecchini')+', '+money(productPrice(product)));visual.append(imageFor(product));
   visual.append(element('span','product-category-label',product.category==='necklace'?'LA TUA COLLANA':'IL TUO PAIO'));
   visual.append(element('span','product-discover','SCOPRI IL GIOIELLO ↗'));visual.addEventListener('click',()=>openProduct(product));
   const metadata=element('div','product-meta'),titleGroup=element('div');titleGroup.append(element('small','',product.tag),element('h3','',product.name));metadata.append(titleGroup,element('span','product-price',money(productPrice(product))));
   const type=element('p','product-category',product.category==='necklace'?'Collana · Personalizzabile nell’atelier':'Orecchini · Un paio'),discover=element('button','product-card-link','Scopri il gioiello ↗');discover.type='button';discover.setAttribute('aria-label','Scopri i dettagli di '+product.name);discover.addEventListener('click',()=>openProduct(product));card.append(visual,metadata,type,discover);return card;
  }));
  if(count)count.textContent=selected.length+' '+(category==='necklace'?'collane da rendere tue':category==='earrings'?'paia di orecchini':'creazioni da scoprire');
 }
 for(const button of filters){const listener=()=>render(button.dataset.category);button.addEventListener('click',listener);listeners.push([button,listener])}
 render();return {render,openProduct,destroy(){for(const [button,listener] of listeners)button.removeEventListener('click',listener);grid.replaceChildren()}};
}
