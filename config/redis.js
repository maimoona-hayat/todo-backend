const redis = require("redis");

const REDIS_URL = `redis://default:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

const client = redis.createClient({ url: REDIS_URL });

client.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await client.connect();
  console.log("Connected to Redis successfully!");
})();

module.exports = client;