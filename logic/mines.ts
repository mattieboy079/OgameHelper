import { Amortization } from './amortization.js';
import { Planet } from './planet.js';
import { Player } from './player.js';
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

    getAmortization(player: Player, ratio: number[]): Amortization {
        let mseCost = this.getMseCosts(this.level, player.planets, ratio);
        let mseProd = this.getMseProduction(player, this.level + 1, ratio);
        let thisPlanet = player.planets.filter(p => p.coords == this.coords);
        let planetName = thisPlanet.length == 1 ? thisPlanet[0].name : "undefined";
        console.log(mseProd + "/" + mseCost);
        return new Amortization(planetName, this, mseProd / mseCost, mseCost);
    }

    abstract getRawProduction(economySpeed: number, level: number): number;

    abstract getBonus(player: Player): number;
}

export class MetalMine extends Mine {
    constructor(level: number, coords: string){
        super(level, "Metaalmijn", coords);
        this.baseMetalCost = 60;
        this.baseCrystalCost = 15;
        this.baseDeutCost = 0;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.5;
        this.types = ["metal"];
        this.refreshTypes = ["metalBonus", "buildSpeed", "buildCost"]
    }
    
    getProduction(player: Player, economySpeed: number, level: number = this.level): number[] {
        let metalProduction = 30 * this.getMetalFactor() + this.getRawProduction(economySpeed, level) * (1 + this.getBonus(player)) 
        return [metalProduction, 0, 0];
    }

    getRawProduction(economySpeed: number, level: number = this.level): number {
        return 30 * level * Math.pow(1.1, level) * this.getMetalFactor() * economySpeed;
    }

    getBonus(player: Player): number {
        let planet = player.getPlanet(this.coords);
        if(!planet) return 0;
        return planet.getCrawlerBonus() + planet.getLifeformBuildingBonus("metal") + player.getPlayerProductionBonus() + player.getLifeformTechnologyBonus("metal");
    }

    getMetalFactor(): number {
        let pos = this.coords.split(':')[2];
        if(pos == "8") return 1.35;
        if(pos == "7" || pos == "9") return 1.23;
        if(pos == "6" || pos == "10") return 1.1S;
        return 1;
    }
}

export class CrystalMine extends Mine {
    getBonus(player: Player): number {
        throw new Error('Method not implemented.');
        //todo
    }
    constructor(level: number, coords: string){
        super(level, "Kristalmijn", coords);
        this.baseMetalCost = 48;
        this.baseCrystalCost = 24;
        this.baseDeutCost = 0;
        this.resIncFactor = 1.6;
        this.timeIncFactor = 1.6;
        this.types = ["crystal"];
        this.refreshTypes = ["crystalBonus", "buildSpeed", "buildCost"]
    }

    getCrystalFactor(): number {
        let pos = this.coords.split(':')[2];
        if (pos === "1") return 1.4;
        if (pos === "2") return 1.3;
        if (pos === "3") return 1.2;
        return 1;
    }

    getRawProduction(economySpeed: number, level: number): number {
        return 20 * level * Math.pow(1.1, level) * this.getCrystalFactor() * economySpeed;
    }
}

export class DeutMine extends Mine {
    getRawProduction(economySpeed: number, level: number): number {
        throw new Error('Method not implemented.');
        //Todo
    }
    getBonus(player: Player): number {
        throw new Error('Method not implemented.');
        //Todo
    }
    constructor(level: number, coords: string){
        super(level, "Deuteriumfabriek", coords);
        this.baseMetalCost = 225;
        this.baseCrystalCost = 75;
        this.baseDeutCost = 0;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.5;
        this.types = ["deut"];
        this.refreshTypes = ["deutBonus", "buildSpeed", "buildCost"]
    }
}