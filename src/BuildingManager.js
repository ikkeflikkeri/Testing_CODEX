import * as THREE from 'three';

export class BuildingManager {
    constructor(scene, citySize, blockSize, roadWidth) {
        this.scene = scene;
        this.citySize = citySize;
        this.blockSize = blockSize;
        this.roadWidth = roadWidth;
        this.buildings = [];
        this.buildingCount = 0;
    }

    generateCity() {
        const halfCity = this.citySize / 2;
        const totalBlockSize = this.blockSize + this.roadWidth;

        // Generate buildings in a grid pattern
        for (let x = -halfCity; x < halfCity; x += totalBlockSize) {
            for (let z = -halfCity; z < halfCity; z += totalBlockSize) {
                // Skip some blocks randomly for variety
                if (Math.random() > 0.85) continue;

                // Determine building type based on distance from center
                const distanceFromCenter = Math.sqrt(x * x + z * z);
                const buildingType = this.determineBuildingType(distanceFromCenter);

                this.createBuilding(x, z, buildingType);
            }
        }

        console.log(`Generated ${this.buildingCount} buildings`);
    }

    determineBuildingType(distanceFromCenter) {
        // Downtown (center): Skyscrapers
        if (distanceFromCenter < 80) {
            return 'skyscraper';
        }
        // Mid-town: Mix of apartments and offices
        else if (distanceFromCenter < 150) {
            return Math.random() > 0.5 ? 'apartment' : 'office';
        }
        // Suburbs: Smaller buildings and shops
        else {
            return Math.random() > 0.6 ? 'shop' : 'house';
        }
    }

    createBuilding(x, z, type) {
        let building;

        switch (type) {
            case 'skyscraper':
                building = this.createSkyscraper(x, z);
                break;
            case 'apartment':
                building = this.createApartment(x, z);
                break;
            case 'office':
                building = this.createOffice(x, z);
                break;
            case 'shop':
                building = this.createShop(x, z);
                break;
            case 'house':
                building = this.createHouse(x, z);
                break;
        }

        if (building) {
            this.buildings.push(building);
            this.buildingCount++;
        }
    }

    createSkyscraper(x, z) {
        const group = new THREE.Group();

        // Random dimensions
        const width = 15 + Math.random() * 10;
        const depth = 15 + Math.random() * 10;
        const height = 60 + Math.random() * 80;
        const floors = Math.floor(height / 3);

        // Main tower with segments
        const segments = Math.floor(Math.random() * 2) + 2;
        let currentHeight = 0;

        for (let i = 0; i < segments; i++) {
            const segmentHeight = height / segments;
            const segmentWidth = width * (1 - i * 0.1);
            const segmentDepth = depth * (1 - i * 0.1);

            const geometry = new THREE.BoxGeometry(segmentWidth, segmentHeight, segmentDepth);
            const material = new THREE.MeshStandardMaterial({
                color: this.getSkyscraperColor(),
                metalness: 0.5,
                roughness: 0.3,
                emissive: 0x222222,
                emissiveIntensity: 0.1
            });

            const segment = new THREE.Mesh(geometry, material);
            segment.position.y = currentHeight + segmentHeight / 2;
            segment.castShadow = true;
            segment.receiveShadow = true;

            // Add windows
            this.addWindows(segment, segmentWidth, segmentHeight, segmentDepth, floors / segments);

            group.add(segment);
            currentHeight += segmentHeight;
        }

        // Add antenna
        if (Math.random() > 0.5) {
            const antennaGeometry = new THREE.CylinderGeometry(0.2, 0.4, 10, 8);
            const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
            const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            antenna.position.y = currentHeight + 5;
            antenna.castShadow = true;
            group.add(antenna);
        }

        group.position.set(x + this.roadWidth / 2, 0, z + this.roadWidth / 2);
        this.scene.add(group);

        return group;
    }

    createApartment(x, z) {
        const group = new THREE.Group();

        const width = 12 + Math.random() * 8;
        const depth = 12 + Math.random() * 8;
        const height = 25 + Math.random() * 30;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: this.getApartmentColor(),
            roughness: 0.7,
            metalness: 0.2
        });

        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;

        // Add balconies
        const floors = Math.floor(height / 3);
        for (let i = 2; i < floors; i++) {
            if (Math.random() > 0.5) {
                const balconyGeometry = new THREE.BoxGeometry(width * 0.8, 0.2, 2);
                const balconyMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
                const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
                balcony.position.set(0, i * 3 - height / 2, depth / 2 + 1);
                balcony.castShadow = true;
                building.add(balcony);
            }
        }

        // Add windows
        this.addWindows(building, width, height, depth, floors);

        group.add(building);
        group.position.set(x + this.roadWidth / 2, 0, z + this.roadWidth / 2);
        this.scene.add(group);

        return group;
    }

    createOffice(x, z) {
        const group = new THREE.Group();

        const width = 14 + Math.random() * 6;
        const depth = 14 + Math.random() * 6;
        const height = 20 + Math.random() * 25;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: this.getOfficeColor(),
            roughness: 0.4,
            metalness: 0.6,
            emissive: 0x111111,
            emissiveIntensity: 0.05
        });

        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;

        // Add windows
        const floors = Math.floor(height / 4);
        this.addWindows(building, width, height, depth, floors);

        group.add(building);
        group.position.set(x + this.roadWidth / 2, 0, z + this.roadWidth / 2);
        this.scene.add(group);

        return group;
    }

    createShop(x, z) {
        const group = new THREE.Group();

        const width = 8 + Math.random() * 5;
        const depth = 8 + Math.random() * 5;
        const height = 6 + Math.random() * 6;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: this.getShopColor(),
            roughness: 0.8,
            metalness: 0.1
        });

        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;

        // Add storefront
        const storefrontGeometry = new THREE.BoxGeometry(width * 0.9, height * 0.4, 0.2);
        const storefrontMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.1,
            metalness: 0.9,
            emissive: 0x4444ff,
            emissiveIntensity: 0.3
        });
        const storefront = new THREE.Mesh(storefrontGeometry, storefrontMaterial);
        storefront.position.set(0, -height * 0.25, depth / 2 + 0.1);
        building.add(storefront);

        // Add awning
        if (Math.random() > 0.5) {
            const awningGeometry = new THREE.BoxGeometry(width * 0.9, 0.1, 2);
            const awningMaterial = new THREE.MeshStandardMaterial({
                color: this.getRandomColor([0xff6b6b, 0x4ecdc4, 0xffe66d, 0xa8e6cf])
            });
            const awning = new THREE.Mesh(awningGeometry, awningMaterial);
            awning.position.set(0, height * 0.1, depth / 2 + 1);
            awning.castShadow = true;
            building.add(awning);
        }

        group.add(building);
        group.position.set(x + this.roadWidth / 2, 0, z + this.roadWidth / 2);
        this.scene.add(group);

        return group;
    }

    createHouse(x, z) {
        const group = new THREE.Group();

        const width = 6 + Math.random() * 4;
        const depth = 6 + Math.random() * 4;
        const height = 5 + Math.random() * 3;

        // Main house
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: this.getHouseColor(),
            roughness: 0.9,
            metalness: 0.1
        });

        const building = new THREE.Mesh(geometry, material);
        building.position.y = height / 2;
        building.castShadow = true;
        building.receiveShadow = true;

        // Add roof
        const roofGeometry = new THREE.ConeGeometry(width * 0.8, 3, 4);
        const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = height + 1.5;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        building.add(roof);

        // Add door
        const doorGeometry = new THREE.BoxGeometry(1.5, 2.5, 0.2);
        const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, -height / 2 + 1.25, depth / 2 + 0.1);
        building.add(door);

        // Add windows
        for (let i = 0; i < 2; i++) {
            const windowGeometry = new THREE.BoxGeometry(1, 1, 0.1);
            const windowMaterial = new THREE.MeshStandardMaterial({
                color: 0x87ceeb,
                emissive: 0xffffaa,
                emissiveIntensity: 0.2
            });
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set((i - 0.5) * 3, 0, depth / 2 + 0.1);
            building.add(window);
        }

        group.add(building);
        group.position.set(x + this.roadWidth / 2, 0, z + this.roadWidth / 2);
        this.scene.add(group);

        return group;
    }

    addWindows(building, width, height, depth, floors) {
        const windowSize = 0.8;
        const windowSpacing = 2.5;

        const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
        const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            emissive: 0xffffaa,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        // Front and back windows
        for (let floor = 1; floor < floors; floor++) {
            const y = -height / 2 + floor * (height / floors);

            for (let w = -width / 2 + windowSpacing; w < width / 2; w += windowSpacing) {
                // Front
                if (Math.random() > 0.1) {
                    const window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(w, y, depth / 2 + 0.01);
                    building.add(window);
                }

                // Back
                if (Math.random() > 0.1) {
                    const window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(w, y, -depth / 2 - 0.01);
                    window.rotation.y = Math.PI;
                    building.add(window);
                }
            }

            // Side windows
            for (let d = -depth / 2 + windowSpacing; d < depth / 2; d += windowSpacing) {
                // Left
                if (Math.random() > 0.1) {
                    const window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(-width / 2 - 0.01, y, d);
                    window.rotation.y = Math.PI / 2;
                    building.add(window);
                }

                // Right
                if (Math.random() > 0.1) {
                    const window = new THREE.Mesh(windowGeometry, windowMaterial);
                    window.position.set(width / 2 + 0.01, y, d);
                    window.rotation.y = -Math.PI / 2;
                    building.add(window);
                }
            }
        }
    }

    getSkyscraperColor() {
        const colors = [0x4a5568, 0x2d3748, 0x1a202c, 0x2c5282, 0x2d3748];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getApartmentColor() {
        const colors = [0xf7fafc, 0xe2e8f0, 0xcbd5e0, 0xa0aec0, 0xedf2f7];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getOfficeColor() {
        const colors = [0x667eea, 0x764ba2, 0x5a67d8, 0x4c51bf, 0x434190];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getShopColor() {
        const colors = [0xfed7aa, 0xfbbf24, 0xfb923c, 0xef4444, 0xf87171];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getHouseColor() {
        const colors = [0xfef3c7, 0xfde68a, 0xfcd34d, 0xfbbf24, 0xf59e0b];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomColor(colors) {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getBuildingCount() {
        return this.buildingCount;
    }
}
