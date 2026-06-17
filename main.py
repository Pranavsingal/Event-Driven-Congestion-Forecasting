"""
Main Pipeline Entry Point
Orchestrates the Day 1 pipeline:
1. Load & Inspect Data
2. (Future) Clean Data
3. (Future) Feature Engineering
4. (Future) EDA Charts
"""

import os
from src.data.load_data import load_dataset, inspect_data
from src.data.clean_data import clean_data
from src.data.feature_engineering import engineer_features
from src.eda.charts import generate_charts

def main():
    print("Starting Event-Driven Congestion Forecasting Pipeline...\n")
    
    # Define paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_name = "Astram event data_anonymized - Astram event data_anonymizedb40ac87.csv"
    raw_data_path = os.path.join(base_dir, "dataset", dataset_name)
    
    # Step 1: Load and Inspect Data
    print("--- Step 1: Load & Inspect ---")
    df = load_dataset(raw_data_path)
    inspect_data(df)
    
    # Step 2: Clean Data
    print("\n--- Step 2: Clean Data ---")
    df = clean_data(df)
    
    # Step 3: Feature Engineering
    print("\n--- Step 3: Feature Engineering ---")
    df = engineer_features(df)
    
    # Step 4: EDA Charts
    print("\n--- Step 4: Generate EDA Charts ---")
    generate_charts(df)
    
    print("\nPipeline execution finished successfully.")

if __name__ == "__main__":
    main()
