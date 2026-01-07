'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// --- CONSTANTS & DATA ---
const CRITICAL_REASONS = [
    "Factory Fire Detected",
    "Severe Geopolitical Sanctions",
    "Massive Cyber Attack",
    "7.0 Magnitude Earthquake",
    "Indefinite Labor Strike",
    "Raw Material Exhaustion",
    "Compliance Violation Seizure"
];

// --- UTILITY: Geolocation Math ---
const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
};

// --- UTILITY: Animated Arc Generator ---
const createArcLine = (startVector, endVector, color, opacity = 0.8, isAnimated = false) => {
    const distance = startVector.distanceTo(endVector);
    
    // 1. Calculate Apex
    let midVector = startVector.clone().add(endVector);
    // Handle antipodal points (opposite sides of globe)
    if (midVector.lengthSq() < 0.01) {
        const axis = new THREE.Vector3(0, 1, 0); 
        if (Math.abs(startVector.clone().normalize().dot(axis)) > 0.99) {
            axis.set(0, 0, 1);
        }
        midVector.crossVectors(startVector, axis);
    }
    
    const arcHeight = 1.3 + (distance * 0.5); 
    const midPoint = midVector.normalize().multiplyScalar(arcHeight);

    // 2. Create the Curve
    const curve = new THREE.QuadraticBezierCurve3(
        startVector,
        midPoint,
        endVector
    );

    // 3. TubeGeometry 
    const tubularSegments = 128; 
    const radialSegments = 8;
    const geometry = new THREE.TubeGeometry(curve, tubularSegments, 0.015, radialSegments, false);
    
    // 4. Animation Setup
    const totalIndices = tubularSegments * radialSegments * 6;

    if (isAnimated) {
        geometry.setDrawRange(0, 0); 
    } else {
        geometry.setDrawRange(0, totalIndices);
    }

    const material = new THREE.MeshBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: opacity 
    });

    const mesh = new THREE.Mesh(geometry, material);
    
    mesh.userData = { 
        totalIndices: totalIndices,
        currentCount: 0 
    }; 
    
    return mesh;
};

// --- HELPERS (Cost/Time Parsing) ---
const parseCost = (costStr) => {
  if (!costStr || costStr === 'Internal Transfer') return 0;
  return Number(costStr.replace(/[^0-9.]/g, '')) || 0;
};

const parseTimeDays = (timeStr) => {
  if (!timeStr || timeStr.includes('Instant') || timeStr.includes('N/A')) return 0;
  const range = timeStr.match(/(\d+)\s*-\s*(\d+)/);
  if (range) return (Number(range[1]) + Number(range[2])) / 2;
  const single = timeStr.match(/(\d+)/);
  return single ? Number(single[1]) : 0;
};

const formatYAxis = (value, type) => {
    if (value === 0) return '0';
    if (type === 'cost') return `$${(value / 1000).toFixed(1)}k`;
    if (type === 'time') return `${value.toFixed(0)}d`;
    if (type === 'distance') return `${(value / 1000).toFixed(0)}k`;
    if (type === 'carbon') return `${(value / 1000).toFixed(1)}t`;
    return value;
};

const METHOD_CARBON_FACTOR = {
  'Secure Air Freight': 0.6, 'Priority Secure Air': 0.7, 'Standard Air Freight': 0.55,
  'International Air': 0.75, 'Consolidated Air': 0.45, 'Ocean Freight': 0.2,
  'Sea/Air Hybrid': 0.35, 'Secure Trucking': 0.15, 'Rail/Truck Freight': 0.12,
  'Direct to Data Center': 0.1, 'Digital Transfer': 0.0
};

// --- MOCK DATA ---
const MOCK_PATH = [
    { id: 'root', name: 'Nvidia HQ', emoji: '🏭', locations: [{ lat: 37.3688, lng: -122.0363, name: 'Santa Clara, USA' }], risk: 2 },
    { id: 'fab', name: 'TSMC Foundry', emoji: '💾', locations: [{ lat: 24.8138, lng: 120.9675, name: 'Hsinchu, Taiwan' }], risk: 7.5, shipping: { cost: '$5000', time: '2-3 days', method: 'Secure Air Freight' } },
    { id: 'assembly', name: 'Foxconn Assembly', emoji: '🔧', locations: [{ lat: 22.5431, lng: 114.0579, name: 'Shenzhen, China' }], risk: 4, shipping: { cost: '$1200', time: '1 day', method: 'Secure Trucking' } },
    { id: 'dist', name: 'Global Distribution', emoji: '🚢', locations: [{ lat: 51.9225, lng: 4.47917, name: 'Rotterdam, Netherlands' }], risk: 3, shipping: { cost: '$8500', time: '15-20 days', method: 'Ocean Freight' } }
];

const SimulationPage = ({ selectedPath = MOCK_PATH }) => {
    const mountRef = useRef(null);
    const [sceneReady, setSceneReady] = useState(false);
    
    // --- STATE ---
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [simulationStatus, setSimulationStatus] = useState('idle');
    const [simulationLog, setSimulationLog] = useState([]); 
    const [nodeStatuses, setNodeStatuses] = useState({});
    
    // ** NEW STATE: GPU Count **
    const [gpuCount, setGpuCount] = useState(1000); 

    const metricsRef = useRef({ totalCost: 0, totalTime: 0, totalDistance: 0, totalCarbon: 0 });
    const [metrics, setMetrics] = useState(metricsRef.current);
    const [metricsHistory, setMetricsHistory] = useState([]);
    const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);

    // --- REFS ---
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const globeRef = useRef(null);
    const markersGroupRef = useRef(null);
    const arcGroupRef = useRef(null);
    
    const drawnLinesRef = useRef(new Set()); 
    const drawnMarkersRef = useRef(new Set());
    const animatingObjectsRef = useRef([]); 
    
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

        let distance = 0;
        let legCost = 0;
        let legTime = 0;
        let legCarbon = 0;
        let disruptionType = null;
        let penaltyCost = 0;
        let penaltyTime = 0;

        // ** LOGIC: Volume Scaling **
        const volumeScalingFactor = Math.max(1, gpuCount / 1000);

        if (index > 0) {
            const prevItem = selectedPath[index - 1];
            const prevPos = latLonToVector3(prevItem.locations[0].lat, prevItem.locations[0].lng, 1.3);
            const currPos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.3);
            
            distance = prevPos.distanceTo(currPos) * 5000;
            const shipping = item.shipping || {};
            
            // Cost & Carbon scale with volume
            legCost = parseCost(shipping.cost) * volumeScalingFactor;
            legTime = parseTimeDays(shipping.time);
            const methodFactor = METHOD_CARBON_FACTOR[shipping.method] ?? 0.4;
            legCarbon = (distance * methodFactor) * volumeScalingFactor;

            // ** LOGIC: Risk Probability Scaling **
            // For every 5000 units above 1000, add 0.5 to risk score
            const volumeRiskPenalty = Math.max(0, (gpuCount - 1000) / 5000) * 0.5;
            
            // Cap risk to prevent immediate 100% failure (max risk 18 ~ 90% chance)
            const effectiveRisk = Math.min(18, item.risk + volumeRiskPenalty);
            const failureChance = effectiveRisk * 0.05; 
            
            const roll = Math.random();

            if (roll < failureChance) {
                const severity = Math.random();
                // Higher volume = higher chance of CRITICAL failure (harder to manage)
                const criticalThreshold = 0.85 - (volumeRiskPenalty * 0.02); 

                if (severity > criticalThreshold) {
                    disruptionType = 'CRITICAL';
                } else if (severity > 0.5) {
                    disruptionType = 'LOSS';
                    penaltyCost = legCost * 0.6;
                    penaltyTime = 2 + (volumeRiskPenalty * 0.2); // Delays take longer to resolve with high volume
                } else {
                    disruptionType = 'DELAY';
                    penaltyTime = Math.ceil(Math.random() * 4) + 1 + Math.floor(volumeRiskPenalty * 0.5);
                }
            }
        }

        const prev = metricsRef.current;
        const appliedCost = disruptionType !== 'CRITICAL' ? (legCost + penaltyCost) : legCost;
        const appliedTime = disruptionType !== 'CRITICAL' ? (legTime + penaltyTime) : legTime;

        const newMetrics = {
            totalCost: prev.totalCost + appliedCost,
            totalTime: prev.totalTime + appliedTime,
            totalDistance: prev.totalDistance + distance,
            totalCarbon: prev.totalCarbon + legCarbon
        };

        metricsRef.current = newMetrics;
        setMetrics(newMetrics);

        setMetricsHistory(history => {
            if (history.length > 0 && history[history.length - 1].step === index) {
                return history;
            }
            const newEntry = {
                step: index,
                name: item.name,
                totalCost: newMetrics.totalCost,
                totalTime: newMetrics.totalTime,
                totalDistance: newMetrics.totalDistance,
                totalCarbon: newMetrics.totalCarbon
            };
            return index === 0 ? [newEntry] : [...history, newEntry];
        });

        setTimeout(() => {
            if (disruptionType === 'CRITICAL') {
                setNodeStatuses(prev => {
                    const newStatuses = { ...prev, [item.id]: 'error' };
                    for (let i = index + 1; i < selectedPath.length; i++) {
                        newStatuses[selectedPath[i].id] = 'blocked';
                    }
                    return newStatuses;
                });
                
                const reason = CRITICAL_REASONS[Math.floor(Math.random() * CRITICAL_REASONS.length)];
                
                setSimulationLog(prev => [...prev, { 
                    step: index, 
                    text: `⛔ CRITICAL STOPPAGE at ${item.name}: ${reason}`, 
                    type: "danger", 
                    id: Date.now() 
                }]);
                setIsSimulating(false);
                setSimulationStatus('failed');
            } else if (disruptionType === 'LOSS') {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'warning' }));
                setSimulationLog(prev => [...prev, { 
                    step: index, 
                    text: `⚠️ Shipment damage at ${item.name}. Replacement ordered (+${penaltyCost.toLocaleString('en-US', {style:'currency', currency:'USD', maximumFractionDigits:0})})`, 
                    type: "warning", 
                    id: Date.now() 
                }]);
                setTimeout(() => runSimulationStep(index + 1), 2500);
            } else if (disruptionType === 'DELAY') {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'warning' }));
                setSimulationLog(prev => [...prev, { 
                    step: index, 
                    text: `⏱️ Capacity Delay at ${item.name} (+${penaltyTime.toFixed(1)}d).`, 
                    type: "warning", 
                    id: Date.now() 
                }]);
                setTimeout(() => runSimulationStep(index + 1), 2000);
            } else {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'success' }));
                setSimulationLog(prev => [...prev, { 
                    step: index, 
                    text: `✅ ${item.name}: Operations stable.`, 
                    type: "success", 
                    id: Date.now() 
                }]);
                setTimeout(() => runSimulationStep(index + 1), 1500);
            }
        }, 1000);

    }, [selectedPath, gpuCount]);

    const startSimulation = useCallback(() => {
        if (isSimulating && simulationStatus === 'running') return;
        setIsSimulating(true);
        setSimulationStatus('running');
        setSimulationLog([{ text: `🚀 Initiating Supply Chain Simulation for ${gpuCount.toLocaleString()} units...`, type: "neutral", id: Date.now() }]);
        setNodeStatuses({});
        setCurrentStepIndex(-1);
        metricsRef.current = { totalCost: 0, totalTime: 0, totalDistance: 0, totalCarbon: 0 };
        setMetrics(metricsRef.current);
        setMetricsHistory([]);
        
        drawnLinesRef.current.clear();
        drawnMarkersRef.current.clear();
        animatingObjectsRef.current = [];
        
        setIsMetricsExpanded(false);
        setTimeout(() => { runSimulationStep(0); }, 1000);
    }, [isSimulating, simulationStatus, runSimulationStep, gpuCount]);

    // --- THREE.JS SETUP ---
    useEffect(() => {
        if (!mountRef.current) return;
        while (mountRef.current.firstChild) mountRef.current.removeChild(mountRef.current.firstChild);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a1a);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
        camera.position.z = 5.5;
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const pointLight = new THREE.PointLight(0xffffff, 0.8);
        pointLight.position.set(5, 3, 5);
        scene.add(pointLight);

        const globeGeometry = new THREE.SphereGeometry(1.3, 64, 64);
        const globeMaterial = new THREE.MeshPhongMaterial({ color: 0x2563eb, shininess: 20 });
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        scene.add(globe);
        globeRef.current = globe;

        const markersGroup = new THREE.Group();
        globe.add(markersGroup);
        markersGroupRef.current = markersGroup;

        const arcGroup = new THREE.Group();
        globe.add(arcGroup);
        arcGroupRef.current = arcGroup;

        const starGeometry = new THREE.BufferGeometry();
        const starVertices = [];
        for (let i = 0; i < 2000; i++) starVertices.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, opacity: 0.5, transparent: true }));
        scene.add(stars);

        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = 'anonymous'; 
        const textureSources = ['https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'];
        let currentSource = 0;
        const tryLoadTexture = () => {
            if (currentSource >= textureSources.length) return;
            textureLoader.load(textureSources[currentSource], (texture) => {
                if (!isMountedRef.current) return;
                if (globeRef.current && globeRef.current.material) {
                    textureRef.current = texture;
                    globeRef.current.material.color.setHex(0xffffff);
                    globeRef.current.material.map = texture;
                    globeRef.current.material.needsUpdate = true;
                    if(rendererRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current);
                } 
            }, undefined, () => { currentSource++; tryLoadTexture(); });
        };
        tryLoadTexture();

        const handleMouseDown = (e) => { isDraggingRef.current = true; previousMouseRef.current = { x: e.clientX, y: e.clientY }; };
        const handleMouseMove = (e) => {
            if (!isDraggingRef.current || !globeRef.current) return;
            const deltaX = e.clientX - previousMouseRef.current.x;
            const deltaY = e.clientY - previousMouseRef.current.y;
            globeRef.current.rotation.x += deltaY * 0.005;
            globeRef.current.rotation.y += deltaX * 0.005;
            previousMouseRef.current = { x: e.clientX, y: e.clientY };
        };
        const handleMouseUp = () => { isDraggingRef.current = false; };

        const canvas = renderer.domElement;
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp); 

        // --- ANIMATION LOOP ---
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            if (globeRef.current && !isDraggingRef.current) globeRef.current.rotation.y += 0.001;
            if (stars) stars.rotation.y += 0.0002;
            
            if (animatingObjectsRef.current.length > 0) {
                for (let i = animatingObjectsRef.current.length - 1; i >= 0; i--) {
                    const mesh = animatingObjectsRef.current[i];
                    if (mesh && mesh.geometry) {
                        const totalIndices = mesh.userData.totalIndices;
                        const speed = 150; 
                        mesh.userData.currentCount += speed;
                        if (mesh.userData.currentCount < totalIndices) {
                            mesh.geometry.setDrawRange(0, mesh.userData.currentCount);
                        } else {
                            mesh.geometry.setDrawRange(0, totalIndices);
                            animatingObjectsRef.current.splice(i, 1); 
                        }
                    }
                }
            }
            if (rendererRef.current && sceneRef.current && cameraRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;
            cameraRef.current.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
        };
        window.addEventListener('resize', handleResize);

        setSceneReady(true);

        return () => {
            if (rendererRef.current?.domElement && mountRef.current?.contains(rendererRef.current.domElement)) {
                mountRef.current.removeChild(rendererRef.current.domElement);
            }
            if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
        };
    }, []);

    // --- VISUALS UPDATER ---
    useEffect(() => {
        if (!sceneReady || !globeRef.current || !markersGroupRef.current || !arcGroupRef.current) return;

        const markersGroup = markersGroupRef.current;
        const arcGroup = arcGroupRef.current;
        
        if (currentStepIndex === -1) {
            while (markersGroup.children.length > 0) markersGroup.remove(markersGroup.children[0]);
            while (arcGroup.children.length > 0) arcGroup.remove(arcGroup.children[0]);
            drawnLinesRef.current.clear();
            drawnMarkersRef.current.clear();
            animatingObjectsRef.current = [];
        }

        const getStatusColor = (status, baseRisk) => {
            if (status === 'active') return 0xffffff;
            if (status === 'success') return 0x22c55e;
            if (status === 'warning') return 0xf59e0b;
            if (status === 'error') return 0xef4444;
            if (status === 'blocked') return 0x334155;
            return 0x334155; 
        };

        selectedPath.forEach((item, index) => {
            const isVisible = index <= currentStepIndex + 1 || currentStepIndex === -1; 
            if (!isVisible) return; 

            // --- MARKERS ---
            const markerId = `marker-${index}`;
            const status = nodeStatuses[item.id] || 'pending';
            
            if (!drawnMarkersRef.current.has(markerId) && item.locations && item.locations[0]) {
                const pos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.32);
                const isActive = status === 'active';
                const color = getStatusColor(status, item.risk);
                
                const markerGeo = new THREE.SphereGeometry(0.06, 16, 16);
                const markerMat = new THREE.MeshBasicMaterial({ color: color, transparent: true });
                const marker = new THREE.Mesh(markerGeo, markerMat);
                marker.position.copy(pos);
                marker.userData = { id: markerId };
                
                markersGroup.add(marker);
                
                if (isActive) {
                    const glowGeo = new THREE.SphereGeometry(0.08, 16, 16);
                    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
                    const glow = new THREE.Mesh(glowGeo, glowMat);
                    glow.position.copy(pos);
                    glow.userData = { id: `${markerId}-glow` };
                    markersGroup.add(glow);
                }
                drawnMarkersRef.current.add(markerId);
            } else {
                const existingMarker = markersGroup.children.find(child => child.userData.id === markerId);
                if (existingMarker) {
                    existingMarker.material.color.setHex(getStatusColor(status, item.risk));
                }
            }

            // --- LINES (ARCS) ---
            if (index > 0 && index <= currentStepIndex + 1) {
                const legId = `line-${index}`;
                
                if (!drawnLinesRef.current.has(legId)) {
                    const prevItem = selectedPath[index - 1];
                    const prevPos = latLonToVector3(prevItem.locations[0].lat, prevItem.locations[0].lng, 1.32);
                    const currPos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.32);
                    
                    let lineColor = 0x334155; 
                    let lineOpacity = 0.2;
                    let animateThisLine = false;

                    if (index === currentStepIndex + 1) {
                        lineColor = 0x64748b; 
                        lineOpacity = 0.5;
                    } else if (index === currentStepIndex) {
                        lineColor = 0x3b82f6; 
                        lineOpacity = 1.0;
                        animateThisLine = true; 
                    } else {
                        lineColor = 0x22c55e; 
                        lineOpacity = 0.6;
                    }

                    const arc = createArcLine(prevPos, currPos, new THREE.Color(lineColor), lineOpacity, animateThisLine);
                    arc.userData = { ...arc.userData, id: legId };
                    
                    arcGroup.add(arc);
                    drawnLinesRef.current.add(legId);
                    
                    if (animateThisLine) {
                        animatingObjectsRef.current.push(arc);
                    }
                } else {
                    const existingArc = arcGroup.children.find(child => child.userData.id === legId);
                    if (existingArc) {
                        let targetColor = 0x334155;
                        if (index < currentStepIndex) targetColor = 0x22c55e; 
                        else if (index === currentStepIndex) targetColor = 0x3b82f6; 
                        
                        existingArc.material.color.setHex(targetColor);
                        existingArc.material.opacity = (index === currentStepIndex) ? 1.0 : 0.6;
                    }
                }
            }
        });

    }, [selectedPath, nodeStatuses, currentStepIndex, sceneReady]);

    // -- UI HELPERS --
    const currentRiskLevel = gpuCount < 10000 ? "Low" : gpuCount < 50000 ? "Medium" : "High";
    const riskColor = currentRiskLevel === "Low" ? "text-emerald-400 border-emerald-500/50 bg-emerald-500/10" : currentRiskLevel === "Medium" ? "text-yellow-400 border-yellow-500/50 bg-yellow-500/10" : "text-red-400 border-red-500/50 bg-red-500/10";

    return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
            <div ref={mountRef} className="absolute inset-0 w-full h-full" />

            {/* UI - Header */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Impact Analysis</h1>
                <p className="text-blue-200/60 text-sm font-medium mt-1">Simulating probability-based supply chain disruptions.</p>
            </div>

            {/* UI - Right Controls */}
            <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-4 pointer-events-auto">
                <div className="bg-slate-800/90 backdrop-blur border border-slate-600 p-4 rounded-xl shadow-2xl w-80">
                    <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><span>⚡</span> Supply Chain Simulation</h2>
                    
                    {/* GPU Volume Slider */}
                    <div className="mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-gray-400 text-xs uppercase font-bold">
                                Order Volume
                            </label>
                            <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${riskColor}`}>
                                {currentRiskLevel} Risk
                            </span>
                        </div>
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-blue-400 font-mono text-xl font-bold">{gpuCount.toLocaleString()}</span>
                             <span className="text-gray-500 text-xs mb-1">units</span>
                        </div>
                        <input
                            type="range"
                            min="1000"
                            max="100000"
                            step="1000"
                            value={gpuCount}
                            disabled={isSimulating}
                            onChange={(e) => setGpuCount(Number(e.target.value))}
                            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isSimulating ? 'bg-slate-700' : 'bg-slate-600 accent-blue-500 hover:accent-blue-400'}`}
                        />
                         <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
                            <span>1k</span>
                            <span>100k</span>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">Simulating probability of failure at each node based on volume risk thresholds.</p>
                    <button onClick={startSimulation} disabled={isSimulating && simulationStatus === 'running'} className={`w-full py-3 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${isSimulating && simulationStatus === 'running' ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600' : simulationStatus === 'failed' ? 'bg-red-600 hover:bg-red-500 text-white border border-red-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 hover:scale-[1.02]'}`}>
                        {simulationStatus === 'running' ? <><span className="animate-spin">⚙️</span> Running...</> : simulationStatus === 'failed' ? <>↻ Retry Simulation</> : <>▶️ Run Simulation</>}
                    </button>
                </div>
                <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-0 rounded-xl shadow-2xl w-80 max-h-96 overflow-hidden flex flex-col">
                    <div className="p-3 bg-slate-800 border-b border-slate-700 font-semibold text-gray-300 text-xs uppercase tracking-wide">Live Status</div>
                    <div className="overflow-y-auto p-3 space-y-3 flex-1 min-h-[100px]">
                        {simulationLog.length === 0 ? <div className="text-gray-500 text-sm italic">No events yet...</div> : simulationLog.map((log) => (
                            <div key={log.id} className={`text-sm p-2 rounded border-l-2 ${log.type === 'danger' ? 'bg-red-900/20 border-red-500 text-red-200' : log.type === 'warning' ? 'bg-orange-900/20 border-orange-500 text-orange-200' : log.type === 'success' ? 'bg-green-900/20 border-green-500 text-green-200' : 'bg-slate-800 border-slate-500 text-gray-300'}`}>
                                {log.step !== undefined && <span className="font-mono font-bold text-xs opacity-50 mr-2 text-white bg-slate-700 px-1.5 py-0.5 rounded">Step {log.step}</span>}
                                {log.text}
                            </div>
                        ))}
                        <div ref={(el) => el && el.scrollIntoView({ behavior: 'smooth' })} />
                    </div>
                </div>
            </div>

            {/* UI - Bottom Path Steps */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-auto max-w-[90%] pointer-events-auto">
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600 p-4 rounded-xl shadow-2xl flex items-center space-x-1 overflow-x-auto">
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
                                {index > 0 && <div className={`h-0.5 w-3 transition-colors duration-500 ${status === 'pending' || status === 'blocked' ? 'bg-slate-700' : 'bg-blue-500'}`} />}
                                <div className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl border-2 transition-all duration-300 ${borderClass} ${status === 'active' ? 'bg-slate-700 scale-110 shadow-lg' : 'bg-slate-800'}`}>
                                    <span className="text-m">{status === 'blocked' ? '🔒' : item.emoji}</span>
                                    {status === 'error' && <div className="absolute -top-1.5 -right-1.5 bg-red-600 rounded-full p-0.5 border border-slate-900"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div>}
                                    {status === 'success' && <div className="absolute -top-1.5 -right-1.5 bg-green-600 rounded-full p-0.5 border border-slate-900"><svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div>}
                                </div>
                            </React.Fragment>
                         );
                    })}
                </div>
            </div>

            {/* UI - Metrics Dashboard */}
            {(isSimulating || metricsHistory.length > 0) && (
                <div className="absolute bottom-8 left-6 z-10 pointer-events-auto">
                    <div className={`bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl shadow-2xl transition-all duration-500 cursor-pointer hover:border-slate-500 ${isMetricsExpanded ? 'p-6 w-[600px]' : 'p-4 w-72'}`} onClick={() => setIsMetricsExpanded(!isMetricsExpanded)}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-bold text-sm flex items-center gap-2"><span>📊</span> Supply Chain Metrics</h3>
                            <button className="text-gray-400 hover:text-white text-xs">{isMetricsExpanded ? '⬇ Collapse' : '⬆ Expand'}</button>
                        </div>

                        {!isMetricsExpanded ? (
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm flex items-center gap-2"><span>💰</span> Total Cost</span><span className="text-emerald-400 font-bold text-sm">${metrics.totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm flex items-center gap-2"><span>⏱️</span> Total Time</span><span className="text-blue-400 font-bold text-sm">{metrics.totalTime.toFixed(1)} days</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm flex items-center gap-2"><span>🌍</span> Distance</span><span className="text-purple-400 font-bold text-sm">{metrics.totalDistance.toLocaleString('en-US', { maximumFractionDigits: 0 })} km</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-400 text-sm flex items-center gap-2"><span>🌱</span> Carbon</span><span className="text-orange-400 font-bold text-sm">{metrics.totalCarbon.toLocaleString('en-US', { maximumFractionDigits: 1 })} kg CO₂</span></div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700"><div className="text-gray-400 text-xs mb-1">💰 Cost</div><div className="text-emerald-400 font-bold text-lg">${(metrics.totalCost / 1000).toFixed(1)}k</div></div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700"><div className="text-gray-400 text-xs mb-1">⏱️ Time</div><div className="text-blue-400 font-bold text-lg">{metrics.totalTime.toFixed(1)}d</div></div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700"><div className="text-gray-400 text-xs mb-1">🌍 Distance</div><div className="text-purple-400 font-bold text-lg">{(metrics.totalDistance / 1000).toFixed(1)}k km</div></div>
                                    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700"><div className="text-gray-400 text-xs mb-1">🌱 Carbon</div><div className="text-orange-400 font-bold text-lg">{(metrics.totalCarbon / 1000).toFixed(1)}t</div></div>
                                </div>

                                {metricsHistory.length > 0 && ['cost', 'distance', 'carbon'].map((type, idx) => {
                                    const dataKey = type === 'cost' ? 'totalCost' : type === 'distance' ? 'totalDistance' : 'totalCarbon';
                                    const color = type === 'cost' ? '#10b981' : type === 'distance' ? '#a855f7' : '#fb923c';
                                    const icon = type === 'cost' ? '💰' : type === 'distance' ? '🌍' : '🌱';
                                    const title = type === 'cost' ? 'Cost' : type === 'distance' ? 'Distance' : 'Carbon';
                                    const maxVal = Math.max(...metricsHistory.map(p => p[dataKey]));
                                    
                                    return (
                                        <div key={type}>
                                            <div className="text-gray-300 text-xs font-semibold mb-2 flex items-center gap-2"><span>{icon}</span> {title} Progression</div>
                                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 relative">
                                                <svg width="100%" height="120" viewBox="0 0 520 120" className="overflow-visible">
                                                    {[0, 1, 2, 3, 4].map(i => <line key={i} x1="60" y1={20 + i * 20} x2="500" y2={20 + i * 20} stroke="#334155" strokeWidth="0.5" opacity="0.3" />)}
                                                    
                                                    <line x1="60" y1="20" x2="60" y2="100" stroke="#475569" strokeWidth="1" />
                                                    <text x="55" y="25" fontSize="9" fill="#64748b" textAnchor="end">{formatYAxis(maxVal, type)}</text>
                                                    <text x="55" y="60" fontSize="9" fill="#64748b" textAnchor="end">{formatYAxis(maxVal / 2, type)}</text>
                                                    <text x="55" y="100" fontSize="9" fill="#64748b" textAnchor="end">0</text>

                                                    {metricsHistory.length > 1 && (
                                                        <polyline
                                                            points={metricsHistory.map((point, i) => {
                                                                const x = 60 + (i / (metricsHistory.length - 1)) * 440;
                                                                const y = 100 - (point[dataKey] / (maxVal || 1)) * 80;
                                                                return `${x},${y}`;
                                                            }).join(' ')}
                                                            fill="none" stroke={color} strokeWidth="2"
                                                        />
                                                    )}
                                                    {metricsHistory.map((point, i) => {
                                                        const x = 60 + (i / Math.max(1, metricsHistory.length - 1)) * 440;
                                                        const y = 100 - (point[dataKey] / (maxVal || 1)) * 80;
                                                        return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
                                                    })}
                                                    {metricsHistory.map((point, i) => {
                                                        const x = 60 + (i / Math.max(1, metricsHistory.length - 1)) * 440;
                                                        return <text key={i} x={x} y="115" fontSize="10" fill="#94a3b8" textAnchor="middle">{point.step}</text>;
                                                    })}
                                                </svg>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulationPage;