import { tickerItems } from "@/data/projects";
import "./Ticker.css";

export default function Ticker() {
  const line = tickerItems.join("  •  ") + "  •  ";
  return (
    <div className="ticker" role="marquee" aria-label="Studio news">
      <div className="marquee">
        <div className="marquee-track" style={{ "--marquee-duration": "38s" }}>
          <span>{line}</span>
          <span aria-hidden="true">{line}</span>
        </div>
      </div>
    </div>
  );
}