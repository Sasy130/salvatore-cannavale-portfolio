import styles from "./build.module.css";
export function CodexMoment({ active }: { active: boolean }) {
  return <div className={styles.codexMoment} data-connected={active} aria-label="Intent connects through structure to implementation"><div><span>INTENT</span><small>Requirements</small></div><i aria-hidden="true"/><div><span>STRUCTURE</span><small>Architecture</small></div><i aria-hidden="true"/><div><span>IMPLEMENTATION</span><small>Reviewed changes</small></div></div>;
}
