document.addEventListener('DOMContentLoaded', function() {
    const apiKey = "8fd3ee16a35404b103a491eef38a549e";
    const weatherDisplay = document.getElementById('weather-display');
    const searchBtn = document.getElementById('search-btn');
    const cityInput = document.getElementById('city-input');

    function fetchWeather(city) {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                displayWeather(data);
            })
            .catch(error => {
                console.error("Error fetching weather data:", error);
                weatherDisplay.innerHTML = `<p class="error">Failed to retrieve weather data. Please try again.</p>`;
            });
    }

    function displayWeather(data) {
        if (data.cod === 200) {
            const temp = data.main.temp.toFixed(1);
            const weatherDescription = data.weather[0].description;
            const city = data.name;
            const country = data.sys.country;
            const icon = data.weather[0].icon;

            weatherDisplay.innerHTML = `
                <h3>${city}, ${country}</h3>
                <p class="temperature">${temp}°C</p>
                <p class="weather-description">${weatherDescription}</p>
                <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${weatherDescription}">
            `;
        } else {
            weatherDisplay.innerHTML = `<p class="error">City not found. Please try again.</p>`;
        }
    }

    searchBtn.addEventListener('click', function() {
        const city = cityInput.value.trim();
        if (city) {
            fetchWeather(city);
        } else {
            weatherDisplay.innerHTML = `<p class="error">Please enter a city name.</p>`;
        }
    });

    fetchWeather("New York");
});
