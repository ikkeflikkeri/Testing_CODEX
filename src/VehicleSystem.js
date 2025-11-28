import * as THREE from 'three';

export class VehicleSystem {
    constructor(scene, roadNetwork, trafficLightSystem) {
        this.scene = scene;
        this.roadNetwork = roadNetwork;
        this.trafficLightSystem = trafficLightSystem;
        this.vehicles = [];
        this.maxVehicles = 50;
        this.trafficDensity = 1.0;
        this.vehicleTypes = ['car', 'taxi', 'truck', 'bus'];
    }

    spawnInitialVehicles() {
        const initialCount = Math.floor(this.maxVehicles * 0.5);
        for (let i = 0; i < initialCount; i++) {
            this.spawnVehicle();
        }
        console.log(`Spawned ${initialCount} initial vehicles`);
    }

    spawnVehicle() {
        if (this.vehicles.length >= this.maxVehicles * this.trafficDensity) {
            return;
        }

        const lane = this.roadNetwork.getRandomLane();
        if (!lane) return;

        const type = this.vehicleTypes[Math.floor(Math.random() * this.vehicleTypes.length)];
        const vehicle = this.createVehicle(type);

        if (!vehicle) return;

        // Position at lane start with some random offset
        const startOffset = Math.random() * 50;
        vehicle.position.set(
            lane.start.x + lane.direction.x * startOffset,
            0.5,
            lane.start.z + lane.direction.z * startOffset
        );

        // Set rotation based on direction
        const angle = Math.atan2(lane.direction.z, lane.direction.x);
        vehicle.rotation.y = angle - Math.PI / 2;

        this.scene.add(vehicle);

        this.vehicles.push({
            mesh: vehicle,
            lane,
            speed: 15 + Math.random() * 10,
            maxSpeed: 25,
            progress: startOffset,
            type,
            stoppedAtLight: false,
            distanceToNextVehicle: Infinity
        });
    }

    createVehicle(type) {
        const group = new THREE.Group();

        switch (type) {
            case 'car':
                return this.createCar(group);
            case 'taxi':
                return this.createTaxi(group);
            case 'truck':
                return this.createTruck(group);
            case 'bus':
                return this.createBus(group);
            default:
                return this.createCar(group);
        }
    }

    createCar(group) {
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(1.8, 1, 4);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.getRandomCarColor(),
            metalness: 0.8,
            roughness: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);

        // Roof
        const roofGeometry = new THREE.BoxGeometry(1.6, 0.7, 2);
        const roof = new THREE.Mesh(roofGeometry, bodyMaterial);
        roof.position.set(0, 1.35, -0.3);
        roof.castShadow = true;
        group.add(roof);

        // Windows
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.5
        });

        const windowGeometry = new THREE.BoxGeometry(1.61, 0.6, 1.8);
        const windows = new THREE.Mesh(windowGeometry, windowMaterial);
        windows.position.set(0, 1.35, -0.3);
        group.add(windows);

        // Wheels
        this.addWheels(group, 1.8, 4);

        // Headlights
        this.addHeadlights(group, 1.8, 2);

        return group;
    }

    createTaxi(group) {
        const car = this.createCar(group);

        // Add taxi sign
        const signGeometry = new THREE.BoxGeometry(1, 0.3, 0.5);
        const signMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 0.5
        });
        const sign = new THREE.Mesh(signGeometry, signMaterial);
        sign.position.set(0, 1.9, -0.3);
        car.add(sign);

        // Change body color to yellow
        car.children[0].material = new THREE.MeshStandardMaterial({
            color: 0xffcc00,
            metalness: 0.8,
            roughness: 0.2
        });

        return car;
    }

    createTruck(group) {
        // Cab
        const cabGeometry = new THREE.BoxGeometry(2.2, 1.5, 2);
        const cabMaterial = new THREE.MeshStandardMaterial({
            color: this.getRandomCarColor(),
            metalness: 0.7,
            roughness: 0.3
        });
        const cab = new THREE.Mesh(cabGeometry, cabMaterial);
        cab.position.set(0, 0.75, 1.5);
        cab.castShadow = true;
        group.add(cab);

        // Cargo
        const cargoGeometry = new THREE.BoxGeometry(2.2, 2, 4);
        const cargoMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 0.5,
            roughness: 0.5
        });
        const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
        cargo.position.set(0, 1, -1.5);
        cargo.castShadow = true;
        group.add(cargo);

        // Wheels
        this.addWheels(group, 2.2, 6);

        // Headlights
        this.addHeadlights(group, 2.2, 2.5);

        return group;
    }

    createBus(group) {
        // Bus body
        const bodyGeometry = new THREE.BoxGeometry(2.5, 2.5, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4169e1,
            metalness: 0.6,
            roughness: 0.4
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.25;
        body.castShadow = true;
        group.add(body);

        // Windows
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            transparent: true,
            opacity: 0.3
        });

        for (let i = -3; i < 4; i++) {
            const windowGeometry = new THREE.BoxGeometry(2.51, 1, 1);
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(0, 1.5, i * 1.2);
            group.add(window);
        }

        // Wheels
        this.addWheels(group, 2.5, 8);

        // Headlights
        this.addHeadlights(group, 2.5, 4);

        return group;
    }

    addWheels(group, width, length) {
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16);
        const wheelMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9
        });

        const wheelPositions = [
            { x: width / 2 + 0.2, z: length / 3 },
            { x: -width / 2 - 0.2, z: length / 3 },
            { x: width / 2 + 0.2, z: -length / 3 },
            { x: -width / 2 - 0.2, z: -length / 3 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.3, pos.z);
            wheel.castShadow = true;
            group.add(wheel);
        });
    }

    addHeadlights(group, width, frontZ) {
        const lightGeometry = new THREE.CircleGeometry(0.2, 8);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.8
        });

        const leftLight = new THREE.Mesh(lightGeometry, lightMaterial);
        leftLight.position.set(width / 3, 0.5, frontZ);
        group.add(leftLight);

        const rightLight = new THREE.Mesh(lightGeometry, lightMaterial);
        rightLight.position.set(-width / 3, 0.5, frontZ);
        group.add(rightLight);
    }

    getRandomCarColor() {
        const colors = [
            0xff0000, // Red
            0x0000ff, // Blue
            0x00ff00, // Green
            0xffff00, // Yellow
            0xff00ff, // Magenta
            0x00ffff, // Cyan
            0xffffff, // White
            0x000000, // Black
            0x808080, // Gray
            0xffa500  // Orange
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(deltaTime) {
        // Spawn new vehicles if below density threshold
        if (Math.random() < 0.02 * this.trafficDensity) {
            this.spawnVehicle();
        }

        // Update each vehicle
        for (let i = this.vehicles.length - 1; i >= 0; i--) {
            const vehicle = this.vehicles[i];
            const lane = vehicle.lane;

            // Check distance to next vehicle
            vehicle.distanceToNextVehicle = this.getDistanceToNextVehicle(vehicle, i);

            // Check for red lights at intersections
            const lightState = this.checkTrafficLight(vehicle);

            // Adjust speed based on conditions
            let targetSpeed = vehicle.maxSpeed;

            // Stop at red lights
            if (lightState === 'red' && vehicle.distanceToNextVehicle > 5) {
                const distanceToIntersection = this.getDistanceToNextIntersection(vehicle);
                if (distanceToIntersection < 10 && distanceToIntersection > 0) {
                    targetSpeed = 0;
                    vehicle.stoppedAtLight = true;
                }
            } else if (lightState === 'yellow') {
                const distanceToIntersection = this.getDistanceToNextIntersection(vehicle);
                if (distanceToIntersection < 5 && distanceToIntersection > 0) {
                    targetSpeed = vehicle.maxSpeed * 0.5;
                }
            } else {
                vehicle.stoppedAtLight = false;
            }

            // Maintain safe distance from vehicle ahead
            if (vehicle.distanceToNextVehicle < 8) {
                targetSpeed = Math.min(targetSpeed, vehicle.maxSpeed * 0.3);
            } else if (vehicle.distanceToNextVehicle < 15) {
                targetSpeed = Math.min(targetSpeed, vehicle.maxSpeed * 0.7);
            }

            // Smooth speed adjustment
            if (vehicle.speed < targetSpeed) {
                vehicle.speed += 10 * deltaTime;
            } else if (vehicle.speed > targetSpeed) {
                vehicle.speed -= 15 * deltaTime;
            }

            vehicle.speed = Math.max(0, Math.min(vehicle.speed, vehicle.maxSpeed));

            // Move vehicle
            vehicle.progress += vehicle.speed * deltaTime;
            vehicle.mesh.position.x = lane.start.x + lane.direction.x * vehicle.progress;
            vehicle.mesh.position.z = lane.start.z + lane.direction.z * vehicle.progress;

            // Remove vehicle if it goes too far
            const maxDistance = Math.max(
                Math.abs(lane.end.x - lane.start.x),
                Math.abs(lane.end.z - lane.start.z)
            );

            if (vehicle.progress > maxDistance + 50) {
                this.scene.remove(vehicle.mesh);
                this.vehicles.splice(i, 1);
            }
        }
    }

    getDistanceToNextVehicle(currentVehicle, currentIndex) {
        let minDistance = Infinity;

        for (let i = 0; i < this.vehicles.length; i++) {
            if (i === currentIndex) continue;

            const otherVehicle = this.vehicles[i];

            // Only check vehicles in the same lane
            if (otherVehicle.lane !== currentVehicle.lane) continue;

            // Only check vehicles ahead
            if (otherVehicle.progress <= currentVehicle.progress) continue;

            const distance = otherVehicle.progress - currentVehicle.progress;
            minDistance = Math.min(minDistance, distance);
        }

        return minDistance;
    }

    getDistanceToNextIntersection(vehicle) {
        const intersections = this.roadNetwork.getIntersections();
        let minDistance = Infinity;

        intersections.forEach(intersection => {
            const dx = intersection.x - vehicle.mesh.position.x;
            const dz = intersection.z - vehicle.mesh.position.z;

            // Check if intersection is ahead in the direction of travel
            const dotProduct = dx * vehicle.lane.direction.x + dz * vehicle.lane.direction.z;

            if (dotProduct > 0) {
                const distance = Math.sqrt(dx * dx + dz * dz);
                minDistance = Math.min(minDistance, distance);
            }
        });

        return minDistance;
    }

    checkTrafficLight(vehicle) {
        const intersections = this.roadNetwork.getIntersections();
        let closestIntersection = null;
        let minDistance = Infinity;

        intersections.forEach(intersection => {
            const dx = intersection.x - vehicle.mesh.position.x;
            const dz = intersection.z - vehicle.mesh.position.z;

            // Check if intersection is ahead
            const dotProduct = dx * vehicle.lane.direction.x + dz * vehicle.lane.direction.z;

            if (dotProduct > 0) {
                const distance = Math.sqrt(dx * dx + dz * dz);
                if (distance < minDistance && distance < 15) {
                    minDistance = distance;
                    closestIntersection = intersection;
                }
            }
        });

        if (!closestIntersection || !closestIntersection.trafficLight) {
            return 'green';
        }

        // Determine direction and get appropriate light state
        const direction = this.getDirectionFromLane(vehicle.lane);
        return this.trafficLightSystem.getLightStateAtIntersection(
            closestIntersection.x,
            closestIntersection.z,
            direction
        );
    }

    getDirectionFromLane(lane) {
        if (Math.abs(lane.direction.x) > Math.abs(lane.direction.z)) {
            return lane.direction.x > 0 ? 'east' : 'west';
        } else {
            return lane.direction.z > 0 ? 'south' : 'north';
        }
    }

    setTrafficDensity(density) {
        this.trafficDensity = density;
    }

    getVehicleCount() {
        return this.vehicles.length;
    }
}
