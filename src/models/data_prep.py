"""
Data Preparation Script for Models
Responsible for defining the feature matrix (X) and target vectors (y1, y2, y3)
from the processed dataset, and preparing train/test splits.
"""

import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split

def prepare_data(df: pd.DataFrame):
    """
    Defines X (engineered features) and y1, y2, y3 targets.
    Returns X, y1, y2, y3.
    """
    print("Preparing X and y matrices...")
    
    # 1. Define Features (X)
    # Select our newly engineered columns and spatial/temporal features
    feature_cols = [
        'event_cause_encoded', 
        'veh_type_encoded', 
        'corridor_encoded', 
        'zone_encoded', 
        'junction_encoded',
        'start_hour', 
        'start_weekday', 
        'start_month', 
        'start_day_of_year',
        'is_peak_hour', 
        'lat_cluster'
    ]
    
    # Ensure all feature columns exist, otherwise skip missing ones
    X_cols = [col for col in feature_cols if col in df.columns]
    X = df[X_cols].copy()
    
    # 2. Define Targets (y)
    # y1: Priority (Severity) - Classification
    y1 = df['priority_encoded'] if 'priority_encoded' in df.columns else None
    
    # y2: Duration in minutes - Regression
    y2 = df['duration_mins'] if 'duration_mins' in df.columns else None
    
    # y3: Requires Road Closure - Classification (Binary)
    y3 = None
    if 'requires_road_closure' in df.columns:
        # Convert boolean to integer (1/0)
        y3 = df['requires_road_closure'].astype(int)
        
    print(f"  - X shape: {X.shape}")
    if y1 is not None: print(f"  - y1 (priority) shape: {y1.shape}")
    if y2 is not None: print(f"  - y2 (duration_mins) shape: {y2.shape}")
    if y3 is not None: print(f"  - y3 (requires_closure) shape: {y3.shape}")
    
    return X, y1, y2, y3

def get_train_test_splits(df: pd.DataFrame):
    """
    Convenience function that returns train/test splits for each specific target,
    handling any missing/NaN values appropriately per target.
    """
    X, y1, y2, y3 = prepare_data(df)
    
    splits = {}
    
    # Split for Severity Classifier (y1)
    if y1 is not None:
        mask1 = y1.notna()
        X1, y1_clean = X[mask1], y1[mask1]
        splits['severity'] = train_test_split(X1, y1_clean, test_size=0.2, random_state=42, stratify=y1_clean)
        
    # Split for Duration Regressor (y2)
    if y2 is not None:
        mask2 = y2.notna()
        X2, y2_clean = X[mask2], y2[mask2]
        # Regression doesn't use stratify
        splits['duration'] = train_test_split(X2, y2_clean, test_size=0.2, random_state=42)
        
    # Split for Closure Classifier (y3)
    if y3 is not None:
        mask3 = y3.notna()
        X3, y3_clean = X[mask3], y3[mask3]
        splits['closure'] = train_test_split(X3, y3_clean, test_size=0.2, random_state=42, stratify=y3_clean)
        
    return splits

if __name__ == "__main__":
    # Test script locally
    base_dir = os.path.dirname(os.path.abspath(__file__))
    processed_path = os.path.join(base_dir, '..', '..', 'data', 'processed', 'cleaned_data.csv')
    
    if os.path.exists(processed_path):
        df = pd.read_csv(processed_path)
        X, y1, y2, y3 = prepare_data(df)
    else:
        print(f"Processed dataset not found at {processed_path}. Run main.py first.")
