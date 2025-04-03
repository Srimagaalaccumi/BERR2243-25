const { MongoClient } = require("mongodb");

const drivers = [
  {
    name: "John Doe",
    vehicleType: "Sedan",
    isAvailable: true,
    rating: 4.8,
  },
  {
    name: "Alice Smith",
    vehicleType: "SUV", 
    isAvailable: false,
    rating: 4.5,
  },
  {
    name: "Kelvin",
    vehicleType: "BMW", 
    isAvailable: true,
    rating: 4.0,
  },
  {
    name: "Mark Benjamin",
    vehicleType: "VOLVO", 
    isAvailable: false,
    rating: 4.9,
  },
];

// Show the data in the console
console.log(drivers);

async function main() {
  const uri = "mongodb://localhost:27017"; // Replace with your MongoDB URI
  const client = new MongoClient(uri);

  console.time("MongoDB Connection Time"); // Start time tracking

  try {
    await client.connect();
    const db = client.db("testDB");

    const driversCollection = db.collection("drivers");

    drivers.forEach(async (driver) => {
        const result = await driversCollection.insertOne(driver);
        console.log(`New driver created with result: ${result}`);
    });   

    const updateResult = await db.collection('drivers').updateOne(
        {name: "John Doe"},
        {$inc: {rating: 0.1} }
    );
    console.log(`Driver updated with result: ${updateResult}`);

    // Fetch and log John Doe's updated data
    const updatedJohnDoe = await db.collection('drivers').findOne({ name: "John Doe" });
    console.log("John Doe's updated data:", updatedJohnDoe);


    const deleteResult = await db.collection('drivers').deleteOne({ isAvailable: false });
    console.log(`Driver deleted with result: ${deleteResult.deletedCount}`);
    


  } finally {
    await client.close(); // Ensure MongoDB closes after all insertions
    console.timeEnd("MongoDB Connection Time");
  }
}

main();
