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
export const __esModule = true;
import { Upgradable } from "./upgradable.js";
var Mine = /** @class */ (function (_super) {
    __extends(Mine, _super);
    function Mine() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Mine.prototype.getCosts = function (level) {
        var metalCost = this.baseMetalCost * Math.pow(this.resIncFactor, level);
        var crystalCost = this.baseCrystalCost * Math.pow(this.resIncFactor, level);
        var deutCost = this.baseDeutCost * Math.pow(this.resIncFactor, level);
        return [metalCost, crystalCost, deutCost];
    };
    return Mine;
}(Upgradable));
var MetalMine = /** @class */ (function (_super) {
    __extends(MetalMine, _super);
    function MetalMine(level) {
        var _this = _super.call(this, level) || this;
        _this.baseMetalCost = 60;
        _this.baseCrystalCost = 15;
        _this.baseDeutCost = 0;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.5;
        return _this;
    }
    return MetalMine;
}(Mine));
const _MetalMine = MetalMine;
export { _MetalMine as MetalMine };
var CrystalMine = /** @class */ (function (_super) {
    __extends(CrystalMine, _super);
    function CrystalMine(level) {
        var _this = _super.call(this, level) || this;
        _this.baseMetalCost = 48;
        _this.baseCrystalCost = 24;
        _this.baseDeutCost = 0;
        _this.resIncFactor = 1.6;
        _this.timeIncFactor = 1.6;
        return _this;
    }
    return CrystalMine;
}(Mine));
const _CrystalMine = CrystalMine;
export { _CrystalMine as CrystalMine };
var DeutMine = /** @class */ (function (_super) {
    __extends(DeutMine, _super);
    function DeutMine(level) {
        var _this = _super.call(this, level) || this;
        _this.baseMetalCost = 225;
        _this.baseCrystalCost = 75;
        _this.baseDeutCost = 0;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.5;
        return _this;
    }
    return DeutMine;
}(Mine));
const _DeutMine = DeutMine;
export { _DeutMine as DeutMine };
