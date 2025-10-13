import { KaleidoClient } from '../src/client';

async function testError() {
  const client = new KaleidoClient({
    baseUrl: 'https://api.staging.kaleidoswap.com/api/v1'
  });

  try {
    // Try to get a quote with invalid asset
    const quote = await client.quoteRequest(
      'INVALID_ASSET',
      'ANOTHER_INVALID',
      100000000
    );
    console.log('Quote:', quote);
  } catch (error: any) {
    console.log('\n=== Error Information ===');
    console.log('Error Name:', error.name);
    console.log('Error Message:', error.message);
    console.log('Status Code:', error.statusCode);
    console.log('\n=== Response from Server ===');
    if (error.response) {
      try {
        const parsed = JSON.parse(error.response);
        console.log('Detail:', parsed.detail || parsed.message || parsed.error);
        console.log('Full Response:', parsed);
      } catch {
        console.log('Raw Response:', error.response);
      }
    } else {
      console.log('No response data');
    }
  }
}

testError().catch(console.error);
