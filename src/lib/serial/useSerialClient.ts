/// <reference path="../../types/web-serial.d.ts" />
import { useState, useCallback, useRef, useEffect } from 'react';
import { SerialStatus, SerialCommand, DEFAULT_CONFIG, ParsedPacket } from './types';

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
  const workerRef = useRef<Worker | null>(null);
  const streamingRef = useRef<boolean>(false);

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
      await sendCommand('WHORU');
      
      return true;
    } catch (error) {
      console.error('Serial connection error:', error);
      throw error;
    }
  }, [isSupported]);

  const disconnect = useCallback(async () => {
    if (readerRef.current) {
      await readerRef.current.cancel();
      readerRef.current = null;
    }

    if (portRef.current) {
      await portRef.current.close();
      portRef.current = null;
    }

    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

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

  const startStream = useCallback(async (onData: (packet: ParsedPacket) => void) => {
    if (!portRef.current || !portRef.current.readable) {
      throw new Error('Port not readable');
    }

    console.log('Starting stream...');
    await sendCommand('START');
    
    streamingRef.current = true;
    setStatus(prev => ({ ...prev, streaming: true }));

    // Create worker for parsing
    workerRef.current = new Worker(new URL('../../workers/serial.worker.ts', import.meta.url), { type: 'module' });
    
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'packets') {
        console.log('Received packets:', e.data.packets.length);
        e.data.packets.forEach((packet: ParsedPacket) => {
          onData(packet);
        });
        
        setStatus(prev => ({
          ...prev,
          sampleRate: prev.sampleRate || 250,
          totalPackets: prev.totalPackets + e.data.packets.length,
          droppedFrames: e.data.droppedFrames || prev.droppedFrames
        }));
      } else if (e.data.type === 'error') {
        console.error('Worker error:', e.data.error);
      }
    };

    // Read from serial port
    readerRef.current = portRef.current.readable.getReader();
    
    (async () => {
      try {
        console.log('Starting read loop...');
        while (streamingRef.current && readerRef.current) {
          const { value, done } = await readerRef.current.read();
          if (done) {
            console.log('Stream done');
            break;
          }
          
          console.log('Received data chunk:', value.length, 'bytes');
          
          // Send to worker for parsing
          if (workerRef.current) {
            workerRef.current.postMessage({ type: 'data', buffer: value });
          }
        }
      } catch (error) {
        console.error('Read error:', error);
      }
    })();
  }, [sendCommand]);

  const stopStream = useCallback(async () => {
    console.log('Stopping stream...');
    streamingRef.current = false;
    
    await sendCommand('STOP');
    
    if (readerRef.current) {
      try {
        await readerRef.current.cancel();
      } catch (e) {
        console.error('Error canceling reader:', e);
      }
      readerRef.current = null;
    }

    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
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
