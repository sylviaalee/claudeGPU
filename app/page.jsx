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

      {currentItems.map((item, i) => (
        <div
          key={item.id}
          ref={el => (labelElementsRef.current[i] = el)}
          className="absolute cursor-pointer bg-slate-800 text-white px-3 py-2 rounded-lg"
          onClick={() => setSelectedItem(item)}
        >
          {item.emoji} {item.name}
        </div>
      ))}

      {selectedItem && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-slate-800 p-6 rounded-xl max-w-lg w-full">
            <h2 className="text-white text-xl font-bold mb-4">{selectedItem.name}</h2>
            {selectedItem.next?.length > 0 && (
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
      </div>
    </div>
  );
};

export default GPUGlobe;