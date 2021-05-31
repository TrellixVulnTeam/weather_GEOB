'use strict'
import "./styles/index.scss";

let  town = ''
 function getLocation() {
   if (navigator.geolocation) {
   navigator.geolocation.getCurrentPosition(position => {
    let coords = position.coords.latitude + '.' + position.coords.longitude;
    const currentCity = getCityName(coords)
    getApiData(currentCity); 
 }, error => {
   console.error(error)
 })
}
 }
document.addEventListener("DOMContentLoaded", getLocation)

function getCityName(coords) {
fetch(`https://geolocation-db.com/json/${coords}`)
.then(function (response) {
  if (response.status !== 200) {
    alert('err')
    return
  };
  response.json().then(function (data) {
    console.log(data.city)
  });
})


let city = 'moscow'
let bck = ''

document.querySelector('.location').onclick = function() {
  getLocation()
}

function changeCity() {
  let value = document.querySelector('.cityInput').value;
  city = value;
  getApiData(city);
}


document.querySelector('.changeCityBtn').onclick = function() {
  changeCity()
}

function getApiData() {
  let currentWether = []
  let lon = ''
  let lat = ''

fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric,{state%20code}&appid=7a272ee75ecd163ddfed4a4a57d3e611&lang=ru`)

.then(function (response) {
  if (response.status !== 200) {
    alert('err')
    return
  };
  response.json().then(function (data) {
    currentWether = data;
    lon = currentWether.coord.lon.toString().slice(0,5)
    lat = currentWether.coord.lat.toString().slice(0,5)
    bck = currentWether.weather[0].description
    setBckground(bck)
    renderCurrentWether(currentWether)

fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${Number(lat)}&lon=${Number(lon)}&exclude=hourly&appid=7a272ee75ecd163ddfed4a4a57d3e611&lang=ru`)

.then(function (response) {
  response.json().then(function (data) {
    let daily = []
    for (let i=0; i<8; i++) {
      let customObject = {
        ["day"]: getDay(data.daily[i].dt),
        ["icon"]: `http://openweathermap.org/img/wn/${data.daily[i].weather[0].icon}@2x.png`,
        ["temp"]: data.daily[i].temp.day
      }
      daily.push(customObject)
    }
    renderDailyInfo(daily)
  })
})

fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${Number(lat)}&lon=${Number(lon)}&exclude=daily&appid=7a272ee75ecd163ddfed4a4a57d3e611&lang=ru`) 

.then(function (response) {
  response.json().then(function (data) {
    let hourly = []
    for (let i=0; i < 12; i++) {
      let customObject = {
        ["day"]: getHour(data.hourly[i].dt),
        // ["mainInfo"]: data.hourly[i].weather[0].description,
        ["icon"]: `http://openweathermap.org/img/wn/${data.hourly[i].weather[0].icon}@2x.png`,
        ["temp"]: data.hourly[i].temp
      }
      hourly.push(customObject)
    }
    renderHourlyInfo(hourly)
  })
})

.catch(function(err) {  
    console.log('Fetch Error :-S', err);  
  });
  })
})
}



function renderCurrentWether(currentWether) {
  document.querySelector('.current__city').textContent = currentWether.name;
  document.querySelector('.current__day').textContent = getDay(currentWether.dt) + ' ' + getMounth(currentWether.dt) + ' ' + getHour(currentWether.dt) +':00';
  document.querySelector('.current__temp').textContent = Math.round(currentWether.main.temp -273.15 );
  document.querySelector('.current__mainInfo').textContent = currentWether.weather[0].description + ', ' + 'ощущается: '+ Math.round(currentWether.main.feels_like -273.15) + ', '+ 'скорость ветра: '+ currentWether.wind.speed + ' м/с';
  
  const element = document.createElement('div');
  element.innerHTML = `
  <img class="current__icon" src=${`http://openweathermap.org/img/wn/${currentWether.weather[0].icon}@2x.png`}>
  `;
  document.querySelector(".current__icon").replaceWith(element);
  console.log(element)
};



function setBckground(data) {
  if (data === 'пасмурно') {
   document.getElementById("current").className = "current bckDark"
  } else if (data === 'небольшая облачность' || 'облачно с прояснениями' || 'переменная облачность') {
    document.getElementById("current").className = "current bckCloudy"
  } else if (data === 'ясно'){
    document.getElementById("current").className =  "current bckClear"
  } else {
    document.getElementById("current").className =  "current"
  }
}
getApiData()


function getHour(timestamp) {
  let i = new Date(timestamp * 1000);
  let hour = i.getHours()
  return hour
}
function getDay(timestamp) {
  let i = new Date(timestamp * 1000);
  let day = i.getDate()
  return day
}
function getMounth(timestamp) {
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let i = new Date(timestamp * 1000);
  let mounth = months[i.getMonth()];
  return mounth
}

  class CreateItem {
    constructor(day, temp, icon, parentSelector, ...classes) {
      this.day = day;
      this.temp = Math.round(temp -273.15 );
      this.icon = icon;
      this.classes = classes;
      this.parent = document.querySelector(parentSelector)
    }
    render() {
      const element = document.createElement('div');
      this.classes.forEach(className => element.classList.add(className));
        element.innerHTML = `
        <div  class="day">${this.day}</div>
        <img class="icon" src=${this.icon}>
        <div class="temp">${this.temp}</div>
        `
        this.parent.append(element);

    }

  }

  
function renderDailyInfo(daily) {
  let element = document.querySelector(".daily");
while (element.firstChild) {
  element.removeChild(element.firstChild);
}
  for (let i=0; i<daily.length; i++) {
    new CreateItem(daily[i].day,daily[i].temp, daily[i].icon, ".daily", "item").render();

  }
}
function renderHourlyInfo(hourly) {
  let element = document.querySelector(".hourly");
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
  for (let i=0; i<hourly.length; i++)  {
    new CreateItem(hourly[i].day,  hourly[i].temp, hourly[i].icon, ".hourly", "item").render();
  }
}
}