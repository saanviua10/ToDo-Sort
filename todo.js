const API_URL = 'http://localhost:3000/api/tasks';

// Load tasks from the backend database
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        
        tList.innerHTML = "";

        tasks.forEach((task) => {
            let li = document.createElement("li");
            li.dataset.id = task._id; // Store MongoDB ID on the element
            
            li.innerHTML = `${task.text}<br><small style="color: #666; font-size: 14px;">Due: ${task.dueDate} ${task.time} | Priority: ${task.priority}</small>`;

            if (task.checked) {
                li.classList.add("checked");
            }

            let span = document.createElement("span");
            span.innerHTML = "\u00d7";
            li.appendChild(span);

            tList.appendChild(li);
        });
    } catch (err) {
        console.error("Error loading tasks:", err);
    }
}

// Add a new task via POST request
async function addNewTask() {
    if (taskInputEl.value === "" || timeInputEl.value === "" || dateInputEl.value === "" || priorityInputEl.value === "") {
        alert("You must fill in all fields!");
        return;
    }

    const constDate = new Date(2000, 0, 1, 0, 0, 0);
    const [year, month, day] = dateInputEl.value.split('-').map(Number);
    const [hours, minutes] = timeInputEl.value.split(':').map(Number);
    let selectedDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
    let timeinmilisec = selectedDate.getTime() - constDate.getTime();
    let sortValue = timeinmilisec * Number(priorityInputEl.value);

    const newTask = {
        text: taskInputEl.value,
        dueDate: dateInputEl.value,
        time: timeInputEl.value,
        priority: Number(priorityInputEl.value),
        checked: false,
        sortValue: sortValue
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask)
        });

        taskInputEl.value = "";
        timeInputEl.value = "";
        dateInputEl.value = "";
        priorityInputEl.value = "1";

        loadTasks();
    } catch (err) {
        console.error("Error adding task:", err);
    }
}

// Event listener updates for deleting and toggling
tList.addEventListener("click", async function (e) {
    if (!e.target.closest("li")) return;

    let clickedTask = e.target.closest("li");
    let taskId = clickedTask.dataset.id;

    if (e.target.tagName === "SPAN") {
        await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
        loadTasks();
    } else {
        const isChecked = !clickedTask.classList.contains("checked");
        await fetch(`${API_URL}/${taskId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ checked: isChecked })
        });
        loadTasks();
    }
});

async function clearTasks() {
    if (confirm("Are you sure you want to clear all tasks?")) {
        await fetch(API_URL, { method: 'DELETE' });
        loadTasks();
    }
}

window.onload = loadTasks;