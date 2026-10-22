import {charms,chains,finishes,normalize,designKey,price,money} from './design.mjs';
import {findProduct,productPrice,productName} from './boutique.mjs';

export function quantity(value){const n=Number(value);return Number.isFinite(n)?Math.min(9,Math.max(1,Math.floor(n))):1}
export function normalizeBagItem(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 if(raw.kind==='catalog'){
  const product=findProduct(raw.productId);if(!product||product.category!=='earrings')return null;
  const finish=typeof raw.finish==='string'&&Object.hasOwn(finishes,raw.finish)?raw.finish:'gold';
  return {kind:'catalog',productId:product.id,finish,quantity:quantity(raw.quantity)};
 }
 if(raw.kind!==undefined&&raw.kind!=='design')return null;
 if(!Object.hasOwn(raw,'design')||!raw.design||typeof raw.design!=='object'||Array.isArray(raw.design))return null;
 return {design:normalize(raw.design),quantity:quantity(raw.quantity)};
}
export function bagItemKey(raw){const item=normalizeBagItem(raw);return !item?'':item.kind==='catalog'?'catalog:'+item.productId+':'+item.finish:'design:'+designKey(item.design)}
export function normalizeBag(raw){
 if(!Array.isArray(raw))return [];const result=[];
 for(const value of raw.slice(0,200)){
  const item=normalizeBagItem(value);if(!item)continue;
  const current=result.find(x=>bagItemKey(x)===bagItemKey(item));
  if(current)current.quantity=Math.min(9,current.quantity+item.quantity);else if(result.length<20)result.push(item);
 }
 return result;
}
export function itemUnitPrice(raw){const item=normalizeBagItem(raw);return !item?0:item.kind==='catalog'?productPrice(item.productId):price(item.design).total}
export function bagTotal(raw){return normalizeBag(raw).reduce((sum,item)=>sum+itemUnitPrice(item)*item.quantity,0)}
export function addToBag(current,additions){
 const previous=normalizeBag(current);if(!Array.isArray(additions)||!additions.length)return {ok:false,reason:'invalid',items:previous};
 const pending=additions.map(normalizeBagItem);if(pending.some(item=>!item))return {ok:false,reason:'invalid',items:previous};
 const next=normalizeBag(previous);
 for(const item of pending){const existing=next.find(x=>bagItemKey(x)===bagItemKey(item));
  if(existing){if(existing.quantity+item.quantity>9)return {ok:false,reason:'quantity',items:previous};existing.quantity+=item.quantity}
  else {if(next.length>=20)return {ok:false,reason:'capacity',items:previous};next.push(item)}
 }
 return {ok:true,items:next};
}
export function itemTitle(raw){const item=normalizeBagItem(raw);if(!item)return '';return item.kind==='catalog'?productName(item.productId,item.finish):`${item.design.base==='necklace'?'Collana':'Bracciale'} · ${finishes[item.design.finish].name} · ${item.design.length} cm`}
export function itemDescription(raw){const item=normalizeBagItem(raw);if(!item)return '';if(item.kind==='catalog')return 'Un paio di orecchini · Finitura '+finishes[item.finish].name+' · Immagine della variante Oro';const d=item.design;return chains[d.chain].name+' · '+(d.charms.map(id=>charms.find(c=>c.id===id).name+(id==='initial'?' '+d.initial:'')).join(', ')||'Senza charm')}
export function itemPriceLines(raw){const item=normalizeBagItem(raw);if(!item)return [];return item.kind==='catalog'?[{name:productName(item.productId)+' · Un paio',price:productPrice(item.productId)}]:price(item.design).lines}
export function selectionText(raw){const items=normalizeBag(raw);return 'LUNÉA — LA TUA SELEZIONE\nConcept dimostrativo · Nessun ordine o pagamento\n\n'+items.map(item=>itemTitle(item)+'\n'+itemDescription(item)+'\n'+itemPriceLines(item).map(line=>line.name+': '+money(line.price)).join('\n')+'\nQuantità: '+item.quantity+'\nSubtotale: '+money(itemUnitPrice(item)*item.quantity)).join('\n\n')+'\n\nTOTALE INDICATIVO: '+money(bagTotal(items))+'\nMateriali, misure, prezzi e disponibilità illustrativi. Concept ONE MAN — salvatorecannavale.it'}
