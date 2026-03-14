export function createControls(camera, renderer) {

  const controls = new THREE.OrbitControls(camera, renderer);

  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  controls.minDistance = 6;
  controls.maxDistance = 32;

  return controls;
}