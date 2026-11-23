
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createCamera(scene, player, renderer) {
    const camera = new THREE.PerspectiveCamera(
        70,
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );

    let cameraYaw = 0;
    let cameraPitch = 0.25;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const distance = 8;
    const target = new THREE.Vector3();
    const desiredPosition = new THREE.Vector3();

    const canvas = renderer.domElement;
    canvas.style.touchAction = "none";

    canvas.addEventListener("pointerdown", (event) => {
        dragging = true;
        lastX = event.clientX;
        lastY = event.clientY;

        if (canvas.setPointerCapture) {
            canvas.setPointerCapture(event.pointerId);
        }
    });

    canvas.addEventListener("pointermove", (event) => {
        if (!dragging) return;

        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;

        cameraYaw -= dx * 0.006;
        cameraPitch += dy * 0.004;

        cameraPitch = THREE.MathUtils.clamp(
            cameraPitch,
            -0.15,
            0.8
        );

        lastX = event.clientX;
        lastY = event.clientY;
    });

    function stopDragging() {
        dragging = false;
    }

    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    canvas.addEventListener("lostpointercapture", stopDragging);

    function update(delta) {
        const angle = player.rotation.y + cameraYaw;

        const horizontalDistance =
            distance * Math.cos(cameraPitch);

        desiredPosition.set(
            player.position.x - Math.sin(angle) * horizontalDistance,
            player.position.y + 2.5 + distance * Math.sin(cameraPitch),
            player.position.z - Math.cos(angle) * horizontalDistance
        );

        camera.position.lerp(
            desiredPosition,
            1 - Math.exp(-5 * delta)
        );

        target.set(
            player.position.x,
            player.position.y + 1.5,
            player.position.z
        );

        camera.lookAt(target);
    }

    camera.position.set(0, 5, -8);

    return {
        camera,
        update
    };
}
