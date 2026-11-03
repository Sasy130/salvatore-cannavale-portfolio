import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Flame } from "lucide-react";
import { restaurant, fuocoPaths } from "./restaurant";

export function Photo({ file, alt, className = "", sizes = "(max-width: 760px) 100vw, 50vw", preload = false }: { file: string; alt: string; className?: string; sizes?: string; preload?: boolean }) {
  return <div className={`fuoco-photo ${className}`}><Image src={`/images/fuoco/${file}`} alt={alt} fill sizes={sizes} preload={preload} /></div>;
}

export function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return <p className={`fuoco-eyebrow ${light ? "fuoco-eyebrow-light" : ""}`}><span aria-hidden="true" />{children}</p>;
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link className="fuoco-text-link" href={href}>{children}<ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" /></Link>;
}

export function Brand({ footer = false }: { footer?: boolean }) {
  return <Link href={fuocoPaths.home} className={`fuoco-footer-brand ${footer ? "fuoco-footer-brand-large" : ""}`} aria-label={`${restaurant.name}, home`}>{restaurant.logoImage ? <Image src={restaurant.logoImage} alt="" width={44} height={52} /> : <Flame aria-hidden="true" strokeWidth={1.2} />}<span>{restaurant.name}<small>{restaurant.tagline}</small></span></Link>;
}
