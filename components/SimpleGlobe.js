import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapPin } from 'lucide-react';

export default function SimpleGlobe({ locations = [], highlight, onLocationClick, hoverLocations = [], locationChain = [] }) {
  const containerRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Refs for Three.js objects
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const starsRef = useRef(null);
  const markersRef = useRef([]);
  const connectionLinesRef = useRef([]);
  
  // Refs for interaction/animation
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.005 });
  const targetRotationRef = useRef(null);
  const isAutoRotatingRef = useRef(false);

  // Initialize Scene
  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- Create Star Field ---
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      // Random position in a sphere around the scene
      const radius = 50 + Math.random() * 50;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);
      
      starSizes[i] = Math.random() * 2 + 0.5;
    }
    
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.8
    });
    
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;

    // --- Create Globe ---
    const globeGeometry = new THREE.SphereGeometry(2, 64, 64);
    
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "https://unpkg.com/three-globe@2.24.9/example/img/earth-blue-marble.jpg"
    );

    const globeMaterial = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: earthTexture,
      bumpScale: 0.04,
      specular: new THREE.Color(0x222222),
      shininess: 5
    });

    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // --- Grid Lines ---
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: 0x3b82f6, 
      transparent: true, 
      opacity: 0.3 
    });

    for (let lat = -80; lat <= 80; lat += 20) {
      const curve = new THREE.EllipseCurve(0, 0, 2, 2, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, gridMaterial);
      line.rotation.x = Math.PI / 2;
      line.position.y = 2 * Math.sin(lat * Math.PI / 180);
      line.scale.set(Math.cos(lat * Math.PI / 180), Math.cos(lat * Math.PI / 180), 1);
      globe.add(line);
    }

    for (let lng = 0; lng < 360; lng += 20) {
      const curve = new THREE.EllipseCurve(0, 0, 2, 2, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, gridMaterial);
      line.rotation.y = lng * Math.PI / 180;
      globe.add(line);
    }

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    // --- Event Handlers ---
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      isAutoRotatingRef.current = false;
      targetRotationRef.current = null;
      previousMouseRef.current = { x: e.clientX, y: e.clientY };
      renderer.domElement.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMouseRef.current.x;
        const deltaY = e.clientY - previousMouseRef.current.y;

        if (globeRef.current) {
          globeRef.current.rotation.y += deltaX * 0.005;
          globeRef.current.rotation.x += deltaY * 0.005;
          globeRef.current.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globeRef.current.rotation.x));
        }

        rotationVelocityRef.current.x = deltaY * 0.001;
        rotationVelocityRef.current.y = deltaX * 0.001;

        previousMouseRef.current = { x: e.clientX, y: e.clientY };
      } else {
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(markersRef.current);

        if (intersects.length > 0) {
          const hoveredMarker = intersects[0].object;
          setHoveredLocation(hoveredMarker.userData.location);
          renderer.domElement.style.cursor = 'pointer';
          markersRef.current.forEach(m => m.scale.set(1, 1, 1));
          hoveredMarker.scale.set(1.5, 1.5, 1.5);
        } else {
          setHoveredLocation(null);
          renderer.domElement.style.cursor = 'grab';
          markersRef.current.forEach(m => m.scale.set(1, 1, 1));
        }
      }
    };

    const onMouseUp = (e) => {
      if (isDraggingRef.current) {
        isDraggingRef.current = false;
        renderer.domElement.style.cursor = 'grab';

        const dragDistance = Math.sqrt(
          Math.pow(e.clientX - previousMouseRef.current.x, 2) + 
          Math.pow(e.clientY - previousMouseRef.current.y, 2)
        );

        if (dragDistance < 5) {
          raycasterRef.current.setFromCamera(mouseRef.current, camera);
          const intersects = raycasterRef.current.intersectObjects(markersRef.current);

          if (intersects.length > 0) {
            const clickedLocation = intersects[0].object.userData.location;
            setSelectedLocation(clickedLocation);
            if (onLocationClick) {
              onLocationClick(clickedLocation);
            }
          } else {
            setSelectedLocation(null);
          }
        }
      }
    };

    const onWheel = (e) => {
      if (!cameraRef.current) return;
      const zoomIntensity = 0.3;
      cameraRef.current.position.z += e.deltaY * zoomIntensity * 0.01;
      cameraRef.current.position.z = Math.max(3, Math.min(10, cameraRef.current.position.z));
    };

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('wheel', onWheel);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // --- Animation Loop ---
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (globeRef.current) {
        // Handle Auto-Rotation
        if (isAutoRotatingRef.current && targetRotationRef.current) {
          const current = {
            x: globeRef.current.rotation.x,
            y: globeRef.current.rotation.y
          };
          const target = targetRotationRef.current;
          
          let deltaY = target.y - current.y;
          // Normalize angle
          while (deltaY > Math.PI) deltaY -= 2 * Math.PI;
          while (deltaY < -Math.PI) deltaY += 2 * Math.PI;
          
          const deltaX = target.x - current.x;
          
          const rotationSpeed = 0.05;
          globeRef.current.rotation.y += deltaY * rotationSpeed;
          globeRef.current.rotation.x += deltaX * rotationSpeed;
          
          if (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01) {
            isAutoRotatingRef.current = false;
            targetRotationRef.current = null;
            rotationVelocityRef.current.y = 0.002; // Resume gentle spin
          }
        } else if (!isDraggingRef.current) {
          // Momentum & Friction
          globeRef.current.rotation.y += rotationVelocityRef.current.y;
          globeRef.current.rotation.x += rotationVelocityRef.current.x;

          rotationVelocityRef.current.x *= 0.95;
          rotationVelocityRef.current.y *= 0.95;
        }
      }

      // Animate stars - slow rotation for parallax effect
      if (starsRef.current) {
        starsRef.current.rotation.y += 0.0001;
        starsRef.current.rotation.x += 0.00005;
      }

      // Handle Object Animations (Particles & Lines)
      connectionLinesRef.current.forEach(obj => {
        if (obj.userData.curve) {
          // Particle movement
          obj.userData.progress += obj.userData.speed;
          if (obj.userData.progress > 1) obj.userData.progress = 0;
          const point = obj.userData.curve.getPoint(obj.userData.progress);
          obj.position.copy(point);
        } else if (obj.userData.pulseSpeed) {
          // Ring pulsing
          obj.userData.time += obj.userData.pulseSpeed;
          const scale = obj.userData.baseScale + Math.sin(obj.userData.time) * 0.2;
          obj.scale.set(scale, scale, 1);
          obj.material.opacity = 0.3 + Math.sin(obj.userData.time) * 0.2;
        } else if (obj.userData.isAnimatedLine) {
          // LINE DRAWING ANIMATION
          if (obj.userData.drawProgress < obj.userData.totalPoints) {
            obj.userData.drawProgress += 3; // Adjust speed here
            const drawCount = Math.min(obj.userData.drawProgress, obj.userData.totalPoints);
            obj.geometry.setDrawRange(0, drawCount);
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onLocationClick]); // End of main useEffect

  // --- Effect: Handle Highlight Rotation ---
  useEffect(() => {
    if (!highlight || !globeRef.current) return;

    // Fixed Rotation Math
    const targetX = (highlight.lat * Math.PI / 180);
    const targetY = -(highlight.lng * Math.PI / 180) - (Math.PI / 2);

    targetRotationRef.current = { x: targetX, y: targetY };
    isAutoRotatingRef.current = true;
    rotationVelocityRef.current = { x: 0, y: 0 };
  }, [highlight]);

  // --- Effect: Update Markers & Lines ---
  useEffect(() => {
    if (!globeRef.current || !sceneRef.current) return;

    // Clear old objects
    markersRef.current.forEach(marker => {
      globeRef.current.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
    });
    markersRef.current = [];

    connectionLinesRef.current.forEach(line => {
      globeRef.current.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
    connectionLinesRef.current = [];

    const latLngToVector3 = (lat, lng, radius = 2.1) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // Draw connection lines
    if (locationChain.length > 1) {
      for (let i = 0; i < locationChain.length - 1; i++) {
        const fromLoc = locationChain[i].location;
        const toLoc = locationChain[i + 1].location;

        const start = latLngToVector3(fromLoc.lat, fromLoc.lng);
        const end = latLngToVector3(toLoc.lat, toLoc.lng);

        const distance = start.distanceTo(end);
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        midPoint.normalize().multiplyScalar(2.1 + distance * 0.3);

        const curve = new THREE.QuadraticBezierCurve3(end, midPoint, start);
        const pointCount = 100;
        const points = curve.getPoints(pointCount);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Start hidden for animation
        geometry.setDrawRange(0, 0);

        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.8,
          linewidth: 2
        });

        const line = new THREE.Line(geometry, lineMaterial);
        line.userData = {
          isAnimatedLine: true,
          drawProgress: 0,
          totalPoints: pointCount
        };

        connectionLinesRef.current.push(line);
        globeRef.current.add(line);

        // Add particles
        const particleCount = 3;
        for (let p = 0; p < particleCount; p++) {
          const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
          const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.9
          });
          const particle = new THREE.Mesh(particleGeometry, particleMaterial);

          particle.userData = {
            curve: curve,
            progress: p / particleCount,
            speed: 0.001 + Math.random() * 0.001
          };

          connectionLinesRef.current.push(particle);
          globeRef.current.add(particle);
        }
      }
    }

    // Draw Markers
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    
    locations.forEach((loc) => {
      const isHovered = hoverLocations.some(hLoc => hLoc.lat === loc.lat && hLoc.lng === loc.lng);
      const isHighlight = highlight && loc.lat === highlight.lat && loc.lng === highlight.lng;

      let color = 0x60a5fa; 
      if (isHighlight) color = 0xfbbf24; 
      if (isHovered) color = 0xeab308; 

      const markerMaterial = new THREE.MeshBasicMaterial({ color });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      const pos = latLngToVector3(loc.lat, loc.lng);
      marker.position.copy(pos);

      if (isHovered) marker.scale.set(1.3, 1.3, 1.3);

      marker.userData = { location: loc };
      markersRef.current.push(marker);
      globeRef.current.add(marker);
    });

    // Draw Chain Markers
    locationChain.forEach((chainItem, idx) => {
      const loc = chainItem.location;
      const isLastInChain = idx === locationChain.length - 1;

      const chainMarkerMaterial = new THREE.MeshBasicMaterial({ 
        color: isLastInChain ? 0xfbbf24 : 0x10b981,
        transparent: true,
        opacity: isLastInChain ? 1 : 0.7
      });

      const chainMarker = new THREE.Mesh(
        new THREE.SphereGeometry(isLastInChain ? 0.07 : 0.06, 16, 16), 
        chainMarkerMaterial
      );

      const pos = latLngToVector3(loc.lat, loc.lng);
      chainMarker.position.copy(pos);

      const ringGeometry = new THREE.RingGeometry(0.08, 0.1, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: isLastInChain ? 0xfbbf24 : 0x10b981,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.lookAt(pos.clone().multiplyScalar(2));
      ring.position.copy(pos);

      ring.userData = { 
        baseScale: 1, 
        pulseSpeed: 0.02,
        time: idx * 0.5 
      };

      chainMarker.userData = { location: loc, isChain: true, itemName: chainItem.itemName };
      markersRef.current.push(chainMarker);
      connectionLinesRef.current.push(ring);
      globeRef.current.add(chainMarker);
      globeRef.current.add(ring);
    });

  }, [locations, highlight, hoverLocations, locationChain]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Tooltip */}
      {(hoveredLocation || selectedLocation) && (
        <div className="absolute top-4 left-4 bg-black/90 text-white px-4 py-3 rounded-lg shadow-xl max-w-xs z-10">
          <h3 className="font-bold text-lg mb-1">{(selectedLocation || hoveredLocation).name}</h3>
          <div className="text-sm text-gray-300 space-y-1">
            <div>Lat: {(selectedLocation || hoveredLocation).lat.toFixed(4)}°</div>
            <div>Lng: {(selectedLocation || hoveredLocation).lng.toFixed(4)}°</div>
            {(selectedLocation || hoveredLocation).description && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                {(selectedLocation || hoveredLocation).description}
              </div>
            )}
          </div>
          {selectedLocation && (
            <div className="mt-2 text-xs text-blue-400">Click anywhere to deselect</div>
          )}
        </div>
      )}

      {/* Info Badges */}
      <div className="absolute bottom-4 left-4 text-xs text-blue-300 bg-black/50 px-2 py-1 rounded z-10">
        <MapPin className="inline w-3 h-3 mr-1" />
        {locations.length} location{locations.length !== 1 ? 's' : ''}
      </div>
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded z-10">
        Drag to rotate • Click markers for info
      </div>
    </div>
  );
}