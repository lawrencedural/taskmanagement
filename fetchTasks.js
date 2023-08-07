const axios = require('axios');

async function fetchTasks() {
  try {
    // Fetch tasks from the server
    const response = await axios.get('http://localhost:3000/api/get-user-inputs');
    const tasks = response.data;
    console.log('Tasks fetched successfully:', tasks);
    // Process the fetched tasks as needed
  } catch (error) {
    console.error('Error fetching tasks:', error.message);
  }
}

// Call the fetchTasks function
fetchTasks();
