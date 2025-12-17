'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// Assuming supplyChainData is structured like: { gpus: [], components: [], materials: [], ... }
import { supplyChainData } from '../data/supplyChainData';

const GPUGlobe = () => {
  const mountRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]); 
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);
  
  const data = supplyChainData;

  // Refs
  const labelElementsRef = useRef([]);
  const lineElementsRef = useRef([]); // Refs for the 2D SVG lines
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersGroupRef = useRef(null);
  const breadcrumbLinesGroupRef = useRef(null);
  // Store all marker data, including historical items
  const allMarkersDataRef = useRef([]); 
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const frameIdRef = useRef(null);

  // --- DATA PROCESSING ---
  const getCurrentItems = () => {
    const isValid = (item) => item && item.locations && item.locations[0] && typeof item.locations[0].lat === 'number';
    if (!data) return { current: [], historical: [] };

    const allCategories = Object.keys(data);
    const categoriesWithoutGpus = allCategories.filter(k => k !== 'gpus'); 
    
    // Function to process an item into a standardized marker format
    const processItem = (item, category, isHistorical = false) => {
        const jitterX = (item.name.charCodeAt(0) % 10 - 5) * 0.05; 
        const jitterY = (item.name.charCodeAt(1) % 10 - 5) * 0.05;
        
        return {
            ...item,
            lat: item.locations[0].lat + jitterY,
            lon: item.locations[0].lng + jitterX,
            location: item.locations[0].name,
            emoji: item.image,
            category: category,
            isHistorical: isHistorical, // NEW: Flag to distinguish historical markers
        };
    };

    let currentLevelItems = [];
    let historicalItems = [];

    // 1. Determine Current Level Items
    if (breadcrumb.length === 0) {
      // Level 0: GPUs
      currentLevelItems = (data.gpus || []).filter(isValid).map(item => processItem(item, 'gpus', false));
    } else {
      // Level N > 0: Components/Materials for the last selected item
      const lastSelection = breadcrumb[breadcrumb.length - 1];
      const nextIds = lastSelection.next || [];
      
      for (const category of categoriesWithoutGpus) {
        const categoryItems = data[category] || [];
        const matchingItems = categoryItems.filter(item => nextIds.includes(item.id));
        currentLevelItems = currentLevelItems.concat(matchingItems.filter(isValid).map(item => processItem(item, category, false)));
      }

      // 2. Determine Historical Items (all items in the breadcrumb)
      historicalItems = breadcrumb.filter(isValid).map(item => processItem(item, item.category || 'gpus', true));
    }

    // NEW: We return an object with separate lists
    return { current: currentLevelItems, historical: historicalItems };
  };

  const { current: currentItems, historical: historicalItems } = getCurrentItems();

  // NEW: Combine all items for rendering the markers on the globe
  const allItemsForRendering = [...currentItems, ...historicalItems];

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
      // Check if the item is already in the breadcrumb (only by ID, to avoid duplicate steps)
      const isAlreadyInBreadcrumb = breadcrumb.some(item => item.id === pendingSelection.id);
      
      if (!isAlreadyInBreadcrumb) {
        // Add the selected item (which is a current level item) to the breadcrumb
        setBreadcrumb([...breadcrumb, pendingSelection]);
      } else {
        // Should not happen with current UI flow, but good for robustness
        console.warn("Item already in breadcrumb, skipping addition.");
      }
      
      setShowConfirmDialog(false);
      setSelectedItem(null);
      setPendingSelection(null);
    }
  };

  const handleGoBack = () => {
    if (breadcrumb.length > 0) {
      setBreadcrumb(breadcrumb.slice(0, -1));
      setSelectedItem(null);
    }
  };

  const handleReset = () => {
    setBreadcrumb([]);
    setSelectedItem(null);
    setShowConfirmDialog(false);
    setPendingSelection(null);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // ... (THREE.js Scene Setup - No Change)
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

    const globeGeometry = new THREE.SphereGeometry(1.5, 64, 64);
    const globeTexture = new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');
    const globeMaterial = new THREE.MeshPhongMaterial({ map: globeTexture, shininess: 20 });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    const breadcrumbLinesGroup = new THREE.Group();
    scene.add(breadcrumbLinesGroup);
    breadcrumbLinesGroupRef.current = breadcrumbLinesGroup;

    // Controls
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
      if (breadcrumbLinesGroupRef.current) {
        breadcrumbLinesGroupRef.current.rotation.y = globe.rotation.y;
        breadcrumbLinesGroupRef.current.rotation.x = globe.rotation.x;
      }
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => isDraggingRef.current = false;

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    // --- COLLISION AVOIDANCE & LINE UPDATE LOOP ---
    const updateLabels = () => {
      scene.updateMatrixWorld();
      
      const visibleLabels = [];
      const width = renderer.domElement.width;
      const height = renderer.domElement.height;
      const widthHalf = width / 2;
      const heightHalf = height / 2;

      // 1. Calculate ideal positions (anchor points)
      // IMPORTANT: Only iterate over CURRENT items (indices 0 to currentItems.length - 1)
      const currentMarkersData = allMarkersDataRef.current.slice(0, currentItems.length);

      currentMarkersData.forEach((markerData, index) => {
        const labelEl = labelElementsRef.current[index];
        const lineEl = lineElementsRef.current[index];
        
        // Skip historical markers which do not have corresponding label/line elements
        if (markerData.item.isHistorical || !labelEl || !lineEl) return;

        // Get the position of the marker on the globe (the dot)
        const markerWorldPos = new THREE.Vector3();
        markerData.marker.getWorldPosition(markerWorldPos);
        const markerScreenPos = markerWorldPos.clone().project(camera);

        // Get the ideal position for the label
        const labelWorldPos = markerData.labelPosition.clone();
        labelWorldPos.applyMatrix4(markersGroup.matrixWorld);
        const labelScreenPos = labelWorldPos.clone().project(camera);
        
        // Check visibility
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const toLabel = labelWorldPos.clone().sub(camera.position).normalize();
        const dotProduct = toLabel.dot(cameraDirection);
        const isVisible = dotProduct > 0 && labelScreenPos.z < 1;

        if (isVisible) {
          // Convert to pixels
          const anchorX = (markerScreenPos.x * widthHalf) + widthHalf;
          const anchorY = -(markerScreenPos.y * heightHalf) + heightHalf;
          
          const idealX = (labelScreenPos.x * widthHalf) + widthHalf;
          const idealY = -(labelScreenPos.y * heightHalf) + heightHalf;

          visibleLabels.push({
            index,
            element: labelEl,
            lineElement: lineEl,
            anchorX, // Where the line starts (dot on globe)
            anchorY,
            x: idealX, // Where the box wants to be
            y: idealY,
            z: labelScreenPos.z,
            w: 180, 
            h: 60  
          });
        } else {
          labelEl.style.display = 'none';
          lineEl.style.display = 'none';
        }
      });

      // 2. Resolve Collisions (Box vs Box)
      const iterations = 5; 
      for(let k=0; k<iterations; k++) {
        for(let i=0; i<visibleLabels.length; i++) {
          for(let j=i+1; j<visibleLabels.length; j++) {
            const l1 = visibleLabels[i];
            const l2 = visibleLabels[j];

            const dx = l1.x - l2.x;
            const dy = l1.y - l2.y;
            
            const minDistX = (l1.w + l2.w) / 2 * 0.85; 
            const minDistY = (l1.h + l2.h) / 2 * 1.1;

            if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
               const force = 0.5;
               const overlapY = minDistY - Math.abs(dy);
               
               if (l1.y < l2.y) {
                 l1.y -= overlapY * force;
                 l2.y += overlapY * force;
               } else {
                 l1.y += overlapY * force;
                 l2.y -= overlapY * force;
               }
            }
          }
        }
      }

      // 3. Apply final positions & Update Lines
      visibleLabels.forEach(l => {
        // Update Box Position
        l.element.style.display = 'block';
        l.element.style.transform = `translate(-50%, -50%) translate(${l.x}px, ${l.y}px)`;
        l.element.style.zIndex = Math.floor((1 - l.z) * 1000);

        // Update SVG Line (From Globe Dot -> To Box Center)
        const dx = l.x - l.anchorX;
        const dy = l.y - l.anchorY;
        const length = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        l.lineElement.style.display = 'block';
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
        if (breadcrumbLinesGroupRef.current) {
          breadcrumbLinesGroupRef.current.rotation.y = globe.rotation.y;
        }
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
  }, [currentItems.length]); // Re-run effect when the number of CURRENT items changes

  // Update Markers
  useEffect(() => {
    if (!markersGroupRef.current) return;
    const markersGroup = markersGroupRef.current;
    while (markersGroup.children.length > 0) markersGroup.remove(markersGroup.children[0]);
    allMarkersDataRef.current = []; // Clear all marker data

    const getRiskColor = (risk, isHistorical) => {
        if (isHistorical) return 0x333333; // Darker/Grey for historical
        if (risk >= 8) return 0xff3333;
        if (risk >= 6) return 0xff6b35;
        if (risk >= 4) return 0xffaa00;
        return 0x44ff44;
    };

    // Iterate over the combined list
    allItemsForRendering.forEach((item) => {
      if(typeof item.lat !== 'number' || typeof item.lon !== 'number') return;

      const position = latLonToVector3(item.lat, item.lon, 1.5);
      const color = getRiskColor(item.risk, item.isHistorical);
      
      const markerSize = item.isHistorical ? 0.02 : 0.04; // Smaller for historical
      
      const markerGeometry = new THREE.SphereGeometry(markerSize, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: color, emissive: color, emissiveIntensity: item.isHistorical ? 0.2 : 0.5 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      
      const lineEnd = position.clone().normalize().multiplyScalar(2.2);
      
      markersGroup.add(marker);
      
      // Store all marker data
      allMarkersDataRef.current.push({ item, marker, position: position.clone(), labelPosition: lineEnd });
    });
  }, [allItemsForRendering.length, breadcrumb]); // Re-run when the list of items changes

  // Update Breadcrumb Connection Lines
  useEffect(() => {
    if (!breadcrumbLinesGroupRef.current) return;
    const linesGroup = breadcrumbLinesGroupRef.current;
    
    // Clear existing lines
    while (linesGroup.children.length > 0) {
      linesGroup.remove(linesGroup.children[0]);
    }

    // Draw lines connecting breadcrumb items
    if (breadcrumb.length > 0) {
      for (let i = 0; i < breadcrumb.length; i++) {
        const currentItem = breadcrumb[i];
        
        // Find the position of this breadcrumb item
        const currentPos = latLonToVector3(currentItem.lat, currentItem.lon, 1.5);
        
        // Draw line from previous item (or start from center for first item)
        let startPos;
        if (i === 0) {
          // First item - optionally could start from a previous global point or skip
          // For now, we'll draw from the previous breadcrumb item
          continue;
        } else {
          const prevItem = breadcrumb[i - 1];
          startPos = latLonToVector3(prevItem.lat, prevItem.lon, 1.5);
        }
        
        // Create a curved line between the two points
        const curve = new THREE.QuadraticBezierCurve3(
          startPos,
          startPos.clone().lerp(currentPos, 0.5).multiplyScalar(1.3), // Control point raised above surface
          currentPos
        );
        
        const points = curve.getPoints(50);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0xff6b35, 
          linewidth: 2,
          opacity: 0.8,
          transparent: true
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        linesGroup.add(line);
      }
    }
  }, [breadcrumb]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* HUD Box - No Change */}
      <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-md border border-slate-600 p-5 rounded-xl shadow-2xl w-80 pointer-events-auto z-40">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Current Level</h3>
            <div className="text-white font-bold text-xl leading-tight">
              {breadcrumb.length === 0 
                ? <span className="text-orange-400">Global Market</span> 
                : <span className="text-orange-400">{breadcrumb[breadcrumb.length - 1].name}</span>
              }
            </div>
            <div className="text-xs text-green-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              {currentItems.length} Locations Active
            </div>
          </div>
          <div className="bg-slate-700/50 p-2 rounded-lg text-2xl">
            {breadcrumb.length === 0 
              ? '🌍' 
              : breadcrumb[breadcrumb.length - 1].emoji
            }
          </div>
        </div>

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
      </div>

      {/* --- RENDER LINES AND LABELS --- */}
      {/* IMPORTANT: Only render elements for the CURRENT (interactive) items */}
      {currentItems.map((item, index) => {
        const riskColor = item.risk >= 8 ? 'border-red-500' : 
                         item.risk >= 6 ? 'border-orange-500' : 
                         item.risk >= 4 ? 'border-yellow-500' : 'border-green-500';
        
        const lineColor = item.risk >= 8 ? '#ef4444' : 
                         item.risk >= 6 ? '#f97316' : 
                         item.risk >= 4 ? '#eab308' : '#22c55e';

        return (
          <React.Fragment key={item.id || index}>
            {/* The Dynamic Line (DOM-based) */}
            <div
                ref={(el) => (lineElementsRef.current[index] = el)}
                className="absolute origin-left pointer-events-none"
                style={{
                    display: 'none',
                    top: 0,
                    left: 0,
                    height: '1px',
                    backgroundColor: lineColor,
                    opacity: 0.6,
                }}
            />

            {/* The Label Box */}
            <div
                ref={(el) => (labelElementsRef.current[index] = el)}
                className="absolute pointer-events-auto cursor-pointer will-change-transform"
                style={{ display: 'none', top: 0, left: 0 }}
                onClick={() => setSelectedItem(item)}
            >
                <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border-2 ${riskColor} text-white px-3 py-2 rounded-lg shadow-xl hover:shadow-2xl hover:scale-110 transition-transform`}>
                <div className="flex items-center gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <div>
                    <div className="text-xs font-bold text-white whitespace-nowrap">{item.name}</div>
                    <div className="text-xs text-gray-400 whitespace-nowrap">Risk: {item.risk ? item.risk.toFixed(1) : 'N/A'}</div>
                    </div>
                </div>
                </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Info Panel and Confirm Dialog remain the same - use selectedItem which is only a current item */}
      {/* Info Panel */}
      {selectedItem && !showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-[9999]">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedItem.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedItem.name}</h2>
                  <p className="text-gray-400 text-sm">{selectedItem.location}</p>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white text-2xl leading-none">×</button>
            </div>
            
            <div className="mb-4 p-4 bg-slate-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">Overall Risk Score</span>
                <span className={`text-2xl font-bold ${
                  selectedItem.risk >= 8 ? 'text-red-400' :
                  selectedItem.risk >= 6 ? 'text-orange-400' :
                  selectedItem.risk >= 4 ? 'text-yellow-400' : 'text-green-400'
                }`}>{selectedItem.risk.toFixed(1)} / 10</span>
              </div>
              <div className="text-sm text-gray-300 mt-2">{getRiskLabel(selectedItem.risk)} Risk</div>
            </div>

            {selectedItem.shipping && (
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Shipping Details</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><div className="text-gray-400">Time</div><div className="text-white font-medium">{selectedItem.shipping.time}</div></div>
                  <div><div className="text-gray-400">Cost</div><div className="text-white font-medium">{selectedItem.shipping.cost}</div></div>
                  <div><div className="text-gray-400">Method</div><div className="text-white font-medium">{selectedItem.shipping.method}</div></div>
                </div>
              </div>
            )}

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
            
            {selectedItem.next && selectedItem.next.length > 0 && (
              <button
                onClick={() => { setPendingSelection(selectedItem); setShowConfirmDialog(true); }}
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
              This will show the {pendingSelection.next.length} supplier(s) for <span className="text-orange-400 font-semibold">{pendingSelection.emoji} {pendingSelection.name}</span>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setShowConfirmDialog(false); setPendingSelection(null); }} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg">Cancel</button>
              <button onClick={handleConfirmSelection} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-slate-800 bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm max-w-xs pointer-events-none shadow-lg z-40">
        <p className="font-semibold mb-1">🌍 GPU Supply Chain Explorer</p>
        <p className="text-gray-300 mb-2">Drag to rotate • Click markers for details</p>
      </div>

      {/* Breadcrumb Trail Visual Display */}
      {breadcrumb.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-slate-800/95 backdrop-blur-md border border-slate-600 p-4 rounded-xl shadow-2xl max-w-md pointer-events-auto z-40">
          <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-3">Supply Chain Path</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-lg">
              <span className="text-lg">🌍</span>
              <span className="text-white text-sm font-medium">Global</span>
            </div>
            {breadcrumb.map((item, index) => (
              <React.Fragment key={item.id || index}>
                <span className="text-orange-400 text-lg">→</span>
                <div className="flex items-center gap-2 bg-slate-700 px-3 py-1.5 rounded-lg border border-orange-500/30">
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-white text-sm font-medium">{item.name}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GPUGlobe;