import { Planet } from "./planet";
import { Upgradable } from "./upgradable";

export abstract class LifeformTech extends Upgradable{
    getCosts(level: number): number[] {
        const metalCost: number = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        const crystalCost: number = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        const deutCost: number = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level) * (level + 1));
        return [metalCost, crystalCost, deutCost];
    }

    getUpgradeTime(level: number, planets: Planet[], ecoSpeed: number): number {
        const techLabFactor = 0.64;
        return Math.floor((level + 1) * this.baseTimeCost * Math.pow(this.timeIncFactor, level + 1) / ecoSpeed * techLabFactor);
    }
}

//#region human
export class IntergalacticEnvoys extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Intergalactische Gezanten", coords);
        this.baseMetalCost = 5000;
        this.baseCrystalCost = 2500;
        this.baseDeutCost = 500;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.2;
        this.baseTimeCost = 1000;
    }
}

export class HighPerformanceExtractors extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Hoogwaardige Extractoren", coords);
        this.baseMetalCost = 7000;
        this.baseCrystalCost = 10000;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2000;
        this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    }
}

export class FusionDrives extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Fuse Aandrijvingen", coords);
        this.baseMetalCost = 15000;
        this.baseCrystalCost = 10000;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2500;
    }
}

export class StealthFieldGenerator extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Stealth Veldgenerator", coords);
        this.baseMetalCost = 20000;
        this.baseCrystalCost = 15000;
        this.baseDeutCost = 7500;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 3500;
    }
}

export class OrbitalDen extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Ruimtegrot", coords);
        this.baseMetalCost = 25000;
        this.baseCrystalCost = 20000;
        this.baseDeutCost = 10000;
        this.resIncFactor = 1.2;
        this.timeIncFactor = 1.2;
        this.baseTimeCost = 4500;
    }
}

export class ResearchAI extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Onderzoek AI", coords);
        this.baseMetalCost = 35000;
        this.baseCrystalCost = 25000;
        this.baseDeutCost = 15000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 5000;
    }

    //Todo: increase tech speed?
}

export class HighPerformanceTerraformer extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Hoogwaardige Terraformer", coords);
        this.baseMetalCost = 70000;
        this.baseCrystalCost = 40000;
        this.baseDeutCost = 20000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 8000;
    }
}

export class EnhancedProductionTechnologies extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Verbeterde Productie Technologiën", coords);
        this.baseMetalCost = 80000;
        this.baseCrystalCost = 50000;
        this.baseDeutCost = 20000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 6000;
        this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    }
}

export class LightFighterMKII extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Lichtgevechtsschip Mk II", coords);
        this.baseMetalCost = 320000;
        this.baseCrystalCost = 240000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 6500;
    }
}

export class CruiserMKII extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Kruiser Mk II", coords);
        this.baseMetalCost = 320000;
        this.baseCrystalCost = 240000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 7000;
    }
}

export class ImprovedLabTechnology extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Verbeterde Lab Technologie", coords);
        this.baseMetalCost = 120000;
        this.baseCrystalCost = 30000;
        this.baseDeutCost = 25000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 7500;
    }

    //Todo: increase speed?
}

export class PlasmaTerraformer extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Plasma Terravormer", coords);
        this.baseMetalCost = 100000;
        this.baseCrystalCost = 40000;
        this.baseDeutCost = 30000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 10000;
    }
}

export class LowTemperatureDrives extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Lage Temperatuursaandrijving", coords);
        this.baseMetalCost = 200000;
        this.baseCrystalCost = 100000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 8500;
    }
}

export class BomberMKII extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Bommenwerper Mk II", coords);
        this.baseMetalCost = 160000;
        this.baseCrystalCost = 120000;
        this.baseDeutCost = 50000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 9000;
    }
}

export class DestroyerMKII extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Vernietiger Mk II", coords);
        this.baseMetalCost = 160000;
        this.baseCrystalCost = 120000;
        this.baseDeutCost = 50000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 9500;
    }
}

export class BattlecruiserMKII extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Interceptor Mk II", coords);
        this.baseMetalCost = 320000;
        this.baseCrystalCost = 240000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 10000;
    }
}

export class RobotAssistants extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Robot Assistenten", coords);
        this.baseMetalCost = 300000;
        this.baseCrystalCost = 180000;
        this.baseDeutCost = 120000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 11000;
    }

    //Todo: increase speed?
}

export class Supercomputer extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Supercomputer", coords);
        this.baseMetalCost = 500000;
        this.baseCrystalCost = 300000;
        this.baseDeutCost = 200000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 13000;
    }

    //Todo: increase speed?
}
//#endregion

//#region rocktal
export class MagmaRefinement extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Vulkanische Batterijen", coords);
        this.baseMetalCost = 10000;
        this.baseCrystalCost = 6000;
        this.baseDeutCost = 1000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 1000;
    }
}

export class AcousticScanning extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Akoestisch Scannen", coords);
        this.baseMetalCost = 7500;
        this.baseCrystalCost = 12500;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2000;
        this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "crystalBonus"];
        this.refreshTypes = ["crystal", "techCost", "techSpeed"];

    }

    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
        });
        prod[1] * this.resIncBonus * level;
        return prod;
    }
}

export class HighEnergyPumpSystems extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Hoge Energie Pomp Systemen", coords);
        this.baseMetalCost = 15000;
        this.baseCrystalCost = 10000;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2500;
        this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "deutBonus"];
        this.refreshTypes = ["deut", "techCost", "techSpeed"];

    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[2] * this.resIncBonus * level;
        return prod;
    }
}

export class CargoHoldExpansion extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Opslagruimte Uitbreiding", coords);
        this.baseMetalCost = 20000;
        this.baseCrystalCost = 15000;
        this.baseDeutCost = 7500;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 3500;
    }
}

export class MagmaPoweredProduction extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Magma-Aangedreven Productie", coords);
        this.baseMetalCost = 25000;
        this.baseCrystalCost = 20000;
        this.baseDeutCost = 10000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 3500;
        this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "deutBonus"];
        this.refreshTypes = ["deut", "techCost", "techSpeed"];

    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    }    
}

export class GeothermalPowerPlants extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Geothermische Energiecentrales", coords);
        this.baseMetalCost = 50000;
        this.baseCrystalCost = 50000;
        this.baseDeutCost = 20000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 5500;
    }
}

export class DepthSounding extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Dieptepeiling", coords);
        this.baseMetalCost = 70000;
        this.baseCrystalCost = 40000;
        this.baseDeutCost = 20000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 5500;
        this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "metalBonus"];
        this.refreshTypes = ["metal", "techCost", "techSpeed"];

    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
        });
        prod[0] * this.resIncBonus * level;
        return prod;
    }
}

export class IonCrystalEnhancement extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Ionenkristal Verbetering (Zwaar Gevechtsschip)", coords);
        this.baseMetalCost = 160000;
        this.baseCrystalCost = 120000;
        this.baseDeutCost = 50000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 6000;
    }
}

export class ImprovedStellarator extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Verbeterde Stellarator", coords);
        this.baseMetalCost = 75000;
        this.baseCrystalCost = 55000;
        this.baseDeutCost = 25000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 6500;
        this.types = ["planet.tech", "plasmaCost"];
        this.refreshTypes = ["plasma", "techCost"];
    }
}

export class HardenedDiamondDrillHeads extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Verharde Diamanten Boorkoppen", coords);
        this.baseMetalCost = 85000;
        this.baseCrystalCost = 40000;
        this.baseDeutCost = 35000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 7000;
        this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "metalBonus"];
        this.refreshTypes = ["metal", "techCost", "techSpeed"];

    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
        });
        prod[0] * this.resIncBonus * level;
        return prod;
    }    
}

export class SeismicMiningTechnology extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Seismische Mijntechnologie", coords);
        this.baseMetalCost = 120000;
        this.baseCrystalCost = 30000;
        this.baseDeutCost = 25000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 7500;
        this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "crystalBonus"];
        this.refreshTypes = ["crystal", "techCost", "techSpeed"];
    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
        });
        prod[1] * this.resIncBonus * level;
        return prod;
    }    
}

export class MagmaPoweredPumpSystems extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Magma-Aangedreven Pompsystemen", coords);
        this.baseMetalCost = 100000;
        this.baseCrystalCost = 40000;
        this.baseDeutCost = 30000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 8000;
        this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "deutBonus"];
        this.refreshTypes = ["deut", "techCost", "techSpeed"];
    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[2] * this.resIncBonus * level;
        return prod;
    }    
}

export class IonCrystalModules extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Ionenkristal Modules", coords);
        this.baseMetalCost = 200000;
        this.baseCrystalCost = 100000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.2;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 8500;
        this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus", "crawlerBonus"];
        this.refreshTypes = ["metal", "crystal", "deut", "crawler", "techCost", "techSpeed"];
    }
}

export class OptimisedSiloConstructionMethod extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Geoptimaliseerde Silo Bouwmethode", coords);
        this.baseMetalCost = 220000;
        this.baseCrystalCost = 110000;
        this.baseDeutCost = 110000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 9000;
    }
}

export class DiamondEnergyTransmitter extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Diamanten Energie Zender", coords);
        this.baseMetalCost = 240000;
        this.baseCrystalCost = 120000;
        this.baseDeutCost = 120000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 9500;
    }
}

export class ObsidianShieldReinforcement extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Obsidiaan Schildversteviging", coords);
        this.baseMetalCost = 250000;
        this.baseCrystalCost = 250000;
        this.baseDeutCost = 250000;
        this.resIncFactor = 1.4;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 10000;
    }
}

export class RuneShields extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Rune Schilden", coords);
        this.baseMetalCost = 500000;
        this.baseCrystalCost = 300000;
        this.baseDeutCost = 200000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 13000;
    }
}

export class RocktalCollectorEnhancement extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Rock'tal Verzamelaar Verbetering", coords);
        this.baseMetalCost = 300000;
        this.baseCrystalCost = 180000;
        this.baseDeutCost = 120000;
        this.resIncFactor = 1.7;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 11000;
    }
}
//#endregion

//#region mechas
export class CatalyserTechnology extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Katalysatortechnologie", coords);
        this.baseMetalCost = 10000;
        this.baseCrystalCost = 6000;
        this.baseDeutCost = 1000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 1000;
        this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "deutBonus"];
        this.refreshTypes = ["deut", "techCost", "techSpeed"];

    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[2] * this.resIncBonus * level;
        return prod;
    }
}

export class PlasmaDrive extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Plasma Aandrijving", coords);
        this.baseMetalCost = 7500;
        this.baseCrystalCost = 12500;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2000;
    }
}

export class EfficiencyModule extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Efficiëntie module", coords);
        this.baseMetalCost = 15000;
        this.baseCrystalCost = 10000;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 2500;
    }
}

export class DepotAI extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Hangar AI", coords);
        this.baseMetalCost = 20000;
        this.baseCrystalCost = 15000;
        this.baseDeutCost = 7500;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 3500;
    }
}

// export class GeneralOverhaulLF extends LifeformTech{
//     constructor(level: number, coords: string){
//         super(level, "Algemene Revisie (Licht Gevechtsschip)", coords);
//         this.baseMetalCost = 160000;
//         this.baseCrystalCost = 120000;
//         this.baseDeutCost = 50000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 4500;
//     }
// }

export class AutomatedTransportLines extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Geautomatiseerde Transportlijnen", coords);
        this.baseMetalCost = 50000;
        this.baseCrystalCost = 50000;
        this.baseDeutCost = 20000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 5000;
        this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    }
}

// export class ImprovedDroneAI extends LifeformTech{
//     constructor(level: number, coords: string){
//         super(level, "Verbeterde Drone AI", coords);
//         this.baseMetalCost = 70000;
//         this.baseCrystalCost = 40000;
//         this.baseDeutCost = 20000;
//         this.resIncFactor = 1.3;
//         this.timeIncFactor = 1.3;
//         this.baseTimeCost = 5500;
//     }
// }

// export class ExpirimentalRecyclingTechnology extends LifeformTech{
//     constructor(level: number){
//         super(level, "Experimentele Recyclage Technologie");
//         this.baseMetalCost = 160000;
//         this.baseCrystalCost = 120000;
//         this.baseDeutCost = 50000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 6000;
//     }
// }

// export class GeneralOverhaulXX extends LifeformTech{
//     constructor(level: number){
//         super(level, "Algemene Revisie (Kruiser)");
//         this.baseMetalCost = 160000;
//         this.baseCrystalCost = 120000;
//         this.baseDeutCost = 50000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 6500;
//     }
// }

// export class SlingshotAutopilot extends LifeformTech{
//     constructor(level: number){
//         super(level, "Slingshot Autopilot");
//         this.baseMetalCost = 85000;
//         this.baseCrystalCost = 40000;
//         this.baseDeutCost = 35000;
//         this.resIncFactor = 1.2;
//         this.timeIncFactor = 1.3;
//         this.baseTimeCost = 7000;
//     }
// }

// export class HighTemperatureSuperconductors extends LifeformTech{
//     constructor(level: number){
//         super(level, "Hoge Temperatuur Supergeleiders");
//         this.baseMetalCost = 120000;
//         this.baseCrystalCost = 30000;
//         this.baseDeutCost = 25000;
//         this.resIncFactor = 1.3;
//         this.timeIncFactor = 1.3;
//         this.baseTimeCost = 7500;
//     }
// }

// export class GeneralOverhaulBS extends LifeformTech{
//     constructor(level: number){
//         super(level, "Algemene Revisie (Slagschip)");
//         this.baseMetalCost = 160000;
//         this.baseCrystalCost = 120000;
//         this.baseDeutCost = 50000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 8000;
//     }
// }

export class ArtificialSwarmIntelligence extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Artificiële Zwerm Intelligentie", coords);
        this.baseMetalCost = 200000;
        this.baseCrystalCost = 100000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 8500;
        this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    }
}

// export class GeneralOverhaulBC extends LifeformTech{
//     constructor(level: number){
//         super(level, "Algemene Revisie (Interceptor)");
//         this.baseMetalCost = 160000;
//         this.baseCrystalCost = 120000;
//         this.baseDeutCost = 50000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 9000;
//     }
// }

// export class GeneralOverhaulBW extends LifeformTech{
//     constructor(level: number){
//         super(level, "Algemene Revisie (Bommenwerper)");
//         this.baseMetalCost = 320000;
//         this.baseCrystalCost = 240000;
//         this.baseDeutCost = 100000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 9500;
//     }
// }

// export class GeneralOverhaulVN extends LifeformTech{
//     constructor(level: number){
//         super(level, "Algemene Revisie (Vernietiger)");
//         this.baseMetalCost = 320000;
//         this.baseCrystalCost = 240000;
//         this.baseDeutCost = 100000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 10000;
//     }
// }

// export class ExpirimentalWeaponsTechnology extends LifeformTech{
//     constructor(level: number){
//         super(level, "Experimentele Wapenstechnologie");
//         this.baseMetalCost = 500000;
//         this.baseCrystalCost = 300000;
//         this.baseDeutCost = 200000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.3;
//         this.baseTimeCost = 13000;
//     }
// }

// export class MechanGeneralEnhancement extends LifeformTech{
//     constructor(level: number){
//         super(level, "Mechan Generaal Verbetering");
//         this.baseMetalCost = 300000;
//         this.baseCrystalCost = 180000;
//         this.baseDeutCost = 120000;
//         this.resIncFactor = 1.7;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 11000;
//     }
// }
// //#endregion

// //#region kaelesh
// export class HeatRecovery extends LifeformTech{
//     constructor(level: number){
//         super(level, "Warmteherstel");
//         this.baseMetalCost = 10000;
//         this.baseCrystalCost = 6000;
//         this.baseDeutCost = 1000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 1000;
//     }
// }

export class SulphideProcess extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Sulfideproces", coords);
        this.baseMetalCost = 7500;
        this.baseCrystalCost = 12500;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2000;
        this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "deutBonus"];
        this.refreshTypes = ["deut", "techCost", "techSpeed"];
    }

    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[2] * this.resIncBonus * level;
        return prod;
    }
}

// export class PsionicNetwork extends LifeformTech{
//     constructor(level: number){
//         super(level, "Psionisch Netwerk");
//         this.baseMetalCost = 15000;
//         this.baseCrystalCost = 10000;
//         this.baseDeutCost = 5000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 2500;
//     }
// }

export class TelekineticTractorBeam extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Telekinetische Tractorstraal", coords);
        this.baseMetalCost = 20000;
        this.baseCrystalCost = 15000;
        this.baseDeutCost = 7500;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 3500;
        this.types = ["planet.tech", "expoBonus"];
        this.refreshTypes = ["expo", "techCost", "techSpeed"];
    }
}

export class EnhancedSensorTechnology extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Verbeterde Sensortechnologie", coords);
        this.baseMetalCost = 25000;
        this.baseCrystalCost = 20000;
        this.baseDeutCost = 10000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 4500;
        this.types = ["planet.tech", "expoBonus"];
        this.refreshTypes = ["expo", "techCost", "techSpeed"];

    }
}

// export class NeuromodalCompressor extends LifeformTech{
//     constructor(level: number){
//         super(level, "Neuromodale Compressor");
//         this.baseMetalCost = 50000;
//         this.baseCrystalCost = 50000;
//         this.baseDeutCost = 20000;
//         this.resIncFactor = 1.3;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 5000;
//     }
// }

// export class NeuroInterface extends LifeformTech{
//     constructor(level: number){
//         super(level, "Neuro-Interface");
//         this.baseMetalCost = 70000;
//         this.baseCrystalCost = 40000;
//         this.baseDeutCost = 20000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.3;
//         this.baseTimeCost = 5500;
//     }

//     //Todo: increase speed?
// }

// export class InterplanetaryAnalysisNetwork extends LifeformTech{
//     constructor(level: number){
//         super(level, "Interplanetair Analysenetwerk");
//         this.baseMetalCost = 80000;
//         this.baseCrystalCost = 50000;
//         this.baseDeutCost = 20000;
//         this.resIncFactor = 1.2;
//         this.timeIncFactor = 1.2;
//         this.baseTimeCost = 6000;
//     }
// }

// export class OverclockingHF extends LifeformTech{
//     constructor(level: number){
//         super(level, "Overklokken (Zwaar Gevechtsschip)");
//         this.baseMetalCost = 320000;
//         this.baseCrystalCost = 240000;
//         this.baseDeutCost = 100000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 6500;
//     }
// }

// export class TelekineticDrive extends LifeformTech{
//     constructor(level: number){
//         super(level, "Telekinetiche Aandrijving");
//         this.baseMetalCost = 85000;
//         this.baseCrystalCost = 40000;
//         this.baseDeutCost = 35000;
//         this.resIncFactor = 1.2;
//         this.timeIncFactor = 1.2;
//         this.baseTimeCost = 7000;
//     }
// }

export class SixthSense extends LifeformTech{
    constructor(level: number, coords: string){
        super(level, "Zesde Zintuig", coords);
        this.baseMetalCost = 120000;
        this.baseCrystalCost = 30000;
        this.baseDeutCost = 25000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 7500;
        this.types = ["planet.tech", "expoBonus"];
        this.refreshTypes = ["expo", "techCost", "techSpeed"];
    }
}

export class Psychoharmoniser extends LifeformTech{
    resIncBonus: number;
    constructor(level: number, coords: string, lifeformLevel: number){
        super(level, "Psychoharmonisator", coords);
        this.baseMetalCost = 100000;
        this.baseCrystalCost = 40000;
        this.baseDeutCost = 30000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 8000;
        this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
    }
    
    override getProduction(level: number, planets: Planet[]): number[] {
        let prod: number[] = [0,0,0];
        planets.forEach(planet => {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    }
}

// export class EfficientSwarmIntelligence extends LifeformTech{
//     constructor(level: number){
//         super(level, "Efficiënte Zwerm Intelligentie");
//         this.baseMetalCost = 200000;
//         this.baseCrystalCost = 100000;
//         this.baseDeutCost = 100000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.3;
//         this.baseTimeCost = 8500;
//     }

//     //Todo: increase speed?
// }

// export class OverclockingLC extends LifeformTech{
//     constructor(level: number){
//         super(level, "Overklokken (Groot Vrachtschip)");
//         this.baseMetalCost = 160000;
//         this.baseCrystalCost = 120000;
//         this.baseDeutCost = 50000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 9000;
//     }
// }

// export class GravitationSensors extends LifeformTech{
//     constructor(level: number){
//         super(level, "Zwaartekrachtsensoren");
//         this.baseMetalCost = 240000;
//         this.baseCrystalCost = 120000;
//         this.baseDeutCost = 120000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 9500;
//     }
// }

// export class OverclockingBS extends LifeformTech{
//     constructor(level: number){
//         super(level, "Overklokken (Slagschip)");
//         this.baseMetalCost = 320000;
//         this.baseCrystalCost = 240000;
//         this.baseDeutCost = 100000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 10000;
//     }
// }

// export class PsionicShieldMatrix extends LifeformTech{
//     constructor(level: number){
//         super(level, "Psionische Schildmatrix");
//         this.baseMetalCost = 500000;
//         this.baseCrystalCost = 300000;
//         this.baseDeutCost = 200000;
//         this.resIncFactor = 1.5;
//         this.timeIncFactor = 1.3;
//         this.baseTimeCost = 13000;
//     }
// }

// export class KaeleshDiscovererEnhancement extends LifeformTech{
//     constructor(level: number){
//         super(level, "Kaelesh Ontdekker Verbetering");
//         this.baseMetalCost = 300000;
//         this.baseCrystalCost = 180000;
//         this.baseDeutCost = 120000;
//         this.resIncFactor = 1.7;
//         this.timeIncFactor = 1.4;
//         this.baseTimeCost = 11000;
//     }
// }
//#endregion