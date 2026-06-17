import os
import joblib
import pandas as pd
import numpy as np
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from models.data_prep import get_train_test_splits

def train_duration_model():
    print("="*50)
    print("TRAINING DURATION REGRESSOR (XGBoost)")
    print("="*50)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    processed_path = os.path.join(base_dir, '..', '..', 'data', 'processed', 'cleaned_data.csv')
    
    df = pd.read_csv(processed_path)
    splits = get_train_test_splits(df)
    
    X_train, X_test, y_train, y_test = splits['duration']
    
    model = XGBRegressor(n_estimators=200, random_state=42, eval_metric='rmse')
    
    print("Training model...")
    model.fit(X_train, y_train)
    
    y_pred = np.maximum(0, model.predict(X_test))
    
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    
    print(f"\nModel Evaluation:")
    print(f"  - RMSE: {rmse:.2f} minutes")
    
    outputs_dir = os.path.join(base_dir, '..', '..', 'outputs', 'models')
    os.makedirs(outputs_dir, exist_ok=True)
    model_path = os.path.join(outputs_dir, 'duration_model.joblib')
    
    joblib.dump(model, model_path)
    print(f"\nModel successfully saved to {model_path}")
    return model

if __name__ == "__main__":
    train_duration_model()
