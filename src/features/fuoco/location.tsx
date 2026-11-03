import Image from "next/image";
import { ArrowUpRight, Camera, Clock3, Globe, MapPin, MessageCircle, Phone } from "lucide-react";
import { restaurant, getDirectionsUrl, getPhoneUrl, getSocialUrl, getWhatsAppUrl } from "./restaurant";
import { Eyebrow } from "./ui";

/** The venue image and contact details must describe the real configured business. */
export function Location({ compact = false }: { compact?: boolean }) {
  const address = restaurant.address?.trim();
  const phoneUrl = getPhoneUrl();
  const whatsappUrl = getWhatsAppUrl();
  const directionsUrl = address ? getDirectionsUrl() : null;
  const hours = restaurant.openingHours?.filter((entry) => entry.day.trim() && entry.hours.trim()) ?? [];
  const instagramUrl = getSocialUrl(restaurant.socials.instagram);
  const facebookUrl = getSocialUrl(restaurant.socials.facebook);
  const titleId = compact ? "fuoco-home-location-title" : "fuoco-location-title";

  return (
    <section
      id={compact ? "contatti" : "dove-siamo"}
      className={`fuoco-location fuoco-section ${compact ? "fuoco-location-compact" : ""}`}
      aria-labelledby={titleId}
    >
      <div className="fuoco-location-heading" data-reveal>
        <Eyebrow>DOVE SIAMO</Eyebrow>
        <h2 id={titleId}>Le cose buone.<br /><em>Nel posto giusto.</em></h2>
        <p>Una tavola da condividere.<br />Il resto comincia da un incontro.</p>
      </div>

      <div className="fuoco-location-body">
        <div className="fuoco-location-visual" data-image-reveal>
          {restaurant.locationImage ? (
            <Image src={restaurant.locationImage} alt={`Il locale ${restaurant.name}`} fill sizes="(max-width: 760px) 100vw, 50vw" />
          ) : (
            <div className="fuoco-location-illustration" aria-hidden="true">
              <span className="fuoco-location-orbit fuoco-location-orbit-outer" />
              <span className="fuoco-location-orbit fuoco-location-orbit-inner" />
              <span className="fuoco-location-axis fuoco-location-axis-horizontal" />
              <span className="fuoco-location-axis fuoco-location-axis-vertical" />
              <MapPin strokeWidth={.8} />
              <span className="fuoco-location-visual-label">CI RITROVIAMO A TAVOLA.</span>
            </div>
          )}
          {restaurant.demo && !restaurant.locationImage && <p className="fuoco-location-visual-note">CONCEPT DEMO · POSIZIONE DA CONFERMARE</p>}
        </div>

        <div className="fuoco-location-information" data-reveal>
          <p className="fuoco-location-name">{restaurant.name}<span>L’INCONTRO COMINCIA QUI.</span></p>
          {(address || restaurant.demo) && (
            <div className="fuoco-location-detail">
              <MapPin size={19} strokeWidth={1.3} aria-hidden="true" />
              <div><h3>INDIRIZZO</h3>{address ? <address>{address}</address> : <p className="fuoco-location-pending">Indirizzo da confermare per il locale.</p>}</div>
            </div>
          )}

          {(hours.length > 0 || restaurant.demo) && (
            <div className="fuoco-location-detail">
              <Clock3 size={19} strokeWidth={1.3} aria-hidden="true" />
              <div><h3>ORARI</h3>{hours.length > 0 ? <dl className="fuoco-location-hours">{hours.map((entry) => <div key={entry.day}><dt>{entry.day}</dt><dd>{entry.hours}</dd></div>)}</dl> : <p className="fuoco-location-pending">Giorni e orari di apertura da confermare.</p>}</div>
            </div>
          )}

          {(phoneUrl || restaurant.demo) && (
            <div className="fuoco-location-detail">
              <Phone size={19} strokeWidth={1.3} aria-hidden="true" />
              <div><h3>TELEFONO</h3>{phoneUrl ? <a className="fuoco-location-inline-link" href={phoneUrl}>{restaurant.phone}</a> : <p className="fuoco-location-pending">Numero di telefono da confermare.</p>}</div>
            </div>
          )}

          {directionsUrl && <a className="fuoco-button fuoco-location-directions" href={directionsUrl} target="_blank" rel="noopener noreferrer" aria-label="Indicazioni stradali su Google Maps, si apre in una nuova scheda">INDICAZIONI STRADALI<ArrowUpRight size={18} aria-hidden="true" /></a>}

          {whatsappUrl ? (
            <a className="fuoco-button fuoco-location-whatsapp" href={whatsappUrl} target="_blank" rel="noopener noreferrer">SCRIVICI SU WHATSAPP<MessageCircle size={18} aria-hidden="true" /></a>
          ) : restaurant.demo ? (
            <p className="fuoco-location-whatsapp-pending"><MessageCircle size={19} strokeWidth={1.3} aria-hidden="true" /><span>WHATSAPP<small>Non ancora disponibile in questa demo.</small></span></p>
          ) : null}

          {(instagramUrl || facebookUrl || restaurant.demo) && (
            <div className="fuoco-location-socials">
              {instagramUrl && <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram, si apre in una nuova scheda"><Camera size={17} aria-hidden="true" />Instagram<ArrowUpRight size={14} aria-hidden="true" /></a>}
              {facebookUrl && <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook, si apre in una nuova scheda"><Globe size={17} aria-hidden="true" />Facebook<ArrowUpRight size={14} aria-hidden="true" /></a>}
              {!instagramUrl && !facebookUrl && restaurant.demo && <p>Profili social da confermare.</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
