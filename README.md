# 3D City Scene - Bustling Urban Environment

A stunning, fully-featured 3D city simulation built with Three.js that brings a vibrant urban environment to life.

## ✨ Features

### 🏙️ **Diverse Buildings**
- **Skyscrapers**: Towering multi-segment buildings in the city center with modern architecture
- **Apartment Buildings**: Mid-rise residential buildings with balconies and windows
- **Office Buildings**: Professional structures with glass facades
- **Shops**: Colorful storefronts with awnings and large windows
- **Houses**: Suburban homes with roofs and detailed features

### 🚗 **Intelligent Traffic System**
- **Moving Vehicles**: Cars, taxis, trucks, and buses with realistic models
- **Traffic Lights**: Functional traffic light system with red, yellow, and green states
- **Smart Traffic Flow**: Vehicles maintain safe distances and obey traffic signals
- **Collision Avoidance**: Cars slow down and stop to avoid collisions
- **Dynamic Spawning**: Adjustable traffic density

### 🚶 **Pedestrian System**
- **Animated Pedestrians**: Walking animations with moving legs
- **Sidewalk Pathfinding**: Pedestrians navigate along sidewalks
- **Crosswalk Crossing**: People cross at designated crosswalks
- **Diverse Appearances**: Randomized clothing, skin tones, and accessories

### 🌳 **Street Elements**
- **Lampposts**: Functional street lights that illuminate at night
- **Benches**: Decorative seating along sidewalks
- **Trees**: Varied vegetation with organic shapes and colors

### ☀️ **Dynamic Day/Night Cycle**
- **Realistic Lighting**: Sun and moon with accurate positioning
- **Time-Based Colors**: Sky colors change from dawn to dusk to night
- **Atmospheric Effects**: Fog adjusts based on time of day
- **Automatic Street Lights**: Lampposts turn on at dusk and off at dawn

### 🎮 **Camera Controls**
- **Mouse Controls**:
  - Left-click + Drag: Rotate camera
  - Right-click + Drag: Pan camera
  - Scroll: Zoom in/out
- **Keyboard Controls**:
  - W: Move forward
  - A: Move left
  - S: Move backward
  - D: Move right

## 🚀 Getting Started

### Prerequisites
- Modern web browser with WebGL support
- Python 3 (for local development server)

### Installation & Running

1. **Clone or download the repository**

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   or
   ```bash
   python3 -m http.server 8000
   ```

3. **Open your browser** and navigate to:
   ```
   http://localhost:8000
   ```

## 🎛️ Controls Panel

The UI panel in the top-left corner provides:

- **Time of Day Slider**: Adjust between 0-24 hours to see day/night transitions
- **Traffic Density**: Control the number of vehicles (10%-200%)
- **Camera Speed**: Adjust how fast the camera moves
- **Reset Camera**: Return to default camera position
- **Pause/Resume**: Toggle animation playback

## 📊 Statistics

The bottom-left panel shows real-time stats:
- FPS (Frames per second)
- Number of active vehicles
- Number of pedestrians
- Total building count

## 🏗️ Architecture

### File Structure
```
├── index.html                 # Main HTML file
├── src/
│   ├── main.js               # Application entry point
│   ├── City.js               # Main city manager
│   ├── BuildingManager.js    # Procedural building generation
│   ├── RoadNetwork.js        # Road system with lanes
│   ├── VehicleSystem.js      # Vehicle movement and AI
│   ├── TrafficLightSystem.js # Traffic light management
│   ├── PedestrianSystem.js   # Pedestrian AI and pathfinding
│   ├── StreetFurniture.js    # Lampposts, benches, trees
│   └── LightingSystem.js     # Day/night cycle lighting
└── package.json              # Project metadata
```

### Key Systems

1. **BuildingManager**: Generates diverse buildings procedurally based on distance from city center
2. **RoadNetwork**: Creates a grid-based road system with lanes, sidewalks, and crosswalks
3. **VehicleSystem**: Manages vehicle spawning, movement, and traffic awareness
4. **TrafficLightSystem**: Synchronizes traffic lights at intersections
5. **PedestrianSystem**: Handles pedestrian spawning, walking, and crossing behavior
6. **StreetFurniture**: Populates the city with environmental details
7. **LightingSystem**: Manages sun, moon, ambient, and hemisphere lighting

## 🎨 Customization

### Adjusting City Size
In `src/City.js`, modify:
```javascript
this.citySize = 300;    // Overall city dimensions
this.blockSize = 40;    // Size of each city block
this.roadWidth = 12;    // Width of roads
```

### Changing Vehicle Count
In `src/VehicleSystem.js`:
```javascript
this.maxVehicles = 50;  // Maximum number of vehicles
```

### Modifying Building Types
Edit the `determineBuildingType()` method in `src/BuildingManager.js` to change building distribution.

## 🌟 Performance Optimization

- Efficient shadow mapping with optimized shadow camera bounds
- Instanced rendering for repeated elements
- Level-of-detail considerations in building generation
- Optimized geometry with minimal polygon counts
- Smart culling and fog to hide distant objects

## 🐛 Troubleshooting

**Issue**: Low FPS
- **Solution**: Reduce traffic density, lower shadow quality, or reduce max vehicles

**Issue**: Scene not loading
- **Solution**: Check browser console for errors, ensure WebGL is supported

**Issue**: Controls not working
- **Solution**: Ensure the canvas has focus by clicking on it

## 📝 License

MIT License - Feel free to use and modify for your projects!

## 🙏 Credits

Built with:
- [Three.js](https://threejs.org/) - 3D graphics library
- Modern JavaScript (ES6+)
- Pure vanilla implementation (no frameworks)

---

**Enjoy exploring the city!** 🏙️✨
