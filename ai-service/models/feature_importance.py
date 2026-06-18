import os
import joblib
import matplotlib.pyplot as plt
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, '..', '..', 'outputs', 'models')
CHARTS_DIR = os.path.join(BASE_DIR, '..', '..', 'outputs', 'charts')

os.makedirs(CHARTS_DIR, exist_ok=True)

def generate_feature_importance():
    model_path = os.path.join(MODELS_DIR, 'model1.pkl')
    if not os.path.exists(model_path):
        print("Model 1 not found.")
        return

    model = joblib.load(model_path)
    
    # Check if the model has feature_importances_
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
    elif hasattr(model, 'named_steps'):
        importances = model.named_steps['classifier'].feature_importances_
    else:
        print("Model doesn't have feature importances.")
        return

    features = [
        'event_cause', 'veh_type', 'corridor', 'zone', 'junction', 
        'start_hour', 'start_weekday', 'start_month', 'start_day_of_year', 
        'is_peak_hour', 'lat_cluster'
    ]
    
    # Some XGBoost models might have different internal feature numbers if trained without names
    if len(importances) != len(features):
        features = [f'f{i}' for i in range(len(importances))]

    # Sort indices
    indices = np.argsort(importances)[::-1]
    sorted_features = [features[i] for i in indices]
    sorted_importances = importances[indices]

    plt.figure(figsize=(10, 6))
    plt.title("XGBoost Severity Model - Feature Importances")
    plt.bar(range(len(importances)), sorted_importances, align="center")
    plt.xticks(range(len(importances)), sorted_features, rotation=45, ha='right')
    plt.xlim([-1, len(importances)])
    plt.tight_layout()
    
    out_path = os.path.join(CHARTS_DIR, 'feature_importance.png')
    plt.savefig(out_path)
    print(f"Feature importance saved to {out_path}")

if __name__ == "__main__":
    generate_feature_importance()
