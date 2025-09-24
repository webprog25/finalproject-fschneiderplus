import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { MongoClient, ObjectId } from "mongodb";

let api = express.Router();
let db;

const initApi = async (app) => {
  app.set("json spaces", 2);
  app.use("/api", api);
  
  // Initialize MongoDB connection
  try {
    const client = new MongoClient(
      process.env.MONGODB_URI || "mongodb://admin:password@localhost:27017/austria_weather?authSource=admin",
      {
        serverSelectionTimeoutMS: 5000
      }
    );
    await client.connect();
    db = client.db("austria_weather");
    console.log("Connected to MongoDB - historical data storage enabled");
  } catch (error) {
    console.log("MongoDB connection failed - running without database (historical data disabled)");
    console.log("   Error:", error.message);
    db = null;
  }
};

api.use(bodyParser.json());
api.use(cors());

api.get("/", (req, res) => {
  res.json({ message: "Austrian Weather Map API" });
});

// Weather data endpoint
api.get("/weather", async (req, res) => {
  try {
    const response = await fetch("https://cdn3.techweb.at/api/weather/at/data?wst=all&format=json");
    
    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }
    
    const weatherData = await response.json();
    
    // Process and enrich the data
    const processedData = {
      timestamp: new Date().toISOString(),
      total_stations: weatherData.station_list.length,
      stations: weatherData.station_list.map(station => ({
        id: station.station_id,
        location: station.location,
        state: station.state,
        altitude: parseFloat(station.altitude) || 0,
        coordinates: getCoordinatesForLocation(station.location, station.state),
        weather: {
          temperature: parseFloat(station.temperature) || null,
          humidity: parseFloat(station.humidity) || null,
          wind_speed: parseFloat(station.wind_speed) || null,
          wind_direction: station.wind_direction !== "-" ? parseFloat(station.wind_direction) || null : null,
          wind_peak: parseFloat(station.windpeak) || null,
          rainfall: parseFloat(station.raindown) || null,
          air_pressure: station.airpressure !== "-" ? parseFloat(station.airpressure) || null : null,
          sun_hours: parseFloat(station.sun_h) || null,
          sun_watts: parseFloat(station.sun_w) || null,
          last_updated: station.weather_time,
          timestamp: parseInt(station.weather_timestamp)
        }
      }))
    };
    
    // Store data in MongoDB if available
    if (db) {
      try {
        await db.collection("weather_snapshots").insertOne({
          ...processedData,
          created_at: new Date()
        });
        console.log("Weather data stored in database");
      } catch (dbError) {
        console.error("Failed to store weather data:", dbError);
      }
    }
    
    res.json(processedData);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ 
      error: "Failed to fetch weather data",
      message: error.message 
    });
  }
});

// Helper function to get approximate coordinates for Austrian locations
function getCoordinatesForLocation(location, state) {
  // This is a simplified coordinate mapping - in a real app you'd use a geocoding service
  const locationMap = {
    // Major cities and approximate coordinates
    "Wien": [48.2082, 16.3738],
    "Graz": [47.0707, 15.4395],
    "Linz": [48.3069, 14.2858],
    "Salzburg": [47.8095, 13.0550],
    "Innsbruck": [47.2692, 11.4041],
    "Klagenfurt": [46.6247, 14.3051],
    "Villach": [46.6111, 13.8558],
    "Wels": [48.1667, 14.0333],
    "St. Pölten": [48.2000, 15.6167],
    "Dornbirn": [47.4125, 9.7417],
    "Steyr": [48.0333, 14.4167],
    "Wiener Neustadt": [47.8167, 16.2333],
    "Feldkirch": [47.2333, 9.6000],
    "Bregenz": [47.5000, 9.7500],
    "Leonding": [48.2667, 14.2500],
    "Klosterneuburg": [48.3056, 16.3256],
    "Baden": [48.0060, 16.2317],
    "Wolfsberg": [46.8392, 14.8428],
    "Leoben": [47.3833, 14.8167],
    "Krems": [48.4167, 15.6000]
  };
  
  // Try to find exact match first
  if (locationMap[location]) {
    return locationMap[location];
  }
  
  // Try partial match
  for (const [key, coords] of Object.entries(locationMap)) {
    if (location.includes(key) || key.includes(location)) {
      return coords;
    }
  }
  
  // Default coordinates based on state
  const stateDefaults = {
    "Wien": [48.2082, 16.3738],
    "Niederösterreich": [48.2, 15.6],
    "Oberösterreich": [48.2, 14.0],
    "Steiermark": [47.2, 15.0],
    "Kärnten": [46.7, 14.3],
    "Salzburg": [47.5, 13.0],
    "Tirol": [47.3, 11.4],
    "Vorarlberg": [47.2, 9.9],
    "Burgenland": [47.5, 16.5]
  };
  
  return stateDefaults[state] || [47.5, 14.5]; // Center of Austria as fallback
}

// Get weather data for a specific station
api.get("/weather/:stationId", async (req, res) => {
  try {
    const response = await fetch("https://cdn3.techweb.at/api/weather/at/data?wst=all&format=json");
    
    if (!response.ok) {
      throw new Error(`Weather API responded with status: ${response.status}`);
    }
    
    const weatherData = await response.json();
    const station = weatherData.station_list.find(s => s.station_id === req.params.stationId);
    
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }
    
    const processedStation = {
      id: station.station_id,
      location: station.location,
      state: station.state,
      altitude: parseFloat(station.altitude) || 0,
      coordinates: getCoordinatesForLocation(station.location, station.state),
      weather: {
        temperature: parseFloat(station.temperature) || null,
        humidity: parseFloat(station.humidity) || null,
        wind_speed: parseFloat(station.wind_speed) || null,
        wind_direction: station.wind_direction !== "-" ? parseFloat(station.wind_direction) || null : null,
        wind_peak: parseFloat(station.windpeak) || null,
        rainfall: parseFloat(station.raindown) || null,
        air_pressure: station.airpressure !== "-" ? parseFloat(station.airpressure) || null : null,
        sun_hours: parseFloat(station.sun_h) || null,
        sun_watts: parseFloat(station.sun_w) || null,
        last_updated: station.weather_time,
        timestamp: parseInt(station.weather_timestamp)
      }
    };
    
    res.json(processedStation);
  } catch (error) {
    console.error("Error fetching station data:", error);
    res.status(500).json({ 
      error: "Failed to fetch station data",
      message: error.message 
    });
  }
});

// Get historical weather data
api.get("/weather/history", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Database not available" });
  }
  
  try {
    const limit = parseInt(req.query.limit) || 24;
    const stationId = req.query.stationId;
    
    let pipeline = [
      { $sort: { created_at: -1 } },
      { $limit: limit }
    ];
    
    if (stationId) {
      pipeline.unshift({
        $match: {
          "stations.id": stationId
        }
      });
    }
    
    const history = await db.collection("weather_snapshots")
      .aggregate(pipeline)
      .toArray();
    
    res.json({
      count: history.length,
      data: history.reverse() // Return in chronological order
    });
  } catch (error) {
    console.error("Error fetching historical data:", error);
    res.status(500).json({ 
      error: "Failed to fetch historical data",
      message: error.message 
    });
  }
});

api.get("/weather/stats", async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: "Database not available" });
  }
  
  try {
    const pipeline = [
      { $sort: { created_at: -1 } },
      { $limit: 1 },
      { $unwind: "$stations" },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: "$stations.weather.temperature" },
          maxTemperature: { $max: "$stations.weather.temperature" },
          minTemperature: { $min: "$stations.weather.temperature" },
          avgHumidity: { $avg: "$stations.weather.humidity" },
          maxHumidity: { $max: "$stations.weather.humidity" },
          minHumidity: { $min: "$stations.weather.humidity" },
          avgWindSpeed: { $avg: "$stations.weather.wind_speed" },
          maxWindSpeed: { $max: "$stations.weather.wind_speed" },
          avgPressure: { $avg: "$stations.weather.air_pressure" },
          maxPressure: { $max: "$stations.weather.air_pressure" },
          minPressure: { $min: "$stations.weather.air_pressure" },
          totalRainfall: { $sum: "$stations.weather.rainfall" },
          stationCount: { $sum: 1 }
        }
      }
    ];
    
    const stats = await db.collection("weather_snapshots")
      .aggregate(pipeline)
      .toArray();
    
    res.json(stats[0] || {});
  } catch (error) {
    console.error("Error fetching weather statistics:", error);
    res.status(500).json({ 
      error: "Failed to fetch weather statistics",
      message: error.message 
    });
  }
});

/* Catch-all route to return a JSON error if endpoint not defined.
   Be sure to put all of your endpoints above this one, or they will not be called. */
api.all("/*", (req, res) => {
  res.status(404).json({ error: `Endpoint not found: ${req.method} ${req.url}` });
});

export default initApi;
