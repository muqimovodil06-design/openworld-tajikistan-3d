
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

import { createWorld } from "./world.js";
import { createPlayer } from "./player.js";
import { createVehicles } from "./vehicles.js";
import { createNPCs } from "./npcs.js";
import { setupControls } from "./controls.js";
import { createCamera } from "./camera.js";
import { createDayNight } from "./daynight.js";

const game = document.getElementById("game");
const loading = document.getElementById("loading");
const status = document.getElementById("status");
const messageBox = document.getElementById("message");

let renderer;
let animationStarted = false;

function showMessage(text) {
    if (!messageBox) return;

    messageBox.textContent = text;
    messageBox.style.display = "block";

    clearTimeout(showMessage.timer);

    showMessage.timer = setTimeout(() => {
        messageBox.style.display = "none";
    }, 3000);
}

function showError(error) {
    console.error("Ошибка запуска:", error);

    if (loading) {
        loading.style.display = "flex";
        loading.innerHTML =
            "<h2>Ошибка запуска игры</h2>" +
            "<p>" + String(error.message || error) + "</p>";
    }
}

async function startGame() {
    try {
        if (!game) {
            throw new Error("Не найден элемент #game в index.html");
        }

        const scene = new THREE.Scene();

        scene.background = new THREE.Color(0x87ceeb);
        scene.fog = new THREE.Fog(0x87ceeb, 100, 700);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: "high-performance"
        });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 1.5)
        );

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.shadowMap.enabled = false;
        renderer.outputColorSpace = THREE.SRGBColorSpace;

        game.appendChild(renderer.domElement);

        const clock = new THREE.Clock();

        const world = createWorld(scene);
        const player = createPlayer(scene);
        const vehicles = createVehicles(scene);
        const npcs = createNPCs(scene);
        const controls = setupControls();

        const cameraSystem = createCamera(
            scene,
            player,
            renderer
        );

        const camera = cameraSystem.camera;

        const dayNight = createDayNight(scene, world);

        function resizeGame() {
            camera.aspect =
                window.innerWidth / window.innerHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(
                window.innerWidth,
                window.innerHeight
            );
        }

        window.addEventListener("resize", resizeGame);

        function animate() {
            requestAnimationFrame(animate);

            const delta = Math.min(
                clock.getDelta(),
                0.05
            );

            if (!vehicles.activeVehicle) {
                player.update(delta, controls, vehicles);
            }

            vehicles.update(delta, controls, player);
            npcs.update(delta);
            cameraSystem.update(delta);
            dayNight.update(delta);

            renderer.render(scene, camera);
        }

        resizeGame();

        if (loading) {
            loading.style.display = "none";
        }

        showMessage("Добро пожаловать в Душанбе! 🇹🇯");

        animationStarted = true;
        animate();

        if (status) {
            status.textContent =
                "OPEN WORLD TAJIKISTAN 3D 🇹🇯";
        }

        console.log("Игра успешно запущена!");

    } catch (error) {
        showError(error);
    }
}

startGame();
