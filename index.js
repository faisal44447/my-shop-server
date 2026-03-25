const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dios5i3.mongodb.net/shop?retryWrites=true&w=majority`;

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

        const collection = client.db("shop").collection("accounts");

        app.get("/accounts", async (req, res) => {
            const result = await collection.find().toArray();
            res.send(result);
        });

        app.post("/accounts", async (req, res) => {
            const data = req.body;

            if (!data.date) {
                data.date = new Date().toISOString();
            }

            const result = await collection.insertOne(data);
            res.send(result);
        });

        app.delete("/accounts/:id", async (req, res) => {
            const id = req.params.id;
            const result = await collection.deleteOne({
                _id: new ObjectId(id),
            });
            res.send(result);
        });

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

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});