import * as THREE from './vendor/three.module.js';

// Bake only immutable opaque parts. Shared materials remain live for the configurator.
export function batchStaticMeshes(root){
  root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),groups=new Map(),center=new THREE.Vector3(),placement=new THREE.Matrix4();let before=0;
  root.traverse(mesh=>{if(!mesh.isMesh)return;before++;let p=mesh;while(p&&p!==root){if(p.userData.dynamic)return;p=p.parent;}const m=mesh.material,g=mesh.geometry;if(Array.isArray(m)||m.transparent||m.isShaderMaterial||mesh.isSkinnedMesh||g.morphAttributes.position||!mesh.visible)return;if(!g.boundingSphere)g.computeBoundingSphere();center.copy(g.boundingSphere.center).applyMatrix4(placement.multiplyMatrices(inverse,mesh.matrixWorld));const key=[m.uuid,mesh.castShadow,mesh.receiveShadow,!!g.attributes.color,Math.floor(center.x/8),Math.floor(center.y/3)].join(':');if(!groups.has(key))groups.set(key,[]);groups.get(key).push(mesh);});
  let removed=0,created=0;const position=new THREE.Vector3(),normal=new THREE.Vector3(),local=new THREE.Matrix4(),nm=new THREE.Matrix3();
  for(const meshes of groups.values()){
    if(meshes.length<2)continue;let count=0,indexCount=0;for(const m of meshes){count+=m.geometry.attributes.position.count;indexCount+=m.geometry.index?m.geometry.index.count:m.geometry.attributes.position.count;}
    const pos=new Float32Array(count*3),norm=new Float32Array(count*3),uv=new Float32Array(count*2),color=meshes[0].geometry.attributes.color?new Float32Array(count*3):null,indices=new Uint32Array(indexCount);let offset=0,io=0;
    for(const mesh of meshes){const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,t=g.attributes.uv,c=g.attributes.color;local.multiplyMatrices(inverse,mesh.matrixWorld);nm.getNormalMatrix(local);
      for(let i=0;i<p.count;i++){position.fromBufferAttribute(p,i).applyMatrix4(local);const base=(offset+i)*3;pos[base]=position.x;pos[base+1]=position.y;pos[base+2]=position.z;normal.set(n?n.getX(i):0,n?n.getY(i):1,n?n.getZ(i):0).applyNormalMatrix(nm);norm[base]=normal.x;norm[base+1]=normal.y;norm[base+2]=normal.z;if(t){uv[(offset+i)*2]=t.getX(i);uv[(offset+i)*2+1]=t.getY(i);}if(color&&c){color[base]=c.getX(i);color[base+1]=c.getY(i);color[base+2]=c.getZ(i);}}
      if(g.index)for(let i=0;i<g.index.count;i++)indices[io++]=g.index.getX(i)+offset;else for(let i=0;i<p.count;i++)indices[io++]=i+offset;offset+=p.count;mesh.removeFromParent();removed++;
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(norm,3));g.setAttribute('uv',new THREE.BufferAttribute(uv,2));if(color)g.setAttribute('color',new THREE.BufferAttribute(color,3));g.setIndex(new THREE.BufferAttribute(indices,1));g.computeBoundingSphere();
    const first=meshes[0],mesh=new THREE.Mesh(g,first.material);mesh.castShadow=first.castShadow;mesh.receiveShadow=first.receiveShadow;mesh.name='Atria | batched static structure';root.add(mesh);created++;
  }
  return{before,after:before-removed+created};
}

// A fixed small light budget avoids recompiling shaders when moving between rooms.
export function createLightPool(root,scene,pointBudget=6){
  const sources=[],spots=[];root.traverse(light=>{if(light.isPointLight||light.isSpotLight){const item={light,parent:light.parent,world:new THREE.Vector3(),target:new THREE.Vector3(),score:0};(light.isSpotLight?spots:sources).push(item);}});
  for(const item of sources.concat(spots))item.light.removeFromParent();
  const points=Array.from({length:pointBudget},()=>{const l=new THREE.PointLight(0xffffff,0,4,2);scene.add(l);return l});
  const spotSlots=Array.from({length:2},()=>{const l=new THREE.SpotLight(0xffffff,0,5,.8,.8,1.5);scene.add(l);scene.add(l.target);return l});
  function select(items,slots,camera){for(const item of items){item.world.copy(item.light.position).applyMatrix4(item.parent.matrixWorld);let visible=true;for(let p=item.parent;p;p=p.parent)if(!p.visible){visible=false;break;}item.score=visible?item.light.intensity/(1+item.world.distanceToSquared(camera.position)):-1;}items.sort((a,b)=>b.score-a.score);
    for(let i=0;i<slots.length;i++){const slot=slots[i],item=items[i];if(!item){slot.intensity=0;continue;}const l=item.light;slot.position.copy(item.world);slot.color.copy(l.color);slot.intensity=item.score<0?0:l.intensity;slot.distance=l.distance;slot.decay=l.decay;if(slot.isSpotLight){slot.angle=l.angle;slot.penumbra=l.penumbra;item.target.copy(l.target.position).applyMatrix4(l.target.parent.matrixWorld);slot.target.position.copy(item.target);}}
  }
  return{sourceCount:sources.length+spots.length,activeCount:points.length+spotSlots.length,update(camera){root.updateMatrix();root.matrixWorld.copy(root.matrix);select(sources,points,camera);select(spots,spotSlots,camera);}};
}

export function initialPixelRatio(width,height,dpr){return Math.min(dpr,width<650?1.1:1.45,Math.sqrt(1800000/(width*height)));}
export function createAdaptiveResolution(renderer,post){
  let maximum=initialPixelRatio(innerWidth,innerHeight,devicePixelRatio),ratio=maximum,total=0,samples=0,lastChange=performance.now();
  const apply=()=>{renderer.setPixelRatio(ratio);renderer.setSize(innerWidth,innerHeight);post.resize();};
  return{resize(){maximum=initialPixelRatio(innerWidth,innerHeight,devicePixelRatio);ratio=Math.min(ratio,maximum);apply();},sample(ms,now){if(document.hidden||ms>150)return;total+=ms;samples++;if(samples<90||now-lastChange<3000)return;const average=total/samples;total=samples=0;let next=ratio;if(average>29)next=Math.max(Math.min(.75,maximum*.65),ratio*.85);else if(average<18&&now-lastChange>10000)next=Math.min(maximum,ratio+.1);if(Math.abs(next-ratio)>.02){ratio=next;apply();lastChange=now;}},get ratio(){return ratio;}};
}
