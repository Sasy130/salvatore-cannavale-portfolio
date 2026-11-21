import gsap from 'gsap';
const $=selector=>document.querySelector(selector);
export function augmentTimeline(timeline,mobile){
 timeline.to('.portal-echo',{scale:1.8,rotation:mobile?0:-7,xPercent:12,opacity:0,stagger:.11,duration:1.4,ease:'power2.in'},.1)
 .to('.floating-memory',{yPercent:-65,xPercent:30,rotation:15,autoAlpha:0,duration:.9},.1)
 .to('.floor-grid',{yPercent:50,autoAlpha:0,duration:1.4},0)
 .fromTo('.spatial-word',{xPercent:30,autoAlpha:0},{xPercent:-5,autoAlpha:.22,duration:.7},1.6)
 .to('.spatial-word',{xPercent:-40,autoAlpha:0,duration:1.3},2.6)
;
 if(!mobile)timeline.fromTo('.threshold-frames i',{scale:.55,opacity:0,rotation:mobile?0:7},{scale:1.2,opacity:.7,rotation:0,stagger:.1,duration:.65,ease:'power2.inOut'},2.75)
 .to('.threshold-frames i',{scale:3,opacity:0,stagger:.09,duration:1.25,ease:'power2.in'},3.3);
}
export function initExperience({isMotion}){
 if(isMotion())gsap.fromTo('.hero-line>span',{yPercent:110,rotation:3},{yPercent:0,rotation:0,stagger:.12,duration:1.15,delay:.3,ease:'power4.out'});
 const cleanup=[];
 function on(node,type,fn,options){node.addEventListener(type,fn,options);cleanup.push(()=>node.removeEventListener(type,fn,options))}
 const fine=matchMedia('(hover: hover) and (pointer: fine)'),tilt=$('.portal-tilt');
 const rotateX=gsap.quickTo(tilt,'rotationX',{duration:1.2,ease:'power3.out'}),rotateY=gsap.quickTo(tilt,'rotationY',{duration:1.2,ease:'power3.out'});
 let pointerActive=false;
 on($('.cinema'),'pointermove',event=>{
  if(!fine.matches||!isMotion()||scrollY>innerHeight*.3)return;
  pointerActive=true;rotateX((.5-event.clientY/innerHeight)*3);rotateY((event.clientX/innerWidth-.5)*5);
 });
 function resetPointer(){if(pointerActive){pointerActive=false;rotateX(0);rotateY(0)}}
 function updateChapter(){
  if(scrollY>innerHeight*.3)resetPointer();
  const progress=scrollY/Math.max(1,$('.journey').offsetHeight-innerHeight);
  $('.nav').classList.toggle('over-scene',isMotion()&&scrollY>innerHeight*.18&&progress<1);
  $('#nav-chapter').textContent=progress<.13?'00 — L’ARRIVO':progress<.33?'01 — LA DIMORA':progress<.56?'02 — L’INTIMITÀ':progress<1?'03 — IL TEMPO':'04 — IL TUO SOGGIORNO';
 }
 on($('.cinema'),'pointerleave',resetPointer);on(window,'scroll',updateChapter,{passive:true});updateChapter();
 const manifest=$('.manifesto-strip');
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>manifest.classList.toggle('in-view',entry.isIntersecting&&isMotion())),{threshold:.1});
 observer.observe(manifest);
 return {setAssets(){},destroy(){cleanup.forEach(fn=>fn());observer.disconnect();rotateX.tween.kill();rotateY.tween.kill();gsap.killTweensOf('.hero-line>span')}};
}
