import serial
import time
import pandas as pd
import matplotlib.pyplot as plt

# =============== USER SETTINGS ===============
SERIAL_PORT = "COM11"    # Change to your Arduino's port (e.g. "COM3", "/dev/ttyUSB0", etc.)
BAUD_RATE = 500000      # Must match Arduino code
DURATION = 60           # Collect data for 1 minute (60 seconds) per emotion
SAVE_FOLDER = "eeg_data/"  # Folder to save CSV files (make sure it exists or create it)

def collect_eeg_data(state_label, filename, duration=DURATION):
    """
    Collect EEG data from Arduino for a specified duration.
    Save the data to a CSV file.
    """
    print(f"\n=== Please get into '{state_label}' state! Collecting {duration}s of data... ===")

    # Open the serial port
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    time.sleep(2)  # Wait a bit for Arduino reset and serial to stabilize
    
    data = []
    start_time = time.time()

    while (time.time() - start_time) < duration:
        line = ser.readline().decode('utf-8', errors='replace').strip()
        # Expected format from Arduino: "Time(ms),Fp1(uV),Fp2(uV)"
        values = line.split(",")

        if len(values) == 3:
            try:
                t_ms = float(values[0])
                fp1 = float(values[1])
                fp2 = float(values[2])
                data.append([t_ms, fp1, fp2])
            except ValueError:
                # If conversion fails, ignore this line
                continue

    ser.close()

    # Convert to pandas DataFrame & save as CSV
    df = pd.DataFrame(data, columns=["Time_ms", "Fp1_uV", "Fp2_uV"])
    csv_path = SAVE_FOLDER + filename
    df.to_csv(csv_path, index=False)
    
    print(f"Data for '{state_label}' saved to {csv_path}")

# ========== MAIN SCRIPT - COLLECT & COMPARE ========== #
if __name__ == "__main__":
    # 1) Relaxed data collection (1 minute)
    collect_eeg_data("Relaxed", "relaxed_eeg.csv", DURATION)
    
    # 2) Stressed data collection (1 minute)
    collect_eeg_data("Stressed", "stressed_eeg.csv", DURATION)

    # 3) Load the two CSV files
    df_relaxed = pd.read_csv(SAVE_FOLDER + "relaxed_eeg.csv")
    df_stressed = pd.read_csv(SAVE_FOLDER + "stressed_eeg.csv")

    # 4) Simple Plotting for Comparison
    plt.figure(figsize=(12, 6))

    # Plot Fp1 signals
    plt.subplot(2, 1, 1)
    plt.plot(df_relaxed["Time_ms"], df_relaxed["Fp1_uV"], label="Relaxed Fp1", color="blue", alpha=0.7)
    plt.plot(df_stressed["Time_ms"], df_stressed["Fp1_uV"], label="Stressed Fp1", color="red", alpha=0.7)
    plt.title("EEG Fp1 - Relaxed vs. Stressed (1 Minute)")
    plt.xlabel("Time (ms)")
    plt.ylabel("Amplitude (µV)")
    plt.legend()

    # Plot Fp2 signals
    plt.subplot(2, 1, 2)
    plt.plot(df_relaxed["Time_ms"], df_relaxed["Fp2_uV"], label="Relaxed Fp2", color="blue", alpha=0.7)
    plt.plot(df_stressed["Time_ms"], df_stressed["Fp2_uV"], label="Stressed Fp2", color="red", alpha=0.7)
    plt.title("EEG Fp2 - Relaxed vs. Stressed (1 Minute)")
    plt.xlabel("Time (ms)")
    plt.ylabel("Amplitude (µV)")
    plt.legend()

    plt.tight_layout()
    plt.show()
