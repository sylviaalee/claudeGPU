'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const GPUGlobe = () => {
  const mountRef = useRef(null);
  const [selectedGPU, setSelectedGPU] = useState(null);
  
  // We remove the state for positions to avoid re-renders
  // const [markerPositions, setMarkerPositions] = useState([]); 
  
  // Instead, we keep references to the actual HTML DOM elements
  const labelElementsRef = useRef([]);

  // Three.js refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersGroupRef = useRef(null);
  const markersDataRef = useRef([]);
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const frameIdRef = useRef(null);

  const gpuLocations = [
    {
      name: "NVIDIA H100",
      lat: 37.7749,
      lon: -122.4194,
      location: "San Francisco, USA",
      risks: {
        supply: "Medium - Limited fab capacity",
        demand: "High - Strong AI/ML demand",
        geopolitical: "Low - Domestic production",
        price: "High - Premium positioning"
      }
    },
    {
      name: "AMD MI300X",
      lat: 30.2672,
      lon: -97.7431,
      location: "Austin, USA",
      risks: {
        supply: "Medium - TSMC dependency",
        demand: "Growing - Enterprise adoption",
        geopolitical: "Low - Diversified supply",
        price: "Medium - Competitive pricing"
      }
    },
    {
      name: "Google TPU v5",
      lat: 37.4220,
      lon: -122.0841,
      location: "Mountain View, USA",
      risks: {
        supply: "Low - Captive use",
        demand: "N/A - Internal only",
        geopolitical: "Low - Strategic control",
        price: "N/A - Not for sale"
      }
    },
    {
      name: "Huawei Ascend 910",
      lat: 31.2304,
      lon: 121.4737,
      location: "Shanghai, China",
      risks: {
        supply: "High - Sanctions impact",
        demand: "High - Domestic focus",
        geopolitical: "High - Trade restrictions",
        price: "Medium - Government support"
      }
    },
    {
      name: "Intel Gaudi 3",
      lat: 32.0853,
      lon: 34.7818,
      location: "Tel Aviv, Israel",
      risks: {
        supply: "Medium - New entrant",
        demand: "Low - Market penetration",
        geopolitical: "Medium - Regional concerns",
        price: "Low - Aggressive pricing"
      }
    },
    {
      name: "NVIDIA A100",
      lat: 51.5074,
      lon: -0.1278,
      location: "London, UK",
      risks: {
        supply: "Medium - Export controls",
        demand: "High - Research institutions",
        geopolitical: "Low - Stable region",
        price: "High - Legacy premium"
      }
    },
    {
      name: "AMD MI250X",
      lat: 48.8566,
      lon: 2.3522,
      location: "Paris, France",
      risks: {
        supply: "Medium - EU distribution",
        demand: "Medium - HPC focus",
        geopolitical: "Low - EU market",
        price: "Medium - Competitive"
      }
    },
    {
      name: "AWS Trainium",
      lat: 47.6062,
      lon: -122.3321,
      location: "Seattle, USA",
      risks: {
        supply: "Low - Cloud-only",
        demand: "Growing - AWS ecosystem",
        geopolitical: "Low - US-based",
        price: "Low - Cloud economics"
      }
    }
  ];

  const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
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

    // Group for markers
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // Add markers
    gpuLocations.forEach((gpu) => {
      const position = latLonToVector3(gpu.lat, gpu.lon, 1.5);
      
      const markerGeometry = new THREE.SphereGeometry(0.04, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff6b35,
        emissive: 0xff6b35,
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
        color: 0xff6b35,
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

    // DIRECT DOM UPDATE FUNCTION
    const updateLabels = () => {
      // 1. Force update matrix world to get latest rotation immediately
      scene.updateMatrixWorld();

      markersDataRef.current.forEach((markerData, index) => {
        const labelEl = labelElementsRef.current[index];
        if (!labelEl) return;

        // 2. Calculate position
        const labelWorldPos = markerData.labelPosition.clone();
        labelWorldPos.applyMatrix4(markersGroup.matrixWorld);
        
        const vector = labelWorldPos.clone();
        vector.project(camera);
        
        const widthHalf = renderer.domElement.width / 2;
        const heightHalf = renderer.domElement.height / 2;
        
        const x = (vector.x * widthHalf) + widthHalf;
        const y = -(vector.y * heightHalf) + heightHalf;

        // 3. Check visibility
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        const toLabel = labelWorldPos.clone().sub(camera.position).normalize();
        const dotProduct = toLabel.dot(cameraDirection);
        const isVisible = dotProduct > 0 && vector.z < 1;

        // 4. Apply directly to DOM style (High Performance)
        if (isVisible) {
          labelEl.style.display = 'block';
          labelEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
          labelEl.style.zIndex = Math.floor((1 - vector.z) * 1000); // Optional: sort z-index
        } else {
          labelEl.style.display = 'none';
        }
      });
    };

    // Animation Loop
    let autoRotate = true;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      
      if (autoRotate && !isDraggingRef.current) {
        globe.rotation.y += 0.001;
        markersGroup.rotation.y = globe.rotation.y;
      }
      
      // Render Scene
      renderer.render(scene, camera);
      
      // Update Labels AFTER render to ensure matrices are fresh, 
      // or we can force update them inside updateLabels
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

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* We map over the STATIC data once.
        The `style` is updated directly by the animation loop.
        Note: We initialize top/left to 0 and use transform for positioning.
      */}
      {gpuLocations.map((gpu, index) => (
        <div
          key={index}
          ref={(el) => (labelElementsRef.current[index] = el)}
          className="absolute pointer-events-auto cursor-pointer transition-transform duration-0 will-change-transform" 
          style={{
            top: 0,
            left: 0,
            display: 'none', // Hidden until first frame
          }}
          onClick={() => setSelectedGPU(gpu)}
        >
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-orange-500 text-white px-4 py-2 rounded-lg shadow-xl hover:shadow-2xl hover:scale-110 hover:border-orange-400 transition-all">
            <div className="text-sm font-bold text-orange-400 whitespace-nowrap">
              {gpu.name}
            </div>
            <div className="text-xs text-gray-400 whitespace-nowrap mt-0.5">
              {gpu.location.split(',')[0]}
            </div>
          </div>
        </div>
      ))}

      {/* Info Panel */}
      {selectedGPU && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pointer-events-auto z-50" onClick={() => setSelectedGPU(null)}>
          <div className="bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{selectedGPU.name}</h2>
                <p className="text-gray-400 text-sm">{selectedGPU.location}</p>
              </div>
              <button
                onClick={() => setSelectedGPU(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-orange-400 mb-2">Risk Breakdown</h3>
              {Object.entries(selectedGPU.risks).map(([key, value]) => (
                <div key={key} className="bg-slate-700 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium capitalize">{key} Risk</span>
                    <span className={`text-sm font-semibold ${
                      value.startsWith('High') ? 'text-red-400' :
                      value.startsWith('Medium') || value.startsWith('Growing') ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {value.split(' - ')[0]}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{value.split(' - ')[1] || value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-slate-800 bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm max-w-xs pointer-events-none shadow-lg">
        <p className="font-semibold mb-1">🌍 Interactive GPU Globe</p>
        <p className="text-gray-300">Drag to rotate • Click boxes for details</p>
      </div>
    </div>
  );
};

export default GPUGlobe;