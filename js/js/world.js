
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createWorld(scene) {
    const world = new THREE.Group();
    scene.add(world);

    // ОСВЕЩЕНИЕ
    const ambient = new THREE.HemisphereLight(
        0xffffff, 0x64745a, 1.5
    );
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(
        0xffffff, 2
    );
    sun.position.set(100, 150, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    // ЗЕМЛЯ
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshStandardMaterial({
            color: 0x668b48,
            roughness: 1
        })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    world.add(ground);

    // СОЗДАНИЕ ОБЪЕКТОВ
    function box(w, h, d, x, y, z, color) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.85
            })
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        world.add(mesh);
        return mesh;
    }

    // ДОРОГИ
    function road(w, d, x, z) {
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(w, d),
            new THREE.MeshStandardMaterial({
                color: 0x30343a,
                roughness: 1
            })
        );

        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set(x, 0.025, z);
        mesh.receiveShadow = true;
        world.add(mesh);
    }

    road(20, 500, 0, 0);
    road(500, 20, 0, 0);
    road(12, 500, 65, 0);
    road(12, 500, -65, 0);
    road(500, 12, 0, 65);
    road(500, 12, 0, -65);

    // ДОРОЖНАЯ РАЗМЕТКА
    for (let i = -230; i <= 230; i += 12) {
        box(0.25, 0.04, 5, 0, 0.06, i, 0xffffff);
        box(0.25, 0.04, 5, i, 0.06, 0, 0xffffff);
    }

    // ЗДАНИЯ
    const buildingColors = [
        0xd7c5a3,
        0xe7e1d3,
        0xc4d4df,
        0xd9bca0,
        0xb7c5ad,
        0xd6d6d6
    ];

    function building(x, z, w, h, d, color) {
        box(w, h, d, x, h / 2, z, color);

        // Крыша
        box(
            w + 1, 0.7, d + 1,
            x, h + 0.35, z,
            0x555b62
        );

        // Окна
        const windowMaterial =
            new THREE.MeshStandardMaterial({
                color: 0x78b9d6,
                metalness: 0.2,
                roughness: 0.3
            });

        for (let y = 3; y < h - 1; y += 4) {
            for (let wx = -w / 2 + 2; wx < w / 2 - 1; wx += 4) {
                const windowMesh = new THREE.Mesh(
                    new THREE.BoxGeometry(1.4, 1.8, 0.12),
                    windowMaterial
                );

                windowMesh.position.set(
                    x + wx, y, z + d / 2 + 0.08
                );
                world.add(windowMesh);
            }
        }
    }

    // ГОРОДСКАЯ ЗАСТРОЙКА
    for (let x = -180; x <= 180; x += 35) {
        for (let z = -180; z <= 180; z += 35) {
            if (
                Math.abs(x) < 18 ||
                Math.abs(z) < 18 ||
                Math.abs(Math.abs(x) - 65) < 12 ||
                Math.abs(Math.abs(z) - 65) < 12
            ) continue;

            const height = 12 + Math.random() * 35;
            const color = buildingColors[
                Math.floor(Math.random() * buildingColors.length)
            ];

            building(
                x + (Math.random() - 0.5) * 5,
                z + (Math.random() - 0.5) * 5,
                18,
                height,
                18,
                color
            );
        }
    }

    // ГЛАВНАЯ ПЛОЩАДЬ
    box(48, 0.3, 48, 0, 0.16, 35, 0xc5b9a1);

    // ФОНТАН
    const fountain = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 7, 1, 32),
        new THREE.MeshStandardMaterial({
            color: 0x8ca7b8,
            metalness: 0.5
        })
    );
    fountain.position.set(0, 0.8, 35);
    world.add(fountain);

    // ГОРЫ
    const mountainMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x647b82,
            roughness: 1
        });

    for (let i = 0; i < 35; i++) {
        const mountain = new THREE.Mesh(
            new THREE.ConeGeometry(
                35 + Math.random() * 30,
                55 + Math.random() * 70,
                5
            ),
            mountainMaterial
        );

        const angle = i / 35 * Math.PI * 2;

        mountain.position.set(
            Math.cos(angle) * 350,
            25,
            Math.sin(angle) * 350
        );

        mountain.rotation.y = Math.random() * Math.PI;
        world.add(mountain);
    }

    // ДЕРЕВЬЯ
    function tree(x, z) {
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.6, 4, 8),
            new THREE.MeshStandardMaterial({
                color: 0x68432a
            })
        );

        trunk.position.set(x, 2, z);
        world.add(trunk);

        const leaves = new THREE.Mesh(
            new THREE.SphereGeometry(2.5, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0x24753b
            })
        );

        leaves.position.set(x, 5, z);
        leaves.castShadow = true;
        world.add(leaves);
    }

    for (let i = -200; i <= 200; i += 12) {
        tree(i, 15);
        tree(i, -15);
        tree(15, i);
        tree(-15, i);
    }

    // ФЛАГ ТАДЖИКИСТАНА
    box(0.3, 12, 0.3, -20, 6, 30, 0x777777);
    box(0.2, 2.2, 4, -20, 10, 32, 0xffffff);
    box(0.2, 2.2, 4, -20, 7.8, 32, 0xff0000);
    box(0.2, 2.2, 4, -20, 5.6, 32, 0x168b45);

    return {
        group: world,
        sun: sun,
        ambient: ambient
    };
}
