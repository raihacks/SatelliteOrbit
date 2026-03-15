const DEFAULT_MARKER_COLOR = 0x7df4ff;
const SELECTED_MARKER_COLOR = 0xffffff;
const HOVER_MARKER_COLOR = 0xffd166;

export function createSatelliteMarker(color = DEFAULT_MARKER_COLOR) {
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 7, 7),
    new THREE.MeshBasicMaterial({ color })
  );

  marker.visible = false;

  return {
    marker,
    targetPosition: new THREE.Vector3(),
    norad: null,
    name: null,
    latestData: null,
    orbitLine: null,
    altitudeLine: null,
    groundLine: null,
    groundTrackPoints: [],
    defaultColor: color,
    selectedColor: SELECTED_MARKER_COLOR,
    hoverColor: HOVER_MARKER_COLOR
  };
}