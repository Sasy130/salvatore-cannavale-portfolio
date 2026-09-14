import { buildTechnologies } from "@/data/build";
import { DevelopmentRoute } from "@/components/build/development-route";
import { BuildCaseStudy } from "@/components/build/build-case-study";
import { HumanAIModel } from "@/components/build/human-ai-model";
import { Arrow } from "@/components/ui/arrow";
import styles from "@/components/build/build.module.css";
export function Build() {
  return <section id="build" className={styles.build} aria-labelledby="build-heading"><div className={styles.continuation} aria-hidden="true"/><div className={styles.sectionLabel}><span>03 / BUILD</span><span>AI-ASSISTED DEVELOPMENT</span></div>
    <header className={styles.introduction}><h2 id="build-heading">I DON&apos;T JUST<br/>PROMPT AI.<br/><strong>I BUILD<br/>WITH IT.</strong></h2><div className={styles.introCopy}><p className={styles.lead}>Codex is part of<br/>my development workflow.</p><p>I use it to move from requirements to implementation faster — while keeping control of architecture, logic, testing, debugging and iteration.</p><p className={styles.goal}>The goal isn&apos;t to generate more code.<br/><span>It&apos;s to build better solutions faster.</span></p><span className={styles.smallRoute} aria-hidden="true">INTENT ── ◇ ── IMPLEMENTATION</span></div></header>
    <div className={styles.challenge}><div><p className={styles.technical}>THE CHALLENGE / FURNITURE BUSINESS MANAGEMENT SYSTEM</p><h3>BUILD A QUOTATION SYSTEM<br/><span>CONNECTED TO INVENTORY.</span></h3></div><div><p>A quotation should not exist as an isolated document. It needs to interact with products, customer information, pricing and business logic.</p><BuildCaseStudy/></div></div>
    <DevelopmentRoute/><div className={styles.technologyMetadata}>{buildTechnologies.map(([label,value])=><div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><HumanAIModel/>
    <footer className={styles.ending}><p className={styles.technical}>FROM DEVELOPMENT ROUTE / TO REAL APPLICATION</p><h2>THE PROCESS MATTERS.<br/><strong>THE RESULT<br/>MATTERS MORE.</strong></h2><p>Real problems. Working software.</p><div className={styles.nextChapter}><span className={styles.nextNode}/><span>04 / PROJECTS</span><span className={styles.nextRule}/><span>NEXT CHAPTER</span><Arrow diagonal/></div></footer>
  </section>;
}

