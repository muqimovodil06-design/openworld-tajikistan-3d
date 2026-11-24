
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createVehicles(scene, world) {
    const vehicles = [];
    let activeVehicle = null;

    const materials = {
        black: new THREE.MeshStandardMaterial({ color: 0x171717 }),
        glass: new THREE.MeshStandardMaterial({
            color: 0x79b9d8,
            metalness: 0.3,
            roughness: 0.2
        }),
        wheel: new THREE.MeshStandardMaterial({ color: 0x222222 }),
        white: new THREE.MeshStandardMaterial({ color: 0xffffff }),
        red: new THREE.MeshStandardMaterial({ color: 0xcc2222 }),
        blue: new THREE.MeshStandardMaterial({ color: 0x174caa }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xe5b52a })
    };

    function makePart(parent, geometry, material, x, y, z) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
    }

    function createCar(name, color, x, z, type = "car") {
        const car = new THREE.Group();
        scene.add(car);

        const bodyMaterial = new THREE.MeshStandardMaterial({
            color,
            metalness: 0.35,
            roughness: 0.4
        });

        let width = type === "bus" ? 2.8 : 2;
        let length = type === "bus" ? 7 : 4.2;
        let height = type === "bus" ? 3.2 : 1.5;

        makePart(
            car,
            new THREE.BoxGeometry(width, height * 0.45, length),
            bodyMaterial,
            0, height * 0.45, 0
        );

        makePart(
            car,
            new THREE.BoxGeometry(width * 0.85, height * 0.55, length * 0.48),
            materials.glass,
            0, height * 0.9, -0.2
        );

        // КОЛЁСА
        const wheels = [];

        for (const side of [-1, 1]) {
            for (const end of [-1, 1]) {
                const wheel = makePart(
                    car,
                    new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16),
                    materials.wheel,
                    side * (width / 2 + 0.02),
                    0.45,
                    end * (length * 0.32)
                );

                wheel.rotation.z = Math.PI / 2;
                wheels.push(wheel);
            }
        }

        // ФАРЫ
        for (const side of [-1, 1]) {
            makePart(
                car,
                new THREE.BoxGeometry(0.5, 0.22, 0.08),
                materials.white,
                side * 0.6, 0.65, length / 2 + 0.04
            );
        }

        // СПЕЦСИГНАЛЫ
        if (type === "police" || type === "ambulance" || type === "fire") {
            makePart(
                car,
                new THREE.BoxGeometry(0.9, 0.18, 0.35),
                materials.red,
                -0.25, height * 1.25, 0
            );

            makePart(
                car,
                new THREE.BoxGeometry(0.9, 0.18, 0.35),
                materials.blue,
                0.25, height * 1.25, 0
            );
        }

        car.position.set(x, 0, z);

        const vehicle = {
    name,
    object: car,
    wheels,
    startX: x,
    startZ: z,
    speed: 0,
            maxSpeed: type === "bus" ? 18 : 30,
            turnSpeed: 1.8,
            type
        };

        vehicles.push(vehicle);
        return vehicle;
    }

    // ГОРОДСКИЕ МАШИНЫ
    createCar("Седан", 0x3366aa, 12, 10);
    createCar("Внедорожник", 0x333333, 15, 22);
    createCar("Спорткар", 0xcc2222, 18, 35);
    createCar("Такси", 0xe5bd25, -12, 12);
    createCar("Белый автомобиль", 0xffffff, -15, 25);
    createCar("Автобус", 0x2277bb, 20, -20, "bus");

    // СЛУЖЕБНЫЕ МАШИНЫ
    createCar("Полиция", 0xeeeeee, -20, 20, "police");
    createCar("Скорая помощь", 0xffffff, -23, 35, "ambulance");
    createCar("Пожарная машина", 0xcc2222, -26, 50, "fire");

    // ГРУЗОВОЙ ТРАНСПОРТ
    createCar("Грузовик", 0x999999, 30, 25, "truck");
    createCar("Трактор", 0x228833, 35, 40, "tractor");
    createCar("Бульдозер", 0xc69a24, 40, 55, "bulldozer");
    createCar("Экскаватор", 0xe2b32a, 45, 70, "excavator");

    // МОТОЦИКЛ
    createCar("Мотоцикл", 0x222222, 50, 15, "motorcycle");

    function nearestVehicle(player) {
        let nearest = null;
        let minDistance = 7;

        for (const vehicle of vehicles) {
            const distance = player.position.distanceTo(
                vehicle.object.position
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = vehicle;
            }
        }

        return nearest;
    }

    function update(delta, controls, player) {

    // АВТОМАТИЧЕСКОЕ ДВИЖЕНИЕ МАШИН
    for (const vehicle of vehicles) {
        if (vehicle === activeVehicle) continue;

        if (vehicle.aiAngle === undefined) {
            vehicle.aiAngle = Math.random() * Math.PI * 2;
            vehicle.aiRadius = 10 + Math.random() * 8;
        }

        vehicle.aiAngle += delta * 0.3;

        vehicle.object.position.x =
            vehicle.startX +
            Math.cos(vehicle.aiAngle) * vehicle.aiRadius;

        vehicle.object.position.z =
            vehicle.startZ +
            Math.sin(vehicle.aiAngle) * vehicle.aiRadius;

        vehicle.object.rotation.y =
            -vehicle.aiAngle - Math.PI / 2;

        for (const wheel of vehicle.wheels) {
            wheel.rotation.x += delta * 2;
        }
    }

    // ПОСАДКА И ВЫХОД
    if (controls.enterPressed) {
        if (activeVehicle) {
            player.position.copy(activeVehicle.object.position);
            player.position.x += 3;
            activeVehicle = null;
            player.mesh.visible = true;
        } else {
            const vehicle = nearestVehicle(player);

            if (vehicle) {
                activeVehicle = vehicle;
                player.mesh.visible = false;
                showVehicleMessage(vehicle.name);
            }
        }

        controls.enterPressed = false;
    }

    // УПРАВЛЕНИЕ МАШИНОЙ ИГРОКА
    if (activeVehicle) {
        const vehicle = activeVehicle;

        if (controls.forward) vehicle.speed += 18 * delta;
        if (controls.backward) vehicle.speed -= 18 * delta;

        vehicle.speed = THREE.MathUtils.clamp(
            vehicle.speed,
            -vehicle.maxSpeed * 0.5,
            vehicle.maxSpeed
        );

        vehicle.speed *= controls.handbrake ? 0.88 : 0.99;

        if (controls.left) {
            vehicle.object.rotation.y += vehicle.turnSpeed * delta *
                Math.sign(vehicle.speed || 1);
        }

        if (controls.right) {
            vehicle.object.rotation.y -= vehicle.turnSpeed * delta *
                Math.sign(vehicle.speed || 1);
        }

        vehicle.object.position.x +=
            Math.sin(vehicle.object.rotation.y) * vehicle.speed * delta;

        vehicle.object.position.z +=
            Math.cos(vehicle.object.rotation.y) * vehicle.speed * delta;

        for (const wheel of vehicle.wheels) {
            wheel.rotation.x += vehicle.speed * delta;
        }

        player.position.copy(vehicle.object.position);
    }
}
    function showVehicleMessage(name) {
        const message = document.getElementById("message");
        if (message) {
            message.textContent = "Транспорт: " + name;
            message.style.display = "block";
        }
    }

    return {
        list: vehicles,
        update,
        get activeVehicle() {
            return activeVehicle;
        }
    };
}
