// Serial communication types for BioAmp/Chords devices

export const SYNC_BYTE_1 = 0xC7;
export const SYNC_BYTE_2 = 0x7C;
export const END_BYTE = 0x01;
export const PACKET_LENGTH = 16;
export const NUM_CHANNELS = 6;

export interface SerialConfig {
  baudRate: number;
  expectedSampleRate: number;
  channels: number;
}

export interface ParsedPacket {
  timestamp: number;
  counter: number;
  channels: number[];
}

export interface SerialStatus {
  connected: boolean;
  streaming: boolean;
  deviceId?: string;
  sampleRate: number;
  droppedFrames: number;
  totalPackets: number;
}

export interface SerialCommand {
  type: 'WHORU' | 'START' | 'STOP' | 'STATUS';
}

export const DEFAULT_CONFIG: SerialConfig = {
  baudRate: 230400,
  expectedSampleRate: 500,
  channels: 6
};
