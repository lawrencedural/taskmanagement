document.addEventListener('DOMContentLoaded', function () {
  const currentDate = new Date();
  const tasksByDate = {};

  // Function to render the calendar
  //
  //
  function renderCalendar() {
    var calendar = document.querySelector('.calendar');
    var daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    var monthYearText = document.querySelector('.month-year');

    // Clear the existing calendar
    calendar.innerHTML = '';

    // Add a click event listener to the form submit event
    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', handleFormSubmit);
    
    // Render calendar days
    for (var day = 1; day <= daysInMonth; day++) {
      var calendarDay = document.createElement('div');
      calendarDay.classList.add('calendar-day');
      calendarDay.setAttribute('data-date', currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + day);
      calendarDay.innerText = day;
      calendarDay.addEventListener('click', handleDayClick);
      calendar.appendChild(calendarDay);
    }

    // Update the month and year display
    var month = currentDate.toLocaleString('default', { month: 'long' });
    var year = currentDate.getFullYear();
    monthYearText.innerText = month + ' ' + year;
  }

  function getSelectedDateFromLocalStorage() {
    const selectedDate = localStorage.getItem('selectedDate');
    return selectedDate ? selectedDate : null;
  }

  // Handle day click event
  //
  //
  function handleDayClick(event) {
    var selectedDay = event.target;
    var taskInput = document.getElementById('new-task');
    var taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', handleFormSubmit);
    var selectedDate = selectedDay.getAttribute('data-date');
  
    // Clear the input field and hide the form initially
    taskInput.value = '';
    taskForm.style.display = 'none';
  
    // Remove the 'selected-day' class from all calendar days
    var calendarDays = document.getElementsByClassName('calendar-day');
    for (var i = 0; i < calendarDays.length; i++) {
      calendarDays[i].classList.remove('selected-day');
    }
  
    // Add the 'selected-day' class to the clicked calendar day
    selectedDay.classList.add('selected-day');
  
    // Show the form only for the selected day
    if (selectedDate !== '') {
      taskForm.style.display = 'block';
      taskForm.setAttribute('data-selected-date', selectedDate); // Store the selected date in the form's data attribute
  
      var clickDisplay = document.getElementById('click-display');
      clickDisplay.innerText = 'Selected Date: ' + selectedDate; // Update the click display with the selected date
  
      localStorage.setItem('selectedDate', selectedDate);
      // Update the tasks for the selected date in the calendar view
      renderTasks(selectedDate);

      var taskListHeader = document.getElementById('task-list-header'); // Get the <h2> element for the task list header
      taskListHeader.innerText = 'Task-List for ' + selectedDate; // Update the <h2> element with the selected date

        //Retrive tasks for the selected date using getTasksForDate
      var tasksForSelectedDate = getTasksForDate(selectedDate);
      console.log('Tasks for selected date:', tasksForSelectedDate);
    }
  }
  

  // Function to add tasks
  //
  //
  async function handleFormSubmit(event) {
    event.preventDefault();

    const newTaskInput = document.getElementById('new-task');
    const newTaskValue = newTaskInput.value.trim();
    const taskForm = document.getElementById('task-form');
    const selectedDate = taskForm.getAttribute('data-selected-date');

    if (newTaskValue !== '') {
      try {
        // Make a POST request to the server to save the task
        const response = await fetch('/api/save-task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ date: selectedDate, task: newTaskValue }),
        });

        if (response.ok) {
          // Update the tasksByDate object and re-render the tasks for the selected date
          const data = await response.json();
          if (!tasksByDate[selectedDate]) {
            tasksByDate[selectedDate] = {
              tasks: [],
              completed: [],
            };
          }
          tasksByDate[selectedDate].tasks.push(newTaskValue);
          tasksByDate[selectedDate].completed.push(false);
          renderTasks(selectedDate);
          newTaskInput.value = ''; // Clear the input field after adding a new task
        } else {
          console.error('Error saving task:', response.statusText);
        }
      } catch (error) {
        console.error('Error saving task:', error);
      }
    }
  }


  // Attach event listener to the form submit event
  var taskForm = document.getElementById('task-form');
  document.getElementById('task-form').addEventListener('submit', handleFormSubmit);

 // function to retrieve tasks for a specific date
 //
 //
  function getTasksForDate(date) {
    // For demonstration purposes, let's return the tasks from the tasksByDate object for now
    return tasksByDate[date] || [];
  }

  async function fetchAndRenderTasks(selectedDate) {
    try {
      // Make a GET request to the server to fetch tasks for the selected date
      const response = await fetch(`/api/get-user-inputs/${selectedDate}`);
      if (response.ok) {
        const tasks = await response.json();
        tasksByDate[selectedDate] = { tasks: [], completed: [] };
        tasks.forEach((task) => {
          tasksByDate[selectedDate].tasks.push(task.task);
          tasksByDate[selectedDate].completed.push(task.completed);
        });
        localStorage.setItem('tasksByDate', JSON.stringify(tasksByDate));
        renderTasks(selectedDate);
      } else {
        console.error('Error fetching tasks:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  }
  
// Function to render tasks for the selected date
//
//
function renderTasks(selectedDate) {
  var taskList = document.getElementById('task-list');
  var tasksData = tasksByDate[selectedDate];

  if (tasksData) {
    taskList.innerHTML = '';

    tasksData.tasks.forEach(function (task, index) {
      var newTaskItem = document.createElement('li');
      newTaskItem.classList.add('task-item');

      // Create a checkbox for each task
      var taskCheckbox = document.createElement('input');
      taskCheckbox.type = 'checkbox';
      taskCheckbox.classList.add('todo-markBtn');
      taskCheckbox.checked = tasksData.completed[index]; // Set the checkbox according to completion status
      newTaskItem.appendChild(taskCheckbox);

      // Create the task text element
      var taskText = document.createElement('span');
      taskText.classList.add('todo-task');
      taskText.innerText = task;
      newTaskItem.appendChild(taskText);

      // Create the delete button
      var deleteButton = document.createElement('button');
      deleteButton.innerText = 'Delete';
      deleteButton.classList.add('delete-btn');
      deleteButton.addEventListener('click', function () {
        handleDeleteButtonClick(selectedDate, index);
      });
      newTaskItem.appendChild(deleteButton);

      // Add a click event listener to the checkbox
      taskCheckbox.addEventListener('change', function (e) {
        const target = e.target;
        if (target.classList.contains("todo-markBtn")) {
          const todoTask = target.closest(".task-item").querySelector(".todo-task");
          todoTask.classList.toggle("done");

          // Update the completion status in tasksByDate object
          tasksData.completed[index] = target.checked;
          handleTaskCheckboxChange(selectedDate, index, target.checked)
        }
      });

      taskList.appendChild(newTaskItem);
    });
  } else {
    taskList.innerHTML = ''; // Clear the task list if no tasks for the selected date
  }
}

function handleDeleteButtonClick(selectedDate, index) {
  // Ask for confirmation before deleting the task
  if (confirm('Are you sure you want to delete this task?')) {
    deleteTask(selectedDate, index);
  }
}

async function deleteTask(selectedDate, index) {
  try {
    const tasksData = tasksByDate[selectedDate];
    if(!tasksData) return;

    const taskToDelete = tasksData.tasks[index];

    const response = await fetch(`/api/delete-task/${encodeURIComponent(selectedDate)}/${encodeURIComponent(taskToDelete)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      tasksData.tasks.splice(index, 1);
      tasksData.completed.splice(index, 1);
      renderTasks(selectedDate);
    } else {
      console.error('Error deleting task:', response.statusText);
    }
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}
/*
  // Function to delete tasks for the selected date
  //
  //
  function deleteTask(selectedDate, index) {
  var tasksData = tasksByDate[selectedDate];

  if (tasksData) {
    // Remove the task at the specified index from the tasks array
    tasksData.tasks.splice(index, 1);
    tasksData.completed.splice(index, 1);

    // Update the tasks for the selected date in the calendar view
    renderTasks(selectedDate);
  }
}
*/

function handleTaskCheckboxChange(selectedDate, index, checked) {
  // Update the completion status in tasksByDate object
  tasksByDate[selectedDate].completed[index] = checked;

  // Make a PATCH request to the server to update the task completion status
  const taskToUpdate = tasksByDate[selectedDate].tasks[index];
  const completedToUpdate = checked;
  updateTaskCompletionStatus(selectedDate, taskToUpdate, completedToUpdate);
}

async function updateTaskCompletionStatus(selectedDate, taskToUpdate, completedToUpdate) {
  try {
    // Make a PATCH request to the server to update the task completion status
    const response = await fetch('/api/update-task', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ date: selectedDate, task: taskToUpdate, completed: completedToUpdate }),
    });

    if (response.ok) {
      console.log('Task completion status updated successfully');
    } else {
      console.error('Error updating task completion status:', response.statusText);
    }
  } catch (error) {
    console.error('Error updating task completion status:', error);
  }
}


  // Handle month navigation
  //
  //
  function navigateMonth(direction) {
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else if (direction === 'next') {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    renderCalendar();
  }

  // Add month navigation event handlers
  var prevMonthButton = document.getElementById('prev-month');
  var nextMonthButton = document.getElementById('next-month');
  prevMonthButton.addEventListener('click', function () {
    navigateMonth('prev');
  });
  nextMonthButton.addEventListener('click', function () {
    navigateMonth('next');
  });

  function init(){
    selectedDate = getSelectedDateFromLocalStorage();
    renderCalendar();

    if(selectedDate) {
      fetchAndRenderTasks(selectedDate);
    } else{
      // If no selected date is found in localStorage, get the first date of the current month
      const firstDateofCurrentMonth = currentDate.getFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + '1';
      fetchAndRenderTasks(firstDateofCurrentMonth);
    }
  }
  init();
/*
  // Render the initial calendar
  renderCalendar();
  will be replaced by init();
*/


});






