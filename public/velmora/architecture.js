import * as THREE from './vendor/three.module.js';

// One exact Bézier outline is shared by the fiberglass shell, teak inset and gasket.
export function deckOutline(cx,rx,beam,aft,inset=0,notch=null){
  rx-=inset;beam-=inset;aft-=inset;const k=.5522847498307936,r=Math.min(beam*.42,.94),s=new THREE.Shape();
  s.moveTo(cx-rx,0);s.bezierCurveTo(cx-rx,k*beam,cx-k*rx,beam,cx,beam);s.lineTo(aft-r,beam);s.bezierCurveTo(aft-r+k*r,beam,aft,beam-r+k*r,aft,beam-r);
  if(notch){const [x,z0,z1]=notch,hi=-z0,lo=-z1;s.lineTo(aft,hi+inset);s.lineTo(x-inset,hi+inset);s.lineTo(x-inset,lo-inset);s.lineTo(aft,lo-inset)}
  s.lineTo(aft,-beam+r);s.bezierCurveTo(aft,-beam+r-k*r,aft-r+k*r,-beam,aft-r,-beam);s.lineTo(cx,-beam);s.bezierCurveTo(cx-k*rx,-beam,cx-rx,-k*beam,cx-rx,0);s.closePath();return s;
}
export function buildDeck({add,cx,rx,beam,aft,y,height,white,teak,black,notch=null}){
  const shape=deckOutline(cx,rx,beam,aft,0,notch),lowerHeight=Math.min(.065,height*.23),revealHeight=Math.min(.014,height*.055),upperBase=lowerHeight+revealHeight,bevel=Math.min(.05,(height-upperBase)*.24);
  function solid(outline,thickness,radius){const g=new THREE.ExtrudeGeometry(outline,{depth:thickness-2*radius,steps:1,bevelEnabled:radius>0,bevelSize:radius,bevelThickness:radius,bevelSegments:4,curveSegments:48});g.rotateX(-Math.PI/2);return g;}
  // Fiberglass is rolled over a recessed bonding seam, with a narrow lower return.
  // The real gap catches a shadow without painting a black stripe onto the deck.
  const lowerRadius=Math.min(.018,lowerHeight*.28),returnShape=deckOutline(cx,rx,beam,aft,.018,notch);
  add(solid(returnShape,lowerHeight,lowerRadius),white,0,y+lowerRadius,0).name='Atria | tucked deck return';
  const sealShape=deckOutline(cx,rx,beam,aft,.022,notch),seal=add(solid(sealShape,revealHeight,0),black,0,y+lowerHeight,0);seal.name='Atria | recessed deck bonding seam';seal.castShadow=false;
  const shell=add(solid(shape,height-upperBase,bevel),white,0,y+upperBase+bevel,0);shell.name='Atria | continuous rolled deck lip';
  const inset=deckOutline(cx,rx,beam,aft,.13,notch),planks=new THREE.ShapeGeometry(inset,64);planks.rotateX(-Math.PI/2);const surface=add(planks,teak,0,y+height+.003,0);surface.name='Atria | inset teak with fiberglass margin';
  return{shell,surface,outline:shape};
}
export function buildCanopy({add,white,black,chrome,warm}){
  const shape=deckOutline(-1.05,1.35,2.2,3.02),edge=shape.getSpacedPoints(192),n=edge.length-1;const center=new THREE.Vector2(.55,0),rings=[[1,9.18],[1.01,9.23],[1,9.29],[.96,9.35],[.84,9.40],[.58,9.445],[.26,9.46]],positions=[],idx=[];
  for(let j=0;j<rings.length;j++){const [scale,y]=rings[j];for(let i=0;i<n;i++){positions.push(center.x+(edge[i].x-center.x)*scale,y,-edge[i].y*scale)}}
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n,c=a+n,d=b+n;idx.push(a,b,c,b,d,c)}let c=positions.length/3;positions.push(center.x,9.463,0);for(let i=0;i<n;i++)idx.push((rings.length-1)*n+i,(rings.length-1)*n+(i+1)%n,c);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(idx);g.computeVertexNormals();const top=add(g,white,0,.42,0);top.material=white.clone();top.material.side=THREE.DoubleSide;top.name='Atria | cambered canopy';
  const underside=new THREE.ShapeGeometry(shape,64);underside.rotateX(-Math.PI/2);const ceiling=add(underside,white,0,9.599,0);ceiling.material=white.clone();ceiling.material.side=THREE.DoubleSide;
  // Flush photovoltaic tiles follow the crown, rather than a box floating above the roof.
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#102d3a';ctx.fillRect(0,0,256,512);ctx.strokeStyle='#507280';ctx.lineWidth=1;for(let x=0;x<=256;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,512);ctx.stroke()}for(let y=0;y<=512;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke()}const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;const solar=new THREE.MeshPhysicalMaterial({map,color:0x9bb6bf,roughness:.2,metalness:.35,clearcoat:1,clearcoatRoughness:.08});
  function crownHeight(x,z){const dx=x-center.x,dz=z,len=Math.hypot(dx,dz);if(len<.001)return 9.463;const dir=new THREE.Vector2(dx/len,dz/len);let distance=100;for(let i=0;i<n;i++){const a=new THREE.Vector2(edge[i].x-center.x,-edge[i].y),b=new THREE.Vector2(edge[(i+1)%n].x-center.x,-edge[(i+1)%n].y),e=b.clone().sub(a),denom=dir.x*e.y-dir.y*e.x;if(Math.abs(denom)<1e-7)continue;const t=(a.x*e.y-a.y*e.x)/denom,u=(a.x*dir.y-a.y*dir.x)/denom;if(t>0&&u>=0&&u<=1)distance=Math.min(distance,t)}const r=len/distance,levels=[[0,9.463],[.26,9.46],[.58,9.445],[.84,9.40],[.96,9.35],[1,9.29]];for(let i=1;i<levels.length;i++)if(r<=levels[i][0])return THREE.MathUtils.lerp(levels[i-1][1],levels[i][1],(r-levels[i-1][0])/(levels[i][0]-levels[i-1][0]));return 9.29;}
  for(let x of [-1.30,-.50,.30,1.10])for(let z of [-.65,.65]){const g=new THREE.PlaneGeometry(.7,1.05,10,14);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const px=p.getX(i)+x,pz=p.getZ(i)+z;p.setXYZ(i,px,crownHeight(px,pz)+.009,pz)}g.computeVertexNormals();const panel=add(g,solar,0,.42,0);panel.castShadow=false;}
  const lightPath=deckOutline(-1.05,1.35,2.2,3.02,.19).getPoints(160).map(p=>new THREE.Vector3(p.x,9.586,-p.y));add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lightPath,true),180,.008,5,true),warm).castShadow=false;
}

export function addGlazingDetails({add,line,black,chrome}){
  for(const [cx,rz,low,high,rLow,rHigh] of [[-6.25,2.86,2.48,4.04,2.6,2.03],[-4.65,2.27,5.35,6.73,1.96,1.53]]){
    for(const theta of [-1.03,-.51,0,.51,1.03]){const p=[];for(let i=0;i<=12;i++){const t=i/12,r=THREE.MathUtils.lerp(rLow,rHigh,t);p.push([cx-r*Math.cos(theta),THREE.MathUtils.lerp(low,high,t),(rz+.008)*Math.sin(theta)])}line(p,black,.012).castShadow=false;}
    for(const [y,r] of [[low,rLow],[high,rHigh]]){const p=[];for(let i=0;i<=100;i++){let a=-Math.PI/2+i/100*Math.PI;p.push([cx-r*Math.cos(a),y,(rz+.012)*Math.sin(a)])}line(p,chrome,.007).castShadow=false;}
  }
}
