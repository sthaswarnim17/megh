import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import sys
import json
import os

# Get command line arguments
# Usage: python ball.py input_csv_path output_image_path
csv_file_path = sys.argv[1] if len(sys.argv) > 1 else "sample.csv"
output_file_path = sys.argv[2] if len(sys.argv) > 2 else "bcg_matrix_output.png"

print(f"Processing file: {csv_file_path}")
print(f"Output will be saved to: {output_file_path}")

# Load Dataset
df = pd.read_csv(csv_file_path)

# Step 0: Rename columns to expected names
def auto_rename_columns(df):
    rename_map = {}
    for col in df.columns:
        col_lower = col.lower().strip().replace(" ", "")
        if any(term in col_lower for term in ["share", "marketshare", "sharerate"]):
            rename_map[col] = "MarketShare"
        elif any(term in col_lower for term in ["growth", "marketgrowth", "growthrate"]):
            rename_map[col] = "MarketGrowth"
        elif any(term in col_lower for term in ["quantity", "count", "units", "sold"]):
            rename_map[col] = "Quantity"
    return df.rename(columns=rename_map)

df = auto_rename_columns(df)

# Find product/item name column
name_column = None
for potential_col in ['Name', 'Product', 'Item', 'Description']:
    matches = [col for col in df.columns if potential_col.lower() in col.lower()]
    if matches:
        name_column = matches[0]
        break

# If no name column found, try to use the first string column
if not name_column:
    for col in df.columns:
        if df[col].dtype == 'object':  # String columns are 'object' type
            name_column = col
            break

# If still no name column, create a dummy one
if not name_column:
    df['ProductName'] = [f'Product {i+1}' for i in range(len(df))]
    name_column = 'ProductName'

print(f"Using column '{name_column}' for product names")

# Ensure required columns exist
if "MarketShare" not in df.columns or "MarketGrowth" not in df.columns:
    # Try to find columns that might be applicable
    numeric_columns = df.select_dtypes(include=['number']).columns
    if len(numeric_columns) >= 2:
        # Use the first two numeric columns as fallback
        df = df.rename(columns={numeric_columns[0]: "MarketShare", numeric_columns[1]: "MarketGrowth"})
        print(f"Automatically mapped columns: {numeric_columns[0]} → MarketShare, {numeric_columns[1]} → MarketGrowth")
    else:
        print("Error: Could not find suitable columns for analysis")
        sys.exit(1)

# Look for Quantity column if not already found
if "Quantity" not in df.columns:
    # Try to find a column that might represent quantity
    potential_quantity_cols = [col for col in df.select_dtypes(include=['number']).columns 
                             if col not in ["MarketShare", "MarketGrowth"]]
    
    if potential_quantity_cols:
        df = df.rename(columns={potential_quantity_cols[0]: "Quantity"})
        print(f"Using '{potential_quantity_cols[0]}' as Quantity column")
    else:
        # If no column found, create a synthetic one
        df["Quantity"] = 1
        print("No quantity column found, using default value of 1 for all products")

# Step 1: Compute dynamic thresholds using median
share_thresh = df["MarketShare"].median()
growth_thresh = df["MarketGrowth"].median()

print(f"\nCalculated Thresholds:")
print(f"  Market Share Threshold: {share_thresh:.2f}")
print(f"  Market Growth Threshold: {growth_thresh:.2f}")

# Step 2: Classification Logic
def classify_bcg(row):
    share = row['MarketShare']
    growth = row['MarketGrowth']
    if share >= share_thresh and growth >= growth_thresh:
        return "Star"
    elif share >= share_thresh and growth < growth_thresh:
        return "Cash Cow"
    elif share < share_thresh and growth >= growth_thresh:
        return "Question Mark"
    else:
        return "Dog"

df['BCG Category'] = df.apply(classify_bcg, axis=1)

# Extract top products by Quantity
try:
    top_products = df.sort_values("Quantity", ascending=False).head(10)
    top_products_list = []
    
    for _, row in top_products.iterrows():
        product_info = {
            "name": str(row[name_column]),
            "quantity": int(row["Quantity"]) if not pd.isna(row["Quantity"]) else 0,
            "category": row["BCG Category"],
            "market_share": float(row["MarketShare"]) if not pd.isna(row["MarketShare"]) else 0,
            "growth_rate": float(row["MarketGrowth"]) if not pd.isna(row["MarketGrowth"]) else 0
        }
        top_products_list.append(product_info)
    print(f"\nTop {len(top_products_list)} products by quantity identified")
except Exception as e:
    print(f"Error extracting top products: {e}")
    top_products_list = []

# Print classification counts
category_counts = df['BCG Category'].value_counts().to_dict()
print("\nBCG Classification Results:")
print(f"  Stars: {category_counts.get('Star', 0)}")
print(f"  Cash Cows: {category_counts.get('Cash Cow', 0)}")
print(f"  Question Marks: {category_counts.get('Question Mark', 0)}")
print(f"  Dogs: {category_counts.get('Dog', 0)}")
print(f"  Total Products: {len(df)}")

# Step 3: Plot BCG Matrix with improved styling
plt.figure(figsize=(12, 8))
plt.style.use('seaborn-v0_8-whitegrid')

# Create scatter plot
scatter = sns.scatterplot(
    data=df,
    x="MarketShare", 
    y="MarketGrowth",
    hue="BCG Category", 
    style="BCG Category", 
    s=150,
    alpha=0.8,
    palette={
        "Star": "#FFD700",      # Gold
        "Cash Cow": "#32CD32",  # Lime Green
        "Question Mark": "#1E90FF", # Dodger Blue
        "Dog": "#FF6347"        # Tomato
    }
)

# Add product names as labels with limit to prevent overcrowding
max_labels = min(15, len(df))
for idx, row in df.head(max_labels).iterrows():
    if name_column:
        plt.annotate(
            str(row[name_column])[:15] + '...' if len(str(row[name_column])) > 15 else str(row[name_column]),
            xy=(row['MarketShare'], row['MarketGrowth']),
            xytext=(5, 5),
            textcoords='offset points',
            fontsize=8
        )

# Add quadrant lines
plt.axvline(x=share_thresh, color='grey', linestyle='--', alpha=0.6)
plt.axhline(y=growth_thresh, color='grey', linestyle='--', alpha=0.6)

# Add quadrant labels
plt.text(df['MarketShare'].max()*0.75, df['MarketGrowth'].max()*0.9, 'STARS', fontsize=14, fontweight='bold', color='#FFD700')
plt.text(df['MarketShare'].max()*0.75, df['MarketGrowth'].min()*0.9, 'CASH COWS', fontsize=14, fontweight='bold', color='#32CD32')
plt.text(df['MarketShare'].min()*1.1, df['MarketGrowth'].max()*0.9, 'QUESTION MARKS', fontsize=14, fontweight='bold', color='#1E90FF')
plt.text(df['MarketShare'].min()*1.1, df['MarketGrowth'].min()*0.9, 'DOGS', fontsize=14, fontweight='bold', color='#FF6347')

# Styling
plt.title("BCG Matrix Analysis", fontsize=16, fontweight='bold')
plt.xlabel(f"Market Share (Threshold: {share_thresh:.2f})", fontsize=12)
plt.ylabel(f"Market Growth Rate (Threshold: {growth_thresh:.2f})", fontsize=12)
plt.legend(title="Categories", fontsize=10, title_fontsize=12)
plt.grid(True, alpha=0.3)
plt.tight_layout()

# Save the figure
plt.savefig(output_file_path, dpi=300, bbox_inches='tight')
print(f"\nBCG Matrix visualization saved to: {output_file_path}")

# Generate summary statistics
summary = {
    'thresholds': {
        'market_share': float(share_thresh),
        'growth_rate': float(growth_thresh)
    },
    'counts': {
        'star': int(category_counts.get('Star', 0)),
        'cash_cow': int(category_counts.get('Cash Cow', 0)),
        'question_mark': int(category_counts.get('Question Mark', 0)),
        'dog': int(category_counts.get('Dog', 0)),
        'total': int(len(df))
    },
    'top_products': top_products_list
}

# Write summary to file
summary_path = output_file_path.replace('.png', '_summary.json')
with open(summary_path, 'w') as f:
    json.dump(summary, f)
print(f"Summary data saved to: {summary_path}")

print("\nAnalysis complete. Ready for AI processing.") 