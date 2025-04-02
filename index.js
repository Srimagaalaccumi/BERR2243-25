const { MongoClient } = require('mongodb');

async function main() {
    //Replace <connection-string> with your MongoDB URI
    const uri = "mongodb://localhost:27017"
    const client = new MongoClient(uri);

    console.time("MongoDB Connection Time"); // Start time tracking

    try {
        
        await client.connect();        
        console.log("Connected to MongoDB!");
        console.timeEnd("MongoDB Connection Time"); // End time tracking

        const db = client.db ("testDB");
        const collection = db.collection("users");

        //Insert a document
        await collection.insertOne({name: "Srimagaalaccumi", age: 2001});
        console.log ("Document inserted!");

       //Query the document
       const result = await collection.findOne({ name: "Srimagaalaccumi" });
       console.log("Query result:", result);
    } catch (err)  {
        console.error("Error:", err);
    } finally{
        await client.close();
    }
}

main();

const { MongoClient } = require('mongodb');

const drivers = [
    {
        name: "John Doe",
        vehicleType: "Sedan",
        isAvailable: true,
        rating: 4.8
    },
    {
        name: "Alice Smith",
        vechileType: "SUV",
        isAvailable: false,
        rating: 4.5
    },
    {
        name: "Kelvin",
        vechileType: "BMW",
        isAvailable: true,
        rating: 4.0
    },
    {
        name: "Mark Benjamin",
        vechileType: "VOLVO",
        isAvailable: false,
        rating: 4.9
    }

];

//Show the data in the console
console.log(drivers);


async function main() {
    //Replace <connection-string> with your MongoDB URI
    const uri = "mongodb://localhost:27017"
    const client = new MongoClient(uri);

    console.time("MongoDB Connection Time"); // Start time tracking

    try {
        
        await client.connect();        
        const db = client.db ("testDB");

        const driversCollection = db.collection("drivers");

        drivers.forEach(async (driver) => {
            const result = await driversCollection.insertOne(driver);
            console.log('New driver created with result: ${result}');
        });

    } finally{
        await client.close();
    }
}

main();

