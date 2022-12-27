"use strict";
export const __esModule = true;
var Planet = /** @class */ (function () {
    function Planet(data) {
        this.coords = data.coords;
        this.name = data.name;
        this.maxTemp = parseInt(data.maxTemp);
        this.crawlers = parseInt(data.crawlers);
        this.satellites = parseInt(data.satellites);
        this.metal = new MetalMine();
        this.crystal = new CrystalMine();
        this.deut = new DeuteriumMine();
        this.fusion = parseInt(data.fusion);
        this.solar = parseInt(data.solar);
        this.lifeforms = new PlanetLifeforms();
    }
    return Planet;
}());
const _Planet = Planet;
export { _Planet as Planet };
var MetalMine = /** @class */ (function () {
    function MetalMine() {
    }
    return MetalMine;
}());
var CrystalMine = /** @class */ (function () {
    function CrystalMine() {
    }
    return CrystalMine;
}());
var DeuteriumMine = /** @class */ (function () {
    function DeuteriumMine() {
    }
    return DeuteriumMine;
}());
var PlanetLifeforms = /** @class */ (function () {
    function PlanetLifeforms() {
    }
    return PlanetLifeforms;
}());
