import pandas as pd
import os

def save_emotion_chunks(emotion_df, emotion_label, output_dir="test_chunks", n_files=10):
    """
    Splits `emotion_df` into n_files contiguous chunks and saves them as CSV,
    keeping only FP1 and FP2 columns (no Timestamp, no Emotion).
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Columns to keep (exclude 'Timestamp' and 'Emotion')
    keep_cols = ["FP1", "FP2"]
    emotion_df = emotion_df[keep_cols].reset_index(drop=True)
    
    # Figure out how many rows each chunk will contain
    total_rows = len(emotion_df)
    if n_files > total_rows:
        print(f"WARNING: {emotion_label} has fewer rows ({total_rows}) than the number of requested files ({n_files}).")
        print("Some files may end up empty.")
    chunk_size = total_rows // n_files
    
    for i in range(n_files):
        start_idx = i * chunk_size
        
        # For the last file, go until the end to avoid leftover
        if i == n_files - 1:
            end_idx = total_rows
        else:
            end_idx = (i + 1) * chunk_size
        
        # Extract chunk
        chunk = emotion_df.iloc[start_idx:end_idx]
        
        # Build a filename, e.g. "Stressed_test_1.csv"
        filename = f"{emotion_label}_test_{i+1}.csv"
        filepath = os.path.join(output_dir, filename)
        
        # Save chunk to CSV
        chunk.to_csv(filepath, index=False)
        print(f"Saved {filepath} with {len(chunk)} rows.")


def main():
    # 1. Load original dataset
    df = pd.read_csv("eeg_emotion_data.csv")
    
    # OPTIONAL: If your dataset has multiple emotions, map them:
    # mapping = {"Happy": "Relaxed", "Calm": "Relaxed", "Sad": "Stressed", "Angry": "Stressed"}
    # df["Emotion"] = df["Emotion"].map(mapping)
    # df = df.dropna(subset=["Emotion"])  # drop rows where Emotion is NaN (if any)
    
    # 2. Filter to "Stressed" and "Relaxed"
    stressed_df = df[df["Emotion"] == "Stressed"].copy()
    relaxed_df  = df[df["Emotion"] == "Relaxed"].copy()
    
    print("Number of Stressed samples:", len(stressed_df))
    print("Number of Relaxed samples:", len(relaxed_df))
    
    # 3. Save each emotion in 10 files (contiguous chunks)
    save_emotion_chunks(stressed_df, "Stressed", output_dir="test_chunks", n_files=10)
    save_emotion_chunks(relaxed_df,  "Relaxed",  output_dir="test_chunks", n_files=10)


if __name__ == "__main__":
    main()
