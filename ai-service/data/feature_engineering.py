import pandas as pd
import numpy as np
import os
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.cluster import KMeans

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    print("="*50)
    print("FEATURE ENGINEERING")
    print("="*50)
    df = df.copy()
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    interim_dir = os.path.join(base_dir, '..', '..', 'data', 'interim')
    os.makedirs(interim_dir, exist_ok=True)
    
    # 1. Encode categoricals
    print("Encoding categorical variables...")
    categorical_cols = ['event_cause', 'veh_type', 'corridor', 'zone', 'junction', 'priority']
    encoders = {}
    for col in categorical_cols:
        if col in df.columns:
            df[col] = df[col].fillna('Unknown').astype(str)
            le = LabelEncoder()
            new_col = f"{col}_encoded"
            df[new_col] = le.fit_transform(df[col])
            encoders[col] = le
            print(f"  - Encoded '{col}' into '{new_col}' ({len(le.classes_)} classes)")
    joblib.dump(encoders, os.path.join(interim_dir, 'label_encoders.pkl'))
    
    # 2. Flag peak hours & Cyclic Encoding
    print("Flagging peak hours and creating cyclic time features...")
    if 'start_hour' in df.columns:
        df['is_peak_hour'] = df['start_hour'].apply(lambda x: 1 if (7 <= x <= 10) or (17 <= x <= 20) else 0)
        df['sin_hour'] = np.sin(2 * np.pi * df['start_hour'] / 24.0)
        df['cos_hour'] = np.cos(2 * np.pi * df['start_hour'] / 24.0)
        print(f"  - Found {df['is_peak_hour'].sum()} incidents during peak hours.")
    if 'start_weekday' in df.columns:
        df['sin_day'] = np.sin(2 * np.pi * df['start_weekday'] / 7.0)
        df['cos_day'] = np.cos(2 * np.pi * df['start_weekday'] / 7.0)
        
    # 3. KMeans geo-clustering
    print("Running KMeans geo-clustering (k=10)...")
    if 'latitude' in df.columns and 'longitude' in df.columns:
        coords = df[['latitude', 'longitude']].dropna()
        if len(coords) > 0:
            kmeans = KMeans(n_clusters=10, random_state=42, n_init=10)
            coords['lat_cluster'] = kmeans.fit_predict(coords)
            df['lat_cluster'] = -1
            df.loc[coords.index, 'lat_cluster'] = coords['lat_cluster']
            joblib.dump(kmeans, os.path.join(interim_dir, 'kmeans_model.pkl'))
            print(f"  - Clustered {len(coords)} locations into 10 zones.")
            
    # Save processed data
    processed_dir = os.path.join(base_dir, '..', '..', 'data', 'processed')
    os.makedirs(processed_dir, exist_ok=True)
    out_path = os.path.join(processed_dir, 'cleaned_data.csv')
    df.to_csv(out_path, index=False)
    print(f"\nSaved processed dataset to {out_path}")
    
    return df
