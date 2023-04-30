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
import { Amortization } from "./amortization.js";
import { Upgradable } from "./upgradable.js";
var Mine = /** @class */ (function (_super) {
    __extends(Mine, _super);
    function Mine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Mine.prototype.getCosts = function (level) {
        var metalCost = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level));
        var crystalCost = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level));
        var deutCost = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level));
        return [metalCost, crystalCost, deutCost];
    };
    Mine.prototype.getUpgradeTime = function (level, planets, ecoSpeed) {
        var costs = this.getCosts(level);
        var robot = 0;
        var nano = 0;
        var other = 1;
        var time = (costs[0] + costs[1]) * 1.44 / (1 + robot) / Math.pow(2, nano) / ecoSpeed * other;
        return time;
    };
    Mine.prototype.getAmortization = function (planets, ratio) {
        var _this = this;
        var mseCost = this.getMseCosts(this.level, planets, ratio);
        var mseProd = this.getMseProduction(this.level + 1, ratio, planets);
        var thisPlanet = planets.filter(function (p) { return p.coords == _this.coords; });
        var planetName = thisPlanet.length == 1 ? thisPlanet[0].name : "undefined";
        console.log(mseProd + "/" + mseCost);
        return new Amortization(planetName, this, mseProd / mseCost, mseCost);
    };
    return Mine;
}(Upgradable));
var MetalMine = /** @class */ (function (_super) {
    __extends(MetalMine, _super);
    function MetalMine(level, coords) {
        var _this = _super.call(this, level, "Metaalmijn", coords) || this;
        _this.baseMetalCost = 60;
        _this.baseCrystalCost = 15;
        _this.baseDeutCost = 0;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.5;
        _this.types = ["metal"];
        _this.refreshTypes = ["metalBonus", "buildSpeed", "buildCost"];
        return _this;
    }
    return MetalMine;
}(Mine));
const _MetalMine = MetalMine;
export { _MetalMine as MetalMine };
var CrystalMine = /** @class */ (function (_super) {
    __extends(CrystalMine, _super);
    function CrystalMine(level, coords) {
        var _this = _super.call(this, level, "Kristalmijn", coords) || this;
        _this.baseMetalCost = 48;
        _this.baseCrystalCost = 24;
        _this.baseDeutCost = 0;
        _this.resIncFactor = 1.6;
        _this.timeIncFactor = 1.6;
        _this.types = ["crystal"];
        _this.refreshTypes = ["crystalBonus", "buildSpeed", "buildCost"];
        return _this;
    }
    return CrystalMine;
}(Mine));
const _CrystalMine = CrystalMine;
export { _CrystalMine as CrystalMine };
var DeutMine = /** @class */ (function (_super) {
    __extends(DeutMine, _super);
    function DeutMine(level, coords) {
        var _this = _super.call(this, level, "Deuteriumfabriek", coords) || this;
        _this.baseMetalCost = 225;
        _this.baseCrystalCost = 75;
        _this.baseDeutCost = 0;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.5;
        _this.types = ["deut"];
        _this.refreshTypes = ["deutBonus", "buildSpeed", "buildCost"];
        return _this;
    }
    return DeutMine;
}(Mine));
const _DeutMine = DeutMine;
export { _DeutMine as DeutMine };
