"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { getLifeformLevelBonus } from "../functions.js";
import { Upgradable } from "./upgradable.js";
var Research = /** @class */ (function (_super) {
    __extends(Research, _super);
    function Research() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Research.prototype.getUpgradeTime = function (level, planets, researchSpeed) {
        var ontdekker = true;
        var technocrat = true;
        var labLevel = 48;
        var costs = this.getCosts(level, planets);
        var timeCosts = costs[0] + costs[1];
        var baseTimeFactor = 3.6 / researchSpeed * (ontdekker ? 0.75 : 1) * (technocrat ? 0.75 : 1);
        return timeCosts * baseTimeFactor / (1 + labLevel);
    };
    Research.prototype.getCosts = function (level, planets) {
        var metalCost = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level));
        var crystalCost = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level));
        var deutCost = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level));
        return [metalCost, crystalCost, deutCost];
    };
    return Research;
}(Upgradable));
var Astrophysics = /** @class */ (function (_super) {
    __extends(Astrophysics, _super);
    function Astrophysics(level) {
        var _this = _super.call(this, level, "Astrophysics", "account") || this;
        _this.baseMetalCost = 4000;
        _this.baseCrystalCost = 8000;
        _this.baseDeutCost = 4000;
        _this.resIncFactor = 1.75;
        _this.timeIncFactor = 1.75;
        return _this;
    }
    Astrophysics.prototype.getProduction = function (level, planets) {
        return [0, 0, 0]; //TODO
    };
    return Astrophysics;
}(Research));
const _Astrophysics = Astrophysics;
export { _Astrophysics as Astrophysics };
var PlasmaTechnology = /** @class */ (function (_super) {
    __extends(PlasmaTechnology, _super);
    function PlasmaTechnology(level) {
        var _this = _super.call(this, level, "Plasma Technology", "account") || this;
        _this.baseMetalCost = 2000;
        _this.baseCrystalCost = 4000;
        _this.baseDeutCost = 1000;
        _this.resIncFactor = 2;
        _this.timeIncFactor = 2;
        return _this;
    }
    PlasmaTechnology.prototype.getCosts = function (level, planets) {
        var korting = 0;
        planets.forEach(function (p) {
            var tech = p.lifeforms.techs.filter(function (x) { return x.name == "Verbeterde Stellarator"; });
            if (tech.length == 1) {
                korting += tech[0].level * (1 + (0, getLifeformLevelBonus)(p.lifeforms.class));
            }
        });
        var metalCost = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level));
        var crystalCost = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level));
        var deutCost = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level));
        return [metalCost, crystalCost, deutCost];
    };
    PlasmaTechnology.prototype.getProduction = function (level, planets) {
        return [0, 0, 0]; //TODO
    };
    return PlasmaTechnology;
}(Research));
const _PlasmaTechnology = PlasmaTechnology;
export { _PlasmaTechnology as PlasmaTechnology };
