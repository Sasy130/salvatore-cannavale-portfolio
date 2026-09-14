import styles from "./projects.module.css";
export function ProjectStatus({ children }: { children: React.ReactNode }) {
  return <span className={styles.status}><i aria-hidden="true"/>{children}</span>;
}
