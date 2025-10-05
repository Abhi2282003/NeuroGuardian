/**************************************************************************************
 * High-Quality EEG Acquisition (2 Channels: Fp1 & Fp2) with Artifact Removal
 * ------------------------------------------------------------------------
 * Features:
 *  1) High Sampling Rate: 512 Hz
 *  2) DC Drift Removal (High-Pass Filter)
 *  3) 50 Hz Notch Filter (Adjust to 60 Hz if needed)
 *  4) Short-Term Memory Filter (Motion Artifact Smoothing)
 *  5) CSV-Formatted Output (Time (ms), EEG_Fp1, EEG_Fp2)
 *
 * Adjust Gains and Filters as needed for your specific hardware setup!
 **************************************************************************************/

// ====================== USER SETTINGS ====================== //
#define SAMPLE_RATE    512      // Hz: High sampling rate for EEG
#define BAUD_RATE      500000   // High baud rate to prevent data lag

// ADC & Amplifier
#define EEG_FP1_PIN    A0       // Fp1 electrode input
#define EEG_FP2_PIN    A1       // Fp2 electrode input
#define ADC_MAX_VALUE  1023.0   // 10-bit ADC on Arduino UNO
#define ADC_REF_VOLTAGE 3.3     // If using a 3.3V reference
#define EEG_GAIN       10000.0  // Increase for stronger signal (e.g. 10000)

// ================= FILTER SETTINGS (ARTIFACT REMOVAL) ================ //
// High-Pass Filter (DC Drift)
#define DC_ALPHA       0.9999f  // Closer to 1 => slower drift removal

// Notch Filter (remove 50 Hz or 60 Hz line noise)
#define NOTCH_FREQ     50.0f    // Set to 60.0f if you're in a 60 Hz region
#define NOTCH_Q        30.0f    // Quality factor; higher = narrower notch

// Short-Term Memory Filter (Motion Artifact Smoothing)
#define STM_ALPHA      0.8f     // 0 < STM_ALPHA < 1

// =================== GLOBAL FILTER STATES =================== //
// DC offset states
float dcOffset_FP1 = 0.0f;
float dcOffset_FP2 = 0.0f;

// Notch filter states (2nd-order IIR)
// We'll store last two inputs (x[n-1], x[n-2]) and last two outputs (y[n-1], y[n-2])
float x1_FP1 = 0.0f, x2_FP1 = 0.0f; // Fp1 channel - input history
float y1_FP1 = 0.0f, y2_FP1 = 0.0f; // Fp1 channel - output history

float x1_FP2 = 0.0f, x2_FP2 = 0.0f; // Fp2 channel - input history
float y1_FP2 = 0.0f, y2_FP2 = 0.0f; // Fp2 channel - output history

// Short-Term Memory states
float stmPrev_FP1 = 0.0f;
float stmPrev_FP2 = 0.0f;

// =============== NOTCH FILTER COEFFICIENTS (CALCULATED AT RUNTIME) =============== //
float a0, a1, a2, b0, b1, b2;  // IIR filter coefficients

// -------------------------- FUNCTION PROTOTYPES -------------------------- //
void computeNotchCoeffs();
float adcToMicrovolts(int adcValue);
float highPassFilter(float input, float &dcOffset);
float notchFilter(float x, float &x1, float &x2, float &y1, float &y2);
float shortTermMemory(float input, float &prev_out);

// ======================================================================== //
// ARDUINO SETUP
// ======================================================================== //
void setup() {
  Serial.begin(BAUD_RATE);
  delay(1000); // Give some time for Serial to stabilize

  // Precompute the notch filter coefficients
  computeNotchCoeffs();

  // Print CSV header
  Serial.println("Time (ms),EEG_Fp1(uV),EEG_Fp2(uV)");
}

// ======================================================================== //
// ARDUINO LOOP (EEG Data Acquisition + Artifact Removal)
// ======================================================================== //
void loop() {
  static unsigned long lastSampleMicros = 0;
  unsigned long currentMicros = micros();

  // Check if it's time for the next sample
  if (currentMicros - lastSampleMicros >= (1000000UL / SAMPLE_RATE)) {
    lastSampleMicros += (1000000UL / SAMPLE_RATE);

    // 1) Read raw EEG from ADC pins
    float raw_FP1 = adcToMicrovolts(analogRead(EEG_FP1_PIN));
    float raw_FP2 = adcToMicrovolts(analogRead(EEG_FP2_PIN));

    // 2) High-Pass Filter to remove DC drift
    float hp_FP1 = highPassFilter(raw_FP1, dcOffset_FP1);
    float hp_FP2 = highPassFilter(raw_FP2, dcOffset_FP2);

    // 3) Notch Filter to remove 50 Hz (or 60 Hz) interference
    float notch_FP1 = notchFilter(hp_FP1, x1_FP1, x2_FP1, y1_FP1, y2_FP1);
    float notch_FP2 = notchFilter(hp_FP2, x1_FP2, x2_FP2, y1_FP2, y2_FP2);

    // 4) Short-Term Memory Filter to smooth motion artifacts
    float clean_FP1 = shortTermMemory(notch_FP1, stmPrev_FP1);
    float clean_FP2 = shortTermMemory(notch_FP2, stmPrev_FP2);

    // 5) Print final clean data as CSV
    unsigned long tMillis = millis(); // Current time in ms
    Serial.print(tMillis);
    Serial.print(",");
    Serial.print(clean_FP1, 6);  // Print with 6 decimal places
    Serial.print(",");
    Serial.println(clean_FP2, 6);
  }
}

// ======================================================================== //
// HELPER FUNCTIONS
// ======================================================================== //

/**
 * @brief Compute IIR notch filter coefficients
 *        Notch freq and Q factor must be defined at compile time
 */
void computeNotchCoeffs() {
  // Angular frequency
  float w0 = 2.0f * 3.14159265359f * NOTCH_FREQ / (float)SAMPLE_RATE;
  // Alpha depends on Q
  float alpha = sin(w0) / (2.0f * NOTCH_Q);

  // Standard biquad formula (IIR Notch)
  b0 = 1.0f;
  b1 = -2.0f * cos(w0);
  b2 = 1.0f;
  a0 = 1.0f + alpha;
  a1 = -2.0f * cos(w0);
  a2 = 1.0f - alpha;

  // Normalize coefficients by a0
  b0 /= a0;
  b1 /= a0;
  b2 /= a0;
  a1 /= a0;
  a2 /= a0;
}

/**
 * @brief Convert ADC reading to microvolts
 */
float adcToMicrovolts(int adcValue) {
  // (ADC_Value / ADC_MAX) * Vref => Volts
  // Then multiply by 1e6 => microvolts
  // Finally divide by amplifier gain
  float volts = (adcValue / ADC_MAX_VALUE) * ADC_REF_VOLTAGE;
  float microVolts = volts * 1000000.0f;
  return microVolts / EEG_GAIN;
}

/**
 * @brief High-pass filter to remove DC offset
 * @param input    Current sample
 * @param dcOffset State variable for DC offset
 */
float highPassFilter(float input, float &dcOffset) {
  // Exponential moving average for DC
  dcOffset = DC_ALPHA * dcOffset + (1.0f - DC_ALPHA) * input;
  return input - dcOffset;
}

/**
 * @brief 2nd-order IIR Notch Filter
 * @param x    Current sample
 * @param x1   x[n-1] history
 * @param x2   x[n-2] history
 * @param y1   y[n-1] history
 * @param y2   y[n-2] history
 */
float notchFilter(float x, float &x1, float &x2, float &y1, float &y2) {
  // Biquad difference equation:
  // y[n] = b0*x[n] + b1*x[n-1] + b2*x[n-2]
  //                  - a1*y[n-1] - a2*y[n-2]
  float y = b0*x + b1*x1 + b2*x2 - a1*y1 - a2*y2;

  // Shift samples
  x2 = x1;  
  x1 = x;  
  y2 = y1;  
  y1 = y;  

  return y;
}

/**
 * @brief Short-Term Memory Filter (Low-pass smoothing for motion artifacts)
 * @param input     Current sample
 * @param prev_out  Previous filtered sample
 */
float shortTermMemory(float input, float &prev_out) {
  // Weighted average: output[n] = alpha*output[n-1] + (1-alpha)*input[n]
  prev_out = STM_ALPHA * prev_out + (1.0f - STM_ALPHA) * input;
  return prev_out;
}
