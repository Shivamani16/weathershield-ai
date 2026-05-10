import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import L from "leaflet";
import "leaflet/dist/leaflet.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function App() {

  const [city, setCity] = useState("Hyderabad");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [search, setSearch] = useState("");
  const [disasters, setDisasters] = useState([]);

  // AI Assistant
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  // Current Weather
  const getWeather = async () => {

    try {

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );

      const data = await response.json();

      setWeather(data);

    } catch (error) {
      console.log(error);
    }
  };

  // Forecast
  const getForecast = async () => {

    try {

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
      );

      const data = await response.json();

      const dailyData = data.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );

      setForecast(dailyData);

    } catch (error) {
      console.log(error);
    }
  };

  // Location Weather
  const getLocationWeather = () => {

    navigator.geolocation.getCurrentPosition(async (position) => {

      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const data = await response.json();

        setWeather(data);
        setCity(data.name);

      } catch (error) {
        console.log(error);
      }

    });

  };

  // Disaster Alerts
  const getDisasterAlerts = async () => {

    try {

      const response = await fetch(
        "https://eonet.gsfc.nasa.gov/api/v3/events"
      );

      const data = await response.json();

      setDisasters(data.events.slice(0, 6));

    } catch (error) {
      console.log(error);
    }
  };

  // Dynamic Background
  const getBackground = () => {

    if (!weather) {
      return "bg-slate-950";
    }

    const condition = weather.weather[0].main;

    switch (condition) {

      case "Clear":
        return "bg-gradient-to-br from-orange-400 via-yellow-300 to-blue-400";

      case "Clouds":
        return "bg-gradient-to-br from-gray-700 via-slate-600 to-gray-800";

      case "Rain":
        return "bg-gradient-to-br from-slate-900 via-blue-900 to-gray-900";

      case "Thunderstorm":
        return "bg-gradient-to-br from-black via-gray-900 to-slate-950";

      case "Snow":
        return "bg-gradient-to-br from-cyan-200 via-blue-200 to-slate-300";

      default:
        return "bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950";
    }
  };

  // Chart Data
  const chartData = forecast.map((item) => ({
    day: new Date(item.dt_txt).toLocaleDateString("en-US", {
      weekday: "short",
    }),
    temp: Math.round(item.main.temp),
  }));

  // Voice Recognition
  const startListening = () => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.onresult = (event) => {

      const transcript = event.results[0][0].transcript;

      setQuestion(transcript);
    };

    recognition.start();
  };

  // AI Assistant
  const handleAskAI = () => {

    if (!weather) return;

    const temp = weather.main.temp;
    const condition = weather.weather[0].main;

    let response = "";

    if (question.toLowerCase().includes("rain")) {

      response =
        condition === "Rain"
          ? "Yes, it looks rainy today."
          : "No, there is no rain expected currently.";

    } else if (question.toLowerCase().includes("hot")) {

      response =
        temp > 30
          ? "Yes, it's quite hot outside."
          : "No, the weather feels moderate.";

    } else if (question.toLowerCase().includes("cold")) {

      response =
        temp < 20
          ? "Yes, it's pretty cold outside."
          : "No, the temperature is comfortable.";

    } else {

      response =
        `Current weather in ${weather.name} is ${condition} with ${Math.round(temp)} degrees Celsius.`;
    }

    setAnswer(response);

    // Female Voice
    const speech = new SpeechSynthesisUtterance(response);

    speech.lang = "en-US";
    speech.pitch = 1.2;
    speech.rate = 0.9;
    speech.volume = 1;

    const voices = window.speechSynthesis.getVoices();

    const femaleVoice =
      voices.find((voice) =>
        voice.name.includes("Google UK English Female")
      ) ||
      voices.find((voice) =>
        voice.name.includes("Samantha")
      ) ||
      voices.find((voice) =>
        voice.name.includes("Zira")
      );

    if (femaleVoice) {
      speech.voice = femaleVoice;
    }

    window.speechSynthesis.speak(speech);
  };

  // Initial Load
  useEffect(() => {

    getLocationWeather();
    getDisasterAlerts();

  }, []);

  // Weather Update
  useEffect(() => {

    getWeather();
    getForecast();

  }, [city]);

  // Search
  const handleSearch = () => {

    if (search !== "") {

      setCity(search);
      setSearch("");

    }
  };

  return (

    <div className={`min-h-screen ${getBackground()} text-white transition-all duration-1000 overflow-x-hidden`}>

      {/* Navbar */}
      <nav className="flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-5 border-b border-white/10 backdrop-blur-lg gap-4">

        <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-center">
          WeatherShield AI 🌦️
        </h1>

        <button className="bg-blue-500 hover:bg-blue-600 transition px-5 py-2 rounded-full font-semibold shadow-lg text-sm md:text-base">
          Live Weather
        </button>

      </nav>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">

        {/* Heading */}
        <div className="text-center mb-12">

          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Real-Time Weather Dashboard
          </h2>

          <p className="text-slate-200 text-lg">
            Live forecasts, disaster alerts & AI powered weather monitoring
          </p>

        </div>

        {/* Search */}
        <div className="flex justify-center mb-12">

          <div className="bg-white/10 backdrop-blur-lg p-3 rounded-2xl flex flex-col md:flex-row gap-3 w-full max-w-2xl border border-white/10 shadow-lg">

            <input
              type="text"
              placeholder="Search city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white placeholder:text-slate-300 px-4 py-3"
            />

            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 transition px-6 py-3 rounded-xl font-semibold w-full md:w-auto"
            >
              Search
            </button>

          </div>

        </div>

        {/* Weather Card */}
        {weather && weather.main && (

          <div className="max-w-3xl mx-auto mb-16">

            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-5 md:p-8 border border-white/10 shadow-2xl">

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 text-center md:text-left">

                <div>

                  <h3 className="text-3xl md:text-4xl font-bold">
                    {weather.name}
                  </h3>

                  <p className="text-slate-200 mt-2 text-lg">
                    {weather.weather[0].main}
                  </p>

                </div>

                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt="weather"
                />

              </div>

              <h1 className="text-5xl md:text-7xl font-bold mb-8 text-center md:text-left">
                {Math.round(weather.main.temp)}°C
              </h1>

            </div>

          </div>

        )}

        {/* AI Assistant */}
        <div className="max-w-4xl mx-auto mb-20">

          <h2 className="text-4xl font-bold mb-8 text-center">
            AI Weather Assistant 🤖
          </h2>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-5 md:p-8 border border-white/10 shadow-2xl">

            <div className="flex flex-col md:flex-row gap-4 mb-6">

              <input
                type="text"
                placeholder="Ask about weather..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 outline-none text-white placeholder:text-slate-300"
              />

              <button
                onClick={handleAskAI}
                className="bg-purple-500 hover:bg-purple-600 transition px-5 py-3 rounded-xl font-semibold w-full md:w-auto"
              >
                Ask AI
              </button>

              <button
                onClick={startListening}
                className="bg-pink-500 hover:bg-pink-600 transition px-5 py-3 rounded-xl font-semibold w-full md:w-auto"
              >
                🎤 Speak
              </button>

            </div>

            {answer && (

              <div className="bg-white/10 rounded-2xl p-6 text-lg">
                {answer}
              </div>

            )}

          </div>

        </div>

        {/* Forecast */}
        <div className="max-w-6xl mx-auto mb-20">

          <h2 className="text-4xl font-bold mb-8 text-center">
            5-Day Forecast 🌤️
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

            {forecast.map((item, index) => (

              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-3xl p-5 md:p-6 border border-white/10 text-center hover:scale-105 transition duration-300 shadow-lg"
              >

                <h3 className="text-xl font-semibold mb-4">
                  {new Date(item.dt_txt).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </h3>

                <img
                  className="mx-auto"
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
                  alt="forecast"
                />

                <h1 className="text-3xl font-bold mb-2">
                  {Math.round(item.main.temp)}°C
                </h1>

                <p className="text-slate-200">
                  {item.weather[0].main}
                </p>

              </div>

            ))}

          </div>

        </div>

        {/* Analytics */}
        <div className="max-w-6xl mx-auto mb-20">

          <h2 className="text-4xl font-bold mb-8 text-center">
            Weather Analytics 📈
          </h2>

          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-5 md:p-8 border border-white/10 shadow-2xl">

            <ResponsiveContainer width="100%" height={350}>

              <LineChart data={chartData}>

                <XAxis dataKey="day" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="temp"
                  stroke="#3b82f6"
                  strokeWidth={4}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* Map */}
        <div className="max-w-6xl mx-auto mb-20">

          <h2 className="text-4xl font-bold mb-8 text-center">
            Live Weather Map 🗺️
          </h2>

          {weather && weather.coord && (

            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">

              <MapContainer
                center={[weather.coord.lat, weather.coord.lon]}
                zoom={10}
                style={{
                  height: window.innerWidth < 768 ? "350px" : "500px",
                  width: "100%",
                }}
              >

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[weather.coord.lat, weather.coord.lon]}>

                  <Popup>
                    {weather.name} <br />
                    {Math.round(weather.main.temp)}°C
                  </Popup>

                </Marker>

              </MapContainer>

            </div>

          )}

        </div>

        {/* Disaster Alerts */}
        <div className="max-w-6xl mx-auto pb-20">

          <h2 className="text-4xl font-bold mb-8 text-center text-red-300">
            Live Disaster Alerts 🚨
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {disasters.map((item, index) => (

              <div
                key={index}
                className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6 backdrop-blur-lg hover:scale-105 transition duration-300 shadow-lg"
              >

                <h3 className="text-2xl font-bold mb-4 text-red-200">
                  {item.title}
                </h3>

                <p className="text-slate-200 mb-4">
                  {item.categories[0]?.title}
                </p>

                <p className="text-sm text-slate-300">
                  Status: {item.closed ? "Closed" : "Active"}
                </p>

              </div>

            ))}

          </div>

        </div>

      </div>
            {/* Footer */}
<footer className="border-t border-white/10 mt-10">

  <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">

    {/* Left */}
    <div>

      <h2 className="text-2xl font-bold">
        WeatherShield AI 🌦️
      </h2>

      <p className="text-slate-300 mt-2">
        Smart Weather & Disaster Monitoring Platform
      </p>

    </div>

    {/* Center */}
    <div className="flex gap-6 text-lg">

      <a
        href="https://github.com/Shivamani16"
        target="_blank"
        className="hover:text-blue-300 transition"
      >
        GitHub
      </a>

      <a
        href="https://linkedin.com/in/shivamani-kotagiri-1380a426a"
        target="_blank"
        className="hover:text-blue-300 transition"
      >
        LinkedIn
      </a>

    </div>

    {/* Right */}
    <div>

      <p className="text-slate-300 text-sm font-medium">
        Designed & Developed by
      </p>

      <h3 className="text-lg font-bold mt-1">
        Shivamani Kotagiri
      </h3>

      <p className="text-slate-500 text-sm mt-1">
        © 2026 WeatherShield AI
      </p>

    </div>

  </div>

</footer>
    </div>
  );
}

export default App;