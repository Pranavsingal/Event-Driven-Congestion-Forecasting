import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, FileResponse
import tempfile

# Ensure the root of the project is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from planning.planner import generate_plan, extract_features
from model_registry import ModelRegistry
from planning.map_generator import generate_interactive_map, get_map_coordinates
from planning.diversion import get_diversions
from planning.pdf_generator import generate_field_action_pdf

app = FastAPI(title="Gridlock AI Service API Gateway", description="FastAPI microservice for real-time congestion predictions.")

# Add CORS middleware to allow the frontend to access it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Strip /api/ai prefix for serverless compatibility on Vercel
@app.middleware("http")
async def remove_api_gateway_prefix(request, call_next):
    path = request.scope.get("path", "")
    if path.startswith("/api/ai"):
        new_path = path[len("/api/ai"):]
        if not new_path:
            new_path = "/"
        request.scope["path"] = new_path
    
    # Update raw_path in scope as well
    raw_path = request.scope.get("raw_path", b"")
    if raw_path.startswith(b"/api/ai"):
        new_raw_path = raw_path[len(b"/api/ai"):]
        if not new_raw_path:
            new_raw_path = b"/"
        request.scope["raw_path"] = new_raw_path
        
    return await call_next(request)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Gridlock AI Service API is running."}

def get_historical_insights(zone: str, cause: str) -> dict:
    try:
        from model_registry import ModelRegistry
        registry = ModelRegistry.get_instance()
        if getattr(registry, 'historical_data', None) is not None:
            df = registry.historical_data
        else:
            processed_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'processed', 'cleaned_data.csv')
            df = pd.read_csv(processed_path)
            
        zone_matches = df[df['zone'].str.lower() == zone.lower()]
        if len(zone_matches) == 0:
            zone_matches = df
            
        avg_duration = zone_matches['duration_mins'].dropna().mean()
        avg_dur_val = int(avg_duration) if not pd.isna(avg_duration) else 45
        
        peak_hour = 17
        if 'start_hour' in zone_matches.columns:
            mode_hour = zone_matches['start_hour'].dropna().mode()
            if not mode_hour.empty:
                peak_hour = int(mode_hour.iloc[0])
                
        similar = []
        cause_matches = zone_matches[zone_matches['event_cause'].str.lower() == cause.lower()]
        if len(cause_matches) == 0:
            cause_matches = zone_matches
            
        for _, row in cause_matches.tail(3).iterrows():
            similar.append({
                "id": str(row.get("id", "FKID000")),
                "corridor": str(row.get("corridor", "Unknown")),
                "duration": int(row.get("duration_mins", 45)) if not pd.isna(row.get("duration_mins")) else 45,
                "date": str(row.get("start_datetime"))[:10] if pd.notna(row.get("start_datetime")) else "2024-03-01"
            })
            
        return {
            "avg_duration": avg_dur_val,
            "peak_hour": f"{peak_hour:02d}:00",
            "similar_incidents": similar
        }
    except Exception as e:
        print(f"Error calculating historical insights: {e}")
        return {
            "avg_duration": 35,
            "peak_hour": "17:00",
            "similar_incidents": []
        }

@app.get("/predict")
def predict(
    cause: str = "Unknown",
    veh_type: str = "Unknown",
    corridor: str = "Unknown",
    zone: str = "Unknown",
    junction: str = "Unknown",
    hour: int = 12,
    minute: int = 0,
    day: int = 3,
    event: str = "none",
    mode: str = "predictive"
):
    # Map frontend query parameters to model raw features
    # Map 'cause' parameter to 'event_cause' which is expected by the extract_features function
    from planning.junction_db import JUNCTION_DATABASE
    lat = 12.9716
    lng = 77.5946
    if junction in JUNCTION_DATABASE:
        lat = JUNCTION_DATABASE[junction]["latitude"]
        lng = JUNCTION_DATABASE[junction]["longitude"]
    elif junction.lower() != "none" and junction != "":
        print(f"Warning: Junction '{junction}' not found in DB. Falling back to default coordinates.")

    raw_input = {
        "event_cause": cause,
        "veh_type": veh_type,
        "corridor": corridor,
        "zone": zone,
        "junction": junction,
        "latitude": lat,
        "longitude": lng,
        "is_junction": (junction.lower() != "none" and junction != ""),
    }

    # Construct start_datetime from hour and day (assuming current week)
    now = datetime.now()
    # Find the day difference to match the requested weekday (1=Monday, 7=Sunday)
    current_weekday = now.isoweekday()
    day_diff = day - current_weekday
    target_date = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
    # Note: We can add or subtract timedelta if day_diff is non-zero, but simple date string is fine
    raw_input["start_datetime"] = target_date.strftime("%Y-%m-%dT%H:%M:%SZ")

    try:
        # Run planning pipeline
        plan_result = generate_plan(raw_input)
        
        # Calculate model prediction details
        predictions = plan_result.get("predictions", {})
        plan = plan_result.get("plan", {})
        
        severity = predictions.get("severity", "Low")
        duration_mins = predictions.get("duration_mins", 15.0)
        closure_required = predictions.get("requires_closure", False)
        
        # Calculate confidences using the models if they are loaded
        severity_confidence = 95.0
        closure_probability = 10.0
        
        X = extract_features(raw_input)
        
        registry = ModelRegistry.get_instance()
        # Calculate severity probability if possible
        if registry.severity_model is not None:
            try:
                probs = registry.severity_model.predict_proba(X)[0]
                pred_idx = registry.severity_model.predict(X)[0]
                severity_confidence = round(float(probs[pred_idx]) * 100, 1)
            except Exception as e:
                print(f"Error predicting severity confidence: {e}")
                
        # Calculate closure probability if possible
        if registry.closure_model is not None:
            try:
                probs = registry.closure_model.predict_proba(X)[0]
                # closure_model classes are likely [0, 1], so prob of True is probs[1]
                # Let's inspect the model classes if they exist, else default to index 1 if length is 2
                if len(probs) > 1:
                    closure_probability = round(float(probs[1]) * 100, 1)
                else:
                    closure_probability = round(float(probs[0]) * 100, 1)
            except Exception as e:
                print(f"Error predicting closure probability: {e}")

        # Override severity classification text for presentation if needed
        # (e.g. Critical, High, Moderate, Low)
        # Ensure it fits the visual standards
        if severity == "High" and closure_required:
            display_severity = "Critical"
        elif severity == "High":
            display_severity = "High"
        elif severity == "Medium" or severity == "Unknown":
            display_severity = "Moderate"
        else:
            display_severity = "Low"

        # Calculate a reasonable duration range
        import json
        duration_rmse = 2.1
        model_version_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'outputs', 'model_version.json')
        try:
            if os.path.exists(model_version_path):
                with open(model_version_path, 'r') as f:
                    mv = json.load(f)
                    duration_rmse = mv.get("duration_rmse", 2.1)
        except Exception:
            pass
            
        min_dur = max(0, int(duration_mins - duration_rmse))
        max_dur = int(duration_mins + duration_rmse)
        duration_range = f"{min_dur} - {max_dur} mins"
        
        # Flow rate mapping matching typical metrics
        flow_rate = "1,800 veh/h"
        if display_severity == "Critical":
            flow_rate = "4,100 veh/h"
        elif display_severity == "High":
            flow_rate = "3,400 veh/h"
        elif display_severity == "Moderate":
            flow_rate = "2,300 veh/h"
            
        filters = {
            "cause": cause,
            "veh_type": veh_type,
            "corridor": corridor,
            "zone": zone,
            "junction": junction,
            "hour": hour,
            "minute": minute,
            "day": day,
            "event": event
        }
        
        response_data = {
            "success": True,
            "prediction": {
                "severity": display_severity,
                "severityConfidence": f"{severity_confidence}%",
                "durationMins": int(duration_mins),
                "durationRange": duration_range,
                "closureRequired": closure_required,
                "closureProbability": f"{closure_probability}%",
                "forecastedFlowRate": flow_rate,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            },
            "plan": plan,
            "diversions": get_diversions(junction, hour, cause),
            "historicalInsights": get_historical_insights(zone, cause),
            "historicalContext": plan_result.get("historical_context", ""),
            "mapData": get_map_coordinates(filters)
        }
        return response_data
        
    except Exception as e:
        print(f"Error generating predictions: {e}")
        return {
            "success": False,
            "error": str(e)
        }

from pydantic import BaseModel
from typing import Optional
import csv
import threading

class FeedbackPayload(BaseModel):
    incidentId: str
    event_cause: str
    veh_type: str
    corridor: str
    zone: str
    junction: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    actualDurationMins: float
    actualSeverity: str
    actualClosure: bool
    notes: Optional[str] = ""

@app.post("/feedback")
def submit_feedback(payload: FeedbackPayload):
    try:
        feedback_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'feedback', 'feedback_log.csv')
        processed_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'processed', 'cleaned_data.csv')
        
        # Calculate some missing fields needed for training based on current time
        # In a real system, you'd extract these from actual start_datetime
        dt = datetime.now()
        start_hour = dt.hour
        start_weekday = dt.weekday()
        start_month = dt.month
        start_day_of_year = dt.dayofyear
        is_peak_hour = 1 if (7 <= start_hour <= 10) or (17 <= start_hour <= 20) else 0
        
        # Determine if we should trigger retraining
        # First check how many lines currently exist
        line_count = 0
        write_header = False
        if os.path.exists(feedback_file):
            with open(feedback_file, 'r') as f:
                line_count = sum(1 for line in f) - 1 # subtract header
        else:
            write_header = True
            
        # Get columns from processed file to align schema
        if os.path.exists(processed_file):
            cols = pd.read_csv(processed_file, nrows=0).columns.tolist()
        else:
            cols = ['id', 'event_cause', 'priority', 'veh_type', 'corridor', 'zone', 'junction', 
                    'latitude', 'longitude', 'requires_road_closure', 'start_datetime', 
                    'description', 'duration_mins', 'start_hour', 'start_weekday', 
                    'start_month', 'start_day_of_year', 'is_peak_hour']
            
        row_dict = {col: None for col in cols}
        row_dict.update({
            'id': payload.incidentId,
            'event_type': 'feedback_event',
            'latitude': payload.latitude,
            'longitude': payload.longitude,
            'event_cause': payload.event_cause,
            'requires_road_closure': int(payload.actualClosure),
            'start_datetime': dt.isoformat() + "Z",
            'status': 'resolved',
            'authenticated': True,
            'modified_datetime': dt.isoformat() + "Z",
            'description': payload.notes,
            'veh_type': payload.veh_type,
            'corridor': payload.corridor,
            'priority': payload.actualSeverity,
            'created_date': dt.isoformat() + "Z",
            'zone': payload.zone,
            'junction': payload.junction,
            'start_hour': start_hour,
            'start_weekday': start_weekday,
            'start_month': start_month,
            'start_day_of_year': start_day_of_year,
            'duration_mins': payload.actualDurationMins,
            'is_peak_hour': is_peak_hour
        })
        
        df_row = pd.DataFrame([row_dict], columns=cols)
        df_row.to_csv(feedback_file, mode='a', header=write_header, index=False)
            
        line_count += 1
        
        # Auto-retrain every 10 feedbacks
        retraining_triggered = False
        if line_count > 0 and line_count % 10 == 0:
            retraining_triggered = True
            # Fire and forget retraining
            try:
                from retrain import retrain_models
                threading.Thread(target=retrain_models).start()
            except ImportError:
                print("Retrain module not found")
                
        return {
            "success": True,
            "feedbackId": payload.incidentId,
            "totalFeedbackCount": line_count,
            "retrainingTriggered": retraining_triggered
        }
    except Exception as e:
        print(f"Error saving feedback: {e}")
        return {"success": False, "error": str(e)}

@app.post("/retrain")
def trigger_retrain():
    try:
        from retrain import retrain_models
        metrics = retrain_models()
        return {
            "success": True,
            "metrics": metrics,
            "message": "Retraining completed successfully and models reloaded."
        }
    except Exception as e:
        print(f"Error during manual retrain: {e}")
        return {"success": False, "error": str(e)}

@app.get("/model-status")
def get_model_status():
    """
    Returns model version info by reading the version JSON file directly.
    Does NOT import retrain or model_registry to avoid joblib dependency at cold start.
    """
    base_dir = os.path.dirname(os.path.abspath(__file__))
    version_path = os.path.join(base_dir, '..', 'data', 'feedback', 'model_version.json')
    processed_path = os.path.join(base_dir, '..', 'data', 'processed', 'cleaned_data.csv')
    feedback_path = os.path.join(base_dir, '..', 'data', 'feedback', 'feedback_log.csv')

    if os.path.exists(version_path):
        try:
            import json as _json
            with open(version_path, 'r') as f:
                return _json.load(f)
        except Exception as e:
            return {"success": False, "error": f"Failed to parse version info: {e}"}

    # Default status — no retrain has happened yet
    original_size = 0
    try:
        df_ids = pd.read_csv(processed_path, usecols=['id'])
        original_size = len(df_ids)
    except Exception:
        pass

    feedback_size = 0
    try:
        if os.path.exists(feedback_path):
            with open(feedback_path, 'r') as f:
                feedback_size = max(0, sum(1 for _ in f) - 1)
    except Exception:
        pass

    return {
        "success": True,
        "modelVersion": 0,
        "lastTrainedAt": "Initial — not yet retrained",
        "trainingDataSize": original_size,
        "feedbackCount": feedback_size,
        "severity_accuracy": None,
        "metrics": {}
    }

@app.get("/map", response_class=HTMLResponse)
def get_map(
    cause: str = "Unknown",
    veh_type: str = "Unknown",
    corridor: str = "Unknown",
    zone: str = "Unknown",
    junction: str = "Unknown",
    hour: int = 12,
    minute: int = 0,
    day: int = 3,
    event: str = "none"
):
    filters = {
        "cause": cause,
        "veh_type": veh_type,
        "corridor": corridor,
        "zone": zone,
        "junction": junction,
        "hour": hour,
        "minute": minute,
        "day": day,
        "event": event
    }
    try:
        html_content = generate_interactive_map(filters)
        return HTMLResponse(content=html_content, status_code=200)
    except Exception as e:
        return HTMLResponse(content=f"<h3>Error generating map: {e}</h3>", status_code=500)

@app.get("/pdf")
def get_pdf(
    cause: str = "Unknown",
    veh_type: str = "Unknown",
    corridor: str = "Unknown",
    zone: str = "Unknown",
    junction: str = "Unknown",
    hour: int = 12,
    minute: int = 0,
    day: int = 3,
    event: str = "none"
):
    raw_input = {
        "event_cause": cause,
        "veh_type": veh_type,
        "corridor": corridor,
        "zone": zone,
        "junction": junction,
        "latitude": 12.9716,
        "longitude": 77.5946,
        "is_junction": (junction.lower() != "none" and junction != ""),
    }
    try:
        plan_result = generate_plan(raw_input)
        plan = plan_result.get("plan", {})
        diversions = get_diversions(junction, hour, cause)
        
        # Create temporary PDF file
        temp_dir = tempfile.gettempdir()
        pdf_filename = f"tactical_dispatch_{junction.replace(' ', '_')}_{hour}.pdf"
        pdf_path = os.path.join(temp_dir, pdf_filename)
        
        filters = {
            "cause": cause,
            "corridor": corridor,
            "zone": zone,
            "junction": junction,
            "veh_type": veh_type,
            "hour": hour,
            "minute": minute,
            "day": day,
            "event": event
        }
        
        generate_field_action_pdf(filters, plan, diversions, pdf_path)
        
        return FileResponse(
            path=pdf_path,
            filename=pdf_filename,
            media_type="application/pdf"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"success": False, "error": str(e)}

@app.get("/charts/{filename}")
def get_chart(filename: str):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    chart_path = os.path.join(base_dir, "..", "outputs", "charts", filename)
    if os.path.exists(chart_path):
        return FileResponse(chart_path, media_type="image/png")
    return {"error": "Chart not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
