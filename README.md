# AURA Dashboard - Custom New Tab Page

A beautiful, interactive new tab dashboard built for Hack Club's "Give Your Website a Pulse" challenge!

## Features

- 🎨 **Customizable UI**: Cycle through different accent color themes
- 🌦️ **Weather Widget**: Real-time weather data from Open-Meteo API
- ⏱️ **Pomodoro Timer**: Focus cycles with work/break intervals
- 📝 **Task List**: Manage your todos with local storage persistence
- 🔗 **Speed Dial**: Quick access to your favorite websites
- 🎵 **Spotify Integration**: Connect your Spotify account for full playback control
- 📝 **Quick Notes**: Jot down your thoughts, auto-saved locally
- 💫 **Interactive Background**: Particle-based animated background
- 📱 **Responsive Design**: Works great on mobile and desktop
- 🎯 **Drag & Drop**: Reorder widgets to your liking
- ⌨️ **Command Bar**: Quick search and actions with Cmd+K

## Tech Stack

- HTML5
- CSS3 (Custom properties, animations, gradients)
- Vanilla JavaScript (No frameworks)
- APIs used: Open-Meteo (Weather & Geocoding)

## Getting Started

1. Clone or download this project
2. Open `index.html` in your browser
3. Optional: Set it as your browser's new tab page!

## Customization

- Click the sun icon in the top bar to change accent colors
- Open the settings modal (gear icon) to adjust:
  - Particle density
  - Particle speed
  - Noise overlay
  - Background style
- Drag the `:::` handle on widgets to reorder them

## Spotify Integration Setup

The Spotify widget requires a Spotify Premium account and API credentials to work:

1. **Create a Spotify Developer Account**
   - Go to https://developer.spotify.com/dashboard
   - Log in with your Spotify account

2. **Create a New App**
   - Click "Create App"
   - Fill in the app name and description
   - Accept the terms and create

3. **Configure the App**
   - Copy the **Client ID** from your app dashboard
   - In `script.js`, line 498, replace `'YOUR_SPOTIFY_CLIENT_ID'` with your Client ID
   - Add your redirect URI in the Spotify dashboard:
     - For local development: `http://localhost:5500/callback.html` (or your local server)
     - For production: `https://yourdomain.com/callback.html`

4. **Set Redirect URIs**
   - In your Spotify app dashboard, go to "Edit Settings"
   - Add your redirect URI(s) to the "Redirect URIs" field
   - Save the changes

5. **Connect Your Account**
   - Open the dashboard in your browser
   - Click "Connect Spotify" in the music widget
   - Authorize the app to access your account
   - Start controlling your Spotify music!

**Note**: Spotify Web Playback SDK requires a Premium subscription. Free accounts can search but cannot control playback.

## Deployment

This project is 100% static, so it can be deployed anywhere! Some options:
- GitHub Pages
- Vercel
- Netlify
- Cloudflare Pages

## Credits

- Built for [Hack Club](https://hackclub.com)
- Weather data from [Open-Meteo](https://open-meteo.com)
- Music from [SoundHelix](https://soundhelix.com)
