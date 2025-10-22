import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  PrivateKey,
} from '@hashgraph/sdk';

let client: Client | null = null;

export function getHederaClient(): Client {
  if (!client) {
    const accountId = process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY;

    if (!accountId || !privateKey) {
      throw new Error('Hedera credentials not configured');
    }

    client = Client.forTestnet();
    client.setOperator(accountId, PrivateKey.fromString(privateKey));
  }

  return client;
}

export async function createAnalysisTopic(): Promise<string> {
  try {
    const client = getHederaClient();
    
    const transaction = new TopicCreateTransaction()
      .setTopicMemo('DePIN Oracle Analysis Results')
      .setAdminKey(client.operatorPublicKey!);

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    return receipt.topicId!.toString();
  } catch (error) {
    console.error('Error creating Hedera topic:', error);
    throw new Error('Failed to create analysis topic');
  }
}

export async function storeAnalysis(
  topicId: string,
  analysis: any
): Promise<string> {
  try {
    const client = getHederaClient();
    
    const message = JSON.stringify({
      timestamp: Date.now(),
      analysis: analysis,
      version: '1.0',
    });

    const transaction = new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicId))
      .setMessage(message);

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    return response.transactionId.toString();
  } catch (error) {
    console.error('Error storing analysis on Hedera:', error);
    throw new Error('Failed to store analysis');
  }
}

export async function getStoredAnalysis(
  topicId: string,
  sequenceNumber: number
): Promise<any> {
  try {
    const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages/${sequenceNumber}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch from mirror node');
    }
    
    const data = await response.json();
    const messageContent = Buffer.from(data.message, 'base64').toString();
    
    return JSON.parse(messageContent);
  } catch (error) {
    console.error('Error retrieving stored analysis:', error);
    throw new Error('Failed to retrieve stored analysis');
  }
}
