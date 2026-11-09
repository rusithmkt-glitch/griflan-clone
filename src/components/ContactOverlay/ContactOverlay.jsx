"use client";

import { useEffect, useState } from "react";
import "./ContactOverlay.css";

const budgets = ["$10k – $25k", "$25k – $50k", "$50k – $100k", "$100k+"];
const services = ["Brand Identity", "Web Design", "E-Commerce", "Motion", "Design Systems"];

export default function ContactOverlay({ open, onClose }) {
  const [sent, setSent] = useState(false);
  const [picked, setPicked] = useState(["Brand Identity"]);

  useEffect(() => {
    if (!open) return;
    setSent(false);
    function key(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", key);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  function toggle(s) {
    setPicked((p) => (p.includes(s) ? p.filter((x) => x !== s) : [...p, s]));
  }

  function submit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="contact-scrim" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="contact-panel" role="dialog" aria-modal="true" aria-label="Start a project">
        <button className="contact-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {sent ? (
          <div className="contact-success">
            <span className="contact-success-mark">✳</span>
            <h2>Brief received.</h2>
            <p>
              Thanks for reaching out. A producer will reply within one business day with next
              steps and a call slot.
            </p>
            <button className="contact-submit" onClick={onClose}>
              Back to the work
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="contact-kicker">New business</p>
            <h2 className="contact-title">
              Start A <em>Project</em>
            </h2>
            <p className="contact-lede">
              Tell us what you&apos;re making. We&apos;ll bring the brand, the site and the motion.
            </p>

            <div className="contact-row">
              <label>
                <span>Name</span>
                <input required name="name" placeholder="Ada Lovelace" autoComplete="name" />
              </label>
              <label>
                <span>Email</span>
                <input required type="email" name="email" placeholder="ada@studio.com" autoComplete="email" />
              </label>
            </div>

            <label>
              <span>Company</span>
              <input name="company" placeholder="Analytical Engines Ltd." autoComplete="organization" />
            </label>

            <div className="contact-field">
              <span className="contact-label">What do you need?</span>
              <div className="contact-chips">
                {services.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`contact-chip ${picked.includes(s) ? "is-on" : ""}`}
                    onClick={() => toggle(s)}
                    aria-pressed={picked.includes(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <label>
              <span>Budget</span>
              <select name="budget" defaultValue={budgets[1]}>
                {budgets.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </label>

            <label>
              <span>The brief</span>
              <textarea
                required
                name="brief"
                rows={4}
                placeholder="We're launching a better-for-you energy brand and need identity + site + launch film…"
              />
            </label>

            <button className="contact-submit" type="submit">
              Send the brief →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}