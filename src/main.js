import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { City } from './City.js';

class CityApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.city = null;
        this.clock = new THREE.Clock();
        this.isPaused = false;
        this.timeOfDay = 12;
        this.trafficDensity = 1.0;
        this.cameraSpeed = 1.0;

        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;

        this.init();
    }

    init() {
        // Setup scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 800);

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.set(150, 100, 150);
        this.camera.lookAt(0, 0, 0);

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;

        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Setup controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2.1; // Prevent going below ground
        this.controls.minDistance = 10;
        this.controls.maxDistance = 500;
        this.controls.target.set(0, 0, 0);

        // Create city
        this.city = new City(this.scene);

        // Setup UI controls
        this.setupUIControls();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Keyboard controls
        this.setupKeyboardControls();

        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 1000);

        // Start animation
        this.animate();
    }

    setupUIControls() {
        // Time slider
        const timeSlider = document.getElementById('timeSlider');
        const timeDisplay = document.getElementById('timeDisplay');
        timeSlider.addEventListener('input', (e) => {
            this.timeOfDay = parseFloat(e.target.value);
            const hours = Math.floor(this.timeOfDay);
            const minutes = Math.floor((this.timeOfDay - hours) * 60);
            timeDisplay.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            this.city.setTimeOfDay(this.timeOfDay);
        });

        // Traffic density slider
        const trafficSlider = document.getElementById('trafficSlider');
        const trafficDisplay = document.getElementById('trafficDisplay');
        trafficSlider.addEventListener('input', (e) => {
            this.trafficDensity = parseFloat(e.target.value);
            trafficDisplay.textContent = `${Math.round(this.trafficDensity * 100)}%`;
            this.city.setTrafficDensity(this.trafficDensity);
        });

        // Camera speed slider
        const speedSlider = document.getElementById('speedSlider');
        const speedDisplay = document.getElementById('speedDisplay');
        speedSlider.addEventListener('input', (e) => {
            this.cameraSpeed = parseFloat(e.target.value);
            speedDisplay.textContent = `${this.cameraSpeed.toFixed(1)}x`;
            this.controls.rotateSpeed = this.cameraSpeed;
            this.controls.panSpeed = this.cameraSpeed;
        });

        // Reset camera button
        document.getElementById('resetCamera').addEventListener('click', () => {
            this.camera.position.set(150, 100, 150);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        });

        // Toggle animation button
        const toggleBtn = document.getElementById('toggleAnimation');
        toggleBtn.addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            toggleBtn.textContent = this.isPaused ? 'Resume Animation' : 'Pause Animation';
        });
    }

    setupKeyboardControls() {
        const keys = {};

        window.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
        });

        window.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        // Update camera position based on keyboard input
        const updateCamera = () => {
            const speed = 0.5 * this.cameraSpeed;
            const direction = new THREE.Vector3();

            if (keys['w']) {
                this.camera.getWorldDirection(direction);
                this.camera.position.addScaledVector(direction, speed);
                this.controls.target.addScaledVector(direction, speed);
            }
            if (keys['s']) {
                this.camera.getWorldDirection(direction);
                this.camera.position.addScaledVector(direction, -speed);
                this.controls.target.addScaledVector(direction, -speed);
            }
            if (keys['a']) {
                direction.crossVectors(this.camera.up, this.camera.getWorldDirection(new THREE.Vector3()));
                this.camera.position.addScaledVector(direction, speed);
                this.controls.target.addScaledVector(direction, speed);
            }
            if (keys['d']) {
                direction.crossVectors(this.camera.up, this.camera.getWorldDirection(new THREE.Vector3()));
                this.camera.position.addScaledVector(direction, -speed);
                this.controls.target.addScaledVector(direction, -speed);
            }

            requestAnimationFrame(updateCamera);
        };

        updateCamera();
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    updateStats() {
        this.frameCount++;
        const currentTime = performance.now();

        if (currentTime >= this.lastTime + 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;

            // Update UI
            document.getElementById('fps').textContent = this.fps;
            document.getElementById('vehicleCount').textContent = this.city.getVehicleCount();
            document.getElementById('pedestrianCount').textContent = this.city.getPedestrianCount();
            document.getElementById('buildingCount').textContent = this.city.getBuildingCount();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        if (!this.isPaused) {
            this.city.update(deltaTime);
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        this.updateStats();
    }
}

// Initialize app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    new CityApp();
});
