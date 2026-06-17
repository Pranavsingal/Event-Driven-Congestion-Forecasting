import pandas as pd
import numpy as np
import os

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    print("="*50)
    print("DATA CLEANING")
    print("="*50)
    df = df.copy()
    
    # Fix lat/lng 0.0 values
    print("Fixing lat/lng 0.0 values...")
    lat_lng_cols = ['latitude', 'longitude', 'endlatitude', 'endlongitude']
    for col in lat_lng_cols:
        if col in df.columns:
            zeros_mask = df[col] == 0.0
            df.loc[zeros_mask, col] = np.nan
            print(f"  - Replaced {zeros_mask.sum()} zeros with NaN in '{col}'")
            
    # Parse datetimes
    print("Parsing datetime columns...")
    dt_cols = ['start_datetime', 'end_datetime', 'closed_datetime', 'resolved_datetime']
    for col in dt_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
            
    if 'start_datetime' in df.columns:
        print("  - Extracting hour, weekday, month, and day_of_year from start_datetime")
        df['start_hour'] = df['start_datetime'].dt.hour
        df['start_weekday'] = df['start_datetime'].dt.weekday
        df['start_month'] = df['start_datetime'].dt.month
        df['start_day_of_year'] = df['start_datetime'].dt.dayofyear
        
    # Compute duration
    print("Computing event durations...")
    end_col = 'closed_datetime' if 'closed_datetime' in df.columns else 'resolved_datetime'
    if 'start_datetime' in df.columns and end_col in df.columns:
        duration_series = (df[end_col] - df['start_datetime']).dt.total_seconds() / 60.0
        df['duration_mins'] = duration_series
        
        anomalies = (df['duration_mins'] < 0) | (df['duration_mins'] > 24 * 60)
        df.loc[anomalies, 'duration_mins'] = np.nan
        print(f"  - Found {anomalies.sum()} anomalous durations (<0 or >24h). Setting to NaN.")
        print(f"  - Duration Stats: Mean={df['duration_mins'].mean():.1f}m, Median={df['duration_mins'].median():.1f}m, Max={df['duration_mins'].max():.1f}m")
        
    return df
