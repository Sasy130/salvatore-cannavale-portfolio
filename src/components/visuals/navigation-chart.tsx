import { createContours } from "@/lib/topography";

const contours = createContours();

export function NavigationChart() {
  return (
    <div className="chart" aria-hidden="true">
      <svg className="chart-art" viewBox="0 0 1000 850" fill="none">
        <defs>
          <linearGradient id="contour-ink" x1="190" y1="710" x2="850" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#12333c" /><stop offset=".4" stopColor="#397480" /><stop offset=".72" stopColor="#5b9bac" /><stop offset="1" stopColor="#183c4e" />
          </linearGradient>
          <radialGradient id="depth-light">
            <stop stopColor="#061015" /><stop offset=".26" stopColor="#061015" /><stop offset=".6" stopColor="#0a202b" stopOpacity=".85" /><stop offset="1" stopColor="#071116" stopOpacity="0" />
          </radialGradient>
          <pattern id="chart-grid" width="84" height="84" patternUnits="userSpaceOnUse"><path d="M84 0H0V84" stroke="#60828b" strokeOpacity=".13" strokeWidth=".7" /></pattern>
          <pattern id="data-grid" width="21" height="21" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="#7eb3bd" opacity=".3" /></pattern>
          <linearGradient id="data-fade"><stop stopColor="white" stopOpacity="0" /><stop offset="1" stopColor="white" /></linearGradient>
          <mask id="grid-mask"><rect x="570" y="140" width="360" height="530" fill="url(#data-fade)" /></mask>
          <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" /></filter>
        </defs>
        <ellipse cx="550" cy="410" rx="460" ry="385" fill="url(#depth-light)" />
        <rect x="80" y="35" width="850" height="730" fill="url(#chart-grid)" />
        <rect x="570" y="140" width="360" height="530" fill="url(#data-grid)" mask="url(#grid-mask)" />
        <g className="contours" stroke="url(#contour-ink)">
          {contours.map((path, index) => <path key={index} d={path} strokeWidth={index % 6 === 0 ? 1.25 : .65} opacity={index % 6 === 0 ? .85 : .48} />)}
        </g>
        <g stroke="#799aa3" strokeWidth=".75" opacity=".4">
          <path d="M515 80v20m-10-10h20M840 660v20m-10-10h20M252 606v20m-10-10h20M842 175v20m-10-10h20" />
          <circle cx="532" cy="422" r="115" strokeDasharray="2 9" />
          <path d="M532 297v17m0 216v17M407 422h17m216 0h17" />
        </g>
        <path d="M214 682 357 578 424 502 559 448 665 298 802 213" stroke="#6edbe9" strokeWidth="5" opacity=".22" filter="url(#route-glow)" />
        <path className="plotted-route" d="M214 682 357 578 424 502 559 448 665 298 802 213" stroke="#91dae2" strokeWidth="1.4" pathLength="1" />
        <path d="m802 213 60-37" stroke="#91dae2" strokeOpacity=".45" strokeDasharray="3 6" />
        <g fill="#0a171d" stroke="#9bd9df" strokeWidth="1.5">
          <circle cx="214" cy="682" r="4" /><circle cx="424" cy="502" r="4" /><circle cx="665" cy="298" r="4" />
        </g>
        <circle cx="559" cy="448" r="16" stroke="#9bd9df" strokeOpacity=".35" />
        <circle cx="559" cy="448" r="4" fill="#d1f6f8" />
        <circle cx="802" cy="213" r="15" stroke="#9bd9df" strokeOpacity=".3" />
        <circle cx="802" cy="213" r="5" fill="#b9f2f6" />
        <g className="chart-labels" fill="#829ca6" fontSize="10" letterSpacing="2">
          <text x="239" y="701">01 / ORIGIN</text>
          <text x="582" y="452" fill="#b3d3d9">TURNING POINT</text>
          <text x="687" y="292">SYSTEMS</text>
          <text x="744" y="178" fill="#c4edf0">NEXT / AI</text>
          <text x="361" y="242" transform="rotate(-32 361 242)" opacity=".65">− 200</text>
          <text x="728" y="510" transform="rotate(-64 728 510)" opacity=".65">− 1000</text>
          <text x="461" y="425" fontSize="9" opacity=".5">DEPTH</text>
        </g>
        <g transform="translate(883 89)" stroke="#7d9ba5" strokeWidth=".8">
          <circle r="24" opacity=".35" /><path d="M0-32v64M-32 0h64" opacity=".4" /><path d="m0-19-5 24 5-4 5 4Z" fill="#9abfc7" stroke="none" /><text x="-3" y="-40" fill="#a0b4bb" stroke="none" fontSize="9">N</text>
        </g>
      </svg>
      <div className="chart-caption"><span className="tiny-cross">+</span> A NEW COURSE, BUILT WITH INTENT.</div>
      <div className="chart-scale"><span /> <span /> <span /><small>ORIGIN → POSSIBILITY</small></div>
    </div>
  );
}
