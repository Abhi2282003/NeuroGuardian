import { useState, useCallback, useRef, useEffect } from 'react';
import { SerialStatus, SerialCommand, DEFAULT_CONFIG } from './types';

export function useSerialClient() {
  const [status, setStatus] = useState<SerialStatus>({
    connected: false,
    streaming: false,
    sampleRate: 0,
    droppedFrames: 0,
    totalPackets: 0
  });
  
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const streamingRef = useRef<boolean>(false);
  const buffer = useRef<number[]>([]);

  const isSupported = useCallback(() => {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }, []);

  const connect = useCallback(async () => {
    if (!isSupported()) {
      throw new Error('Web Serial API not supported');
    }

    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: DEFAULT_CONFIG.baudRate });
      
      portRef.current = port;
      
      setStatus(prev => ({
        ...prev,
        connected: true
      }));

      // Send WHORU command
      if (port.writable) {
        const writer = port.writable.getWriter();
        const encoder = new TextEncoder();
        await writer.write(encoder.encode('WHORU\n'));
        writer.releaseLock();
      }
      
      return true;
    } catch (error) {
      console.error('Serial connection error:', error);
      throw error;
    }
  }, [isSupported]);

  const disconnect = useCallback(async () => {
    streamingRef.current = false;
    
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        console.error('Error canceling reader:', e);
      }
      readerRef.current = null;
    }

    if (portRef.current) {
      try {
        await portRef.current.close();
      } catch (e) {
        console.error('Error closing port:', e);
      }
      portRef.current = null;
    }

    buffer.current = [];

    setStatus({
      connected: false,
      streaming: false,
      sampleRate: 0,
      droppedFrames: 0,
      totalPackets: 0
    });
  }, []);

  const sendCommand = useCallback(async (command: SerialCommand['type']) => {
    if (!portRef.current || !portRef.current.writable) {
      throw new Error('Port not writable');
    }

    const writer = portRef.current.writable.getWriter();
    const encoder = new TextEncoder();
    const data = encoder.encode(`${command}\n`);
    
    await writer.write(data);
    writer.releaseLock();
  }, []);

  const startStream = useCallback(async (onData: (data: number[]) => void) => {
    if (!portRef.current || !portRef.current.readable) {
      throw new Error('Port not readable');
    }

    await sendCommand('START');
    
    streamingRef.current = true;
    setStatus(prev => ({ ...prev, streaming: true }));

    // Chords packet format
    const SYNC_BYTE1 = 0xC7;
    const SYNC_BYTE2 = 0x7C;
    const END_BYTE = 0x01;
    const NUM_CHANNELS = 6;
    const HEADER_LENGTH = 3;
    const PACKET_LENGTH = NUM_CHANNELS * 2 + HEADER_LENGTH + 1;

    let prevCounter: number | null = null;
    let totalPackets = 0;
    let droppedFrames = 0;

    // Read from serial port directly (no worker)
    readerRef.current = portRef.current.readable.getReader();
    
    (async () => {
      try {
        while (streamingRef.current && readerRef.current) {
          const { value, done } = await readerRef.current.read();
          if (done) break;
          
          // Add incoming data to buffer
          buffer.current.push(...value);
          
          // Process packets
          while (buffer.current.length >= PACKET_LENGTH) {
            // Find sync bytes
            const syncIndex = buffer.current.findIndex(
              (byte, index) =>
                byte === SYNC_BYTE1 && buffer.current[index + 1] === SYNC_BYTE2
            );

            if (syncIndex === -1) {
              buffer.current.length = 0;
              continue;
            }

            if (syncIndex + PACKET_LENGTH <= buffer.current.length) {
              const endByteIndex = syncIndex + PACKET_LENGTH - 1;

              if (
                buffer.current[syncIndex] === SYNC_BYTE1 &&
                buffer.current[syncIndex + 1] === SYNC_BYTE2 &&
                buffer.current[endByteIndex] === END_BYTE
              ) {
                const packet = buffer.current.slice(syncIndex, syncIndex + PACKET_LENGTH);
                const channelData: number[] = [];
                const counter = packet[2];
                
                // Extract channel values
                for (let channel = 0; channel < NUM_CHANNELS; channel++) {
                  const highByte = packet[channel * 2 + HEADER_LENGTH];
                  const lowByte = packet[channel * 2 + HEADER_LENGTH + 1];
                  const value = (highByte << 8) | lowByte;
                  channelData.push(value);
                }

                // Check for dropped frames
                if (prevCounter !== null) {
                  const expectedCounter = (prevCounter + 1) % 256;
                  if (counter !== expectedCounter) {
                    droppedFrames++;
                  }
                }
                prevCounter = counter;
                totalPackets++;

                // Update status periodically
                if (totalPackets % 50 === 0) {
                  setStatus(prev => ({
                    ...prev,
                    sampleRate: prev.sampleRate || 250,
                    totalPackets,
                    droppedFrames
                  }));
                }

                // Send data to callback
                onData(channelData);

                buffer.current.splice(0, endByteIndex + 1);
              } else {
                buffer.current.splice(0, syncIndex + 1);
              }
            } else {
              break;
            }
          }
        }
      } catch (error) {
        console.error('Read error:', error);
      }
    })();
  }, [sendCommand]);

  const stopStream = useCallback(async () => {
    streamingRef.current = false;
    
    if (portRef.current && portRef.current.writable) {
      try {
        await sendCommand('STOP');
      } catch (e) {
        console.error('Error sending STOP command:', e);
      }
    }
    
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        console.error('Error canceling reader:', e);
      }
      readerRef.current = null;
    }

    setStatus(prev => ({ ...prev, streaming: false }));
  }, [sendCommand]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    status,
    isSupported,
    connect,
    disconnect,
    startStream,
    stopStream
  };
}
