import * as THREE from './vendor/three.module.js';
import { Water } from './vendor/Water.js';
import { Sky } from './vendor/Sky.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

export function createAtmosphere(renderer,scene,sunDirection){
  const sky=new Sky();sky.scale.setScalar(1200);scene.add(sky);
  // A fixed high cloud layer gives the glazing and polished metal a readable
  // reflection, while the darker lower hemisphere reflects the surrounding sea.
  const cloudWidth=256,cloudHeight=128,cloudBytes=new Uint8Array(cloudWidth*cloudHeight*4),tau=Math.PI*2;
  for(let y=0;y<cloudHeight;y++)for(let x=0;x<cloudWidth;x++){
    const u=x/cloudWidth,v=y/(cloudHeight-1);
    const f=.49+Math.sin(tau*(u*3+v*4))*.18+Math.sin(tau*(u*7-v*6)+.8)*.13+Math.sin(tau*(u*17+v*13))*.07+Math.sin(tau*(u*37-v*19))*.035;
    const mask=THREE.MathUtils.smoothstep(f,.56,.80),i=(y*cloudWidth+x)*4;
    cloudBytes[i]=cloudBytes[i+1]=cloudBytes[i+2]=Math.round(mask*255);cloudBytes[i+3]=255;
  }
  const cloudMap=new THREE.DataTexture(cloudBytes,cloudWidth,cloudHeight);cloudMap.wrapS=THREE.RepeatWrapping;cloudMap.wrapT=THREE.ClampToEdgeWrapping;cloudMap.minFilter=THREE.LinearFilter;cloudMap.magFilter=THREE.LinearFilter;cloudMap.needsUpdate=true;
  const night={value:0};scene.userData.marineNight=night;sky.material.uniforms.nightAmount=night;sky.material.uniforms.cloudSampler={value:cloudMap};
  sky.material.fragmentShader=sky.material.fragmentShader.replace('uniform float mieDirectionalG;','uniform float mieDirectionalG; uniform float nightAmount; uniform sampler2D cloudSampler;').replace('#include <tonemapping_fragment>',`
    float cloudMask=texture2D(cloudSampler,vec2(atan(direction.z,direction.x)/(2.0*pi)+.5,direction.y*.7+.12)).r;
    cloudMask*=smoothstep(.035,.19,direction.y)*(1.0-smoothstep(.46,.75,direction.y));
    vec3 cloudLight=mix(vec3(.87,.78,.64),vec3(.79,.86,.90),smoothstep(.08,.42,direction.y));
    gl_FragColor.rgb=mix(gl_FragColor.rgb,cloudLight,cloudMask*.28);
    gl_FragColor.rgb=mix(gl_FragColor.rgb,gl_FragColor.rgb*vec3(.045,.075,.14),nightAmount);
    #include <tonemapping_fragment>`);
  const u=sky.material.uniforms;u.turbidity.value=2.15;u.rayleigh.value=2.25;u.mieCoefficient.value=.003;u.mieDirectionalG.value=.84;u.sunPosition.value.copy(sunDirection);
  const environmentScene=new THREE.Scene(),environmentSky=sky.clone();environmentScene.add(environmentSky);const reflectedSea=new THREE.Mesh(new THREE.SphereGeometry(500,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2),new THREE.MeshBasicMaterial({color:0x103844,side:THREE.BackSide}));environmentScene.add(reflectedSea);
  // Capture once. Lighting modes adjust scene intensities without rebuilding PMREM.
  const generator=new THREE.PMREMGenerator(renderer),environmentTarget=generator.fromScene(environmentScene,.025);scene.environment=environmentTarget.texture;generator.dispose();reflectedSea.geometry.dispose();reflectedSea.material.dispose();
  return {sky,uniforms:{day:{value:0}},update(day,night=0){
    sunDirection.set(.4,THREE.MathUtils.lerp(.16,.43,day),-.92).normalize();u.sunPosition.value.copy(sunDirection);sky.material.uniforms.nightAmount.value=night;
    u.turbidity.value=THREE.MathUtils.lerp(2.65,2.15,day);u.rayleigh.value=THREE.MathUtils.lerp(2.35,2.25,day);
  }};
}

function canvasTexture(canvas,renderer,color=true){const t=new THREE.CanvasTexture(canvas);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return t}
export function createMaterialTextures(renderer){
  const size=1024;let seed=145;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};
  const make=()=>{let c=document.createElement('canvas');c.width=c.height=size;return[c,c.getContext('2d')]};
  const [c,ctx]=make();ctx.fillStyle='#d9d4c7';ctx.fillRect(0,0,size,size);
  const [b,bctx]=make();bctx.fillStyle='#aaa';bctx.fillRect(0,0,size,size);
  for(let plank=0;plank<12;plank++){let start=plank*size/12,w=size/12;let lum=201+rand()*25;ctx.fillStyle=`rgb(${lum+6},${lum+3},${lum-5})`;ctx.fillRect(0,start,size,w);ctx.fillStyle='#514c43';ctx.fillRect(0,start,size,2);bctx.fillStyle='#333';bctx.fillRect(0,start,size,2);
    const end=(plank%4)*256+80;ctx.fillStyle='#6b655b';ctx.fillRect(end,start,1.6,w);bctx.fillStyle='#444';bctx.fillRect(end,start,1.5,w);
    for(let k=0;k<120;k++){const y=start+rand()*w;ctx.beginPath();ctx.strokeStyle=`rgba(58,47,32,${.015+rand()*.075})`;ctx.lineWidth=.3+rand()*.7;ctx.moveTo(0,y);ctx.bezierCurveTo(256,y+rand()*4,700,y-rand()*3,size,y);ctx.stroke();bctx.beginPath();bctx.strokeStyle=`rgba(255,255,255,${rand()*.1})`;bctx.moveTo(0,y);bctx.lineTo(size,y);bctx.stroke();}
  }
  const teakTexture=canvasTexture(c,renderer);teakTexture.repeat.set(.32,1.45);const teakBump=canvasTexture(b,renderer,false);teakBump.repeat.copy(teakTexture.repeat);
  const [veneer,vctx]=make();vctx.fillStyle='#dfd8c8';vctx.fillRect(0,0,size,size);for(let i=0;i<1200;i++){const x=rand()*size;vctx.strokeStyle=`rgba(79,58,34,${.015+rand()*.09})`;vctx.lineWidth=.3+rand()*.85;vctx.beginPath();vctx.moveTo(x,0);vctx.bezierCurveTo(x+rand()*6,300,x-rand()*5,700,x,size);vctx.stroke()}const woodTexture=canvasTexture(veneer,renderer),woodBump=canvasTexture(veneer,renderer,false);woodTexture.repeat.set(1,1.5);woodBump.repeat.copy(woodTexture.repeat);
  const [cloth,cctx]=make();cctx.fillStyle='#efeee8';cctx.fillRect(0,0,size,size);const [clothBump,cbctx]=make();cbctx.fillStyle='#888';cbctx.fillRect(0,0,size,size);
  for(let y=0;y<size;y+=4)for(let x=0;x<size;x+=4){const bright=224+rand()*22;cctx.fillStyle=`rgb(${bright},${bright},${bright-2})`;cctx.fillRect(x,y,3,2);cctx.fillStyle='#c8c7c020';cctx.fillRect(x+2,y+1,1,3);cbctx.fillStyle=(x+y)%8?'#bbb':'#666';cbctx.fillRect(x,y,3,2)}
  const fabricTexture=canvasTexture(cloth,renderer);fabricTexture.repeat.set(3,3);const fabricBump=canvasTexture(clothBump,renderer,false);fabricBump.repeat.set(3,3);
  const [stone,sctx]=make();sctx.fillStyle='#e6e4dc';sctx.fillRect(0,0,size,size);for(let i=0;i<32;i++){const y=rand()*size;sctx.strokeStyle=`rgba(85,91,87,${.025+rand()*.09})`;sctx.lineWidth=.4+rand()*1.5;sctx.beginPath();sctx.moveTo(0,y);sctx.bezierCurveTo(220,y+80,480,y-120,size,y+rand()*160-80);sctx.stroke()}const marbleTexture=canvasTexture(stone,renderer);
  return{teakTexture,teakBump,woodTexture,woodBump,fabricTexture,fabricBump,marbleTexture};
}

export function roundedSolid(w,h,d,r=.08){return new RoundedBoxGeometry(w,h,d,3,Math.min(r,w*.48,h*.48,d*.48))}
export function paddedGeometry(w,h,d,r=.12){const geo=new RoundedBoxGeometry(w,h,d,6,Math.min(r,h*.45,d*.4,w*.4));const p=geo.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const center=Math.pow(Math.max(0,1-Math.pow(x/(w*.5),2)),.6)*Math.pow(Math.max(0,1-Math.pow(z/(d*.5),2)),.6);y+=Math.sign(y)*center*Math.min(h*.12,.025);const edge=Math.pow(Math.max(0,1-Math.abs(y)/(h*.6)),2);z+=Math.sin(x*28+z*4)*edge*.002;p.setXYZ(i,x,y,z)}geo.computeVertexNormals();return geo}

export function createOcean(scene,sunDirection,renderer){
  // Wrapped gradient-noise octaves avoid the regular crosshatch of sinusoidal
  // wave tiles. Domain warping breaks up the crests without adding shader cost.
  const n=256,bytes=new Uint8Array(n*n*4),tau=Math.PI*2,gradientTables=new Map();
  const wrap=(v,p)=>((v%p)+p)%p;
  const gradient=(x,y,px,py,dx,dy)=>{let table=gradientTables.get(px*256+py);if(!table){table=new Float32Array(px*py*2);for(let b=0;b<py;b++)for(let a=0;a<px;a++){let h=Math.imul(a+17,374761393)^Math.imul(b+71,668265263);h=Math.imul(h^(h>>>13),1274126177);const angle=((h^(h>>>16))>>>0)/4294967296*tau,i=(b*px+a)*2;table[i]=Math.cos(angle);table[i+1]=Math.sin(angle)}gradientTables.set(px*256+py,table)}const i=(wrap(y,py)*px+wrap(x,px))*2;return table[i]*dx+table[i+1]*dy};
  const noise=(x,y,px,py)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,sx=fx*fx*fx*(fx*(fx*6-15)+10),sy=fy*fy*fy*(fy*(fy*6-15)+10);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(gradient(ix,iy,px,py,fx,fy),gradient(ix+1,iy,px,py,fx-1,fy),sx),THREE.MathUtils.lerp(gradient(ix,iy+1,px,py,fx,fy-1),gradient(ix+1,iy+1,px,py,fx-1,fy-1),sx),sy)};
  const height=(x,y)=>{let u=x/n,v=y/n;const warpU=noise(u*4,v*4,4,4)*.032,warpV=noise(u*5+1.7,v*5+3.2,5,5)*.026;u+=warpU;v+=warpV;return noise(u*6,v*11,6,11)*.61+noise((u+v)*13,(v-u)*19,13,19)*.22+noise((u-v)*29,(v*2+u)*31,29,31)*.065+noise(u*61,v*67,61,67)*.016};
  const heights=new Float32Array(n*n);for(let y=0;y<n;y++)for(let x=0;x<n;x++)heights[y*n+x]=height(x,y);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const dx=(heights[y*n+wrap(x+1,n)]-heights[y*n+wrap(x-1,n)])*6.5,dy=(heights[wrap(y+1,n)*n+x]-heights[wrap(y-1,n)*n+x])*6.5,len=Math.hypot(dx,dy,1),i=(y*n+x)*4;bytes[i]=128-dx/len*127;bytes[i+1]=128-dy/len*127;bytes[i+2]=128+127/len;bytes[i+3]=255}
  const normals=new THREE.DataTexture(bytes,n,n);normals.wrapS=normals.wrapT=THREE.RepeatWrapping;normals.magFilter=THREE.LinearFilter;normals.minFilter=THREE.LinearMipmapLinearFilter;normals.generateMipmaps=true;normals.needsUpdate=true;
  const water=new Water(new THREE.PlaneGeometry(2400,2400),{textureWidth:innerWidth<650?256:512,textureHeight:innerWidth<650?256:512,waterNormals:normals,sunDirection,sunColor:0xffead0,waterColor:0x0d5c65,distortionScale:1.15,fog:true});water.rotation.x=-Math.PI/2;water.position.y=-.04;
  const uniforms=water.material.uniforms;uniforms.size.value=1;uniforms.day={value:1};uniforms.night=scene.userData.marineNight||{value:0};
  let shader=water.material.fragmentShader;
  shader=shader.replace('uniform float size;','uniform float size; uniform float day; uniform float night;');
  shader=shader.replace(/vec4 getNoise\( vec2 uv \) \{[\s\S]*?\n\s*\}/,`vec4 getNoise( vec2 uv ) {
    vec3 n0=texture2D(normalSampler,uv/11.7+vec2(time*.009,time*.006)).xyz*2.0-1.0;
    vec3 n1=texture2D(normalSampler,vec2(uv.y,-uv.x)/47.3-vec2(time*.003,time*.002)).xyz*2.0-1.0;
    vec3 n2=texture2D(normalSampler,uv/4.2+vec2(time*-.014,time*.011)).xyz*2.0-1.0;
    vec3 n3=texture2D(normalSampler,uv/1.6+vec2(time*.011,time*-.017)).xyz*2.0-1.0;
    float viewDistance=length(eye-worldPosition.xyz);
    float fineVisibility=1.0-smoothstep(28.0,145.0,viewDistance);
    vec3 waveNormal=n0*.64+n1*.36;
    waveNormal.xy+=n2.xy*.18*fineVisibility+n3.xy*.055*fineVisibility*fineVisibility;
    return vec4(waveNormal,1.0);
  }`);
  shader=shader.replace('vec3 surfaceNormal = normalize( noise.xzy * vec3( 1.5, 1.0, 1.5 ) );',`
    vec3 surfaceNormal=normalize(vec3(noise.x*.34,max(.75,noise.z),noise.y*.34));`);
  shader=shader.replace('100.0, 2.0, 0.5','240.0, 1.35, 0.45');
  shader=shader.replace('vec3 outgoingLight = albedo;',`
    vec3 deepWater=mix(waterColor*vec3(.66,.76,.83),waterColor,day)*(1.0-night*.82);
    vec3 marineScatter=(deepWater*(.56+.40*theta)+sunColor*diffuseLight*.025)*getShadowMask();
    vec3 marineReflection=reflectionSample*.98+specularLight*(.26-night*.18);
    vec3 outgoingLight=mix(marineScatter,marineReflection,reflectance)+specularLight*.018*(1.0-night);`);
  water.material.fragmentShader=shader;scene.add(water);
  // One transparent surface carries both the fine hull contact line and the
  // twin propeller wash. It starts at the actual stern and dissolves aft.
  const surfaceDetails=new THREE.Group();surfaceDetails.name='Atria | marine contact and trailing wake';
  const wakeGeo=new THREE.PlaneGeometry(124,46);wakeGeo.rotateX(-Math.PI/2);
  const wakeMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{time:uniforms.time,day:uniforms.day,night:uniforms.night},vertexShader:`
    varying vec3 vSurfacePosition;
    void main(){vec4 world=modelMatrix*vec4(position,1.0);vSurfacePosition=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
    fragmentShader:`
    varying vec3 vSurfacePosition;uniform float time;uniform float day;uniform float night;
    void main(){
      float x=vSurfacePosition.x,z=abs(vSurfacePosition.z),aft=max(0.0,x-20.2);
      float advect=x-time*2.5;
      float grain=.55+.20*sin(advect*4.2+vSurfacePosition.z*7.1)+.15*sin(advect*8.7-vSurfacePosition.z*5.3);
      float breakup=smoothstep(.23,.71,grain);
      float envelope=smoothstep(20.0,23.0,x)*(1.0-smoothstep(34.0,89.0,x));
      float edge=3.18+aft*.17;
      float wakeRim=exp(-pow((z-edge)/(.12+aft*.014),2.0));
      float propellerWash=exp(-pow((z-1.65)/(.38+aft*.052),2.0));
      float wake=(wakeRim*.24+propellerWash*.18)*envelope*breakup;
      float beam=3.58*sqrt(clamp((x+28.8)/18.0,0.0,1.0))*(1.0-.07*smoothstep(9.0,20.0,x));
      float alongside=smoothstep(-28.8,-25.0,x)*(1.0-smoothstep(17.5,20.5,x));
      float hullContact=exp(-pow((z-beam-.035)/.085,2.0))*alongside*(.045+.075*breakup);
      float alpha=(wake+hullContact)*(1.0-night*.52);
      if(alpha<.006)discard;
      vec3 foamColor=mix(vec3(.53,.64,.61),vec3(.68,.79,.76),day)*(1.0-night*.64);
      gl_FragColor=vec4(foamColor,alpha);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`});
  const wake=new THREE.Mesh(wakeGeo,wakeMat);wake.name='Atria | fine sea foam';wake.position.set(32,-.021,0);surfaceDetails.add(wake);scene.add(surfaceDetails);water.userData.surfaceDetails=surfaceDetails;
  return water;
}

export function addMarineDetails(ctx){
  const {boat,add,box,soft,line,cylinder,paint,white,chrome,bronze,black,glass,teak,wood,cream,upholstery,warm,marble}=ctx;
  function sweep(points,width,height,mat){const path=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const pos=[],idx=[],segments=100,sides=16;const tang=new THREE.Vector3(),normal=new THREE.Vector3();for(let i=0;i<=segments;i++){const p=path.getPoint(i/segments);tang.copy(path.getTangent(i/segments));normal.set(-tang.z,0,tang.x).normalize();for(let j=0;j<sides;j++){let a=j/sides*Math.PI*2;const u=Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.42)*width*.5,v=Math.sign(Math.sin(a))*Math.pow(Math.abs(Math.sin(a)),.42)*height*.5;pos.push(p.x+normal.x*u,p.y+v,p.z+normal.z*u)}}for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){let a=i*sides+j,b=i*sides+(j+1)%sides,c=a+sides,d=b+sides;idx.push(a,c,b,b,c,d)}let geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setIndex(idx);geo.computeVertexNormals();add(geo,mat)}
  function beam(a,b,w,d,mat){const va=new THREE.Vector3(...a),vb=new THREE.Vector3(...b),direction=vb.clone().sub(va),mid=va.clone().add(vb).multiplyScalar(.5);const mesh=soft(w,direction.length(),d,mat,mid.x,mid.y,mid.z,.09);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());return mesh}
  // Rolled fiberglass deck edges and raked structural buttresses replace a stacked-box silhouette.
  for(let s of [-1,1]){
    sweep([[-19.9,2.12,s*.04],[-19.3,2.08,s*.55],[-17.8,1.98,s*1.3],[-15.5,1.86,s*2.2],[-13,1.77,s*2.8],[-10,1.7,s*3.25],[-6,1.67,s*3.5],[0,1.59,s*3.58],[8,1.53,s*3.54],[12.8,1.46,s*3.27]],.14,.28,paint);
    beam([9.15,1.65,s*2.8],[7.9,4.15,s*2.87],.3,.2,white);
    beam([5.05,4.55,s*2.75],[3.65,6.9,s*2.3],.32,.18,white);
    // Hull hardware, flush engine-room louvers, navigation lamps and chromed fairleads.
    for(let x of [10.1,10.3,10.5,10.7,10.9,11.1]){let vent=box(.07,.45,.035,black,x,.75,s*3.48);vent.rotation.z=-.2}

    for(let x of [-11,7,12]){box(.33,.065,.2,chrome,x,1.82,s*(x<-8?2.7:3.19));cylinder(.055,.11,chrome,x-.1,1.9,s*(x<-8?2.7:3.19));cylinder(.055,.11,chrome,x+.1,1.9,s*(x<-8?2.7:3.19))}

  }
  for(let z of [-1.45,-.45,.55,1.55]){const ring=add(new THREE.TorusGeometry(.17,.009,8,32),chrome,-3.55,1.98,z);ring.rotation.x=Math.PI/2;}
  // A soft contact shadow anchors every furnishing to the floor.
  const c=document.createElement('canvas');c.width=c.height=128;let cctx=c.getContext('2d'),gradient=cctx.createRadialGradient(64,64,5,64,64,64);gradient.addColorStop(0,'rgba(10,17,18,.48)');gradient.addColorStop(.5,'rgba(10,17,18,.2)');gradient.addColorStop(1,'rgba(10,17,18,0)');cctx.fillStyle=gradient;cctx.fillRect(0,0,128,128);const shadowMap=new THREE.CanvasTexture(c);const shadowMat=new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  for(const [x,y,z,w,d] of [[3.1,1.641,-2.1,5.2,1.8],[3.1,1.642,2.1,5.2,1.8],[3,1.645,0,3,2],[-4.7,1.644,0,2,5],[-.5,4.635,0,4,3.4],[.2,7.287,-1.5,4,1.4],[.2,7.288,1.5,4,1.4]]){let m=add(new THREE.PlaneGeometry(w,d),shadowMat,x,y,z);m.rotation.x=-Math.PI/2;m.castShadow=false;m.receiveShadow=false}
  // Fine vertical joinery, real seams, upholstery piping and tailoring details.
  for(let z=-2.15;z<2.2;z+=.13){soft(.025,1.03,.022,wood,-3.985,2.1,z,.005);soft(.02,1.95,.02,wood,-3.78,5.68,z,.004)}
  // Lightly folded linen curtains and slim recessed tracks at the glazing.
  const curtainMat=new THREE.MeshStandardMaterial({color:0xebe7d9,roughness:1,transparent:true,opacity:.85,side:THREE.DoubleSide,map:cream.map,bumpMap:cream.bumpMap,bumpScale:.001});
  for(let s of [-1,1])for(let x of [-6.2,7.65]){const curtainGeo=new THREE.PlaneGeometry(.46,2.25,24,2),cp=curtainGeo.attributes.position;for(let i=0;i<cp.count;i++)cp.setZ(i,Math.sin(cp.getX(i)*72)*.035);curtainGeo.computeVertexNormals();add(curtainGeo,curtainMat,x,2.9,s*2.77);line([[x-.3,4.06,s*2.75],[x+.3,4.06,s*2.75]],chrome,.008)}
  // A retractable bathing ladder, capstans and a proper bow chain add marine scale.
  for(let z of [-1.7,-1.25])line([[15.3,.25,z],[15.95,.25,z],[16.05,-.9,z]],chrome,.025);for(let y of [-.65,-.3,.05])line([[16.04,y,-1.7],[16.04,y,-1.25]],chrome,.02);
  for(let x of [11.7,-13.5])for(let s of [-1,1]){cylinder(.1,.13,chrome,x,1.82,s*(x<0?.7:2.8));cylinder(.14,.025,chrome,x,1.9,s*(x<0?.7:2.8))}
  for(let i=0;i<24;i++){let link=add(new THREE.TorusGeometry(.035,.009,6,12),chrome,-18.5-i*.047,1.77,0);link.rotation.x=i%2?Math.PI/2:0}
  for(let s of [-1,1]){soft(.9,.035,.65,black,-18.1,1.78,s*.5,.1);soft(.85,.035,.6,glass,-18.1,1.81,s*.5,.08);const towel=add(new THREE.CylinderGeometry(.09,.09,.58,24),cream,-12,2.19,s*1.1);towel.rotation.z=Math.PI/2;}
  // Detailed coffee table: stacked books, a tray, glass and a ceramic vessel.
  soft(.48,.035,.33,cream,3.25,2.162,.18,.015);soft(.49,.02,.34,wood,3.25,2.185,.18,.015);soft(.43,.025,.3,black,3.21,2.209,.17,.012);
  const vessel=add(new THREE.LatheGeometry([new THREE.Vector2(.11,0),new THREE.Vector2(.16,.05),new THREE.Vector2(.15,.22),new THREE.Vector2(.085,.29),new THREE.Vector2(.08,.33)],32),new THREE.MeshPhysicalMaterial({color:0xeee9dd,roughness:.28,clearcoat:.35}),2.48,2.15,-.18);
  const stemGlass=new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:.9,thickness:.04,roughness:.05,ior:1.5,transparent:true,opacity:.65});const flute=add(new THREE.LatheGeometry([new THREE.Vector2(.08,0),new THREE.Vector2(.015,.015),new THREE.Vector2(.012,.12),new THREE.Vector2(.05,.17),new THREE.Vector2(.065,.29)],24),stemGlass,3.55,2.15,-.32);
  // A ceiling coffer replaces the plain flat underside of the main deck roof.
  soft(10.9,.025,4.6,cream,.5,4.135,0,.22);for(let s of [-1,1])line([[-4.9,4.1,s*2.31],[5.9,4.1,s*2.31]],warm,.012);for(let x of [-2,1.5,5])for(let z of [-1.7,1.7]){cylinder(.045,.015,bronze,x,4.1,z);cylinder(.025,.018,warm,x,4.087,z)}
  // Real instruments instead of blank turquoise screens.
  const screenCanvas=document.createElement('canvas');screenCanvas.width=1024;screenCanvas.height=512;const sc=screenCanvas.getContext('2d');sc.fillStyle='#091c27';sc.fillRect(0,0,1024,512);sc.strokeStyle='#37606b';sc.lineWidth=1;for(let i=0;i<1024;i+=64){sc.beginPath();sc.moveTo(i,0);sc.lineTo(i,512);sc.stroke()}for(let i=0;i<512;i+=64){sc.beginPath();sc.moveTo(0,i);sc.lineTo(1024,i);sc.stroke()}sc.strokeStyle='#d8c296';sc.lineWidth=3;sc.beginPath();sc.moveTo(100,420);sc.bezierCurveTo(300,120,400,440,850,120);sc.stroke();sc.fillStyle='#e2e9e2';sc.font='26px sans-serif';sc.fillText('VELMORA  /  NAVIGATION',48,58);sc.font='64px sans-serif';sc.fillText('12.8 kn',60,150);sc.font='20px sans-serif';sc.fillText('43°44′ N   07°25′ E',60,190);sc.strokeStyle='#81a9a6';sc.beginPath();sc.arc(825,320,105,0,Math.PI*2);sc.stroke();const instrument=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(screenCanvas)});box(.012,.87,2.28,instrument,-6.77,3.05,0);
  // Lounge wall artwork with a matte, softly lit abstract composition.
  const artCanvas=document.createElement('canvas');artCanvas.width=1024;artCanvas.height=512;const ac=artCanvas.getContext('2d');ac.fillStyle='#c4c6bb';ac.fillRect(0,0,1024,512);let ag=ac.createLinearGradient(0,0,0,512);ag.addColorStop(0,'#c6c6b7');ag.addColorStop(.48,'#c7b99d');ag.addColorStop(.49,'#5e7e80');ag.addColorStop(1,'#244a55');ac.fillStyle=ag;ac.fillRect(0,0,1024,512);ac.fillStyle='#ddd0aa';ac.beginPath();ac.arc(700,190,32,0,Math.PI*2);ac.fill();const art=new THREE.MeshStandardMaterial({map:new THREE.CanvasTexture(artCanvas),roughness:.95});box(2.3,.9,.015,art,.4,5.85,-2.14);
  return {fabricMaterials:[]};
}
