import { capabilityAreas, currentlyExploring } from "@/data/capabilities";
import styles from "./completion.module.css";

export function Capabilities() {
  return <section id="capabilities" className={styles.capabilities} aria-labelledby="capabilities-heading">
    <div className={styles.connection} aria-hidden="true" />
    <div className={styles.sectionLabel}><span>05 / CAPABILITIES</span><span>PARTS OF ONE SYSTEM</span></div>
    <header className={styles.introduction}>
      <h2 id="capabilities-heading">TOOLS CHANGE.<br /><span>THE ABILITY TO BUILD<br />MATTERS MORE.</span></h2>
      <p>I combine practical problem solving, software development and AI-assisted workflows to turn ideas into working digital solutions.</p>
    </header>
    <div className={styles.capabilitySystem}>
      {capabilityAreas.map((area, index) => <article key={area.name} className={styles.capabilityArea}>
        <span className={styles.areaNode} aria-hidden="true">0{index + 1}</span>
        <p className={styles.technical}>{area.label}</p><h3>{area.name}</h3>
        <ul>{area.tools.map(tool => <li key={tool}>{tool}{currentlyExploring.includes(tool) && <span className={styles.exploringMark} aria-label=" — currently exploring">*</span>}</li>)}</ul>
      </article>)}
    </div>
    <div className={styles.exploring}><p className={styles.technical}>* CURRENTLY EXPLORING</p><p>{currentlyExploring.join(" / ")}</p></div>
    <div className={styles.principle}><p className={styles.technical}>THE PRINCIPLE BEHIND THE PROCESS</p><h3>THE TOOL IS NOT THE SKILL.<br /><span>UNDERSTANDING THE PROBLEM<br />AND BUILDING THE SOLUTION IS.</span></h3></div>
  </section>;
}
