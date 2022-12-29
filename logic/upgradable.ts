export abstract class Upgradable {
    baseMetalCost: number;
    baseCrystalCost: number;
    baseDeutCost: number;
    baseTimeCost: number;
    resIncFactor: number;
    timeIncFactor: number;
    level: number;

    constructor(level: number){
        this.level = level;
    }

    /**
     * 
     * @param level current level
     */
    abstract getCosts(level: number): number[]
}