// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDyu37YpBtJ-izx1t9KmqTn7A1jVS17nj4",
  authDomain: "aspiro-e4915.firebaseapp.com",
  projectId: "aspiro-e4915",
  storageBucket: "aspiro-e4915.appspot.com",
  messagingSenderId: "562919074054",
  appId: "1:562919074054:web:e4948b41ae534eb8c65687",
  measurementId: "G-5K5XK2RH6M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const priorityInput = document.getElementById('priorityInput');
    const categoryInput = document.getElementById('categoryInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const searchInput = document.getElementById('searchInput');
    const showAllButton = document.getElementById('showAllButton');
    const showCompletedButton = document.getElementById('showCompletedButton');
    const showIncompleteButton = document.getElementById('showIncompleteButton');
    const sortByDueDateButton = document.getElementById('sortByDueDateButton');
    const sortByPriorityButton = document.getElementById('sortByPriorityButton');
    const categoryFilter = document.getElementById('categoryFilter');

    loadTasksFromLocalStorage();
    setInterval(checkDueDates, 60 * 60 * 1000); // Check every hour
    checkDueDates(); // Call immediately to test

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = priorityInput.value;
        const category = categoryInput.value;
    
        if (taskText !== '') {
            addTask(taskText, dueDate, priority, category);
            taskInput.value = '';
            dueDateInput.value = '';
            priorityInput.value = 'low';
            categoryInput.value = 'work';
            taskInput.focus();
            saveTasksToFirebase(); // Save to Firebase
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

    categoryFilter.addEventListener('change', () => {
        filterTasksByCategory();
    });
    
    function addTask(taskText, dueDate, priority, category, completed = false) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task';
        if (completed) taskItem.classList.add('completed');
        taskItem.innerHTML = `
            <span class="task-text">${taskText}</span>
            <span class="task-details">Due: ${dueDate} | Priority: ${priority} | Category: ${category}</span>
            <div>
                <button>Complete</button>
                <button>Edit</button>
                <button>Delete</button>
            </div>
        `;
        taskList.appendChild(taskItem);
    }
    
    function saveTasksToFirebase() {
        const tasks = [];
        document.querySelectorAll('#taskList .task').forEach(taskItem => {
            tasks.push({
                text: taskItem.querySelector('.task-text').textContent,
                dueDate: taskItem.querySelector('.task-details').textContent.split(' | ')[0].split(': ')[1],
                priority: taskItem.querySelector('.task-details').textContent.split(' | ')[1].split(': ')[1],
                category: taskItem.querySelector('.task-details').textContent.split(' | ')[2].split(': ')[1],
                completed: taskItem.classList.contains('completed')
            });
        });
    
        // Clear existing tasks
        const batch = db.batch();
        db.collection("tasks").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
    
            // Add new tasks
            tasks.forEach(task => {
                const docRef = db.collection("tasks").doc();
                batch.set(docRef, task);
            });
    
            batch.commit();
        });
    }
    
    function loadTasksFromFirebase() {
        db.collection("tasks").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const task = doc.data();
                addTask(task.text, task.dueDate, task.priority, task.category, task.completed);
            });
        });
    }
    
    // Call this function on DOMContentLoaded
    loadTasksFromFirebase();
    
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
    
    function filterTasksByCategory() {
        const selectedCategory = categoryFilter.value;
        const tasks = document.querySelectorAll('#taskList .task');
        tasks.forEach(task => {
            const taskCategory = task.querySelector('.task-details').textContent.split(' | ')[2].split(': ')[1];
            if (selectedCategory === 'all' || taskCategory === selectedCategory) {
                task.style.display = 'flex';
            } else {
                task.style.display = 'none';
            }
        });
    }
    
    function checkDueDates() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const today = new Date().toISOString().split('T')[0];
    
        tasks.forEach(task => {
            if (task.dueDate === today && !task.completed) {
                alert(`Reminder: Task "${task.text}" is due today!`);
            }
        });
    }
});