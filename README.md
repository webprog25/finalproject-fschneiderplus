# Austria Weather Map

A comprehensive web application that displays real-time weather data from weather stations across Austria on an interactive map. The application provides multiple data overlays, responsive design, and meets all technical requirements for a modern full-stack web application.

## Features

### Core Functionality
- **Interactive Map**: Leaflet-based map centered on Austria showing weather stations
- **Multiple Data Overlays**: Choosable overlays for temperature, humidity, wind speed, air pressure, and rainfall
- **Real-time Data**: Live weather data from Austrian weather stations via TechWeb API
- **Responsive Design**: Mobile-friendly interface with touch controls
- **Weather Station Details**: Click stations to view detailed weather information

### Technical Features
- **Frontend**: HTML5, CSS3, JavaScript ES6+ with modern features
- **Backend**: Node.js with Express framework
- **Database**: MongoDB integration for historical data storage
- **APIs**: RESTful API endpoints with JSON responses
- **Responsive**: Flexbox layout, mobile-first design
- **Accessibility**: Semantic HTML elements and proper ARIA labels

## Technical Requirements Met

### Frontend HTML and CSS 
- Overall page structure written in HTML (not dynamically generated)
- Page layout defined in CSS with custom properties and modern features
- Uses CSS classes and IDs with semantic naming
- Implements Flexbox for layout, comprehensive font/text styling, and box model

### Frontend JavaScript 
- Event handlers for user interaction (overlay selection, refresh, station clicks)
- Creates, modifies, and removes DOM elements dynamically
- Uses ES6+ classes: `WeatherMap` and `WeatherApp` classes
- Uses fetch API to access backend endpoints

### Backend JavaScript 
- Written in Node.js with Express framework
- Multiple routes including GET and POST endpoints
- Uses route parameters (e.g., `/api/weather/:stationId`)
- Reads JSON request bodies and returns JSON responses
- MongoDB database integration for persistent data storage

### Modern JavaScript Features 
- Uses async/await for API and database access
- ES6+ features: classes, arrow functions, template literals, destructuring
- Modular code organization with proper separation of concerns
- Error handling with try/catch blocks

## API Endpoints

### Weather Data
- `GET /api/weather` - Get current weather data from all stations
- `GET /api/weather/:stationId` - Get specific station data
- `GET /api/weather/history` - Get historical weather data
- `GET /api/weather/stats` - Get weather statistics

### Data Format
```json
{
  "timestamp": "2025-09-16T16:00:00.000Z",
  "total_stations": 247,
  "stations": [
    {
      "id": "station_id",
      "location": "Vienna",
      "state": "Wien",
      "altitude": 183,
      "coordinates": [48.2082, 16.3738],
      "weather": {
        "temperature": 20.4,
        "humidity": 51,
        "wind_speed": 5.0,
        "air_pressure": 997.5,
        "rainfall": 0.0,
        "last_updated": "16.09.2025, 16:00:00"
      }
    }
  ]
}
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, for historical data storage)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd finalproject-fschneiderplus
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   # or
   node server.js
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:1930
   ```

### Environment Variables
- `PORT` - Server port (default: 1930)
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017)

## Project Structure

```
├── api/
│   └── index.js              # Express API routes and MongoDB integration
├── lib/
│   ├── client/
│   │   └── updater.js        # Client-side utilities
│   └── server/
│       └── updater.js        # Server-side utilities
├── public/
│   ├── index.html            # Main HTML structure
│   ├── app.js               # Frontend JavaScript application
│   └── style.css            # Comprehensive CSS styling
├── server.js                # Main server file
├── package.json             # Project dependencies
└── README.md               # This file
```

## Classes and Architecture

### WeatherMap Class
Handles all map-related functionality:
- Leaflet map initialization
- Marker creation and management
- Color coding based on data types
- Popup content generation
- Legend updates

### WeatherApp Class
Main application controller:
- Event listener management
- API data fetching
- UI updates and state management
- Statistics calculation

## Weather Data Overlays

The application supports five different weather data overlays:

1. **Temperature** - Color-coded from blue (cold) to red (hot)
2. **Humidity** - Color-coded from orange (dry) to blue (humid)
3. **Wind Speed** - Color-coded from green (calm) to red (strong winds)
4. **Air Pressure** - Color-coded from blue (low) to orange (high)
5. **Rainfall** - Color-coded from light (no rain) to dark blue (heavy rain)

## Responsive Design

- **Desktop**: Full sidebar with detailed weather information
- **Tablet**: Collapsible sidebar, touch-friendly controls
- **Mobile**: Bottom sheet design, optimized for touch interaction
- **Accessibility**: High contrast colors, proper focus management

## Data Source

Weather data provided by TechWeb API (https://cdn3.techweb.at/api/weather/at/data)
- Real-time data from Austrian weather stations
- Updates every hour
- Comprehensive weather metrics

## License

This project is for educational purposes as part of the Web Programming final project.

## Contributing

This is a final project submission. For questions or issues, please contact the project author.
