# Complete EEG Monitoring Setup Guide for NeuroScreen

## 🎯 Overview

Your NeuroScreen app uses **BioAmp EXG Pill** or **Chords** hardware from Upside Down Labs to capture EEG (brain) signals. Here's the complete process:

---

## 📋 What You Need

### Hardware:
1. **BioAmp EXG Pill** or **Chords** board (from Upside Down Labs)
2. **Arduino Uno** or compatible microcontroller
3. **USB Cable** (Arduino to Computer)
4. **EEG Electrodes** (gel or dry electrodes)
5. **Electrode cables** (usually comes with BioAmp kit)

### Software:
1. **Arduino IDE** (download from arduino.cc)
2. **Chrome or Edge browser** (for Web Serial API)
3. **Your deployed NeuroScreen app** (won't work in iframe preview)

---

## 🔧 Step-by-Step Setup

### Step 1: Hardware Connection

```
EEG Electrodes → BioAmp EXG Pill → Arduino Uno → USB Cable → Computer
     (on head)      (amplifier)      (ADC)                   (runs app)
```

**Physical Connections:**
1. **Connect BioAmp to Arduino:**
   - BioAmp VCC → Arduino 5V
   - BioAmp GND → Arduino GND
   - BioAmp OUT → Arduino A0 (analog input)

2. **Attach Electrodes to BioAmp:**
   - IN+ (positive) → Forehead electrode
   - IN- (negative) → Behind ear/mastoid
   - REF (reference) → Other ear/mastoid

3. **Place Electrodes on Head:**
   - Clean skin with alcohol wipe
   - Apply gel if using gel electrodes
   - Forehead (Fp1/Fp2) - positive
   - Behind ears (mastoids) - negative & reference

---

### Step 2: Upload Arduino Code

**Open Arduino IDE and paste this code:**

```cpp
// NeuroScreen - BioAmp EXG Pill Arduino Firmware
// Samples at 250 Hz and sends data via Serial

#define SAMPLE_RATE 250
#define BAUD_RATE 115200
#define INPUT_PIN A0
#define BUFFER_SIZE 64

int16_t dataBuffer[BUFFER_SIZE];
uint8_t bufferIndex = 0;
unsigned long lastSampleTime = 0;
const unsigned long sampleInterval = 1000000 / SAMPLE_RATE; // microseconds

void setup() {
  Serial.begin(BAUD_RATE);
  analogReference(DEFAULT);
  pinMode(INPUT_PIN, INPUT);
  lastSampleTime = micros();
}

void loop() {
  unsigned long currentTime = micros();
  
  // Sample at exactly 250 Hz
  if (currentTime - lastSampleTime >= sampleInterval) {
    lastSampleTime = currentTime;
    
    // Read analog value (0-1023) and convert to signed 16-bit
    int rawValue = analogRead(INPUT_PIN);
    dataBuffer[bufferIndex++] = (int16_t)rawValue;
    
    // When buffer is full, send it
    if (bufferIndex >= BUFFER_SIZE) {
      // Send start marker
      Serial.write(0xAA);
      Serial.write(0xBB);
      
      // Send buffer size
      Serial.write(BUFFER_SIZE);
      
      // Send data as bytes
      Serial.write((uint8_t*)dataBuffer, BUFFER_SIZE * 2);
      
      // Send checksum (simple XOR)
      uint8_t checksum = 0;
      for(int i = 0; i < BUFFER_SIZE * 2; i++) {
        checksum ^= ((uint8_t*)dataBuffer)[i];
      }
      Serial.write(checksum);
      
      bufferIndex = 0;
    }
  }
}
```

**Upload Steps:**
1. Connect Arduino via USB
2. Select **Tools → Board → Arduino Uno**
3. Select **Tools → Port → [Your Arduino Port]**
4. Click **Upload** (→) button
5. Wait for "Done uploading" message

**Test Serial Output:**
- Open **Tools → Serial Monitor**
- Set baud rate to **115200**
- You should see binary data streaming (if connected properly)

---

### Step 3: Deploy Your App

**Why you need to deploy:**
- Web Serial API requires **HTTPS** (security)
- Won't work in **iframe** (like Lovable preview)
- Must be **direct browser access** to deployed site

**How to deploy:**
1. In Lovable, click **Publish** button (top right)
2. Wait for deployment to complete
3. Copy your deployment URL (e.g., `https://yourapp.lovableproject.com`)

---

### Step 4: Connect in Your App

1. **Open deployed app** in Chrome/Edge (desktop only)
2. Navigate to **EEG Monitoring** page
3. Click **"Connect via USB"**
4. Select your Arduino from popup (e.g., "Arduino Uno on /dev/ttyUSB0")
5. Click **"Connect"**
6. Click **"Start Stream"**

**What happens:**
```
Arduino → USB Serial Data → Web Serial API → Your App → Live EEG Display
  250 Hz      Binary packets     JavaScript      React     WebGL visualization
```

---

## 📊 Data Flow Explained

### 1. **Signal Capture** (Physical)
- Brain electrical activity (μV) → Electrodes

### 2. **Amplification** (BioAmp)
- Weak signal → Amplified 1000x → Clean analog voltage

### 3. **Digitization** (Arduino)
- Analog voltage → ADC → Digital values (0-1023)
- Sampled at 250 Hz (4ms intervals)

### 4. **Transmission** (Serial)
- Digital values → Buffered → Binary packets → USB Serial

### 5. **Processing** (Web App)
- Web Serial API receives packets
- Validates checksums
- Converts to voltage values
- Real-time visualization

### 6. **Analysis** (AI/ML)
- FFT for frequency bands (Alpha, Beta, Theta, etc.)
- Stress detection algorithms
- Mental state classification

---

## 🧪 Testing Without Hardware (Demo Mode)

If you don't have hardware yet:

1. Open EEG Monitoring page
2. Click **"Enable Demo Mode"**
3. See simulated 6-channel EEG at 250 Hz
4. Test visualization and UI

---

## ⚠️ Common Issues & Solutions

### "Web Serial Not Available"
- ✅ Use Chrome/Edge (not Firefox/Safari)
- ✅ Desktop only (not mobile)
- ✅ Must be deployed (not preview iframe)

### "No Serial Ports Found"
- ✅ Check USB cable connected
- ✅ Arduino has code uploaded
- ✅ Check Device Manager (Windows) or `ls /dev/tty*` (Mac/Linux)

### "Connection Failed"
- ✅ Close Arduino Serial Monitor (conflicts with app)
- ✅ Try different baud rate (must match: 115200)
- ✅ Restart Arduino

### "Noisy Signal"
- ✅ Clean skin with alcohol
- ✅ Apply more electrode gel
- ✅ Ensure good contact
- ✅ Reduce movement
- ✅ Turn off nearby electronics

### "Flat Line / No Data"
- ✅ Check electrode connections
- ✅ Verify BioAmp wiring to Arduino
- ✅ Test with Arduino Serial Monitor first
- ✅ Check electrode placement

---

## 📈 Expected Signal Quality

**Good EEG signal shows:**
- ✅ Continuous waveform (not flat)
- ✅ Amplitude: 50-200 μV (after conversion)
- ✅ Visible alpha waves (~10 Hz) when eyes closed
- ✅ Beta waves (~20 Hz) when focused
- ✅ Minimal noise/artifacts

---

## 🔬 Advanced: Signal Processing

Your app will automatically:

1. **Filter** (0.5-50 Hz bandpass) - Remove DC offset and high-freq noise
2. **FFT** - Convert time domain → frequency domain
3. **Band Power** - Calculate Alpha, Beta, Theta, Delta power
4. **Stress Index** - Beta/Alpha ratio analysis
5. **Mental States** - Relaxed, Focused, Stressed, Drowsy

---

## 📱 Browser Compatibility

| Browser | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| Chrome  | ✅ Yes  | ❌ No  | Recommended |
| Edge    | ✅ Yes  | ❌ No  | Recommended |
| Firefox | ❌ No   | ❌ No  | Not supported |
| Safari  | ❌ No   | ❌ No  | Not supported |

---

## 🛠️ Development Workflow

1. **Prototype** - Use Demo Mode in Lovable preview
2. **Hardware Test** - Deploy → Connect Arduino → Verify data
3. **Algorithm Dev** - Collect real data → Test ML models
4. **Production** - Full deployment with all features

---

## 📚 Additional Resources

- **BioAmp Docs:** https://docs.upsidedownlabs.tech/
- **Web Serial API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API
- **EEG Basics:** https://en.wikipedia.org/wiki/Electroencephalography

---

## 🎓 Quick Reference

**Key Specs:**
- Sample Rate: 250 Hz
- Channels: 6 (expandable)
- Resolution: 10-bit ADC
- Baud Rate: 115200
- Protocol: Binary packets with checksums

**Electrode Positions (10-20 system):**
- Fp1, Fp2 (frontal)
- C3, C4 (central)
- O1, O2 (occipital)
- Reference: A1/A2 (mastoids)

---

## ✅ Setup Checklist

- [ ] Hardware purchased (BioAmp + Arduino)
- [ ] Arduino IDE installed
- [ ] Firmware uploaded to Arduino
- [ ] Electrodes prepared (gel applied)
- [ ] Electrodes placed correctly
- [ ] App deployed (not using preview)
- [ ] Chrome/Edge browser on desktop
- [ ] USB connection working
- [ ] Serial data streaming
- [ ] Signal quality verified
- [ ] Ready for testing! 🎉

---

**Need Help?**
- Check console logs in browser (F12 → Console)
- Verify Arduino Serial Monitor output first
- Test with Demo Mode to isolate hardware issues
- Check electrode connections and placement

**Your app is ready - now connect the hardware! 🧠⚡**
