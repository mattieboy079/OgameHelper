"use strict";
export const __esModule = true;
import { MetalMine, CrystalMine, DeutMine } from "./mines.js";
var Planet = /** @class */ (function () {
    function Planet(data) {
        this.coords = data.coords;
        this.name = data.name;
        this.maxTemp = parseInt(data.maxTemp);
        this.crawlers = parseInt(data.crawlers);
        this.satellite = parseInt(data.satellite);
        this.metal = new MetalMine(parseInt(data.metal));
        this.crystal = new CrystalMine(data.crystal);
        this.deut = new DeutMine(data.deut);
        this.fusion = parseInt(data.fusion);
        this.solar = parseInt(data.solar);
        if(data.lifeforms) this.lifeforms = new PlanetLifeforms(data.lifeforms);
    }
    return Planet;
}());
const _Planet = Planet;
export { _Planet as Planet };
var PlanetLifeforms = /** @class */ (function () {
    function PlanetLifeforms(data) {
        this["class"] = data.lifeformClass;
        // data.buildings.forEach(building => {
        // });
    }
    return PlanetLifeforms;
}());
var LifeformBuilding = /** @class */ (function () {
    function LifeformBuilding() {
    }
    return LifeformBuilding;
}());
var LifeformTech = /** @class */ (function () {
    function LifeformTech() {
    }
    return LifeformTech;
}());
