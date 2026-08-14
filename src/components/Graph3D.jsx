import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { evaluateFunction3D } from '../utils/mathEngine';
import { Play, Pause, Sun, Grid, RotateCcw } from 'lucide-react';
import { soundSynth } from '../utils/audioSynth';

export default function Graph3D({ parameters, canvasRef }) {
  const mountRef = useRef(null);
  const [expr3D, setExpr3D] = useState('sin(sqrt(x^2 + y^2)) / (sqrt(x^2 + y^2) + 0.1)');
  const [isWireframe, setIsWireframe] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isLit, setIsLit] = useState(true);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);

  // Initialize Three.js Scene & Render Loop
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d16); // Dark background
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(15, 12, 18);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight1.position.set(10, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xec4899, 0.8);
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
    gridHelper.position.y = -4;
    scene.add(gridHelper);

    // Build 3D Mesh Surface
    const size = 12;
    const segments = 70;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    // Material with Vertex Colors
    const material = new THREE.MeshPhongMaterial({
      side: THREE.DoubleSide,
      wireframe: isWireframe,
      vertexColors: true,
      shininess: 80
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Mouse Interaction for Rotation & Zoom
    let isMouseDown = false;
    let prevMousePos = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isMouseDown = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      mesh.rotation.y += deltaX * 0.008;
      mesh.rotation.x += deltaY * 0.008;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (e) => {
      e.preventDefault();
      camera.position.multiplyScalar(e.deltaY > 0 ? 1.08 : 0.92);
    };

    mount.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    mount.addEventListener('wheel', handleWheel);

    // Animation Render Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isAutoRotate && !isMouseDown) {
        mesh.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      mount.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      mount.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [mountRef, canvasRef]);

  // Update Surface Vertices & Heatmap Colors when Expression or Parameters change
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const geometry = mesh.geometry;
    const posAttr = geometry.attributes.position;
    const count = posAttr.count;

    const colors = [];
    const colorLow = new THREE.Color(0x06b6d4);  // Cyan
    const colorMid = new THREE.Color(0x8b5cf6);  // Violet
    const colorHigh = new THREE.Color(0xf59e0b); // Amber

    let minZ = Infinity;
    let maxZ = -Infinity;
    const zValues = [];

    // Evaluate Z positions
    for (let i = 0; i < count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getZ(i); // Note: Z in plane geometry is depth Y in math
      const z = evaluateFunction3D(expr3D, x, y, parameters);
      const safeZ = isNaN(z) || !isFinite(z) ? 0 : z;

      posAttr.setY(i, safeZ);
      zValues.push(safeZ);

      if (safeZ < minZ) minZ = safeZ;
      if (safeZ > maxZ) maxZ = safeZ;
    }

    const rangeZ = maxZ - minZ || 1;

    // Apply Gradient Vertex Colors
    for (let i = 0; i < count; i++) {
      const z = zValues[i];
      const normZ = (z - minZ) / rangeZ;

      const vertexColor = new THREE.Color();
      if (normZ < 0.5) {
        vertexColor.copy(colorLow).lerp(colorMid, normZ * 2);
      } else {
        vertexColor.copy(colorMid).lerp(colorHigh, (normZ - 0.5) * 2);
      }

      colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
    }

    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    posAttr.needsUpdate = true;
    geometry.computeVertexNormals();
  }, [expr3D, parameters]);

  // Update Material Properties
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.material.wireframe = isWireframe;
    }
  }, [isWireframe]);

  return (
    <div className="flex flex-col gap-4">
      {/* 3D Formula Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="font-mono text-xs font-semibold text-cyan-400">z = f(x, y) =</span>
          <input
            type="text"
            value={expr3D}
            onChange={(e) => setExpr3D(e.target.value)}
            placeholder="sin(x) * cos(y)"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundSynth.playKeyClick(600, 0.02);
              setIsWireframe(!isWireframe);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              isWireframe
                ? 'bg-purple-950/60 text-purple-300 border-purple-700/60'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Wireframe</span>
          </button>

          <button
            onClick={() => {
              soundSynth.playKeyClick(600, 0.02);
              setIsAutoRotate(!isAutoRotate);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              isAutoRotate
                ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/60'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>Rotate</span>
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="relative w-full h-[500px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl group cursor-grab active:cursor-grabbing"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
        <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] font-mono text-slate-400">
          Rotate: Drag Mouse | Zoom: Scroll Wheel
        </div>
      </div>
    </div>
  );
}
