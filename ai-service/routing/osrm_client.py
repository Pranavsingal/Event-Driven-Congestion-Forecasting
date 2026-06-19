import urllib.request
import urllib.parse
import json
import math

OSRM_BASE_URL = "http://router.project-osrm.org"

def get_road_route(origin_lat, origin_lng, dest_lat, dest_lng, via_points=None):
    """
    Fetches a real road route between two points using OSRM.
    Returns: {
        "coordinates": [[lat, lng], ...],
        "distance_km": float,
        "duration_mins": float
    }
    """
    coords = f"{origin_lng},{origin_lat}"
    
    if via_points:
        for pt in via_points:
            coords += f";{pt[1]},{pt[0]}"
            
    coords += f";{dest_lng},{dest_lat}"
    
    url = f"{OSRM_BASE_URL}/route/v1/driving/{coords}?overview=full&geometries=geojson"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'GridlockAI/1.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        if data.get("code") == "Ok" and len(data.get("routes", [])) > 0:
            route = data["routes"][0]
            
            # OSRM returns GeoJSON coordinates as [lng, lat], we need [lat, lng] for Leaflet
            geojson_coords = route["geometry"]["coordinates"]
            lat_lng_coords = [[pt[1], pt[0]] for pt in geojson_coords]
            
            return {
                "coordinates": lat_lng_coords,
                "distance_km": route["distance"] / 1000.0,
                "duration_mins": route["duration"] / 60.0
            }
    except Exception as e:
        print(f"OSRM routing failed: {e}")
        
    # Fallback to straight line if OSRM fails
    print("Falling back to straight-line route.")
    fallback = [[origin_lat, origin_lng]]
    if via_points:
        fallback.extend(via_points)
    fallback.append([dest_lat, dest_lng])
    return {
        "coordinates": fallback,
        "distance_km": 0.0,
        "duration_mins": 0.0
    }

def get_nearest_road_point(lat, lng):
    """
    Snaps a coordinate to the nearest actual road point using OSRM.
    Returns [lat, lng]
    """
    url = f"{OSRM_BASE_URL}/nearest/v1/driving/{lng},{lat}?number=1"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'GridlockAI/1.0'})
        with urllib.request.urlopen(req, timeout=3) as response:
            data = json.loads(response.read().decode('utf-8'))
            
        if data.get("code") == "Ok" and len(data.get("waypoints", [])) > 0:
            location = data["waypoints"][0]["location"]
            return [location[1], location[0]] # [lat, lng]
    except Exception as e:
        print(f"OSRM nearest failed: {e}")
        
    return [lat, lng]

def get_intersection_points(center_lat, center_lng, radius_km=0.3, num_points=8):
    """
    Finds actual road points around a center in a circle.
    """
    points = []
    for i in range(num_points):
        angle = (2 * math.pi * i) / num_points
        # 1 deg lat = 111 km. 1 deg lng = 111 * cos(lat) km
        dy = radius_km / 111.0
        dx = radius_km / (111.0 * math.cos(math.radians(center_lat)))
        
        test_lat = center_lat + (dy * math.sin(angle))
        test_lng = center_lng + (dx * math.cos(angle))
        
        snapped = get_nearest_road_point(test_lat, test_lng)
        
        # Avoid duplicates if multiple angles snap to same road
        is_dup = False
        for p in points:
            # roughly 20 meters tolerance
            if abs(p[0]-snapped[0]) < 0.0002 and abs(p[1]-snapped[1]) < 0.0002:
                is_dup = True
                break
                
        if not is_dup:
            points.append(snapped)
            
    return points
