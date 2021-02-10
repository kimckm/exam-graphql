const redis = require('redis');

const client = redis.createClient({
  host: '8.135.66.238',
  password: 'abc123',
});

client.keys('*', console.log);

client.get('question::1501708288', console.log)
