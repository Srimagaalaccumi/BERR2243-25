const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

let db;

// Connect to MongoDB and Insert Test Data
async function connectToMongoDB() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("testDB");

    // Insert test users and rides
    await insertTestData(db);
  } catch (err) {
    console.error("Connection Error:", err);
  }
}
connectToMongoDB();

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


async function insertTestData(db) {
  try {
    await db.collection("users").deleteMany({});
    await db.collection("rides").deleteMany({});

    // Insert users
    await db.collection("users").insertMany([
      { _id: new ObjectId("665e1c84c271cf78901a1234"), name: "Alice" },
      { _id: new ObjectId("665e1c84c271cf78901a5678"), name: "Bob" }
    ]);

    // Insert rides
    await db.collection("rides").insertMany([
      {
        pickupLocation: "Central Park",
        destination: "Times Square",
        driverID: "DRIVER123",
        fare: 37.75,
        distance: 10.35,
        status: "completed",
        userId: new ObjectId("665e1c84c271cf78901a1234")
      },
      {
        pickupLocation: "Queens",
        destination: "Brooklyn",
        driverID: "DRIVER125",
        fare: 18.75,
        distance: 9.8,
        status: "completed",
        userId: new ObjectId("665e1c84c271cf78901a5678")
      }
    ]);

    console.log("Inserted sample users and rides.");
  } catch (err) {
    console.error("Insertion Error:", err);
  }
}

// GET: Passenger Analytics
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
          preserveNullAndEmptyArrays: true
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
      {
        $project: {
          _id: 0,
          name: 1,
          totalRides: 1,
          totalFare: 1,
          avgDistance: { $round: ['$avgDistance', 2] }
        }
      }
    ]).toArray();

    res.status(200).json(result);
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ error: "Failed to compute analytics" });
  }
});
