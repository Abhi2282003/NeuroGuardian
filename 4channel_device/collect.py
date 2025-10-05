import serial
import csv
import time

# =================== USER SETTINGS ===================
SERIAL_PORT = "COM11"  # Change this according to your system
BAUD_RATE = 500000
CSV_FILENAME = "eeg_emotion_data.csv"
DURATION = 180  # Duration in seconds (3 minutes)

# =================== SETUP SERIAL ===================
try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Listening on {SERIAL_PORT} at {BAUD_RATE} baud... Press Ctrl+C to stop.")
except serial.SerialException as e:
    print(f"Error: {e}")
    exit()

# =================== CSV SETUP ===================
with open(CSV_FILENAME, mode="a", newline="") as file:
    writer = csv.writer(file)

    # Write the header only if the file is empty
    if file.tell() == 0:
        writer.writerow(["Timestamp", "FP1", "FP2", "Emotion"])

    try:
        while True:
            # =================== ASK FOR EMOTION ===================
            emotion_label = input("\nEnter the emotion you are experiencing (Stressed, Relaxed): ").strip()
            print(f"Recording data for emotion: {emotion_label} for {DURATION} seconds...")

            start_time = time.time()

            while time.time() - start_time < DURATION:
                line = ser.readline().decode("utf-8").strip()
                if line and "," in line:  # Ensure valid CSV format
                    values = line.split(",")
                    if len(values) == 3:  # Ensure exactly 3 values
                        timestamp, fp1, fp2 = values
                        writer.writerow([timestamp, fp1, fp2, emotion_label])
                        print(f"Saved: {timestamp}, {fp1}, {fp2}, {emotion_label}")  # Print for debugging

            print(f"Recording for {emotion_label} completed. Asking for new emotion...\n")

    except KeyboardInterrupt:
        print("\nData logging stopped.")
    except Exception as e:
        print(f"Error: {e}")

ser.close()
