const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

/* ===============================
   CENTERS
================================*/
let circleCenterX = canvas.width / 2;
let circleCenterY = canvas.height / 2;
let cubeCenterX = canvas.width / 2 + 450;
let cubeCenterY = canvas.height / 2;

/* ===============================
   SETTINGS
================================*/
const COUNT = 1400;
const SPHERE_RADIUS = 200;
const CUBE_SIZE = 260;

const particles = [];

let sphereVisibility = 0; // page-1 → page-2
let morph = 0; // page-2
let cubeVisibility = 1; // page-3

/* ===============================
   HELPERS
================================*/
const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;

/* ===============================
   MOUSE
================================*/
const mouse = { x: null, y: null, radius: 140, strength: 2.2 };

addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
addEventListener("mouseleave", () => (mouse.x = null));

/* ===============================
   SCROLL TIMELINE
================================*/
addEventListener("scroll", () => {
  const vh = innerHeight;
  const y = scrollY;

  sphereVisibility = clamp(y / vh); // page-1 → page-2
  morph = clamp((y - vh) / vh); // page-2
  cubeVisibility = clamp(1 - (y - 2 * vh) / vh); // page-3
});

/* ===============================
   PARTICLES
================================*/
for (let i = 0; i < COUNT; i++) {
  // Sphere
  const u = Math.random();
  const v = Math.random();
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);

  const sx = Math.sin(phi) * Math.cos(theta) * SPHERE_RADIUS;
  const sy = Math.sin(phi) * Math.sin(theta) * SPHERE_RADIUS;
  const sz = Math.cos(phi) * SPHERE_RADIUS;

  // Cube
  const face = Math.floor(Math.random() * 6);
  let cx = (Math.random() - 0.5) * CUBE_SIZE;
  let cy = (Math.random() - 0.5) * CUBE_SIZE;
  let cz = (Math.random() - 0.5) * CUBE_SIZE;

  if (face === 0) cz = CUBE_SIZE / 2;
  if (face === 1) cz = -CUBE_SIZE / 2;
  if (face === 2) cx = CUBE_SIZE / 2;
  if (face === 3) cx = -CUBE_SIZE / 2;
  if (face === 4) cy = CUBE_SIZE / 2;
  if (face === 5) cy = -CUBE_SIZE / 2;

  particles.push({
    x: circleCenterX,
    y: circleCenterY,
    vx: 0,
    vy: 0,
    sx,
    sy,
    sz,
    cx,
    cy,
    cz,
    size: Math.random() * 1.2 + 0.6,
  });
}

/* ===============================
   PROJECTION
================================*/
function project(x, y, z, cx, cy, depth) {
  const scale = depth / (depth + z);
  return { x: cx + x * scale, y: cy + y * scale, scale };
}

/* ===============================
   ROTATION
================================*/
let rx = 0,
  ry = 0,
  rz = 0;

/* ===============================
   ANIMATION
================================*/
function animate() {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  rx += 0.002 + morph * 0.004;
  ry += 0.003 + morph * 0.004;
  rz += 0.0015 + morph * 0.002;

  particles.forEach((p) => {
    /* ---- SPHERE ---- */
    const sx1 = p.sx * Math.cos(ry) - p.sz * Math.sin(ry);
    const sz1 = p.sx * Math.sin(ry) + p.sz * Math.cos(ry);
    const sphere = project(sx1, p.sy, sz1, circleCenterX, circleCenterY, 520);

    /* ---- CUBE ---- */
    let x = p.cx,
      y = p.cy,
      z = p.cz;

    let y1 = y * Math.cos(rx) - z * Math.sin(rx);
    let z1 = y * Math.sin(rx) + z * Math.cos(rx);

    let x2 = x * Math.cos(ry) - z1 * Math.sin(ry);
    let z2 = x * Math.sin(ry) + z1 * Math.cos(ry);

    let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
    let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);

    const cube = project(x3, y3, z2, cubeCenterX, cubeCenterY, 720);

    /* ---- MORPH POSITION ---- */
    const tx = lerp(sphere.x, cube.x, morph);
    const ty = lerp(sphere.y, cube.y, morph);

    /* ---- MORPH SCALE (CRITICAL FIX) ---- */
    const scale = lerp(sphere.scale, cube.scale, morph);

    const attract = 0.015 + sphereVisibility * 0.03;
    p.vx += (tx - p.x) * attract;
    p.vy += (ty - p.y) * attract;

    if (mouse.x) {
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const d = Math.hypot(dx, dy);
      if (d < mouse.radius) {
        const f = (1 - d / mouse.radius) * mouse.strength * sphereVisibility;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    }

    p.vx *= 0.88;
    p.vy *= 0.88;
    p.x += p.vx;
    p.y += p.vy;

    const alpha = (0.2 + scale * 0.6) * sphereVisibility * cubeVisibility;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * scale, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(143,140,255,${alpha})`;
    ctx.fill();
  });
}

animate();

/* ===============================
   RESIZE
================================*/
addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  circleCenterX = canvas.width / 2;
  circleCenterY = canvas.height / 2;
  cubeCenterX = canvas.width / 2 + 360;
  cubeCenterY = canvas.height / 2;
});


document.getElementById("downloadBtn").addEventListener("click", function () {

    const link = document.createElement("a");
    
    // PDF path
    link.href = "sample.pdf";

    // Force download
    link.setAttribute("download", "MyFile.pdf");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

});


