"use strict";
export const __esModule = true;
import { Planet } from "./planet.js";
var Player = /** @class */ (function () {
    function Player(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        this.allyClass = (_a = data.allyClass) !== null && _a !== void 0 ? _a : "-";
        this.playerClass = (_b = data.playerClass) !== null && _b !== void 0 ? _b : "-";
        this.commander = (_c = data.commander) !== null && _c !== void 0 ? _c : false;
        this.admiral = (_d = data.admiral) !== null && _d !== void 0 ? _d : false;
        this.engineer = (_e = data.engineer) !== null && _e !== void 0 ? _e : false;
        this.geologist = (_f = data.geologist) !== null && _f !== void 0 ? _f : false;
        this.technocrat = (_g = data.technocrat) !== null && _g !== void 0 ? _g : false;
        this.legerleiding = this.commander && this.admiral && this.engineer && this.geologist && this.technocrat;
        this.ratio = data.ratio ? data.ratio.map(Number) : [3, 2, 1];
        this.exporounds = parseFloat((_h = data.exporounds) !== null && _h !== void 0 ? _h : 0);
        this.exposlots = parseInt((_j = data.exposlots) !== null && _j !== void 0 ? _j : 0);
        this.fillPlanets(data.planets);
    }
    Player.prototype.fillPlanets = function (data) {
        var _this = this;
        _this.planets = [];
        data.forEach(function (planet) {
            _this.planets.push(new Planet(planet));
        });
    };
    return Player;
}());
const _Player = Player;
export { _Player as Player };
