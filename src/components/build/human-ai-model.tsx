import styles from "./build.module.css";
export function HumanAIModel() {
  return <div className={styles.collaboration}><div><p className={styles.technical}>SALVATORE / HUMAN DIRECTION</p><h3>Intent.<br/>Judgement.<br/>Validation.</h3><p>Requirements, decisions and review.</p></div><span className={styles.operator} aria-hidden="true">+</span><div><p className={styles.technical}>CODEX / AI ACCELERATION</p><h3>Exploration.<br/>Implementation.<br/>Iteration.</h3><p>Code exploration and debugging assistance.</p></div><span className={styles.operator} aria-hidden="true">=</span><div className={styles.collaborationResult}><p className={styles.technical}>SHARED OBJECTIVE</p><h3>Working<br/>software.</h3><p>Directed. Reviewed. Validated.</p></div></div>;
}
