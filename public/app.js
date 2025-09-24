class WeatherMap {
    constructor(containerId, center = [47.5, 14.5]) {
        this.containerId = containerId;
        this.center = center;
        this.map = null;
        this.markers = [];
        this.currentOverlay = 'temperature';
        this.stations = [];
        
        this.initMap();
    }
    
    initMap() {
        // Initialize Leaflet map centered on Austria
        this.map = L.map(this.containerId).setView(this.center, 7);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        // Set bounds to Austria
        const austriaBounds = [[46.3, 9.5], [49.0, 17.2]];
        this.map.fitBounds(austriaBounds);
    }
    
    clearMarkers() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }
    
    addWeatherStations(stations, overlayType = 'temperature') {
        this.clearMarkers();
        this.stations = stations;
        this.currentOverlay = overlayType;
        
        stations.forEach(station => {
            if (station.coordinates && station.coordinates.length === 2) {
                const marker = this.createWeatherMarker(station, overlayType);
                this.markers.push(marker);
                marker.addTo(this.map);
            }
        });
        
        this.updateLegend(overlayType);
    }
    
    createWeatherMarker(station, overlayType) {
        const [lat, lng] = station.coordinates;
        const weather = station.weather;
        
        const color = this.getMarkerColor(weather[overlayType], overlayType);
        
        // Create custom marker
        const marker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        });
        
        const popupContent = this.createPopupContent(station);
        marker.bindPopup(popupContent);
        
        marker.on('click', () => {
            this.updateStationInfo(station);
        });
        
        return marker;
    }
    
    getMarkerColor(value, overlayType) {
        if (value === null || value === undefined) return '#999999';
        
        const colorMaps = {
            temperature: [
                { max: -10, color: '#0066cc' },
                { max: 0, color: '#0099ff' },
                { max: 10, color: '#00ccff' },
                { max: 20, color: '#66ff66' },
                { max: 30, color: '#ffcc00' },
                { max: 40, color: '#ff6600' },
                { max: Infinity, color: '#ff0000' }
            ],
            humidity: [
                { max: 20, color: '#ff6600' },
                { max: 40, color: '#ffcc00' },
                { max: 60, color: '#66ff66' },
                { max: 80, color: '#0099ff' },
                { max: Infinity, color: '#0066cc' }
            ],
            wind_speed: [
                { max: 2, color: '#66ff66' },
                { max: 5, color: '#ffcc00' },
                { max: 10, color: '#ff6600' },
                { max: 15, color: '#ff3300' },
                { max: Infinity, color: '#cc0000' }
            ],
            air_pressure: [
                { max: 980, color: '#0066cc' },
                { max: 1000, color: '#0099ff' },
                { max: 1020, color: '#66ff66' },
                { max: 1040, color: '#ffcc00' },
                { max: Infinity, color: '#ff6600' }
            ],
            rainfall: [
                { max: 0.1, color: '#f0f0f0' },
                { max: 1, color: '#66ff66' },
                { max: 5, color: '#0099ff' },
                { max: 10, color: '#0066cc' },
                { max: Infinity, color: '#003399' }
            ]
        };
        
        const colorMap = colorMaps[overlayType] || colorMaps.temperature;
        return colorMap.find(range => value <= range.max)?.color || '#999999';
    }
    
    createPopupContent(station) {
        const weather = station.weather;
        return `
            <div class="weather-popup">
                <h4>${station.location}</h4>
                <p><strong>State:</strong> ${station.state}</p>
                <p><strong>Altitude:</strong> ${station.altitude}m</p>
                <div class="weather-popup-grid">
                    <div><strong>Temperature:</strong> ${weather.temperature || '--'}°C</div>
                    <div><strong>Humidity:</strong> ${weather.humidity || '--'}%</div>
                    <div><strong>Wind Speed:</strong> ${weather.wind_speed || '--'} m/s</div>
                    <div><strong>Pressure:</strong> ${weather.air_pressure || '--'} hPa</div>
                    <div><strong>Rainfall:</strong> ${weather.rainfall || '--'} mm</div>
                    <div><strong>Solar:</strong> ${weather.sun_watts || '--'} W/m²</div>
                </div>
                <p><small>Updated: ${weather.last_updated || 'N/A'}</small></p>
            </div>
        `;
    }
    
    updateStationInfo(station) {
        const weather = station.weather;
        
        // Update station details
        document.getElementById('stationLocation').textContent = station.location;
        document.getElementById('stationState').textContent = station.state;
        document.getElementById('stationAltitude').textContent = station.altitude;
        document.getElementById('lastUpdated').textContent = weather.last_updated || 'N/A';
        
        // Update weather metrics
        document.getElementById('currentTemp').textContent = weather.temperature || '--';
        document.getElementById('currentHumidity').textContent = weather.humidity || '--';
        document.getElementById('currentWind').textContent = weather.wind_speed || '--';
        document.getElementById('currentPressure').textContent = weather.air_pressure || '--';
        document.getElementById('currentRainfall').textContent = weather.rainfall || '--';
        document.getElementById('currentSun').textContent = weather.sun_watts || '--';
        
        // Show weather info panel on mobile
        const weatherInfo = document.getElementById('weatherInfo');
        weatherInfo.classList.remove('hidden');
    }
    
    updateLegend(overlayType) {
        const legend = document.getElementById('mapLegend');
        const legendContent = legend.querySelector('.legend-content');
        
        const legendData = {
            temperature: [
                { color: '#0066cc', label: 'Cold (< 0°C)' },
                { color: '#00ccff', label: 'Cool (0-10°C)' },
                { color: '#66ff66', label: 'Mild (10-20°C)' },
                { color: '#ffcc00', label: 'Warm (20-30°C)' },
                { color: '#ff6600', label: 'Hot (> 30°C)' }
            ],
            humidity: [
                { color: '#ff6600', label: 'Very Dry (< 20%)' },
                { color: '#ffcc00', label: 'Dry (20-40%)' },
                { color: '#66ff66', label: 'Moderate (40-60%)' },
                { color: '#0099ff', label: 'Humid (60-80%)' },
                { color: '#0066cc', label: 'Very Humid (> 80%)' }
            ],
            wind_speed: [
                { color: '#66ff66', label: 'Calm (< 2 m/s)' },
                { color: '#ffcc00', label: 'Light (2-5 m/s)' },
                { color: '#ff6600', label: 'Moderate (5-10 m/s)' },
                { color: '#ff3300', label: 'Strong (10-15 m/s)' },
                { color: '#cc0000', label: 'Very Strong (> 15 m/s)' }
            ],
            air_pressure: [
                { color: '#0066cc', label: 'Low (< 980 hPa)' },
                { color: '#0099ff', label: 'Below Normal (980-1000 hPa)' },
                { color: '#66ff66', label: 'Normal (1000-1020 hPa)' },
                { color: '#ffcc00', label: 'Above Normal (1020-1040 hPa)' },
                { color: '#ff6600', label: 'High (> 1040 hPa)' }
            ],
            rainfall: [
                { color: '#f0f0f0', label: 'None (0 mm)' },
                { color: '#66ff66', label: 'Light (0-1 mm)' },
                { color: '#0099ff', label: 'Moderate (1-5 mm)' },
                { color: '#0066cc', label: 'Heavy (5-10 mm)' },
                { color: '#003399', label: 'Very Heavy (> 10 mm)' }
            ]
        };
        
        const data = legendData[overlayType] || legendData.temperature;
        legendContent.innerHTML = data.map(item => `
            <div class="legend-item">
                <div class="legend-color" style="background: ${item.color};"></div>
                <span>${item.label}</span>
            </div>
        `).join('');
    }
}

class WeatherApp {
    constructor() {
        this.weatherMap = new WeatherMap('map');
        this.weatherData = null;
        this.currentOverlay = 'temperature';
        
        this.initEventListeners();
        this.loadWeatherData();
    }
    
    initEventListeners() {
        document.getElementById('overlaySelect').addEventListener('change', (e) => {
            this.currentOverlay = e.target.value;
            if (this.weatherData) {
                this.weatherMap.addWeatherStations(this.weatherData.stations, this.currentOverlay);
            }
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadWeatherData();
        });
        
        document.getElementById('toggleInfo').addEventListener('click', () => {
            const weatherInfo = document.getElementById('weatherInfo');
            weatherInfo.classList.toggle('hidden');
        });
        
        document.getElementById('closeInfo').addEventListener('click', () => {
            document.getElementById('weatherInfo').classList.add('hidden');
        });
    }
    
    async loadWeatherData() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        loadingOverlay.classList.remove('hidden');
        
        try {
            const response = await fetch('/api/weather');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.weatherData = await response.json();
            
            this.weatherMap.addWeatherStations(this.weatherData.stations, this.currentOverlay);
            
            this.updateStatistics();
            
            document.getElementById('dataTimestamp').textContent = 
                `Last updated: ${new Date(this.weatherData.timestamp).toLocaleString()}`;
                
        } catch (error) {
            console.error('Error loading weather data:', error);
            alert('Failed to load weather data. Please check your connection and try again.');
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    }
    
    updateStatistics() {
        if (!this.weatherData || !this.weatherData.stations) return;
        
        const stations = this.weatherData.stations;
        const validTemps = stations.filter(s => s.weather.temperature !== null).map(s => s.weather.temperature);
        const validHumidity = stations.filter(s => s.weather.humidity !== null).map(s => s.weather.humidity);
        
        const avgTemp = validTemps.length > 0 ? 
            (validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1) : 'N/A';
        const avgHumidity = validHumidity.length > 0 ? 
            (validHumidity.reduce((a, b) => a + b, 0) / validHumidity.length).toFixed(1) : 'N/A';
        
        document.getElementById('totalStations').textContent = this.weatherData.total_stations;
        document.getElementById('avgTemp').textContent = avgTemp;
        document.getElementById('avgHumidity').textContent = avgHumidity;
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});