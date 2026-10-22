import * as THREE from './vendor/three.module.js';

const longitudinalSegments=224,sectionSegments=72;
const profile=[[-1,1],[-1.002,.94],[-.99,.62],[-.97,.35],[-.93,-.65],[-.7,-1.25],[-.25,-1.62],[0,-1.78],[.25,-1.62],[.7,-1.25],[.93,-.65],[.97,.35],[.99,.62],[1.002,.94],[1,1]];
function section(sheer){return new THREE.CatmullRomCurve3(profile.map(([z,y],i)=>new THREE.Vector3(z,i<2||i>12?sheer-(1-y)*1.5:y,0)),false,'centripetal')}
function rake(x,y,sheer){const depth=THREE.MathUtils.clamp((sheer-y)/(sheer+1.78),0,1);const bow=Math.exp(-Math.max(0,x+20)*.6);const aft=THREE.MathUtils.smoothstep(x,10.6,13.2);return x+1.45*depth*bow-.42*depth*aft}
function geometry(positions,indices,uv){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));if(uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g}

export function createHullGeometry(stations){
  const path=new THREE.CatmullRomCurve3(stations.map(s=>new THREE.Vector3(...s)),false,'centripetal');const pos=[],uv=[],idx=[],sections=[];
  for(let i=0;i<=longitudinalSegments;i++){
    const station=path.getPoint(i/longitudinalSegments),curve=section(station.z),points=curve.getPoints(sectionSegments);sections.push({x:station.x,width:station.y,sheer:station.z,points});
    for(let j=0;j<=sectionSegments;j++){const p=points[j];pos.push(rake(station.x,p.y,station.z),p.y,p.x*station.y);uv.push((station.x+20)/33.2,j/sectionSegments)}
  }
  for(let i=0;i<longitudinalSegments;i++)for(let j=0;j<sectionSegments;j++){const a=i*(sectionSegments+1)+j,b=a+sectionSegments+1;idx.push(a,b,a+1,a+1,b,b+1)}
  const body=geometry(pos,idx,uv);
  function cap(index,reverse){const frame=sections[index],vertices=[],triangles=[];const meanY=frame.points.reduce((n,p)=>n+p.y,0)/frame.points.length;vertices.push(rake(frame.x,meanY,frame.sheer),meanY,0);frame.points.forEach(p=>vertices.push(rake(frame.x,p.y,frame.sheer),p.y,p.x*frame.width));const count=frame.points.length;for(let j=0;j<count;j++){let a=j+1,b=(j+1)%count+1;triangles.push(...(reverse?[0,b,a]:[0,a,b]))}return geometry(vertices,triangles)}
  return{body,bow:cap(0,false),transom:cap(longitudinalSegments,true),sections};
}

export function buildHull({stations,add,paint,white,black}){
  const result=createHullGeometry(stations);const body=add(result.body,paint);body.name='Atria | fair continuous hull';add(result.bow,paint).name='Atria | raked stem';add(result.transom,paint).name='Atria | integrated transom';
  // A rolled cap joins the outer shell to the inner bulwark all around the foredeck.
  const innerMaterial=white.clone();innerMaterial.side=THREE.DoubleSide;
  for(const side of [-1,1]){const p=[],uv=[],idx=[];for(let i=0;i<result.sections.length;i++){const s=result.sections[i],innerWidth=Math.max(s.width-.105,.012),low=Math.min(1.435,s.sheer-.035);const edge=[[s.width,s.sheer],[Math.max(s.width-.025,.01),s.sheer+.018],[Math.max(s.width-.067,.01),s.sheer-.01],[innerWidth,low]];for(let j=0;j<edge.length;j++){p.push(s.x,edge[j][1],side*edge[j][0]);uv.push((s.x+20)/33.2,j/3)}if(i){const a=(i-1)*4;for(let j=0;j<3;j++)idx.push(a+j,a+j+1,a+j+4,a+j+1,a+j+5,a+j+4)}}const inner=add(geometry(p,idx,uv),innerMaterial);inner.name='Atria | rolled gunwale and inner bulwark';}
  // The boot stripe follows the actual submerged section, not the maximum beam.
  for(const side of [-1,1]){const p=[],idx=[];for(let i=0;i<result.sections.length;i++){const s=result.sections[i];for(const height of [-.855,-.81]){const points=s.points.slice(0,Math.floor(s.points.length/2)+1);let z=-.88;for(let j=1;j<points.length;j++){if(points[j].y<=height&&points[j-1].y>=height){const a=points[j-1],b=points[j],t=(height-a.y)/(b.y-a.y);z=THREE.MathUtils.lerp(a.x,b.x,t);break}}p.push(rake(s.x,height,s.sheer),height,side*(Math.abs(z)*s.width+.009))}if(i){const a=(i-1)*2;idx.push(a,a+2,a+1,a+1,a+2,a+3)}}const mat=black.clone();mat.side=THREE.DoubleSide;mat.roughness=.32;const stripe=add(geometry(p,idx),mat);stripe.name='Atria | fitted waterline';stripe.castShadow=false;}
  return result;
}

// Hull windows are laid onto the lofted surface rather than placed at a guessed beam.
export function addHullGlazing({hull,add,chrome,black,darkGlass}){
  const sections=hull.sections;
  function sectionWidth(section,y){
    let width=0;
    for(let i=1;i<section.points.length;i++){
      const a=section.points[i-1],b=section.points[i];
      if(Math.max(a.x,b.x)<0||y<Math.min(a.y,b.y)||y>Math.max(a.y,b.y)||Math.abs(b.y-a.y)<1e-8)continue;
      const t=(y-a.y)/(b.y-a.y);width=Math.max(width,THREE.MathUtils.lerp(a.x,b.x,t)*section.width);
    }
    return width;
  }
  function beamAt(x,y){
    let hi=sections.findIndex(section=>section.x>=x);if(hi<1)hi=hi<0?sections.length-1:1;
    const a=sections[hi-1],b=sections[hi],t=THREE.MathUtils.clamp((x-a.x)/(b.x-a.x),0,1);
    return THREE.MathUtils.lerp(sectionWidth(a,y),sectionWidth(b,y),t);
  }
  function roundedContour(w,h,r){
    const points=[];
    for(const [cx,cy,start] of [[w/2-r,h/2-r,0],[-w/2+r,h/2-r,Math.PI/2],[-w/2+r,-h/2+r,Math.PI],[w/2-r,-h/2+r,Math.PI*1.5]]){
      for(let i=0;i<=10;i++){const a=start+i/10*Math.PI/2;points.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}
    }
    return points;
  }
  function rim(cx,side,outer,inner,outset,mat,name){
    const a=roundedContour(...outer),b=roundedContour(...inner),p=[],idx=[];
    for(let i=0;i<a.length;i++)for(const q of [a[i],b[i]]){const x=cx+q[0],y=.72+q[1];p.push(x,y,side*(beamAt(x,y)+outset));}
    for(let i=0;i<a.length;i++){const j=(i+1)%a.length,a0=i*2,a1=j*2;idx.push(...(side>0?[a0,a1,a0+1,a0+1,a1,a1+1]:[a0,a0+1,a1,a0+1,a1+1,a1]));}
    const mesh=add(geometry(p,idx),mat);mesh.name=name;mesh.castShadow=false;
  }
  const panes=[];
  for(const side of [-1,1])for(const cx of [-9,-5,-1,3,7]){
    rim(cx,side,[2.24,.51,.165],[2.195,.465,.145],.016,chrome,'Atria | flush hull window steel rim');
    rim(cx,side,[2.197,.467,.146],[2.145,.415,.125],.023,black,'Atria | recessed hull window gasket');
    const p=[],uv=[],idx=[],columns=24,rows=6,w=2.15,h=.42,r=.13;
    for(let i=0;i<=columns;i++){
      const dx=(i/columns-.5)*w,corner=Math.max(0,Math.abs(dx)-(w*.5-r)),edge=h*.5-r+Math.sqrt(Math.max(0,r*r-corner*corner));
      for(let j=0;j<=rows;j++){const x=cx+dx,y=.72+(j/rows*2-1)*edge;p.push(x,y,side*(beamAt(x,y)+.028));uv.push(i/columns,j/rows);}
    }
    for(let i=0;i<columns;i++)for(let j=0;j<rows;j++){const a=i*(rows+1)+j,b=a+rows+1;idx.push(...(side>0?[a,b,a+1,a+1,b,b+1]:[a,a+1,b,a+1,b+1,b]));}
    const pane=add(geometry(p,idx,uv),darkGlass);pane.name='Atria | conforming hull glazing';pane.castShadow=false;panes.push(pane);
  }
  return{panes,beamAt};
}
