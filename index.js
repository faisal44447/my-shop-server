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

        const accountCollection = client.db("shop").collection("accounts");
        const productCollection = client.db("shop").collection("products");

        // 🔥 ACCOUNTS
        app.get("/accounts", async (req, res) => {
            res.send(await accountCollection.find().toArray());
        });

        app.post("/accounts", async (req, res) => {
            const data = req.body;
            if (!data.date) data.date = new Date().toISOString();
            res.send(await accountCollection.insertOne(data));
        });

        app.delete("/accounts/:id", async (req, res) => {
            res.send(await accountCollection.deleteOne({
                _id: new ObjectId(req.params.id)
            }));
        });

        app.patch("/accounts/:id", async (req, res) => {
            res.send(await accountCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: req.body }
            ));
        });

        // ✅ PRODUCTS (FIXED)
        app.get("/products", async (req, res) => {
            try {
                const result = await productCollection.find().toArray();
                res.send(result);
            } catch (err) {
                console.log(err);
                res.status(500).send("Error fetching products");
            }
        });

        app.get("/products/:id", async (req, res) => {
            try {
                const result = await productCollection.findOne({
                    _id: new ObjectId(req.params.id),
                });
                res.send(result);
            } catch (err) {
                console.log(err);
                res.status(500).send("Error fetching product");
            }
        });

        app.post("/products", async (req, res) => {
            try {
                const data = req.body;
                data.createdAt = new Date().toISOString();

                const result = await productCollection.insertOne(data);
                res.send(result);
            } catch (err) {
                console.log(err);
                res.status(500).send("Error adding product");
            }
        });

        app.delete("/products/:id", async (req, res) => {
            try {
                const result = await productCollection.deleteOne({
                    _id: new ObjectId(req.params.id),
                });
                res.send(result);
            } catch (err) {
                console.log(err);
                res.status(500).send("Error deleting product");
            }
        });

        app.patch("/products/:id", async (req, res) => {
            try {
                const result = await productCollection.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $set: req.body }
                );
                res.send(result);
            } catch (err) {
                console.log(err);
                res.status(500).send("Error updating product");
            }
        });

        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.log(err);
    }
}

run();

app.get("/", (req, res) => {
    res.send("Server running 🚀");
});

app.listen(port, () => {
    console.log("🚀 Server running on port", port);
});