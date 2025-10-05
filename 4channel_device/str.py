import streamlit as st
import pandas as pd
import numpy as np
import time
import joblib
import csv
import os
import serial  # PySerial
from datetime import datetime
from scipy.stats import skew, kurtosis
from scipy.signal import welch

# ---------------------------------------------------------------------
# 1) Collect EEG Data from Arduino
# ---------------------------------------------------------------------
def collect_eeg_data(duration_seconds=60, port="COM3", baud_rate=500000, fs=512):
    """
    Read real-time EEG data from Arduino over serial for 'duration_seconds'.
    Expects lines formatted as: "Time(ms),Fp1(uV),Fp2(uV)".
    
    Returns a pandas DataFrame with columns ["Timestamp", "FP1", "FP2"].
    """
    st.write(f"Attempting connection to {port} at {baud_rate} baud...")

    try:
        ser = serial.Serial(port, baud_rate, timeout=1)
    except Exception as e:
        st.error(f"Could not open serial port {port}: {e}")
        return pd.DataFrame(columns=["Timestamp", "FP1", "FP2"])  # empty

    timestamps, fp1, fp2 = [], [], []

    start_time = time.time()
    st.write(f"Collecting data at ~{fs} Hz for {duration_seconds} seconds...")
    progress_bar = st.progress(0)
    status_text = st.empty()

    while True:
        elapsed = time.time() - start_time
        if elapsed >= duration_seconds:
            break

        line = ser.readline().decode("utf-8", errors="replace").strip()
        # Skip empty lines or header lines starting with "Time"
        if not line or line.startswith("Time"):
            continue

        parts = line.split(",")
        if len(parts) < 3:
            continue

        try:
            t_ms  = float(parts[0])
            val_fp1 = float(parts[1])
            val_fp2 = float(parts[2])
        except ValueError:
            # If parsing fails, skip that line
            continue

        timestamps.append(t_ms)
        fp1.append(val_fp1)
        fp2.append(val_fp2)

        # Update progress bar
        progress_fraction = min(1.0, elapsed / duration_seconds)
        progress_bar.progress(progress_fraction)
        status_text.text(f"Collecting data... {int(progress_fraction * 100)}%")

    ser.close()
    total_collected = len(timestamps)
    st.success(f"Data collection completed in {time.time()-start_time:.2f} seconds.")
    st.write(f"Total samples collected: **{total_collected}**")

    data = {
        "Timestamp": timestamps,
        "FP1": fp1,
        "FP2": fp2,
    }
    df = pd.DataFrame(data)
    return df

# ---------------------------------------------------------------------
# 2) Feature Extraction
# ---------------------------------------------------------------------
def extract_features(df_window, fs=512):
    """
    Extract statistical + alpha-band power features from the entire DataFrame window.
    If you want multiple windows, replicate your training approach here.
    """
    features = {
        "FP1_mean": df_window["FP1"].mean(),
        "FP1_std": df_window["FP1"].std(),
        "FP1_skew": skew(df_window["FP1"]),
        "FP1_kurtosis": kurtosis(df_window["FP1"]),
        "FP2_mean": df_window["FP2"].mean(),
        "FP2_std": df_window["FP2"].std(),
        "FP2_skew": skew(df_window["FP2"]),
        "FP2_kurtosis": kurtosis(df_window["FP2"]),
    }

    # Welch's method to compute alpha (8-13 Hz) power
    def compute_alpha_power(signal):
        nperseg = min(len(signal), 512)
        f, Pxx = welch(signal, fs=fs, nperseg=nperseg)
        alpha_mask = (f >= 8) & (f <= 13)
        alpha_power = np.trapz(Pxx[alpha_mask], x=f[alpha_mask])
        return alpha_power

    features["FP1_alpha_power"] = compute_alpha_power(df_window["FP1"].values)
    features["FP2_alpha_power"] = compute_alpha_power(df_window["FP2"].values)

    return features

# ---------------------------------------------------------------------
# 3) Load Model & Predict
# ---------------------------------------------------------------------
def make_prediction(feature_df):
    """
    Load the scaler, SVM model, and label encoder. Predict the label from the single-row DF.
    """
    try:
        scaler = joblib.load("scaler.joblib")
        svm_model = joblib.load("svm_eeg_model.joblib")
        label_encoder = joblib.load("label_encoder.joblib")
    except FileNotFoundError as e:
        st.error(f"Could not load model files: {e}")
        return "Model components not found."

    X_scaled = scaler.transform(feature_df)
    pred_encoded = svm_model.predict(X_scaled)
    label = label_encoder.inverse_transform(pred_encoded)[0]
    return label

# ---------------------------------------------------------------------
# 4) Save the Prediction to CSV
# ---------------------------------------------------------------------
def save_prediction_to_csv(pred_label, output_csv="test.csv"):
    """
    Append the timestamp + predicted label to test.csv as a log.
    """
    prediction_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    row = [prediction_time, pred_label]

    file_exists = os.path.isfile(output_csv)
    with open(output_csv, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Timestamp", "Predicted State"])
        writer.writerow(row)

# ---------------------------------------------------------------------
# 5) Streamlit App (Main Function) with Enhanced UI/UX
# ---------------------------------------------------------------------
def main():
    # Configure layout
    st.set_page_config(page_title="EEG Emotion Prediction", layout="centered")

    # Title + Description
    st.title("EEG Emotion Prediction - Real Arduino Data")
    st.markdown("""
    Welcome to the **EEG Emotion Prediction** app! This tool connects to an Arduino
    streaming **Fp1** and **Fp2** channels at **512 Hz** and uses a **trained SVM model** 
    to predict whether you're in a **Stressed** or **Relaxed** state.
    
    **Steps to use:**
    1. Connect your Arduino device that sends CSV lines in the format: 
       `Time(ms),Fp1(uV),Fp2(uV)`.
    2. Specify your **serial port** and **baud rate** below (matching Arduino).
    3. Click **"Collect & Predict"** to gather 1 minute of EEG data (~30,000 samples),
       extract features, and perform a classification.
    4. The prediction, along with a timestamp, is logged to **test.csv**.
    """)

    # Sidebar for user inputs
    st.sidebar.header("Serial Configuration")
    serial_port = st.sidebar.text_input("Serial Port", value="COM3")
    baud_rate = st.sidebar.number_input("Baud Rate", value=500000, step=5000)
    sampling_rate = st.sidebar.number_input("Sampling Rate (Hz)", value=512, step=1)

    st.sidebar.markdown("---")
    duration_seconds = st.sidebar.slider("Data Collection Duration (seconds)",
                                         min_value=10, max_value=120,
                                         value=60, step=5)

    st.sidebar.markdown("""
    **Model Files** expected in the current directory:
    - `scaler.joblib`
    - `svm_eeg_model.joblib`
    - `label_encoder.joblib`
    """)

    # Main interface
    st.subheader("Data Collection & Prediction")

    if st.button("Collect & Predict"):
        # Step A: Collect real EEG data
        with st.spinner(f"Collecting EEG data for {duration_seconds} seconds..."):
            eeg_data = collect_eeg_data(
                duration_seconds=duration_seconds,
                port=serial_port,
                baud_rate=int(baud_rate),
                fs=int(sampling_rate)
            )

        if eeg_data.empty:
            st.error("No data collected. Check your Arduino or COM port settings!")
            return

        # Option to quickly plot or show the raw signals
        st.markdown("**Raw EEG Data** (first 5 rows):")
        st.dataframe(eeg_data.head())

        st.markdown("### Quick Visualization of Collected Data")
        st.line_chart(eeg_data[["FP1", "FP2"]])

        # Save raw data to CSV
        eeg_data.to_csv("test.csv", index=False)
        st.success(f"Raw EEG data saved to `test.csv`. (Total samples: {len(eeg_data)})")

        # Step B: Extract features from the collected data
        with st.spinner("Extracting features..."):
            feat_dict = extract_features(eeg_data, fs=int(sampling_rate))
            feature_df = pd.DataFrame([feat_dict])

        st.markdown("**Extracted Features**:")
        st.dataframe(feature_df)

        # Step C: Predict with the SVM model
        with st.spinner("Predicting..."):
            prediction = make_prediction(feature_df)

        if prediction not in ["Model components not found.", ""]:
            st.success(f"**Predicted State**: {prediction}")
            save_prediction_to_csv(prediction, "test.csv")
            st.info("Prediction appended to 'test.csv'.")

            # Display a message or image depending on the result
            if prediction.lower() == "stressed":
                st.warning("Try some relaxation techniques!")
            else:
                st.balloons()  # a fun Streamlit effect
        else:
            st.error("Prediction failed. Check model files in directory.")

    st.markdown("---")
    st.subheader("Prediction History")
    if os.path.isfile("test.csv"):
        df_hist = pd.read_csv("test.csv")
        # If test.csv also contains raw EEG data columns, handle that carefully
        if "Predicted State" in df_hist.columns:
            # Filter rows that contain exactly 2 columns or check shape
            # E.g., if your raw data lines have 3 columns (Timestamp, FP1, FP2),
            # while predictions have 2 columns (Timestamp, Predicted State).
            pred_history = df_hist[df_hist.columns.intersection(["Timestamp", "Predicted State"])]
            st.dataframe(pred_history.tail(10))
        else:
            st.warning("`test.csv` contains raw EEG data but no predictions to show.")
    else:
        st.write("No `test.csv` file found yet. Predictions will appear here.")

    st.markdown("---")
    st.markdown("""
    **Need Help?**  
    - Check if your Arduino is properly streaming data.  
    - Make sure baud rate and COM port are correct.  
    - Ensure the SVM model files (`.joblib`) are present in the same directory.
    """)

if __name__ == "__main__":
    main()
