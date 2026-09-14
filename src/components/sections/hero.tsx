import { NavigationChart } from "@/components/visuals/navigation-chart";
import { Arrow } from "@/components/ui/arrow";
import { portfolio, routeStages } from "@/data/portfolio";

export function Hero() {
  return (
      <section className="hero" aria-labelledby="hero-heading" id="origin">
        <div className="hero-topline"><span>INDEPENDENT MIND. PRACTICAL APPROACH.</span><span>PERSONAL PORTFOLIO <i>/</i> 001</span></div>
        <NavigationChart />
        <div className="hero-content">
          <p className="eyebrow"><span /> {portfolio.role}<span className="eyebrow-divider">/</span> AI & AUTOMATION</p>
          <h1 id="hero-heading"><span>FROM REAL-WORLD</span><span>OPERATIONS</span><span className="headline-turn">TO <em>AI-POWERED</em></span><span className="headline-finish">SOFTWARE<span className="headline-period">.</span></span></h1>
          <div className="hero-description">{portfolio.introduction.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
          <div className="hero-actions"><a className="button-primary" href="#journey">Explore My Journey <Arrow /></a><a className="button-secondary" href="#projects">View Projects <Arrow diagonal /></a></div>
          <p className="availability"><span />{portfolio.status}</p>
        </div>
        <div className="hero-bottom">
          <div className="route-caption"><span className="route-number">01 — 05</span><span>A DIFFERENT START.<br /><strong>A NEW DIRECTION.</strong></span></div>
          <ol className="journey-route" aria-label="From real-world operations to AI">{routeStages.map((stage, index) => <li key={stage} className={index === 0 ? "current" : ""}><span className="route-dot" /><span>{stage}</span></li>)}</ol>
          <span className="hero-signature">SC <span>↗</span></span>
        </div>
      </section>
  );
}

