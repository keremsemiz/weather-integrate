document.addEventListener('DOMContentLoaded', function() {
    const apiKey = "8fd3ee16a35404b103a491eef38a549e";
    const weatherDisplay = document.getElementById('weather-display');
    const forecastDisplay = document.getElementById('forecast-display');
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const unitSelect = document.getElementById('unit-select');

    let currentUnit = 'metric'; 
    let currentCity = 'New York'; 

    function fetchWeather(city, unit) {
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;

        fetch(weatherApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    displayWeather(data);
                    fetchForecast(data.coord.lat, data.coord.lon, unit);
                } else {
                    handleError('City not found. Please try again.');
                }
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                handleError('Failed to retrieve weather data. Please try again.');
            });
    }

    function fetchForecast(lat, lon, unit) {
        const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;

        fetch(forecastApiUrl)
            .then(response => response.json())
            .then(data => {
                displayForecast(data);
            })
            .catch(error => {
                console.error("Error fetching forecast data:", error);
                handleError('Failed to retrieve forecast data. Please try again.');
            });
    }

    function displayWeather(data) {
        const temp = data.main.temp.toFixed(1);
        const weatherDescription = data.weather[0].description;
        const city = data.name;
        const country = data.sys.country;
        const icon = data.weather[0].icon;

        weatherDisplay.innerHTML = `
            <h3>${city}, ${country}</h3>
            <p class="temperature">${temp}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
            <p class="weather-description">${weatherDescription}</p>
            <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${weatherDescription}">
        `;
    }

    function displayForecast(data) {
        const forecastList = data.list.filter((_, index) => index % 8 === 0);
        forecastDisplay.innerHTML = forecastList.map(day => {
            const date = new Date(day.dt_txt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
            const temp = day.main.temp.toFixed(1);
            const icon = day.weather[0].icon;
            const description = day.weather[0].description;

            return `
                <div class="forecast-card">
                    <h4>${date}</h4>
                    <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
                    <p>${temp}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
                    <p>${description}</p>
                </div>
            `;
        }).join('');
    }

    function handleError(message) {
        weatherDisplay.innerHTML = `<p class="error">${message}</p>`;
        forecastDisplay.innerHTML = '';
    }

    searchBtn.addEventListener('click', function() {
        const city = cityInput.value.trim();
        if (city) {
            currentCity = city;
            fetchWeather(city, currentUnit);
        } else {
            handleError('Please enter a city name.');
        }
    });

    unitSelect.addEventListener('change', function() {
        currentUnit = unitSelect.value;
        fetchWeather(currentCity, currentUnit); 
    });
    fetchWeather(currentCity, currentUnit);
});
