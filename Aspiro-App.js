document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

    loadTasksFromLocalStorage();

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText !== '') {
            addTask(taskText);
            taskInput.value = '';
            taskInput.focus();
            saveTasksToLocalStorage();
        }
    });

    taskList.addEventListener('click', (event) => {
        const button = event.target;
        const taskItem = button.closest('li');

        if (button.tagName === 'BUTTON') {
            if (button.textContent === 'Delete') {
                taskList.removeChild(taskItem);
                saveTasksToLocalStorage();
            } else if (button.textContent === 'Complete') {
                taskItem.classList.toggle('completed');
                saveTasksToLocalStorage();
            } else if (button.textContent === 'Edit') {
                const taskSpan = taskItem.querySelector('span');
                const newTaskText = prompt('Edit your task:', taskSpan.textContent);
                if (newTaskText !== null) {
                    taskSpan.textContent = newTaskText.trim();
                    saveTasksToLocalStorage();
                }
            }
        }
    });

    function addTask(taskText, completed = false) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task';
        if (completed) taskItem.classList.add('completed');
        taskItem.innerHTML = `
            <span>${taskText}</span>
            <div>
                <button>Complete</button>
                <button>Edit</button>
                <button>Delete</button>
            </div>
        `;
        taskList.appendChild(taskItem);
    }

    function saveTasksToLocalStorage() {
        const tasks = [];
        document.querySelectorAll('#taskList .task').forEach(taskItem => {
            tasks.push({
                text: taskItem.querySelector('span').textContent,
                completed: taskItem.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTask(task.text, task.completed));
    }
});
