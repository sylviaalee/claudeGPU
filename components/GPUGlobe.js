'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// Assuming supplyChainData is an external data structure
import { supplyChainData } from '../data/supplyChainData'; 

// *** NEW UTILITY: Simple Arc Line Generator ***
const createArcLine = (startVector, endVector, color, height = 0.5) => {
    const midVector = startVector.clone().add(endVector).divideScalar(2);
    const distance = startVector.distanceTo(endVector);
    const arcHeight = Math.sqrt(distance) * height; 
    const midPoint = midVector.normalize().multiplyScalar(1.3 + arcHeight); 

    const curve = new THREE.QuadraticBezierCurve3(
        startVector,
        midPoint,
        endVector
    );

    const points = curve.getPoints(50); 
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: color, 
        linewidth: 2, 
        transparent: true, 
        opacity: 0.8 
    });

    return new THREE.Line(geometry, material);
};

// *** FIX HERE: Added { onSimulate } to props ***
const GPUGlobe = ({ onSimulate }) => {
  const mountRef = useRef(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]); 
  
  const data = supplyChainData;

  // Refs
  const labelElementsRef = useRef([]);
  const lineElementsRef = useRef([]);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersGroupRef = useRef(null);
  const breadcrumbGroupRef = useRef(null);
  const markersDataRef = useRef([]);
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const frameIdRef = useRef(null);

  // --- DATA PROCESSING ---
  const getCurrentItems = () => {
    const isValid = (item) => item && item.locations && item.locations[0] && typeof item.locations[0].lat === 'number';
    if (!data) return [];

    let items = [];
    if (breadcrumb.length === 0) {
      items = (data.gpus || []).filter(isValid).map(item => ({ ...item, category: 'gpus', isRoot: true }));
    } else {
      const lastSelection = breadcrumb[breadcrumb.length - 1];
      const nextIds = lastSelection.next || [];
      const categories = Object.keys(data).filter(k => k !== 'gpus'); 
      for (const category of categories) {
        const categoryItems = data[category] || [];
        const matchingItems = categoryItems.filter(item => nextIds.includes(item.id));
        items = items.concat(matchingItems.filter(isValid).map(item => ({ ...item, category: category })));
      }
    }

    return items.map((item, index) => {
        const jitterX = (item.name.charCodeAt(0) % 10 - 5) * 0.05; 
        const jitterY = (item.name.charCodeAt(1) % 10 - 5) * 0.05;
        
        return {
            ...item,
            lat: item.locations[0].lat + jitterY,
            lon: item.locations[0].lng + jitterX,
            location: item.locations[0].name,
            emoji: item.image,
        }
    });
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

  // --- NAVIGATION ACTIONS ---
  const handleDrillDown = (item) => {
    if (item && item.next && item.next.length > 0) {
      setBreadcrumb([...breadcrumb, item]);
      setSelectedItem(null);
    }
  };

  const handleGoBack = () => {
    if (breadcrumb.length > 0) {
      setBreadcrumb(breadcrumb.slice(0, -1));
      setSelectedItem(null);
    }
  };
  
  const handleNavigateTo = (index) => {
    if (index < breadcrumb.length) {
      setBreadcrumb(breadcrumb.slice(0, index + 1));
      setSelectedItem(null);
    } else if (index === -1) {
      handleReset();
    }
  };

  const handleReset = () => {
    setBreadcrumb([]);
    setSelectedItem(null);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // --- THREE.js Initialization ---
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

    // --- STARFIELD ---
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
    const starMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.05, 
        transparent: true, 
        opacity: 0.6 
    });
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

    const breadcrumbGroup = new THREE.Group();
    scene.add(breadcrumbGroup);
    breadcrumbGroupRef.current = breadcrumbGroup;

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
      
      const upFactor = Math.cos(globe.rotation.x) > 0 ? 1 : -1;
      globe.rotation.y += deltaX * 0.005 * upFactor;
      
      markersGroup.rotation.y = globe.rotation.y;
      markersGroup.rotation.x = globe.rotation.x;
      
      breadcrumbGroup.rotation.y = globe.rotation.y;
      breadcrumbGroup.rotation.x = globe.rotation.x;
      
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => isDraggingRef.current = false;

    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);

    // --- LABEL UPDATE LOGIC ---
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
        
        let alpha = 0;
        if (facingCamera > 0.2) {
            alpha = 1;
        } else if (facingCamera > -0.2) {
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
            opacity: alpha 
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
            if (Math.abs(current.x - next.x) < BOX_WIDTH) {
                if (next.y < current.y + BOX_HEIGHT) {
                    next.y = current.y + BOX_HEIGHT + 5; 
                }
            }
        }
      }

      visibleLabels.forEach(l => {
        const labelStyle = l.element.style;
        const lineStyle = l.lineElement.style;

        labelStyle.display = 'block';
        labelStyle.transform = `translate(-50%, -50%) translate(${l.x}px, ${l.y}px)`;
        labelStyle.zIndex = Math.floor((1 - l.z) * 1000);
        labelStyle.opacity = l.opacity;
        
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
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      if (autoRotate && !isDraggingRef.current) {
        globe.rotation.y += 0.001;
        markersGroup.rotation.y = globe.rotation.y;
        
        // Optional: Slowly rotate stars for extra effect
        stars.rotation.y += 0.0002;
        breadcrumbGroup.rotation.y = globe.rotation.y;
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

  // Update CURRENT Markers
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

    currentItems.forEach((item) => {
      if(typeof item.lat !== 'number' || typeof item.lon !== 'number') return;

      const position = latLonToVector3(item.lat, item.lon, 1.3);
      const color = getRiskColor(item.risk);
      
      const markerGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: color, emissive: color, emissiveIntensity: 0.5 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      
      const lineEnd = position.clone().normalize().multiplyScalar(2.2);
      
      markersGroup.add(marker);
      
      markersDataRef.current.push({ item, marker, position: position.clone(), labelPosition: lineEnd });
    });
  }, [currentItems]);
  
  // Update Breadcrumb Trail
  useEffect(() => {
    if (!breadcrumbGroupRef.current) return;
    const breadcrumbGroup = breadcrumbGroupRef.current;
    
    // Clear previous breadcrumb visuals
    while (breadcrumbGroup.children.length > 0) breadcrumbGroup.remove(breadcrumbGroup.children[0]);
    
    const trailColor = new THREE.Color(0x3366ff); 
    const trailMarkerColor = new THREE.Color(0x77aaff); 
    const radius = 1.3;
    
    breadcrumb.forEach((item, index) => {
      if(item.locations && item.locations[0]) {
        const { lat, lng } = item.locations[0];
        const position = latLonToVector3(lat, lng, radius);

        // Marker
        const markerGeometry = new THREE.SphereGeometry(0.02, 16, 16);
        const markerMaterial = new THREE.MeshBasicMaterial({ 
            color: trailMarkerColor, 
            transparent: true, 
            opacity: 0.8
        });
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.copy(position);
        breadcrumbGroup.add(marker);

        // Arc to previous
        if (index > 0) {
          const previousItem = breadcrumb[index - 1];
          if (previousItem.locations && previousItem.locations[0]) {
            const { lat: prevLat, lng: prevLng } = previousItem.locations[0];
            const prevPosition = latLonToVector3(prevLat, prevLng, radius);
            const arcLine = createArcLine(prevPosition, position, trailColor, 0.4); 
            breadcrumbGroup.add(arcLine);
          }
        }
      }
    });

  }, [breadcrumb]);


  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* HUD Box */}
      <div className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-md border border-slate-600 p-5 rounded-xl shadow-2xl w-80 pointer-events-auto z-[2000]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Current Focus</h3>
            <div className="text-white font-bold text-xl leading-tight">
              {breadcrumb.length === 0 
                ? <span className="text-blue-400">Global Market</span> 
                : <span className="text-blue-400">{breadcrumb[breadcrumb.length - 1].name}</span>
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
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg border border-blue-500 hover:border-blue-400'
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
                className="absolute origin-left pointer-events-none transition-opacity duration-75"
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
                className="absolute pointer-events-auto cursor-pointer will-change-transform transition-opacity duration-75"
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
                <h3 className="text-lg font-semibold tex-blue-400 mb-2">Shipping Details</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div><div className="text-gray-400">Time</div><div className="text-white font-medium">{selectedItem.shipping.time}</div></div>
                  <div><div className="text-gray-400">Cost</div><div className="text-white font-medium">{selectedItem.shipping.cost}</div></div>
                  <div><div className="text-gray-400">Method</div><div className="text-white font-medium">{selectedItem.shipping.method}</div></div>
                </div>
              </div>
            )}

            {selectedItem.next && selectedItem.next.length > 0 && (
              <button
                onClick={() => handleDrillDown(selectedItem)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg transition-colors mb-4"
              >
                Explore Supply Chain → ({selectedItem.next.length} suppliers)
              </button>
            )}

            <div className="mb-4 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Risk Analysis</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedItem.riskAnalysis}</p>
            </div>

             {selectedItem.riskScores && (
            <div className="space-y-2 mb-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Detailed Risk Breakdown</h3>
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
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-slate-800 bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm max-w-xs pointer-events-none shadow-lg z-[2000]">
        <p className="font-semibold mb-1">🌍 GPU Supply Chain Explorer</p>
        <p className="text-gray-300 mb-2">Drag to rotate • Click markers for details</p>
        {breadcrumb.length > 0 && (
          <p className="text-blue-300 mt-2">Blue dots/lines show the path you explored.</p>
        )}
      </div>

      {/* --- Breadcrumb Bar at the bottom --- */}
      {breadcrumb.length > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[2000] w-auto max-w-full pointer-events-auto">
            <div className="bg-slate-800/95 backdrop-blur-md border border-slate-600 p-2 rounded-xl shadow-2xl flex items-center space-x-1">
            {breadcrumb.map((item, index) => (
                <React.Fragment key={item.id}>
                {index > 0 && <span className="text-gray-500">/</span>}
                <button
                    onClick={() => handleNavigateTo(index)}
                    className={`flex items-center text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    index === breadcrumb.length - 1
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-slate-700'
                    }`}
                >
                    <span className="mr-2">{item.emoji}</span>
                    {item.name}
                </button>
                </React.Fragment>
            ))}
            </div>
        </div>
      )}

      {breadcrumb.length > 0 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[2000]">
            <button 
              onClick={() => onSimulate(breadcrumb)}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-full shadow-lg border border-green-400 transition-transform hover:scale-105 active:scale-95"
            >
              ✅ Confirm & Simulate Path
            </button>
        </div>
      )}
    </div>
  );
};

export default GPUGlobe;