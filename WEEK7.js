const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const port = 3000;

const app = express();
app.use(express.json());

app.use(cors());


let db;

async function connectToMongoDB() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db("testDB");
  } catch (err) {
    console.error("Connection Error:", err);
  }
}
connectToMongoDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// POST: Insert multiple users
app.post('/users', async (req, res) => {
  const users = req.body; // Expecting an array
  try {
    const result = await db.collection('users').insertMany(users);
    res.status(201).json({ message: "Users added", insertedIds: result.insertedIds });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// POST: Insert multiple rides
app.post('/rides', async (req, res) => {
  const rides = req.body; // Expecting an array
  try {
    const result = await db.collection('rides').insertMany(rides);
    res.status(201).json({ message: "Rides added", insertedIds: result.insertedIds });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// GET: Passenger Statistics
app.get('/analytics/passengers', async (req, res) => {
  try {
    const result = await db.collection('users').aggregate([
      {
        $lookup: {
          from: 'rides',
          localField: '_id',
          foreignField: 'userId',
          as: 'rides'
        }
      },
      {
        $unwind: {
          path: '$rides',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          totalRides: { $sum: 1 },
          totalFare: { $sum: '$rides.fare' },
          avgDistance: { $avg: '$rides.distance' }
        }
      },
      //{
        //$project: {
         // _id: 1, // <-- SHOW _id like MongoDB Compass
         // name: 1,
         // totalRides: 1,
         // totalFare: { $round: ['$totalFare', 2] },
         //avgDistance: { $round: ['$avgDistance', 2] }
       // }
      //}
    ]).toArray();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to compute analytics" });
  }
});


// PATCH: Update ride status
app.patch('/rides/:id', async (req, res) => {
  try {
    const result = await db.collection('rides').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: req.body.status } }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: "Ride not found or not updated" });
    }
    res.status(200).json({ message: "Ride updated", updated: result.modifiedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID or update data" });
  }
});

// DELETE: Delete a ride
app.delete('/rides/:id', async (req, res) => {
  try {
    const result = await db.collection('rides').deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Ride not found" });
    }
    res.status(200).json({ message: "Ride deleted", deleted: result.deletedCount });
  } catch (err) {
    res.status(400).json({ error: "Invalid ride ID" });
  }
});



