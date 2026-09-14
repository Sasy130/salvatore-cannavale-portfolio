import { futureProjects } from "@/data/projects";
import { ProjectStatus } from "./project-status";
import styles from "./projects.module.css";
export function FutureProject({ project }: { project: (typeof futureProjects)[number] }) {
  return <article className={styles.futureProject}><div className={styles.futurePosition}><span className={styles.futureNode} aria-hidden="true"/><span>DESTINATION / {project.number}</span><span>NEXT</span></div><div className={styles.futureBody}><div><p className={styles.technical}>{project.category}</p><h3>{project.name}</h3><ProjectStatus>{project.status}</ProjectStatus></div><div><p>{project.description}</p><p className={styles.futureTech}><span>{project.techLabel}</span>{project.technologies.join(" / ")}</p></div></div></article>;
}
