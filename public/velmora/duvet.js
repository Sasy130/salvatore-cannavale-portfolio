import * as THREE from './vendor/three.module.js';

export function buildDuvet({add,line,upholstery,cream}){
  // A closed, softly padded quilt: rounded corners, shallow tailoring and weighted overhangs.
  const nx=64,nz=76,pos=[],uv=[],idx=[];
  function point(i,j){let x=(i/nx-.5)*1.62,z=(j/nz-.5)*2.13;const ax=Math.abs(x),az=Math.abs(z),r=.14,dx=Math.max(0,ax-(.81-r)),dz=Math.max(0,az-(1.065-r)),len=Math.hypot(dx,dz);if(len>r){x=Math.sign(x)*(.81-r+dx*r/len);z=Math.sign(z)*(1.065-r+dz*r/len)}const side=THREE.MathUtils.smoothstep(Math.abs(z),.82,1.065),foot=THREE.MathUtils.smoothstep(x,.60,.81);let y=.024*Math.cos(x*1.3)*Math.cos(z*1.3)-side*.245-foot*.20;const folds=Math.sin(z*23+x*6)*.006+Math.sin(z*41-x*9)*.003;y+=folds*(.25+side*.75)+.028*Math.exp(-Math.pow((x+.62)/.085,2));return[x,y,z]}
  const count=(nx+1)*(nz+1);
  for(let layer=0;layer<2;layer++)for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const [x,y,z]=point(i,j);pos.push(x,y-layer*.037,z);uv.push(i/nx,j/nz)}
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;idx.push(a,b,a+1,a+1,b,b+1);idx.push(a+count,a+1+count,b+count,a+1+count,b+1+count,b+count)}
  const edge=[];for(let i=0;i<=nx;i++)edge.push(i);for(let j=1;j<=nz;j++)edge.push(j*(nx+1)+nx);for(let i=nx-1;i>=0;i--)edge.push(nz*(nx+1)+i);for(let j=nz-1;j>0;j--)edge.push(j*(nx+1));for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];idx.push(a,a+count,b,b,a+count,b+count)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const cloth=upholstery.clone();cloth.side=THREE.DoubleSide;cloth.map=upholstery.map.clone();cloth.map.repeat.set(1.1,1.6);cloth.bumpScale=.0017;
  add(g,cloth,-2.29,5.43,0).name='Atria | tailored padded duvet';
  const seam=edge.filter((_,i)=>i%2===0).map(n=>[pos[n*3]-2.29,pos[n*3+1]+5.416,pos[n*3+2]]);seam.push(seam[0]);line(seam,cloth,.0035).castShadow=false;
  return cloth;
}
