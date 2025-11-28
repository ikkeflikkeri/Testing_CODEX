import * as THREE from 'three';
import { BuildingManager } from './BuildingManager.js';
import { RoadNetwork } from './RoadNetwork.js';
import { VehicleSystem } from './VehicleSystem.js';
import { PedestrianSystem } from './PedestrianSystem.js';
import { StreetFurniture } from './StreetFurniture.js';
import { LightingSystem } from './LightingSystem.js';
import { TrafficLightSystem } from './TrafficLightSystem.js';

export class City {
    constructor(scene) {
        this.scene = scene;
        this.timeOfDay = 12;
        this.trafficDensity = 1.0;

        // City dimensions
        this.citySize = 300;
        this.blockSize = 40;
        this.roadWidth = 12;

        this.init();
    }

    init() {
        // Create ground
        this.createGround();

        // Initialize all city systems
        this.lightingSystem = new LightingSystem(this.scene);
        this.buildingManager = new BuildingManager(this.scene, this.citySize, this.blockSize, this.roadWidth);
        this.roadNetwork = new RoadNetwork(this.scene, this.citySize, this.blockSize, this.roadWidth);
        this.trafficLightSystem = new TrafficLightSystem(this.scene, this.roadNetwork);
        this.vehicleSystem = new VehicleSystem(this.scene, this.roadNetwork, this.trafficLightSystem);
        this.pedestrianSystem = new PedestrianSystem(this.scene, this.roadNetwork);
        this.streetFurniture = new StreetFurniture(this.scene, this.roadNetwork);

        // Build the city
        this.buildingManager.generateCity();
        this.roadNetwork.generateRoads();
        this.trafficLightSystem.createTrafficLights();
        this.streetFurniture.populate();
        this.vehicleSystem.spawnInitialVehicles();
        this.pedestrianSystem.spawnInitialPedestrians();

        // Set initial time
        this.lightingSystem.setTimeOfDay(this.timeOfDay);
    }

    createGround() {
        const groundSize = this.citySize * 2;

        // Main ground
        const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d5016,
            roughness: 0.9,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = 0;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Grid helper for reference (subtle)
        const gridHelper = new THREE.GridHelper(groundSize, 50, 0x444444, 0x333333);
        gridHelper.position.y = 0.01;
        gridHelper.material.opacity = 0.1;
        gridHelper.material.transparent = true;
        this.scene.add(gridHelper);
    }

    setTimeOfDay(time) {
        this.timeOfDay = time;
        this.lightingSystem.setTimeOfDay(time);
        // Update lamppost lighting
        const lampIntensity = this.lightingSystem.getLamppostIntensity();
        this.streetFurniture.updateLighting(lampIntensity);
    }

    setTrafficDensity(density) {
        this.trafficDensity = density;
        this.vehicleSystem.setTrafficDensity(density);
    }

    update(deltaTime) {
        this.trafficLightSystem.update(deltaTime);
        this.vehicleSystem.update(deltaTime);
        this.pedestrianSystem.update(deltaTime);
        this.lightingSystem.update(deltaTime);

        // Update street furniture lighting based on time of day
        const lampIntensity = this.lightingSystem.getLamppostIntensity();
        this.streetFurniture.updateLighting(lampIntensity);
    }

    getVehicleCount() {
        return this.vehicleSystem.getVehicleCount();
    }

    getPedestrianCount() {
        return this.pedestrianSystem.getPedestrianCount();
    }

    getBuildingCount() {
        return this.buildingManager.getBuildingCount();
    }
}
