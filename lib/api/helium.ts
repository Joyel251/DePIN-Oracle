import axios from 'axios';

const HELIUM_API = 'https://api.helium.io/v1';

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
  try {
    const response = await axios.get(`${HELIUM_API}/hotspots/${address}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching hotspot data:', error);
    throw new Error('Failed to fetch hotspot data');
  }
}

export async function getHotspotRewards(
  address: string,
  days: number = 30
): Promise<number> {
  try {
    const minTime = new Date();
    minTime.setDate(minTime.getDate() - days);
    
    const response = await axios.get(
      `${HELIUM_API}/hotspots/${address}/rewards/sum`,
      { params: { min_time: minTime.toISOString() } }
    );
    
    return response.data.data.total || 0;
  } catch (error) {
    console.error('Error fetching hotspot rewards:', error);
    return 0;
  }
}

export async function getHotspotWitnesses(address: string): Promise<number> {
  try {
    const response = await axios.get(
      `${HELIUM_API}/hotspots/${address}/witnesses`
    );
    
    return response.data.data?.length || 0;
  } catch (error) {
    console.error('Error fetching hotspot witnesses:', error);
    return 0;
  }
}
