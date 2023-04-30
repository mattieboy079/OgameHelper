"use strict";
var Upgradable = /** @class */ (function () {
    function Upgradable(level, name, coords) {
        this.level = level;
        this.name = name;
        this.coords = coords;
    }
    /**
     * get the costs of his technology calculated to metal
     * @param level the level to upgrade from
     * @param ratio the ratio to calculate with
     * @returns the costs of this technology in metal
     */
    Upgradable.prototype.getMseCosts = function (level, planets, ratio) {
        var costs = this.getCosts(level, planets);
        return costs[0] + costs[1] / ratio[1] * ratio[0] + costs[2] / ratio[2] * ratio[0];
    };
    /**
     * get the production per hour of this technology
     * @param level level of tech to calculate production for
     * @param planets current planets of player
     * @returns total production per hour of this tech on the given level with the current planets
     */
    Upgradable.prototype.getProduction = function (level, planets) {
        return [0, 0, 0];
    };
    /**
     * get the production per hour calculated in metal of this technology
     * @param level level of tech to calculate production for
     * @param planets current planets of player
     * @returns total production per hour of this tech on the given level with the current planets
     */
    Upgradable.prototype.getMseProduction = function (level, ratio, planets) {
        var prod = this.getProduction(level, planets);
        return prod[0] + prod[1] / ratio[1] * ratio[0] + prod[2] / ratio[2] * ratio[0];
    };
    /**
     * calculates the amortization in hours
     * @param level the level to upgrade to
     * @param ratio the ratio to calc with
     * @param planets the planets to take in calculation
     * @returns the amortization in hours
     */
    Upgradable.prototype.calculateAmortization = function (level, ratio, planets, ecoSpeed) {
        return (this.getMseProduction(level, ratio, planets) / this.getMseCosts(level, planets, ratio)) + this.getUpgradeTime(level, planets, ecoSpeed);
    };
    return Upgradable;
}());
const _Upgradable = Upgradable;
export { _Upgradable as Upgradable };
