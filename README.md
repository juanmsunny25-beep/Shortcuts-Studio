# Shortcuts Studio

A mobile web app that brings iPhone Shortcuts-like automation to Android and web browsers. Create powerful automations that let you control your device with a single tap.

## 🚀 Features

- **Create Automations** - Build multi-step shortcuts with drag-and-drop reordering
- **Device Control**
  - Open any URL or web app
  - Launch installed apps (Spotify, YouTube, Gmail, Maps, WhatsApp, Telegram, Instagram, Drive, Roblox, etc.)
  - Toggle Bluetooth and Wi-Fi
  - Open Google Maps with queries
  - Copy text to clipboard
  - Create reminders and notes
  - Toggle between light/dark theme

- **Conditional Triggers** - Automate based on Wi-Fi networks:
  - "When I connect to Home WiFi..."
  - "When I disconnect from Work Network..."
  - "When I leave Coffee Shop..."

- **Smart Organization**
  - Search your shortcuts
  - Filter by categories (Daily, Work, Focus, System, Games)
  - Customize icons for each automation
  - View run history

- **Persistent Storage** - All shortcuts saved locally in your browser
- **Export/Import** - Back up your shortcuts as JSON files
- **Dark/Light Mode** - Choose your theme
- **Offline Support** - Works without internet connection (Progressive Web App)

## 📱 Installation

### On Android

1. Open **https://juanmsunny25-beep.github.io/Shortcuts-Studio/** in Chrome or Firefox
2. Tap the **Install** button (appears at top of screen)
3. Confirm the installation
4. The app will appear on your home screen as a standalone app

### On Desktop/Browser

Simply visit: **https://juanmsunny25-beep.github.io/Shortcuts-Studio/**

## 🛠️ Usage

### Create a New Automation

1. Click **+ New automation**
2. Enter a name and description
3. Choose a category and icon
4. Click **+ Add action** to add steps
5. Drag the ⋮⋮ handle to reorder steps
6. Click **Save shortcut**

### Run an Automation

1. Find the shortcut in your list
2. Click **Run**
3. Check the **Run log** at the bottom to see what happened

### Edit an Automation

1. Click **Edit** on any shortcut
2. Make your changes
3. Click **Save shortcut** to update

### Backup Your Shortcuts

1. Click **Export** to download all shortcuts as a JSON file
2. Keep this file safe as a backup
3. Use **Import** to restore from a backup

## 🔧 Local Development

### Prerequisites
- Python 3 (for local testing)
- Git
- A code editor

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/juanmsunny25-beep/Shortcuts-Studio.git
   cd Shortcuts-Studio
   ```

2. Start a local server:
   ```bash
   python -m http.server 8000
   ```

3. Open **http://localhost:8000** in your browser

### File Structure

```
shortcuts-app/
├── index.html          # App shell and UI structure
├── app.js             # Core logic, state management, shortcuts CRUD
├── styles.css         # Responsive styling with dark/light theme
├── manifest.json      # PWA configuration for installability
├── sw.js              # Service Worker for offline support
├── icon.svg           # App icon for PWA
└── README.md          # This file
```

## 🌐 Deploying to GitHub Pages

1. Push your changes to the `main` branch
2. GitHub Actions will automatically deploy to GitHub Pages
3. Wait 1-2 minutes for changes to go live
4. Refresh the app on your phone to see updates

## 💾 Data Storage

All shortcuts are stored in your browser's **localStorage** under the key `shortcuts-studio-v2`. This means:
- Your shortcuts persist across browser refreshes
- Each browser/device stores its own shortcuts independently
- Clearing browser data will delete your shortcuts (use Export to backup!)

## 🔒 Privacy

This app runs entirely in your browser. No data is sent to any server:
- Your shortcuts never leave your device
- No login or account required
- No tracking or analytics
- All processing happens locally

## 🐛 Troubleshooting

### App won't install on Android
- Make sure you're using Chrome, Edge, or Firefox
- The app must be accessed via HTTPS (https://juanmsunny25-beep...)
- Look for the install prompt at the top of the screen
- Some Android versions may not show the install prompt; use browser menu → "Install app"

### Shortcuts disappeared
- Check if you're on the same browser/device where you created them
- Try opening localStorage in DevTools (F12) to verify data is there
- Restore from an exported JSON backup if available

### Bluetooth/Wi-Fi features not working
- These are simulated for now (no real device control)
- The app will log actions to the Run log
- On real devices, these could be extended with device APIs

### App isn't updating
- Hard refresh your browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
- Service Worker may be caching old files; try clearing cache
- Wait 1-2 minutes after pushing to GitHub for CDN to refresh

## 🎯 Example Automations

**Morning Brief**
- Open your news source
- Start Spotify

**Deep Work Start**
- Turn on Focus mode
- Open Spotify for background music

**Light Switch**
- Toggle between light and dark theme

**Game Time**
- Open Roblox

## 🚦 Future Features

- Real Bluetooth device control
- Real Wi-Fi network detection and triggers
- Camera/photo access
- Call and SMS shortcuts
- Calendar integration
- Location-based triggers
- Weather-based automations
- Voice control support

## 📄 License

This project is open source. Feel free to fork and modify!

## 🤝 Contributing

Want to improve Shortcuts Studio?
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Push and open a pull request

## 📞 Support

Issues or ideas? Open an issue on GitHub or contact the maintainer.

---

**Made with ⚡ for Android and the web**
