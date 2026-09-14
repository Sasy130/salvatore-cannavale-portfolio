"use client";
import { useState } from "react";
import { businessModules } from "@/data/projects";
import styles from "./projects.module.css";

export function ProjectArchitecture() {
  const [active, setActive] = useState("quotations");
  const selected = businessModules.find(module => module.id === active)!;
  return <div className={styles.architecture}>
    <div className={styles.architectureHeading}><p className={styles.technical}>ONE APPLICATION / CONNECTED WORKFLOWS</p><span>SELECT A MODULE ↙</span></div>
    <div className={styles.systemLayout}>
      <div className={styles.systemMap}>
        <svg viewBox="0 0 600 350" preserveAspectRatio="none" fill="none" aria-hidden="true"><path d="M100 58H300V175M100 175H500M300 175V292H500M500 175V58M100 175V292H300" stroke="#a9dce24f"/><path d={active==="customers"?"M100 58H300V175":active==="inventory"?"M100 175H300":active==="orders"?"M300 175H500":active==="deliveries"?"M300 175H500V58":active==="documents"?"M300 175V292H100":active==="system"?"M300 175V292H500":"M100 58H300V175H500M100 175H300V292H100"} stroke="#a9dce2"/></svg>
        <ol>{businessModules.map(module=><li key={module.id} data-module={module.id} data-active={active===module.id}><button onClick={()=>setActive(module.id)} aria-pressed={active===module.id}><span className={styles.systemNode} aria-hidden="true"/>{module.name}</button></li>)}</ol>
      </div>
      <div className={styles.moduleDetail} aria-live="polite" aria-atomic="true"><p className={styles.technical}>MODULE / {selected.id.toUpperCase()}</p><h4>{selected.name}</h4><p>{selected.description}</p><ul>{selected.features.map(feature=><li key={feature}>{feature}</li>)}</ul><span className={styles.moduleStatus}>{selected.status ?? "Completion status to confirm"}</span></div>
    </div>
    <p className={styles.scopeNote}>Conceptual system map · Functional scope shown. Individual feature completion has not yet been verified.</p>
  </div>;
}
