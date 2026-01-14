'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { supplyChainData } from '../data/supplyChainData';
import MiniSupplyChainDiagram from './MiniSupplyChainDiagram';

// *** UTILITY: Animated Arc Line Generator ***
const createArcLine = (startVector, endVector, color, opacity = 0.8) => {
    const distance = startVector.distanceTo(endVector);
    
    const midVector = startVector.clone().add(endVector);
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
    const tubularSegments = 64; 
    const radialSegments = 8;
    const geometry = new THREE.TubeGeometry(curve, tubularSegments, 0.015, radialSegments, false);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity });

    return new THREE.Mesh(geometry, material);
};

const GPUGlobe = ({ levelInfo, onSimulate }) => {
  const mountRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [vendorSelections, setVendorSelections] = useState({});
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentComponentIndex, setCurrentComponentIndex] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Refs for Three.js
  const labelElementsRef = useRef([]);
  const lineElementsRef = useRef([]);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersGroupRef = useRef(null);
  const trailGroupRef = useRef(null);
  const markersDataRef = useRef([]);
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const frameIdRef = useRef(null);

  // Get current component we're selecting for
  const getCurrentComponent = () => {
    if (!levelInfo || !levelInfo.stages) return null;
    const stage = levelInfo.stages[currentStageIndex];
    if (!stage) return null;
    return stage.components[currentComponentIndex];
  };

  // Get vendors for current component
  const getCurrentVendors = () => {
    const component = getCurrentComponent();
    if (!component) return [];
    
    const vendors = supplyChainData[component.id] || [];
    return vendors.map(vendor => ({
      ...vendor,
      componentId: component.id,
      componentName: component.name
    }));
  };

  const currentVendors = getCurrentVendors();
  const currentComponent = getCurrentComponent();

  // Location mapping for vendors (you'll need to add coordinates to your data)
  const getVendorLocation = (vendor) => {
    // Extract location from vendor name - you may need to enhance this
    const locationMap = {
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
      'Austin, TX': { lat: 30.2672, lng: -97.7431 }
    };
    
    return locationMap[vendor.location] || { lat: 0, lng: 0 };
  };

  const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Handle vendor selection
  const handleSelectVendor = (vendor) => {
    const newSelections = {
      ...vendorSelections,
      [currentComponent.id]: vendor
    };
    setVendorSelections(newSelections);
    setSelectedItem(null);

    // Move to next component
    const stage = levelInfo.stages[currentStageIndex];
    if (currentComponentIndex < stage.components.length - 1) {
      setCurrentComponentIndex(currentComponentIndex + 1);
    } else if (currentStageIndex < levelInfo.stages.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
      setCurrentComponentIndex(0);
    } else {
      // All components selected, ready to simulate
      onSimulate(newSelections);
    }
  };

  // Auto-select function
  const handleAutoSelect = (strategy = 'first') => {
    // Start with existing selections
    const selections = { ...vendorSelections };
    
    levelInfo.stages.forEach(stage => {
      stage.components.forEach(component => {
        // Skip if already selected
        if (selections[component.id]) return;
        
        const vendors = supplyChainData[component.id] || [];
        if (vendors.length === 0) return;
        
        let selectedVendor;
        if (strategy === 'first') {
          selectedVendor = vendors[0];
        } else if (strategy === 'cost') {
          selectedVendor = vendors.reduce((min, v) => v.cost < min.cost ? v : min);
        } else if (strategy === 'time') {
          selectedVendor = vendors.reduce((min, v) => v.leadTime < min.leadTime ? v : min);
        } else if (strategy === 'risk') {
          selectedVendor = vendors.reduce((min, v) => v.risk < min.risk ? v : min);
        } else if (strategy === 'random') {
          selectedVendor = vendors[Math.floor(Math.random() * vendors.length)];
        }
        
        selections[component.id] = selectedVendor;
      });
    });
    
    setIsDropdownOpen(false);
    setVendorSelections(selections);
    onSimulate(selections);
  };

  // Reset to beginning
  const handleReset = () => {
    setVendorSelections({});
    setCurrentStageIndex(0);
    setCurrentComponentIndex(0);
    setSelectedItem(null);
  };

  // Go back one component
  const handleGoBack = () => {
    if (currentComponentIndex > 0) {
      setCurrentComponentIndex(currentComponentIndex - 1);
    } else if (currentStageIndex > 0) {
      setCurrentStageIndex(currentStageIndex - 1);
      const prevStage = levelInfo.stages[currentStageIndex - 1];
      setCurrentComponentIndex(prevStage.components.length - 1);
    }
    setSelectedItem(null);
  };

  // Three.js setup
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    // Starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starVertices = [];
    
    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 120;
        const y = (Math.random() - 0.5) * 120;
        const z = (Math.random() - 0.5) * 120;
        if(Math.abs(x) > 2 || Math.abs(y) > 2 || Math.abs(z) > 2) {
            starVertices.push(x, y, z);
        }
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const globeGeometry = new THREE.SphereGeometry(1.3, 64, 64);
    const globeTexture = new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'); 
    const globeMaterial = new THREE.MeshPhongMaterial({ map: globeTexture, shininess: 20 });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const trailGroup = new THREE.Group();
    scene.add(trailGroup);
    trailGroupRef.current = trailGroup;

    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMouseRef.current.x;
      const deltaY = e.clientY - previousMouseRef.current.y;
      
      globe.rotation.x += deltaY * 0.005;
      const upFactor = Math.cos(globe.rotation.x) > 0 ? 1 : -1;
      globe.rotation.y += deltaX * 0.005 * upFactor;
      
      markersGroup.rotation.y = globe.rotation.y;
      markersGroup.rotation.x = globe.rotation.x;
      trailGroup.rotation.y = globe.rotation.y;
      trailGroup.rotation.x = globe.rotation.x;
      
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => isDraggingRef.current = false;

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    const updateLabels = () => {
      scene.updateMatrixWorld();
      
      const visibleLabels = [];
      const width = renderer.domElement.width;
      const height = renderer.domElement.height;
      const widthHalf = width / 2;
      const heightHalf = height / 2;

      markersDataRef.current.forEach((markerData, index) => {
        const labelEl = labelElementsRef.current[index];
        const lineEl = lineElementsRef.current[index];
        if (!labelEl || !lineEl) return;

        const markerWorldPos = new THREE.Vector3();
        markerData.marker.getWorldPosition(markerWorldPos);
        const meshNormal = markerWorldPos.clone().normalize();
        const vecToCamera = camera.position.clone().sub(markerWorldPos).normalize();
        const facingCamera = meshNormal.dot(vecToCamera);
        
        let alpha = facingCamera > 0.2 ? 1 : (facingCamera > -0.2 ? (facingCamera + 0.2) / 0.4 : 0);
        const isVisible = alpha > 0.01;

        if (isVisible) {
          const markerScreenPos = markerWorldPos.clone().project(camera);
          const labelWorldPos = markerData.labelPosition.clone();
          labelWorldPos.applyMatrix4(markersGroup.matrixWorld);
          const labelScreenPos = labelWorldPos.clone().project(camera);

          const anchorX = (markerScreenPos.x * widthHalf) + widthHalf;
          const anchorY = -(markerScreenPos.y * heightHalf) + heightHalf;
          const idealX = (labelScreenPos.x * widthHalf) + widthHalf;
          const idealY = -(labelScreenPos.y * heightHalf) + heightHalf;

          visibleLabels.push({
            index, element: labelEl, lineElement: lineEl,
            anchorX, anchorY, x: idealX, y: idealY,
            z: labelScreenPos.z, opacity: alpha 
          });
        } else {
          labelEl.style.display = 'none';
          lineEl.style.display = 'none';
        }
      });

      visibleLabels.sort((a, b) => a.y - b.y);

      const BOX_WIDTH = 210; 
      const BOX_HEIGHT = 85;

      for(let i = 0; i < visibleLabels.length; i++) {
        const current = visibleLabels[i];
        for(let j = i + 1; j < visibleLabels.length; j++) {
            const next = visibleLabels[j];
            if (Math.abs(current.x - next.x) < BOX_WIDTH && next.y < current.y + BOX_HEIGHT) {
                next.y = current.y + BOX_HEIGHT + 5; 
            }
        }
      }

      visibleLabels.forEach(l => {
        l.element.style.display = 'block';
        l.element.style.transform = `translate(-50%, -50%) translate(${l.x}px, ${l.y}px)`;
        l.element.style.zIndex = Math.floor((1 - l.z) * 1000);
        l.element.style.opacity = l.opacity;
        
        l.lineElement.style.display = 'block';
        l.lineElement.style.opacity = l.opacity * 0.6; 

        const dx = l.x - l.anchorX;
        const dy = l.y - l.anchorY;
        const length = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        l.lineElement.style.width = `${length}px`;
        l.lineElement.style.transform = `translate(${l.anchorX}px, ${l.anchorY}px) rotate(${angle}deg)`;
      });
    };

    let autoRotate = true;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (autoRotate && !isDraggingRef.current) {
        globe.rotation.y += 0.001;
        markersGroup.rotation.y = globe.rotation.y;
        stars.rotation.y += 0.0002;
        trailGroup.rotation.y = globe.rotation.y;
      }
      renderer.render(scene, camera);
      updateLabels();
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
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      window.removeEventListener('resize', handleResize);
      if(renderer.domElement) {
          renderer.domElement.removeEventListener('mousedown', handleMouseDown);
          renderer.domElement.removeEventListener('mousemove', handleMouseMove);
          renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      }
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update markers for current vendors
  useEffect(() => {
    if (!markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;
    while (markersGroup.children.length > 0) markersGroup.remove(markersGroup.children[0]);
    markersDataRef.current = [];

    const getRiskColor = (risk) => {
        if (risk >= 8) return 0xff3333;
        if (risk >= 6) return 0xff6b35;
        if (risk >= 4) return 0xffaa00;
        return 0x44ff44;
    };

    currentVendors.forEach((vendor) => {
      const loc = getVendorLocation(vendor);
      const position = latLonToVector3(loc.lat, loc.lng, 1.3);
      const color = getRiskColor(vendor.risk);
      
      const markerGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ color, emissive: color, emissiveIntensity: 0.5 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      
      const lineEnd = position.clone().normalize().multiplyScalar(2.2);
      markersGroup.add(marker);
      
      markersDataRef.current.push({ 
        item: vendor, 
        marker, 
        position: position.clone(), 
        labelPosition: lineEnd 
      });
    });
  }, [currentVendors]);

  const totalComponents = levelInfo.stages.reduce((sum, stage) => sum + stage.components.length, 0);
  const selectedCount = Object.keys(vendorSelections).length;

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* HUD Box */}
      <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-md border border-slate-600 p-5 rounded-xl shadow-2xl w-80 pointer-events-auto z-[2000]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Stage {currentStageIndex + 1}: {levelInfo.stages[currentStageIndex]?.name}</h3>
            <div className="text-white font-bold text-xl leading-tight">
              <span className="text-blue-400">{currentComponent?.name}</span>
            </div>
            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {currentVendors.length} Vendors Available
            </div>
          </div>
          <div className="bg-slate-700/50 p-2 rounded-lg text-2xl">
            🏭
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress</span>
            <span>{selectedCount}/{totalComponents} components</span>
          </div>
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(selectedCount / totalComponents) * 100}%` }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={handleGoBack}
            disabled={selectedCount === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedCount === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500'
            }`}
          >
            ← Back
          </button>
          
          <button
            onClick={handleReset}
            disabled={selectedCount === 0}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              selectedCount === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Auto-Complete Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-slate-700 hover:bg-slate-600 text-blue-300 font-semibold py-2.5 px-4 rounded-lg border border-slate-600 transition-all flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">✨ Auto-Complete</span>
            <span className={`text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl overflow-hidden z-50">
                <button onClick={() => handleAutoSelect('cost')} className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-slate-700 transition-colors flex items-center gap-2 border-b border-slate-700/50">
                    💰 Lowest Cost
                </button>
                <button onClick={() => handleAutoSelect('time')} className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-slate-700 transition-colors flex items-center gap-2 border-b border-slate-700/50">
                    ⚡ Fastest Time
                </button>
                <button onClick={() => handleAutoSelect('risk')} className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-slate-700 transition-colors flex items-center gap-2 border-b border-slate-700/50">
                    🛡️ Lowest Risk
                </button>
                <button onClick={() => handleAutoSelect('random')} className="w-full text-left px-4 py-2.5 text-sm text-gray-200 hover:bg-slate-700 transition-colors flex items-center gap-2">
                    🎲 Random
                </button>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Labels */}
      {currentVendors.map((vendor, index) => {
        const riskColor = vendor.risk >= 8 ? 'border-red-500' : 
                         vendor.risk >= 6 ? 'border-orange-500' : 
                         vendor.risk >= 4 ? 'border-yellow-500' : 'border-green-500';
        
        const lineColor = vendor.risk >= 8 ? '#ef4444' : 
                         vendor.risk >= 6 ? '#f97316' : 
                         vendor.risk >= 4 ? '#eab308' : '#22c55e';

        return (
          <React.Fragment key={vendor.id || index}>
            <div
                ref={(el) => (lineElementsRef.current[index] = el)}
                className="absolute origin-left pointer-events-none transition-opacity duration-75"
                style={{ display: 'none', top: 0, left: 0, height: '1px', backgroundColor: lineColor }}
            />

            <div
                ref={(el) => (labelElementsRef.current[index] = el)}
                className="absolute pointer-events-auto cursor-pointer will-change-transform transition-opacity duration-75"
                style={{ display: 'none', top: 0, left: 0 }}
                onClick={() => setSelectedItem(vendor)}
            >
                <div className={`w-48 bg-gradient-to-br from-slate-800 to-slate-900 border-2 ${riskColor} text-white px-3 py-2 rounded-lg shadow-xl hover:shadow-2xl hover:scale-110 transition-transform`}>
                    <div className="flex items-center gap-3">
                        <div className="overflow-hidden">
                            <div className="text-xs font-bold text-white whitespace-nowrap truncate" title={vendor.name}>
                                {vendor.name}
                            </div>
                            <div className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                                Risk: {vendor.risk.toFixed(1)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Vendor Info Panel */}
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-[3000]">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto pointer-events-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedItem.name}</h2>
                <p className="text-gray-400 text-sm">{selectedItem.location}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="mb-4 p-4 bg-slate-700 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Risk</div>
                  <div className={`text-lg font-bold ${
                    selectedItem.risk >= 8 ? 'text-red-400' :
                    selectedItem.risk >= 6 ? 'text-orange-400' :
                    selectedItem.risk >= 4 ? 'text-yellow-400' : 'text-green-400'
                  }`}>{selectedItem.risk.toFixed(1)}/10</div>
                </div>
                <div>
                  <div className="text-gray-400">Cost</div>
                  <div className="text-white font-medium">${selectedItem.cost}</div>
                </div>
                <div>
                  <div className="text-gray-400">Lead Time</div>
                  <div className="text-white font-medium">{selectedItem.leadTime} days</div>
                </div>
              </div>
            </div>

            <div className="mb-4 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Description</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedItem.description}</p>
            </div>

            {selectedItem.pros && selectedItem.pros.length > 0 && (
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Advantages</h3>
                <ul className="space-y-1">
                  {selectedItem.pros.map((pro, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedItem.cons && selectedItem.cons.length > 0 && (
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Disadvantages</h3>
                <ul className="space-y-1">
                  {selectedItem.cons.map((con, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                      <span className="text-red-400 mt-0.5">✗</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => handleSelectVendor(selectedItem)}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg shadow-lg border border-green-400 transition-transform hover:scale-105 active:scale-95"
            >
              ✅ Select This Vendor
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-slate-800 bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm max-w-xs pointer-events-none shadow-lg z-[2000]">
        <p className="font-semibold mb-1">🏭 Supply Chain Builder</p>
        <p className="text-gray-300 mb-2">Select vendors for each component</p>
        <p className="text-blue-300">Click markers to view vendor details</p>
      </div>

      <MiniSupplyChainDiagram 
        vendorSelections={vendorSelections}
        currentComponent={currentComponent}
      />
    </div>
  );
};

export default GPUGlobe;