import os
import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score
from models.data_prep import get_train_test_splits

def train_closure_model():
    print("="*50)
    print("TRAINING ROAD CLOSURE CLASSIFIER (RandomForest)")
    print("="*50)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    processed_path = os.path.join(base_dir, '..', '..', 'data', 'processed', 'cleaned_data.csv')
    
    df = pd.read_csv(processed_path)
    splits = get_train_test_splits(df)
    
    if 'closure' not in splits:
        print("Error: Closure split not available.")
        return
        
    X_train, X_test, y_train, y_test = splits['closure']
    
    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced')
    
    print("Training model...")
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average='macro')
    
    print(f"\nModel Accuracy: {accuracy * 100:.2f}%")
    
    outputs_dir = os.path.join(base_dir, '..', '..', 'outputs', 'models')
    os.makedirs(outputs_dir, exist_ok=True)
    model_path = os.path.join(outputs_dir, 'closure_model.joblib')
    
    joblib.dump(model, model_path)
    print(f"Model successfully saved to {model_path}")
    return model, accuracy, f1

if __name__ == "__main__":
    train_closure_model()
