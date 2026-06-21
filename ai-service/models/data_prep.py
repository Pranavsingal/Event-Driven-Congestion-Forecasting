
import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split

def prepare_data(df: pd.DataFrame):
    print("Preparing X and y matrices...")
    
    feature_cols = [
        'event_cause_encoded', 'veh_type_encoded', 'corridor_encoded', 
        'zone_encoded', 'junction_encoded', 'start_hour', 
        'start_weekday', 'start_month', 'start_day_of_year',
        'is_peak_hour', 'lat_cluster',
        'sin_hour', 'cos_hour', 'sin_day', 'cos_day'
    ]
    
    X_cols = [col for col in feature_cols if col in df.columns]
    X = df[X_cols].copy()
    
    y1 = df['priority_encoded'] if 'priority_encoded' in df.columns else None
    y2 = df['duration_mins'] if 'duration_mins' in df.columns else None
    y3 = df['requires_road_closure'].astype(int) if 'requires_road_closure' in df.columns else None
        
    return X, y1, y2, y3

def get_train_test_splits(df: pd.DataFrame):
    X, y1, y2, y3 = prepare_data(df)
    splits = {}
    
    if y1 is not None:
        mask1 = y1.notna()
        splits['severity'] = train_test_split(X[mask1], y1[mask1], test_size=0.2, random_state=42, stratify=y1[mask1])
        
    if y2 is not None:
        mask2 = y2.notna()
        splits['duration'] = train_test_split(X[mask2], y2[mask2], test_size=0.2, random_state=42)
        
    if y3 is not None:
        mask3 = y3.notna()
        splits['closure'] = train_test_split(X[mask3], y3[mask3], test_size=0.2, random_state=42, stratify=y3[mask3])
        
    return splits
