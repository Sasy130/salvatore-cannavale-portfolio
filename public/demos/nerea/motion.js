'use strict';
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
 const body=document.body, hero=document.querySelector('[data-hero]'),journey=document.querySelector('[data-journey]');
 const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
 const reading=document.querySelector('[data-reading]');
 let words=[];
 if(reading){const content=reading.textContent.trim();reading.replaceChildren();content.split(/\s+/).forEach((word,i)=>{if(i)reading.append(' ');const span=document.createElement('span');span.className='word';span.textContent=word;reading.append(span);words.push(span);});}
 if(!reduced.matches)body.classList.add('motion-ready');
 const progress=document.querySelector('.reading-progress'),header=document.querySelector('.site-header');
 const parallaxes=[...document.querySelectorAll('[data-parallax]')];
 let scheduled=false;
 function scrollFrame(){
  scheduled=false;const y=scrollY,vh=innerHeight,max=document.documentElement.scrollHeight-vh;
  progress.style.transform=`scaleX(${max>0?y/max:0})`;header.classList.toggle('scrolled',y>45);
  if(reduced.matches)return;
  if(hero){const r=hero.getBoundingClientRect();if(r.bottom>-100)hero.style.setProperty('--hero-progress',clamp(-r.top/r.height).toFixed(4));}
  if(reading){const r=reading.getBoundingClientRect();if(r.top<vh&&r.bottom>0){const p=clamp((vh*.88-r.top)/(r.height+vh*.28));words.forEach((el,i)=>el.classList.toggle('is-read',p>i/(words.length+1)));}}
  if(journey){const r=journey.getBoundingClientRect();if(r.top<vh&&r.bottom>0){const p=clamp(-r.top/Math.max(1,r.height-vh));const expand=smooth(0,.65,p);journey.style.setProperty('--journey-progress',p.toFixed(4));journey.style.setProperty('--inset-y',`${12*(1-expand)}%`);journey.style.setProperty('--inset-x',`${(innerWidth<540?13:24)*(1-expand)}%`);journey.style.setProperty('--curve',`${240*(1-expand)}px`);journey.style.setProperty('--scene-one',(1-smooth(.17,.4,p)).toFixed(4));journey.style.setProperty('--scene-two',smooth(.4,.68,p).toFixed(4));}}
  parallaxes.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<vh&&r.bottom>0){const p=clamp((vh-r.top)/(vh+r.height));el.style.setProperty('--parallax-y',`${-2-p*9}%`);}});
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(scrollFrame);}}
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',()=>{body.classList.toggle('motion-ready',!reduced.matches);schedule();});scrollFrame();
 const motionEls=[...document.querySelectorAll('.motion-in')];
 if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}});},{threshold:.13});motionEls.forEach(el=>io.observe(el));}else motionEls.forEach(el=>el.classList.add('is-visible'));
 // Keep navigation native; use cross-document View Transitions where supported.
 // The curtain supplies the same visual continuity for browsers without it.
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||a.target||a.hasAttribute('download')||reduced.matches)return;const url=new URL(a.href,location.href);if(url.origin!==location.origin||url.pathname===location.pathname||!url.pathname.endsWith('.html'))return;if('onpageswap' in window)return;e.preventDefault();body.classList.add('is-leaving');setTimeout(()=>location.assign(url.href),480);});
 addEventListener('pageshow',()=>body.classList.remove('is-leaving'));
 // Product changes retain the focus on the filter while the new selection enters.
 if(typeof renderProducts==='function'){const original=renderProducts;renderProducts=function(){original();if(reduced.matches)return;document.querySelectorAll('#product-grid .product-card').forEach((el,i)=>el.animate([{opacity:0,transform:'translateY(22px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,delay:i*65,easing:'cubic-bezier(.2,.8,.2,1)',fill:'backwards'}));};}
 const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#mobile-nav');
 if(menu&&nav){const setMenu=()=>{const open=menu.getAttribute('aria-expanded')==='true';body.classList.toggle('menu-open',open);document.querySelector('main').inert=open;document.querySelector('footer').inert=open;};new MutationObserver(setMenu).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});document.addEventListener('keydown',e=>{if(e.key!=='Tab'||menu.getAttribute('aria-expanded')!=='true')return;const items=[menu,...nav.querySelectorAll('a')],first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});}
 const orbit=document.querySelector('.pointer-orbit');
 if(finePointer.matches&&!reduced.matches&&orbit){let px=-100,py=-100,tx=-100,ty=-100,hover=false,cursorFrame=0;
  function drawCursor(){px+=(tx-px)*.22;py+=(ty-py)*.22;const size=hover?86:65;orbit.style.transform=`translate3d(${px-size/2}px,${py-size/2}px,0)`;if(Math.abs(tx-px)+Math.abs(ty-py)>.2)cursorFrame=requestAnimationFrame(drawCursor);else cursorFrame=0;}
  addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;tx=e.clientX;ty=e.clientY;hover=!!e.target.closest('[data-detail],.hero-medallion,.kitchen-invitation a');orbit.classList.toggle('is-hover',hover);if(!cursorFrame)cursorFrame=requestAnimationFrame(drawCursor);},{passive:true});
  document.querySelectorAll('.magnetic,.round-link').forEach(el=>{el.addEventListener('pointermove',e=>{if(e.pointerType==='touch'||reduced.matches)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)*.1,y=(e.clientY-r.top-r.height/2)*.1;el.style.translate=`${x}px ${y}px`;});el.addEventListener('pointerleave',()=>{el.style.translate='0px 0px';});});
 }
 if(!hero||reduced.matches)return;
 // A single lightweight WebGL plane refracts the photograph like a water surface.
 // The static photograph remains visible if the context cannot be created.
 const canvas=document.querySelector('#sea-canvas'),source=document.querySelector('#liquid-source'),surface=document.querySelector('.liquid-surface');
 let gl;try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});}catch{return;}if(!gl)return;
 const vertex=`attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
 const fragment=`precision mediump float;varying vec2 v_uv;uniform sampler2D u_texture;uniform vec2 u_resolution;uniform vec2 u_image;uniform vec2 u_pointer;uniform float u_time;uniform float u_energy;
 void main(){vec2 uv=v_uv;float screen=u_resolution.x/u_resolution.y;float image=u_image.x/u_image.y;if(screen>image){uv.y=(uv.y-.5)*(image/screen)+.5;}else{float sx=screen/image;uv.x=(uv.x-.5)*sx+.5+(1.-sx)*.12;}
 vec2 aspect=vec2(screen,1.);float distance=length((v_uv-u_pointer)*aspect);float ripple=sin(distance*38.-u_time*2.2)*exp(-distance*5.)*(.0025+u_energy*.013);float wave=sin(uv.y*12.+u_time*.45)*cos(uv.x*10.-u_time*.3)*.0017;uv+=vec2(wave+ripple,cos(uv.x*15.+u_time*.35)*.0012+ripple*.6);uv=clamp(uv,.002,.998);vec3 color=texture2D(u_texture,uv).rgb;float light=1.+sin(uv.y*18.-u_time*.45)*.007;gl_FragColor=vec4(color*light,1.);}`;
 function shader(type,text){const s=gl.createShader(type);gl.shaderSource(s,text);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
 const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs)return;
 const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;gl.useProgram(program);
 const position=gl.getAttribLocation(program,'a_position'),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
 const loc={};['u_texture','u_resolution','u_image','u_pointer','u_time','u_energy'].forEach(n=>loc[n]=gl.getUniformLocation(program,n));
 let pointer={x:.65,y:.6},target={x:.65,y:.6},energy=0,active=true,raf=0,last=0,ready=false;
 function resize(){const r=hero.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,innerWidth<800?1.2:1.5);canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(loc.u_resolution,canvas.width,canvas.height);}
 function loop(t){raf=0;if(!ready||!active||document.hidden||reduced.matches)return;if(t-last>=32){last=t;pointer.x+=(target.x-pointer.x)*.1;pointer.y+=(target.y-pointer.y)*.1;energy*=.95;gl.uniform2f(loc.u_pointer,pointer.x,pointer.y);gl.uniform1f(loc.u_time,t*.001);gl.uniform1f(loc.u_energy,energy);gl.drawArrays(gl.TRIANGLES,0,6);}raf=requestAnimationFrame(loop);}
 function start(){if(ready&&active&&!document.hidden&&!reduced.matches&&!raf)raf=requestAnimationFrame(loop);}
 function upload(){if(!source.naturalWidth)return;const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,source);gl.uniform1i(loc.u_texture,0);gl.uniform2f(loc.u_image,source.naturalWidth,source.naturalHeight);resize();ready=true;surface.classList.add('webgl-ready');surface.dataset.renderer='webgl';start();}
 if(source.complete)upload();else source.addEventListener('load',upload,{once:true});
 hero.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;const r=hero.getBoundingClientRect();const x=(e.clientX-r.left)/r.width,y=1-(e.clientY-r.top)/r.height;energy=clamp(energy+Math.abs(target.x-x)+Math.abs(target.y-y),0,1);target={x,y};},{passive:true});
 hero.addEventListener('pointerleave',()=>{target={x:.65,y:.6};energy=.12;});
 addEventListener('resize',resize,{passive:true});document.addEventListener('visibilitychange',start);reduced.addEventListener('change',start);
 if('IntersectionObserver' in window)new IntersectionObserver(entries=>{active=entries[0].isIntersecting;start();},{rootMargin:'100px'}).observe(hero);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready=false;surface.classList.remove('webgl-ready');surface.dataset.renderer='image';if(raf)cancelAnimationFrame(raf);});
})();
