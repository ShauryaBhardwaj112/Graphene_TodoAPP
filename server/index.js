import "dotenv/config"; // Must stay at the very top
import e from "express";
import { collectionName, connection } from "./dbconfig.js";
import cors from "cors";
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import bcrypt from 'bcrypt';

const app = e();

// BUG 3 FIX: Fail loudly at startup if JWT_SECRET is missing
if (!process.env.JWT_SECRET) {
    throw new Error("FATAL: JWT_SECRET environment variable is not set.");
}
const JWT_SECRET = process.env.JWT_SECRET;

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
        req.user = decoded; // Contains encoded user email sequence mapping
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

        // BUG 4 FIX (Part 1 - Login Verification): Find user record and securely verify hash
        const user = await collection.findOne({ email: userData.email });
        if (!user) {
            return resp.send({ success: false, msg: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(userData.password, user.password);
        if (!isPasswordValid) {
            return resp.send({ success: false, msg: "Invalid email or password" });
        }

        jwt.sign({ email: userData.email }, JWT_SECRET, { expiresIn: "5d" }, (error, token) => {
            if (error) return resp.send({ success: false, msg: "Token generation failed" });
            
            // Production Cross-Origin Cookie Specs Configuration Matrix
            resp.cookie("token", token, { 
                httpOnly: true, 
                secure: true, 
                sameSite: 'none', 
                maxAge: 5 * 24 * 60 * 60 * 1000 
            });
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
        
        // BUG 4 FIX (Part 2 - Secure Ingestion): Salt and hash plain text credentials before database storage
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        const result = await collection.insertOne({ 
            ...userData, 
            password: hashedPassword 
        });
        
        if (!result.insertedId) return resp.send({ success: false, msg: "Signup failed" });
        
        jwt.sign({ email: userData.email }, JWT_SECRET, { expiresIn: "5d" }, (error, token) => {
            if (error) return resp.send({ success: false, msg: "Token generation failed" });
            
            resp.cookie("token", token, {
                httpOnly: true,
                secure: true,   // Required for sameSite: 'none' in production layouts
                sameSite: 'none', // Required for cross-origin tracking pipelines
                maxAge: 5 * 24 * 60 * 60 * 1000 
            });
            resp.send({ success: true, msg: "Signup successful", token });
        });
    } catch (err) {
        resp.send({ success: false, msg: "Server error: " + err.message });
    }
});

// ─── LOGOUT ROUTE (BUG 6 FIX) ───────────────────────────────────────────────
app.post("/logout", (req, resp) => {
    try {
        // Cookie ko clear karne ke liye clearCookie use karein with identical configuration tags
        resp.clearCookie("token", {
            httpOnly: true,
            secure: true,   // Cross-origin setups over HTTPS requires secure attribute
            sameSite: 'none' // Mandatory cross-site tracking allowance configuration 
        });
        resp.send({ success: true, msg: "Logged out successfully" });
    } catch (err) {
        resp.send({ success: false, msg: "Logout error: " + err.message });
    }
});

// ─── SECURE TASK ROUTES ──────────────────────────────────────────────────────

app.post("/add-task", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        
        const taskData = {
            ...req.body,
            userEmail: req.user.email, // Multi-User Isolation Guard
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

app.get("/tasks", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        
        // Isolation constraint enforcement sequence sorted descending
        const result = await collection
            .find({ userEmail: req.user.email })
            .sort({ _id: -1 })
            .toArray();
            
        resp.send({ success: true, message: "Task list fetched", result });
    } catch (err) {
        resp.send({ success: false, message: "Server error: " + err.message });
    }
});

app.get("/task/:id", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        
        const result = await collection.findOne({ 
            _id: new ObjectId(req.params.id), 
            userEmail: req.user.email 
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

app.put("/update-task/:id", verifyJWTToken, async (req, resp) => {
    try {
        const db = await connection();
        const collection = db.collection(collectionName);
        const { _id, ...fields } = req.body;
        
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

app.delete("/delete-multiple", verifyJWTToken, async (req, resp) => {
    try {
        const Ids = req.body;
        
        // BUG 7 FIX: Validate client parameters first before spinning up database connections
        if (!Array.isArray(Ids) || Ids.length === 0) {
            return resp.send({ success: false, message: "No IDs provided" });
        }

        const db = await connection();
        const collection = db.collection(collectionName);
        const deleteTaskIds = Ids.map((item) => new ObjectId(item));
        
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