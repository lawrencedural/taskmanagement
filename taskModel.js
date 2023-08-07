const { ObjectId } = require('mongodb');
const { getDb } = require('./mongoDB');

class Task {
  static async save(taskData) {
    try {
      const db = getDb();
      const collection = db.collection('tasks');
      const result = await collection.insertOne(taskData);
      return result.ops[0]; // Return the inserted task data
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Task;
