let realTime = document.querySelector(".time-card");
console.log(realTime);

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

//date and time
function updateTime() {
  let date = new Date();
  let day = date.getDate();
  let dayName = days[date.getDay()];
  let currentMonth = months[date.getMonth()];
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  //am pm
  const ampm = hours >= 12 ? "PM" : "AM";

  // 12-hour conversion
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours;

  // leading zero
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  realTime.innerHTML = ` <p class="label">Current Time</p>
         <h2>${hours}:${minutes}:${seconds} ${ampm}</h2>
        <span>${dayName}, ${day}, ${currentMonth}, ${year}</span>`;
}
setInterval(updateTime, 1000);

//to-do list section

function todoConcept() {
  let todoInput = document.querySelector(".todoInput input");
  let todoInputAddBtn = document.querySelector(".todoInput button");
  let errorText = document.querySelector(".error-text");
  let todoList = document.querySelector(".todo-list");
  let remainingTask = document.querySelector(".todo-card .small");
  let rewardCount = document.querySelector(".reward-count");
  let overviewTotalTask = document.querySelector("#total");
  let overviewTotalTaskCompleted = document.querySelector("#done");
  let overviewTotalTaskRemaining = document.querySelector("#pending");

  let allTodos = JSON.parse(localStorage.getItem("PDtodos")) || [];

  //to render all todos
  renderTodos(allTodos);

  //set Items im local storage
  function LocalStorageSetItems() {
    localStorage.setItem("PDtodos", JSON.stringify(allTodos));
  }

  todoInputAddBtn.addEventListener("click", function () {
    let newTodo = todoInput.value.trim();
    // console.log(newTodo);
    if (newTodo === "") {
      errorText.style.display = "block";
      return;
    }

    errorText.style.display = "none";

    let todoObj = {
      text: newTodo,
      id: Date.now(),
      isCompleted: false,
    };
    // console.log(todoObj);

    allTodos.push(todoObj);
    LocalStorageSetItems();

    createTodoElements(todoObj);
    renderTodos();

    todoInput.value = "";
  });
  function renderTodos() {
    todoList.innerHTML = "";

    allTodos.forEach((todo) => {
      const li = createTodoElements(todo);
      todoList.appendChild(li);
    });

    updateTaskCounter();
  }

  function updateTaskCounter() {
    const remaining = allTodos.filter((t) => !t.isCompleted).length;
    const total = allTodos.length;
    const completedTask = allTodos.filter((t) => t.isCompleted).length;
    console.log(completedTask);

    remainingTask.textContent = `${remaining} of ${total} tasks remaining`;
    rewardCount.textContent = `${completedTask}`;
    overviewTotalTask.textContent = `${total}`;
    overviewTotalTaskCompleted.textContent = `${completedTask}`;
    overviewTotalTaskRemaining.textContent = `${remaining}`;
  }

  function createTodoElements(todoObj) {
    const li = document.createElement("li");
    li.dataset.id = todoObj.id;

    if (todoObj.isCompleted) li.classList.add("done");

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todoObj.isCompleted;

    const span = document.createElement("span");
    span.innerText = todoObj.text;

    label.appendChild(checkbox);
    label.appendChild(span);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.innerText = "✕";

    li.appendChild(label);
    li.appendChild(deleteBtn);
    // todoList.appendChild(li)

    deleteBtn.addEventListener("click", function () {
      allTodos = allTodos.filter((t) => t.id !== todoObj.id);
      LocalStorageSetItems();
      renderTodos(allTodos);
      updateTaskCounter();
    });

    checkbox.addEventListener("click", function () {
      let targetedTodo = allTodos.find((t) => t.id === todoObj.id);
      if (targetedTodo) {
        targetedTodo.isCompleted = checkbox.checked;
        li.classList.add("done");
      }
      li.classList.add("active");
      LocalStorageSetItems();
      renderTodos();

      updateTaskCounter();
    });

    return li;
  }
}
todoConcept();

// ===== Pomodoro Timer  =====

const timerText = document.querySelector(".timer-circle span");
const startBtn = document.querySelector(".start");
const resetBtn = document.querySelector(".reset");
const tabButtons = document.querySelectorAll(".timer-tabs button");

const MODES = {
  focus: { duration: 25 * 60, next: "break" },
  study: { duration: 50 * 60, next: "break" },
  break: { duration: 5 * 60, next: null }, // break ke baad wapas lastWorkMode
};

//set timerState in localStorage
function saveState() {
  localStorage.setItem("pomodoroState", JSON.stringify({
    mode,
    timers,
    lastWorkMode,
    isRunning: !!timer,
    lastUpdated: Date.now(),
  }));
}
//Get timerState from localStorage

function loadState() {
  const raw = localStorage.getItem("pomodoroState");
  if (!raw) return;

  const state = JSON.parse(raw);

  mode = state.mode || "focus";
  lastWorkMode = state.lastWorkMode || "focus";

  // 🔥 Backward compatibility
  if (state.timers) {
    timers = state.timers;
  } else if (typeof state.timeLeft === "number") {
    // Old format se migrate
    timers[mode] = state.timeLeft;
  }

if (state.isRunning) {
  let elapsed = Math.floor((Date.now() - state.lastUpdated) / 1000);

  while (elapsed > 0) {
    if (timers[mode] > elapsed) {
      timers[mode] -= elapsed;
      elapsed = 0;
    } else {
      elapsed -= timers[mode];
      changeMode(); // resets timers[mode] for new mode
    }
  }
}


  while (timers[mode] <= 0 && state.isRunning) {
    changeMode();
  }

  // Clamp corrupted or negative values
if (!Number.isFinite(timers[mode]) || timers[mode] < 0) {
  timers[mode] = 0;
}
 
  syncTabsWithMode();
  updateModeLabel();
  updateUI();

  if (state.isRunning) {
    startTimer();
    startBtn.innerText = "Pause";
  }
}

let timers = {
  focus: MODES.focus.duration,
  study: MODES.study.duration,
  break: MODES.break.duration,
};

let mode = "focus";
// let timeLeft = MODES[mode].duration;
let lastWorkMode = "focus"; // ya "study"
let timer = null;

updateModeLabel();

loadState();

function getTimeLeft() {
  return timers[mode];
}

function setTimeLeft(val) {
  timers[mode] = val;
}

// ---------- Core Logic ----------

function startTimer() {
  if (timer) return;

  timer = setInterval(() => {
    timers[mode]--;

    if (timers[mode] <= 0) {
      changeMode();
      return;
    }

    updateModeLabel();
    updateUI();
    saveState();
  }, 1);
}

function changeMode() {
  clearInterval(timer);
  timer = null;
  startBtn.innerText = "Start";

  if (mode === "focus" || mode === "study") {
    lastWorkMode = mode;
    mode = "break";
  } else if (mode === "break") {
    mode = lastWorkMode;
  }

  setTimeLeft(MODES[mode].duration);

  syncTabsWithMode();
  updateModeLabel();
  updateUI();
  saveState();
}

function toggleTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    startBtn.innerText = "Start";
  } else {
    startTimer();
    startBtn.innerText = "Pause";
  }
  saveState();
}

function resetTimer() {
  clearInterval(timer);
  timer = null;

  timers[mode] = MODES[mode].duration;
  startBtn.innerText = "Start";

  updateUI();
  saveState();
}

// ---------- UI Helpers ----------

function updateUI() {
  const t = timers[mode];
  const min = Math.floor(t / 60);
  const sec = t % 60;

  timerText.innerText =
    String(min).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}


function syncTabsWithMode() {
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
}

// ---------- Tabs ----------

function setActive(activeBtn) {
  mode = activeBtn.dataset.mode;

  clearInterval(timer);
  timer = null;
  startBtn.innerText = "Start";

  syncTabsWithMode();
  updateUI();
  saveState();
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", function () {
    setActive(this);
  });
});

function updateModeLabel() {
  const label = document.querySelector(".current-mode");

  if (mode === "break") {
    label.innerText = "BREAK TIME 💤";
  } else if (mode === "focus") {
    label.innerText = "FOCUS MODE 🔥";
  } else {
    label.innerText = "STUDY MODE 📚";
  }
}

// ---------- Init ----------

syncTabsWithMode();
updateUI();

startBtn.addEventListener("click", toggleTimer);
resetBtn.addEventListener("click", resetTimer);
