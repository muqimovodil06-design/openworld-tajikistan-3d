
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createDayNight(scene, world) {
    const sun = world.sun;
    const ambient = world.ambient;

    let time = 0.25;

    const dayColor = new THREE.Color(0x87ceeb);
    const nightColor = new THREE.Color(0x071329);
    const skyColor = new THREE.Color();

    function update(delta) {
        time += delta * 0.003;
        if (time > 1) time -= 1;

        const angle = time * Math.PI * 2;

        const daylight = Math.max(
            0,
            Math.sin(angle)
        );

        sun.position.set(
            Math.cos(angle) * 150,
            Math.sin(angle) * 180,
            80
        );

        sun.intensity = 0.15 + daylight * 1.8;
        ambient.intensity = 0.2 + daylight * 0.65;

        skyColor.copy(nightColor).lerp(
            dayColor,
            THREE.MathUtils.clamp(daylight, 0, 1)
        );

        scene.background.copy(skyColor);
        scene.fog.color.copy(skyColor);
    }

    return { update };
}
