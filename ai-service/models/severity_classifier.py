import os
import joblib
import pandas as pd
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, classification_report
from models.data_prep import get_train_test_splits

def train_severity_model():
    print("="*50)
    print("TRAINING SEVERITY CLASSIFIER (XGBoost)")
    print("="*50)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    processed_path = os.path.join(base_dir, '..', '..', 'data', 'processed', 'cleaned_data.csv')
    
    if not os.path.exists(processed_path):
        print(f"Error: Processed data not found at {processed_path}")
        return
        
    df = pd.read_csv(processed_path)
    splits = get_train_test_splits(df)
    
    X_train, X_test, y_train, y_test = splits['severity']
    
    model = XGBClassifier(
        n_estimators=200, 
        max_depth=5, 
        random_state=42,
        use_label_encoder=False,
        eval_metric='mlogloss'
    )
    
    print("Training model...")
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
    
    outputs_dir = os.path.join(base_dir, '..', '..', 'outputs', 'models')
    os.makedirs(outputs_dir, exist_ok=True)
    model_path = os.path.join(outputs_dir, 'severity_model.joblib')
    
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}")
    return model, accuracy

if __name__ == "__main__":
    train_severity_model()
