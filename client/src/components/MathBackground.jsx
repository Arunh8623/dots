import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function MathBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const W = window.innerWidth, H = window.innerHeight;

    // Scene
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // ── Floating torus knots ──
    const torusKnots = [];
    const torusMat   = new THREE.MeshBasicMaterial({ color: 0x58C4DD, wireframe: true, opacity: 0.08, transparent: true });
    for (let i = 0; i < 4; i++) {
      const geo  = new THREE.TorusKnotGeometry(3 + i * 0.8, 0.3, 80, 12, 2 + i, 3 + i);
      const mesh = new THREE.Mesh(geo, torusMat.clone());
      mesh.position.set((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20 - 10);
      mesh.userData = { rx: Math.random() * 0.003, ry: Math.random() * 0.003 };
      scene.add(mesh);
      torusKnots.push(mesh);
    }

    // ── Icosahedron wireframes ──
    const icoMeshes = [];
    const icoMat = new THREE.MeshBasicMaterial({ color: 0xf0c040, wireframe: true, opacity: 0.06, transparent: true });
    for (let i = 0; i < 3; i++) {
      const geo  = new THREE.IcosahedronGeometry(4 + i * 2, 1);
      const mesh = new THREE.Mesh(geo, icoMat.clone());
      mesh.position.set((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 35, (Math.random() - 0.5) * 15 - 15);
      mesh.userData = { rx: Math.random() * 0.002, ry: Math.random() * 0.004 };
      scene.add(mesh);
      icoMeshes.push(mesh);
    }

    // ── Particle field ──
    const particleCount = 400;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x58C4DD, size: 0.12, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(particleGeo, particleMat));

    // ── Mouse parallax ──
    let mouseX = 0, mouseY = 0;
    const onMouse = (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 0.3;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 0.2;
    };
    window.addEventListener('mousemove', onMouse);

    // ── Resize ──
    const onResize = () => {
      const w = window.innerWidth, h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // ── Animation loop ──
    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);

      torusKnots.forEach(m => {
        m.rotation.x += m.userData.rx;
        m.rotation.y += m.userData.ry;
      });
      icoMeshes.forEach(m => {
        m.rotation.x += m.userData.rx;
        m.rotation.y += m.userData.ry;
      });

      // Smooth camera parallax
      camera.position.x += (mouseX * 5  - camera.position.x) * 0.05;
      camera.position.y += (-mouseY * 3 - camera.position.y) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} style={{
      position: 'fixed', inset: 0,
      pointerEvents: 'none', zIndex: 0,
    }} />
  );
}