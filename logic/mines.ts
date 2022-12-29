import { Upgradable } from './upgradable.js';

abstract class Mine extends Upgradable {
    getCosts(level: number): number[] {
        const metalCost: number = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level));
        const crystalCost: number = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level));
        const deutCost: number = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level));
        return [metalCost, crystalCost, deutCost];
    }
}

export class MetalMine extends Mine {
    constructor(level: number){
        super(level);
        this.baseMetalCost = 60;
        this.baseCrystalCost = 15;
        this.baseDeutCost = 0;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.5;
    }
}

export class CrystalMine extends Mine {
    constructor(level: number){
        super(level);
        this.baseMetalCost = 48;
        this.baseCrystalCost = 24;
        this.baseDeutCost = 0;
        this.resIncFactor = 1.6;
        this.timeIncFactor = 1.6;
    }
}

export class DeutMine extends Mine {
    constructor(level: number){
        super(level);
        this.baseMetalCost = 225;
        this.baseCrystalCost = 75;
        this.baseDeutCost = 0;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.5;
    }
}