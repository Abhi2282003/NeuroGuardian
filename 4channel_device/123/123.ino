/**************************************************************************************
 *  Integrated 2-Channel EEG Acquisition & Blink Detection
 * ------------------------------------------------------------------------------------
 *  - Reads EEG signals from two channels: Fp1 (A0) and Fp2 (A1)
 *  - Fp1 is also used for detecting eye blinks.
 * 
 *  Processing:
 *    1. Convert ADC reading to microvolts (using different gains for each channel)
 *    2. Remove DC offset via an exponential (high-pass) filter
 *    3. Smooth quick motion artifacts via a short-term memory filter
 *    4. Detect blinks on Fp1 when the filtered value exceeds a set threshold
 *
 *  Output:
 *    - CSV format: Time (ms), Fp1(uV), Fp2(uV), Blink (1 if detected, 0 otherwise)
 *
 *  Sampling Rate: 512 Hz
 **************************************************************************************/

// ============== USER SETTINGS ============== //
#define SAMPLE_RATE      512         // Hz
#define BAUD_RATE        500000      // Must match your serial monitor or script

// ============== PIN ASSIGNMENTS ============== //
// Use A0 for Fp1 (EEG acquisition + blink detection) and A1 for Fp2
#define EEG_FP1_PIN      A0
#define EEG_FP2_PIN      A1

// ============== ADC & AMPLIFIER SETTINGS ============== //
#define ADC_MAX_VALUE    1023.0    // 10-bit ADC
#define ADC_REF_VOLTAGE  3.3       // Reference voltage
// For this integrated example, we use different amplifier gains:
#define EEG_GAIN_FP1   1000.0     // For channel A0 (used for blink detection)
#define EEG_GAIN_FP2   10000.0    // For channel A1

// ============== FILTER SETTINGS ============== //
// DC Offset Removal
#define DC_ALPHA         0.9999f   // Higher value => slower drift removal
// Short-Term Memory Filter (smoothing)
#define STM_ALPHA        0.8f      // 0 < STM_ALPHA < 1

// ============== BLINK DETECTION SETTINGS ============== //
#define BLINK_THRESHOLD      100.0   // µV threshold for blink detection (tune as needed)
#define BLINK_RESET_TIME_MS  300     // Minimum time (ms) between blink detections

// ============== GLOBAL STATE VARIABLES ============== //
// DC offset state variables for each channel
float dcOffset_FP1 = 0.0f;
float dcOffset_FP2 = 0.0f;

// Short-Term Memory state variables for each channel
float stmPrev_FP1 = 0.0f;
float stmPrev_FP2 = 0.0f;

// Blink detection state
unsigned long lastBlinkTime = 0;

// ============== FUNCTION PROTOTYPES ============== //
float adcToMicrovolts(int adcValue, float gain);
float removeDC(float input, float &dcOffset);
float shortTermMemoryFilter(float input, float &prevOut);
bool  detectBlink(float signal, unsigned long &lastBlinkTime);

// ============== ARDUINO SETUP ============== //
void setup() {
  Serial.begin(BAUD_RATE);
  delay(1000); // Allow time for Serial to stabilize
  
  // Print CSV header with a blink indicator column
  Serial.println("Time(ms),Fp1(uV),Fp2(uV),Blink");
}

// ============== ARDUINO LOOP ============== //
void loop() {
  static unsigned long lastSampleMicros = 0;
  unsigned long currentMicros = micros();
  
  // Sample at the defined rate (512 Hz)
  if (currentMicros - lastSampleMicros >= (1000000UL / SAMPLE_RATE)) {
    lastSampleMicros += (1000000UL / SAMPLE_RATE);

    // 1) Read raw EEG data from both channels
    float rawFp1 = adcToMicrovolts(analogRead(EEG_FP1_PIN), EEG_GAIN_FP1);
    float rawFp2 = adcToMicrovolts(analogRead(EEG_FP2_PIN), EEG_GAIN_FP2);

    // 2) Remove DC offset from both channels
    float dcFp1 = removeDC(rawFp1, dcOffset_FP1);
    float dcFp2 = removeDC(rawFp2, dcOffset_FP2);

    // 3) Apply Short-Term Memory Filter (smoothing)
    float cleanFp1 = shortTermMemoryFilter(dcFp1, stmPrev_FP1);
    float cleanFp2 = shortTermMemoryFilter(dcFp2, stmPrev_FP2);

    // 4) Detect eye blink on Fp1 channel
    bool blinkDetected = detectBlink(cleanFp1, lastBlinkTime);

    // 5) Print final data in CSV format.
    //     The fourth column outputs "1" if a blink is detected, "0" otherwise.
    unsigned long tMillis = millis();
    Serial.print(tMillis);
    Serial.print(",");
    Serial.print(cleanFp1, 6);
    Serial.print(",");
    Serial.print(cleanFp2, 6);
    Serial.print(",");
    Serial.println(blinkDetected ? "1" : "0");
  }
}

// ============== HELPER FUNCTIONS ============== //

// Convert ADC reading to microvolts; each channel uses its own amplifier gain.
float adcToMicrovolts(int adcValue, float gain) {
  float volts = (adcValue / ADC_MAX_VALUE) * ADC_REF_VOLTAGE; // Voltage from ADC
  float microVolts = volts * 1e6;                             // Convert to µV
  return microVolts / gain;                                   // Compensate for amplifier gain
}

// High-Pass Filter for DC offset removal.
float removeDC(float input, float &dcOffset) {
  dcOffset = DC_ALPHA * dcOffset + (1.0f - DC_ALPHA) * input;
  return input - dcOffset;
}

// Short-Term Memory Filter for smoothing transient artifacts.
float shortTermMemoryFilter(float input, float &prevOut) {
  prevOut = STM_ALPHA * prevOut + (1.0f - STM_ALPHA) * input;
  return prevOut;
}

// Detect a blink based on the filtered signal exceeding a threshold.
// The blink detection enforces a reset time to avoid multiple detections.
bool detectBlink(float signal, unsigned long &lastBlinkTime) {
  if (abs(signal) > BLINK_THRESHOLD && (millis() - lastBlinkTime > BLINK_RESET_TIME_MS)) {
    lastBlinkTime = millis();
    return true;
  }
  return false;
}
