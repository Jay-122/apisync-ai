"use client";

import { Html, Line } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GraphFallback } from "@/components/3d/graph-fallback";
import type { DependencyStatus } from "@/types";

const COLORS: Record<DependencyStatus, string> = {
  healthy: "#34d399",
  warning: "#fbbf24",
  breaking: "#f87171",
  fixing: "#818cf8",
  fixed: "#22d3ee",
};

const STORY: DependencyStatus[] = ["healthy", "breaking", "fixing", "fixed"];

const SATELLITES = [
  { id: "openai", label: "OpenAI" },
  { id: "stripe", label: "Stripe" },
  { id: "twilio", label: "Twilio" },
  { id: "supabase", label: "Supabase" },
  { id: "posthog", label: "PostHog" },
  { id: "aws", label: "AWS" },
];

function statusFor(id: string, story: DependencyStatus): DependencyStatus {
  if (id === "openai") return story;
  if (id === "twilio") return "warning";
  return "healthy";
}

function Particles() {
  const positions = useMemo(() => {
    const count = 48;
    const array = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      array[index * 3] = (Math.random() - 0.5) * 8;
      array[index * 3 + 1] = (Math.random() - 0.5) * 4.5;
      array[index * 3 + 2] = (Math.random() - 0.5) * 3;
    }
    return array;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  const ref = useRef<THREE.Points>(null);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#94a3b8" size={0.018} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}

function Node({
  position,
  color,
  label,
  pulse,
  radius,
  showLabel,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  pulse: boolean;
  radius: number;
  showLabel: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const scale = pulse ? 1 + Math.sin(clock.elapsedTime * 3.2) * 0.08 : 1;
    ref.current.scale.setScalar(scale);
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[radius, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.85} roughness={0.35} />
      </mesh>
      {showLabel ? (
        <Html center distanceFactor={9} style={{ pointerEvents: "none" }}>
          <div className="mt-8 whitespace-nowrap text-center text-[10px] font-medium text-slate-200">{label}</div>
        </Html>
      ) : null}
    </group>
  );
}

function Scene({ story, showLabels }: { story: DependencyStatus; showLabels: boolean }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock, pointer, camera }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.15) * 0.03;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.35, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.15 + pointer.y * 0.2, 0.04);
    camera.lookAt(0, 0, 0);
  });

  const nodes = SATELLITES.map((node, index) => {
    const angle = (index / SATELLITES.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...node,
      position: [Math.cos(angle) * 2.55, Math.sin(angle) * 1.65, 0] as [number, number, number],
      status: statusFor(node.id, story),
    };
  });

  return (
    <group ref={group}>
      <ambientLight intensity={0.45} />
      <pointLight position={[3, 2, 4]} intensity={12} color="#99f6e4" />
      {nodes.map((node) => (
        <Line
          key={`${node.id}-link`}
          points={[
            [0, 0, 0],
            node.position,
          ]}
          color={COLORS[node.status]}
          transparent
          opacity={0.45}
          lineWidth={1}
        />
      ))}
      <Node
        position={[0, 0, 0]}
        color="#22d3ee"
        label="YOUR CODEBASE"
        pulse={false}
        radius={0.28}
        showLabel={showLabels}
      />
      {nodes.map((node) => (
        <Node
          key={node.id}
          position={node.position}
          color={COLORS[node.status]}
          label={node.label}
          pulse={node.status === "breaking" || node.status === "fixing"}
          radius={0.16}
          showLabel={showLabels}
        />
      ))}
      <Particles />
    </group>
  );
}

export function DependencyGraphCanvas({
  animateStory = true,
  showLabels = true,
}: {
  animateStory?: boolean;
  showLabels?: boolean;
}) {
  const [mode, setMode] = useState<"pending" | "canvas" | "fallback">("pending");
  const [visible, setVisible] = useState(true);
  const [story, setStory] = useState<DependencyStatus>("healthy");
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cores = navigator.hardwareConcurrency ?? 8;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
    const narrow = window.innerWidth < 768;
    setMode(reduce || cores <= 4 || memory <= 4 || narrow ? "fallback" : "canvas");
  }, []);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [mode]);

  useEffect(() => {
    if (!animateStory || mode !== "canvas") return;
    const timer = window.setInterval(() => {
      setStory((current) => STORY[(STORY.indexOf(current) + 1) % STORY.length]);
    }, 2600);
    return () => window.clearInterval(timer);
  }, [animateStory, mode]);

  return (
    <div ref={host} className="h-full w-full">
      {mode === "pending" ? <div className="h-full w-full bg-transparent" /> : null}
      {mode === "fallback" ? <GraphFallback /> : null}
      {mode === "canvas" ? (
        <Canvas
          camera={{ position: [0, 0.05, 6.4], fov: 38 }}
          dpr={[1, 1.5]}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: true, powerPreference: "high-performance", alpha: true }}
        >
          <Scene story={story} showLabels={showLabels} />
        </Canvas>
      ) : null}
    </div>
  );
}
