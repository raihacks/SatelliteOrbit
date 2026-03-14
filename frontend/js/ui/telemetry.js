function Telemetry() {
  if (!selectedSatellite || !selectedSatellite.latestData) {
    selectedNoradEl.textContent = "—";
    latEl.textContent = "—";
    lonEl.textContent = "—";
    altEl.textContent = "—";
    return;
  }

  const data = selectedSatellite.latestData;
  selectedNoradEl.textContent = `${selectedSatellite.norad}`;
  latEl.textContent = `${Number(data.latitude).toFixed(2)}°`;
  lonEl.textContent = `${Number(data.longitude).toFixed(2)}°`;
  altEl.textContent = `${Number(data.altitude_km).toFixed(2)} km`;
}