import { KaleidoClient } from '../src/client';

const baseUrl = process.env.KALEIDO_API_URL || 'https://api.staging.kaleidoswap.com/api/v1';

function logSection(title: string) {
  console.log(`\n=== ${title} ===`);
}

function printError(error: any) {
  logSection('Error Summary');
  console.log('Name:', error?.name);
  console.log('Message:', error?.message);
  if (error?.statusCode) {
    console.log('Status Code:', error.statusCode);
  }

  if (!error?.response) {
    console.log('No response payload from server.');
    return;
  }

  logSection('Server Response');
  try {
    const parsed = JSON.parse(error.response);
    console.log('Detail:', parsed.detail || parsed.message || parsed.error);
    console.log('Raw:', parsed);
  } catch {
    console.log('Raw:', error.response);
  }
}

async function runInvalidQuote() {
  const client = new KaleidoClient({ baseUrl });

  try {
    await client.quoteRequest('INVALID_ASSET', 'ANOTHER_INVALID', 100_000_000);
    console.log('Unexpected success: the quote should have failed.');
  } catch (error) {
    printError(error);
  }
}

async function runMissingNodeCall() {
  const client = new KaleidoClient({ baseUrl });

  try {
    await client.getNodeInfo();
    console.log('Unexpected success: node info should require nodeUrl.');
  } catch (error) {
    printError(error);
  }
}

async function main() {
  logSection('Invalid Quote Test');
  await runInvalidQuote();

  logSection('Missing Node Configuration Test');
  await runMissingNodeCall();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Unhandled script error:', error);
  });
}
