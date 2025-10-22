'use client';

import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { AnalysisCard } from './AnalysisCard';
import type { DeviceAnalysis } from '@/lib/api/analyzer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  analysis?: DeviceAnalysis;
  txId?: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I can analyze any DePIN device in 30 seconds. Try:\n\n• "Analyze Helium hotspot 112..."\n• "What\'s the ROI on this device?"\n• "Show me the risk score"',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Step 1: Send to AI agent for intent detection
      const agentResponse = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const agentData = await agentResponse.json();

      if (!agentResponse.ok) {
        throw new Error(agentData.error || 'Agent processing failed');
      }

      // Show agent's initial response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: agentData.response,
        },
      ]);

      // Step 2: If intent is to analyze, proceed with analysis
      if (agentData.intent === 'analyze_device' && agentData.extractedData.deviceAddress) {
        const address = agentData.extractedData.deviceAddress;

        // Call analysis API
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address,
            network: 'helium',
            topicId: process.env.NEXT_PUBLIC_HEDERA_TOPIC_ID,
          }),
        });

        const analysisData = await analysisResponse.json();

        if (!analysisResponse.ok) {
          throw new Error(analysisData.error || 'Analysis failed');
        }

        // Add analysis results
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '✅ Analysis complete! Here\'s what I found:',
            analysis: analysisData.analysis,
            txId: analysisData.txId,
          },
        ]);
      }
    } catch (error: any) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Sorry, I encountered an error: ${error.message}\n\nPlease try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-4">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-lg p-4 flex items-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Analyzing device...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask me about any DePIN device..."
          disabled={loading}
          className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-100'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>

        {/* Show analysis if available */}
        {message.analysis && (
          <div className="mt-4">
            <AnalysisCard analysis={message.analysis} txId={message.txId} />
          </div>
        )}
      </div>
    </div>
  );
}
