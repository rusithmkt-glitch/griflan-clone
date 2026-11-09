"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import projects from "@/data/projects";
import { getBoardTiles } from "@/lib/boardArt";
import "./Gallery3D.css";

const CELL = 2;
const BOARD_COLS = 3;
const BOARD_ROWS = 2;
const PITCH_X = 5 * CELL;
const PITCH_Z = 4 * CELL;
const GRID_COLS = 6;
const GRID_ROWS = 6;
const PERIOD_X = PITCH_X * GRID_COLS;
const PERIOD_Z = PITCH_Z * GRID_ROWS;
const CAM_Y = 4;
// Radius of the imaginary globe the floor wraps around; smaller = stronger dome.
const CURVE_R = 140;

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
  uniform vec3 uAccentA;
  uniform vec3 uAccentB;
  uniform float uCell;
  float gridLine(vec2 p) {
    vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    vec2 p = vWorld.xz / uCell;
    float line = gridLine(p);
    vec2 p5 = vWorld.xz / (uCell * 5.0);
    float line5 = gridLine(p5);
    float dist = distance(vWorld, cameraPosition);
    float fade = 1.0 - smoothstep(24.0, 66.0, dist);
    vec3 col = uBg;
    col = mix(col, uLine, line * 0.55 * fade);
    float band = mod(floor(vWorld.x / (uCell * 5.0)) + floor(vWorld.z / (uCell * 5.0)), 3.0);
    vec3 accent = band < 1.0 ? uAccentA : (band < 2.0 ? uAccentB : uLine);
    col = mix(col, accent, line5 * 0.35 * fade);
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function Gallery3D({ onOpen }) {
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  const [fallback, setFallback] = useState(false);
  const [hint, setHint] = useState(true);
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
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
    renderer.setClearColor(new THREE.Color("#111111"));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 300);

    const cam = { x: 0, z: 6 };
    const target = { x: 0, z: 6 };
    const east = new THREE.Vector3();
    const south = new THREE.Vector3();
    const up = new THREE.Vector3();
    const basis = new THREE.Matrix4();

    // ground grid: a camera-centred patch of the globe surface (curved heightfield)
    const gridGeo = new THREE.PlaneGeometry(300, 300, 150, 150);
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
        uBg: { value: new THREE.Color("#111111").convertLinearToSRGB() },
        uLine: { value: new THREE.Color("#3a3a3a").convertLinearToSRGB() },
        uAccentA: { value: new THREE.Color("#35e07a").convertLinearToSRGB() },
        uAccentB: { value: new THREE.Color("#a78bfa").convertLinearToSRGB() },
        uCell: { value: CELL },
      },
    });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    scene.add(grid);
    geometries.push(gridGeo);
    materials.push(gridMat);

    // boards
    const loader = new THREE.TextureLoader();
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

      getBoardTiles(project).then((urls) => {
        if (disposed) return;
        urls.forEach((url, t) => {
          const col = t % BOARD_COLS;
          const row = Math.floor(t / BOARD_COLS);
          const geo = new THREE.PlaneGeometry(CELL * 0.96, CELL * 0.96);
          geo.rotateX(-Math.PI / 2);
          const mat = new THREE.MeshBasicMaterial({ color: project.bg, transparent: true });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set((col - 1) * CELL, 0.02, (row - 0.5) * CELL);
          mesh.userData.board = group;
          group.add(mesh);
          pickMeshes.push(mesh);
          geometries.push(geo);
          materials.push(mat);
          loader.load(url, (tex) => {
            if (disposed) {
              tex.dispose();
              return;
            }
            tex.colorSpace = THREE.SRGBColorSpace;
            tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
            mat.map = tex;
            mat.color.set("#ffffff");
            mat.needsUpdate = true;
            textures.push(tex);
          });
        });
      });
    }

    // interaction state
    const pointer = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    let hovered = null;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let interacted = false;

    function markInteracted() {
      if (!interacted) {
        interacted = true;
        setHint(false);
      }
    }

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
      if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        target.x -= dx * 0.02;
        target.z -= dy * 0.02;
        lastX = e.clientX;
        lastY = e.clientY;
        if (moved > 6) markInteracted();
      }
    }
    function onPointerUp(e) {
      container.classList.remove("is-dragging");
      const wasDrag = moved > 6;
      dragging = false;
      if (!wasDrag && hovered) {
        markInteracted();
        onOpenRef.current?.(hovered.userData.project.slug);
      }
    }
    function onWheel(e) {
      e.preventDefault();
      target.z += e.deltaY * 0.012;
      target.x += e.deltaX * 0.012;
      markInteracted();
    }
    function onKey(e) {
      const step = 1.4;
      if (e.key === "ArrowUp" || e.key === "w") target.z -= step;
      else if (e.key === "ArrowDown" || e.key === "s") target.z += step;
      else if (e.key === "ArrowLeft" || e.key === "a") target.x -= step;
      else if (e.key === "ArrowRight" || e.key === "d") target.x += step;
      else return;
      markInteracted();
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
      cam.x += (target.x - cam.x) * 0.075;
      cam.z += (target.z - cam.z) * 0.075;

      camera.position.set(cam.x, CAM_Y, cam.z);
      camera.lookAt(cam.x, -7.0, cam.z - 16);

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
        group.position.set(bx + up.x * lift, surfaceY(lx, lz) + up.y * lift, bz + up.z * lift);
        const dist = camera.position.distanceTo(group.position);
        const t = Math.min(Math.max((dist - 20) / 22, 0), 1);
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

      if (leftRef.current) leftRef.current.textContent = (cam.x * 1.7 + 79.78685).toFixed(6);
      if (rightRef.current) rightRef.current.textContent = (cam.z * 1.3 + 141.833979).toFixed(6);

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
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
    };
  }, []);

  if (fallback) {
    return (
      <div className="gallery3d-fallback">
        {projects.map((p) => (
          <button key={p.slug} className="fallback-card" style={{ background: p.bg }} onClick={() => onOpen(p.slug)}>
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
        79.786850
      </span>
      <span ref={rightRef} className="gallery-coord gallery-coord-right">
        149.833979
      </span>
      {hint && (
        <span className="gallery-hint">
          Drag / scroll to fly the floor · click a board to open
        </span>
      )}
    </div>
  );
}