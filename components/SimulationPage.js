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

// --- NEW COMPONENT: Mini Supply Chain Diagram ---
// This matches the structure and visual style you requested
const MiniSupplyChainDiagram = ({ activePath, currentStepIndex, nodeStatuses }) => {
    // 1. Define the tree structure (Hardcoded IDs to match your supply chain logic)
    const tree = {
        name: "final assembly and testing",
        id: "final_assembly",
        children: [
            {
                name: "2.5D advanced packaging merge",
                id: "packaging_merge",
                children: [
                    {
                        name: "hbm3e (memory)",
                        id: "hbm3e",
                        children: [
                            {
                                name: "dram cells",
                                id: "dram_cells",
                                children: [
                                    {
                                        name: "silicon wafers",
                                        id: "silicon_wafers_memory",
                                        children: [
                                            { name: "high purity quartz", id: "quartz_memory" }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        name: "the substrate (abf)",
                        id: "substrate_abf",
                        children: [
                            {
                                name: "abf film",
                                id: "abf_film",
                                children: [
                                    { name: "base polymers/solvents", id: "polymers_abf" }
                                ]
                            },
                            {
                                name: "copper clad laminates",
                                id: "copper_clad_laminates",
                                children: [
                                    { name: "copper and resin", id: "copper_resin" }
                                ]
                            }
                        ]
                    },
                    {
                        name: "gpu die",
                        id: "gpu_die",
                        children: [
                            {
                                name: "photoresist",
                                id: "photoresist",
                                children: [
                                    { name: "base polymers/solvents", id: "polymers_photoresist" }
                                ]
                            },
                            {
                                name: "silicon wafers",
                                id: "silicon_wafers_gpu",
                                children: [
                                    { name: "high purity quartz", id: "quartz_gpu" }
                                ]
                            }
                        ]
                    }
                ]
            },
            { name: "pcb/motherboard", id: "pcb_motherboard" },
            {
                name: "coolers/heat sinks",
                id: "coolers_heat_sinks",
                children: [
                    { name: "aluminium/copper", id: "aluminium_copper" }
                ]
            }
        ]
    };

    // Helper: Find if a node ID is currently active in the simulation
    const getCurrentStepId = () => {
        if (!activePath || currentStepIndex < 0 || currentStepIndex >= activePath.length) return null;
        return activePath[currentStepIndex].id;
    };

    const currentId = getCurrentStepId();

    // Recursive component to render nodes
    const TreeNode = ({ node, level = 0 }) => {
        const hasChildren = node.children && node.children.length > 0;
        
        // Check Status
        const status = nodeStatuses[node.id] || 'pending';
        const isCurrent = node.id === currentId;
        const isCompleted = status === 'success';
        const isError = status === 'error' || status === 'blocked';
        const isWarning = status === 'warning';

        // Determine styling
        let nodeClass = "bg-gradient-to-br from-slate-700 to-slate-800 border border-blue-500/30 text-blue-200/50";
        let textClass = "text-blue-200/50";
        let borderClass = "border-blue-500/30";

        if (isCurrent) {
            // Active Step: Pulse Blue
            nodeClass = "bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-400 text-white animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 z-10";
            textClass = "text-white font-bold";
        } else if (isError) {
            // Error: Red
            nodeClass = "bg-gradient-to-br from-red-900 to-red-800 border border-red-500 text-red-100";
            textClass = "text-red-100";
            borderClass = "border-red-500";
        } else if (isWarning) {
            // Warning: Orange
            nodeClass = "bg-gradient-to-br from-amber-900 to-amber-800 border border-amber-500 text-amber-100";
        } else if (isCompleted) {
            // Completed: Green/Blue mix
            nodeClass = "bg-gradient-to-br from-emerald-900 to-slate-800 border border-emerald-500/50 text-emerald-100";
            textClass = "text-emerald-100";
            borderClass = "border-emerald-500/50";
        }

        return (
            <div className="flex flex-col items-center">
                {/* Node box */}
                <div className={`${nodeClass} px-2 py-1 rounded text-[7px] text-center mb-1 whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis shadow-lg transition-all duration-300 relative`}>
                    <span className={textClass}>{node.name}</span>
                    {isCompleted && !isCurrent && <span className="ml-1 text-emerald-400">✓</span>}
                    {isCurrent && <span className="ml-1 text-white">●</span>}
                    {isError && <span className="ml-1 text-red-400">✕</span>}
                </div>

                {/* Children container */}
                {hasChildren && (
                    <>
                        {/* Vertical line down */}
                        <div className={`w-px h-2 ${isCurrent || isCompleted ? 'bg-blue-400/70' : 'bg-blue-400/20'}`}></div>

                        {/* Horizontal container for children */}
                        <div className="flex items-start gap-1 relative">
                            {/* Horizontal line across children */}
                            {node.children.length > 1 && (
                                <div className={`absolute top-0 left-0 right-0 h-px ${isCurrent || isCompleted ? 'bg-blue-400/50' : 'bg-blue-400/20'}`} style={{
                                    width: 'calc(100% - 2px)',
                                    left: '50%',
                                    transform: 'translateX(-50%)'
                                }}></div>
                            )}

                            {node.children.map((child, idx) => (
                                <div key={idx} className="flex flex-col items-center">
                                    {/* Vertical line to child */}
                                    <div className={`w-px h-2 ${isCurrent || isCompleted ? 'bg-blue-400/70' : 'bg-blue-400/20'}`}></div>
                                    <TreeNode node={child} level={level + 1} />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="fixed bottom-4 right-4 bg-slate-900/95 backdrop-blur-md border-2 border-blue-500/30 p-4 rounded-xl shadow-2xl overflow-y-auto max-h-[400px] w-auto max-w-[600px] z-[1500] pointer-events-auto transition-all duration-500">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <span>🕸️</span> Supply Chain Map
                </div>
                {currentId && <div className="text-[9px] text-blue-300">Active: {currentId}</div>}
            </div>
            <div className="w-full flex justify-center transform scale-90 origin-top">
                <TreeNode node={tree} />
            </div>
        </div>
    );
};

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
    let midVector = startVector.clone().add(endVector);
    if (midVector.lengthSq() < 0.01) {
        const axis = new THREE.Vector3(0, 1, 0); 
        if (Math.abs(startVector.clone().normalize().dot(axis)) > 0.99) {
            axis.set(0, 0, 1);
        }
        midVector.crossVectors(startVector, axis);
    }
    const arcHeight = 1.3 + (distance * 0.5); 
    const midPoint = midVector.normalize().multiplyScalar(arcHeight);
    const curve = new THREE.QuadraticBezierCurve3(startVector, midPoint, endVector);
    const geometry = new THREE.TubeGeometry(curve, 128, 0.015, 8, false);
    const totalIndices = 128 * 8 * 6;

    if (isAnimated) {
        geometry.setDrawRange(0, 0); 
    } else {
        geometry.setDrawRange(0, totalIndices);
    }

    const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { totalIndices: totalIndices, currentCount: 0 }; 
    return mesh;
};

// --- HELPERS ---
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

// --- MOCK DATA (Updated IDs to match MiniSupplyChainDiagram) ---
const MOCK_PATH = [
    { id: 'quartz_gpu', type: 'RAW_MATERIAL', name: 'Raw Quartz Mine', emoji: '⛏️', locations: [{ lat: 35.9154, lng: -82.0646, name: 'Spruce Pine, USA' }], risk: 2 },
    { id: 'silicon_wafers_gpu', type: 'PROCESSING', name: 'Silicon Wafer Prep', emoji: '💿', locations: [{ lat: 35.6762, lng: 139.6503, name: 'Tokyo, Japan' }], risk: 3, shipping: { cost: '$1200', time: '5 days', method: 'Ocean Freight' } },
    { id: 'gpu_die', type: 'FAB', name: 'TSMC Foundry (Fab)', emoji: '💾', locations: [{ lat: 24.8138, lng: 120.9675, name: 'Hsinchu, Taiwan' }], risk: 7.5, shipping: { cost: '$5000', time: '2-3 days', method: 'Secure Air Freight' } },
    { id: 'packaging_merge', type: 'ASSEMBLY', name: 'CoWoS Packaging', emoji: '🔧', locations: [{ lat: 24.1477, lng: 120.6736, name: 'Taichung, Taiwan' }], risk: 5, shipping: { cost: '$800', time: '1 day', method: 'Secure Trucking' } },
    { id: 'final_assembly', type: 'DISTRIBUTION', name: 'Final Assembly (Foxconn)', emoji: '🏭', locations: [{ lat: 22.5431, lng: 114.0579, name: 'Shenzhen, China' }], risk: 4, shipping: { cost: '$2500', time: '2 days', method: 'Secure Trucking' } },
    { id: 'dist', type: 'DELIVERY', name: 'Global Distribution', emoji: '🚢', locations: [{ lat: 37.3688, lng: -122.0363, name: 'Santa Clara, USA' }], risk: 1, shipping: { cost: '$8500', time: '15-20 days', method: 'Ocean Freight' } }
];

const LOCATION_MAP = {
    'Spruce Pine, NC': { lat: 35.9154, lng: -82.0646 },
    'Tokyo, Japan': { lat: 35.6762, lng: 139.6503 },
    'Kawasaki, Japan': { lat: 35.5308, lng: 139.7029 },
    'Marlborough, MA': { lat: 42.3459, lng: -71.5523 },
    'Kyoto, Japan': { lat: 35.0116, lng: 135.7681 },
    'Osaka, Japan': { lat: 34.6937, lng: 135.5023 },
    'Chandler, AZ': { lat: 33.3062, lng: -111.8413 },
    'Pittsburgh, PA': { lat: 40.4406, lng: -79.9959 },
    'Phoenix, AZ': { lat: 33.4484, lng: -112.0740 },
    'Multiple Global': { lat: 51.5074, lng: -0.1278 },
    'Vancouver, WA': { lat: 45.6387, lng: -122.6615 },
    'Imari, Japan': { lat: 33.2642, lng: 129.8786 },
    'Sherman, TX': { lat: 33.6357, lng: -96.6089 },
    'Gumi, South Korea': { lat: 36.1136, lng: 128.3445 },
    'Seoul, South Korea': { lat: 37.5665, lng: 126.9780 },
    'Pyeongtaek, South Korea': { lat: 36.9922, lng: 127.1128 },
    'Icheon, South Korea': { lat: 37.2720, lng: 127.4425 },
    'Boise, ID': { lat: 43.6150, lng: -116.2023 },
    'Hsinchu, Taiwan': { lat: 24.8138, lng: 120.9675 },
    'Hwaseong, South Korea': { lat: 37.2071, lng: 126.8167 },
    'Ogaki, Japan': { lat: 35.3609, lng: 136.6176 },
    'Chennai, India': { lat: 13.0827, lng: 80.2707 },
    'Taichung, Taiwan': { lat: 24.1477, lng: 120.6736 },
    'Taipei, Taiwan': { lat: 25.0330, lng: 121.5654 },
    'Taoyuan, Taiwan': { lat: 24.9936, lng: 121.3010 },
    'Santa Ana, CA': { lat: 33.7455, lng: -117.8677 },
    'Laconia, NH': { lat: 43.5279, lng: -71.4703 },
    'Vienna, Austria': { lat: 48.2082, lng: 16.3738 },
    'Shenzhen, China': { lat: 22.5431, lng: 114.0579 },
    'Austin, TX': { lat: 30.2672, lng: -97.7431 },
    'Santa Clara, USA': { lat: 37.3688, lng: -122.0363 }
};

const SimulationPage = ({ selectedPath, vendorSelections, levelInfo }) => {
    const mountRef = useRef(null);
    const [sceneReady, setSceneReady] = useState(false);
    
    // Build path from vendor selections
    const [builtPath, setBuiltPath] = useState([]);
    
    useEffect(() => {
        if (!vendorSelections || Object.keys(vendorSelections).length === 0) {
            if (!selectedPath || selectedPath.length === 0) {
                setBuiltPath(MOCK_PATH);
            }
            return;
        }
        
        // Build the path from vendor selections
        const path = [];
        
        // 1. RAW MATERIALS (Approximate mapping for visualization)
        path.push({
            id: 'quartz_gpu',
            type: 'RAW_MATERIAL',
            name: 'Raw Material Extraction',
            emoji: '⛏️',
            locations: [LOCATION_MAP['Spruce Pine, NC']],
            risk: 2
        });

        // Go through each stage and component in order
        if (levelInfo && levelInfo.stages) {
            levelInfo.stages.forEach((stage, stageIdx) => {
                stage.components.forEach((component, compIdx) => {
                    const vendor = vendorSelections[component.id];
                    if (vendor) {
                        const location = LOCATION_MAP[vendor.location] || { lat: 0, lng: 0 };
                        
                        // Map the component ID to the Tree ID if possible, otherwise use generated
                        // This allows the Minimap to light up corresponding nodes
                        let mappedId = vendor.id || `${component.id}`;
                        if(component.id.includes('gpu')) mappedId = 'gpu_die';
                        if(component.id.includes('hbm')) mappedId = 'hbm3e';
                        if(component.id.includes('substrate')) mappedId = 'substrate_abf';
                        if(component.id.includes('assembly')) mappedId = 'final_assembly';

                        path.push({
                            id: mappedId,
                            type: stage.name.toUpperCase(),
                            name: vendor.name,
                            emoji: component.emoji || '🏭',
                            locations: [{ ...location, name: vendor.location }],
                            risk: vendor.risk,
                            shipping: {
                                cost: `${vendor.cost}`,
                                time: `${vendor.leadTime} days`,
                                method: vendor.shippingMethod || 'Standard Air Freight'
                            }
                        });
                    }
                });
            });
        }
        
        setBuiltPath(path);
    }, [vendorSelections, levelInfo, selectedPath]);

    const activePath = builtPath.length > 0 ? builtPath : (selectedPath || []);
    
    // --- STATE ---
    const [isSimulating, setIsSimulating] = useState(false);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [simulationStatus, setSimulationStatus] = useState('idle');
    const [simulationLog, setSimulationLog] = useState([]); 
    const [nodeStatuses, setNodeStatuses] = useState({});
    const [gpuCount, setGpuCount] = useState(1000); 
    const [livePayload, setLivePayload] = useState(1000); 

    const metricsRef = useRef({ totalCost: 0, totalTime: 0, totalDistance: 0, totalCarbon: 0, totalYieldLoss: 0 });
    const [metrics, setMetrics] = useState(metricsRef.current);
    const [metricsHistory, setMetricsHistory] = useState([]);
    const [isMetricsExpanded, setIsMetricsExpanded] = useState(false);
    const [activeMetricTab, setActiveMetricTab] = useState('overall');

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
    const runSimulationStep = useCallback((index, currentPayload) => {
        if (index >= activePath.length) {
            setIsSimulating(false);
            setSimulationStatus('completed');
            setSimulationLog(prev => [...prev, { text: `✅ Supply Chain Completed. Delivered: ${currentPayload.toLocaleString()} units.`, type: "success", id: Date.now() + Math.random() }]);
            return;
        }

        const item = activePath[index];
        setCurrentStepIndex(index);
        setNodeStatuses(prev => ({ ...prev, [item.id]: 'active' }));
        setLivePayload(currentPayload); 

        let distance = 0;
        let legCost = 0;
        let legTime = 0;
        let legCarbon = 0;
        let disruptionType = null;
        let penaltyCost = 0;
        let penaltyTime = 0;
        let stepPayload = currentPayload;
        let yieldLossCost = 0;

        const volumeScalingFactor = Math.max(1, currentPayload / 1000);

        if (item.type === 'FAB') {
            const baseYield = 0.75; 
            const variance = (Math.random() * 0.2) - 0.1; 
            const actualYield = Math.max(0.1, Math.min(0.99, baseYield + variance));
            const primeUnits = Math.floor(currentPayload * actualYield);
            const binnedUnits = currentPayload - primeUnits;
            yieldLossCost = binnedUnits * 500;
            stepPayload = primeUnits;
            setTimeout(() => {
                setSimulationLog(prev => [...prev, { step: index, text: `📉 Yield: ${(actualYield * 100).toFixed(1)}%. ${binnedUnits.toLocaleString()} binned.`, type: "warning", id: Date.now() }]);
            }, 500);
        }

        if (index > 0) {
            const prevItem = activePath[index - 1];
            const prevPos = latLonToVector3(prevItem.locations[0].lat, prevItem.locations[0].lng, 1.3);
            const currPos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.3);
            
            distance = prevPos.distanceTo(currPos) * 5000;
            const shipping = item.shipping || {};
            
            legCost = parseCost(shipping.cost) * volumeScalingFactor;
            legTime = parseTimeDays(shipping.time);
            const methodFactor = METHOD_CARBON_FACTOR[shipping.method] ?? 0.4;
            legCarbon = (distance * methodFactor) * volumeScalingFactor;

            const volumeRiskPenalty = Math.max(0, (currentPayload - 1000) / 5000) * 0.5;
            const effectiveRisk = Math.min(18, item.risk + volumeRiskPenalty);
            const failureChance = effectiveRisk * 0.05; 
            const roll = Math.random();

            if (roll < failureChance) {
                const severity = Math.random();
                const criticalThreshold = 0.85 - (volumeRiskPenalty * 0.02); 
                if (severity > criticalThreshold) {
                    disruptionType = 'CRITICAL';
                } else if (severity > 0.5) {
                    disruptionType = 'LOSS';
                    penaltyCost = legCost * 0.6;
                    penaltyTime = 2 + (volumeRiskPenalty * 0.2); 
                } else {
                    disruptionType = 'DELAY';
                    penaltyTime = Math.ceil(Math.random() * 4) + 1;
                }
            }
        }

        const prev = metricsRef.current;
        const appliedCost = disruptionType !== 'CRITICAL' ? (legCost + penaltyCost + yieldLossCost) : legCost;
        const appliedTime = disruptionType !== 'CRITICAL' ? (legTime + penaltyTime) : legTime;

        const newMetrics = {
            totalCost: prev.totalCost + appliedCost,
            totalTime: prev.totalTime + appliedTime,
            totalDistance: prev.totalDistance + distance,
            totalCarbon: prev.totalCarbon + legCarbon,
            totalYieldLoss: prev.totalYieldLoss + (item.type === 'FAB' ? (currentPayload - stepPayload) : 0)
        };
        metricsRef.current = newMetrics;
        setMetrics(newMetrics);
        
        setMetricsHistory(history => {
            if (history.length > 0 && history[history.length - 1].step === index) return history;
            const newEntry = { step: index, name: item.name, totalCost: newMetrics.totalCost, totalTime: newMetrics.totalTime, totalDistance: newMetrics.totalDistance, totalCarbon: newMetrics.totalCarbon };
            return index === 0 ? [newEntry] : [...history, newEntry];
        });

        setTimeout(() => {
            if (disruptionType === 'CRITICAL') {
                setNodeStatuses(prev => {
                    const newStatuses = { ...prev, [item.id]: 'error' };
                    for (let i = index + 1; i < activePath.length; i++) newStatuses[activePath[i].id] = 'blocked';
                    return newStatuses;
                });
                setSimulationLog(prev => [...prev, { step: index, text: `⛔ STOPPAGE at ${item.name}`, type: "danger", id: Date.now() }]);
                setIsSimulating(false);
                setSimulationStatus('failed');
            } else if (disruptionType === 'LOSS') {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'warning' }));
                setSimulationLog(prev => [...prev, { step: index, text: `⚠️ Shipment damage at ${item.name}`, type: "warning", id: Date.now() }]);
                setTimeout(() => runSimulationStep(index + 1, stepPayload), 2500);
            } else if (disruptionType === 'DELAY') {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'warning' }));
                setSimulationLog(prev => [...prev, { step: index, text: `⏱️ Delay at ${item.name}`, type: "warning", id: Date.now() }]);
                setTimeout(() => runSimulationStep(index + 1, stepPayload), 2000);
            } else {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'success' }));
                setTimeout(() => runSimulationStep(index + 1, stepPayload), 1500);
            }
        }, 1000);

    }, [activePath]); 

    const startSimulation = useCallback(() => {
        if (isSimulating && simulationStatus === 'running') return;
        setIsSimulating(true);
        setSimulationStatus('running');
        setLivePayload(gpuCount);
        setSimulationLog([{ text: `🚀 Starting Simulation...`, type: "neutral", id: Date.now() }]);
        setNodeStatuses({});
        setCurrentStepIndex(-1);
        metricsRef.current = { totalCost: 0, totalTime: 0, totalDistance: 0, totalCarbon: 0, totalYieldLoss: 0 };
        setMetrics(metricsRef.current);
        setMetricsHistory([]);
        drawnLinesRef.current.clear();
        drawnMarkersRef.current.clear();
        animatingObjectsRef.current = [];
        setIsMetricsExpanded(false);
        setTimeout(() => { runSimulationStep(0, gpuCount); }, 1000);
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
        const globe = new THREE.Mesh(new THREE.SphereGeometry(1.3, 64, 64), new THREE.MeshPhongMaterial({ color: 0x2563eb, shininess: 20 }));
        scene.add(globe);
        globeRef.current = globe;
        const markersGroup = new THREE.Group();
        globe.add(markersGroup);
        markersGroupRef.current = markersGroup;
        const arcGroup = new THREE.Group();
        globe.add(arcGroup);
        arcGroupRef.current = arcGroup;
        const starGeo = new THREE.BufferGeometry();
        const starVs = [];
        for (let i = 0; i < 2000; i++) starVs.push((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
        starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVs, 3));
        scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, opacity: 0.5, transparent: true })));

        const texLoader = new THREE.TextureLoader();
        texLoader.crossOrigin = 'anonymous'; 
        texLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg', (tex) => {
             if (globeRef.current) { globeRef.current.material.map = tex; globeRef.current.material.color.setHex(0xffffff); globeRef.current.material.needsUpdate = true; }
        });

        const handleMouseDown = (e) => { isDraggingRef.current = true; previousMouseRef.current = { x: e.clientX, y: e.clientY }; };
        const handleMouseMove = (e) => {
            if (!isDraggingRef.current || !globeRef.current) return;
            const dx = e.clientX - previousMouseRef.current.x;
            const dy = e.clientY - previousMouseRef.current.y;
            globeRef.current.rotation.x += dy * 0.005;
            globeRef.current.rotation.y += dx * 0.005;
            previousMouseRef.current = { x: e.clientX, y: e.clientY };
        };
        const handleMouseUp = () => { isDraggingRef.current = false; };
        const canvas = renderer.domElement;
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            if (globeRef.current && !isDraggingRef.current) globeRef.current.rotation.y += 0.001;
            if (animatingObjectsRef.current.length > 0) {
                for (let i = animatingObjectsRef.current.length - 1; i >= 0; i--) {
                    const mesh = animatingObjectsRef.current[i];
                    if (mesh.userData.currentCount < mesh.userData.totalIndices) {
                        mesh.userData.currentCount += 150;
                        mesh.geometry.setDrawRange(0, mesh.userData.currentCount);
                    } else {
                        mesh.geometry.setDrawRange(0, mesh.userData.totalIndices);
                        animatingObjectsRef.current.splice(i, 1);
                    }
                }
            }
            if (rendererRef.current) rendererRef.current.render(sceneRef.current, cameraRef.current);
        };
        animate();
        setSceneReady(true);
        return () => { if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current); };
    }, []);

    // --- VISUALS UPDATER ---
    useEffect(() => {
        if (!sceneReady || !globeRef.current) return;
        const markers = markersGroupRef.current;
        const arcs = arcGroupRef.current;
        
        if (currentStepIndex === -1) {
            markers.clear(); arcs.clear();
            drawnLinesRef.current.clear(); drawnMarkersRef.current.clear(); animatingObjectsRef.current = [];
        }

        const getStatusColor = (status) => {
            if (status === 'active') return 0xffffff;
            if (status === 'success') return 0x22c55e;
            if (status === 'warning') return 0xf59e0b;
            if (status === 'error') return 0xef4444;
            return 0x334155; 
        };

        activePath.forEach((item, index) => {
            if (index > currentStepIndex + 1 && currentStepIndex !== -1) return;

            const markerId = `marker-${index}`;
            const status = nodeStatuses[item.id] || 'pending';
            
            if (!drawnMarkersRef.current.has(markerId) && item.locations && item.locations[0]) {
                const pos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.32);
                const color = getStatusColor(status);
                const marker = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 16), new THREE.MeshBasicMaterial({ color, transparent: true }));
                marker.position.copy(pos);
                marker.userData = { id: markerId };
                markers.add(marker);
                if (status === 'active') {
                    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 }));
                    glow.position.copy(pos);
                    markers.add(glow);
                }
                drawnMarkersRef.current.add(markerId);
            } else {
                const existing = markers.children.find(c => c.userData.id === markerId);
                if (existing) existing.material.color.setHex(getStatusColor(status));
            }

            if (index > 0 && index <= currentStepIndex + 1) {
                const legId = `line-${index}`;
                if (!drawnLinesRef.current.has(legId)) {
                    const prev = latLonToVector3(activePath[index-1].locations[0].lat, activePath[index-1].locations[0].lng, 1.32);
                    const curr = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.32);
                    const isCurrLeg = index === currentStepIndex + 1 || index === currentStepIndex;
                    const color = isCurrLeg ? 0x3b82f6 : 0x22c55e;
                    const arc = createArcLine(prev, curr, new THREE.Color(color), isCurrLeg ? 1 : 0.6, isCurrLeg);
                    arc.userData = { id: legId };
                    arcs.add(arc);
                    drawnLinesRef.current.add(legId);
                    if (isCurrLeg) animatingObjectsRef.current.push(arc);
                }
            }
        });
    }, [activePath, nodeStatuses, currentStepIndex, sceneReady]);

    const currentRiskLevel = gpuCount < 10000 ? "Low" : gpuCount < 50000 ? "Medium" : "High";
    const riskColor = currentRiskLevel === "Low" ? "text-emerald-400 border-emerald-500/50 bg-emerald-500/10" : currentRiskLevel === "Medium" ? "text-yellow-400 border-yellow-500/50 bg-yellow-500/10" : "text-red-400 border-red-500/50 bg-red-500/10";

    return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
            <div ref={mountRef} className="absolute inset-0 w-full h-full" />

            {/* HEADER */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Impact Analysis</h1>
                <p className="text-blue-200/60 text-sm font-medium mt-1">Simulating probability-based supply chain disruptions.</p>
            </div>

            {/* CONTROLS */}
            <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-4 pointer-events-auto">
                <div className={`bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl shadow-2xl transition-all duration-500 ${isSimulating ? 'p-3 w-64' : 'p-4 w-80'}`}>
                    {!isSimulating ? (
                        <>
                            <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><span>⚡</span> Supply Chain Simulation</h2>
                            <div className="mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-gray-400 text-xs uppercase font-bold">Order Volume</label>
                                    <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${riskColor}`}>{currentRiskLevel} Risk</span>
                                </div>
                                <div className="flex flex-col mb-2">
                                     <span className="text-blue-400 font-mono text-xl font-bold">{gpuCount.toLocaleString()}</span>
                                     <span className="text-gray-500 text-[10px]">ordered</span>
                                </div>
                                <input type="range" min="1000" max="100000" step="1000" value={gpuCount} onChange={(e) => setGpuCount(Number(e.target.value))} className="w-full h-2 rounded-lg bg-slate-600 accent-blue-500" />
                            </div>
                            <button onClick={startSimulation} className="w-full py-3 rounded-lg font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500">▶️ Run Simulation</button>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-white font-bold text-sm flex items-center gap-2"><span className="animate-spin">⚙️</span> <span>Running</span></h2>
                                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${riskColor}`}>{currentRiskLevel}</span>
                            </div>
                            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-700 mb-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-emerald-400 font-mono text-2xl font-bold animate-pulse">{livePayload.toLocaleString()}</span>
                                    <span className="text-emerald-500/60 text-[10px]">live units</span>
                                </div>
                            </div>
                            <button onClick={startSimulation} disabled={simulationStatus === 'running'} className={`w-full py-2 rounded-lg font-bold text-xs ${simulationStatus === 'running' ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600 text-white'}`}>{simulationStatus === 'running' ? '⚙️ Running...' : '↻ Retry'}</button>
                        </>
                    )}
                </div>
            </div>

            {/* --- NEW MINIMAP COMPONENT INTEGRATION --- */}
            <MiniSupplyChainDiagram 
                activePath={activePath} 
                currentStepIndex={currentStepIndex}
                nodeStatuses={nodeStatuses}
            />

            {/* BOTTOM BAR (Simplified)
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-auto max-w-[60%] pointer-events-auto">
                <div className="bg-slate-800/80 backdrop-blur-md border border-slate-600 p-2 rounded-xl shadow-2xl flex items-center space-x-1 overflow-x-auto">
                    {activePath.map((item, index) => {
                         const status = nodeStatuses[item.id] || 'pending';
                         let borderClass = status === 'active' ? 'border-white animate-pulse' : status === 'success' ? 'border-green-500' : status === 'error' ? 'border-red-500' : 'border-slate-600';
                         return (
                            <React.Fragment key={item.id}>
                                {index > 0 && <div className={`h-0.5 w-3 ${status !== 'pending' ? 'bg-blue-500' : 'bg-slate-700'}`} />}
                                <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${borderClass} ${status === 'active' ? 'bg-slate-700' : 'bg-slate-800'}`}>
                                    <span className="text-xs">{item.emoji}</span>
                                </div>
                            </React.Fragment>
                         );
                    })}
                </div>
            </div> */}

            {/* METRICS DASHBOARD (Hidden while running for cleaner view, expands on click) */}
            {(metricsHistory.length > 0) && (
                <div className="absolute bottom-8 left-6 z-10 pointer-events-auto">
                    <div className={`bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl shadow-2xl ${isMetricsExpanded ? 'w-[500px]' : 'w-64 cursor-pointer p-4 hover:border-blue-400'}`} onClick={() => !isMetricsExpanded && setIsMetricsExpanded(true)}>
                        {!isMetricsExpanded ? (
                             <div className="flex justify-between items-center">
                                <h3 className="text-white font-bold text-xs">📊 Metrics</h3>
                                <div className="text-emerald-400 font-bold text-xs">${(metrics.totalCost/1000).toFixed(0)}k</div>
                             </div>
                        ) : (
                            <div className="p-4">
                                <div className="flex justify-between mb-4 border-b border-slate-700 pb-2">
                                    <h3 className="text-white font-bold">Metrics</h3>
                                    <button onClick={(e) => { e.stopPropagation(); setIsMetricsExpanded(false); }} className="text-xs text-gray-400">Collapse</button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                                        <div className="text-gray-400 text-xs">Cost</div>
                                        <div className="text-emerald-400 font-bold">${(metrics.totalCost/1000).toFixed(1)}k</div>
                                    </div>
                                    <div className="bg-slate-900/50 p-2 rounded border border-slate-700">
                                        <div className="text-gray-400 text-xs">Yield Loss</div>
                                        <div className="text-red-400 font-bold">{metrics.totalYieldLoss}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SimulationPage;