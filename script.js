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


const rewardTextEl = document.getElementById("rewardText");
const rewardTimeEl = document.getElementById("rewardTime");
const completedCountEl = document.getElementById("completedCount");
const claimRewardBtn = document.querySelector(".claim-reward");
const resetRewardBtn = document.querySelector(".reward-reset");

const REWARDS = [
  { text: "Watch a chess match analysis", time: "15 minutes" },
  { text: "Go for a short walk", time: "10 minutes" },
  { text: "Listen to music", time: "2 songs" },
  { text: "Do stretching", time: "5 minutes" },
  { text: "Drink water + relax", time: "2 minutes" },
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

  if (remainingTask) {
    remainingTask.textContent = `${remaining} of ${total} tasks remaining`;
  }

  if (rewardCount) {
    rewardCount.textContent = `${completedTask}`;
  }

  if (overviewTotalTask) {
    overviewTotalTask.textContent = `${total}`;
  }

  if (overviewTotalTaskCompleted) {
    overviewTotalTaskCompleted.textContent = `${completedTask}`;
  }

  if (overviewTotalTaskRemaining) {
    overviewTotalTaskRemaining.textContent = `${remaining}`;
  }

  // 🔥 Reward logic yahin se call hoga (single source of truth)
  maybeUnlockReward(completedTask);
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

// let pomodoroStats = JSON.parse(localStorage.getItem("pomodoroStats")) || {
//   totalSessions: 0,
// };

let pomodoroStats = JSON.parse(localStorage.getItem("pomodoroStats")) || {};

pomodoroStats = {
  totalSessions: Number(pomodoroStats.totalSessions) || 0,
  totalFocusMinutes: Number(pomodoroStats.totalFocusMinutes) || 0,
  totalStudyMinutes: Number(pomodoroStats.totalStudyMinutes) || 0,
};




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


const sessionCountEl = document.getElementById("sessionCount");
const focusTimeValue = document.getElementById("focusTimeValue");


function savePomodoroStats() {
  localStorage.setItem("pomodoroStats", JSON.stringify(pomodoroStats));
}

function updatePomodoroStatsUI() {
  const totalMinutes =
    pomodoroStats.totalFocusMinutes + pomodoroStats.totalStudyMinutes;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  sessionCountEl.innerText = pomodoroStats.totalSessions;
focusTimeValue.innerText = `${hours}h ${minutes}m`;

}


updatePomodoroStatsUI();


// ---------- Core Logic ----------

function startTimer() {
  if (timer) return;

  timer = setInterval(() => {
    timers[mode]--;

    if (timers[mode] <= 0) {
      changeMode(true);
      return;
    }

    updateModeLabel();
    updateUI();
    saveState();
  }, 0.5);
}

function changeMode(isAuto = false) {
  clearInterval(timer);
  timer = null;
  startBtn.innerText = "Start";

  if (isAuto && (mode === "focus" || mode === "study")) {
    pomodoroStats.totalSessions += 1;

    if (mode === "focus") {
      pomodoroStats.totalFocusMinutes += MODES.focus.duration / 60;
    }

    if (mode === "study") {
      pomodoroStats.totalStudyMinutes += MODES.study.duration / 60;
    }

    savePomodoroStats();
    updatePomodoroStatsUI();
  }

  if (mode === "focus" || mode === "study") {
    lastWorkMode = mode;
    mode = "break";
  } else {
    mode = lastWorkMode;
  }

  timers[mode] = MODES[mode].duration;

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
  const newMode = activeBtn.dataset.mode;

  // Agar already running hai to mode change allow mat karo
  if (timer) {
    alert("Timer chal raha hai. Pehle pause karo.");
    return;
  }

  mode = newMode;

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


// ===== Assignments Logic =====

(function assignmentLogic() {
  const titleInput = document.querySelector(".assignment-title");
  const dateInput = document.querySelector(".assignment-date");
  const addBtn = document.querySelector(".assignment-add");
  const listEl = document.querySelector(".assignment-list");

  let assignments = JSON.parse(localStorage.getItem("PDassignments")) || [];

  renderAssignments();

  addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const dueDate = dateInput.value;
    console.log(dueDate);
    

    if (!title || !dueDate) {
      alert("Title and due date both required...");
      return;
    }

    const assignment = {
      id: Date.now(),
      title,
      dueDate,
      createdAt: Date.now(),
    };

    assignments.push(assignment);
    saveAssignments();
    renderAssignments();

    titleInput.value = "";
    dateInput.value = "";
  });

  function saveAssignments() {
    localStorage.setItem("PDassignments", JSON.stringify(assignments));
  }

  function renderAssignments() {
    listEl.innerHTML = "";

    if (assignments.length === 0) {
      listEl.innerHTML = `<small style="opacity:0.6;">No assignments added</small>`;
      return;
    }

    assignments.forEach((item) => {
      const el = createAssignmentElement(item);
      listEl.appendChild(el);
    });
  }

  function createAssignmentElement(item) {
    const wrapper = document.createElement("div");
    wrapper.className = "assignment-item";

    const statusClass = getUrgencyClass(item.dueDate);
    wrapper.classList.add(statusClass);

    const left = document.createElement("span");
    left.innerText = item.title;

    const right = document.createElement("small");
    right.innerText = getDueLabel(item.dueDate);

    const delBtn = document.createElement("button");
    delBtn.className = "assignment-delete";
    delBtn.innerText = "✕";

    delBtn.addEventListener("click", () => {
      assignments = assignments.filter((a) => a.id !== item.id);
      saveAssignments();
      renderAssignments();
    });

    wrapper.appendChild(left);
    wrapper.appendChild(right);
    wrapper.appendChild(delBtn);

    return wrapper;
  }

  function getUrgencyClass(dueDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "urgent";        // today or overdue
    if (diffDays === 1) return "warning";      // tomorrow
    return "normal";                           // later
  }

  function getDueLabel(dueDateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "Due Tomorrow";
    return `${diffDays} days left`;
  }
})();





const scheduleList = document.querySelector(".schedule-list");
const timeInput = document.getElementById("scheduleTime");
const titleInput = document.getElementById("scheduleTitle");
const descInput = document.getElementById("scheduleDesc");
const addScheduleBtn = document.getElementById("addScheduleBtn");

let schedules = JSON.parse(localStorage.getItem("todaySchedule")) || [];

function saveSchedules() {
  localStorage.setItem("todaySchedule", JSON.stringify(schedules));
}

function getScheduleStatus(timeStr) {
  const now = new Date();
  const [h, m] = timeStr.split(":").map(Number);

  const eventTime = new Date();
  eventTime.setHours(h, m, 0, 0);

  const diff = eventTime - now;

  if (Math.abs(diff) <= 5 * 60 * 1000) return "now";
  if (diff < 0) return "past";
  return "upcoming";
}

function sortByTime(a, b) {
  return a.time.localeCompare(b.time);
}

function renderSchedule() {
  scheduleList.innerHTML = "";

  schedules.sort(sortByTime);

  schedules.forEach((item) => {
    const div = document.createElement("div");
    div.className = `schedule-item ${getScheduleStatus(item.time)}`;

    const timeSpan = document.createElement("span");
    timeSpan.className = "time";
    timeSpan.innerText = item.time;

    const infoDiv = document.createElement("div");
    const strong = document.createElement("strong");
    strong.innerText = item.title;

    const p = document.createElement("p");
    p.innerText = item.desc;

    infoDiv.appendChild(strong);
    infoDiv.appendChild(p);

    const delBtn = document.createElement("button");
    delBtn.className = "delete";
    delBtn.innerText = "✕";
    delBtn.onclick = () => {
      schedules = schedules.filter((s) => s.id !== item.id);
      saveSchedules();
      renderSchedule();
    };

    div.appendChild(timeSpan);
    div.appendChild(infoDiv);
    div.appendChild(delBtn);

    scheduleList.appendChild(div);
  });
}

addScheduleBtn.addEventListener("click", () => {
  const time = timeInput.value;
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();

  if (!time || !title) {
    alert("Time and Title required");
    return;
  }

  schedules.push({
    id: Date.now(),
    time,
    title,
    desc,
  });

  saveSchedules();
  renderSchedule();

  timeInput.value = "";
  titleInput.value = "";
  descInput.value = "";
});

renderSchedule();
setInterval(renderSchedule, 60 * 1000);




let rewardState = JSON.parse(localStorage.getItem("rewardState")) || {
  usedRewards: [],
  currentReward: null,
};

function saveRewardState() {
  localStorage.setItem("rewardState", JSON.stringify(rewardState));
}

function maybeUnlockReward(completedTaskCount) {
  completedCountEl.innerText = completedTaskCount;

  if (completedTaskCount > 0 && completedTaskCount % 3 === 0) {
    const available = REWARDS.filter(
      (r) => !rewardState.usedRewards.includes(r.text)
    );

    if (!available.length) {
      rewardTextEl.innerText = "All rewards used 🎉";
      rewardTimeEl.innerText = "";
      return;
    }

    const random = available[Math.floor(Math.random() * available.length)];
    rewardState.currentReward = random;
    saveRewardState();

    rewardTextEl.innerText = random.text;
    rewardTimeEl.innerText = random.time;
  }
}

claimRewardBtn.addEventListener("click", () => {
  if (!rewardState.currentReward) {
    alert("No reward unlocked yet.");
    return;
  }

  rewardState.usedRewards.push(rewardState.currentReward.text);
  rewardState.currentReward = null;
  saveRewardState();

  rewardTextEl.innerText = "Complete tasks to earn rewards!";
  rewardTimeEl.innerText = "";
});

resetRewardBtn.addEventListener("click", () => {
  rewardState = { usedRewards: [], currentReward: null };
  saveRewardState();
  rewardTextEl.innerText = "Rewards reset. Complete tasks!";
  rewardTimeEl.innerText = "";
});


function restoreRewardUI() {
  if (rewardState.currentReward) {
    rewardTextEl.innerText = rewardState.currentReward.text;
    rewardTimeEl.innerText = rewardState.currentReward.time;
  } else {
    rewardTextEl.innerText = "Complete tasks to earn rewards!";
    rewardTimeEl.innerText = "";
  }
}

restoreRewardUI();

const discardBtn = document.querySelector(".discard-btn")
console.log(discardBtn);



function resetAllData() {
  localStorage.removeItem("PDtodos");
  localStorage.removeItem("pomodoroState");
  localStorage.removeItem("pomodoroStats");
  localStorage.removeItem("PDassignments");
  localStorage.removeItem("todaySchedule");
  localStorage.removeItem("rewardState");

  location.reload();
}



discardBtn.addEventListener("click",function(){
  const ok = confirm("This will reset all your data. Are you sure?");
  if (!ok) return;

  resetAllData();
})



const themeToggleBtn = document.getElementById("themeToggle");

function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    themeToggleBtn.innerText = "☀️";
  } else {
    document.body.classList.remove("dark");
    themeToggleBtn.innerText = "🌙";
  }
}

const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark");
  const nextTheme = isDark ? "light" : "dark";
  localStorage.setItem("theme", nextTheme);
  applyTheme(nextTheme);
});
