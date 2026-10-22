import * as THREE from './vendor/three.module.js';
import {deckOutline} from './architecture.js';

export function roundedPlan(w,d,r){const s=new THREE.Shape(),x=-w/2,z=-d/2;s.moveTo(x+r,z);s.lineTo(x+w-r,z);s.quadraticCurveTo(x+w,z,x+w,z+r);s.lineTo(x+w,z+d-r);s.quadraticCurveTo(x+w,z+d,x+w-r,z+d);s.lineTo(x+r,z+d);s.quadraticCurveTo(x,z+d,x,z+d-r);s.lineTo(x,z+r);s.quadraticCurveTo(x,z,x+r,z);return s;}

export function addLuxuryDetails(ctx){
  const {boat,add,box,soft,cylinder,line,white,chrome,bronze,black,teak,upholstery,cream}=ctx;
  const led=new THREE.MeshStandardMaterial({color:0xffdfaf,emissive:0xffc58b,emissiveIntensity:1.4,roughness:.4});
  const halo=new THREE.MeshBasicMaterial({color:0xffc58b,transparent:true,opacity:.07,depthWrite:false,blending:THREE.AdditiveBlending});
  function strip(points){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));add(new THREE.TubeGeometry(curve,Math.max(100,points.length*3),.009,6),led).castShadow=false;add(new THREE.TubeGeometry(curve,Math.max(100,points.length*3),.037,6),halo).castShadow=false;}
  for(const sign of [-1,1]){
    strip([[-17.8,1.94,sign*1.34],[-15.5,1.80,sign*2.25],[-13,1.71,sign*2.84],[-10,1.64,sign*3.30],[-6,1.59,sign*3.54],[0,1.52,sign*3.62],[8,1.46,sign*3.59],[12.8,1.39,sign*3.31]].map(p=>[p[0],p[1],p[2]+sign*.12]));
    for(const [cx,rx,beam,aft,y] of [[-6.25,2.82,2.98,9.05,4.30],[-4.65,2.21,2.44,3.65,7.01]]){const p=deckOutline(cx,rx,beam+.052,aft).getPoints(48).filter(p=>p.x<cx+.02).map(p=>[p.x,y,-p.y]);strip(p);}
    // Flush stainless anchor pocket, articulated shank and two broad flukes.
    const x=-17.5,y=1.15,z=sign*1.59;
    const pocket=soft(.67,.62,.055,black,x,y,z,.13);pocket.rotation.y=-sign*.43;
    const anchor=new THREE.Group();anchor.position.set(x,y,z+sign*.075);anchor.rotation.y=-sign*.43;boat.add(anchor);
    const part=(g,m,x,y,z)=>{const a=new THREE.Mesh(g,m);a.position.set(x,y,z);a.castShadow=true;anchor.add(a);return a};
    part(new THREE.CapsuleGeometry(.032,.44,5,12),chrome,0,.03,0);
    const crown=part(new THREE.CylinderGeometry(.07,.09,.26,16),chrome,0,-.21,0);crown.rotation.z=Math.PI/2;
    for(const s of [-1,1]){const sh=new THREE.Shape();sh.moveTo(s*.04,-.18);sh.lineTo(s*.28,-.06);sh.lineTo(s*.23,-.32);sh.lineTo(s*.075,-.29);sh.closePath();const g=new THREE.ExtrudeGeometry(sh,{depth:.055,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:2,steps:1});part(g,chrome,0,0,-.028);}
    const shackle=part(new THREE.TorusGeometry(.067,.016,8,20),chrome,0,.29,0);
    for(let i=0;i<7;i++){const link=part(new THREE.TorusGeometry(.035,.009,6,12),chrome,0,.36+i*.043,-.015);link.rotation.y=i%2?Math.PI/2:0;}
  }
  const poolChildrenStart=boat.children.length;
  // Compact, genuinely recessed plunge pool with a molded rim and tiled basin.
  const shape=roundedPlan(2.5,2.70,.25),hole=roundedPlan(2.23,2.43,.20);shape.holes.push(new THREE.Path(hole.getPoints(32)));
  const rim=new THREE.ExtrudeGeometry(shape,{depth:.14,steps:1,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:3,curveSegments:32});rim.rotateX(-Math.PI/2);add(rim,white,11.27,1.62,.45);
  const tileCanvas=document.createElement('canvas');tileCanvas.width=tileCanvas.height=256;const tc=tileCanvas.getContext('2d');tc.fillStyle='#78a9ab';tc.fillRect(0,0,256,256);for(let j=0;j<8;j++)for(let i=0;i<8;i++){tc.fillStyle=['#84b6b5','#659a9e','#91bcba','#78a6aa'][(i*7+j*3)%4];tc.fillRect(i*32+1,j*32+1,30,30);}const map=new THREE.CanvasTexture(tileCanvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(3,3);const tile=new THREE.MeshPhysicalMaterial({map,roughness:.26,clearcoat:.6});
  soft(2.28,.12,2.48,tile,11.27,.66,.45,.18);
  for(const s of [-1,1]){box(2.25,.91,.09,tile,11.27,1.15,.45+s*1.20);box(.10,.91,2.45,tile,11.27+s*1.075,1.15,.45);}
  const poolUniforms={time:{value:0},dusk:{value:0}};
  const poolMaterial=new THREE.ShaderMaterial({uniforms:poolUniforms,transparent:true,side:THREE.DoubleSide,depthWrite:false,vertexShader:`varying vec2 vUv;uniform float time;void main(){vUv=uv;vec3 p=position;p.y+=sin(p.x*12.+time*1.7)*cos(p.z*10.-time)*.007;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 vUv;uniform float time;uniform float dusk;void main(){vec2 p=vUv*22.;float c=sin(p.x+time*.9+sin(p.y*1.3-time*.6))*sin(p.y+time*.7+cos(p.x*.8));float caustic=pow(abs(c),7.);vec3 col=mix(vec3(.07,.37,.42),vec3(.13,.62,.66),dusk*.5)+caustic*.22;gl_FragColor=vec4(col,.67);}`});
  const waterGeometry=new THREE.ShapeGeometry(roundedPlan(2.18,2.38,.18),40);waterGeometry.rotateX(-Math.PI/2);const poolSurface=add(waterGeometry,poolMaterial,11.27,1.53,.45);poolSurface.castShadow=false;
  for(let i=0;i<3;i++)soft(.30,.13,.72,tile,10.43+i*.23,1.39-i*.23,1.05,.025);
  for(const z of [-.02,.42])line([[12.1,1.24,z],[12.1,1.9,z],[12.45,1.9,z],[12.45,1.68,z]],chrome,.025);
  for(const z of [-.45,1.35]){const poolLamp=new THREE.PointLight(0x5bd6d5,1.4,2.6,2);poolLamp.position.set(11.27,1.16,z);boat.add(poolLamp);cylinder(.035,.02,led,11.27,1.50,z);}
  const poolParts=boat.children.slice(poolChildrenStart),poolGroup=new THREE.Group();poolGroup.name='Atria | aft plunge pool';poolGroup.userData.dynamic=true;for(const part of poolParts)poolGroup.add(part);boat.add(poolGroup);
  for(const z of [2.35]){soft(1.65,.16,.69,white,9.55,1.70,z,.12);soft(1.57,.13,.64,upholstery,9.55,1.84,z,.10);const back=soft(.45,.14,.64,upholstery,8.99,1.99,z,.08);back.rotation.z=-.2;const towel=add(new THREE.CylinderGeometry(.08,.08,.47,24),cream,10.13,1.96,z);towel.rotation.z=Math.PI/2;}
  // A fabric ensign with a fixed luff and wind moving toward the stern.
  line([[13.0,1.7,2.9],[13.45,3.3,2.9]],chrome,.026);cylinder(.08,.06,chrome,13.0,1.72,2.9);
  const flagCanvas=document.createElement('canvas');flagCanvas.width=768;flagCanvas.height=512;const fc=flagCanvas.getContext('2d');fc.fillStyle='#16866a';fc.fillRect(0,0,256,512);fc.fillStyle='#f8f4e9';fc.fillRect(256,0,256,512);fc.fillStyle='#bb3d3c';fc.fillRect(512,0,256,512);const flagMap=new THREE.CanvasTexture(flagCanvas);flagMap.colorSpace=THREE.SRGBColorSpace;const flagMat=new THREE.MeshStandardMaterial({map:flagMap,side:THREE.DoubleSide,roughness:.9});
  const flagGeometry=new THREE.PlaneGeometry(1.05,.70,40,24);const flag=add(flagGeometry,flagMat,13.88,2.88,2.9);flag.castShadow=false;flag.userData.dynamic=true;
  let lastFlag=-1;const flagPos=flagGeometry.attributes.position,rest=Float32Array.from(flagPos.array);
  // Downward architectural washes keep the hull readable at dusk without bright point-light blobs.
  const washes=[];for(const s of [-1,1])for(const x of [-4,5]){const target=new THREE.Object3D();target.position.set(x,1.4,s*3.35);boat.add(target);const spot=new THREE.SpotLight(0xffd8a8,4,5.5,Math.PI*.28,.8,1.5);spot.position.set(x,4.21,s*3.12);spot.target=target;boat.add(spot);washes.push(spot);}
  return{setPoolVisible(value){poolGroup.visible=value;},update(t,dusk){poolUniforms.time.value=t;poolUniforms.dusk.value=dusk;led.emissiveIntensity=1+dusk*1.4;halo.opacity=.025+dusk*.055;for(const l of washes)l.intensity=.35+dusk*4;if(t-lastFlag<1/30)return;lastFlag=t;for(let i=0;i<flagPos.count;i++){const x=rest[i*3],y=rest[i*3+1],u=(x+.525)/1.05;flagPos.setXYZ(i,x,y+Math.sin(u*6-t*2.5)*.035*u,Math.sin(u*10-t*3.2+y*3)*.11*u+Math.sin(u*17-t*4)*.025*u)}flagPos.needsUpdate=true;flagGeometry.computeVertexNormals();}};
}
