// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const currentDateElement = document.getElementById('currentDate');
const prevDayButton = document.getElementById('prevDay');
const nextDayButton = document.getElementById('nextDay');

// State
let currentDate = new Date();
let tasks = JSON.parse(localStorage.getItem('tasks')) || {};

// Initialize
updateDateDisplay();
loadTasks();

// Event Listeners
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

prevDayButton.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadTasks();
});

nextDayButton.addEventListener('click', () => {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadTasks();
});

// Functions
function updateDateDisplay() {
    const today = new Date();
    const isToday = currentDate.toDateString() === today.toDateString();
    const isTomorrow = currentDate.toDateString() === new Date(today.setDate(today.getDate() + 1)).toDateString();
    
    if (isToday) {
        currentDateElement.textContent = 'Today';
    } else if (isTomorrow) {
        currentDateElement.textContent = 'Tomorrow';
    } else {
        currentDateElement.textContent = currentDate.toLocaleDateString();
    }
}

function getDateKey() {
    return currentDate.toISOString().split('T')[0];
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;

    const dateKey = getDateKey();
    if (!tasks[dateKey]) {
        tasks[dateKey] = [];
    }

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false
    };

    tasks[dateKey].push(task);
    saveTasks();
    renderTask(task);
    taskInput.value = '';
}

function renderTask(task) {
    const taskElement = document.createElement('div');
    taskElement.className = 'task-item';
    taskElement.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
        <button class="delete-task">×</button>
    `;

    const checkbox = taskElement.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const deleteButton = taskElement.querySelector('.delete-task');
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    taskList.appendChild(taskElement);
}

function loadTasks() {
    taskList.innerHTML = '';
    const dateKey = getDateKey();
    if (tasks[dateKey]) {
        tasks[dateKey].forEach(task => renderTask(task));
    }
}

function toggleTask(taskId) {
    const dateKey = getDateKey();
    const task = tasks[dateKey].find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        loadTasks();
    }
}

function deleteTask(taskId) {
    const dateKey = getDateKey();
    tasks[dateKey] = tasks[dateKey].filter(task => task.id !== taskId);
    saveTasks();
    loadTasks();
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
} 