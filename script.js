document.addEventListener('DOMContentLoaded', function() {
    const apiKey = "8fd3ee16a35404b103a491eef38a549e";
    const weatherDisplay = document.getElementById('weather-display');
    const forecastDisplay = document.getElementById('forecast-display');
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');
    const unitSelect = document.getElementById('unit-select');
    const favoritesList = document.getElementById('favorites-list');
    const addFavoriteBtn = document.getElementById('add-favorite-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const mapElement = document.getElementById('map');

    let currentUnit = 'metric';
    let currentCity = ''; 
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    let map;

    function setLoading(isLoading) {
        if (isLoading) {
            weatherDisplay.innerHTML = '<p>Loading...</p>';
            forecastDisplay.innerHTML = '<p>Loading...</p>';
        } else {
            weatherDisplay.innerHTML = '';
            forecastDisplay.innerHTML = '';
        }
    }

    function initializeMap(lat, lon) {
        if (!map) {
            map = L.map(mapElement).setView([lat, lon], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
        } else {
            map.setView([lat, lon], 10);
        }

        const weatherLayer = L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, {
            attribution: 'Map data &copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
            maxZoom: 19,
        });

        weatherLayer.addTo(map);
    }

    function fetchWeatherByCoords(lat, lon, unit) {
        setLoading(true);
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${unit}`;

        fetch(weatherApiUrl)
            .then(response => response.json())
            .then(data => {
                setLoading(false);
                if (data.cod === 200) {
                    currentCity = data.name;
                    displayWeather(data);
                    fetchForecast(data.coord.lat, data.coord.lon, unit);
                    initializeMap(lat, lon);
                } else {
                    handleError('Location not found. Please try again.');
                }
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                handleError('Failed to retrieve weather data. Please try again.');
            });
    }

    function fetchWeather(city, unit) {
        setLoading(true);
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${unit}`;

        fetch(weatherApiUrl)
            .then(response => response.json())
            .then(data => {
                setLoading(false);
                if (data.cod === 200) {
                    displayWeather(data);
                    fetchForecast(data.coord.lat, data.coord.lon, unit);
                    initializeMap(data.coord.lat, data.coord.lon);
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
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed.toFixed(1);
        const pressure = data.main.pressure;
        const city = data.name;
        const country = data.sys.country;
        const icon = data.weather[0].icon;

        weatherDisplay.innerHTML = `
            <h3>${city}, ${country}</h3>
            <p class="temperature">${temp}°${currentUnit === 'metric' ? 'C' : 'F'}</p>
            <p class="weather-description">${weatherDescription}</p>
            <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${weatherDescription}">
            <div class="weather-details">
                <p>Humidity: ${humidity}%</p>
                <p>Wind Speed: ${windSpeed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}</p>
                <p>Pressure: ${pressure} hPa</p>
            </div>
        `;
    }

    function displayForecast(data) {
        const forecastList = data.list.filter((_, index) => index % 8 === 0);
        const labels = forecastList.map(day => new Date(day.dt_txt).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        }));
        const temps = forecastList.map(day => day.main.temp.toFixed(1));

        forecastDisplay.innerHTML = `
            <canvas id="tempChart"></canvas>
        `;

        const ctx = document.getElementById('tempChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Temperature (${currentUnit === 'metric' ? '°C' : '°F'})`,
                    data: temps,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    fill: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    function handleError(message) {
        weatherDisplay.innerHTML = `<p class="error">${message}</p>`;
        forecastDisplay.innerHTML = '';
    }

    function renderFavorites() {
        favoritesList.innerHTML = favorites.map(city => `
            <div class="favorite-city" data-city="${city}" role="button" tabindex="0">${city}</div>
        `).join('');

        document.querySelectorAll('.favorite-city').forEach(cityElem => {
            cityElem.addEventListener('click', function() {
                currentCity = this.getAttribute('data-city');
                fetchWeather(currentCity, currentUnit);
            });
            cityElem.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    currentCity = this.getAttribute('data-city');
                    fetchWeather(currentCity, currentUnit);
                }
            });
        });
    }

    function addToFavorites() {
        if (currentCity && !favorites.includes(currentCity)) {
            favorites.push(currentCity);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            renderFavorites();
        }
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
    
    addFavoriteBtn.addEventListener('click', function() {
        addToFavorites();
    });
    
    themeToggle.addEventListener('change', function() {
        document.body.classList.toggle('light-theme', themeToggle.checked);
    });
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude, currentUnit);
        }, () => {
            fetchWeather(currentCity || "New York", currentUnit); // Fallback to default city
        });
    } else {
        fetchWeather(currentCity || "New York", currentUnit); // Fallback if geolocation is not supported
    }
    
    renderFavorites();
    
});