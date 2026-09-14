import { contactDetails } from "@/data/contact";
import { portfolio } from "@/data/portfolio";
import { Arrow } from "@/components/ui/arrow";
import { DestinationRoute } from "@/components/visuals/destination-route";
import styles from "./completion.module.css";

export function Contact() {
  const actions = [
    { label: "DOWNLOAD CV", href: contactDetails.cvPath, note: "CV not added yet", download: true },
    { label: "GITHUB", href: contactDetails.githubUrl, note: "Profile not added yet", download: false },
    { label: "LINKEDIN", href: contactDetails.linkedinUrl, note: "Profile not added yet", download: false },
  ];
  return <section id="contact" className={styles.contact} aria-labelledby="contact-heading">
    <div className={styles.sectionLabel}><span>06 / NEXT DESTINATION</span><span>OPEN TO WHAT COMES NEXT</span></div>
    <div className={styles.contactComposition}><div><h2 id="contact-heading">THE NEXT COURSE<br /><span>IS DIGITAL.</span></h2><p className={styles.contactCopy}>I&apos;m currently looking for remote opportunities in AI applications, AI-assisted development, automation and junior full-stack development.</p></div><DestinationRoute /></div>
    <div className={styles.contactActions}>
      <div>{contactDetails.email ? <a className={styles.talkButton} href={`mailto:${contactDetails.email}`}>LET&apos;S TALK <Arrow diagonal /></a> : <><button className={styles.talkButton} disabled aria-describedby="email-pending">LET&apos;S TALK <Arrow diagonal /></button><p id="email-pending" className={styles.pending}>Email not added yet</p></>}</div>
      <div className={styles.secondaryActions}>{actions.map(action => <div key={action.label}>{action.href ? <a href={action.href} download={action.download || undefined} target={action.download ? undefined : "_blank"} rel={action.download ? undefined : "noopener noreferrer"}>{action.label}<Arrow diagonal /></a> : <><button disabled>{action.label}<Arrow diagonal /></button><span className={styles.pending}>{action.note}</span></>}</div>)}</div>
    </div>
    <div className={styles.destinationSignature}><p>Based in Italy.<br /><span>Open to remote opportunities worldwide.</span></p><p className={styles.technical}>{portfolio.name}<br />ITALY / REMOTE · WORLDWIDE</p></div>
  </section>;
}
