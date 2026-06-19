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

    @classmethod
    def reload(cls):
        if cls._instance is not None:
            cls._instance.load_models()
        return cls.get_instance()
