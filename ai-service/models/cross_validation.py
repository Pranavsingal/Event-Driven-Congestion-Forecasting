import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.model_selection import cross_val_score, StratifiedKFold, KFold
from xgboost import XGBClassifier, XGBRegressor
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error
from models.data_prep import prepare_data
from models.dl_model import DurationMLP

def run_cross_validation():
    print("="*50)
    print("5-FOLD CROSS VALIDATION")
    print("="*50)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    processed_path = os.path.join(base_dir, '..', '..', 'data', 'processed', 'cleaned_data.csv')
    df = pd.read_csv(processed_path)
    
    # We use prepare_data to get the full X and y arrays (before train/test split)
    X, y1, y2, y3 = prepare_data(df)
    
    results_path = os.path.join(base_dir, '..', '..', 'outputs', 'results.txt')
    
    with open(results_path, 'w') as f:
        f.write("5-FOLD CROSS-VALIDATION RESULTS\n")
        f.write("=================================\n\n")
        
        # 1. XGBoost Severity Classifier
        if y1 is not None:
            print("Running CV for XGBoost Severity Classifier...")
            mask1 = y1.notna()
            X1, y1_clean = X[mask1], y1[mask1]
            
            model_sev = XGBClassifier(n_estimators=200, max_depth=5, random_state=42, eval_metric='mlogloss')
            # Stratified KFold for classification
            cv_sev = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
            scores_sev = cross_val_score(model_sev, X1, y1_clean, cv=cv_sev, scoring='accuracy', n_jobs=-1)
            
            res_sev = f"Severity Classifier (XGBoost) Accuracy: {scores_sev.mean():.4f} ± {scores_sev.std():.4f}"
            print(res_sev)
            f.write(res_sev + "\n")
            
        # 2. RandomForest Road Closure Classifier
        if y3 is not None:
            print("Running CV for RandomForest Closure Classifier...")
            mask3 = y3.notna()
            X3, y3_clean = X[mask3], y3[mask3]
            
            model_clos = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, class_weight='balanced')
            cv_clos = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
            scores_clos = cross_val_score(model_clos, X3, y3_clean, cv=cv_clos, scoring='accuracy', n_jobs=-1)
            
            res_clos = f"Closure Classifier (RandomForest) Accuracy: {scores_clos.mean():.4f} ± {scores_clos.std():.4f}"
            print(res_clos)
            f.write(res_clos + "\n")
            
        # 3. XGBoost Duration Regressor
        if y2 is not None:
            print("Running CV for XGBoost Duration Regressor...")
            mask2 = y2.notna()
            X2, y2_clean = X[mask2], y2[mask2]
            
            model_dur = XGBRegressor(n_estimators=200, random_state=42, eval_metric='rmse')
            cv_dur = KFold(n_splits=5, shuffle=True, random_state=42)
            
            # Returns negative RMSE, so we multiply by -1
            scores_dur = cross_val_score(model_dur, X2, y2_clean, cv=cv_dur, scoring='neg_root_mean_squared_error', n_jobs=-1)
            rmse_scores = -scores_dur
            
            res_dur = f"Duration Regressor (XGBoost) RMSE: {rmse_scores.mean():.2f} ± {rmse_scores.std():.2f} mins"
            print(res_dur)
            f.write(res_dur + "\n")
            
        # 4. PyTorch MLP Duration Regressor (Manual CV)
        if y2 is not None:
            print("Running CV for PyTorch MLP Duration Regressor...")
            kf = KFold(n_splits=5, shuffle=True, random_state=42)
            mlp_rmse_scores = []
            
            for fold, (train_idx, test_idx) in enumerate(kf.split(X2)):
                X_tr, X_te = X2.iloc[train_idx], X2.iloc[test_idx]
                y_tr, y_te = y2_clean.iloc[train_idx], y2_clean.iloc[test_idx]
                
                scaler = StandardScaler()
                X_tr_sc = scaler.fit_transform(X_tr)
                X_te_sc = scaler.transform(X_te)
                
                X_train_tensor = torch.FloatTensor(X_tr_sc)
                y_train_tensor = torch.FloatTensor(y_tr.values).view(-1, 1)
                X_test_tensor = torch.FloatTensor(X_te_sc)
                
                loader = DataLoader(TensorDataset(X_train_tensor, y_train_tensor), batch_size=64, shuffle=True)
                model_mlp = DurationMLP(input_size=X2.shape[1])
                criterion = nn.MSELoss()
                optimizer = optim.Adam(model_mlp.parameters(), lr=0.005)
                
                # Shorter epochs for CV to save time (30 instead of 50)
                for epoch in range(30):
                    model_mlp.train()
                    for batch_X, batch_y in loader:
                        optimizer.zero_grad()
                        loss = criterion(model_mlp(batch_X), batch_y)
                        loss.backward()
                        optimizer.step()
                        
                model_mlp.eval()
                with torch.no_grad():
                    preds = np.maximum(0, model_mlp(X_test_tensor).numpy()).flatten()
                    
                rmse = np.sqrt(mean_squared_error(y_te.values, preds))
                mlp_rmse_scores.append(rmse)
                
            mlp_rmse_arr = np.array(mlp_rmse_scores)
            res_mlp = f"Duration Regressor (PyTorch MLP) RMSE: {mlp_rmse_arr.mean():.2f} ± {mlp_rmse_arr.std():.2f} mins"
            print(res_mlp)
            f.write(res_mlp + "\n")

    print(f"\nAll CV metrics successfully written to {results_path}")

if __name__ == "__main__":
    run_cross_validation()
