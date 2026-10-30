import Link from "next/link";
export default function NotFound() {
  return (
    <main id="main" className="section not-found">
      <span className="eyebrow orange-text">404 / CAMBIO DI PERCORSO</span>
      <h1>
        Qui la strada
        <br />
        <span className="serif">finisce.</span>
      </h1>
      <p>La prossima partenza è a un clic da qui.</p>
      <Link className="button orange" href="/">
        Torna al punto di partenza
      </Link>
    </main>
  );
}
