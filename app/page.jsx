'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { supplyChainData } from '../data/supplyChainData';

const GPUGlobe = () => {
  const mountRef = useRef(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingSelection, setPendingSelection] = useState(null);

  const labelElementsRef = useRef([]);
  const lineElementsRef = useRef([]);
  const allMarkersDataRef = useRef([]);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersGroupRef = useRef(null);
  const breadcrumbLinesGroupRef = useRef(null);

  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const frameIdRef = useRef(null);

  const data = supplyChainData;

  const isValid = (item) => item?.locations?.[0] && typeof item.locations[0].lat === 'number';

  const processItem = (item, category, isHistorical = false) => {
    const jitterX = (item.name.charCodeAt(0) % 10 - 5) * 0.05;
    const jitterY = (item.name.charCodeAt(1) % 10 - 5) * 0.05;

    return {
      ...item,
      category,
      isHistorical,
      lat: item.locations[0].lat + jitterY,
      lon: item.locations[0].lng + jitterX,
      location: item.locations[0].name,
      emoji: item.image,
    };
  };

  const getCurrentItems = () => {
    let current = [];
    let historical = [];

    if (breadcrumb.length === 0) {
      current = (data.gpus || []).filter(isValid).map(i => processItem(i, 'gpus'));
    } else {
      const last = breadcrumb[breadcrumb.length - 1];
      const nextIds = last.next || [];

      Object.keys(data)
        .filter(k => k !== 'gpus')
        .forEach(category => {
          (data[category] || [])
            .filter(i => nextIds.includes(i.id) && isValid(i))
            .forEach(i => current.push(processItem(i, category)));
        });

      historical = breadcrumb.map(b => ({ ...b, isHistorical: true }));
    }

    return { current, historical };
  };

  const { current: currentItems, historical: historicalItems } = getCurrentItems();
  const allItems = [...currentItems, ...historicalItems];

  const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  const handleDrillDown = (item) => {
    if (item.next?.length) {
      setPendingSelection(item);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSelection = () => {
    const loc = pendingSelection.locations[0];
    setBreadcrumb([...breadcrumb, { ...pendingSelection, lat: loc.lat, lon: loc.lng }]);
    setPendingSelection(null);
    setShowConfirmDialog(false);
    setSelectedItem(null);
  };

  const handleGoBack = () => {
    setBreadcrumb(breadcrumb.slice(0, -1));
    setSelectedItem(null);
  };

  const handleReset = () => {
    setBreadcrumb([]);
    setSelectedItem(null);
  };

  /* -------------------- THREE SETUP -------------------- */
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

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.PointLight(0xffffff, 0.8);
    light.position.set(5, 3, 5);
    scene.add(light);

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 64, 64),
      new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'),
      })
    );
    scene.add(globe);
    globeRef.current = globe;

    markersGroupRef.current = new THREE.Group();
    scene.add(markersGroupRef.current);

    breadcrumbLinesGroupRef.current = new THREE.Group();
    scene.add(breadcrumbLinesGroupRef.current);

<<<<<<< HEAD
=======
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

    const handleMouseUp = () => isDraggingRef.current = false;

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    // --- SORT & STACK ALGORITHM WITH FADING ---
    const updateLabels = () => {
      scene.updateMatrixWorld();
      
      const visibleLabels = [];
      const width = renderer.domElement.width;
      const height = renderer.domElement.height;
      const widthHalf = width / 2;
      const heightHalf = height / 2;

      // 1. Calculate ideal positions & Opacity
      markersDataRef.current.forEach((markerData, index) => {
        const labelEl = labelElementsRef.current[index];
        const lineEl = lineElementsRef.current[index];
        if (!labelEl || !lineEl) return;

        // Visibility Check
        const markerWorldPos = new THREE.Vector3();
        markerData.marker.getWorldPosition(markerWorldPos);
        const meshNormal = markerWorldPos.clone().normalize();
        const vecToCamera = camera.position.clone().sub(markerWorldPos).normalize();
        
        // Dot product: 1.0 (Front) to -1.0 (Back)
        const facingCamera = meshNormal.dot(vecToCamera);
        
        // --- SMOOTH FADE CALCULATION ---
        // Range 0.2 to -0.2: Fade from 1.0 to 0.0
        let alpha = 0;
        if (facingCamera > 0.2) {
            alpha = 1;
        } else if (facingCamera > -0.2) {
            // Normalize -0.2...0.2 range to 0...1
            alpha = (facingCamera + 0.2) / 0.4;
        }
        
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
            index,
            element: labelEl,
            lineElement: lineEl,
            anchorX, 
            anchorY,
            x: idealX,
            y: idealY,
            z: labelScreenPos.z,
            opacity: alpha // Store opacity
          });
        } else {
          labelEl.style.display = 'none';
          lineEl.style.display = 'none';
        }
      });

      // 2. SORT by Y position
      visibleLabels.sort((a, b) => a.y - b.y);

      // 3. STACK Algorithm
      const BOX_WIDTH = 210; 
      const BOX_HEIGHT = 85;

      for(let i = 0; i < visibleLabels.length; i++) {
        const current = visibleLabels[i];
        for(let j = i + 1; j < visibleLabels.length; j++) {
            const next = visibleLabels[j];
            if (Math.abs(current.x - next.x) < BOX_WIDTH) {
                if (next.y < current.y + BOX_HEIGHT) {
                    next.y = current.y + BOX_HEIGHT + 5; 
                }
            }
        }
      }

      // 4. Apply final positions and OPACITY
      visibleLabels.forEach(l => {
        const labelStyle = l.element.style;
        const lineStyle = l.lineElement.style;

        labelStyle.display = 'block';
        labelStyle.transform = `translate(-50%, -50%) translate(${l.x}px, ${l.y}px)`;
        labelStyle.zIndex = Math.floor((1 - l.z) * 1000);
        
        // Apply smooth fading
        labelStyle.opacity = l.opacity;
        
        // Lines fade out slightly faster to keep text readable longer
        lineStyle.display = 'block';
        lineStyle.opacity = l.opacity * 0.6; 

        const dx = l.x - l.anchorX;
        const dy = l.y - l.anchorY;
        const length = Math.sqrt(dx*dx + dy*dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        lineStyle.width = `${length}px`;
        lineStyle.transform = `translate(${l.anchorX}px, ${l.anchorY}px) rotate(${angle}deg)`;
      });
    };

    let autoRotate = true;
>>>>>>> b33e98df26e72be1db8f688f9ab1522b4839e8fb
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      globe.rotation.y += 0.001;
      markersGroupRef.current.rotation.y = globe.rotation.y;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameIdRef.current);
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  /* -------------------- MARKERS -------------------- */
  useEffect(() => {
    const group = markersGroupRef.current;
    if (!group) return;

    while (group.children.length) group.remove(group.children[0]);
    allMarkersDataRef.current = [];

    allItems.forEach(item => {
      const pos = latLonToVector3(item.lat, item.lon, 1.5);
      const mat = new THREE.MeshStandardMaterial({
        color: item.isHistorical ? 0x333333 : 0xff6b35,
        emissive: item.isHistorical ? 0x111111 : 0xff6b35,
        emissiveIntensity: item.isHistorical ? 0.2 : 0.6,
      });

      const marker = new THREE.Mesh(new THREE.SphereGeometry(item.isHistorical ? 0.02 : 0.04, 16, 16), mat);
      marker.position.copy(pos);
      group.add(marker);

      allMarkersDataRef.current.push({ marker, item });
    });
  }, [allItems]);

  /* -------------------- UI -------------------- */
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
<<<<<<< HEAD

      {currentItems.map((item, i) => (
        <div
          key={item.id}
          ref={el => (labelElementsRef.current[i] = el)}
          className="absolute cursor-pointer bg-slate-800 text-white px-3 py-2 rounded-lg"
          onClick={() => setSelectedItem(item)}
        >
          {item.emoji} {item.name}
=======
      
      {/* HUD Box */}
      <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-md border border-slate-600 p-5 rounded-xl shadow-2xl w-80 pointer-events-auto z-[2000]">
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
            {breadcrumb.length === 0 ? '🌍' : breadcrumb[breadcrumb.length - 1].emoji}
          </div>
>>>>>>> b33e98df26e72be1db8f688f9ab1522b4839e8fb
        </div>
      ))}

<<<<<<< HEAD
      {selectedItem && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-slate-800 p-6 rounded-xl max-w-lg w-full">
            <h2 className="text-white text-xl font-bold mb-4">{selectedItem.name}</h2>
            {selectedItem.next?.length > 0 && (
=======
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
      {currentItems.map((item, index) => {
        const riskColor = item.risk >= 8 ? 'border-red-500' : 
                         item.risk >= 6 ? 'border-orange-500' : 
                         item.risk >= 4 ? 'border-yellow-500' : 'border-green-500';
        
        const lineColor = item.risk >= 8 ? '#ef4444' : 
                         item.risk >= 6 ? '#f97316' : 
                         item.risk >= 4 ? '#eab308' : '#22c55e';

        return (
          <React.Fragment key={item.id || index}>
            <div
                ref={(el) => (lineElementsRef.current[index] = el)}
                className="absolute origin-left pointer-events-none transition-opacity duration-75" // Smooth fade
                style={{
                    display: 'none',
                    top: 0,
                    left: 0,
                    height: '1px',
                    backgroundColor: lineColor,
                }}
            />

            <div
                ref={(el) => (labelElementsRef.current[index] = el)}
                className="absolute pointer-events-auto cursor-pointer will-change-transform transition-opacity duration-75" // Smooth fade
                style={{ display: 'none', top: 0, left: 0 }}
                onClick={() => setSelectedItem(item)}
            >
                <div className={`w-48 bg-gradient-to-br from-slate-800 to-slate-900 border-2 ${riskColor} text-white px-3 py-2 rounded-lg shadow-xl hover:shadow-2xl hover:scale-110 transition-transform`}>
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="overflow-hidden">
                        <div className="text-xs font-bold text-white whitespace-nowrap truncate" title={item.name}>
                            {item.name}
                        </div>
                        <div className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
                            Risk: {item.risk ? item.risk.toFixed(1) : 'N/A'}
                        </div>
                    </div>
                </div>
                </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* Info Panel */}
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-[3000]">
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

             {selectedItem.riskScores && (
            <div className="space-y-2 mb-4">
              <h3 className="text-lg font-semibold text-orange-400 mb-2">Detailed Risk Breakdown</h3>
              {Object.entries(selectedItem.riskScores)
                .sort((a, b) => b[1] - a[1])
                .map(([key, value]) => (
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
>>>>>>> b33e98df26e72be1db8f688f9ab1522b4839e8fb
              <button
                onClick={() => handleDrillDown(selectedItem)}
                className="w-full bg-orange-600 py-2 rounded-lg"
              >
                Explore Supply Chain
              </button>
            )}
          </div>
        </div>
      )}

<<<<<<< HEAD
      {showConfirmDialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-slate-800 p-6 rounded-xl">
            <p className="text-white mb-4">Explore suppliers?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmDialog(false)} className="bg-slate-600 px-4 py-2 rounded">Cancel</button>
              <button onClick={handleConfirmSelection} className="bg-orange-600 px-4 py-2 rounded">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex gap-2 z-50">
        <button onClick={handleGoBack} className="bg-slate-700 px-3 py-2 rounded">Back</button>
        <button onClick={handleReset} className="bg-orange-600 px-3 py-2 rounded">Reset</button>
=======
       {/* Instructions */}
       <div className="absolute top-4 left-4 bg-slate-800 bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm max-w-xs pointer-events-none shadow-lg z-[2000]">
        <p className="font-semibold mb-1">🌍 GPU Supply Chain Explorer</p>
        <p className="text-gray-300 mb-2">Drag to rotate • Click markers for details</p>
>>>>>>> b33e98df26e72be1db8f688f9ab1522b4839e8fb
      </div>
    </div>
  );
};

export default GPUGlobe;