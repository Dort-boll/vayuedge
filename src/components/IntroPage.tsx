import React, { useEffect, useRef } from 'react';

// Declare globals for libraries loaded via CDN in index.html
declare global {
  interface Window {
    THREE: any;
    gsap: any;
    ScrollTrigger: any;
    Lenis: any;
  }
}

interface IntroPageProps {
  onSignIn: () => void;
}

export default function IntroPage({ onSignIn }: IntroPageProps) {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const networkCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // --------------------------------------------------
    // 1. STYLESHEET CONFIG & THEME EXTENSION
    // --------------------------------------------------
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      :root {
        --space-bg: #02040A;
        --space-fg: #E8F4FF;
        --space-muted: #6B7FA0;
        --space-accent: #5EEBFF;
        --space-accent2: #4F8FFF;
        --space-accent3: #8B5CFF;
        --space-highlight: #00FFD1;
        --space-glass: rgba(255,255,255,.07);
        --space-border: rgba(255,255,255,.12);
        --space-card: rgba(255,255,255,.04);
      }
      
      .intro-body {
        font-family: 'Space Grotesk', sans-serif !important;
        background: var(--space-bg) !important;
        color: var(--space-fg) !important;
        overflow-x: hidden !important;
        -webkit-font-smoothing: antialiased;
      }

      #hero-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
      }
      #bg-canvas {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        opacity: .35;
      }

      .noise-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        pointer-events: none;
        opacity: .035;
        mix-blend-mode: overlay;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-repeat: repeat;
        background-size: 256px 256px;
      }

      #cursor-spotlight {
        position: fixed;
        width: 600px;
        height: 600px;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        background: radial-gradient(circle, rgba(94,235,255,.04) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        transition: opacity .3s ease;
        will-change: transform;
      }

      .aurora-layer {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
      }
      .aurora-blob {
        position: absolute;
        border-radius: 50%;
        filter: blur(130px);
        opacity: .12;
        will-change: transform;
      }
      .aurora-1 {
        width: 60vw;
        height: 60vh;
        top: -10%;
        left: -10%;
        background: radial-gradient(ellipse, rgba(79,143,255,.6), transparent 70%);
        animation: ad1 22s ease-in-out infinite;
      }
      .aurora-2 {
        width: 50vw;
        height: 50vh;
        top: 20%;
        right: -15%;
        background: radial-gradient(ellipse, rgba(139,92,255,.5), transparent 70%);
        animation: ad2 28s ease-in-out infinite;
      }
      .aurora-3 {
        width: 40vw;
        height: 40vh;
        bottom: -5%;
        left: 20%;
        background: radial-gradient(ellipse, rgba(0,255,209,.4), transparent 70%);
        animation: ad3 19s ease-in-out infinite;
      }
      .aurora-4 {
        width: 30vw;
        height: 30vh;
        top: 50%;
        left: 50%;
        background: radial-gradient(ellipse, rgba(94,235,255,.3), transparent 70%);
        animation: ad4 25s ease-in-out infinite;
      }
      @keyframes ad1 {
        0%, 100% { transform: translate(0,0) scale(1) rotate(0deg); }
        33% { transform: translate(10vw,5vh) scale(1.15) rotate(5deg); }
        66% { transform: translate(-5vw,10vh) scale(.9) rotate(-3deg); }
      }
      @keyframes ad2 {
        0%, 100% { transform: translate(0,0) scale(1); }
        33% { transform: translate(-8vw,-8vh) scale(1.2) rotate(-5deg); }
        66% { transform: translate(5vw,3vh) scale(.85) rotate(4deg); }
      }
      @keyframes ad3 {
        0%, 100% { transform: translate(0,0) scale(1); }
        50% { transform: translate(8vw,-5vh) scale(1.25); }
      }
      @keyframes ad4 {
        0%, 100% { transform: translate(-50%,-50%) scale(1); }
        50% { transform: translate(-40%,-60%) scale(1.3); }
      }

      .space-glass {
        background: var(--space-glass);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--space-border);
        border-radius: 16px;
      }
      .space-glass-strong {
        background: rgba(255,255,255,.08);
        backdrop-filter: blur(40px);
        -webkit-backdrop-filter: blur(40px);
        border: 1px solid rgba(255,255,255,.13);
        border-radius: 16px;
      }
      .space-glass-terminal {
        background: rgba(2,4,10,.78);
        backdrop-filter: blur(30px);
        -webkit-backdrop-filter: blur(30px);
        border: 1px solid rgba(94,235,255,.18);
        border-radius: 20px;
        box-shadow: 0 0 80px rgba(94,235,255,.07), 0 30px 60px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08);
      }
      .space-glass-window {
        background: rgba(2,4,10,.45);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 12px;
        transition: all .6s cubic-bezier(.25,.46,.45,.94);
      }
      .space-glass-window:hover {
        background: rgba(2,4,10,.65);
        border-color: rgba(94,235,255,.2);
        backdrop-filter: blur(22px);
      }

      .floating-window {
        position: absolute;
        will-change: transform;
        transition: transform .5s cubic-bezier(.25,.46,.45,.94), opacity .5s ease;
      }
      .floating-window:hover {
        transform: scale(1.06) translateZ(20px) !important;
        opacity: 1 !important;
      }

      @keyframes fw1 { 0%,100%{transform:translate(0,0) rotate(-2deg)} 50%{transform:translate(6px,-10px) rotate(.5deg)} }
      @keyframes fw2 { 0%,100%{transform:translate(0,0) rotate(1deg)} 50%{transform:translate(-7px,6px) rotate(-1.5deg)} }
      @keyframes fw3 { 0%,100%{transform:translate(0,0) rotate(.5deg)} 50%{transform:translate(5px,8px) rotate(-.5deg)} }
      @keyframes fw4 { 0%,100%{transform:translate(0,0) rotate(-1deg)} 50%{transform:translate(-4px,-7px) rotate(1deg)} }
      @keyframes fw5 { 0%,100%{transform:translate(0,0) rotate(1.5deg)} 50%{transform:translate(8px,4px) rotate(-1.5deg)} }
      @keyframes fw6 { 0%,100%{transform:translate(0,0) rotate(-.5deg)} 50%{transform:translate(-6px,-5px) rotate(.5deg)} }

      .header-glass {
        background: rgba(255, 255, 255, 0.03) !important;
        backdrop-filter: blur(28px) saturate(180%) !important;
        -webkit-backdrop-filter: blur(28px) saturate(180%) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        transition: all 0.5s cubic-bezier(.25,.46,.45,.94);
        position: fixed !important;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        overflow: hidden;
      }
      
      /* Beveled glass mirror edge effect */
      .header-glass::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, 
          rgba(255,255,255,0) 0%, 
          rgba(94,235,255,0.4) 15%, 
          rgba(255,255,255,0.6) 50%, 
          rgba(139,92,255,0.4) 85%, 
          rgba(255,255,255,0) 100%
        );
        opacity: 0.7;
        z-index: 2;
        pointer-events: none;
      }

      /* Premium Mirror Diagonal Sheen Effect */
      .header-glass .mirror-sheen {
        position: absolute;
        top: 0;
        left: -150%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0) 10%,
          rgba(255, 255, 255, 0.15) 30%,
          rgba(255, 255, 255, 0.25) 50%,
          rgba(255, 255, 255, 0.15) 70%,
          rgba(255, 255, 255, 0) 90%,
          transparent
        );
        transform: skewX(-30deg);
        pointer-events: none;
        z-index: 1;
        animation: mirrorSwipe 8s ease-in-out infinite;
      }

      @keyframes mirrorSwipe {
        0% { left: -150%; }
        15% { left: 150%; }
        100% { left: 150%; }
      }

      .header-glass.scrolled {
        background: rgba(2, 4, 10, 0.78) !important;
        backdrop-filter: blur(35px) saturate(200%) !important;
        -webkit-backdrop-filter: blur(35px) saturate(200%) !important;
        border-bottom-color: rgba(94, 235, 255, 0.25) !important;
        box-shadow: 0 10px 50px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      }

      .btn-primary-space {
        position: relative;
        background: linear-gradient(135deg, #5EEBFF, #4F8FFF);
        color: #02040A;
        font-weight: 600;
        border-radius: 14px;
        overflow: hidden;
        transition: all .4s cubic-bezier(.25,.46,.45,.94);
        cursor: pointer;
      }
      .btn-primary-space::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, #4F8FFF, #8B5CFF);
        opacity: 0;
        transition: opacity .4s ease;
      }
      .btn-primary-space:hover::before {
        opacity: 1;
      }
      .btn-primary-space:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(94,235,255,.35);
      }
      .btn-primary-space:active {
        transform: translateY(-1px) scale(.98);
      }
      .btn-primary-space span {
        position: relative;
        z-index: 1;
      }

      .btn-secondary-space {
        position: relative;
        background: transparent;
        border: 1px solid rgba(94,235,255,.25);
        color: #5EEBFF;
        border-radius: 14px;
        transition: all .4s cubic-bezier(.25,.46,.45,.94);
        cursor: pointer;
        overflow: hidden;
      }
      .btn-secondary-space:hover {
        background: rgba(94,235,255,.08);
        border-color: rgba(94,235,255,.45);
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(94,235,255,.12);
      }
      .btn-secondary-space:active {
        transform: translateY(-1px) scale(.98);
      }

      .terminal-line {
        opacity: 0;
        transform: translateY(6px);
      }
      .terminal-line.visible {
        opacity: 1;
        transform: translateY(0);
        transition: all .18s ease;
      }

      .cursor-blink {
        display: inline-block;
        width: 8px;
        height: 18px;
        background: #5EEBFF;
        animation: blink 1s step-end infinite;
        vertical-align: middle;
        margin-left: 2px;
        border-radius: 1px;
      }
      @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

      .tilt-card {
        transform-style: preserve-3d;
        transition: transform .2s cubic-bezier(.25,.46,.45,.94), box-shadow .4s ease;
        will-change: transform;
      }
      .tilt-card .card-shine {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(94,235,255,.1), transparent 60%);
        opacity: 0;
        transition: opacity .4s ease;
        pointer-events: none;
        z-index: 2;
      }
      .tilt-card:hover .card-shine { opacity: 1; }
      .tilt-card:hover {
        box-shadow: 0 20px 60px rgba(0,0,0,.3), 0 0 40px rgba(94,235,255,.05);
      }

      .glow-text {
        text-shadow: 0 0 40px rgba(94,235,255,.25), 0 0 80px rgba(94,235,255,.08);
      }
      .gradient-text-intro {
        background: linear-gradient(135deg, #5EEBFF 0%, #4F8FFF 40%, #8B5CFF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .gradient-text-alt {
        background: linear-gradient(135deg, #00FFD1 0%, #5EEBFF 50%, #4F8FFF 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .marquee-track {
        display: flex;
        width: max-content;
        animation: marqueeScroll 40s linear infinite;
      }
      @keyframes marqueeScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      .marquee-item {
        flex-shrink: 0;
        padding: 0 2rem;
        white-space: nowrap;
      }

      @keyframes pulse-ring { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(2.5); opacity: 0; } }
      .pulse-dot {
        position: relative;
      }
      .pulse-dot::after {
        content: '';
        position: absolute;
        inset: -4px;
        border-radius: 50%;
        border: 1px solid currentColor;
        animation: pulse-ring 2s ease-out infinite;
      }

      .status-bar-item {
        border-right: 1px solid rgba(255,255,255,.05);
      }
      .status-bar-item:last-child {
        border-right: none;
      }
      .mini-bar {
        height: 3px;
        border-radius: 2px;
        background: rgba(255,255,255,.05);
        overflow: hidden;
      }
      .mini-bar-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 1.2s cubic-bezier(.16,1,.3,1);
      }

      @keyframes scanline { 0% { top: -2px; } 100% { top: 100%; } }
      .scanline {
        position: relative;
        overflow: hidden;
      }
      .scanline::after {
        content: '';
        position: absolute;
        left: 0; right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(94,235,255,.08), transparent);
        animation: scanline 5s linear infinite;
        pointer-events: none;
        z-index: 5;
      }

      .nav-link-space {
        position: relative;
        color: var(--space-muted);
        transition: color .3s ease;
        font-size: .875rem;
        font-weight: 500;
      }
      .nav-link-space:hover {
        color: var(--space-fg);
      }
      .nav-link-space::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 0;
        height: 1px;
        background: var(--space-accent);
        transition: width .3s ease;
        border-radius: 1px;
      }
      .nav-link-space:hover::after {
        width: 100%;
      }

      .sparkle {
        position: absolute;
        width: 2px;
        height: 2px;
        background: #fff;
        border-radius: 50%;
        pointer-events: none;
        animation: sparkleAnim var(--dur, 3s) ease-in-out infinite;
        animation-delay: var(--delay, 0s);
      }
      @keyframes sparkleAnim { 0%, 100% { opacity: 0; transform: scale(0); } 50% { opacity: .8; transform: scale(1); } }

      @keyframes scrollDot { 0%, 100% { transform: translateY(0); opacity: 1; } 50% { transform: translateY(12px); opacity: .2; } }

      #scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        height: 2px;
        background: linear-gradient(90deg, #5EEBFF, #4F8FFF, #8B5CFF);
        z-index: 100;
        transform-origin: left;
        transform: scaleX(0);
        width: 100%;
      }

      @media(max-width: 768px) {
        .floating-window { display: none !important; }
        .terminal-wrap { min-width: auto !important; max-width: 95vw !important; }
        .status-bar { flex-wrap: wrap; gap: 6px !important; }
        .status-bar-item { flex: 1 1 auto; min-width: 90px; }
      }
    `;
    document.head.appendChild(styleEl);

    // --------------------------------------------------
    // 2. CURSOR SPOTLIGHT
    // --------------------------------------------------
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, nx: 0, ny: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.nx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ny = -(e.clientY / window.innerHeight) * 2 + 1;
      const sl = document.getElementById('cursor-spotlight');
      if (sl) {
        sl.style.left = e.clientX + 'px';
        sl.style.top = e.clientY + 'px';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    // --------------------------------------------------
    // 3. LENIS SMOOTH SCROLL
    // --------------------------------------------------
    let lenis: any = null;
    if (window.Lenis) {
      lenis = new window.Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false
      });
      if (window.ScrollTrigger) {
        lenis.on('scroll', window.ScrollTrigger.update);
      }
      
      // Progress bar on scroll
      lenis.on('scroll', ({ progress }: any) => {
        const bar = document.getElementById('scroll-progress');
        if (bar) bar.style.transform = `scaleX(${progress})`;
      });

      // Header scrolled class
      lenis.on('scroll', ({ scroll }: any) => {
        const header = document.getElementById('main-header');
        if (header) {
          if (scroll > 60) header.classList.add('scrolled');
          else header.classList.remove('scrolled');
        }
      });
    }

    // --------------------------------------------------
    // 4. PARTICLE BACKGROUND CANVAS
    // --------------------------------------------------
    const bgCanvas = bgCanvasRef.current;
    let bgCtx: CanvasRenderingContext2D | null = null;
    let bgParticles: any[] = [];
    let bgAnimationId: number;

    const resizeBgCanvas = () => {
      if (bgCanvas) {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
      }
    };

    if (bgCanvas) {
      bgCtx = bgCanvas.getContext('2d');
      resizeBgCanvas();
      for (let i = 0; i < 150; i++) {
        bgParticles.push({
          x: Math.random() * bgCanvas.width,
          y: Math.random() * bgCanvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 1.8 + 0.3,
          opacity: Math.random() * 0.4 + 0.05,
          color: ['#5EEBFF', '#4F8FFF', '#8B5CFF', '#00FFD1'][Math.floor(Math.random() * 4)],
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: 0.01 + Math.random() * 0.02
        });
      }
    }

    const drawBgParticles = () => {
      if (!bgCtx || !bgCanvas) return;
      bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
      bgParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        if (p.x < 0) p.x = bgCanvas.width;
        if (p.x > bgCanvas.width) p.x = 0;
        if (p.y < 0) p.y = bgCanvas.height;
        if (p.y > bgCanvas.height) p.y = 0;

        const op = p.opacity * (0.7 + Math.sin(p.pulse) * 0.3);
        const r = parseInt(p.color.slice(1, 3), 16);
        const g = parseInt(p.color.slice(3, 5), 16);
        const b = parseInt(p.color.slice(5, 7), 16);

        bgCtx!.beginPath();
        bgCtx!.arc(p.x, p.y, Math.max(0.1, p.size * 4), 0, Math.PI * 2);
        bgCtx!.fillStyle = `rgba(${r},${g},${b},${op * 0.12})`;
        bgCtx!.fill();

        bgCtx!.beginPath();
        bgCtx!.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
        bgCtx!.fillStyle = `rgba(${r},${g},${b},${op})`;
        bgCtx!.fill();
      });
    };

    // --------------------------------------------------
    // 5. THREE.JS 3D GLOBE
    // --------------------------------------------------
    let globeGroup: any;
    let threeRenderer: any;
    let threeScene: any;
    let threeCamera: any;
    let connectionLines: any;
    let orbitingParticles: any;
    let dataPackets: any[] = [];

    const latLonToVec3 = (lat: number, lon: number, r: number) => {
      const ph = (90 - lat) * (Math.PI / 180);
      const th = (lon + 180) * (Math.PI / 180);
      return new window.THREE.Vector3(-r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
    };

    const generateGlobeNodes = (count: number) => {
      const nodes = [];
      const lr = [
        { lat: 40, lon: -100, s: 25 }, { lat: -15, lon: -55, s: 20 }, { lat: 48, lon: 10, s: 15 }, { lat: 10, lon: 20, s: 20 },
        { lat: 45, lon: 90, s: 25 }, { lat: -25, lon: 135, s: 15 }, { lat: 35, lon: 138, s: 8 }, { lat: 1, lon: 104, s: 10 },
        { lat: 55, lon: 38, s: 15 }, { lat: 30, lon: -90, s: 12 }
      ];
      for (let i = 0; i < count; i++) {
        let lat, lon;
        if (Math.random() < 0.82) {
          const rg = lr[Math.floor(Math.random() * lr.length)];
          lat = rg.lat + (Math.random() - .5) * rg.s * 2;
          lon = rg.lon + (Math.random() - .5) * rg.s * 2;
        } else {
          lat = (Math.random() - .5) * 180;
          lon = (Math.random() - .5) * 360;
        }
        nodes.push(latLonToVec3(lat, lon, 1.82 + (Math.random() - .5) * .04));
      }
      return nodes;
    };

    if (heroCanvasRef.current && window.THREE) {
      const THREE = window.THREE;
      threeScene = new THREE.Scene();
      threeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      threeCamera.position.z = 5.8;
      threeCamera.position.y = 0.3;

      threeRenderer = new THREE.WebGLRenderer({ canvas: heroCanvasRef.current, alpha: true, antialias: true });
      threeRenderer.setSize(window.innerWidth, window.innerHeight);
      threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      threeRenderer.setClearColor(0x000000, 0);

      globeGroup = new THREE.Group();
      threeScene.add(globeGroup);

      // Wireframe
      const wg = new THREE.IcosahedronGeometry(1.8, 4);
      const wm = new THREE.MeshBasicMaterial({ color: 0x5EEBFF, wireframe: true, transparent: true, opacity: 0.06 });
      globeGroup.add(new THREE.Mesh(wg, wm));

      // Inner glow
      const ig = new THREE.SphereGeometry(1.75, 32, 32);
      globeGroup.add(new THREE.Mesh(ig, new THREE.MeshBasicMaterial({ color: 0x5EEBFF, transparent: true, opacity: 0.025, side: THREE.BackSide })));

      // Atmosphere
      const ag = new THREE.SphereGeometry(2.15, 32, 32);
      globeGroup.add(new THREE.Mesh(ag, new THREE.MeshBasicMaterial({ color: 0x4F8FFF, transparent: true, opacity: 0.015, side: THREE.BackSide })));

      // Surface nodes
      const np = generateGlobeNodes(700);
      const ng = new THREE.BufferGeometry();
      const pos = new Float32Array(np.length * 3);
      const cols = new Float32Array(np.length * 3);
      const cp = [new THREE.Color(0x5EEBFF), new THREE.Color(0x4F8FFF), new THREE.Color(0x8B5CFF), new THREE.Color(0x00FFD1)];
      np.forEach((p, i) => {
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
        const c = cp[Math.floor(Math.random() * cp.length)];
        cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
      });
      ng.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      ng.setAttribute('color', new THREE.BufferAttribute(cols, 3));
      globeGroup.add(new THREE.Points(ng, new THREE.PointsMaterial({
        size: 0.022,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
      })));

      // Arcs & Packets
      const cities = [
        { lat: 35.68, lon: 139.69 }, { lat: 1.35, lon: 103.82 }, { lat: 50.11, lon: 8.68 }, { lat: 51.51, lon: -0.13 },
        { lat: 25.20, lon: 55.27 }, { lat: -33.87, lon: 151.21 }, { lat: -23.55, lon: -46.63 }, { lat: 38.90, lon: -77.04 },
        { lat: 37.77, lon: -122.42 }, { lat: 48.86, lon: 2.35 }, { lat: 19.43, lon: -99.13 }, { lat: 28.61, lon: 77.21 },
        { lat: -1.29, lon: 36.82 }, { lat: 55.75, lon: 37.62 }, { lat: 39.90, lon: 116.40 }, { lat: 37.57, lon: 126.98 }
      ];
      const cp2 = cities.map(c => latLonToVec3(c.lat, c.lon, 1.82));
      connectionLines = new THREE.Group();
      for (let i = 0; i < cities.length; i++) {
        for (let j = i + 1; j < cities.length; j++) {
          if (Math.random() < 0.32) {
            const s = cp2[i], e = cp2[j];
            const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);
            mid.normalize().multiplyScalar(1.82 + s.distanceTo(e) * 0.38);
            const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
            const pts = curve.getPoints(48);
            const lg = new THREE.BufferGeometry().setFromPoints(pts);
            const lm = new THREE.LineBasicMaterial({ color: 0x5EEBFF, transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending });
            connectionLines.add(new THREE.Line(lg, lm));

            if (Math.random() < 0.5) {
              const pg = new THREE.SphereGeometry(0.02, 6, 6);
              const pm = new THREE.MeshBasicMaterial({ color: 0x5EEBFF, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending });
              const packet = new THREE.Mesh(pg, pm);
              dataPackets.push({ curve, t: Math.random(), speed: 0.002 + Math.random() * 0.004, mesh: packet });
              connectionLines.add(packet);
            }
          }
        }
      }

      // City points
      const cg = new THREE.BufferGeometry();
      const cpa = new Float32Array(cp2.length * 3);
      cp2.forEach((p, i) => { cpa[i * 3] = p.x; cpa[i * 3 + 1] = p.y; cpa[i * 3 + 2] = p.z; });
      cg.setAttribute('position', new THREE.BufferAttribute(cpa, 3));
      connectionLines.add(new THREE.Points(cg, new THREE.PointsMaterial({
        size: 0.055,
        color: 0x5EEBFF,
        transparent: true,
        opacity: 1,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending
      })));
      globeGroup.add(connectionLines);

      // Orbiting particles
      const oc = 250;
      const og = new THREE.BufferGeometry();
      const op = new Float32Array(oc * 3), oc2 = new Float32Array(oc * 3);
      for (let i = 0; i < oc; i++) {
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        const r = 2.2 + Math.random() * 1;
        op[i * 3] = r * Math.sin(ph) * Math.cos(th); op[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th); op[i * 3 + 2] = r * Math.cos(ph);
        const c = cp[Math.floor(Math.random() * cp.length)];
        oc2[i * 3] = c.r; oc2[i * 3 + 1] = c.g; oc2[i * 3 + 2] = c.b;
      }
      og.setAttribute('position', new THREE.BufferAttribute(op, 3));
      og.setAttribute('color', new THREE.BufferAttribute(oc2, 3));
      orbitingParticles = new THREE.Points(og, new THREE.PointsMaterial({ size: 0.018, vertexColors: true, transparent: true, opacity: 0.5, sizeAttenuation: true, blending: THREE.AdditiveBlending }));
      globeGroup.add(orbitingParticles);
    }

    const animateGlobe = () => {
      if (!globeGroup) return;
      const t = Date.now() * 0.001;
      globeGroup.rotation.y += 0.0018;
      const trx = mouse.ny * 0.35, trz = -mouse.nx * 0.18;
      globeGroup.rotation.x += (trx - globeGroup.rotation.x) * 0.015;

      if (connectionLines) {
        connectionLines.children.forEach((child: any, i: number) => {
          if (child.material && child.material.type === 'LineBasicMaterial') {
            child.material.opacity = 0.08 + Math.sin(t * 2.5 + i * 0.4) * 0.07;
          }
        });
      }

      dataPackets.forEach(dp => {
        dp.t += dp.speed;
        if (dp.t > 1) dp.t -= 1;
        const pt = dp.curve.getPoint(dp.t);
        dp.mesh.position.copy(pt);
        dp.mesh.material.opacity = 0.4 + Math.sin(dp.t * Math.PI) * 0.6;
        const s = 0.6 + Math.sin(dp.t * Math.PI) * 0.6;
        dp.mesh.scale.setScalar(s);
      });

      if (orbitingParticles) {
        orbitingParticles.rotation.y += 0.0008;
        orbitingParticles.rotation.x += 0.0004;
      }

      if (threeRenderer) {
        threeRenderer.render(threeScene, threeCamera);
      }
    };

    // --------------------------------------------------
    // 6. NETWORK VISUALIZATION CANVAS
    // --------------------------------------------------
    const networkCanvas = networkCanvasRef.current;
    let networkCtxLocal: CanvasRenderingContext2D | null = null;
    let networkNodes: any[] = [];
    let networkEdges: any[] = [];

    if (networkCanvas) {
      networkCtxLocal = networkCanvas.getContext('2d');
      networkCanvas.width = networkCanvas.offsetWidth * 2;
      networkCanvas.height = 300 * 2;
      networkCanvas.style.height = '300px';
      networkCtxLocal!.scale(2, 2);

      const w = networkCanvas.offsetWidth;
      const h = 300;
      for (let i = 0; i < 60; i++) {
        networkNodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - .5) * .4,
          vy: (Math.random() - .5) * .4,
          size: Math.random() * 3 + 1.5,
          color: ['#5EEBFF', '#4F8FFF', '#8B5CFF', '#00FFD1'][Math.floor(Math.random() * 4)]
        });
      }
      for (let i = 0; i < networkNodes.length; i++) {
        for (let j = i + 1; j < networkNodes.length; j++) {
          const dx = networkNodes[i].x - networkNodes[j].x;
          const dy = networkNodes[i].y - networkNodes[j].y;
          if (Math.sqrt(dx * dx + dy * dy) < 110 && Math.random() < 0.35) {
            networkEdges.push({ a: i, b: j, pulse: Math.random() * Math.PI * 2 });
          }
        }
      }
    }

    const drawNetworkViz = () => {
      if (!networkCtxLocal || !networkCanvas) return;
      const w = networkCanvas.offsetWidth;
      const h = 300;
      const t = Date.now() * 0.001;

      networkCtxLocal.clearRect(0, 0, w, h);
      networkNodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));
      });

      networkEdges.forEach(e => {
        const a = networkNodes[e.a];
        const b = networkNodes[e.b];
        const pulse = (Math.sin(t * 3 + e.pulse) + 1) * .5;
        networkCtxLocal!.beginPath();
        networkCtxLocal!.moveTo(a.x, a.y);
        networkCtxLocal!.lineTo(b.x, b.y);
        networkCtxLocal!.strokeStyle = `rgba(94,235,255,${0.04 + pulse * 0.1})`;
        networkCtxLocal!.lineWidth = 0.5;
        networkCtxLocal!.stroke();

        const tt = (t * 0.25 + e.pulse) % 1;
        const px = a.x + (b.x - a.x) * tt;
        const py = a.y + (b.y - a.y) * tt;
        networkCtxLocal!.beginPath();
        networkCtxLocal!.arc(px, py, 1.2, 0, Math.PI * 2);
        networkCtxLocal!.fillStyle = `rgba(94,235,255,${0.4 + pulse * 0.6})`;
        networkCtxLocal!.fill();
      });

      networkNodes.forEach(n => {
        const r = parseInt(n.color.slice(1, 3), 16);
        const g = parseInt(n.color.slice(3, 5), 16);
        const b = parseInt(n.color.slice(5, 7), 16);
        networkCtxLocal!.beginPath();
        networkCtxLocal!.arc(n.x, n.y, Math.max(0.1, n.size * 3.5), 0, Math.PI * 2);
        networkCtxLocal!.fillStyle = `rgba(${r},${g},${b},0.08)`;
        networkCtxLocal!.fill();

        networkCtxLocal!.beginPath();
        networkCtxLocal!.arc(n.x, n.y, Math.max(0.1, n.size), 0, Math.PI * 2);
        networkCtxLocal!.fillStyle = `rgba(${r},${g},${b},0.7)`;
        networkCtxLocal!.fill();
      });
    };

    // --------------------------------------------------
    // 7. TERMINAL SCRIPT ANIMATION
    // --------------------------------------------------
    const deploymentScripts = [
      { commands: [
        { text: 'git push origin production', color: 'text-gray-200', type: 'input' },
        { text: 'Uploading build artifacts...', color: 'text-gray-500', type: 'output', delay: 400 },
        { text: 'Packaging containers (8)...', color: 'text-gray-500', type: 'output', delay: 600 },
        { text: 'Deploying edge functions...', color: 'text-gray-500', type: 'output', delay: 500 },
        { text: 'Allocating GPU nodes (x4)...', color: 'text-gray-500', type: 'output', delay: 700 },
        { text: 'Creating global CDN distribution...', color: 'text-gray-500', type: 'output', delay: 400 },
        { text: 'Replicating storage to 12 regions...', color: 'text-gray-500', type: 'output', delay: 600 },
        { text: '', type: 'blank', delay: 200 },
        { text: 'Deployment Successful', color: 'text-emerald-400', type: 'success', delay: 300 },
        { text: '  \u2192 https://app.vayu.edge/my-project', color: 'text-cyan-400/50', type: 'output', delay: 200 },
        { text: '  \u2192 42 regions active', color: 'text-emerald-400/50', type: 'output', delay: 100 },
      ]},
      { commands: [
        { text: 'vayu deploy --global', color: 'text-gray-200', type: 'input' },
        { text: 'Deploying to edge network...', color: 'text-gray-500', type: 'output', delay: 500 },
        { text: '  Tokyo .............. done', color: 'text-emerald-400/70', type: 'output', delay: 300 },
        { text: '  Singapore ........... done', color: 'text-emerald-400/70', type: 'output', delay: 250 },
        { text: '  Frankfurt ........... done', color: 'text-emerald-400/70', type: 'output', delay: 280 },
        { text: '  London .............. done', color: 'text-emerald-400/70', type: 'output', delay: 220 },
        { text: '  Dubai ............... done', color: 'text-emerald-400/70', type: 'output', delay: 350 },
        { text: '  Sydney .............. done', color: 'text-emerald-400/70', type: 'output', delay: 400 },
        { text: '  S\u00e3o Paulo ........... done', color: 'text-emerald-400/70', type: 'output', delay: 320 },
        { text: '  New York ............ done', color: 'text-emerald-400/70', type: 'output', delay: 200 },
        { text: '', type: 'blank', delay: 200 },
        { text: 'Global deployment complete', color: 'text-emerald-400', type: 'success', delay: 300 },
      ]},
      { commands: [
        { text: 'vayu ai deploy llama-4', color: 'text-gray-200', type: 'input' },
        { text: 'Provisioning GPU cluster (8x H100)...', color: 'text-gray-500', type: 'output', delay: 800 },
        { text: 'Loading AI runtime v4.2.1...', color: 'text-gray-500', type: 'output', delay: 600 },
        { text: 'Downloading model weights (410GB)...', color: 'text-gray-500', type: 'output', delay: 1200 },
        { text: 'Sharding across 8 GPUs...', color: 'text-gray-500', type: 'output', delay: 500 },
        { text: 'Warming inference pipeline...', color: 'text-gray-500', type: 'output', delay: 700 },
        { text: '', type: 'blank', delay: 200 },
        { text: 'Inference Ready', color: 'text-emerald-400', type: 'success', delay: 300 },
        { text: '  \u2192 Endpoint: api.vayu.edge/v1/inference/llama-4', color: 'text-cyan-400/50', type: 'output', delay: 200 },
        { text: '  \u2192 TTFT: 38ms | Throughput: 2,847 tok/s', color: 'text-emerald-400/50', type: 'output', delay: 100 },
      ]}
    ];

    let currentScriptIndex = 0;
    let terminalRunning = false;
    let isMounted = true;

    const runTerminalScript = async () => {
      if (terminalRunning || !isMounted) return;
      terminalRunning = true;
      const linesEl = document.getElementById('terminal-lines');
      const inputEl = document.getElementById('terminal-input');
      if (!linesEl || !inputEl) return;

      const script = deploymentScripts[currentScriptIndex];
      linesEl.innerHTML = '';
      inputEl.textContent = '';

      for (const cmd of script.commands) {
        if (!isMounted) return;
        if (cmd.type === 'blank') {
          const b = document.createElement('div');
          b.className = 'h-3';
          b.style.opacity = '0';
          linesEl.appendChild(b);
          await sleep(cmd.delay || 100);
          b.style.opacity = '1';
          continue;
        }
        if (cmd.type === 'input') {
          inputEl.textContent = '';
          for (let i = 0; i < cmd.text.length; i++) {
            if (!isMounted) return;
            inputEl.textContent += cmd.text[i];
            await sleep(25 + Math.random() * 45);
          }
          await sleep(180);
          const l = document.createElement('div');
          l.className = 'terminal-line';
          l.innerHTML = `<span class="text-cyan-400 mr-1">$</span><span class="${cmd.color}">${esc(cmd.text)}</span>`;
          linesEl.appendChild(l);
          requestAnimationFrame(() => l.classList.add('visible'));
          inputEl.textContent = '';
          continue;
        }
        if (cmd.type === 'success') {
          await sleep(cmd.delay || 300);
          const l = document.createElement('div');
          l.className = 'terminal-line';
          l.innerHTML = `<span class="${cmd.color} font-semibold">${esc(cmd.text)}</span>`;
          linesEl.appendChild(l);
          requestAnimationFrame(() => l.classList.add('visible'));
          continue;
        }
        await sleep(cmd.delay || 300);
        const l = document.createElement('div');
        l.className = 'terminal-line';
        l.innerHTML = `<span class="${cmd.color}">${esc(cmd.text)}</span>`;
        linesEl.appendChild(l);
        requestAnimationFrame(() => l.classList.add('visible'));
      }

      await sleep(3500);
      if (!isMounted) return;
      linesEl.querySelectorAll('.terminal-line, div').forEach((l: any) => {
        l.style.transition = 'opacity .5s ease, transform .5s ease';
        l.style.opacity = '0';
        l.style.transform = 'translateY(-5px)';
      });
      await sleep(600);
      currentScriptIndex = (currentScriptIndex + 1) % deploymentScripts.length;
      terminalRunning = false;
      runTerminalScript();
    };

    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    // --------------------------------------------------
    // 8. LIVE COUNTER ANIMATIONS & FLUCTUATIONS
    // --------------------------------------------------
    const fmtShort = (n: number) => {
      if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
      if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
      return n.toFixed(0);
    };

    const startFluct = (el: HTMLElement, base: number, suf: string, dec: number, fmt: string) => {
      const interval = setInterval(() => {
        if (!isMounted) {
          clearInterval(interval);
          return;
        }
        const f = base * (1 + (Math.random() - .5) * .004);
        el.textContent = (fmt === 'short' ? fmtShort(f) : f.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + suf;
      }, 2000 + Math.random() * 3000);
    };

    const animateCounters = () => {
      document.querySelectorAll('.metric-value[data-target]').forEach(el => {
        const htmlEl = el as HTMLElement;
        const target = parseFloat(htmlEl.dataset.target || '0');
        const suffix = htmlEl.dataset.suffix || '';
        const decimals = parseInt(htmlEl.dataset.decimals || '0');
        const format = htmlEl.dataset.format || 'number';
        const dur = 2800;
        const start = performance.now();

        const update = (now: number) => {
          if (!isMounted) return;
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          const cur = target * eased;
          htmlEl.textContent = (format === 'short' ? fmtShort(cur) : cur.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')) + suffix;
          if (p < 1) {
            requestAnimationFrame(update);
          } else {
            startFluct(htmlEl, target, suffix, decimals, format);
          }
        };
        requestAnimationFrame(update);
      });
    };

    // --------------------------------------------------
    // 9. GSAP SCROLLTRIGGER PARALLAX & REVEALS
    // --------------------------------------------------
    const initParallax = () => {
      if (window.gsap && window.ScrollTrigger) {
        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;

        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll('.parallax-wrap').forEach((el: any) => {
          const speed = parseFloat(el.dataset.speed) || 0.03;
          gsap.to(el, {
            y: () => ScrollTrigger.maxScroll(window) * speed * -1,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
          });
        });

        const heroCanvas = document.getElementById('hero-canvas');
        if (heroCanvas) {
          gsap.to(heroCanvas, {
            opacity: 0.15,
            ease: 'none',
            scrollTrigger: { trigger: '#hero', start: '30% top', end: 'bottom top', scrub: 1 }
          });
        }

        // Stagger section reveals via GSAP
        gsap.utils.toArray('.sr').forEach((el: any) => {
          gsap.fromTo(el,
            { opacity: 0, y: 60 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
            }
          );
        });

        gsap.utils.toArray('.sr-left').forEach((el: any) => {
          gsap.fromTo(el, { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
        });

        gsap.utils.toArray('.sr-right').forEach((el: any) => {
          gsap.fromTo(el, { opacity: 0, x: 80 }, { opacity: 1, x: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
        });

        gsap.utils.toArray('.sr-scale').forEach((el: any) => {
          gsap.fromTo(el, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' } });
        });
      }
    };

    // --------------------------------------------------
    // 10. HERO ENTRANCE TIMELINE
    // --------------------------------------------------
    const initHeroAnimation = () => {
      if (window.gsap) {
        const gsap = window.gsap;
        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
        tl.to('#hero-badge', { opacity: 1, y: 0, duration: 1 }, 0.4)
          .to('#hero-title', { opacity: 1, y: 0, duration: 1.2 }, 0.7)
          .to('#hero-sub', { opacity: 1, y: 0, duration: 1 }, 1.1)
          .to('#hero-cta-btn', { opacity: 1, y: 0, duration: 0.9 }, 1.4)
          .to('#terminal-container', { opacity: 1, y: 0, scale: 1, duration: 1.1 }, 1.7)
          .to('#status-bar', { opacity: 1, y: 0, duration: 0.9 }, 2.1)
          .to('#scroll-hint', { opacity: 0.4, duration: 0.8 }, 2.5)
          .call(() => {
            runTerminalScript();
            animateCounters();
          }, null, 2.2);
      }
    };

    // --------------------------------------------------
    // 11. SCROLL REVEAL (IntersectionObserver fallback)
    // --------------------------------------------------
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('revealed');
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.sr, .sr-left, .sr-right, .sr-scale, .clip-section').forEach(el => obs.observe(el));

    // Scroll-triggered mini-bar animations
    const barObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll('.mini-bar-fill[data-width]').forEach((bar: any) => {
            setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
          });
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll('.space-glass, .space-glass-strong, .space-glass-terminal').forEach(el => {
      if (el.querySelector('.mini-bar-fill[data-width]')) barObs.observe(el);
    });

    // --------------------------------------------------
    // 11.5 RESIZE LISTENER FOR ALL CANVASES
    // --------------------------------------------------
    const handleResizeAll = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // 1. Background Particle Canvas
      if (bgCanvas) {
        bgCanvas.width = w;
        bgCanvas.height = h;
      }

      // 2. Three.js Globe
      if (threeRenderer && threeCamera) {
        threeCamera.aspect = w / h;
        // Dynamically adjust camera Z position based on screen width
        let z = 5.8;
        if (w < 640) z = 7.5;
        else if (w < 1024) z = 6.5;
        threeCamera.position.z = z;
        
        threeCamera.updateProjectionMatrix();
        threeRenderer.setSize(w, h);
      }

      // 3. Network Canvas
      if (networkCanvas && networkCtxLocal) {
        networkCanvas.width = networkCanvas.offsetWidth * 2;
        networkCanvas.height = 300 * 2;
        networkCtxLocal.scale(2, 2);
      }
    };
    window.addEventListener('resize', handleResizeAll);

    // Standard scroll event listener fallback
    const handleWindowScroll = () => {
      const header = document.getElementById('main-header');
      if (header) {
        if (window.scrollY > 60) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleWindowScroll);

    // --------------------------------------------------
    // 12. RUN ANIMATION LOOP
    // --------------------------------------------------
    const loop = (time: number) => {
      if (!isMounted) return;
      bgAnimationId = requestAnimationFrame(loop);
      if (lenis) {
        lenis.raf(time);
      }
      drawBgParticles();
      animateGlobe();
      drawNetworkViz();
    };

    // Kick off everything
    setTimeout(() => {
      initParallax();
      initHeroAnimation();
      loop(0);
    }, 200);

    return () => {
      isMounted = false;
      cancelAnimationFrame(bgAnimationId);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResizeAll);
      window.removeEventListener('scroll', handleWindowScroll);
      if (lenis) {
        lenis.destroy();
      }
      obs.disconnect();
      barObs.disconnect();
      styleEl.remove();
    };
  }, []);

  return (
    <div className="intro-body relative w-full overflow-x-hidden select-none">
      {/* Noise Overlay */}
      <div className="noise-overlay" aria-hidden="true"></div>

      {/* Scroll Progress Bar */}
      <div id="scroll-progress" aria-hidden="true"></div>

      {/* Cursor Spotlight */}
      <div id="cursor-spotlight" aria-hidden="true"></div>

      {/* Aurora Background */}
      <div className="aurora-layer" aria-hidden="true">
        <div className="aurora-blob aurora-1"></div>
        <div className="aurora-blob aurora-2"></div>
        <div className="aurora-blob aurora-3"></div>
        <div className="aurora-blob aurora-4"></div>
      </div>

      {/* Particle Background Canvas */}
      <canvas ref={bgCanvasRef} id="bg-canvas" aria-hidden="true"></canvas>

      {/* 3D Globe Canvas */}
      <canvas ref={heroCanvasRef} id="hero-canvas" aria-hidden="true"></canvas>

      {/* HEADER */}
      <header id="main-header" className="header-glass fixed top-0 left-0 right-0 z-50">
        <div className="mirror-sheen" aria-hidden="true"></div>
        <div className="header-inner max-w-7xl mx-auto px-6 h-16 flex items-center justify-between transition-all duration-500">
          <a href="#" className="flex items-center gap-2.5 group" aria-label="Vayu Edge Home">
            <div className="relative w-8 h-8">
              <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
                <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#lg)" strokeWidth={1.5} fill="none"/>
                <path d="M16 8L22 11.5V18.5L16 22L10 18.5V11.5L16 8Z" fill="url(#lg)" opacity=".25"/>
                <circle cx="16" cy="15" r="3" fill="url(#lg)"/>
                <defs>
                  <linearGradient id="lg" x1="4" y1="2" x2="28" y2="30">
                    <stop stopColor="#5EEBFF"/>
                    <stop offset="1" stopColor="#8B5CFF"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
            <span className="text-lg font-bold tracking-tight">Vayu <span className="text-cyan-400">Edge</span></span>
          </a>
          <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
            <div className="relative group">
              <button className="nav-link-space flex items-center gap-1">Platform</button>
            </div>
            <a href="#edge" className="nav-link-space">Compute</a>
            <a href="#ai" className="nav-link-space">AI Cloud</a>
            <a href="#storage" className="nav-link-space">Storage</a>
            <a href="#networking" className="nav-link-space">Networking</a>
            <a href="#pricing" className="nav-link-space">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onSignIn} className="nav-link-space inline mr-2 font-bold hover:text-white">Login</button>
            <button onClick={onSignIn} className="btn-primary-space px-5 py-2 text-sm flex items-center justify-center">
              <span>Start Free</span>
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-10 overflow-hidden">
        {/* Floating Glass Windows */}
        <div className="floating-window space-glass-window p-4 w-48 hidden lg:block" style={{ top: '16%', left: '4%', animation: 'fw1 9s ease-in-out infinite', opacity: 0.8 }}>
          <div className="text-[10px] text-cyan-400/60 font-mono mb-2 uppercase tracking-wider">Global Infrastructure</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Tokyo</span><span className="text-emerald-400">2.1ms</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Frankfurt</span><span className="text-emerald-400">8.3ms</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Virginia</span><span className="text-cyan-400">1.4ms</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">São Paulo</span><span className="text-yellow-400">12.7ms</span></div>
            <div className="mini-bar mt-2"><div className="mini-bar-fill bg-gradient-to-r from-cyan-400 to-emerald-400" data-width="78" style={{ width: '0%' }}></div></div>
          </div>
        </div>
        <div className="floating-window space-glass-window p-4 w-44 hidden lg:block" style={{ top: '22%', right: '3%', animation: 'fw2 11s ease-in-out infinite', opacity: 0.75 }}>
          <div className="text-[10px] text-quantum/60 font-mono mb-2 uppercase tracking-wider">GPU Clusters</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">H100 Active</span><span className="text-quantum font-bold">2,847</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Utilization</span><span className="text-cyan-400 font-bold">94.2%</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Inference</span><span className="text-emerald-400 font-bold">1.2M/s</span></div>
            <div className="mini-bar mt-2"><div className="mini-bar-fill bg-gradient-to-r from-quantum to-cyan-400" data-width="94" style={{ width: '0%' }}></div></div>
          </div>
        </div>
        <div className="floating-window space-glass-window p-4 w-40 hidden lg:block" style={{ bottom: '28%', left: '3%', animation: 'fw3 10s ease-in-out infinite', opacity: 0.7 }}>
          <div className="text-[10px] text-emerald-400/60 font-mono mb-2 uppercase tracking-wider">Containers</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Running</span><span className="text-emerald-400 font-bold">847K</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Scaling</span><span className="text-yellow-400 font-bold">+12</span></div>
            <div className="mini-bar mt-2"><div className="mini-bar-fill bg-emerald-400" data-width="67" style={{ width: '0%' }}></div></div>
          </div>
        </div>
        <div className="floating-window space-glass-window p-4 w-36 hidden lg:block" style={{ bottom: '24%', right: '5%', animation: 'fw4 12s ease-in-out infinite', opacity: 0.65 }}>
          <div className="text-[10px] text-aurora/60 font-mono mb-2 uppercase tracking-wider">CDN</div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Nodes</span><span className="text-aurora font-bold">340</span></div>
            <div className="flex justify-between text-[10px]"><span className="text-gray-500">Hit Rate</span><span className="text-emerald-400 font-bold">99.7%</span></div>
            <div className="mini-bar mt-2"><div className="mini-bar-fill bg-aurora" data-width="99" style={{ width: '0%' }}></div></div>
          </div>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 text-center max-w-4xl mx-auto mb-8" id="hero-text">
          <div className="inline-flex items-center gap-2 space-glass px-4 py-1.5 rounded-full text-xs text-cyan-400 mb-7 font-mono" id="hero-badge" style={{ opacity: 0, transform: 'translateY(20px)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot"></span>
            All Systems Operational — 42 Regions Live
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[1] mb-7" id="hero-title" style={{ opacity: 0, transform: 'translateY(50px)' }}>
            <span className="block text-white">The Cloud</span>
            <span className="block gradient-text-intro glow-text">Beyond Tomorrow</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10" id="hero-sub" style={{ opacity: 0, transform: 'translateY(30px)' }}>
            Deploy intelligence everywhere. Global compute, zero limits. The infrastructure layer for the AI era.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4" id="hero-cta-btn" style={{ opacity: 0, transform: 'translateY(20px)' }}>
            <button onClick={onSignIn} className="btn-primary-space px-9 py-4 text-base w-full sm:w-auto text-center font-bold">
              <span>Launch Console</span>
            </button>
            <button onClick={onSignIn} className="btn-secondary-space px-9 py-4 text-base w-full sm:w-auto text-center font-bold">
              Read Documentation
            </button>
          </div>
        </div>

        {/* Terminal */}
        <div className="relative z-10 w-full max-w-2xl mx-auto terminal-wrap parallax-wrap" id="terminal-container" data-speed="0.03" style={{ opacity: 0, transform: 'translateY(40px) scale(.96)' }}>
          <div className="space-glass-terminal p-5 sm:p-6 scanline relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
              <span className="ml-3 text-[11px] text-gray-500 font-mono">vayu-edge — production</span>
              <span className="ml-auto text-[10px] text-cyan-400/40 font-mono">zsh</span>
            </div>
            <div id="terminal-body" className="font-mono text-[13px] leading-6 min-h-[180px] max-h-[220px] overflow-hidden text-left">
              <div id="terminal-lines"></div>
              <div className="flex items-center">
                <span className="text-cyan-400 mr-1">$</span>
                <span id="terminal-input" className="text-gray-200"></span>
                <span className="cursor-blink"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-8 px-4 parallax-wrap" id="status-bar" data-speed="0.05" style={{ opacity: 0, transform: 'translateY(25px)' }}>
          <div className="space-glass rounded-2xl px-3 py-3 flex items-center justify-around flex-wrap gap-y-2 status-bar">
            <div className="status-bar-item px-4 py-1 text-center">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Regions</div>
              <div className="metric-value text-sm font-bold text-cyan-400" data-target="42" data-suffix="">0</div>
            </div>
            <div className="status-bar-item px-4 py-1 text-center">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Edge Nodes</div>
              <div className="metric-value text-sm font-bold text-aurora" data-target="12847" data-suffix="">0</div>
            </div>
            <div className="status-bar-item px-4 py-1 text-center">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Deployments</div>
              <div className="metric-value text-sm font-bold text-quantum" data-target="284739" data-suffix="">0</div>
            </div>
            <div className="status-bar-item px-4 py-1 text-center">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Containers</div>
              <div className="metric-value text-sm font-bold text-emerald-400" data-target="847291" data-suffix="">0</div>
            </div>
            <div className="status-bar-item px-4 py-1 text-center">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Requests/sec</div>
              <div className="metric-value text-sm font-bold text-cyan-400" data-target="2847000" data-suffix="" data-format="short">0</div>
            </div>
            <div className="status-bar-item px-4 py-1 text-center">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Latency</div>
              <div className="metric-value text-sm font-bold text-emerald-400" data-target="4.2" data-suffix="ms" data-decimals="1">0</div>
            </div>
            <div className="status-bar-item px-4 py-1 text-center">
              <div className="text-[9px] text-gray-500 uppercase tracking-wider font-mono">Uptime</div>
              <div className="metric-value text-sm font-bold text-emerald-400" data-target="99.999" data-suffix="%" data-decimals="3">0</div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 mt-14 flex flex-col items-center gap-2" id="scroll-hint" style={{ opacity: 0 }}>
          <span className="text-[10px] uppercase tracking-[.3em] text-gray-600 font-bold">Scroll to explore</span>
          <div className="w-5 h-9 border border-gray-700 rounded-full flex items-start justify-center p-1.5">
            <div className="w-1 h-2 bg-cyan-400 rounded-full" style={{ animation: 'scrollDot 2s ease-in-out infinite' }}></div>
          </div>
        </div>
      </section>

      {/* MARQUEE TICKER */}
      <div className="relative z-10 py-5 border-y border-white/5 overflow-hidden" aria-hidden="true">
        <div className="marquee-track">
          <div className="flex items-center gap-8 text-sm font-mono text-gray-600">
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>TOKYO — 2.1ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>SINGAPORE — 3.8ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>FRANKFURT — 8.3ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>LONDON — 6.1ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>DUBAI — 5.4ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>SYDNEY — 9.7ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>SAO PAULO — 12.7ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>VIRGINIA — 1.4ms</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-mono text-gray-600" aria-hidden="true">
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>TOKYO — 2.1ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>SINGAPORE — 3.8ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>FRANKFURT — 8.3ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>LONDON — 6.1ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>DUBAI — 5.4ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>SYDNEY — 9.7ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>SAO PAULO — 12.7ms</span>
            <span className="marquee-item flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>VIRGINIA — 1.4ms</span>
          </div>
        </div>
      </div>

      {/* GLOBAL INFRASTRUCTURE */}
      <section id="infrastructure" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="sr text-center mb-20">
            <span className="text-xs font-mono text-cyan-400/50 uppercase tracking-[.3em] mb-4 block">Global Infrastructure</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">Compute at the <span className="gradient-text-intro font-black">Speed of Light</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">42 regions. 340+ edge locations. Every deployment reaches users in under 5ms, anywhere on Earth.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sr">
            <div className="space-glass rounded-2xl p-6 text-center group hover:border-cyan-400/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="text-3xl font-bold gradient-text-intro mb-2">42</div>
              <div className="text-sm text-gray-400 font-semibold">Global Regions</div>
              <div className="mini-bar mt-3 mx-auto w-3/4">
                <div className="mini-bar-fill bg-gradient-to-r from-cyan-400 to-aurora" data-width="100" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="space-glass rounded-2xl p-6 text-center group hover:border-aurora/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="text-3xl font-bold gradient-text-intro mb-2">340+</div>
              <div className="text-sm text-gray-400 font-semibold">Edge PoPs</div>
              <div className="mini-bar mt-3 mx-auto w-3/4">
                <div className="mini-bar-fill bg-gradient-to-r from-aurora to-quantum" data-width="85" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="space-glass rounded-2xl p-6 text-center group hover:border-quantum/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="text-3xl font-bold gradient-text-intro mb-2">100Tbps</div>
              <div className="text-sm text-gray-400 font-semibold">Backbone Capacity</div>
              <div className="mini-bar mt-3 mx-auto w-3/4">
                <div className="mini-bar-fill bg-gradient-to-r from-quantum to-emerald-400" data-width="92" style={{ width: '0%' }}></div>
              </div>
            </div>
            <div className="space-glass rounded-2xl p-6 text-center group hover:border-emerald-400/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="text-3xl font-bold gradient-text-intro mb-2">&lt;5ms</div>
              <div className="text-sm text-gray-400 font-semibold">Avg Latency</div>
              <div className="mini-bar mt-3 mx-auto w-3/4">
                <div className="mini-bar-fill bg-gradient-to-r from-emerald-400 to-cyan-400" data-width="96" style={{ width: '0%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="glow-divider max-w-5xl mx-auto" />

      {/* EDGE COMPUTE */}
      <section id="edge" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="sr text-center mb-20">
            <span className="text-xs font-mono text-emerald-400/50 uppercase tracking-[.3em] mb-4 block">Edge Compute</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">Every Workload, <span className="gradient-text-alt font-black">Perfectly Placed</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">From serverless functions to bare metal GPUs. Run anything, anywhere, at any scale.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sr" id="compute-cards">
            {/* Card 1 */}
            <div className="space-glass rounded-2xl p-8 text-left group hover:border-emerald-400/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/15 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Edge Workers</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Execute lightweight JavaScript/TypeScript isolate functions in under 1ms. Auto-scales from zero, zero cold-starts, global replication.</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Sub-millisecond startup</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="space-glass rounded-2xl p-8 text-left group hover:border-cyan-400/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/15 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Edge Containers</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Deploy standard Docker/OCI container images globally in seconds. Intelligent routing to the nearest active GPU or CPU cluster.</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Deploy in 2 seconds</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="space-glass rounded-2xl p-8 text-left group hover:border-quantum/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="w-14 h-14 rounded-2xl bg-quantum/10 border border-quantum/15 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-quantum" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Bare Metal GPUs</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Direct low-latency access to dedicated H100 arrays. Ultra-fast interconnects designed for large-scale distributed training and high-concurrency AI inference.</p>
              <div className="mt-6 flex items-center gap-2 text-xs font-mono text-quantum">
                <span className="w-2 h-2 rounded-full bg-quantum animate-ping"></span>
                <span>Infinite scalability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="glow-divider max-w-5xl mx-auto" />

      {/* AI CLOUD */}
      <section id="ai" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="sr-left text-left">
              <span className="text-xs font-mono text-quantum/50 uppercase tracking-[.3em] mb-4 block">AI Cloud</span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-white">Train and Infer <span className="gradient-text-intro font-black">at Scale</span></h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">Access thousands of H100 GPUs on demand. Deploy models in seconds, not hours. Built for the most demanding AI workloads.</p>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-quantum/10 border border-quantum/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-quantum" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold mb-1 text-white">One-Click Model Deployment</div>
                    <div className="text-sm text-gray-500 leading-relaxed">Deploy any HuggingFace model to a global inference endpoint in under 30 seconds.</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-quantum/10 border border-quantum/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-quantum" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold mb-1 text-white">Distributed Training</div>
                    <div className="text-sm text-gray-500 leading-relaxed">Multi-node, multi-GPU training with automatic fault tolerance and checkpointing.</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-quantum/10 border border-quantum/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-quantum" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold mb-1 text-white">Streaming Inference</div>
                    <div className="text-sm text-gray-500 leading-relaxed">Real-time token streaming with sub-100ms time-to-first-token globally.</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="sr-right space-glass-strong rounded-2xl p-6 relative overflow-hidden text-left">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-quantum via-cyan-400 to-aurora"></div>
              <div className="absolute -top-16 -right-16 w-40 h-40 bg-quantum/8 rounded-full blur-[60px]"></div>
              <div className="text-xs font-mono text-gray-500 mb-5">GPU CLUSTER STATUS</div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-glass rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">H100 GPUs</div>
                  <div className="text-2xl font-bold text-quantum">2,847</div>
                  <div className="text-[10px] text-emerald-400 mt-1">94.2% utilized</div>
                </div>
                <div className="space-glass rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Inference/s</div>
                  <div className="text-2xl font-bold text-cyan-400">1.2M</div>
                  <div className="text-[10px] text-emerald-400 mt-1">+12% this hour</div>
                </div>
                <div className="space-glass rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Active Models</div>
                  <div className="text-2xl font-bold text-aurora">847</div>
                  <div className="text-[10px] text-emerald-400 mt-1">All healthy</div>
                </div>
                <div className="space-glass rounded-xl p-4">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">TTFT</div>
                  <div className="text-2xl font-bold text-emerald-400">48ms</div>
                  <div className="text-[10px] text-emerald-400 mt-1">P99 global</div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-500">GPU Memory</span><span className="text-quantum font-bold">78.4 TB / 89.4 TB</span></div>
                  <div className="mini-bar"><div className="mini-bar-fill bg-gradient-to-r from-quantum to-cyan-400" data-width="87" style={{ width: '0%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-500">Interconnect</span><span className="text-cyan-400 font-bold">3.2 Tbps</span></div>
                  <div className="mini-bar"><div className="mini-bar-fill bg-gradient-to-r from-cyan-400 to-emerald-400" data-width="64" style={{ width: '0%' }}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1"><span className="text-gray-500">Training Queue</span><span className="text-aurora font-bold">23 jobs</span></div>
                  <div className="mini-bar"><div className="mini-bar-fill bg-aurora" data-width="23" style={{ width: '0%' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="glow-divider max-w-5xl mx-auto" />

      {/* STORAGE */}
      <section id="storage" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="sr text-center mb-20">
            <span className="text-xs font-mono text-aurora/50 uppercase tracking-[.3em] mb-4 block">Cloud Storage</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">Data That <span className="gradient-text-intro font-black">Never Sleeps</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Object storage, block volumes, and global replication. Always available, always encrypted, always fast.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 sr">
            <div className="space-glass rounded-2xl p-8 text-center group hover:border-aurora/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="w-14 h-14 rounded-2xl bg-aurora/10 border border-aurora/15 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-aurora" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Object Storage</h3>
              <p className="text-sm text-gray-400 leading-relaxed">S3-compatible. Infinite scale. 11 nines of durability. Store petabytes for pennies.</p>
            </div>
            <div className="space-glass rounded-2xl p-8 text-center group hover:border-cyan-400/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/15 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Block Volumes</h3>
              <p className="text-sm text-gray-400 leading-relaxed">NVMe-backed. Up to 256TB per volume. Sub-millisecond IOPS for databases.</p>
            </div>
            <div className="space-glass rounded-2xl p-8 text-center group hover:border-emerald-400/25 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 border border-emerald-400/15 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Global Replication</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Automatic multi-region replication. RPO of zero. Failover in milliseconds.</p>
            </div>
          </div>
        </div>
      </section>

      <hr className="glow-divider max-w-5xl mx-auto" />

      {/* NETWORKING */}
      <section id="networking" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="sr-left space-glass-strong rounded-2xl p-6 relative overflow-hidden order-2 lg:order-1 text-left">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-aurora"></div>
              <div className="text-xs font-mono text-gray-500 mb-4">NETWORK TOPOLOGY — LIVE</div>
              <canvas ref={networkCanvasRef} id="network-canvas" className="w-full rounded-xl" style={{ height: '300px' }}></canvas>
            </div>
            <div className="sr-right text-left">
              <span className="text-xs font-mono text-emerald-400/50 uppercase tracking-[.3em] mb-4 block">Networking</span>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 text-white">The Network is <span className="gradient-text-alt font-black">the Computer</span></h2>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">Software-defined networking with global anycast, private mesh, and intelligent traffic management.</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-glass rounded-xl p-4 hover:border-cyan-400/15 transition-all duration-500">
                  <div className="text-sm font-bold mb-1 text-white">Global CDN</div>
                  <div className="text-xs text-gray-500">340+ PoPs, 99.7% cache hit</div>
                </div>
                <div className="space-glass rounded-xl p-4 hover:border-aurora/15 transition-all duration-500">
                  <div className="text-sm font-bold mb-1 text-white">Private Mesh</div>
                  <div className="text-xs text-gray-500">Encrypted cross-region backbone</div>
                </div>
                <div className="space-glass rounded-xl p-4 hover:border-quantum/15 transition-all duration-500">
                  <div className="text-sm font-bold mb-1 text-white">Intelligent DNS</div>
                  <div className="text-xs text-gray-500">100ms propagation, geo-routing</div>
                </div>
                <div className="space-glass rounded-xl p-4 hover:border-emerald-400/15 transition-all duration-500">
                  <div className="text-sm font-bold mb-1 text-white">DDoS Shield</div>
                  <div className="text-xs text-gray-500">20Tbps mitigation capacity</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="glow-divider max-w-5xl mx-auto" />

      {/* SECURITY */}
      <section id="security" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="sr text-center mb-20">
            <span className="text-xs font-mono text-red-400/50 uppercase tracking-[.3em] mb-4 block">Security</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">Zero Trust. <span className="gradient-text-intro font-black">Zero Compromise.</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Every layer encrypted. Every request authenticated. Every threat neutralized before it arrives.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sr">
            <div className="space-glass rounded-2xl p-6 text-center hover:border-red-400/20 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="text-3xl font-bold text-red-400 mb-2">14.2K</div>
              <div className="text-sm text-gray-400 mb-3 font-semibold">Threats Blocked Today</div>
              <div className="mini-bar"><div className="mini-bar-fill bg-red-400" data-width="100" style={{ width: '0%' }}></div></div>
            </div>
            <div className="space-glass rounded-2xl p-6 text-center hover:border-emerald-400/20 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="text-3xl font-bold text-emerald-400 mb-2">AES-256</div>
              <div className="text-sm text-gray-400 mb-3 font-semibold">Encryption at Rest</div>
              <div className="mini-bar"><div className="mini-bar-fill bg-emerald-400" data-width="100" style={{ width: '0%' }}></div></div>
            </div>
            <div className="space-glass rounded-2xl p-6 text-center hover:border-cyan-400/20 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">TLS 1.3</div>
              <div className="text-sm text-gray-400 mb-3 font-semibold">Encryption in Transit</div>
              <div className="mini-bar"><div className="mini-bar-fill bg-cyan-400" data-width="100" style={{ width: '0%' }}></div></div>
            </div>
            <div className="space-glass rounded-2xl p-6 text-center hover:border-quantum/20 transition-all duration-500 tilt-card relative overflow-hidden">
              <div className="card-shine"></div>
              <div className="text-3xl font-bold text-quantum mb-2">SOC 2</div>
              <div className="text-sm text-gray-400 mb-3 font-semibold">Type II Certified</div>
              <div className="mini-bar"><div className="mini-bar-fill bg-quantum" data-width="100" style={{ width: '0%' }}></div></div>
            </div>
          </div>
        </div>
      </section>

      <hr className="glow-divider max-w-5xl mx-auto" />

      {/* DEVELOPER EXPERIENCE */}
      <section id="developers" className="relative z-10 py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="sr text-center mb-20">
            <span className="text-xs font-mono text-cyan-400/50 uppercase tracking-[.3em] mb-4 block">Developer Experience</span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">Built for <span className="gradient-text-intro font-black">Builders</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">From first deploy to global scale in minutes. The developer experience you've always wanted.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5 sr">
            <div className="space-glass rounded-2xl p-7 hover:border-cyan-400/20 transition-all duration-500 tilt-card relative overflow-hidden text-left">
              <div className="card-shine"></div>
              <div className="font-mono text-xs text-cyan-400 mb-4 opacity-60">$</div>
              <h3 className="text-lg font-bold mb-2 text-white">CLI</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">One command to deploy anything, anywhere. Intelligent defaults, zero config for simple apps.</p>
              <code className="text-[11px] font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg block text-center">vayu deploy --global</code>
            </div>
            <div className="space-glass rounded-2xl p-7 hover:border-aurora/20 transition-all duration-500 tilt-card relative overflow-hidden text-left">
              <div className="card-shine"></div>
              <div className="font-mono text-xs text-aurora mb-4 opacity-60">&#123; &#125;</div>
              <h3 className="text-lg font-bold mb-2 text-white">SDK</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">Type-safe SDKs for TypeScript, Python, Go, and Rust. Full IntelliSense support.</p>
              <code className="text-[11px] font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg block text-center">npm i @vayu/sdk</code>
            </div>
            <div className="space-glass rounded-2xl p-7 hover:border-quantum/20 transition-all duration-500 tilt-card relative overflow-hidden text-left">
              <div className="card-shine"></div>
              <div className="font-mono text-xs text-quantum mb-4 opacity-60">API</div>
              <h3 className="text-lg font-bold mb-2 text-white">REST & GraphQL</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">Full API coverage. Real-time webhooks. Streaming endpoints for logs and metrics.</p>
              <code className="text-[11px] font-mono text-gray-500 bg-white/5 px-3 py-1.5 rounded-lg block text-center">api.vayu.edge/v1</code>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="relative z-10 py-36 px-6">
        <div className="max-w-4xl mx-auto text-center sr-scale">
          <div className="space-glass-strong rounded-3xl p-12 sm:p-20 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-400/8 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-quantum/8 rounded-full blur-[100px]"></div>
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white">Ready to Enter the <span className="gradient-text-intro font-black">Future?</span></h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">Start with $200 in free credits. No credit card required. Deploy your first edge function in 30 seconds.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={onSignIn} className="btn-primary-space px-10 py-4 text-base w-full sm:w-auto text-center font-bold">
                  <span>Start Building Free</span>
                </button>
                <button onClick={onSignIn} className="btn-secondary-space px-10 py-4 text-base w-full sm:w-auto text-center font-bold">
                  Talk to Sales
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-6">Free tier includes 100K requests/mo, 10GB storage, 3 edge functions</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1 text-left">
              <div className="flex items-center gap-2 mb-4">
                <svg viewBox="0 0 32 32" fill="none" className="w-6 h-6">
                  <path d="M16 2L28 9V23L16 30L4 23V9L16 2Z" stroke="url(#fl)" strokeWidth={1.5} fill="none"/>
                  <circle cx="16" cy="15" r="3" fill="url(#fl)"/>
                  <defs>
                    <linearGradient id="fl" x1="4" y1="2" x2="28" y2="30">
                      <stop stopColor="#5EEBFF"/>
                      <stop offset="1" stopColor="#8B5CFF"/>
                    </linearGradient>
                  </defs>
                </svg>
                <span className="font-bold text-sm text-white">Vayu Edge</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">The cloud beyond tomorrow. Global compute infrastructure for the AI era.</p>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Product</div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Compute</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">AI Cloud</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Storage</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Networking</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Security</a></li>
              </ul>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Developers</div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Documentation</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">API Reference</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">CLI</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">SDKs</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Status</a></li>
              </ul>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Company</div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">About</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Contact</a></li>
              </ul>
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-4">Legal</div>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Privacy</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Terms</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">SLA</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors duration-300">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600">&copy; 2025 Vayu Edge, Inc. All rights reserved.</div>
            <div className="flex items-center gap-5">
              <a href="#" className="text-gray-600 hover:text-cyan-400 transition-colors duration-300" aria-label="GitHub">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-600 hover:text-cyan-400 transition-colors duration-300" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
