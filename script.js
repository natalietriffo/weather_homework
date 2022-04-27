var iconList = {
    "clear sky": "01d.png",
    "few clouds": "02.png",
    "scattered clouds": "03d.png",
    "broken clouds": "04d.png",
    "shower rain": "09d.png",
    "rain": "10d.png",
    "thunderstorm": "11d.png",
    "snow": "13d.png",
    "mist": "50d.png"
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();
    var dateString = mm + '/' + dd + '/' + yyyy;

    return dateString;
}

function init(){
    getWeatherData();
}
function getWeatherData(){

    var fromSearchHistory = false
    var fromInit = false
    var inputField;
    var searchHistoryEl = $("#searchHistory");
    var searchHistory = [];
    var cityHistory = localStorage.getItem("history");
    if (cityHistory !== null){
        searchHistory = JSON.parse(cityHistory);
        if (searchHistoryEl.children().length === 0){
            for(var i=0; i<searchHistory.length; i++){
                newHistory(searchHistory[i],searchHistoryEl);
            }
        }
    } else {
        console.log("no history found")
    }
     if (event === undefined){
        var cityName = localStorage.getItem("city");
      if (cityName === null){
    
             cityName = "Chicago"
        }
        fromInit = true;
    }

    else if ((event.target).nodeName === "LI"){
        fromSearchHistory = true
        var cityName = event.target.textContent;
    }
  
    else if ((event.target).nodeName === "BUTTON") {
        inputField = $("#citySearch")
        
        if (inputField[0].value === ""){
            return
        }
        var cityName = inputField[0].value;
    }

    var apiKey = "98e46e361787699b6e62a63c5142d5a0"
    var todayAPI = "https://api.openweathermap.org/data/2.5/weather?q="+cityName+"&appid="+apiKey;

    return $.ajax({
        url: todayAPI,
        method: "GET",
        dataType: "json",
    })

    .then(function (response) {
        var latCity = "" + response.coord.lat;
        var lonCity = "" + response.coord.lon;
        var cityName = response.name;
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;

        if ((!fromSearchHistory)&&(!fromInit)&&(!searchHistory.includes(cityName))){
            newHistory(cityName,searchHistoryEl);
            console.log(searchHistory);
            searchHistory.push(cityName);
            console.log(searchHistory);
            localStorage.setItem("history",JSON.stringify(searchHistory));
        }
        localStorage.setItem("city",cityName);

        var fiveDayAPI = "https://api.openweathermap.org/data/2.5/onecall?lat="+latCity+"&lon="+lonCity+"&exclude=minutely,hourly&units=imperial&appid="+apiKey;

        $.ajax({
            url: fiveDayAPI,
            method: "GET"
        })

        .then(function (response) {
            var currentWeather = response.current;
            var weatherDescription = currentWeather.weather[0].icon;
            var iconURL = "https://openweathermap.org/img/wn/" + weatherDescription + ".png";
            var currentConditions = "<img src='"+iconURL+"'>"
            $("#cityNameDay").html((cityName)+ " ("+today+") "+currentConditions);
            var currentTemp = currentWeather.temp;
            $("#temperature").text(currentTemp+" °F");
            var currentHumidity = currentWeather.humidity;
            $("#humidity").text(currentHumidity+"%");
            var currentWind = currentWeather.wind_speed;
            $("#windSpeed").text(currentWind+" mph");
            var currentUV = currentWeather.uvi;
            $("#uvIndex").addClass("button");
            $("#uvIndex").text(currentUV);
            $("#uvIndex").css("color","white");

            if (currentUV <= 2){
                $("#uvIndex").css("background-color","lightgreen");
            }
            else if (currentUV <= 8){
                $("#uvIndex").css("background-color","rgba(202, 202, 29, 0.701)");
            }
            else{
                $("#uvIndex").css("background-color","pink");
            }

            
            var dailyWeatherArray = response.daily; 
            for (var i = 1;i < 6;i++){
                var currentDay = dailyWeatherArray[i]
                
                var date = new Date();
                date = date.addDays(i);
                
                $(".date-"+i).text(date);
               
                var currentIcon = currentDay.weather[0].icon;
                var iconURL = "https://openweathermap.org/img/wn/" + currentIcon + ".png";
                $(".icon-"+i).attr("src",iconURL);
                
                var currentTemp = currentDay.temp.day;
                $(".temp-"+i).text("Temp: "+currentTemp+" °F");

                var currentHumidity = currentDay.humidity;
                $(".humidity-"+i).text("Humidity: "+currentHumidity+"%");
            }
        })
    })
}

function eraseWeatherData(){
    
    localStorage.removeItem("history");
    $("#searchHistory").empty();
    getWeatherData();
}

function newHistory(name,historyList){
    var search = $("<li>");
    search.addClass("list-group-item");


    search.text(name);
    historyList.append(search);
}

init();

$("#submitSearch").on("click",getWeatherData);

$("#searchHistory").on("click",getWeatherData);

$("#eraseHistory").on("click",eraseWeatherData);