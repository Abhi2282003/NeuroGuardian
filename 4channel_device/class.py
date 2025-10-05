# eeg_model_training_no_feature_extraction.py

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
from imblearn.over_sampling import SMOTE
import joblib
from collections import Counter

# 1. Load the dataset
df = pd.read_csv("eeg_emotion_data.csv")

# OPTIONAL: Verify you only have "Stressed" and "Relaxed". If not, map them:
# mapping = {
#     "Happy": "Relaxed",
#     "Calm": "Relaxed",
#     "Sad": "Stressed",
#     "Angry": "Stressed",
# }
# df["Emotion"] = df["Emotion"].map(mapping)
# df = df.dropna(subset=["Emotion"])

# 2. Basic check of label distribution
print("Label distribution in dataset:")
print(df["Emotion"].value_counts())

# 3. OPTIONAL: Plot raw EEG signals (FP1) for both emotions
plt.figure(figsize=(10, 5))
for emotion in df["Emotion"].unique():
    subset = df[df["Emotion"] == emotion]
    plt.plot(subset["Timestamp"], subset["FP1"], label=emotion, alpha=0.7)
plt.xlabel("Timestamp (ms)")
plt.ylabel("EEG Signal (FP1)")
plt.title("Raw EEG Signals")
plt.legend()
plt.show()

# 4. Define input (X) and output (y) without feature engineering
#    We'll use "FP1" and "FP2" as our features; each row is considered one sample.
X = df[["FP1", "FP2"]].values
y = df["Emotion"].values

print(f"Feature matrix shape: {X.shape}, Label array shape: {y.shape}")

# 5. Encode labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
print("Label classes encoded as:", list(label_encoder.classes_))
print("Encoded label distribution:", Counter(y_encoded))

# 6. Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
)
print("Train distribution:", Counter(y_train))
print("Test distribution:", Counter(y_test))

# 7. Handle class imbalance with SMOTE
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)
print("After SMOTE distribution:", Counter(y_train_resampled))

# 8. Standardize features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train_resampled)
X_test_scaled = scaler.transform(X_test)

# 9. Train SVM model
svm_model = SVC(kernel="rbf", C=1, gamma="scale", random_state=42)
svm_model.fit(X_train_scaled, y_train_resampled)
print("SVM model trained.")

# 10. Evaluate model
y_pred = svm_model.predict(X_test_scaled)
accuracy = accuracy_score(y_test, y_pred)
conf_mat = confusion_matrix(y_test, y_pred)
class_rep = classification_report(y_test, y_pred, target_names=label_encoder.classes_)

print("\nModel Evaluation on Test Set:")
print("Accuracy:", accuracy)
print("Confusion Matrix:\n", conf_mat)
print("Classification Report:\n", class_rep)

# 11. Save model components
joblib.dump(svm_model, "svm_eeg_model.joblib")
joblib.dump(scaler, "scaler.joblib")
joblib.dump(label_encoder, "label_encoder.joblib")

print("\nSaved the following files:")
print(" - svm_eeg_model.joblib")
print(" - scaler.joblib")
print(" - label_encoder.joblib")
