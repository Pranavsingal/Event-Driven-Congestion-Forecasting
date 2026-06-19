import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// SVG Icons instead of lucide-react to use pure Leaflet/SVG rendering
const CompassIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
  </svg>
);

const ArrowUpRightIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7"></line>
    <polyline points="7 7 17 7 17 17"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const LocateIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="3"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
  </svg>
);

const MapPinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const LOCAL_JUNCTIONS = {
  "silk board": [12.9176, 77.6244, "Central Silk Board Junction"],
  "adugodi": [12.9428, 77.6078, "Adugodi Junction"],
  "hebbal": [13.0359, 77.5975, "Hebbal Flyover Junction"],
  "dairy circle": [12.9384, 77.5996, "Dairy Circle Junction"],
  "sony world": [12.9344, 77.6288, "Sony World Junction Koramangala"],
  "hope farm": [12.9842, 77.7511, "Hope Farm Junction Whitefield"],
  "trinity circle": [12.9731, 77.6174, "Trinity Circle"],
  "agara": [12.9237, 77.6497, "Agara Junction"],
  "mekhri circle": [12.9984, 77.5922, "Mekhri Circle"],
  "koramangala water tank": [12.9261, 77.6221, "Koramangala Water Tank Junction"],
  "yeshwanthpur": [13.0227, 77.5532, "Yeshwanthpur Circle"],
  "town hall": [12.9632, 77.5843, "Town Hall Junction"],
  "goruguntepalya": [13.0284, 77.5409, "Goruguntepalya Junction"],
  "richmond circle": [12.9602, 77.5982, "Richmond Circle"]
};

export default function MapView({ sectors, incidents, filters, mapData, onLocationUpdate }) {
  const [hoveredSector, setHoveredSector] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mapType, setMapType] = useState('gis'); // 'svg' or 'gis'

  // Location features states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);
  const [isPinning, setIsPinning] = useState(false);
  const [userPin, setUserPin] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);
  const isPinningRef = useRef(false);
  const updateDashboardLocationRef = useRef(null);

  useEffect(() => {
    isPinningRef.current = isPinning;
  }, [isPinning]);

  const updateDashboardLocation = (lat, lng) => {
    let nearestKey = null;
    let minDistance = Infinity;
    for (const key of Object.keys(LOCAL_JUNCTIONS)) {
      const coords = LOCAL_JUNCTIONS[key];
      const dist = Math.pow(coords[0] - lat, 2) + Math.pow(coords[1] - lng, 2);
      if (dist < minDistance) {
        minDistance = dist;
        nearestKey = key;
      }
    }

    if (nearestKey && onLocationUpdate) {
      const JUNCTION_MAPPING = {
        "silk board": { junction: "SilkBoardJunc", zone: "Downtown Core", corridor: "Hosur Road" },
        "adugodi": { junction: "AdugodiJunc", zone: "Downtown Core", corridor: "Hosur Road" },
        "hebbal": { junction: "HebbalFlyoverJunc", zone: "Uptown Zone", corridor: "Bellary Road 1" },
        "dairy circle": { junction: "DairyCircle", zone: "Downtown Core", corridor: "Bannerghata Road" },
        "sony world": { junction: "SonyworldJunction", zone: "Downtown Core", corridor: "Old Airport Road" },
        "hope farm": { junction: "HopefarmJunction", zone: "East Corridor", corridor: "Varthur Road" },
        "trinity circle": { junction: "TrinityCircle", zone: "Downtown Core", corridor: "Old Madras Road" },
        "agara": { junction: "AgaraJunction", zone: "Downtown Core", corridor: "ORR East 1" },
        "mekhri circle": { junction: "MekhriCircle", zone: "Uptown Zone", corridor: "Bellary Road 1" },
        "koramangala water tank": { junction: "KoramangalaWaterTankJunc", zone: "Downtown Core", corridor: "Hosur Road" },
        "yeshwanthpur": { junction: "YeshwanthpuraCircle", zone: "Westside Zone", corridor: "Tumkur Road" },
        "town hall": { junction: "TownhallJunction", zone: "Downtown Core", corridor: "CBD 1" },
        "goruguntepalya": { junction: "GoruguntepalyaJunc", zone: "Westside Zone", corridor: "Tumkur Road" },
        "richmond circle": { junction: "RichmondCircle", zone: "Downtown Core", corridor: "CBD 2" }
      };

      const mappedFilters = JUNCTION_MAPPING[nearestKey];
      if (mappedFilters) {
        onLocationUpdate(mappedFilters);
      }
    }
  };

  useEffect(() => {
    updateDashboardLocationRef.current = updateDashboardLocation;
  }, [onLocationUpdate]);

  // Map sector ID to color styles matching traffic standards
  const getSectorStyles = (congestion) => {
    if (congestion < 35) {
      return {
        fill: 'rgba(46, 125, 50, 0.15)',
        stroke: 'var(--success)'
      };
    } else if (congestion < 65) {
      return {
        fill: 'rgba(237, 108, 2, 0.15)',
        stroke: 'var(--warning)'
      };
    } else {
      return {
        fill: 'rgba(198, 40, 40, 0.25)',
        stroke: 'var(--danger)'
      };
    }
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left + 15,
      y: e.clientY - rect.top + 15
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      const center = mapData?.center || [12.9716, 77.5946];
      const map = L.map(mapRef.current, {
        center: center,
        zoom: 14,
        zoomControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(map);

      map.on('click', (e) => {
        if (isPinningRef.current) {
          const { lat, lng } = e.latlng;
          setUserPin({ lat, lng });
          setIsPinning(false);
          if (updateDashboardLocationRef.current) {
            updateDashboardLocationRef.current(lat, lng);
          }
        }
      });

      map.on('locationfound', (e) => {
        setLiveLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        setIsLocating(false);
        if (updateDashboardLocationRef.current) {
          updateDashboardLocationRef.current(e.latlng.lat, e.latlng.lng);
        }
      });

      map.on('locationerror', (err) => {
        console.error("Leaflet locate failed:", err);
        alert("Geolocation failed. Defaulting to simulated live location (Bengaluru).");
        const mockLat = 12.9716 + (Math.random() - 0.5) * 0.02;
        const mockLng = 77.5946 + (Math.random() - 0.5) * 0.02;
        setLiveLocation({ lat: mockLat, lng: mockLng });
        setIsLocating(false);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([mockLat, mockLng], 15);
        }
        if (updateDashboardLocationRef.current) {
          updateDashboardLocationRef.current(mockLat, mockLng);
        }
      });

      layersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    const cleanQuery = searchQuery.toLowerCase().trim();
    
    // 1. Search locally
    let localMatch = null;
    for (const key of Object.keys(LOCAL_JUNCTIONS)) {
      if (key.includes(cleanQuery) || cleanQuery.includes(key)) {
        localMatch = LOCAL_JUNCTIONS[key];
        break;
      }
    }

    if (localMatch) {
      const [lat, lng, name] = localMatch;
      setSearchResult({ lat, lng, label: name });
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 15);
      }
      updateDashboardLocation(lat, lng);
      return;
    }

    // 2. Fetch from Nominatim (OpenStreetMap geocoding)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const first = data[0];
          const lat = parseFloat(first.lat);
          const lng = parseFloat(first.lon);
          setSearchResult({ lat, lng, label: first.display_name });
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lng], 15);
          }
          updateDashboardLocation(lat, lng);
        } else {
          alert("Location not found. Try searching for a known junction like 'Silk Board' or 'Hebbal'.");
        }
      })
      .catch(err => {
        console.error("Geocoding failed:", err);
        alert("Search failed. Please check your internet connection.");
      });
  };

  const handleGetLiveLocation = () => {
    if (!mapInstanceRef.current) return;
    setIsLocating(true);
    mapInstanceRef.current.locate({ setView: true, maxZoom: 15 });
  };

  const handleClearCustomMarkers = () => {
    setUserPin(null);
    setLiveLocation(null);
    setSearchResult(null);
    setSearchQuery('');
  };

  // Recenter and Redraw Layers when mapData or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    if (!mapData) return;

    if (mapData.corridorRoute && mapData.corridorRoute.length > 0) {
      const bounds = L.latLngBounds(mapData.corridorRoute);
      if (mapData.center) {
        bounds.extend(mapData.center);
      }
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (mapData.center) {
      map.setView(mapData.center, 14);
    }

    // 1. Add Incident Marker
    if (mapData.center) {
      const cause = filters?.cause || 'Unknown';
      const corridor = filters?.corridor || 'Unknown';
      const zone = filters?.zone || 'Unknown';
      const junction = filters?.junction || 'Unknown';
      const veh_type = filters?.veh_type || 'Unknown';

      const popupContent = `
        <div style="font-family: 'Public Sans', sans-serif; font-size: 12px; color: #1f2937; min-width: 160px; padding: 4px;">
          <h4 style="margin: 0 0 6px 0; color: #c62828; font-weight: bold; border-bottom: 1px solid #d7dee8; padding-bottom: 4px; font-size: 13px;">Active Bottleneck</h4>
          <div style="margin-top: 4px; line-height: 1.5;">
            <b>Cause:</b> ${cause.replace('_', ' ').toUpperCase()}<br/>
            <b>Corridor:</b> ${corridor}<br/>
            <b>Zone:</b> ${zone}<br/>
            <b>Junction:</b> ${junction}<br/>
            <b>Vehicle:</b> ${veh_type.replace('_', ' ').toUpperCase()}<br/>
          </div>
        </div>
      `;

      const incidentIcon = L.divIcon({
        className: 'custom-incident-marker',
        html: `<div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.2);
          border: 2px solid #ef4444;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        "><div style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      L.marker(mapData.center, { icon: incidentIcon })
        .bindPopup(popupContent)
        .addTo(layersGroup);
    }

    // 2. Add Barricade Points
    if (mapData.barricades) {
      mapData.barricades.forEach((barricade, index) => {
        let coords, type, label;
        
        // Handle both old array format and new object format
        if (Array.isArray(barricade)) {
          coords = barricade;
          type = 'road_block';
          label = 'Lanes Closed: Direct traffic to alternate side.';
        } else {
          coords = barricade.coords;
          type = barricade.type;
          label = barricade.label;
        }

        if (!coords || coords.length < 2) return;

        let bColor = '#d97706'; // amber
        let bFill = '#f59e0b';
        let popupTitle = `Barricade Point #${index + 1}`;
        
        if (type === 'entry') {
          bColor = '#00bcd4';
          bFill = '#00bcd4';
          popupTitle = 'Diversion Entry';
        } else if (type === 'exit') {
          bColor = '#2e7d32';
          bFill = '#4caf50';
          popupTitle = 'Diversion Exit';
        } else if (type === 'road_block') {
          bColor = '#d32f2f';
          bFill = '#ef5350';
          popupTitle = 'Road Block';
        }

        const barricadePopup = `
          <div style="font-family: 'Public Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 2px;">
            <b style="color: ${bColor}; font-size: 12px;">${popupTitle}</b><br/>
            ${label}
          </div>
        `;

        L.circleMarker(coords, {
          radius: type === 'road_block' ? 8 : 6,
          color: bColor,
          fillColor: bFill,
          fillOpacity: 0.8,
          weight: 2
        })
          .bindPopup(barricadePopup)
          .addTo(layersGroup);
      });
    }

    // 3. Add Suggested Diversion Routes
    if (mapData.routes && mapData.routes.length > 0) {
      mapData.routes.forEach(routeObj => {
        if (!routeObj.geometry || routeObj.geometry.length === 0) return;
        
        let routeColor = '#00bcd4'; // Cyan default
        if (routeObj.rank === 1) routeColor = '#00bcd4'; // Cyan (Primary)
        else if (routeObj.rank === 2) routeColor = '#2e7d32'; // Green (Secondary)
        else routeColor = '#f59e0b'; // Amber (Backup)
        
        // Slightly lower opacity and weight for lower ranked routes
        const routeWeight = routeObj.rank === 1 ? 5 : 4;
        const routeOpacity = routeObj.rank === 1 ? 0.85 : 0.65;
        const dashArray = routeObj.rank > 1 ? '10, 5' : null;

        const routePopup = `
          <div style="font-family: 'Public Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 2px;">
            <b style="color: ${routeColor}; font-size: 12px;">${routeObj.name}</b><br/>
            Rank: ${routeObj.rank}<br/>
            Distance: ${routeObj.distance_km} km<br/>
            ETA: ${routeObj.eta_mins} mins
          </div>
        `;

        L.polyline(routeObj.geometry, {
          color: routeColor,
          weight: routeWeight,
          opacity: routeOpacity,
          dashArray: dashArray,
          lineJoin: 'round'
        })
          .bindPopup(routePopup)
          .addTo(layersGroup);
      });
    } else if (mapData.route && mapData.route.length > 0) {
      // Fallback for legacy single route
      const isCustomRoute = mapData.route.length === 4;
      const routeColor = isCustomRoute ? '#2e7d32' : '#00bcd4'; // Green or Cyan
      const routeName = isCustomRoute ? 'Default Suggested Diversion Route' : 'AI Suggested Diversion Path';
      const popupText = isCustomRoute ? 'Standard Bypass Loop: Flow offloaded by 12%.' : 'Diversion Route: Flow offloaded by 15%.';

      const routePopup = `
        <div style="font-family: 'Public Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 2px;">
          <b style="color: ${routeColor}; font-size: 12px;">${routeName}</b><br/>
          ${popupText}
        </div>
      `;

      L.polyline(mapData.route, {
        color: routeColor,
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round'
      })
        .bindPopup(routePopup)
        .addTo(layersGroup);
    }

    // 4. Add Historical Heatmap points
    if (mapData.heatmap) {
      mapData.heatmap.forEach(point => {
        L.circleMarker(point, {
          radius: 12,
          color: '#1565c0',
          fillColor: '#1565c0',
          fillOpacity: 0.15,
          weight: 0
        }).addTo(layersGroup);
      });
    }

    // 4.5. Add Selected Corridor Route
    if (mapData.corridorRoute && mapData.corridorRoute.length > 0) {
      const corridorColor = '#8b5cf6'; // premium violet/purple
      const corridorName = filters?.corridor || 'Selected Corridor';
      const corridorPopup = `
        <div style="font-family: 'Public Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 4px; min-width: 140px;">
          <b style="color: ${corridorColor}; font-size: 12px;">${corridorName}</b><br/>
          Monitoring Corridor Route Segment.
        </div>
      `;

      L.polyline(mapData.corridorRoute, {
        color: corridorColor,
        weight: 6,
        opacity: 0.6,
        lineJoin: 'round'
      })
        .bindPopup(corridorPopup)
        .addTo(layersGroup);
    }

    // 5. Add User Pin Marker
    if (userPin) {
      const pinIcon = L.divIcon({
        className: 'custom-user-pin-marker',
        html: `<div style="display: flex; flex-direction: column; align-items: center; position: relative;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="#ef4444"></circle>
          </svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const userPinPopup = `
        <div style="font-family: 'Public Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 2px;">
          <b style="color: #ef4444; font-size: 12px;">Custom Placed Pin</b><br/>
          <b>Lat:</b> ${userPin.lat.toFixed(5)}<br/>
          <b>Lng:</b> ${userPin.lng.toFixed(5)}<br/>
          <span style="font-size: 10px; color: #64748b;">(Drag me to relocate)</span>
        </div>
      `;

      const marker = L.marker([userPin.lat, userPin.lng], {
        icon: pinIcon,
        draggable: true
      })
        .bindPopup(userPinPopup)
        .addTo(layersGroup);

      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        setUserPin({ lat: newLatLng.lat, lng: newLatLng.lng });
        updateDashboardLocation(newLatLng.lat, newLatLng.lng);
      });
    }

    // 6. Add Live Location Marker
    if (liveLocation) {
      const liveLocIcon = L.divIcon({
        className: 'custom-live-location-marker',
        html: `<div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.35);
          border: 2px solid #3b82f6;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse-blue 2s infinite;
        "><div style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6;"></div></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const liveLocPopup = `
        <div style="font-family: 'Public Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 2px;">
          <b style="color: #3b82f6; font-size: 12px;">Your Location</b><br/>
          <b>Lat:</b> ${liveLocation.lat.toFixed(5)}<br/>
          <b>Lng:</b> ${liveLocation.lng.toFixed(5)}
        </div>
      `;

      L.marker([liveLocation.lat, liveLocation.lng], { icon: liveLocIcon })
        .bindPopup(liveLocPopup)
        .addTo(layersGroup);

      L.circle([liveLocation.lat, liveLocation.lng], {
        radius: 100,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.08,
        weight: 1
      }).addTo(layersGroup);
    }

    // 7. Add Search Result Marker
    if (searchResult) {
      const searchIcon = L.divIcon({
        className: 'custom-search-marker',
        html: `<div style="display: flex; flex-direction: column; align-items: center; position: relative;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3" fill="#f59e0b"></circle>
          </svg>
        </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
      });

      const searchPopup = `
        <div style="font-family: 'Public Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 4px; max-width: 200px;">
          <b style="color: #f59e0b; font-size: 12px;">Search Result</b><br/>
          <div style="margin-top: 4px; line-height: 1.4;">
            ${searchResult.label}
          </div>
          <div style="margin-top: 4px; font-size: 9px; color: #64748b;">
            ${searchResult.lat.toFixed(5)}, ${searchResult.lng.toFixed(5)}
          </div>
        </div>
      `;

      L.marker([searchResult.lat, searchResult.lng], { icon: searchIcon })
        .bindPopup(searchPopup)
        .addTo(layersGroup)
        .openPopup();
    }

  }, [mapData, filters, userPin, liveLocation, searchResult]);

  // Handle map resizing on visibility toggle
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 50);
    }
  }, [mapType]);

  return (
    <div className="glass" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', height: '100%', background: 'var(--card-bg)' }}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes pulse-blue {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
        .custom-incident-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CompassIcon />
            <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-primary)' }}>Live Congestion Map</h2>
          </div>
          
          {/* Map View Toggle Buttons */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button 
              onClick={() => setMapType('svg')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                background: mapType === 'svg' ? 'var(--primary)' : 'transparent',
                color: mapType === 'svg' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              District (SVG)
            </button>
            <button 
              onClick={() => setMapType('gis')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                background: mapType === 'gis' ? 'var(--primary)' : 'transparent',
                color: mapType === 'gis' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Interactive GIS
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span> Normal
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--warning)' }}></span> Moderate
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--danger)' }}></span> Critical
          </span>
        </div>
      </div>

      {/* Map Content Panel */}
      <div 
        style={{ 
          display: mapType === 'gis' ? 'block' : 'none',
          width: '100%', 
          height: '350px', 
          background: '#0f172a', 
          borderRadius: '12px', 
          overflow: 'hidden', 
          border: '1px solid var(--border-color)',
          position: 'relative'
        }}
      >
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

        {/* Floating Search Bar */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#ffffff',
          border: '2px solid var(--primary)',
          borderRadius: '8px',
          padding: '2px 8px',
          boxShadow: 'var(--shadow-md)'
        }}>
          <input 
            type="text" 
            placeholder="Search location or junction..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '12px',
              outline: 'none',
              width: '180px',
              padding: '6px 4px'
            }}
          />
          <button 
            onClick={handleSearch}
            title="Search"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SearchIcon />
          </button>
        </div>

        {/* Floating Map Controls */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <button
            onClick={handleGetLiveLocation}
            title="Locate Me (Live Location)"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isLocating ? 'rgba(15, 76, 129, 0.15)' : '#ffffff',
              border: isLocating ? '2px solid var(--primary)' : '1.5px solid var(--border-color)',
              color: isLocating ? 'var(--primary)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s'
            }}
          >
            <LocateIcon className={isLocating ? 'animate-pulse' : ''} />
          </button>

          <button
            onClick={() => setIsPinning(!isPinning)}
            title={isPinning ? 'Click on map to drop pin (Active)' : 'Pin to Locate'}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isPinning ? 'rgba(198, 40, 40, 0.15)' : '#ffffff',
              border: isPinning ? '2px solid var(--danger)' : '1.5px solid var(--border-color)',
              color: isPinning ? 'var(--danger)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s'
            }}
          >
            <MapPinIcon />
          </button>
          
          {(userPin || liveLocation || searchResult) && (
            <button
              onClick={handleClearCustomMarkers}
              title="Clear Custom Markers"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--danger)',
                border: '1.5px solid var(--danger)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.2s'
              }}
            >
              <TrashIcon />
            </button>
          )}
        </div>

        {/* Pinning overlay banner */}
        {isPinning && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: 'var(--danger)',
            border: '2px solid #ffffff',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            boxShadow: 'var(--shadow-lg)',
            pointerEvents: 'none',
            letterSpacing: '0.02em',
            animation: 'pulse 2s infinite'
          }}>
            Click anywhere on the map to place a pin
          </div>
        )}
      </div>

      {mapType === 'svg' && (
        <div 
          style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', background: '#0f172a', borderRadius: '12px', padding: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}
          onMouseMove={handleMouseMove}
        >
          <svg 
            viewBox="0 0 600 380" 
            style={{ width: '100%', maxHeight: '350px', display: 'block' }}
          >
            {/* Grid Background Lines */}
            <g stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1">
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={`x-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="380" />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`y-${i}`} x1="0" y1={i * 50} x2="600" y2={i * 50} />
              ))}
            </g>

            {/* District 1: Uptown */}
            {sectors.find(s => s.id === 'uptown') && (
              <polygon
                points="10,10 320,10 280,160 10,160"
                style={{
                  fill: getSectorStyles(sectors.find(s => s.id === 'uptown').congestion).fill,
                  stroke: getSectorStyles(sectors.find(s => s.id === 'uptown').congestion).stroke,
                  strokeWidth: '2',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={() => setHoveredSector(sectors.find(s => s.id === 'uptown'))}
                onMouseLeave={() => setHoveredSector(null)}
              />
            )}

            {/* District 2: Westside */}
            {sectors.find(s => s.id === 'westside') && (
              <polygon
                points="10,160 280,160 240,370 10,370"
                style={{
                  fill: getSectorStyles(sectors.find(s => s.id === 'westside').congestion).fill,
                  stroke: getSectorStyles(sectors.find(s => s.id === 'westside').congestion).stroke,
                  strokeWidth: '2',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={() => setHoveredSector(sectors.find(s => s.id === 'westside'))}
                onMouseLeave={() => setHoveredSector(null)}
              />
            )}

            {/* District 3: Downtown */}
            {sectors.find(s => s.id === 'downtown') && (
              <polygon
                points="320,10 590,10 590,260 280,260"
                style={{
                  fill: getSectorStyles(sectors.find(s => s.id === 'downtown').congestion).fill,
                  stroke: getSectorStyles(sectors.find(s => s.id === 'downtown').congestion).stroke,
                  strokeWidth: '2',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={() => setHoveredSector(sectors.find(s => s.id === 'downtown'))}
                onMouseLeave={() => setHoveredSector(null)}
              />
            )}

            {/* District 4: Highway Corridor */}
            {sectors.find(s => s.id === 'highway') && (
              <polygon
                points="280,260 590,260 590,370 240,370"
                style={{
                  fill: getSectorStyles(sectors.find(s => s.id === 'highway').congestion).fill,
                  stroke: getSectorStyles(sectors.find(s => s.id === 'highway').congestion).stroke,
                  strokeWidth: '2',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={() => setHoveredSector(sectors.find(s => s.id === 'highway'))}
                onMouseLeave={() => setHoveredSector(null)}
              />
            )}

            {/* Arterial Highway Overlay Lines */}
            <path 
              d="M 150,10 Q 300,190 450,370" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.1)" 
              strokeWidth="3" 
              strokeDasharray="5,5" 
            />
            <path 
              d="M 10,200 L 590,200" 
              fill="none" 
              stroke="rgba(255, 255, 255, 0.1)" 
              strokeWidth="3" 
              strokeDasharray="5,5" 
            />

            {/* Texts indicating sector labels */}
            <text x="120" y="80" fill="rgba(255, 255, 255, 0.45)" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}>UPTOWN</text>
            <text x="100" y="270" fill="rgba(255, 255, 255, 0.45)" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}>WESTSIDE</text>
            <text x="420" y="130" fill="rgba(255, 255, 255, 0.45)" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}>DOWNTOWN CORE</text>
            <text x="370" y="325" fill="rgba(255, 255, 255, 0.45)" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none', letterSpacing: '0.05em' }}>HIGHWAY 101 LINK</text>

            {/* Incident Pins */}
            {incidents.map((inc) => {
              let coords = { x: 300, y: 190 };
              if (inc.sector === 'uptown') coords = { x: 160, y: 110 };
              else if (inc.sector === 'westside') coords = { x: 120, y: 220 };
              else if (inc.sector === 'downtown') coords = { x: 450, y: 80 };
              else if (inc.sector === 'highway') coords = { x: 420, y: 290 };

              return (
                <g key={inc.id} style={{ cursor: 'pointer' }}>
                  <circle cx={coords.x} cy={coords.y} r="18" fill="rgba(198, 40, 40, 0.15)" stroke="var(--danger)" strokeWidth="1" strokeDasharray="3,2" />
                  <circle cx={coords.x} cy={coords.y} r="6" fill="var(--danger)" />
                  <path 
                    d={`M ${coords.x} ${coords.y} L ${coords.x - 10} ${coords.y - 25} L ${coords.x + 40} ${coords.y - 25}`} 
                    stroke="rgba(255, 255, 255, 0.25)" 
                    strokeWidth="1" 
                    fill="none" 
                  />
                  <text x={coords.x + 8} y={coords.y - 29} fill="var(--danger)" fontSize="10" fontWeight="800">
                    {inc.type}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Dynamic Tooltip Popup overlay (Light Solid Color Card for perfect contrast) */}
          {hoveredSector && (
            <div 
              style={{
                position: 'absolute',
                top: tooltipPos.y,
                left: tooltipPos.x,
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '14px',
                pointerEvents: 'none',
                boxShadow: 'var(--shadow-md)',
                zIndex: 10,
                minWidth: '190px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '0.02em' }}>
                  {hoveredSector.name}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Congestion:</span>
                <span style={{ fontWeight: '700', color: hoveredSector.congestion > 65 ? 'var(--danger)' : hoveredSector.congestion > 35 ? 'var(--warning)' : 'var(--success)' }}>
                  {hoveredSector.congestion}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Flow Speed:</span>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{hoveredSector.speed} mph</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Traffic Load:</span>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{hoveredSector.flowRate} veh/h</span>
              </div>
              {hoveredSector.diversionActive && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(15, 76, 129, 0.08)', borderRadius: '4px', padding: '4px 6px', marginTop: '6px', fontSize: '10px', color: 'var(--primary)', fontWeight: '700' }}>
                  <ArrowUpRightIcon />
                  <span>AI Diversion Active</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
