import { PriceServiceConnection } from '@pythnetwork/price-service-client';

const connection = new PriceServiceConnection(
  process.env.PYTH_API_URL || 'https://hermes.pyth.network'
);

// DePIN token price feed IDs (Pyth Network)
export const PRICE_FEEDS: Record<string, string> = {
  HNT: '0x4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc',
  MOBILE: '0x0', // Placeholder - need actual feed ID
  IOT: '0x0', // Placeholder - need actual feed ID
  FIL: '0x150ac9b959aee0051e4091f0ef5216d941f590e1c5e7f91cf7635b5c11628c0e',
  ETH: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  BTC: '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
};

export async function getTokenPrice(symbol: string): Promise<number> {
  try {
    const priceId = PRICE_FEEDS[symbol.toUpperCase()];
    
    if (!priceId || priceId === '0x0') {
      console.warn(`Price feed not available for ${symbol}, using mock data`);
      // Mock prices for tokens without feeds
      const mockPrices: Record<string, number> = {
        HNT: 4.85,
        MOBILE: 0.0012,
        IOT: 0.0008,
      };
      return mockPrices[symbol.toUpperCase()] || 1;
    }
    
    const priceFeeds = await connection.getLatestPriceFeeds([priceId]);
    const price = priceFeeds[0]?.getPriceUnchecked();
    
    if (!price) {
      throw new Error(`No price data for ${symbol}`);
    }
    
    // Convert price (Pyth uses 8 decimals)
    return Number(price.price) / Math.pow(10, Math.abs(price.expo));
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    throw new Error(`Failed to fetch price for ${symbol}`);
  }
}

export async function calculateUSDValue(
  tokenAmount: number,
  symbol: string
): Promise<number> {
  const price = await getTokenPrice(symbol);
  return tokenAmount * price;
}

export async function getMultiplePrices(
  symbols: string[]
): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  
  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        prices[symbol] = await getTokenPrice(symbol);
      } catch (error) {
        console.error(`Failed to get price for ${symbol}:`, error);
        prices[symbol] = 0;
      }
    })
  );
  
  return prices;
}
