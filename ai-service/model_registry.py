import os
import json
import numpy as np

class JSONLabelEncoder:
    def __init__(self, classes_list):
        self.classes_ = np.array(classes_list)

    def transform(self, values):
        indices = []
        for val in values:
            val_str = str(val)
            # Find matching index
            found = False
            for idx, c in enumerate(self.classes_):
                if str(c) == val_str:
                    indices.append(idx)
                    found = True
                    break
            if not found:
                # Try finding case-insensitive or default to 0
                for idx, c in enumerate(self.classes_):
                    if str(c).lower() == val_str.lower():
                        indices.append(idx)
                        found = True
                        break
            if not found:
                indices.append(0)
        return np.array(indices)

    def inverse_transform(self, indices):
        labels = []
        for idx in indices:
            idx_int = int(idx)
            if 0 <= idx_int < len(self.classes_):
                labels.append(self.classes_[idx_int])
            else:
                labels.append(self.classes_[0])
        return np.array(labels)


class JSONKMeans:
    def __init__(self, cluster_centers_list):
        self.cluster_centers_ = np.array(cluster_centers_list)

    def predict(self, X):
        X_np = np.array(X)[0] # input coordinate [lat, lng]
        distances = np.sqrt(np.sum((self.cluster_centers_ - X_np) ** 2, axis=1))
        closest_idx = int(np.argmin(distances))
        return np.array([closest_idx])


class ModelRegistry:
    _instance = None
    
    def __init__(self):
        self.severity_model = None
        self.duration_model = None
        self.closure_model = None
        self.label_encoders = {}
        self.kmeans_model = None
        self.load_models()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def load_models(self):
        print("ModelRegistry: Loading models and JSON configs...")
        base_dir = os.path.dirname(os.path.abspath(__file__))
        outputs_dir = os.path.join(base_dir, '..', 'outputs', 'models')
        interim_dir = os.path.join(base_dir, '..', 'data', 'interim')

        # Attempt to load joblib models ONLY if joblib is available (local dev)
        # On serverless / prod, we fall back to ONNX entirely, so we print a warning and proceed.
        try:
            import joblib
            try:
                self.severity_model = joblib.load(os.path.join(outputs_dir, 'model1.pkl'))
            except Exception as e:
                print(f"Warning: Could not load severity_model: {e}")

            try:
                self.duration_model = joblib.load(os.path.join(outputs_dir, 'model2.pkl'))
            except Exception as e:
                print(f"Warning: Could not load duration_model: {e}")

            try:
                self.closure_model = joblib.load(os.path.join(outputs_dir, 'model3.pkl'))
            except Exception as e:
                print(f"Warning: Could not load closure_model: {e}")
        except ImportError:
            print("ModelRegistry: joblib not installed, running in ONNX-only mode.")

        # Load Label Encoders from JSON
        le_json_path = os.path.join(interim_dir, 'label_encoders.json')
        if os.path.exists(le_json_path):
            try:
                with open(le_json_path, 'r') as f:
                    le_data = json.load(f)
                self.label_encoders = {col: JSONLabelEncoder(classes) for col, classes in le_data.items()}
                print("ModelRegistry: Loaded label encoders from JSON.")
            except Exception as e:
                print(f"Error loading label_encoders.json: {e}")
        else:
            print("Warning: label_encoders.json not found.")

        # Load KMeans model from JSON
        kmeans_json_path = os.path.join(interim_dir, 'kmeans_model.json')
        if os.path.exists(kmeans_json_path):
            try:
                with open(kmeans_json_path, 'r') as f:
                    kmeans_centers = json.load(f)
                self.kmeans_model = JSONKMeans(kmeans_centers)
                print("ModelRegistry: Loaded KMeans cluster centers from JSON.")
            except Exception as e:
                print(f"Error loading kmeans_model.json: {e}")
        else:
            print("Warning: kmeans_model.json not found.")

    @classmethod
    def reload(cls):
        if cls._instance is not None:
            cls._instance.load_models()
        return cls.get_instance()
