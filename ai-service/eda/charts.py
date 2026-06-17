import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

plt.style.use('dark_background')
sns.set_theme(style="darkgrid", rc={"axes.facecolor": "#111111", "figure.facecolor": "#111111", "text.color": "white", "axes.labelcolor": "white", "xtick.color": "white", "ytick.color": "white"})

def generate_charts(df: pd.DataFrame):
    print("="*50)
    print("GENERATING EDA CHARTS")
    print("="*50)
    
    output_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'outputs', 'charts')
    os.makedirs(output_dir, exist_ok=True)
    
    print("  - Generating top5_causes.png...")
    plt.figure(figsize=(10, 6))
    top_causes = df['event_cause'].value_counts().nlargest(5)
    sns.barplot(x=top_causes.values, y=top_causes.index, palette="viridis")
    plt.title('Top 5 Event Causes', fontsize=16)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'top5_causes.png'), dpi=150)
    plt.close()
    
    if 'start_hour' in df.columns:
        print("  - Generating incidents_by_hour.png...")
        plt.figure(figsize=(12, 6))
        hourly_counts = df['start_hour'].value_counts().sort_index()
        sns.barplot(x=hourly_counts.index, y=hourly_counts.values, palette="magma")
        plt.title('Incidents by Hour of Day', fontsize=16)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'incidents_by_hour.png'), dpi=150)
        plt.close()
        
    if 'start_weekday' in df.columns:
        print("  - Generating incidents_by_day.png...")
        plt.figure(figsize=(10, 6))
        day_names = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        daily_counts = df['start_weekday'].value_counts().sort_index()
        daily_counts.index = [day_names[int(i)] for i in daily_counts.index]
        sns.barplot(x=daily_counts.index, y=daily_counts.values, palette="plasma")
        plt.title('Incidents by Day of the Week', fontsize=16)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'incidents_by_day.png'), dpi=150)
        plt.close()
        
    if 'priority' in df.columns:
        print("  - Generating severity_split.png...")
        plt.figure(figsize=(8, 8))
        priority_counts = df['priority'].value_counts()
        plt.pie(priority_counts.values, labels=priority_counts.index, autopct='%1.1f%%', 
                startangle=140, colors=['#e74c3c', '#3498db', '#f1c40f'],
                textprops={'color': "white", 'fontsize': 14})
        plt.title('Incident Severity Split', fontsize=16)
        centre_circle = plt.Circle((0,0),0.70,fc='#111111')
        fig = plt.gcf()
        fig.gca().add_artist(centre_circle)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'severity_split.png'), dpi=150)
        plt.close()
        
    if 'corridor' in df.columns and 'start_hour' in df.columns:
        print("  - Generating corridor_heatmap.png...")
        plt.figure(figsize=(14, 8))
        top_corridors = df['corridor'].value_counts().nlargest(10).index
        heatmap_data = df[df['corridor'].isin(top_corridors)].groupby(['corridor', 'start_hour']).size().unstack(fill_value=0)
        sns.heatmap(heatmap_data, cmap="YlOrRd", annot=False, fmt="d", linewidths=.5)
        plt.title('Heatmap of Incidents: Top 10 Corridors vs. Hour of Day', fontsize=16)
        plt.tight_layout()
        plt.savefig(os.path.join(output_dir, 'corridor_heatmap.png'), dpi=150)
        plt.close()

    print(f"All EDA charts saved successfully in {output_dir}")
