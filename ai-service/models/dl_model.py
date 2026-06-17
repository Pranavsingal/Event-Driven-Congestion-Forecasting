import os
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error
from models.data_prep import get_train_test_splits

class DurationMLP(nn.Module):
    def __init__(self, input_size):
        super(DurationMLP, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 64), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(64, 32), nn.ReLU(), nn.Dropout(0.2),
            nn.Linear(32, 1)
        )
    def forward(self, x): return self.network(x)

def train_dl_model():
    print("="*50)
    print("TRAINING DEEP LEARNING MODEL (PyTorch MLP)")
    print("="*50)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    processed_path = os.path.join(base_dir, '..', '..', 'data', 'processed', 'cleaned_data.csv')
    df = pd.read_csv(processed_path)
    splits = get_train_test_splits(df)
    
    X_train, X_test, y_train, y_test = splits['duration']
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    X_train_tensor = torch.FloatTensor(X_train_scaled)
    y_train_tensor = torch.FloatTensor(y_train.values).view(-1, 1)
    X_test_tensor = torch.FloatTensor(X_test_scaled)
    
    train_loader = DataLoader(TensorDataset(X_train_tensor, y_train_tensor), batch_size=64, shuffle=True)
    
    model = DurationMLP(input_size=X_train.shape[1])
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=0.005)
    
    for epoch in range(50):
        model.train()
        for batch_X, batch_y in train_loader:
            optimizer.zero_grad()
            loss = criterion(model(batch_X), batch_y)
            loss.backward()
            optimizer.step()
            
    model.eval()
    with torch.no_grad():
        test_preds = np.maximum(0, model(X_test_tensor).numpy()).flatten()
        
    rmse = np.sqrt(mean_squared_error(y_test.values, test_preds))
    print(f"\nPyTorch MLP Evaluation:\n  - RMSE: {rmse:.2f} minutes")
    
    outputs_dir = os.path.join(base_dir, '..', '..', 'outputs', 'models')
    os.makedirs(outputs_dir, exist_ok=True)
    model_path = os.path.join(outputs_dir, 'dl_duration_model.pth')
    torch.save(model.state_dict(), model_path)
    print(f"PyTorch model successfully saved to {model_path}")

if __name__ == "__main__":
    train_dl_model()
