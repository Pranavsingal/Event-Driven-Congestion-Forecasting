from planning.junction_db import JUNCTION_DATABASE

def score_route(alt_route: dict, is_peak: bool, cause: str) -> float:
    """
    Calculates a detour suitability score. 
    Lower score represents a better (faster/less congested) bypass route.
    Formula: Score = (distance * 2) + (base_time * congestion_factor) + (peak_hour_penalty) + (cause_multiplier)
    """
    distance_penalty = alt_route["distance_km"] * 2.0
    congestion_history = alt_route["base_time_mins"] * alt_route["historical_congestion_factor"]
    
    # Peak hour penalty
    peak_penalty = 6.0 if is_peak else 0.0
    
    # Event cause impact adjustments
    cause_multiplier = 1.0
    cause_lower = cause.lower()
    if "water_logging" in cause_lower or "flood" in cause_lower:
        cause_multiplier = 1.5  # flood affects travel times heavily
    elif "accident" in cause_lower:
        cause_multiplier = 1.2
        
    score = (distance_penalty + congestion_history + peak_penalty) * cause_multiplier
    return round(score, 1)

def get_diversions(junction_name: str, hour: int = 12, cause: str = "congestion") -> list:
    """
    For any given junction, scores and ranks the top candidate diversion routes.
    Returns a list of alternate routes with distance, scored ETA, and justification.
    """
    is_peak = (7 <= hour <= 10) or (17 <= hour <= 20)
    
    # Lookup junction
    junction = JUNCTION_DATABASE.get(junction_name)
    if not junction:
        # Check case-insensitive or partial match
        matched_key = None
        for k in JUNCTION_DATABASE.keys():
            if k.lower() == str(junction_name).lower():
                matched_key = k
                break
        if matched_key:
            junction = JUNCTION_DATABASE[matched_key]
        else:
            junction = JUNCTION_DATABASE["Unknown"]
            
    scored_alternatives = []
    
    # Try importing osrm_client
    try:
        from routing.osrm_client import get_road_route
    except ImportError:
        get_road_route = None

    for idx, alt in enumerate(junction["alternatives"]):
        score = score_route(alt, is_peak, cause)
        
        # Calculate dynamic ETA in minutes (based on score, rounded)
        eta = max(int(score / 1.5), alt["base_time_mins"] + (3 if is_peak else 0))
        dist_km = alt["distance_km"]
        
        route_geometry = []
        
        if get_road_route and "waypoints" in alt and len(alt["waypoints"]) >= 2:
            pts = alt["waypoints"]
            route_res = get_road_route(pts[0][0], pts[0][1], pts[-1][0], pts[-1][1], via_points=pts[1:-1])
            route_geometry = route_res.get("coordinates", [])
            # optionally override eta and distance with actuals
            if route_res.get("distance_km") > 0:
                dist_km = round(route_res["distance_km"], 1)
                eta = int(route_res["duration_mins"])
        
        # Formulate a structured reason
        if idx == 0:
            reason = "Lowest congestion history with standard lane width."
        elif idx == 1:
            reason = "Slightly longer bypass but avoids main residential merges."
        else:
            reason = "Secondary backup artery. Recommended if key routes flood."
            
        scored_alternatives.append({
            "rank": idx + 1,
            "route_name": alt["route"],
            "distance_km": dist_km,
            "base_time_mins": alt["base_time_mins"],
            "eta_mins": eta,
            "suitability_score": score,
            "reason": reason,
            "route_geometry": route_geometry
        })
        
    # Sort alternatives by suitability score (ascending - lower score is better)
    scored_alternatives = sorted(scored_alternatives, key=lambda x: x["suitability_score"])
    
    # Re-rank and calculate dynamic metrics after sorting
    for rank_idx, item in enumerate(scored_alternatives):
        rank = rank_idx + 1
        item["rank"] = rank
        
        # Calculate detour time difference relative to base_time_mins
        detour_diff = max(1, item["eta_mins"] - item.pop("base_time_mins"))
        item["travel_time_detour"] = f"+{detour_diff} mins detour"
        
        # Calculate offload efficiency score based on suitability score and rank
        score = item["suitability_score"]
        if rank == 1:
            offload_score = max(85, min(96, int(100 - score * 0.5)))
        elif rank == 2:
            offload_score = max(70, min(84, int(90 - score * 0.6)))
        else:
            offload_score = max(50, min(69, int(80 - score * 0.7)))
        item["flow_offload_efficiency"] = f"{offload_score}%"
        
    return scored_alternatives

if __name__ == "__main__":
    import json
    print("Testing Diversion Route Scoring and Ranking...")
    results = get_diversions("SilkBoardJunc", hour=17, cause="accident")
    print(json.dumps(results, indent=4))
