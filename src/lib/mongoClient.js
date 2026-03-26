const { MongoClient } = require("mongodb");

function getMongoUri() {
  // Important sur Windows : certains systèmes résolvent `localhost` en `::1` (IPv6),
  // alors que mongod écoute uniquement sur 127.0.0.1.
  return process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
}

async function getClient() {
  // Connexion partagée pour éviter de recréer un pool à chaque requête
  if (global._tp7_mongo_client) return global._tp7_mongo_client;

  const uri = getMongoUri();
  const client = new MongoClient(uri, {
    // Permet d'échouer vite si Mongo n'est pas joignable
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  });
  await client.connect();
  global._tp7_mongo_client = client;
  return client;
}

module.exports = { getClient };

