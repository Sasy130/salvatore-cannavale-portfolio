import gsap from 'gsap';
const $=s=>document.querySelector(s);
const previewLabels={living:'01 / LA DIMORA',bedroom:'02 / L’INTIMITÀ',terrace:'03 / IL TEMPO',detail:'04 / LA FILOSOFIA'};
export function augmentTimeline(tl,mobile){
 tl.to('.portal-echo',{scale:1.8,rotation:mobile?0:-7,xPercent:12,opacity:0,stagger:.11,duration:1.4,ease:'power2.in'},.1)
 .to('.floating-memory',{yPercent:-65,xPercent:30,rotation:15,autoAlpha:0,duration:.9},.1)
 .to('.hero-seal',{rotation:65,scale:.7,autoAlpha:0,duration:1},0)
 .to('.floor-grid',{yPercent:50,autoAlpha:0,duration:1.4},0)
 .fromTo('.spatial-word',{xPercent:30,autoAlpha:0},{xPercent:-5,autoAlpha:.22,duration:.7},1.6)
 .to('.spatial-word',{xPercent:-40,autoAlpha:0,duration:1.3},2.6)
 .fromTo('.threshold-frames i',{scale:.55,opacity:0,rotation:mobile?0:7},{scale:1.2,opacity:.7,rotation:0,stagger:.1,duration:.65,ease:'power2.inOut'},2.75)
 .to('.threshold-frames i',{scale:3,opacity:0,stagger:.09,duration:1.25,ease:'power2.in'},3.3);
}
export function initExperience({goScene,isMotion,openGallery}){
 const dialog=$('#explore-menu'),toggle=$('.explore-toggle'),close=$('.menu-close');
 let assets={living:'/demos/dimora-mia/assets/living.webp',bedroom:'/demos/dimora-mia/assets/bedroom.webp',terrace:'/demos/dimora-mia/assets/terrace.webp',detail:'/demos/dimora-mia/assets/detail.webp'},savedOverflow='',opener=null,transition=null,previewKey='living',previewVersion=0;
 if(isMotion())gsap.fromTo('.hero-line>span',{yPercent:110,rotation:3},{yPercent:0,rotation:0,stagger:.12,duration:1.25,delay:.4,ease:'power4.out'});
 const cleanup=[];function on(node,type,fn,options){node.addEventListener(type,fn,options);cleanup.push(()=>node.removeEventListener(type,fn,options))}
 function open(){if(dialog.open)return;opener=document.activeElement;savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();toggle.setAttribute('aria-expanded','true');if(isMotion()){gsap.fromTo(dialog,{clipPath:'inset(0% 0% 100% 0% round 0 0 40% 0)'},{clipPath:'inset(0% 0% 0% 0% round 0)',duration:.65,ease:'power3.inOut'});gsap.fromTo('.chapter-menu>a,.chapter-menu>button',{y:45,opacity:0},{y:0,opacity:1,stagger:.055,duration:.55,delay:.18,ease:'power3.out'});gsap.fromTo('.menu-photo',{y:65,rotation:-5,scale:.9},{y:0,rotation:0,scale:1,duration:.85,ease:'power3.out'})}close.focus({preventScroll:true})}
 function dismiss(){if(!dialog.open)return;transition?.kill();gsap.killTweensOf(dialog);dialog.close()}
 on(toggle,'click',open);on(close,'click',dismiss);on(dialog,'close',()=>{document.body.style.overflow=savedOverflow;toggle.setAttribute('aria-expanded','false');opener?.focus({preventScroll:true});gsap.set(dialog,{clearProps:'clipPath'})});
 async function preview(key){if(!key||key===previewKey)return;previewKey=key;const version=++previewVersion,img=$('#menu-preview-next');const preload=new Image();preload.src=assets[key];try{await preload.decode()}catch{return}if(version!==previewVersion)return;img.src=preload.src;$('#menu-preview-label').textContent=previewLabels[key];transition?.kill();if(!isMotion()){$('#menu-preview').src=preload.src;gsap.set(img,{opacity:0});return}transition=gsap.fromTo(img,{opacity:0,scale:1.09},{opacity:1,scale:1,duration:.5,ease:'power2.out',onComplete:()=>{if(version!==previewVersion)return;$('#menu-preview').src=preload.src;gsap.set(img,{opacity:0})}})}
 dialog.querySelectorAll('[data-preview]').forEach(link=>{on(link,'pointerenter',()=>preview(link.dataset.preview));on(link,'focus',()=>preview(link.dataset.preview))});
 dialog.querySelectorAll('a').forEach(a=>on(a,'click',e=>{e.preventDefault();dismiss();if(a.dataset.jump){goScene(+a.dataset.jump)}else{document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:isMotion()?'smooth':'instant'})}}));
 on($('[data-menu-gallery]'),'click',()=>{dismiss();openGallery()});
 // A restrained perspective response on fine pointers; scroll continues to own the outer camera.
 const fine=matchMedia('(hover: hover) and (pointer: fine)'),tilt=$('.portal-tilt');
 const rotateX=gsap.quickTo(tilt,'rotationX',{duration:1.2,ease:'power3.out'}),rotateY=gsap.quickTo(tilt,'rotationY',{duration:1.2,ease:'power3.out'});
 let pointerActive=false;on($('.cinema'),'pointermove',e=>{if(!fine.matches||!isMotion()||scrollY>innerHeight*.3)return;pointerActive=true;rotateX((.5-e.clientY/innerHeight)*3);rotateY((e.clientX/innerWidth-.5)*5)});
 const resetPointer=()=>{if(!pointerActive)return;pointerActive=false;rotateX(0);rotateY(0)};on($('.cinema'),'pointerleave',resetPointer);on(window,'scroll',()=>{if(scrollY>innerHeight*.3)resetPointer();const p=scrollY/Math.max(1,$('.journey').offsetHeight-innerHeight),inScene=scrollY>innerHeight*.18&&p<1;$('.nav').classList.toggle('over-scene',inScene);$('#nav-chapter').textContent=p<.13?'00 — L’ARRIVO':p<.33?'01 — LA DIMORA':p<.56?'02 — L’INTIMITÀ':p<1?'03 — IL TEMPO':'04 — IL TUO SOGGIORNO'},{passive:true});
 const manifest=$('.manifesto-strip');let observer;if(manifest){observer=new IntersectionObserver(entries=>entries.forEach(e=>manifest.classList.toggle('in-view',e.isIntersecting&&isMotion())),{threshold:.1});observer.observe(manifest)}
 return {setAssets(next){assets={...assets,...next};$('#menu-preview').src=assets[previewKey]},destroy(){cleanup.forEach(fn=>fn());observer?.disconnect();transition?.kill();rotateX.tween.kill();rotateY.tween.kill();gsap.killTweensOf([dialog,'.chapter-menu>a','.chapter-menu>button','.menu-photo']);dismiss()}};
}
