import { SYNC_BYTE_1, SYNC_BYTE_2, END_BYTE, PACKET_LENGTH, NUM_CHANNELS } from '../lib/serial/types';

let buffer: number[] = [];
let lastCounter = -1;
let droppedFrames = 0;
let batchBuffer: any[] = [];
let lastBatchTime = Date.now();

self.onmessage = (e) => {
  if (e.data.type === 'data') {
    const data = new Uint8Array(e.data.buffer);
    processData(data);
  }
};

function processData(data: Uint8Array) {
  console.log('[Worker] Received data:', data.length, 'bytes');
  // Add to buffer
  for (let i = 0; i < data.length; i++) {
    buffer.push(data[i]);
  }
  console.log('[Worker] Buffer size:', buffer.length);

  // Try to parse packets
  while (buffer.length >= PACKET_LENGTH) {
    // Look for sync bytes
    const syncIndex = findSyncBytes();
    
    if (syncIndex === -1) {
      // No sync found, clear some buffer to prevent overflow
      if (buffer.length > 1000) {
        buffer = buffer.slice(buffer.length - 500);
      }
      break;
    }

    // Remove bytes before sync
    if (syncIndex > 0) {
      buffer = buffer.slice(syncIndex);
    }

    // Check if we have a complete packet
    if (buffer.length < PACKET_LENGTH) {
      break;
    }

    // Parse packet
    const packet = parsePacket(buffer.slice(0, PACKET_LENGTH));
    buffer = buffer.slice(PACKET_LENGTH);

    if (packet) {
      console.log('[Worker] Parsed packet:', packet);
      batchBuffer.push(packet);
      
      // Send batch every ~16ms (60 FPS) or when buffer is large
      const now = Date.now();
      if (now - lastBatchTime >= 16 || batchBuffer.length >= 30) {
        console.log('[Worker] Sending batch:', batchBuffer.length, 'packets');
        self.postMessage({
          type: 'packets',
          packets: batchBuffer,
          droppedFrames
        });
        batchBuffer = [];
        lastBatchTime = now;
      }
    }
  }
}

function findSyncBytes(): number {
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === SYNC_BYTE_1 && buffer[i + 1] === SYNC_BYTE_2) {
      return i;
    }
  }
  return -1;
}

function parsePacket(data: number[]): any | null {
  // Verify sync bytes
  if (data[0] !== SYNC_BYTE_1 || data[1] !== SYNC_BYTE_2) {
    return null;
  }

  // Verify end byte
  if (data[15] !== END_BYTE) {
    return null;
  }

  // Extract counter
  const counter = data[2];
  
  // Check for dropped packets
  if (lastCounter !== -1) {
    const expectedCounter = (lastCounter + 1) % 256;
    if (counter !== expectedCounter) {
      const dropped = counter > lastCounter 
        ? counter - lastCounter - 1
        : 256 - lastCounter + counter - 1;
      droppedFrames += dropped;
    }
  }
  lastCounter = counter;

  // Extract channels
  const channels: number[] = [];
  for (let i = 0; i < NUM_CHANNELS; i++) {
    const highByte = data[3 + i * 2];
    const lowByte = data[4 + i * 2];
    const value = (highByte << 8) | lowByte;
    channels.push(value);
  }

  return {
    timestamp: Date.now(),
    counter,
    channels
  };
}

export {};
