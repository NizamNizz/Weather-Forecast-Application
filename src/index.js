const apiKey = '7be4b62cc2b01d0fd844b4dec5d30d1e';

document.getElementById('search-btn').addEventListener('click', () => {
  const city = document.getElementById('city-input').value;
  if (city) {
    fetchWeatherByCity(city);
  } else {
    alert('Please enter a city name');
  }
});

document.getElementById('current-location-btn').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      fetchWeatherByLocation(position.coords.latitude, position.coords.longitude);
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
});

function fetchWeatherByCity(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      if (data.cod === 200) {
        displayWeather(data);
        saveRecentCity(city);
        updateRecentCitiesDropdown();
      } else {
        alert(data.message);
      }
    })
    .catch(error => console.error('Error fetching weather data:', error));
}

function fetchWeatherByLocation(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      if (data.cod === 200) {
        displayWeather(data);
      } else {
        alert(data.message);
      }
    })
    .catch(error => console.error('Error fetching weather data:', error));
}

function displayWeather(data) {
  const weatherInfo = document.getElementById('weather-info');
  weatherInfo.innerHTML = `
    <h2 class="text-xl font-bold">${data.name}</h2>
    <p>Temperature: ${data.main.temp.toFixed(1)}°C</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
    <p>${data.weather[0].description.charAt(0).toUpperCase() + data.weather[0].description.slice(1)}</p>
  `;
  displayExtendedForecast(data.coord.lat, data.coord.lon);
}

function displayExtendedForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(response => response.json())
    .then(data => {
      const extendedForecast = document.getElementById('extended-forecast');
      extendedForecast.innerHTML = '<h3 class="text-lg font-bold">5-Day Forecast</h3>';
      for (let i = 0; i < data.list.length; i += 8) {
        const forecast = data.list[i];
        const date = new Date(forecast.dt * 1000);
        extendedForecast.innerHTML += `
          <div class="flex items-center justify-between mb-2">
            <p>${date.toDateString()}</p>
            <img src="http://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="${forecast.weather[0].description}">
            <p>${forecast.main.temp.toFixed(1)}°C</p>
            <p>Wind: ${forecast.wind.speed} m/s</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
          </div>
        `;
      }
    })
    .catch(error => console.error('Error fetching extended forecast:', error));
}

function saveRecentCity(city) {
  let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!recentCities.includes(city)) {
    recentCities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
  }
}

function updateRecentCitiesDropdown() {
  const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  const dropdown = document.getElementById('recent-cities-dropdown');
  const select = document.getElementById('recent-cities');
  select.innerHTML = '';

  if (recentCities.length > 0) {
    dropdown.classList.remove('hidden');
    recentCities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      select.appendChild(option);
    });

    select.addEventListener('change', (e) => {
      fetchWeatherByCity(e.target.value);
    });
  } else {
    dropdown.classList.add('hidden');
  }
}

updateRecentCitiesDropdown();
