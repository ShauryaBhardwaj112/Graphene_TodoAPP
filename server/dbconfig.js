import { MongoClient } from "mongodb";

const dbName = "todo-app-db";
export const collectionName = "todo";

let db;
let client; // global scope placeholder

export const connection = async () => {
    if (!db) {
        // BUG 2 FIX: Instantiation happens only inside connection invoking timeline safely
        client = new MongoClient(process.env.MONGO_URI);
        await client.connect();
        db = client.db(dbName);
        console.log("Database connected successfully!");
    }
    return db;
};