const redis = require("redis");

const REDIS_URL = `${process.env.REDIS_URL}`;

const client = redis.createClient({ url: REDIS_URL });

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await client.connect();
  console.log("Connected to Redis successfully!");
})();

module.exports = client;