import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4">
            🔮 DePIN Oracle
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            AI agent for DePIN: 30s device analysis with live prices and on-chain proof
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <span>Powered by:</span>
            <span className="bg-gray-800 px-3 py-1 rounded">ASI Alliance</span>
            <span className="bg-gray-800 px-3 py-1 rounded">Pyth Network</span>
            <span className="bg-gray-800 px-3 py-1 rounded">Hedera</span>
          </div>
        </div>
        
        <ChatInterface />
      </div>
    </main>
  );
}
