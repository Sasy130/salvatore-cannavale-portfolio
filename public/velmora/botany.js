import * as THREE from './vendor/three.module.js';

const leafMaterial=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.43,side:THREE.DoubleSide});
const stemMaterial=new THREE.MeshStandardMaterial({color:0x526c37,roughness:.7});
const ceramic=new THREE.MeshPhysicalMaterial({color:0xe6e3d8,roughness:.28,clearcoat:.35});
const soil=new THREE.MeshStandardMaterial({color:0x3a3025,roughness:1});
export function buildPlant({add,line},x,y,z,scale=.8){
  const pot=new THREE.LatheGeometry([new THREE.Vector2(.17,0),new THREE.Vector2(.2,.025),new THREE.Vector2(.24,.39),new THREE.Vector2(.235,.45),new THREE.Vector2(.215,.45),new THREE.Vector2(.207,.39)],48);
  add(pot,ceramic,x,y,z);const earth=add(new THREE.CylinderGeometry(.208,.208,.015,32),soil,x,y+.414,z);earth.scale.x=1.13/1.5;
  const ns=20,nw=8;for(let k=0;k<8;k++){
    const angle=k*2.399963,r=(.15+(k%3)*.035)*scale,h=(.65+(k%4)*.11)*scale;
    const base=new THREE.Vector3(x,y+.42,z),joint=new THREE.Vector3(x+Math.cos(angle)*r,y+.42+h,z+Math.sin(angle)*r);
    const mid=base.clone().lerp(joint,.6);mid.y+=.08;line([base.toArray(),mid.toArray(),joint.toArray()],stemMaterial,.007).castShadow=false;
    const axis=new THREE.Vector3(Math.cos(angle)*.25,.96,Math.sin(angle)*.25).normalize(),right=new THREE.Vector3().crossVectors(axis,new THREE.Vector3(0,1,0)).normalize(),normal=new THREE.Vector3().crossVectors(right,axis).normalize(),length=(.62+(k%3)*.09)*scale,width=(.125+(k%2)*.025)*scale;
    function at(u,v){const span=Math.pow(Math.max(0,Math.sin(Math.PI*u)),.8)*width;return joint.clone().addScaledVector(axis,u*length).addScaledVector(right,span*v).addScaledVector(normal,(Math.abs(v)*.018+u*u*.045)*scale).add(new THREE.Vector3(0,-Math.pow(u,3)*.1*scale,0));}
    const p=[],color=[],idx=[];for(let i=0;i<=ns;i++)for(let j=0;j<=nw;j++){const u=i/ns,v=j/nw*2-1,q=at(u,v),c=new THREE.Color().setHSL(.25+(k%3)*.012,.31,.19+Math.abs(v)*.045+u*.035);p.push(q.x,q.y,q.z);color.push(c.r,c.g,c.b)}for(let i=0;i<ns;i++)for(let j=0;j<nw;j++){const a=i*(nw+1)+j,b=a+nw+1;idx.push(a,b,a+1,a+1,b,b+1)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(color,3));g.setIndex(idx);g.computeVertexNormals();add(g,leafMaterial).castShadow=false;
    const spine=[];for(let i=0;i<=16;i++)spine.push(at(i/16,0).addScaledVector(normal,.002).toArray());line(spine,stemMaterial,.0015).castShadow=false;
    for(let u of [.28,.46,.64,.8])for(let sign of [-1,1]){const a=at(u,0).addScaledVector(normal,.002),b=at(Math.min(.98,u+.075),sign*.83).addScaledVector(normal,.002);line([a.toArray(),b.toArray()],stemMaterial,.0006).castShadow=false;}
  }
}
