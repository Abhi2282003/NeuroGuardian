import streamlit as st
import pandas as pd
import numpy as np
import datetime
import time
import os
import joblib
import csv
import serial  # PySerial for EEG data
from datetime import date, datetime as dt
from scipy.stats import skew, kurtosis
from scipy.signal import welch
from fpdf import FPDF  # For PDF report generation

# ------------------------------------------------
# Custom CSS for Enhanced Styling (NeuroGuardian Theme)
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
# 1) Session State Initialization (Unified)
# ------------------------------------------------
def init_session():
    if "logged_in" not in st.session_state:
        st.session_state.logged_in = False
    if "username" not in st.session_state:
        st.session_state.username = None
    if "subscribed" not in st.session_state:
        st.session_state.subscribed = False
    # Dataframe for daily mental health data
    if "mental_health_data" not in st.session_state:
        st.session_state.mental_health_data = pd.DataFrame(
            columns=["Date", "StressLevel", "Mood", "SleepQuality", "Anxiety"]
        )
    if "community_posts" not in st.session_state:
        st.session_state.community_posts = []
    if "selected_page" not in st.session_state:
        st.session_state.selected_page = "Home"
    if "latest_eeg_analysis" not in st.session_state:
        st.session_state.latest_eeg_analysis = None
    if "dark_mode" not in st.session_state:
        st.session_state.dark_mode = False

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
    # Base menu options
    menu_options = ["Home", "Subscription", "Track Mood", "Community", "Achievements"]
    # Only show detailed report to subscribed users
    if st.session_state.subscribed:
        menu_options.append("Detailed Report")
    # Append additional pages from EEG and analytics features
    menu_options.extend(["Activities & Reminders", "Doctor Consultation", "EEG Stress Analysis", "Analytics Dashboard"])
    
    selected = st.sidebar.radio(
        "Go to", 
        menu_options, 
        index=menu_options.index(st.session_state.selected_page)
        if st.session_state.selected_page in menu_options else 0
    )
    st.session_state.selected_page = selected

# ------------------------------------------------
# 5) PDF Report Generation Function (for Detailed Report)
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
                "date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
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
                st.markdown(
                    f'<div class="post-card"><strong>{post["username"]}</strong> on <em>{post["date"]}</em><br>{post["text"]}</div>', 
                    unsafe_allow_html=True
                )
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
# 8) Home Page
# ------------------------------------------------
def home_page():
    st.header("Welcome to NeuroGuardian")
    if st.session_state.subscribed:
        st.success("You have an active subscription!")
    else:
        st.warning("You are not subscribed yet. Some features may be limited.")
    st.write("Use the sidebar to explore the app.")

# ------------------------------------------------
# 9) Subscription Page
# ------------------------------------------------
def subscription_page():
    st.header("Subscription")
    if st.session_state.subscribed:
        st.success("You are already subscribed!")
    else:
        st.write("Unlock premium features such as detailed analytics, therapy sessions, and priority consultations.")
        if st.button("Subscribe Now"):
            st.session_state.subscribed = True
            st.success("You are now subscribed!")

# ------------------------------------------------
# 10) Track Mood / Mental Health Data Page
# ------------------------------------------------
def track_mood_page():
    st.header("Record Daily Mental Health Data")
    st.write("Monitor your mental health metrics over time.")
    
    stress_today = st.slider("Today's stress (1 = Relaxed, 10 = Very Stressed)", 1, 10, 5)
    
    # Additional metrics for subscribed users
    if st.session_state.subscribed:
        mood_today = st.slider("Today's mood (1 = Very Low, 10 = Very High)", 1, 10, 5)
        sleep_today = st.slider("Today's sleep quality (1 = Poor, 10 = Excellent)", 1, 10, 5)
        anxiety_today = st.slider("Today's anxiety level (1 = Low, 10 = High)", 1, 10, 5)
    else:
        mood_today = None
        sleep_today = None
        anxiety_today = None

    if st.button("Save Today's Data"):
        new_entry = {
            "Date": date.today(),
            "StressLevel": stress_today,
            "Mood": mood_today,
            "SleepQuality": sleep_today,
            "Anxiety": anxiety_today
        }
        st.session_state.mental_health_data = pd.concat(
            [st.session_state.mental_health_data, pd.DataFrame([new_entry])],
            ignore_index=True
        )
        st.success("Recorded today's data.")
    
    st.subheader("Stress Level Over Time")
    df = st.session_state.mental_health_data.copy()
    if not df.empty:
        df.sort_values(by="Date", inplace=True)
        df.set_index("Date", inplace=True)
        st.line_chart(df[["StressLevel"]])
    else:
        st.info("No data yet. Please record your daily data.")

# ------------------------------------------------
# 11) Detailed Report Page (PDF Generation)
# ------------------------------------------------
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

# ------------------------------------------------
# 12) Activities & Reminders Page
# ------------------------------------------------
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

# ------------------------------------------------
# 13) Doctor Consultation Page
# ------------------------------------------------
def doctor_consultation_page():
    st.header("Doctor Consultation")
    st.write("Feeling overwhelmed? Schedule a session with a mental health professional.")
    if st.session_state.subscribed:
        st.success("As a premium subscriber, you get discounted consultation rates!")
    else:
        st.warning("Consider subscribing for discounts and extra features.")
    
    st.subheader("Schedule a Session")
    consult_date = st.date_input("Select a date", date.today())
    consult_time = st.time_input("Select a time", dt.now().time())
    if st.button("Book Appointment"):
        st.success(f"Appointment booked for {consult_date} at {consult_time}.")

# ------------------------------------------------
# 14) EEG Stress Analysis Functions
# ------------------------------------------------
def collect_eeg_data(duration_seconds=60, port="COM3", baud_rate=500000, fs=512):
    st.write(f"Attempting connection to {port} at {baud_rate} baud...")
    try:
        ser = serial.Serial(port, baud_rate, timeout=1)
    except Exception as e:
        st.error(f"Could not open serial port {port}: {e}")
        return pd.DataFrame(columns=["Timestamp", "FP1", "FP2"])
    
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
    df = pd.DataFrame(data)
    return df

def extract_features(df_window, fs=512):
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
        alpha_mask = (f >= 8) & (f <= 13)
        alpha_power = np.trapz(Pxx[alpha_mask], x=f[alpha_mask])
        return alpha_power
    features["FP1_alpha_power"] = compute_alpha_power(df_window["FP1"].values)
    features["FP2_alpha_power"] = compute_alpha_power(df_window["FP2"].values)
    return features

@st.cache_resource
def load_model_components():
    try:
        scaler = joblib.load("scaler.joblib")
        svm_model = joblib.load("svm_eeg_model.joblib")
        label_encoder = joblib.load("label_encoder.joblib")
        return scaler, svm_model, label_encoder
    except FileNotFoundError as e:
        st.error(f"Could not load model files: {e}")
        return None, None, None

def make_prediction(feature_df, scaler, svm_model, label_encoder):
    if scaler is None or svm_model is None or label_encoder is None:
        return "Model components not found."
    X_scaled = scaler.transform(feature_df)
    pred_encoded = svm_model.predict(X_scaled)
    label = label_encoder.inverse_transform(pred_encoded)[0]
    return label

def save_prediction_to_csv(pred_label, output_csv="predictions_log.csv"):
    prediction_time = dt.now().strftime("%Y-%m-%d %H:%M:%S")
    row = [prediction_time, pred_label]
    file_exists = os.path.isfile(output_csv)
    with open(output_csv, "a", newline="") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["Timestamp", "Predicted State"])
        writer.writerow(row)

def meditation_activity_page():
    st.title("Meditation Activity")
    st.write("Your EEG indicates high stress. Please relax, listen to this calming meditation audio, and let us collect your EEG data in real time.")
    st.audio("https://www.bensound.com/bensound-music/bensound-slowmotion.mp3", format="audio/mp3")
    st.info("Your meditation session will automatically start on COM11 for 60 seconds.")
    duration = 60
    with st.spinner(f"Meditation session in progress for {duration} seconds..."):
        meditation_data = collect_eeg_data(duration, port="COM11", baud_rate=500000, fs=512)
    st.success("Meditation session complete!")
    if meditation_data.empty:
        st.error("No EEG data collected during meditation.")
        return
    st.line_chart(meditation_data[["FP1", "FP2"]])
    with st.spinner("Analyzing your EEG data..."):
        med_feat_dict = extract_features(meditation_data, fs=512)
        scaler, svm_model, label_encoder = load_model_components()
        new_prediction = make_prediction(pd.DataFrame([med_feat_dict]), scaler, svm_model, label_encoder)
    st.success(f"Post-meditation Predicted State: {new_prediction}")
    if new_prediction.lower() == "relaxed":
        st.balloons()
        st.success("Great job! Your stress level has reduced.")
    else:
        st.warning("Your stress remains high. Consider trying again or another activity.")
    st.session_state.latest_eeg_analysis = {
        "predicted_label": new_prediction,
        "stress_rating": None,
        "features": med_feat_dict
    }

def eeg_analysis_page():
    st.title("EEG Stress Analysis")
    st.markdown("""
    This page allows you to either collect live EEG data from your Arduino or upload a CSV file.
    The app will extract features from the EEG signals and predict your emotional state using a trained SVM model.
    """)
    app_mode = st.radio("Choose Mode", ["Collect & Predict Live Data", "Upload Test Data"])
    scaler, svm_model, label_encoder = load_model_components()
    if app_mode == "Collect & Predict Live Data":
        st.sidebar.subheader("Serial Configuration")
        serial_port = st.sidebar.text_input("Serial Port", value="COM3")
        baud_rate = st.sidebar.number_input("Baud Rate", value=500000, step=5000)
        sampling_rate = st.sidebar.number_input("Sampling Rate (Hz)", value=512, step=1)
        duration_seconds = st.sidebar.slider("Data Collection Duration (seconds)", 10, 120, 60, step=5)
        if st.button("Collect & Predict"):
            with st.spinner(f"Collecting EEG data for {duration_seconds} seconds..."):
                eeg_data = collect_eeg_data(duration_seconds, serial_port, int(baud_rate), int(sampling_rate))
            if eeg_data.empty:
                st.error("No data collected. Check your Arduino or COM port settings!")
                return
            st.markdown("**Raw EEG Data (first 5 rows):**")
            st.dataframe(eeg_data.head())
            st.line_chart(eeg_data[["FP1", "FP2"]])
            with st.spinner("Extracting features..."):
                feat_dict = extract_features(eeg_data, fs=int(sampling_rate))
                feature_df = pd.DataFrame([feat_dict])
            st.markdown("**Extracted Features:**")
            st.write(feature_df)
            with st.spinner("Predicting..."):
                prediction = make_prediction(feature_df, scaler, svm_model, label_encoder)
            if prediction not in ["Model components not found.", ""]:
                st.success(f"**Predicted State:** {prediction}")
                save_prediction_to_csv(prediction, "predictions_log.csv")
                if prediction.lower() == "stressed":
                    st.warning("Your EEG indicates high stress. Would you like to try a meditation activity?")
                    if st.button("Try Meditation Activity"):
                        meditation_activity_page()
                else:
                    st.balloons()
                st.session_state.latest_eeg_analysis = {
                    "predicted_label": prediction,
                    "stress_rating": None,
                    "features": feat_dict
                }
            else:
                st.error("Prediction failed. Check model files in directory.")
    elif app_mode == "Upload Test Data":
        st.markdown("### Upload Your EEG CSV File")
        uploaded_file = st.file_uploader("Choose a CSV file", type=["csv"])
        if uploaded_file is not None:
            try:
                df_uploaded = pd.read_csv(uploaded_file)
                st.markdown("**Uploaded EEG Data (first 5 rows):**")
                st.write(df_uploaded.head())
                if "Timestamp" in df_uploaded.columns:
                    df_uploaded.drop(columns=["Timestamp"], inplace=True)
                required_columns = {"FP1", "FP2"}
                if not required_columns.issubset(df_uploaded.columns):
                    st.error(f"CSV must include columns: {required_columns}")
                    return
                st.line_chart(df_uploaded[["FP1", "FP2"]])
                if st.button("Predict on Uploaded Data"):
                    with st.spinner("Extracting features..."):
                        feat_dict = extract_features(df_uploaded, fs=512)
                        feature_df = pd.DataFrame([feat_dict])
                    st.markdown("**Extracted Features:**")
                    st.write(feature_df)
                    with st.spinner("Predicting..."):
                        prediction = make_prediction(feature_df, scaler, svm_model, label_encoder)
                    if prediction not in ["Model components not found.", ""]:
                        st.success(f"**Predicted State:** {prediction}")
                        save_prediction_to_csv(prediction, "predictions_log.csv")
                        if prediction.lower() == "stressed":
                            st.warning("Your EEG indicates high stress. Would you like to try a meditation activity?")
                            if st.button("Try Meditation Activity"):
                                meditation_activity_page()
                        else:
                            st.balloons()
                        st.session_state.latest_eeg_analysis = {
                            "predicted_label": prediction,
                            "stress_rating": None,
                            "features": feat_dict
                        }
                    else:
                        st.error("Prediction failed. Check model files in directory.")
            except Exception as e:
                st.error(f"Error processing the uploaded file: {e}")

# ------------------------------------------------
# 15) Analytics Dashboard Page
# ------------------------------------------------
def analytics_dashboard_page():
    st.header("Analytics Dashboard")
    st.write("Explore your stress trends and EEG prediction history over time.")
    
    # Mood tracking chart
    df = st.session_state.mental_health_data.copy()
    if df.empty:
        st.info("No mood tracking data available. Please record your stress level!")
    else:
        df["Date"] = pd.to_datetime(df["Date"])
        df.sort_values("Date", inplace=True)
        st.subheader("Daily Stress Levels (Mood Tracking)")
        st.line_chart(df.set_index("Date")["StressLevel"])
    
    # EEG Prediction History
    st.subheader("EEG Prediction History")
    if os.path.isfile("predictions_log.csv"):
        df_hist = pd.read_csv("predictions_log.csv")
        if not df_hist.empty and "Predicted State" in df_hist.columns:
            df_hist["State_Numeric"] = df_hist["Predicted State"].apply(lambda x: 0 if x.lower() == "relaxed" else 1)
            df_hist["Timestamp"] = pd.to_datetime(df_hist["Timestamp"])
            df_hist.sort_values("Timestamp", inplace=True)
            st.line_chart(df_hist.set_index("Timestamp")["State_Numeric"])
        else:
            st.info("No EEG predictions logged yet.")
    else:
        st.info("No EEG predictions logged yet.")
    
    st.subheader("Latest EEG Stress Analysis")
    if st.session_state.latest_eeg_analysis is not None:
        res = st.session_state.latest_eeg_analysis
        st.markdown(
            f"<div class='post-card'><b>EEG Predicted State:</b> {res['predicted_label'].upper()}</div>", 
            unsafe_allow_html=True
        )
    else:
        st.info("No EEG analysis data available yet.")

# ------------------------------------------------
# 16) Main Navigation & Routing
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
    elif selected_page == "Track Mood":
        track_mood_page()
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
    elif selected_page == "EEG Stress Analysis":
        eeg_analysis_page()
    elif selected_page == "Analytics Dashboard":
        analytics_dashboard_page()

if __name__ == "__main__":
    main()
