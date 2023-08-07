const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://seb:qwerty123@schedit.l1ebnzy.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

const taskController = {}; // Define an empty object to hold the controller instance

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!');

    // Set the db property of the taskController object
    taskController.db = client.db('taskmanagement'); // Replace 'yourDatabaseName' with your actual database name

    return client;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = {
  connectToMongoDB,
  taskController, // Export the taskController object for use in other modules
};
