import {buildDuvet} from './duvet.js';
import * as THREE from './vendor/three.module.js';
import {paddedGeometry,roundedSolid} from './realism.js';

export function buildTerraceFurniture({boat,upholstery,wood,bronze,marble,chrome}){
  const root=new THREE.Group();root.name='Atria | eight-seat aft dining terrace';root.position.z=-.85;boat.add(root);
  const mesh=(g,m,x,y,z,parent=root)=>{const a=new THREE.Mesh(g,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a};
  const tube=(p,m,r=.013,parent=root)=>mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(v=>new THREE.Vector3(...v))),24,r,6),m,0,0,0,parent);
  // The table is 765 mm above the finished deck after the yacht's vertical scaling.
  mesh(roundedSolid(2.8,.085,1.27,.18),marble,6.3,5.34,0);
  for(let x of [5.6,7]){mesh(roundedSolid(.48,.055,.72,.1),bronze,x,4.566,0);mesh(roundedSolid(.12,.71,.4,.035),wood,x,4.94,0);}
  const sides=24,rows=12;function backGeometry(){const p=[],uv=[],idx=[];for(let j=0;j<=rows;j++)for(let i=0;i<=sides;i++){let u=i/sides*2-1,v=j/rows;const x=u*.255,y=.57+v*.53,z=-.24-.085*(1-u*u)-v*.045;p.push(x,y,z);uv.push(i/sides,v)}for(let j=0;j<rows;j++)for(let i=0;i<sides;i++){let a=j*(sides+1)+i,b=a+sides+1;idx.push(a,a+1,b,a+1,b+1,b)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
  const backShell=new THREE.MeshStandardMaterial({color:0x776049,map:wood.map,roughness:.4,side:THREE.DoubleSide}),backCloth=upholstery.clone();backCloth.side=THREE.DoubleSide;
  for(let x of [5.35,6,6.65,7.3])for(let s of [-1,1]){const chair=new THREE.Group();root.add(chair);chair.position.set(x,4.535,s*1.03);chair.rotation.y=s<0?Math.PI:0;
    mesh(roundedSolid(.48,.055,.53,.08),wood,0,.425,0,chair);mesh(paddedGeometry(.46,.105,.52,.05),upholstery,0,.49,0,chair);
    for(let a of [-1,1])for(let b of [-1,1])tube([[a*.185,.012,b*.205],[a*.16,.405,b*.175]],bronze,.012,chair);
    const back=mesh(backGeometry(),backShell,0,0,-.015,chair);mesh(back.geometry,backCloth,0,0,.008,chair);
    for(let a of [-1,1]){tube([[a*.22,.43,.12],[a*.235,.68,.06],[a*.23,.72,-.23]],bronze,.012,chair);mesh(paddedGeometry(.075,.04,.29,.018),upholstery,a*.23,.7,-.055,chair);}
  }
  return{fabricMaterials:[backCloth],woodMaterials:[backShell]};
}

export function buildLoungeChair({boat,upholstery,wood,bronze},x,z,angle,floor=1.59){
  const group=new THREE.Group();group.name='Atria | swivel lounge chair';group.position.set(x,floor,z);group.rotation.y=angle;boat.add(group);
  const mesh=(g,m,x,y,z)=>{const a=new THREE.Mesh(g,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;group.add(a);return a};
  mesh(new THREE.CylinderGeometry(.23,.25,.035,40),bronze,0,.025,0);mesh(new THREE.CylinderGeometry(.042,.06,.21,24),bronze,0,.145,0);
  mesh(roundedSolid(.72,.11,.76,.16),wood,0,.28,0);mesh(paddedGeometry(.68,.16,.7,.08),upholstery,0,.395,.02);
  const back=mesh(paddedGeometry(.72,.63,.19,.09),upholstery,0,.66,-.32);back.rotation.x=-.12;
  for(let s of [-1,1]){mesh(paddedGeometry(.14,.33,.68,.065),upholstery,s*.35,.51,-.015);}
  return group;
}

export function addCabinetDetails({box,line,wood,bronze,chrome,black,add}){
  // Real panel divisions and recessed finger pulls on the bar and bedside cabinets.
  for(let z of [-1.48,-.5,.5,1.48]){box(.015,.86,.014,black,-3.986,2.12,z);line([[-3.976,2.49,z-.22],[-3.976,2.49,z+.22]],bronze,.006).castShadow=false;}
  for(let s of [-1,1]){box(.011,.012,.37,black,-2.754,5.03,s*1.28);line([[-2.747,5.13,s*1.28-.1],[-2.747,5.13,s*1.28+.1]],chrome,.005).castShadow=false;}
}

export function buildMasterSuite(ctx){
  const {boat,add,box,soft,cylinder,line,wood,teak,cream,upholstery,bronze,black,marble,chrome,rugMat,warm}=ctx;
  box(7.2,.035,4.4,teak,0,4.57,0);soft(2.4,.035,2.7,rugMat,-2.3,4.61,0,.18);
  // 2250 × 2000 mm mattress after the model's X/Z scale, with an inset supporting plinth.
  soft(1.3,.18,1.58,wood,-2.5,4.65,0,.06);soft(1.57,.43,1.89,wood,-2.5,4.89,0,.12);soft(1.5,.30,1.77,cream,-2.5,5.24,0,.12);
  soft(.16,1.4,2.95,upholstery,-3.32,5.4,0,.08);
  for(let s of [-1,1]){soft(.36,.14,.74,cream,-2.99,5.47,s*.42,.065);soft(.38,.72,.45,wood,-2.95,4.99,s*1.28,.035);soft(.31,.09,.38,wood,-2.95,4.585,s*1.28,.025);cylinder(.11,.04,bronze,-2.95,5.37,s*1.28);cylinder(.023,.36,bronze,-2.95,5.57,s*1.28);const shade=add(new THREE.ConeGeometry(.18,.3,40,1,true),cream,-2.95,5.86,s*1.28);shade.material=cream.clone();shade.material.side=THREE.DoubleSide;const lamp=new THREE.PointLight(0xffd4a0,2.2,2.8,2);lamp.position.set(-2.95,5.9,s*1.28);boat.add(lamp);box(6.8,.025,.025,warm,-.2,6.79,s*2.13);}
  // An actual draped cover extends over the mattress edges, with shallow folds.
  const cloth=buildDuvet(ctx);
  soft(.34,.34,1.8,upholstery,-1.2,4.88,0,.09);for(let x of [-1.32,-1.08])for(let z of [-.7,.7])cylinder(.018,.18,bronze,x,4.65,z);
  // Owner's reading corner and a writing console make use of the real suite volume.
  buildLoungeChair(ctx,1.6,1.25,-.45,4.59);buildLoungeChair(ctx,1.6,-1.1,Math.PI,4.59);
  soft(1.9,.07,.55,wood,1.7,5.385,-1.87,.045);soft(.5,.78,.46,wood,2.32,4.98,-1.87,.035);soft(.44,.045,.4,bronze,2.32,4.595,-1.87,.025);cylinder(.023,.76,bronze,.92,4.97,-1.87);
  cylinder(.24,.04,marble,.7,5.09,1.65);cylinder(.028,.47,bronze,.7,4.835,1.65);cylinder(.16,.025,bronze,.7,4.61,1.65);
  box(2.45,1.05,.08,black,.4,5.85,-2.26);
  return{fabricMaterials:[cloth]};
}
