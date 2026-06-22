// ─── WMO weather code maps ───────────────────────────────────────────────────
const WMO_DESC = {
  0:"Clear sky", 1:"Mainly clear", 2:"Partly cloudy", 3:"Overcast",
  45:"Fog", 48:"Icy fog",
  51:"Light drizzle", 53:"Drizzle", 55:"Heavy drizzle",
  61:"Light rain", 63:"Rain", 65:"Heavy rain",
  71:"Light snow", 73:"Snow", 75:"Heavy snow",
  80:"Rain showers", 81:"Rain showers", 82:"Heavy rain showers",
  85:"Snow showers", 86:"Heavy snow showers",
  95:"Thunderstorm", 96:"Thunderstorm & hail", 99:"Thunderstorm & heavy hail"
};

const WMO_ICON = {
  0:"ti-sun", 1:"ti-sun", 2:"ti-cloud-sun", 3:"ti-cloud",
  45:"ti-cloud-fog", 48:"ti-cloud-fog",
  51:"ti-cloud-drizzle", 53:"ti-cloud-drizzle", 55:"ti-cloud-drizzle",
  61:"ti-cloud-rain", 63:"ti-cloud-rain", 65:"ti-cloud-rain",
  71:"ti-snowflake", 73:"ti-snowflake", 75:"ti-snowflake",
  80:"ti-cloud-rain", 81:"ti-cloud-rain", 82:"ti-cloud-rain",
  85:"ti-snowflake", 86:"ti-snowflake",
  95:"ti-cloud-storm", 96:"ti-cloud-storm", 99:"ti-cloud-storm"
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function icon(code)  { return WMO_ICON[code]  || "ti-cloud"; }
function desc(code)  { return WMO_DESC[code]  || "Unknown"; }

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso, i) {
  if (i === 0) return "Today";
  const d = new Date(iso);
  return d.toLocaleDateString([], { weekday: "short" });
}

function uvLabel(u) {
  if (u <= 2)  return "Low";
  if (u <= 5)  return "Moderate";
  if (u <= 7)  return "High";
  if (u <= 10) return "Very high";
  return "Extreme";
}

function dewDesc(dp) {
  if (dp < 10) return "Dry & comfortable";
  if (dp < 16) return "Comfortable";
  if (dp < 21) return "Somewhat humid";
  if (dp < 24) return "Humid";
  return "Very humid";
}

function el(id) { return document.getElementById(id); }

function showError(msg) {
  el("errorText").textContent = msg;
  el("errorMsg").style.display = "flex";
  el("loadingMsg").style.display = "none";
  el("mainContent").style.display = "none";
}

function showLoading() {
  el("errorMsg").style.display  = "none";
  el("loadingMsg").style.display = "flex";
  el("mainContent").style.display = "none";
}

function showMain() {
  el("loadingMsg").style.display = "none";
  el("errorMsg").style.display   = "none";
  el("mainContent").style.display = "block";
}

// ─── Geocoding ───────────────────────────────────────────────────────────────
async function geocode(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.results || !data.results.length) throw new Error(`City "${city}" not found. Try a different name.`);
  return data.results[0];
}

// ─── Weather fetch ────────────────────────────────────────────────────────────
async function fetchWeatherData(lat, lon) {
  const params = [
    `latitude=${lat}`,
    `longitude=${lon}`,
    "current=temperature_2m,apparent_temperature,weathercode,relative_humidity_2m,windspeed_10m,visibility,surface_pressure,uv_index,precipitation",
    "hourly=temperature_2m,weathercode,precipitation_probability",
    "daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset,uv_index_max",
    "forecast_days=7",
    "timezone=auto"
  ].join("&");

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error("Weather API error. Please try again.");
  return res.json();
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderWeather(geo, data) {
  const c = data.current;
  const h = data.hourly;
  const d = data.daily;

  // Hero
  const loc = [geo.name, geo.admin1, geo.country].filter(Boolean).join(", ");
  el("cityName").textContent  = loc;
  el("wDesc").textContent     = desc(c.weathercode);
  el("wTemp").textContent     = Math.round(c.temperature_2m) + "°C";
  el("wFeel").textContent     = `Feels like ${Math.round(c.apparent_temperature)}°C`;
  el("wUpdated").textContent  = `Updated ${fmtTime(c.time)}`;

  const hi = el("heroIcon");
  hi.className = `ti ${icon(c.weathercode)} hero-icon`;

  // Stats
  el("sHum").textContent  = Math.round(c.relative_humidity_2m) + "%";
  el("sWind").textContent = Math.round(c.windspeed_10m) + " km/h";
  el("sVis").textContent  = Math.round((c.visibility || 0) / 1000) + " km";
  el("sPres").textContent = Math.round(c.surface_pressure) + " hPa";

  // Hourly: find the current hour index and show next 10 slots
  const nowHour = new Date(c.time).getHours();
  const nowIdx  = h.time.findIndex(t => new Date(t).getHours() >= nowHour);
  const startIdx = nowIdx < 0 ? 0 : nowIdx;

  el("hourlyEl").innerHTML = h.time.slice(startIdx, startIdx + 10).map((t, i) => {
    const idx = startIdx + i;
    const hr  = new Date(t).getHours();
    const lbl = i === 0 ? "Now" : (hr % 12 || 12) + (hr < 12 ? " AM" : " PM");
    const pop = h.precipitation_probability[idx] ?? 0;
    return `
      <div class="hcard ${i === 0 ? "now" : ""}">
        <div class="ht">${lbl}</div>
        <div class="hi"><i class="ti ${icon(h.weathercode[idx])}"></i></div>
        <div class="hv">${Math.round(h.temperature_2m[idx])}°</div>
        <div class="hp">${pop}%</div>
      </div>`;
  }).join("");

  // 7-day forecast
  const minT = Math.min(...d.temperature_2m_min);
  const maxT = Math.max(...d.temperature_2m_max);
  const span = Math.max(maxT - minT, 1);

  el("forecastEl").innerHTML = d.time.map((t, i) => {
    const lo = Math.round(d.temperature_2m_min[i]);
    const hi_t = Math.round(d.temperature_2m_max[i]);
    const left  = (((lo - minT) / span) * 100).toFixed(1);
    const width = (((hi_t - lo) / span) * 100).toFixed(1);
    const pop   = d.precipitation_probability_max[i] ?? 0;
    return `
      <div class="frow">
        <div class="fday">${dayLabel(t, i)}</div>
        <div class="ficon"><i class="ti ${icon(d.weathercode[i])}"></i></div>
        <div class="fpop">${pop}%</div>
        <div class="fbar-wrap"><div class="fbar-fill" style="left:${left}%;width:${width}%"></div></div>
        <div class="frange">${lo}° <span>${hi_t}°</span></div>
      </div>`;
  }).join("");

  // UV
  const uv = Math.round(c.uv_index || 0);
  el("uvVal").textContent = uv;
  el("uvDot").style.left  = Math.min(100, (uv / 12) * 100) + "%";
  el("uvLbl").textContent = uvLabel(uv);

  // Sun
  const sr  = new Date(d.sunrise[0]);
  const ss  = new Date(d.sunset[0]);
  const len = ss - sr;
  const hh  = Math.floor(len / 3600000);
  const mm  = Math.floor((len % 3600000) / 60000);
  el("sunRise").textContent = fmtTime(d.sunrise[0]);
  el("sunSet").textContent  = fmtTime(d.sunset[0]);
  el("sunLen").textContent  = `${hh}h ${mm}m`;

  // Precipitation
  const rain = (d.precipitation_sum[0] || 0).toFixed(1);
  el("precip").textContent  = `${rain} mm`;

  // Dew point (approx: T - (100 - RH) / 5)
  const dp = Math.round(c.temperature_2m - (100 - c.relative_humidity_2m) / 5);
  el("dewPt").textContent  = `${dp}°C`;
  el("dewDesc").textContent = dewDesc(dp);

  showMain();
}

// ─── Main entry ──────────────────────────────────────────────────────────────
async function fetchWeather() {
  const city = el("cityInput").value.trim();
  if (!city) return;

  showLoading();

  try {
    const geo  = await geocode(city);
    const data = await fetchWeatherData(geo.latitude, geo.longitude);
    renderWeather(geo, data);
  } catch (err) {
    showError(err.message || "Something went wrong. Please try again.");
  }
}

// ─── Event listeners ─────────────────────────────────────────────────────────
document.getElementById("cityInput").addEventListener("keydown", e => {
  if (e.key === "Enter") fetchWeather();
});

// ─── Auto-load on start ──────────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
  fetchWeather();
});
