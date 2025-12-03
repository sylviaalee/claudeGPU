import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapPin } from 'lucide-react';

export default function SimpleGlobe({ locations = [], highlight, onLocationClick, hoverLocations = [], locationChain = [] }) {
  const containerRef = useRef(null);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeRef = useRef(null);
  const markersRef = useRef([]);
  const connectionLinesRef = useRef([]);
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
    // Load realistic Earth texture
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Blue_Marble_2002.png/960px-Blue_Marble_2002.png"
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
      
      // Animate particles along connection lines
      connectionLinesRef.current.forEach(obj => {
        if (obj.userData.curve) {
          // Animate particle along curve
          obj.userData.progress += obj.userData.speed;
          if (obj.userData.progress > 1) obj.userData.progress = 0;
          
          const point = obj.userData.curve.getPoint(obj.userData.progress);
          obj.position.copy(point);
        } else if (obj.userData.pulseSpeed) {
          // Animate pulsing ring
          obj.userData.time += obj.userData.pulseSpeed;
          const scale = obj.userData.baseScale + Math.sin(obj.userData.time) * 0.2;
          obj.scale.set(scale, scale, 1);
          obj.material.opacity = 0.3 + Math.sin(obj.userData.time) * 0.2;
        }
      });
      
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

  // Update markers when locations or hoverLocations change
  useEffect(() => {
    if (!globeRef.current || !sceneRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      globeRef.current.remove(marker);
      marker.geometry.dispose();
      marker.material.dispose();
    });
    markersRef.current = [];

    // Clear existing connection lines
    connectionLinesRef.current.forEach(line => {
      globeRef.current.remove(line);
      line.geometry.dispose();
      line.material.dispose();
    });
    connectionLinesRef.current = [];

    // Helper function to convert lat/lng to 3D coordinates
    const latLngToVector3 = (lat, lng, radius = 2.1) => {
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;
      
      return new THREE.Vector3(
        -radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    };

    // Create connection lines between chain locations
    if (locationChain.length > 1) {
      for (let i = 0; i < locationChain.length - 1; i++) {
        const fromLoc = locationChain[i].location;
        const toLoc = locationChain[i + 1].location;
        
        const start = latLngToVector3(fromLoc.lat, fromLoc.lng);
        const end = latLngToVector3(toLoc.lat, toLoc.lng);
        
        // Create a curved path between the two points
        const distance = start.distanceTo(end);
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        midPoint.normalize().multiplyScalar(2.1 + distance * 0.3); // Curve height based on distance
        
        // Create a quadratic bezier curve
        const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        
        // Create animated gradient material
        const lineMaterial = new THREE.LineBasicMaterial({ 
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.8,
          linewidth: 2
        });
        
        const line = new THREE.Line(geometry, lineMaterial);
        connectionLinesRef.current.push(line);
        globeRef.current.add(line);
        
        // Add animated particles along the line
        const particleCount = 3;
        for (let p = 0; p < particleCount; p++) {
          const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
          const particleMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x60a5fa,
            transparent: true,
            opacity: 0.9
          });
          const particle = new THREE.Mesh(particleGeometry, particleMaterial);
          
          // Store animation data
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

    // Add markers for current level
    const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    
    locations.forEach((loc) => {
      // Check if this location should be highlighted (yellow from hover)
      const isHovered = hoverLocations.some(hLoc => 
        hLoc.lat === loc.lat && hLoc.lng === loc.lng
      );
      
      // Check if this location is the selected highlight (from click)
      const isHighlight = highlight && loc.lat === highlight.lat && loc.lng === highlight.lng;
      
      // Priority: hovered (yellow) > highlighted (amber) > default (blue)
      let color = 0x60a5fa; // blue
      if (isHighlight) color = 0xfbbf24; // amber
      if (isHovered) color = 0xeab308; // yellow
      
      const markerMaterial = new THREE.MeshBasicMaterial({ color });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      
      const pos = latLngToVector3(loc.lat, loc.lng);
      marker.position.copy(pos);

      if (isHovered) {
        marker.scale.set(1.3, 1.3, 1.3);
      }
      
      marker.userData = { location: loc };
      markersRef.current.push(marker);
      globeRef.current.add(marker);
    }); 
    [locations, highlight, hoverLocations];

    // Add markers for chain locations (breadcrumb trail)
    locationChain.forEach((chainItem, idx) => {
      const loc = chainItem.location;
      const isLastInChain = idx === locationChain.length - 1;
      
      // Use different colors for chain markers
      const chainMarkerMaterial = new THREE.MeshBasicMaterial({ 
        color: isLastInChain ? 0xfbbf24 : 0x10b981, // Gold for current, green for previous
        transparent: true,
        opacity: isLastInChain ? 1 : 0.7
      });
      
      const chainMarker = new THREE.Mesh(
        new THREE.SphereGeometry(isLastInChain ? 0.07 : 0.06, 16, 16), 
        chainMarkerMaterial
      );
      
      const pos = latLngToVector3(loc.lat, loc.lng);
      chainMarker.position.copy(pos);
      
      // Add a pulsing ring around chain markers
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
      
      // Store animation data for pulsing
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
  }, [locations, highlight, locationChain]);

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