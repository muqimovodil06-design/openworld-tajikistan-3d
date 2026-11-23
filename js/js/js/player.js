
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createPlayer(scene) {
    const player = new THREE.Group();
    scene.add(player);

    const skin = new THREE.MeshStandardMaterial({
        color: 0xd6a078,
        roughness: 0.8
    });

    const clothes = new THREE.MeshStandardMaterial({
        color: 0x24538a
    });

    const pants = new THREE.MeshStandardMaterial({
        color: 0x30343b
    });

    const shoes = new THREE.MeshStandardMaterial({
        color: 0x171717
    });

    function part(geometry, material, x, y, z) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        player.add(mesh);
        return mesh;
    }

    // ТЕЛО
    part(
        new THREE.BoxGeometry(0.9, 1.2, 0.45),
        clothes,
        0, 1.65, 0
    );

    // ГОЛОВА
    const head = part(
        new THREE.SphereGeometry(0.34, 20, 16),
        skin,
        0, 2.55, 0
    );

    // ВОЛОСЫ
    part(
        new THREE.SphereGeometry(0.35, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0x202020 }),
        0, 2.65, 0
    );

    // РУКИ
    const leftArm = part(
        new THREE.BoxGeometry(0.25, 0.95, 0.3),
        clothes,
        -0.62, 1.65, 0
    );

    const rightArm = part(
        new THREE.BoxGeometry(0.25, 0.95, 0.3),
        clothes,
        0.62, 1.65, 0
    );

    // НОГИ
    const leftLeg = part(
        new THREE.BoxGeometry(0.32, 0.85, 0.35),
        pants,
        -0.23, 0.6, 0
    );

    const rightLeg = part(
        new THREE.BoxGeometry(0.32, 0.85, 0.35),
        pants,
        0.23, 0.6, 0
    );

    // ОБУВЬ
    part(
        new THREE.BoxGeometry(0.38, 0.2, 0.55),
        shoes,
        -0.23, 0.12, 0.08
    );

    part(
        new THREE.BoxGeometry(0.38, 0.2, 0.55),
        shoes,
        0.23, 0.12, 0.08
    );

    // ГЛАЗА
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111
    });

    part(
        new THREE.SphereGeometry(0.045, 10, 8),
        eyeMaterial,
        -0.12, 2.58, 0.29
    );

    part(
        new THREE.SphereGeometry(0.045, 10, 8),
        eyeMaterial,
        0.12, 2.58, 0.29
    );

    // ИГРОВОЕ СОСТОЯНИЕ
    let verticalSpeed = 0;
    let walkingTime = 0;
    let onGround = true;

    const speed = 9;
    const turnSpeed = 2.5;
    const gravity = 22;
    const jumpPower = 8;

    function update(delta, controls, vehicles) {
        const forward = controls.forward;
        const backward = controls.backward;
        const left = controls.left;
        const right = controls.right;
        const jump = controls.jump;

        if (left) {
            player.rotation.y += turnSpeed * delta;
        }

        if (right) {
            player.rotation.y -= turnSpeed * delta;
        }

        let moving = false;

        if (forward) {
            player.position.x +=
                Math.sin(player.rotation.y) * speed * delta;

            player.position.z +=
                Math.cos(player.rotation.y) * speed * delta;

            moving = true;
        }

        if (backward) {
            player.position.x -=
                Math.sin(player.rotation.y) * speed * delta;

            player.position.z -=
                Math.cos(player.rotation.y) * speed * delta;

            moving = true;
        }

        // ПРЫЖОК
        if (jump && onGround) {
            verticalSpeed = jumpPower;
            onGround = false;
        }

        verticalSpeed -= gravity * delta;
        player.position.y += verticalSpeed * delta;

        if (player.position.y <= 0) {
            player.position.y = 0;
            verticalSpeed = 0;
            onGround = true;
        }

        // АНИМАЦИЯ ХОДЬБЫ
        if (moving) {
            walkingTime += delta * 10;

            leftLeg.rotation.x =
                Math.sin(walkingTime) * 0.6;

            rightLeg.rotation.x =
                -Math.sin(walkingTime) * 0.6;

            leftArm.rotation.x =
                -Math.sin(walkingTime) * 0.4;

            rightArm.rotation.x =
                Math.sin(walkingTime) * 0.4;
        } else {
            leftLeg.rotation.x *= 0.8;
            rightLeg.rotation.x *= 0.8;
            leftArm.rotation.x *= 0.8;
            rightArm.rotation.x *= 0.8;
        }
    }

    return {
        object: player,
        update: update,
        get position() {
            return player.position;
        },
        get rotation() {
            return player.rotation;
        },
        get mesh() {
            return player;
        }
    };
}
