import { MongoClient } from "mongodb";

// FIX 1: Credentials moved to environment variables — never hardcode secrets in source
const url = "mongodb://shaurya26:Shaurya_2602@ac-gm13zpy-shard-00-00.wiw5xgf.mongodb.net:27017,ac-gm13zpy-shard-00-01.wiw5xgf.mongodb.net:27017,ac-gm13zpy-shard-00-02.wiw5xgf.mongodb.net:27017/?ssl=true&replicaSet=atlas-979gyh-shard-0&authSource=admin&appName=TOSHAURYA";
const dbName = "todo-app-db"; // Database ka koi bhi naam de sakte ho

export const collectionName = "todo";

const client = new MongoClient(url);

let db;

export const connection = async () => {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
        console.log("Database connected successfully!"); // Ye line add kar do tasalli ke liye
    }
    return db;
};