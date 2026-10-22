export const cars=[{name:'Porsche 911 Carrera',category:'01 / SPORT',price:390,image:'assets/porsche.jpg',seats:'2 + 2',luggage:'Weekend bag',mood:'Adrenalina',tag:'IL PIACERE DI OGNI CURVA.'},{name:'Mercedes-Benz AMG GT',category:'02 / GRAN TURISMO',price:490,image:'assets/mercedes.jpg',seats:'2',luggage:'Bagaglio leggero',mood:'Eleganza',tag:'IL TUO TEMPO. UN ALTRO RITMO.'},{name:'Audi RS 6 Avant',category:'03 / PERFORMANCE',price:290,image:'assets/suv-v2.jpg',seats:'5',luggage:'Più spazio al viaggio',mood:'Libertà',tag:'NESSUN COMPROMESSO. SOLO ORIZZONTI.'}];
export const money=n=>new Intl.NumberFormat('it-IT',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
export function calculateTrip(v,now=new Date()){
 const car=cars[Number(v.car)],from=new Date(`${v.start}T${v.startTime}`),to=new Date(`${v.end}T${v.endTime}`);
 if(!car||!Number.isFinite(+from)||!Number.isFinite(+to)||to<=from||from<now)return {valid:false,error:'Scegli un ritiro futuro e una restituzione successiva al ritiro.'};
 const wallTime=d=>Date.UTC(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),d.getMinutes());
 const days=Math.ceil((wallTime(to)-wallTime(from))/86400000);if(days>90)return {valid:false,error:'Puoi simulare un viaggio fino a 90 giorni.'};
 const comfort=v.coverage==='comfort',extra=v.mileage==='extra',delivery=Number(v.delivery);if(![0,75,90].includes(delivery))return {valid:false,error:'Seleziona un punto di consegna valido.'};
 const returnCity=v.returnLocation==='same'?v.location:v.returnLocation,lines=[{label:`${car.name} · ${days} × ${money(car.price)}`,value:days*car.price}];
 if(v.driver)lines.push({label:`Secondo guidatore · ${days} × €15`,value:days*15});
 if(extra)lines.push({label:`Long way · ${days} × €40`,value:days*40});
 if(comfort)lines.push({label:`Comfort · ${days} × €49`,value:days*49});
 if(delivery)lines.push({label:delivery===75?'Consegna in aeroporto':'Consegna a hotel / indirizzo',value:delivery});
 if(returnCity!==v.location)lines.push({label:'Restituzione in altra città',value:180});
 return {valid:true,car,days,lines,total:lines.reduce((s,l)=>s+l.value,0),deposit:comfort?1200:3000,excess:comfort?1000:3000,includedKm:days*(extra?300:150),returnCity,from,to};
}
