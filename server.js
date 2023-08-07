const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const bodyParser = require('body-parser');
const User = require('./model/userSchema.js');
const session = require('express-session');
const mongoDBSession = require('connect-mongodb-session')(session);

const app = express();
const dbName = 'taskmanagement'; // Define the name of the MongoDB database
const tasksCollectionName = 'tasks'; // Define the name of the tasks collection
const usersCollectionName = 'users'; // Define the name of the users collection

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection setup
let mongoClient;
let taskCollection;
let userCollection;
const uri = mongodb+srv://seb:qwerty123@schedit.l1ebnzy.mongodb.net/?retryWrites=true&w=majority;


const store = new mongoDBSession({
  uri: uri+"/taskmanagement",
  collection: "session"
})

app.use(session({
  secret: "sessions",
  resave: false,
  saveUninitialized: false,
  store: store 
}));

app.use(function(req,res,next){
    res.locals.session = req.session;
    next();
});


async function connectToMongoDB() {
  try {
    mongoClient = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await mongoClient.connect();
    console.log('Connected to MongoDB successfully!');
    const db = mongoClient.db(dbName);

    // Check if the collections exist before creating them
    const tasksCollections = await db.listCollections({ name: tasksCollectionName }).toArray();
    if (tasksCollections.length === 0) {
      await db.createCollection(tasksCollectionName);
      console.log('Tasks collection created:', tasksCollectionName);
    }

    const usersCollections = await db.listCollections({ name: usersCollectionName }).toArray();
    if (usersCollections.length === 0) {
      await db.createCollection(usersCollectionName);
      console.log('Users collection created:', usersCollectionName);
    }

    taskCollection = db.collection(tasksCollectionName);
    userCollection = db.collection(usersCollectionName);

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}


app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/checkLogin", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database by username
    const user = await userCollection.findOne({ username });

    if (user && bcrypt.compareSync(password, user.password)) {
      // User found and password is valid, redirect to the calendar page
      res.sendFile(path.join(__dirname, "public", "calendar.html"));
      req.session.validLogin = true;
      req.session.username = username;
      console.log("valid login");
      console.log(req.session.validLogin);
    } else {
      // Invalid login, redirect to the index page
      res.sendFile(path.join(__dirname, "public", "invalidLogin.html"));
      console.log("invalid login");
    }
  } catch (error) {
    console.error('Error checking login:', error);
    res.status(500).json({ error: 'An error occurred while checking login' });
  }
});


app.get("/logout", function (req, res) {
  req.session.destroy();
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


app.get("/registration", function (req, res) {
  res.sendFile(path.join(__dirname, "public", "registration.html"));
});

app.post("/registration", async function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  console.log(username)
  console.log(password)

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = new User({
      username,
      password: hashedPassword
    });

    const result = await userCollection.insertOne(user);


    res.sendFile(path.join(__dirname, "public", "index.html"));
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'An error occurred while saving user' });
  }
});

app.get("/calendar", function (req, res) {
  if (req.session.validLogin) {
    res.sendFile(path.join(__dirname, "public", "calendar.html"));
  } else {
    // Invalid login, redirect to the index page
    res.sendFile(path.join(__dirname, "public", "invalidLogin.html"));
    console.log("invalid login");
  }
});


app.get("/api/get-user-inputs", async function (req, res) {
  try {
    const cursor = taskCollection.find();
    const tasks = await cursor.toArray();
    res.json(tasks);
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ error: 'An error occurred while retrieving tasks' });
  }
});

app.get("/api/get-user-inputs/:date", async function (req, res) {
  try {
    const date = req.params.date;
    const cursor = taskCollection.find({ date });
    const tasks = await cursor.toArray();
    res.json(tasks);
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ error: 'An error occurred while retrieving tasks' });
  }
});

app.patch('/api/update-task', async (req, res) => {
  try {
    const { date, task, completed } = req.body;

    // Update the task completion status in the MongoDB database
    const result = await taskCollection.updateOne({ date, task }, { $set: { completed } });

    res.json({ message: 'Task completion status updated successfully', result });
  } catch (error) {
    console.error('Error updating task completion status:', error);
    res.status(500).json({ error: 'An error occurred while updating task completion status' });
  }
});

app.post('/api/save-task', async (req, res) => {
  try {
    const { date, task } = req.body;
    const newTaskData = {
      date,
      task,
      completed: false,
      user: req.session.username
    };
    const result = await taskCollection.insertOne(newTaskData);
    res.status(201).json({ message: 'Task saved successfully', result });
  } catch (error) {
    console.error('Error saving task:', error);
    res.status(500).json({ error: 'An error occurred while saving task' });
  }
});

app.delete('/api/delete-task/:date/:task', async (req, res) => {
  try {
    const { date, task } = req.params;

    // Delete the task from the database using the Task model
    const result = await taskCollection.deleteOne({ date, task });

    res.json({ message: 'Task deleted successfully', result });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'An error occurred while deleting task' });
  }
});


// Start the server after connecting to MongoDB
const port = process.env.SERVER_PORT || 3000;
connectToMongoDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });


}).catch(console.error);

module.exports = app;
