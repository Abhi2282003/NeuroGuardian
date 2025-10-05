import serial
import pyautogui

# =================== USER SETTINGS ===================
SERIAL_PORT = "COM11"  # Change to match your Arduino port (e.g., "COM3" on Windows, "/dev/ttyUSB0" on Linux/Mac)
BAUD_RATE = 500000    # Must match the Arduino's baud rate

# =================== SETUP SERIAL ===================     
try:
    ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    print(f"Listening on {SERIAL_PORT} at {BAUD_RATE} baud...")
except serial.SerialException as e:
    print(f"Error: {e}")
    exit()

# =================== MAIN LOOP ===================
while True:
    try:
        line = ser.readline().decode("utf-8").strip()  # Read serial data
        if line == "BLINK":
            print("Eye Blink Detected! Pressing SPACEBAR...")
            pyautogui.press("space")  # Simulate spacebar press
    except Exception as e:
        print(f"Error: {e}")
        break

# Close serial connection when done
ser.close()
