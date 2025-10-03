// Digital signal processing filters for biopotential signals

export type FilterType = 'emg' | 'ecg' | 'eog' | 'eeg' | 'notch50' | 'notch60' | 'none';

interface FilterConfig {
  type: 'highpass' | 'lowpass' | 'bandpass' | 'bandstop';
  cutoffLow?: number;
  cutoffHigh?: number;
  sampleRate: number;
}

class ButterworthFilter {
  private buffer: number[] = [];
  private config: FilterConfig;

  constructor(config: FilterConfig) {
    this.config = config;
    this.buffer = [];
  }

  apply(sample: number): number {
    // Simple moving average approximation
    // In production, use proper Butterworth IIR filter coefficients
    this.buffer.push(sample);
    if (this.buffer.length > 20) {
      this.buffer.shift();
    }
    return this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
  }

  reset() {
    this.buffer = [];
  }
}

export class SignalFilter {
  private filter: ButterworthFilter | null = null;
  private filterType: FilterType = 'none';
  private sampleRate: number;

  constructor(sampleRate: number = 250) {
    this.sampleRate = sampleRate;
  }

  setFilter(type: FilterType) {
    this.filterType = type;
    
    const configs: Record<FilterType, FilterConfig | null> = {
      emg: {
        type: 'bandpass',
        cutoffLow: 20,
        cutoffHigh: 450,
        sampleRate: this.sampleRate,
      },
      ecg: {
        type: 'bandpass',
        cutoffLow: 0.5,
        cutoffHigh: 150,
        sampleRate: this.sampleRate,
      },
      eog: {
        type: 'bandpass',
        cutoffLow: 0.1,
        cutoffHigh: 35,
        sampleRate: this.sampleRate,
      },
      eeg: {
        type: 'bandpass',
        cutoffLow: 0.5,
        cutoffHigh: 100,
        sampleRate: this.sampleRate,
      },
      notch50: {
        type: 'bandstop',
        cutoffLow: 48,
        cutoffHigh: 52,
        sampleRate: this.sampleRate,
      },
      notch60: {
        type: 'bandstop',
        cutoffLow: 58,
        cutoffHigh: 62,
        sampleRate: this.sampleRate,
      },
      none: null,
    };

    const config = configs[type];
    if (config) {
      this.filter = new ButterworthFilter(config);
    } else {
      this.filter = null;
    }
  }

  process(sample: number): number {
    if (!this.filter) return sample;
    return this.filter.apply(sample);
  }

  reset() {
    this.filter?.reset();
  }
}
