const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

// middleware
app.use(cors({
    origin: ["http://localhost:5173"]
}));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dios5i3.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const db = client.db("shop");
        const collection = db.collection("accounts");

        // GET
        app.get("/accounts", async (req, res) => {
            const result = await collection.find().toArray();
            res.send(result);
        });

        // POST
        app.post("/accounts", async (req, res) => {
            const result = await collection.insertOne(req.body);
            res.send(result);
        });

        // DELETE
        app.delete("/accounts/:id", async (req, res) => {
            const id = req.params.id;
            const result = await collection.deleteOne({
                _id: new ObjectId(id),
            });
            res.send(result);
        });

        // UPDATE
        app.patch("/accounts/:id", async (req, res) => {
            const id = req.params.id;

            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: req.body }
            );

            res.send(result);
        });

        console.log("✅ MongoDB Connected");
    } catch (error) {
        console.error(error);
    }
}

run();

// root route
app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});