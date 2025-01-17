const apiKey = 'c6a47cde14f744826f9e82457fd3213b';
const content = document.getElementById('content');
const cityInput = document.getElementById('city-input');
const searchButton = document.getElementById('search-button');
const todayTab = document.getElementById('today-tab');
const forecastTab = document.getElementById('forecast-tab');

let currentCity = 'Rivne'; 

todayTab.addEventListener('click', () => {
  setActiveTab('today');
  showTodayWeather();
});

forecastTab.addEventListener('click', () => {
  setActiveTab('forecast');
  showForecastWeather();
});

searchButton.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    currentCity = city;
    showTodayWeather();
  }
});

function setActiveTab(tab) {
  if (tab === 'today') {
    todayTab.classList.add('active');
    forecastTab.classList.remove('active');
  } else {
    forecastTab.classList.add('active');
    todayTab.classList.remove('active');
  }
}

function fetchWeather(url) {
  return fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('City not found');
      return response.json();
    });
}

function showTodayWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${apiKey}&units=metric`;
  fetchWeather(url)
    .then(data => {
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const duration = calculateDayDuration(data.sys.sunrise, data.sys.sunset);

      content.innerHTML = `
        <div class="weather-card">
          <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon">
          <div class="temp">
            <h2>Today's Weather in ${data.name}</h2>
            <p>Temperature: ${Math.round(data.main.temp)}°C (Feels like: ${Math.round(data.main.feels_like)}°C)</p>
          </div>
          <div class="info">
            <p>Date: ${new Date().toLocaleDateString()}</p>
            <p>${data.weather[0].description} ${getWeatherEmoji(data.weather[0].main)}</p>
            <p>Sunrise: ${sunrise}</p>
            <p>Sunset: ${sunset}</p>
            <p>Day Duration: ${duration}</p>
          </div>
        </div>
        <div class="hourly-forecast">
          <h3>Hourly Forecast</h3>
          <div id="hourly-forecast-content"></div>
        </div>
        <div class="nearby-cities">
          <h3>Nearby Cities</h3>
          <div id="nearby-cities-content"></div>
        </div>
      `;

      showHourlyForecast();
      showNearbyCities();
    })
    .catch(err => {
      content.innerHTML = `<p>City could not be found 😢</p>`;
    });
}

function showHourlyForecast() {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${apiKey}&units=metric`;
  fetchWeather(url)
    .then(data => {
      const hourlyContent = document.getElementById('hourly-forecast-content');
      hourlyContent.innerHTML = '';

      data.list.slice(0, 8).forEach(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const hourCard = `
          <div class="hour-card">
            <p>${time}</p>
            <p><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="weather icon"> ${item.weather[0].description} ${getWeatherEmoji(item.weather[0].main)}</p>
            <p>Temperature: ${Math.round(item.main.temp)}°C (Feels like: ${Math.round(item.main.feels_like)}°C)</p>
            <p>Wind: ${item.wind.speed} m/s, ${item.wind.deg}°</p>
          </div>
        `;
        hourlyContent.innerHTML += hourCard;
      });
    })
    .catch(err => {
      const hourlyContent = document.getElementById('hourly-forecast-content');
      hourlyContent.innerHTML = `<p>Error fetching hourly forecast: ${err.message}</p>`;
    });
}

function showNearbyCities() {
  const nearbyCities = ['Dubno', 'Kostopil', 'Zdolbuniv']; // smaller nearby cities
  const nearbyContent = document.getElementById('nearby-cities-content');
  nearbyContent.innerHTML = '';

  nearbyCities.forEach(city => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    fetchWeather(url)
      .then(data => {
        const cityCard = `
          <div class="city-card">
            <p>${data.name}</p>
            <p><img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon"> ${Math.round(data.main.temp)}°C</p>
          </div>
        `;
        nearbyContent.innerHTML += cityCard;
      })
      .catch(err => {
        nearbyContent.innerHTML += `<p>Error fetching weather for ${city}: ${err.message}</p>`;
      });
  });
}

function showForecastWeather() {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${apiKey}&units=metric`;
  fetchWeather(url)
    .then(data => {
      content.innerHTML = '<h2>5-day Forecast</h2>';
      const forecastContent = document.createElement('div');
      forecastContent.classList.add('forecast-content');

      data.list.forEach((item, index) => {
        if (index % 8 === 0) { // Show forecast for every 24 hours
          const date = new Date(item.dt * 1000).toLocaleDateString();
          const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const forecastCard = `
            <div class="forecast-card">
              <p>${date} ${time}</p>
              <p><img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="weather icon"> ${item.weather[0].description} ${getWeatherEmoji(item.weather[0].main)}</p>
              <p>Temperature: ${Math.round(item.main.temp)}°C (Feels like: ${Math.round(item.main.feels_like)}°C)</p>
              <p>Wind: ${item.wind.speed} m/s, ${item.wind.deg}°</p>
            </div>
          `;
          forecastContent.innerHTML += forecastCard;
        }
      });

      content.appendChild(forecastContent);
    })
    .catch(err => {
      content.innerHTML = `<p>Error fetching forecast: ${err.message}</p>`;
    });
}

function calculateDayDuration(sunrise, sunset) {
  const duration = (sunset - sunrise) / 3600;
  const hours = Math.floor(duration);
  const minutes = Math.floor((duration - hours) * 60);
  return `${hours}h ${minutes}m`;
}

function getWeatherEmoji(weather) {
  switch (weather) {
    case 'Clear':
      return '☀️';
    case 'Clouds':
      return '☁️';
    case 'Rain':
      return '🌧️';
    case 'Snow':
      return '❄️';
    case 'Thunderstorm':
      return '⛈️';
    case 'Drizzle':
      return '🌦️';
    case 'Mist':
    case 'Fog':
      return '🌫️';
    default:
      return '';
  }
}

showTodayWeather();