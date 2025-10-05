/**************************************************************
 *  Enhanced EEG with Eye Blink Detection                    *
 *  - Detects Eye Blinks on CH1 (prints "BLINK" only)        *
 *  - Uses FIR Bandpass, DC Offset Removal, & STM Filter     *
 *  - CSV data is not printed, only "BLINK" when detected    *
 **************************************************************/

//===================== USER SETTINGS =========================//
#define SAMPLE_RATE       512      // Hz; can reduce to 256 if needed
#define BAUD_RATE         500000   // Use high baud rate to avoid serial lag

// Analog input pins for EEG
#define EEG_CH1_PIN       A0

// ADC & Amplifier settings
#define ADC_MAX_VALUE     1023.0   // For 10-bit ADC (UNO). Use 4095.0 for 12-bit ADCs
#define ADC_REF_VOLTAGE   3.3      // Change to 5.0 if using a 5V reference
#define EEG_GAIN          1000.0   // Adjust according to your amplifier gain

//================= BLINK DETECTION SETTINGS ===================//
#define BLINK_THRESHOLD     4       00.0  // µV Threshold for detecting a blink (TUNE THIS!)
#define BLINK_RESET_TIME_MS 400    // Minimum time before another blink is detected

//===================== FILTER SETTINGS =======================//
#define STM_ALPHA         0.8f
#define DC_ALPHA          0.999f   // Slow drift removal

//================== FILTER STATE BUFFERS =====================//
float dcOffset_CH1 = 0;
float stmPrev_CH1 = 0;
unsigned long lastBlinkTime = 0; // To avoid multiple detections

//============================================================
// FUNCTION PROTOTYPES
//============================================================
float adcToMicrovolts(int adcValue);
float highPassFilter(float input, float &dcOffset);
float shortTermMemory(float input, float &prev_out);
bool detectBlink(float signal, unsigned long &lastBlinkTime);

//============================================================
// ARDUINO SETUP
//============================================================
void setup() {
  Serial.begin(BAUD_RATE);
  delay(1000); // Give serial some time
}

//============================================================
// ARDUINO LOOP
//============================================================
void loop() {
  static unsigned long lastSampleMicros = 0;
  unsigned long currentMicros = micros();

  if (currentMicros - lastSampleMicros >= (1000000UL / SAMPLE_RATE)) {
    lastSampleMicros += (1000000UL / SAMPLE_RATE);

    // 1) Read EEG Channel
    float raw_CH1 = adcToMicrovolts(analogRead(EEG_CH1_PIN));

    // 2) High-pass filter (remove DC offset)
    float hp_CH1 = highPassFilter(raw_CH1, dcOffset_CH1);

    // 3) Short-Term Memory smoothing
    float stm_CH1 = shortTermMemory(hp_CH1, stmPrev_CH1);

    // 4) Blink detection
    if (detectBlink(stm_CH1, lastBlinkTime)) {
      Serial.println("BLINK");
    }
  }
}

//============================================================
// HELPER FUNCTIONS
//============================================================

// Convert ADC reading to microvolts
float adcToMicrovolts(int adcValue) {
  return ((adcValue / ADC_MAX_VALUE) * ADC_REF_VOLTAGE * 1000000.0) / EEG_GAIN;
}

// High-pass filter (remove DC drift)u/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// +
float highPassFilter(float input, float &dcOffset) {
  dcOffset = DC_ALPHA * dcOffset + (1.0f - DC_ALPHA) * input;
  return input - dcOffset;
}

// Short-Term Memory Filter
float shortTermMemory(float input, float &prev_out) {
  prev_out = STM_ALPHA * prev_out + (1.0f - STM_ALPHA) * input;
  return prev_out;
}

// Detect Eye Blink
bool detectBlink(float signal, unsigned long &lastBlinkTime) {
  if (abs(signal) > BLINK_THRESHOLD && millis() - lastBlinkTime > BLINK_RESET_TIME_MS) {
    lastBlinkTime = millis();
    return true;
  }
  return false;
}
