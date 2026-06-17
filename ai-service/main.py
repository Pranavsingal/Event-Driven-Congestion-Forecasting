import os
from data.load_data import load_dataset, inspect_data
from data.clean_data import clean_data
from data.feature_engineering import engineer_features
from eda.charts import generate_charts

def main():
    print("Starting AI Service ML Pipeline...\n")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_name = "Astram event data_anonymized - Astram event data_anonymizedb40ac87.csv"
    raw_data_path = os.path.join(base_dir, "..", "dataset", dataset_name)
    
    print("--- Step 1: Load & Inspect ---")
    df = load_dataset(raw_data_path)
    inspect_data(df)
    
    print("\n--- Step 2: Clean Data ---")
    df = clean_data(df)
    
    print("\n--- Step 3: Feature Engineering ---")
    df = engineer_features(df)
    
    print("\n--- Step 4: Generate EDA Charts ---")
    generate_charts(df)
    
    print("\nPipeline execution finished successfully. Data and charts saved to root folders.")

if __name__ == "__main__":
    main()
