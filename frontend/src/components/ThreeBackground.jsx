import React, { useEffect, useRef } from "react";
import * as THREE from "three";

const COLORS = [0xf2a07b, 0xf7c9a9, 0xe9b872, 0xf4d8c4, 0xe07a5f, 0xc9d8b6];

// Soft, warm background: pastel blobs gently floating and squishing,
// lit with warm light, drifting slightly with the mouse and scroll.
function ThreeBackground() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 14;

    // Warm, soft lighting
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0xf2c4a8, 1.6));
    const sun = new THREE.DirectionalLight(0xffe2c4, 1.4);
    sun.position.set(5, 8, 6);
    scene.add(sun);

    // Floating pastel blobs
    const geometry = new THREE.IcosahedronGeometry(1, 24);
    const blobs = [];
    for (let i = 0; i < 9; i++) {
      const material = new THREE.MeshStandardMaterial({
        color: COLORS[i % COLORS.length],
        roughness: 0.65,
        metalness: 0,
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(geometry, material);
      const scale = 0.6 + Math.random() * 1.4;
      mesh.scale.setScalar(scale);
      mesh.position.set((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 12, -Math.random() * 8 - 2);
      mesh.userData = {
        base: mesh.position.clone(),
        scale,
        speed: 0.2 + Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2
      };
      scene.add(mesh);
      blobs.push(mesh);
    }

    const mouse = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    let scrollY = window.scrollY;

    const onMouseMove = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      const t = clock.getElapsedTime();
      eased.x += (mouse.x - eased.x) * 0.03;
      eased.y += (mouse.y - eased.y) * 0.03;

      blobs.forEach((blob) => {
        const { base, scale, speed, phase } = blob.userData;
        blob.position.x = base.x + Math.sin(t * speed + phase) * 0.8 + eased.x * 0.6;
        blob.position.y = base.y + Math.cos(t * speed * 0.8 + phase) * 0.9 - eased.y * 0.4 + scrollY * 0.0015;
        // Gentle squish so they feel soft, like jelly
        const squish = Math.sin(t * speed * 2 + phase) * 0.06;
        blob.scale.set(scale * (1 + squish), scale * (1 - squish), scale);
        blob.rotation.y = t * speed * 0.3;
      });

      renderer.render(scene, camera);
      if (!reduceMotion) frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      blobs.forEach((blob) => blob.material.dispose());
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="three-bg" aria-hidden="true" />;
}

export default ThreeBackground;
