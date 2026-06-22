# WeatherNow 🌤️

A clean, live weather forecast web app built with vanilla HTML, CSS, and JavaScript. No build tools, no dependencies to install — just open `index.html` in your browser.

## Features

- 🔍 Search any city in the world
- 🌡️ Current temperature, feels-like, weather description
- 💧 Humidity, wind speed, visibility, pressure
- 🕐 10-hour hourly forecast with rain probability
- 📅 7-day forecast with temperature range bars
- ☀️ UV index gauge with severity label
- 🌅 Sunrise, sunset & day length
- 🌧️ Daily precipitation total
- 💦 Dew point with comfort description
- 📱 Fully responsive — works on mobile
- ♿ Respects `prefers-reduced-motion`

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | HTML5, CSS3, Vanilla JS (ES2020) |
| Weather data | [Open-Meteo API](https://open-meteo.com) (free, no key needed) |
| Geocoding | [Open-Meteo Geocoding API](https://geocoding-api.open-meteo.com) |
| Icons | [Tabler Icons](https://tabler.io/icons) (webfont via CDN) |
| Fonts | [Google Fonts](https://fonts.google.com) — Space Grotesk + Inter |

## Getting started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/weather-app.git

# Open in browser — no server needed
open index.html
```

Or just visit your GitHub Pages URL after enabling it in repo settings.

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your app is live at `[https://YOUR_USERNAME.github.io/weather-app](https://shyamraghu123.github.io/weather-app/)`

## Project structure

```
weather-app/
├── index.html    # App shell & markup
├── style.css     # All styles (dark theme, responsive)
├── app.js        # API calls, rendering logic
└── README.md     # This file
```

## APIs used

Both APIs are **completely free** with no API key required.

- **Weather:** `https://api.open-meteo.com/v1/forecast`
- **Geocoding:** `https://geocoding-api.open-meteo.com/v1/search`

## License

MIT — free to use, modify, and share.
