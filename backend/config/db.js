const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'amules';

let client;
let database = null;

async function connectDB() {
  if (database) return database;
  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });
    await client.connect();
    console.log(`[MongoDB] Connected successfully to database: ${DB_NAME}`);
    database = client.db(DB_NAME);
    return database;
  } catch (error) {
    console.warn(`[MongoDB] Could not connect to ${MONGODB_URI}: ${error.message}. AMULES Backend running in JSON File Database mode (amules-database/*.json).`);
    database = null;
    return null;
  }
}

function getDB() {
  return database || null;
}

function isDBConnected() {
  return !!database;
}

module.exports = {
  connectDB,
  getDB,
  isDBConnected,
  ObjectId
};
