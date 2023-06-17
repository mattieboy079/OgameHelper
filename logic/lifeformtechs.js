"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Upgradable } from "./upgradable";
var LifeformTech = /** @class */ (function (_super) {
    __extends(LifeformTech, _super);
    function LifeformTech() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LifeformTech.prototype.getCosts = function (level) {
        var metalCost = Math.floor(this.baseMetalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        var crystalCost = Math.floor(this.baseCrystalCost * Math.pow(this.resIncFactor, level) * (level + 1));
        var deutCost = Math.floor(this.baseDeutCost * Math.pow(this.resIncFactor, level) * (level + 1));
        return [metalCost, crystalCost, deutCost];
    };
    LifeformTech.prototype.getUpgradeTime = function (level, planets, ecoSpeed) {
        var techLabFactor = 0.64;
        return Math.floor((level + 1) * this.baseTimeCost * Math.pow(this.timeIncFactor, level + 1) / ecoSpeed * techLabFactor);
    };
    return LifeformTech;
}(Upgradable));
const _LifeformTech = LifeformTech;
export { _LifeformTech as LifeformTech };
//#region human
var IntergalacticEnvoys = /** @class */ (function (_super) {
    __extends(IntergalacticEnvoys, _super);
    function IntergalacticEnvoys(level, coords) {
        var _this = _super.call(this, level, "Intergalactische Gezanten", coords) || this;
        _this.baseMetalCost = 5000;
        _this.baseCrystalCost = 2500;
        _this.baseDeutCost = 500;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.2;
        _this.baseTimeCost = 1000;
        return _this;
    }
    return IntergalacticEnvoys;
}(LifeformTech));
const _IntergalacticEnvoys = IntergalacticEnvoys;
export { _IntergalacticEnvoys as IntergalacticEnvoys };
var HighPerformanceExtractors = /** @class */ (function (_super) {
    __extends(HighPerformanceExtractors, _super);
    function HighPerformanceExtractors(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Hoogwaardige Extractoren", coords) || this;
        _this.baseMetalCost = 7000;
        _this.baseCrystalCost = 10000;
        _this.baseDeutCost = 5000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 2000;
        _this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        _this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
        return _this;
    }
    HighPerformanceExtractors.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return HighPerformanceExtractors;
}(LifeformTech));
const _HighPerformanceExtractors = HighPerformanceExtractors;
export { _HighPerformanceExtractors as HighPerformanceExtractors };
var FusionDrives = /** @class */ (function (_super) {
    __extends(FusionDrives, _super);
    function FusionDrives(level, coords) {
        var _this = _super.call(this, level, "Fuse Aandrijvingen", coords) || this;
        _this.baseMetalCost = 15000;
        _this.baseCrystalCost = 10000;
        _this.baseDeutCost = 5000;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 2500;
        return _this;
    }
    return FusionDrives;
}(LifeformTech));
const _FusionDrives = FusionDrives;
export { _FusionDrives as FusionDrives };
var StealthFieldGenerator = /** @class */ (function (_super) {
    __extends(StealthFieldGenerator, _super);
    function StealthFieldGenerator(level, coords) {
        var _this = _super.call(this, level, "Stealth Veldgenerator", coords) || this;
        _this.baseMetalCost = 20000;
        _this.baseCrystalCost = 15000;
        _this.baseDeutCost = 7500;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 3500;
        return _this;
    }
    return StealthFieldGenerator;
}(LifeformTech));
const _StealthFieldGenerator = StealthFieldGenerator;
export { _StealthFieldGenerator as StealthFieldGenerator };
var OrbitalDen = /** @class */ (function (_super) {
    __extends(OrbitalDen, _super);
    function OrbitalDen(level, coords) {
        var _this = _super.call(this, level, "Ruimtegrot", coords) || this;
        _this.baseMetalCost = 25000;
        _this.baseCrystalCost = 20000;
        _this.baseDeutCost = 10000;
        _this.resIncFactor = 1.2;
        _this.timeIncFactor = 1.2;
        _this.baseTimeCost = 4500;
        return _this;
    }
    return OrbitalDen;
}(LifeformTech));
const _OrbitalDen = OrbitalDen;
export { _OrbitalDen as OrbitalDen };
var ResearchAI = /** @class */ (function (_super) {
    __extends(ResearchAI, _super);
    function ResearchAI(level, coords) {
        var _this = _super.call(this, level, "Onderzoek AI", coords) || this;
        _this.baseMetalCost = 35000;
        _this.baseCrystalCost = 25000;
        _this.baseDeutCost = 15000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 5000;
        return _this;
    }
    return ResearchAI;
}(LifeformTech));
const _ResearchAI = ResearchAI;
export { _ResearchAI as ResearchAI };
var HighPerformanceTerraformer = /** @class */ (function (_super) {
    __extends(HighPerformanceTerraformer, _super);
    function HighPerformanceTerraformer(level, coords) {
        var _this = _super.call(this, level, "Hoogwaardige Terraformer", coords) || this;
        _this.baseMetalCost = 70000;
        _this.baseCrystalCost = 40000;
        _this.baseDeutCost = 20000;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 8000;
        return _this;
    }
    return HighPerformanceTerraformer;
}(LifeformTech));
const _HighPerformanceTerraformer = HighPerformanceTerraformer;
export { _HighPerformanceTerraformer as HighPerformanceTerraformer };
var EnhancedProductionTechnologies = /** @class */ (function (_super) {
    __extends(EnhancedProductionTechnologies, _super);
    function EnhancedProductionTechnologies(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Verbeterde Productie Technologiën", coords) || this;
        _this.baseMetalCost = 80000;
        _this.baseCrystalCost = 50000;
        _this.baseDeutCost = 20000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 6000;
        _this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        _this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
        return _this;
    }
    EnhancedProductionTechnologies.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return EnhancedProductionTechnologies;
}(LifeformTech));
const _EnhancedProductionTechnologies = EnhancedProductionTechnologies;
export { _EnhancedProductionTechnologies as EnhancedProductionTechnologies };
var LightFighterMKII = /** @class */ (function (_super) {
    __extends(LightFighterMKII, _super);
    function LightFighterMKII(level, coords) {
        var _this = _super.call(this, level, "Lichtgevechtsschip Mk II", coords) || this;
        _this.baseMetalCost = 320000;
        _this.baseCrystalCost = 240000;
        _this.baseDeutCost = 100000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 6500;
        return _this;
    }
    return LightFighterMKII;
}(LifeformTech));
const _LightFighterMKII = LightFighterMKII;
export { _LightFighterMKII as LightFighterMKII };
var CruiserMKII = /** @class */ (function (_super) {
    __extends(CruiserMKII, _super);
    function CruiserMKII(level, coords) {
        var _this = _super.call(this, level, "Kruiser Mk II", coords) || this;
        _this.baseMetalCost = 320000;
        _this.baseCrystalCost = 240000;
        _this.baseDeutCost = 100000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 7000;
        return _this;
    }
    return CruiserMKII;
}(LifeformTech));
const _CruiserMKII = CruiserMKII;
export { _CruiserMKII as CruiserMKII };
var ImprovedLabTechnology = /** @class */ (function (_super) {
    __extends(ImprovedLabTechnology, _super);
    function ImprovedLabTechnology(level, coords) {
        var _this = _super.call(this, level, "Verbeterde Lab Technologie", coords) || this;
        _this.baseMetalCost = 120000;
        _this.baseCrystalCost = 30000;
        _this.baseDeutCost = 25000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 7500;
        return _this;
    }
    return ImprovedLabTechnology;
}(LifeformTech));
const _ImprovedLabTechnology = ImprovedLabTechnology;
export { _ImprovedLabTechnology as ImprovedLabTechnology };
var PlasmaTerraformer = /** @class */ (function (_super) {
    __extends(PlasmaTerraformer, _super);
    function PlasmaTerraformer(level, coords) {
        var _this = _super.call(this, level, "Plasma Terravormer", coords) || this;
        _this.baseMetalCost = 100000;
        _this.baseCrystalCost = 40000;
        _this.baseDeutCost = 30000;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 10000;
        return _this;
    }
    return PlasmaTerraformer;
}(LifeformTech));
const _PlasmaTerraformer = PlasmaTerraformer;
export { _PlasmaTerraformer as PlasmaTerraformer };
var LowTemperatureDrives = /** @class */ (function (_super) {
    __extends(LowTemperatureDrives, _super);
    function LowTemperatureDrives(level, coords) {
        var _this = _super.call(this, level, "Lage Temperatuursaandrijving", coords) || this;
        _this.baseMetalCost = 200000;
        _this.baseCrystalCost = 100000;
        _this.baseDeutCost = 100000;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 8500;
        return _this;
    }
    return LowTemperatureDrives;
}(LifeformTech));
const _LowTemperatureDrives = LowTemperatureDrives;
export { _LowTemperatureDrives as LowTemperatureDrives };
var BomberMKII = /** @class */ (function (_super) {
    __extends(BomberMKII, _super);
    function BomberMKII(level, coords) {
        var _this = _super.call(this, level, "Bommenwerper Mk II", coords) || this;
        _this.baseMetalCost = 160000;
        _this.baseCrystalCost = 120000;
        _this.baseDeutCost = 50000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 9000;
        return _this;
    }
    return BomberMKII;
}(LifeformTech));
const _BomberMKII = BomberMKII;
export { _BomberMKII as BomberMKII };
var DestroyerMKII = /** @class */ (function (_super) {
    __extends(DestroyerMKII, _super);
    function DestroyerMKII(level, coords) {
        var _this = _super.call(this, level, "Vernietiger Mk II", coords) || this;
        _this.baseMetalCost = 160000;
        _this.baseCrystalCost = 120000;
        _this.baseDeutCost = 50000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 9500;
        return _this;
    }
    return DestroyerMKII;
}(LifeformTech));
const _DestroyerMKII = DestroyerMKII;
export { _DestroyerMKII as DestroyerMKII };
var BattlecruiserMKII = /** @class */ (function (_super) {
    __extends(BattlecruiserMKII, _super);
    function BattlecruiserMKII(level, coords) {
        var _this = _super.call(this, level, "Interceptor Mk II", coords) || this;
        _this.baseMetalCost = 320000;
        _this.baseCrystalCost = 240000;
        _this.baseDeutCost = 100000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 10000;
        return _this;
    }
    return BattlecruiserMKII;
}(LifeformTech));
const _BattlecruiserMKII = BattlecruiserMKII;
export { _BattlecruiserMKII as BattlecruiserMKII };
var RobotAssistants = /** @class */ (function (_super) {
    __extends(RobotAssistants, _super);
    function RobotAssistants(level, coords) {
        var _this = _super.call(this, level, "Robot Assistenten", coords) || this;
        _this.baseMetalCost = 300000;
        _this.baseCrystalCost = 180000;
        _this.baseDeutCost = 120000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 11000;
        return _this;
    }
    return RobotAssistants;
}(LifeformTech));
const _RobotAssistants = RobotAssistants;
export { _RobotAssistants as RobotAssistants };
var Supercomputer = /** @class */ (function (_super) {
    __extends(Supercomputer, _super);
    function Supercomputer(level, coords) {
        var _this = _super.call(this, level, "Supercomputer", coords) || this;
        _this.baseMetalCost = 500000;
        _this.baseCrystalCost = 300000;
        _this.baseDeutCost = 200000;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 13000;
        return _this;
    }
    return Supercomputer;
}(LifeformTech));
const _Supercomputer = Supercomputer;
export { _Supercomputer as Supercomputer };
//#endregion
//#region rocktal
var MagmaRefinement = /** @class */ (function (_super) {
    __extends(MagmaRefinement, _super);
    function MagmaRefinement(level, coords) {
        var _this = _super.call(this, level, "Vulkanische Batterijen", coords) || this;
        _this.baseMetalCost = 10000;
        _this.baseCrystalCost = 6000;
        _this.baseDeutCost = 1000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 1000;
        return _this;
    }
    return MagmaRefinement;
}(LifeformTech));
const _MagmaRefinement = MagmaRefinement;
export { _MagmaRefinement as MagmaRefinement };
var AcousticScanning = /** @class */ (function (_super) {
    __extends(AcousticScanning, _super);
    function AcousticScanning(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Akoestisch Scannen", coords) || this;
        _this.baseMetalCost = 7500;
        _this.baseCrystalCost = 12500;
        _this.baseDeutCost = 5000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 2000;
        _this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "crystalBonus"];
        _this.refreshTypes = ["crystal", "techCost", "techSpeed"];
        return _this;
    }
    AcousticScanning.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
        });
        prod[1] * this.resIncBonus * level;
        return prod;
    };
    return AcousticScanning;
}(LifeformTech));
const _AcousticScanning = AcousticScanning;
export { _AcousticScanning as AcousticScanning };
var HighEnergyPumpSystems = /** @class */ (function (_super) {
    __extends(HighEnergyPumpSystems, _super);
    function HighEnergyPumpSystems(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Hoge Energie Pomp Systemen", coords) || this;
        _this.baseMetalCost = 15000;
        _this.baseCrystalCost = 10000;
        _this.baseDeutCost = 5000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 2500;
        _this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "deutBonus"];
        _this.refreshTypes = ["deut", "techCost", "techSpeed"];
        return _this;
    }
    HighEnergyPumpSystems.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return HighEnergyPumpSystems;
}(LifeformTech));
const _HighEnergyPumpSystems = HighEnergyPumpSystems;
export { _HighEnergyPumpSystems as HighEnergyPumpSystems };
var CargoHoldExpansion = /** @class */ (function (_super) {
    __extends(CargoHoldExpansion, _super);
    function CargoHoldExpansion(level, coords) {
        var _this = _super.call(this, level, "Opslagruimte Uitbreiding", coords) || this;
        _this.baseMetalCost = 20000;
        _this.baseCrystalCost = 15000;
        _this.baseDeutCost = 7500;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 3500;
        return _this;
    }
    return CargoHoldExpansion;
}(LifeformTech));
const _CargoHoldExpansion = CargoHoldExpansion;
export { _CargoHoldExpansion as CargoHoldExpansion };
var MagmaPoweredProduction = /** @class */ (function (_super) {
    __extends(MagmaPoweredProduction, _super);
    function MagmaPoweredProduction(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Magma-Aangedreven Productie", coords) || this;
        _this.baseMetalCost = 25000;
        _this.baseCrystalCost = 20000;
        _this.baseDeutCost = 10000;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 3500;
        _this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "deutBonus"];
        _this.refreshTypes = ["deut", "techCost", "techSpeed"];
        return _this;
    }
    MagmaPoweredProduction.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return MagmaPoweredProduction;
}(LifeformTech));
const _MagmaPoweredProduction = MagmaPoweredProduction;
export { _MagmaPoweredProduction as MagmaPoweredProduction };
var GeothermalPowerPlants = /** @class */ (function (_super) {
    __extends(GeothermalPowerPlants, _super);
    function GeothermalPowerPlants(level, coords) {
        var _this = _super.call(this, level, "Geothermische Energiecentrales", coords) || this;
        _this.baseMetalCost = 50000;
        _this.baseCrystalCost = 50000;
        _this.baseDeutCost = 20000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 5500;
        return _this;
    }
    return GeothermalPowerPlants;
}(LifeformTech));
const _GeothermalPowerPlants = GeothermalPowerPlants;
export { _GeothermalPowerPlants as GeothermalPowerPlants };
var DepthSounding = /** @class */ (function (_super) {
    __extends(DepthSounding, _super);
    function DepthSounding(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Dieptepeiling", coords) || this;
        _this.baseMetalCost = 70000;
        _this.baseCrystalCost = 40000;
        _this.baseDeutCost = 20000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 5500;
        _this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "metalBonus"];
        _this.refreshTypes = ["metal", "techCost", "techSpeed"];
        return _this;
    }
    DepthSounding.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
        });
        prod[0] * this.resIncBonus * level;
        return prod;
    };
    return DepthSounding;
}(LifeformTech));
const _DepthSounding = DepthSounding;
export { _DepthSounding as DepthSounding };
var IonCrystalEnhancement = /** @class */ (function (_super) {
    __extends(IonCrystalEnhancement, _super);
    function IonCrystalEnhancement(level, coords) {
        var _this = _super.call(this, level, "Ionenkristal Verbetering (Zwaar Gevechtsschip)", coords) || this;
        _this.baseMetalCost = 160000;
        _this.baseCrystalCost = 120000;
        _this.baseDeutCost = 50000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 6000;
        return _this;
    }
    return IonCrystalEnhancement;
}(LifeformTech));
const _IonCrystalEnhancement = IonCrystalEnhancement;
export { _IonCrystalEnhancement as IonCrystalEnhancement };
var ImprovedStellarator = /** @class */ (function (_super) {
    __extends(ImprovedStellarator, _super);
    function ImprovedStellarator(level, coords) {
        var _this = _super.call(this, level, "Verbeterde Stellarator", coords) || this;
        _this.baseMetalCost = 75000;
        _this.baseCrystalCost = 55000;
        _this.baseDeutCost = 25000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 6500;
        _this.types = ["planet.tech", "plasmaCost"];
        _this.refreshTypes = ["plasma", "techCost"];
        return _this;
    }
    return ImprovedStellarator;
}(LifeformTech));
const _ImprovedStellarator = ImprovedStellarator;
export { _ImprovedStellarator as ImprovedStellarator };
var HardenedDiamondDrillHeads = /** @class */ (function (_super) {
    __extends(HardenedDiamondDrillHeads, _super);
    function HardenedDiamondDrillHeads(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Verharde Diamanten Boorkoppen", coords) || this;
        _this.baseMetalCost = 85000;
        _this.baseCrystalCost = 40000;
        _this.baseDeutCost = 35000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 7000;
        _this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "metalBonus"];
        _this.refreshTypes = ["metal", "techCost", "techSpeed"];
        return _this;
    }
    HardenedDiamondDrillHeads.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
        });
        prod[0] * this.resIncBonus * level;
        return prod;
    };
    return HardenedDiamondDrillHeads;
}(LifeformTech));
const _HardenedDiamondDrillHeads = HardenedDiamondDrillHeads;
export { _HardenedDiamondDrillHeads as HardenedDiamondDrillHeads };
var SeismicMiningTechnology = /** @class */ (function (_super) {
    __extends(SeismicMiningTechnology, _super);
    function SeismicMiningTechnology(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Seismische Mijntechnologie", coords) || this;
        _this.baseMetalCost = 120000;
        _this.baseCrystalCost = 30000;
        _this.baseDeutCost = 25000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 7500;
        _this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "crystalBonus"];
        _this.refreshTypes = ["crystal", "techCost", "techSpeed"];
        return _this;
    }
    SeismicMiningTechnology.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
        });
        prod[1] * this.resIncBonus * level;
        return prod;
    };
    return SeismicMiningTechnology;
}(LifeformTech));
const _SeismicMiningTechnology = SeismicMiningTechnology;
export { _SeismicMiningTechnology as SeismicMiningTechnology };
var MagmaPoweredPumpSystems = /** @class */ (function (_super) {
    __extends(MagmaPoweredPumpSystems, _super);
    function MagmaPoweredPumpSystems(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Magma-Aangedreven Pompsystemen", coords) || this;
        _this.baseMetalCost = 100000;
        _this.baseCrystalCost = 40000;
        _this.baseDeutCost = 30000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 8000;
        _this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "deutBonus"];
        _this.refreshTypes = ["deut", "techCost", "techSpeed"];
        return _this;
    }
    MagmaPoweredPumpSystems.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return MagmaPoweredPumpSystems;
}(LifeformTech));
const _MagmaPoweredPumpSystems = MagmaPoweredPumpSystems;
export { _MagmaPoweredPumpSystems as MagmaPoweredPumpSystems };
var IonCrystalModules = /** @class */ (function (_super) {
    __extends(IonCrystalModules, _super);
    function IonCrystalModules(level, coords) {
        var _this = _super.call(this, level, "Ionenkristal Modules", coords) || this;
        _this.baseMetalCost = 200000;
        _this.baseCrystalCost = 100000;
        _this.baseDeutCost = 100000;
        _this.resIncFactor = 1.2;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 8500;
        _this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus", "crawlerBonus"];
        _this.refreshTypes = ["metal", "crystal", "deut", "crawler", "techCost", "techSpeed"];
        return _this;
    }
    return IonCrystalModules;
}(LifeformTech));
const _IonCrystalModules = IonCrystalModules;
export { _IonCrystalModules as IonCrystalModules };
var OptimisedSiloConstructionMethod = /** @class */ (function (_super) {
    __extends(OptimisedSiloConstructionMethod, _super);
    function OptimisedSiloConstructionMethod(level, coords) {
        var _this = _super.call(this, level, "Geoptimaliseerde Silo Bouwmethode", coords) || this;
        _this.baseMetalCost = 220000;
        _this.baseCrystalCost = 110000;
        _this.baseDeutCost = 110000;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 9000;
        return _this;
    }
    return OptimisedSiloConstructionMethod;
}(LifeformTech));
const _OptimisedSiloConstructionMethod = OptimisedSiloConstructionMethod;
export { _OptimisedSiloConstructionMethod as OptimisedSiloConstructionMethod };
var DiamondEnergyTransmitter = /** @class */ (function (_super) {
    __extends(DiamondEnergyTransmitter, _super);
    function DiamondEnergyTransmitter(level, coords) {
        var _this = _super.call(this, level, "Diamanten Energie Zender", coords) || this;
        _this.baseMetalCost = 240000;
        _this.baseCrystalCost = 120000;
        _this.baseDeutCost = 120000;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 9500;
        return _this;
    }
    return DiamondEnergyTransmitter;
}(LifeformTech));
const _DiamondEnergyTransmitter = DiamondEnergyTransmitter;
export { _DiamondEnergyTransmitter as DiamondEnergyTransmitter };
var ObsidianShieldReinforcement = /** @class */ (function (_super) {
    __extends(ObsidianShieldReinforcement, _super);
    function ObsidianShieldReinforcement(level, coords) {
        var _this = _super.call(this, level, "Obsidiaan Schildversteviging", coords) || this;
        _this.baseMetalCost = 250000;
        _this.baseCrystalCost = 250000;
        _this.baseDeutCost = 250000;
        _this.resIncFactor = 1.4;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 10000;
        return _this;
    }
    return ObsidianShieldReinforcement;
}(LifeformTech));
const _ObsidianShieldReinforcement = ObsidianShieldReinforcement;
export { _ObsidianShieldReinforcement as ObsidianShieldReinforcement };
var RuneShields = /** @class */ (function (_super) {
    __extends(RuneShields, _super);
    function RuneShields(level, coords) {
        var _this = _super.call(this, level, "Rune Schilden", coords) || this;
        _this.baseMetalCost = 500000;
        _this.baseCrystalCost = 300000;
        _this.baseDeutCost = 200000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 13000;
        return _this;
    }
    return RuneShields;
}(LifeformTech));
const _RuneShields = RuneShields;
export { _RuneShields as RuneShields };
var RocktalCollectorEnhancement = /** @class */ (function (_super) {
    __extends(RocktalCollectorEnhancement, _super);
    function RocktalCollectorEnhancement(level, coords) {
        var _this = _super.call(this, level, "Rock'tal Verzamelaar Verbetering", coords) || this;
        _this.baseMetalCost = 300000;
        _this.baseCrystalCost = 180000;
        _this.baseDeutCost = 120000;
        _this.resIncFactor = 1.7;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 11000;
        return _this;
    }
    return RocktalCollectorEnhancement;
}(LifeformTech));
const _RocktalCollectorEnhancement = RocktalCollectorEnhancement;
export { _RocktalCollectorEnhancement as RocktalCollectorEnhancement };
//#endregion
//#region mechas
var CatalyserTechnology = /** @class */ (function (_super) {
    __extends(CatalyserTechnology, _super);
    function CatalyserTechnology(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Katalysatortechnologie", coords) || this;
        _this.baseMetalCost = 10000;
        _this.baseCrystalCost = 6000;
        _this.baseDeutCost = 1000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 1000;
        _this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "deutBonus"];
        _this.refreshTypes = ["deut", "techCost", "techSpeed"];
        return _this;
    }
    CatalyserTechnology.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return CatalyserTechnology;
}(LifeformTech));
const _CatalyserTechnology = CatalyserTechnology;
export { _CatalyserTechnology as CatalyserTechnology };
var PlasmaDrive = /** @class */ (function (_super) {
    __extends(PlasmaDrive, _super);
    function PlasmaDrive(level, coords) {
        var _this = _super.call(this, level, "Plasma Aandrijving", coords) || this;
        _this.baseMetalCost = 7500;
        _this.baseCrystalCost = 12500;
        _this.baseDeutCost = 5000;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 2000;
        return _this;
    }
    return PlasmaDrive;
}(LifeformTech));
const _PlasmaDrive = PlasmaDrive;
export { _PlasmaDrive as PlasmaDrive };
var EfficiencyModule = /** @class */ (function (_super) {
    __extends(EfficiencyModule, _super);
    function EfficiencyModule(level, coords) {
        var _this = _super.call(this, level, "Efficiëntie module", coords) || this;
        _this.baseMetalCost = 15000;
        _this.baseCrystalCost = 10000;
        _this.baseDeutCost = 5000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 2500;
        return _this;
    }
    return EfficiencyModule;
}(LifeformTech));
const _EfficiencyModule = EfficiencyModule;
export { _EfficiencyModule as EfficiencyModule };
var DepotAI = /** @class */ (function (_super) {
    __extends(DepotAI, _super);
    function DepotAI(level, coords) {
        var _this = _super.call(this, level, "Hangar AI", coords) || this;
        _this.baseMetalCost = 20000;
        _this.baseCrystalCost = 15000;
        _this.baseDeutCost = 7500;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 3500;
        return _this;
    }
    return DepotAI;
}(LifeformTech));
const _DepotAI = DepotAI;
export { _DepotAI as DepotAI };
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
var AutomatedTransportLines = /** @class */ (function (_super) {
    __extends(AutomatedTransportLines, _super);
    function AutomatedTransportLines(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Geautomatiseerde Transportlijnen", coords) || this;
        _this.baseMetalCost = 50000;
        _this.baseCrystalCost = 50000;
        _this.baseDeutCost = 20000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 5000;
        _this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        _this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
        return _this;
    }
    AutomatedTransportLines.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return AutomatedTransportLines;
}(LifeformTech));
const _AutomatedTransportLines = AutomatedTransportLines;
export { _AutomatedTransportLines as AutomatedTransportLines };
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
var ArtificialSwarmIntelligence = /** @class */ (function (_super) {
    __extends(ArtificialSwarmIntelligence, _super);
    function ArtificialSwarmIntelligence(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Artificiële Zwerm Intelligentie", coords) || this;
        _this.baseMetalCost = 200000;
        _this.baseCrystalCost = 100000;
        _this.baseDeutCost = 100000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 8500;
        _this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        _this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
        return _this;
    }
    ArtificialSwarmIntelligence.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return ArtificialSwarmIntelligence;
}(LifeformTech));
const _ArtificialSwarmIntelligence = ArtificialSwarmIntelligence;
export { _ArtificialSwarmIntelligence as ArtificialSwarmIntelligence };
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
var SulphideProcess = /** @class */ (function (_super) {
    __extends(SulphideProcess, _super);
    function SulphideProcess(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Sulfideproces", coords) || this;
        _this.baseMetalCost = 7500;
        _this.baseCrystalCost = 12500;
        _this.baseDeutCost = 5000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 2000;
        _this.resIncBonus = 0.0008 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "deutBonus"];
        _this.refreshTypes = ["deut", "techCost", "techSpeed"];
        return _this;
    }
    SulphideProcess.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return SulphideProcess;
}(LifeformTech));
const _SulphideProcess = SulphideProcess;
export { _SulphideProcess as SulphideProcess };
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
var TelekineticTractorBeam = /** @class */ (function (_super) {
    __extends(TelekineticTractorBeam, _super);
    function TelekineticTractorBeam(level, coords) {
        var _this = _super.call(this, level, "Telekinetische Tractorstraal", coords) || this;
        _this.baseMetalCost = 20000;
        _this.baseCrystalCost = 15000;
        _this.baseDeutCost = 7500;
        _this.resIncFactor = 1.3;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 3500;
        _this.types = ["planet.tech", "expoBonus"];
        _this.refreshTypes = ["expo", "techCost", "techSpeed"];
        return _this;
    }
    return TelekineticTractorBeam;
}(LifeformTech));
const _TelekineticTractorBeam = TelekineticTractorBeam;
export { _TelekineticTractorBeam as TelekineticTractorBeam };
var EnhancedSensorTechnology = /** @class */ (function (_super) {
    __extends(EnhancedSensorTechnology, _super);
    function EnhancedSensorTechnology(level, coords) {
        var _this = _super.call(this, level, "Verbeterde Sensortechnologie", coords) || this;
        _this.baseMetalCost = 25000;
        _this.baseCrystalCost = 20000;
        _this.baseDeutCost = 10000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 4500;
        _this.types = ["planet.tech", "expoBonus"];
        _this.refreshTypes = ["expo", "techCost", "techSpeed"];
        return _this;
    }
    return EnhancedSensorTechnology;
}(LifeformTech));
const _EnhancedSensorTechnology = EnhancedSensorTechnology;
export { _EnhancedSensorTechnology as EnhancedSensorTechnology };
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
var SixthSense = /** @class */ (function (_super) {
    __extends(SixthSense, _super);
    function SixthSense(level, coords) {
        var _this = _super.call(this, level, "Zesde Zintuig", coords) || this;
        _this.baseMetalCost = 120000;
        _this.baseCrystalCost = 30000;
        _this.baseDeutCost = 25000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.4;
        _this.baseTimeCost = 7500;
        _this.types = ["planet.tech", "expoBonus"];
        _this.refreshTypes = ["expo", "techCost", "techSpeed"];
        return _this;
    }
    return SixthSense;
}(LifeformTech));
const _SixthSense = SixthSense;
export { _SixthSense as SixthSense };
var Psychoharmoniser = /** @class */ (function (_super) {
    __extends(Psychoharmoniser, _super);
    function Psychoharmoniser(level, coords, lifeformLevel) {
        var _this = _super.call(this, level, "Psychoharmonisator", coords) || this;
        _this.baseMetalCost = 100000;
        _this.baseCrystalCost = 40000;
        _this.baseDeutCost = 30000;
        _this.resIncFactor = 1.5;
        _this.timeIncFactor = 1.3;
        _this.baseTimeCost = 8000;
        _this.resIncBonus = 0.0006 * (1 + 0.001 * lifeformLevel);
        _this.types = ["planet.tech", "metalBonus", "crystalBonus", "deutBonus"];
        _this.refreshTypes = ["metal", "crystal", "deut", "techCost", "techSpeed"];
        return _this;
    }
    Psychoharmoniser.prototype.getProduction = function (level, planets) {
        var prod = [0, 0, 0];
        planets.forEach(function (planet) {
            prod[0] += planet.metal.getProduction(planet.metal.level, planets)[0];
            prod[1] += planet.crystal.getProduction(planet.crystal.level, planets)[1];
            prod[2] += planet.deut.getProduction(planet.deut.level, planets)[2];
        });
        prod[0] * this.resIncBonus * level;
        prod[1] * this.resIncBonus * level;
        prod[2] * this.resIncBonus * level;
        return prod;
    };
    return Psychoharmoniser;
}(LifeformTech));
const _Psychoharmoniser = Psychoharmoniser;
export { _Psychoharmoniser as Psychoharmoniser };
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
