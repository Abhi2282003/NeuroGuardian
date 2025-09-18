// Text-to-Speech using ElevenLabs
let audioContext: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;

export const initializeAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

export const stopCurrentAudio = () => {
  if (currentSource) {
    try {
      currentSource.stop();
    } catch (e) {
      // Audio was already stopped
    }
    currentSource = null;
  }
};

export const playTextToSpeech = async (text: string, voiceId: string = 'Aria'): Promise<void> => {
  try {
    // Stop any currently playing audio
    stopCurrentAudio();
    
    const context = initializeAudio();
    if (context.state === 'suspended') {
      await context.resume();
    }

    // Map voice names to IDs
    const voiceMap: Record<string, string> = {
      'Aria': '9BWtsMINqrJLrRacOk9x',
      'Sarah': 'EXAVITQu4vr4xnSDxMaL',
      'Laura': 'FGY2WhTYpPnrIDTdsKH5',
      'Alice': 'Xb7hH8MSUJpSbSDYk0k2'
    };

    const actualVoiceId = voiceMap[voiceId] || voiceMap['Aria'];

    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + actualVoiceId, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.7,
          similarity_boost: 0.8,
          style: 0.2
        }
      })
    });

    if (!response.ok) {
      console.warn('TTS API failed, falling back to browser speech');
      return playBrowserTTS(text);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    
    currentSource = context.createBufferSource();
    currentSource.buffer = audioBuffer;
    currentSource.connect(context.destination);
    currentSource.start();
    
    return new Promise((resolve) => {
      if (currentSource) {
        currentSource.onended = () => {
          currentSource = null;
          resolve();
        };
      } else {
        resolve();
      }
    });

  } catch (error) {
    console.warn('TTS failed, falling back to browser speech:', error);
    return playBrowserTTS(text);
  }
};

const playBrowserTTS = (text: string): Promise<void> => {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      
      window.speechSynthesis.speak(utterance);
    } else {
      resolve();
    }
  });
};

// Generate ambient sounds
export const generateAmbientSound = (type: 'forest' | 'ocean' | 'rain', duration: number = 4): AudioBuffer | null => {
  const context = initializeAudio();
  if (!context) return null;

  const sampleRate = context.sampleRate;
  const frameCount = sampleRate * duration;
  const buffer = context.createBuffer(1, frameCount, sampleRate);
  const data = buffer.getChannelData(0);

  switch (type) {
    case 'forest':
      for (let i = 0; i < frameCount; i++) {
        const time = i / sampleRate;
        const wind = Math.sin(2 * Math.PI * 0.05 * time) * 0.2;
        const rustling = (Math.random() * 2 - 1) * 0.1;
        const birds = Math.sin(2 * Math.PI * 2 * time + Math.random()) * 0.05;
        data[i] = wind + rustling + birds;
      }
      break;
    case 'ocean':
      for (let i = 0; i < frameCount; i++) {
        const time = i / sampleRate;
        const wave1 = Math.sin(2 * Math.PI * 0.1 * time) * 0.3;
        const wave2 = Math.sin(2 * Math.PI * 0.05 * time) * 0.2;
        const noise = (Math.random() * 2 - 1) * 0.1;
        data[i] = wave1 + wave2 + noise;
      }
      break;
    case 'rain':
      for (let i = 0; i < frameCount; i++) {
        const noise = (Math.random() * 2 - 1) * 0.3;
        const filtered = noise * Math.random();
        data[i] = filtered;
      }
      break;
  }

  return buffer;
};

export const playAmbientSound = (type: 'forest' | 'ocean' | 'rain') => {
  const context = initializeAudio();
  if (!context) return null;

  const buffer = generateAmbientSound(type, 4);
  if (!buffer) return null;

  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.loop = false;
  
  source.onended = () => {
    // Seamlessly loop the sound
    setTimeout(() => playAmbientSound(type), 100);
  };
  
  source.start();
  return source;
};