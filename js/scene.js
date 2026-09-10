/* ═══════════════════════════════════════════════════════
   TETIFY — WebGL ambient scene (three.js)
   Particle field + wireframe core, scroll & pointer driven
   ═══════════════════════════════════════════════════════ */

import * as THREE from 'three';

const canvas = document.getElementById('webgl');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas) init();

function init () {
  const scene  = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x040706, 0.115);

  const camera = new THREE.PerspectiveCamera(52, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: false, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setClearColor(0x000000, 0);
  const dpr = () => Math.min(devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr());
  renderer.setSize(innerWidth, innerHeight, false);

  const isSmall = innerWidth < 820;
  const COUNT   = isSmall ? 2600 : 6200;

  /* ── geometry: sphere shell + inner haze + flat disc ────────── */
  const positions = new Float32Array(COUNT * 3);
  const scales    = new Float32Array(COUNT);
  const rands     = new Float32Array(COUNT);
  const kinds     = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const mode = Math.random();
    let x, y, z;

    if (mode < 0.62) {                       // shell
      const r  = 2.5 + Math.random() * 0.55;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      x = r * Math.sin(ph) * Math.cos(th);
      y = r * Math.cos(ph) * 0.82;
      z = r * Math.sin(ph) * Math.sin(th);
      kinds[i] = 0.0;
    } else if (mode < 0.84) {                // flat orbital disc
      const r  = 3.0 + Math.random() * 2.9;
      const th = Math.random() * Math.PI * 2;
      x = r * Math.cos(th);
      y = (Math.random() - 0.5) * 0.42;
      z = r * Math.sin(th);
      kinds[i] = 1.0;
    } else {                                 // outer dust
      x = (Math.random() - 0.5) * 15;
      y = (Math.random() - 0.5) * 9;
      z = (Math.random() - 0.5) * 11 - 2;
      kinds[i] = 2.0;
    }

    positions[i3] = x; positions[i3 + 1] = y; positions[i3 + 2] = z;
    scales[i] = 0.35 + Math.random() * Math.random() * 1.9;
    rands[i]  = Math.random();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aScale',   new THREE.BufferAttribute(scales, 1));
  geo.setAttribute('aRand',    new THREE.BufferAttribute(rands, 1));
  geo.setAttribute('aKind',    new THREE.BufferAttribute(kinds, 1));

  const uniforms = {
    uTime:    { value: 0 },
    uSize:    { value: isSmall ? 26 : 34 },
    uScroll:  { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uDpr:     { value: dpr() },
    cA:       { value: new THREE.Color('#00e07a') },
    cB:       { value: new THREE.Color('#7cffbe') },
    cC:       { value: new THREE.Color('#00d8c2') }
  };

  const vertex = /* glsl */`
    uniform float uTime;
    uniform float uSize;
    uniform float uScroll;
    uniform float uDpr;
    uniform vec2  uPointer;
    uniform vec3  cA, cB, cC;

    attribute float aScale;
    attribute float aRand;
    attribute float aKind;

    varying vec3  vColor;
    varying float vAlpha;

    /* cheap divergence-free-ish flow */
    vec3 flow (vec3 p, float t) {
      return vec3(
        sin(p.y * 1.10 + t * 0.55) + cos(p.z * 0.90 - t * 0.40),
        sin(p.z * 1.30 - t * 0.48) + cos(p.x * 1.05 + t * 0.33),
        sin(p.x * 1.18 + t * 0.42) + cos(p.y * 0.85 - t * 0.51)
      );
    }

    mat2 rot (float a) { float s = sin(a), c = cos(a); return mat2(c, -s, s, c); }

    void main () {
      vec3 p = position;
      float t = uTime;

      /* orbital spin — disc faster than shell */
      float spin = t * (aKind == 1.0 ? 0.085 : 0.045) + aRand * 0.4;
      p.xz = rot(spin) * p.xz;

      /* organic drift */
      p += flow(p * 0.42, t) * (0.10 + aRand * 0.20);

      /* breathing */
      p *= 1.0 + sin(t * 0.5 + aRand * 6.28) * 0.018;

      /* pointer repulsion — subtle, distance based */
      vec2 pull = uPointer * 1.15;
      float d   = distance(p.xy, pull);
      p.xy     += normalize(p.xy - pull + 0.0001) * (0.45 / (1.0 + d * d * 1.6));

      /* scroll: flatten + sink the field into an ambient layer */
      p.y *= mix(1.0, 0.42, uScroll);
      p.z -= uScroll * 1.6;
      p.xz = rot(uScroll * 0.7) * p.xz;

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;

      float radial = clamp(length(p) / 5.0, 0.0, 1.0);
      vec3 col = mix(cB, cA, smoothstep(0.05, 0.55, radial));
      col      = mix(col, cC, smoothstep(0.55, 1.0, radial) * 0.75);
      col      = mix(col, vec3(1.0), pow(1.0 - radial, 5.0) * 0.65);
      vColor   = col;

      float fade = 1.0 - smoothstep(6.0, 13.0, length(p));
      vAlpha = (0.28 + aRand * 0.72) * fade * mix(1.0, 0.55, uScroll);
      if (aKind == 2.0) vAlpha *= 0.5;

      gl_PointSize = uSize * aScale * uDpr * (1.0 / max(-mv.z, 0.001));
    }
  `;

  const fragment = /* glsl */`
    precision mediump float;
    varying vec3  vColor;
    varying float vAlpha;

    void main () {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      float a = smoothstep(0.5, 0.0, d);
      a = pow(a, 2.6);
      float core = pow(smoothstep(0.22, 0.0, d), 2.0);
      gl_FragColor = vec4(vColor + core * 0.55, a * vAlpha);
    }
  `;

  const points = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms, vertexShader: vertex, fragmentShader: fragment,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
  }));
  scene.add(points);

  /* ── wireframe core ─────────────────────────────────────────── */
  const core = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.55, 1)),
    new THREE.LineBasicMaterial({ color: 0x00e07a, transparent: true, opacity: 0.16 })
  );
  scene.add(core);

  const halo = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.35, 0)),
    new THREE.LineBasicMaterial({ color: 0x00d8c2, transparent: true, opacity: 0.075 })
  );
  scene.add(halo);

  /* ── interaction state ──────────────────────────────────────── */
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scroll = 0, scrollT = 0;

  addEventListener('pointermove', (e) => {
    pointer.tx = (e.clientX / innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / innerHeight) * 2 - 1);
  }, { passive: true });

  const onScroll = () => { scrollT = Math.min(scrollY / Math.max(innerHeight, 1), 1); };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(dpr());
    renderer.setSize(innerWidth, innerHeight, false);
    uniforms.uDpr.value = dpr();
  });

  let visible = true;
  document.addEventListener('visibilitychange', () => { visible = !document.hidden; });

  /* ── loop ───────────────────────────────────────────────────── */
  const clock = new THREE.Clock();

  function frame () {
    requestAnimationFrame(frame);
    if (!visible) return;

    const t = clock.getElapsedTime();

    pointer.x += (pointer.tx - pointer.x) * 0.045;
    pointer.y += (pointer.ty - pointer.y) * 0.045;
    scroll    += (scrollT - scroll) * 0.075;

    uniforms.uTime.value = reduced ? 0.0 : t;
    uniforms.uScroll.value = scroll;
    uniforms.uPointer.value.set(pointer.x * 2.6, pointer.y * 1.8);

    camera.position.x = pointer.x * 0.8;
    camera.position.y = pointer.y * 0.5 + scroll * 0.4;
    camera.position.z = 7.2 + scroll * 1.4;
    camera.lookAt(0, 0, 0);

    if (!reduced) {
      core.rotation.y = t * 0.11;
      core.rotation.x = Math.sin(t * 0.22) * 0.32;
      core.scale.setScalar(1 + Math.sin(t * 0.7) * 0.035 - scroll * 0.25);

      halo.rotation.y = -t * 0.06;
      halo.rotation.z = t * 0.035;
    }
    core.material.opacity = 0.16 * (1 - scroll * 0.7);
    halo.material.opacity = 0.075 * (1 - scroll * 0.8);

    canvas.style.opacity = String(1 - scroll * 0.55);

    renderer.render(scene, camera);
  }

  frame();
  document.documentElement.classList.add('webgl-ready');
}
