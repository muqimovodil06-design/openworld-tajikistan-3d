
export function setupControls() {
    const controls = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        jump: false,
        handbrake: false,
        enterPressed: false
    };

    const keys = {
        w: "forward",
        ArrowUp: "forward",
        s: "backward",
        ArrowDown: "backward",
        a: "left",
        ArrowLeft: "left",
        d: "right",
        ArrowRight: "right"
    };

    window.addEventListener("keydown", (event) => {
        const key = event.key;

        if (keys[key]) {
            controls[keys[key]] = true;
            event.preventDefault();
        }

        if (key === " " || key === "Spacebar") {
            controls.jump = true;
            controls.handbrake = true;
            event.preventDefault();
        }

        if (key.toLowerCase() === "f" && !event.repeat) {
            controls.enterPressed = true;
        }
    });

    window.addEventListener("keyup", (event) => {
        const key = event.key;

        if (keys[key]) {
            controls[keys[key]] = false;
        }

        if (key === " " || key === "Spacebar") {
            controls.jump = false;
            controls.handbrake = false;
        }
    });

    function bindButton(id, action) {
        const button = document.getElementById(id);
        if (!button) return;

        button.addEventListener("pointerdown", (event) => {
            event.preventDefault();

            if (action === "enterPressed") {
                controls.enterPressed = true;
                return;
            }

            controls[action] = true;

            if (button.setPointerCapture) {
                button.setPointerCapture(event.pointerId);
            }
        });

        const release = (event) => {
            event.preventDefault();

            if (action !== "enterPressed") {
                controls[action] = false;
            }
        };

        button.addEventListener("pointerup", release);
        button.addEventListener("pointercancel", release);
        button.addEventListener("lostpointercapture", release);
        button.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });
    }

    bindButton("up", "forward");
    bindButton("down", "backward");
    bindButton("left", "left");
    bindButton("right", "right");
    bindButton("jump", "jump");
    bindButton("enter", "enterPressed");

    const jumpButton = document.getElementById("jump");
    if (jumpButton) {
        jumpButton.addEventListener("pointerdown", () => {
            controls.handbrake = true;
        });

        const releaseBrake = () => {
            controls.handbrake = false;
        };

        jumpButton.addEventListener("pointerup", releaseBrake);
        jumpButton.addEventListener("pointercancel", releaseBrake);
        jumpButton.addEventListener("lostpointercapture", releaseBrake);
    }

    function clearControls() {
        controls.forward = false;
        controls.backward = false;
        controls.left = false;
        controls.right = false;
        controls.jump = false;
        controls.handbrake = false;
    }

    window.addEventListener("blur", clearControls);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) clearControls();
    });

    return controls;
}
