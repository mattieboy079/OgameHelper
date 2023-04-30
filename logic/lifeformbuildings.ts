import { Planet } from "./planet";
import { Upgradable } from "./upgradable";

export abstract class LifeformBuilding extends Upgradable{
    getCosts(level: number): number[] {
        const metalCost: number = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        const crystalCost: number = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        const deutCost: number = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level) * (level + 1));
        return [metalCost, crystalCost, deutCost];
    }

    getUpgradeTime(level: number, planets: Planet[], ecoSpeed: number): number {
        const robot = 0;
        const nano = 0;
        const other = 1;
        return Math.floor((level + 1) * this.baseTimeCost * Math.pow(this.timeIncFactor, level + 1) / ecoSpeed / (1 + robot) / Math.pow(2, nano) * other);
    }
}