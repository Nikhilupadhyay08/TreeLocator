import { useEffect, useState } from 'react';
import { setBaseUrl } from '@/api';

export interface IotSensor {
  id: number;
  treeCode: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  alertGenerated?: string | null;
  recordedAt: string;
}

/**
 * Fetch IoT sensor data for a specific tree
 */
export async function fetchTreeIotData(treeCode: string): Promise<IotSensor[]> {
  const response = await fetch(`/api/iot/${treeCode}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch IoT data for tree ${treeCode}`);
  }
  return response.json();
}

/**
 * Hook to fetch and poll IoT sensor data for a tree
 */
export function useTreeIotData(treeCode: string | null, pollInterval = 5000) {
  const [data, setData] = useState<IotSensor[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!treeCode) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetchTreeIotData(treeCode);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, pollInterval);

    return () => clearInterval(interval);
  }, [treeCode, pollInterval]);

  return { data, loading, error };
}

/**
 * Hook to fetch IoT data for multiple trees and aggregate them
 */
export function useMultipleTreeIotData(treeCodes: string[], pollInterval = 5000) {
  const [allData, setAllData] = useState<Record<string, IotSensor[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (treeCodes.length === 0) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const results: Record<string, IotSensor[]> = {};
        await Promise.all(
          treeCodes.map(async (code) => {
            try {
              results[code] = await fetchTreeIotData(code);
            } catch (err) {
              console.error(`Failed to fetch IoT data for ${code}:`, err);
            }
          })
        );
        setAllData(results);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
    const interval = setInterval(fetchAllData, pollInterval);

    return () => clearInterval(interval);
  }, [treeCodes, pollInterval]);

  return { data: allData, loading, error };
}

/**
 * Submit new IoT sensor reading
 */
export async function submitIotReading(
  treeCode: string,
  data: {
    soilMoisture: number;
    temperature: number;
    humidity: number;
  }
): Promise<IotSensor> {
  const response = await fetch(`/api/iot/${treeCode}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Failed to submit IoT reading for tree ${treeCode}`);
  }

  return response.json();
}
