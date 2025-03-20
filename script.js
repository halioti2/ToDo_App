// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTask');
const taskList = document.getElementById('taskList');
const currentDateElement = document.getElementById('currentDate');
const prevDayButton = document.getElementById('prevDay');
const nextDayButton = document.getElementById('nextDay');
const charCounter = document.querySelector('.char-counter');

// Constants
const MAX_CHARS = 100;

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

taskInput.addEventListener('input', updateCharCounter);

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

function updateCharCounter() {
    const currentLength = taskInput.value.length;
    charCounter.textContent = `${currentLength}/${MAX_CHARS}`;
    
    // Update counter color based on length
    charCounter.classList.remove('warning', 'error');
    taskInput.classList.remove('error');
    
    if (currentLength >= MAX_CHARS) {
        charCounter.classList.add('error');
        taskInput.classList.add('error');
    } else if (currentLength >= MAX_CHARS * 0.8) {
        charCounter.classList.add('warning');
    }
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) return;
    
    if (taskText.length > MAX_CHARS) {
        alert(`Task cannot exceed ${MAX_CHARS} characters`);
        return;
    }

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
    updateCharCounter();
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
    
    // Add character counter for edit mode
    const editCounter = document.createElement('span');
    editCounter.className = 'char-counter';
    editCounter.textContent = `${currentText.length}/${MAX_CHARS}`;
    
    // Create container for input and counter
    const editContainer = document.createElement('div');
    editContainer.className = 'task-input';
    editContainer.appendChild(editInput);
    editContainer.appendChild(editCounter);
    
    // Replace text with input container
    taskText.replaceWith(editContainer);
    editInput.focus();
    
    // Handle input changes
    editInput.addEventListener('input', () => {
        const currentLength = editInput.value.length;
        editCounter.textContent = `${currentLength}/${MAX_CHARS}`;
        
        // Update counter color based on length
        editCounter.classList.remove('warning', 'error');
        editInput.classList.remove('error');
        
        if (currentLength >= MAX_CHARS) {
            editCounter.classList.add('error');
            editInput.classList.add('error');
        } else if (currentLength >= MAX_CHARS * 0.8) {
            editCounter.classList.add('warning');
        }
    });
    
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
        if (newText.length > MAX_CHARS) {
            alert(`Task cannot exceed ${MAX_CHARS} characters`);
            // Revert to original text
            const newTextSpan = document.createElement('span');
            newTextSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
            newTextSpan.textContent = task.text;
            editInput.parentElement.replaceWith(newTextSpan);
            return;
        }
        
        task.text = newText;
        saveTasks();
        
        // Create new text span
        const newTextSpan = document.createElement('span');
        newTextSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
        newTextSpan.textContent = newText;
        
        // Replace input with new text
        editInput.parentElement.replaceWith(newTextSpan);
    } else {
        // If no changes or empty, revert to original text
        const newTextSpan = document.createElement('span');
        newTextSpan.className = `task-text ${task.completed ? 'completed' : ''}`;
        newTextSpan.textContent = task.text;
        editInput.parentElement.replaceWith(newTextSpan);
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