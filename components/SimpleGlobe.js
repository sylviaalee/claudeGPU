import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapPin } from 'lucide-react';

export default function SimpleGlobe({ locations = [], highlight, onLocationClick }) {
  const containerRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x0a1929, 1);
    containerRef.current.appendChild(renderer.domElement);
    
    const markers = [];

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

    // Add continents using simplified geometry
    const continentsMaterial = new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.7 });
    
    // Simplified continent coordinates (lat, lng, size)
    const continents = [
      // North America
      { lat: 45, lng: -100, width: 60, height: 40 },
      // South America
      { lat: -15, lng: -60, width: 30, height: 50 },
      // Europe
      { lat: 50, lng: 15, width: 30, height: 20 },
      // Africa
      { lat: 0, lng: 20, width: 40, height: 50 },
      // Asia
      { lat: 45, lng: 90, width: 80, height: 50 },
      // Australia
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

    // Add location markers
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    locations.forEach((loc) => {
      const isHighlight = highlight && loc.lat === highlight.lat && loc.lng === highlight.lng;
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: isHighlight ? 0xfbbf24 : 0x60a5fa 
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      
      const phi = (90 - loc.lat) * Math.PI / 180;
      const theta = (loc.lng + 180) * Math.PI / 180;
      const radius = 2.1;
      
      marker.position.x = -radius * Math.sin(phi) * Math.cos(theta);
      marker.position.y = radius * Math.cos(phi);
      marker.position.z = radius * Math.sin(phi) * Math.sin(theta);
      
      marker.userData = { location: loc };
      markers.push(marker);
      globe.add(marker);
    });

    // Add grid lines
    const gridMaterial = new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.3 });
    
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

    camera.position.z = 5;

    // Animation
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0.001, y: 0.005 };

    const onMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        
        rotationVelocity.x = deltaY * 0.001;
        rotationVelocity.y = deltaX * 0.001;
        
        previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        // Raycast for hover effects
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(markers);
        
        if (intersects.length > 0) {
          const hoveredMarker = intersects[0].object;
          setHoveredLocation(hoveredMarker.userData.location);
          renderer.domElement.style.cursor = 'pointer';
          
          // Scale up hovered marker
          markers.forEach(m => m.scale.set(1, 1, 1));
          hoveredMarker.scale.set(1.5, 1.5, 1.5);
        } else {
          setHoveredLocation(null);
          renderer.domElement.style.cursor = isDragging ? 'grabbing' : 'grab';
          markers.forEach(m => m.scale.set(1, 1, 1));
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
      renderer.domElement.style.cursor = 'grab';
    };

    const onClick = (e) => {
      if (Math.abs(e.clientX - previousMousePosition.x) > 5 || 
          Math.abs(e.clientY - previousMousePosition.y) > 5) {
        return; // Was dragging, not clicking
      }

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(markers);
      
      if (intersects.length > 0) {
        const clickedLocation = intersects[0].object.userData.location;
        setSelectedLocation(clickedLocation);
        if (onLocationClick) {
          onLocationClick(clickedLocation);
        }
      } else {
        setSelectedLocation(null);
      }
    };

    renderer.domElement.style.cursor = 'grab';
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      
      if (!isDragging) {
        globe.rotation.y += rotationVelocity.y;
        globe.rotation.x += rotationVelocity.x;
        rotationVelocity.x *= 0.95;
        rotationVelocity.y *= 0.95;
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
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('click', onClick);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [locations, highlight, onLocationClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* Location info tooltip */}
      {(hoveredLocation || selectedLocation) && (
        <div className="absolute top-4 left-4 bg-black/90 text-white px-4 py-3 rounded-lg shadow-xl max-w-xs">
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
            <div className="mt-2 text-xs text-blue-400">Click again to deselect</div>
          )}
        </div>
      )}
      
      {/* Location counter */}
      <div className="absolute bottom-4 left-4 text-xs text-blue-300 bg-black/50 px-2 py-1 rounded">
        <MapPin className="inline w-3 h-3 mr-1" />
        {locations.length} location{locations.length !== 1 ? 's' : ''}
      </div>
      
      {/* Controls hint */}
      <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
        Drag to rotate • Click markers for info
      </div>
    </div>
  );
}