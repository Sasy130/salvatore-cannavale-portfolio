"use client";
import { useRef } from "react";
import { caseStudySteps } from "@/data/build";
import { Arrow } from "@/components/ui/arrow";
import styles from "./build.module.css";
export function BuildCaseStudy() {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() { dialog.current?.close(); }
  return <><button ref={trigger} className={styles.inspectButton} onClick={() => { dialog.current?.showModal(); if (dialog.current) dialog.current.scrollTop = 0; }}>SEE HOW I BUILD <Arrow diagonal/></button>
    <dialog ref={dialog} className={styles.caseStudy} aria-labelledby="case-study-title" onClose={() => trigger.current?.focus()} onClick={event => { if (event.target === dialog.current) { const b = dialog.current.getBoundingClientRect(); if (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom) close(); } }}>
      <div className={styles.dialogTop}><span>SC / SYSTEM INSPECTION</span><button autoFocus onClick={close} aria-label="Close case study">CLOSE <span aria-hidden="true">×</span></button></div>
      <div className={styles.dialogBody}><p className={styles.technical}>FURNITURE BUSINESS MANAGEMENT SYSTEM</p><h2 id="case-study-title">ONE REQUIREMENT.<br/><span>A CONNECTED FEATURE.</span></h2><p className={styles.caseContext}>Workflow walkthrough · Project in active development.<br/>Development approach and validation targets, rather than a live application or completed-feature report.</p>
        <ol className={styles.caseSteps}>{caseStudySteps.map((step,index)=><li key={step.title}><span className={styles.caseNumber}>0{index+1}</span><div><h3>{step.title}</h3><p>{step.text}</p>{index===2&&<div className={styles.schema}>CUSTOMER → QUOTATION<br/><span>QUOTATION ITEMS → INVENTORY</span></div>}</div></li>)}</ol>
        <div className={styles.dialogBottom}><span>HUMAN DIRECTION / CONTINUOUS VALIDATION</span><button onClick={close}>Back to the route <Arrow/></button></div>
      </div>
    </dialog></>;
}

