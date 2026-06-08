import "dotenv/config"; // Yeh line sabse upar honi chahiye
import e from "express";
import { collectionName, connection } from "./dbconfig.js";
import cors from "cors";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const app = e();
const JWT_SECRET = process.env.JWT_SECRET || "Google";

app.use(e.json());
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
app.use(cookieParser());

// ─── MIDDLEWARE FOR SECURITY ────────────────────────────────────────────────
function verifyJWTToken(req, resp, next) {
    const token = req.cookies["token"];
    if (!token) {
        return resp.status(401).send({ success: false, msg: "No token provided" });
    }
    jwt.verify(token, JWT_SECRET, (error, decoded) => {
        if (error) {
            return resp.status(401).send({ success: false, msg: "Invalid or expired token" });
        }
        req.user = decoded; // Isme user ka email encoded hota hai
        next();
    });
}

// ─── AUTH ROUTES ────────────────────────────────────────────────────────────
app.post("/login", async (req, resp) => {
    try {
        const userData = req.body;
        if (!userData.email || !userData.password) {
            return resp.send({ success: false, msg: "Email and password are required" });
        }
        const db = await connection();
        const collection = db.collection("users");
        const result = await collection.findOne({ email: userData.email, password: userData.password });
        if (!result) {
            return resp.send({ success: false, msg: "Invalid email or password" });
        }
        jwt.sign({ email: userData.email }, JWT_SECRET, { expiresIn: "5d" }, (error, token) => {
            if (error) return resp.send({ success: false, msg: "Token generation failed" });
            resp.cookie("token", token, { httpOnly: true, maxAge: 5 * 24 * 60 * 60 * 1000 });
            resp.send({ success: true, msg: "Login successful", token });
        });
    } catch (err) {
        resp.send({ success: false, msg: "Server error: " + err.message });
    }
});

app.post("/signup", async (req, resp) => {
    try {
        const userData = req.body;
        if (!userData.email || !userData.password) {
            return resp.send({ success: false, msg: "Email and password are required" });
        }
        const db = await connection();
        const collection = db.collection("users");
        const existing = await collection.findOne({ email: userData.email });
        if (existing) return resp.send({ success: false, msg: "Email already registered" });
        
        const result = await collection.insertOne(userData);
        if (!result.insertedId) return resp.send({ success: false, msg: "Signup failed" });
        
        jwt.sign({ email: userData.email }, JWT_SECRET, { expiresIn: "5d" }, (error, token) => {
            if (error) return resp.send({ success: false, msg: "Token generation failed" });
           resp.cookie("token", token, {httpOnly: true,secure: true,  // Required for sameSite: 'none'
           sameSite: 'none',       // Required for cross-origin requests
           maxAge: 5 * 24 * 60 * 60 * 1000 });
            resp.send({ success: true, msg: "Signup successful", token });
        });
    } catch (err) {
        resp.send({ success: false, msg: "Server error: " + err.message });
    }
});

// ─── SECURE TASK ROUTES ──────────────────────────────────────────────────────

// 1. Task Add karte waqt userEmail attach karna
app.post("/add-task", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        
        const taskData = {
            ...req.body,
            userEmail: req.user.email, // Multi-User Isolation
            status: req.body.status || "active"
        };
        
        const result = await collection.insertOne(taskData);
        if (result.insertedId) {
            resp.send({ success: true, message: "New task added", result });
        } else {
            resp.send({ success: false, message: "Task not added" });
        }
    } catch (err) {
        resp.send({ success: false, message: "Server error: " + err.message });
    }
});

// 2. Sirf logged-in user ke tasks fetch karna + Newest First Sorting
app.get("/tasks", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        
        // Isolation: { userEmail: req.user.email } 
        // Sorting: sort({ _id: -1 }) se naye tasks upar aate hain
        const result = await collection
            .find({ userEmail: req.user.email })
            .sort({ _id: -1 })
            .toArray();
            
        resp.send({ success: true, message: "Task list fetched", result });
    } catch (err) {
        resp.send({ success: false, message: "Server error: " + err.message });
    }
});

// 3. Single Task Fetch (Editing Ke Liye Data Populate Karne)
app.get("/task/:id", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        
        const result = await collection.findOne({ 
            _id: new ObjectId(req.params.id), 
            userEmail: req.user.email // Suraksha check
        });
        
        if (result) {
            resp.send({ success: true, message: "Task fetched", result });
        } else {
            resp.send({ success: false, message: "Task not found or unauthorized" });
        }
    } catch (err) {
        resp.send({ success: false, message: "Server error: " + err.message });
    }
});

// 4. Secure Update Endpoint

app.put("/update-task/:id", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        const { _id, ...fields } = req.body;
        
        // Use req.params.id from URL (more reliable than body _id)
        const taskId = req.params.id || _id;

        const result = await collection.updateOne(
            { _id: new ObjectId(taskId), userEmail: req.user.email },
            { $set: fields }
        );
        if (result.matchedCount > 0) {
            resp.send({ success: true, message: "Task updated", result });
        } else {
            resp.send({ success: false, message: "Task not found or unauthorized" });
        }
    } catch (err) {
        resp.send({ success: false, message: "Server error: " + err.message });
    }
});

// 5. Secure Delete Endpoint
app.delete("/delete/:id", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        
        const result = await collection.deleteOne({ 
            _id: new ObjectId(req.params.id), 
            userEmail: req.user.email 
        });
        
        if (result.deletedCount > 0) {
            resp.send({ success: true, message: "Task deleted", result });
        } else {
            resp.send({ success: false, message: "Task not found or unauthorized" });
        }
    } catch (err) {
        resp.send({ success: false, message: "Server error: " + err.message });
    }
});

// 6. Secure Multiple Delete
app.delete("/delete-multiple", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const Ids = req.body;
        if (!Array.isArray(Ids) || Ids.length === 0) {
            return resp.send({ success: false, message: "No IDs provided" });
        }
        const deleteTaskIds = Ids.map((item) => new ObjectId(item));
        const collection = db.collection(collectionName);
        
        const result = await collection.deleteMany({ 
            _id: { $in: deleteTaskIds }, 
            userEmail: req.user.email 
        });
        resp.send({ success: true, message: "Tasks deleted", result });
    } catch (err) {
        resp.send({ success: false, message: "Server error: " + err.message });
    }
});

const PORT = process.env.PORT || 3200;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});