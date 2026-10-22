import * as THREE from './vendor/three.module.js';

// Lofted fiberglass and glazing share their seam positions, so every reveal has real depth.
export function sculptSuperstructure({add,box,soft,line,cylinder,boat,white,black,glass,darkGlass,chrome,upholstery,teak,bronze}){
  const glazing=new THREE.MeshPhysicalMaterial({color:0x21424c,roughness:.075,metalness:.1,clearcoat:1,clearcoatRoughness:.045,ior:1.5,transparent:true,opacity:.87,side:THREE.DoubleSide,envMapIntensity:1.5});
  function surface(positions,uv,indices){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;}
  function shell(cx,rz,levels,mat){
    const steps=96,rows=Math.max(12,levels.length*4),curve=new THREE.CatmullRomCurve3(levels.map(([y,rx,widen=0])=>new THREE.Vector3(rx,y,widen)),false,'centripetal'),pos=[],uv=[],idx=[];
    for(let k=0;k<=rows;k++){const p=curve.getPoint(k/rows);for(let i=0;i<=steps;i++){const theta=-Math.PI/2+i/steps*Math.PI;pos.push(cx-p.x*Math.cos(theta),p.y,(rz+p.z)*Math.sin(theta));uv.push(i/steps,k/rows);}}
    for(let k=0;k<rows;k++)for(let i=0;i<steps;i++){const a=k*(steps+1)+i,b=a+steps+1;idx.push(a,a+1,b,a+1,b+1,b);}
    const m=add(surface(pos,uv,idx),mat);m.castShadow=!mat.transparent;return m;
  }
  function arc(cx,y,rx,rz,mat,r){const pts=[];for(let i=0;i<=64;i++){const theta=-Math.PI/2+i/64*Math.PI;pts.push([cx-rx*Math.cos(theta),y,rz*Math.sin(theta)]);}return line(pts,mat,r);}
  function fairFascia(x0,x1,low,high,beam,side){
    // Closed section with a shallow convex face, a tucked lower return and a rolled upper rim.
    const profile=new THREE.CatmullRomCurve3([[.002,.005],[.025,.033],[.11,.058],[.43,.072],[.79,.057],[.965,.028],[1,.006],[.98,-.048],[.025,-.048]].map(([y,z])=>new THREE.Vector3(z,y,0)),true,'centripetal');
    const sections=48,sides=24,points=profile.getPoints(sides),p=[],uv=[],idx=[];
    for(let i=0;i<=sections;i++){const t=i/sections,x=THREE.MathUtils.lerp(x0,x1,t),fair=Math.sin(Math.PI*t),outset=.018*fair,crown=.013*fair;
      for(let j=0;j<=sides;j++){const q=points[j];p.push(x,low+q.y*(high-low)+crown,side*(beam+q.x+outset));uv.push(t,j/sides);}
    }
    for(let i=0;i<sections;i++)for(let j=0;j<sides;j++){const a=i*(sides+1)+j,b=a+sides+1;idx.push(...(side>0?[a,b,a+1,a+1,b,b+1]:[a,a+1,b,a+1,b+1,b]));}
    for(const end of [0,sections]){const center=p.length/3;p.push(end?x1:x0,(low+high)/2,side*beam);uv.push(end?1:0,.5);for(let j=0;j<sides;j++){const a=end*(sides+1)+j,b=a+1;idx.push(...((side>0)===(end===0)?[center,a,b]:[center,b,a]));}}
    const fascia=add(surface(p,uv,idx),white);fascia.name='Atria | fair molded side fascia';return fascia;
  }
  // Slightly crowned coamings continue into deeply raked wraparound windows.
  shell(-6.25,2.88,[[1.58,2.85,-.01],[1.65,2.90,.006],[1.92,2.86,.028],[2.28,2.74,.02],[2.43,2.64,0],[2.47,2.60,-.012]],white).name='Atria | cambered main coaming';
  shell(-6.25,2.86,[[2.47,2.6],[3.88,2.09],[4.1,2.03]],glazing).name='Atria | curved main glazing';
  // Rounded overhanging brow, undercut from the glass instead of a flat white strip.
  shell(-6.25,2.98,[[4.04,2.05,-.12],[4.075,2.21,-.106],[4.12,2.54,-.064],[4.17,2.75,-.018],[4.21,2.82,0],[4.23,2.82,0]],white).name='Atria | rolled main window brow';
  arc(-6.25,2.475,2.60,2.872,black,.018);arc(-6.25,4.067,2.17,2.885,black,.014);
  shell(-4.65,2.28,[[4.52,2.14,-.008],[4.60,2.19,.01],[4.87,2.15,.025],[5.20,2.05,.014],[5.31,1.985,0],[5.34,1.96,-.006]],white).name='Atria | cambered upper coaming';
  shell(-4.65,2.27,[[5.34,1.96],[6.53,1.57],[6.74,1.53]],glazing).name='Atria | curved upper glazing';
  shell(-4.65,2.44,[[6.74,1.54,-.17],[6.775,1.67,-.13],[6.825,1.91,-.065],[6.88,2.12,-.018],[6.92,2.21,0],[6.94,2.21,0]],white).name='Atria | rolled upper window brow';
  arc(-4.65,5.345,1.96,2.282,black,.018);arc(-4.65,6.767,1.65,2.297,black,.014);
  for(const side of [-1,1]){
    fairFascia(-6.25,8.33,1.60,2.465,2.87,side);
    fairFascia(-4.65,4.45,4.525,5.335,2.27,side);
    for(const [start,end,y,z] of [[-6.22,8.30,2.48,2.91],[-4.62,3.90,5.35,2.31]])line([[start,y,side*z],[end,y,side*z]],black,.014).castShadow=false;
    // Recessed glazing seals and a fine polished reveal catch the sky at grazing angles.
    for(const [start,end,y,z] of [[-6.20,8.30,4.075,2.91],[-4.62,3.90,6.765,2.315]]){
      line([[start,y,side*z],[end,y,side*z]],black,.014).castShadow=false;
      line([[start,y+.024,side*(z+.006)],[end,y+.024,side*(z+.006)]],chrome,.006).castShadow=false;
    }
    for(const x of [-2.7,1.1,4.9]){const m=box(.065,1.59,.105,black,x,3.29,side*2.91);m.name='Atria | recessed main glazing joint';}
    for(const x of [-2.7,.4]){const m=box(.065,1.38,.09,black,x,6.05,side*2.315);m.name='Atria | recessed upper glazing joint';}
    // Streamlined structural arches retain the exact solar panel and scanner clearances.
    const a=new THREE.Vector3(3.3,7.3,side*1.9),b=new THREE.Vector3(1.9,9.62,side*1.9),d=b.clone().sub(a);const arch=soft(.28,d.length(),.17,white,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,.07);arch.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
    const a2=new THREE.Vector3(-1.85,7.32,side*1.9),b2=new THREE.Vector3(-1.4,9.62,side*1.9),d2=b2.clone().sub(a2);const front=soft(.12,d2.length(),.12,chrome,(a2.x+b2.x)/2,(a2.y+b2.y)/2,side*1.9,.045);front.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d2.normalize());
    soft(2.2,.28,1.05,white,-16.3,1.8,side*.78,.2);soft(2.08,.18,.98,upholstery,-16.3,2.03,side*.78,.15);
  }
  for(const side of [-1,1]){const head=soft(.5,.24,.95,upholstery,-15.5,2.2,side*.78,.14);head.rotation.z=-.12;}
  return{glazing};
}
