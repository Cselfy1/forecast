const API_KEY = "c6a47cde14f744826f9e82457fd3213b";
const todayTab = document.getElementById("today-tab");
const forecastTab = document.getElementById("forecast-tab");
const currentWeatherSection = document.getElementById("current-weather");
const forecastSection = document.getElementById("forecast");
const errorMessage = document.getElementById("error-message");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");

let currentCity = "Rivne";

// today's weather
async function fetchWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
    );
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    displayTodayWeather(data);
    fetchHourlyWeather(data.coord.lat, data.coord.lon);
    fetchNearbyCities(data.coord.lat, data.coord.lon);
  } catch (error) {
    showError();
  }
}

// 5-day forecast
async function fetch5DayForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
    );
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    display5DayForecast(data);
  } catch (error) {
    showError();
  }
}

// hourly weather
async function fetchHourlyWeather(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
  );
  const data = await response.json();
  displayHourlyWeather(data.list.slice(0, 8)); // 8 hours
}

// nearby cities
async function fetchNearbyCities(lat, lon) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=5&units=metric&appid=${API_KEY}`
  );
  const data = await response.json();
  displayNearbyCities(data.list);
}

function displayTodayWeather(data) {
  errorMessage.classList.add("hidden");
  currentWeatherSection.classList.remove("hidden");
  forecastSection.classList.add("hidden");

  // fill in weather data
  document.getElementById("city-name").textContent = data.name;
  document.getElementById("date").textContent = new Date().toLocaleDateString();
  document.getElementById("weather-icon").src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("temperature").textContent = Math.round(data.main.temp);
  document.getElementById("feels-like").textContent = Math.round(data.main.feels_like);
  document.getElementById("sunrise").textContent = new Date(
    data.sys.sunrise * 1000
  ).toLocaleTimeString();
  document.getElementById("sunset").textContent = new Date(
    data.sys.sunset * 1000
  ).toLocaleTimeString();
  const dayLength = (data.sys.sunset - data.sys.sunrise) / 3600;
  document.getElementById("day-length").textContent = `${dayLength.toFixed(2)} hours`;
}

// display hourly weather
function displayHourlyWeather(hourlyData) {
  const hourlyContainer = document.getElementById("hourly-container");
  hourlyContainer.innerHTML = "";
  hourlyData.forEach((hour) => {
    const card = document.createElement("div");
    card.className = "hourly-card";
    card.innerHTML = `
      <p>${new Date(hour.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
      <img src="http://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="Weather Icon">
      <p>${hour.weather[0].description}</p>
      <p>${Math.round(hour.main.temp)}°C</p>
      <p>Feels like: ${Math.round(hour.main.feels_like)}°C</p>
      <p>Wind: ${hour.wind.speed} m/s</p>
    `;
    hourlyContainer.appendChild(card);
  });
}

// display nearby cities
function displayNearbyCities(cities) {
  const nearbyContainer = document.getElementById("nearby-cities-container");
  nearbyContainer.innerHTML = "";
  cities.forEach((city) => {
    const card = document.createElement("div");
    card.className = "nearby-card";
    card.innerHTML = `
      <p>${city.name}</p>
      <img src="http://openweathermap.org/img/wn/${city.weather[0].icon}.png" alt="Weather Icon">
      <p>${Math.round(city.main.temp)}°C</p>
    `;
    nearbyContainer.appendChild(card);
  });
}

// display 5-day forecast
function display5DayForecast(data) {
  const forecastContainer = document.getElementById("forecast-container");
  forecastContainer.innerHTML = "";

  const dailyData = {};
  data.list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];
    if (!dailyData[date]) {
      dailyData[date] = item;
    }
  });

  Object.values(dailyData).forEach((day) => {
    const card = document.createElement("div");
    card.className = "forecast-card";
    card.innerHTML = `
      <p>${new Date(day.dt * 1000).toLocaleDateString()}</p>
      <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather Icon">
      <p>${day.weather[0].description}</p>
      <p>Temp: ${Math.round(day.main.temp)}°C</p>
    `;
    forecastContainer.appendChild(card);
  });
}

function showError() {
  errorMessage.classList.remove("hidden");
  currentWeatherSection.classList.add("hidden");
  forecastSection.classList.add("hidden");
}

searchButton.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
    fetch5DayForecast(city);
  }
});

todayTab.addEventListener("click", () => {
  todayTab.classList.add("active");
  forecastTab.classList.remove("active");
  currentWeatherSection.classList.remove("hidden");
  forecastSection.classList.add("hidden");
});

forecastTab.addEventListener("click", () => {
  todayTab.classList.remove("active");
  forecastTab.classList.add("active");
  currentWeatherSection.classList.add("hidden");
  forecastSection.classList.remove("hidden");
});

fetchWeather(currentCity);
fetch5DayForecast(currentCity);