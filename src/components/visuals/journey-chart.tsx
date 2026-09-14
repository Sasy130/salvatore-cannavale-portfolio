// Matching contour points move from an irregular marine basin to squared system layers.
// All geometry is decorative, deterministic and generated on the server.
function contour(ring: number, stage: number) {
  const blend = stage / 5;
  const radius = 33 + ring * 7.8;
  return Array.from({ length: 97 }, (_, point) => {
    const a = point / 96 * Math.PI * 2;
    const wave = 1 + .12 * Math.sin(a * 3) + .045 * Math.cos(a * 5);
    const cosine = Math.cos(a), sine = Math.sin(a);
    const organicX = cosine * radius * wave;
    const organicY = sine * radius * wave * .83;
    const systemX = Math.sign(cosine) * Math.abs(cosine) ** .24 * radius;
    const systemY = Math.sign(sine) * Math.abs(sine) ** .24 * radius * .73;
    return `${point ? "L" : "M"}${(260 + organicX * (1 - blend) + systemX * blend).toFixed(2)},${(243 + organicY * (1 - blend) + systemY * blend).toFixed(2)}`;
  }).join(" ") + " Z";
}

export function JourneyChart() {
  return <svg viewBox="0 0 520 490" fill="none" aria-hidden="true">
    <defs><pattern id="journey-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="#a9dce2" strokeOpacity=".08" /></pattern></defs>
    <rect x="20" y="20" width="480" height="440" fill="url(#journey-grid)" />
    {Array.from({ length: 6 }, (_, stage) => <g key={stage} className="journey-field" data-field={stage}>{Array.from({ length: 23 }, (_, ring) => <path key={ring} d={contour(ring, stage)} stroke="#7eb5c3" strokeOpacity={ring % 5 === 0 ? .5 : .23} strokeWidth={ring % 5 === 0 ? 1 : .7} />)}</g>)}
    <g stroke="#a9dce2" strokeWidth="1" opacity=".4"><path d="M260 12v20m-10-10h20M260 455v20m-10-10h20M10 243h20m-10-10v20M490 243h20m-10-10v20" /><circle cx="260" cy="243" r="20" strokeDasharray="2 5" /></g>
    <path className="journey-organic-route" d="M103 369 178 316 260 243 334 172 418 116" stroke="#a9dce2" strokeWidth="1.3" />
    <path className="journey-system-route" d="M103 369V316H178V243H334V172H418V116" stroke="#a9dce2" strokeWidth="1.3" />
    <g className="journey-chart-nodes" stroke="#a9dce2" fill="#080f13"><circle cx="103" cy="369" r="4" /><circle cx="260" cy="243" r="5" /><rect x="413" y="111" width="10" height="10" /></g>
    <g fill="#9daaad" fontSize="9" fontFamily="monospace" letterSpacing="1"><text x="27" y="43">SC / 02</text><text x="407" y="443">+ / +</text><text x="123" y="390">ORIGIN</text><text x="345" y="98">NEXT / SYSTEMS</text></g>
  </svg>;
}
