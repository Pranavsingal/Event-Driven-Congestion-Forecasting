import React, { useState, useEffect, useRef } from 'react';
import { Compass, ArrowUpRight, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView({ sectors, incidents, filters, mapData }) {
  const [hoveredSector, setHoveredSector] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [mapType, setMapType] = useState('gis'); // 'svg' or 'gis'
  const [searchQuery, setSearchQuery] = useState('');

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef(null);
  const userMarkerRef = useRef(null);
  const searchMarkerRef = useRef(null);

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

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCenter = [latitude, longitude];
          const map = mapInstanceRef.current;
          if (map) {
            map.flyTo(userCenter, 15);
            
            if (userMarkerRef.current) {
              userMarkerRef.current.remove();
            }
            
            const userIcon = L.divIcon({
              className: 'custom-user-marker',
              html: `<div style="
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: rgba(59, 130, 246, 0.25);
                border: 2px solid #3b82f6;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: userPulse 2s infinite;
              "><div style="width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; box-shadow: 0 0 8px #3b82f6;"></div></div>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            });
            
            userMarkerRef.current = L.marker(userCenter, { icon: userIcon })
              .bindPopup('<div style="font-family: \'Public Sans\', sans-serif; font-size: 11px; font-weight: bold; color: #1f2937;">Your Current Location</div>')
              .addTo(map)
              .openPopup();
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not retrieve your location. Make sure location permissions are enabled.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const addSearchMarker = (coords, label) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
    }
    
    const searchIcon = L.divIcon({
      className: 'custom-search-marker',
      html: `<div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.25);
        border: 2px solid #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
      "><div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981;"></div></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    searchMarkerRef.current = L.marker(coords, { icon: searchIcon })
      .bindPopup(`<div style="font-family: 'Public Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 2px;"><b>Search Result:</b><br/>${label}</div>`)
      .addTo(map)
      .openPopup();
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.trim().toLowerCase();
    const latLngMatch = query.match(/^([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)$/);
    const map = mapInstanceRef.current;
    if (map) {
      if (latLngMatch) {
        const lat = parseFloat(latLngMatch[1]);
        const lng = parseFloat(latLngMatch[2]);
        map.flyTo([lat, lng], 15);
        addSearchMarker([lat, lng], `Coordinates: ${lat}, ${lng}`);
        return;
      }
      
      const matchedSector = sectors.find(s => s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query));
      if (matchedSector) {
        let coords = [12.9716, 77.5946];
        if (matchedSector.id === 'uptown') coords = [13.0180, 77.5794];
        else if (matchedSector.id === 'westside') coords = [12.9449, 77.4949];
        else if (matchedSector.id === 'downtown') coords = [12.9731, 77.6174];
        else if (matchedSector.id === 'highway') coords = [12.9283, 77.6691];
        
        map.flyTo(coords, 15);
        addSearchMarker(coords, `Sector: ${matchedSector.name}`);
        return;
      }
      
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const firstResult = data[0];
            const lat = parseFloat(firstResult.lat);
            const lon = parseFloat(firstResult.lon);
            map.flyTo([lat, lon], 15);
            addSearchMarker([lat, lon], firstResult.display_name);
          } else {
            alert(`Location "${searchQuery}" not found.`);
          }
        })
        .catch(err => {
          console.error("Geocoding failed:", err);
          alert("Error searching for location.");
        });
    }
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

  // Recenter and Redraw Layers when mapData or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();

    // Clear search and user markers on filter/data changes
    if (searchMarkerRef.current) {
      searchMarkerRef.current.remove();
      searchMarkerRef.current = null;
    }
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    if (!mapData) return;

    if (mapData.center) {
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
        const barricadePopup = `
          <div style="font-family: 'Public Sans', sans-serif; font-size: 11px; color: #1f2937; padding: 2px;">
            <b style="color: #ed6c02; font-size: 12px;">Barricade Point #${index + 1}</b><br/>
            Lanes Closed: Direct traffic to alternate side.
          </div>
        `;

        L.circleMarker(barricade, {
          radius: 8,
          color: '#d97706',
          fillColor: '#f59e0b',
          fillOpacity: 0.8,
          weight: 2
        })
          .bindPopup(barricadePopup)
          .addTo(layersGroup);
      });
    }

    // 3. Add Suggested Diversion Route
    if (mapData.route && mapData.route.length > 0) {
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

  }, [mapData, filters]);

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
        @keyframes userPulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 12px rgba(59, 130, 246, 0.6); }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
        .custom-incident-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-user-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-search-marker {
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
            <Compass size={18} color="var(--primary)" />
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

        {/* Floating Search Controls */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1000, display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            placeholder="Search location or coordinates..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              width: '200px',
              padding: '8px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              background: 'rgba(15, 23, 42, 0.85)',
              color: '#fff',
              backdropFilter: 'blur(6px)',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
          <button 
            onClick={handleSearch}
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              borderRadius: '6px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '700',
              boxShadow: 'var(--shadow-sm)',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = 'var(--primary-light)'}
            onMouseOut={(e) => e.target.style.background = 'var(--primary)'}
          >
            Search
          </button>
        </div>

        {/* Floating Geolocation Button */}
        <button
          onClick={handleLocate}
          title="Locate Me"
          style={{
            position: 'absolute',
            bottom: '16px',
            right: '16px',
            zIndex: 1000,
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid var(--border-color)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          <Navigation size={16} />
        </button>
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
                  <ArrowUpRight size={12} />
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
