import { getHotspotData, getHotspotRewards, getHotspotWitnesses } from './helium';
import { getTokenPrice, calculateUSDValue } from './pyth';
import { storeAnalysis } from './hedera';

export interface DeviceAnalysis {
  device: {
    address: string;
    name: string;
    status: string;
    location: {
      lat: number;
      lng: number;
      city: string;
      state: string;
    };
    witnesses: number;
    rewardScale: number;
    network: string;
  };
  performance: {
    monthlyEarningsHNT: number;
    monthlyEarningsUSD: number;
    annualEarningsUSD: number;
    avgDailyHNT: number;
  };
  valuation: {
    hardwareCost: number;
    roiMonths: string;
    roiYears: string;
  };
  prediction: {
    conservative: { hnt: string; usd: string };
    expected: { hnt: string; usd: string };
    optimistic: { hnt: string; usd: string };
  };
  risk: {
    score: number;
    level: string;
    factors: string[];
  };
  recommendation: {
    action: string;
    reasoning: string;
  };
  timestamp: string;
  priceData: {
    hntPrice: string;
    source: string;
  };
}

export async function analyzeHeliumHotspot(
  address: string,
  topicId?: string
): Promise<{ analysis: DeviceAnalysis; txId?: string }> {
  try {
    // Fetch all data in parallel
    const [hotspot, rewards, witnesses] = await Promise.all([
      getHotspotData(address),
      getHotspotRewards(address, 30),
      getHotspotWitnesses(address),
    ]);

    // Get current HNT price from Pyth
    const hntPrice = await getTokenPrice('HNT');

    // Calculate metrics
    const monthlyEarningsHNT = rewards;
    const monthlyEarningsUSD = await calculateUSDValue(monthlyEarningsHNT, 'HNT');
    const annualEarningsUSD = monthlyEarningsUSD * 12;

    const hardwareCost = 400; // Average hotspot cost
    const roiMonths = monthlyEarningsUSD > 0 ? hardwareCost / monthlyEarningsUSD : 999;

    // Risk scoring (0-10, lower is better)
    let riskScore = 5; // Base score

    const isOnline = hotspot.status?.online === 'online';
    if (!isOnline) riskScore += 3;
    if (hotspot.reward_scale < 0.5) riskScore += 2;
    if (hotspot.reward_scale < 0.7) riskScore += 1;
    if (witnesses < 10) riskScore += 1;
    if (witnesses > 20) riskScore -= 1;
    if (hotspot.reward_scale > 0.8) riskScore -= 1;

    riskScore = Math.max(0, Math.min(10, riskScore));

    // 90-day prediction
    const avgDailyHNT = monthlyEarningsHNT / 30;
    const prediction = {
      conservative: avgDailyHNT * 90 * 0.8,
      expected: avgDailyHNT * 90,
      optimistic: avgDailyHNT * 90 * 1.2,
    };

    // Generate recommendation
    let recommendation = 'HOLD';
    if (riskScore > 7) recommendation = 'SELL';
    if (riskScore < 3 && roiMonths < 12) recommendation = 'BUY';

    const analysis: DeviceAnalysis = {
      device: {
        address,
        name: hotspot.name || 'Unknown',
        status: isOnline ? 'Online' : 'Offline',
        location: {
          lat: hotspot.geocode?.lat || 0,
          lng: hotspot.geocode?.long || 0,
          city: hotspot.geocode?.short_city || 'Unknown',
          state: hotspot.geocode?.short_state || 'Unknown',
        },
        witnesses,
        rewardScale: hotspot.reward_scale || 0,
        network: 'Helium',
      },
      performance: {
        monthlyEarningsHNT,
        monthlyEarningsUSD,
        annualEarningsUSD,
        avgDailyHNT,
      },
      valuation: {
        hardwareCost,
        roiMonths: roiMonths.toFixed(1),
        roiYears: (roiMonths / 12).toFixed(1),
      },
      prediction: {
        conservative: {
          hnt: prediction.conservative.toFixed(2),
          usd: (prediction.conservative * hntPrice).toFixed(2),
        },
        expected: {
          hnt: prediction.expected.toFixed(2),
          usd: (prediction.expected * hntPrice).toFixed(2),
        },
        optimistic: {
          hnt: prediction.optimistic.toFixed(2),
          usd: (prediction.optimistic * hntPrice).toFixed(2),
        },
      },
      risk: {
        score: riskScore,
        level: riskScore < 4 ? 'Low' : riskScore < 7 ? 'Medium' : 'High',
        factors: [
          isOnline ? '✅ Device online' : '❌ Device offline',
          `${witnesses} witnesses (${witnesses > 15 ? 'Good' : 'Low'})`,
          `Transmit scale: ${hotspot.reward_scale.toFixed(2)} (${
            hotspot.reward_scale > 0.7 ? 'Good' : 'Poor'
          })`,
        ],
      },
      recommendation: {
        action: recommendation,
        reasoning: generateReasoning(riskScore, roiMonths, witnesses, hotspot.reward_scale),
      },
      timestamp: new Date().toISOString(),
      priceData: {
        hntPrice: hntPrice.toFixed(4),
        source: 'Pyth Network',
      },
    };

    // Store on Hedera if topic ID provided
    let txId: string | undefined;
    if (topicId) {
      try {
        txId = await storeAnalysis(topicId, analysis);
      } catch (error) {
        console.error('Failed to store on Hedera, continuing anyway:', error);
      }
    }

    return { analysis, txId };
  } catch (error) {
    console.error('Error analyzing hotspot:', error);
    throw new Error('Failed to analyze hotspot');
  }
}

function generateReasoning(
  risk: number,
  roi: number,
  witnesses: number,
  rewardScale: number
): string {
  if (risk > 7) {
    return 'High risk detected. Device may be offline or in poor location. Consider selling or relocating.';
  }

  if (risk < 3 && roi < 12) {
    return 'Excellent performer with quick ROI. Strong buy signal if available.';
  }

  if (witnesses < 10) {
    return 'Limited witness density may impact earnings. Monitor closely for changes.';
  }

  if (rewardScale < 0.5) {
    return 'Low transmit scale significantly reducing rewards. Consider relocation.';
  }

  return 'Device performing at network average. Hold for steady passive income.';
}
