'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// --- UTILITY: Geolocation Math ---
const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
};

// --- UTILITY: Arc Generator ---
const createArcLine = (startVector, endVector, color, height = 0.5) => {
    const midVector = startVector.clone().add(endVector).divideScalar(2);
    const distance = startVector.distanceTo(endVector);
    const arcHeight = Math.sqrt(distance) * height; 
    const midPoint = midVector.normalize().multiplyScalar(1.3 + arcHeight); 

    const curve = new THREE.QuadraticBezierCurve3(startVector, midPoint, endVector);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: color, linewidth: 2, transparent: true, opacity: 0.8 });
    return new THREE.Line(geometry, material);
};

// --- MOCK DATA FOR PREVIEW (If no props passed) ---
// In your real app, pass the breadcrumb array from the previous page as props.
const MOCK_PATH = [
    { id: 'root', name: 'Nvidia HQ', emoji: '🏭', locations: [{ lat: 37.3688, lng: -122.0363, name: 'Santa Clara, USA' }], risk: 2 },
    { id: 'fab', name: 'TSMC Foundry', emoji: '💾', locations: [{ lat: 24.8138, lng: 120.9675, name: 'Hsinchu, Taiwan' }], risk: 6.5 },
    { id: 'assembly', name: 'Foxconn Assembly', emoji: '🔧', locations: [{ lat: 22.5431, lng: 114.0579, name: 'Shenzhen, China' }], risk: 4 },
    { id: 'dist', name: 'Global Distribution', emoji: '🚢', locations: [{ lat: 51.9225, lng: 4.47917, name: 'Rotterdam, Netherlands' }], risk: 3 }
];

const SimulationPage = ({ selectedPath = MOCK_PATH }) => {
    const mountRef = useRef(null);
    
    // --- STATE ---
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 = Ready, 0...N = Active Steps
    const [simulationLog, setSimulationLog] = useState([]); // Stores the text logs
    const [simulatedRisks, setSimulatedRisks] = useState({}); // Stores random risk results per ID

    // --- REFS ---
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const globeRef = useRef(null);
    const markersGroupRef = useRef(null);
    const arcGroupRef = useRef(null);
    const isDraggingRef = useRef(false);
    const previousMouseRef = useRef({ x: 0, y: 0 });
    const frameIdRef = useRef(null);

    // --- SIMULATION LOGIC ---
    const runSimulationStep = (index) => {
        if (index >= selectedPath.length) {
            setIsSimulating(false);
            addToLog("✅ Supply Chain Simulation Complete", "success");
            return;
        }

        const item = selectedPath[index];
        setCurrentStepIndex(index);

        // 1. Generate Random Event / Risk
        // Randomly adjust risk by -2 to +3
        const randomVariance = (Math.random() * 5) - 2; 
        const newRisk = Math.max(1, Math.min(10, item.risk + randomVariance));
        
        setSimulatedRisks(prev => ({ ...prev, [item.id]: newRisk }));

        // 2. Generate Log Message
        let message = `Arrived at ${item.name}. Operations normal.`;
        let type = "neutral";
        
        if (newRisk > 7.5) {
            const disasters = ["Typhoon Warning", "Labor Strike", "Chip Shortage", "Customs Hold"];
            const event = disasters[Math.floor(Math.random() * disasters.length)];
            message = `⚠️ ALERT at ${item.name}: ${event} detected! Risk spiked to ${newRisk.toFixed(1)}.`;
            type = "danger";
        } else if (newRisk < item.risk) {
            message = `✅ Efficiency gain at ${item.name}. Risk lowered.`;
            type = "success";
        }

        addToLog(message, type);

        // 3. Move Camera to look at this point (Optional visual flair)
        // Note: Implementing smooth camera lerp requires TWEEN or complex logic, 
        // for now we stick to rotating the globe in the animate loop.

        // 4. Schedule next step
        setTimeout(() => {
            runSimulationStep(index + 1);
        }, 2500); // 2.5 seconds per step
    };

    const startSimulation = () => {
        if (isSimulating) return;
        setIsSimulating(true);
        setSimulationLog([]);
        setSimulatedRisks({});
        setCurrentStepIndex(-1);
        addToLog("🚀 Initializing Simulation Sequence...", "neutral");
        
        setTimeout(() => {
            runSimulationStep(0);
        }, 1000);
    };

    const addToLog = (text, type) => {
        setSimulationLog(prev => [...prev, { text, type, id: Date.now() }]);
    };

    // --- THREE.JS SETUP ---
    useEffect(() => {
        if (!mountRef.current) return;

        // 1. Setup Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 5.5; // Slightly further back to see context
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lights
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(5, 3, 5);
        scene.add(pointLight);

        // Globe
        const globeGeometry = new THREE.SphereGeometry(1.3, 64, 64);
        const globeTexture = new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'); 
        const globeMaterial = new THREE.MeshPhongMaterial({ map: globeTexture, shininess: 20 });
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        scene.add(globe);
        globeRef.current = globe;

        // Groups
        const markersGroup = new THREE.Group();
        globe.add(markersGroup); // Attach to globe so they rotate with it
        markersGroupRef.current = markersGroup;

        const arcGroup = new THREE.Group();
        globe.add(arcGroup);
        arcGroupRef.current = arcGroup;

        // Stars
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 2000; i++) {
            const x = (Math.random() - 0.5) * 100;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;
            starVertices.push(x, y, z);
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, opacity: 0.5, transparent: true }));
        scene.add(stars);

        // Controls
        const handleMouseDown = (e) => {
            isDraggingRef.current = true;
            previousMouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            const deltaX = e.clientX - previousMouseRef.current.x;
            const deltaY = e.clientY - previousMouseRef.current.y;
            globe.rotation.x += deltaY * 0.005;
            globe.rotation.y += deltaX * 0.005;
            previousMouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => isDraggingRef.current = false;

        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        renderer.domElement.addEventListener('mousemove', handleMouseMove);
        renderer.domElement.addEventListener('mouseup', handleMouseUp);

        // Animation Loop
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            if (!isDraggingRef.current) {
                globe.rotation.y += 0.0005; // Very slow rotate
            }
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        const handleResize = () => {
            if (!mountRef.current) return;
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameIdRef.current);
            window.removeEventListener('resize', handleResize);
            if(renderer.domElement) {
                renderer.domElement.removeEventListener('mousedown', handleMouseDown);
                renderer.domElement.removeEventListener('mousemove', handleMouseMove);
                renderer.domElement.removeEventListener('mouseup', handleMouseUp);
                if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
        };
    }, []);

    // --- EFFECT: Render Markers & Arcs based on Step ---
    useEffect(() => {
        if (!markersGroupRef.current || !arcGroupRef.current) return;

        const markersGroup = markersGroupRef.current;
        const arcGroup = arcGroupRef.current;

        // Clear existing
        while (markersGroup.children.length > 0) markersGroup.remove(markersGroup.children[0]);
        while (arcGroup.children.length > 0) arcGroup.remove(arcGroup.children[0]);

        const getRiskColor = (risk) => {
            if (risk >= 8) return 0xff3333; // Red
            if (risk >= 6) return 0xff6b35; // Orange
            if (risk >= 4) return 0xffaa00; // Yellow
            return 0x44ff44; // Green
        };

        selectedPath.forEach((item, index) => {
            // Determine Risk: Use simulated if available, else static
            const risk = simulatedRisks[item.id] !== undefined ? simulatedRisks[item.id] : item.risk;
            const isFuture = currentStepIndex > -1 && index > currentStepIndex;
            const isActive = index === currentStepIndex;

            if (item.locations && item.locations[0]) {
                const pos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.3);

                // --- MARKER ---
                // If it's a future step (and we are simulating), make it gray/ghosted
                const color = isFuture ? 0x555555 : getRiskColor(risk);
                
                const markerGeo = new THREE.SphereGeometry(isActive ? 0.06 : 0.04, 16, 16);
                const markerMat = new THREE.MeshBasicMaterial({ 
                    color: isActive ? 0xffffff : color, // Active flashes white
                    transparent: true,
                    opacity: isFuture ? 0.3 : 1
                });
                const marker = new THREE.Mesh(markerGeo, markerMat);
                marker.position.copy(pos);
                
                // Add a "Glow" halo if active
                if (isActive) {
                    const glowGeo = new THREE.SphereGeometry(0.08, 16, 16);
                    const glowMat = new THREE.MeshBasicMaterial({ color: getRiskColor(risk), transparent: true, opacity: 0.5 });
                    const glow = new THREE.Mesh(glowGeo, glowMat);
                    glow.position.copy(pos);
                    markersGroup.add(glow);
                }

                markersGroup.add(marker);

                // --- ARC (Line to previous) ---
                if (index > 0) {
                    const prevItem = selectedPath[index - 1];
                    const prevPos = latLonToVector3(prevItem.locations[0].lat, prevItem.locations[0].lng, 1.3);
                    
                    // Only draw solid line if we have passed this step
                    const lineOpacity = index <= currentStepIndex ? 1.0 : 0.1;
                    const lineColor = index <= currentStepIndex ? 0x3b82f6 : 0x333333; // Blue if passed, dark gray if future

                    const arc = createArcLine(prevPos, pos, new THREE.Color(lineColor), 0.3);
                    arc.material.opacity = lineOpacity;
                    arcGroup.add(arc);
                }
            }
        });

    }, [selectedPath, currentStepIndex, simulatedRisks]);


    return (
        <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
            <div ref={mountRef} className="w-full h-full" />

            {/* --- HEADER / SIMULATE BUTTON --- */}
            <div className="absolute top-6 right-6 z-[2000] flex flex-col items-end gap-4 pointer-events-auto">
                <div className="bg-slate-800/90 backdrop-blur border border-slate-600 p-4 rounded-xl shadow-2xl w-80">
                    <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                        <span>⚡</span> Supply Chain Simulation
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Run a Monte Carlo simulation on your selected path to predict supply chain disruptions.
                    </p>
                    
                    <button 
                        onClick={startSimulation}
                        disabled={isSimulating}
                        className={`w-full py-3 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                            isSimulating 
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 hover:scale-[1.02]'
                        }`}
                    >
                        {isSimulating ? (
                            <>
                                <span className="animate-spin">⚙️</span> Running Simulation...
                            </>
                        ) : (
                            <>
                                ▶️ Run Simulation
                            </>
                        )}
                    </button>
                </div>

                {/* --- SIMULATION LOG --- */}
                {simulationLog.length > 0 && (
                    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-0 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden flex flex-col">
                        <div className="p-3 bg-slate-800 border-b border-slate-700 font-semibold text-gray-300 text-xs uppercase tracking-wide">
                            Live Logs
                        </div>
                        <div className="overflow-y-auto p-3 space-y-3 flex-1">
                            {simulationLog.map((log) => (
                                <div key={log.id} className={`text-sm p-2 rounded border-l-2 animate-in fade-in slide-in-from-right-4 duration-500 ${
                                    log.type === 'danger' ? 'bg-red-900/20 border-red-500 text-red-200' :
                                    log.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-200' :
                                    'bg-slate-800 border-slate-500 text-gray-300'
                                }`}>
                                    {log.text}
                                </div>
                            ))}
                            {/* Auto scroll anchor */}
                            <div ref={(el) => el && el.scrollIntoView({ behavior: 'smooth' })} />
                        </div>
                    </div>
                )}
            </div>

            {/* --- TOP LEFT: CONTEXT --- */}
            <div className="absolute top-6 left-6 z-[2000] pointer-events-none">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Impact Analysis
                </h1>
                <p className="text-blue-200/60 text-sm font-medium mt-1">
                    Visualizing risk propagation across selected nodes.
                </p>
            </div>

            {/* --- BOTTOM BREADCRUMBS (Reused Layout) --- */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2000] w-auto max-w-[90%] pointer-events-auto">
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600 p-3 rounded-2xl shadow-2xl flex items-center space-x-1 overflow-x-auto">
                    {selectedPath.map((item, index) => {
                         const isActive = index === currentStepIndex;
                         const isPassed = index < currentStepIndex || (currentStepIndex === -1 && !isSimulating && Object.keys(simulatedRisks).length > 0);
                         const risk = simulatedRisks[item.id] !== undefined ? simulatedRisks[item.id] : item.risk;

                         // Risk Border Color
                         const borderColor = risk >= 8 ? 'border-red-500' : 
                                             risk >= 6 ? 'border-orange-500' : 
                                             risk >= 4 ? 'border-yellow-500' : 'border-green-500';

                         return (
                            <React.Fragment key={item.id}>
                                {index > 0 && (
                                    <div className={`h-0.5 w-6 ${isPassed ? 'bg-blue-500' : 'bg-slate-600'}`} />
                                )}
                                <div className={`
                                    relative flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-500
                                    ${isActive ? `scale-110 shadow-[0_0_15px_rgba(59,130,246,0.6)] ${borderColor} bg-slate-700` : `bg-slate-800 ${borderColor} opacity-80`}
                                `}>
                                    <span className="text-xl">{item.emoji}</span>
                                    {/* Risk Badge */}
                                    <div className={`absolute -top-2 -right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white shadow-sm ${
                                        risk >= 8 ? 'bg-red-600' : 
                                        risk >= 6 ? 'bg-orange-600' : 
                                        risk >= 4 ? 'bg-yellow-600' : 'bg-green-600'
                                    }`}>
                                        {risk.toFixed(1)}
                                    </div>
                                    {/* Active Pulse */}
                                    {isActive && (
                                        <span className="absolute inset-0 rounded-xl border-2 border-white animate-ping opacity-75"></span>
                                    )}
                                </div>
                            </React.Fragment>
                         );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SimulationPage;