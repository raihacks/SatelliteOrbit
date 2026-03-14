import { createScene } from "./core/scene.js";
import { createRenderer } from "./core/renderer.js";
import { createControls } from "./core/controls.js";

import { createEarth } from "./earth/earth.js";

import { SatelliteManager } from "./satellite/satelliteManager.js";

const viewer = document.getElementById("viewer");

const scene = createScene();
const renderer = createRenderer(viewer);
const camera = renderer.camera;

const controls = createControls(camera, renderer.renderer);

const earthSystem = new THREE.Group();
scene.add(earthSystem);

createEarth(earthSystem);

const satellites = new SatelliteManager(earthSystem);

function animate() {
  satellites.update();

  controls.update();
  renderer.renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

animate();