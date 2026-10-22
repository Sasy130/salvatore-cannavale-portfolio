export const LAST_STOP=8,LOOP_END=9;
export function advanceTour(target,delta){
  if(delta>0&&target>=LAST_STOP)return LOOP_END;
  if(delta<0&&target>LAST_STOP)return LAST_STOP;
  return Math.min(LOOP_END,Math.max(0,target+delta));
}
export function finishTourGesture(target,forward){
  if(forward&&target>=LAST_STOP-.15)return{target:target>LAST_STOP?LOOP_END:LAST_STOP,returnToStart:true};
  const rounded=Math.round(target);
  return{target:Math.abs(target-rounded)<.12?rounded:target,returnToStart:false};
}
export function completedTourLoop(progress,target){return target>=LOOP_END&&progress>=LOOP_END-.0002;}
