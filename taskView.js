class TaskView {
  constructor() {
    // Initialize the properties
    this.tasksByDate = {};
    this.monthYearText = null;
    this.taskInput = null;
    this.taskForm = null;
    this.taskList = null;
    this.taskListHeader = null;
    this.clickDisplay = null;
    this.prevMonthButton = null;
    this.nextMonthButton = null;
    this.controller = null; // The controller instance will be set by the server
  }

  initializeElements(
    monthYearText,
    taskInput,
    taskForm,
    taskList,
    taskListHeader,
    clickDisplay,
    prevMonthButton,
    nextMonthButton
  ) {
    // Assign the DOM elements
    this.monthYearText = monthYearText;
    this.taskInput = taskInput;
    this.taskForm = taskForm;
    this.taskList = taskList;
    this.taskListHeader = taskListHeader;
    this.clickDisplay = clickDisplay;
    this.prevMonthButton = prevMonthButton;
    this.nextMonthButton = nextMonthButton;

    // Attach event listener to the form submit event
    taskForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.onFormSubmit(taskInput.value.trim());
    });
    this.prevMonthButton.addEventListener('click', () => {
      this.onNavigateMonth('prev');
    });

    this.nextMonthButton.addEventListener('click', () => {
      this.onNavigateMonth('next');
    });
  }

  renderCalendar(daysInMonth, month, year) {
    // Render the calendar data without touching the DOM
    const calendarData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${month + 1}-${day}`;
      calendarData.push({
        date: dateString,
        day,
      });
    }

    // Return the calendar data
    return {
      monthYearText: `${this.getMonthName(month)} ${year}`,
      calendarData,
    };
  }

  renderTasks(selectedDate, tasksData) {
    // Render the tasks data without touching the DOM
    const taskItems = tasksData.tasks.map((task, index) => {
      return {
        task,
        completed: tasksData.completed[index],
      };
    });

    // Return the tasks data
    return {
      taskItems,
    };
  }

  // Utility method to create the task item HTML
  createTaskItemHTML(task, completed, index) {
    const newTaskItem = document.createElement('li');
    newTaskItem.classList.add('task-item');

    // Create a checkbox for each task
    const taskCheckbox = document.createElement('input');
    taskCheckbox.type = 'checkbox';
    taskCheckbox.classList.add('todo-markBtn');
    taskCheckbox.checked = completed; // Set the checkbox according to completion status
    taskCheckbox.addEventListener('change', (e) => {
      this.onTaskCheckboxChange(selectedDate, index, e.target.checked);
    });
    newTaskItem.appendChild(taskCheckbox);

    // Create the task text element
    const taskText = document.createElement('span');
    taskText.classList.add('todo-task');
    taskText.innerText = task;
    newTaskItem.appendChild(taskText);

    // Create the delete button
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () => {
      this.onDeleteTask(selectedDate, index);
    });
    newTaskItem.appendChild(deleteButton);

    return newTaskItem;
  }

  onFormSubmit(newTaskValue) {
    // Notify the controller of the form submission
    this.controller.handleFormSubmit(newTaskValue);
  }

  onDayClick(selectedDate) {
    // Notify the controller of the day click
    this.controller.handleDayClick(selectedDate);
  }

  onNavigateMonth(direction) {
    // Notify the controller of the month navigation
    this.controller.navigateMonth(direction);
  }

  onDeleteTask(selectedDate, index) {
    // Notify the controller of task deletion
    this.controller.deleteTask(selectedDate, index);
  }

  onTaskCheckboxChange(selectedDate, index, checked) {
    // Notify the controller of task checkbox change
    this.controller.updateTaskCompletionStatus(selectedDate, index, checked);
  }

  // Utility method to get the month name
  getMonthName(month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }
}

module.exports = TaskView;
