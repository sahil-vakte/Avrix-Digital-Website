import { homeSection, site, ui } from '../../content';

/** Lightweight artwork built from SVG; no video, image download or canvas loop. */
export default function ConnectedVisual() {
  const paths = homeSection('hero').pillar_tabs || [];
  return (
    <div className="connected-visual">
      <div className="visual-topline">
        <span className="status-dot" />
        {ui.connectedApproach}
        <span>01 — 03</span>
      </div>
      <div className="orbit-art" aria-hidden="true">
        <svg viewBox="0 0 500 440" fill="none">
          <defs>
            <radialGradient id="orbit-halo">
              <stop stopColor="#f19e82" stopOpacity=".15" />
              <stop offset="1" stopColor="#f19e82" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="orbit-line"
              x1="100"
              y1="70"
              x2="390"
              y2="380"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#e6cfc7" />
              <stop offset=".55" stopColor="#ee8765" />
              <stop offset="1" stopColor="#6a3e30" />
            </linearGradient>
          </defs>
          <circle cx="250" cy="220" r="210" fill="url(#orbit-halo)" />
          <g stroke="#3a3230" strokeWidth="1">
            <path d="M0 220H500M250 0V440" />
            <circle cx="250" cy="220" r="190" strokeDasharray="3 9" />
            <path d="M38 30v18m-9-9h18M462 392v18m-9-9h18" />
          </g>
          <g className="orbit-sphere" stroke="url(#orbit-line)" strokeWidth="1.1">
            <circle cx="250" cy="220" r="151" />
            <ellipse cx="250" cy="220" rx="151" ry="52" transform="rotate(-30 250 220)" />
            <ellipse cx="250" cy="220" rx="151" ry="100" transform="rotate(-30 250 220)" />
            <ellipse cx="250" cy="220" rx="52" ry="151" transform="rotate(-30 250 220)" />
            <ellipse cx="250" cy="220" rx="100" ry="151" transform="rotate(-30 250 220)" />
            <path d="M119 296L381 144M175 89L325 351" />
          </g>
          <ellipse
            className="orbit-ring"
            cx="250"
            cy="220"
            rx="220"
            ry="66"
            transform="rotate(-30 250 220)"
            stroke="#f19f84"
            strokeWidth="1.5"
          />
          <circle cx="71" cy="325" r="7" fill="#e5cdc5" />
          <circle cx="430" cy="116" r="5" fill="#e5cdc5" />
          <circle cx="250" cy="220" r="28" fill="#1b1614" />
          <image href={site.favicon} x="232" y="202" width="36" height="36" />
        </svg>
        <span className="orbit-label label-grow">{paths[0]?.label}</span>
        <span className="orbit-label label-build">{paths[1]?.label}</span>
        <span className="orbit-label label-hire">{paths[2]?.label}</span>
      </div>
      <div className="visual-caption">
        <span>{site.brand_name}</span>
        <span>{ui.connectedCaption}</span>
      </div>
    </div>
  );
}
