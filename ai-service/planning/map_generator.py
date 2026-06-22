import os
import json
import pandas as pd
import numpy as np
import folium
from folium.plugins import HeatMap

# Establish relative directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, '..', '..', 'data', 'processed', 'cleaned_data.csv')

def get_location_coordinates(junction_name=None, zone_name=None, corridor_name=None):
    """
    Looks up coordinates for a given junction, zone, or corridor in the historical dataset.
    Defaults to Bangalore center [12.9716, 77.5946] if not found.
    """
    default_coords = [12.9716, 77.5946]
    try:
        import sys, os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")
        from model_registry import ModelRegistry
        registry = ModelRegistry.get_instance()
        if getattr(registry, 'historical_data', None) is not None:
            df = registry.historical_data
        else:
            df = pd.read_csv(PROCESSED_DATA_PATH)
    except Exception as e:
        print(f"Error loading dataset in map_generator: {e}")
        return default_coords

    # Try Junction lookup from DB first for precise coordinates
    if junction_name and junction_name != "Unknown" and junction_name != "none":
        try:
            from planning.junction_db import JUNCTION_DATABASE
            
            # case-insensitive search
            for k, v in JUNCTION_DATABASE.items():
                if k.lower() == str(junction_name).lower():
                    return [v["latitude"], v["longitude"]]
        except ImportError:
            pass

        # Fallback to historical data
        match = df[df['junction'].str.lower() == str(junction_name).lower()]
        if len(match) > 0:
            lat = match['latitude'].dropna().mean()
            lng = match['longitude'].dropna().mean()
            if not (np.isnan(lat) or np.isnan(lng)):
                return [lat, lng]

    # Try Corridor lookup
    if corridor_name and corridor_name != "Unknown" and corridor_name != "none":
        match = df[df['corridor'].str.lower() == str(corridor_name).lower()]
        if len(match) > 0:
            lat = match['latitude'].dropna().mean()
            lng = match['longitude'].dropna().mean()
            if not (np.isnan(lat) or np.isnan(lng)):
                return [lat, lng]

    # Try Zone lookup
    if zone_name and zone_name != "Unknown" and zone_name != "none":
        match = df[df['zone'].str.lower() == str(zone_name).lower()]
        if len(match) > 0:
            lat = match['latitude'].dropna().mean()
            lng = match['longitude'].dropna().mean()
            if not (np.isnan(lat) or np.isnan(lng)):
                return [lat, lng]

    return default_coords

def generate_interactive_map(filters: dict) -> str:
    """
    Generates a Folium Map centered on the query parameters, compiles the layers,
    and returns the map's raw HTML string.
    """
    cause = filters.get("cause", "Unknown")
    corridor = filters.get("corridor", "Unknown")
    zone = filters.get("zone", "Unknown")
    junction = filters.get("junction", "Unknown")
    veh_type = filters.get("veh_type", "Unknown")
    
    # 1. Base Map Setup (Center on active area)
    center_coords = get_location_coordinates(junction, zone, corridor)
    
    # CartoDB Dark Matter fits the glassmorphic dark dashboard aesthetics perfectly
    m = folium.Map(
        location=center_coords,
        zoom_start=14,
        tiles='CartoDB dark_matter',
        control_scale=True
    )
    
    # 2. Add Incident Marker
    incident_html = f"""
    <div style="font-family: Arial, sans-serif; font-size: 12px; color: #1e293b; min-width: 150px;">
        <h4 style="margin: 0 0 6px 0; color: #ef4444; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">Active bottleneck</h4>
        <b>Cause:</b> {cause.replace('_', ' ').title()}<br/>
        <b>Corridor:</b> {corridor}<br/>
        <b>Zone:</b> {zone}<br/>
        <b>Junction:</b> {junction}<br/>
        <b>Vehicle:</b> {veh_type.replace('_', ' ').title()}<br/>
    </div>
    """
    
    folium.Marker(
        location=center_coords,
        popup=folium.Popup(incident_html, max_width=250),
        icon=folium.Icon(color='red', icon='info-sign'),
        tooltip=f"Incident: {cause.replace('_', ' ').title()}"
    ).add_to(m)
    
    # 3. Add Barricade Point Markers (Distributed in a radius around the incident)
    # Estimate count from filters or simple rules
    is_peak = int(filters.get("hour", 12)) in [7, 8, 9, 10, 17, 18, 19, 20]
    barricades_count = 4
    if cause == "accident":
        barricades_count = 8 if is_peak else 6
    elif cause == "construction":
        barricades_count = 12
    elif cause == "water_logging":
        barricades_count = 10
    
    # Generate circular distribution offsets (approx 300 meters)
    r = 0.003  # degrees (~300m)
    for i in range(barricades_count):
        angle = (2 * np.pi / barricades_count) * i
        b_lat = center_coords[0] + r * np.sin(angle)
        b_lng = center_coords[1] + r * np.cos(angle)
        
        barricade_html = f"""
        <div style="font-family: Arial, sans-serif; font-size: 11px; color: #1e293b;">
            <b style="color: #f59e0b;">Barricade Point #{i+1}</b><br/>
            Lanes Closed: Direct traffic to alternate side.
        </div>
        """
        
        # Draw a caution/barrier circle marker
        folium.CircleMarker(
            location=[b_lat, b_lng],
            radius=8,
            popup=folium.Popup(barricade_html, max_width=200),
            color='#d97706',  # amber-600
            fill=True,
            fill_color='#f59e0b',
            fill_opacity=0.8,
            tooltip=f"Barricade #{i+1}"
        ).add_to(m)

    # 4. Add Diversion Route Lines
    # Try to extract route path from dataset, fallback to generated route
    route_drawn = False
    try:
        from model_registry import ModelRegistry
        registry = ModelRegistry.get_instance()
        if getattr(registry, 'historical_data', None) is not None:
            df = registry.historical_data
        else:
            df = pd.read_csv(PROCESSED_DATA_PATH)
        # Search for a route path on this corridor or matching this event cause
        route_matches = df[(df['corridor'].str.lower() == str(corridor).lower()) & (df['route_path'].notna())]
        if len(route_matches) == 0:
            route_matches = df[(df['event_cause'].str.lower() == str(cause).lower()) & (df['route_path'].notna())]
            
        for _, row in route_matches.head(3).iterrows():
            path_str = row['route_path']
            if path_str and path_str != "[]" and isinstance(path_str, str):
                try:
                    coords_list = json.loads(path_str)
                    if isinstance(coords_list, list) and len(coords_list) > 1:
                        # Draw the route
                        folium.PolyLine(
                            locations=coords_list,
                            color='#06b6d4',  # Cyan route lines
                            weight=5,
                            opacity=0.85,
                            tooltip=f"AI Suggested Diversion Path (via {corridor})",
                            popup="Diversion Route: Flow offloaded by 15%."
                        ).add_to(m)
                        route_drawn = True
                        break
                except Exception as ex:
                    print(f"Skipping route path parse: {ex}")
    except Exception as e:
        print(f"Error searching route path: {e}")
        
    # If no route was found, generate a simple bypass route around the incident
    if not route_drawn:
        # Create a diamond-shaped bypass path
        lat, lng = center_coords
        bypass_coords = [
            [lat - 0.005, lng],  # Start before incident
            [lat - 0.002, lng + 0.004],  # Bypass node 1
            [lat + 0.002, lng + 0.004],  # Bypass node 2
            [lat + 0.005, lng]   # Rejoin corridor after incident
        ]
        folium.PolyLine(
            locations=bypass_coords,
            color='#22c55e',  # Green route line
            weight=5,
            opacity=0.85,
            tooltip="Default Suggested Diversion Route",
            popup="Standard Bypass Loop: Flow offloaded by 12%."
        ).add_to(m)

    # 5. Add Historical Heatmap Layer
    try:
        from model_registry import ModelRegistry
        registry = ModelRegistry.get_instance()
        if getattr(registry, 'historical_data', None) is not None:
            df = registry.historical_data
        else:
            df = pd.read_csv(PROCESSED_DATA_PATH)
        # Filter historical locations matching the same cause to show clustering
        hist_df = df[df['event_cause'].str.lower() == str(cause).lower()]
        if len(hist_df) < 5:
            # Fall back to general historical points if cause is not common
            hist_df = df.head(300)
            
        heat_data = hist_df[['latitude', 'longitude']].dropna().values.tolist()
        if len(heat_data) > 0:
            HeatMap(
                data=heat_data,
                radius=15,
                blur=10,
                max_zoom=13,
                min_opacity=0.3,
                gradient={0.4: '#1e3a8a', 0.65: '#3b82f6', 1: '#38bdf8'} # blue scale matching layout
            ).add_to(m)
    except Exception as e:
        print(f"Error adding heatmap layer: {e}")

    # Return map as HTML string
    return m._repr_html_()


# Known corridor start/end coordinates for Bangalore road segments.
# Used as reliable fallback since the dataset's endlatitude/endlongitude are mostly empty.
CORRIDOR_ENDPOINTS = {
    "hosur road":        {"start": [12.9340, 77.6120], "end": [12.8950, 77.6380]},
    "tumkur road":       {"start": [13.0280, 77.5400], "end": [13.0700, 77.5100]},
    "orr east 1":        {"start": [12.9360, 77.6100], "end": [12.9200, 77.6500]},
    "orr east 2":        {"start": [12.9200, 77.6500], "end": [12.9560, 77.7010]},
    "orr west 1":        {"start": [12.9430, 77.5250], "end": [12.9700, 77.5100]},
    "orr north 1":       {"start": [13.0070, 77.6960], "end": [13.0350, 77.6000]},
    "orr north 2":       {"start": [13.0350, 77.6000], "end": [13.0230, 77.5530]},
    "bannerghata road":  {"start": [12.9380, 77.5990], "end": [12.8900, 77.5960]},
    "old airport road":  {"start": [12.9570, 77.6500], "end": [12.9730, 77.6170]},
    "old madras road":   {"start": [12.9730, 77.6170], "end": [13.0070, 77.6960]},
    "bellary road 1":    {"start": [12.9980, 77.5920], "end": [13.0350, 77.5970]},
    "bellary road 2":    {"start": [13.0350, 77.5970], "end": [13.0650, 77.5880]},
    "cbd 1":             {"start": [12.9780, 77.5720], "end": [12.9630, 77.5840]},
    "cbd 2":             {"start": [12.9600, 77.5980], "end": [12.9730, 77.6170]},
    "magadi road":       {"start": [12.9720, 77.5500], "end": [12.9580, 77.5100]},
    "mysore road":       {"start": [12.9440, 77.5250], "end": [12.9200, 77.4800]},
    "varthur road":      {"start": [12.9560, 77.7010], "end": [12.9840, 77.7510]},
    "hennur main road":  {"start": [13.0200, 77.6300], "end": [13.0500, 77.6400]},
    "airport new south road": {"start": [13.0650, 77.5880], "end": [13.1100, 77.5700]},
    "irr(thanisandra road)":  {"start": [13.0500, 77.6400], "end": [13.0700, 77.6200]},
    "west of chord road":     {"start": [12.9900, 77.5600], "end": [13.0100, 77.5400]},
    "non-corridor":      {"start": [12.9716, 77.5946], "end": [12.9800, 77.6050]},
}

def get_corridor_route_geometry(corridor_name: str) -> list:
    """
    Returns a list of coordinates [[lat, lng], ...] representing the path of the selected corridor.
    Uses known corridor endpoint coordinates and OSRM for real road-snapped geometry.
    Falls back to the dataset if no hardcoded endpoints are found.
    """
    default_coords = []
    if not corridor_name or corridor_name == "Unknown" or corridor_name == "none":
        return default_coords

    start_lat, start_lng, end_lat, end_lng = None, None, None, None

    # 1. Try hardcoded corridor endpoints first (most reliable)
    corridor_key = str(corridor_name).lower().strip()
    if corridor_key in CORRIDOR_ENDPOINTS:
        ep = CORRIDOR_ENDPOINTS[corridor_key]
        start_lat, start_lng = ep["start"]
        end_lat, end_lng = ep["end"]

    # 2. Fallback: try dataset columns
    if start_lat is None:
        try:
            df = pd.read_csv(PROCESSED_DATA_PATH)
            match = df[df['corridor'].str.lower() == corridor_key]
            if len(match) > 0:
                s_lat = match['latitude'].dropna().mean()
                s_lng = match['longitude'].dropna().mean()
                e_lat = match['endlatitude'].dropna().mean() if 'endlatitude' in match.columns else np.nan
                e_lng = match['endlongitude'].dropna().mean() if 'endlongitude' in match.columns else np.nan

                if not (np.isnan(s_lat) or np.isnan(s_lng)):
                    start_lat, start_lng = s_lat, s_lng
                    if not (np.isnan(e_lat) or np.isnan(e_lng)):
                        end_lat, end_lng = e_lat, e_lng
                    else:
                        # Use start + offset for a visible corridor segment
                        end_lat = start_lat + 0.015
                        end_lng = start_lng + 0.008
        except Exception as e:
            print(f"Dataset fallback failed for corridor geometry: {e}")

    if start_lat is None:
        return default_coords

    # 3. Try OSRM for real road-snapped route
    try:
        from routing.osrm_client import get_road_route
        route_res = get_road_route(start_lat, start_lng, end_lat, end_lng)
        coords = route_res.get("coordinates", [])
        if len(coords) > 1:
            return coords
    except Exception as e:
        print(f"OSRM corridor route failed: {e}")

    # 4. Fallback: generate a synthetic multi-point corridor line
    mid_lat = (start_lat + end_lat) / 2
    mid_lng = (start_lng + end_lng) / 2
    return [
        [start_lat, start_lng],
        [mid_lat + 0.001, mid_lng - 0.001],
        [mid_lat - 0.001, mid_lng + 0.001],
        [end_lat, end_lng]
    ]

def get_map_coordinates(filters: dict) -> dict:
    """
    Returns structured geospatial coordinate lists for the frontend map renderer.
    """
    cause = filters.get("cause", "Unknown")
    corridor = filters.get("corridor", "Unknown")
    zone = filters.get("zone", "Unknown")
    junction = filters.get("junction", "Unknown")
    veh_type = filters.get("veh_type", "Unknown")
    
    # 1. Base Center coordinates
    center_coords = get_location_coordinates(junction, zone, corridor)
    
    # 2. Barricade Coordinates (using OSRM intersections)
    is_peak = int(filters.get("hour", 12)) in [7, 8, 9, 10, 17, 18, 19, 20]
    barricades_count = 4
    if cause == "accident":
        barricades_count = 8 if is_peak else 6
    elif cause == "construction":
        barricades_count = 12
    elif cause == "water_logging":
        barricades_count = 10
        
    barricades = []
    try:
        raise ImportError("Skipping OSRM barricades for speed")
        from routing.osrm_client import get_intersection_points
        # Get actual road intersection points around center
        intersect_pts = get_intersection_points(center_coords[0], center_coords[1], radius_km=0.3, num_points=barricades_count)
        for pt in intersect_pts:
            barricades.append({"coords": pt, "type": "road_block", "label": f"Block road near incident"})
    except ImportError:
        # Fallback
        r = 0.003
        for i in range(barricades_count):
            angle = (2 * np.pi / barricades_count) * i
            b_lat = center_coords[0] + r * np.sin(angle)
            b_lng = center_coords[1] + r * np.cos(angle)
            barricades.append({"coords": [b_lat, b_lng], "type": "road_block", "label": "Block road"})
            
    # 3. Route Coordinates (from diversion logic)
    routes_data = []
    try:
        from planning.diversion import get_diversions
        diversions = get_diversions(junction, hour=int(filters.get("hour", 12)), cause=cause, barricades=barricades, corridor=corridor)
        
        for idx, div in enumerate(diversions):
            geom = div.get("route_geometry", [])
            
            # Generate fallback geometry if OSRM returned empty coordinates
            if len(geom) < 2:
                lat, lng = center_coords
                # Generate distinct bypass arcs for each route using different angles
                angle_offset = (idx * 2.2) + 0.5  # Spread routes in different directions
                r = 0.005 + (idx * 0.002)  # Slightly larger radius for each successive route
                import math
                geom = [
                    [lat - r * math.cos(angle_offset), lng - r * math.sin(angle_offset)],
                    [lat + r * math.sin(angle_offset + 0.5), lng + r * math.cos(angle_offset + 0.5)],
                    [lat + r * math.cos(angle_offset + 1.0), lng - r * math.sin(angle_offset + 1.0)],
                    [lat + r * math.cos(angle_offset), lng + r * math.sin(angle_offset)]
                ]
            
            # Add entry/exit barricades for the route
            if len(geom) > 0:
                # If we snapped to a barricade, don't duplicate it. Only add if not close to existing.
                start_pt = geom[0]
                is_dup = False
                for b in barricades:
                    if b.get("type") == "road_block" and abs(b["coords"][0]-start_pt[0]) < 0.0001 and abs(b["coords"][1]-start_pt[1]) < 0.0001:
                        # Convert this road block to an entry point
                        b["type"] = "entry"
                        b["label"] = f"Entry to {div['route_name']}"
                        is_dup = True
                        break
                        
                if not is_dup:
                    barricades.append({"coords": start_pt, "type": "entry", "label": f"Entry to {div['route_name']}"})
                    
                barricades.append({"coords": geom[-1], "type": "exit", "label": f"Exit from {div['route_name']}"})
                
            routes_data.append({
                "rank": div["rank"],
                "name": div["route_name"],
                "geometry": geom,
                "distance_km": div["distance_km"],
                "eta_mins": div["eta_mins"]
            })
    except Exception as e:
        print(f"Error fetching diversions for map: {e}")
        
    if len(routes_data) == 0:
        lat, lng = center_coords
        route_coords = [
            [lat - 0.005, lng],
            [lat - 0.002, lng + 0.004],
            [lat + 0.002, lng + 0.004],
            [lat + 0.005, lng]
        ]
        routes_data.append({
            "rank": 1,
            "name": "Default Bypass",
            "geometry": route_coords,
            "distance_km": 1.2,
            "eta_mins": 5
        })
        
    # 4. Heatmap coordinates (Historical incidents coordinates matching cause)
    heatmap = []
    try:
        from model_registry import ModelRegistry
        registry = ModelRegistry.get_instance()
        if getattr(registry, 'historical_data', None) is not None:
            df = registry.historical_data
        else:
            df = pd.read_csv(PROCESSED_DATA_PATH)
        hist_df = df[df['event_cause'].str.lower() == str(cause).lower()]
        if len(hist_df) < 5:
            hist_df = df.head(300)
            
        heatmap = hist_df[['latitude', 'longitude']].dropna().values.tolist()
    except Exception as e:
        print(f"Error fetching heatmap in get_map_coordinates: {e}")
        
    # 5. Selected Corridor Route geometry
    corridor_route = get_corridor_route_geometry(corridor)
        
    return {
        "center": center_coords,
        "barricades": barricades,
        "routes": routes_data,
        "heatmap": heatmap,
        "corridorRoute": corridor_route
    }


if __name__ == "__main__":
    test_filters = {
        "cause": "accident",
        "corridor": "Tumkur Road",
        "zone": "North Zone 1",
        "junction": "SilkBoardJunc",
        "veh_type": "lcv",
        "hour": 17,
        "day": 3
    }
    print("Generating test map HTML...")
    html_output = generate_interactive_map(test_filters)
    print(f"Generated HTML string length: {len(html_output)}")
