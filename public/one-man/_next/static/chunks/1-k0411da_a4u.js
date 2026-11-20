(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,74300,e=>{"use strict";var t=e.i(43476),r=e.i(71645),n=e.i(75056),u=e.i(98903),a=e.i(38408),i=e.i(47071),o=e.i(90072),l=e.i(74491);let s=`
uniform float uBend;uniform vec2 uPointer;varying vec2 vUv;varying vec3 vView;
void main(){vUv=uv;vec3 p=position;
float curl=sin(uv.x*3.14159265)*uBend;
p.z+=curl*.38;
p.y+=curl*.09+sin(uv.x*6.2831853)*uPointer.y*.025;
p.x+=sin(uv.y*3.14159265)*uPointer.x*.035;
vec4 view=modelViewMatrix*vec4(p,1.);vView=view.xyz;gl_Position=projectionMatrix*view;}`,v=`
uniform sampler2D uMapA;uniform sampler2D uMapB;uniform vec2 uCropA;uniform vec2 uCropB;uniform float uBlend;uniform float uBend;
varying vec2 vUv;varying vec3 vView;
void main(){
vec2 a=(vUv-.5)*uCropA+.5;vec2 b=(vUv-.5)*uCropB+.5;
float edge=uBlend*1.24-.12;
float wave=sin(vUv.y*6.2831853+uBlend*3.14159265)*sin(uBlend*3.14159265)*.045;
float mask=1.-smoothstep(edge-.018,edge+.018,vUv.x+wave);
vec3 c=mix(texture2D(uMapA,a).rgb,texture2D(uMapB,b).rgb,mask);
vec3 n=normalize(cross(dFdx(vView),dFdy(vView)));
float lighting=.88+.12*max(dot(n,normalize(vec3(-.25,.4,1.))),0.);
float ridge=exp(-abs(vUv.x+wave-edge)*85.)*sin(uBlend*3.14159265)*.025;
gl_FragColor=vec4(c*lighting+ridge*vec3(.8,.35,.55),1.);
#include <colorspace_fragment>
}`;function c({motion:e,onReady:n}){let d=(0,i.f)(l.f.map(e=>e.image)),{viewport:f,size:p,gl:m}=(0,a.f)(),h=(0,r.useMemo)(()=>d.map(e=>(e.colorSpace=o.nj,e.needsUpdate=!0,e)),[d]),g=(0,r.useMemo)(()=>new o.CQ(1,1,p.width<700?32:56,24),[p.width]),w=(0,r.useMemo)(()=>h.map(e=>{let t=e.image,r=t.width/t.height,n=f.width/f.height;return new o.wq(r>n?n/r:1,r<n?r/n:1)}),[h,f.width,f.height]),x=(0,r.useMemo)(()=>({uMapA:{value:h[0]},uMapB:{value:h[1]},uCropA:{value:new o.wq(1,1)},uCropB:{value:new o.wq(1,1)},uBlend:{value:0},uBend:{value:0},uPointer:{value:new o.wq}}),[h]),y=(0,r.useMemo)(()=>new o.Zg({vertexShader:s,fragmentShader:v,uniforms:x,side:o.Vs,toneMapped:!1}),[x]),B=(0,r.useRef)(null),M=(0,r.useRef)(!1);return(0,r.useEffect)(()=>()=>g.dispose(),[g]),(0,r.useEffect)(()=>()=>y.dispose(),[y]),(0,u.f)(()=>{let t=e.current,r=o.rB.clamp(t.cursor,0,h.length-1),u=Math.floor(r),a=Math.min(u+1,h.length-1),i=o.rB.smoothstep(r-u,.12,.88);x.uMapA.value=h[u],x.uMapB.value=h[a],x.uCropA.value.copy(w[u]),x.uCropB.value.copy(w[a]),x.uBlend.value=i,x.uBend.value=1.15*Math.sin(i*Math.PI)+.25*Math.hypot(t.x,t.y),x.uPointer.value.set(t.x,t.y),B.current&&(B.current.scale.set(.97*f.width,.94*f.height,Math.min(f.width,f.height)),B.current.rotation.set(-(.13*t.y),.18*t.x,0)),m.domElement.dataset.warpCursor=r.toFixed(2),m.domElement.dataset.warpBend=x.uBend.value.toFixed(2),M.current||(M.current=!0,queueMicrotask(n))}),(0,t.jsx)("mesh",{ref:B,geometry:g,material:y,frustumCulled:!1})}e.s(["default",0,function({motion:e,playing:u,onReady:a,onFailure:i}){let o=(0,r.useRef)(null);return(0,r.useEffect)(()=>()=>{o.current?.()},[]),(0,t.jsx)(n.f,{orthographic:!0,camera:{position:[0,0,8],zoom:100,near:.1,far:30},dpr:[1,1.5],frameloop:u?"always":"demand",gl:{alpha:!0,antialias:!1,powerPreference:"low-power"},onCreated:({gl:e})=>{let t=e=>{e.preventDefault(),i()};e.domElement.addEventListener("webglcontextlost",t),o.current=()=>e.domElement.removeEventListener("webglcontextlost",t),e.setClearColor("#080808",0),e.debug.onShaderError=()=>queueMicrotask(i)},children:(0,t.jsx)(r.Suspense,{fallback:null,children:(0,t.jsx)(c,{motion:e,onReady:a})})})}])},73143,function(e){e.n(e.i(74300))},47071,e=>{"use strict";var t=e.i(71645),r=e.i(90072),n=e.i(38408),u=e.i(19419);let a=e=>e===Object(e)&&!Array.isArray(e)&&"function"!=typeof e;function i(e,i){let o=(0,n.f)(e=>e.gl),l=(0,u.f)(r.H5,a(e)?Object.values(e):e);return(0,t.useLayoutEffect)(()=>{null==i||i(l)},[i]),(0,t.useEffect)(()=>{if("initTexture"in o){let e=[];Array.isArray(l)?e=l:l instanceof r.Sk?e=[l]:a(l)&&(e=Object.values(l)),e.forEach(e=>{e instanceof r.Sk&&o.initTexture(e)})}},[o,l]),(0,t.useMemo)(()=>{if(!a(e))return l;{let t={},r=0;for(let n in e)t[n]=l[r++];return t}},[e,l])}i.preload=e=>u.f.preload(r.H5,e),i.clear=e=>u.f.clear(r.H5,e),e.s(["f",0,i])}]);