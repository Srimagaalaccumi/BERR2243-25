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
        console.log('New driver created with result: ${result}');
        
    });   
  
  } finally {
    await client.close(); // Ensure MongoDB closes after all insertions
    console.timeEnd("MongoDB Connection Time");
  }
}