import os
import pandas as pd
from datetime import datetime
from model_registry import ModelRegistry
from data.feature_engineering import engineer_features
from models.severity_classifier import train_severity_model
from models.duration_regressor import train_duration_model
from models.closure_classifier import train_closure_model
from models.export_models import export_and_test
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'processed', 'cleaned_data.csv')
FEEDBACK_DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'feedback', 'feedback_log.csv')
VERSION_PATH = os.path.join(BASE_DIR, '..', 'data', 'feedback', 'model_version.json')

def retrain_models():
    """
    Unified retraining orchestrator
    """
    print("="*50)
    print("STARTING RETRAINING PIPELINE")
    print("="*50)
    
    # 1 & 2. Load original data and feedback data
    original_df = pd.read_csv(PROCESSED_DATA_PATH)
    original_size = len(original_df)
    
    feedback_df = pd.DataFrame()
    if os.path.exists(FEEDBACK_DATA_PATH):
        try:
            feedback_df = pd.read_csv(FEEDBACK_DATA_PATH)
            # Remove empty rows
            feedback_df = feedback_df.dropna(how='all')
        except Exception as e:
            print(f"Error reading feedback: {e}")
            
    # 3. Concatenate
    if len(feedback_df) > 0:
        merged_df = pd.concat([original_df, feedback_df], ignore_index=True)
        print(f"Merged {len(feedback_df)} new feedback records. Total: {len(merged_df)}")
    else:
        print("No new feedback records found. Training on original data.")
        merged_df = original_df
        
    # 4. Feature Engineering
    print("\nRunning Feature Engineering...")
    import shutil
    import glob
    if os.path.exists(PROCESSED_DATA_PATH):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(BASE_DIR, '..', 'data', 'processed', f'cleaned_data_backup_{timestamp}.csv')
        shutil.copy2(PROCESSED_DATA_PATH, backup_path)
        # Keep only the last 3 backups
        backups = sorted(glob.glob(os.path.join(BASE_DIR, '..', 'data', 'processed', 'cleaned_data_backup_*.csv')))
        if len(backups) > 3:
            for old_backup in backups[:-3]:
                try: os.remove(old_backup)
                except: pass

    processed_df = engineer_features(merged_df)
    
    # 5, 6, 7. Train models
    print("\nTraining Severity Model...")
    m1, severity_acc = train_severity_model()
    
    print("\nTraining Duration Model...")
    m2, duration_rmse = train_duration_model()
    
    print("\nTraining Closure Model...")
    m3, closure_acc, closure_f1 = train_closure_model()
    
    # 8, 9. Export
    print("\nExporting Models...")
    export_and_test()
    
    # 10. Reload models in running service
    print("\nHot-Reloading Models in Registry...")
    ModelRegistry.reload()
    
    # Update status
    version_info = {
        "modelVersion": 1,
        "lastTrainedAt": datetime.now().isoformat() + "Z",
        "trainingDataSize": len(processed_df),
        "feedbackCount": len(feedback_df),
        "severity_accuracy": float(severity_acc),
        "closure_accuracy": float(closure_acc),
        "closure_f1_macro": float(closure_f1),
        "duration_rmse": float(duration_rmse),
        "metrics": {
            "severity_status": "retrained",
            "duration_status": "retrained",
            "closure_status": "retrained"
        }
    }
    
    if os.path.exists(VERSION_PATH):
        try:
            with open(VERSION_PATH, 'r') as f:
                old_version = json.load(f)
                version_info["modelVersion"] = old_version.get("modelVersion", 0) + 1
        except:
            pass
            
    with open(VERSION_PATH, 'w') as f:
        json.dump(version_info, f, indent=4)
        
    print("="*50)
    print(f"RETRAINING COMPLETE (Version {version_info['modelVersion']})")
    print("="*50)
    
    return version_info

def get_status():
    if os.path.exists(VERSION_PATH):
        try:
            with open(VERSION_PATH, 'r') as f:
                return json.load(f)
        except Exception as e:
            return {"error": f"Failed to parse version info: {e}"}
            
    # Default
    original_size = 0
    if os.path.exists(PROCESSED_DATA_PATH):
        try:
            df = pd.read_csv(PROCESSED_DATA_PATH, usecols=['id'])
            original_size = len(df)
        except:
            pass
            
    feedback_size = 0
    if os.path.exists(FEEDBACK_DATA_PATH):
        try:
            with open(FEEDBACK_DATA_PATH, 'r') as f:
                feedback_size = sum(1 for line in f) - 1
        except:
            pass
            
    return {
        "modelVersion": 0,
        "lastTrainedAt": "Initial",
        "trainingDataSize": original_size,
        "feedbackCount": feedback_size,
        "metrics": {}
    }

if __name__ == "__main__":
    retrain_models()
