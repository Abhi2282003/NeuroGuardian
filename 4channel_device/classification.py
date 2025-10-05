import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

from scipy.signal import welch, butter, filtfilt, iirnotch
from scipy.stats import skew, kurtosis
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import joblib
from collections import Counter

# For wavelet denoising
import pywt

# -------------------------------------------------------
# 1. LOAD DATA
# -------------------------------------------------------
df = pd.read_csv("eeg_emotion_data.csv")

# OPTIONAL: if your dataset has multiple emotion labels:
# mapping = {
#     "Happy": "Relaxed",
#     "Calm": "Relaxed",
#     "Sad": "Stressed",
#     "Angry": "Stressed",
# }
# df["Emotion"] = df["Emotion"].map(mapping)
# df = df.dropna(subset=["Emotion"])

print("Label distribution in dataset:")
print(df["Emotion"].value_counts())

# -------------------------------------------------------
# 2. DEFINE FILTERS & DENOISING
# -------------------------------------------------------

def bandpass_filter(signal, fs, lowcut=0.5, highcut=50.0, order=4):
    """
    Butterworth Bandpass Filter
    """
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    filtered_signal = filtfilt(b, a, signal)
    return filtered_signal

def notch_filter(signal, fs, freq=50.0, quality=30.0):
    """
    Notch filter at a specified 'freq' (e.g., 50 Hz or 60 Hz).
    'quality' is the Q-factor that determines the filter's bandwidth.
    """
    nyq = 0.5 * fs
    w0 = freq / nyq
    b, a = iirnotch(w0, quality)
    filtered_signal = filtfilt(b, a, signal)
    return filtered_signal

def wavelet_denoise(signal, wavelet='db4', level=1):
    """
    Wavelet denoising. Decomposes the signal into wavelet coefficients,
    applies a threshold to detail coefficients, and reconstructs the signal.
    Adjust 'wavelet', 'level', and threshold method as needed.
    """
    coeffs = pywt.wavedec(signal, wavelet, level=level)
    # coeffs[0] = approximation coefficients
    # coeffs[1..n] = detail coefficients at each level

    # Example: universal threshold
    #   T = sqrt(2 * log(n)) * sigma
    #   where sigma can be estimated from the detail coefficients.
    # We'll apply the same threshold to each detail level for simplicity.
    detail_coeffs = coeffs[1:]
    # Estimate sigma from the first detail level
    sigma_est = np.median(np.abs(detail_coeffs[0])) / 0.6745
    length_signal = len(signal)
    threshold = sigma_est * np.sqrt(2 * np.log(length_signal))

    # Threshold details
    for i in range(1, len(coeffs)):
        coeffs[i] = pywt.threshold(coeffs[i], threshold, mode='soft')

    # Reconstruct the denoised signal
    denoised_signal = pywt.waverec(coeffs, wavelet)
    
    # If the reconstructed signal is slightly longer (wavelet padding),
    # trim it to the original length
    return denoised_signal[:length_signal]

# -------------------------------------------------------
# 3. APPLY PREPROCESSING PIPELINE
# -------------------------------------------------------

FS = 256  # Sampling rate, adjust if different

# We will filter each channel in sequence: bandpass -> notch -> wavelet denoise
# You can remove or change the order of these steps if desired.

# Plot raw EEG signals (FP1) BEFORE any filtering
plt.figure(figsize=(10, 4))
for emotion in df["Emotion"].unique():
    subset = df[df["Emotion"] == emotion]
    plt.plot(subset["Timestamp"], subset["FP1"], label=str(emotion), alpha=0.6)
plt.title("Raw EEG Signals (FP1)")
plt.xlabel("Timestamp (ms)")
plt.ylabel("Amplitude (µV)")
plt.legend()
plt.tight_layout()
plt.show()

# Create new columns for the heavily preprocessed signals
fp1_processed = []
fp2_processed = []

for i in range(len(df)):
    raw_fp1 = df["FP1"].iloc[i]
    raw_fp2 = df["FP2"].iloc[i]
    
    # 1) Bandpass
    # 2) Notch
    # 3) Wavelet denoising
    # --------------------------------
    # Because we typically filter signals as a whole rather than sample-by-sample,
    # in a real-world scenario you'd want to apply these filters to the entire continuous signal
    # channel-wise, not row-by-row. For demonstration, we'll show a row-based approach,
    # but it's not recommended if you have continuous data.

    fp1_processed.append(raw_fp1)
    fp2_processed.append(raw_fp2)

df["FP1_processed"] = fp1_processed
df["FP2_processed"] = fp2_processed

# NOTE: The above row-by-row approach doesn't actually apply the filters
# in a continuous manner. A more proper approach:
#   - Sort data by time (if needed).
#   - Segment the entire FP1 column as a 1D array, apply bandpass/notch/wavelet once.
#   - Then put the filtered results back into the DataFrame in the same order.
#
# Let's demonstrate a more correct approach below:

# Sort by Timestamp if not sorted
df = df.sort_values(by="Timestamp").reset_index(drop=True)

# Bandpass
fp1_all = bandpass_filter(df["FP1"].values, fs=FS, lowcut=0.5, highcut=50.0, order=4)
fp2_all = bandpass_filter(df["FP2"].values, fs=FS, lowcut=0.5, highcut=50.0, order=4)

# Notch
fp1_all_notch = notch_filter(fp1_all, fs=FS, freq=50.0, quality=30.0)
fp2_all_notch = notch_filter(fp2_all, fs=FS, freq=50.0, quality=30.0)

# Wavelet Denoise
fp1_denoised = wavelet_denoise(fp1_all_notch, wavelet='db4', level=1)
fp2_denoised = wavelet_denoise(fp2_all_notch, wavelet='db4', level=1)

# Store final processed signals
df["FP1_processed"] = fp1_denoised
df["FP2_processed"] = fp2_denoised

# Plot the final preprocessed FP1
plt.figure(figsize=(10, 4))
for emotion in df["Emotion"].unique():
    subset = df[df["Emotion"] == emotion]
    plt.plot(subset["Timestamp"], subset["FP1_processed"], label=str(emotion), alpha=0.6)
plt.title("Preprocessed EEG Signals (FP1): Bandpass + Notch + Wavelet")
plt.xlabel("Timestamp (ms)")
plt.ylabel("Amplitude (µV)")
plt.legend()
plt.tight_layout()
plt.show()

# -------------------------------------------------------
# 4. FEATURE EXTRACTION (NO AMPLITUDE ARTIFACT REMOVAL)
# -------------------------------------------------------
def extract_features(df, window_size=500, step_size=250, fs=256):
    """
    Extract statistical and frequency-domain features from
    heavily preprocessed signals (FP1_processed, FP2_processed)
    using a sliding window approach.
    """
    feature_list = []
    label_list = []

    # Iterate by emotion
    for label in df["Emotion"].unique():
        subset = df[df["Emotion"] == label].reset_index(drop=True)
        
        for start in range(0, len(subset) - window_size, step_size):
            window = subset.iloc[start:start+window_size]

            # Time-domain (statistical) features
            stats_features = {
                "FP1_mean": window["FP1_processed"].mean(),
                "FP1_std": window["FP1_processed"].std(),
                "FP1_skew": skew(window["FP1_processed"]),
                "FP1_kurtosis": kurtosis(window["FP1_processed"]),
                "FP2_mean": window["FP2_processed"].mean(),
                "FP2_std": window["FP2_processed"].std(),
                "FP2_skew": skew(window["FP2_processed"]),
                "FP2_kurtosis": kurtosis(window["FP2_processed"]),
            }

            # Frequency-domain feature: Alpha band power (8-13 Hz)
            def compute_alpha_power(signal):
                f, Pxx = welch(signal, fs=fs, nperseg=min(256, len(signal)))
                alpha_mask = (f >= 8) & (f <= 13)
                alpha_power = np.trapz(Pxx[alpha_mask], x=f[alpha_mask])
                return alpha_power

            stats_features["FP1_alpha_power"] = compute_alpha_power(window["FP1_processed"].values)
            stats_features["FP2_alpha_power"] = compute_alpha_power(window["FP2_processed"].values)

            feature_list.append(stats_features)
            label_list.append(label)

    X_features = pd.DataFrame(feature_list)
    y_labels = np.array(label_list)
    return X_features, y_labels

X, y = extract_features(df, window_size=500, step_size=250, fs=FS)
print(f"\nFeature matrix shape: {X.shape}, Label array shape: {y.shape}")

# -------------------------------------------------------
# 5. LABEL ENCODING & TRAIN-TEST SPLIT
# -------------------------------------------------------
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)

print("Label classes encoded as:", list(label_encoder.classes_))
print("Encoded label distribution:", Counter(y_encoded))

X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)

print("\nTrain distribution:", Counter(y_train))
print("Test distribution:", Counter(y_test))

# -------------------------------------------------------
# 6. SCALING & MODEL TRAINING
# -------------------------------------------------------
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

svm_model = SVC(kernel="rbf", C=1, gamma="scale", random_state=42)
svm_model.fit(X_train_scaled, y_train)
print("\nSVM model trained.")

# -------------------------------------------------------
# 7. EVALUATION
# -------------------------------------------------------
y_pred = svm_model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)
conf_mat = confusion_matrix(y_test, y_pred)
class_rep = classification_report(y_test, y_pred, target_names=label_encoder.classes_)

print("\nModel Evaluation on Test Set:")
print("Accuracy:", accuracy)
print("Confusion Matrix:\n", conf_mat)
print("Classification Report:\n", class_rep)

# -------------------------------------------------------
# 8. SAVE MODEL COMPONENTS
# -------------------------------------------------------
joblib.dump(svm_model, "svm_eeg_model.joblib")
joblib.dump(scaler, "scaler.joblib")
joblib.dump(label_encoder, "label_encoder.joblib")

print("\nSaved the following files:")
print(" - svm_eeg_model.joblib")
print(" - scaler.joblib")
print(" - label_encoder.joblib")
