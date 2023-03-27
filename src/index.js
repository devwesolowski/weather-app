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
      document.getElementById("current-temp").textContent =
        Math.floor(data.main.temp) + "°";
      document.getElementById("feels-like-temp").textContent =
        "Feels Like " + Math.floor(data.main.feels_like) + "°";
      //TODO
      //just noticed that the daily min/max seems to be for a range within a
      //certain timeframe? actual min is 49.. may need to pull from forecast
      document.getElementById("min-temp").textContent =
        Math.floor(data.main.temp_min) + "°";
      document.getElementById("max-temp").textContent =
        Math.floor(data.main.temp_max) + "°";
      //TODO
      //write function to decide image based on different descriptions
      document.getElementById("humidity").textContent = data.main.humidity;
      document.getElementById("wind").textContent = data.wind.speed;
      console.log(getSun(data.sys.sunrise));
      document.getElementById("sunrise").textContent = getSun(data.sys.sunrise);
      document.getElementById("sunset").textContent = getSun(data.sys.sunset);
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

function getSun(sun) {
  const time = new Date(sun * 1000).toLocaleTimeString("en-US", {
    timeStyle: "short",
  });
  return time;
}
