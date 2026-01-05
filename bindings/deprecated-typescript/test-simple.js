const { KaleidoClient } = require('./dist/index.js');

const client = new KaleidoClient({
    baseUrl: 'http://localhost:9999',
    timeout: 2.0,
    maxRetries: 1,
    cacheTtl: 300
});

client.listPairs().then(() => {
    console.log('Success');
}).catch(err => {
    console.log('Error type:', typeof err);
    console.log('Error constructor:', err.constructor.name);
    console.log('Error message:', err.message);
    console.log('Error toString:', err.toString());
    console.log('Full error:', JSON.stringify(err, null, 2));
});
