import axios from 'axios';
import { getMockHotspotData, getMockRewards, getMockWitnesses } from './mockData';

const HELIUM_API = 'https://api.helium.io/v1';
const USE_MOCK_DATA = true; // Set to false when Helium API is working

export interface HotspotData {
  address: string;
  name: string;
  status: {
    online: string;
    listenAddrs: string[] | null;
  };
  geocode: {
    long: number;
    lat: number;
    city_id: string;
    short_street: string;
    short_state: string;
    short_country: string;
    short_city: string;
    long_street: string;
    long_state: string;
    long_country: string;
    long_city: string;
  };
  reward_scale: number;
  block: number;
  location?: string;
}

export interface HotspotRewards {
  total: number;
  sum: number;
  stddev: number;
  avg: number;
  median: number;
  min: number;
  max: number;
}

export async function getHotspotData(address: string): Promise<HotspotData> {
  if (USE_MOCK_DATA) {
    console.log('Using mock data for hotspot:', address);
    return getMockHotspotData(address);
  }
  
  try {
    const response = await axios.get(`${HELIUM_API}/hotspots/${address}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hotspot data, using mock:', error);
    return getMockHotspotData(address);
  }
}

export async function getHotspotRewards(
  address: string,
  days: number = 30
): Promise<number> {
  if (USE_MOCK_DATA) {
    return getMockRewards(address);
  }
  
  try {
    const minTime = new Date();
    minTime.setDate(minTime.getDate() - days);
    
    const response = await axios.get(
      `${HELIUM_API}/hotspots/${address}/rewards/sum`,
      { params: { min_time: minTime.toISOString() } }
    );
    
    return response.data.data.total || 0;
  } catch (error) {
    console.error('Error fetching hotspot rewards, using mock:', error);
    return getMockRewards(address);
  }
}

export async function getHotspotWitnesses(address: string): Promise<number> {
  if (USE_MOCK_DATA) {
    return getMockWitnesses(address);
  }
  
  try {
    const response = await axios.get(
      `${HELIUM_API}/hotspots/${address}/witnesses`
    );
    
    return response.data.data?.length || 0;
  } catch (error) {
    console.error('Error fetching hotspot witnesses, using mock:', error);
    return getMockWitnesses(address);
  }
}
