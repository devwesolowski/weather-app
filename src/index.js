const api = "https://api.openweathermap.org/data/2.5";
const apiWeather = "/weather";
const apiForecast = "/forecast";

// let currentTemp;
// let weatherDescription;
// let feelsLikeTemp;
// let minTemp;
// let maxTemp;
// let weatherIcon;
// let humidity;
// let wind;
// let uvIndex;
// let visibility;
// let location;

document.addEventListener("DOMContentLoaded", () => {
  getWeather();
});

// grabs the mock data we have saved for now, assigns it to variable for use
function getWeather() {
  fetch("mockWeather.json")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("location").textContent = data.name + " Weather";
      //   document.getElementById("current-temp").textContent = "";
    })
    .catch((error) => console.error(error));
}

//requests and parses forecast data
function requestForecast() {
  fetch("mockForecast.json")
    .then((response) => response.json())
    .then((data) => {
      //
    })
    .catch((error) => console.error(error));
}
