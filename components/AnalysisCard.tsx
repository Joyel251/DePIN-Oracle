import type { DeviceAnalysis } from '@/lib/api/analyzer';
import { ExternalLink, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

interface AnalysisCardProps {
  analysis: DeviceAnalysis;
  txId?: string;
}

export function AnalysisCard({ analysis, txId }: AnalysisCardProps) {
  return (
    <div className="bg-white text-gray-900 rounded-lg p-6 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="font-bold text-xl">{analysis.device.name}</h3>
          <p className="text-sm text-gray-600">
            {analysis.device.location.city}, {analysis.device.location.state}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            analysis.risk.level === 'Low'
              ? 'bg-green-100 text-green-800'
              : analysis.risk.level === 'Medium'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          Risk: {analysis.risk.level}
        </span>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {analysis.device.status === 'Online' ? (
          <CheckCircle className="text-green-600" size={20} />
        ) : (
          <AlertTriangle className="text-red-600" size={20} />
        )}
        <span className="font-semibold">{analysis.device.status}</span>
      </div>

      {/* Performance Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricBox
          label="Monthly Earnings"
          value={`$${analysis.performance.monthlyEarningsUSD.toFixed(2)}`}
          subvalue={`${analysis.performance.monthlyEarningsHNT.toFixed(2)} HNT`}
        />
        <MetricBox
          label="ROI Period"
          value={`${analysis.valuation.roiMonths} months`}
          subvalue={`${analysis.valuation.roiYears} years`}
        />
        <MetricBox
          label="Annual Revenue"
          value={`$${analysis.performance.annualEarningsUSD.toFixed(2)}`}
        />
        <MetricBox
          label="Risk Score"
          value={`${analysis.risk.score}/10`}
          highlight={analysis.risk.score > 7}
        />
      </div>

      {/* Device Stats */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
        <div className="text-sm">
          <span className="font-semibold">Witnesses:</span> {analysis.device.witnesses}
        </div>
        <div className="text-sm">
          <span className="font-semibold">Transmit Scale:</span>{' '}
          {analysis.device.rewardScale.toFixed(2)}
        </div>
      </div>

      {/* 90-Day Prediction */}
      <div className="border-t pt-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={20} className="text-blue-600" />
          <h4 className="font-semibold">90-Day Revenue Prediction</h4>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <PredictionBox
            label="Conservative"
            value={`$${analysis.prediction.conservative.usd}`}
            subvalue={`${analysis.prediction.conservative.hnt} HNT`}
          />
          <PredictionBox
            label="Expected"
            value={`$${analysis.prediction.expected.usd}`}
            subvalue={`${analysis.prediction.expected.hnt} HNT`}
            highlight
          />
          <PredictionBox
            label="Optimistic"
            value={`$${analysis.prediction.optimistic.usd}`}
            subvalue={`${analysis.prediction.optimistic.hnt} HNT`}
          />
        </div>
      </div>

      {/* Risk Factors */}
      <div className="bg-gray-50 rounded-lg p-3">
        <h4 className="font-semibold mb-2 text-sm">Risk Factors:</h4>
        <ul className="space-y-1">
          {analysis.risk.factors.map((factor, idx) => (
            <li key={idx} className="text-sm">
              {factor}
            </li>
          ))}
        </ul>
      </div>

      {/* Recommendation */}
      <div
        className={`p-4 rounded-lg border-2 ${
          analysis.recommendation.action === 'BUY'
            ? 'bg-green-50 border-green-300'
            : analysis.recommendation.action === 'SELL'
            ? 'bg-red-50 border-red-300'
            : 'bg-blue-50 border-blue-300'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="font-bold text-lg">{analysis.recommendation.action}</span>
        </div>
        <p className="text-sm">{analysis.recommendation.reasoning}</p>
      </div>

      {/* Footer */}
      <div className="border-t pt-3 space-y-2">
        {txId && (
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>✓ Stored on Hedera:</span>
            <a
              href={`https://hashscan.io/testnet/transaction/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              {txId.substring(0, 20)}...
              <ExternalLink size={12} />
            </a>
          </div>
        )}
        <div className="text-xs text-gray-500">
          Price: ${analysis.priceData.hntPrice}/HNT • Source: {analysis.priceData.source} •
          Updated: {new Date(analysis.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
  subvalue,
  highlight,
}: {
  label: string;
  value: string;
  subvalue?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-red-50' : 'bg-gray-50'}`}>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-red-600' : ''}`}>{value}</div>
      {subvalue && <div className="text-xs text-gray-500 mt-1">{subvalue}</div>}
    </div>
  );
}

function PredictionBox({
  label,
  value,
  subvalue,
  highlight,
}: {
  label: string;
  value: string;
  subvalue?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded text-center ${
        highlight ? 'bg-blue-100 border-2 border-blue-400' : 'bg-gray-100'
      }`}
    >
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`font-bold ${highlight ? 'text-lg' : ''}`}>{value}</div>
      {subvalue && <div className="text-xs text-gray-500 mt-1">{subvalue}</div>}
    </div>
  );
}
