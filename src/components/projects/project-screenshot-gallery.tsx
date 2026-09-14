"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { businessScreenshots, type ProjectScreenshot } from "@/data/projects";
import { Arrow } from "@/components/ui/arrow";
import styles from "./projects.module.css";

function ScreenshotView({ screenshot }: { screenshot: ProjectScreenshot }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.screenshotView}>{screenshot.src && !failed ? <Image src={screenshot.src} alt={screenshot.alt} fill sizes="(max-width: 760px) 100vw, 85vw" style={{ objectFit: "contain" }} onError={()=>setFailed(true)}/> : <div className={styles.screenshotEmpty}><span className={styles.frameMark} aria-hidden="true">⌜ <span/> ⌝</span><p className={styles.technical}>REAL SCREENSHOT {failed ? "UNAVAILABLE" : "PENDING"}</p><strong>{screenshot.label}</strong><p>{failed ? "This image could not be loaded." : "This view is reserved for an authentic application capture."}</p><span className={styles.emptyIndex}>BUSINESS MANAGEMENT / {screenshot.id.toUpperCase()}</span></div>}</div>;
}

export function ProjectScreenshotGallery() {
  const [active, setActive] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const selected = businessScreenshots[active];
  function move(direction:number) { setActive(index=>(index+direction+businessScreenshots.length)%businessScreenshots.length); }
  return <div className={styles.gallery}>
    <div className={styles.galleryTop}><span>APPLICATION VIEWS / {String(active+1).padStart(2,"0")} — 07</span><span>{selected.src ? "APPLICATION CAPTURE" : "AWAITING REAL CAPTURES"}</span></div>
    <button className={styles.mainScreenshot} ref={trigger} onClick={()=>{dialog.current?.showModal();if(dialog.current)dialog.current.scrollTop=0;}} aria-label={`Inspect ${selected.label.toLowerCase()} screenshot`}><ScreenshotView key={selected.id} screenshot={selected}/><span className={styles.inspectCaption}>INSPECT VIEW <Arrow diagonal/></span></button>
    <div className={styles.screenshotSelector} aria-label="Application views">{businessScreenshots.map((shot,index)=><button key={shot.id} aria-pressed={index===active} onClick={()=>setActive(index)}><span>{String(index+1).padStart(2,"0")}</span>{shot.label}<i aria-hidden="true"/></button>)}</div>
    <dialog ref={dialog} className={styles.lightbox} aria-labelledby="screenshot-title" onClose={()=>trigger.current?.focus()} onKeyDown={event=>{if(event.key==="Tab" && dialog.current){const buttons=Array.from(dialog.current.querySelectorAll<HTMLButtonElement>("button"));const first=buttons[0],last=buttons[buttons.length-1];if(event.shiftKey && document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first.focus();}}if(event.key==="ArrowRight"){event.preventDefault();move(1);}if(event.key==="ArrowLeft"){event.preventDefault();move(-1);}}} onClick={event=>{if(event.target===dialog.current){const b=dialog.current.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.current.close();}}}>
      <div className={styles.lightboxTop}><h3 id="screenshot-title">{selected.label} / APPLICATION VIEW</h3><button autoFocus onClick={()=>dialog.current?.close()} aria-label="Close screenshot inspection">CLOSE <span aria-hidden="true">×</span></button></div>
      <ScreenshotView key={selected.id} screenshot={selected}/>
      <div className={styles.lightboxControls}><button onClick={()=>move(-1)} aria-label="Previous screenshot">← PREVIOUS</button><span aria-live="polite">{String(active+1).padStart(2,"0")} / 07 · {selected.label}</span><button onClick={()=>move(1)} aria-label="Next screenshot">NEXT →</button></div>
    </dialog>
  </div>;
}


