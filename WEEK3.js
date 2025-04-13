const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const port = 3000;


const app = express();
app.use(cors());
app.use(express.json());

let db;

async function connectToMongoDB() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        db = client.db("testDB");
    } catch (err) {
        console.error("Error:", err);
    }
}
connectToMongoDB();

// your routes below
app.get('/rides', (req, res) => {
    res.json([
      { _id: "1", pickupLocation: "Central Park", destination: "Times Square", driverID: "DRIVER123", status: "requested" }
    ]);
  });
  

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

//GET /rides - fetch all rides
app.get('/rides', async (req, res) =>{
    try {
        const rides = await db.collection('rides').find().toArray();
        res.status(200).json(rides);

    } catch (err) {
        res.status(500).json({ error: "Failed to fetch rides"});
    }

});

// POST route object and bulk insert
app.post('/rides', async (req, res) => {
    const ridesData = req.body;  // Expected to be an object or an array of objects
    try {
      if (Array.isArray(ridesData)) {
        const savedRides = await Ride.insertMany(ridesData);
        res.status(201).json(savedRides);
      } else {
        const ride = new Ride(ridesData);
        const savedRide = await ride.save();
        res.status(201).json(savedRide);
      }
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  

// PATCH /rides/:id - UPDATE ride status
app.patch('/rides/:id', async (req, res) => {
    try {
        const result = await db.collection('rides').updateOne(
            {_id: new ObjectId(req.params.id ) },
            { $set: { status: req.bodystatus } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Rides ni found"});
        }
        res.status(200).json( {updated: result.modifiedCount });

    }catch (err) {
        //HANDLE INVALID ID FORMAT OR DB ERRORS
        res.status(400).json({ error: "Invalid ride ID or data"});
    }
});

//DELETE /rides/:id – Cancel a Ride
app.patch('/rides/:id', async (req, res) => {
    try {
        const result = await db.collection('rides').deleteOne(
            {_id: new ObjectId(req.params.id ) },
        );

        if (result.deleteCount === 0) {
            return res.status(404).json({ error: "Rides not found"});
        }
        res.status(200).json( {updated: result.deleteCount });

    }catch (err) {
        
        res.status(400).json({ error: "Invalid ride ID "});
    }
});