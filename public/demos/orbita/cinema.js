'use strict';

// Movement supports the film and never delays the ticket flow.
(() => {
  const scene=document.querySelector('.cinema-stage');
  const canvas=document.querySelector('.cinema-dust');
  const context=canvas.getContext('2d');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
  const dock=document.querySelector('.booking-dock');
  const progress=document.querySelector('.reading-progress');
  let sceneVisible=true,frame=0,lastDraw=0,sceneWidth=0,sceneHeight=0,scale=1;
  let pointerX=0,pointerY=0,scrollOffset=0,scrollFrame=0,pointerFrame=0;
  const particles=Array.from({length:34},()=>({x:Math.random(),y:Math.random(),radius:.4+Math.random()*1.1,speed:3+Math.random()*6,opacity:.08+Math.random()*.3,phase:Math.random()*Math.PI*2}));

  function resize(){
    sceneWidth=scene.clientWidth;sceneHeight=scene.clientHeight;scale=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(sceneWidth*scale);canvas.height=Math.round(sceneHeight*scale);context.setTransform(scale,0,0,scale,0,0);
  }
  function moveScene(){
    pointerFrame=0;
    scene.style.setProperty('--scene-x',motion.matches?'0px':`${pointerX.toFixed(2)}px`);
    scene.style.setProperty('--scene-y',motion.matches?'0px':`${(pointerY+scrollOffset).toFixed(2)}px`);
  }
  function draw(time){
    frame=0;if(!sceneVisible||document.hidden||motion.matches)return;
    if(time-lastDraw>=33){
      const elapsed=lastDraw?Math.min((time-lastDraw)/1000,.1):0;lastDraw=time;
      context.clearRect(0,0,sceneWidth,sceneHeight);
      for(const particle of particles){
        particle.y-=particle.speed*elapsed/sceneHeight;
        if(particle.y<0){particle.y=1;particle.x=Math.random();}
        const x=particle.x*sceneWidth+Math.sin(time*.0002+particle.phase)*12;
        const y=particle.y*sceneHeight;
        context.beginPath();context.arc(x,y,particle.radius,0,Math.PI*2);
        context.fillStyle=`rgba(255,211,143,${particle.opacity})`;context.fill();
      }
    }
    frame=requestAnimationFrame(draw);
  }
  function updateMotion(){
    if(motion.matches||!sceneVisible||document.hidden){cancelAnimationFrame(frame);frame=0;lastDraw=0;context.clearRect(0,0,sceneWidth,sceneHeight);}
    else if(!frame)frame=requestAnimationFrame(draw);
    if(motion.matches){pointerX=0;pointerY=0;scrollOffset=0;moveScene();}
  }
  function scrollUpdates(){
    scrollFrame=0;
    const distance=document.documentElement.scrollHeight-innerHeight;
    progress.style.setProperty('--read-progress',distance>0?String(Math.min(scrollY/distance,1)):'0');
    if(sceneVisible&&!motion.matches){scrollOffset=Math.min(scrollY*.075,45);moveScene();}
  }
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollUpdates);},{passive:true});
  scene.addEventListener('pointermove',event=>{
    if(!finePointer.matches||motion.matches)return;
    const rect=scene.getBoundingClientRect();pointerX=((event.clientX-rect.left)/rect.width-.5)*-13;pointerY=((event.clientY-rect.top)/rect.height-.5)*-8;
    if(!pointerFrame)pointerFrame=requestAnimationFrame(moveScene);
  },{passive:true});
  scene.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;if(!pointerFrame)pointerFrame=requestAnimationFrame(moveScene);});
  document.addEventListener('visibilitychange',updateMotion);
  motion.addEventListener('change',updateMotion);
  new ResizeObserver(()=>{resize();scrollUpdates();}).observe(scene);

  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>{sceneVisible=entries[0].isIntersecting;updateMotion();},{threshold:0}).observe(scene);
    new IntersectionObserver(entries=>{
      const entry=entries[0],visible=!entry.isIntersecting&&entry.boundingClientRect.bottom<100;
      dock.classList.toggle('is-visible',visible);dock.setAttribute('aria-hidden',String(!visible));dock.inert=!visible;
    },{threshold:0,rootMargin:'-85px 0px 0px 0px'}).observe(document.querySelector('.quick-booking'));
    const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('cinema-visible');reveal.unobserve(entry.target);}}),{threshold:.12});
    document.querySelectorAll('.program-section,.experience-section,.events-section,.club-section,.info-section').forEach(section=>reveal.observe(section));
  }
  let posterFrame=0;
  document.addEventListener('pointermove',event=>{
    if(motion.matches||!finePointer.matches||posterFrame)return;
    const poster=event.target.closest('.film-poster');if(!poster)return;
    const rect=poster.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
    posterFrame=requestAnimationFrame(()=>{
      poster.style.setProperty('--tilt-x',`${((.5-y)*4).toFixed(2)}deg`);poster.style.setProperty('--tilt-y',`${((x-.5)*5).toFixed(2)}deg`);
      poster.style.setProperty('--shine-x',`${Math.round(x*100)}%`);poster.style.setProperty('--shine-y',`${Math.round(y*100)}%`);posterFrame=0;
    });
  },{passive:true});
  document.addEventListener('pointerout',event=>{
    const poster=event.target.closest('.film-poster');if(!poster||poster.contains(event.relatedTarget))return;
    poster.style.setProperty('--tilt-x','0deg');poster.style.setProperty('--tilt-y','0deg');
  });
  resize();updateMotion();scrollUpdates();
})();
