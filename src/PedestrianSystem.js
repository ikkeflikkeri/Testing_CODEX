import * as THREE from 'three';

export class PedestrianSystem {
    constructor(scene, roadNetwork) {
        this.scene = scene;
        this.roadNetwork = roadNetwork;
        this.pedestrians = [];
        this.maxPedestrians = 40;
        this.walkSpeed = 2;
    }

    spawnInitialPedestrians() {
        const initialCount = Math.floor(this.maxPedestrians * 0.6);
        for (let i = 0; i < initialCount; i++) {
            this.spawnPedestrian();
        }
        console.log(`Spawned ${initialCount} initial pedestrians`);
    }

    spawnPedestrian() {
        if (this.pedestrians.length >= this.maxPedestrians) {
            return;
        }

        const sidewalks = this.roadNetwork.getSidewalks();
        if (sidewalks.length === 0) return;

        const sidewalk = sidewalks[Math.floor(Math.random() * sidewalks.length)];
        const pedestrian = this.createPedestrian();

        // Position on sidewalk
        if (sidewalk.direction === 'horizontal') {
            pedestrian.position.set(
                sidewalk.x - sidewalk.width / 2 + Math.random() * sidewalk.width,
                0.2,
                sidewalk.z + (Math.random() - 0.5) * 1.5
            );
        } else {
            pedestrian.position.set(
                sidewalk.x + (Math.random() - 0.5) * 1.5,
                0.2,
                sidewalk.z - sidewalk.depth / 2 + Math.random() * sidewalk.depth
            );
        }

        this.scene.add(pedestrian);

        // Determine walking direction
        const direction = Math.random() > 0.5 ? 1 : -1;
        const speed = this.walkSpeed * (0.7 + Math.random() * 0.6);

        this.pedestrians.push({
            mesh: pedestrian,
            sidewalk,
            direction,
            speed,
            state: 'walking', // walking, waiting, crossing
            waitTimer: 0,
            crosswalkTarget: null,
            animationTime: Math.random() * Math.PI * 2
        });
    }

    createPedestrian() {
        const group = new THREE.Group();

        // Body
        const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: this.getRandomClothingColor(),
            roughness: 0.8
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.5;
        body.castShadow = true;
        group.add(body);

        // Head
        const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: this.getRandomSkinColor(),
            roughness: 0.7
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 1.15;
        head.castShadow = true;
        group.add(head);

        // Arms
        const armGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: bodyMaterial.color,
            roughness: 0.8
        });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.25, 0.6, 0);
        leftArm.rotation.z = 0.2;
        leftArm.castShadow = true;
        group.add(leftArm);

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.25, 0.6, 0);
        rightArm.rotation.z = -0.2;
        rightArm.castShadow = true;
        group.add(rightArm);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: this.getRandomPantsColor(),
            roughness: 0.8
        });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.1, 0, 0);
        leftLeg.castShadow = true;
        group.add(leftLeg);
        group.userData.leftLeg = leftLeg;

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.1, 0, 0);
        rightLeg.castShadow = true;
        group.add(rightLeg);
        group.userData.rightLeg = rightLeg;

        return group;
    }

    getRandomClothingColor() {
        const colors = [
            0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24,
            0x6c5ce7, 0xa29bfe, 0xfd79a8, 0x00b894,
            0x0984e3, 0xe17055
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomSkinColor() {
        const colors = [
            0xffc9a0, 0xffb380, 0xff9d60, 0xff8740,
            0xd4a574, 0xc68b59, 0x8d5524
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomPantsColor() {
        const colors = [
            0x2c3e50, 0x34495e, 0x1e272e, 0x3c6382,
            0x4a4a4a, 0x7f8c8d
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(deltaTime) {
        // Spawn new pedestrians occasionally
        if (Math.random() < 0.01 && this.pedestrians.length < this.maxPedestrians) {
            this.spawnPedestrian();
        }

        // Update each pedestrian
        for (let i = this.pedestrians.length - 1; i >= 0; i--) {
            const pedestrian = this.pedestrians[i];

            // Update animation
            pedestrian.animationTime += deltaTime * pedestrian.speed;
            this.animateWalking(pedestrian);

            if (pedestrian.state === 'walking') {
                this.updateWalking(pedestrian, deltaTime);
            } else if (pedestrian.state === 'waiting') {
                this.updateWaiting(pedestrian, deltaTime);
            } else if (pedestrian.state === 'crossing') {
                this.updateCrossing(pedestrian, deltaTime);
            }

            // Remove pedestrian if too far from city
            const pos = pedestrian.mesh.position;
            const citySize = this.roadNetwork.citySize;
            if (Math.abs(pos.x) > citySize || Math.abs(pos.z) > citySize) {
                this.scene.remove(pedestrian.mesh);
                this.pedestrians.splice(i, 1);
            }
        }
    }

    updateWalking(pedestrian, deltaTime) {
        const sidewalk = pedestrian.sidewalk;
        const movement = pedestrian.speed * pedestrian.direction * deltaTime;

        // Move along sidewalk
        if (sidewalk.direction === 'horizontal') {
            pedestrian.mesh.position.x += movement;
            pedestrian.mesh.rotation.y = pedestrian.direction > 0 ? Math.PI / 2 : -Math.PI / 2;

            // Check if reached crosswalk
            if (Math.random() < 0.01) {
                this.startCrossing(pedestrian);
            }

            // Check if reached end of sidewalk
            const endX = sidewalk.x + sidewalk.width / 2;
            const startX = sidewalk.x - sidewalk.width / 2;

            if (pedestrian.direction > 0 && pedestrian.mesh.position.x > endX) {
                pedestrian.direction = -1;
            } else if (pedestrian.direction < 0 && pedestrian.mesh.position.x < startX) {
                pedestrian.direction = 1;
            }
        } else {
            pedestrian.mesh.position.z += movement;
            pedestrian.mesh.rotation.y = pedestrian.direction > 0 ? Math.PI : 0;

            // Check if reached crosswalk
            if (Math.random() < 0.01) {
                this.startCrossing(pedestrian);
            }

            // Check if reached end of sidewalk
            const endZ = sidewalk.z + sidewalk.depth / 2;
            const startZ = sidewalk.z - sidewalk.depth / 2;

            if (pedestrian.direction > 0 && pedestrian.mesh.position.z > endZ) {
                pedestrian.direction = -1;
            } else if (pedestrian.direction < 0 && pedestrian.mesh.position.z < startZ) {
                pedestrian.direction = 1;
            }
        }
    }

    updateWaiting(pedestrian, deltaTime) {
        pedestrian.waitTimer += deltaTime;

        // Stop walking animation
        pedestrian.animationTime = 0;

        // Wait for a bit, then cross
        if (pedestrian.waitTimer > 2) {
            pedestrian.state = 'crossing';
            pedestrian.waitTimer = 0;
        }
    }

    updateCrossing(pedestrian, deltaTime) {
        if (!pedestrian.crosswalkTarget) return;

        const target = pedestrian.crosswalkTarget;
        const dx = target.x - pedestrian.mesh.position.x;
        const dz = target.z - pedestrian.mesh.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < 0.5) {
            // Reached other side
            pedestrian.state = 'walking';
            pedestrian.crosswalkTarget = null;

            // Find new sidewalk
            const sidewalks = this.roadNetwork.getSidewalks();
            let closestSidewalk = null;
            let minDist = Infinity;

            sidewalks.forEach(sw => {
                const d = Math.sqrt(
                    Math.pow(sw.x - pedestrian.mesh.position.x, 2) +
                    Math.pow(sw.z - pedestrian.mesh.position.z, 2)
                );
                if (d < minDist) {
                    minDist = d;
                    closestSidewalk = sw;
                }
            });

            if (closestSidewalk) {
                pedestrian.sidewalk = closestSidewalk;
            }
        } else {
            // Move towards target
            const speed = pedestrian.speed * deltaTime;
            pedestrian.mesh.position.x += (dx / distance) * speed;
            pedestrian.mesh.position.z += (dz / distance) * speed;

            // Face direction of movement
            pedestrian.mesh.rotation.y = Math.atan2(dx, dz);
        }
    }

    startCrossing(pedestrian) {
        const crosswalks = this.roadNetwork.getCrosswalks();
        if (crosswalks.length === 0) return;

        // Find nearby crosswalk
        let nearestCrosswalk = null;
        let minDistance = Infinity;

        crosswalks.forEach(crosswalk => {
            const dx = crosswalk.x - pedestrian.mesh.position.x;
            const dz = crosswalk.z - pedestrian.mesh.position.z;
            const distance = Math.sqrt(dx * dx + dz * dz);

            if (distance < minDistance && distance < 20) {
                minDistance = distance;
                nearestCrosswalk = crosswalk;
            }
        });

        if (nearestCrosswalk) {
            pedestrian.state = 'waiting';
            pedestrian.crosswalkTarget = {
                x: nearestCrosswalk.x + (Math.random() - 0.5) * 8,
                z: nearestCrosswalk.z + (Math.random() - 0.5) * 8
            };
        }
    }

    animateWalking(pedestrian) {
        const mesh = pedestrian.mesh;
        if (pedestrian.state !== 'walking' && pedestrian.state !== 'crossing') return;

        const leftLeg = mesh.userData.leftLeg;
        const rightLeg = mesh.userData.rightLeg;

        if (leftLeg && rightLeg) {
            const swing = Math.sin(pedestrian.animationTime * 4) * 0.3;
            leftLeg.rotation.x = swing;
            rightLeg.rotation.x = -swing;
        }
    }

    getPedestrianCount() {
        return this.pedestrians.length;
    }
}
