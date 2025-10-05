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
            t_ms = float(parts[0])
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
@st.cache_resource
def load_model_components():
    """
    Load the scaler, SVM model, and label encoder.
    Cached to prevent reloading on every prediction.
    """
    try:
        scaler = joblib.load("scaler.joblib")
        svm_model = joblib.load("svm_eeg_model.joblib")
        label_encoder = joblib.load("label_encoder.joblib")
        return scaler, svm_model, label_encoder
    except FileNotFoundError as e:
        st.error(f"Could not load model files: {e}")
        return None, None, None

def make_prediction(feature_df, scaler, svm_model, label_encoder):
    """
    Predict the label from the single-row DF using the provided scaler and model.
    """
    if scaler is None or svm_model is None or label_encoder is None:
        return "Model components not found."

    X_scaled = scaler.transform(feature_df)
    pred_encoded = svm_model.predict(X_scaled)
    label = label_encoder.inverse_transform(pred_encoded)[0]
    return label

# ---------------------------------------------------------------------
# 4) Save the Prediction to CSV
# ---------------------------------------------------------------------
def save_prediction_to_csv(pred_label, output_csv="predictions_log.csv"):
    """
    Append the timestamp + predicted label to predictions_log.csv as a log.
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
    st.title("EEG Emotion Prediction")
    st.markdown("""
    Welcome to the **EEG Emotion Prediction** app! This tool can either:
    - Connect to an Arduino streaming **Fp1** and **Fp2** channels at **512 Hz** and use a **trained SVM model** 
      to predict whether you're in a **Stressed** or **Relaxed** state.
    - **Upload existing EEG data** in CSV format for prediction.

    **Steps to use:**
    1. **For Live Data:**
        - Connect your Arduino device that sends CSV lines in the format: 
          Time(ms),Fp1(uV),Fp2(uV).
        - Specify your **serial port**, **baud rate**, and **sampling rate** below.
        - Choose **"Collect & Predict Live Data"** mode.
        - Click **"Collect & Predict"** to gather EEG data, extract features, and perform classification.
    2. **For Uploaded Data:**
        - Choose **"Upload Test Data"** mode.
        - Upload your EEG CSV file that includes **at least** columns: FP1, FP2. 
          (Optionally Timestamp, but it will be ignored.)
        - Click **"Predict on Uploaded Data"** to extract features and perform classification.
    3. All predictions are logged with a timestamp in **predictions_log.csv**.
    """)

    # Sidebar for user inputs
    st.sidebar.header("Configuration")

    # Model Files Information
    st.sidebar.markdown("**Model Files** expected in the current directory:")
    st.sidebar.markdown("""

    """)

    # Load model components
    scaler, svm_model, label_encoder = load_model_components()

    # Main interface
    st.subheader("Data Collection & Prediction")

    # Option to choose between live data collection and file upload
    app_mode = st.radio("Choose Mode", ["Collect & Predict Live Data", "Upload Test Data"])

    if app_mode == "Collect & Predict Live Data":
        # Sidebar for Serial Configuration
        st.sidebar.subheader("Serial Configuration")
        serial_port = st.sidebar.text_input("Serial Port", value="COM3")
        baud_rate = st.sidebar.number_input("Baud Rate", value=500000, step=5000)
        sampling_rate = st.sidebar.number_input("Sampling Rate (Hz)", value=512, step=1)

        st.sidebar.markdown("---")
        duration_seconds = st.sidebar.slider("Data Collection Duration (seconds)",
                                             min_value=10, max_value=120,
                                             value=60, step=5)

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

            # Step B: Extract features from the collected data
            with st.spinner("Extracting features..."):
                feat_dict = extract_features(eeg_data, fs=int(sampling_rate))
                feature_df = pd.DataFrame([feat_dict])

            st.markdown("**Extracted Features**:")
            st.dataframe(feature_df)

            # Step C: Predict with the SVM model
            with st.spinner("Predicting..."):
                prediction = make_prediction(feature_df, scaler, svm_model, label_encoder)

            if prediction not in ["Model components not found.", ""]:
                st.success(f"**Predicted State**: {prediction}")
                save_prediction_to_csv(prediction, "predictions_log.csv")
                st.info("Prediction appended to predictions_log.csv.")

                # Display a message or image depending on the result
                if prediction.lower() == "stressed":
                    st.warning("Try some relaxation techniques!")
                else:
                    st.balloons()  # a fun Streamlit effect
            else:
                st.error("Prediction failed. Check model files in directory.")

    elif app_mode == "Upload Test Data":
        st.markdown("### Upload and Predict on Your EEG Data")
        uploaded_file = st.file_uploader("Choose a CSV file", type=["csv"])

        if uploaded_file is not None:
            try:
                # Read the uploaded CSV file
                uploaded_df = pd.read_csv(uploaded_file)
                st.markdown("**Uploaded EEG Data** (first 5 rows):")
                st.dataframe(uploaded_df.head())

                # Drop Timestamp if it exists (we won't use it for prediction)
                if "Timestamp" in uploaded_df.columns:
                    uploaded_df.drop(columns=["Timestamp"], inplace=True)

                # Verify required columns: FP1, FP2
                required_columns = {"FP1", "FP2"}
                if not required_columns.issubset(uploaded_df.columns):
                    st.error(f"Uploaded file must contain at least the columns: {required_columns}")
                    return

                # Option to visualize the data (index as x-axis)
                st.markdown("### Visualization of Uploaded Data (FP1, FP2)")
                st.line_chart(uploaded_df[["FP1", "FP2"]])

                if st.button("Predict on Uploaded Data"):
                    with st.spinner("Extracting features from uploaded data..."):
                        # Use a fixed or assumed sampling rate here. 
                        # If you need something else, you can add a user input in the sidebar.
                        feat_dict = extract_features(uploaded_df, fs=512)
                        feature_df = pd.DataFrame([feat_dict])

                    st.markdown("**Extracted Features:**")
                    st.dataframe(feature_df)

                    with st.spinner("Making predictions..."):
                        prediction = make_prediction(feature_df, scaler, svm_model, label_encoder)

                    if prediction not in ["Model components not found.", ""]:
                        st.success(f"**Predicted State**: {prediction}")
                        save_prediction_to_csv(prediction, "predictions_log.csv")
                        st.info("Prediction appended to predictions_log.csv.")

                        # Display a message or image depending on the result
                        if prediction.lower() == "stressed":
                            st.warning("Try some relaxation techniques!")
                        else:
                            st.balloons()  # a fun Streamlit effect
                    else:
                        st.error("Prediction failed. Check model files in directory.")

            except Exception as e:
                st.error(f"Error processing the uploaded file: {e}")

    st.markdown("---")
    st.subheader("Prediction History")
    if os.path.isfile("predictions_log.csv"):
        df_hist = pd.read_csv("predictions_log.csv")
        if "Predicted State" in df_hist.columns:
            pred_history = df_hist[["Timestamp", "Predicted State"]]
            st.dataframe(pred_history.tail(10))

            # Allow users to download the prediction log
            with open("predictions_log.csv", "rb") as f:
                st.download_button(
                    label="Download Prediction Log",
                    data=f,
                    file_name="predictions_log.csv",
                    mime="text/csv",
                )
        else:
            st.warning("predictions_log.csv does not contain 'Predicted State' column.")
    else:
        st.write("No predictions logged yet. Your predictions will appear here.")

    st.markdown("---")
    st.markdown("""
    **Need Help?**  
    - **Live Data:**
        - Ensure your Arduino is properly streaming data.
        - Verify the baud rate and COM port settings.
    - **Uploaded Data:**
        - Ensure your CSV has columns FP1 and FP2. (Optional Timestamp, which is ignored.)
    - **Model Files:**
        - Confirm that scaler.joblib, svm_eeg_model.joblib, and label_encoder.joblib are present in the app directory.
    """)

if __name__ == "__main__":
    main()