import * as THREE from 'three';

export class RoadNetwork {
    constructor(scene, citySize, blockSize, roadWidth) {
        this.scene = scene;
        this.citySize = citySize;
        this.blockSize = blockSize;
        this.roadWidth = roadWidth;
        this.roads = [];
        this.intersections = [];
        this.sidewalks = [];
        this.crosswalks = [];
        this.lanes = [];
    }

    generateRoads() {
        const halfCity = this.citySize / 2;
        const totalBlockSize = this.blockSize + this.roadWidth;

        // Generate horizontal roads
        for (let z = -halfCity; z <= halfCity; z += totalBlockSize) {
            this.createRoad(
                -halfCity,
                z,
                this.citySize,
                this.roadWidth,
                'horizontal'
            );
        }

        // Generate vertical roads
        for (let x = -halfCity; x <= halfCity; x += totalBlockSize) {
            this.createRoad(
                x,
                -halfCity,
                this.roadWidth,
                this.citySize,
                'vertical'
            );
        }

        // Create intersections
        for (let x = -halfCity; x <= halfCity; x += totalBlockSize) {
            for (let z = -halfCity; z <= halfCity; z += totalBlockSize) {
                this.createIntersection(x, z);
            }
        }

        console.log(`Generated ${this.roads.length} roads and ${this.intersections.length} intersections`);
    }

    createRoad(x, z, width, depth, direction) {
        const group = new THREE.Group();

        // Road surface
        const roadGeometry = new THREE.PlaneGeometry(width, depth);
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c2c2c,
            roughness: 0.9,
            metalness: 0.1
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.01;
        road.receiveShadow = true;
        group.add(road);

        // Lane markings
        this.addLaneMarkings(group, width, depth, direction);

        // Sidewalks
        this.addSidewalks(group, x, z, width, depth, direction);

        group.position.set(
            direction === 'horizontal' ? x + this.citySize / 2 : x,
            0,
            direction === 'vertical' ? z + this.citySize / 2 : z
        );

        this.scene.add(group);
        this.roads.push({
            group,
            x,
            z,
            width,
            depth,
            direction,
            lanes: this.calculateLanes(x, z, width, depth, direction)
        });

        return group;
    }

    addLaneMarkings(group, width, depth, direction) {
        const markingMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.8
        });

        const laneWidth = this.roadWidth / 2;

        if (direction === 'horizontal') {
            // Center line
            const segments = Math.floor(width / 6);
            for (let i = 0; i < segments; i++) {
                if (i % 2 === 0) {
                    const markingGeometry = new THREE.PlaneGeometry(4, 0.2);
                    const marking = new THREE.Mesh(markingGeometry, markingMaterial);
                    marking.rotation.x = -Math.PI / 2;
                    marking.position.set(-width / 2 + i * 6 + 2, 0.02, 0);
                    group.add(marking);
                }
            }
        } else {
            // Center line
            const segments = Math.floor(depth / 6);
            for (let i = 0; i < segments; i++) {
                if (i % 2 === 0) {
                    const markingGeometry = new THREE.PlaneGeometry(0.2, 4);
                    const marking = new THREE.Mesh(markingGeometry, markingMaterial);
                    marking.rotation.x = -Math.PI / 2;
                    marking.position.set(0, 0.02, -depth / 2 + i * 6 + 2);
                    group.add(marking);
                }
            }
        }
    }

    addSidewalks(group, x, z, width, depth, direction) {
        const sidewalkHeight = 0.2;
        const sidewalkWidth = 2;

        const sidewalkMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.8,
            metalness: 0.1
        });

        if (direction === 'horizontal') {
            // Top sidewalk
            const topSidewalkGeometry = new THREE.BoxGeometry(width, sidewalkHeight, sidewalkWidth);
            const topSidewalk = new THREE.Mesh(topSidewalkGeometry, sidewalkMaterial);
            topSidewalk.position.set(0, sidewalkHeight / 2, depth / 2 + sidewalkWidth / 2);
            topSidewalk.castShadow = true;
            topSidewalk.receiveShadow = true;
            group.add(topSidewalk);

            this.sidewalks.push({
                x: x + this.citySize / 2,
                z: z + depth / 2 + sidewalkWidth / 2,
                width,
                depth: sidewalkWidth,
                direction: 'horizontal'
            });

            // Bottom sidewalk
            const bottomSidewalkGeometry = new THREE.BoxGeometry(width, sidewalkHeight, sidewalkWidth);
            const bottomSidewalk = new THREE.Mesh(bottomSidewalkGeometry, sidewalkMaterial);
            bottomSidewalk.position.set(0, sidewalkHeight / 2, -depth / 2 - sidewalkWidth / 2);
            bottomSidewalk.castShadow = true;
            bottomSidewalk.receiveShadow = true;
            group.add(bottomSidewalk);

            this.sidewalks.push({
                x: x + this.citySize / 2,
                z: z - depth / 2 - sidewalkWidth / 2,
                width,
                depth: sidewalkWidth,
                direction: 'horizontal'
            });
        } else {
            // Left sidewalk
            const leftSidewalkGeometry = new THREE.BoxGeometry(sidewalkWidth, sidewalkHeight, depth);
            const leftSidewalk = new THREE.Mesh(leftSidewalkGeometry, sidewalkMaterial);
            leftSidewalk.position.set(-width / 2 - sidewalkWidth / 2, sidewalkHeight / 2, 0);
            leftSidewalk.castShadow = true;
            leftSidewalk.receiveShadow = true;
            group.add(leftSidewalk);

            this.sidewalks.push({
                x: x - width / 2 - sidewalkWidth / 2,
                z: z + this.citySize / 2,
                width: sidewalkWidth,
                depth,
                direction: 'vertical'
            });

            // Right sidewalk
            const rightSidewalkGeometry = new THREE.BoxGeometry(sidewalkWidth, sidewalkHeight, depth);
            const rightSidewalk = new THREE.Mesh(rightSidewalkGeometry, sidewalkMaterial);
            rightSidewalk.position.set(width / 2 + sidewalkWidth / 2, sidewalkHeight / 2, 0);
            rightSidewalk.castShadow = true;
            rightSidewalk.receiveShadow = true;
            group.add(rightSidewalk);

            this.sidewalks.push({
                x: x + width / 2 + sidewalkWidth / 2,
                z: z + this.citySize / 2,
                width: sidewalkWidth,
                depth,
                direction: 'vertical'
            });
        }
    }

    createIntersection(x, z) {
        const group = new THREE.Group();

        // Intersection surface
        const intersectionGeometry = new THREE.PlaneGeometry(this.roadWidth, this.roadWidth);
        const intersectionMaterial = new THREE.MeshStandardMaterial({
            color: 0x2c2c2c,
            roughness: 0.9,
            metalness: 0.1
        });
        const intersection = new THREE.Mesh(intersectionGeometry, intersectionMaterial);
        intersection.rotation.x = -Math.PI / 2;
        intersection.position.y = 0.01;
        intersection.receiveShadow = true;
        group.add(intersection);

        // Crosswalks
        this.addCrosswalks(group, x, z);

        group.position.set(x, 0, z);
        this.scene.add(group);

        this.intersections.push({
            x,
            z,
            group,
            trafficLight: null
        });

        return group;
    }

    addCrosswalks(group, x, z) {
        const crosswalkMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });

        const stripeWidth = 0.5;
        const stripeLength = 2;
        const numStripes = 8;

        // North crosswalk
        for (let i = 0; i < numStripes; i++) {
            const stripe = new THREE.Mesh(
                new THREE.PlaneGeometry(stripeWidth, stripeLength),
                crosswalkMaterial
            );
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(
                -this.roadWidth / 2 + (i + 0.5) * (this.roadWidth / numStripes),
                0.02,
                this.roadWidth / 2 - 1
            );
            group.add(stripe);
        }

        // South crosswalk
        for (let i = 0; i < numStripes; i++) {
            const stripe = new THREE.Mesh(
                new THREE.PlaneGeometry(stripeWidth, stripeLength),
                crosswalkMaterial
            );
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(
                -this.roadWidth / 2 + (i + 0.5) * (this.roadWidth / numStripes),
                0.02,
                -this.roadWidth / 2 + 1
            );
            group.add(stripe);
        }

        // East crosswalk
        for (let i = 0; i < numStripes; i++) {
            const stripe = new THREE.Mesh(
                new THREE.PlaneGeometry(stripeLength, stripeWidth),
                crosswalkMaterial
            );
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(
                this.roadWidth / 2 - 1,
                0.02,
                -this.roadWidth / 2 + (i + 0.5) * (this.roadWidth / numStripes)
            );
            group.add(stripe);
        }

        // West crosswalk
        for (let i = 0; i < numStripes; i++) {
            const stripe = new THREE.Mesh(
                new THREE.PlaneGeometry(stripeLength, stripeWidth),
                crosswalkMaterial
            );
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(
                -this.roadWidth / 2 + 1,
                0.02,
                -this.roadWidth / 2 + (i + 0.5) * (this.roadWidth / numStripes)
            );
            group.add(stripe);
        }

        // Store crosswalk data for pedestrian system
        this.crosswalks.push(
            { x, z: z + this.roadWidth / 2, direction: 'north' },
            { x, z: z - this.roadWidth / 2, direction: 'south' },
            { x: x + this.roadWidth / 2, z, direction: 'east' },
            { x: x - this.roadWidth / 2, z, direction: 'west' }
        );
    }

    calculateLanes(x, z, width, depth, direction) {
        const lanes = [];
        const laneWidth = this.roadWidth / 4;

        if (direction === 'horizontal') {
            // Two lanes: one going right, one going left
            lanes.push({
                start: { x: x, z: z - laneWidth },
                end: { x: x + this.citySize, z: z - laneWidth },
                direction: { x: 1, z: 0 }
            });
            lanes.push({
                start: { x: x + this.citySize, z: z + laneWidth },
                end: { x: x, z: z + laneWidth },
                direction: { x: -1, z: 0 }
            });
        } else {
            // Two lanes: one going forward, one going back
            lanes.push({
                start: { x: x - laneWidth, z: z },
                end: { x: x - laneWidth, z: z + this.citySize },
                direction: { x: 0, z: 1 }
            });
            lanes.push({
                start: { x: x + laneWidth, z: z + this.citySize },
                end: { x: x + laneWidth, z: z },
                direction: { x: 0, z: -1 }
            });
        }

        return lanes;
    }

    getRandomLane() {
        if (this.roads.length === 0) return null;

        const road = this.roads[Math.floor(Math.random() * this.roads.length)];
        const lanes = road.lanes;
        return lanes[Math.floor(Math.random() * lanes.length)];
    }

    getIntersections() {
        return this.intersections;
    }

    getSidewalks() {
        return this.sidewalks;
    }

    getCrosswalks() {
        return this.crosswalks;
    }

    getRoads() {
        return this.roads;
    }
}
