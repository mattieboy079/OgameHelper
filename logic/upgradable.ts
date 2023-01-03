import { Planet } from "./planet";

export abstract class Upgradable {
    name: string;
    baseMetalCost: number;
    baseCrystalCost: number;
    baseDeutCost: number;
    baseTimeCost: number;
    resIncFactor: number;
    timeIncFactor: number;
    level: number;

    constructor(level: number, name: string){
        this.level = level;
        this.name = name;
    }

    /**
     * 
     * @param level current level
     */
    abstract getCosts(level: number): number[];
    
    getMseCosts(level: number, ratio: number[]): number{
        const costs = this.getCosts(level);
        return costs[0] + costs[1] / ratio[1] * ratio[0] + costs[2] / ratio[2] * ratio[0];
    }

    /**
     * 
     * @param level level of tech
     * @param planets current planets of player
     * @returns total production of this tech on the given level with the current planets
     */
    getProduction(level: number, planets: Planet[]): number[]{
        return [0,0,0];
    }
    
    getMseProduction(level: number, ratio: number[], planets: Planet[]): number{
        const prod = this.getProduction(level, planets);
        return prod[0] + prod[1] / ratio[1] * ratio[0] + prod[2] / ratio[2] * ratio[0];
    }

}