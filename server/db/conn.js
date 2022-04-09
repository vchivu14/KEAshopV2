const MongoClient = require("mongodb").MongoClient;

let _db;

const dbUrl = process.env.DB_LOCAL_URL;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;

const uri = `mongodb://${dbUser}:${dbPass}@${dbUrl}`;

const client = new MongoClient(uri);

async function connect() {
    try {
        return await client.connect();
    } catch (error) {
        throw new Error("Could not connect to MongoDB instance");
    }
}

async function get(db) {
    connect();
    return _db ? _db : await client.db(db);
}

async function close() {
    if (_db) {
        console.log("Closing MongoDB connection");
        _db.close();
    }
}

module.exports = {
    close,
    get
}