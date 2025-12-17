'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
    const hasInitialized = useRef(false);
    
    // --- STATE ---
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [simulationStatus, setSimulationStatus] = useState('idle');
    const [simulationLog, setSimulationLog] = useState([]); 
    const [nodeStatuses, setNodeStatuses] = useState({});
    const [metrics, setMetrics] = useState({
        totalCost: 0,
        totalTime: 0,
        totalDistance: 0,
        totalCarbon: 0
    });
    const [metricsHistory, setMetricsHistory] = useState([]);
    const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);

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
    const textureRef = useRef(null);
    const isMountedRef = useRef(true);

    // --- LOGIC: SIMULATION ENGINE ---
    const runSimulationStep = useCallback((index) => {
        if (index >= selectedPath.length) {
            setIsSimulating(false);
            setSimulationStatus('completed');
            setSimulationLog(prev => [...prev, { text: "✅ Supply Chain Successfully Completed!", type: "success", id: Date.now() + Math.random() }]);
            return;
        }

        const item = selectedPath[index];
        setCurrentStepIndex(index);
        setNodeStatuses(prev => ({ ...prev, [item.id]: 'active' }));

        // Calculate metrics for this leg
        if (index > 0) {
            const prevItem = selectedPath[index - 1];
            const prevPos = latLonToVector3(prevItem.locations[0].lat, prevItem.locations[0].lng, 1.3);
            const currPos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.3);
            const distance = prevPos.distanceTo(currPos) * 5000;
            
            const legCost = distance * (0.5 + Math.random() * 0.5);
            const legTime = distance / (500 + Math.random() * 300);
            const legCarbon = distance * (0.2 + Math.random() * 0.3);
            
            setMetrics(prev => {
                const newMetrics = {
                    totalCost: prev.totalCost + legCost,
                    totalTime: prev.totalTime + legTime,
                    totalDistance: prev.totalDistance + distance,
                    totalCarbon: prev.totalCarbon + legCarbon
                };
                
                setMetricsHistory(history => [...history, {
                    step: index,
                    name: item.name,
                    ...newMetrics
                }]);
                
                return newMetrics;
            });
        } else {
            setMetricsHistory([{
                step: 0,
                name: item.name,
                totalCost: 0,
                totalTime: 0,
                totalDistance: 0,
                totalCarbon: 0
            }]);
        }

        const failureChance = item.risk * 0.05; 
        const roll = Math.random();

        setTimeout(() => {
            if (roll < failureChance) {
                const severityRoll = Math.random() + (item.risk * 0.05);
                
                if (severityRoll > 0.85) {
                    setNodeStatuses(prev => {
                        const newStatuses = { ...prev, [item.id]: 'error' };
                        for (let i = index + 1; i < selectedPath.length; i++) {
                            newStatuses[selectedPath[i].id] = 'blocked';
                        }
                        return newStatuses;
                    });
                    setSimulationLog(prev => [...prev, { text: `⛔ CRITICAL STOPPAGE at ${item.name}. Supply chain halted.`, type: "danger", id: Date.now() + Math.random() }]);
                    setIsSimulating(false);
                    setSimulationStatus('failed');
                } else if (severityRoll > 0.5) {
                    setNodeStatuses(prev => ({ ...prev, [item.id]: 'warning' }));
                    setSimulationLog(prev => [...prev, { text: `⚠️ Capacity reduced at ${item.name} due to labor shortages. Moving forward with delays.`, type: "warning", id: Date.now() + Math.random() }]);
                    setTimeout(() => runSimulationStep(index + 1), 3000);
                } else {
                    setNodeStatuses(prev => ({ ...prev, [item.id]: 'warning' }));
                    setSimulationLog(prev => [...prev, { text: `⏱️ Minor weather delays at ${item.name}. Schedule adjusted.`, type: "neutral", id: Date.now() + Math.random() }]);
                    setTimeout(() => runSimulationStep(index + 1), 2000);
                }
            } else {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'success' }));
                setSimulationLog(prev => [...prev, { text: `✅ ${item.name}: Operations stable. Proceeding downstream.`, type: "success", id: Date.now() + Math.random() }]);
                setTimeout(() => runSimulationStep(index + 1), 1500);
            }
        }, 1000);
    }, [selectedPath]);

    const startSimulation = useCallback(() => {
        if (isSimulating && simulationStatus === 'running') return;
        setIsSimulating(true);
        setSimulationStatus('running');
        setSimulationLog([{ text: "🚀 Initiating Supply Chain Simulation...", type: "neutral", id: Date.now() }]);
        setNodeStatuses({});
        setCurrentStepIndex(-1);
        setMetrics({ totalCost: 0, totalTime: 0, totalDistance: 0, totalCarbon: 0 });
        setMetricsHistory([]);
        setIsMetricsExpanded(false);
        
        setTimeout(() => {
            runSimulationStep(0);
        }, 1000);
    }, [isSimulating, simulationStatus, runSimulationStep]);

    // --- THREE.JS SETUP ---
    useEffect(() => {
        if (!mountRef.current) return;
        
        // Prevent double initialization
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        
        // Clear any existing canvases
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(
            45, 
            mountRef.current.clientWidth / mountRef.current.clientHeight, 
            0.1, 
            1000
        );
        camera.position.z = 5.5;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: false,
            powerPreference: "high-performance"
        });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(5, 3, 5);
        scene.add(pointLight);

        // Create globe with fallback color first
        const globeGeometry = new THREE.SphereGeometry(1.3, 64, 64);
        const globeMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2563eb, // Blue fallback color
            shininess: 20
        });
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        scene.add(globe);
        globeRef.current = globe;

        // Stars
        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 2000; i++) {
            starVertices.push(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );
        }
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(
            starGeometry, 
            new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, opacity: 0.5, transparent: true })
        );
        scene.add(stars);

        // Load texture asynchronously with multiple fallback sources
        // Load texture asynchronously with multiple fallback sources
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = 'anonymous'; // Enable CORS
        
        const textureSources = [
            'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
            'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg',
            'https://raw.githubusercontent.com/mrdoob/three.js/r128/examples/textures/planets/earth_atmos_2048.jpg',
            'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
        ];
        
        let currentSource = 0;
        const tryLoadTexture = () => {
            if (currentSource >= textureSources.length) {
                console.error('All texture sources failed, using fallback color');
                return;
            }
            
            console.log('Attempting to load texture from source:', currentSource, textureSources[currentSource]);
            
            textureLoader.load(
                textureSources[currentSource],
                (texture) => {
                    // Apply texture when loaded
                    console.log('✅ Texture loaded successfully from source:', currentSource);
                    console.log('isMounted?', isMountedRef.current);
                    console.log('Globe exists?', !!globeRef.current);
                    console.log('Material exists?', !!globeRef.current?.material);
                    
                    if (!isMountedRef.current) {
                        console.error('Component unmounted before texture loaded');
                        texture.dispose();
                        return;
                    }
                    
                    if (globeRef.current && globeRef.current.material) {
                        // Store the texture reference first
                        textureRef.current = texture;
                        
                        // Update material - remove the blue color tint
                        globeRef.current.material.color.setHex(0xffffff); // Reset to white
                        globeRef.current.material.map = texture;
                        globeRef.current.material.needsUpdate = true;
                        
                        console.log('Material.map set?', !!globeRef.current.material.map);
                        
                        // Force the renderer to update
                        if (rendererRef.current && sceneRef.current && cameraRef.current) {
                            rendererRef.current.render(sceneRef.current, cameraRef.current);
                        }
                        
                        console.log('Material updated with texture');
                    } else {
                        console.error('Globe or material not available');
                    }
                },
                (progress) => {
                    if (progress.total > 0) {
                        console.log('Loading texture...', Math.round((progress.loaded / progress.total) * 100) + '%');
                    }
                },
                (error) => {
                    console.error('❌ Texture source', currentSource, 'failed:', error);
                    currentSource++;
                    tryLoadTexture();
                }
            );
        };
        
        tryLoadTexture();

        // Mouse controls
        const handleMouseDown = (e) => {
            isDraggingRef.current = true;
            previousMouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseMove = (e) => {
            if (!isDraggingRef.current || !globeRef.current) return;
            const deltaX = e.clientX - previousMouseRef.current.x;
            const deltaY = e.clientY - previousMouseRef.current.y;
            globeRef.current.rotation.x += deltaY * 0.005;
            globeRef.current.rotation.y += deltaX * 0.005;
            previousMouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };

        const canvas = renderer.domElement;
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);

        // Animation loop
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            
            if (globeRef.current && !isDraggingRef.current) {
                globeRef.current.rotation.y += 0.001;
            }
            
            // Slowly rotate stars for extra effect
            if (stars) {
                stars.rotation.y += 0.0002;
            }
            
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
            
            cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            console.log('Cleanup called - detaching canvas but keeping scene alive');
            // Don't set isMounted to false yet, texture might still be loading
            
            // Just detach the canvas, don't destroy anything
            if (rendererRef.current?.domElement && mountRef.current?.contains(rendererRef.current.domElement)) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
            
            if (frameIdRef.current) {
                cancelAnimationFrame(frameIdRef.current);
                frameIdRef.current = null;
            }
        };
    }, []);

    // --- EFFECT: Visuals ---
    useEffect(() => {
        if (!markersGroupRef.current || !arcGroupRef.current) return;

        const markersGroup = markersGroupRef.current;
        const arcGroup = arcGroupRef.current;

        // Clear existing markers and arcs
        while (markersGroup.children.length > 0) {
            const child = markersGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            markersGroup.remove(child);
        }
        while (arcGroup.children.length > 0) {
            const child = arcGroup.children[0];
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
            arcGroup.remove(child);
        }

        const getStatusColor = (status, baseRisk) => {
            if (status === 'active') return 0xffffff;
            if (status === 'success') return 0x22c55e;
            if (status === 'warning') return 0xf59e0b;
            if (status === 'error') return 0xef4444;
            if (status === 'blocked') return 0x334155;
            
            if (baseRisk >= 8) return 0x7f1d1d;
            if (baseRisk >= 5) return 0x7c2d12;
            return 0x14532d;
        };

        selectedPath.forEach((item, index) => {
            const status = nodeStatuses[item.id] || 'pending';
            const isActive = status === 'active';

            if (item.locations && item.locations[0]) {
                const pos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.3);

                const color = getStatusColor(status, item.risk);
                
                const markerGeo = new THREE.SphereGeometry(isActive ? 0.06 : 0.04, 16, 16);
                const markerMat = new THREE.MeshBasicMaterial({ 
                    color: color,
                    transparent: true,
                    opacity: status === 'blocked' ? 0.3 : 1
                });
                const marker = new THREE.Mesh(markerGeo, markerMat);
                marker.position.copy(pos);
                
                if (isActive) {
                    const glowGeo = new THREE.SphereGeometry(0.08, 16, 16);
                    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
                    const glow = new THREE.Mesh(glowGeo, glowMat);
                    glow.position.copy(pos);
                    markersGroup.add(glow);
                }

                markersGroup.add(marker);

                if (index > 0) {
                    const prevItem = selectedPath[index - 1];
                    const prevPos = latLonToVector3(prevItem.locations[0].lat, prevItem.locations[0].lng, 1.3);
                    
                    let lineColor = 0x334155;
                    let lineOpacity = 0.2;

                    if (status === 'active' || status === 'success' || status === 'warning' || status === 'error') {
                        lineColor = 0x3b82f6;
                        lineOpacity = 1.0;
                    }
                    
                    const arc = createArcLine(prevPos, pos, new THREE.Color(lineColor), 0.3);
                    arc.material.opacity = lineOpacity;
                    arcGroup.add(arc);
                }
            }
        });

    }, [selectedPath, nodeStatuses, currentStepIndex]);


    return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
            <div ref={mountRef} className="absolute inset-0 w-full h-full" />

            {/* --- TOP LEFT --- */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Impact Analysis
                </h1>
                <p className="text-blue-200/60 text-sm font-medium mt-1">
                    Simulating probability-based supply chain disruptions.
                </p>
            </div>

            {/* --- CONTROLS --- */}
            <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-4 pointer-events-auto">
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
                <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-0 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden flex flex-col">
                    <div className="p-3 bg-slate-800 border-b border-slate-700 font-semibold text-gray-300 text-xs uppercase tracking-wide">
                        Live Status
                    </div>
                    <div className="overflow-y-auto p-3 space-y-3 flex-1 min-h-[100px]">
                        {simulationLog.length === 0 ? (
                            <div className="text-gray-500 text-sm italic">No events yet...</div>
                        ) : (
                            simulationLog.map((log) => (
                                <div key={log.id} className={`text-sm p-2 rounded border-l-2 ${
                                    log.type === 'danger' ? 'bg-red-900/20 border-red-500 text-red-200' :
                                    log.type === 'warning' ? 'bg-orange-900/20 border-orange-500 text-orange-200' :
                                    log.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-200' :
                                    'bg-slate-800 border-slate-500 text-gray-300'
                                }`}>
                                    {log.text}
                                </div>
                            ))
                        )}
                        <div ref={(el) => el && el.scrollIntoView({ behavior: 'smooth' })} />
                    </div>
                </div>
            </div>

            {/* --- BREADCRUMBS --- */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-auto max-w-[90%] pointer-events-auto">
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

            {/* --- METRICS --- */}
            {(isSimulating || metricsHistory.length > 0) && (
                <div className="absolute bottom-8 left-6 z-10 pointer-events-auto">
                    <div 
                        className={`bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl shadow-2xl transition-all duration-500 cursor-pointer hover:border-slate-500 ${
                            isMetricsExpanded ? 'p-6 w-[600px]' : 'p-4 w-72'
                        }`}
                        onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                <span>📊</span> Supply Chain Metrics
                            </h3>
                            <button className="text-gray-400 hover:text-white text-xs">
                                {isMetricsExpanded ? '⬇ Collapse' : '⬆ Expand'}
                            </button>
                        </div>

                        {!isMetricsExpanded ? (
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm flex items-center gap-2">
                                        <span>💰</span> Total Cost
                                    </span>
                                    <span className="text-emerald-400 font-bold text-sm">
                                        ${metrics.totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm flex items-center gap-2">
                                        <span>⏱️</span> Total Time
                                    </span>
                                    <span className="text-blue-400 font-bold text-sm">
                                        {metrics.totalTime.toFixed(1)} days
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm flex items-center gap-2">
                                        <span>🌍</span> Distance
                                    </span>
                                    <span className="text-purple-400 font-bold text-sm">
                                        {metrics.totalDistance.toLocaleString('en-US', { maximumFractionDigits: 0 })} km
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm flex items-center gap-2">
                                        <span>🌱</span> Carbon
                                    </span>
                                    <span className="text-orange-400 font-bold text-sm">
                                        {metrics.totalCarbon.toFixed(1)} kg CO₂
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                        <div className="text-gray-400 text-xs mb-1">💰 Cost</div>
                                        <div className="text-emerald-400 font-bold text-lg">
                                            ${(metrics.totalCost / 1000).toFixed(1)}k
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                        <div className="text-gray-400 text-xs mb-1">⏱️ Time</div>
                                        <div className="text-blue-400 font-bold text-lg">
                                            {metrics.totalTime.toFixed(1)}d
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                        <div className="text-gray-400 text-xs mb-1">🌍 Distance</div>
                                        <div className="text-purple-400 font-bold text-lg">
                                            {(metrics.totalDistance / 1000).toFixed(1)}k km
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                        <div className="text-gray-400 text-xs mb-1">🌱 Carbon</div>
                                        <div className="text-orange-400 font-bold text-lg">
                                            {(metrics.totalCarbon / 1000).toFixed(1)}t
                                        </div>
                                    </div>
                                </div>

                                {metricsHistory.length > 0 && (
                                    <>
                                        <div>
                                            <div className="text-gray-300 text-xs font-semibold mb-2 flex items-center gap-2">
                                                <span>💰</span> Cost Progression
                                            </div>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                                <svg width="100%" height="120" viewBox="0 0 520 120">
                                                    {[0, 1, 2, 3, 4].map(i => (
                                                        <line key={i} x1="40" y1={20 + i * 20} x2="500" y2={20 + i * 20} stroke="#334155" strokeWidth="0.5" opacity="0.3" />
                                                    ))}
                                                    {metricsHistory.length > 1 && (
                                                        <polyline
                                                            points={metricsHistory.map((point, i) => {
                                                                const x = 40 + (i / (metricsHistory.length - 1)) * 460;
                                                                const maxCost = Math.max(...metricsHistory.map(p => p.totalCost));
                                                                const y = 100 - (point.totalCost / (maxCost || 1)) * 80;
                                                                return `${x},${y}`;
                                                            }).join(' ')}
                                                            fill="none"
                                                            stroke="#10b981"
                                                            strokeWidth="2"
                                                        />
                                                    )}
                                                    {metricsHistory.map((point, i) => {
                                                        const x = 40 + (i / Math.max(1, metricsHistory.length - 1)) * 460;
                                                        const maxCost = Math.max(...metricsHistory.map(p => p.totalCost));
                                                        const y = 100 - (point.totalCost / (maxCost || 1)) * 80;
                                                        return <circle key={i} cx={x} cy={y} r="4" fill="#10b981" />;
                                                    })}
                                                    {metricsHistory.map((point, i) => {
                                                        const x = 40 + (i / Math.max(1, metricsHistory.length - 1)) * 460;
                                                        return <text key={i} x={x} y="115" fontSize="10" fill="#94a3b8" textAnchor="middle">{point.step}</text>;
                                                    })}
                                                </svg>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-gray-300 text-xs font-semibold mb-2 flex items-center gap-2">
                                                <span>🌍</span> Distance Progression
                                            </div>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                                <svg width="100%" height="120" viewBox="0 0 520 120">
                                                    {[0, 1, 2, 3, 4].map(i => (
                                                        <line key={i} x1="40" y1={20 + i * 20} x2="500" y2={20 + i * 20} stroke="#334155" strokeWidth="0.5" opacity="0.3" />
                                                    ))}
                                                    {metricsHistory.length > 1 && (
                                                        <polyline
                                                            points={metricsHistory.map((point, i) => {
                                                                const x = 40 + (i / (metricsHistory.length - 1)) * 460;
                                                                const maxDist = Math.max(...metricsHistory.map(p => p.totalDistance));
                                                                const y = 100 - (point.totalDistance / (maxDist || 1)) * 80;
                                                                return `${x},${y}`;
                                                            }).join(' ')}
                                                            fill="none"
                                                            stroke="#a855f7"
                                                            strokeWidth="2"
                                                        />
                                                    )}
                                                    {metricsHistory.map((point, i) => {
                                                        const x = 40 + (i / Math.max(1, metricsHistory.length - 1)) * 460;
                                                        const maxDist = Math.max(...metricsHistory.map(p => p.totalDistance));
                                                        const y = 100 - (point.totalDistance / (maxDist || 1)) * 80;
                                                        return <circle key={i} cx={x} cy={y} r="4" fill="#a855f7" />;
                                                    })}
                                                    {metricsHistory.map((point, i) => {
                                                        const x = 40 + (i / Math.max(1, metricsHistory.length - 1)) * 460;
                                                        return <text key={i} x={x} y="115" fontSize="10" fill="#94a3b8" textAnchor="middle">{point.step}</text>;
                                                    })}
                                                </svg>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-gray-300 text-xs font-semibold mb-2 flex items-center gap-2">
                                                <span>🌱</span> Carbon Emissions Progression
                                            </div>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                                <svg width="100%" height="120" viewBox="0 0 520 120">
                                                    {[0, 1, 2, 3, 4].map(i => (
                                                        <line key={i} x1="40" y1={20 + i * 20} x2="500" y2={20 + i * 20} stroke="#334155" strokeWidth="0.5" opacity="0.3" />
                                                    ))}
                                                    {metricsHistory.length > 1 && (
                                                        <polyline
                                                            points={metricsHistory.map((point, i) => {
                                                                const x = 40 + (i / (metricsHistory.length - 1)) * 460;
                                                                const maxCarbon = Math.max(...metricsHistory.map(p => p.totalCarbon));
                                                                const y = 100 - (point.totalCarbon / (maxCarbon || 1)) * 80;
                                                                return `${x},${y}`;
                                                            }).join(' ')}
                                                            fill="none"
                                                            stroke="#fb923c"
                                                            strokeWidth="2"
                                                        />
                                                    )}
                                                    {metricsHistory.map((point, i) => {
                                                        const x = 40 + (i / Math.max(1, metricsHistory.length - 1)) * 460;
                                                        const maxCarbon = Math.max(...metricsHistory.map(p => p.totalCarbon));
                                                        const y = 100 - (point.totalCarbon / (maxCarbon || 1)) * 80;
                                                        return <circle key={i} cx={x} cy={y} r="4" fill="#fb923c" />;
                                                    })}
                                                    {metricsHistory.map((point, i) => {
                                                        const x = 40 + (i / Math.max(1, metricsHistory.length - 1)) * 460;
                                                        return <text key={i} x={x} y="115" fontSize="10" fill="#94a3b8" textAnchor="middle">{point.step}</text>;
                                                    })}
                                                </svg>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulationPage;