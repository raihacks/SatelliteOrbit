import { createSatelliteMarker } from "./satelliteMarker.js";
import { fetchTLE } from "../api/fetchTLE.js";

export class SatelliteManager {

  constructor(group) {
    this.group = group;
    this.satellites = [];
  }

  async addSatellite(norad) {

    const sat = createSatelliteMarker();
    sat.norad = norad;

    this.group.add(sat.marker);

    const tle = await fetchTLE(norad);

    sat.satrec = satellite.twoline2satrec(
      tle.tle1,
      tle.tle2
    );

    this.satellites.push(sat);
  }

  update() {

    this.satellites.forEach((sat) => {
      sat.marker.position.lerp(sat.targetPosition, 0.15);
    });

  }
}