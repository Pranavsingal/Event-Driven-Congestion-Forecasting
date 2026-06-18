from routing.junction_db import JUNCTION_DB
from routing.route_scoring import score_route

def get_diversions(junction_name: str, current_hour: int, historical_severity_multiplier: float = 1.0) -> list:
    """
    Looks up a junction and ranks its alternate routes to return the top 3 recommendations.
    
    Args:
        junction_name (str): Name of the bottlenecked junction.
        current_hour (int): Current time hour (0-23).
        historical_severity_multiplier (float): Optional multiplier if area is historically severe.
        
    Returns:
        list: Top 3 dictionary objects containing route name, score, and recommendation reason.
    """
    if junction_name not in JUNCTION_DB:
        # Fallback to generic arterial routes if junction is unknown
        alternates = [
            {"route_name": "Nearest Outer Ring Road Segment", "base_distance": 5.0, "base_congestion": 0.5},
            {"route_name": "Parallel Arterial Road", "base_distance": 6.0, "base_congestion": 0.6},
            {"route_name": "Local Bypass / Service Road", "base_distance": 3.0, "base_congestion": 0.8}
        ]
    else:
        alternates = JUNCTION_DB[junction_name].get("alternates", [])
    
    if not alternates:
        return [{"error": "No alternate routes available for this junction."}]
        
    scored_routes = []
    
    # Score all available routes
    for route in alternates:
        score = score_route(route, current_hour, historical_severity_multiplier)
        scored_routes.append({
            "route_name": route["route_name"],
            "base_distance_km": route["base_distance"],
            "score": score
        })
        
    # Sort ascending (lower score = better route)
    scored_routes = sorted(scored_routes, key=lambda x: x["score"])
    
    # Select Top 3
    top_3 = scored_routes[:3]
    
    # Add reasoning strings
    for i, route in enumerate(top_3):
        is_peak = (7 <= current_hour <= 10) or (17 <= current_hour <= 20)
        route_name = route["route_name"].lower()
        
        if i == 0:
            if "ring road" in route_name and not is_peak:
                reason = "Optimal alternative offering the fastest corridor travel time during non-peak hours."
            elif route["base_distance_km"] < 3.0:
                reason = "Shortest local bypass with minimal distance penalty."
            else:
                reason = "Best overall balance of distance and current traffic fluidity."
        elif i == 1:
            reason = "Secondary alternative avoiding major arterial choke points."
        else:
            reason = "Viable fallback route if primary diversions start congesting."
            
        route["reason"] = reason

    return top_3


if __name__ == "__main__":
    import json
    # Test for Silk Board at 9 AM (Peak) vs 2 PM (Off-Peak)
    print("--- 9 AM Peak Hour at Silk Board ---")
    peak_diversions = get_diversions("Silk Board Junction", 9)
    print(json.dumps(peak_diversions, indent=4))
    
    print("\n--- 2 PM Off-Peak at Silk Board ---")
    offpeak_diversions = get_diversions("Silk Board Junction", 14)
    print(json.dumps(offpeak_diversions, indent=4))
