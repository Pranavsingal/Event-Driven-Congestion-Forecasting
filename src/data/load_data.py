"""
Load Data Script
Responsible for loading the raw dataset and providing initial inspections
(shape, data types, null counts, and key value counts).
"""

import pandas as pd
import os

def load_dataset(file_path: str) -> pd.DataFrame:
    """
    Loads the dataset from the given file path.
    """
    print(f"Loading dataset from: {file_path}")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found at {file_path}")
        
    df = pd.read_csv(file_path)
    return df

def inspect_data(df: pd.DataFrame):
    """
    Inspects the dataset by printing its shape, data types, null counts,
    and value counts for key categorical columns.
    """
    print("="*50)
    print("DATASET INSPECTION")
    print("="*50)
    
    # 1. Shape
    print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns\n")
    
    # 2. Data Types & Null Counts
    print("Data Types and Null Counts:")
    info_df = pd.DataFrame({
        'Data Type': df.dtypes,
        'Null Count': df.isnull().sum(),
        'Null %': (df.isnull().sum() / len(df) * 100).round(2)
    })
    print(info_df)
    print("\n")
    
    # 3. Value Counts for key categorical columns
    key_cols = ['event_cause', 'priority', 'veh_type', 'corridor', 'zone']
    for col in key_cols:
        if col in df.columns:
            print(f"Value Counts for '{col}':")
            print(df[col].value_counts(dropna=False))
            print("-" * 30)

if __name__ == "__main__":
    # Test the script if run directly
    sample_path = "../../dataset/Astram event data_anonymized - Astram event data_anonymizedb40ac87.csv"
    try:
        df = load_dataset(sample_path)
        inspect_data(df)
    except FileNotFoundError as e:
        print(e)
