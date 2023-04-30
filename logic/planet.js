"use strict";
import { MetalMine, CrystalMine, DeutMine } from "./mines.js";
var Planet = /** @class */ (function () {
    function Planet(data) {
        this.coords = data.coords;
        this.name = data.name;
        this.maxTemp = parseInt(data.maxTemp);
        this.crawlers = parseInt(data.crawlers);
        this.satellite = parseInt(data.satellite);
        this.metal = new MetalMine(parseInt(data.metal), this.coords);
        this.crystal = new CrystalMine(parseInt(data.crystal), this.coords);
        this.deut = new DeutMine(parseInt(data.deut), this.coords);
        this.fusion = parseInt(data.fusion);
        this.solar = parseInt(data.solar);
        if (data.lifeforms)
            this.lifeforms = new PlanetLifeforms(data.lifeforms);
    }
    Planet.prototype.getAmortization = function (planets, ratio) {
        var amors = new Array;
        amors.push(this.metal.getAmortization(planets, ratio));
        amors.push(this.crystal.getAmortization(planets, ratio));
        amors.push(this.deut.getAmortization(planets, ratio));
        //amors.push(this.lifeforms.getAmortization());
        return amors;
    };
    return Planet;
}());
const _Planet = Planet;
export { _Planet as Planet };
var PlanetLifeforms = /** @class */ (function () {
    function PlanetLifeforms(data) {
        this.class = data.lifeformClass;
        switch (this.class) {
            case "mensen":
                break;
            case "rocktal":
                break;
            case "mechas":
                break;
            case "kaelesh":
                break;
        }
    }
    return PlanetLifeforms;
}());
