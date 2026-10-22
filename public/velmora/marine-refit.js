import * as THREE from './vendor/three.module.js';
import {deckOutline,buildDeck} from './architecture.js';

export function buildMarineRefit(ctx){
  const {boat,add,box,soft,cylinder,line,white,paint,teak,wood,chrome,bronze,glass,black,marble,warm}=ctx;
  // Every straight panel and its handrail use the same endpoints. No unsupported curved gaps.
  function guard(points,floor){
    const y=floor+1.1;
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.008)continue;
      const pane=box(len,.94,.018,glass,(a[0]+b[0])/2,floor+.58,(a[1]+b[1])/2);pane.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);pane.castShadow=false;
      const top=add(new THREE.CylinderGeometry(.022,.022,len,8),chrome,(a[0]+b[0])/2,y,(a[1]+b[1])/2);top.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(b[0]-a[0],0,b[1]-a[1]).normalize());
      if(i%5===0||i===points.length-2)line([[a[0],floor+.02,a[1]],[a[0],y,a[1]]],chrome,.017);
    }
  }
  // Full bow returns and protected stair wells; only the aft stair mouths stay open.
  for(const [cx,rx,beam,aft,floor,notch] of [[-6.25,2.82,2.98,10,4.533,[8.7,-1.95,-1.15]],[-4.65,2.21,2.44,4.4,7.223,[3.25,.65,1.45]]]){
    const raw=deckOutline(cx,rx,beam,aft,.09).getPoints(28).map(p=>[p.x,-p.y]),points=[];
    for(let i=0;i<raw.length-1;i++){const a=raw[i],b=raw[i+1];points.push(a);if(Math.abs(a[0]-(aft-.09))<.01&&Math.abs(b[0]-a[0])<.01){const cuts=[notch[1]-.07,notch[2]+.07].filter(z=>z>Math.min(a[1],b[1])&&z<Math.max(a[1],b[1])).sort((x,y)=>(x-y)*Math.sign(b[1]-a[1]));for(const z of cuts)points.push([a[0],z]);}}
    points.push(raw[raw.length-1]);let run=[];
    for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],z=(a[1]+b[1])/2;const mouth=Math.abs((a[0]+b[0])/2-(aft-.09))<.01&&z>notch[1]-.07&&z<notch[2]+.07;if(mouth){if(run.length>1)guard(run,floor);run=[];}else{if(!run.length)run.push(a);run.push(b);}}if(run.length>1)guard(run,floor);
  }

  function stair(startX,endX,z,floor,top,count,width){
    const rise=(top-floor)/count,run=(startX-endX)/(count-1);
    for(let i=0;i<count;i++){
      const x=startX-i*run,y=floor+(i+1)*rise;
      soft(run+.035,.10,width,teak,x,y-.05,z,.022);
      box(.055,rise,width-.04,white,x+run*.45,y-rise*.5-.07,z);
      line([[x+run*.45,y+.008,z-width*.42],[x+run*.45,y+.008,z+width*.42]],warm,.007).castShadow=false;
      if(i%3===0||i===count-1)for(const s of [-1,1])line([[x,y,z+s*(width*.5+.035)],[x,y+1.08,z+s*(width*.5+.035)]],chrome,.016);
    }
    for(const s of [-1,1]){const a=new THREE.Vector3(startX,floor+.06,z+s*width*.4),b=new THREE.Vector3(endX,top-.08,z+s*width*.4),d=b.clone().sub(a);const stringer=soft(.10,d.length(),.09,white,(a.x+b.x)*.5,(a.y+b.y)*.5,a.z,.025);stringer.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());line([[startX,floor+rise+1.08,z+s*(width*.5+.035)],[endX,top+1.08,z+s*(width*.5+.035)]],chrome,.022);}
  }
  stair(12.4,8.7,-1.55,1.595,4.533,13,.78);
  stair(7.85,3.25,1.05,4.533,7.223,12,.75);

  // A molded transom, two integrated staircases and a properly framed bathing platform.
  buildDeck({add,cx:13.5,rx:.55,beam:3.05,aft:15.9,y:.10,height:.22,white,teak,black});
  soft(.38,1.13,3.35,paint,13.25,.93,0,.13);
  soft(.035,.64,2.9,white,13.46,.97,0,.06);
  line([[13.485,.62,-1.37],[13.485,.62,1.37]],chrome,.014);
  for(let s of [-1,1]){
    for(let i=0;i<5;i++){const x=13.2+i*.43,top=1.55-i*.245;soft(.45,top-.30,1.04,white,x,(top+.30)*.5,s*2.23,.055);box(.43,.045,.94,teak,x,top+.018,s*2.23);line([[x+.205,top-.06,s*1.81],[x+.205,top-.06,s*2.65]],warm,.008).castShadow=false;}
    line([[12.98,2.56,s*2.83],[13.4,2.33,s*2.83],[14.85,1.43,s*2.83]],chrome,.026);
    for(const [x,y] of [[13.1,1.55],[14.6,.58]])line([[x,y,s*2.83],[x,y+1.01,s*2.83]],chrome,.019);
    soft(.27,.06,.18,chrome,15.35,.37,s*2.28,.035);
  }
  // Sky lounge table: a table-height top and two substantial bases, away from the sofa cushions.
  soft(1.55,.085,.87,marble,.2,7.84,0,.19);
  for(const x of [-.25,.65]){soft(.38,.045,.49,bronze,x,7.25,0,.055);soft(.11,.53,.32,wood,x,7.545,0,.025);}

  const fixtures=[],emitters=[];
  function lamp(color,x,y,z,power=2.5,range=3){const light=new THREE.PointLight(color,power,range,2);light.position.set(x,y,z);boat.add(light);fixtures.push({light,power});return light;}
  function luminous(color){const m=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:1.5,roughness:.25});emitters.push(m);return m;}
  const led=luminous(0xffcb87),cool=luminous(0x48bed1);
  const linearGlow=new THREE.MeshBasicMaterial({color:0xffce96,transparent:true,opacity:.02,depthWrite:false,blending:THREE.AdditiveBlending});
  for(const s of [-1,1]){
    // Recessed courtesy lights cast real light onto the side decks.
    for(const x of [-12,-8,-3,2,7,11]){soft(.11,.065,.025,chrome,x,1.88,s*(x<-10?2.75:3.36),.015);box(.065,.026,.03,led,x,1.87,s*(x<-10?2.77:3.38));if([-8,2,11].includes(x))lamp(0xffca87,x,1.92,s*(x<-10?2.7:3.3),1.8,2.8);}
    for(const [y,z,end,start] of [[4.31,3.075,9.0,-6.1],[7.01,2.535,3.6,-4.5]]){const points=[[start,y,s*z],[end,y,s*z]];line(points,led,.018).castShadow=false;line(points,linearGlow,.055).castShadow=false;for(const x of [start+1,end-1])lamp(0xffd29c,x,y-.14,s*(z-.08),4,4);}
    // Cyan underwater transom lights illuminate the water behind the bathing platform.
    cylinder(.07,.025,chrome,14.9,.13,s*1.8);const p=add(new THREE.SphereGeometry(.055,12,8),cool,15.5,.13,s*1.8);p.castShadow=false;lamp(0x35c6dc,15.7,.04,s*1.7,7,4.5);
    const color=s<0?0xe82b26:0x36d47e,nav=luminous(color);soft(.23,.09,.10,black,-5.5,4.39,s*2.95,.025);soft(.16,.055,.045,nav,-5.54,4.405,s*3.01,.018);lamp(color,-5.54,4.42,s*3.08,1.8,2.2);
  }
  // Searchlight housings, masthead and stern navigation light.
  const navigationWhite=luminous(0xfff3df);soft(.06,.14,.16,navigationWhite,2.65,10.57,0,.025);lamp(0xfff0dd,2.65,10.58,0,1.2,2);soft(.04,.10,.20,navigationWhite,13.51,1.35,0,.025);
  for(const z of [-1,1]){cylinder(.025,1.6,chrome,1.9,10.66,z);cylinder(.012,.7,white,1.9,11.8,z);cylinder(.13,.04,chrome,1.9,9.9,z);}
  // Radar scanner rotates around its own shaft, independent of the yacht's heading.
  const scanner=new THREE.Group();scanner.userData.dynamic=true;scanner.position.set(2.65,10.25,0);boat.add(scanner);cylinder(.16,.32,white,2.65,10.04,0);
  const blade=new THREE.Mesh(new THREE.CapsuleGeometry(.08,1.6,5,24),white);blade.rotation.z=Math.PI/2;blade.scale.z=.72;scanner.add(blade);blade.castShadow=false;
  for(const z of [-.85,.85]){cylinder(.20,.22,white,2.3,10.10,z);add(new THREE.SphereGeometry(.25,24,16),white,2.3,10.37,z);}
  return{update(time,dusk){linearGlow.opacity=.008+dusk*.07;scanner.rotation.y=time*Math.PI*.8;for(const {light,power} of fixtures)light.intensity=power*(.10+dusk*.9);for(const m of emitters)m.emissiveIntensity=.8+dusk*2;}};
}
