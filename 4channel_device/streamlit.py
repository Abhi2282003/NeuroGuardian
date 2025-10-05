import streamlit as st
import pandas as pd
import numpy as np
import datetime
import time
import joblib
import csv
import os
import serial  # PySerial
from datetime import datetime as dt
from scipy.stats import skew, kurtosis
from scipy.signal import welch
from fpdf import FPDF  # For PDF report generation

# ------------------------------------------------
# Custom CSS for Enhanced Styling including Sidebar
# ------------------------------------------------
st.markdown(
    """
    <style>
    body {
        background-color: #f0f2f6;
    }
    .header {
        background-color: #4a90e2;
        padding: 20px;
        color: white;
        text-align: center;
        border-radius: 8px;
        margin-bottom: 20px;
    }
    .post-card {
        background-color: #ffffff;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0px 2px 5px rgba(0,0,0,0.1);
    }
    .subheader {
        color: #333333;
        margin-top: 20px;
        margin-bottom: 10px;
    }
    /* Sidebar styling with decreased font size */
    [data-testid="stSidebar"] {
        background-color: #4a90e2;
        color: #ffffff;
        font-size: 14px;
    }
    [data-testid="stSidebar"] * {
        color: #ffffff;
        font-size: 14px;
    }
    </style>
    """,
    unsafe_allow_html=True
)

# ------------------------------------------------
# 1) Initialize Session State
# ------------------------------------------------
def init_session():
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
    if "username" not in st.session_state:
        st.session_state.username = None
    if "subscribed" not in st.session_state:
        st.session_state.subscribed = False
    if "mental_health_data" not in st.session_state:
        st.session_state.mental_health_data = pd.DataFrame(
            columns=["Date", "StressLevel", "Mood", "SleepQuality", "Anxiety"]
        )
    if "community_posts" not in st.session_state:
        st.session_state.community_posts = []
    if "selected_page" not in st.session_state:
        st.session_state.selected_page = "Home"

# ------------------------------------------------
# 2) Login Page (Only if Not Logged In)
# ------------------------------------------------
def login_page():
    st.markdown('<div class="header"><h1>Welcome to NeuroGuardian</h1></div>', unsafe_allow_html=True)
    with st.container():
        st.subheader("Please log in to continue")
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
    
        if st.button("Login"):
            # Hard-coded credentials: admin / admin
            if username == "admin" and password == "admin":
                st.session_state.logged_in = True
                st.session_state.username = "admin"
                st.success("Login successful!")
            else:
                st.error("Invalid username or password.")
    
    if not st.session_state.logged_in:
        st.stop()

# ------------------------------------------------
# 3) Top Header with App Name and Logout Button
# ------------------------------------------------
def top_header():
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown('<div class="header"><h1>NeuroGuardian</h1></div>', unsafe_allow_html=True)
    with col2:
        if st.button("Logout"):
            st.session_state.logged_in = False
            st.session_state.username = None
            st.experimental_rerun()

# ------------------------------------------------
# 4) Sidebar Navigation Menu
# ------------------------------------------------
def sidebar_navigation_menu():
    st.sidebar.header("Navigation")
    menu_options = ["Home", "Subscription", "EEG Prediction", "Community", "Achievements", "Activities & Reminders", "Doctor Consultation"]
    if st.session_state.subscribed:
        menu_options.insert(5, "Detailed Report")
    selected = st.sidebar.radio("Go to", menu_options, index=menu_options.index(st.session_state.selected_page)
                                if st.session_state.selected_page in menu_options else 0)
    st.session_state.selected_page = selected

# ------------------------------------------------
# 5) PDF Report Generation Function (used in Detailed Report page)
# ------------------------------------------------
def generate_pdf_report(df: pd.DataFrame) -> bytes:
    pdf = FPDF()
    pdf.add_page()
    
    # Title
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "NeuroGuardian Detailed Report", ln=True, align="C")
    pdf.ln(5)
    
    # Report date
    pdf.set_font("Arial", size=12)
    pdf.cell(0, 10, "Report Date: " + str(datetime.date.today()), ln=True)
    pdf.ln(5)
    
    # Summary Statistics
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Summary Statistics", ln=True)
    pdf.set_font("Arial", size=10)
    summary_str = df.describe().to_string()
    pdf.multi_cell(0, 5, summary_str)
    pdf.ln(5)
    
    # Detailed Data
    pdf.set_font("Arial", "B", 14)
    pdf.cell(0, 10, "Detailed Data", ln=True)
    pdf.set_font("Arial", size=8)
    data_str = df.to_string(index=False)
    pdf.multi_cell(0, 4, data_str)
    
    return pdf.output(dest="S").encode("latin1")

# ------------------------------------------------
# 6) Community (Social) Page
# ------------------------------------------------
def community_page():
    st.header("Community Forum")
    st.write("Share your experiences, recommendations, or how you're feeling today.")
    post_text = st.text_area("What's on your mind?", height=100)
    if st.button("Share"):
        if post_text.strip() != "":
            new_post = {
                "username": st.session_state.username,
                "date": dt.now().strftime("%Y-%m-%d %H:%M"),
                "text": post_text
            }
            st.session_state.community_posts.append(new_post)
            st.success("Post shared!")
        else:
            st.warning("Please enter some text to share.")
    
    if st.session_state.community_posts:
        st.subheader("Recent Community Posts")
        for post in reversed(st.session_state.community_posts):
            with st.container():
                st.markdown(f'<div class="post-card"><strong>{post["username"]}</strong> on <em>{post["date"]}</em><br>{post["text"]}</div>', unsafe_allow_html=True)
    else:
        st.info("No posts yet. Be the first to share!")

# ------------------------------------------------
# 7) Achievements (Gamification) Page
# ------------------------------------------------
def achievements_page():
    st.header("Achievements")
    df = st.session_state.mental_health_data.copy()
    num_entries = len(df)
    
    st.write(f"Total number of entries: *{num_entries}*")
    
    badges = []
    if num_entries >= 1:
        badges.append("Rookie Tracker")
    if num_entries >= 7:
        badges.append("Regular Tracker")
    if num_entries >= 30:
        badges.append("Consistent Tracker")
    
    if num_entries > 0:
        df_dates = pd.to_datetime(df["Date"]).dropna().sort_values().unique()
        dates = pd.to_datetime(df_dates)
        streak = current_streak = 1
        for i in range(1, len(dates)):
            if (dates[i] - dates[i-1]).days == 1:
                current_streak += 1
            else:
                if current_streak > streak:
                    streak = current_streak
                current_streak = 1
        if current_streak > streak:
            streak = current_streak
        st.write(f"*Longest Streak:* {streak} consecutive days")
        if streak >= 3:
            badges.append("3-Day Streak")
        if streak >= 7:
            badges.append("7-Day Streak")
        if streak >= 30:
            badges.append("30-Day Streak")
    else:
        streak = 0
    
    if num_entries > 0:
        avg_stress = df["StressLevel"].mean()
        st.write(f"*Average Stress Level:* {avg_stress:.2f}")
        if avg_stress <= 3:
            badges.append("Mindfulness Champion")
    
    if badges:
        st.subheader("Your Achievements:")
        for badge in badges:
            st.markdown(f"- :trophy: *{badge}*")
    else:
        st.info("No achievements yet. Start tracking your mental health to earn badges!")

# ------------------------------------------------
# 8) Other App Pages (Home, Subscription, Detailed Report, Activities & Reminders, Doctor Consultation)
# ------------------------------------------------
def home_page():
    st.header("Welcome to NeuroGuardian")
    if st.session_state.subscribed:
        st.success("You have an active subscription!")
    else:
        st.warning("You are not subscribed yet. Some features may be limited.")
    st.write("Use the sidebar to explore the app.")

def subscription_page():
    st.header("Subscription")
    if st.session_state.subscribed:
        st.success("You are already subscribed!")
    else:
        st.write("Unlock premium features such as detailed analytics, therapy sessions, and priority consultations.")
        if st.button("Subscribe Now"):
            st.session_state.subscribed = True
            st.success("You are now subscribed!")

def detailed_report_page():
    st.header("Detailed Mental Health Report")
    df = st.session_state.mental_health_data.copy()
    if df.empty:
        st.info("No data available for a detailed report.")
        return
    
    if st.button("Generate Detailed Report"):
        df.sort_values(by="Date", inplace=True)
        with st.expander("View Data Table"):
            st.dataframe(df)
        with st.expander("Summary Statistics"):
            st.write(df.describe())
        st.subheader("Charts")
        st.write("Stress Level Over Time:")
        st.line_chart(df.set_index("Date")[["StressLevel"]])
        st.write("Mood Over Time:")
        st.line_chart(df.set_index("Date")[["Mood"]])
        st.write("Sleep Quality Over Time:")
        st.line_chart(df.set_index("Date")[["SleepQuality"]])
        st.write("Anxiety Level Over Time:")
        st.line_chart(df.set_index("Date")[["Anxiety"]])
        
        pdf_bytes = generate_pdf_report(df)
        st.download_button(
            label="Download Detailed Report as PDF",
            data=pdf_bytes,
            file_name="detailed_report.pdf",
            mime="application/pdf"
        )
    else:
        st.info("Click the button above to generate the detailed report.")

def activities_reminders_page():
    st.header("Activities & Reminders")
    df = st.session_state.mental_health_data
    if df.empty:
        st.info("No data available. Please record your daily data first.")
        return
    avg_stress = df["StressLevel"].mean()
    if avg_stress <= 3:
        st.subheader("You seem quite relaxed!")
        st.write("- Keep up with mindfulness exercises.")
        st.write("- Enjoy light outdoor activities or hobbies.")
    elif 3 < avg_stress <= 6:
        st.subheader("You might be experiencing moderate stress.")
        st.write("- Try short meditation breaks.")
        st.write("- Journal or take a walk to clear your mind.")
    else:
        st.subheader("Your stress seems relatively high.")
        st.write("- Consider talking to a mental health professional.")
        st.write("- Practice extended mindfulness or breathing exercises.")
        st.write("- Consider scheduling a doctor consultation.")
    
    st.subheader("Set a Reminder")
    reminder_text = st.text_input("What would you like to be reminded about?")
    reminder_time = st.time_input("Reminder time", datetime.time(9, 0))
    if st.button("Set Reminder"):
        st.success(f"Reminder set for {reminder_time.strftime('%H:%M')}: {reminder_text}")

def doctor_consultation_page():
    st.header("Doctor Consultation")
    st.write("Feeling overwhelmed? Schedule a session with a mental health professional.")
    if st.session_state.subscribed:
        st.success("As a premium subscriber, you get discounted consultation rates!")
    else:
        st.warning("Consider subscribing for discounts and extra features.")
    
    st.subheader("Schedule a Session")
    consult_date = st.date_input("Select a date", dt.today())
    consult_time = st.time_input("Select a time", dt.now().time())
    if st.button("Book Appointment"):
        st.success(f"Appointment booked for {consult_date} at {consult_time}.")

# ------------------------------------------------
# 9) EEG Prediction Functions
# ------------------------------------------------
def collect_eeg_data(duration_seconds=60, port="COM3", baud_rate=500000, fs=512):
    """
    Read real-time EEG data from Arduino over serial for 'duration_seconds'.
    Expects lines formatted as: "Time(ms),Fp1(uV),Fp2(uV)".
    Returns a DataFrame with columns ["Timestamp", "FP1", "FP2"].
    """
    st.write(f"Attempting connection to {port} at {baud_rate} baud...")
    try:
        ser = serial.Serial(port, baud_rate, timeout=1)
    except Exception as e:
        st.error(f"Could not open serial port {port}: {e}")
        return pd.DataFrame(columns=["Timestamp", "FP1", "FP2"])
    
    timestamps, fp1, fp2 = [], [], []
    start_time = time.time()
    st.write(f"Collecting data at ~512 Hz for {duration_seconds} seconds...")
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    while True:
        elapsed = time.time() - start_time
        if elapsed >= duration_seconds:
            break
        
        line = ser.readline().decode("utf-8", errors="replace").strip()
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
            continue
        
        timestamps.append(t_ms)
        fp1.append(val_fp1)
        fp2.append(val_fp2)
        
        progress_fraction = min(1.0, elapsed / duration_seconds)
        progress_bar.progress(progress_fraction)
        status_text.text(f"Collecting data... {int(progress_fraction * 100)}%")
    
    ser.close()
    total_collected = len(timestamps)
    st.success(f"Data collection completed in {time.time()-start_time:.2f} seconds.")
    st.write(f"Total samples collected: **{total_collected}**")
    
    data = {"Timestamp": timestamps, "FP1": fp1, "FP2": fp2}
    return pd.DataFrame(data)

def extract_features(df_window, fs=512):
    """
    Extract statistical and alpha-band power features from the DataFrame window.
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
    
    def compute_alpha_power(signal):
        nperseg = min(len(signal), 512)
        f, Pxx = welch(signal, fs=fs, nperseg=nperseg)
        # Set alpha band as 8–12 Hz
        alpha_mask = (f >= 8) & (f <= 12)
        alpha_power = np.trapz(Pxx[alpha_mask], x=f[alpha_mask])
        return alpha_power

    features["FP1_alpha_power"] = compute_alpha_power(df_window["FP1"].values)
    features["FP2_alpha_power"] = compute_alpha_power(df_window["FP2"].values)
    return features

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

def classify_stress(feature_df, scaler, svm_model, label_encoder):
    """
    1) Predict the label ("Relaxed" or "Stressed") from the features.
    2) Use the SVM's decision_function (with logistic transform) to estimate the strength
       of the prediction.
    3) Force the final stress rating:
         - If "Stressed", rating ∈ [6,10]
         - If "Relaxed", rating ∈ [1,5]
    Returns: (predicted_label, stress_rating)
    """
    if scaler is None or svm_model is None or label_encoder is None:
        return "Model components not found.", 0

    X_scaled = scaler.transform(feature_df)
    pred_encoded = svm_model.predict(X_scaled)
    predicted_label = label_encoder.inverse_transform(pred_encoded)[0]
    
    # Use decision_function to get a margin distance
    distance = svm_model.decision_function(X_scaled)[0]
    logistic_val = 1 / (1 + np.exp(-distance))  # maps to [0,1]
    
    if predicted_label.lower() == "stressed":
        rating = 6 + round(logistic_val * 4)
        rating = max(6, min(10, rating))
    else:
        p_relaxed = 1 - logistic_val
        rating = 1 + round(p_relaxed * 4)
        rating = max(1, min(5, rating))
    
    return predicted_label, rating

def make_prediction(feature_df, scaler, svm_model, label_encoder):
    """
    This function is retained for backward compatibility.
    It simply returns the predicted label.
    """
    if scaler is None or svm_model is None or label_encoder is None:
        return "Model components not found."
    X_scaled = scaler.transform(feature_df)
    pred_encoded = svm_model.predict(X_scaled)
    label = label_encoder.inverse_transform(pred_encoded)[0]
    return label

def save_prediction_to_csv(pred_label, output_csv="predictions_log.csv"):
    """
    Append the timestamp and predicted label to predictions_log.csv.
    """
    prediction_time = dt.now().strftime("%Y-%m-%d %H:%M:%S")
    row = [prediction_time, pred_label]
    file_exists = os.path.isfile(output_csv)
    with open(output_csv, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Timestamp", "Predicted State"])
        writer.writerow(row)

# ------------------------------------------------
# 10) EEG Prediction Page (replacing Track Mood)
# ------------------------------------------------
def track_mood_page():
    st.header("EEG Emotion Prediction")
    st.markdown("""
    Welcome to the **EEG Emotion Prediction** module of NeuroGuardian!  
    Here you can:
    - **Collect Live Data:** Connect to an Arduino streaming EEG data (Fp1 & Fp2 at 512 Hz) and get a prediction.
    - **Upload Data:** Upload a CSV file (with at least `FP1` and `FP2` columns) for prediction.
    """)
    
    # Load model components
    scaler, svm_model, label_encoder = load_model_components()
    
    st.subheader("Data Collection & Prediction")
    app_mode = st.radio("Choose Mode", ["Collect & Predict Live Data", "Upload Test Data"])
    
    if app_mode == "Collect & Predict Live Data":
        st.sidebar.subheader("Serial Configuration")
        serial_port = st.sidebar.text_input("Serial Port", value="COM3")
        baud_rate = st.sidebar.number_input("Baud Rate", value=500000, step=5000)
        sampling_rate = st.sidebar.number_input("Sampling Rate (Hz)", value=512, step=1)
        st.sidebar.markdown("---")
        duration_seconds = st.sidebar.slider("Data Collection Duration (seconds)",
                                             min_value=10, max_value=120,
                                             value=60, step=5)
        
        if st.button("Collect & Predict"):
            with st.spinner(f"Collecting EEG data for {duration_seconds} seconds..."):
                eeg_data = collect_eeg_data(duration_seconds=duration_seconds,
                                            port=serial_port,
                                            baud_rate=int(baud_rate),
                                            fs=int(sampling_rate))
            if eeg_data.empty:
                st.error("No data collected. Check your Arduino or COM port settings!")
                return
            
            st.markdown("**Raw EEG Data** (first 5 rows):")
            st.dataframe(eeg_data.head())
            st.markdown("### Quick Visualization of Collected Data")
            st.line_chart(eeg_data[["FP1", "FP2"]])
            
            with st.spinner("Extracting features..."):
                feat_dict = extract_features(eeg_data, fs=int(sampling_rate))
                feature_df = pd.DataFrame([feat_dict])
            st.markdown("**Extracted Features**:")
            st.dataframe(feature_df)
            
            with st.spinner("Predicting..."):
                predicted_label, rating = classify_stress(feature_df, scaler, svm_model, label_encoder)
            
            if predicted_label not in ["Model components not found.", ""]:
                st.success(f"**Predicted State:** {predicted_label} (Stress Rating: {rating}/10)")
                save_prediction_to_csv(predicted_label, "predictions_log.csv")
                # Record the prediction in the mental health data
                new_entry = {
                    "Date": dt.now().strftime("%Y-%m-%d"),
                    "StressLevel": rating,
                    "Mood": predicted_label,
                    "SleepQuality": "",
                    "Anxiety": ""
                }
                st.session_state.mental_health_data = pd.concat(
                    [st.session_state.mental_health_data, pd.DataFrame([new_entry])],
                    ignore_index=True
                )
                if predicted_label.lower() == "stressed":
                    st.warning("Consider some relaxation techniques.")
                else:
                    st.balloons()
            else:
                st.error("Prediction failed. Check model files in directory.")
    
    elif app_mode == "Upload Test Data":
        st.markdown("### Upload and Predict on Your EEG Data")
        uploaded_file = st.file_uploader("Choose a CSV file", type=["csv"])
        if uploaded_file is not None:
            try:
                uploaded_df = pd.read_csv(uploaded_file)
                st.markdown("**Uploaded EEG Data** (first 5 rows):")
                st.dataframe(uploaded_df.head())
                if "Timestamp" in uploaded_df.columns:
                    uploaded_df.drop(columns=["Timestamp"], inplace=True)
                required_columns = {"FP1", "FP2"}
                if not required_columns.issubset(uploaded_df.columns):
                    st.error(f"Uploaded file must contain at least the columns: {required_columns}")
                    return
                st.markdown("### Visualization of Uploaded Data (FP1, FP2)")
                st.line_chart(uploaded_df[["FP1", "FP2"]])
                if st.button("Predict on Uploaded Data"):
                    with st.spinner("Extracting features from uploaded data..."):
                        feat_dict = extract_features(uploaded_df, fs=512)
                        feature_df = pd.DataFrame([feat_dict])
                    st.markdown("**Extracted Features:**")
                    st.dataframe(feature_df)
                    with st.spinner("Predicting..."):
                        predicted_label, rating = classify_stress(feature_df, scaler, svm_model, label_encoder)
                    if predicted_label not in ["Model components not found.", ""]:
                        st.success(f"**Predicted State:** {predicted_label} (Stress Rating: {rating}/10)")
                        save_prediction_to_csv(predicted_label, "predictions_log.csv")
                        new_entry = {
                            "Date": dt.now().strftime("%Y-%m-%d"),
                            "StressLevel": rating,
                            "Mood": predicted_label,
                            "SleepQuality": "",
                            "Anxiety": ""
                        }
                        st.session_state.mental_health_data = pd.concat(
                            [st.session_state.mental_health_data, pd.DataFrame([new_entry])],
                            ignore_index=True
                        )
                        if predicted_label.lower() == "stressed":
                            st.warning("Consider some relaxation techniques.")
                        else:
                            st.balloons()
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
            with open("predictions_log.csv", "rb") as f:
                st.download_button(label="Download Prediction Log",
                                   data=f,
                                   file_name="predictions_log.csv",
                                   mime="text/csv")
        else:
            st.warning("`predictions_log.csv` does not contain 'Predicted State' column.")
    else:
        st.write("No predictions logged yet. Your predictions will appear here.")

# ------------------------------------------------
# 11) Main Function to Route Pages
# ------------------------------------------------
def main():
    init_session()
    if not st.session_state.logged_in:
        login_page()
    
    top_header()
    sidebar_navigation_menu()
    
    selected_page = st.session_state.selected_page
    if selected_page == "Home":
        home_page()
    elif selected_page == "Subscription":
        subscription_page()
    elif selected_page == "EEG Prediction":
        track_mood_page()  # EEG prediction page now records every prediction.
    elif selected_page == "Community":
        community_page()
    elif selected_page == "Achievements":
        achievements_page()
    elif selected_page == "Detailed Report":
        detailed_report_page()
    elif selected_page == "Activities & Reminders":
        activities_reminders_page()
    elif selected_page == "Doctor Consultation":
        doctor_consultation_page()

if __name__ == "__main__":
    main()
