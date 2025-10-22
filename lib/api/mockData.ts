// Mock data for when Helium API is unavailable
export const MOCK_HOTSPOT_DATA: Record<string, any> = {
  '112qB3YaH5bZkCnKA5uRH7tBtGNv2Y5B4smv1jsmvGQ2228YBoFu': {
    address: '112qB3YaH5bZkCnKA5uRH7tBtGNv2Y5B4smv1jsmvGQ2228YBoFu',
    name: 'magnificent-lavender-condor',
    status: { online: 'online', listenAddrs: null },
    geocode: {
      long: -118.2437,
      lat: 34.0522,
      city_id: 'los-angeles',
      short_city: 'Los Angeles',
      short_state: 'CA',
      short_country: 'US',
      long_city: 'Los Angeles',
      long_state: 'California',
      long_country: 'United States',
    },
    reward_scale: 0.78,
    block: 1500000,
    rewards_30d: 45.8, // HNT
    witnesses: 22,
  },
  '112MHi1gvL6jNfLVk2fKMq3EJNW6R8SLmPThc9cD4fKsKqXDpQcQ': {
    address: '112MHi1gvL6jNfLVk2fKMq3EJNW6R8SLmPThc9cD4fKsKqXDpQcQ',
    name: 'steep-cobalt-mantis',
    status: { online: 'online', listenAddrs: null },
    geocode: {
      long: -73.935242,
      lat: 40.730610,
      city_id: 'new-york',
      short_city: 'New York',
      short_state: 'NY',
      short_country: 'US',
      long_city: 'New York',
      long_state: 'New York',
      long_country: 'United States',
    },
    reward_scale: 0.65,
    block: 1500000,
    rewards_30d: 38.2,
    witnesses: 18,
  },
  // Low performer example
  '112ABC': {
    address: '112ABC',
    name: 'rough-crimson-yak',
    status: { online: 'offline', listenAddrs: null },
    geocode: {
      long: -95.3698,
      lat: 29.7604,
      city_id: 'houston',
      short_city: 'Houston',
      short_state: 'TX',
      short_country: 'US',
      long_city: 'Houston',
      long_state: 'Texas',
      long_country: 'United States',
    },
    reward_scale: 0.42,
    block: 1500000,
    rewards_30d: 12.5,
    witnesses: 7,
  },
};

export function getMockHotspotData(address: string) {
  // Check exact match first
  if (MOCK_HOTSPOT_DATA[address]) {
    return MOCK_HOTSPOT_DATA[address];
  }
  
  // Return first mock data for any 112* address
  const firstMock = Object.values(MOCK_HOTSPOT_DATA)[0];
  return { ...firstMock, address };
}

export function getMockRewards(address: string): number {
  const hotspot = getMockHotspotData(address);
  return hotspot.rewards_30d || 35.0;
}

export function getMockWitnesses(address: string): number {
  const hotspot = getMockHotspotData(address);
  return hotspot.witnesses || 15;
}
