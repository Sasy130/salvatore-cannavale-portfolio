import * as THREE from './vendor/three.module.js';
import {buildDuvet} from './duvet.js';

export function addGuestDeck(ctx){
  const {boat,add,box,soft,cylinder,line,wood,teak,cream,upholstery,bronze,chrome,marble,black,warm}=ctx;
  const wall=new THREE.MeshStandardMaterial({color:0xe7dfcf,roughness:.83});
  const root=new THREE.Group();root.name='Atria | lower guest deck';boat.add(root);
  // Finished cabin envelope lies inside the hull; the central passage connects both cabins.
  box(12.6,.09,4.7,teak,-.55,-1.06,0);const ceilingShape=new THREE.Shape();ceilingShape.moveTo(-6.85,-2.35);ceilingShape.lineTo(5.75,-2.35);ceilingShape.lineTo(5.75,2.35);ceilingShape.lineTo(-6.85,2.35);ceilingShape.closePath();const opening=new THREE.Path();opening.moveTo(-2.65,-.52);opening.lineTo(1.35,-.52);opening.lineTo(1.35,-2.08);opening.lineTo(-2.65,-2.08);opening.closePath();ceilingShape.holes.push(opening);const cg=new THREE.ExtrudeGeometry(ceilingShape,{depth:.09,bevelEnabled:false});cg.rotateX(-Math.PI/2);add(cg,wall,0,1.325,0);
  for(const z of [-2.30,2.30]){box(12.6,2.36,.10,wall,-.55,.15,z);soft(12.5,.06,.08,wood,-.55,-.94,z,.02);line([[-6.7,1.27,z*.96],[5.7,1.27,z*.96]],warm,.012);}
  for(const x of [-6.8,5.7]){box(.12,2.36,3.70,wood,x,.15,-.45);box(.12,.26,.90,wood,x,1.20,1.85);}

  // The separating bulkhead leaves a real door into the starboard companionway.
  box(.13,2.36,2.40,wood,-.60,.15,-1.10);
  
  // Interior stair from the saloon down to the lower-deck landing.
  for(let i=0;i<12;i++){const x=-2.35+i*.285,top=1.57-i*.22;soft(.31,.095,1.10,wood,x,top-.048,1.30,.025);box(.04,.22,1.06,wood,x+.13,top-.15,1.30);line([[x+.14,top+.005,.83],[x+.14,top+.005,1.77]],warm,.006);}
  for(const z of [.70,1.90]){line([[-2.40,2.59,z],[.85,.17,z]],bronze,.023);for(let i of [0,4,8,11]){const x=-2.35+i*.285,top=1.57-i*.22;line([[x,top,z],[x,top+1.02,z]],bronze,.015);}}
  // Guard the deck edges around the opening, while leaving the head of the stair open.
  for(const z of [.49,2.11]){line([[-2.65,2.66,z],[1.40,2.66,z]],bronze,.022);for(const x of [-2.65,-1.3,.05,1.4])line([[x,1.59,z],[x,2.66,z]],bronze,.015);}
  line([[1.40,2.66,.49],[1.40,2.66,2.11]],bronze,.022);
  // An open landing and cabin door passages make the camera journey physically continuous.
  const clothMaterials=[];
  function bed(cx,headSide){
    const z=-.45,head=cx+headSide*.85;
    soft(1.22,.10,1.57,wood,cx,-.985,z,.04);soft(1.52,.38,1.90,wood,cx,-.75,z,.09);soft(1.47,.24,1.76,cream,cx,-.43,z,.11);
    const coverGroup=new THREE.Group();coverGroup.position.set(cx-headSide*2.5,-5.70,z);if(headSide>0)coverGroup.rotation.y=Math.PI;boat.add(coverGroup);
    const coverAdd=(g,m,x=0,y=0,z=0)=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;coverGroup.add(mesh);return mesh};
    const coverLine=(p,m,r)=>coverAdd(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p.map(v=>new THREE.Vector3(...v))),100,r,5),m);
    clothMaterials.push(buildDuvet({add:coverAdd,line:coverLine,upholstery,cream}));
    const h=soft(.14,1.18,2.70,upholstery,head,-.34,z,.06);
    for(const s of [-1,1]){soft(.35,.12,.69,cream,cx+headSide*.48,-.12,z+s*.40,.055);soft(.40,.47,.43,wood,head-headSide*.13,-.74,z+s*1.25,.035);soft(.42,.035,.45,marble,head-headSide*.13,-.48,z+s*1.25,.025);cylinder(.08,.025,bronze,head-headSide*.13,-.44,z+s*1.25);cylinder(.014,.27,bronze,head-headSide*.13,-.29,z+s*1.25);const shade=add(new THREE.ConeGeometry(.13,.21,32),cream,head-headSide*.13,-.04,z+s*1.25);}
    // A softly folded runner and stitched perimeter give the guest beds their own finish.
    const rug=new THREE.MeshStandardMaterial({color:0xbbb5a5,map:cream.map,roughness:1});soft(2.5,.025,2.8,rug,cx,-.997,z,.13);
  }
  bed(-4.95,-1);bed(4.15,1);
  for(const [x,z] of [[-3.8,-2.08],[2.9,-2.08]]){
    // Long hull windows have a luminous sky gradient, a deep reveal and a slim metal frame.
    soft(1.88,.72,.07,bronze,x,.39,z,.15);const c=document.createElement('canvas');c.width=512;c.height=192;const cx=c.getContext('2d'),g=cx.createLinearGradient(0,0,0,192);g.addColorStop(0,'#b4cccf');g.addColorStop(.55,'#abc2c5');g.addColorStop(.57,'#5e8d95');g.addColorStop(1,'#164c59');cx.fillStyle=g;cx.fillRect(0,0,512,192);for(let i=115;i<192;i+=5){cx.fillStyle='#b4d7d019';cx.fillRect(0,i,512,1);}const m=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c)});soft(1.75,.58,.075,m,x,.39,z+.01,.12);
    line([[x-.94,.83,z+.10],[x+.94,.83,z+.10]],warm,.012);
  }
  // Built-in storage, a writing console, framed artwork and a compact ensuite vanity.
  for(const [x,side] of [[-2.15,-1],[1.1,1]]){
    soft(.64,1.85,1.15,wood,x,-.02,-1.56,.04);for(const z of [-1.85,-1.30])line([[x-side*.326,-.13,z],[x-side*.326,.24,z]],bronze,.008);
    soft(1.5,.07,.55,wood,x+side*.60,-.15,-1.91,.04);cylinder(.018,.80,bronze,x+side*1.20,-.57,-1.91);
    const mirror=new THREE.MeshPhysicalMaterial({color:0xb7c7c7,metalness:1,roughness:.06});soft(.85,.81,.05,bronze,x+side*.3,.64,-2.22,.16);soft(.78,.74,.055,mirror,x+side*.3,.64,-2.20,.14);
    soft(.56,.47,.60,wood,x+side*.30,-.75,-1.88,.035);soft(.63,.065,.65,marble,x+side*.30,-.48,-1.88,.055);const bowl=add(new THREE.TorusGeometry(.16,.035,12,36),cream,x+side*.30,-.43,-1.88);bowl.rotation.x=Math.PI/2;line([[x+side*.30,-.45,-2.1],[x+side*.30,-.19,-2.1],[x+side*.30,-.19,-1.94]],bronze,.012);
  }
  for(const x of [-4.5,-2.0,1.4,4.0]){const l=new THREE.PointLight(0xffdfba,3.5,4.2,2);l.position.set(x,.91,-.25);boat.add(l);for(const z of [-1.55,.65]){cylinder(.04,.018,bronze,x,1.30,z);cylinder(.025,.020,warm,x,1.283,z);}}
  return{clothMaterials};
}
