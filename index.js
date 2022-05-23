const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uaqt4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    console.log("db connected");
    const partsCollection = client.db("moto_industrial").collection("parts");
    const orderCollection = client.db("moto_industrial").collection("orders");

    app.get("/parts", async (req, res) => {
      const parts = await partsCollection.find().toArray();
      res.send(parts);
    });
    app.get("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await partsCollection.findOne(query);
      res.send(result);
    });
   
    // Order collection API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello from moto industrial");
});

app.listen(port, () => {
  console.log(`moto is listening to ${port}`);
});
