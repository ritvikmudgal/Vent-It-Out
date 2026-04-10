require("dotenv").config({ path: __dirname + '/.env' });
const mongoose = require("mongoose");

async function test() {
  console.log("Connecting to:", process.env.MONGO_URI);
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongoose connected.");
    
    // Attempt an operation
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    console.log("Test successful!");
    process.exit(0);
  } catch (err) {
    console.error("Test failed:", err);
    process.exit(1);
  }
}
test();
