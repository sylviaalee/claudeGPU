import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapPin } from 'lucide-react';

export default function SimpleGlobe({ locations = [], highlight, onLocationClick }) {
  const containerRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersRef = useRef([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const isDraggingRef = useRef(false);
  const previousMouseRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0.005 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
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
    renderer.setClearColor(0x0a1929, 1);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create globe
    const globeGeometry = new THREE.SphereGeometry(2, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x1e40af,
      emissive: 0x0a1929,
      shininess: 10,
      transparent: true,
      opacity: 0.9
    });
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;

    // Add continents using simplified geometry
    const continentsMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x22c55e, 
      transparent: true, 
      opacity: 0.7 
    });
    
    const continents = [
      { lat: 45, lng: -100, width: 60, height: 40 },
      { lat: -15, lng: -60, width: 30, height: 50 },
      { lat: 50, lng: 15, width: 30, height: 20 },
      { lat: 0, lng: 20, width: 40, height: 50 },
      { lat: 45, lng: 90, width: 80, height: 50 },
      { lat: -25, lng: 135, width: 30, height: 20 }
    ];

    continents.forEach(cont => {
      const shape = new THREE.Shape();
      const widthRad = (cont.width * Math.PI) / 180;
      const heightRad = (cont.height * Math.PI) / 180;
      
      shape.moveTo(-widthRad/2, -heightRad/2);
      shape.lineTo(widthRad/2, -heightRad/2);
      shape.lineTo(widthRad/2, heightRad/2);
      shape.lineTo(-widthRad/2, heightRad/2);
      shape.lineTo(-widthRad/2, -heightRad/2);

      const geometry = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(geometry, continentsMaterial);
      
      const phi = (90 - cont.lat) * Math.PI / 180;
      const theta = (cont.lng + 180) * Math.PI / 180;
      const radius = 2.01;
      
      mesh.position.x = -radius * Math.sin(phi) * Math.cos(theta);
      mesh.position.y = radius * Math.cos(phi);
      mesh.position.z = radius * Math.sin(phi) * Math.sin(theta);
      
      mesh.lookAt(0, 0, 0);
      globe.add(mesh);
    });

    // Add grid lines
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

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    pointLight.position.set(5, 3, 5);
    scene.add(pointLight);

    // Mouse event handlers
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
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
        
        // Apply rotation directly to the globe
        if (globeRef.current) {
          globeRef.current.rotation.y += deltaX * 0.005;
          globeRef.current.rotation.x += deltaY * 0.005;
          
          // Clamp X rotation to prevent flipping
          globeRef.current.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globeRef.current.rotation.x));
        }
        
        // Update velocity for momentum
        rotationVelocityRef.current.x = deltaY * 0.001;
        rotationVelocityRef.current.y = deltaX * 0.001;
        
        previousMouseRef.current = { x: e.clientX, y: e.clientY };
      } else {
        // Raycast for hover effects
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(markersRef.current);
        
        if (intersects.length > 0) {
          const hoveredMarker = intersects[0].object;
          setHoveredLocation(hoveredMarker.userData.location);
          renderer.domElement.style.cursor = 'pointer';
          
          // Scale up hovered marker
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
        
        // Check if this was a click (minimal movement) vs a drag
        const dragDistance = Math.sqrt(
          Math.pow(e.clientX - previousMouseRef.current.x, 2) + 
          Math.pow(e.clientY - previousMouseRef.current.y, 2)
        );
        
        // Only handle click if there was minimal movement
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
        // If there was significant movement, the velocity is already set and will continue spinning
      }
    };

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      if (!isDraggingRef.current && globeRef.current) {
        // Apply momentum rotation
        globeRef.current.rotation.y += rotationVelocityRef.current.y;
        globeRef.current.rotation.x += rotationVelocityRef.current.x;
        
        // Apply friction
        rotationVelocityRef.current.x *= 0.95;
        rotationVelocityRef.current.y *= 0.95;
      }
      
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
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
  }, [onLocationClick]);

  // Update markers when locations change
  useEffect(() => {
    if (!globeRef.current || !sceneRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      globeRef.current.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
    });
    markersRef.current = [];

    // Add new markers
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    
    locations.forEach((loc) => {
      const isHighlight = highlight && loc.lat === highlight.lat && loc.lng === highlight.lng;
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: isHighlight ? 0xfbbf24 : 0x60a5fa 
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      
      // Convert lat/lng to 3D coordinates
      const phi = (90 - loc.lat) * Math.PI / 180;
      const theta = (loc.lng + 180) * Math.PI / 180;
      const radius = 2.1;
      
      marker.position.x = -radius * Math.sin(phi) * Math.cos(theta);
      marker.position.y = radius * Math.cos(phi);
      marker.position.z = radius * Math.sin(phi) * Math.sin(theta);
      
      marker.userData = { location: loc };
      markersRef.current.push(marker);
      globeRef.current.add(marker);
    });
  }, [locations, highlight]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Location info tooltip */}
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
      
      {/* Location counter */}
      <div className="absolute bottom-4 left-4 text-xs text-blue-300 bg-black/50 px-2 py-1 rounded z-10">
        <MapPin className="inline w-3 h-3 mr-1" />
        {locations.length} location{locations.length !== 1 ? 's' : ''}
      </div>
      
      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded z-10">
        Drag to rotate • Click markers for info
      </div>
    </div>
  );
}