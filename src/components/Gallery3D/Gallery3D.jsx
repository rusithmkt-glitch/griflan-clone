"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import projects from "@/data/projects";
import { getBoardTiles } from "@/lib/projectArt";
import "./Gallery3D.css";

const CELL = 2;
// Boards span 4x2 cells with a 1-cell gap in x and a 2-cell gap in z, so every
// tile edge lands on a background grid line (a multiple of CELL).
const PITCH_X = 5 * CELL;
const PITCH_Z = 4 * CELL;
const GRID_COLS = 6;
const GRID_ROWS = 6;
const PERIOD_X = PITCH_X * GRID_COLS;
const PERIOD_Z = PITCH_Z * GRID_ROWS;
const CAM_Y = 8.5;
// Radius of the imaginary globe the floor wraps around; smaller = stronger dome.
const CURVE_R = 60;
const HALF = CELL / 2;
const HIGHLIGHT_COLORS = ["#a78bfa", "#d0527c", "#35e07a", "#ffb347"];

// Editorial collage: six tiles per board [wide, square, square, square, square,
// wide]. x/z are tile centres in board-local space, w/h are world units; every
// edge is a multiple of CELL so tiles share the floor's grid lines. Three
// arrangements keep the floor varied while each project keeps one identity.
const LAYOUTS = [
  [
    { x: -2, z: -1, w: 4, h: 2 },
    { x: 1, z: -1, w: 2, h: 2 },
    { x: 3, z: -1, w: 2, h: 2 },
    { x: -3, z: 1, w: 2, h: 2 },
    { x: -1, z: 1, w: 2, h: 2 },
    { x: 2, z: 1, w: 4, h: 2 },
  ],
  [
    { x: 2, z: -1, w: 4, h: 2 },
    { x: -1, z: -1, w: 2, h: 2 },
    { x: -3, z: -1, w: 2, h: 2 },
    { x: 3, z: 1, w: 2, h: 2 },
    { x: 1, z: 1, w: 2, h: 2 },
    { x: -2, z: 1, w: 4, h: 2 },
  ],
  [
    { x: 0, z: -1, w: 4, h: 2 },
    { x: -3, z: -1, w: 2, h: 2 },
    { x: 3, z: -1, w: 2, h: 2 },
    { x: 1, z: 1, w: 2, h: 2 },
    { x: 3, z: 1, w: 2, h: 2 },
    { x: -2, z: 1, w: 4, h: 2 },
  ],
];

const DRIFT_SPEED = 0.9;
const DRAG_SCALE = 0.02;
// Damping rates are per-second so motion feels identical at any refresh rate.
const DAMP_CAM = 4.7;
const DAMP_DRIFT = 1.2;
const DAMP_HIT = 7.7;
const DAMP_APPEAR = 3.5;
const FLING_DECAY = 2.6;
const MAX_FLING = 40;

function damp(cur, want, lambda, dt) {
  return cur + (want - cur) * (1 - Math.exp(-lambda * dt));
}

function surfaceY(lx, lz) {
  return -(lx * lx + lz * lz) / (2 * CURVE_R);
}

const gridVertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const gridFragment = /* glsl */ `
  varying vec3 vWorld;
  uniform vec3 uBg;
  uniform vec3 uLine;
  uniform vec3 uAccent;
  uniform vec2 uHit;
  uniform float uHitOn;
  uniform float uCell;
  void main() {
    vec2 p = vWorld.xz / uCell;
    vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    float line = 1.0 - min(min(g.x, g.y), 1.0);
    float dist = distance(vWorld, cameraPosition);
    float fade = 1.0 - smoothstep(40.0, 158.0, dist);
    vec3 col = mix(uBg, uLine, line * 0.85 * fade);
    // accent the two grid lines nearest the cursor, fading along their length
    vec2 ni = floor(p + 0.5);
    vec2 hc = floor(uHit / uCell + 0.5);
    float vSel = 1.0 - step(0.5, abs(ni.x - hc.x));
    float hSel = 1.0 - step(0.5, abs(ni.y - hc.y));
    float hl = max((1.0 - min(g.x, 1.0)) * vSel, (1.0 - min(g.y, 1.0)) * hSel);
    float near = 1.0 - smoothstep(uCell * 0.75, uCell * 2.2, distance(vWorld.xz, uHit));
    col = mix(col, uAccent, hl * near * uHitOn * fade * 0.9);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function Gallery3D({ onOpen, flyRef }) {
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [fallback, setFallback] = useState(false);
  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      queueMicrotask(() => {
        if (!disposed) setFallback(true);
      });
      return;
    }

    let raf = 0;
    const textures = [];
    const geometries = [];
    const materials = [];

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(new THREE.Color("#171516"));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      300,
    );

    const cam = { x: 0, z: 2 };
    const target = { x: 0, z: 2 };
    const east = new THREE.Vector3();
    const south = new THREE.Vector3();
    const up = new THREE.Vector3();
    const basis = new THREE.Matrix4();

    // ground grid: a camera-centred patch of the globe surface (curved heightfield)
    const gridGeo = new THREE.PlaneGeometry(300, 300, 200, 200);
    gridGeo.rotateX(-Math.PI / 2);
    {
      const pos = gridGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, surfaceY(x, z));
      }
      pos.needsUpdate = true;
      gridGeo.computeVertexNormals();
    }
    const gridMat = new THREE.ShaderMaterial({
      vertexShader: gridVertex,
      fragmentShader: gridFragment,
      uniforms: {
        uBg: { value: new THREE.Color("#171516").convertLinearToSRGB() },
        uLine: { value: new THREE.Color("#454344").convertLinearToSRGB() },
        uAccent: { value: new THREE.Color("#a78bfa").convertLinearToSRGB() },
        uHit: { value: new THREE.Vector2(0, 0) },
        uHitOn: { value: 0 },
        uCell: { value: CELL },
      },
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    scene.add(grid);
    geometries.push(gridGeo);
    materials.push(gridMat);

    // boards (textures are generated once per project and shared across its instances)
    const texCache = new Map();
    const geoCache = new Map();
    const boards = [];
    const pickMeshes = [];

    function tileGeometry(w, h) {
      const key = `${w}x${h}`;
      let geo = geoCache.get(key);
      if (!geo) {
        geo = new THREE.PlaneGeometry(w, h);
        geo.rotateX(-Math.PI / 2);
        geoCache.set(key, geo);
        geometries.push(geo);
      }
      return geo;
    }

    for (let slot = 0; slot < GRID_COLS * GRID_ROWS; slot++) {
      const project = projects[slot % projects.length];
      const layout = LAYOUTS[(project.id - 1) % LAYOUTS.length];
      const group = new THREE.Group();
      const baseX = (slot % GRID_COLS) * PITCH_X;
      const baseZ = Math.floor(slot / GRID_COLS) * PITCH_Z;
      group.userData = {
        project,
        baseX,
        baseZ,
        appear: 0,
        ready: false,
        appearAt: 0,
      };
      scene.add(group);
      boards.push(group);

      getBoardTiles(project).then((tiles) => {
        if (disposed) return;
        let texSet = texCache.get(project.slug);
        if (!texSet) {
          texSet = tiles.map((tile, i) => {
            const tex = new THREE.CanvasTexture(tile.canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = Math.min(
              8,
              renderer.capabilities.getMaxAnisotropy(),
            );
            // centre-crop the shared detail-page image to this slot's aspect
            // via UVs, so the card reuses the exact same asset, undistorted
            const slotA = layout[i].w / layout[i].h;
            const srcA = tile.w / tile.h;
            if (srcA > slotA) {
              tex.repeat.x = slotA / srcA;
              tex.offset.x = (1 - tex.repeat.x) / 2;
            } else if (srcA < slotA) {
              tex.repeat.y = srcA / slotA;
              tex.offset.y = (1 - tex.repeat.y) / 2;
            }
            textures.push(tex);
            return tex;
          });
          texCache.set(project.slug, texSet);
        }
        tiles.forEach((_, t) => {
          const r = layout[t];
          const mat = new THREE.MeshBasicMaterial({
            map: texSet[t],
            transparent: true,
            opacity: 0,
          });
          const mesh = new THREE.Mesh(tileGeometry(r.w, r.h), mat);
          mesh.position.set(r.x, 0.02, r.z);
          mesh.userData.board = group;
          group.add(mesh);
          pickMeshes.push(mesh);
          materials.push(mat);
        });
        group.userData.ready = true;
        group.userData.appearAt =
          performance.now() + (slot % projects.length) * 45;
      });
    }

    // interaction state
    const pointer = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const floorHit = new THREE.Vector3();
    let hitOn = 0;
    let accentIdx = -1;
    let lastMove = -1e9;
    let hovered = null;
    let dragging = false;
    let dragId = null;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let lastMoveT = 0;
    let velX = 0;
    let velZ = 0;
    let lastFrame = performance.now();
    let rect = container.getBoundingClientRect();
    let pointerDirty = true;
    let lastCast = 0;
    let lastCoord = 0;
    let drift = 0;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    function updateRect() {
      rect = container.getBoundingClientRect();
    }

    function onPointerDown(e) {
      if (dragId !== null) return;
      dragId = e.pointerId;
      dragging = true;
      moved = 0;
      velX = 0;
      velZ = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      lastMoveT = performance.now();
      updateRect();
      try {
        container.setPointerCapture(e.pointerId);
      } catch {}
      container.classList.add("is-dragging");
    }
    function onPointerMove(e) {
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      pointerDirty = true;
      lastMove = performance.now();
      if (!dragging || e.pointerId !== dragId) return;
      const now = performance.now();
      const dt = Math.max((now - lastMoveT) / 1000, 1 / 240);
      lastMoveT = now;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      const wx = -dx * DRAG_SCALE;
      const wz = -dy * DRAG_SCALE;
      target.x += wx;
      target.z += wz;
      // track fling velocity, smoothed across move events
      velX += (wx / dt - velX) * 0.4;
      velZ += (wz / dt - velZ) * 0.4;
      const speed = Math.hypot(velX, velZ);
      if (speed > MAX_FLING) {
        velX = (velX / speed) * MAX_FLING;
        velZ = (velZ / speed) * MAX_FLING;
      }
      lastX = e.clientX;
      lastY = e.clientY;
    }
    function onPointerUp(e) {
      if (e.pointerId !== dragId) return;
      container.classList.remove("is-dragging");
      const wasDrag = moved > 6;
      dragging = false;
      dragId = null;
      if (!wasDrag) {
        velX = 0;
        velZ = 0;
        if (hovered) onOpenRef.current?.(hovered.userData.project.slug);
      }
    }
    function onPointerCancel(e) {
      if (e.pointerId !== dragId) return;
      dragging = false;
      dragId = null;
      velX = 0;
      velZ = 0;
      container.classList.remove("is-dragging");
    }
    function onKey(e) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.tagName === "SELECT" ||
          t.isContentEditable)
      )
        return;
      const step = 1.4;
      if (e.key === "ArrowUp" || e.key === "w") target.z -= step;
      else if (e.key === "ArrowDown" || e.key === "s") target.z += step;
      else if (e.key === "ArrowLeft" || e.key === "a") target.x -= step;
      else if (e.key === "ArrowRight" || e.key === "d") target.x += step;
      else return;
      velX = 0;
      velZ = 0;
      lastMove = performance.now();
    }

    function onPointerLeave(e) {
      if (dragging && e.pointerId === dragId) {
        dragging = false;
        dragId = null;
      }
      container.classList.remove("is-dragging");
    }

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerCancel);
    container.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", updateRect, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      updateRect();
    });
    resizeObserver.observe(container);

    function wrap(base, camPos, period) {
      return base + Math.round((camPos - base) / period) * period;
    }

    function animate() {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastFrame) / 1000, 0.1);
      lastFrame = now;

      if (dragging) {
        // bleed tracked velocity so holding still before release doesn't fling
        const bleed = Math.exp(-10 * dt);
        velX *= bleed;
        velZ *= bleed;
      } else {
        // inertia: the floor keeps gliding after a flick, then settles
        target.x += velX * dt;
        target.z += velZ * dt;
        const decay = Math.exp(-FLING_DECAY * dt);
        velX *= decay;
        velZ *= decay;
        if (Math.abs(velX) < 0.01) velX = 0;
        if (Math.abs(velZ) < 0.01) velZ = 0;
      }
      // continuous auto-flyover: the floor keeps drifting forward on its own,
      // paused while dragging or during a fast fling (and for reduced motion).
      const speed = Math.hypot(velX, velZ);
      const driftWant =
        reduceMotion || dragging
          ? 0
          : DRIFT_SPEED * Math.min(Math.max(1 - speed / 2.5, 0), 1);
      drift = damp(drift, driftWant, DAMP_DRIFT, dt);
      target.z += drift * dt;
      cam.x = damp(cam.x, target.x, DAMP_CAM, dt);
      cam.z = damp(cam.z, target.z, DAMP_CAM, dt);
      // unbounded scroll travel flies the camera forward over the floor on top
      // of the auto-drift; dragging pans on top of both.
      const fly = flyRef ? flyRef.current : 0;
      const cz = cam.z + fly;

      camera.position.set(cam.x, CAM_Y, cz);
      camera.lookAt(cam.x, -9.2, cz - 10.8);

      grid.position.set(cam.x, 0, cz);

      for (const group of boards) {
        const ud = group.userData;
        const bx = wrap(ud.baseX, cam.x, PERIOD_X);
        const bz = wrap(ud.baseZ, cz, PERIOD_Z);
        const lx = bx - cam.x;
        const lz = bz - cz;
        ud.appear = damp(
          ud.appear,
          ud.ready && now >= ud.appearAt ? 1 : 0,
          DAMP_APPEAR,
          dt,
        );
        // lay the board tangent to the globe surface at its position
        east.set(1, -lx / CURVE_R, 0).normalize();
        south.set(0, -lz / CURVE_R, 1).normalize();
        up.crossVectors(south, east).normalize();
        basis.makeBasis(east, up, south);
        group.quaternion.setFromRotationMatrix(basis);
        group.position.set(bx, surfaceY(lx, lz), bz);
        const dist = camera.position.distanceTo(group.position);
        const t = Math.min(Math.max((dist - 14) / 9, 0), 1);
        const fade = 1 - t * t * (3 - 2 * t);
        const op = fade * ud.appear;
        for (const mesh of group.children) {
          if (mesh.material.opacity !== op) mesh.material.opacity = op;
          mesh.visible = op > 0.02;
        }
      }

      // picking only runs when the pointer moved or the camera drifted
      if (pointerDirty || now - lastCast > 50) {
        lastCast = now;
        pointerDirty = false;
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObjects(pickMeshes, false);
        const hit = hits.find((h) => h.object.visible);
        const next = hit ? hit.object.userData.board : null;
        if (next !== hovered) {
          hovered = next;
          container.style.cursor = hovered ? "pointer" : "";
        }

        const onFloor = raycaster.ray.intersectPlane(floorPlane, floorHit);
        const wantHit = onFloor && now - lastMove < 600 ? 1 : 0;
        hitOn = damp(hitOn, wantHit, DAMP_HIT, dt);
        if (onFloor) {
          gridMat.uniforms.uHit.value.set(floorHit.x, floorHit.z);
          const idx =
            (((Math.floor(floorHit.x / HALF) + Math.floor(floorHit.z / HALF)) %
              HIGHLIGHT_COLORS.length) +
              HIGHLIGHT_COLORS.length) %
            HIGHLIGHT_COLORS.length;
          if (idx !== accentIdx) {
            accentIdx = idx;
            gridMat.uniforms.uAccent.value
              .set(HIGHLIGHT_COLORS[idx])
              .convertLinearToSRGB();
          }
        }
      } else {
        hitOn = damp(hitOn, now - lastMove < 600 ? 1 : 0, DAMP_HIT, dt);
      }
      gridMat.uniforms.uHitOn.value = hitOn;

      if (now - lastCoord > 120) {
        lastCoord = now;
        if (leftRef.current)
          leftRef.current.textContent = (91.737275 - cz * 1.3).toFixed(6);
        if (rightRef.current)
          rightRef.current.textContent = (cam.x * 1.7 - 30.166021).toFixed(6);
      }

      renderer.render(scene, camera);
    }
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerCancel);
      container.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", updateRect);
      textures.forEach((t) => t.dispose());
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container)
        container.removeChild(renderer.domElement);
    };
  }, [flyRef]);

  if (fallback) {
    return (
      <div className="gallery3d-fallback">
        {projects.map((p) => (
          <button
            key={p.slug}
            className="fallback-card"
            style={{ background: p.bg }}
            onClick={() => onOpen(p.slug)}
          >
            <span style={{ color: p.accent }}>{p.wordmark || p.title}</span>
            <small>{p.category}</small>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="gallery3d-container">
      <span ref={leftRef} className="gallery-coord gallery-coord-left">
        89.137275
      </span>
      <span ref={rightRef} className="gallery-coord gallery-coord-right">
        -30.166021
      </span>
    </div>
  );
}
