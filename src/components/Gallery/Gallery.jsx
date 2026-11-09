"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import projects from "@/data/projects";
import "./Gallery.css";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Gallery() {
  const galleryRef = useRef(null);

  useGSAP(
    () => {
      const section = galleryRef.current;
      const plane = section.querySelector(".gallery-plane");

      // --------------------------------
      // 1. SCROLL ANIMATION
      // --------------------------------

      gsap.to(plane, {
        "--gallery-y": "-20vh",

        "--gallery-tilt": "64deg",

        "--gallery-scale": 1.05,

        "--gallery-scroll-rotate": "-18deg",

        ease: "none",

        scrollTrigger: {
          trigger: section,

          start: "top top",

          end: "bottom bottom",

          scrub: 1,
        },
      });

      // --------------------------------
      // 2. MOUSE MOVEMENT
      // --------------------------------

      const moveX = gsap.quickTo(plane, "--gallery-mouse-x", {
        duration: 0.8,
        ease: "power3.out",
      });

      const moveY = gsap.quickTo(plane, "--gallery-mouse-y", {
        duration: 0.8,
        ease: "power3.out",
      });

      const moveRotation = gsap.quickTo(plane, "--gallery-rotate-y", {
        duration: 0.8,
        ease: "power3.out",
      });

      function handleMouseMove(event) {
        const mouseX = event.clientX / window.innerWidth;
        const mouseY = event.clientY / window.innerHeight;

        // Horizontal movement
        moveX(`${(0.5 - mouseX) * 24}px`);

        // Vertical movement
        moveY(`${(0.5 - mouseY) * 16}px`);

        // Rotation movement
        moveRotation(`${(mouseX - 0.5) * 3}deg`);
      }

      function resetMouseMovement() {
        moveX("0px");
        moveY("0px");
        moveRotation("0deg");
      }

      section.addEventListener("pointermove", handleMouseMove);

      section.addEventListener("pointerleave", resetMouseMovement);

      // --------------------------------
      // 3. CLEANUP
      // --------------------------------

      return () => {
        section.removeEventListener("pointermove", handleMouseMove);

        section.removeEventListener("pointerleave", resetMouseMovement);
      };
    },
    { scope: galleryRef },
  );

  return (
    <section className="gallery-section" ref={galleryRef}>
      <div className="gallery-perspective">
        <div className="gallery-plane">
          <div className="gallery-grid">
            {projects.map((project) => (
              <div className="gallery-item" key={project.id}>
                <div
                  className="project-thumbnail"
                  style={{
                    backgroundColor: project.color,
                  }}
                >
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-image"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="project-overlay">
                    <span className="project-category">{project.category}</span>

                    <h3 className="project-title">{project.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
