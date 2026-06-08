import { MongoClient } from "mongodb";

// ✅ Always read from environment — never hardcode credentials
const url = process.env.MONGO_URI;
const dbName = "todo-app-db";

export const collectionName = "todo";

const client = new MongoClient(url);
let db;

export const connection = async () => {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
        console.log("Database connected successfully!");
    }
    return db;
};