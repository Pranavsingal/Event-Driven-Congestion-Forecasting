import os
import joblib

class ModelRegistry:
    _instance = None
    
    def __init__(self):
        self.severity_model = None
        self.duration_model = None
        self.closure_model = None
        self.label_encoders = None
        self.kmeans_model = None
        self.load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self):
        print("ModelRegistry: Loading models from disk...")
        base_dir = os.path.dirname(os.path.abspath(__file__))
        outputs_dir = os.path.join(base_dir, '..', 'outputs', 'models')
        interim_dir = os.path.join(base_dir, '..', 'data', 'interim')

        try:
            self.severity_model = joblib.load(os.path.join(outputs_dir, 'model1.pkl'))
        except Exception as e:
            print(f"Warning: Could not load severity_model (model1.pkl): {e}")

        try:
            self.duration_model = joblib.load(os.path.join(outputs_dir, 'model2.pkl'))
        except Exception as e:
            print(f"Warning: Could not load duration_model (model2.pkl): {e}")

        try:
            self.closure_model = joblib.load(os.path.join(outputs_dir, 'model3.pkl'))
        except Exception as e:
            print(f"Warning: Could not load closure_model (model3.pkl): {e}")

        try:
            self.label_encoders = joblib.load(os.path.join(interim_dir, 'label_encoders.pkl'))
        except Exception as e:
            print(f"Warning: Could not load label_encoders.pkl: {e}")

        try:
            self.kmeans_model = joblib.load(os.path.join(interim_dir, 'kmeans_model.pkl'))
        except Exception as e:
            print(f"Warning: Could not load kmeans_model.pkl: {e}")

        # Cache historical data to avoid reading CSV on every API request
        processed_path = os.path.join(base_dir, '..', 'data', 'processed', 'cleaned_data.csv')
        try:
            import pandas as pd
            self.historical_data = pd.read_csv(processed_path)
            print("ModelRegistry: Cached historical data.")
        except Exception as e:
            self.historical_data = None
            print(f"Warning: Could not cache cleaned_data.csv: {e}")

        # Cache SHAP explainer to avoid rebuilding the tree on every request
        self.shap_explainer = None
        if self.duration_model is not None:
            try:
                import shap
                self.shap_explainer = shap.TreeExplainer(self.duration_model)
                print("ModelRegistry: Cached SHAP TreeExplainer.")
            except Exception as e:
                print(f"Warning: Could not initialize SHAP Explainer: {e}")

    @classmethod
    def reload(cls):
        if cls._instance is not None:
            cls._instance.load_models()
        return cls.get_instance()
