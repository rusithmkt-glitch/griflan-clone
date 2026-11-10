import "./Globe.css";
import Link from "next/link";

export default function Globe() {
  return (
    <Link className="globe" href="/" aria-label="Back to home">
      <div className="globe-sphere">
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <span key={deg} className="globe-ring" style={{ transform: `rotateY(${deg}deg)` }} />
        ))}
        <span className="globe-ring globe-equator" />
        <span className="globe-ring globe-tropic" style={{ transform: "rotateX(66deg)" }} />
        <span className="globe-ring globe-tropic" style={{ transform: "rotateX(-66deg)" }} />
      </div>
      <span className="globe-letter">G</span>
    </Link>
  );
}