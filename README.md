# real-time-tracker


A real-time location tracking web application built with Node.js, Express, Socket.IO, EJS, and Leaflet.js. Users can share their live location, which is displayed on a map and updated in real time for all connected clients.

## Features
- Real-time location sharing and tracking
- Interactive map using [Leaflet.js](https://leafletjs.com/)
- Multiple users' locations displayed simultaneously
- Automatic removal of disconnected users from the map

### Installation
1. Clone the repository:
   ```bash
   git clone <https://github.com/Sintukr67/real-time-tracker.git>
   cd tracker
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
Start the server:
```bash
node app.js
```
The app will be available at [http://localhost:3000](http://localhost:3000).

## Usage
- Open the app in your browser.
- Allow location access when prompted.
- Your location will be shared and shown on the map.
- Other users' locations will also appear in real time.

## Project Structure
```
tracker/
  app.js                # Main server file
  public/               # Static assets (JS, CSS)
    js/script.js        # Client-side logic for map and sockets
    css/style.css       # Styles for the app
  views/
    index.ejs           # Main HTML template
  package.json          # Project metadata and dependencies
```

## Dependencies
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [EJS](https://ejs.co/)
- [Leaflet.js](https://leafletjs.com/) (CDN)

## License
ISC

---
Feel free to contribute or open issues for suggestions and improvements.
