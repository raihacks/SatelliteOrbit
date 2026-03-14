import { createScene } from "./core/scene.js";
import { createRenderer } from "./core/renderer.js";
import { createControls } from "./core/controls.js";
import { createEarth } from "./earth/earth.js";
import { SatelliteManager } from "./satellite/satelliteManager.js";
import { fetchTLECatalog } from "./api/fetchTLECatalog.js";

const viewer = document.getElementById("viewer");
const noradInput = document.getElementById("norad");
const trackButton = document.getElementById("track-btn");
const loadAllButton = document.getElementById("load-all-btn");
const statusEl = document.getElementById("status");
const satListEl = document.getElementById("sat-list");

const selectedNoradEl = document.getElementById("selected-norad");
const latEl = document.getElementById("latitude");
const lonEl = document.getElementById("longitude");
const altEl = document.getElementById("altitude");

const scene = createScene();
const renderer = createRenderer(viewer);
const camera = renderer.camera;
const controls = createControls(camera, renderer.renderer.domElement);

const earthSystem = new THREE.Group();
scene.add(earthSystem);
createEarth(earthSystem);

const satellites = new SatelliteManager(earthSystem);
let selectedSatellite = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const CAMERA_FOCUS_OFFSET = 2.6;

function focusCameraOnSatellite(sat) {
  if (!sat) {
    return;
  }

  const markerPosition = sat.marker.position.clone();

  if (!Number.isFinite(markerPosition.length()) || markerPosition.length() === 0) {
    return;
  }

  const direction = markerPosition.clone().normalize();
  const nextCameraPosition = markerPosition.clone().add(direction.multiplyScalar(CAMERA_FOCUS_OFFSET));

  camera.position.copy(nextCameraPosition);
  controls.target.copy(markerPosition);
  controls.update();
}

function setStatus(message) {
  statusEl.textContent = message;
}

function selectSatellite(sat, statusMessage = null) {
  if (!sat) {
    return;
  }

  selectedSatellite = sat;
  satellites.setSelectedNorad(sat.norad);

  if (statusMessage) {
    setStatus(statusMessage);
  }

  renderSatPills();
  setTelemetry(selectedSatellite);
}

function setTelemetry(sat) {
  if (!sat || !sat.latestData) {
    selectedNoradEl.textContent = "—";
    latEl.textContent = "—";
    lonEl.textContent = "—";
    altEl.textContent = "—";
    return;
  }

  selectedNoradEl.textContent = sat.norad;
  latEl.textContent = `${sat.latestData.latitude.toFixed(2)}°`;
  lonEl.textContent = `${sat.latestData.longitude.toFixed(2)}°`;
  altEl.textContent = `${sat.latestData.altitude_km.toFixed(2)} km`;
}

const MAX_VISIBLE_PILLS = 200;

function renderSatPills() {
  satListEl.innerHTML = "";

  const pillsToRender = satellites.satellites.slice(0, MAX_VISIBLE_PILLS);

  pillsToRender.forEach((sat) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "sat-pill";
    if (selectedSatellite?.norad === sat.norad) {
      pill.classList.add("active");
    }

    pill.textContent = sat.name ? `${sat.norad} · ${sat.name}` : `${sat.norad}`;
    pill.addEventListener("click", () => {
      selectSatellite(sat, `Tracking NORAD ${sat.norad}.`);
    });

    satListEl.appendChild(pill);
  });

  if (satellites.satellites.length > MAX_VISIBLE_PILLS) {
    const overflow = document.createElement("div");
    overflow.className = "sat-list-overflow";
    overflow.textContent = `Showing ${MAX_VISIBLE_PILLS} of ${satellites.satellites.length} satellites`;
    satListEl.appendChild(overflow);
  }
}

async function handleTrackSatellite() {
  const norad = noradInput.value.trim();

  if (!/^\d+$/.test(norad)) {
    setStatus("Please enter a valid numeric NORAD ID.");
    return;
  }

  trackButton.disabled = true;
  setStatus(`Loading NORAD ${norad}...`);

  try {
    const sat = await satellites.addSatellite(norad);
    selectSatellite(sat, `Tracking NORAD ${norad}.`);
    satellites.update();
    focusCameraOnSatellite(sat);
  } catch (error) {
    setStatus(error.message || `Unable to load NORAD ${norad}.`);
  } finally {
    trackButton.disabled = false;
  }
}

async function handleLoadAllSatellites() {
  loadAllButton.disabled = true;
  trackButton.disabled = true;
  setStatus("Loading active satellites catalog... this may take a few seconds.");

  try {
    const catalog = await fetchTLECatalog();
    satellites.addSatellitesFromCatalog(catalog);

    if (!selectedSatellite && satellites.satellites.length > 0) {
      selectSatellite(satellites.satellites[0]);
    }

    renderSatPills();
    setTelemetry(selectedSatellite);
    setStatus(`Loaded ${catalog.length} active satellites.`);
  } catch (error) {
    setStatus(error.message || "Unable to load active satellite catalog.");
  } finally {
    loadAllButton.disabled = false;
    trackButton.disabled = false;
  }
}

trackButton.addEventListener("click", handleTrackSatellite);
loadAllButton.addEventListener("click", handleLoadAllSatellites);
noradInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleTrackSatellite();
  }
});

renderer.renderer.domElement.addEventListener("click", (event) => {
  const rect = renderer.renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const markers = satellites.satellites
    .map((sat) => sat.marker)
    .filter((marker) => marker.visible);

  const intersections = raycaster.intersectObjects(markers, false);

  if (!intersections.length) {
    return;
  }

  const pickedNorad = intersections[0].object.userData?.norad;
  const pickedSatellite = satellites.satellites.find((sat) => sat.norad === pickedNorad);

  if (pickedSatellite) {
    selectSatellite(pickedSatellite, `Selected NORAD ${pickedSatellite.norad} from map.`);
  }
});

window.addEventListener("resize", () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.camera.aspect = width / height;
  renderer.camera.updateProjectionMatrix();
  renderer.renderer.setSize(width, height);
});

function animate() {
  satellites.update();
  setTelemetry(selectedSatellite);

  controls.update();
  renderer.renderer.render(scene, camera);

  requestAnimationFrame(animate);
}

setTelemetry(null);
animate();