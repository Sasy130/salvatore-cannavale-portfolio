import type { Metadata } from "next";
import Link from "next/link";
import { businessProject } from "@/data/projects";
import { Arrow } from "@/components/ui/arrow";
import styles from "@/components/projects/projects.module.css";
export const metadata: Metadata = { icons: { icon: "/icon.svg" }, openGraph: { title: "Business Management System — Salvatore Cannavale", description: "Case study outline for a desktop management application for a furniture business. Project in active development.", type: "website", locale: "en_US" }, title: "Business Management System — Salvatore Cannavale", description: "Case study outline for a desktop management application for a furniture business. Project in active development." };
const outline = ["The problem", "Context", "Requirements", "Solution", "Architecture", "Features", "Development process", "Challenges", "AI-assisted development", "Screenshots", "Lessons learned"];
export default function BusinessManagementCaseStudy() {
  return <main id="main-content" className={styles.casePage}><Link href="/#projects" className={styles.backLink}>← BACK TO PROJECTS</Link><p className={styles.technical}>CASE STUDY / 01 · IN PREPARATION</p><h1>BUSINESS<br/>MANAGEMENT<br/><span>SYSTEM.</span></h1><p className={styles.caseIntro}>{businessProject.context}</p><p className={styles.caseNotice}>The application is in active development. This is a structured outline for the forthcoming case study; implementation details and real screenshots will be added after verification.</p><div className={styles.caseOutline}>{outline.map((title,index)=><div key={title}><span>{String(index+1).padStart(2,"0")}</span><h2>{title}</h2><span>TO DOCUMENT</span></div>)}</div><Link href="/#projects" className={styles.caseLink}>RETURN TO THE SHOWCASE <Arrow/></Link></main>;
}


