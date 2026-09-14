import { portfolio } from "@/data/portfolio";
import styles from "@/components/sections/completion.module.css";

export function Footer() {
  return <footer className={styles.footer}><span>© {new Date().getFullYear()} {portfolio.name}</span><span>AI-Assisted Development <i>/</i> Full-Stack <i>/</i> Automation</span></footer>;
}
