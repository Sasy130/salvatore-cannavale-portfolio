export const brand = { name: 'A&J Rent Car', city: 'Napoli', address: 'Vico Montesanto 45, Napoli', mobile: '+393445947964', phone: '+3908117812542', vat: '10647171213', social: 'aj_rentcar', source: 'https://www.ajrentnapoli.it' };
export const vehicles = [
 {slug:'gran-turismo',name:'Gran Turismo',category:'Sport',type:'Auto',image:'/demos/aj-rent-car/images/hero.webp',caption:'Per chi ama il viaggio, in ogni sua curva.',features:['Categoria sportiva','Modello da concordare','Dotazioni da verificare']},
 {slug:'sport-coupe',name:'Sport Coupé',category:'Sport',type:'Auto',image:'/demos/aj-rent-car/images/sport.webp',caption:'Un carattere diverso per la tua prossima partenza.',features:['Categoria coupé','Modello da concordare','Dotazioni da verificare']},
 {slug:'due-ruote',name:'Due ruote',category:'Scooter',type:'Scooter',image:'/demos/aj-rent-car/images/scooter.webp',caption:'Un altro modo di scoprire la città.',features:['Categoria due ruote','Modello da concordare','Requisiti da verificare']},
];
export type Vehicle = typeof vehicles[number];
