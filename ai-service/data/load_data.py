import pandas as pd
import os

def load_dataset(file_path: str) -> pd.DataFrame:
    print(f"Loading dataset from: {file_path}")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dataset not found at {file_path}")
    df = pd.read_csv(file_path)
    return df

def inspect_data(df: pd.DataFrame):
    print("="*50)
    print("DATASET INSPECTION")
    print("="*50)
    print(f"Shape: {df.shape[0]} rows, {df.shape[1]} columns\n")
    
    print("Data Types and Null Counts:")
    info_df = pd.DataFrame({
        'Data Type': df.dtypes,
        'Null Count': df.isnull().sum(),
        'Null %': (df.isnull().sum() / len(df) * 100).round(2)
    })
    print(info_df)
    print("\n")
    
    categorical_cols = ['event_cause', 'priority', 'veh_type', 'corridor', 'zone']
    for col in categorical_cols:
        if col in df.columns:
            print(f"Value Counts for '{col}':")
            print(df[col].value_counts(dropna=False))
            print("-" * 30)
