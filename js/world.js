
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

export function createWorld(scene) {
    const world = new THREE.Group();
    world.userData.roadPaths = [];
    scene.add(world);

    // ОСВЕЩЕНИЕ
    const ambient = new THREE.HemisphereLight(0xffffff, 0x68745c, 1.5);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, 2);
    sun.position.set(100, 150, 80);
    scene.add(sun);

    // ЗЕМЛЯ
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(10000, 10000),
        new THREE.MeshStandardMaterial({ color: 0x788b68 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.08;
    world.add(ground);

    // ЦЕНТР КАРТЫ — ДУШАНБЕ
    const centerLat = 38.5598;
    const centerLon = 68.7870;

    function toWorld(lat, lon) {
        return {
            x: (lon - centerLon) * 87000,
            z: -(lat - centerLat) * 111000
        };
    }

    // ЗАГРУЗКА OPENSTREETMAP
   async function loadRealMap() {
        const bbox = "38.535,68.735,38.585,68.835";

        const query = `
            [out:json][timeout:25];
            (
              way["highway"](${bbox});
              way["building"](${bbox});
              way["leisure"="park"](${bbox});
              way["landuse"~"grass|forest"](${bbox});
            );
            out geom;
        `;

        const endpoints = [
    "https://overpass.ch/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
 ];

        let data = null;

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(
               endpoint + "?data=" + encodeURIComponent(query)
               );

                if (!response.ok) continue;

                data = await response.json();
                break;
            } catch (error) {
                console.warn("Не удалось загрузить карту:", error);
            }
        }

       if (!data || !data.elements) {
    alert("ОШИБКА: карта Душанбе не загрузилась. Проверь интернет.");
    return;
}

       const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x34383d,
    roughness: 1,
    side: THREE.DoubleSide
});
        const parkMaterial = new THREE.MeshStandardMaterial({
            color: 0x397b43,
            side: THREE.DoubleSide
        });

        const buildingColors = [
            0xd8d0bd, 0xe4dfd2, 0xc6d3d8,
            0xd7c0a5, 0xc4c9b8, 0xe0d5c5
        ];

        let roadCount = 0;
        let buildingCount = 0;
        let parkCount = 0;

        // ДОРОГИ
      function addRoad(points, width, tags.highway) {
    const drivable = [
        "motorway", "trunk", "primary",
        "secondary", "tertiary",
        "residential", "unclassified", "service"
    ];

    if (drivable.includes(roadType)) {
        world.userData.roadPaths.push({
            type: roadType,
            points: points.map(point =>
                toWorld(point.lat, point.lon)
            )
        });
    }

    for (let i = 0; i < points.length - 1; i++) {
        const a = toWorld(points[i].lat, points[i].lon);
        const b = toWorld(points[i + 1].lat, points[i + 1].lon);

        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const length = Math.sqrt(dx * dx + dz * dz);

        if (length < 0.5 || length > 1000) continue;

        const nx = -dz / length * width / 2;
        const nz = dx / length * width / 2;

        const geometry = new THREE.BufferGeometry();

        geometry.setAttribute("position",
            new THREE.Float32BufferAttribute([
                a.x + nx, 0.04, a.z + nz,
                a.x - nx, 0.04, a.z - nz,
                b.x - nx, 0.04, b.z - nz,
                a.x + nx, 0.04, a.z + nz,
                b.x - nx, 0.04, b.z - nz,
                b.x + nx, 0.04, b.z + nz
            ], 3)
        );

        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh(geometry, roadMaterial);
        world.add(mesh);
        roadCount++;
    }
}
        // ЗДАНИЯ И ПАРКИ
        function addPolygon(points, material, height = 0) {
            if (!points || points.length < 4) return;

            const first = points[0];
            const last = points[points.length - 1];

            if (
                first.lat !== last.lat ||
                first.lon !== last.lon
            ) return;

            const shape = new THREE.Shape();

            points.forEach((point, index) => {
                const p = toWorld(point.lat, point.lon);

                if (index === 0) {
                    shape.moveTo(p.x, p.z);
                } else {
                    shape.lineTo(p.x, p.z);
                }
            });

            shape.closePath();

            let geometry;

            if (height > 0) {
                geometry = new THREE.ExtrudeGeometry(shape, {
                    depth: height,
                    bevelEnabled: false
                });
            } else {
                geometry = new THREE.ShapeGeometry(shape);
            }

            geometry.rotateX(-Math.PI / 2);

            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 0.02;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            world.add(mesh);
        }

        for (const element of data.elements) {
            if (!element.geometry || element.geometry.length < 2) {
                continue;
            }

            const tags = element.tags || {};
            const points = element.geometry;

            if (tags.highway) {
                let width = 5;

                if (
                    tags.highway === "primary" ||
                    tags.highway === "trunk"
                ) width = 13;
                else if (
                    tags.highway === "secondary"
                ) width = 9;
                else if (
                    tags.highway === "tertiary"
                ) width = 7;
                else if (
                    tags.highway === "footway" ||
                    tags.highway === "path"
                ) width = 2;

                addRoad(points, width);
            }

            if (tags.building) {
                const color = buildingColors[
                    Math.floor(Math.random() * buildingColors.length)
                ];

                const height = Math.max(
                    4,
                    Math.min(
                        Number.parseFloat(tags["height"]) ||
                        (Number.parseFloat(tags["building:levels"]) * 3.2) ||
                        10,
                        90
                    )
                );

                const material = new THREE.MeshStandardMaterial({
                    color,
                    roughness: 0.9
                });

                addPolygon(points, material, height);
                buildingCount++;
            }

            if (
                tags.leisure === "park" ||
                tags.landuse === "grass" ||
                tags.landuse === "forest"
            ) {
                addPolygon(points, parkMaterial);
                parkCount++;
            }
        }

        console.log(
            "Карта Душанбе загружена:",
            roadCount, "участков дорог,",
            buildingCount, "зданий,",
            parkCount, "парков."
        );

        const notice = document.createElement("div");
        notice.textContent = "Дороги: " + roadCount + " | Дома: " + buildingCount;
        notice.style.cssText =
            "position:absolute;bottom:5px;right:5px;" +
            "color:white;background:#0008;padding:4px;" +
            "font:10px Arial;z-index:10;pointer-events:none;";

        const game = document.getElementById("game");
        if (game) game.appendChild(notice);
    }

    loadRealMap();

    return {
        group: world,
        sun: sun,
        ambient: ambient
    };
}
