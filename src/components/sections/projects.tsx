import { FeaturedProject } from "@/components/projects/featured-project";
import { FutureProject } from "@/components/projects/future-project";
import { futureProjects } from "@/data/projects";
import { Arrow } from "@/components/ui/arrow";
import styles from "@/components/projects/projects.module.css";
export function Projects() {
  return <section id="projects" className={styles.projects} aria-labelledby="projects-heading"><div className={styles.connection} aria-hidden="true"/><div className={styles.sectionLabel}><span>04 / PROJECTS</span><span>PROOF OF WORK</span></div><header className={styles.introduction}><h2 id="projects-heading">BUILT,<br/><span>NOT JUST LEARNED.</span></h2><div><p className={styles.lead}>I learn by building.</p><p>Practical problems and real operational needs shape my work — from the business management system in active development to the AI applications I&apos;m exploring next.</p></div></header><FeaturedProject/><div className={styles.nextProjects}><p className={styles.technical}>FURTHER ALONG THE ROUTE / IN DEVELOPMENT</p>{futureProjects.map(project=><FutureProject key={project.number} project={project}/>)}</div><footer className={styles.ending}><h2>THE NEXT PROJECT<br/><span>IS ALREADY BEING BUILT.</span></h2><div className={styles.nextChapter}><span className={styles.futureNode}/><span>05 / CAPABILITIES</span><i/><span>NEXT CHAPTER</span><Arrow diagonal/></div></footer></section>;
}
