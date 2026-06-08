import { MongoClient } from "mongodb";

// Cluster connection configurations rules parameter path string setup
const url = "mongodb://shaurya26:Shaurya_2602@ac-gm13zpy-shard-00-00.wiw5xgf.mongodb.net:27017,ac-gm13zpy-shard-00-01.wiw5xgf.mongodb.net:27017,ac-gm13zpy-shard-00-02.wiw5xgf.mongodb.net:27017/?ssl=true&replicaSet=atlas-979gyh-shard-0&authSource=admin&appName=TOSHAURYA";
const dbName = "todo-app-db"; // Database instance target bucket name identifier

export const collectionName = "todo";

const client = new MongoClient(url);

let db;

// Singleton logic to maintain single shared instance connection pools parameters
export const connection = async () => {
    if (!db) {
        await client.connect();
        db = client.db(dbName);
        // Console log confirmation debug check loop trace validation tracker
        console.log("Database connected successfully!"); 
    }
    return db;
};