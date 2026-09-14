import Link from "next/link";
import { businessProject } from "@/data/projects";
import { ProjectStatus } from "./project-status";
import { ProjectArchitecture } from "./project-architecture";
import { ProjectScreenshotGallery } from "./project-screenshot-gallery";
import { Arrow } from "@/components/ui/arrow";
import styles from "./projects.module.css";

export function FeaturedProject() {
  return <article className={styles.featured} aria-labelledby="business-project-title">
    <div className={styles.destination}><span>DESTINATION / 01</span><span className={styles.current}>CURRENT POSITION</span><ProjectStatus>{businessProject.status}</ProjectStatus></div>
    <header className={styles.projectHeader}><div><p className={styles.technical}>{businessProject.category}</p><h3 id="business-project-title">BUSINESS<br/><span>MANAGEMENT SYSTEM.</span></h3></div><p>{businessProject.context}</p></header>
    <ProjectScreenshotGallery/>
    <div className={styles.projectStory}>{businessProject.story.map((item,index)=><div key={item.title}><p className={styles.technical}>0{index+1} / {item.title.toUpperCase()}</p><p>{item.text}</p></div>)}</div>
    <ProjectArchitecture/>
    <dl className={styles.metadata}>{businessProject.metadata.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className={styles.aiDirection}><h4>BUILT WITH AI.<br/><span>DIRECTED BY ME.</span></h4><div><p>Codex is used throughout development to accelerate implementation, explore solutions, debug issues and iterate on features.</p><p>Project direction, requirements, workflow decisions, testing and validation remain human-led.</p></div></div>
    <div className={styles.projectActions}><Link href="/projects/business-management-system" className={styles.caseLink}>EXPLORE CASE STUDY <Arrow diagonal/></Link><div><p className={styles.technical}>PRIVATE REPOSITORY</p><p>Source code is private because the application contains business-specific logic.</p></div></div>
    <p className={styles.stackLine}>{businessProject.technologies.join(" / ")}</p>
  </article>;
}
