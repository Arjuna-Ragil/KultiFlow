"use client";

import React, { useEffect, useRef } from "react";

interface ParticlesProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  ox: number;
  oy: number;
  oz: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
  vz: number;
}

export default function Particles({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors = ["#71C168"],
  moveParticlesOnHover = true,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  className = "",
  style,
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1080);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 1080);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      targetMouseX = (e.clientX - rect.left - width / 2) / (width / 2);
      targetMouseY = (e.clientY - rect.top - height / 2) / (height / 2);
    };

    if (moveParticlesOnHover) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // Generate Particles
    const particles: Particle[] = [];
    const spread = particleSpread * 60;

    for (let i = 0; i < particleCount; i++) {
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread;
      const z = (Math.random() - 0.5) * spread;
      const color =
        particleColors[Math.floor(Math.random() * particleColors.length)] ||
        "#71C168";
      const sizeScale = 1 + (Math.random() - 0.5) * sizeRandomness;
      const size = Math.max(1, (particleBaseSize / 20) * sizeScale);

      particles.push({
        x,
        y,
        z,
        ox: x,
        oy: y,
        oz: z,
        size,
        color,
        vx: (Math.random() - 0.5) * speed * 0.5,
        vy: (Math.random() - 0.5) * speed * 0.5,
        vz: (Math.random() - 0.5) * speed * 0.5,
      });
    }

    let rotationAngle = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      if (!disableRotation) {
        rotationAngle += speed * 0.005;
      }

      const fov = cameraDistance * 40;
      const cx = width / 2;
      const cy = height / 2;

      // Sort by Z for realistic depth
      particles.sort((a, b) => b.z - a.z);

      particles.forEach((p) => {
        // Drift movement
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Soft bounds wrap
        const halfSpread = spread / 2;
        if (p.x > halfSpread) p.x = -halfSpread;
        if (p.x < -halfSpread) p.x = halfSpread;
        if (p.y > halfSpread) p.y = -halfSpread;
        if (p.y < -halfSpread) p.y = halfSpread;
        if (p.z > halfSpread) p.z = -halfSpread;
        if (p.z < -halfSpread) p.z = halfSpread;

        // Apply rotation around Y axis
        const cosR = Math.cos(rotationAngle);
        const sinR = Math.sin(rotationAngle);
        let rx = p.x * cosR - p.z * sinR;
        let ry = p.y;
        let rz = p.x * sinR + p.z * cosR;

        // Apply hover offset
        if (moveParticlesOnHover) {
          rx += mouseX * 40 * particleHoverFactor;
          ry += mouseY * 40 * particleHoverFactor;
        }

        // Perspective Projection
        const distance = fov + rz;
        if (distance <= 0) return;

        const scale = fov / distance;
        const projX = cx + rx * scale;
        const projY = cy + ry * scale;
        const radius = Math.max(0.5, p.size * scale);

        if (
          projX + radius < 0 ||
          projX - radius > width ||
          projY + radius < 0 ||
          projY - radius > height
        ) {
          return;
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(projX, projY, radius, 0, Math.PI * 2);

        if (alphaParticles) {
          const alpha = Math.min(1, Math.max(0.1, scale * 0.8));
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
        } else {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.min(1, Math.max(0.4, scale));
        }

        ctx.shadowColor = p.color;
        ctx.shadowBlur = radius * 1.5;
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (moveParticlesOnHover) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    particleCount,
    particleSpread,
    speed,
    particleColors,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative pointer-events-none overflow-hidden ${className}`}
      style={style}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-auto"
      />
    </div>
  );
}
