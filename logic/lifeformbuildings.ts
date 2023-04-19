import { Planet } from "./planet";
import { Upgradable } from "./upgradable";

export abstract class LifeformBuilding extends Upgradable{
    getCosts(level: number): number[] {
        const metalCost: number = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        const crystalCost: number = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        const deutCost: number = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level) * (level + 1));
        return [metalCost, crystalCost, deutCost];
    }

    getUpgradeTime(level: number, planets: Planet[], ecoSpeed: number): number {
        const robot = 0;
        const nano = 0;
        const other = 1;
        return Math.floor((level + 1) * this.baseTimeCost * Math.pow(this.timeIncFactor, level + 1) / ecoSpeed / (1 + robot) / Math.pow(2, nano) * other);
    }
}

export class MeditationEnclave extends LifeformBuilding{
    constructor(level: number){
        super(level, "Meditatie Enclave");
        this.baseMetalCost = 9;
        this.baseCrystalCost = 3;
        this.baseDeutCost = 0;
        this.baseTimeCost = 40;
        this.resIncFactor = 1.2;
        this.timeIncFactor = 1.21;
    }
}

export class CrystalFarm extends LifeformBuilding{
    constructor(level: number){
        super(level, "Kristal Boerderij");
        this.baseMetalCost = 7;
        this.baseCrystalCost = 2;
        this.baseDeutCost = 0;
        this.baseTimeCost = 40;
        this.resIncFactor = 1.2;
        this.timeIncFactor = 1.21;
    }
}

export class RuneTechnologium extends LifeformBuilding{
    constructor(level: number){
        super(level, "Rune Technologium");
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
    constructor(level: number){
        super(level, "Rune Smederij");
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
    constructor(level: number){
        super(level, "Oriktorium");
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
    constructor(level: number){
        super(level, "Magma Smederij");
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
    constructor(level: number){
        super(level, "Verstoringskamer");
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
    constructor(level: number){
        super(level, "Megaliet");
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
    constructor(level: number){
        super(level, "Kristalraffinaderij");
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
    constructor(level: number){
        super(level, "Deuterium Synthesizer");
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
    constructor(level: number){
        super(level, "Mineralen Onderzoekscentrum");
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
    constructor(level: number){
        super(level, "Geavanceerde Recyclagefabriek");
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