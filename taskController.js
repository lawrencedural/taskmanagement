// TaskController.js

const { MongoClient } = require('mongodb');

class TaskController {
  constructor() {
    this.mongoClient = null; // Initialize the mongoClient property
    this.db = null; // Initialize the db property
  }

  async connectToDatabase() {
    try {
      const connectionString = "mongodb+srv://seb:qwerty123@schedit.l1ebnzy.mongodb.net/?retryWrites=true&w=majority";
      const mongoClient = new MongoClient(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      await mongoClient.connect();
      this.mongoClient = mongoClient;
      this.db = mongoClient.db(); // Update this line to specify the database name if needed
      console.log('Connected to MongoDB successfully!');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  // Function to set the MongoDB client and database
  setMongoClient(mongoClient, db) {
    this.mongoClient = mongoClient;
    this.db = db;
  }

  async addTask(task, date) {
    try {
      // Save the task to the database using the Task model
      const newTaskData = {
        date,
        task,
        completed: false,
      };
      const result = await task.save(newTaskData);

      // Notify the view that a new task has been added
      this.view.onTaskAdded(date, newTaskData);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  async saveTask(req, res) {
    try {
      const { date, task } = req.body;

      // Save the task to the database using the Task model
      const result = await Task.save({ date, task });

      res.status(201).json({ message: 'Task saved successfully', result });
    } catch (error) {
      console.error('Error saving task:', error);
      res.status(500).json({ error: 'An error occurred while saving task' });
    }
  }


  async saveUserLogin(req, res) {
    try {
      const { /* extract user login data from req.body */ } = req.body;
      // Process user login data and save it to the database (if needed)

      res.status(201).json({ message: 'User login data saved successfully' });
    } catch (error) {
      console.error('Error saving user login data:', error);
      res.status(500).json({ error: 'An error occurred while saving user login data' });
    }
  }

  async DeleteTask(selectedDate, index) {
    try {
      const tasksData = this.tasksByDate[selectedDate];
      if (!tasksData) return; // Return if there are no tasks for the selected date

      // Call the delete method from the Task class to delete the task from the MongoDB database
      const taskToDelete = tasksData.tasks[index];
      const result = await Task.delete(taskToDelete);

      if (result) {
        // If the task was successfully deleted from the database, remove the task item from the tasksByDate object
        tasksData.tasks.splice(index, 1);
        tasksData.completed.splice(index, 1);

        // Re-render the tasks for the selected date after deletion
        this.view.renderTasks(selectedDate, tasksData);
      } else {
        console.error('Error deleting task from the database');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

}

module.exports = TaskController;
