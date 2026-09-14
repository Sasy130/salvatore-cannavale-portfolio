"use client";
import { useRef, useState, type KeyboardEvent, type CSSProperties } from "react";
import { developmentStages } from "@/data/build";
import { CodexMoment } from "./codex-moment";
import { Arrow } from "@/components/ui/arrow";
import styles from "./build.module.css";
const positions = [[0,0],[1,0],[2,0],[2,1],[1,1],[0,1],[0,2],[1,2],[2,2]];
function StageDetail({ index }: { index: number }) {
  const stage=developmentStages[index];
  return <><p className={styles.stageText}>{stage.text}</p><dl className={styles.stageNotes}><div><dt>HUMAN DIRECTION</dt><dd>{stage.decision}</dd></div><div><dt>WORKING TOWARD</dt><dd>{stage.output}</dd></div></dl></>;
}
export function DevelopmentRoute() {
  const [active,setActive]=useState(0);
  const buttons=useRef<(HTMLButtonElement|null)[]>([]);
  const stage=developmentStages[active];
  function handleKey(event: KeyboardEvent<HTMLButtonElement>,index:number) {
    const keys:Record<string,number>={ArrowRight:Math.min(index+1,8),ArrowDown:Math.min(index+1,8),ArrowLeft:Math.max(index-1,0),ArrowUp:Math.max(index-1,0),Home:0,End:8};
    if(!(event.key in keys))return;
    event.preventDefault();setActive(keys[event.key]);buttons.current[keys[event.key]]?.focus();
  }
  return <div className={styles.routeExperience} data-codex-active={active===3}>
    <div className={styles.routeTop}><span>DEVELOPMENT ROUTE / 09 WAYPOINTS</span><span>SELECT A WAYPOINT ↙</span></div>
    <div className={styles.workspace}><div className={styles.routeMap}>
      <svg className={styles.routeLines} viewBox="0 0 600 420" preserveAspectRatio="none" fill="none" aria-hidden="true"><defs><pattern id="build-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" stroke="#a9dce2" strokeOpacity=".07"/></pattern></defs><rect width="600" height="420" fill="url(#build-grid)"/><path d="M100 70H500V210H100V350H500" stroke="#a9dce22f"/><path className={styles.routeLit} d="M100 70H500V210H100V350H500" pathLength="1480" stroke="#a9dce2" strokeDasharray="1480" strokeDashoffset={1480-[0,200,400,540,740,940,1080,1280,1480][active]}/><path d="M330 245v28h80" stroke="#a9dce2" strokeDasharray="3 5" className={styles.codexBranch}/><text x="339" y="292" fill="#a9dce2" fontSize="8" letterSpacing="1" className={styles.codexBranch}>REVIEW / REFINE</text></svg>
      <ol className={styles.routeNodes}>{developmentStages.map((item,index)=><li key={item.name} className={styles.node} style={{"--column":positions[index][0],"--row":positions[index][1]} as CSSProperties} data-selected={index===active} data-passed={index<active} data-codex={index===3}><button ref={el=>{buttons.current[index]=el;}} aria-pressed={index===active} onClick={()=>setActive(index)} onKeyDown={event=>handleKey(event,index)}><span className={styles.nodeNumber}>0{index+1}</span><span className={styles.nodeName}>{item.name}</span>{index===3&&<span className={styles.codexTag}>AI PARTNER</span>}<span className={styles.mobileNodeArrow} aria-hidden="true">{index===active?"−":"+"}</span></button>{index===active&&<div className={styles.mobileDetail}><StageDetail index={active}/>{active===3&&<CodexMoment active/>}</div>}</li>)}</ol>
      <div className={styles.mapFoot}><span>INTENT → STRUCTURE → IMPLEMENTATION</span><span>SC / 03</span></div>
    </div><div className={styles.inspector}><div className={styles.inspectorLabel}><span>0{active+1} / 09</span><span>{stage.label}</span></div><div className={styles.inspectorContent} aria-live="polite" aria-atomic="true"><h3>{stage.name}<span>.</span></h3><StageDetail index={active}/></div><div className={styles.routeControls}><button disabled={active===0} onClick={()=>setActive(active-1)} aria-label="Previous development stage">← PREVIOUS</button><button disabled={active===8} onClick={()=>setActive(active+1)} aria-label="Next development stage">NEXT <Arrow/></button></div></div></div>
    <div className={styles.desktopMoment}><CodexMoment active={active>=3}/><p>{active===3?"Requirements become focused tasks. Each change remains open to review.":"Explore the route. Every step connects back to the original problem."}</p></div>
  </div>;
}

