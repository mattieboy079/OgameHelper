import { Planet } from "./planet";

export abstract class Upgradable {
    name: string;
    coords: string;
    baseMetalCost: number;
    baseCrystalCost: number;
    baseDeutCost: number;
    baseTimeCost: number;
    resIncFactor: number;
    timeIncFactor: number;
    level: number;
    prerequisites: Record<string,number>;
    types: string[];
    refreshTypes: string[];

    constructor(level: number, name: string){
        this.level = level;
        this.name = name;
    }

    /**
     * get the costs of this technology
     * @param level the level to upgrade from
     */
    abstract getCosts(level: number): number[];
    
    /**
     * get the time to upgrade this technology
     * @param level the level to upgrade from 
     * @param planets current planets of the player
     */
    abstract getUpgradeTime(level: number, planets: Planet[], ecoSpeed: number) : number;

    /**
     * get the costs of his technology calculated to metal
     * @param level the level to upgrade from
     * @param ratio the ratio to calculate with
     * @returns the costs of this technology in metal
     */
    getMseCosts(level: number, ratio: number[]): number{
        const costs = this.getCosts(level);
        return costs[0] + costs[1] / ratio[1] * ratio[0] + costs[2] / ratio[2] * ratio[0];
    }

    /**
     * get the production per hour of this technology
     * @param level level of tech to calculate production for
     * @param planets current planets of player
     * @returns total production per hour of this tech on the given level with the current planets
     */
    getProduction(level: number, planets: Planet[]): number[]{
        return [0,0,0];
    }
    
    /**
     * get the production per hour calculated in metal of this technology
     * @param level level of tech to calculate production for
     * @param planets current planets of player
     * @returns total production per hour of this tech on the given level with the current planets
     */
    getMseProduction(level: number, ratio: number[], planets: Planet[]): number{
        const prod = this.getProduction(level, planets);
        return prod[0] + prod[1] / ratio[1] * ratio[0] + prod[2] / ratio[2] * ratio[0];
    }

    /**
     * calculates the amortization in hours
     * @param level the level to upgrade to
     * @param ratio the ratio to calc with
     * @param planets the planets to take in calculation
     * @returns the amortization in hours
     */
    getAmortization(level: number, ratio: number[], planets: Planet[], ecoSpeed: number): number{
        return (this.getMseProduction(level, ratio, planets) / this.getMseCosts(level, ratio)) + this.getUpgradeTime(level, planets, ecoSpeed);
    }
}