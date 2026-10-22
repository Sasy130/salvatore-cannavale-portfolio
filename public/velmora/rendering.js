import * as THREE from './vendor/three.module.js';

// One desktop interior resolve: gentle contact shading and edge antialiasing.
// Exterior and mobile views keep the renderer's native antialiasing path.
export function createContactRenderer(renderer){
  if(innerWidth<650||!renderer.extensions.has('EXT_color_buffer_float')){
    return{render:(scene,camera)=>renderer.render(scene,camera),resize:()=>{}};
  }
  const target=new THREE.WebGLRenderTarget(1,1,{
    type:THREE.HalfFloatType,minFilter:THREE.LinearFilter,
    magFilter:THREE.LinearFilter,depthBuffer:true
  });
  // Keep a single scene render and resolve the color edges in this same pass.
  target.samples=0;
  target.texture.colorSpace=THREE.LinearSRGBColorSpace;
  target.depthTexture=new THREE.DepthTexture(1,1,THREE.UnsignedIntType);
  const uniforms={
    colorMap:{value:target.texture},depthMap:{value:target.depthTexture},
    resolution:{value:new THREE.Vector2()},projectionInverse:{value:new THREE.Matrix4()},
    projectionScale:{value:1},strength:{value:.65}
  };
  const material=new THREE.ShaderMaterial({
    uniforms,depthWrite:false,depthTest:false,
    vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,
    fragmentShader:`
      varying vec2 vUv;
      uniform sampler2D colorMap,depthMap;
      uniform vec2 resolution;
      uniform mat4 projectionInverse;
      uniform float strength,projectionScale;

      vec3 viewPosition(vec2 uv,float depth){
        vec4 p=projectionInverse*vec4(uv*2.-1.,depth*2.-1.,1.);
        return p.xyz/p.w;
      }
      float perceptualLuma(vec3 color){
        float luma=dot(max(color,vec3(0.)),vec3(.2126,.7152,.0722));
        return sqrt(luma/(1.+luma));
      }
      vec3 resolveEdges(vec3 center){
        vec2 texel=1./resolution;
        vec3 nw=texture2D(colorMap,vUv+vec2(-1.,1.)*texel).rgb;
        vec3 ne=texture2D(colorMap,vUv+vec2(1.,1.)*texel).rgb;
        vec3 sw=texture2D(colorMap,vUv+vec2(-1.,-1.)*texel).rgb;
        vec3 se=texture2D(colorMap,vUv+vec2(1.,-1.)*texel).rgb;
        float m=perceptualLuma(center),a=perceptualLuma(nw),b=perceptualLuma(ne);
        float c=perceptualLuma(sw),d=perceptualLuma(se);
        float low=min(m,min(min(a,b),min(c,d)));
        float high=max(m,max(max(a,b),max(c,d)));
        // Leave texture grain, seams and low-contrast details completely sharp.
        if(high-low<max(.035,high*.105))return center;
        vec2 direction=vec2(-((a+b)-(c+d)),(a+c)-(b+d));
        float reduce=max((a+b+c+d)*(.25*.125),.0078125);
        float inverse=1./(min(abs(direction.x),abs(direction.y))+reduce);
        direction=clamp(direction*inverse,vec2(-4.),vec2(4.))*texel;
        vec3 inner=.5*(texture2D(colorMap,vUv-direction/6.).rgb+
                         texture2D(colorMap,vUv+direction/6.).rgb);
        vec3 outer=inner*.5+.25*(texture2D(colorMap,vUv-direction*.5).rgb+
                                  texture2D(colorMap,vUv+direction*.5).rgb);
        float resolvedLuma=perceptualLuma(outer);
        return resolvedLuma<low||resolvedLuma>high?inner:outer;
      }
      float contactShade(float depth){
        if(depth>=.99998)return 1.;
        vec2 texel=1./resolution;
        vec3 p=viewPosition(vUv,depth);
        float left=texture2D(depthMap,vUv-vec2(texel.x,0.)).r;
        float right=texture2D(depthMap,vUv+vec2(texel.x,0.)).r;
        float down=texture2D(depthMap,vUv-vec2(0.,texel.y)).r;
        float up=texture2D(depthMap,vUv+vec2(0.,texel.y)).r;
        // Pick a neighbor on the same surface rather than differentiating
        // across a frame silhouette or the sky behind the yacht.
        vec3 dx=abs(right-depth)<abs(left-depth)?
          viewPosition(vUv+vec2(texel.x,0.),right)-p:
          p-viewPosition(vUv-vec2(texel.x,0.),left);
        vec3 dy=abs(up-depth)<abs(down-depth)?
          viewPosition(vUv+vec2(0.,texel.y),up)-p:
          p-viewPosition(vUv-vec2(0.,texel.y),down);
        vec3 normal=cross(dx,dy);
        if(dot(normal,normal)<.0000000001)return 1.;
        normal=normalize(normal);
        if(dot(normal,-p)<0.)normal=-normal;
        const float radius=.34;
        float pixels=clamp(radius*projectionScale*resolution.y/max(-p.z,.1)*.5,1.5,18.);
        float occlusion=0.;
        // A deterministic two-radius kernel has no screen-space random grain.
        for(int i=0;i<8;i++){
          float fi=float(i),angle=(fi+.375)*.785398163;
          float ring=mix(.48,.94,mod(fi,2.));
          vec2 uv=vUv+vec2(cos(angle),sin(angle))*pixels*ring*texel;
          if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.))))continue;
          float d=texture2D(depthMap,uv).r;
          if(d>=.99998)continue;
          vec3 delta=viewPosition(uv,d)-p;
          float distance=length(delta),height=dot(delta,normal);
          // Nearby geometry above the local surface casts subtle contact shade.
          // The short radius and range gate avoid broad black window halos.
          float range=1.-smoothstep(radius*.18,radius,distance);
          float facing=max(height/max(distance,.001)-.15,0.);
          occlusion+=facing*range*smoothstep(.014,.055,height);
        }
        return max(.80,1.-occlusion*.125*strength*2.2);
      }
      void main(){
        vec3 center=texture2D(colorMap,vUv).rgb;
        vec3 color=resolveEdges(center);
        color*=contactShade(texture2D(depthMap,vUv).r);
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  });
  const screen=new THREE.Scene(),screenCamera=new THREE.Camera();
  screen.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),material));
  const bufferSize=new THREE.Vector2();
  function resize(){
    renderer.getDrawingBufferSize(bufferSize);
    target.setSize(bufferSize.x,bufferSize.y);
    uniforms.resolution.value.copy(bufferSize);
  }
  resize();
  return{resize,render(scene,camera,interior=false){
    if(!interior){renderer.render(scene,camera);return;}
    uniforms.projectionInverse.value.copy(camera.projectionMatrixInverse);
    uniforms.projectionScale.value=camera.projectionMatrix.elements[5];
    renderer.setRenderTarget(target);
    renderer.clear();
    renderer.render(scene,camera);
    renderer.setRenderTarget(null);
    renderer.render(screen,screenCamera);
  }};
}
