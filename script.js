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
        <div class="task-actions">
            <button class="edit-task">Edit</button>
            <button class="delete-task">×</button>
        </div>
    `;

    const checkbox = taskElement.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const deleteButton = taskElement.querySelector('.delete-task');
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    const editButton = taskElement.querySelector('.edit-task');
    editButton.addEventListener('click', () => startEditing(taskElement, task));

    taskList.appendChild(taskElement);
}

function startEditing(taskElement, task) {
    const taskText = taskElement.querySelector('.task-text');
    const currentText = taskText.textContent;
    
    // Create edit input
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'edit-input';
    editInput.value = currentText;
    
    // Replace text with input
    taskText.replaceWith(editInput);
    editInput.focus();
    
    // Handle save on enter
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveEdit(taskElement, task, editInput);
        }
    });
    
    // Handle save on blur (clicking outside)
    editInput.addEventListener('blur', () => {
        saveEdit(taskElement, task, editInput);
    });
}

function saveEdit(taskElement, task, editInput) {
    const newText = editInput.value.trim();
    if (newText && newText !== task.text) {
        task.text = newText;
        saveTasks();
        
        // Create new text span
        const newTextSpan = document.createElement('span');
        newTextSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
        newTextSpan.textContent = newText;
        
        // Replace input with new text
        editInput.replaceWith(newTextSpan);
    } else {
        // If no changes or empty, revert to original text
        const newTextSpan = document.createElement('span');
        newTextSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
        newTextSpan.textContent = task.text;
        editInput.replaceWith(newTextSpan);
    }
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