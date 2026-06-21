import os
import pandas as pd
import numpy as np

# Load persistent models globally to avoid reloading on every API call
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INTERIM_DIR = os.path.join(BASE_DIR, '..', '..', 'data', 'interim')
MODELS_DIR = os.path.join(BASE_DIR, '..', '..', 'outputs', 'models')
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, '..', '..', 'data', 'processed', 'cleaned_data.csv')

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/..")
from model_registry import ModelRegistry

try:
    import onnxruntime as ort
    dl_model_path = os.path.join(MODELS_DIR, 'dl_duration_model.onnx')
    if os.path.exists(dl_model_path):
        dl_session = ort.InferenceSession(dl_model_path)
    else:
        dl_session = None
except ImportError:
    print("Warning: onnxruntime not installed. DL comparison disabled.")
    dl_session = None


def safe_encode(encoder, value):
    """Encodes a categorical value safely, falling back to 'Unknown' if unseen."""
    if value in encoder.classes_:
        return encoder.transform([value])[0]
    elif 'Unknown' in encoder.classes_:
        return encoder.transform(['Unknown'])[0]
    else:
        return 0

def get_history(event_cause: str, corridor: str) -> str:
    """Historical context lookup: 'Last 3 similar incidents on corridor averaged X min'"""
    try:
        registry = ModelRegistry.get_instance()
        if registry.historical_data is not None:
            df = registry.historical_data
        else:
            df = pd.read_csv(PROCESSED_DATA_PATH)
        # Filter matching events
        filtered = df[(df['event_cause'].str.lower() == str(event_cause).lower()) & 
                      (df['corridor'].str.lower() == str(corridor).lower())]
                      
        if len(filtered) == 0:
            return f"No recent historical data for {event_cause} on {corridor}."
            
        # Get the last 3 (assuming CSV is chronological, or sort by start_datetime)
        if 'start_datetime' in filtered.columns:
            filtered = filtered.sort_values(by='start_datetime')
            
        recent_3 = filtered.tail(3)
        avg_duration = recent_3['duration_mins'].mean()
        
        return f"Last {len(recent_3)} similar incidents on {corridor} averaged {int(avg_duration)} min."
    except Exception as e:
        return f"Historical lookup failed: {str(e)}"


def extract_features(raw_data: dict) -> pd.DataFrame:
    """Converts a raw input dict into the exactly 11 features required by the models."""
    # Parse datetime
    dt = pd.to_datetime(raw_data.get('start_datetime', pd.Timestamp.now()))
    
    # Coordinates
    lat = raw_data.get('latitude', 12.9716)
    lng = raw_data.get('longitude', 77.5946)
    
    registry = ModelRegistry.get_instance()
    
    # 1. Encode Categoricals (Fallback to 'Unknown' if missing or None)
    enc_cause = safe_encode(registry.label_encoders['event_cause'], raw_data.get('event_cause') or 'Unknown') if registry.label_encoders else 0
    enc_veh = safe_encode(registry.label_encoders['veh_type'], raw_data.get('veh_type') or 'Unknown') if registry.label_encoders else 0
    enc_corridor = safe_encode(registry.label_encoders['corridor'], raw_data.get('corridor') or 'Unknown') if registry.label_encoders else 0
    enc_zone = safe_encode(registry.label_encoders['zone'], raw_data.get('zone') or 'Unknown') if registry.label_encoders else 0
    enc_junction = safe_encode(registry.label_encoders['junction'], raw_data.get('junction') or 'Unknown') if registry.label_encoders else 0
    
    # 2. Datetime Features with Cyclic Encoding
    start_hour = dt.hour
    start_weekday = dt.weekday()
    start_month = dt.month
    start_day_of_year = dt.dayofyear
    is_peak = 1 if (7 <= start_hour <= 10) or (17 <= start_hour <= 20) else 0
    
    sin_hour = np.sin(2 * np.pi * start_hour / 24.0)
    cos_hour = np.cos(2 * np.pi * start_hour / 24.0)
    sin_day = np.sin(2 * np.pi * start_weekday / 7.0)
    cos_day = np.cos(2 * np.pi * start_weekday / 7.0)
    
    # 3. Geo Cluster
    if registry.kmeans_model:
        lat_cluster = registry.kmeans_model.predict([[lat, lng]])[0]
    else:
        lat_cluster = 0
        
    features = {
        'event_cause_encoded': enc_cause,
        'veh_type_encoded': enc_veh,
        'corridor_encoded': enc_corridor,
        'zone_encoded': enc_zone,
        'junction_encoded': enc_junction,
        'start_hour': start_hour,
        'start_weekday': start_weekday,
        'start_month': start_month,
        'start_day_of_year': start_day_of_year,
        'is_peak_hour': is_peak,
        'lat_cluster': lat_cluster,
        'sin_hour': sin_hour,
        'cos_hour': cos_hour,
        'sin_day': sin_day,
        'cos_day': cos_day
    }
    
    # Return as DataFrame to retain column names (XGBoost expects it)
    return pd.DataFrame([features])


def generate_plan(input_dict: dict) -> dict:
    """
    Full pipeline: raw input -> features -> 3 models -> planning engine -> output dict
    """
    # 1. Feature Engineering
    X = extract_features(input_dict)
    
    registry = ModelRegistry.get_instance()
    
    # 2. Model Predictions
    if not registry.severity_model or not registry.duration_model or not registry.closure_model:
        print("ModelRegistry joblib models not loaded. Attempting ONNX fallback...")
        try:
            import onnxruntime as ort
            
            s1_path = os.path.join(MODELS_DIR, 'model1.onnx')
            s2_path = os.path.join(MODELS_DIR, 'model2.onnx')
            s3_path = os.path.join(MODELS_DIR, 'model3.onnx')
            
            if not (os.path.exists(s1_path) and os.path.exists(s2_path) and os.path.exists(s3_path)):
                return {"error": "ML models not loaded, and ONNX models not found."}
                
            s1_sess = ort.InferenceSession(s1_path)
            s2_sess = ort.InferenceSession(s2_path)
            s3_sess = ort.InferenceSession(s3_path)
            
            X_numpy = X.values.astype(np.float32)
            
            # Predict severity
            sev_out = s1_sess.run(None, {s1_sess.get_inputs()[0].name: X_numpy})
            sev_pred_idx = int(sev_out[0][0])
            severity_label = registry.label_encoders['priority'].inverse_transform([sev_pred_idx])[0] if registry.label_encoders else "Medium"
            
            # Predict duration
            dur_out = s2_sess.run(None, {s2_sess.get_inputs()[0].name: X_numpy})
            dur_pred = max(0.0, float(dur_out[0][0][0]))
            
            # Predict closure
            clos_out = s3_sess.run(None, {s3_sess.get_inputs()[0].name: X_numpy})
            closure_pred = bool(clos_out[0][0])
            
        except Exception as onnx_err:
            print(f"ONNX fallback failed: {onnx_err}")
            return {"error": f"ML models are not loaded, and ONNX fallback failed: {onnx_err}"}
    else:
        sev_pred_idx = registry.severity_model.predict(X)[0]
        # Reverse encode severity
        severity_label = registry.label_encoders['priority'].inverse_transform([sev_pred_idx])[0] if registry.label_encoders else "Medium"
        
        dur_pred = registry.duration_model.predict(X)[0]
        dur_pred = max(0, float(dur_pred))
        
        closure_pred = bool(registry.closure_model.predict(X)[0])
        
    # DL Model Inference & Ensemble
    dl_comparison = None
    if dl_session:
        try:
            dl_input = {dl_session.get_inputs()[0].name: X.values.astype(np.float32)}
            dl_dur_pred = float(dl_session.run(None, dl_input)[0][0][0])
            dl_derived_severity = "High" if dl_dur_pred > 60 else "Medium"
            dl_comparison = {
                "dl_duration_prediction": round(dl_dur_pred, 1),
                "dl_derived_severity": dl_derived_severity,
                "xgboost_severity": severity_label,
                "match": dl_derived_severity == severity_label
            }
            # Ensemble (60% XGBoost, 40% DL)
            dur_pred = (dur_pred * 0.6) + (dl_dur_pred * 0.4)
        except Exception as e:
            print("DL Inference skipped due to shape mismatch or error:", e)

    # Early skip if duration is zero
    if round(dur_pred, 1) <= 0:
        return {
            "status": "skipped", 
            "reason": "Predicted duration is ~0 mins. No active response required."
        }
    
    shap_explanation = {"error": "SHAP not available"}
    
    # 3. Historical Lookup
    event_cause = input_dict.get('event_cause', 'Unknown')
    corridor = input_dict.get('corridor', 'Unknown')
    history_msg = get_history(event_cause, corridor)
    
    # 4. Rules Engine (Planning Schema)
    plan = {
        "manpower": 2,
        "barricade_points": 0,
        "equipment": [],
        "urgency_level": "Standard",
        "eta_responders_mins": 20,
        "eta_resolution_mins": int(dur_pred)
    }
    
    # - A. Equipment List Generator (Overridden based on prompt rules)
    cause_lower = event_cause.lower()
    if "breakdown" in cause_lower:
        plan["equipment"] = ["Tow Truck", "Traffic Cones"]
    elif "tree" in cause_lower:
        plan["equipment"] = ["Chainsaw", "Traffic Cones"]
    elif "accident" in cause_lower:
        plan["equipment"] = ["Ambulance"]
    else:
        plan["equipment"] = ["Traffic Cones", "High-Visibility Vests"]
        
    # - B. Urgency & ETA Logic
    if severity_label == "High" and closure_pred:
        plan["urgency_level"] = "Critical"
        plan["eta_responders_mins"] = 8
    elif severity_label == "High" and not closure_pred:
        plan["urgency_level"] = "High"
        plan["eta_responders_mins"] = 12
    elif severity_label == "Low":
        plan["urgency_level"] = "Standard"
        plan["eta_responders_mins"] = 20
    else:
        # Medium / other fallback
        plan["urgency_level"] = "Elevated"
        plan["eta_responders_mins"] = 15
        
    # - C. Barricade Logic (From previous task)
    barricades = 0
    if closure_pred: barricades += 4
    if input_dict.get('is_junction', False): barricades += 2
    if severity_label == "High": barricades += 3
    plan["barricade_points"] = barricades
    
    # - D. Manpower Matrix (From previous task)
    if dur_pred < 60: dur_cat = 'short'
    elif dur_pred <= 180: dur_cat = 'medium'
    else: dur_cat = 'long'
    
    manpower_matrix = {
        ('High', True, 'short'): 6, ('High', True, 'medium'): 8, ('High', True, 'long'): 10,
        ('High', False, 'short'): 4, ('High', False, 'medium'): 5, ('High', False, 'long'): 6,
        ('Medium', True, 'short'): 4, ('Medium', True, 'medium'): 5, ('Medium', True, 'long'): 7,
        ('Medium', False, 'short'): 2, ('Medium', False, 'medium'): 3, ('Medium', False, 'long'): 4,
        ('Low', True, 'short'): 3, ('Low', True, 'medium'): 4, ('Low', True, 'long'): 5,
        ('Low', False, 'short'): 1, ('Low', False, 'medium'): 2, ('Low', False, 'long'): 2,
    }
    plan["manpower"] = manpower_matrix.get((severity_label, closure_pred, dur_cat), 2)
    
    # DL Model Inference moved up
        
    # Final Output Dictionary
    output = {
        "predictions": {
            "severity": severity_label,
            "duration_mins": round(dur_pred, 1),
            "requires_closure": closure_pred
        },
        "plan": plan,
        "historical_context": history_msg,
        "dl_comparison": dl_comparison,
        "shap_explanation": shap_explanation
    }
    
    return output


if __name__ == "__main__":
    import json
    
    test_incident = {
        "event_cause": "vehicle_breakdown",
        "veh_type": "lcv",
        "corridor": "Tumkur Road",
        "zone": "North Zone 1",
        "start_datetime": "2024-03-07T17:01:48Z",
        "latitude": 13.0400041,
        "longitude": 77.5180991,
        "is_junction": False
    }
    
    print("Testing Pipeline with Raw Input...")
    result = generate_plan(test_incident)
    print(json.dumps(result, indent=4))
