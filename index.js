const express = require('express');
const app = express();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require('cors');
require('dotenv').config();

const port = process.env.PORT || 5000;

// ✅ MIDDLEWARE
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser()); 

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

        // 🔐 JWT VERIFY
        const verifyJWT = (req, res, next) => {
            const token = req.cookies.token;

            if (!token) {
                return res.status(401).send({ message: "unauthorized" });
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(403).send({ message: "forbidden" });
                }
                req.user = decoded;
                next();
            });
        };

        // 🔐 CREATE TOKEN
        app.post("/jwt", (req, res) => {
            const user = req.body;

            const token = jwt.sign(user, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });

            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
            }).send({ success: true });
        });

        // 🔐 LOGOUT
        app.post("/logout", (req, res) => {
            res.clearCookie("token", {
                httpOnly: true,
                secure: false,
            });
            res.send({ success: true });
        });

        // 🔥 ACCOUNTS (PROTECTED)
        app.get("/accounts", verifyJWT, async (req, res) => {
            res.send(await accountCollection.find().toArray());
        });

        app.post("/accounts", verifyJWT, async (req, res) => {
            const data = req.body;
            if (!data.date) data.date = new Date().toISOString();
            res.send(await accountCollection.insertOne(data));
        });

        app.delete("/accounts/:id", verifyJWT, async (req, res) => {
            res.send(await accountCollection.deleteOne({
                _id: new ObjectId(req.params.id)
            }));
        });

        app.patch("/accounts/:id", verifyJWT, async (req, res) => {
            res.send(await accountCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: req.body }
            ));
        });

        // 🔥 PRODUCTS (OPTIONAL PROTECTION)
        app.get("/products", async (req, res) => {
            const result = await productCollection.find().toArray();
            res.send(result);
        });

        app.get("/products/:id", async (req, res) => {
            const result = await productCollection.findOne({
                _id: new ObjectId(req.params.id),
            });
            res.send(result);
        });

        app.post("/products", verifyJWT, async (req, res) => {
            const data = req.body;
            data.createdAt = new Date().toISOString();
            res.send(await productCollection.insertOne(data));
        });

        app.delete("/products/:id", verifyJWT, async (req, res) => {
            res.send(await productCollection.deleteOne({
                _id: new ObjectId(req.params.id),
            }));
        });

        app.patch("/products/:id", verifyJWT, async (req, res) => {
            res.send(await productCollection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: req.body }
            ));
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