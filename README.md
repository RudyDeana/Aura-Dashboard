# AURA Dashboard - Custom New Tab Page

A fully-interactive new tab dashboard created specifically for Hack Club's **"Give Your Website a Pulse"** challenge

## What you'll find inside

-  **Varius color theme** with distinct color themes  
-  **Real-time weather** via Open-Meteo API  
-  **Pomodoro Timer** for focused work sessions  
-  **Task management** with persistent local storage  
-  **Speed Dial** – one-click access to your favorite websites  
-  **Deep Spotify integration** for seamless music control  
-  **Quick Notes** – auto-saving    
-  **Fully responsive** on mobile and desktop  
-  **Drag & Drop** widgets for ultimate customization  
-  **Command Bar** (Cmd/Ctrl + K) for quick actions  

## Tech Stack

- HTML5
- CSS3 (Custom properties, animations, gradients)
- Vanilla JavaScript (no frameworks)
- Open-Meteo API (weather & geocoding)

## Getting Up and Running

1. Clone or download the repository
2. Open `index.html` in your favorite web browser
3. *(Optional)* Set it as your default new tab page

## Customization Options

- Change accent color by clicking the **sun icon** in the top bar
- Open the **settings modal** (gear icon) to adjust:
  - Particle density and speed
  - Noise overlay effect
  - Background style
- Reorder widgets by dragging the `:::` handle

## Spotify Integration

To use the music widget:

1. **Get your Spotify Developer credentials**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Log in with your Spotify account
   - Click **"Create App"**, fill in name and description, accept terms
   - Copy your **Client ID**

2. **Configure the app**
   - In `script.js` (around line 498), replace `'YOUR_SPOTIFY_CLIENT_ID'` with your Client ID
   - Add your redirect URI in the Spotify dashboard:
     - Local development: `http://localhost:5500/callback.html`
     - Production: `https://yourdomain.com/callback.html`

3. **Set Redirect URIs**
   - Go to **Edit Settings** in your Spotify app
   - Add the redirect URI(s) and save

4. **Connect your account**
   - Open the dashboard
   - Click **"Connect Spotify"** in the music widget
   - Authorize the app
   - Start enjoying music control!

> **Note**: The Spotify Web Playback SDK requires a **Premium** account for full playback control. Free accounts can only search tracks.

## Credits

- Built for the awesome [Hack Club](https://hackclub.com) community
- Weather data from [Open-Meteo](https://open-meteo.com)
- Music provided by [SoundHelix](https://soundhelix.com)
- Made with ❤️ by Rudy

