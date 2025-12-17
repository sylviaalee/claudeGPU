'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { supplyChainData } from '../data/supplyChainData';

const GPUGlobe = () => {
  const mountRef = useRef(null);
  const [selectedGPU, setSelectedGPU] = useState(null);
  const [markerPositions, setMarkerPositions] = useState([]);
  
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

  // Transform supply chain data into GPU locations for the globe
  const gpuLocations = supplyChainData.gpus.map(gpu => ({
    id: gpu.id,
    name: gpu.name,
    lat: gpu.locations[0].lat,
    lon: gpu.locations[0].lng,
    location: gpu.locations[0].name,
    emoji: gpu.image,
    risk: gpu.risk,
    shipping: gpu.shipping,
    riskAnalysis: gpu.riskAnalysis,
    riskScores: gpu.riskScores
  }));

  const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  };

  const getRiskColor = (risk) => {
    if (risk >= 8) return 0xff3333; // High risk - red
    if (risk >= 6) return 0xff6b35; // Medium-high - orange
    if (risk >= 4) return 0xffaa00; // Medium - yellow-orange
    return 0x44ff44; // Low risk - green
  };

  const getRiskLabel = (risk) => {
    if (risk >= 8) return 'High';
    if (risk >= 6) return 'Medium-High';
    if (risk >= 4) return 'Medium';
    return 'Low';
  };

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

    // Create a group for all markers that will rotate with the globe
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Add markers
    gpuLocations.forEach((gpu) => {
      const position = latLonToVector3(gpu.lat, gpu.lon, 1.5);
      const color = getRiskColor(gpu.risk);
      
      // Create marker sphere
      const markerGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: color,
        emissive: color,
        emissiveIntensity: 0.5
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      
      // Create a line connecting marker to label position
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
        gpu,
        marker,
        line,
        position: position.clone(),
        labelPosition: lineEnd
      });
    });

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
      
      // Rotate the entire markers group with the globe
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

    // Function to update marker positions
    const updateMarkerPositions = () => {
      const positions = markersDataRef.current.map(markerData => {
        const labelWorldPos = markerData.labelPosition.clone();
        labelWorldPos.applyMatrix4(markersGroup.matrixWorld);
        
        const vector = labelWorldPos.clone();
        vector.project(camera);
        
        const widthHalf = renderer.domElement.width / 2;
        const heightHalf = renderer.domElement.height / 2;
        
        // Check if behind camera
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const toLabel = labelWorldPos.clone().sub(camera.position).normalize();
        const dotProduct = toLabel.dot(cameraDirection);
        
        return {
          x: (vector.x * widthHalf) + widthHalf,
          y: -(vector.y * heightHalf) + heightHalf,
          visible: dotProduct > 0 && vector.z < 1,
          gpu: markerData.gpu
        };
      });
      
      setMarkerPositions(positions);
    };

    // Auto-rotation and animation
    let autoRotate = true;
    
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (autoRotate && !isDraggingRef.current) {
        globe.rotation.y += 0.001;
        markersGroup.rotation.y = globe.rotation.y;
      }
      
      // Update marker positions on every frame
      updateMarkerPositions();
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      
      // Cleanup event listeners safely
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

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* GPU Labels as floating boxes */}
      {markerPositions.map((pos, index) => {
        if (!pos.visible) return null;
        
        const riskColor = pos.gpu.risk >= 8 ? 'border-red-500' : 
                         pos.gpu.risk >= 6 ? 'border-orange-500' : 
                         pos.gpu.risk >= 4 ? 'border-yellow-500' : 'border-green-500';
        
        return (
          <div
            key={index}
            className="absolute pointer-events-auto cursor-pointer"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => setSelectedGPU(pos.gpu)}
          >
            <div className={`bg-gradient-to-br from-slate-800 to-slate-900 border-2 ${riskColor} text-white px-3 py-2 rounded-lg shadow-xl hover:shadow-2xl hover:scale-110 transition-transform`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{pos.gpu.emoji}</span>
                <div>
                  <div className="text-xs font-bold text-white whitespace-nowrap">
                    {pos.gpu.name}
                  </div>
                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    Risk: {pos.gpu.risk.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Info Panel */}
      {/* Info Panel */}
      {/* Info Panel */}
      {selectedGPU && (
        <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none z-[9999]">
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{selectedGPU.emoji}</span>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{selectedGPU.name}</h2>
                  <p className="text-gray-400 text-sm">{selectedGPU.location}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGPU(null)}
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
                  selectedGPU.risk >= 8 ? 'text-red-400' :
                  selectedGPU.risk >= 6 ? 'text-orange-400' :
                  selectedGPU.risk >= 4 ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {selectedGPU.risk.toFixed(1)} / 10
                </span>
              </div>
              <div className="text-sm text-gray-300 mt-2">
                {getRiskLabel(selectedGPU.risk)} Risk
              </div>
            </div>

            {/* Shipping Info */}
            {selectedGPU.shipping && (
              <div className="mb-4 p-4 bg-slate-700 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">Shipping Details</h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-gray-400">Time</div>
                    <div className="text-white font-medium">{selectedGPU.shipping.time}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Cost</div>
                    <div className="text-white font-medium">{selectedGPU.shipping.cost}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Method</div>
                    <div className="text-white font-medium">{selectedGPU.shipping.method}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Analysis */}
            <div className="mb-4 p-4 bg-slate-700 rounded-lg">
              <h3 className="text-lg font-semibold text-orange-400 mb-2">Risk Analysis</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedGPU.riskAnalysis}</p>
            </div>
            
            {/* Detailed Risk Scores */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-orange-400 mb-2">Detailed Risk Breakdown</h3>
              
              {Object.entries(selectedGPU.riskScores).map(([key, value]) => (
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
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-slate-800 bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm max-w-xs pointer-events-none shadow-lg">
        <p className="font-semibold mb-1">🌍 GPU Supply Chain Risk Globe</p>
        <p className="text-gray-300">Drag to rotate • Click markers for details</p>
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