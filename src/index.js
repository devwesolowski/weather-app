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
  requestForecast();
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
      document.getElementById("sunrise").textContent = getTime(
        data.sys.sunrise
      );
      document.getElementById("sunset").textContent = getTime(data.sys.sunset);
    })
    .catch((error) => console.error(error));
}

//requests and parses forecast data
function requestForecast() {
  fetch("mockForecast.json")
    .then((response) => response.json())
    .then((data) => {
      //TODO: Get Todays DAY and if result matches today, ignore it in the filter
      //We technically dont have low history from the API for today, only continuing
      //for the remainder of the day

      //first filters through object to pull arrays where time matches 1PM
      //we are getting the data for 5 day at 1pm each day
      const filteredData = data.list
        .filter((item) => getTime(item.dt) === "1:00 PM")
        .map((item) => item);
      const lowHighTemp = getLowHighTemp(data);

      //Filters through each key in the filteredData JSON object, then applies
      //the temps to new properties within the keys array
      Object.keys(filteredData).forEach((key, i) => {
        filteredData[key].temp_min = lowHighTemp[i][0];
        filteredData[key].temp_max = lowHighTemp[i][1];
      });

      //runs through each array and renders using its data
      filteredData.forEach((n) => renderForecast(n));
    })
    .catch((error) => console.error(error));
}

function getLowHighTemp(data) {
  // Group data by day
  const groupedData = data.list.reduce((acc, curr) => {
    const date = new Date(curr.dt * 1000);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const key = `${year}-${month}-${day}`;

    if (!acc[key]) {
      acc[key] = [];
    }

    acc[key].push(curr);

    return acc;
  }, {});

  // Find the array with the lowest temp_min for each day
  const low = Object.values(groupedData).map((dayData) => {
    const lowestTemp = dayData.reduce((min, curr) => {
      return curr.main.temp < min ? curr.main.temp : min;
    }, Infinity);

    return dayData.find((item) => item.main.temp === lowestTemp);
  });

  // Find the array with the highest temp_max for each day
  const high = Object.values(groupedData).map((dayData) => {
    const highestTemp = dayData.reduce((max, curr) => {
      return curr.main.temp > max ? curr.main.temp : max;
    }, -Infinity);

    return dayData.find((item) => item.main.temp === highestTemp);
  });

  //combines the low and high temp into an array for use
  const combined = [];
  for (let i = 0; i < low.length; i++) {
    combined.push([low[i].main.temp, high[i].main.temp]);
  }
  return combined;
}

function getTime(dt) {
  //sunset/sunrise already provided in zipcodes timezone
  const time = new Date(dt * 1000).toLocaleTimeString("en-US", {
    timeStyle: "short",
  });
  return time;
}

//todo timezone change for daylights?
//information is given in UTC, convert to timezone then parses data.
function convertDate(dt) {
  const date = new Date(dt * 1000);

  const dayOfWeek = date.toLocaleString("en-US", { weekday: "short" });
  const day = date.getDate();
  let newDate = "" + dayOfWeek;
  newDate = dayOfWeek.substring(0, 3);
  newDate += " " + day;
  return newDate;
}

function renderForecast(data) {
  const list = document.querySelector(".daily-weather-list");
  const weatherColumn = document.createElement("li");
  weatherColumn.className = "weather-column";

  const columnWrapper = document.createElement("div");
  columnWrapper.className = "column-wrapper";

  const dailyLabel = document.createElement("h3");
  dailyLabel.className = "label";
  dailyLabel.textContent = convertDate(data.dt);

  const dailyTempMax = document.createElement("div");
  dailyTempMax.className = "daily-temp-max";

  const dailyTempMin = document.createElement("div");
  dailyTempMin.className = "daily-temp-min";

  const dailyIcon = document.createElement("div");
  dailyIcon.className = "daily-icon";

  const tempMaxValue = document.createElement("span");
  tempMaxValue.className = "temp-max-value";
  tempMaxValue.textContent = Math.floor(data.temp_max) + "°";

  //TODO Just noticed temp_min is same for each... may need to do additional logic to pull two arrays
  // one with min temp for the day and one with max temp for the day
  const tempMinValue = document.createElement("span");
  tempMinValue.className = "temp-min-value";
  tempMinValue.textContent = Math.floor(data.temp_min) + "°";

  //TODO Logic for Images
  const dailyWeatherIcon = document.createElement("img");
  dailyWeatherIcon.src = "content/thunderstorms.png";
  dailyWeatherIcon.alt = "Daily Weather";
  dailyWeatherIcon.className = "daily-weather-icon";

  list.append(weatherColumn);
  weatherColumn.append(columnWrapper);
  columnWrapper.append(dailyLabel, dailyTempMax, dailyTempMin, dailyIcon);
  dailyTempMax.append(tempMaxValue);
  dailyTempMin.append(tempMinValue);
  dailyIcon.append(dailyWeatherIcon);
}
