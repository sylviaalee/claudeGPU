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

// --- MOCK DATA ---
const MOCK_PATH = [
    { id: 'root', name: 'Nvidia HQ', emoji: '🏭', locations: [{ lat: 37.3688, lng: -122.0363, name: 'Santa Clara, USA' }], risk: 2 },
    { id: 'fab', name: 'TSMC Foundry', emoji: '💾', locations: [{ lat: 24.8138, lng: 120.9675, name: 'Hsinchu, Taiwan' }], risk: 7.5 },
    { id: 'assembly', name: 'Foxconn Assembly', emoji: '🔧', locations: [{ lat: 22.5431, lng: 114.0579, name: 'Shenzhen, China' }], risk: 4 },
    { id: 'dist', name: 'Global Distribution', emoji: '🚢', locations: [{ lat: 51.9225, lng: 4.47917, name: 'Rotterdam, Netherlands' }], risk: 3 }
];

const SimulationPage = ({ selectedPath = MOCK_PATH }) => {
    const mountRef = useRef(null);
    
    // --- STATE ---
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [simulationStatus, setSimulationStatus] = useState('idle'); // 'idle', 'running', 'completed', 'failed'
    const [simulationLog, setSimulationLog] = useState([]); 
    const [nodeStatuses, setNodeStatuses] = useState({}); // { id: 'pending' | 'active' | 'success' | 'warning' | 'error' | 'blocked' }

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

    // --- LOGIC: SIMULATION ENGINE ---
    const runSimulationStep = (index) => {
        // 1. Check if we reached the end
        if (index >= selectedPath.length) {
            setIsSimulating(false);
            setSimulationStatus('completed');
            addToLog("✅ Supply Chain Successfully Completed!", "success");
            return;
        }

        const item = selectedPath[index];
        setCurrentStepIndex(index);
        updateNodeStatus(item.id, 'active');

        // 2. Calculate Probability of Failure based on Risk Score
        // Formula: Risk 1 = 5%, Risk 5 = 25%, Risk 10 = 50% chance of *some* issue
        const failureChance = item.risk * 0.05; 
        const roll = Math.random();

        console.log(`Node: ${item.name} | Risk: ${item.risk} | Chance: ${failureChance.toFixed(2)} | Roll: ${roll.toFixed(2)}`);

        setTimeout(() => {
            // 3. Determine Outcome
            if (roll < failureChance) {
                // --- DISRUPTION OCCURRED ---
                handleDisruption(item, index);
            } else {
                // --- SUCCESS ---
                updateNodeStatus(item.id, 'success');
                addToLog(`✅ ${item.name}: Operations stable. Proceeding downstream.`, "success");
                
                // Propagate to next step
                setTimeout(() => runSimulationStep(index + 1), 1500);
            }
        }, 1000); // Small delay to simulate "processing" at the node
    };

    const handleDisruption = (item, index) => {
        // 4. Determine Severity of Disruption
        // We roll another die to see how bad it is.
        // Higher base risk also increases the chance of *severe* consequences.
        
        const severityRoll = Math.random() + (item.risk * 0.05); // Bias towards severity if high risk
        
        if (severityRoll > 0.85) {
            // === CRITICAL FAILURE (STOPPAGE) ===
            updateNodeStatus(item.id, 'error');
            addToLog(`⛔ CRITICAL STOPPAGE at ${item.name}. Supply chain halted.`, "danger");
            
            // Mark downstream as blocked
            for (let i = index + 1; i < selectedPath.length; i++) {
                updateNodeStatus(selectedPath[i].id, 'blocked');
            }
            
            setIsSimulating(false);
            setSimulationStatus('failed');

        } else if (severityRoll > 0.5) {
            // === MAJOR DELAY / CAPACITY LOSS ===
            updateNodeStatus(item.id, 'warning');
            addToLog(`⚠️ Capacity reduced at ${item.name} due to labor shortages. Moving forward with delays.`, "warning");
            
            // Proceed, but slower
            setTimeout(() => runSimulationStep(index + 1), 3000);

        } else {
            // === MINOR DELAY ===
            updateNodeStatus(item.id, 'warning');
            addToLog(`⏱️ Minor weather delays at ${item.name}. Schedule adjusted.`, "neutral");
            
            // Proceed normally
            setTimeout(() => runSimulationStep(index + 1), 2000);
        }
    };

    const startSimulation = () => {
        if (isSimulating) return;
        setIsSimulating(true);
        setSimulationStatus('running');
        setSimulationLog([]);
        setNodeStatuses({});
        setCurrentStepIndex(-1);
        addToLog("🚀 Initiating Supply Chain Simulation...", "neutral");
        
        setTimeout(() => {
            runSimulationStep(0);
        }, 1000);
    };

    const addToLog = (text, type) => {
        setSimulationLog(prev => [...prev, { text, type, id: Date.now() }]);
    };

    const updateNodeStatus = (id, status) => {
        setNodeStatuses(prev => ({ ...prev, [id]: status }));
    };

    // --- THREE.JS SETUP (Standard Globe) ---
    useEffect(() => {
        if (!mountRef.current) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 5.5;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(5, 3, 5);
        scene.add(pointLight);

        const globeGeometry = new THREE.SphereGeometry(1.3, 64, 64);
        const globeTexture = new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'); 
        const globeMaterial = new THREE.MeshPhongMaterial({ map: globeTexture, shininess: 20 });
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        scene.add(globe);
        globeRef.current = globe;

        const markersGroup = new THREE.Group();
        globe.add(markersGroup);
        markersGroupRef.current = markersGroup;

        const arcGroup = new THREE.Group();
        globe.add(arcGroup);
        arcGroupRef.current = arcGroup;

        // Starfield
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

        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            if (!isDraggingRef.current) {
                globe.rotation.y += 0.0005;
            }
            renderer.render(scene, camera);
        };
        animate();

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

    // --- EFFECT: Visuals (Markers & Arcs) ---
    useEffect(() => {
        if (!markersGroupRef.current || !arcGroupRef.current) return;

        const markersGroup = markersGroupRef.current;
        const arcGroup = arcGroupRef.current;

        // Clear existing
        while (markersGroup.children.length > 0) markersGroup.remove(markersGroup.children[0]);
        while (arcGroup.children.length > 0) arcGroup.remove(arcGroup.children[0]);

        const getStatusColor = (status, baseRisk) => {
            if (status === 'active') return 0xffffff; // White pulse
            if (status === 'success') return 0x22c55e; // Green
            if (status === 'warning') return 0xf59e0b; // Orange
            if (status === 'error') return 0xef4444; // Red
            if (status === 'blocked') return 0x334155; // Dark Grey (Slate 700)
            
            // Default (Pending)
            if (baseRisk >= 8) return 0x7f1d1d;
            if (baseRisk >= 5) return 0x7c2d12;
            return 0x14532d;
        };

        selectedPath.forEach((item, index) => {
            const status = nodeStatuses[item.id] || 'pending';
            const isActive = status === 'active';

            if (item.locations && item.locations[0]) {
                const pos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.3);

                // --- MARKER ---
                const color = getStatusColor(status, item.risk);
                
                const markerGeo = new THREE.SphereGeometry(isActive ? 0.06 : 0.04, 16, 16);
                const markerMat = new THREE.MeshBasicMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: status === 'blocked' ? 0.3 : 1
                });
                const marker = new THREE.Mesh(markerGeo, markerMat);
                marker.position.copy(pos);
                
                // Pulse Effect for Active Node
                if (isActive) {
                    const glowGeo = new THREE.SphereGeometry(0.08, 16, 16);
                    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
                    const glow = new THREE.Mesh(glowGeo, glowMat);
                    glow.position.copy(pos);
                    markersGroup.add(glow);
                }

                markersGroup.add(marker);

                // --- ARC ---
                if (index > 0) {
                    const prevItem = selectedPath[index - 1];
                    const prevPos = latLonToVector3(prevItem.locations[0].lat, prevItem.locations[0].lng, 1.3);
                    
                    // Arc Color Logic
                    // If current is blocked, line is dark. If current is reached, line is blue.
                    let lineColor = 0x334155; // Default dark
                    let lineOpacity = 0.2;

                    if (status === 'active' || status === 'success' || status === 'warning' || status === 'error') {
                        lineColor = 0x3b82f6; // Blue
                        lineOpacity = 1.0;
                    }
                    
                    // If previous node FAILED, this line shouldn't really exist or should be red? 
                    // For now, let's keep it simple: line exists if we are calculating this node.
                    
                    const arc = createArcLine(prevPos, pos, new THREE.Color(lineColor), 0.3);
                    arc.material.opacity = lineOpacity;
                    arcGroup.add(arc);
                }
            }
        });

    }, [selectedPath, nodeStatuses, currentStepIndex]);


    return (
        <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
            <div ref={mountRef} className="w-full h-full" />

            {/* --- CONTROLS --- */}
            <div className="absolute top-6 right-6 z-[2000] flex flex-col items-end gap-4 pointer-events-auto">
                <div className="bg-slate-800/90 backdrop-blur border border-slate-600 p-4 rounded-xl shadow-2xl w-80">
                    <h2 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                        <span>⚡</span> Supply Chain Simulation
                    </h2>
                    <p className="text-gray-400 text-sm mb-4">
                        Simulating probability of failure at each node based on risk thresholds.
                    </p>
                    
                    <button 
                        onClick={startSimulation}
                        disabled={isSimulating && simulationStatus === 'running'}
                        className={`w-full py-3 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                            isSimulating && simulationStatus === 'running'
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600'
                            : simulationStatus === 'failed'
                                ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 hover:scale-[1.02]'
                        }`}
                    >
                        {simulationStatus === 'running' ? (
                            <><span className="animate-spin">⚙️</span> Running...</>
                        ) : simulationStatus === 'failed' ? (
                            <>↻ Retry Simulation</>
                        ) : (
                            <>▶️ Run Simulation</>
                        )}
                    </button>
                </div>

                {/* --- LOGS --- */}
                {simulationLog.length > 0 && (
                    <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-0 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden flex flex-col">
                        <div className="p-3 bg-slate-800 border-b border-slate-700 font-semibold text-gray-300 text-xs uppercase tracking-wide">
                            Live Status
                        </div>
                        <div className="overflow-y-auto p-3 space-y-3 flex-1">
                            {simulationLog.map((log) => (
                                <div key={log.id} className={`text-sm p-2 rounded border-l-2 animate-in fade-in slide-in-from-right-4 duration-500 ${
                                    log.type === 'danger' ? 'bg-red-900/20 border-red-500 text-red-200' :
                                    log.type === 'warning' ? 'bg-orange-900/20 border-orange-500 text-orange-200' :
                                    log.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-200' :
                                    'bg-slate-800 border-slate-500 text-gray-300'
                                }`}>
                                    {log.text}
                                </div>
                            ))}
                            <div ref={(el) => el && el.scrollIntoView({ behavior: 'smooth' })} />
                        </div>
                    </div>
                )}
            </div>

            {/* --- VISUALIZER --- */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[2000] w-auto max-w-[90%] pointer-events-auto">
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600 p-3 rounded-2xl shadow-2xl flex items-center space-x-1 overflow-x-auto">
                    {selectedPath.map((item, index) => {
                         const status = nodeStatuses[item.id] || 'pending';
                         
                         let borderClass = 'border-slate-600';
                         if(status === 'active') borderClass = 'border-white animate-pulse';
                         if(status === 'success') borderClass = 'border-green-500';
                         if(status === 'warning') borderClass = 'border-orange-500';
                         if(status === 'error') borderClass = 'border-red-500';
                         if(status === 'blocked') borderClass = 'border-slate-700 opacity-50';

                         return (
                            <React.Fragment key={item.id}>
                                {index > 0 && (
                                    <div className={`h-0.5 w-6 transition-colors duration-500 ${
                                        status === 'pending' || status === 'blocked' ? 'bg-slate-700' : 'bg-blue-500'
                                    }`} />
                                )}
                                <div className={`
                                    relative flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300
                                    ${borderClass}
                                    ${status === 'active' ? 'bg-slate-700 scale-110 shadow-lg' : 'bg-slate-800'}
                                `}>
                                    <span className="text-xl">{status === 'blocked' ? '🔒' : item.emoji}</span>
                                    {/* Status Icon Overlay */}
                                    {status === 'error' && (
                                        <div className="absolute -top-2 -right-2 bg-red-600 rounded-full p-0.5 border border-slate-900">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </div>
                                    )}
                                    {status === 'success' && (
                                        <div className="absolute -top-2 -right-2 bg-green-600 rounded-full p-0.5 border border-slate-900">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        </div>
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