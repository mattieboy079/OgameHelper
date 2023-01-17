import { getLifeformLevelBonus } from "../functions";
import { Planet } from "./planet";
import { Upgradable } from "./upgradable";

class Research extends Upgradable {
    getCosts(level: number): number[] {
        const metalCost: number = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level));
        const crystalCost: number = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level));
        const deutCost: number = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level));
        return [metalCost, crystalCost, deutCost];
    }
}

export class Astrophysics extends Research {
    constructor(level: number) {
        super(level, "Astrophysics");
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
        super(level, "Plasma Technology");
        this.baseMetalCost = 2000;
        this.baseCrystalCost = 4000;
        this.baseDeutCost = 1000;
        this.resIncFactor = 2;
        this.timeIncFactor = 2;
    }

    getCosts(level: number, planets: Planet[]): number[] {
        let korting: number = 0;
        
        planets.forEach(p => {
            const tech = p.lifeforms.techs.find(x => x.name == "Verbeterde Stellarator");
            if(tech){
                korting += tech.level * (1 + getLifeformLevelBonus(p.lifeforms.class))
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