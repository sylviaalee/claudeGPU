'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// Assuming your data file is located here as per previous instruction
import { supplyChainData } from '../data/supplyChainData';

const GPUGlobe = () => {
  const mountRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]); // Empty array = Start at GPU level
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);
  
  // Refs for DOM elements (Direct manipulation for performance)
  const labelElementsRef = useRef([]);

  // Refs for Three.js objects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersGroupRef = useRef(null);
  const markersDataRef = useRef([]);
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const frameIdRef = useRef(null);

  // 1. Logic to determine which items to show
  const getCurrentItems = () => {
    // If no history, show the top level (GPUs)
    if (breadcrumb.length === 0) {
      // Safety check for data
      const gpus = supplyChainData?.gpus || [];
      return gpus.map(item => ({
        ...item,
        lat: item.locations[0].lat,
        lon: item.locations[0].lng,
        location: item.locations[0].name,
        emoji: item.image,
        category: 'gpus'
      }));
    } else {
      // Get the last selected item's "next" connections
      const lastSelection = breadcrumb[breadcrumb.length - 1];
      const nextIds = lastSelection.next || [];
      
      // Determine which category to search in
      let items = [];
      const categories = ['packaging', 'eds', 'wiring', 'deposition', 'etching', 'photolithography', 'oxidation', 'wafer', 'design', 'raw'];
      
      for (const category of categories) {
        const categoryItems = supplyChainData[category] || [];
        const matchingItems = categoryItems.filter(item => nextIds.includes(item.id));
        items = items.concat(matchingItems.map(item => ({
          ...item,
          lat: item.locations[0].lat,
          lon: item.locations[0].lng,
          location: item.locations[0].name,
          emoji: item.image,
          category: category
        })));
      }
      
      return items;
    }
  };

  const currentItems = getCurrentItems();

  const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  };

  const getRiskLabel = (risk) => {
    if (risk >= 8) return 'High';
    if (risk >= 6) return 'Medium-High';
    if (risk >= 4) return 'Medium';
    return 'Low';
  };

  const handleConfirmSelection = () => {
    if (pendingSelection && pendingSelection.next && pendingSelection.next.length > 0) {
      setBreadcrumb([...breadcrumb, pendingSelection]);
      setShowConfirmDialog(false);
      setSelectedItem(null);
      setPendingSelection(null);
    }
  };

  const handleGoBack = () => {
    if (breadcrumb.length > 0) {
      const newBreadcrumb = breadcrumb.slice(0, -1);
      setBreadcrumb(newBreadcrumb);
      setSelectedItem(null);
    }
  };

  const handleReset = () => {
    setBreadcrumb([]);
    setSelectedItem(null);
    setShowConfirmDialog(false);
    setPendingSelection(null);
  };

  // --- THREE.JS SETUP ---
  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    // Globe
    const globeGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const globeTexture = new THREE.TextureLoader().load(
      'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
    );
    const globeMaterial = new THREE.MeshPhongMaterial({
      map: globeTexture,
      shininess: 20
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Create a group for all markers
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Mouse controls
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      
      const deltaX = e.clientX - previousMouseRef.current.x;
      const deltaY = e.clientY - previousMouseRef.current.y;
      
      globe.rotation.y += deltaX * 0.005;
      globe.rotation.x += deltaY * 0.005;
      
      markersGroup.rotation.y = globe.rotation.y;
      markersGroup.rotation.x = globe.rotation.x;
      
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    // --- DIRECT DOM UPDATE FUNCTION ---
    const updateLabels = () => {
      scene.updateMatrixWorld();

      markersDataRef.current.forEach((markerData, index) => {
        const labelEl = labelElementsRef.current[index];
        if (!labelEl) return;

        const labelWorldPos = markerData.labelPosition.clone();
        labelWorldPos.applyMatrix4(markersGroup.matrixWorld);
        
        const vector = labelWorldPos.clone();
        vector.project(camera);
        
        const widthHalf = renderer.domElement.width / 2;
        const heightHalf = renderer.domElement.height / 2;
        
        const x = (vector.x * widthHalf) + widthHalf;
        const y = -(vector.y * heightHalf) + heightHalf;
        
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const toLabel = labelWorldPos.clone().sub(camera.position).normalize();
        const dotProduct = toLabel.dot(cameraDirection);
        const isVisible = dotProduct > 0 && vector.z < 1;

        if (isVisible) {
          labelEl.style.display = 'block';
          labelEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
          labelEl.style.zIndex = Math.floor((1 - vector.z) * 1000);
        } else {
          labelEl.style.display = 'none';
        }
      });
    };

    // Animation loop
    let autoRotate = true;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (autoRotate && !isDraggingRef.current) {
        globe.rotation.y += 0.001;
        markersGroup.rotation.y = globe.rotation.y;
      }
      
      renderer.render(scene, camera);
      updateLabels(); // Update labels every frame
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

  // Update Three.js Markers when currentItems changes
  useEffect(() => {
    if (!markersGroupRef.current) return;

    const markersGroup = markersGroupRef.current;
    
    // Clear existing markers
    while (markersGroup.children.length > 0) {
      markersGroup.remove(markersGroup.children[0]);
    }
    markersDataRef.current = [];

    // Helper for colors
    const getRiskColor = (risk) => {
        if (risk >= 8) return 0xff3333;
        if (risk >= 6) return 0xff6b35;
        if (risk >= 4) return 0xffaa00;
        return 0x44ff44;
    };

    // Add new markers
    currentItems.forEach((item) => {
      const position = latLonToVector3(item.lat, item.lon, 1.5);
      const color = getRiskColor(item.risk);
      
      const markerGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 0.5
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      
      const lineEnd = position.clone().normalize().multiplyScalar(2.2);
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        position,
        lineEnd
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.6
      });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      
      markersGroup.add(marker);
      markersGroup.add(line);
      
      markersDataRef.current.push({
        item,
        marker,
        line,
        position: position.clone(),
        labelPosition: lineEnd
      });
    });

  }, [currentItems]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* ----------------------------------------------------
        NAVIGATION HUD (Heads Up Display)
        Always visible in top right.
        ----------------------------------------------------
      */}
      <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-md border border-slate-600 p-5 rounded-xl shadow-2xl w-80 pointer-events-auto z-40 transition-all">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Current Level</h3>
            <div className="text-white font-bold text-xl leading-tight">
              {breadcrumb.length === 0 
                ? <span className="text-orange-400">Global Market</span> 
                : <span className="text-orange-400">{breadcrumb[breadcrumb.length - 1].name}</span>
              }
            </div>
            {breadcrumb.length > 0 && (
               <div className="text-xs text-gray-400 mt-1">Supply Chain Detail View</div>
            )}
          </div>
          <div className="bg-slate-700/50 p-2 rounded-lg text-2xl">
            {breadcrumb.length === 0 ? '🌍' : breadcrumb[breadcrumb.length - 1].emoji}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleGoBack}
            disabled={breadcrumb.length === 0}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              breadcrumb.length === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500 hover:border-slate-400 shadow-lg'
            }`}
          >
            <span>←</span> Back
          </button>
          
          <button
            onClick={handleReset}
            disabled={breadcrumb.length === 0}
            className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              breadcrumb.length === 0
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg border border-orange-500 hover:border-orange-400'
            }`}
          >
            Reset
          </button>
        </div>

        {/* Optional: Breadcrumb trail dots */}
        <div className="mt-4 flex gap-1 justify-center">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${breadcrumb.length === 0 ? 'w-6 bg-orange-500' : 'w-2 bg-slate-600'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-300 ${breadcrumb.length === 1 ? 'w-6 bg-orange-500' : 'w-2 bg-slate-600'}`}></div>
            <div className={`h-1.5 rounded-full transition-all duration-300 ${breadcrumb.length >= 2 ? 'w-6 bg-orange-500' : 'w-2 bg-slate-600'}`}></div>
        </div>
      </div>

      {/* Item Labels (Mapped directly to DOM elements) */}
      {currentItems.map((item, index) => {
        const riskColor = item.risk >= 8 ? 'border-red-500' : 
                         item.risk >= 6 ? 'border-orange-500' : 
                         item.risk >= 4 ? 'border-yellow-500' : 'border-green-500';
        
        return (
          <div
            key={item.id || index}
            ref={(el) => (labelElementsRef.current[index] = el)}
            className="absolute pointer-events-auto cursor-pointer will-change-transform"
            style={{
              display: 'none', // Hidden until positioned by Three.js
              top: 0, 
              left: 0
            }}
            onClick={() => setSelectedItem(item)}
          >
            <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border-2 ${riskColor} text-white px-3 py-2 rounded-lg shadow-xl hover:shadow-2xl hover:scale-110 transition-transform`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-white whitespace-nowrap">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    Risk: {item.risk ? item.risk.toFixed(1) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Info Panel */}
      {selectedItem && !showConfirmDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pointer-events-auto z-50" onClick={() => setSelectedItem(null)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedItem.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedItem.name}</h2>
                  <p className="text-gray-400 text-sm">{selectedItem.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            {/* Overall Risk Score */}
            <div className="mb-4 p-4 bg-slate-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Overall Risk Score</span>
                <span className={`text-2xl font-bold ${
                  selectedItem.risk >= 8 ? 'text-red-400' :
                  selectedItem.risk >= 6 ? 'text-orange-400' :
                  selectedItem.risk >= 4 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {selectedItem.risk.toFixed(1)} / 10
                </span>
              </div>
              <div className="text-sm text-gray-300 mt-2">
                {getRiskLabel(selectedItem.risk)} Risk
              </div>
            </div>

            {/* Shipping Info */}
            {selectedItem.shipping && (
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Shipping Details</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400">Time</div>
                    <div className="text-white font-medium">{selectedItem.shipping.time}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Cost</div>
                    <div className="text-white font-medium">{selectedItem.shipping.cost}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Method</div>
                    <div className="text-white font-medium">{selectedItem.shipping.method}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Analysis */}
            <div className="mb-4 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-400 mb-2">Risk Analysis</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedItem.riskAnalysis}</p>
            </div>
            
            {/* Detailed Risk Scores */}
            {selectedItem.riskScores && (
            <div className="space-y-2 mb-4">
              <h3 className="text-lg font-semibold text-orange-400 mb-2">Detailed Risk Breakdown</h3>
              
              {Object.entries(selectedItem.riskScores).map(([key, value]) => (
                <div key={key} className="bg-slate-700 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium capitalize text-sm">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-slate-600 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            value >= 8 ? 'bg-red-500' :
                            value >= 6 ? 'bg-orange-500' :
                            value >= 4 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${value * 10}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold w-8 text-right ${
                        value >= 8 ? 'text-red-400' :
                        value >= 6 ? 'text-orange-400' :
                        value >= 4 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {value}/10
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Drill Down Button */}
            {selectedItem.next && selectedItem.next.length > 0 && (
              <button
                onClick={() => {
                  setPendingSelection(selectedItem);
                  setShowConfirmDialog(true);
                }}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Explore Supply Chain → ({selectedItem.next.length} suppliers)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog && pendingSelection && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 pointer-events-auto z-50">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Explore Supply Chain?</h3>
            <p className="text-gray-300 mb-6">
              This will show the {pendingSelection.next.length} supplier(s) for <span className="text-orange-400 font-semibold">{pendingSelection.emoji} {pendingSelection.name}</span> and hide other options.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setPendingSelection(null);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-slate-800 bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm max-w-xs pointer-events-none shadow-lg z-40">
        <p className="font-semibold mb-1">🌍 GPU Supply Chain Explorer</p>
        <p className="text-gray-300 mb-2">Drag to rotate • Click markers for details</p>
        {breadcrumb.length === 0 && (
          <p className="text-orange-400 text-xs">Click any GPU to explore its supply chain</p>
        )}
        <div className="mt-2 flex gap-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span>Low</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full"></span>Med</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-orange-500 rounded-full"></span>High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span>Critical</span>
        </div>
      </div>
    </div>
  );
};

export default GPUGlobe;