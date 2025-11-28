import * as THREE from 'three';

export class LightingSystem {
    constructor(scene) {
        this.scene = scene;
        this.timeOfDay = 12; // 0-24 hours
        this.sunLight = null;
        this.moonLight = null;
        this.ambientLight = null;
        this.hemisphereLight = null;

        this.init();
    }

    init() {
        // Ambient light - provides base illumination
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(this.ambientLight);

        // Hemisphere light - simulates sky and ground reflection
        this.hemisphereLight = new THREE.HemisphereLight(
            0x87CEEB, // Sky color
            0x4a5f3a, // Ground color
            0.6
        );
        this.scene.add(this.hemisphereLight);

        // Directional light (Sun)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 1000;
        this.sunLight.shadow.camera.left = -200;
        this.sunLight.shadow.camera.right = 200;
        this.sunLight.shadow.camera.top = 200;
        this.sunLight.shadow.camera.bottom = -200;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);

        // Directional light (Moon)
        this.moonLight = new THREE.DirectionalLight(0x9999ff, 0);
        this.moonLight.castShadow = true;
        this.moonLight.shadow.mapSize.width = 1024;
        this.moonLight.shadow.mapSize.height = 1024;
        this.scene.add(this.moonLight);

        // Set initial time
        this.updateLighting();
    }

    setTimeOfDay(time) {
        this.timeOfDay = time;
        this.updateLighting();
    }

    updateLighting() {
        const time = this.timeOfDay;

        // Calculate sun position
        const sunAngle = ((time - 6) / 12) * Math.PI; // Sun rises at 6, sets at 18
        const sunX = Math.cos(sunAngle) * 300;
        const sunY = Math.sin(sunAngle) * 300;
        this.sunLight.position.set(sunX, Math.max(sunY, -100), 100);

        // Calculate moon position (opposite of sun)
        const moonAngle = ((time + 6) / 12) * Math.PI;
        const moonX = Math.cos(moonAngle) * 300;
        const moonY = Math.sin(moonAngle) * 300;
        this.moonLight.position.set(moonX, Math.max(moonY, -100), 100);

        // Time-based lighting parameters
        let skyColor, groundColor, fogColor;
        let sunIntensity, moonIntensity, ambientIntensity, hemisphereIntensity;

        if (time >= 6 && time < 7) {
            // Dawn (6-7)
            const t = (time - 6);
            skyColor = this.lerpColor(0x1a1a2e, 0xff7e5f, t);
            groundColor = this.lerpColor(0x0f0f1e, 0x4a5f3a, t);
            fogColor = this.lerpColor(0x1a1a2e, 0xffa07a, t);
            sunIntensity = t * 1.5;
            moonIntensity = (1 - t) * 0.3;
            ambientIntensity = 0.2 + t * 0.2;
            hemisphereIntensity = 0.3 + t * 0.3;
        } else if (time >= 7 && time < 17) {
            // Day (7-17)
            skyColor = 0x87CEEB;
            groundColor = 0x4a5f3a;
            fogColor = 0xc8e6f5;
            sunIntensity = 1.5;
            moonIntensity = 0;
            ambientIntensity = 0.4;
            hemisphereIntensity = 0.6;
        } else if (time >= 17 && time < 19) {
            // Dusk (17-19)
            const t = (time - 17) / 2;
            skyColor = this.lerpColor(0x87CEEB, 0xff6b6b, t);
            groundColor = this.lerpColor(0x4a5f3a, 0x2a2a3a, t);
            fogColor = this.lerpColor(0xc8e6f5, 0xff8c69, t);
            sunIntensity = (1 - t) * 1.5;
            moonIntensity = t * 0.3;
            ambientIntensity = 0.4 - t * 0.2;
            hemisphereIntensity = 0.6 - t * 0.3;
        } else {
            // Night (19-6)
            skyColor = 0x0a0a1e;
            groundColor = 0x0f0f1e;
            fogColor = 0x1a1a2e;
            sunIntensity = 0;
            moonIntensity = 0.3;
            ambientIntensity = 0.15;
            hemisphereIntensity = 0.2;
        }

        // Apply lighting changes
        this.sunLight.intensity = sunIntensity;
        this.sunLight.color.setHex(time >= 6 && time < 8 ? 0xffd4a3 : 0xffffff);

        this.moonLight.intensity = moonIntensity;

        this.ambientLight.intensity = ambientIntensity;

        this.hemisphereLight.intensity = hemisphereIntensity;
        this.hemisphereLight.color.setHex(skyColor);
        this.hemisphereLight.groundColor.setHex(groundColor);

        // Update scene
        this.scene.background = new THREE.Color(skyColor);
        this.scene.fog.color.setHex(fogColor);

        // Adjust fog density based on time
        if (time >= 6 && time < 18) {
            this.scene.fog.near = 100;
            this.scene.fog.far = 800;
        } else {
            this.scene.fog.near = 50;
            this.scene.fog.far = 400;
        }
    }

    lerpColor(color1, color2, t) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, t).getHex();
    }

    update(deltaTime) {
        // Optional: Auto-advance time
        // this.timeOfDay += deltaTime / 60; // 1 minute = 1 second
        // if (this.timeOfDay >= 24) this.timeOfDay -= 24;
        // this.updateLighting();
    }

    isNightTime() {
        return this.timeOfDay < 6 || this.timeOfDay >= 19;
    }

    isDayTime() {
        return this.timeOfDay >= 7 && this.timeOfDay < 18;
    }

    getLamppostIntensity() {
        // Lampposts should be brighter at night
        if (this.timeOfDay >= 18 || this.timeOfDay < 7) {
            return 1.5;
        } else if (this.timeOfDay >= 17 && this.timeOfDay < 18) {
            // Fade in during dusk
            return (this.timeOfDay - 17) * 1.5;
        } else if (this.timeOfDay >= 7 && this.timeOfDay < 8) {
            // Fade out during dawn
            return (8 - this.timeOfDay) * 1.5;
        }
        return 0;
    }
}
