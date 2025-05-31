const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const port = 3000;

const app = express();
app.use(express.json());

let db;

async function connectToMongoDB() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        db = client.db("WEEK6");
    } catch (err) {
        console.error("Error:", err);
    }
}
connectToMongoDB();

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

const bcrypt = require('bcrypt');
const saltRounds = 10;

app.post('/users',async (req ,res) =>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const user = {...req.body, password: hashedPassword };
        await db.collection('user').insertOne(user);
        res.status(201).json({ message: "User created" });
    } catch (err) {
        res.status(400)({ error: "Registration failed"});
    }
    
}
);
