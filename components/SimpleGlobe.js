import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
// No Lucide import needed here, logic is pure Three.js

export default function SimpleGlobe({ 
  locations = [], 
  highlight, 
  onLocationClick, 
  hoverLocations = [], 
  locationChain = [],
  onMarkerCoordinatesUpdate // NEW: Callback to update parent with screen coords
}) {
  const containerRef = useRef(null);
  
  // Refs
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersRef = useRef([]); // Stores references to the mesh objects
  const requestRef = useRef();

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    // Add some fog for depth
    scene.fog = new THREE.FogExp2(0x000000, 0.02);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45, // Narrower FOV for less distortion
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 8; // Further back to see full globe
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Create Globe ---
    // Increased segments for smoother sphere
    const globeGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    // Dark techy material
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x111111,
      emissive: 0x112244,
      emissiveIntensity: 0.2,
      shininess: 30,
      specular: 0x444444,
      transparent: true,
      opacity: 0.9,
    });

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // --- Tech Grid Lines ---
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: 0x1e3a8a, // Dark blue
      transparent: true, 
      opacity: 0.15 
    });

    // Add Lat/Lon lines
    for (let i = 0; i < 18; i++) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(
            new THREE.EllipseCurve(0, 0, 2.01, 2.01, 0, 2 * Math.PI, false, 0).getPoints(64)
        );
        const line = new THREE.Line(lineGeo, gridMaterial);
        line.rotation.x = Math.PI / 2;
        line.rotation.y = (i * 10) * (Math.PI/180);
        globe.add(line);
    }

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dLight = new THREE.DirectionalLight(0xffffff, 1);
    dLight.position.set(5, 3, 5);
    scene.add(dLight);
    
    // Backlight for atmosphere effect
    const bLight = new THREE.SpotLight(0x3b82f6, 5);
    bLight.position.set(-5, 0, -5);
    bLight.lookAt(globe.position);
    scene.add(bLight);

    // --- Animation Loop ---
    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      // 1. Rotate Globe
      if (globe) {
        globe.rotation.y += 0.001; // Slow constant rotation
        
        // Handle Highlight Rotation (smooth ease)
        if (highlight) {
            // Simplified: logic to rotate towards highlight would go here
        }
      }

      // 2. Project Marker Coordinates for HUD
      // This is the key part for connecting lines
      if (markersRef.current.length > 0 && onMarkerCoordinatesUpdate) {
        const coords = {};
        const widthHalf = containerRef.current.clientWidth / 2;
        const heightHalf = containerRef.current.clientHeight / 2;

        markersRef.current.forEach(marker => {
            if (!marker.userData.location) return;

            // Clone position to not mess up actual object
            const pos = marker.position.clone();
            
            // Convert local position (child of globe) to world position
            pos.applyMatrix4(globe.matrixWorld);
            
            // Check visibility (dot product with camera direction)
            // Simplified: if distance to camera is less than globe center distance, it's front-facing
            const distance = pos.distanceTo(camera.position);
            const isVisible = distance < camera.position.distanceTo(globe.position); 

            // Project to screen space
            pos.project(camera);

            const x = (pos.x * widthHalf) + widthHalf;
            const y = -(pos.y * heightHalf) + heightHalf;

            // Create a unique key for the location
            const key = `${marker.userData.location.lat}-${marker.userData.location.lng}`;
            
            coords[key] = {
                x, 
                y, 
                visible: isVisible // Only draw line if visible
            };
        });
        
        onMarkerCoordinatesUpdate(coords);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // --- Update Markers ---
  useEffect(() => {
    if (!globeRef.current) return;

    // Clear old
    markersRef.current.forEach(m => globeRef.current.remove(m));
    markersRef.current = [];

    const latLngToVector3 = (lat, lng, radius = 2.05) => {
        const phi = (90 - lat) * Math.PI / 180;
        const theta = (lng + 180) * Math.PI / 180;
        return new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        );
    };

    locations.forEach(loc => {
        const markerGeo = new THREE.SphereGeometry(0.04, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ 
            color: 0x60a5fa // Blue marker
        });
        const mesh = new THREE.Mesh(markerGeo, markerMat);
        
        const pos = latLngToVector3(loc.lat, loc.lng);
        mesh.position.copy(pos);
        mesh.userData = { location: loc };
        
        // Add a glow ring
        const ringGeo = new THREE.RingGeometry(0.06, 0.07, 32);
        const ringMat = new THREE.MeshBasicMaterial({ 
            color: 0x60a5fa, side: THREE.DoubleSide, transparent: true, opacity: 0.5 
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos.clone().multiplyScalar(1.01));
        ring.lookAt(pos.clone().multiplyScalar(2));
        
        globeRef.current.add(mesh);
        globeRef.current.add(ring);
        markersRef.current.push(mesh);
    });

  }, [locations]);

  return <div ref={containerRef} className="w-full h-full" />;
}