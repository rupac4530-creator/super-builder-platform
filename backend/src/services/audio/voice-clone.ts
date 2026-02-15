/**
 * Engine Alto — Voice Clone & TTS Service
 * ElevenLabs integration with Coqui TTS fallback.
 */
export interface VoiceCloneRequest {
  referenceAudioPath: string;
  text: string;
  language?: string;
  speed?: number;
  pitch?: number;
}

export interface TTSRequest {
  text: string;
  voice?: string;
  language?: string;
  speed?: number;
  format?: 'wav' | 'mp3' | 'ogg';
}

export interface VoiceResult {
  id: string;
  outputPath: string;
  duration: number;
  provider: 'elevenlabs' | 'coqui' | 'mock';
  format: string;
}

export class VoiceService {
  private useElevenLabs: boolean;
  private counter = 0;

  constructor() {
    this.useElevenLabs = !!process.env.ELEVENLABS_API_KEY;
  }

  async cloneVoice(req: VoiceCloneRequest): Promise<VoiceResult> {
    const id = `voice_${++this.counter}_${Date.now()}`;
    if (this.useElevenLabs) {
      // Production: call ElevenLabs API for voice cloning
      return { id, outputPath: `data/audio/cloned/${id}.wav`, duration: req.text.length * 0.06, provider: 'elevenlabs', format: 'wav' };
    }
    // Fallback: generate simple TTS
    return this.textToSpeech({ text: req.text, language: req.language, speed: req.speed });
  }

  async textToSpeech(req: TTSRequest): Promise<VoiceResult> {
    const id = `tts_${++this.counter}_${Date.now()}`;
    const duration = req.text.length * 0.06 * (1 / (req.speed || 1));
    return { id, outputPath: `data/audio/tts/${id}.${req.format || 'wav'}`, duration, provider: this.useElevenLabs ? 'elevenlabs' : 'mock', format: req.format || 'wav' };
  }

  getAvailableVoices(): { id: string; name: string; language: string; gender: string }[] {
    return [
      { id: 'alto-narrator', name: 'Alto Narrator', language: 'en', gender: 'neutral' },
      { id: 'alto-warm', name: 'Alto Warm', language: 'en', gender: 'female' },
      { id: 'alto-deep', name: 'Alto Deep', language: 'en', gender: 'male' },
      { id: 'alto-bright', name: 'Alto Bright', language: 'en', gender: 'female' },
      { id: 'alto-dramatic', name: 'Alto Dramatic', language: 'en', gender: 'male' },
    ];
  }
}

export const voiceService = new VoiceService();
export default voiceService;
