const redis = require('redis');

const client = redis.createClient({
  host: '8.135.66.238',
  password: 'abc123',
});

client.keys('*', redis.print);
// Set数据类型操作
client.smembers('exam::520748154880', redis.print);
// client.expire('exam::520748154880', 60);
client.ttl('exam::520748154880', redis.print);
// client.del('exam::520748154880', (err, reply) => console.log(reply));

client.quit();
// client.sadd('exam::1', '174789378048', console.log);
