import * as THREE from 'three';

export class TrafficLightSystem {
    constructor(scene, roadNetwork) {
        this.scene = scene;
        this.roadNetwork = roadNetwork;
        this.trafficLights = [];
        this.cycleTime = 8; // seconds
        this.yellowTime = 2; // seconds
    }

    createTrafficLights() {
        const intersections = this.roadNetwork.getIntersections();

        intersections.forEach(intersection => {
            const lights = this.createTrafficLightSet(intersection.x, intersection.z);
            intersection.trafficLight = lights;
            this.trafficLights.push(lights);
        });

        console.log(`Created ${this.trafficLights.length} traffic light sets`);
    }

    createTrafficLightSet(x, z) {
        const offset = 8;
        const lights = {
            north: this.createTrafficLight(x, z + offset, 0),
            south: this.createTrafficLight(x, z - offset, Math.PI),
            east: this.createTrafficLight(x + offset, z, -Math.PI / 2),
            west: this.createTrafficLight(x - offset, z, Math.PI / 2),
            timer: 0,
            state: 'ns-green' // ns-green, ns-yellow, ew-green, ew-yellow
        };

        return lights;
    }

    createTrafficLight(x, z, rotation) {
        const group = new THREE.Group();

        // Pole
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 2;
        pole.castShadow = true;
        group.add(pole);

        // Light housing
        const housingGeometry = new THREE.BoxGeometry(0.5, 1.5, 0.3);
        const housingMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
        const housing = new THREE.Mesh(housingGeometry, housingMaterial);
        housing.position.y = 4.5;
        housing.castShadow = true;
        group.add(housing);

        // Red light
        const redLightGeometry = new THREE.CircleGeometry(0.15, 16);
        const redLightMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.3
        });
        const redLight = new THREE.Mesh(redLightGeometry, redLightMaterial);
        redLight.position.set(0, 5, 0.16);
        group.add(redLight);

        // Red light glow
        const redGlow = new THREE.PointLight(0xff0000, 0, 5);
        redGlow.position.set(0, 5, 0.5);
        group.add(redGlow);

        // Yellow light
        const yellowLightGeometry = new THREE.CircleGeometry(0.15, 16);
        const yellowLightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.3
        });
        const yellowLight = new THREE.Mesh(yellowLightGeometry, yellowLightMaterial);
        yellowLight.position.set(0, 4.5, 0.16);
        group.add(yellowLight);

        // Yellow light glow
        const yellowGlow = new THREE.PointLight(0xffff00, 0, 5);
        yellowGlow.position.set(0, 4.5, 0.5);
        group.add(yellowGlow);

        // Green light
        const greenLightGeometry = new THREE.CircleGeometry(0.15, 16);
        const greenLightMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.3
        });
        const greenLight = new THREE.Mesh(greenLightGeometry, greenLightMaterial);
        greenLight.position.set(0, 4, 0.16);
        group.add(greenLight);

        // Green light glow
        const greenGlow = new THREE.PointLight(0x00ff00, 0, 5);
        greenGlow.position.set(0, 4, 0.5);
        group.add(greenGlow);

        group.position.set(x, 0, z);
        group.rotation.y = rotation;
        this.scene.add(group);

        return {
            group,
            redLight,
            yellowLight,
            greenLight,
            redGlow,
            yellowGlow,
            greenGlow,
            currentState: 'red'
        };
    }

    update(deltaTime) {
        this.trafficLights.forEach(lightSet => {
            lightSet.timer += deltaTime;

            // State machine for traffic light cycling
            if (lightSet.state === 'ns-green') {
                this.setLightState(lightSet.north, 'green');
                this.setLightState(lightSet.south, 'green');
                this.setLightState(lightSet.east, 'red');
                this.setLightState(lightSet.west, 'red');

                if (lightSet.timer >= this.cycleTime) {
                    lightSet.state = 'ns-yellow';
                    lightSet.timer = 0;
                }
            } else if (lightSet.state === 'ns-yellow') {
                this.setLightState(lightSet.north, 'yellow');
                this.setLightState(lightSet.south, 'yellow');
                this.setLightState(lightSet.east, 'red');
                this.setLightState(lightSet.west, 'red');

                if (lightSet.timer >= this.yellowTime) {
                    lightSet.state = 'ew-green';
                    lightSet.timer = 0;
                }
            } else if (lightSet.state === 'ew-green') {
                this.setLightState(lightSet.north, 'red');
                this.setLightState(lightSet.south, 'red');
                this.setLightState(lightSet.east, 'green');
                this.setLightState(lightSet.west, 'green');

                if (lightSet.timer >= this.cycleTime) {
                    lightSet.state = 'ew-yellow';
                    lightSet.timer = 0;
                }
            } else if (lightSet.state === 'ew-yellow') {
                this.setLightState(lightSet.north, 'red');
                this.setLightState(lightSet.south, 'red');
                this.setLightState(lightSet.east, 'yellow');
                this.setLightState(lightSet.west, 'yellow');

                if (lightSet.timer >= this.yellowTime) {
                    lightSet.state = 'ns-green';
                    lightSet.timer = 0;
                }
            }
        });
    }

    setLightState(light, state) {
        light.currentState = state;

        // Reset all lights
        light.redLight.material.opacity = 0.3;
        light.yellowLight.material.opacity = 0.3;
        light.greenLight.material.opacity = 0.3;
        light.redGlow.intensity = 0;
        light.yellowGlow.intensity = 0;
        light.greenGlow.intensity = 0;

        // Set active light
        if (state === 'red') {
            light.redLight.material.opacity = 1.0;
            light.redGlow.intensity = 2;
        } else if (state === 'yellow') {
            light.yellowLight.material.opacity = 1.0;
            light.yellowGlow.intensity = 2;
        } else if (state === 'green') {
            light.greenLight.material.opacity = 1.0;
            light.greenGlow.intensity = 2;
        }
    }

    getLightStateAtIntersection(x, z, direction) {
        const light = this.trafficLights.find(l => {
            const pos = l.north.group.position;
            return Math.abs(pos.x - x) < 10 && Math.abs(pos.z - z) < 10;
        });

        if (!light) return 'green';

        // Determine which light to check based on direction
        if (direction === 'north' || direction === 'south') {
            return light.north.currentState;
        } else {
            return light.east.currentState;
        }
    }
}
