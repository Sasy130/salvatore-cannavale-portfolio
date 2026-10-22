import * as THREE from './vendor/three.module.js';
import {roundedSolid} from './realism.js';

export function buildMachinery({boat,add,box,soft,cylinder,line,white,chrome,bronze,black,warm}){
  const wall=new THREE.MeshStandardMaterial({color:0xe0e6e4,roughness:.52}),rubber=new THREE.MeshStandardMaterial({color:0x24363c,roughness:.7}),steel=new THREE.MeshStandardMaterial({color:0x8d9fa1,roughness:.29,metalness:.75});
  const enamel=new THREE.MeshPhysicalMaterial({color:0xe4e3d8,metalness:.1,roughness:.26,clearcoat:.7}),red=new THREE.MeshStandardMaterial({color:0x9b302a,roughness:.4}),brass=new THREE.MeshPhysicalMaterial({color:0xb59a56,metalness:.82,roughness:.25});
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#8d9c9d';c.fillRect(0,0,256,256);c.strokeStyle='#64787b';c.lineWidth=2;for(let y=8;y<256;y+=16)for(let x=8;x<256;x+=16){c.beginPath();c.moveTo(x-3,y-3);c.lineTo(x+3,y+3);c.stroke()}const treadMap=new THREE.CanvasTexture(canvas);treadMap.wrapS=treadMap.wrapT=THREE.RepeatWrapping;treadMap.repeat.set(5,4);const tread=new THREE.MeshStandardMaterial({map:treadMap,roughness:.5,metalness:.5});
  box(6.75,.11,4.9,tread,9.1,-1.25,0);
  // A continuous high ceiling leaves the full service aisle and control wall visible.
  // The pool is hidden separately by the room-view cutaway in luxury-details.js.
  box(6.75,.09,4.9,wall,9.1,1.315,0);
  for(const x of [6.65,8.25,9.85,11.45])soft(1.5,.025,1.05,rubber,x,-1.18,0,.035);
  for(const z of [-.57,.57])box(6.48,.018,.025,steel,9.1,-1.16,z);
  for(const z of [-2.42,2.42]){box(6.75,2.53,.12,wall,9.1,.05,z);for(let x=6.1;x<12.4;x+=1.2)box(.024,2.30,.025,steel,x,.02,z*.975);box(6.45,.10,.035,steel,9.1,-.91,z*.975);line([[5.9,1.21,z*.92],[12.3,1.21,z*.92]],warm,.016);}
  box(.12,2.53,4.8,wall,12.45,.05,0);
  const blocks=[],heads=[],propellers=[];
  function pipe(points,mat,r=.035){return line(points,mat,r)}
  function orientedCylinder(a,b,r,mat){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av),mid=av.clone().add(bv).multiplyScalar(.5);const m=add(new THREE.CylinderGeometry(r,r,d.length(),24),mat,...mid.toArray());m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return m;}
  for(const side of [-1,1]){
    const z=side*1.42,root=new THREE.Group();root.position.set(8.55,-.32,z);root.name='Atria | large V marine diesel';root.userData.dynamic=true;boat.add(root);blocks.push(root);
    const part=(g,m,x,y,z)=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh};
    const rb=(w,h,d,m,x,y,z)=>part(roundedSolid(w,h,d,.055),m,x,y,z);
    // Deep crankcases, low continuous bank covers and compact insulated manifolds.
    for(const sign of [-1,1]){box(3.45,.17,.17,steel,8.55,-1.10,z+sign*.48);for(const x of [7.35,8.55,9.75]){cylinder(.07,.11,rubber,x,-.97,z+sign*.46);cylinder(.08,.035,chrome,x,-.90,z+sign*.46);}}
    rb(2.92,.32,1.03,rubber,0,-.42,0);rb(2.90,.65,.98,enamel,0,-.04,0);rb(2.68,.18,.62,steel,0,.34,0);rb(2.78,.14,.20,rubber,0,.57,0);
    for(const bank of [-1,1]){
      const cover=rb(2.88,.25,.43,enamel,0,.52,bank*.34);cover.rotation.x=-bank*.17;
      for(let i=0;i<8;i++){const x=-1.18+i*.337,cap=rb(.26,.065,.34,enamel,x,.665,bank*.35);cap.rotation.x=-bank*.17;heads.push({mesh:cap,index:i});for(const off of [-.085,.085])heads.push({mesh:part(new THREE.CylinderGeometry(.014,.014,.012,6),chrome,x+off,.71,bank*.35),index:i});}
      rb(2.67,.24,.20,steel,0,.17,bank*.58);
      for(const x of [-.87,0,.87])rb(.035,.26,.215,chrome,x,.17,bank*.58);
      // Low, enclosed exhaust rails replace the exposed upright pipe array.
      orientedCylinder([7.30,.01,z+bank*.67],[9.80,.01,z+bank*.67],.085,steel);
      for(const x of [8.0,8.42]){cylinder(.11,.34,white,x,-.58,z+bank*.58);box(.20,.10,.04,red,x,-.53,z+bank*.69);}
    }
    rb(.50,.77,.88,steel,1.56,-.04,0);rb(.15,.36,.67,black,1.85,-.04,0);
    // Flywheel housing, flexible coupling and a reduction gear at the stern end.
    orientedCylinder([10.32,-.35,z],[10.70,-.35,z],.32,enamel);orientedCylinder([10.7,-.45,z],[11.16,-.45,z],.18,chrome);
    soft(.65,.57,.65,steel,10.96,-.48,z,.10);
    for(const bank of [-1,1]){const turbo=add(new THREE.TorusGeometry(.15,.065,10,24),steel,9.94,.30,z+bank*.36);turbo.rotation.y=Math.PI/2;orientedCylinder([9.85,.30,z+bank*.36],[10.22,.30,z+bank*.36],.105,rubber);}
    pipe([[10.22,.30,z],[10.48,.51,side*2.08],[11.30,.51,side*2.08],[11.75,.31,side*2.08]],steel,.09);
    pipe([[7.25,-.50,z-side*.5],[6.9,-.60,z-side*.5],[6.9,-1.04,z-side*.5],[10.7,-1.04,z-side*.5]],red,.025);
    // Exposed inclined shaft, bearing, external A-bracket and a five-bladed propeller.
    orientedCylinder([11.15,-.61,z],[14.45,-1.80,z],.055,chrome);
    orientedCylinder([12.48,-1.09,z],[12.78,-1.20,z],.105,steel);
    orientedCylinder([13.03,-.49,z-side*.45],[13.38,-1.414,z],.045,steel);orientedCylinder([13.03,-.49,z+side*.45],[13.38,-1.414,z],.045,steel);
    const prop=new THREE.Group();prop.userData.dynamic=true;prop.position.set(14.45,-1.80,z);boat.add(prop);propellers.push({group:prop,sign:side});
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.11,.15,.40,32),brass);hub.rotation.z=Math.PI/2;prop.add(hub);
    for(let blade=0;blade<5;blade++){
      const positions=[],idx=[],nr=18,nc=10,theta=blade/5*Math.PI*2;
      for(let layer=0;layer<2;layer++)for(let i=0;i<=nr;i++)for(let j=0;j<=nc;j++){const u=i/nr,v=j/nc,r=.12+u*.62,w=(.08+.27*Math.sin(Math.PI*u)**.65)*(v-.5),angle=theta+u*.32,pitch=.80-u*.51;positions.push(w*Math.sin(pitch)+.08*Math.sin(u*Math.PI)-layer*.022,r*Math.cos(angle)-w*Math.cos(pitch)*Math.sin(angle),r*Math.sin(angle)+w*Math.cos(pitch)*Math.cos(angle));}
      const count=(nr+1)*(nc+1);for(let i=0;i<nr;i++)for(let j=0;j<nc;j++){const a=i*(nc+1)+j,b=a+nc+1;idx.push(a,a+1,b,a+1,b+1,b,a+count,b+count,a+1+count,a+1+count,b+count,b+1+count);}
      const edge=[];for(let i=0;i<=nr;i++)edge.push(i*(nc+1));for(let j=1;j<=nc;j++)edge.push(nr*(nc+1)+j);for(let i=nr-1;i>=0;i--)edge.push(i*(nc+1)+nc);for(let j=nc-1;j>0;j--)edge.push(j);for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];idx.push(a,b,a+count,b,b+count,a+count);}
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(idx);g.computeVertexNormals();const mesh=new THREE.Mesh(g,brass);mesh.castShadow=true;prop.add(mesh);
    }
    // Independent rudder aft of each propeller.
    const rudder=soft(.75,.72,.065,steel,15.35,-1.78,z,.08);rudder.rotation.z=-.08;cylinder(.035,1.10,chrome,15.15,-1.0,z);
  }
  // Pumps, strainers, electrical cabinet and fire-suppression bottles are serviceable from the aisle.
  for(const z of [-1.45,1.45]){soft(.5,.95,.45,white,6.1,-.55,z,.04);for(let i=0;i<5;i++)box(.015,.04,.28,black,6.36,-.20-i*.12,z);cylinder(.10,.58,red,11.8,-.85,z);cylinder(.035,.09,chrome,11.8,-.51,z);}
  // A flush instrument wall keeps the sightline between both engines open.
  const monitorCanvas=document.createElement('canvas');monitorCanvas.width=1024;monitorCanvas.height=512;const mc=monitorCanvas.getContext('2d');
  mc.fillStyle='#0b222a';mc.fillRect(0,0,1024,512);mc.fillStyle='#a7c7c4';mc.font='24px sans-serif';mc.fillText('ATRIA  /  ENGINE CONTROL',42,49);mc.fillStyle='#75cbb3';mc.font='19px sans-serif';mc.fillText('SYSTEMS NORMAL',769,48);mc.strokeStyle='#36535a';mc.lineWidth=2;mc.beginPath();mc.moveTo(42,73);mc.lineTo(982,73);mc.moveTo(512,101);mc.lineTo(512,425);mc.stroke();
  for(let i=0;i<2;i++){const x=42+i*500;mc.fillStyle='#a7c7c4';mc.font='23px sans-serif';mc.fillText(i?'STARBOARD':'PORT',x,124);mc.fillStyle='#e2f0e9';mc.font='68px sans-serif';mc.fillText('1 720',x,204);mc.fillStyle='#8caeb0';mc.font='22px sans-serif';mc.fillText('RPM',x+218,203);mc.fillStyle='#26444b';mc.fillRect(x,230,430,9);mc.fillStyle='#81c4b3';mc.fillRect(x,230,288,9);mc.fillStyle='#b8d1cd';mc.font='22px sans-serif';mc.fillText('OIL PRESSURE',x,298);mc.fillText('COOLANT',x,350);mc.fillStyle='#e2f0e9';mc.fillText('4.2 bar',x+316,298);mc.fillText('82 °C',x+326,350);}
  mc.fillStyle='#152f37';mc.fillRect(0,438,1024,74);mc.fillStyle='#a4c4c1';mc.font='20px sans-serif';mc.fillText('TWIN SHAFT DRIVE',42,481);mc.fillStyle='#77c7ae';mc.fillText('●  ALL SYSTEMS READY',720,481);
  const displayMap=new THREE.CanvasTexture(monitorCanvas);displayMap.colorSpace=THREE.SRGBColorSpace;const display=new THREE.MeshBasicMaterial({map:displayMap});
  box(.055,1.75,2.24,steel,12.35,-.04,0);box(.075,.96,1.96,black,12.30,.26,0);box(.08,.86,1.84,display,12.25,.26,0);box(.09,.17,1.96,black,12.28,-.43,0);
  for(const z of [-.66,-.22,.22,.66])orientedCylinder([12.20,-.43,z],[12.23,-.43,z],.034,z<0?chrome:brass);
  for(const z of [-.80,.80])box(6.25,.035,.06,warm,9.1,1.25,z);for(const x of [7.0,10.8]){const lamp=new THREE.PointLight(0xe7f5f2,4,5,2);lamp.position.set(x,1.05,0);boat.add(lamp);}
  return{apply(color,packageIndex){enamel.color.set(color);for(const root of blocks)root.scale.x=packageIndex?1.02:.91;for(const h of heads)h.mesh.visible=packageIndex||h.index<6;},update(time){for(const p of propellers)p.group.rotation.x=time*.7*p.sign;}};
}
