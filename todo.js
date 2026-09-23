const taskInputEl = document.getElementById("taskInput");
const timeInputEl = document.getElementById("timeInput");
const dateInputEl = document.getElementById("dateInput");
const priorityInputEl = document.getElementById("priorityInput");
const tList = document.getElementById("taskList");

var taskSorterNumbers = JSON.parse(localStorage.getItem("taskSorterNumbers")) || [];
var tasksList = JSON.parse(localStorage.getItem("tasksList")) || [];
var taskDates = JSON.parse(localStorage.getItem("taskDates")) || [];
var taskPriorities = JSON.parse(localStorage.getItem("taskPriorities")) || [];
var taskCheckedStatus = JSON.parse(localStorage.getItem("taskCheckedStatus")) || [];

// Function to save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasksList", JSON.stringify(tasksList));
    localStorage.setItem("taskSorterNumbers", JSON.stringify(taskSorterNumbers));
    localStorage.setItem("taskDates", JSON.stringify(taskDates));
    localStorage.setItem("taskPriorities", JSON.stringify(taskPriorities));
    localStorage.setItem("taskCheckedStatus", JSON.stringify(taskCheckedStatus));
}

// Function to load saved tasks when the page loads
function loadTasks() {
    tList.innerHTML = ""; // Clear the current list

    tasksList.forEach((taskText, i) => {
        let li = document.createElement("li");
        
        // Display task name along with due date and priority metadata
        li.innerHTML = `${taskText}<br><small style="color: #666; font-size: 14px;">Due: ${taskDates[i]} | Priority: ${taskPriorities[i]}</small>`;

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

// Function to add a new task (renamed to avoid element ID collisions)
function addNewTask() {
    if (taskInputEl.value === "" || timeInputEl.value === "" || dateInputEl.value === "" || priorityInputEl.value === "") {
        alert("You must fill in all fields!");
        return;
    }

    const constDate = new Date(2000, 0, 1, 0, 0, 0);
    
    // Parse date safely in local time to avoid timezone offsets
    const [year, month, day] = dateInputEl.value.split('-').map(Number);
    const [hours, minutes] = timeInputEl.value.split(':').map(Number);
    let selectedDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

    taskCheckedStatus.push(false);

    var timeinmilisec = selectedDate.getTime() - constDate.getTime();

    // Add task to arrays and calculate sorting value
    tasksList.push(taskInputEl.value);
    taskDates.push(`${dateInputEl.value} ${timeInputEl.value}`);
    taskPriorities.push(priorityInputEl.value);
    taskSorterNumbers.push(timeinmilisec * Number(priorityInputEl.value));

    // Sort tasks before displaying
    sortTasks();

    // Clear inputs
    taskInputEl.value = "";
    timeInputEl.value = "";
    dateInputEl.value = "";
    priorityInputEl.value = "1";

    // Save to localStorage
    saveTasks();
}

// Function to sort tasks
function sortTasks() {
    for (let i = 0; i < tasksList.length - 1; i++) {
        for (let j = 0; j < tasksList.length - i - 1; j++) {
            if (taskSorterNumbers[j] > taskSorterNumbers[j + 1]) {
                // Swap sorting numbers
                [taskSorterNumbers[j], taskSorterNumbers[j + 1]] = [taskSorterNumbers[j + 1], taskSorterNumbers[j]];
                // Swap task texts
                [tasksList[j], tasksList[j + 1]] = [tasksList[j + 1], tasksList[j]];
                // Swap dates
                [taskDates[j], taskDates[j + 1]] = [taskDates[j + 1], taskDates[j]];
                // Swap priorities
                [taskPriorities[j], taskPriorities[j + 1]] = [taskPriorities[j + 1], taskPriorities[j]];
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
        taskDates.splice(index, 1);
        taskPriorities.splice(index, 1);
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