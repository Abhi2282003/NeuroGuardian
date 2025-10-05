            /**************************************************************************************
 *  2-Channel EEG Acquisition (Fp1 & Fp2) with Minimal Filtering
 * ------------------------------------------------------------------------------------
 *  Filters:
 *    - DC Offset Removal (High-Pass via exponential average)
 *    - Short-Term Memory Filter (Smooth quick motion artifacts)
 *  Outputs:
 *    - CSV format: Time (ms), Fp1(uV), Fp2(uV)
 *  Sampling Rate: 512 Hz
 **************************************************************************************/

// ============== USER SETTINGS ============== //
#define SAMPLE_RATE    512        // Hz
#define BAUD_RATE      500000     // Must match your serial terminal / Python script

// Analog Pins for EEG
#define EEG_FP1_PIN    A0
#define EEG_FP2_PIN    A1

// ADC & Amplifier Settings
#define ADC_MAX_VALUE     1023.0   // 10-bit ADC
#define ADC_REF_VOLTAGE   3.3      // If using a 3.3V reference
#define EEG_GAIN          10000.0  // Adjust if your hardware amplifier differs

// ============== FILTER SETTINGS ============== //
// DC Offset Removal
#define DC_ALPHA        0.9999f    // Higher => slower drift removal

// Short-Term Memory Filter
#define STM_ALPHA       0.8f       // 0 < STM_ALPHA < 1

// ============== GLOBAL STATE VARIABLES ============== //
// DC offset state
float dcOffset_FP1 = 0.0f;
float dcOffset_FP2 = 0.0f;

// Short-Term Memory state
float stmPrev_FP1 = 0.0f;
float stmPrev_FP2 = 0.0f;

// ============== FUNCTION PROTOTYPES ============== //
float adcToMicrovolts(int adcValue);
float removeDC(float input, float &dcOffset);
float shortTermMemoryFilter(float input, float &prevOut);

// ============== ARDUINO SETUP ============== //
void setup() {
  Serial.begin(BAUD_RATE);
  delay(1000);  // Allow some time for Serial to stabilize
  
  // Print CSV header
  Serial.println("Time(ms),Fp1(uV),Fp2(uV)");
}

// ============== ARDUINO LOOP ============== //
void loop() {
  static unsigned long lastSampleMicros = 0;
  unsigned long currentMicros = micros();

  // Check if it's time to sample at 512 Hz
  if (currentMicros - lastSampleMicros >= (1000000UL / SAMPLE_RATE)) {
    lastSampleMicros += (1000000UL / SAMPLE_RATE);

    // 1) Read raw EEG from ADC
    float rawFp1 = adcToMicrovolts(analogRead(EEG_FP1_PIN));
    float rawFp2 = adcToMicrovolts(analogRead(EEG_FP2_PIN));

    // 2) Remove DC offset
    float dcFp1 = removeDC(rawFp1, dcOffset_FP1);
    float dcFp2 = removeDC(rawFp2, dcOffset_FP2);

    // 3) Short-Term Memory Filter (smooth motion artifacts)
    float cleanFp1 = shortTermMemoryFilter(dcFp1, stmPrev_FP1);
    float cleanFp2 = shortTermMemoryFilter(dcFp2, stmPrev_FP2);

    // 4) Print final data in CSV format
    unsigned long tMillis = millis();
    Serial.print(tMillis);
    Serial.print(",");
    Serial.print(cleanFp1, 6);
    Serial.print(",");
    Serial.println(cleanFp2, 6);
  }
}

// ============== HELPER FUNCTIONS ============== //

// Convert ADC reading to microvolts (assuming external amplifier)
float adcToMicrovolts(int adcValue) {
  float volts = (adcValue / ADC_MAX_VALUE) * ADC_REF_VOLTAGE; // [0 .. Vref]
  float microVolts = volts * 1e6;                             // convert to µV
  return microVolts / EEG_GAIN;                               // account for  amplifier gain
}

// High-Pass Filter (DC offset removal)
float removeDC(float input, float &dcOffset) {
  dcOffset = DC_ALPHA * dcOffset + (1.0f - DC_ALPHA) * input;
  return input - dcOffset;
}

// Short-Term Memory Filter (simple smoothing)
float shortTermMemoryFilter(float input, float &prevOut) {
  prevOut = STM_ALPHA * prevOut + (1.0f - STM_ALPHA) * input;
  return prevOut;
}
