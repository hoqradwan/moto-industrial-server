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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
/*   if (!authHeader) {
    return res.status(401).send({ message: 'UnAuthorized access' });
  } */
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
  /*   if (err) {
      return res.status(403).send({ message: 'Forbidden access' })
    } */
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    await client.connect();
    console.log("db connected");
    const partsCollection = client.db("moto_industrial").collection("parts");
    const orderCollection = client.db("moto_industrial").collection("orders");
    const reviewCollection = client.db("moto_industrial").collection("reviews");

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
    // update parts
    app.put("/parts/:id", async (req, res) => {
      const id = req.params.id;
      const updatedParts = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          availableQ: updatedParts.availableQ,
        },
      };
      const result = await partsCollection.updateOne(query, updatedDoc, options)
      res.send(result)
    });
    // Order collection API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });
    // Get orders
    app.get("/orders", async (req, res) => {
      const orders = await orderCollection.find().toArray();
      res.send(orders);
    });
    // Delete order
    app.delete('/orders/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : ObjectId(id)}
      const result = await orderCollection.deleteOne(query)
      res.send(result)
    })
   
    // Review API
    app.post('/reviews', async(req,res)=>{
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    })

    app.get("/reviews", async (req, res) => {
      const reviews = await reviewCollection.find().toArray();
      res.send(reviews);
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
