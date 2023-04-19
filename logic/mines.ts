import { Planet } from './planet.js';
import { Upgradable } from './upgradable.js';

abstract class Mine extends Upgradable {
    getCosts(level: number): number[] {
        const metalCost: number = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level));
        const crystalCost: number = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level));
        const deutCost: number = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level));
        return [metalCost, crystalCost, deutCost];
    }

    getUpgradeTime(level: number, planets: Planet[], ecoSpeed: number): number {
        const costs: number[] = this.getCosts(level);
        const robot = 0;
        const nano = 0;
        const other = 1;
        const time = (costs[0] + costs[1]) * 1.44 / (1 + robot) / Math.pow(2, nano) / ecoSpeed * other;
        return time;
    }
}

export class MetalMine extends Mine {
    constructor(level: number){
        super(level, "Metaalmijn");
        this.baseMetalCost = 60;
        this.baseCrystalCost = 15;
        this.baseDeutCost = 0;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.5;
        this.types = ["metal"];
        this.refreshTypes = ["metalBonus", "buildSpeed", "buildCost"]
    }
}

export class CrystalMine extends Mine {
    constructor(level: number){
        super(level, "Kristalmijn");
        this.baseMetalCost = 48;
        this.baseCrystalCost = 24;
        this.baseDeutCost = 0;
        this.resIncFactor = 1.6;
        this.timeIncFactor = 1.6;
        this.types = ["crystal"];
        this.refreshTypes = ["crystalBonus", "buildSpeed", "buildCost"]
    }
}

export class DeutMine extends Mine {
    constructor(level: number){
        super(level, "Deuteriumfabriek");
        this.baseMetalCost = 225;
        this.baseCrystalCost = 75;
        this.baseDeutCost = 0;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.5;
        this.types = ["deut"];
        this.refreshTypes = ["deutBonus", "buildSpeed", "buildCost"]
    }
}