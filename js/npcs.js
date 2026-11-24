
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createNPCs(scene) {
    const people = [];

    const roles = [
        { name: "Житель", color: 0x2875a8 },
        { name: "Полиция", color: 0x182d59 },
        { name: "Врач", color: 0xffffff },
        { name: "Пожарный", color: 0xd52b22 },
        { name: "ГАИ", color: 0x183c65 },
        { name: "Строитель", color: 0xe6b52b },
        { name: "Шахтёр", color: 0x555555 },
        { name: "Программист", color: 0x292d46 },
        { name: "Пилот", color: 0xeeeeee },
        { name: "Машинист", color: 0x27623d },
        { name: "Охрана", color: 0x222222 }
    ];

    function createPerson(role, x, z, patrol = false) {
        const group = new THREE.Group();

        const uniform = new THREE.MeshStandardMaterial({
            color: role.color
        });

        const skin = new THREE.MeshStandardMaterial({
            color: 0xd6a078
        });

        const dark = new THREE.MeshStandardMaterial({
            color: 0x252525
        });

        function add(geometry, material, px, py, pz) {
            const mesh = new THREE.Mesh(
                geometry,
                material
            );

            mesh.position.set(px, py, pz);
            mesh.castShadow = true;
            group.add(mesh);

            return mesh;
        }

        // ТЕЛО
        add(
            new THREE.BoxGeometry(0.65, 1, 0.35),
            uniform,
            0, 1.4, 0
        );

        // ГОЛОВА
        add(
            new THREE.SphereGeometry(0.25, 12, 12),
            skin,
            0, 2.1, 0
        );

        // РУКИ
        const leftArm = add(
            new THREE.BoxGeometry(0.18, 0.75, 0.2),
            uniform,
            -0.43, 1.4, 0
        );

        const rightArm = add(
            new THREE.BoxGeometry(0.18, 0.75, 0.2),
            uniform,
            0.43, 1.4, 0
        );

        // НОГИ
        const leftLeg = add(
            new THREE.BoxGeometry(0.22, 0.75, 0.25),
            dark,
            -0.17, 0.5, 0
        );

        const rightLeg = add(
            new THREE.BoxGeometry(0.22, 0.75, 0.25),
            dark,
            0.17, 0.5, 0
        );

        // ГОЛОВНОЙ УБОР
        if (
            role.name === "Полиция" ||
            role.name === "ГАИ" ||
            role.name === "Пожарный" ||
            role.name === "Пилот"
        ) {
            add(
                new THREE.CylinderGeometry(
                    0.26, 0.26, 0.13, 12
                ),
                dark,
                0, 2.34, 0
            );
        }

        group.position.set(x, 0, z);
        scene.add(group);

        people.push({
            group,
            role,
            patrol,
            startX: x,
            startZ: z,
            phase: Math.random() * Math.PI * 2,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg
        });
    }

    // ОБЫЧНЫЕ ЖИТЕЛИ
    for (let i = 0; i < 24; i++) {
        const x = -100 + Math.random() * 200;
        const z = -100 + Math.random() * 200;

        createPerson(roles[0], x, z, false);
    }

    // ПОЛИЦИЯ ПАТРУЛИРУЕТ УЛИЦЫ
    createPerson(roles[1], -5, -20, true);
    createPerson(roles[1], 5, 25, true);
    createPerson(roles[1], 65, -20, true);

    // РАБОТНИКИ СЛУЖБ
    createPerson(roles[2], -35, 35);
    createPerson(roles[2], -38, 38);

    createPerson(roles[3], -45, 45);
    createPerson(roles[4], 12, -35);

    createPerson(roles[5], 80, 80);
    createPerson(roles[5], 85, 80);

    createPerson(roles[6], 120, 100);
    createPerson(roles[7], 100, -100);
    createPerson(roles[7], 105, -100);

    createPerson(roles[8], 150, 30);
    createPerson(roles[9], -150, 30);
    createPerson(roles[10], -80, -80);

    // ОБНОВЛЕНИЕ NPC
   function update(delta) {
    for (const person of people) {
        person.phase += delta * (person.patrol ? 2 : 0.8);

        const radius = person.patrol ? 8 : 3;

        person.group.position.x =
            person.startX + Math.sin(person.phase) * radius;

        person.group.position.z =
            person.startZ + Math.cos(person.phase) * radius;

        const walking = Math.sin(person.phase * 2);

        person.leftArm.rotation.x = walking * 0.5;
        person.rightArm.rotation.x = -walking * 0.5;

        person.leftLeg.rotation.x = -walking * 0.5;
        person.rightLeg.rotation.x = walking * 0.5;
    }
}
