def generate_response_plan(event_cause: str, severity: str, duration_mins: float, requires_closure: bool, is_junction: bool = False) -> dict:
    """
    Generates a structured incident response plan based on model predictions.
    
    Args:
        event_cause (str): The predicted or reported cause of the event (e.g., 'vehicle_breakdown', 'accident').
        severity (str): Predicted severity ('High', 'Low').
        duration_mins (float): Predicted duration in minutes.
        requires_closure (bool): Whether a road closure is required.
        is_junction (bool): Whether the incident occurred at a junction.
        
    Returns:
        dict: The structured response plan.
    """
    plan = {
        "manpower": 2,
        "barricade_points": 0,
        "equipment": ["Traffic Cones", "High-Visibility Vests"],
        "urgency_level": "Standard",
        "eta_resolution_mins": int(duration_mins)
    }
    
    # 1. Manpower Matrix Calculation (severity x road_closure x duration)
    if duration_mins < 60:
        dur_cat = 'short'
    elif duration_mins <= 180:
        dur_cat = 'medium'
    else:
        dur_cat = 'long'
        
    manpower_matrix = {
        ('High', True, 'short'): 6, ('High', True, 'medium'): 8, ('High', True, 'long'): 10,
        ('High', False, 'short'): 4, ('High', False, 'medium'): 5, ('High', False, 'long'): 6,
        ('Medium', True, 'short'): 4, ('Medium', True, 'medium'): 5, ('Medium', True, 'long'): 7,
        ('Medium', False, 'short'): 2, ('Medium', False, 'medium'): 3, ('Medium', False, 'long'): 4,
        ('Low', True, 'short'): 3, ('Low', True, 'medium'): 4, ('Low', True, 'long'): 5,
        ('Low', False, 'short'): 1, ('Low', False, 'medium'): 2, ('Low', False, 'long'): 2,
    }
    
    plan["manpower"] = manpower_matrix.get((severity, requires_closure, dur_cat), 2)
    
    # 2. Urgency & Barricade Points based on Severity, Closure, and Junction
    if severity == "High":
        plan["urgency_level"] = "Critical"
    elif severity == "Medium":
        plan["urgency_level"] = "Elevated"
        
    # Barricade logic
    barricades = 0
    if requires_closure:
        barricades += 4
        plan["equipment"].extend(["Road Closure Signs", "Diverter Panels"])
    if is_junction:
        barricades += 2
    if severity == "High":
        barricades += 3
        
    plan["barricade_points"] = barricades
        
    # 3. Equipment based on Event Cause
    cause_lower = str(event_cause).lower()
    if "breakdown" in cause_lower:
        plan["equipment"].append("Tow Truck")
    elif "accident" in cause_lower:
        plan["equipment"].extend(["Tow Truck", "Ambulance", "Fire Engine (if severe)"])
    elif "water_logging" in cause_lower or "flood" in cause_lower:
        plan["equipment"].append("Industrial Water Pump")
    elif "tree_fall" in cause_lower:
        plan["equipment"].extend(["Chainsaws", "Debris Clearance Truck"])
    elif "pot_hole" in cause_lower or "road_conditions" in cause_lower:
        plan["equipment"].extend(["Asphalt Patching Kit", "Steamroller"])
        
    # Ensure equipment list is unique
    plan["equipment"] = list(set(plan["equipment"]))
    
    return plan

if __name__ == "__main__":
    # Test Scenario
    test_plan = generate_response_plan(
        event_cause="accident", 
        severity="High", 
        duration_mins=120.5, 
        requires_closure=True,
        is_junction=True
    )
    
    import json
    print("Example Response Plan Schema:")
    print(json.dumps(test_plan, indent=4))
