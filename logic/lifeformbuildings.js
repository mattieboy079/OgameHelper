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
import { Upgradable } from "./upgradable";
var LifeformBuilding = /** @class */ (function (_super) {
    __extends(LifeformBuilding, _super);
    function LifeformBuilding() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LifeformBuilding.prototype.getCosts = function (level) {
        var metalCost = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        var crystalCost = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        var deutCost = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level) * (level + 1));
        return [metalCost, crystalCost, deutCost];
    };
    LifeformBuilding.prototype.getUpgradeTime = function (level, planets, ecoSpeed) {
        var robot = 0;
        var nano = 0;
        var other = 1;
        return Math.floor((level + 1) * this.baseTimeCost * Math.pow(this.timeIncFactor, level + 1) / ecoSpeed / (1 + robot) / Math.pow(2, nano) * other);
    };
    return LifeformBuilding;
}(Upgradable));
const _LifeformBuilding = LifeformBuilding;
export { _LifeformBuilding as LifeformBuilding };
