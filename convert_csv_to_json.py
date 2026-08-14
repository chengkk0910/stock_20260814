import os
import csv
import json
import glob
import sys

def parse_value(val):
    if val is None:
        return None
    val = val.strip()
    if val == '':
        return None
    # Try integer conversion
    try:
        i = int(val)
        if len(val) > 1 and val.startswith('0') and not val.startswith('0.'):
            return val
        return i
    except ValueError:
        pass
    # Try float conversion
    try:
        return float(val)
    except ValueError:
        pass
    return val

def convert_csv_file(csv_path, json_path=None):
    if json_path is None:
        json_path = os.path.splitext(csv_path)[0] + '.json'
    
    with open(csv_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        data = []
        for row in reader:
            parsed_row = {k.strip(): parse_value(v) for k, v in row.items() if k is not None}
            data.append(parsed_row)
            
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Converted: {csv_path} -> {json_path} ({len(data)} records)")

def convert_directory(folder_path):
    csv_files = glob.glob(os.path.join(folder_path, "**", "*.csv"), recursive=True)
    if not csv_files:
        print(f"No CSV files found in {folder_path}")
        return
    print(f"Found {len(csv_files)} CSV file(s) in {folder_path}:")
    for csv_file in csv_files:
        convert_csv_file(csv_file)

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else '.'
    if os.path.isfile(target):
        convert_csv_file(target)
    elif os.path.isdir(target):
        convert_directory(target)
    else:
        print(f"Target '{target}' is neither a file nor a directory.")
