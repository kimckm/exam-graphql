const redis = require('redis');
const { promisify } = require("util");

const client = redis.createClient({
  host: '8.135.66.238',
  password: 'abc123',
});

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const saddAsync = promisify(client.sadd).bind(client);
const srandmemberAsync = promisify(client.srandmember).bind(client);

const mod = {
  cache: (key, action, ex = 300) => {
    // 是否需要刷新缓存
    let flushFlag = false;
    return getAsync(key)
      .then(cacheValue => {
        if (cacheValue) {
          return JSON.parse(cacheValue);
        }

        flushFlag = true;
        return action();
      })
      .then(value => {
        if (flushFlag) {
          setAsync(key, JSON.stringify(value), 'ex', ex);
        }
        return value;
      })
      .catch(console.error);
  },
  cacheSadd: saddAsync,
  cacheSrandmember: srandmemberAsync,
  expire: client.expire,
};

module.exports = mod;
