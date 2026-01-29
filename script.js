
let realTime = document.querySelector(".time-card");
console.log(realTime);

const months = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

const days = [
  "Sunday","Monday","Tuesday","Wednesday",
  "Thursday","Friday","Saturday"
];


//date and time
function updateTime(){
let date = new Date();
let day = date.getDate();
let dayName = days[date.getDay()]
let currentMonth = months[date.getMonth()];
let year = date.getFullYear();
let hours = date.getHours();
let minutes = date.getMinutes();
let seconds = date.getSeconds();




//am pm
const ampm = hours >= 12 ? "PM" : "AM ";

// 12-hour conversion
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours

 // leading zero
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

realTime.innerHTML = ` <p class="label">Current Time</p>
         <h2>${hours}:${minutes}:${seconds} ${ampm}</h2>
        <span>${dayName}, ${day}, ${currentMonth}, ${year}</span>`;
}
setInterval(updateTime,1000)

//to-do list section

let todoInput = document.querySelector(".todoInput input");
let todoInputAddBtn = document.querySelector(".todoInput button");
let errorText = document.querySelector(".error-text");
let todoList = document.querySelector(".todo-list");

let allTodos = JSON.parse(localStorage.getItem("PDtodos")) || [];

renderTodos()

function LocalStorageSetItems(){
  localStorage.setItem("PDtodos", JSON.stringify(allTodos));
}

todoInputAddBtn.addEventListener("click",function(){
  let newTodo = todoInput.value.trim()
  console.log(newTodo);
  if(newTodo === ""){
    errorText.style.display = "block";
    return;
  }

  errorText.style.display = "none";

  let todoObj = {
    text:newTodo,
    Id:Date.now(),
    isCompleted:false
  }
  console.log(todoObj);

  allTodos.push(todoObj)
  LocalStorageSetItems();


  createTodoElements(todoObj)
})

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
  todoList.appendChild(li)

  return li;
}


function renderTodos() {
  todoList.innerHTML = ""; // clear first

  allTodos.forEach(todo => {
    const li = createTodoElements(todo);
    todoList.appendChild(li);
  });
}
