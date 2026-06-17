import os
import joblib
import torch
import numpy as np
from models.dl_model import DurationMLP

try:
    from skl2onnx import convert_sklearn
    from skl2onnx.common.data_types import FloatTensorType
    from onnxmltools.convert import convert_xgboost
except ImportError:
    print("Warning: ONNX conversion packages not found. Skipping ONNX export.")
    convert_sklearn = None
    convert_xgboost = None

def export_and_test():
    print("="*50)
    print("EXPORTING & TESTING MODELS")
    print("="*50)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    outputs_dir = os.path.join(base_dir, '..', '..', 'outputs', 'models')
    
    # Define paths
    paths = {
        'model1': ('severity_model.joblib', 'model1.pkl', 'model1.onnx'), # XGBoost Classifier
        'model2': ('duration_model.joblib', 'model2.pkl', 'model2.onnx'), # XGBoost Regressor
        'model3': ('closure_model.joblib', 'model3.pkl', 'model3.onnx')   # RandomForest Classifier
    }
    
    # 1. Load, Save to PKL, and Test Reload
    print("1. Converting to PKL and testing reload...")
    for model_id, (joblib_name, pkl_name, _) in paths.items():
        joblib_path = os.path.join(outputs_dir, joblib_name)
        pkl_path = os.path.join(outputs_dir, pkl_name)
        
        if os.path.exists(joblib_path):
            # Load
            model = joblib.load(joblib_path)
            # Save as pkl
            joblib.dump(model, pkl_path)
            # Test reload
            reloaded_model = joblib.load(pkl_path)
            print(f"  - Successfully exported and reloaded {model_id} ({pkl_name})")
        else:
            print(f"  - Missing {joblib_name}, skipping.")
            
    # 2. Export to ONNX
    print("\n2. Exporting to ONNX...")
    if convert_sklearn and convert_xgboost:
        # Dummy input type for scikit-learn / xgboost models (11 features)
        initial_type = [('float_input', FloatTensorType([None, 11]))]
        
        # model1 (XGBoost Classifier)
        try:
            from onnxmltools.convert.common.data_types import FloatTensorType as XgbFloatTensorType
            xgb_initial_type = [('float_input', XgbFloatTensorType([None, 11]))]
            
            m1 = joblib.load(os.path.join(outputs_dir, 'model1.pkl'))
            m1.get_booster().feature_names = [f"f{i}" for i in range(11)]
            onnx1 = convert_xgboost(m1, initial_types=xgb_initial_type, target_opset=14)
            with open(os.path.join(outputs_dir, 'model1.onnx'), "wb") as f:
                f.write(onnx1.SerializeToString())
            print("  - Exported model1.onnx")
        except Exception as e:
            print(f"  - Failed to export model1.onnx: {e}")
            
        # model2 (XGBoost Regressor)
        try:
            m2 = joblib.load(os.path.join(outputs_dir, 'model2.pkl'))
            m2.get_booster().feature_names = [f"f{i}" for i in range(11)]
            onnx2 = convert_xgboost(m2, initial_types=xgb_initial_type, target_opset=14)
            with open(os.path.join(outputs_dir, 'model2.onnx'), "wb") as f:
                f.write(onnx2.SerializeToString())
            print("  - Exported model2.onnx")
        except Exception as e:
            print(f"  - Failed to export model2.onnx: {e}")
            
        # model3 (RandomForest Classifier)
        try:
            m3 = joblib.load(os.path.join(outputs_dir, 'model3.pkl'))
            onnx3 = convert_sklearn(m3, initial_types=initial_type, target_opset=14)
            with open(os.path.join(outputs_dir, 'model3.onnx'), "wb") as f:
                f.write(onnx3.SerializeToString())
            print("  - Exported model3.onnx")
        except Exception as e:
            print(f"  - Failed to export model3.onnx: {e}")
            
    # 3. Export PyTorch to ONNX
    dl_path = os.path.join(outputs_dir, 'dl_duration_model.pth')
    if os.path.exists(dl_path):
        try:
            model_dl = DurationMLP(11)
            model_dl.load_state_dict(torch.load(dl_path))
            model_dl.eval()
            dummy_input = torch.randn(1, 11)
            onnx_dl_path = os.path.join(outputs_dir, 'dl_duration_model.onnx')
            torch.onnx.export(model_dl, dummy_input, onnx_dl_path, 
                              input_names=['input'], output_names=['output'])
            print("  - Exported dl_duration_model.onnx")
        except Exception as e:
            print(f"  - Failed to export PyTorch model: {e}")

if __name__ == "__main__":
    export_and_test()
