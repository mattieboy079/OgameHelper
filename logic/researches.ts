import { getLifeformLevelBonus } from "../functions.js";
import { Planet } from "./planet.js";
import { Upgradable } from "./upgradable.js";

class Research extends Upgradable {
    getUpgradeTime(level: number, planets: Planet[], researchSpeed: number): number {
        let ontdekker = true;
        let technocrat = true;
        let labLevel = 48;
        let costs = this.getCosts(level, planets);
        let timeCosts = costs[0] + costs[1];
        let baseTimeFactor = 3.6 / researchSpeed  * (ontdekker ? 0.75 : 1) * (technocrat ? 0.75 : 1);
        return timeCosts * baseTimeFactor / (1 + labLevel);
    }

    getCosts(level: number, planets: Planet[]): number[] {
        const metalCost: number = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level));
        const crystalCost: number = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level));
        const deutCost: number = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level));
        return [metalCost, crystalCost, deutCost];
    }
}

export class Astrophysics extends Research {
    constructor(level: number) {
        super(level, "Astrophysics", "account");
        this.baseMetalCost = 4000;
        this.baseCrystalCost = 8000;
        this.baseDeutCost = 4000;
        this.resIncFactor = 1.75;
        this.timeIncFactor = 1.75;
    }

    getProduction(level: number, planets: Planet[]): number[] {
        return [0,0,0]; //TODO
    }
}

export class PlasmaTechnology extends Research {
    constructor(level: number) {
        super(level, "Plasma Technology", "account");
        this.baseMetalCost = 2000;
        this.baseCrystalCost = 4000;
        this.baseDeutCost = 1000;
        this.resIncFactor = 2;
        this.timeIncFactor = 2;
    }

    getCosts(level: number, planets: Planet[]): number[] {
        let korting: number = 0;
        
        planets.forEach(p => {
            const tech = p.lifeforms.techs.filter(x => x.name == "Verbeterde Stellarator");
            if(tech.length == 1){
                korting += tech[0].level * (1 + getLifeformLevelBonus(p.lifeforms.class))
            }
        });

        const metalCost: number = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level));
        const crystalCost: number = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level));
        const deutCost: number = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level));
        return [metalCost, crystalCost, deutCost];
    }

    
    getProduction(level: number, planets: Planet[]): number[] {
        return [0,0,0]; //TODO
    }
}