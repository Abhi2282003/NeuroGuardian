# eeg_prediction.py

import pandas as pd
import numpy as np
import time
import joblib
from scipy.stats import skew, kurtosis
from scipy.signal import welch
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
import csv

# Real-Time Simulation for EEG Data Collection
def collect_eeg_data(duration_seconds=60, fs=256):
    """
    Simulate real-time EEG data collection by generating data incrementally with delays.
    
    Parameters:
        duration_seconds (int): Duration to collect data in seconds.
        fs (int): Sampling frequency in Hz.
    
    Returns:
        pd.DataFrame: Simulated EEG data with columns ['Timestamp', 'FP1', 'FP2'].
    """
    num_samples = duration_seconds * fs
    timestamps = []
    fp1 = []
    fp2 = []
    
    print(f"Simulating real-time EEG data collection for {duration_seconds} seconds...")
    start_time = time.time()
    
    for i in range(num_samples):
        # Calculate the current timestamp in milliseconds
        current_time = (i / fs) * 1000  # in milliseconds
        timestamps.append(current_time)
        
        # Simulate EEG signals with random noise; replace with actual data
        fp1.append(np.random.normal(0, 1))
        fp2.append(np.random.normal(0, 1))
        
        # Wait for the next sample time
        time.sleep(1 / fs)
    
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(f"Data collection completed in {elapsed_time:.2f} seconds.")
    
    data = {
        "Timestamp": timestamps,
        "FP1": fp1,
        "FP2": fp2,
    }
    df = pd.DataFrame(data)
    return df

# Feature extraction function
def extract_features_from_window(df_window, fs=256):
    """
    Extract statistical and frequency domain features from EEG data window.

    Parameters:
        df_window (pd.DataFrame): EEG data window.
        fs (int): Sampling frequency in Hz.

    Returns:
        dict: Extracted features.
    """
    stats_features = {
        "FP1_mean": df_window["FP1"].mean(),
        "FP1_std": df_window["FP1"].std(),
        "FP1_skew": skew(df_window["FP1"]),
        "FP1_kurtosis": kurtosis(df_window["FP1"]),
        "FP2_mean": df_window["FP2"].mean(),
        "FP2_std": df_window["FP2"].std(),
        "FP2_skew": skew(df_window["FP2"]),
        "FP2_kurtosis": kurtosis(df_window["FP2"]),
    }
    
    # Frequency domain features: Alpha band power (8-13 Hz)
    def compute_alpha_power(signal):
        f, Pxx = welch(signal, fs=fs, nperseg=min(256, len(signal)))
        alpha_mask = (f >= 8) & (f <= 13)
        alpha_power = np.trapz(Pxx[alpha_mask], f[alpha_mask])
        return alpha_power

    alpha_power_fp1 = compute_alpha_power(df_window["FP1"].values)
    alpha_power_fp2 = compute_alpha_power(df_window["FP2"].values)
    stats_features["FP1_alpha_power"] = alpha_power_fp1
    stats_features["FP2_alpha_power"] = alpha_power_fp2

    return stats_features

def main():
    # Step 1: Collect EEG data for 1 minute (real-time simulation)
    eeg_data = collect_eeg_data(duration_seconds=20, fs=256)
    
    # Step 2: Extract features from the collected data
    print("Extracting features from the collected data...")
    features = extract_features_from_window(eeg_data, fs=256)
    feature_df = pd.DataFrame([features])
    print("Feature extraction completed.")
    
    # Step 3: Load the saved scaler, model, and label encoder
    print("Loading scaler, trained SVM model, and label encoder...")
    try:
        scaler = joblib.load("scaler.joblib")
        svm_model = joblib.load("svm_eeg_model.joblib")
        label_encoder = joblib.load("label_encoder.joblib")
        print("Scaler, model, and label encoder loaded successfully.")
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Ensure that 'scaler.joblib', 'svm_eeg_model.joblib', and 'label_encoder.joblib' are present.")
        return
    
    # Step 4: Scale the features
    print("Scaling the extracted features...")
    X_scaled = scaler.transform(feature_df)
    
    # Step 5: Make prediction
    print("Making prediction...")
    prediction_encoded = svm_model.predict(X_scaled)
    
    # Step 6: Decode the prediction to get the label
    predicted_label = label_encoder.inverse_transform(prediction_encoded)[0]
    
    print(f"Predicted State: {predicted_label}")
    
    # Optional: Save the prediction with a timestamp
    save_prediction = True  # Set to True to save the prediction
    if save_prediction:
        prediction_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        prediction_entry = [prediction_time, predicted_label]
        file_exists = False
        try:
            with open('eeg_predictions.csv', mode='r', newline='') as file:
                file_exists = True
        except FileNotFoundError:
            file_exists = False
        
        with open('eeg_predictions.csv', mode='a', newline='') as file:
            writer = csv.writer(file)
            if not file_exists:
                writer.writerow(['Timestamp', 'Predicted State'])
            writer.writerow(prediction_entry)
        print(f"Prediction saved at {prediction_time} as '{predicted_label}'.")

if __name__ == "__main__":
    main()
