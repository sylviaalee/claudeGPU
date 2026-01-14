'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// --- CONSTANTS & DATA ---

// Specific risks mapped to node types for realistic simulation feedback
const SPECIFIC_RISKS = {
    RAW_MATERIAL: {
        critical: ["Mine Collapse Detected", "Strict Export Ban Enforced", "Vein Exhaustion"],
        warning: [" labor Strike in Progress", "Severe Weather Extraction Delay", "Purity Standards Missed"]
    },
    PROCESSING: {
        critical: ["Chemical Plant Explosion", "EPA/Environmental Shutdown", "Contamination Breach"],
        warning: ["Machinery Calibration Error", "Power Grid Instability", "Feedstock Shortage"]
    },
    FAB: {
        critical: ["Clean Room Contamination", "Lithography Machine Failure", "Cyberattack on IP"],
        warning: ["Wafer Yield Excursion", "Binning Efficiency Drop", "Neon Gas Shortage"]
    },
    ASSEMBLY: {
        critical: ["Factory Fire", "Indefinite Labor Walkout", "Structural Integrity Failure"],
        warning: ["Packaging Defect Rate Spike", "Glue Curing Delay", "Testing Backlog"]
    },
    MANUFACTURING: {
        critical: ["Assembly Line Halt", "Component Incompatibility", "Recall Order Issued"],
        warning: ["Shift Scheduling Conflict", "Cooling System Failure", "Quality Control Flag"]
    },
    DISTRIBUTION: {
        critical: ["Port Closure (Geopolitical)", "Cargo Ship Sinking", "Customs Seizure"],
        warning: ["Port Congestion", "Fuel Surcharge Dispute", "Container Shortage"]
    },
    COMPONENT: {
        critical: ["Supplier Bankruptcy", "Design Flaw Detected", "Safety Certification Failed"],
        warning: ["Batch Variance Detected", "Lead Time Extension", "Inventory Mismatch"]
    },
    DEFAULT: {
        critical: ["Critical Infrastructure Failure", "Operations Ceased"],
        warning: ["Operational Drag", "Capacity Limitations"]
    }
};

// --- STRICT ORDERING SEQUENCE WITH PARENT LINKS (Bottom to Top, Left to Right) ---
const SIMULATION_SEQUENCE = [
    // Branch 1 (Leftmost): HBM3e Memory Chain - Bottom to Top
    { id: 'quartz_memory', name: 'Raw Quartz (Mem)', type: 'RAW_MATERIAL', risk: 2, parentId: 'silicon_wafers_memory' },
    { id: 'silicon_wafers_memory', name: 'Wafer Prep', type: 'PROCESSING', risk: 3, parentId: 'dram_cells' },
    { id: 'dram_cells', name: 'DRAM Cell Fab', type: 'FAB', risk: 5, parentId: 'hbm3e' },
    { id: 'hbm3e', name: 'HBM3e Stack', type: 'ASSEMBLY', risk: 6, isVendor: true, matchKey: 'hbm', parentId: 'packaging_merge' },

    // Branch 2 (Middle-Left): ABF Substrate - ABF Film Sub-branch (Bottom to Top)
    { id: 'polymers_abf', name: 'Polymers', type: 'RAW_MATERIAL', risk: 2, parentId: 'abf_film' },
    { id: 'abf_film', name: 'ABF Film', type: 'PROCESSING', risk: 4, parentId: 'substrate_abf' },
    
    // Branch 2 (Middle-Left): ABF Substrate - Copper Clad Sub-branch (Bottom to Top)
    { id: 'copper_resin', name: 'Copper/Resin', type: 'RAW_MATERIAL', risk: 2, parentId: 'copper_clad_laminates' },
    { id: 'copper_clad_laminates', name: 'Laminates', type: 'PROCESSING', risk: 3, parentId: 'substrate_abf' },
    
    // Branch 2 (Middle-Left): ABF Substrate Merge
    { id: 'substrate_abf', name: 'ABF Substrate', type: 'ASSEMBLY', risk: 5, isVendor: true, matchKey: 'substrate', parentId: 'packaging_merge' },

    // Branch 3 (Middle-Right): GPU Die - Photoresist Sub-branch (Bottom to Top)
    { id: 'polymers_photoresist', name: 'Base Polymers', type: 'RAW_MATERIAL', risk: 2, parentId: 'photoresist' },
    { id: 'photoresist', name: 'Photoresist', type: 'PROCESSING', risk: 3, parentId: 'gpu_die' },
    
    // Branch 3 (Middle-Right): GPU Die - Silicon Wafer Sub-branch (Bottom to Top)
    { id: 'quartz_gpu', name: 'Raw Quartz (GPU)', type: 'RAW_MATERIAL', risk: 2, parentId: 'silicon_wafers_gpu' },
    { id: 'silicon_wafers_gpu', name: 'Silicon Wafers', type: 'PROCESSING', risk: 3, parentId: 'gpu_die' },
    
    // Branch 3 (Middle-Right): GPU Die Merge
    { id: 'gpu_die', name: 'GPU Die Fab', type: 'FAB', risk: 7.5, isVendor: true, matchKey: 'gpu', parentId: 'packaging_merge' },

    // Merge Point: 2.5D Packaging (combines HBM, Substrate, GPU Die)
    { id: 'packaging_merge', name: '2.5D Packaging', type: 'ASSEMBLY', risk: 8, isVendor: true, matchKey: 'packaging', parentId: 'final_assembly' },

    // Branch 4 (Right): PCB Motherboard (single node)
    { id: 'pcb_motherboard', name: 'PCB Motherboard', type: 'COMPONENT', risk: 3, isVendor: true, matchKey: 'pcb', parentId: 'final_assembly' },
    
    // Branch 5 (Rightmost): Thermal Solution (Bottom to Top)
    { id: 'aluminium_copper', name: 'Aluminium/Copper', type: 'RAW_MATERIAL', risk: 2, parentId: 'coolers_heat_sinks' },
    { id: 'coolers_heat_sinks', name: 'Thermal Solution', type: 'COMPONENT', risk: 2, isVendor: true, matchKey: 'cooler', parentId: 'final_assembly' },

    // Final Assembly & Distribution (Top of tree)
    { id: 'final_assembly', name: 'Final Assembly', type: 'MANUFACTURING', risk: 4, isVendor: true, matchKey: 'assembly', parentId: 'dist' },
    { id: 'dist', name: 'Global Distribution', type: 'DISTRIBUTION', risk: 1, isVendor: true, matchKey: 'dist', parentId: null }
];

// --- COMPONENT: Mini Supply Chain Diagram ---
const MiniSupplyChainDiagram = ({ activePath, currentStepIndex, nodeStatuses }) => {
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

    const getCurrentStepId = () => {
        if (!activePath || currentStepIndex < 0 || currentStepIndex >= activePath.length) return null;
        return activePath[currentStepIndex].id;
    };

    const currentId = getCurrentStepId();

    const TreeNode = ({ node, level = 0 }) => {
        const hasChildren = node.children && node.children.length > 0;
        const status = nodeStatuses[node.id] || 'pending';
        const isCurrent = node.id === currentId;
        const isCompleted = status === 'success';
        const isError = status === 'error' || status === 'blocked';
        const isWarning = status === 'warning';

        let nodeClass = "bg-gradient-to-br from-slate-700 to-slate-800 border border-blue-500/30 text-blue-200/50";
        let textClass = "text-blue-200/50";

        if (isCurrent) {
            nodeClass = "bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-blue-400 text-white animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 z-10";
            textClass = "text-white font-bold";
        } else if (isError) {
            nodeClass = "bg-gradient-to-br from-red-900 to-red-800 border border-red-500 text-red-100";
            textClass = "text-red-100";
        } else if (isWarning) {
            nodeClass = "bg-gradient-to-br from-amber-900 to-amber-800 border border-amber-500 text-amber-100";
        } else if (isCompleted) {
            nodeClass = "bg-gradient-to-br from-emerald-900 to-slate-800 border border-emerald-500/50 text-emerald-100";
            textClass = "text-emerald-100";
        }

        return (
            <div className="flex flex-col items-center">
                <div className={`${nodeClass} px-2 py-1 rounded text-[7px] text-center mb-1 whitespace-nowrap max-w-[80px] overflow-hidden text-ellipsis shadow-lg transition-all duration-300 relative`}>
                    <span className={textClass}>{node.name}</span>
                    {isCompleted && !isCurrent && <span className="ml-1 text-emerald-400">✓</span>}
                    {isCurrent && <span className="ml-1 text-white">●</span>}
                    {isError && <span className="ml-1 text-red-400">✕</span>}
                </div>
                {hasChildren && (
                    <>
                        <div className={`w-px h-2 ${isCurrent || isCompleted ? 'bg-blue-400/70' : 'bg-blue-400/20'}`}></div>
                        <div className="flex items-start gap-1 relative">
                            {node.children.length > 1 && (
                                <div className={`absolute top-0 left-0 right-0 h-px ${isCurrent || isCompleted ? 'bg-blue-400/50' : 'bg-blue-400/20'}`} style={{ width: 'calc(100% - 2px)', left: '50%', transform: 'translateX(-50%)' }}></div>
                            )}
                            {node.children.map((child, idx) => (
                                <div key={idx} className="flex flex-col items-center">
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
                <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2"><span>🕸️</span> Supply Chain Map</div>
                {currentId && <div className="text-[9px] text-blue-300">Active: {currentId}</div>}
            </div>
            <div className="w-full flex justify-center transform scale-90 origin-top">
                <TreeNode node={tree} />
            </div>
        </div>
    );
};

// --- UTILITY: Math & Three.js ---
const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
};

const createArcLine = (startVector, endVector, color, opacity = 0.8, isAnimated = false) => {
    const distance = startVector.distanceTo(endVector);
    let midVector = startVector.clone().add(endVector);
    if (midVector.lengthSq() < 0.01) {
        const axis = new THREE.Vector3(0, 1, 0); 
        if (Math.abs(startVector.clone().normalize().dot(axis)) > 0.99) axis.set(0, 0, 1);
        midVector.crossVectors(startVector, axis);
    }
    const arcHeight = 1.3 + (distance * 0.5); 
    const midPoint = midVector.normalize().multiplyScalar(arcHeight);
    const curve = new THREE.QuadraticBezierCurve3(startVector, midPoint, endVector);
    const geometry = new THREE.TubeGeometry(curve, 128, 0.015, 8, false);
    const totalIndices = 128 * 8 * 6;
    if (isAnimated) geometry.setDrawRange(0, 0); 
    else geometry.setDrawRange(0, totalIndices);
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
const METHOD_CARBON_FACTOR = {
  'Secure Air Freight': 0.6, 'Priority Secure Air': 0.7, 'Standard Air Freight': 0.55,
  'International Air': 0.75, 'Consolidated Air': 0.45, 'Ocean Freight': 0.2,
  'Sea/Air Hybrid': 0.35, 'Secure Trucking': 0.15, 'Rail/Truck Freight': 0.12,
  'Direct to Data Center': 0.1, 'Digital Transfer': 0.0
};
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

// --- ADD SPARKLINE COMPONENT HERE ---
const Sparkline = ({ data, color }) => {
    if (!data || data.length < 2) return <div className="h-8 w-full bg-slate-800/50 rounded animate-pulse" />;

    // 1. Normalize Data to 0-100 Range
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    // 2. Generate SVG Path
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((val - min) / range) * 100; // Invert Y because SVG 0 is top
        return `${x},${y}`;
    }).join(' ');

    const fillPath = `M ${points} L 100,100 L 0,100 Z`;
    const strokePath = `M ${points}`;

    const colorMap = {
        emerald: '#34d399',
        purple: '#c084fc',
        blue: '#60a5fa',
        amber: '#fbbf24'
    };
    const strokeColor = colorMap[color] || '#94a3b8';

    return (
        <div className="h-10 w-full mt-2 overflow-hidden relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <path d={fillPath} fill={strokeColor} fillOpacity="0.15" stroke="none" />
                <path d={strokePath} fill="none" stroke={strokeColor} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
};

const SimulationPage = ({ selectedPath, vendorSelections }) => {
    const mountRef = useRef(null);
    const [sceneReady, setSceneReady] = useState(false);
    const [builtPath, setBuiltPath] = useState([]);
    
    // --- BUILD PATH ---
    useEffect(() => {
        if (!vendorSelections || Object.keys(vendorSelections).length === 0) {
            setBuiltPath(selectedPath || []);
            return;
        }
        const path = [];
        SIMULATION_SEQUENCE.forEach((step) => {
            let selectedVendor = null;
            let shouldAdd = false;
            let mockLocation = { lat: 0, lng: 0 };
            
            if (step.isVendor && step.matchKey) {
                const selectionKey = Object.keys(vendorSelections).find(k => k.toLowerCase().includes(step.matchKey));
                if (selectionKey) {
                    selectedVendor = vendorSelections[selectionKey];
                    shouldAdd = true;
                }
            } else {
                shouldAdd = true;
                if (step.id.includes('quartz')) mockLocation = LOCATION_MAP['Spruce Pine, NC'];
                else if (step.id.includes('wafer') || step.id.includes('photoresist')) mockLocation = LOCATION_MAP['Tokyo, Japan'];
                else if (step.id.includes('abf') || step.id.includes('polymers')) mockLocation = LOCATION_MAP['Osaka, Japan'];
                else if (step.id.includes('copper')) mockLocation = LOCATION_MAP['Chennai, India'];
                else mockLocation = LOCATION_MAP['Multiple Global'];
            }

            if (shouldAdd) {
                const location = selectedVendor ? (LOCATION_MAP[selectedVendor.location] || { lat: 0, lng: 0 }) : mockLocation;
                path.push({
                    id: step.id,
                    parentId: step.parentId,
                    type: step.type,
                    name: selectedVendor ? selectedVendor.name : step.name,
                    emoji: selectedVendor ? '🏭' : (step.type === 'RAW_MATERIAL' ? '⛏️' : '⚙️'),
                    locations: [{ ...location, name: selectedVendor ? selectedVendor.location : 'Global' }],
                    risk: selectedVendor ? selectedVendor.risk : step.risk,
                    shipping: selectedVendor ? {
                        cost: `${selectedVendor.cost}`,
                        time: `${selectedVendor.leadTime} days`,
                        method: selectedVendor.shippingMethod || 'Standard Air Freight'
                    } : { cost: '$500', time: '1 day', method: 'Internal Transfer' }
                });
            }
        });
        setBuiltPath(path);
    }, [vendorSelections, selectedPath]);

    const activePath = builtPath;
    
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
    const targetRotationRef = useRef(new THREE.Quaternion());
    const currentRotationRef = useRef(new THREE.Quaternion());

    // --- LOGIC: SIMULATION ENGINE ---
    const runSimulationStep = useCallback((index, currentPayload) => {
        if (index >= activePath.length) {
            setIsSimulating(false);
            setSimulationStatus('completed');
            setSimulationLog(prev => [{ step: index, time: Date.now(), title: "Simulation Complete", message: "All units delivered.", type: "success" }, ...prev]);
            return;
        }

        const item = activePath[index];
        setCurrentStepIndex(index);
        setNodeStatuses(prev => ({ ...prev, [item.id]: 'active' }));
        setLivePayload(currentPayload); 

        // --- CAMERA ROTATION LOGIC (FIXED) ---
        if (item.locations && item.locations[0]) {
            const { lat, lng } = item.locations[0];
            const latRad = lat * (Math.PI / 180);
            const lngRad = lng * (Math.PI / 180);

            const qLon = new THREE.Quaternion();
            qLon.setFromAxisAngle(new THREE.Vector3(0, 1, 0), -lngRad - Math.PI / 2);

            const qLat = new THREE.Quaternion();
            qLat.setFromAxisAngle(new THREE.Vector3(1, 0, 0), latRad);

            const targetQ = new THREE.Quaternion().multiplyQuaternions(qLat, qLon);
            targetRotationRef.current.copy(targetQ);
        }

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

        // --- RISK CALCULATION ---
        const volumeRiskPenalty = Math.max(0, (currentPayload - 1000) / 5000) * 0.5;
        const effectiveRisk = Math.min(18, item.risk + volumeRiskPenalty);
        const failureChance = effectiveRisk * 0.05; 
        const roll = Math.random();

        if (roll < failureChance) {
            const severity = Math.random();
            if (severity > 0.85) disruptionType = 'CRITICAL';
            else if (severity > 0.5) disruptionType = 'LOSS';
            else disruptionType = 'DELAY';
        }

        // --- YIELD LOGIC ---
        if (item.type === 'FAB') {
            const baseYield = 0.75; 
            const variance = (Math.random() * 0.2) - 0.1; 
            const actualYield = Math.max(0.1, Math.min(0.99, baseYield + variance));
            const primeUnits = Math.floor(currentPayload * actualYield);
            const binnedUnits = currentPayload - primeUnits;
            yieldLossCost = binnedUnits * 500;
            stepPayload = primeUnits;
            
            // Add Yield event to log
            setTimeout(() => {
                setSimulationLog(prev => [{ 
                    step: index, 
                    time: Date.now(), 
                    title: "Yield Report", 
                    message: `${(actualYield * 100).toFixed(1)}% efficiency. ${binnedUnits.toLocaleString()} units binned.`, 
                    type: "warning" 
                }, ...prev]);
            }, 500);
        }

        // --- PARENT/SHIPPING LOGIC ---
        let parentItem = null;
        if (item.parentId) {
            parentItem = activePath.find(p => p.id === item.parentId);
        }

        if (parentItem) {
            const currPos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.3);
            const parentPos = latLonToVector3(parentItem.locations[0].lat, parentItem.locations[0].lng, 1.3);
            
            distance = currPos.distanceTo(parentPos) * 5000;
            const shipping = item.shipping || {};
            
            legCost = parseCost(shipping.cost) * volumeScalingFactor;
            legTime = parseTimeDays(shipping.time);
            const methodFactor = METHOD_CARBON_FACTOR[shipping.method] ?? 0.4;
            legCarbon = (distance * methodFactor) * volumeScalingFactor;
        }

        if (disruptionType === 'LOSS') { penaltyCost = legCost * 0.6; penaltyTime = 2; }
        if (disruptionType === 'DELAY') { penaltyTime = Math.ceil(Math.random() * 4) + 1; }

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
        
        // UPDATED: Now includes totalYieldLoss in the history object
        setMetricsHistory(history => {
            if (history.length > 0 && history[history.length - 1].step === index) return history;
            
            const newEntry = { 
                step: index, 
                name: item.name, 
                totalCost: newMetrics.totalCost, 
                totalTime: newMetrics.totalTime, 
                totalDistance: newMetrics.totalDistance, 
                totalCarbon: newMetrics.totalCarbon,
                totalYieldLoss: newMetrics.totalYieldLoss // <--- ADD THIS LINE
            };
            
            return index === 0 ? [newEntry] : [...history, newEntry];
        });

        setTimeout(() => {
            // Get specific risk reason
            const riskCategory = SPECIFIC_RISKS[item.type] || SPECIFIC_RISKS.DEFAULT;
            let logEntry = null;

            if (disruptionType === 'CRITICAL') {
                setNodeStatuses(prev => {
                    const newStatuses = { ...prev, [item.id]: 'error' };
                    for (let i = index + 1; i < activePath.length; i++) newStatuses[activePath[i].id] = 'blocked';
                    return newStatuses;
                });
                const reason = riskCategory.critical[Math.floor(Math.random() * riskCategory.critical.length)];
                logEntry = { step: index, time: Date.now(), title: `CRITICAL STOPPAGE`, message: `${reason} at ${item.name}`, type: "danger" };
                setSimulationLog(prev => [logEntry, ...prev]);
                setIsSimulating(false);
                setSimulationStatus('failed');
            } else if (disruptionType === 'LOSS') {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'warning' }));
                const reason = riskCategory.warning[Math.floor(Math.random() * riskCategory.warning.length)];
                logEntry = { step: index, time: Date.now(), title: `Shipment Loss`, message: `${reason} at ${item.name}`, type: "warning" };
                setSimulationLog(prev => [logEntry, ...prev]);
                setTimeout(() => runSimulationStep(index + 1, stepPayload), 2500);
            } else if (disruptionType === 'DELAY') {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'warning' }));
                const reason = riskCategory.warning[Math.floor(Math.random() * riskCategory.warning.length)];
                logEntry = { step: index, time: Date.now(), title: `Capacity Delay`, message: `${reason} (+${penaltyTime}d)`, type: "warning" };
                setSimulationLog(prev => [logEntry, ...prev]);
                setTimeout(() => runSimulationStep(index + 1, stepPayload), 2000);
            } else {
                setNodeStatuses(prev => ({ ...prev, [item.id]: 'success' }));
                if (item.type !== 'FAB' && index % 2 === 0) { // Log success occasionally to not spam
                     logEntry = { step: index, time: Date.now(), title: "Operation Successful", message: `${item.name} completed successfully.`, type: "success" };
                     setSimulationLog(prev => [logEntry, ...prev]);
                }
                setTimeout(() => runSimulationStep(index + 1, stepPayload), 1500);
            }
        }, 1000);

    }, [activePath]); 

    const startSimulation = useCallback(() => {
        if (isSimulating && simulationStatus === 'running') return;
        setIsSimulating(true);
        setSimulationStatus('running');
        setLivePayload(gpuCount);
        setSimulationLog([{ time: Date.now(), title: "Simulation Started", message: `Initiating sequence for ${gpuCount.toLocaleString()} units.`, type: "neutral" }]);
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
            currentRotationRef.current.setFromEuler(globeRef.current.rotation);
            targetRotationRef.current.copy(currentRotationRef.current);
            previousMouseRef.current = { x: e.clientX, y: e.clientY };
        };
        const handleMouseUp = () => { isDraggingRef.current = false; };
        const canvas = renderer.domElement;
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        
        currentRotationRef.current.setFromEuler(globe.rotation);
        targetRotationRef.current.copy(currentRotationRef.current);

        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);
            if (globeRef.current) {
                if (!isDraggingRef.current) {
                    currentRotationRef.current.slerp(targetRotationRef.current, 0.05); 
                    globeRef.current.setRotationFromQuaternion(currentRotationRef.current);
                }
            }
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

            const markerId = `marker-${item.id}`;
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

            if (item.parentId && (index <= currentStepIndex + 1)) {
                const parentItem = activePath.find(p => p.id === item.parentId);
                if (parentItem) {
                    const legId = `line-${item.id}-to-${parentItem.id}`;
                    if (!drawnLinesRef.current.has(legId)) {
                        const startPos = latLonToVector3(item.locations[0].lat, item.locations[0].lng, 1.32);
                        const endPos = latLonToVector3(parentItem.locations[0].lat, parentItem.locations[0].lng, 1.32);
                        const isCurrLeg = index === currentStepIndex; 
                        const color = isCurrLeg ? 0x3b82f6 : 0x22c55e;
                        const arc = createArcLine(startPos, endPos, new THREE.Color(color), isCurrLeg ? 1 : 0.6, isCurrLeg);
                        arc.userData = { id: legId };
                        arcs.add(arc);
                        drawnLinesRef.current.add(legId);
                        if (isCurrLeg) animatingObjectsRef.current.push(arc);
                    } else {
                         const existingArc = arcs.children.find(c => c.userData.id === legId);
                         if (existingArc && index < currentStepIndex) {
                             existingArc.material.color.setHex(0x22c55e); 
                             existingArc.material.opacity = 0.6;
                         }
                    }
                }
            }
        });
    }, [activePath, nodeStatuses, currentStepIndex, sceneReady]);

    const currentRiskLevel = gpuCount < 10000 ? "Low" : gpuCount < 50000 ? "Medium" : "High";
    const riskColor = currentRiskLevel === "Low" ? "text-emerald-400 border-emerald-500/50 bg-emerald-500/10" : currentRiskLevel === "Medium" ? "text-yellow-400 border-yellow-500/50 bg-yellow-500/10" : "text-red-400 border-red-500/50 bg-red-500/10";

    // --- CALCULATE LIVE METRICS ---
    const currentLiveUnits = gpuCount - metrics.totalYieldLoss;
    const currentYieldRate = ((currentLiveUnits / gpuCount) * 100).toFixed(1);
    const unitCost = currentLiveUnits > 0 ? (metrics.totalCost / currentLiveUnits).toFixed(2) : 0;
    const totalDays = metrics.totalTime.toFixed(1);

    return (
        <div className="fixed inset-0 w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
            <div ref={mountRef} className="absolute inset-0 w-full h-full" />

            {/* HEADER */}
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Impact Analysis</h1>
                <p className="text-blue-200/60 text-sm font-medium mt-1">Simulating probability-based supply chain disruptions.</p>
            </div>

            {/* CONTROLS & EVENT LOG */}
            <div className="absolute top-6 right-6 z-10 flex flex-col items-end gap-4 pointer-events-auto h-[calc(100vh-48px)]">
                {/* 1. Simulation Control Box */}
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
                            <button onClick={startSimulation} disabled={simulationStatus === 'running'} className={`w-full py-2 rounded-lg font-bold text-xs ${simulationStatus === 'running' ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-red-600 text-white'}`}>{simulationStatus === 'running' ? '⚙️ Running...' : '↻ Retry'}</button>
                        </>
                    )}
                </div>

                {/* 2. Live Event Feed Box */}
                <div className={`bg-slate-800/90 backdrop-blur border border-slate-600 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 ${isSimulating ? 'w-64 h-64' : 'w-80 h-48'}`}>
                    <div className="bg-slate-900/50 p-3 border-b border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-400 uppercase gap-2 flex"><span>📡</span> Live Feed</span>
                        <span className="text-[10px] text-gray-500">{simulationLog.length} Events</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
                        {simulationLog.length === 0 ? (
                            <div className="text-center text-gray-600 text-xs py-8 italic">Waiting for simulation data...</div>
                        ) : (
                            simulationLog.map((log, i) => {
                                const style = {
                                    danger: 'bg-red-900/20 border-red-500/30 border-l-red-500',
                                    warning: 'bg-amber-900/20 border-amber-500/30 border-l-amber-500',
                                    success: 'bg-emerald-900/20 border-emerald-500/30 border-l-emerald-500'
                                }[log.type] || 'bg-slate-700/30 border-slate-600 border-l-slate-500';

                                return (
                                    <div key={i} className={`p-2 rounded border border-l-4 text-xs animate-in slide-in-from-right fade-in duration-300 ${style}`}>
                                        <div className="flex justify-between text-[10px] opacity-70 mb-1">
                                            <span>Step {log.step + 1 || '-'}</span>
                                        </div>
                                        <div className="font-bold text-gray-200 mb-0.5">{log.title}</div>
                                        <div className="text-gray-400 leading-tight">{log.message}</div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* --- MINIMAP --- */}
            <MiniSupplyChainDiagram 
                activePath={activePath} 
                currentStepIndex={currentStepIndex}
                nodeStatuses={nodeStatuses}
            />

            {/* METRICS DASHBOARD (Live Updating with Graphs) */}
            {(isSimulating || metrics.totalCost > 0) && (
                <div className="absolute bottom-6 left-6 z-20 pointer-events-auto transition-all duration-300">
                    <div 
                        className={`bg-slate-800/95 backdrop-blur-md border border-slate-600 rounded-xl shadow-2xl transition-all duration-300 ease-in-out ${isMetricsExpanded ? 'w-[600px]' : 'w-72 cursor-pointer hover:border-blue-400 hover:shadow-blue-500/20'}`} 
                        onClick={() => !isMetricsExpanded && setIsMetricsExpanded(true)}
                    >
                        {!isMetricsExpanded ? (
                            // COLLAPSED VIEW
                            <div className="p-4 flex justify-between items-center group">
                                <div className="flex flex-col">
                                    <h3 className="text-white font-bold text-xs flex items-center gap-2">
                                        <span>📊</span> Live Metrics
                                        {isSimulating && <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                                    </h3>
                                    <span className="text-[10px] text-gray-400">Click to expand details</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-emerald-400 font-mono font-bold text-sm">${(metrics.totalCost/1000).toFixed(1)}k</div>
                                    <div className="text-[10px] text-purple-400">{currentYieldRate}% Yield</div>
                                </div>
                            </div>
                        ) : (
                            // EXPANDED VIEW WITH GRAPHS
                            <div className="p-4">
                                <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                        <span>📊</span> Simulation Analytics
                                        {isSimulating && <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded uppercase">Live</span>}
                                    </h3>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setIsMetricsExpanded(false); }} 
                                        className="text-xs text-gray-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded transition-colors"
                                    >
                                        Collapse ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {/* 1. FINANCIALS */}
                                    <div className="bg-slate-900/60 p-3 rounded-lg border border-emerald-500/20 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Total Spent</span>
                                                <span className="text-emerald-500 text-xs">💰</span>
                                            </div>
                                            <div className="text-emerald-400 font-mono font-bold text-lg leading-none">
                                                ${(metrics.totalCost/1000).toFixed(1)}k
                                            </div>
                                        </div>
                                        <Sparkline data={metricsHistory.map(m => m.totalCost)} color="emerald" />
                                    </div>

                                    {/* 2. YIELD / PRODUCTION */}
                                    <div className="bg-slate-900/60 p-3 rounded-lg border border-purple-500/20 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Yield Rate</span>
                                                <span className="text-purple-500 text-xs">📉</span>
                                            </div>
                                            <div className={`font-mono font-bold text-lg leading-none ${Number(currentYieldRate) < 90 ? 'text-purple-400' : 'text-purple-400'}`}>
                                                {currentYieldRate}%
                                            </div>
                                        </div>
                                        {/* We invert yield loss to show Yield Rate dropping, or plot Yield Loss directly. 
                                            Let's plot Yield Loss (accumulating) which goes UP */}
                                        <Sparkline data={metricsHistory.map(m => m.totalYieldLoss)} color="purple" />
                                    </div>

                                    {/* 3. LOGISTICS */}
                                    <div className="bg-slate-900/60 p-3 rounded-lg border border-blue-500/20 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Logistics</span>
                                                <span className="text-blue-500 text-xs">🌍</span>
                                            </div>
                                            <div className="text-blue-400 font-mono font-bold text-lg leading-none">
                                                {(metrics.totalDistance/1000).toFixed(0)}k <span className="text-sm">km</span>
                                            </div>
                                        </div>
                                        <Sparkline data={metricsHistory.map(m => m.totalDistance)} color="blue" />
                                    </div>

                                    {/* 4. SUSTAINABILITY */}
                                    <div className="bg-slate-900/60 p-3 rounded-lg border border-amber-500/20 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Carbon</span>
                                                <span className="text-amber-500 text-xs">☁️</span>
                                            </div>
                                            <div className="text-amber-400 font-mono font-bold text-lg leading-none">
                                                {(metrics.totalCarbon/1000).toFixed(1)}T
                                            </div>
                                        </div>
                                        <Sparkline data={metricsHistory.map(m => m.totalCarbon)} color="amber" />
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