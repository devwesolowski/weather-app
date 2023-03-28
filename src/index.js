const api = "https://api.openweathermap.org/data/2.5";
const token = "";
const zip = 75071;
const searchbar = document.getElementById("searchbar");

document.addEventListener("DOMContentLoaded", () => {
  getWeather(zip);
  getForecast(zip);

  //TODO Logic to check zip code is valid 5 digit before sending through.
  //TODO Also logic what to do if zipcode is invalid, DONT load anything.

  searchbar.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      console.log(`Grabbing Weather for zip: ${searchbar.value}`);
      getWeather(searchbar.value);
      pushForecast(searchbar.value);
    }
  });
});

//TODO Background at Night and Night Logos
// grabs the mock data we have saved for now, assigns it to variable for use
function getWeather(zip) {
  fetch(`${api}/weather?zip=${zip}&appid=${token}&units=imperial`)
    // fetch("mockWeather.json")
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
      document.getElementById("weather-description").textContent =
        parseWeatherDescription(data.weather[0].description);

      document.getElementById("weather-icon").src = getWeatherIcon(
        data.weather[0].description
      );

      console.log(`Todays Weather Rendered`);
      console.log(data);
    })
    .catch((error) => console.error(error));
}

//requests and parses forecast data
function getForecast(zip) {
  fetch(`${api}/forecast?zip=${zip}&appid=${token}&units=imperial`)
    // fetch("mockForecast.json")
    .then((response) => response.json())
    .then((data) => {
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
      console.log(`Weeks Forecast Rendered`);
    })
    .catch((error) => console.error(error));
}

function pushForecast(zip) {
  const weatherColumn = document.querySelector("ul.daily-weather-list");
  console.log(weatherColumn);
  // Remove all child nodes of the ul element
  while (weatherColumn.firstChild) {
    weatherColumn.removeChild(weatherColumn.firstChild);
  }
  console.log(`Deleted Old HTML, Rendering New`);
  getForecast(zip);
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

//builds and injects daily forecast
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

  const tempMinValue = document.createElement("span");
  tempMinValue.className = "temp-min-value";
  tempMinValue.textContent = Math.floor(data.temp_min) + "°";

  const dailyWeatherIcon = document.createElement("img");
  dailyWeatherIcon.alt = "Daily Weather";
  dailyWeatherIcon.className = "daily-weather-icon";
  dailyWeatherIcon.src = getWeatherIcon(data.weather[0].description);

  list.append(weatherColumn);
  weatherColumn.append(columnWrapper);
  columnWrapper.append(dailyLabel, dailyTempMax, dailyTempMin, dailyIcon);
  dailyTempMax.append(tempMaxValue);
  dailyTempMin.append(tempMinValue);
  dailyIcon.append(dailyWeatherIcon);
}

function getWeatherIcon(weather) {
  switch (weather) {
    case "sky is clear":
      return "content/sunny.png";
    case "clear sky":
      return "content/sunny.png";
    case "few clouds":
      return "content/mostlySunny.png";
    case "scattered clouds":
      return "content/partlyCloudy.png";
    case "broken clouds":
      return "content/partlyCloudy.png";
    case "overcast clouds":
      return "content/cloudy.png";
    case "light rain":
      return "content/lightRain.png";
    case "moderate rain":
      return "content/moderateRain.png";
    case "very heavy rain":
      return "content/heavyRain.png";
    case "heavy intensity rain":
      return "content/heavyIntensityRain.png";
    case "light snow":
      return "content/snow.png";
    case "heavy snow":
      return "content/snow.png";
    default:
      return "content/sunny.png";
  }
}

function parseWeatherDescription(weather) {
  switch (weather) {
    case "clear sky":
      return "Clear Sky";
    case "few clouds":
      return "Partly Sunny";
    case "scattered clouds":
      return "Partly Cloudy";
    case "broken clouds":
      return "Partly Cloudy";
    case "overcast clouds":
      return "Cloudy";
    case "light rain":
      return "Light Rain";
    case "moderate rain":
      return "Showers";
    case "very heavy rain":
      return "Storms";
    case "heavy intensity rain":
      return "Thunder Storms";
    case "light snow":
      return "Light Snow";
    case "heavy snow":
      return "Heavy Snow";
    default:
      return "Sunny";
  }
}
