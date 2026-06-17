import os
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix
from models.data_prep import get_train_test_splits

def evaluate_classifiers():
    print("="*50)
    print("EVALUATING CLASSIFIERS")
    print("="*50)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    processed_path = os.path.join(base_dir, '..', '..', 'data', 'processed', 'cleaned_data.csv')
    models_dir = os.path.join(base_dir, '..', '..', 'outputs', 'models')
    report_path = os.path.join(base_dir, '..', '..', 'outputs', 'model_eval_report.txt')
    
    df = pd.read_csv(processed_path)
    splits = get_train_test_splits(df)
    
    with open(report_path, 'w') as f:
        f.write("MODEL EVALUATION REPORT\n")
        f.write("=======================\n\n")
        
        # 1. Evaluate Severity Classifier
        severity_model_path = os.path.join(models_dir, 'severity_model.joblib')
        if os.path.exists(severity_model_path) and 'severity' in splits:
            print("Evaluating Severity Classifier (XGBoost)...")
            model = joblib.load(severity_model_path)
            _, X_test, _, y_test = splits['severity']
            
            y_pred = model.predict(X_test)
            
            f.write("1. SEVERITY CLASSIFIER (XGBoost)\n")
            f.write("-" * 40 + "\n")
            f.write("Classification Report (Precision/Recall/F1):\n")
            f.write(classification_report(y_test, y_pred, zero_division=0))
            f.write("\nConfusion Matrix:\n")
            f.write(str(confusion_matrix(y_test, y_pred)))
            f.write("\n\n" + "="*40 + "\n\n")
            
        # 2. Evaluate Closure Classifier
        closure_model_path = os.path.join(models_dir, 'closure_model.joblib')
        if os.path.exists(closure_model_path) and 'closure' in splits:
            print("Evaluating Road Closure Classifier (RandomForest)...")
            model = joblib.load(closure_model_path)
            _, X_test, _, y_test = splits['closure']
            
            y_pred = model.predict(X_test)
            
            f.write("2. ROAD CLOSURE CLASSIFIER (RandomForest)\n")
            f.write("-" * 40 + "\n")
            f.write("Classification Report (Precision/Recall/F1):\n")
            f.write(classification_report(y_test, y_pred, zero_division=0))
            f.write("\nConfusion Matrix:\n")
            f.write(str(confusion_matrix(y_test, y_pred)))
            f.write("\n\n" + "="*40 + "\n\n")
            
    print(f"Evaluation finished. Report saved to: {report_path}")

if __name__ == "__main__":
    evaluate_classifiers()
