document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const priorityInput = document.getElementById('priorityInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const searchInput = document.getElementById('searchInput');
    const showAllButton = document.getElementById('showAllButton');
    const showCompletedButton = document.getElementById('showCompletedButton');
    const showIncompleteButton = document.getElementById('showIncompleteButton');
    const sortByDueDateButton = document.getElementById('sortByDueDateButton');
    const sortByPriorityButton = document.getElementById('sortByPriorityButton');

    loadTasksFromLocalStorage();

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;

        if (taskText !== '') {
            addTask(taskText, dueDate, priority);
            taskInput.value = '';
            dueDateInput.value = '';
            priorityInput.value = 'low';
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
                const taskSpan = taskItem.querySelector('.task-text');
                const newTaskText = prompt('Edit your task:', taskSpan.textContent);
                if (newTaskText !== null) {
                    taskSpan.textContent = newTaskText.trim();
                    saveTasksToLocalStorage();
                }
            }
        }
    });

    searchInput.addEventListener('input', () => {
        filterTasksBySearch();
    });
    showAllButton.addEventListener('click', () => {
        filterTasks('all');
    });

    showCompletedButton.addEventListener('click', () => {
        filterTasks('completed');
    });

    showIncompleteButton.addEventListener('click', () => {
        filterTasks('incomplete');
    });

    sortByDueDateButton.addEventListener('click', () => {
        sortTasks('dueDate');
    });

    sortByPriorityButton.addEventListener('click', () => {
        sortTasks('priority');
    });

    function addTask(taskText, dueDate, priority, completed = false) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task';
        if (completed) taskItem.classList.add('completed');
        taskItem.innerHTML = `
            <span class="task-text">${taskText}</span>
            <span class="task-details">Due: ${dueDate} | Priority: ${priority}</span>
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
                text: taskItem.querySelector('.task-text').textContent,
                dueDate: taskItem.querySelector('.task-details').textContent.split(' | ')[0].split(': ')[1],
                priority: taskItem.querySelector('.task-details').textContent.split(' | ')[1].split(': ')[1],
                completed: taskItem.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTask(task.text, task.dueDate, task.priority, task.completed));
    }

    function filterTasks(filter) {
        const tasks = document.querySelectorAll('#taskList .task');
        tasks.forEach(task => {
            switch (filter) {
                case 'all':
                    task.style.display = 'flex';
                    break;
                case 'completed':
                    task.style.display = task.classList.contains('completed') ? 'flex' : 'none';
                    break;
                case 'incomplete':
                    task.style.display = task.classList.contains('completed') ? 'none' : 'flex';
                    break;
            }
        });
    }

    function sortTasks(criteria) {
        const tasks = Array.from(document.querySelectorAll('#taskList .task'));
        tasks.sort((a, b) => {
            let aValue, bValue;

            if (criteria === 'dueDate') {
                aValue = new Date(a.querySelector('.task-details').textContent.split(' | ')[0].split(': ')[1]);
                bValue = new Date(b.querySelector('.task-details').textContent.split(' | ')[0].split(': ')[1]);
            } else if (criteria === 'priority') {
                const priorities = { low: 1, medium: 2, high: 3 };
                aValue = priorities[a.querySelector('.task-details').textContent.split(' | ')[1].split(': ')[1]];
                bValue = priorities[b.querySelector('.task-details').textContent.split(' | ')[1].split(': ')[1]];
            }

            return aValue > bValue ? 1 : -1;
        });

        taskList.innerHTML = '';
        tasks.forEach(task => taskList.appendChild(task));
    }

    function filterTasksBySearch() {
        const searchQuery = searchInput.value.toLowerCase();
        const tasks = document.querySelectorAll('#taskList .task');
        tasks.forEach(task => {
            const taskText = task.querySelector('.task-text').textContent.toLowerCase();
            if (taskText.includes(searchQuery)) {
                task.style.display = 'flex';
            } else {
                task.style.display = 'none';
            }
        });
    }
});
