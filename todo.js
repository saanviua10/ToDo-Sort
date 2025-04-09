const task = document.getElementById("taskInput");
const time = document.getElementById("timeInput");
const date = document.getElementById("dateInput");
const priority = document.getElementById("priorityInput");
const tList = document.getElementById("taskList");

var taskSorterNumbers = JSON.parse(localStorage.getItem("taskSorterNumbers")) || [];
var tasksList = JSON.parse(localStorage.getItem("tasksList")) || [];
var taskCheckedStatus = JSON.parse(localStorage.getItem("taskCheckedStatus")) || [];

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasksList", JSON.stringify(tasksList));
    localStorage.setItem("taskSorterNumbers", JSON.stringify(taskSorterNumbers));
    localStorage.setItem("taskCheckedStatus", JSON.stringify(taskCheckedStatus));
}

// Function to load saved tasks when the page loads
function loadTasks() {
    tList.innerHTML = ""; // Clear the current list

    tasksList.forEach((taskText, i) => {
        let li = document.createElement("li");
        li.textContent = taskText;

        // Restore checked status from localStorage
        if (taskCheckedStatus[i]) {
            li.classList.add("checked");
        }

        // Create and append the delete button (span)
        let span = document.createElement("span");
        span.innerHTML = "\u00d7"; // "×" symbol for delete
        li.appendChild(span);

        // Append the <li> to the task list
        tList.appendChild(li);
    });
}

function clearTasks() {
    localStorage.clear();
    alert("Tasks Cleared");
    window.location.href = "todoMain.html";
}

// Function to add a new task
function taskInput() {
    if (task.value === "" || time.value === "" || date.value === "" || priority.value === "") {
        alert("You must fill in all fields!");
        return;
    }

    const constDate = new Date("January 1, 2000 0:00:00");
    let selectedDate = new Date(date.value);
    let year = selectedDate.getFullYear();
    let month = selectedDate.getMonth() + 1;
    let day = selectedDate.getDate();
    const [hours, minutes] = time.value.split(':').map(Number);

    taskCheckedStatus.push(false);

    selectedDate.setHours(hours, minutes, 0, 0);
    var timeinmilisec = selectedDate.getTime() - constDate.getTime();

    // Add task to array and calculate sorting value
    tasksList.push(task.value);
    taskSorterNumbers.push(timeinmilisec * (priority.value));

    // Sort tasks before displaying
    sortTasks();

    // Clear inputs
    task.value = "";
    time.value = "";
    date.value = "";
    priority.value = "";

    // Save to localStorage
    saveTasks();
}

// Function to sort tasks
function sortTasks() {
    for (let i = 0; i < tasksList.length - 1; i++) {
        for (let j = 0; j < tasksList.length - i - 1; j++) {
            if (taskSorterNumbers[j] > taskSorterNumbers[j + 1]) {
                // Swap priority numbers
                [taskSorterNumbers[j], taskSorterNumbers[j + 1]] = [taskSorterNumbers[j + 1], taskSorterNumbers[j]];

                // Swap task texts
                [tasksList[j], tasksList[j + 1]] = [tasksList[j + 1], tasksList[j]];

                // Swap checked statuses
                [taskCheckedStatus[j], taskCheckedStatus[j + 1]] = [taskCheckedStatus[j + 1], taskCheckedStatus[j]];
            }
        }
    }
    
    loadTasks();
    saveTasks();
}

// Event listener for task actions
tList.addEventListener("click", function (e) {
    if (!e.target.closest("li")) return;

    let clickedTask = e.target.closest("li");
    let index = Array.from(tList.children).indexOf(clickedTask);

    if (e.target.tagName === "SPAN") {
        tasksList.splice(index, 1);
        taskSorterNumbers.splice(index, 1);
        taskCheckedStatus.splice(index, 1);
        clickedTask.remove();
        saveTasks();
    } else {
        clickedTask.classList.toggle("checked");
        taskCheckedStatus[index] = clickedTask.classList.contains("checked");
        saveTasks();
    }
});

// Load tasks on page load
window.onload = loadTasks;
