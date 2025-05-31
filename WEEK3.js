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

// GET /rides - fetch all rides from MongoDB
app.get('/rides', async (req, res) => {
    try {
        const rides = await db.collection('rides').find().toArray();
        res.status(200).json(rides);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch rides" });
    }
});

// POST /rides - Insert a single ride object or an array (bulk insert)
app.post('/rides', async (req, res) => {
    const ridesData = req.body;  // Expected to be an object or an array of objects
    try {
        if (Array.isArray(ridesData)) {
            const result = await db.collection('rides').insertMany(ridesData);
            // Depending on your MongoDB Node.js driver version, you might need to use result.insertedIds or result.ops
            res.status(201).json({ insertedIds: result.insertedIds });
        } else {
            const result = await db.collection('rides').insertOne(ridesData);
            res.status(201).json({ insertedId: result.insertedId });
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// PATCH /rides/:id - Update ride status
app.patch('/rides/:id', async (req, res) => {
    try {
        const result = await db.collection('rides').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: req.body.status } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: "Ride not found" });
        }
        res.status(200).json({ updated: result.modifiedCount });
    } catch (err) {
        res.status(400).json({ error: "Invalid ride ID or data" });
    }
});

// DELETE /rides/:id - Delete a ride (cancel a ride)
app.delete('/rides/:id', async (req, res) => {
    try {
        const result = await db.collection('rides').deleteOne({
            _id: new ObjectId(req.params.id)
        });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Ride not found" });
        }
        res.status(200).json({ deleted: result.deletedCount });
    } catch (err) {
        res.status(400).json({ error: "Invalid ride ID" });
    }
});

// Start the server after routes are declared
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
