import { Upgradable } from "./upgradable";

export abstract class LifeformTech extends Upgradable{
    getCosts(level: number): number[] {
        const metalCost: number = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        const crystalCost: number = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        const deutCost: number = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level) * (level + 1));
        return [metalCost, crystalCost, deutCost];
    }
}

//#region human
export class IntergalacticEnvoys extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 5000;
        this.baseCrystalCost = 2500;
        this.baseDeutCost = 500;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.2;
        this.baseTimeCost = 1000;
    }
}

export class HighPerformanceExtractors extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 7000;
        this.baseCrystalCost = 10000;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2000;
    }
}

export class FusionDrives extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 15000;
        this.baseCrystalCost = 10000;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2500;
    }
}

export class StealthFieldGenerator extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 20000;
        this.baseCrystalCost = 15000;
        this.baseDeutCost = 7500;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 3500;
    }
}

export class OrbitalDen extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 25000;
        this.baseCrystalCost = 20000;
        this.baseDeutCost = 10000;
        this.resIncFactor = 1.2;
        this.timeIncFactor = 1.2;
        this.baseTimeCost = 4500;
    }
}

export class ResearchAI extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 35000;
        this.baseCrystalCost = 25000;
        this.baseDeutCost = 15000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 5000;
    }
}

export class HighPerformanceTerraformer extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 70000;
        this.baseCrystalCost = 40000;
        this.baseDeutCost = 20000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 8000;
    }
}

export class EnhancedProductionTechnologies extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 80000;
        this.baseCrystalCost = 50000;
        this.baseDeutCost = 20000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 6000;
    }
}

export class LightFighterMKII extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 320000;
        this.baseCrystalCost = 240000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 6500;
    }
}

export class CruiserMKII extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 320000;
        this.baseCrystalCost = 240000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 7000;
    }
}

export class ImprovedLabTechnology extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 120000;
        this.baseCrystalCost = 30000;
        this.baseDeutCost = 25000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 7500;
    }
}

export class PlasmaTerraformer extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 100000;
        this.baseCrystalCost = 40000;
        this.baseDeutCost = 30000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 10000;
    }
}

export class LowTemperatureDrives extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 200000;
        this.baseCrystalCost = 100000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 8500;
    }
}

export class BomberMKII extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 160000;
        this.baseCrystalCost = 120000;
        this.baseDeutCost = 50000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 9000;
    }
}

export class DestroyerMKII extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 160000;
        this.baseCrystalCost = 120000;
        this.baseDeutCost = 50000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 9500;
    }
}

export class BattlecruiserMKII extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 320000;
        this.baseCrystalCost = 240000;
        this.baseDeutCost = 100000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 10000;
    }
}

export class RobotAssistants extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 300000;
        this.baseCrystalCost = 180000;
        this.baseDeutCost = 120000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 11000;
    }
}

export class Supercomputer extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 500000;
        this.baseCrystalCost = 300000;
        this.baseDeutCost = 200000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 13000;
    }
}
//#endregion

//#region rocktal
export class MagmaRefinement extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 10000;
        this.baseCrystalCost = 6000;
        this.baseDeutCost = 1000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 1000;
    }
}

export class AcousticScanning extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 7500;
        this.baseCrystalCost = 12500;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2000;
    }
}

export class HighEnergyPumpSystems extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 15000;
        this.baseCrystalCost = 10000;
        this.baseDeutCost = 5000;
        this.resIncFactor = 1.5;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 2500;
    }
}

export class CargoHoldExpansion extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 20000;
        this.baseCrystalCost = 15000;
        this.baseDeutCost = 7500;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.4;
        this.baseTimeCost = 3500;
    }
}

export class MagmaPoweredProduction extends LifeformTech{
    constructor(level: number){
        super(level);
        this.baseMetalCost = 25000;
        this.baseCrystalCost = 20000;
        this.baseDeutCost = 10000;
        this.resIncFactor = 1.3;
        this.timeIncFactor = 1.3;
        this.baseTimeCost = 3500;
    }
}

export class GeothermalPowerPlants extends LifeformTech{

}

export class DepthSounding extends LifeformTech{

}

export class IonCrystalEnhancement extends LifeformTech{

}

export class ImprovedStellarator extends LifeformTech{

}

export class HardenedDiamondDrillHeads extends LifeformTech{

}

export class SeismicMiningTechnology extends LifeformTech{

}

export class MagmaPoweredPumpSystems extends LifeformTech{

}

export class IonCrystalModules extends LifeformTech{

}

export class OptimisedSiloConstructionMethod extends LifeformTech{

}

export class DiamondEnergyTransmitter extends LifeformTech{

}

export class ObsidianShieldReinforcement extends LifeformTech{

}

export class RuneShields extends LifeformTech{

}

export class RocktalCollectorEnhancement extends LifeformTech{

}
//#endregion

//#region mechas

//#endregion

//#region kaelesh

//#endregion