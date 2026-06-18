def score_route(route_info: dict, current_hour: int, historical_congestion_modifier: float = 1.0) -> float:
    """
    Calculates a dynamic diversion score for an alternate route.
    Formula: Score = (Distance * Distance_Penalty) + Congestion_Multiplier + Time_Slot_Modifier
    Lower Score = Better Route.
    
    Args:
        route_info (dict): Contains 'route_name', 'base_distance', 'base_congestion'
        current_hour (int): Current hour (0-23)
        historical_congestion_modifier (float): A dynamic modifier based on historical accident rates/duration
        
    Returns:
        float: The calculated penalty score for the route.
    """
    base_dist = route_info.get("base_distance", 5.0)
    base_cong = route_info.get("base_congestion", 0.5)
    
    # 1. Distance Penalty (Shorter is better)
    # Give a weight of 1.5 per km
    dist_penalty = base_dist * 1.5
    
    # 2. Time Slot Modifier
    is_peak_hour = (7 <= current_hour <= 10) or (17 <= current_hour <= 20)
    
    if is_peak_hour:
        # Heavily penalize normally congested routes during peak hours
        time_slot_penalty = base_cong * 10.0
    elif (0 <= current_hour <= 5):
        # Night time: highly favor shorter distances regardless of usual congestion
        time_slot_penalty = base_cong * 1.0
    else:
        # Standard day time
        time_slot_penalty = base_cong * 5.0
        
    # 3. Certain keywords trigger heavy penalties during peak hours (e.g. Ring Roads)
    route_name = route_info.get("route_name", "").lower()
    if is_peak_hour and ("ring road" in route_name or "orr" in route_name):
        time_slot_penalty += 5.0  # Avoid Ring Roads like plague during peak
    
    # Final Score
    score = dist_penalty + (time_slot_penalty * historical_congestion_modifier)
    
    return round(score, 2)
