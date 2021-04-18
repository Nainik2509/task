const redis = require("redis");
const { promisify } = require("util");
const { redisHost, redisPort } = require("./env-vars");
const logger = require("./logger");

const client = redis.createClient({
  host: redisHost,
  port: redisPort
});

client.on("connect", () => logger.info("Backup engine is Running"));
client.on("error", err =>
  logger.error(`Error checking Redis backup engine ${err}`)
);
exports.TTGet = promisify(client.get).bind(client);
exports.TTSet = promisify(client.setex).bind(client);

exports.RedisClient = () => client;
