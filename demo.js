const redis = require('redis');

const client = redis.createClient({
  host: '8.135.66.238',
  password: 'abc123',
});

client.keys('*', console.log);

// client.sadd('exam::1', '174789378048', console.log);
