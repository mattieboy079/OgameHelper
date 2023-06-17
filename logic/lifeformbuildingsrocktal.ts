import { LifeformBuilding } from "./lifeformbuildings";

export class MeditationEnclave extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Meditatie Enclave", coords);
        this.baseMetalCost = 9;
        this.baseCrystalCost = 3;
        this.baseDeutCost = 0;
        this.baseTimeCost = 40;
        this.resIncFactor = 1.2;
        this.timeIncFactor = 1.21;
    }
}

export class CrystalFarm extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Kristal Boerderij", coords);
        this.baseMetalCost = 7;
        this.baseCrystalCost = 2;
        this.baseDeutCost = 0;
        this.baseTimeCost = 40;
        this.resIncFactor = 1.2;
        this.timeIncFactor = 1.21;
    }
}

export class RuneTechnologium extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Rune Technologium", coords);
        this.prerequisites = {
            'Meditatie Enclave': 21,
            'Kristal Boerderij': 22,
        };
        this.baseMetalCost = 40000;
        this.baseCrystalCost = 10000;
        this.baseDeutCost = 15000;
        this.baseTimeCost = 16000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.25;
        this.types = ["techCost", "techSpeed"];
        this.refreshTypes = ["planet.tech", "buildCost", "buildSpeed"];
    }
}

export class RuneForge extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Rune Smederij", coords);
        this.prerequisites = {
            'Meditatie Enclave': 41,
        };
        this.baseMetalCost = 5000;
        this.baseCrystalCost = 3800;
        this.baseDeutCost = 1000;
        this.baseTimeCost = 16000;
        this.resIncFactor = 1.7;
        this.timeIncFactor = 1.6;
    }
}

export class Oriktorium extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Oriktorium", coords);
        this.prerequisites = {
            'Kristalraffinaderij': 5,
        };
        this.baseMetalCost = 50000;
        this.baseCrystalCost = 40000;
        this.baseDeutCost = 50000;
        this.baseTimeCost = 64000;
        this.resIncFactor = 1.65;
        this.timeIncFactor = 1.7;
    }
}

export class MagmaForge extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Magma Smederij", coords);
        this.prerequisites = {
            'Rune Technologium': 5,
        };
        this.baseMetalCost = 10000;
        this.baseCrystalCost = 8000;
        this.baseDeutCost = 1000;
        this.baseTimeCost = 2000;
        this.resIncFactor = 1.4;
        this.timeIncFactor = 1.3;
        this.types = ["planet.metalBonus"];
        this.refreshTypes = ["planet.metal", "buildCost", "buildSpeed"];
    }
}

export class DisruptionChamber extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Verstoringskamer", coords);
        this.prerequisites = {
            'Magma Smederij': 3,
        };
        this.baseMetalCost = 20000;
        this.baseCrystalCost = 15000;
        this.baseDeutCost = 10000;
        this.baseTimeCost = 16000;
        this.resIncFactor = 1.2;
        this.timeIncFactor = 1.25;
    }
}

export class Megalith extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Megaliet", coords);
        this.prerequisites = {
            'Rune Smederij': 1,
        };
        this.baseMetalCost = 50000;
        this.baseCrystalCost = 35000;
        this.baseDeutCost = 15000;
        this.baseTimeCost = 40000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.types = ["planet.buildCost", "planet.buildSpeed"];
        this.refreshTypes = ["planet.buildCost", "planet.buildSpeed"];
    }
}

export class CrystalRefinery extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Kristalraffinaderij", coords);
        this.prerequisites = {
            'Megaliet': 1,
        };
        this.baseMetalCost = 85000;
        this.baseCrystalCost = 44000;
        this.baseDeutCost = 25000;
        this.baseTimeCost = 40000;
        this.resIncFactor = 1.4;
        this.timeIncFactor = 1.2;
        this.types = ["planet.crystalBonus"];
        this.refreshTypes = ["planet.crystal", "buildCost", "buildSpeed"];
    }
}

export class DeuteriumSynthesizer extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Deuterium Synthesizer", coords);
        this.prerequisites = {
            'Megaliet': 2,
        };
        this.baseMetalCost = 120000;
        this.baseCrystalCost = 50000;
        this.baseDeutCost = 20000;
        this.baseTimeCost = 52000;
        this.resIncFactor = 1.4;
        this.timeIncFactor = 1.2;
        this.types = ["planet.deutBonus"];
        this.refreshTypes = ["planet.deut", "buildCost", "buildSpeed"];
    }
}

export class MineralResearchCentre extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Mineralen Onderzoekscentrum", coords);
        this.prerequisites = {
            'Kristalraffinaderij': 6,
            'Oriktorium': 1,
        };
        this.baseMetalCost = 250000;
        this.baseCrystalCost = 150000;
        this.baseDeutCost = 100000;
        this.baseTimeCost = 90000;
        this.resIncFactor = 1.8;
        this.timeIncFactor = 1.3;
        this.types = ["planet.buildCost", "planet.buildSpeed"];
        this.refreshTypes = ["planet.metal", "planet.crystal", "planet.deut", "planet.buildCost", "planet.buildSpeed"];

    }
}

export class AdvancedRecyclingPlant extends LifeformBuilding{
    constructor(level: number, coords: string){
        super(level, "Geavanceerde Recyclagefabriek", coords);
        this.prerequisites = {
            'Megaliet': 5,
            'Oriktorium': 5,
            'Mineralen Onderzoekscentrum': 5,
            'Verstoringskamer': 4,
        };
        this.baseMetalCost = 250000;
        this.baseCrystalCost = 125000;
        this.baseDeutCost = 125000;
        this.baseTimeCost = 95000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
    }
}