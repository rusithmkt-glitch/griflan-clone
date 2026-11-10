"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import projects from "@/data/projects";
import { getBoardTiles } from "@/lib/boardArt";
import "./Gallery3D.css";

const CELL = 2;
const BOARD_COLS = 3;
const BOARD_ROWS = 2;
const PITCH_X = 4 * CELL;
const PITCH_Z = 8;
const GRID_COLS = 6;
const GRID_ROWS = 6;
const PERIOD_X = PITCH_X * GRID_COLS;
const PERIOD_Z = PITCH_Z * GRID_ROWS;
const CAM_Y = 8.5;
// Radius of the imaginary globe the floor wraps around; smaller = stronger dome.
const CURVE_R = 60;
const HALF = CELL / 2;
const HIGHLIGHT_COLORS = ["#a78bfa", "#d0527c", "#35e07a", "#ffb347"];

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

export default function Gallery3D({ onOpen }) {
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [fallback, setFallback] = useState(false);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setFallback(true);
      return;
    }

    let disposed = false;
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
    const boards = [];
    const pickMeshes = [];

    for (let slot = 0; slot < GRID_COLS * GRID_ROWS; slot++) {
      const project = projects[slot % projects.length];
      const group = new THREE.Group();
      const baseX = (slot % GRID_COLS) * PITCH_X;
      const baseZ = Math.floor(slot / GRID_COLS) * PITCH_Z;
      group.userData = { project, baseX, baseZ, lift: 0 };
      scene.add(group);
      boards.push(group);

      getBoardTiles(project).then((canvases) => {
        if (disposed) return;
        let texSet = texCache.get(project.slug);
        if (!texSet) {
          texSet = canvases.map((c) => {
            const tex = new THREE.CanvasTexture(c);
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = Math.min(
              8,
              renderer.capabilities.getMaxAnisotropy(),
            );
            textures.push(tex);
            return tex;
          });
          texCache.set(project.slug, texSet);
        }
        canvases.forEach((_, t) => {
          const col = t % BOARD_COLS;
          const row = Math.floor(t / BOARD_COLS);
          const geo = new THREE.PlaneGeometry(CELL, CELL);
          geo.rotateX(-Math.PI / 2);
          const mat = new THREE.MeshBasicMaterial({
            map: texSet[t],
            transparent: true,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set((col - 1) * CELL, 0.02, (row - 0.5) * CELL);
          mesh.userData.board = group;
          group.add(mesh);
          pickMeshes.push(mesh);
          geometries.push(geo);
          materials.push(mat);
        });
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
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let lastFrame = performance.now();
    let drift = 0;

    function onPointerDown(e) {
      dragging = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      container.setPointerCapture?.(e.pointerId);
      container.classList.add("is-dragging");
    }
    function onPointerMove(e) {
      const rect = container.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      lastMove = performance.now();
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        target.x -= dx * 0.02;
        target.z -= dy * 0.02;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    }
    function onPointerUp(e) {
      container.classList.remove("is-dragging");
      const wasDrag = moved > 6;
      dragging = false;
      if (!wasDrag && hovered) {
        onOpenRef.current?.(hovered.userData.project.slug);
      }
    }
    function onWheel(e) {
      e.preventDefault();
      target.z += e.deltaY * 0.012;
      target.x += e.deltaX * 0.012;
      lastMove = performance.now();
    }
    function onKey(e) {
      const step = 1.4;
      if (e.key === "ArrowUp" || e.key === "w") target.z -= step;
      else if (e.key === "ArrowDown" || e.key === "s") target.z += step;
      else if (e.key === "ArrowLeft" || e.key === "a") target.x -= step;
      else if (e.key === "ArrowRight" || e.key === "d") target.x += step;
      else return;
      lastMove = performance.now();
    }

    function onPointerLeave() {
      dragging = false;
      container.classList.remove("is-dragging");
    }

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointerleave", onPointerLeave);
    container.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
      // continuous spin: the globe rolls away from the viewer; only an active drag pauses it
      drift += ((dragging ? 0 : 0.9) - drift) * 0.02;
      target.z += drift * dt;
      cam.x += (target.x - cam.x) * 0.075;
      cam.z += (target.z - cam.z) * 0.075;

      camera.position.set(cam.x, CAM_Y, cam.z);
      camera.lookAt(cam.x, -9.2, cam.z - 10.8);

      grid.position.set(cam.x, 0, cam.z);

      for (const group of boards) {
        const { baseX, baseZ } = group.userData;
        const bx = wrap(baseX, cam.x, PERIOD_X);
        const bz = wrap(baseZ, cam.z, PERIOD_Z);
        const lx = bx - cam.x;
        const lz = bz - cam.z;
        const want = hovered === group ? 0.5 : 0;
        group.userData.lift += (want - group.userData.lift) * 0.12;
        const lift = group.userData.lift;
        // lay the board tangent to the globe surface at its position
        east.set(1, -lx / CURVE_R, 0).normalize();
        south.set(0, -lz / CURVE_R, 1).normalize();
        up.crossVectors(south, east).normalize();
        basis.makeBasis(east, up, south);
        group.quaternion.setFromRotationMatrix(basis);
        group.position.set(
          bx + up.x * lift,
          surfaceY(lx, lz) + up.y * lift,
          bz + up.z * lift,
        );
        const dist = camera.position.distanceTo(group.position);
        const t = Math.min(Math.max((dist - 14) / 9, 0), 1);
        const fade = 1 - t * t * (3 - 2 * t);
        for (const mesh of group.children) {
          mesh.material.opacity = fade;
          mesh.visible = fade > 0.02;
        }
      }

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickMeshes, false);
      const hit = hits.find((h) => h.object.visible);
      const next = hit ? hit.object.userData.board : null;
      if (next !== hovered) {
        hovered = next;
        container.style.cursor = hovered ? "pointer" : "";
      }

      const onFloor = raycaster.ray.intersectPlane(floorPlane, floorHit);
      const wantHit = onFloor && performance.now() - lastMove < 600 ? 1 : 0;
      hitOn += (wantHit - hitOn) * 0.12;
      gridMat.uniforms.uHitOn.value = hitOn;
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

      if (leftRef.current)
        leftRef.current.textContent = (91.737275 - cam.z * 1.3).toFixed(6);
      if (rightRef.current)
        rightRef.current.textContent = (cam.x * 1.7 - 30.166021).toFixed(6);

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
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      textures.forEach((t) => t.dispose());
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container)
        container.removeChild(renderer.domElement);
    };
  }, []);

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
