import { journeyWaypoints, marineExperience } from "@/data/journey";
import { JourneyChart } from "@/components/visuals/journey-chart";
import { Arrow } from "@/components/ui/arrow";
import { JourneyProgression } from "./journey-progression";
import styles from "./journey.module.css";

export function Journey() {
  return <section id="journey" className={styles.journey} aria-labelledby="journey-heading">
    <div className={styles.connection} aria-hidden="true"><span /><i /></div>
    <div className={styles.sectionLabel}><span>02 / JOURNEY</span><span>THE ORIGIN OF THE APPROACH</span></div>
    <header className={styles.introduction}>
      <h2 id="journey-heading">FROM SEA<br /><span>TO SOFTWARE.</span></h2>
      <div><p className={styles.lead}>Before software,<br />there were real operations.</p><p className={styles.introText}>Years working in the marine sector taught me to make decisions, solve practical problems and understand how operational systems work from the inside.</p></div>
    </header>
    <JourneyProgression chart={<JourneyChart />}>
      <ol className={styles.waypoints}>
        {journeyWaypoints.map((point, index) => <li key={point.title} className={`${styles.waypoint} ${index === 4 ? styles.turning : ""}`} data-waypoint={index} data-reached={index === 0 ? "true" : "false"} data-active={index === 0 ? "true" : "false"}>
          <span className={styles.marker} aria-hidden="true">0{index + 1}</span>
          <div className={styles.waypointContent}>
            <h3>{point.title}</h3>
            <p className={styles.copy}>{point.text}</p>
            {index === 0 && <div className={styles.marine}><p className={styles.marineLabel}>MARINE OPERATIONS</p><p className={styles.role}>Vessel Captain / Marine Operations</p><ul>{marineExperience.map(item => <li key={item}>{item}</li>)}</ul></div>}
            {index === 4 && <><blockquote>“Could software<br />make this simpler?”</blockquote><ul className={styles.friction}><li>Manual processes.</li><li>Repeated tasks.</li><li>Information scattered across different places.</li></ul><p className={styles.realization}>Problems that software could simplify.</p></>}
            {index === 5 && <div className={styles.systemFlow} aria-hidden="true"><span>PROBLEM</span><Arrow /><span>LOGIC</span><Arrow /><span>SOLUTION</span></div>}
          </div>
        </li>)}
      </ol>
    </JourneyProgression>
    <footer className={styles.ending}>
      <span className={styles.endingLabel}>SAME MINDSET / NEW TOOLS</span>
      <h2>THE TOOLS CHANGED.<br /><span>THE APPROACH DIDN&apos;T.</span></h2>
      <p>Understand the problem.<br className={styles.mobileBreak} /> Build a practical solution.<br className={styles.mobileBreak} /> Improve it.</p>
      <div className={styles.nextChapter}><span className={styles.nextNode} /><span>03 / BUILD</span><span className={styles.nextRule} /><span>NEXT CHAPTER</span><Arrow diagonal /></div>
    </footer>
  </section>;
}

