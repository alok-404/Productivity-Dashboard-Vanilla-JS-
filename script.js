
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
setInterval(updateTime, 1000);
