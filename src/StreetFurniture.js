import * as THREE from 'three';

export class StreetFurniture {
    constructor(scene, roadNetwork) {
        this.scene = scene;
        this.roadNetwork = roadNetwork;
        this.lampposts = [];
        this.benches = [];
        this.trees = [];
    }

    populate() {
        const sidewalks = this.roadNetwork.getSidewalks();
        const intersections = this.roadNetwork.getIntersections();

        // Add lampposts at regular intervals
        sidewalks.forEach(sidewalk => {
            this.addLamppostsToSidewalk(sidewalk);
        });

        // Add benches randomly
        sidewalks.forEach(sidewalk => {
            if (Math.random() > 0.7) {
                this.addBenchToSidewalk(sidewalk);
            }
        });

        // Add trees for greenery
        sidewalks.forEach(sidewalk => {
            if (Math.random() > 0.6) {
                this.addTreeToSidewalk(sidewalk);
            }
        });

        console.log(`Added ${this.lampposts.length} lampposts, ${this.benches.length} benches, ${this.trees.length} trees`);
    }

    addLamppostsToSidewalk(sidewalk) {
        const spacing = 20;
        let count = 0;

        if (sidewalk.direction === 'horizontal') {
            for (let x = sidewalk.x - sidewalk.width / 2; x < sidewalk.x + sidewalk.width / 2; x += spacing) {
                const lamppost = this.createLamppost();
                lamppost.position.set(x, 0, sidewalk.z);
                this.scene.add(lamppost);
                this.lampposts.push(lamppost);
                count++;
            }
        } else {
            for (let z = sidewalk.z - sidewalk.depth / 2; z < sidewalk.z + sidewalk.depth / 2; z += spacing) {
                const lamppost = this.createLamppost();
                lamppost.position.set(sidewalk.x, 0, z);
                this.scene.add(lamppost);
                this.lampposts.push(lamppost);
                count++;
            }
        }
    }

    createLamppost() {
        const group = new THREE.Group();

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.3, 8);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.15;
        base.castShadow = true;
        group.add(base);

        // Pole
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.12, 5, 8);
        const poleMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.7,
            metalness: 0.3
        });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 2.65;
        pole.castShadow = true;
        group.add(pole);

        // Lamp head
        const lampGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
        const lampMaterial = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.5,
            metalness: 0.5
        });
        const lamp = new THREE.Mesh(lampGeometry, lampMaterial);
        lamp.position.y = 5.4;
        lamp.castShadow = true;
        group.add(lamp);

        // Light source
        const lightGeometry = new THREE.CircleGeometry(0.35, 16);
        const lightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffcc,
            transparent: true,
            opacity: 0.8
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.rotation.x = -Math.PI / 2;
        light.position.y = 5.15;
        group.add(light);

        // Point light for illumination
        const pointLight = new THREE.PointLight(0xffffcc, 1, 15);
        pointLight.position.y = 5.2;
        pointLight.castShadow = true;
        pointLight.shadow.mapSize.width = 512;
        pointLight.shadow.mapSize.height = 512;
        group.add(pointLight);
        group.userData.light = pointLight;

        return group;
    }

    addBenchToSidewalk(sidewalk) {
        const bench = this.createBench();

        if (sidewalk.direction === 'horizontal') {
            const x = sidewalk.x - sidewalk.width / 2 + Math.random() * sidewalk.width;
            bench.position.set(x, 0, sidewalk.z);
            bench.rotation.y = Math.PI / 2;
        } else {
            const z = sidewalk.z - sidewalk.depth / 2 + Math.random() * sidewalk.depth;
            bench.position.set(sidewalk.x, 0, z);
        }

        this.scene.add(bench);
        this.benches.push(bench);
    }

    createBench() {
        const group = new THREE.Group();

        const woodMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b4513,
            roughness: 0.9
        });

        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x444444,
            roughness: 0.6,
            metalness: 0.7
        });

        // Seat
        const seatGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
        const seat = new THREE.Mesh(seatGeometry, woodMaterial);
        seat.position.y = 0.5;
        seat.castShadow = true;
        seat.receiveShadow = true;
        group.add(seat);

        // Backrest
        const backrestGeometry = new THREE.BoxGeometry(2, 0.6, 0.1);
        const backrest = new THREE.Mesh(backrestGeometry, woodMaterial);
        backrest.position.set(0, 0.8, -0.2);
        backrest.castShadow = true;
        backrest.receiveShadow = true;
        group.add(backrest);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8);
        const legPositions = [
            { x: -0.8, z: 0.2 },
            { x: 0.8, z: 0.2 },
            { x: -0.8, z: -0.2 },
            { x: 0.8, z: -0.2 }
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(legGeometry, metalMaterial);
            leg.position.set(pos.x, 0.25, pos.z);
            leg.castShadow = true;
            group.add(leg);
        });

        return group;
    }

    addTreeToSidewalk(sidewalk) {
        const tree = this.createTree();

        if (sidewalk.direction === 'horizontal') {
            const x = sidewalk.x - sidewalk.width / 2 + Math.random() * sidewalk.width;
            tree.position.set(x, 0, sidewalk.z);
        } else {
            const z = sidewalk.z - sidewalk.depth / 2 + Math.random() * sidewalk.depth;
            tree.position.set(sidewalk.x, 0, z);
        }

        this.scene.add(tree);
        this.trees.push(tree);
    }

    createTree() {
        const group = new THREE.Group();

        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4a3728,
            roughness: 0.9
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 2;
        trunk.castShadow = true;
        group.add(trunk);

        // Foliage - using multiple spheres for a more organic look
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: this.getRandomTreeColor(),
            roughness: 0.8
        });

        // Main canopy
        const canopyGeometry = new THREE.SphereGeometry(2, 8, 8);
        const canopy = new THREE.Mesh(canopyGeometry, foliageMaterial);
        canopy.position.y = 5;
        canopy.castShadow = true;
        canopy.receiveShadow = true;
        group.add(canopy);

        // Additional foliage clusters for variety
        for (let i = 0; i < 3; i++) {
            const clusterGeometry = new THREE.SphereGeometry(1 + Math.random(), 6, 6);
            const cluster = new THREE.Mesh(clusterGeometry, foliageMaterial);
            cluster.position.set(
                (Math.random() - 0.5) * 2,
                4.5 + Math.random() * 1.5,
                (Math.random() - 0.5) * 2
            );
            cluster.castShadow = true;
            cluster.receiveShadow = true;
            group.add(cluster);
        }

        return group;
    }

    getRandomTreeColor() {
        const colors = [
            0x228b22, // Forest green
            0x32cd32, // Lime green
            0x006400, // Dark green
            0x2e8b57, // Sea green
            0x3cb371  // Medium sea green
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateLighting(intensity) {
        // Update lamppost lights based on time of day
        this.lampposts.forEach(lamppost => {
            const light = lamppost.userData.light;
            if (light) {
                light.intensity = intensity;
            }
        });
    }

    getLampposts() {
        return this.lampposts;
    }
}
