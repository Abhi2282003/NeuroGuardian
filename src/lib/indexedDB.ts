import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface EEGDatabase extends DBSchema {
  recordings: {
    key: string;
    value: {
      id: string;
      name: string;
      data: { timestamp: number; channels: number[] }[];
      duration: number;
      channels: number;
      sampleRate: number;
      createdAt: number;
    };
  };
}

let dbInstance: IDBPDatabase<EEGDatabase> | null = null;

export async function getDB() {
  if (!dbInstance) {
    dbInstance = await openDB<EEGDatabase>('eeg-recordings', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('recordings')) {
          db.createObjectStore('recordings', { keyPath: 'id' });
        }
      },
    });
  }
  return dbInstance;
}

export async function saveRecording(
  data: { timestamp: number; channels: number[] }[],
  name: string,
  channels: number,
  sampleRate: number
) {
  const db = await getDB();
  const id = `rec_${Date.now()}`;
  const duration = data.length / sampleRate;

  await db.add('recordings', {
    id,
    name,
    data,
    duration,
    channels,
    sampleRate,
    createdAt: Date.now(),
  });

  return id;
}

export async function getRecording(id: string) {
  const db = await getDB();
  return await db.get('recordings', id);
}

export async function getAllRecordings() {
  const db = await getDB();
  return await db.getAll('recordings');
}

export async function deleteRecording(id: string) {
  const db = await getDB();
  await db.delete('recordings', id);
}

export async function deleteAllRecordings() {
  const db = await getDB();
  await db.clear('recordings');
}

export function convertToCSV(
  data: { timestamp: number; channels: number[] }[],
  channels: number
): string {
  const headers = ['Timestamp', ...Array.from({ length: channels }, (_, i) => `Ch${i + 1}`)];
  const rows = data.map((row) => [row.timestamp, ...row.channels].join(','));
  return [headers.join(','), ...rows].join('\n');
}
