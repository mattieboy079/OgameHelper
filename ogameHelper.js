//import { Player } from './logic/player.js';
import { MessageAnalyzer } from './messageAnalyzer.js';
import { GetAverageTemp, GetExpeditionData, GetCurrentUnixTimeInSeconds, GetRelativeSecondsToUnixTime, GetTimeString, GetMseValue } from './functions.js';

const PLAYER_CLASS_EXPLORER = "ontdekker";
const PLAYER_CLASS_GENERAL = "generaal";
const PLAYER_CLASS_COLLECTOR = "verzamelaar";
const PLAYER_CLASS_NONE = "-";

const ALLY_CLASS_EXPLORER = "explorer";
const ALLY_CLASS_WARRIOR = "warrior";
const ALLY_CLASS_TRADER = "trader";
const ALLY_CLASS_NONE = "-";

const LIFEFORM_CLASS_MENSEN = "mensen";
const LIFEFORM_CLASS_ROCKTAL = "rocktal";
const LIFEFORM_CLASS_MECHA = "mechas";
const LIFEFORM_CLASS_KAELESH = "kaelesh";

const OVERVIEW = "overview";
const RESOURCES = "supplies";
const LIFEFORM = "lfbuildings";
const LIFEFORM_RESEARCH = "lfresearch";
const LIFEFORM_SETTINGS = "lfsettings";
const FACILITIES = "facilities";
const RESEARCH = "research";
const ALLIANCE = "alliance";
const MESSAGES = "messages";

const UNIVERSE = window.location.host.split(".")[0];
const CULTURE = UNIVERSE.split("-")[1];

let ExpoRounsPerDay;
let TotalLifeformTechLevelBoni = {};

function getLanguage() {
    fetch(`https://${UNIVERSE}.ogame.gameforge.com/api/localization.xml`)
        .then((rep) => rep.text())
        .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
        .then((xml) => {
            console.log(xml.querySelector("techs"));
            //METAALMIJN = xml.querySelector("")
        });
}

class OgameHelper {
    constructor() {
        let data = localStorage.getItem("ogh-" + UNIVERSE);
        if (data && data !== "undefined") {
            this.json = JSON.parse(data);
            console.log(this.json);
            let player = this.json.player;
            //let newPlayer = new Player(this.json.player);
            this.getServerSettings(UNIVERSE);
            if (!this.json.player) {
                this.getNewPlayerJson();
                this.saveData();
            }
        } else {
            console.log("new");
            this.json = {};
            this.getServerSettings(UNIVERSE);
            this.getNewPlayerJson();
            console.log(this.json);
        }
    }

    run() {
        this.checkPage();
        this.createSettingsButton();
    }

    getNewPlayerJson() {
        this.json.player = {};
        if (document.querySelector("#characterclass .explorer")) {
            this.json.player.playerClass = PLAYER_CLASS_EXPLORER;
        } else if (document.querySelector("#characterclass .warrior")) {
            this.json.player.playerClass = PLAYER_CLASS_GENERAL;
        } else if (document.querySelector("#characterclass .miner")) {
            this.json.player.playerClass = PLAYER_CLASS_COLLECTOR;
        } else {
            this.json.player.playerClass = PLAYER_CLASS_NONE;
        }

        this.json.player.geologist = document.querySelector(".geologist.on") ? true : false;
        this.json.player.engineer = document.querySelector(".engineer.on") ? true : false;
        this.json.player.legerleiding = this.json.player.geologist && this.json.player.engineer && (document.querySelector(".commander.on") ? true : false) && (document.querySelector(".admiral.on") ? true : false) && (document.querySelector(".technocrat.on") ? true : false);

        this.json.player.allyClass = ALLY_CLASS_NONE;

        this.json.player.ratio = [3, 2, 1];
        this.json.player.astro = 0;
        this.json.player.plasma = 0;
        this.json.player.ion = 0;
        this.json.player.laser = 0;
        this.json.player.energy = 0;
        this.json.player.spy = 0;
        this.json.player.impuls = 0;

        this.json.player.planets = [];
        let planetList = document.querySelectorAll(".smallplanet");
        planetList.forEach((planet, index) => {
            let coords = planet.querySelector(".planet-koords");
            if (coords) {
                let name = planet.querySelector(".planet-name").textContent;
                this.json.player.planets[index] = this.newPlanet(this.trimCoords(coords), name);
            }
        });

        console.log(this);
    }

    trimCoords(coords) {
        return coords.textContent.replace(/^\[|\]$/g, '');
    }

    async getServerSettings(universe) {
        let url = `https://${universe}.ogame.gameforge.com/api/serverData.xml`;
        console.log(url);
        fetch(url)
            .then((rep) => rep.text())
            .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
            .then((xml) => {
                this.json.settings = {};
                this.json.settings.universe = universe,
                    this.json.settings.lifeforms = xml.querySelector("lifeformSettings") ? true : false;
                this.json.settings.version = xml.querySelector("version").innerHTML,
                    this.json.settings.economySpeed = xml.querySelector("speed").innerHTML,
                    this.json.settings.globalResearchSpeedFactor = xml.querySelector("researchDurationDivisor").innerHTML,
                    this.json.settings.explorerResearchSpeedFactor = xml.querySelector("explorerBonusIncreasedResearchSpeed").innerHTML,
                    this.json.settings.peacefulFleetSpeed = xml.querySelector("speedFleetPeaceful").innerHTML,
                    this.json.settings.deutUsageFactor = xml.querySelector("globalDeuteriumSaveFactor").innerHTML,
                    this.json.settings.topscore = xml.querySelector("topScore").innerHTML
                this.saveData();
            });
        console.log(this.json.settings);
    }

    saveData() {
        console.log("data to save:");
        console.log(this.json);
        localStorage.setItem("ogh-" + UNIVERSE, JSON.stringify(this.json));
    }

    getEffectiveLifeformTechLevel(techId){
        if(TotalLifeformTechLevelBoni[techId] || TotalLifeformTechLevelBoni[techId] == 0) return TotalLifeformTechLevelBoni[techId];

        let totalBonus = 0;
        this.json.player.planets.forEach(planet => {
            let foundTech = planet.lifeforms?.techs?.find(tech => tech.id == techId);
            if(foundTech) totalBonus += this.getLevel(foundTech.level) * (1 + this.getLifeformBonus(planet));
        });
        TotalLifeformTechLevelBoni[techId] = totalBonus;
        return totalBonus;
    }

    getBonus(planet, resource, totalPlanets = this.json.player.planets) {
        let verzamelaarVersterker = this.getEffectiveLifeformTechLevel("12218") * 0.002;
        let verzamelaarBonus = this.json.player.playerClass == PLAYER_CLASS_COLLECTOR ? 0.25 * verzamelaarVersterker : 0;
        let handelaarBonus = this.json.player.allyClass == ALLY_CLASS_TRADER ? 0.05 : 0;
        let plasmaFactor = resource === "metal" ? 0.01 : (resource === "crystal" ? 0.0066 : 0.0033);
        let plasmaLevel = this.getLevel(this.json.player.plasma);
        let plasmaBonus = plasmaLevel ? plasmaLevel * plasmaFactor : 0;
        let officerBonus = this.json.player.geologist ? (this.json.player.legerleiding ? 0.12 : 0.1) : 0;
        let processorBonus = Math.min(0.5, planet.crawlers ? Math.min(planet.crawlers, this.calcMaxCrawlers(planet)) * (this.json.player.playerClass === PLAYER_CLASS_COLLECTOR ? 0.0003 * (1 + 0.5 * (1 + verzamelaarVersterker)) : 0.0002) : 0);
        let lifeformBonus = 0;
        if (this.json.settings.lifeforms) {
            let lifeformBuildingBonus = 0;
            let lifeformTechBonus = 0;
            if (planet.lifeforms && planet.lifeforms.lifeformClass) {
                const buildings = planet.lifeforms.buildings;
                if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN) {
                    if (resource == "metal") lifeformBuildingBonus = 0.015 * this.getLevel(buildings.highEnergySmelting);
                    else if (resource == "crystal") lifeformBuildingBonus = 0.015 * this.getLevel(buildings.fusionPoweredProduction);
                    else if (resource == "deut") lifeformBuildingBonus = 0.01 * this.getLevel(buildings.fusionPoweredProduction);
                } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                    if (resource == "metal") lifeformBuildingBonus = 0.02 * this.getLevel(buildings.magmaForge);
                    else if (resource == "crystal") lifeformBuildingBonus = 0.02 * this.getLevel(buildings.crystalRefinery);
                    else if (resource == "deut") lifeformBuildingBonus = 0.02 * this.getLevel(buildings.deuteriumSynthesizer);
                } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                    if (resource == "deut") lifeformBuildingBonus = 0.02 * this.getLevel(buildings.deuteriumSynthesizer);
                }
            }

            let HoogwaardigeExtractoren = this.getEffectiveLifeformTechLevel("11202");
            lifeformTechBonus += 0.0006 * HoogwaardigeExtractoren;
            let MagmaPoweredProduction = this.getEffectiveLifeformTechLevel("12205")
            lifeformTechBonus += 0.0008 * MagmaPoweredProduction;
            let GeautomatiseerdeTransportlijnen = this.getEffectiveLifeformTechLevel("13206")
            lifeformTechBonus += 0.0006 * GeautomatiseerdeTransportlijnen;
            let VerbeterdeProductieTechnologien = this.getEffectiveLifeformTechLevel("11208")
            lifeformTechBonus += 0.0006 * VerbeterdeProductieTechnologien;
            let Psychoharmonisator = this.getEffectiveLifeformTechLevel("14212")
            lifeformTechBonus += 0.0006 * Psychoharmonisator;
            let ArtificialSwarmIntelligence = this.getEffectiveLifeformTechLevel("13213")
            lifeformTechBonus += 0.0006 * ArtificialSwarmIntelligence;

            if (resource == "metal") {
                let Dieptepeiling = this.getEffectiveLifeformTechLevel("12207")
                lifeformTechBonus += 0.0008 * Dieptepeiling;
                let VerhardeDiamantenBoorkoppen = this.getEffectiveLifeformTechLevel("12210")
                lifeformTechBonus += 0.0008 * VerhardeDiamantenBoorkoppen;
            }
            else if (resource == "crystal") {
                let AkoestischScannen = this.getEffectiveLifeformTechLevel("12202")
                lifeformTechBonus += 0.0008 * AkoestischScannen;
                let SeismischeMijntechnologie = this.getEffectiveLifeformTechLevel("12211")
                lifeformTechBonus += 0.0008 * SeismischeMijntechnologie;
            } else if (resource == "deut") {
                let HogeEnergiePompSystemen = this.getEffectiveLifeformTechLevel("12203")
                lifeformTechBonus += 0.0008 * HogeEnergiePompSystemen;
                let Katalysatortechnologie = this.getEffectiveLifeformTechLevel("13201")
                lifeformTechBonus += 0.0008 * Katalysatortechnologie;
                let Sulfideproces = this.getEffectiveLifeformTechLevel("14202")
                lifeformTechBonus += 0.0008 * Sulfideproces;
                let MagmaAangedrevenPompsystemen = this.getEffectiveLifeformTechLevel("12212")
                lifeformTechBonus += 0.0008 * MagmaAangedrevenPompsystemen;
            }

            lifeformBonus = lifeformBuildingBonus + lifeformTechBonus;
            //console.log(resource + ": " + verzamelaarBonus + " - " +  handelaarBonus + " - " + plasmaBonus + " - " + officerBonus + " - " + processorBonus + " - " + lifeformBuildingBonus + " - " + lifeformTechBonus);
        }
        return verzamelaarBonus + handelaarBonus + plasmaBonus + officerBonus + processorBonus + lifeformBonus;
    }

    getLevel(technologyLevel) {
        return parseInt(technologyLevel?.level ?? technologyLevel ?? 0);
    }

    getPrerequisites(upgradeType) {
        const upgradeRequirements = {
            'nanite': {
                'roboticsFactory': 10,
                'computer': 10,
            },
            'plasma': {
                'ion': 5,
                'laser': 10,
                'energy': 8,
            },
            'astro': {
                'impuls': 3,
                'spy': 4 - (this.json.player.technocrat ? (this.json.player.legerleiding ? 3 : 2) : 0),
                'energy': 1,
            },
            //human            
            'highEnergySmelting': {
                'researchCentre': 5,
                'residentialSector': 21,
                'biosphereFarm': 22,
            },
            'fusionPoweredProduction': {
                'academyOfSciences': 1,
                'residentialSector': 41,
                'biosphereFarm': 42,
            },
            'metropolis': {
                'academyOfSciences': 1,
                'residentialSector': 41,
                'biosphereFarm': 42,
                'fusionPoweredProduction': 1,
                'skyscraper': 6,
                'neuroCalibrationCentre': 1,
            },
            //rocktal
            'runeTechnologium': {
                'meditationEnclave': 21,
                'crystalFarm': 22,
            },
            'runeForge': {
                'meditationEnclave': 41,
                'crystalFarm': 41,
            },
            'magmaForge': {
                'runeTechnologium': 5,
                'meditationEnclave': 21,
                'crystalFarm': 22,
            },
            'megalith': {
                'runeForge': 1,
                'meditationEnclave': 41,
                'crystalFarm': 41,
            },
            'crystalRefinery': {
                'megalith': 1,
                'runeForge': 1,
                'meditationEnclave': 41,
                'crystalFarm': 41,
            },
            'deuteriumSynthesizer': {
                'megalith': 2,
                'runeForge': 1,
                'meditationEnclave': 41,
                'crystalFarm': 41,
            },
            'mineralResearchCentre': {
                'oriktorium': 1,
                'crystalRefinery': 6,
                'megalith': 1,
                'runeForge': 1,
                'meditationEnclave': 48,
                'crystalFarm': 49,
            },
            'oriktorium': {
                'meditationEnclave': 48,
                'crystalFarm': 49,
                'crystalRefinery': 5,
                'megalith': 1,
                'runeForge': 1,
            },
            //mecha
            'highPerformanceSynthesizer': {
                'microchipAssemblyLine': 2,
                'updateNetwork': 1,
                'assemblyLine': 40,
            },
        }

        return upgradeRequirements[upgradeType];
    }

    getPrerequisiteCosts(planet, upgradeType) {
        const requiredUpgrades = this.getPrerequisites(upgradeType);

        if (!requiredUpgrades) {
            return [0, 0, 0];
        }

        let costs = [0, 0, 0];

        for (const [building, level] of Object.entries(requiredUpgrades)) {
            const currentLevel = this.getLevel(this.json.player[building] || planet[building] || (planet.lifeforms?.buildings && planet.lifeforms?.buildings[building]));
            if (currentLevel < level) {
                for (let l = currentLevel; l < level; l++) {
                    costs = this.addArrayValues(costs, this.getCosts(planet, building, l));
                }
            }
        }

        return costs;
    }

    getPrerequisiteMSECosts(planet, upgradeType) {
        let costs = this.getPrerequisiteCosts(planet, upgradeType);
        return this.getMSEValue(costs);
    }

    addArrayValues(array1, array2){
        if(array1.length != array2.length) console.error("arrays are not the same length")

        let newArray = [];

        for(let i = 0; i < array1.length; i++){
            newArray.push(array1[i] + array2[i]);
        }

        return newArray;
    }

    subtractArrayValues(array1, array2){
        if(array1.length != array2.length) console.error("arrays are not the same length")

        let newArray = [];

        for(let i = 0; i < array1.length; i++){
            newArray.push(array1[i] - array2[i]);
        }

        return newArray;
    }

    multiplyArray(array1, value){
        let newArray = [];

        for(let i = 0; i < array1.length; i++){
            newArray.push(array1[i] * value);
        }

        return newArray;
    }

    divideArrayValues(array1, array2){
        if(array1.length != array2.length) console.error("arrays are not the same length")

        let newArray = [];

        for(let i = 0; i < array1.length; i++){
            newArray.push(array1[i] / array2[i]);
        }

        return newArray;
    }

    getPrerequisiteMSEProd(planet, upgradeType) {
        let metalProd = 0;

        const requiredUpgrades = this.getPrerequisites(upgradeType);

        if (!requiredUpgrades) {
            return 0;
        }

        for (const [building, level] of Object.entries(requiredUpgrades)) {
            const currentLevel = this.getLevel(planet.lifeforms.buildings[building]);
            if (currentLevel < level) {
                for (let l = currentLevel; l < level; l++) {
                    metalProd += this.getMSEProduction(planet, building, l);
                }
            }
        }

        return metalProd;
    }

    /**
     * Get upgrade time in hours
     * @param {*} planet planet where the upgrade takes place 
     * @param {*} upgradeType type of the upgrade
     * @param {*} level starting level of the upgrade
     * @returns upgrade time in hours
     */
    getUpgradeTime(planet, upgradeType, level) {
        if(level.toString().includes('-')){
            let levels = level.split('-');
            let first = parseInt(levels[0]) - 1;
            let last = parseInt(levels[1]) - 1;
            let totalTime = 0;
            for(let l = first; l <= last; l++){
                totalTime += this.getUpgradeTime(planet, upgradeType, l);
            }
            return totalTime;
        }

        if (planet == undefined) {
            let igon = parseInt(this.json.player.igon);
            let researchLabs = this.json.player.planets.map(p => p.researchlab).sort((a, b) => b - a);
            let totalResearchLevel = 0; //TODO: Get total research level
            for (let i = 0; i < igon + 1 && i < researchLabs.length; i++) totalResearchLevel += this.getLevel(researchLabs[i]);
            let researchSpeed = (totalResearchLevel + 1) * parseInt(this.json.settings.globalResearchSpeedFactor) * (1 + (this.json.player.playerClass == PLAYER_CLASS_EXPLORER ? parseFloat(this.json.settings.explorerResearchSpeedFactor) : 0));
            let base, incFactor;

            if (upgradeType == "plasma") base = 6000; incFactor = 2;
            if (upgradeType == "astro") base = 12000; incFactor = 1.75;
            return base * Math.pow(incFactor, level) / (1000 * researchSpeed)
        } else {
            let buildSpeed = (this.getLevel(planet.roboticsFactory) + 1) * Math.pow(2, this.getLevel(planet.nanite)) * this.json.settings.economySpeed;
            let base = 0, incFactor = 0, factor = 0;

            if (upgradeType == "metal") { base = 75; incFactor = 1.5; factor = 2 / (7 - Math.min(5, level)); }
            else if (upgradeType == "crystal") { base = 72; incFactor = 1.6; factor = 2 / (7 - Math.min(5, level)); }
            else if (upgradeType == "deut") { base = 300; incFactor = 1.5; factor = 2 / (7 - Math.min(5, level)); }

            else if (upgradeType == "roboticsFactory") { base = 520; incFactor = 2; factor = 2 / (7 - Math.min(5, level)); }
            else if (upgradeType == "shipyard") { base = 600; incFactor = 2; factor = 2 / (7 - Math.min(5, level)); }
            else if (upgradeType == "researchlab") { base = 600; incFactor = 2; factor = 2 / (7 - Math.min(5, level)); }
            else if (upgradeType == "rocketSilo") { base = 40000; incFactor = 2; factor = 2 / (7 - Math.min(5, level)); }
            else if (upgradeType == "nanite") { base = 1500000; incFactor = 2; factor = 1; }

            else if (this.json.settings.lifeforms) {
                if (upgradeType == "residentialSector") { base = 40; incFactor = 1.21; }
                else if (upgradeType == "biosphereFarm") { base = 40; incFactor = 1.25; }
                else if (upgradeType == "academyOfSciences") { base = 16000; incFactor = 1.6; }
                else if (upgradeType == "neuroCalibrationCentre") { base = 64000; incFactor = 1.7; }
                

                else if (upgradeType == "magmaForge") { base = 2000; incFactor = 1.3; }
                else if (upgradeType == "crystalRefinery") { base = 40000; incFactor = 1.2; }
                else if (upgradeType == "deuteriumSynthesizer") { base = 52000; incFactor = 1.2; }
                else if (upgradeType == "mineralResearchCentre") { base = 90000; incFactor = 1.3; }
                else if (upgradeType == "runeTechnologium") { base = 16000; incFactor = 1.25; }

                else if (upgradeType == "researchCentre") { base = 16000; incFactor = 1.25; }
                else if (upgradeType == "highEnergySmelting") { base = 2000; incFactor = 1.3; }
                else if (upgradeType == "fusionPoweredProduction") { base = 28000; incFactor = 1.2; }

                else if (upgradeType == "roboticsResearchCentre") { base = 16000; incFactor = 1.25; }
                else if (upgradeType == "highPerformanceSynthesizer") { base = 52000; incFactor = 1.2; }

                else if (upgradeType == "vortexChamber") { base = 16000; incFactor = 1.25; }

                else if (upgradeType == "11202") { base = 2000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "11208") { base = 6000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "11217") { base = 11000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }

                else if (upgradeType == "12202") { base = 2000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "12203") { base = 2500; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "12205") { base = 4500; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "12207") { base = 5500; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "12209") { base = 6500; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "12210") { base = 7000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "12211") { base = 7500; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "12212") { base = 8000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "12213") { base = 8500; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "12218") { base = 11000; incFactor = 1.4; buildSpeed = this.json.settings.economySpeed; }

                else if (upgradeType == "13201") { base = 1000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "13206") { base = 5000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "13213") { base = 8500; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }

                else if (upgradeType == "14202") { base = 2000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "14204") { base = 3500; incFactor = 1.4; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "14205") { base = 4500; incFactor = 1.4; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "14211") { base = 7500; incFactor = 1.4; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "14212") { base = 8000; incFactor = 1.3; buildSpeed = this.json.settings.economySpeed; }
                else if (upgradeType == "14218") { base = 11000; incFactor = 1.4; buildSpeed = this.json.settings.economySpeed; }

                return level * base * Math.pow(incFactor, level) / (3600 * buildSpeed);
            }

            return base * Math.pow(incFactor, level) / (2500 * buildSpeed) * factor;
        }
    }

    getMSEValue(resources){
        let ratio = this.json.player.ratio;
        return parseFloat(resources[0]) + ratio[0] / ratio[1] * parseFloat(resources[1]) + ratio[0] / ratio[2] * parseFloat(resources[2]);
    }

    getMSECosts(planet, upgradeType, level){
        let costs = this.getCosts(planet, upgradeType, level);
        return this.getMSEValue(costs);
    }

    /**
     * Returns the cost calculated in metal of the given upgrade.
     *
     * @param {planet} planet The corresponding planet.
     * @param {string} upgradeType The building or technology to upgrade.
     * @param {number} level The level the building is before upgrading.
     * @return {number} the cost calculated in MSE.
     */
    getCosts(planet, upgradeType, level) {
        level = this.getLevel(level);
        let metalCost = 0;
        let crystalCost = 0;
        let deutCost = 0;
        let resProdBuild = false, rockTalBuild = false, techUpgrade = false;
        if (upgradeType === "metal") {
            metalCost = 60 * Math.pow(1.5, level);
            crystalCost = 15 * Math.pow(1.5, level);
            resProdBuild = true;
        } else if (upgradeType === "crystal") {
            metalCost = 48 * Math.pow(1.6, level);
            crystalCost = 24 * Math.pow(1.6, level);
            resProdBuild = true;
        } else if (upgradeType === "deut") {
            metalCost = 225 * Math.pow(1.5, level);
            crystalCost = 75 * Math.pow(1.5, level);
            resProdBuild = true;
        } else if (upgradeType === "roboticsFactory") {
            metalCost = 400 * Math.pow(2, level);
            crystalCost = 120 * Math.pow(2, level);
            deutCost = 200 * Math.pow(2, level);
        } else if (upgradeType === "nanite") {
            metalCost = 1000000 * Math.pow(2, level);
            crystalCost = 500000 * Math.pow(2, level);
            deutCost = 100000 * Math.pow(2, level);
        } else if (upgradeType === "ion") {
            metalCost = 1000 * Math.pow(2, level);
            crystalCost = 300 * Math.pow(2, level);
            deutCost = 100 * Math.pow(2, level);
        } else if (upgradeType === "laser") {
            metalCost = 200 * Math.pow(2, level);
            crystalCost = 100 * Math.pow(2, level);
        } else if (upgradeType === "energy") {
            crystalCost = 800 * Math.pow(2, level);
            deutCost = 400 * Math.pow(2, level);
        } else if (upgradeType === "computer") {
            crystalCost = 400 * Math.pow(2, level);
            deutCost = 600 * Math.pow(2, level);
        } else if (upgradeType === "impuls") {
            metalCost = 2000 * Math.pow(2, level);
            crystalCost = 4000 * Math.pow(2, level);
            deutCost = 600 * Math.pow(2, level);
        } else if (upgradeType === "spy") {
            metalCost = 200 * Math.pow(2, level);
            crystalCost = 1000 * Math.pow(2, level);
            deutCost = 200 * Math.pow(2, level);
        } else if (upgradeType === "plasma") {
            let factor = 1;
            if (this.json.settings.lifeforms) {
                let verbeterdeStellaratorKorting = 0;
                this.json.player.planets.forEach(planet => {
                    let tech = planet.lifeforms.techs?.find(t => t.id == "12209");
                    if (tech) verbeterdeStellaratorKorting += this.getLevel(tech.level) * .0015 * (1 + this.getLifeformBonus(planet));
                });
                factor -= Math.min(verbeterdeStellaratorKorting, 0.5);
            }
            metalCost = 2000 * Math.pow(2, level) * factor;
            crystalCost = 4000 * Math.pow(2, level) * factor;
            deutCost = 1000 * Math.pow(2, level) * factor;
        } else if (upgradeType === "astro") {
            metalCost = 4000 * Math.pow(1.75, level);
            crystalCost = 8000 * Math.pow(1.75, level);
            deutCost = 4000 * Math.pow(1.75, level);
        }
        // HUMANS
        else if (upgradeType === "residentialSector") {
            metalCost = 7 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 2 * Math.pow(1.2, level) * (level + 1);
            resProdBuild = true;
        } else if (upgradeType === "biosphereFarm") {
            metalCost = 5 * Math.pow(1.23, level) * (level + 1);
            crystalCost = 2 * Math.pow(1.23, level) * (level + 1);
            resProdBuild = true;
        } else if (upgradeType === "researchCentre") {
            metalCost = 20000 * Math.pow(1.3, level) * (level + 1);
            crystalCost = 25000 * Math.pow(1.3, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.3, level) * (level + 1);
        } else if (upgradeType === "academyOfSciences") {
            metalCost = 5000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 3200 * Math.pow(1.7, level) * (level + 1);
            deutCost = 1500 * Math.pow(1.7, level) * (level + 1);
        } else if (upgradeType === "neuroCalibrationCentre") {
            metalCost = 50000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.7, level) * (level + 1);
            deutCost = 50000 * Math.pow(1.7, level) * (level + 1);
        } else if (upgradeType === "highEnergySmelting") {
            metalCost = 9000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 6000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 3000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "foodSilo") {
            metalCost = 25000 * Math.pow(1.09, level) * (level + 1);
            crystalCost = 13000 * Math.pow(1.09, level) * (level + 1);
            deutCost = 7000 * Math.pow(1.09, level) * (level + 1);
        } else if (upgradeType === "fusionPoweredProduction") {
            metalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 25000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 15000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "skyscraper") {
            metalCost = 75000 * Math.pow(1.09, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.09, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.09, level) * (level + 1);
        } else if (upgradeType === "biotechLab") {
            metalCost = 150000 * Math.pow(1.12, level) * (level + 1);
            crystalCost = 30000 * Math.pow(1.12, level) * (level + 1);
            deutCost = 15000 * Math.pow(1.12, level) * (level + 1);
        } else if (upgradeType === "metropolis") {
            metalCost = 80000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 35000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 60000 * Math.pow(1.5, level) * (level + 1);
        }
        //ROCK'TAL
        else if (upgradeType === "meditationEnclave") {
            metalCost = 9 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 3 * Math.pow(1.2, level) * (level + 1);
            rockTalBuild = true;
            resProdBuild = true;
        } else if (upgradeType === "crystalFarm") {
            metalCost = 7 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 2 * Math.pow(1.2, level) * (level + 1);
            rockTalBuild = true;
            resProdBuild = true;
        } else if (upgradeType === "runeTechnologium") {
            metalCost = 40000 * Math.pow(1.3, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.3, level) * (level + 1);
            deutCost = 15000 * Math.pow(1.3, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "runeForge") {
            metalCost = 5000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 3800 * Math.pow(1.7, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.7, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "oriktorium") {
            metalCost = 50000 * Math.pow(1.65, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.65, level) * (level + 1);
            deutCost = 50000 * Math.pow(1.65, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "magmaForge") {
            metalCost = 10000 * Math.pow(1.4, level) * (level + 1);
            crystalCost = 8000 * Math.pow(1.4, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.4, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "megalith") {
            metalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 35000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 15000 * Math.pow(1.5, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "crystalRefinery") {
            metalCost = 85000 * Math.pow(1.4, level) * (level + 1);
            crystalCost = 44000 * Math.pow(1.4, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.4, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "deuteriumSynthesizer") {
            metalCost = 120000 * Math.pow(1.4, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.4, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.4, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "mineralResearchCentre") {
            metalCost = 250000 * Math.pow(1.8, level) * (level + 1);
            crystalCost = 150000 * Math.pow(1.8, level) * (level + 1);
            deutCost = 100000 * Math.pow(1.8, level) * (level + 1);
            rockTalBuild = true;
        }
        //MECHAS
        else if (upgradeType === "assemblyLine") {
            metalCost = 6 * Math.pow(1.21, level) * (level + 1);
            crystalCost = 2 * Math.pow(1.21, level) * (level + 1);
        } else if (upgradeType === "fusionCellFactory") {
            metalCost = 5 * Math.pow(1.18, level) * (level + 1);
            crystalCost = 2 * Math.pow(1.18, level) * (level + 1);
        } else if (upgradeType === "roboticsResearchCentre") {
            metalCost = 30000 * Math.pow(1.3, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.3, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.3, level) * (level + 1);
        } else if (upgradeType === "updateNetwork") {
            metalCost = 5000 * Math.pow(1.8, level) * (level + 1);
            crystalCost = 3800 * Math.pow(1.8, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.8, level) * (level + 1);
        } else if (upgradeType === "quantumComputerCentre") {
            metalCost = 50000 * Math.pow(1.8, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.8, level) * (level + 1);
            deutCost = 50000 * Math.pow(1.8, level) * (level + 1);
        } else if (upgradeType === "highPerformanceTransformer") {
            metalCost = 35000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 15000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "highPerformanceSynthesizer") {
            metalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "microchipAssemblyLine") {
            metalCost = 50000 * Math.pow(1.07, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.07, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.07, level) * (level + 1);
        } else if (upgradeType === "productionAssemblyHall") {
            metalCost = 100000 * Math.pow(1.14, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.14, level) * (level + 1);
            deutCost = 3000 * Math.pow(1.14, level) * (level + 1);
        } else if (upgradeType === "chipMassProduction") {
            metalCost = 55000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.5, level) * (level + 1);
        }
        //Kaelesh
        else if (upgradeType === "sanctuary") {
            metalCost = 4 * Math.pow(1.21, level) * (level + 1);
            crystalCost = 3 * Math.pow(1.21, level) * (level + 1);
        } else if (upgradeType === "antimatterCondenser") {
            metalCost = 6 * Math.pow(1.21, level) * (level + 1);
            crystalCost = 3 * Math.pow(1.21, level) * (level + 1);
        } else if (upgradeType === "vortexChamber") {
            metalCost = 20000 * Math.pow(1.3, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.3, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.3, level) * (level + 1);
        } else if (upgradeType === "hallsOfRealisation") {
            metalCost = 7500 * Math.pow(1.8, level) * (level + 1);
            crystalCost = 5000 * Math.pow(1.8, level) * (level + 1);
            deutCost = 800 * Math.pow(1.8, level) * (level + 1);
        } else if (upgradeType === "forumOfTranscendence") {
            metalCost = 60000 * Math.pow(1.8, level) * (level + 1);
            crystalCost = 30000 * Math.pow(1.8, level) * (level + 1);
            deutCost = 50000 * Math.pow(1.8, level) * (level + 1);
        } else if (upgradeType === "antimatterConvector") {
            metalCost = 8500 * Math.pow(1.25, level) * (level + 1);
            crystalCost = 5000 * Math.pow(1.25, level) * (level + 1);
            deutCost = 3000 * Math.pow(1.25, level) * (level + 1);
        } else if (upgradeType === "chrysalisAccelerator") {
            metalCost = 75000 * Math.pow(1.05, level) * (level + 1);
            crystalCost = 25000 * Math.pow(1.05, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.05, level) * (level + 1);
        } else if (upgradeType === "psionicModulator") {
            metalCost = 150000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 30000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.5, level) * (level + 1);
        }

        //LIFEFORM TECHS
        else if (upgradeType === "11202") {
            metalCost = 7000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "12202") {
            metalCost = 7500 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 12500 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "12203") {
            metalCost = 15000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "12205") {
            metalCost = 25000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "13201") {
            metalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 6000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "13206") {
            metalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "14202") {
            metalCost = 7500 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 12500 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "14204") {
            metalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 15000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 7500 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "14205") {
            metalCost = 25000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        }

        //LIFEFORMTECHS T2
        else if (upgradeType === "12207") {
            metalCost = 70000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "12210") {
            metalCost = 85000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 35000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "11208") {
            metalCost = 80000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType == "12209") {
            metalCost = 75000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 55000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "14211") {
            metalCost = 120000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 30000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "12211") {
            metalCost = 120000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 30000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "14212") {
            metalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "12212") {
            metalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        }

        //LIFEFORMTECHS T3
        else if (upgradeType === "13213") {
            metalCost = 200000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 100000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "12213") {
            metalCost = 200000 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 100000 * Math.pow(1.2, level) * (level + 1);
            deutCost = 100000 * Math.pow(1.2, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "11217") {
            metalCost = 300000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 180000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 120000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "14218") {
            metalCost = 300000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 180000 * Math.pow(1.7, level) * (level + 1);
            deutCost = 120000 * Math.pow(1.7, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "12218") {
            metalCost = 300000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 180000 * Math.pow(1.7, level) * (level + 1);
            deutCost = 120000 * Math.pow(1.7, level) * (level + 1);
            techUpgrade = true;
        }


        if (techUpgrade) {
            let factor = 1;
            switch (planet.lifeforms.lifeformClass) {
                case LIFEFORM_CLASS_MENSEN:
                    const researchCentre = this.getLevel(planet.lifeforms.buildings.researchCentre);
                    if (researchCentre > 1) {
                        factor -= researchCentre * 0.005;
                    }
                    break;
                case LIFEFORM_CLASS_ROCKTAL:
                    const runeTechnologium = this.getLevel(planet.lifeforms.buildings.runeTechnologium);
                    if (runeTechnologium > 1) {
                        factor -= runeTechnologium * 0.005;
                    }
                    break;
                case LIFEFORM_CLASS_MECHA:
                    const roboticsResearchCentre = this.getLevel(planet.lifeforms.buildings.roboticsResearchCentre);
                    if (roboticsResearchCentre > 1) {
                        factor -= planet.lifeforms.buildings.roboticsResearchCentre * 0.0025;
                    }
                    break;
                case LIFEFORM_CLASS_KAELESH:
                    const vortexChamber = this.getLevel(planet.lifeforms.buildings.vortexChamber);
                    if (vortexChamber > 1) {
                        factor -= planet.lifeforms.buildings.vortexChamber * 0.0025;
                    }
                    break;
            }

            metalCost *= factor;
            crystalCost *= factor;
            deutCost *= factor;
            //            console.log(this.getBigNumber(metalCost) + " / " + this.getBigNumber(crystalCost) + " / " + this.getBigNumber(deutCost));
        }

        if (planet && this.json.settings.lifeforms && planet.lifeforms?.lifeformClass === LIFEFORM_CLASS_ROCKTAL) {
            let factor = 1;
            if (planet.lifeforms.buildings) {
                if (rockTalBuild) factor -= 0.01 * this.getLevel(planet.lifeforms.buildings.megalith);
                if (resProdBuild) factor -= 0.005 * this.getLevel(planet.lifeforms.buildings.mineralResearchCentre);
            }
            metalCost *= factor;
            crystalCost *= factor;
            deutCost *= factor;
        }

        return [metalCost, crystalCost, deutCost];
    }

    /**
     * 
     * @param {planet} planet 
     * @param {string} productionType 
     * @param {number} level 
     * @returns the hourly mse production of the given type at the given level
     */
    getMSEProduction(planet, productionType, level) {
        let ratio = this.json.player.ratio ? this.json.player.ratio : [3, 2, 1];
        let metalProd = 0;
        let crystalProd = 0;
        let deutProd = 0;
        if (productionType === "metal") {
            metalProd = (30 + this.getRawProduction(planet, productionType, level) * (1 + this.getBonus(planet, productionType))) * this.json.settings.economySpeed * this.getFactor(planet, productionType);
        } else if (productionType === "crystal") {
            crystalProd = (15 + this.getRawProduction(planet, productionType, level) * (1 + this.getBonus(planet, productionType))) * this.json.settings.economySpeed * this.getFactor(planet, productionType);
        } else if (productionType === "deut") {
            deutProd = (this.getRawProduction(planet, productionType, level) * (1 + this.getBonus(planet, productionType))) * this.json.settings.economySpeed;
        } else if (productionType === "plasma") {
            this.json.player.planets.forEach(p => {
                metalProd += this.getRawProduction(p, "metal", this.getLevel(p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += this.getRawProduction(p, "crystal", this.getLevel(p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += this.getRawProduction(p, "deut", this.getLevel(p.deut)) * this.json.settings.economySpeed;
            });
            metalProd *= 0.01;
            crystalProd *= 0.0066;
            deutProd *= 0.0033;
        } else if (productionType === "astro") {
            let amountNewPlanets = level;
            let planets = this.copyArray(this.json.player.planets);
            for (let x = 0; x < amountNewPlanets; x++) {
                planets.push(planet);
            }

            //upgrade previous planets with lifeforms boni
            this.json.player.planets.forEach(p => {
                //console.log(p);
                //console.log(this.getBonus(p, "metal", planets));
                metalProd += this.getRawProduction(p, "metal", p.metal) * (this.getBonus(p, "metal", planets) - this.getBonus(p, "metal", this.json.player.planets)) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
                //console.log(metalProd);
                crystalProd += this.getRawProduction(p, "crystal", p.crystal) * (this.getBonus(p, "crystal", planets) - this.getBonus(p, "crystal", this.json.player.planets)) * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
                deutProd += this.getRawProduction(p, "metal", p.metal) * (this.getBonus(p, "deut", planets) - this.getBonus(p, "deut", this.json.player.planets)) * this.json.settings.economySpeed;
            });

            //new planet mines with new boni
            metalProd += amountNewPlanets * (30 + this.getRawProduction(planet, "metal", planet.metal) * (1 + this.getBonus(planet, "metal", planets))) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
            crystalProd += amountNewPlanets * (15 + this.getRawProduction(planet, "crystal", planet.crystal) * (1 + this.getBonus(planet, "crystal", planets))) * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
            deutProd += amountNewPlanets * (this.getRawProduction(planet, "deut", planet.deut) * (1 + this.getBonus(planet, "deut", planets))) * this.json.settings.economySpeed;
        } else if (productionType === "highEnergySmelting") {
            metalProd = 0.015 * this.getRawProduction(planet, "metal", planet.metal) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
        } else if (productionType === "fusionPoweredProduction") {
            crystalProd = 0.015 * this.getRawProduction(planet, "crystal", planet.crystal) * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
            deutProd = 0.01 * this.getRawProduction(planet, "deut", planet.deut) * this.json.settings.economySpeed;
        } else if (productionType === "magmaForge") {
            metalProd = 0.02 * this.getRawProduction(planet, "metal", planet.metal) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
        } else if (productionType === "crystalRefinery") {
            crystalProd = 0.02 * this.getRawProduction(planet, "crystal", planet.crystal) * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
        } else if (productionType === "deuteriumSynthesizer") {
            deutProd = 0.02 * this.getRawProduction(planet, "deut", planet.deut) * this.json.settings.economySpeed;
        } else if (productionType === "highPerformanceSynthesizer") {
            deutProd = 0.02 * this.getRawProduction(planet, "deut", planet.deut) * this.json.settings.economySpeed;
        } else if (productionType === "metropolis") {
            metalProd = 0.005 * this.getPlanetaryLifeformTechMSEProduction(planet);
        } else if (productionType === "chipMassProduction") {
            metalProd = 0.003 * this.getPlanetaryLifeformTechMSEProduction(planet);
        } else if (productionType === "highPerformanceTransformer") {
            metalProd = 0.003 * this.getPlanetaryLifeformTechMSEProduction(planet);
        }
        //LIFEFORM TECHS
        else if (productionType == "11202") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType == "12202") {
            this.json.player.planets.forEach(p => {
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType == "12203") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType == "12205") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformBonus(planet));
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformBonus(planet));
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType == "13201") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType == "13206") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType == "14202") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType == "14204") {
            metalProd = 0.002 * (1 + this.calcExpoClassBoosterBonus()) * this.calcBaseExpoShipMseProd() * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformBonus(planet));
        } else if (productionType == "14205") {
            metalProd = 0.002 * (1 + this.calcExpoClassBoosterBonus()) * this.calcBaseExpoResMseProd() * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformBonus(planet));
        }

        //LIFEFORMTECHS T2
        else if (productionType === "12207") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType === "12210") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType === "11208") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType === "14211") {
            metalProd = 0.002 * (1 + this.calcExpoClassBoosterBonus()) * this.calcBaseExpoResMseProd() * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformBonus(planet));
        } else if (productionType === "12211") {
            this.json.player.planets.forEach(p => {
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType === "14212") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType === "12212") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        }

        //LIFEFORMTECHS T3
        else if (productionType === "13213") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformBonus(planet));
            });
        } else if (productionType === "12213") {
            //TODO
            return 0;
        } else if (productionType === "14218") {
            if (this.json.player.playerClass === PLAYER_CLASS_EXPLORER) {
                metalProd = 0.002 * (this.calcExpoResMseProd() + this.calcExpoShipMseProd()) * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformBonus(planet));
            }
        } else if (productionType === "12218") {
            if (this.json.player.playerClass === PLAYER_CLASS_COLLECTOR) {
                metalProd = 0.002 * 0.25 * this.getTotalHourlyRawMseMineIncome * (1 + this.getLifeformBonus(planet));
            }
        } else {
            return 0;
        }

        return (metalProd + crystalProd * ratio[0] / ratio[1] + deutProd * ratio[0] / ratio[2]);
    }

    getTotalHourlyRawMseMineIncome() {
        let metalProd = 0, crystalProd = 0, deutProd = 0;
        this.json.player.planets.forEach(p => {
            metalProd += (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProd += (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProd += (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
        });

        let ratio = this.json.player.ratio ? this.json.player.ratio : [3, 2, 1];
        return metalProd + crystalProd / ratio[1] * ratio[0] + deutProd / ratio[2] * ratio[0];
    }

    getPlanetaryLifeformTechMSEProduction(planet) {
        let prod = 0;
        let lfLevelBonus = 1 + this.getLifeformBonus(planet);
        planet.lifeforms.techs.forEach(tech => {
            let level = this.getLevel(tech.level);
            prod += this.getMSEProduction(planet, tech.id, level) / lfLevelBonus * level;
        });
        return prod;
    }

    getAmountOfExpeditionsPerDay() {
        return Math.round(this.getAmountOfExpeditionSlots() * this.getExpoRoundsPerDay());
    }
    
    getExpoRoundsPerDay(){
        if(!ExpoRounsPerDay){
            if(parseInt(this.json.player.exporounds) < 0){
                let expeditionData = GetExpeditionData(UNIVERSE);
                if(!expeditionData) 
                    return 0;
                else{
                    let time = new Date().getTime() - new Date(expeditionData.Startdate).getTime();
                    const millisecondsPerDay = 24 * 60 * 60 * 1000;
                    let days = time / millisecondsPerDay;
                    let amount = 0;
                    for (var key in expeditionData.Expos) {
                        if(key != NaN){
                            var value = expeditionData.Expos[key];
                            amount += value.length / parseInt(key) / days;    
                        }
                    }
                    ExpoRounsPerDay = amount;
                }
            } else {
                ExpoRounsPerDay = parseInt(this.json.player.exporounds);
            }
            
        }
        return ExpoRounsPerDay;   
    }

    getAmountOfExpeditionSlots() {
        const astroSlots = Math.floor(Math.sqrt(this.getLevel(this.json.player.astro)));
        const explorerSlots = this.json.player.playerClass == PLAYER_CLASS_EXPLORER ? 2 : 0;
        const admiralSlots = this.json.player.admiral ? 1 : 0;
        const bonusSlots = this.getAmountOfExpeditionBoosterSlots();
        return astroSlots + explorerSlots + admiralSlots + bonusSlots;
    }

    getAmountOfExpeditionBoosterSlots(){
        let boosters = this.json.player.boosters;
        const currentTime = GetCurrentUnixTimeInSeconds();
        let slots = 0;
        for(let booster in boosters){
            if(booster.includes("Expeditievakken"))
            if(boosters[booster] > currentTime){
                switch (booster.toString().split(' ')[0]) {
                    case "Bronzen":
                        slots += 1;
                        break;
                    case "Zilveren":
                        slots += 2;
                        break;
                    case "Gouden":
                        slots += 3;
                        break;
                    default:
                        console.error("Expeditievakken type '" + booster + "' niet gevonden.");
                        break;
                }
            }
        }
        return slots;
    }

    getFactor(planet, productionType) {
        const pos = parseInt(planet.coords.split(":")[2], 10);
        switch (productionType) {
            case "metal":
                if (pos === 8) return 1.35;
                if (pos === 7 || pos === 9) return 1.23;
                if (pos === 6 || pos === 10) return 1.1;
                return 1;
            case "crystal":
                if (pos === 1) return 1.4;
                if (pos === 2) return 1.3;
                if (pos === 3) return 1.2;
                return 1;
            default:
                return 1;
        }
    }

    /**
     * 
     * @param {planet} planet 
     * @param {metal/crystal/deut} productionType 
     * @param {number} level 
     * @returns the hourly production of productionType at planet with the given level
     */
    getRawProduction(planet, productionType, level) {
        level = this.getLevel(level);
        if (productionType === "metal") {
            return 30 * level * Math.pow(1.1, level);
        } else if (productionType === "crystal") {
            return 20 * level * Math.pow(1.1, level);
        } else if (productionType === "deut") {
            const maxTemp = planet.maxTemp || 50;
            return 10 * level * Math.pow(1.1, level) * (1.36 - 0.004 * (maxTemp - 20));
        }
        return 0;
    }

    getExtraMSEProduction(planet, productionType, level) {
        level = this.getLevel(level);
        return this.getMSEProduction(planet, productionType, level + 1) - this.getMSEProduction(planet, productionType, level);
    }

    createSettingsButton() {
        const container = document.createElement("li");

        const btn = document.createElement("a");
        btn.classList.add("menubutton");
        btn.setAttribute("target", "_self");

        const label = document.createElement("span");
        label.classList.add("textlabel");
        label.innerHTML = "Calculator Settings";
        btn.appendChild(label);

        btn.addEventListener("click", () => this.openSettings());
        container.appendChild(btn);

        const div = document.querySelector("#menuTable");
        div.appendChild(container);
    }

    newPlanet(coords, name) {
        const planet = {
            coords,
            name,
            metal: 0,
            crystal: 0,
            deut: 0,
            solar: 0,
            fusion: 0,
            satellite: 0,
            crawlers: 0,
            roboticsFactory: 0,
            nanite: 0,
            shipyard: 0,
            researchlab: 0,
            missileSilo: 0,
            maxTemp: GetAverageTemp(coords)
        };

        if (this.json.settings.lifeforms) {
            planet.lifeforms = {};
        }

        return planet;
    }

    remakePlanet(planet) {
        const newPlanet = {
            coords: planet.coords,
            name: planet.name,
            metal: planet.metal || 0,
            crystal: planet.crystal || 0,
            deut: planet.deut || 0,
            solar: planet.solar || 0,
            fusion: planet.fusion || 0,
            satellite: planet.satellite || 0,
            crawlers: planet.crawlers || 0,
            roboticsFactory: planet.roboticsFactory || 0,
            nanite: planet.nanite || 0,
            shipyard: planet.shipyard || 0,
            researchlab: planet.researchlab || 0,
            missileSilo: planet.missileSilo || 0,
            maxTemp: planet.maxTemp || GetAverageTemp(planet.coords),
            resources: planet.resources || {}
        };

        if (this.json.settings.lifeforms) {
            newPlanet.lifeforms = planet.lifeforms || {};
        }

        return newPlanet;
    }

    checkBoosters() {
        console.log("Checking boosters");

        const panelElement = document.querySelector('.panel.activePage');
   
        const boosters = panelElement.querySelectorAll('.js_duration');
        if(!this.json.player.boosters) this.json.player.boosters = {};
        
        const currentTimestampInSeconds = GetCurrentUnixTimeInSeconds();

        let curBoosters = this.json.player.boosters;

        for (let variable in curBoosters) {
            if(curBoosters[variable] <= currentTimestampInSeconds) delete curBoosters[variable];
        }

        boosters.forEach((durationElement, index) => {
            const remainingTime = durationElement.innerHTML;
            const imageName = panelElement.querySelectorAll('img')[index].getAttribute('alt');

            const remainingTimeElements = remainingTime.split(' ');
            let remainingSeconds = 0;
            remainingTimeElements.forEach((timeElement, index2) => {
                const timeElementChar = timeElement.charAt(timeElement.length - 1);
                const timeNumber = timeElement.slice(0, -1);
                switch (timeElementChar) {
                    case 'w':
                        remainingSeconds += timeNumber * 7 * 24 * 60 * 60;
                        break;
                    case 'd':
                        remainingSeconds += timeNumber * 24 * 60 * 60;
                        break;
                    case 'u':
                        remainingSeconds += timeNumber * 60 * 60;
                        break;
                    case 'm':
                        remainingSeconds += timeNumber * 60;
                        break;
                    case 's':
                        remainingSeconds += timeNumber;
                        break;
                    default:
                        console.error("timeElementChar '" + timeElementChar + "' not recognised");
                        break;
                }
                this.json.player.boosters[imageName] = currentTimestampInSeconds + remainingSeconds;
            })
        });
    }

    checkPlanets() {
        console.log("checking planets");
        let changed = false;
        const planetList = document.querySelectorAll(".smallplanet");
        const newPlanetList = [];

        planetList.forEach((planet) => {
            const coords = planet.querySelector(".planet-koords");
            if (coords) {
                const name = planet.querySelector(".planet-name").textContent;
                const trimmedCoords = this.trimCoords(coords);
                const foundPlanet = this.json.player.planets.find(p => p.coords == trimmedCoords);

                if (!foundPlanet) {
                    changed = true;
                    newPlanetList.push(this.newPlanet(trimmedCoords, name));
                } else {
                    foundPlanet.name = name;

                    if (Object.keys(foundPlanet).length !== Object.keys(this.newPlanet(trimmedCoords, name)).length) {
                        changed = true;
                        newPlanetList.push(this.remakePlanet(foundPlanet));
                    } else {
                        newPlanetList.push(foundPlanet);
                    }
                }
            }
        });



        if (planetList.length < this.json.player.planets.length) {
            changed = true;
        }

        if (changed) {
            this.json.player.planets = newPlanetList;
            this.saveData();
        }
    }

    checkStaff() {
        this.json.player.geologist = document.querySelector(".geologist.on") !== null;
        this.json.player.engineer = document.querySelector(".engineer.on") !== null;
        this.json.player.technocrat = document.querySelector(".technocrat.on") !== null;
        this.json.player.admiral = document.querySelector(".admiral.on") !== null;
        this.json.player.commander = document.querySelector(".commander.on") !== null;
        this.json.player.legerleiding = this.json.player.geologist && this.json.player.engineer && this.json.player.commander && this.json.player.admiral && this.json.player.technocrat;
    }

    createDOM(element, options, content) {
        let e = document.createElement(element);
        for (var key in options) {
            e.setAttribute(key, options[key]);
        }
        if (content || content == 0) e.html(content);
        return e;
    }

    createAmortizationWithPrerequisite(planet, upgradeType, level, amorType, amorColor, id) {
        if (level.level) level = level.level;
        const startingLevel = parseInt(level);
        let mseProd = this.getMSEProduction(planet, upgradeType, startingLevel);
        if (mseProd <= 0) {
            return {
                coords: planet?.coords ?? "account",
                name: planet?.name ?? "account",
                technology: upgradeType,
                level: startingLevel + 1,
                amortization: Infinity,
                costs: [Infinity, Infinity, Infinity],
                msecost: Infinity,
                type: amorType,
                color: amorColor,
                id: id,
            };
        }
        let preCosts = this.getPrerequisiteCosts(planet, upgradeType);
        let costs = this.addArrayValues(this.getCosts(planet, upgradeType, startingLevel), preCosts);
        let mseCosts = this.getMSEValue(costs);

        let amortization = mseCosts / mseProd;
        let newLevel = startingLevel + 1;
        let x = 1;
        while (this.getMSECosts(planet, upgradeType, startingLevel + x) / this.getMSEProduction(planet, upgradeType, startingLevel + x) < amortization) {
            costs = this.addArrayValues(costs, this.getCosts(planet, upgradeType, startingLevel + x));
            mseCosts = this.getMSEValue(costs);
            mseProd += this.getMSEProduction(planet, upgradeType, startingLevel + x);
            amortization = mseCosts / mseProd;
            x++;
        }

        if (x > 1) {
            newLevel = `${startingLevel + 1}-${startingLevel + x}`;
        }

        return {
            coords: planet?.coords ?? "account",
            name: planet?.name ?? "account",
            technology: upgradeType,
            level: newLevel,
            amortization: (amortization + this.getUpgradeTime(planet, upgradeType, startingLevel + x)) / 24,
            costs: costs,
            msecost: mseCosts,
            type: amorType,
            color: amorColor,
            id: id,
        };
    }

    // createAmortizationWithPrerequisite(planet, upgradeType, level, amorType){
    //     level = parseInt(level.level ? level.level : level);

    //     let mseProd = this.getMSEProduction(planet, upgradeType, level);
    //     const preMseCosts = this.getPrerequisiteMSECosts(planet, upgradeType);
    //     let mseCosts = this.getMSECosts(planet, upgradeType, level) + preMseCosts;

    //     let amor = mseCosts / mseProd;
    //     let newLevel;

    //     if(preMseCosts > 0) {
    //         let x = 1;
    //         while(this.getMSECosts(planet, upgradeType, level + x) / this.getMSEProduction(planet, upgradeType, level + x) < amor){
    //             mseCosts += this.getMSECosts(planet, upgradeType, level + x);
    //             mseProd += this.getMSEProduction(planet, upgradeType, level + x);
    //             amor = mseCosts / mseProd;
    //             x++;
    //         }
    //         console.log(`${planet.coords} -- ${upgradeType} -- ${(x - 1)} extra levels`);

    //         if(x > 1) newLevel = (level + 1) + "-" + (level + x);
    //         else newLevel = (level + x);                   
    //     }
    //     else{
    //         newLevel = (level + 1);
    //     }

    //     return { 
    //         coords: planet.coords, 
    //         name: planet.name, 
    //         technology: upgradeType, 
    //         level: newLevel, 
    //         amortization: amor / 24,
    //         msecost: mseCosts,
    //         type: amorType,
    //     };
    // }

    checkPlanetBlocks() {
        const player = this.json.player;
        let blocked = [];
        const research = [];
        research.push(this.json.player.plasma);
        research.push(this.json.player.astro);
        research.push(this.json.player.energy);
        research.push(this.json.player.ion);
        research.push(this.json.player.laser);
        research.push(this.json.player.impuls);
        research.push(this.json.player.spy);

        research.forEach(r => {
            if (r.timeFinished) blocked.push({ coords: "account", type: ["research"], timeFinished: r.timeFinished, upgradeType: "research" })
        });

        player.planets.forEach(planet => {
            const builds = [];
            builds.push(planet.metal);
            builds.push(planet.crystal);
            builds.push(planet.deut);
            builds.push(planet.solar);
            builds.push(planet.fusion);
            builds.push(planet.researchlab);
            builds.push(planet.missileSilo);
            builds.push(planet.shipyard);

            builds.forEach(b => {
                if (b.timeFinished) blocked.push({ coords: planet.coords, type: ["building"], timeFinished: b.timeFinished, upgradeType: "building" });
            });

            const robotbuilds = [];
            robotbuilds.push(planet.roboticsFactory);
            robotbuilds.push(planet.nanite);

            robotbuilds.forEach(b => {
                if (b.timeFinished) blocked.push({ coords: planet.coords, type: ["building", "lifeformbuilding"], timeFinished: b.timeFinished, upgradeType: "building" });
            });

            if (planet.lifeforms) {
                if (planet.lifeforms.buildings) {
                    Object.entries(planet.lifeforms.buildings)?.forEach(([key, value]) => {
                        if (value.timeFinished) {
                            if (["researchCentre", "runeTechnologium", "vortexChamber", "roboticsResearchCentre"].includes(key)) {
                                blocked.push({ coords: planet.coords, type: ["lifeformbuilding", "lifeformtech"], timeFinished: value.timeFinished, upgradeType: "lifeformbuilding" });
                            } else {
                                blocked.push({ coords: planet.coords, type: ["lifeformbuilding"], timeFinished: value.timeFinished, upgradeType: "lifeformbuilding" });
                            }
                        }
                    })
                }

                if (planet.lifeforms.techs?.length > 0) {
                    planet.lifeforms.techs.forEach(t => {
                        if (t.level.timeFinished) blocked.push({ coords: planet.coords, type: ["lifeformtech"], timeFinished: t.level.timeFinished, upgradeType: "lifeformtech" });
                    })
                }
            }
        });

        return blocked.filter(b => parseInt(b.timeFinished) * 1000 > Date.now());
    }

    createAmortizationTable(coords = undefined, listType) {
        const blocked = this.checkPlanetBlocks();

        console.log(blocked);

        //create table
        this.removeButtons();

        let div = document.querySelector('.amortizationtable');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent") || document.querySelector("#facilitiescomponent.maincontent") || document.querySelector("#lfbuildingscomponent.maincontent") || document.querySelector("#lfresearchcomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtable" }));

        let divHeader = document.createElement('div');
        divHeader.innerHTML = `
            <div class="popup-header">
            <div class="title">Amortization Table</div>
            <button settings-close-button class="close-button">&times;</button>
            </div>
            `
        div.appendChild(divHeader);

        let closeButton = document.querySelector(".close-button");
        closeButton.addEventListener("click", () => {
            let div = document.querySelector('.amortizationtable');
            div.remove();
            this.checkPage();
        })

        let table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');
        let tableBody = document.createElement('tbody');


        let absoluteAmortization = this.createAbsoluteAmortizationList(blocked);
        if (this.json.player.includeIndirectProductionBuildings == "true") {
            let indirectProductionUpgrades = this.getIndirectProductionUpgrades();
            absoluteAmortization = this.addIndirectProductionUpgradesToAmortization(absoluteAmortization, indirectProductionUpgrades, blocked);
        }

        if (listType == "recursive") {
            //TODO: trim list for planet sided list
            let totalAmortization = this.createAmortizationListString(absoluteAmortization, this.json.player.recursiveListAmount ?? 50);

            for (let r = 0; r < totalAmortization.length + 1; r++) {
                let tr = document.createElement('tr');
                tr.style.marginLeft = 10;
                let coords, name, technology, level, amortization, color;

                if (r == 0) {
                    coords = "Coords";
                    name = "Name";
                    technology = "Technology";
                    level = "Level";
                    amortization = "Return of Investment";
                } else {
                    coords = totalAmortization[r - 1].coords;
                    name = totalAmortization[r - 1].name;
                    technology = totalAmortization[r - 1].technology;
                    level = totalAmortization[r - 1].level;
                    color = totalAmortization[r - 1].color;

                    amortization = Math.round(totalAmortization[r - 1].amortization * 100) / 100 + " days";
                    if (technology == "14204" || technology == "14205" || technology == "14211" || technology == "14218")
                        amortization += " (" + this.getAmountOfExpeditionsPerDay() + " expo/day)";
                }

                let td1 = document.createElement('td');
                td1.appendChild(document.createTextNode(coords));
                tr.appendChild(td1);

                let td2 = document.createElement('td');
                td2.appendChild(document.createTextNode(name == undefined ? "Unknown" : name));
                tr.appendChild(td2);

                let td3 = document.createElement('td');
                td3.appendChild(document.createTextNode(technology));
                let span = document.createElement("span");
                span.style.color = color;
                span.appendChild(td3);
                tr.appendChild(span);

                let td4 = document.createElement('td');
                td4.appendChild(document.createTextNode(level));
                tr.appendChild(td4);

                let td5 = document.createElement('td');
                td5.appendChild(document.createTextNode(amortization));
                tr.appendChild(td5);

                tableBody.appendChild(tr);
            }
        } else {
            let totalAmortization = this.trimAmortizationList(absoluteAmortization, coords);
            //Every unit once
            for (let r = 0; r < totalAmortization.length + 1; r++) {
                let tr = document.createElement('tr');
                tr.style.marginLeft = 10;
                let coords, name, technology, level, amortization, color;

                if (r == 0) {
                    coords = "Coords";
                    name = "Name";
                    technology = "Technology";
                    level = "Level";
                    amortization = "Return of Investment";
                } else {
                    coords = totalAmortization[r - 1].coords;
                    name = totalAmortization[r - 1].name;
                    technology = this.getTechnologyFromId(totalAmortization[r - 1].technology);
                    level = totalAmortization[r - 1].level;
                    color = totalAmortization[r - 1].color;

                    amortization = Math.round(totalAmortization[r - 1].amortization * 100) / 100 + (totalAmortization[r - 1].amortizationStopped == "true" ? "+ days" : " days");
                    if (["14204", "14205", "14211", "14218"].includes(totalAmortization[r - 1].technology))
                        amortization += " (" + this.getAmountOfExpeditionsPerDay() + " expo/day)";
                }

                let td1 = document.createElement('td');
                td1.appendChild(document.createTextNode(coords));
                tr.appendChild(td1);

                let td2 = document.createElement('td');
                td2.appendChild(document.createTextNode(name == undefined ? "Unknown" : name));
                tr.appendChild(td2);

                let td3 = document.createElement('td');
                td3.appendChild(document.createTextNode(technology));
                let span = document.createElement("span");
                span.style.color = color;
                span.appendChild(td3);
                tr.appendChild(span);

                let td4 = document.createElement('td');
                td4.appendChild(document.createTextNode(level));
                tr.appendChild(td4);

                let td5 = document.createElement('td');
                td5.appendChild(document.createTextNode(amortization));
                tr.appendChild(td5);

                tableBody.appendChild(tr);
            }
        }

        table.appendChild(tableBody);

        let divBody = document.createElement('div');
        divBody.appendChild(table);

        div.appendChild(divBody);
    }

    trimAmortizationList(amortizationList, coords) {
        if (!coords) return amortizationList;

        let finalList = [];
        amortizationList.forEach(item => {
            if (coords == item.coords || item.coords == "account") {
                finalList.push(item);
            }
        });
        return finalList
    }

    getTechnologyFromId(id) {
        switch (id) {
            case "11202": return "High-Performance Extractors (2)";
            case "11208": return "Enhanced Production Technologies (8)";
            case "11217": return "Robot Assistants (17)";

            case "12202": return "Acoustic Scanning (2)";
            case "12203": return "High Energy Pump Systems (3)";
            case "12205": return "Magma-Powered Production (5)";
            case "12207": return "Depth Souding (7)";
            case "12209": return "Improved Stellarator (9)";
            case "12210": return "Hardened Diamond Drill Heads (10)";
            case "12211": return "Seismic Mining Technology (11)";
            case "12212": return "Magma-Powered Pump Systems (12)";
            case "12213": return "Ion Crystal Modules (13)";
            case "12218": return "Rock'tal Collector Enhancemnt (18)";

            case "13201": return "Catalyser Technology (1)";
            case "13206": return "Automated Transport Lines (6)";
            case "13213": return "Artificial Swarm Intelligence (13)";

            case "14202": return "Sulphide Process (2)";
            case "14204": return "Telekinetic Tractor Beam (4)";
            case "14205": return "Enhanced Sensor Technology (5)";
            case "14211": return "Sixth Sense (11)";
            case "14212": return "Psychoharmoniser (12)";
            case "14218": return "Kaelesh Discoverer Enhancement (18)";
            default: return id;
        }
    }

    getAmortizationColor(coords, type, blocked) {
        const block = blocked.find(x => x.coords == coords && this.checkTypeBlocked(x.type, type));
        if (!block) return this.getColor("ready");

        const timeLeft = block.timeFinished - Date.now() / 1000;
        if (timeLeft > 3600 * 10) return this.getColor("blocked");
        if (timeLeft > 0) return this.getColor("soon");
        return this.getColor("ready")
    }

    checkTypeBlocked(array1, array2) {
        for (const type of array1) {
            if (array2.includes(type)) { return true; }
        }
        return false;
    }

    /**
    * @param coords optional: the coords to create the list for, no coords means whole account
    */
    createAbsoluteAmortizationList(blocked, coords) {
        let totalAmortization = [];
        let amorColor;
        this.json.player.planets.forEach((planet) => {
            if (!coords || planet.coords == coords) {
                amorColor = this.getAmortizationColor(planet.coords, ["building"], blocked);
                totalAmortization.push(this.createAmortization(planet, "metal", planet.metal, ["mine", "productionbuilding"], amorColor, totalAmortization.length));
                totalAmortization.push(this.createAmortization(planet, "crystal", planet.crystal, ["mine", "productionbuilding"], amorColor, totalAmortization.length));
                totalAmortization.push(this.createAmortization(planet, "deut", planet.deut, ["mine", "productionbuilding"], amorColor, totalAmortization.length));

                if (this.json.settings.lifeforms && planet.lifeforms.lifeformClass) {
                    let amorColorBuilding = this.getAmortizationColor(planet.coords, ["lifeformbuilding"], blocked);
                    if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "highEnergySmelting", this.getLevel(planet.lifeforms.buildings.highEnergySmelting), "productionbuilding", amorColorBuilding, totalAmortization.length));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "fusionPoweredProduction", this.getLevel(planet.lifeforms.buildings.fusionPoweredProduction), "productionbuilding", amorColorBuilding, totalAmortization.length));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "metropolis", this.getLevel(planet.lifeforms.buildings.metropolis), "productionbuilding", amorColorBuilding, totalAmortization.length));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "magmaForge", this.getLevel(planet.lifeforms.buildings.magmaForge), ["rocktalbuilding", "productionbuilding"], amorColorBuilding, totalAmortization.length));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "crystalRefinery", this.getLevel(planet.lifeforms.buildings.crystalRefinery), ["rocktalbuilding", "productionbuilding"], amorColorBuilding, totalAmortization.length));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "deuteriumSynthesizer", this.getLevel(planet.lifeforms.buildings.deuteriumSynthesizer), ["rocktalbuilding", "productionbuilding"], amorColorBuilding, totalAmortization.length));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "highPerformanceSynthesizer", this.getLevel(planet.lifeforms.buildings.highPerformanceSynthesizer), "productionbuilding", amorColorBuilding, totalAmortization.length));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "highPerformanceTransformer", this.getLevel(planet.lifeforms.buildings.highPerformanceTransformer), "productionbuilding", amorColorBuilding, totalAmortization.length));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "chipMassProduction", this.getLevel(planet.lifeforms.buildings.chipMassProduction), "productionbuilding", amorColorBuilding, totalAmortization.length));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_KAELESH) {
                    } else {
                        console.warn("lifeform not found: " + planet.lifeforms.lifeformClass);
                    }

                    for (let s = 0; s < 18; s++) {
                        const tech = planet.lifeforms.techs[s];
                        if (tech) {
                            const level = this.getLevel(tech.level);
                            let extraMSE = this.getMSEProduction(planet, tech.id, level);

                            if (extraMSE > 0) {
                                let costs = this.getCosts(planet, tech.id, level);
                                let mseCosts = this.getMSEValue(costs);
                                totalAmortization.push({
                                    coords: planet.coords,
                                    name: planet.name,
                                    technology: tech.id,
                                    level: level + 1,
                                    amortization: (mseCosts / extraMSE + this.getUpgradeTime(planet, tech.id, parseInt(level))) / 24,
                                    costs: costs,
                                    msecost: mseCosts,
                                    type: "lifeformtech",
                                    color: this.getAmortizationColor(planet.coords, ["lifeformtech"], blocked),
                                    id: totalAmortization.length,
                                });
                            }
                        } else {
                            const possibleTechs = this.getTechsForSlot(s);
                            if (possibleTechs.length > 0) {
                                let possibleTechsAmortizations = [];
                                const unlockPrerequisites = this.getUnlockPrerequisitesForTechSlot(s, planet);
                                const unlockCosts = this.getUnlockCostsForPrerequisites(planet, unlockPrerequisites);
                                possibleTechs.forEach(tech => {
                                    let level = 0;
                                    let gainMse = this.getMSEProduction(planet, tech, level);
                                    if (gainMse > 0) {
                                        let totalCost = this.addArrayValues(unlockCosts, this.getCosts(planet, tech, level));
                                        let currentROI = this.getMSEValue(totalCost) / gainMse;
                                        while (this.getMSECosts(planet, tech, level + 1) / this.getMSEProduction(planet, tech, level + 1) < currentROI) {
                                            level++;
                                            gainMse += this.getMSEProduction(planet, tech, level);
                                            totalCost = this.addArrayValues(totalCost, this.getCosts(planet, tech, level));
                                            currentROI = this.getMSEValue(totalCost) / gainMse;
                                        }

                                        let mseCost = this.getMSEValue(totalCost);

                                        possibleTechsAmortizations.push({
                                            coords: planet.coords,
                                            name: planet.name,
                                            technology: tech,
                                            level: level == 0 ? "1" : "1-" + (level + 1),
                                            amortization: (mseCost / gainMse + this.getUpgradeTime(planet, tech, level)) / 24,
                                            msecost: mseCost,
                                            costs: totalCost,
                                            type: "lifeformtech",
                                            color: this.getColor("toUnlock"),
                                            id: totalAmortization.length,
                                        });
                                    }
                                });

                                const unlockMseCosts = this.getMSEValue(unlockCosts);

                                possibleTechsAmortizations.sort((a, b) => a.amortization - b.amortization);
                                if (possibleTechsAmortizations.length > 0) {
                                    if (unlockMseCosts > 0) {
                                        unlockPrerequisites.forEach(prerequisite => {
                                            if (prerequisite.level < prerequisite.levelNeeded) {
                                                let levelString = parseInt(prerequisite.level) + 1 == prerequisite.levelNeeded
                                                    ? prerequisite.levelNeeded
                                                    : (parseInt(prerequisite.level) + 1) + "-" + prerequisite.levelNeeded;

                                                let prerequisiteType;
                                                if (prerequisite.name == "meditationEnclave" || prerequisite.name == "crystalFarm") {
                                                    prerequisiteType = ["lifeformbuilding", "rocktalbuilding", "mine"];
                                                } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                                                    prerequisiteType = ["lifeformbuilding", "rocktalbuilding"];
                                                } else {
                                                    prerequisiteType = ["lifeformbuilding"];
                                                }

                                                let prerequisiteCost = [0,0,0];
                                                for (let l = prerequisite.level; l < prerequisite.levelNeeded; l++) {
                                                    prerequisiteCost = this.addArrayValues(prerequisiteCost, this.getCosts(planet, prerequisite.name, l));
                                                }

                                                let mseCost = this.getMSEValue(prerequisiteCost);

                                                totalAmortization.push({
                                                    coords: planet.coords,
                                                    name: planet.name,
                                                    technology: /*possibleTechsAmortizations[0].technology + " => " + */ prerequisite.name,
                                                    level: levelString,
                                                    amortization: possibleTechsAmortizations[0].amortization,
                                                    costs: prerequisiteCost,
                                                    msecost: mseCost,
                                                    type: prerequisiteType,
                                                    color: amorColorBuilding,
                                                    id: totalAmortization.length,
                                                });
                                            }
                                        });
                                    } else {
                                        possibleTechsAmortizations[0].id = totalAmortization.length;
                                        totalAmortization.push(possibleTechsAmortizations[0]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        amorColor = this.getAmortizationColor("account", ["research"], blocked);
        totalAmortization.push(this.createAmortizationWithPrerequisite(undefined, "plasma", this.getLevel(this.json.player.plasma), "plasma", amorColor, totalAmortization.length));

        totalAmortization.push(this.createAstroAmortizationObject(blocked, totalAmortization.length));

        totalAmortization.sort((a, b) => a.amortization - b.amortization);
        console.log(totalAmortization);
        return totalAmortization;
    }

    getAvgPlanet() {
        const planets = this.json.player.planets;

        let avgPlanet = {
            coords: "1:1:8",
            maxtemp: 50, //avg maxtemp for pos 8
            metal: this.calculateMedian(planets.map(p => this.getLevel(p.metal))),
            crystal: this.calculateMedian(planets.map(p => this.getLevel(p.crystal))),
            deut: this.calculateMedian(planets.map(p => this.getLevel(p.deut))),
            solar: this.calculateMedian(planets.map(p => this.getLevel(p.solar))),
            roboticsFactory: this.calculateMedian(planets.map(p => this.getLevel(p.roboticsFactory))),
            shipyard: this.calculateMedian(planets.map(p => this.getLevel(p.shipyard))),
            researchlab: this.calculateMedian(planets.map(p => this.getLevel(p.researchlab))),
            missileSilo: this.calculateMedian(planets.map(p => this.getLevel(p.missileSilo))),
            nanite: this.calculateMedian(planets.map(p => this.getLevel(p.nanite))),
        };

        let planetToCreate = "standard";

        if (this.json.settings.lifeforms) {
            planetToCreate = this.getMostCommonValue(planets.map(p => p.lifeforms.lifeformClass));
        }

        if (!planetToCreate || planetToCreate == "standard") {
            return avgPlanet;
        }

        avgPlanet.lifeforms = {
            lifeformClass: planetToCreate,
            techs: [],
            buildings: {},
        }

        for (let i = 0; i < 18; i++) {
            let techid = this.getMostCommonValue(planets.map(p => this.getTechIdFromIndex(p.lifeforms.techs, i)));
            if (techid) {
                let techLevel = this.calculateMedian(planets.filter(p => this.getTechIdFromIndex(p.lifeforms.techs, i) == techid).map(p => this.getLevel(p.lifeforms.techs.find(t => t.id == techid).level)));
                avgPlanet.lifeforms.techs.push({
                    id: techid,
                    level: techLevel,
                });
            }
        }

        if (planetToCreate == LIFEFORM_CLASS_ROCKTAL) {
            avgPlanet.lifeforms.buildings = {
                meditationEnclave: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.meditationEnclave))),
                crystalFarm: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.crystalFarm))),
                runeTechnologium: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.runeTechnologium))),
                runeForge: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.runeForge))),
                oriktorium: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.oriktorium))),
                magmaForge: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.magmaForge))),
                disruptionChamber: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.disruptionChamber))),
                megalith: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.megalith))),
                crystalRefinery: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.crystalRefinery))),
                deuteriumSynthesizer: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.deuteriumSynthesizer))),
                mineralResearchCentre: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.mineralResearchCentre))),
                advancedRecyclingPlant: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.advancedRecyclingPlant))),
            }
        } else if (planetToCreate == LIFEFORM_CLASS_MENSEN) {
            avgPlanet.lifeforms.buildings = {
                residentialSector: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.residentialSector))),
                biosphereFarm: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.biosphereFarm))),
                researchCentre: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.researchCentre))),
                academyOfSciences: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.academyOfSciences))),
                neuroCalibrationCentre: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.neuroCalibrationCentre))),
                highEnergySmelting: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.highEnergySmelting))),
                foodSilo: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.foodSilo))),
                fusionPoweredProduction: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.fusionPoweredProduction))),
                skyscraper: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.skyscraper))),
                biotechLab: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.biotechLab))),
                metropolis: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.metropolis))),
                planetaryShield: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.planetaryShield))),
            }
        } else if (planetToCreate == LIFEFORM_CLASS_MECHA) {
            avgPlanet.lifeforms.buildings = {
                assemblyLine: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.assemblyLine))),
                fusionCellFactory: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.fusionCellFactory))),
                roboticsResearchCentre: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.roboticsResearchCentre))),
                updateNetwork: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.updateNetwork))),
                quantumComputerCentre: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.quantumComputerCentre))),
                automatisedAssemblyCentre: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.automatisedAssemblyCentre))),
                highPerformanceTransformer: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.highPerformanceTransformer))),
                microchipAssemblyLine: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.microchipAssemblyLine))),
                productionAssemblyHall: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.productionAssemblyHall))),
                highPerformanceSynthesizer: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.highPerformanceSynthesizer))),
                chipMassProduction: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.chipMassProduction))),
                nanoRepairBots: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.nanoRepairBots))),
            }
        } else if (planetToCreate == LIFEFORM_CLASS_KAELESH) {
            avgPlanet.lifeforms.buildings = {
                sanctuary: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.sanctuary))),
                antimatterCondenser: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.antimatterCondenser))),
                vortexChamber: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.vortexChamber))),
                hallsOfRealisation: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.hallsOfRealisation))),
                forumOfTranscendence: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.forumOfTranscendence))),
                antimatterConvector: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.antimatterConvector))),
                cloningLaboratory: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.cloningLaboratory))),
                chrysalisAccelerator: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.chrysalisAccelerator))),
                bioModifier: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.bioModifier))),
                psionicModulator: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.psionicModulator))),
                shipManufacturingHall: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.shipManufacturingHall))),
                supraRefractor: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings?.supraRefractor))),
            }
        }

        return avgPlanet;
    }

    getTechIdFromIndex(techs, index) {
        if (techs?.length > index && index >= 0) return techs[index].id;
        else return undefined;
    }

    getMostCommonValue(array) {
        const valueCounts = {};
        array.forEach(value => {
            if (typeof value === 'string') {
                valueCounts[value] = (valueCounts[value] || 0) + 1;
            }
        });

        let highestCount = 0;
        let mostCommonValue = '';

        for (const value in valueCounts) {
            if (valueCounts[value] > highestCount) {
                highestCount = valueCounts[value];
                mostCommonValue = value;
            }
        }

        return mostCommonValue;
    }

    calculateMedian(numberArray) {
        numberArray.filter(number => number > 0);
        numberArray.sort((a, b) => a - b);
        const len = numberArray.length;
        const midIndex = Math.floor(len / 2);
        if (len % 2 === 0) {
            return (numberArray[midIndex - 1] + numberArray[midIndex]) / 2;
        } else {
            return numberArray[midIndex];
        }
    }

    createAstroAmortizationObject(blocked, id) {
        //astro
        const preRequisiteAstroCosts = this.getPrerequisiteMSECosts(undefined, "astro");
        let totalMSECostsAstroNewPlanet = preRequisiteAstroCosts;
        let totalMSECostsAstroNewExpo = preRequisiteAstroCosts;
        let totalMSEProdAstroNewPlanet = 0;
        let totalMSEProdAstroNewExpo = 0;
        let newPlanetExpoBoostProduction = 0;

        let avgPlanet = this.getAvgPlanet();
        console.log(avgPlanet);

        if (this.json.settings.lifeforms) {
            let tractorstraal = avgPlanet.lifeforms?.techs?.find(t => t.id == "14204");
            let sensortechnologie = avgPlanet.lifeforms?.techs?.find(t => t.id == "14205");
            let zesdeZintuig = avgPlanet.lifeforms?.techs?.find(t => t.id == "14211");

            if (tractorstraal) newPlanetExpoBoostProduction += tractorstraal.level * this.getMSEProduction(avgPlanet, "14204", tractorstraal.level);
            if (sensortechnologie) newPlanetExpoBoostProduction += sensortechnologie.level * this.getMSEProduction(avgPlanet, "14205", sensortechnologie.level);
            if (zesdeZintuig) newPlanetExpoBoostProduction += zesdeZintuig.level * this.getMSEProduction(avgPlanet, "14211", zesdeZintuig.level);
        }

        const newExpoSlotProduction = this.calcExpoMseProfit() * this.getExpoRoundsPerDay() / 24;

        const astro = this.getLevel(this.json.player.astro);

        totalMSECostsAstroNewPlanet += this.getMSECosts(undefined, "astro", parseInt(astro));
        if (astro % 2 == 1) {
            totalMSECostsAstroNewPlanet += this.getMSECosts(undefined, "astro", parseInt(astro) + 1);
        }

        let newPlanetMSECost = 0;

        for (let l = 0; l < avgPlanet.metal; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "metal", l);
        for (let l = 0; l < avgPlanet.crystal; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "crystal", l);
        for (let l = 0; l < avgPlanet.deut; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "deut", l);
        for (let l = 0; l < avgPlanet.solar; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "solar", l);
        for (let l = 0; l < avgPlanet.roboticsFactory; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "roboticsFactory", l);
        for (let l = 0; l < avgPlanet.shipyard; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "shipyard", l);
        for (let l = 0; l < avgPlanet.researchlab; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "researchlab", l);
        for (let l = 0; l < avgPlanet.missileSilo; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "missileSilo", l);
        for (let l = 0; l < avgPlanet.nanite; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "nanite", l);

        if (this.json.settings.lifeforms) {
            avgPlanet.lifeforms?.techs?.forEach(t => {
                for (let l = 0; l < t.level; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, t.id, l);
            });

            switch (avgPlanet.lifeforms?.lifeformClass) {
                case LIFEFORM_CLASS_MENSEN:
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.residentialSector; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "residentialSector", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.biosphereFarm; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "biosphereFarm", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.researchCentre; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "researchCentre", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.academyOfSciences; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "academyOfSciences", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.neuroCalibrationCentre; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "neuroCalibrationCentre", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.highEnergySmelting; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "highEnergySmelting", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.foodSilo; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "foodSilo", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.fusionPoweredProduction; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "fusionPoweredProduction", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.skyscraper; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "skyscraper", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.biotechLab; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "biotechLab", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.metropolis; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "metropolis", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.planetaryShield; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "planetaryShield", l);
                    break;
                case LIFEFORM_CLASS_ROCKTAL:
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.meditationEnclave; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "meditationEnclave", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.crystalFarm; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "crystalFarm", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.runeTechnologium; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "runeTechnologium", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.runeForge; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "runeForge", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.oriktorium; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "oriktorium", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.magmaForge; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "magmaForge", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.disruptionChamber; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "disruptionChamber", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.megalith; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "megalith", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.crystalRefinery; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "crystalRefinery", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.deuteriumSynthesizer; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "deuteriumSynthesizer", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.mineralResearchCentre; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "mineralResearchCentre", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.advancedRecyclingPlant; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "advancedRecyclingPlant", l);
                    break;
                case LIFEFORM_CLASS_MECHA:
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.assemblyLine; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "assemblyLine", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.fusionCellFactory; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "fusionCellFactory", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.roboticsResearchCentre; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "roboticsResearchCentre", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.updateNetwork; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "updateNetwork", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.quantumComputerCentre; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "quantumComputerCentre", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.automatisedAssemblyCentre; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "automatisedAssemblyCentre", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.highPerformanceTransformer; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "highPerformanceTransformer", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.microchipAssemblyLine; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "microchipAssemblyLine", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.productionAssemblyHall; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "productionAssemblyHall", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.highPerformanceSynthesizer; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "highPerformanceSynthesizer", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.chipMassProduction; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "chipMassProduction", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.nanoRepairBots; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "nanoRepairBots", l);
                    break;
                case LIFEFORM_CLASS_KAELESH:
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.sanctuary; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "sanctuary", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.antimatterCondenser; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "antimatterCondenser", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.vortexChamber; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "vortexChamber", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.hallsOfRealisation; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "hallsOfRealisation", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.forumOfTranscendence; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "forumOfTranscendence", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.antimatterConvector; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "antimatterConvector", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.cloningLaboratory; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "cloningLaboratory", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.chrysalisAccelerator; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "chrysalisAccelerator", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.bioModifier; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "bioModifier", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.psionicModulator; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "psionicModulator", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.shipManufacturingHall; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "shipManufacturingHall", l);
                    for (let l = 0; l < avgPlanet.lifeforms?.buildings?.supraRefractor; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "supraRefractor", l);
                    break;
            }
        }

        let astroLevelStringNewPlanet = (parseInt(astro) + 1)

        if (astro % 2 == 1) {
            astroLevelStringNewPlanet += " & " + (parseInt(astro) + 2);
        }

        //next astro level for expo
        let l = Math.floor(Math.sqrt(parseInt(astro))) + 1;

        let nextAstro = l * l;
        let newPlanets = 0;

        for (let a = parseInt(astro); a < nextAstro; a++) {
            if ((a + 1) % 2 == 1) {
                newPlanets++;
            }
            totalMSECostsAstroNewExpo += this.getMSECosts(undefined, "astro", a);
        }

        const newPlanetProductionNewPlanet = this.getMSEProduction(avgPlanet, "astro", 1);
        const newPlanetsProductionNewExpo = this.getMSEProduction(avgPlanet, "astro", newPlanets);

        totalMSECostsAstroNewPlanet += newPlanetMSECost;
        totalMSECostsAstroNewExpo += newPlanets * newPlanetMSECost;

        totalMSEProdAstroNewPlanet += newPlanetProductionNewPlanet + newPlanetExpoBoostProduction;
        totalMSEProdAstroNewExpo += newPlanetsProductionNewExpo + newExpoSlotProduction + newPlanets * newPlanetExpoBoostProduction;

        console.log("astro expo unlock cost: " + this.getBigNumber(totalMSECostsAstroNewExpo));
        console.log("astro expo unlock prod: " + this.getBigNumber(totalMSEProdAstroNewExpo));
        console.log("astro planet unlock cost: " + this.getBigNumber(totalMSECostsAstroNewPlanet));
        console.log("astro planet unlock prod: " + this.getBigNumber(totalMSEProdAstroNewPlanet));

        let astroLevelStringNewExpo = (parseInt(astro) + 1);
        if (parseInt(astro) + 1 < nextAstro) {
            astroLevelStringNewExpo += " - " + nextAstro;
        }

        let amorColor = this.getAmortizationColor("account", ["research"], blocked);
        if (totalMSECostsAstroNewExpo / totalMSEProdAstroNewExpo < totalMSECostsAstroNewPlanet / totalMSEProdAstroNewPlanet) {
            return {
                coords: "account",
                name: "account",
                technology: "astrophysics",
                level: astroLevelStringNewExpo,
                amortization: totalMSECostsAstroNewExpo / totalMSEProdAstroNewExpo / 24,
                msecost: totalMSECostsAstroNewExpo,
                costs: this.getCosts(undefined, "astro", parseInt(astro)),
                type: "astro",
                color: amorColor,
                id: id,
            };
        } else {
            return {
                coords: "account",
                name: "account",
                technology: "astrophysics",
                level: astroLevelStringNewPlanet,
                amortization: totalMSECostsAstroNewPlanet / totalMSEProdAstroNewPlanet / 24,
                msecost: totalMSECostsAstroNewPlanet,
                costs: this.getCosts(undefined, "astro", parseInt(astro)),
                type: "astro",
                color: amorColor,
                id: id,
            };
        }
    }

    createAmortizationListString(amortizationList, amount) {
        let finalList = [];

        for (let i = 0; i < amount; i++) {
            let lastUpgrade = amortizationList[0];
            finalList.push({
                coords: lastUpgrade.coords,
                name: lastUpgrade.name,
                technology: lastUpgrade.technology,
                level: lastUpgrade.level,
                amortization: lastUpgrade.amortization,
                msecost: lastUpgrade.msecost,
                type: lastUpgrade.type,
            });

            lastUpgrade.level = parseInt(lastUpgrade.level.toString().includes("-") ? lastUpgrade.level.split("-")[1] : lastUpgrade.level);

            lastUpgrade.amortization = this.calculateAmortization(this.getPlanetByCoords(lastUpgrade.coords), lastUpgrade.technology, lastUpgrade.level);
            if (isNaN(lastUpgrade.amortization)) {
                lastUpgrade.amortization = 1000000000;
            }

            lastUpgrade.level += 1;
            amortizationList[0] = lastUpgrade;
            amortizationList.sort((a, b) => a.amortization - b.amortization);
        }

        return finalList;
    }

    getTechsForSlot(slot) {
        switch (slot) {
            case 0:
                return ["13201"];
            case 1:
                return ["12202", "14202", "11202"];
            case 2:
                return ["12203"];
            case 3:
                return ["14204"];
            case 4:
                return ["14205", "12205"];
            case 5:
                return ["13206"];
            case 6:
                return ["12207"];
            case 7:
                return ["11208"];
            case 8:
                return ["12209"];
            case 9:
                return ["12210"];
            case 10:
                return ["14211", "12211"];
            case 11:
                return ["12212", "14212"];
            case 12:
                return ["13213", "12213"];
            case 16:
                return ["11217"];
            case 17:
                return ["14218", "12218"];
            default:
                return [];
        }
    }

    getUnlockPrerequisitesForTechSlot(slot, planet) {
        let popNeeded = 0;
        slot = parseInt(slot);
        switch (slot) {
            case 0:
                popNeeded = 200000;
                break;
            case 1:
                popNeeded = 300000;
                break;
            case 2:
                popNeeded = 400000;
                break;
            case 3:
                popNeeded = 500000;
                break;
            case 4:
                popNeeded = 750000;
                break;
            case 5:
                popNeeded = 1000000;
                break;
            case 6:
                popNeeded = 1200000;
                break;
            case 7:
                popNeeded = 3000000;
                break;
            case 8:
                popNeeded = 5000000;
                break;
            case 9:
                popNeeded = 7000000;
                break;
            case 10:
                popNeeded = 9000000;
                break;
            case 11:
                popNeeded = 11000000;
                break;
            case 12:
                popNeeded = 13000000;
                break;
            case 13:
                popNeeded = 26000000;
                break;
            case 14:
                popNeeded = 56000000;
                break;
            case 15:
                popNeeded = 112000000;
                break;
            case 16:
                popNeeded = 224000000;
                break;
            case 17:
                popNeeded = 448000000;
                break;
        }

        let popCapacityBase;
        let popCapacityFactor;
        let foodConsBase;
        let foodConsFactor;
        let foodProdBase;
        let foodProdFactor;
        let quartersLevel;
        let foodLevel;
        let quartersName;
        let foodName;
        let t2popBuildingLevel;
        let t2popBuildingName;
        let t3popBuildingLevel;
        let t3popBuildingName;

        const lifeformClass = planet.lifeforms.lifeformClass;

        switch (lifeformClass) {
            case LIFEFORM_CLASS_MENSEN:
                popCapacityBase = 210;
                popCapacityFactor = 1.21;
                foodConsBase = 9;
                foodConsFactor = 1.15;
                foodProdBase = 10;
                foodProdFactor = 1.14;
                quartersLevel = this.getLevel(planet.lifeforms.buildings.residentialSector);
                quartersName = "residentialSector";
                foodLevel = this.getLevel(planet.lifeforms.buildings.biosphereFarm);
                foodName = "biosphereFarm";
                t2popBuildingLevel = this.getLevel(planet.lifeforms.buildings.academyOfSciences);
                t2popBuildingName = "academyOfSciences";
                t3popBuildingLevel = this.getLevel(planet.lifeforms.buildings.neuroCalibrationCentre);
                t3popBuildingName = "neuroCalibrationCentre";
                break;
            case LIFEFORM_CLASS_MECHA:
                popCapacityBase = 500;
                popCapacityFactor = 1.205;
                foodConsBase = 22;
                foodConsFactor = 1.15;
                foodProdBase = 23;
                foodProdFactor = 1.12;
                quartersLevel = this.getLevel(planet.lifeforms.buildings.assemblyLine);
                quartersName = "assemblyLine";
                foodLevel = this.getLevel(planet.lifeforms.buildings.fusionCellFactory);
                foodName = "fusionCellFactory";
                t2popBuildingLevel = this.getLevel(planet.lifeforms.buildings.updateNetwork);
                t2popBuildingName = "updateNetwork";
                t3popBuildingLevel = this.getLevel(planet.lifeforms.buildings.quantumComputerCentre);
                t3popBuildingName = "quantumComputerCentre";
                break;
            case LIFEFORM_CLASS_ROCKTAL:
                popCapacityBase = 150;
                popCapacityFactor = 1.216;
                foodConsBase = 5;
                foodConsFactor = 1.15;
                foodProdBase = 6;
                foodProdFactor = 1.14;
                quartersLevel = this.getLevel(planet.lifeforms.buildings.meditationEnclave);
                quartersName = "meditationEnclave";
                foodLevel = this.getLevel(planet.lifeforms.buildings.crystalFarm);
                foodName = "crystalFarm";
                t2popBuildingLevel = this.getLevel(planet.lifeforms.buildings.runeForge);
                t2popBuildingName = "runeForge";
                t3popBuildingLevel = this.getLevel(planet.lifeforms.buildings.oriktorium);
                t3popBuildingName = "oriktorium";
                break;
            default:
                popCapacityBase = 250;
                popCapacityFactor = 1.21;
                foodConsBase = 11;
                foodConsFactor = 1.15;
                foodProdBase = 12;
                foodProdFactor = 1.14;
                quartersLevel = this.getLevel(planet.lifeforms.buildings.sanctuary);
                quartersName = "sanctuary";
                foodLevel = this.getLevel(planet.lifeforms.buildings.antimatterCondenser);
                foodName = "antimatterCondenser";
                t2popBuildingLevel = this.getLevel(planet.lifeforms.buildings.hallsOfRealisation);
                t2popBuildingName = "hallsOfRealisation";
                t3popBuildingLevel = this.getLevel(planet.lifeforms.buildings.forumOfTranscendence);
                t3popBuildingName = "forumOfTranscendence";
                break;
        }

        let traderFactor = this.json.player.allyClass == ALLY_CLASS_TRADER ? 1.1 : 1;
        let quartersLevelNeeded = 0;
        let foodLevelNeeded = 0;
        let t2popBuildingLevelNeeded = 0;
        let t3popBuildingLevelNeeded = 0;

        if (slot < 6) {
            let quartersLevelNeeded = quartersLevel;
            let foodLevelNeeded = foodLevel;

            let popBonusFactor = 1;
            if (lifeformClass == LIFEFORM_CLASS_MENSEN) {
                popBonusFactor = (1 + this.getLevel(planet.lifeforms.buildings.skyscraper) * 0.015);
            } else if (lifeformClass == LIFEFORM_CLASS_MECHA) {
                popBonusFactor = (1 + this.getLevel(planet.lifeforms.buildings.productionAssemblyHall) * 0.02);
            } else if (lifeformClass == LIFEFORM_CLASS_KAELESH) {
                popBonusFactor = (1 + this.getLevel(planet.lifeforms.buildings.chrysalisAccelerator) * 0.02);
                popNeeded = (1 - this.getLevel(planet.lifeforms.buildings.psionicModulator) * 0.01)
            }

            let t1cap = popCapacityBase * Math.pow(popCapacityFactor, quartersLevel) * (quartersLevel + 1) * popBonusFactor * traderFactor;
            while (t1cap < popNeeded) {
                quartersLevelNeeded++;
                t1cap = popCapacityBase * Math.pow(popCapacityFactor, quartersLevelNeeded) * (quartersLevelNeeded + 1) * traderFactor;
            }

            let foodCons = foodConsBase * Math.pow(foodConsFactor, quartersLevelNeeded) * (quartersLevelNeeded + 1);
            let foodProd = foodProdBase * Math.pow(foodProdFactor, foodLevel) * (foodLevel + 1);

            if (lifeformClass == LIFEFORM_CLASS_MENSEN) {
                foodCons *= (1 - this.getLevel(planet.lifeforms.buildings.foodSilo) * 0.01);
                foodProd *= (1 + this.getLevel(planet.lifeforms.buildings.biotechLab) * 0.05);
            } else if (lifeformClass == LIFEFORM_CLASS_MECHA) {
                foodProd *= (1 + this.getLevel(planet.lifeforms.buildings.microchipAssemblyLine) * 0.02);
            } else if (lifeformClass == LIFEFORM_CLASS_KAELESH) {
                foodCons *= (1 - this.getLevel(planet.lifeforms.buildings.antimatterConvector) * 0.01);
            }

            while (t1cap / foodCons * foodProd < popNeeded) {
                foodLevelNeeded++;
                foodProd = foodProdBase * Math.pow(foodProdFactor, foodLevelNeeded) * (foodLevelNeeded + 1);
            }
            return [
                {
                    'name': quartersName,
                    'level': quartersLevel,
                    'levelNeeded': quartersLevelNeeded,
                },
                {
                    'name': foodName,
                    'level': foodLevel,
                    'levelNeeded': foodLevelNeeded,
                },
                {
                    'name': t2popBuildingName,
                    'level': t2popBuildingLevel,
                    'levelNeeded': t2popBuildingLevelNeeded,
                },
                {
                    'name': t3popBuildingName,
                    'level': t3popBuildingLevel,
                    'levelNeeded': t3popBuildingLevelNeeded,
                },
            ]
        } else if (slot < 18) {
            switch (lifeformClass) {
                case LIFEFORM_CLASS_ROCKTAL:
                    switch (slot) {
                        case 6:
                            quartersLevelNeeded = 43;
                            foodLevelNeeded = 44;
                            t2popBuildingLevelNeeded = 5;
                            break;
                        case 7:
                            quartersLevelNeeded = 46;
                            foodLevelNeeded = 47;
                            t2popBuildingLevelNeeded = 6;
                            break;
                        case 8:
                            quartersLevelNeeded = 47;
                            foodLevelNeeded = 48;
                            t2popBuildingLevelNeeded = 8;
                            break;
                        case 9:
                            quartersLevelNeeded = 48;
                            foodLevelNeeded = 50;
                            t2popBuildingLevelNeeded = 8;
                            break;
                        case 10:
                            quartersLevelNeeded = 50;
                            foodLevelNeeded = 51;
                            t2popBuildingLevelNeeded = 8;
                            break;
                        case 11:
                            quartersLevelNeeded = 51;
                            foodLevelNeeded = 52;
                            t2popBuildingLevelNeeded = 8;
                            break;
                        case 12:
                            quartersLevelNeeded = 62;
                            foodLevelNeeded = 64;
                            t2popBuildingLevelNeeded = 12;
                            t3popBuildingLevelNeeded = 7;
                            break;
                        case 13:
                            quartersLevelNeeded = 65;
                            foodLevelNeeded = 67;
                            t2popBuildingLevelNeeded = 12;
                            t3popBuildingLevelNeeded = 8;
                            break;
                        case 14:
                            quartersLevelNeeded = 67;
                            foodLevelNeeded = 69;
                            t2popBuildingLevelNeeded = 14;
                            t3popBuildingLevelNeeded = 9;
                            break;
                        case 15:
                            quartersLevelNeeded = 70;
                            foodLevelNeeded = 72;
                            t2popBuildingLevelNeeded = 14;
                            t3popBuildingLevelNeeded = 10;
                            break;
                        case 16:
                            quartersLevelNeeded = 72;
                            foodLevelNeeded = 75;
                            t2popBuildingLevelNeeded = 15;
                            t3popBuildingLevelNeeded = 11;
                            break;
                        case 17:
                            quartersLevelNeeded = 75;
                            foodLevelNeeded = 78;
                            t2popBuildingLevelNeeded = 16;
                            t3popBuildingLevelNeeded = 11;
                            break;
                    }
                    return [
                        {
                            'name': 'meditationEnclave',
                            'level': quartersLevel,
                            'levelNeeded': quartersLevelNeeded,
                        },
                        {
                            'name': 'crystalFarm',
                            'level': foodLevel,
                            'levelNeeded': foodLevelNeeded,
                        },
                        {
                            'name': 'runeForge',
                            'level': t2popBuildingLevel,
                            'levelNeeded': t2popBuildingLevelNeeded,
                        },
                        {
                            'name': 'oriktorium',
                            'level': t3popBuildingLevel,
                            'levelNeeded': t3popBuildingLevelNeeded,
                        },
                    ];
                case LIFEFORM_CLASS_MENSEN:
                    let foodSiloLevel = this.getLevel(planet.lifeforms.buildings.foodSilo);
                    let foodSiloLevelNeeded = 0;
                    let biotechLabLevel = this.getLevel(planet.lifeforms.buildings.biotechLab);
                    let biotechLabLevelNeeded = 0;
                    let skyscraperLevel = this.getLevel(planet.lifeforms.buildings.skyscraper);
                    let skyscraperLevelNeeded = 0;
                    switch (slot) {
                        case 6:
                            quartersLevelNeeded = 43;
                            foodLevelNeeded = 44;
                            t2popBuildingLevelNeeded = 4;
                            foodSiloLevelNeeded = 1;
                            break;
                        case 7:
                            quartersLevelNeeded = 46;
                            foodLevelNeeded = 46;
                            t2popBuildingLevelNeeded = 6;
                            foodSiloLevelNeeded = 6;
                            biotechLabLevelNeeded = 2;
                            skyscraperLevelNeeded = 1;
                            break;
                        case 8:
                            quartersLevelNeeded = 48;
                            foodLevelNeeded = 47;
                            t2popBuildingLevelNeeded = 7;
                            foodSiloLevelNeeded = 7;
                            biotechLabLevelNeeded = 4;
                            skyscraperLevelNeeded = 1;
                            break;
                        case 9:
                            quartersLevelNeeded = 48;
                            foodLevelNeeded = 48;
                            t2popBuildingLevelNeeded = 8;
                            foodSiloLevelNeeded = 8;
                            biotechLabLevelNeeded = 5;
                            skyscraperLevelNeeded = 1;
                            break;
                        case 10:
                            quartersLevelNeeded = 50;
                            foodLevelNeeded = 49;
                            t2popBuildingLevelNeeded = 8;
                            foodSiloLevelNeeded = 6;
                            biotechLabLevelNeeded = 5;
                            skyscraperLevelNeeded = 3;
                            break;
                        case 11:
                            quartersLevelNeeded = 51;
                            foodLevelNeeded = 50;
                            t2popBuildingLevelNeeded = 8;
                            foodSiloLevelNeeded = 8;
                            biotechLabLevelNeeded = 5;
                            skyscraperLevelNeeded = 1;
                            break;
                        case 12:
                            quartersLevelNeeded = 62;
                            foodLevelNeeded = 59;
                            t2popBuildingLevelNeeded = 11;
                            t3popBuildingLevelNeeded = 7;
                            foodSiloLevelNeeded = 24;
                            biotechLabLevelNeeded = 15;
                            skyscraperLevelNeeded = 6;
                            break;
                        case 13:
                            quartersLevelNeeded = 65;
                            foodLevelNeeded = 61;
                            t2popBuildingLevelNeeded = 12;
                            t3popBuildingLevelNeeded = 8;
                            foodSiloLevelNeeded = 24;
                            biotechLabLevelNeeded = 16;
                            skyscraperLevelNeeded = 6;
                            break;
                        case 14:
                            quartersLevelNeeded = 68;
                            foodLevelNeeded = 64;
                            t2popBuildingLevelNeeded = 12;
                            t3popBuildingLevelNeeded = 8;
                            foodSiloLevelNeeded = 29;
                            biotechLabLevelNeeded = 20;
                            skyscraperLevelNeeded = 6;
                            break;
                        case 15:
                            quartersLevelNeeded = 70;
                            foodLevelNeeded = 65;
                            t2popBuildingLevelNeeded = 14;
                            t3popBuildingLevelNeeded = 9;
                            foodSiloLevelNeeded = 37;
                            biotechLabLevelNeeded = 21;
                            skyscraperLevelNeeded = 8;
                            break;
                        case 16:
                            quartersLevelNeeded = 73;
                            foodLevelNeeded = 67;
                            t2popBuildingLevelNeeded = 14;
                            t3popBuildingLevelNeeded = 10;
                            foodSiloLevelNeeded = 40;
                            biotechLabLevelNeeded = 24;
                            skyscraperLevelNeeded = 8;
                            break;
                        case 17:
                            quartersLevelNeeded = 74;
                            foodLevelNeeded = 68;
                            t2popBuildingLevelNeeded = 15;
                            t3popBuildingLevelNeeded = 10;
                            foodSiloLevelNeeded = 44;
                            biotechLabLevelNeeded = 26;
                            skyscraperLevelNeeded = 28;
                            break;
                    }
                    return [
                        {
                            'name': 'residentialSector',
                            'level': quartersLevel,
                            'levelNeeded': quartersLevelNeeded,
                        },
                        {
                            'name': 'biosphereFarm',
                            'level': foodLevel,
                            'levelNeeded': foodLevelNeeded,
                        },
                        {
                            'name': 'academyOfSciences',
                            'level': t2popBuildingLevel,
                            'levelNeeded': t2popBuildingLevelNeeded,
                        },
                        {
                            'name': 'neuroCalibrationCentre',
                            'level': t3popBuildingLevel,
                            'levelNeeded': t3popBuildingLevelNeeded,
                        },
                        {
                            'name': 'foodSilo',
                            'level': foodSiloLevel,
                            'levelNeeded': foodSiloLevelNeeded,
                        },
                        {
                            'name': 'biotechLab',
                            'level': biotechLabLevel,
                            'levelNeeded': biotechLabLevelNeeded,
                        },
                        {
                            'name': 'skyscraper',
                            'level': skyscraperLevel,
                            'levelNeeded': skyscraperLevelNeeded,
                        },
                    ];
            }
        } else {
            console.error("slot higher than 18");
            return 0;
        }
    }

    getUnlockCostsForPrerequisites(planet, prerequisites) {
        let costs = [0, 0, 0];
        prerequisites.forEach(prerequisite => {
            for (let i = prerequisite.level; i < prerequisite.levelNeeded; i++) {
                costs = this.addArrayValues(costs, this.getCosts(planet, prerequisite.name, i));
            }
        });
        return costs;
    }

    getPlanetByCoords(coords) {
        return this.json.player.planets.find(p => p.coords == coords);
    }

    getIndirectProductionUpgrades() {
        let indirectProductionUpgrades = [];

        this.json.player.planets.forEach(planet => {
            indirectProductionUpgrades.push({
                coords: planet.coords,
                upgrade: "roboticsFactory",
                priority: 1,
                affected: "productionbuilding",
                affectedCoords: planet.coords,
            });
            indirectProductionUpgrades.push({
                coords: planet.coords,
                upgrade: "nanite",
                priority: 1,
                affected: "productionbuilding",
                affectedCoords: planet.coords,
            });

            if (this.json.settings.lifeforms) {
                switch (planet.lifeforms.lifeformClass) {
                    case LIFEFORM_CLASS_ROCKTAL:
                        indirectProductionUpgrades.push({
                            coords: planet.coords,
                            upgrade: "mineralResearchCentre",
                            priority: 1,
                            affected: "mine",
                            affectedCoords: planet.coords,
                        });
                        if (planet.lifeforms.techs?.length > 0) {
                            indirectProductionUpgrades.push({
                                coords: planet.coords,
                                upgrade: "runeTechnologium",
                                priority: 3,
                                affected: "lifeformtech",
                                affectedCoords: planet.coords,
                            });
                        }
                        indirectProductionUpgrades.push({
                            coords: planet.coords,
                            upgrade: "megalith",
                            priority: 4,
                            affected: "rocktalbuilding",
                            affectedCoords: planet.coords,
                        });
                        break;
                    case LIFEFORM_CLASS_MENSEN:
                        if (planet.lifeforms.techs?.length > 0) {
                            indirectProductionUpgrades.push({
                                coords: planet.coords,
                                upgrade: "researchCentre",
                                priority: 3,
                                affected: "lifeformtech",
                                affectedCoords: planet.coords,
                            });
                        }
                        break;
                    case LIFEFORM_CLASS_MECHA:
                        if (planet.lifeforms.techs?.length > 0) {
                            indirectProductionUpgrades.push({
                                coords: planet.coords,
                                upgrade: "roboticsResearchCentre",
                                priority: 3,
                                affected: "lifeformtech",
                                affectedCoords: planet.coords,
                            });
                        }
                        break;
                    case LIFEFORM_CLASS_KAELESH:
                        if (planet.lifeforms.techs?.length > 0) {
                            indirectProductionUpgrades.push({
                                coords: planet.coords,
                                upgrade: "vortexChamber",
                                priority: 3,
                                affected: "lifeformtech",
                                affectedCoords: planet.coords,
                            });
                        }
                        break;
                }

                if (planet.lifeforms?.techs?.length > 0) {
                    planet.lifeforms.techs.forEach(tech => {
                        if (tech.id === "12209") {
                            indirectProductionUpgrades.push({
                                coords: planet.coords,
                                upgrade: tech.id,
                                priority: 2,
                                affected: "plasma",
                                affectedCoords: "account",
                            })
                        }
                    });
                    planet.lifeforms.techs.forEach(tech => {
                        if (tech.id === "11217") {
                            indirectProductionUpgrades.push({
                                coords: planet.coords,
                                upgrade: tech.id,
                                priority: 2,
                                affected: ["lifeformtech", "research"],
                                affectedCoords: "account",
                            })
                        }
                    });
                }
            }
        });

        indirectProductionUpgrades = indirectProductionUpgrades.sort((a, b) => a.priority - b.priority);
        return indirectProductionUpgrades;
    }

    addIndirectProductionUpgradesToAmortization(amortizationList, indirectProductionUpgrades, blocked) {
        let totalHourlyMseProd = this.getTotalHourlyMseProduction();
        let maxMseProd;
        let l = 0;
        do {
            l++
            maxMseProd = parseFloat(amortizationList[amortizationList.length - l].amortization) * totalHourlyMseProd * 24;
        } while (maxMseProd == Infinity)

        if (maxMseProd == Infinity) {
            console.log(amortizationList);
            console.log(totalHourlyMseProd);
            console.error("maxMseProd is Infinity");
            maxMseProd = 0;
        }

        let upgradesToCheck = [];

        indirectProductionUpgrades.forEach(upgrade => {
            let planet = this.getPlanetByCoords(upgrade.coords);

            let curLevel;
            let resourceDiscount;
            let amorType;
            let amorColor;
            let timeShortagePercent;

            // console.log("coords: " + upgrade.coords + " / upgrade: " + upgrade.upgrade)
            if (upgrade.upgrade == "nanite") {
                curLevel = this.getLevel(planet.nanite);
                timeShortagePercent = 0.5;
                resourceDiscount = 0;
                amorType = "facility";
                amorColor = this.getAmortizationColor(upgrade.coords, ["building", "lifeformbuilding"], blocked)
            } else if (upgrade.upgrade == "roboticsFactory") {
                curLevel = this.getLevel(planet.roboticsFactory);
                timeShortagePercent = (curLevel + 1) / (curLevel + 2);
                resourceDiscount = 0;
                amorType = "facility";
                amorColor = this.getAmortizationColor(upgrade.coords, ["building", "lifeformbuilding"], blocked)
            } else if (this.json.settings.lifeforms) {
                let buildings = planet.lifeforms.buildings;

                if (upgrade.upgrade == "researchCentre") {
                    curLevel = this.getLevel(buildings.researchCentre);
                    resourceDiscount = 0.0025;
                    timeShortagePercent = 0.02;
                    amorType = "humanbuilding";
                    amorColor = this.getAmortizationColor(upgrade.coords, ["lifeformbuilding", "lifeformtech"], blocked)
                } else if (upgrade.upgrade == "runeTechnologium") {
                    curLevel = this.getLevel(buildings.runeTechnologium);
                    resourceDiscount = 0.0025;
                    timeShortagePercent = 0.02;
                    amorType = "rocktalbuilding";
                    amorColor = this.getAmortizationColor(upgrade.coords, ["lifeformbuilding", "lifeformtech"], blocked)
                } else if (upgrade.upgrade == "roboticsResearchCentre") {
                    curLevel = this.getLevel(buildings.roboticsResearchCentre);
                    resourceDiscount = 0.0025;
                    timeShortagePercent = 0.02;
                    amorType = "mechabuilding";
                    amorColor = this.getAmortizationColor(upgrade.coords, ["lifeformbuilding", "lifeformtech"], blocked)
                } else if (upgrade.upgrade == "vortexChamber") {
                    curLevel = this.getLevel(buildings.vortexChamber);
                    resourceDiscount = 0.0025;
                    timeShortagePercent = 0.02;
                    amorType = "kaeleshbuilding";
                    amorColor = this.getAmortizationColor(upgrade.coords, ["lifeformbuilding", "lifeformtech"], blocked)
                } else if (upgrade.upgrade == "12209") {
                    let index = planet.lifeforms.techs.findIndex(t => t.id == "12209");
                    curLevel = this.getLevel(planet.lifeforms.techs[index].level);
                    resourceDiscount = 0.0015;
                    timeShortagePercent = 0.003;
                    amorType = "lifeformtech";
                    amorColor = this.getAmortizationColor(upgrade.coords, ["lifeformtech"], blocked)
                } else if (upgrade.upgrade == "11217") {
                    let index = planet.lifeforms.techs.findIndex(t => t.id == "11217");
                    curLevel = this.getLevel(planet.lifeforms.techs[index].level);
                    resourceDiscount = 0;
                    timeShortagePercent = 0.002;
                    amorType = "lifeformtech";
                    amorColor = this.getAmortizationColor(upgrade.coords, ["lifeformtech"], blocked)
                } else if (upgrade.upgrade == "mineralResearchCentre") {
                    curLevel = this.getLevel(buildings.mineralResearchCentre);
                    resourceDiscount = 0.005;
                    amorType = "rocktalbuilding";
                    amorColor = this.getAmortizationColor(upgrade.coords, ["lifeformbuilding"], blocked)
                } else if (upgrade.upgrade == "megalith") {
                    curLevel = this.getLevel(buildings.megalith);
                    resourceDiscount = 0.01;
                    timeShortagePercent = 0.01;
                    amorType = "rocktalbuilding";
                    amorColor = this.getAmortizationColor(upgrade.coords, ["lifeformbuilding"], blocked)
                }
            } else {
                return;
            }

            let mseProd = 0;
            let timeDiscount = 0;

            if (upgrade.upgrade === "nanite") {
                let prerequisiteTimeShortage = 0;
                if (this.getLevel(planet.roboticsFactory) < 10) {
                    prerequisiteTimeShortage = (1 - (this.getLevel(planet.roboticsFactory) + 1) / 11)
                }
                timeDiscount = 1 - (1 - prerequisiteTimeShortage) * 0.5;
            } else if (upgrade.upgrade === "roboticsFactory") {
                timeDiscount = (1 - (this.getLevel(planet.roboticsFactory) + 1) / (this.getLevel(planet.roboticsFactory) + 2))
            } else {
                timeDiscount = timeShortagePercent;
                mseProd = this.getPrerequisiteMSEProd(planet, upgrade.upgrade, curLevel);
            }

            let costs = this.addArrayValues(this.getPrerequisiteCosts(planet, upgrade.upgrade, curLevel), this.getCosts(planet, upgrade.upgrade, curLevel));
            let mseCost = this.getMSEValue(costs);
            
            upgradesToCheck.push({
                affected: upgrade.affected,
                affectedCoords: upgrade.affectedCoords,
                coords: upgrade.coords,
                upgrade: upgrade.upgrade,
                priority: upgrade.priority,
                resourceDiscount: resourceDiscount,
                timeDiscount: timeDiscount,
                amorColor: amorColor,
                mseProdHourly: mseProd,
                mseCost: mseCost,
                costs: costs,
                mseProduced: 0,
                upgradeLevel: curLevel + 1,
                finishedOnce: false,
            });
        });

        console.log(upgradesToCheck);

        let testAmortizationList = this.copyArray(amortizationList);
        let testPlanets = this.copyArray(this.json.player.planets);
        let maxMseSpend = maxMseProd;
        let resAvailable = this.getTotalResourcesAvailable();

        let upgradesToFinish = upgradesToCheck.length;

        let totalMseCost = 0;

        let blocks = this.checkPlanetBlocks();
        let queueTimes = {};
        let timeNow = GetCurrentUnixTimeInSeconds();
        blocks.forEach(block => {
            if(block.upgradeType == "research"){
                queueTimes["research"] = (parseInt(block.timeFinished) - timeNow) / 3600;
            } else {
                block.type.forEach(type => {
                    queueTimes[block.coords + "-" + type] = (parseInt(block.timeFinished) - timeNow) / 3600;
                });                    
            }
        });
        console.log(queueTimes);
        let hoursGenerationUsed = [0,0,0];
        let resourcesPerHour = this.getTotalHourlyProduction(false);
        console.log(resourcesPerHour);

        while((maxMseSpend > 0 && upgradesToFinish > 0) || (resAvailable[0] > 0 && resAvailable[1] > 0 && resAvailable[2] > 0)){
            let item = testAmortizationList[0];
//            console.log("new item");
//            console.log(item);
            let upgradePlanet = testPlanets.find(p => p.coords == item.coords);

            upgradesToCheck.forEach(upgrade => {
                if((upgrade.affectedCoords != "account" && item.coords != upgrade.coords)) return;
                if(this.intersectArrays(this.createArrayOfItem(item.type), this.createArrayOfItem(upgrade.affected)).length == 0) return;

//                console.log(upgrade.coords + " - " + upgrade.upgrade + " - " + this.getBigNumber(upgrade.mseProduced) + " - " + this.getBigNumber(upgrade.mseCost));
                
                if (upgrade.resourceDiscount > 0) { 
                    let currentDiscount = this.getCurrentDiscount(upgradePlanet, item.type);
                    let relativeDiscount = upgrade.resourceDiscount / (1 - currentDiscount);
                    upgrade.mseProduced += item.msecost * relativeDiscount;
                }
                if (upgrade.timeDiscount > 0) {
                    let level;
                    if (item.level.toString().includes("-")) {
                        level = parseInt(item.level.split("-")[1]);
                    } else {
                        level = parseInt(item.level);
                    }

                    let upgradeTime = this.getUpgradeTime(upgradePlanet, item.technology, level - 1);
                    let hourlyMseProd;
                    if (item.technology == "metal" || item.technology == "crystal" || item.technology == "deut")
                        hourlyMseProd = this.getExtraMSEProduction(upgradePlanet, item.technology, item.level - 1);
                    else
                        hourlyMseProd = this.getMSEProduction(upgradePlanet, item.technology, item.level);

                    upgrade.mseProduced += upgradeTime * upgrade.timeDiscount * hourlyMseProd;
                }

//                console.log(upgrade.coords + " - " + upgrade.upgrade + " - " + this.getBigNumber(upgrade.mseProduced) + " - " + this.getBigNumber(upgrade.mseCost));

                while(upgrade.mseProduced >= upgrade.mseCost){
                    amortizationList.push({
                        coords: upgrade.coords,
                        name: this.getPlanetByCoords(upgrade.coords).name,
                        technology: upgrade.upgrade,
                        level: upgrade.upgradeLevel,
                        amortization: totalMseCost / totalHourlyMseProd / 24,
                        amortizationStopped: "false",
                        costs: upgrade.costs,
                        msecost: upgrade.mseCost,
                        type: upgrade.amorType,
                        color: upgrade.amorColor,
                    });

//                    console.log("upgrading");
                    upgrade.costs = this.addArrayValues(upgrade.costs, this.getCosts(testPlanets.find(p => p.coords == upgrade.coords), upgrade.upgrade, upgrade.upgradeLevel));
                    upgrade.mseCost = this.getMSEValue(upgrade.costs);
                    upgrade.upgradeLevel++;
                    if(!upgrade.finishedOnce){
                        upgrade.finishedOnce = true;
                        upgradesToFinish--;
                    }
                }

//                console.log(upgrade.coords + " - " + upgrade.upgrade + " - " + this.getBigNumber(upgrade.mseProduced) + " - " + this.getBigNumber(upgrade.mseCost));
            });

            maxMseSpend -= item.msecost;
            totalMseCost += item.msecost;
//            console.log(item.color);
//            console.log(this.getBigNumber(maxMseSpend) + " - " + this.getBigNumber(totalMseCost) + " - " + this.getBigNumber(resAvailable[0])  + " / " + this.getBigNumber(resAvailable[1])  + " / " + this.getBigNumber(resAvailable[2]));

            if(item.color != this.getColor("toUnlock")){
                if(resAvailable[0] > 0 && resAvailable[1] > 0 && resAvailable[2] > 0) {
                    console.log(item);
                    let index = amortizationList.findIndex(a => a.id == item.id);
                    if (index >= 0) {
                        if(amortizationList[index].color == this.getColor("ready"))
                            amortizationList[index].color = this.getColor("recommended");
                    }
                    
                    let minLevel, maxLevel;
                    if(item.level.toString().includes('-')) {
                        let levels = item.level.split('-');
                        minLevel = parseInt(levels[0]) - 1;
                        maxLevel = parseInt(levels[1]) - 1;
                    } else {
                        minLevel = maxLevel = parseInt(item.level) - 1;
                    }

                    let maxGenerationTime = 0;

                    this.createArrayOfItem(item.type).forEach(type => {
                        if(queueTimes[item.coords + "-" + type] && queueTimes[item.coords + "-" + type] > maxGenerationTime) maxGenerationTime = queueTimes[item.coords + "-" + type];
                    });
                    
                    for(let l = minLevel; l <= maxLevel; l++){
                        console.log(maxGenerationTime);
                        let upgradeTime = this.getUpgradeTime(upgradePlanet, item.technology, l);
                        let costs = this.getCosts(upgradePlanet, item.technology, l);
                        console.log("time: " + upgradeTime);
                        console.log(costs);

                        console.log(hoursGenerationUsed);
                        console.log(resAvailable);
                        let generationTimeLeft = this.subtractArrayValues([maxGenerationTime, maxGenerationTime, maxGenerationTime], hoursGenerationUsed);
                        console.log(generationTimeLeft);
                        let generationNeeded = this.divideArrayValues(costs, resourcesPerHour);
                        console.log(generationNeeded);

                        for(let r = 0; r <= 2; r++){
                            if(generationNeeded[r] <= generationTimeLeft[r]){
                                hoursGenerationUsed[r] += generationNeeded[r];
                            } else {
                                if(generationTimeLeft[r] > 0) {
                                    hoursGenerationUsed[r] += generationTimeLeft[r];
                                }
                                let hoursLeft = generationNeeded[r] - Math.max(generationTimeLeft[r], 0);
                                resAvailable[r] -= hoursLeft * resourcesPerHour[r];
                            }
                        }
                        console.log(hoursGenerationUsed);
                        console.log(resAvailable);

                        this.createArrayOfItem(item.type).forEach(type => {
                            if(queueTimes[item.coords + "-" + type]) {
                                queueTimes[item.coords + "-" + type] += upgradeTime;
                            } else {
                                queueTimes[item.coords + "-" + type] = upgradeTime;
                            }
                        });
                        maxGenerationTime += upgradeTime;
                    }
                }
            }

            testAmortizationList[0] = this.upgradeAmortizationItem(item);
            testAmortizationList.sort((a, b) => a.amortization - b.amortization);
        }

        upgradesToCheck.forEach(upgrade => {
            if(!upgrade.finishedOnce){
                amortizationList.push({
                    coords: upgrade.coords,
                    name: this.getPlanetByCoords(upgrade.coords).name,
                    technology: upgrade.upgrade,
                    level: upgrade.upgradeLevel,
                    amortization: totalMseCost / totalHourlyMseProd / 24,
                    amortizationStopped: "true",
                    costs: upgrade.costs,
                    msecost: upgrade.mseCost,
                    type: upgrade.amorType,
                    color: upgrade.amorColor,
                });
            }
        });

        amortizationList.sort((a, b) => a.amortization - b.amortization);
        return amortizationList;
    }

    createArrayOfItem(item){
        if(!Array.isArray(item)) item = [item];
        return item;
    }

    intersectArrays(array1, array2){
        return array1.filter(value => array2.includes(value));
    }

    getCurrentDiscount(planet, upgradeType) {
        if(upgradeType == "plasma") {
            let bonus = 0;
            this.json.player.planets.forEach(p => {
                const lifeformBonus = this.getLifeformBonus(p);
                if (p.lifeforms?.techs?.length > 0) {
                    p.lifeforms.techs.forEach(t => {
                        if (t.id == "12209") {
                            bonus += 0.0015 * this.getLevel(t.level) * (1 + lifeformBonus);
                        }
                    });
                }
            });
            return bonus;
        }

        let buildings = planet.lifeforms?.buildings;
        if (!buildings) return 0;

        let totalDiscount = 0;
        if (upgradeType.includes("lifeformtech")) {
            let researchLevel = this.getLevel(buildings.roboticsResearchCentre || buildings.researchCentre || buildings.runeTechnologium || buildings.vortexChamber);
            totalDiscount += 0.0025 * researchLevel;
        }
        if (upgradeType.includes("rocktalbuilding")) {
            let buildingLevel = this.getLevel(buildings.megalith);
            totalDiscount += 0.01 * buildingLevel;
        }
        if (upgradeType.includes("mine")) {
            let buildingLevel = this.getLevel(buildings.mineralResearchCentre);
            totalDiscount += 0.005 * buildingLevel;
        }
        return totalDiscount;
    }

    upgradeAmortizationItem(item) {
        if (item.level.toString().includes("-")) {
            item.level = parseInt(item.level.split("-")[1]);
        } else {
            item.level = parseInt(item.level);
        }

        item.amortization = this.calculateAmortization(this.getPlanetByCoords(item.coords), item.technology, item.level);
        item.costs = this.getCosts(this.getPlanetByCoords(item.coords), item.technology, item.level);
        item.msecost = this.getMSEValue(item.costs);
        if (isNaN(item.amortization)) {
            item.amortization = 1000000000;
        }
        item.level += 1;
        return item;
    }

    copyArray(arrayToCopy) {
        return arrayToCopy.map(element => ({ ...element }));
    }

    createAmortization(planet, technology, level, amorType, amorColor, id) {
        level = this.getLevel(level);
        let costs = this.getCosts(planet, technology, parseInt(level));
        let mseCost = this.getMSEValue(costs);
        return {
            coords: planet.coords,
            name: planet.name,
            technology: technology,
            level: (parseInt(level) + 1),
            amortization: this.calculateAmortization(planet, technology, level),
            costs: costs,
            msecost: mseCost,
            type: amorType,
            color: amorColor,
            id: id
        };
    }

    calculateAmortization(planet, technology, level) {
        level = this.getLevel(level);
        if (technology == "astro") {
            //TODO: plasma and astro
        } else if (technology == "metal" || technology == "crystal" || technology == "deut") {
            return (this.getMSECosts(planet, technology, parseInt(level)) / this.getExtraMSEProduction(planet, technology, parseInt(level)) + this.getUpgradeTime(planet, technology, parseInt(level))) / 24;
        } else {
            return (this.getMSECosts(planet, technology, parseInt(level)) / this.getMSEProduction(planet, technology, parseInt(level)) + this.getUpgradeTime(planet, technology, parseInt(level))) / 24;
        }
    }

    createAccountProduction() {
        this.removeButtons();

        const pageContent = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent") || document.querySelector("#lfbuildingscomponent.maincontent") || document.querySelector("#lfresearchcomponent.maincontent"));
        const accountProductionDiv = this.createDOM("div", { class: "accountproduction" });
        pageContent.appendChild(accountProductionDiv);

        let divHeader = document.createElement('div');
        divHeader.innerHTML = `
            <div class="popup-header">
            <div class="title">Account production</div>
            <button settings-close-button class="close-button">&times;</button>
            </div>
            `;
        accountProductionDiv.appendChild(divHeader);

        let closeButton = document.querySelector(".close-button");
        closeButton.addEventListener("click", () => {
            let div = document.querySelector('.accountproduction');
            div.remove();
            this.checkPage();
        })
        const table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');
        const tableBody = document.createElement('tbody');

        let planets = this.json.player.planets;
        planets.sort((a, b) => parseInt(a.coords.split(":")[2]) - parseInt(b.coords.split(":")[2]));
        planets.sort((a, b) => parseInt(a.coords.split(":")[1]) - parseInt(b.coords.split(":")[1]));
        planets.sort((a, b) => parseInt(a.coords.split(":")[0]) - parseInt(b.coords.split(":")[0]));
        console.log(planets);

        let metalProd = 0, crystalProd = 0, deutProd = 0;

        planets.forEach(p => {
            let tr = document.createElement('tr');
            tr.style.marginLeft = 10;
            const metal = this.getLevel(p.metal);
            const crystal = this.getLevel(p.crystal);
            const deut = this.getLevel(p.deut);
            let text = p.coords + " - " + metal + "/" + crystal + "/" + deut + " - " + p.maxTemp + "°C - " + p.crawlers + "/" + this.calcMaxCrawlers(p) + " crawlers";

            metalProd += (30 + this.getRawProduction(p, "metal", metal) * (1 + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProd += (15 + this.getRawProduction(p, "crystal", crystal) * (1 + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProd += (this.getRawProduction(p, "deut", deut) * (1 + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;

            tr.appendChild(document.createTextNode(text));
            tableBody.appendChild(tr);
        });

        let tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("------"));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Plasmatechnology: " + this.getLevel(this.json.player.plasma)));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Astrophysics: " + this.getLevel(this.json.player.astro)));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Geologist: " + (this.json.player.geologist ? "On" : "Off")));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Commanding Staff: " + ((this.json.player.commander && this.json.player.admiral && this.json.player.engineer && this.json.player.geologist && this.json.player.technocrat) ? "On" : "Off")));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("------"));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Total passive income:"));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Per hour: " + this.getBigNumber(metalProd) + " metal, " + this.getBigNumber(crystalProd) + " crystal, " + this.getBigNumber(deutProd) + " deut"));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Per day: " + this.getBigNumber(metalProd * 24) + " metal, " + this.getBigNumber(crystalProd * 24) + " crystal, " + this.getBigNumber(deutProd * 24) + " deut"));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Per week: " + this.getBigNumber(metalProd * 24 * 7) + " metal, " + this.getBigNumber(crystalProd * 24 * 7) + " crystal, " + this.getBigNumber(deutProd * 24 * 7) + " deut"));
        tableBody.appendChild(tr);

        if (this.json.player.playerClass === PLAYER_CLASS_EXPLORER) {
            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("------"));
            tableBody.appendChild(tr);

            const dailyExpos = this.getAmountOfExpeditionsPerDay();

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Total expected average expedition income with " + dailyExpos + " per day as " + PLAYER_CLASS_EXPLORER + ":"));
            tableBody.appendChild(tr);

            const expoMetal = this.calcExpoResProdPerType("metal");
            const expoCrystal = this.calcExpoResProdPerType("crystal");
            const expoDeut = this.calcExpoResProdPerType("deut");
            const expoFleetMetal = this.calcExpoShipResProdPerType("metal");
            const expoFleetCrystal = this.calcExpoShipResProdPerType("crystal");
            const expoFleetDeut = this.calcExpoShipResProdPerType("deut");

            tr = document.createElement('tr');
            let td = document.createElement('td');
            td.innerHTML = '&nbsp';
            tr.appendChild(td);
            tableBody.appendChild(tr);

            const expoFleetValue = this.json.player.expofleetValue ? this.json.player.expofleetValue / 100 : 1;

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Avg resource per expo: " + this.getBigNumber(expoMetal) + " metal, " + this.getBigNumber(expoCrystal) + " crystal, " + this.getBigNumber(expoDeut) + " deut"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Avg fleet per expo (valued at " + expoFleetValue * 100 + "%): " + this.getBigNumber(expoFleetMetal) + " metal, " + this.getBigNumber(expoFleetCrystal) + " crystal, " + this.getBigNumber(expoFleetDeut) + " deut"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            td = document.createElement('td');
            td.innerHTML = '&nbsp';
            tr.appendChild(td);
            tableBody.appendChild(tr);

            const totalMetal = expoMetal + expoFleetMetal * expoFleetValue;
            const totalCrystal = expoCrystal + expoFleetCrystal * expoFleetValue;
            const totalDeut = expoDeut + expoFleetDeut * expoFleetValue;

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Per expo: " + this.getBigNumber(totalMetal) + " metal, " + this.getBigNumber(totalCrystal) + " crystal, " + this.getBigNumber(totalDeut) + " deut"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Per day: " + this.getBigNumber(totalMetal * dailyExpos) + " metal, " + this.getBigNumber(totalCrystal * dailyExpos) + " crystal, " + this.getBigNumber(totalDeut * dailyExpos) + " deut"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Per week: " + this.getBigNumber(totalMetal * dailyExpos * 7) + " metal, " + this.getBigNumber(totalCrystal * dailyExpos * 7) + " crystal, " + this.getBigNumber(totalDeut * dailyExpos * 7) + " deut"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("------"));
            tableBody.appendChild(tr);

            const minerProdPerHour = this.calcMinerProdHour();
            const extraMetal = minerProdPerHour[0] - metalProd;
            const extraCrystal = minerProdPerHour[1] - crystalProd;
            const extraDeut = minerProdPerHour[2] - deutProd;

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Total extra passive income as " + PLAYER_CLASS_COLLECTOR + ":"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Per hour: " + this.getBigNumber(extraMetal) + " metal, " + this.getBigNumber(extraCrystal) + " crystal, " + this.getBigNumber(extraDeut) + " deut"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Per day: " + this.getBigNumber(extraMetal * 24) + " metal, " + this.getBigNumber(extraCrystal * 24) + " crystal, " + this.getBigNumber(extraDeut * 24) + " deut"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Per week: " + this.getBigNumber(extraMetal * 24 * 7) + " metal, " + this.getBigNumber(extraCrystal * 24 * 7) + " crystal, " + this.getBigNumber(extraDeut * 24 * 7) + " deut"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("------"));
            tableBody.appendChild(tr);

            const expoProfitExplorer = this.calcExpoMseProfit(PLAYER_CLASS_EXPLORER);
            const minerMseBonus = this.calcMinerMseBonusProfitHour()
            console.log("expoprofit: " + this.getBigNumber(expoProfitExplorer));
            console.log("miner per hour: " + this.getBigNumber(minerMseBonus));
            console.log("Explorer expoProfit per hour: " + this.getBigNumber(expoProfitExplorer * this.getAmountOfExpeditionsPerDay() / 24));
            const expoProfitMiner = this.calcExpoMseProfit(PLAYER_CLASS_COLLECTOR);
            console.log("Miner expoProfit per hour: " + this.getBigNumber(expoProfitMiner * this.getAmountOfExpeditionsPerDay() / 24));

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("You should switch to " + PLAYER_CLASS_COLLECTOR + " when doing less then " + this.getBigNumber(minerMseBonus * 24 * 7 / expoProfitExplorer) + " expeditions per week."));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("You should switch to " + PLAYER_CLASS_COLLECTOR + " when doing less then " + this.getBigNumber(minerMseBonus * 24 * 7 / (expoProfitExplorer - expoProfitMiner)) + " expeditions per week when keep doing expeditions."));
            tableBody.appendChild(tr);
        }

        table.appendChild(tableBody);
        accountProductionDiv.appendChild(table);
    }

    createUpgradesList() {
        this.removeButtons();

        let blocks = this.checkPlanetBlocks();
        console.log(blocks);

        let div = document.querySelector('.upgradeslist');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent") || document.querySelector("#facilitiescomponent.maincontent") || document.querySelector("#lfbuildingscomponent.maincontent") || document.querySelector("#lfresearchcomponent.maincontent")).appendChild(this.createDOM("div", { class: "upgradeslist" }));

        let divHeader = document.createElement('div');
        divHeader.innerHTML = `
            <div class="popup-header">
            <div class="title">Upgrades List</div>
            <button settings-close-button class="close-button">&times;</button>
            </div>
            `
        div.appendChild(divHeader);

        let closeButton = document.querySelector(".close-button");
        closeButton.addEventListener("click", () => {
            let div = document.querySelector('.upgradeslist');
            div.remove();
            this.checkPage();
        })
        
        let table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');
        let tableBody = document.createElement('tbody');

        let planets = this.json.player.planets;
        console.log(planets);
        for (let r = 0; r < planets.length + 1; r++) {
            let tr = document.createElement('tr');
            tr.style.marginLeft = 10;
            let coords, buildingTime, lifeformBuildingTime, lifeformTechTime;        
    
            if (r == 0) {
                coords = "Coords";
                buildingTime = "Building";
                lifeformBuildingTime = "LF Building";
                lifeformTechTime = "LF Tech";
            } else {
                coords = planets[r - 1].coords;
                buildingTime = blocks.find(b => b.upgradeType == "building" && b.coords == coords)?.timeFinished ?? "-";
                lifeformBuildingTime = blocks.find(b => b.upgradeType == "lifeformbuilding" && b.coords == coords)?.timeFinished ?? "-";
                lifeformTechTime = blocks.find(b => b.upgradeType == "lifeformtech" && b.coords == coords)?.timeFinished ?? "-";
           
                if(buildingTime != "-") buildingTime = GetTimeString(GetRelativeSecondsToUnixTime(buildingTime));
                if(lifeformBuildingTime != "-") lifeformBuildingTime = GetTimeString(GetRelativeSecondsToUnixTime(lifeformBuildingTime));
                if(lifeformTechTime != "-") lifeformTechTime = GetTimeString(GetRelativeSecondsToUnixTime(lifeformTechTime));
            }

            let td1 = document.createElement('td');
            td1.appendChild(document.createTextNode(coords));
            tr.appendChild(td1);

            let td2 = document.createElement('td');
            td2.appendChild(document.createTextNode(buildingTime == undefined ? "Unknown" : buildingTime));
            tr.appendChild(td2);

            let td3 = document.createElement('td');
            td3.appendChild(document.createTextNode(lifeformBuildingTime));
            tr.appendChild(td3);

            let td4 = document.createElement('td');
            td4.appendChild(document.createTextNode(lifeformTechTime));
            tr.appendChild(td4);

            tableBody.appendChild(tr);
        }

        table.appendChild(tableBody);

        let divBody = document.createElement('div');
        divBody.appendChild(table);

        div.appendChild(divBody);
    }

    /**
     * @returns the total production per hour calculated in metal
     */
    getTotalHourlyMseProduction() {
        let ratio = this.json.player.ratio;
        let hourlyProd = this.getTotalHourlyProduction(true);
        this.getMSEValue(hourlyProd[0] + hourlyProd[1] / ratio[1] * ratio[0] + hourlyProd[2] / ratio[2] * ratio[0]);
    }

    getTotalHourlyProduction(includeExpoFleetGains) {
        let hourlyProd = [0,0,0];
        this.json.player.planets.forEach(p => {
            hourlyProd[0] += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            hourlyProd[1] += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            hourlyProd[2] += (this.getRawProduction(p, "deut", p.deut) * (1 + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;
        });

        let hourlyExpo = this.multiplyArray(this.calcExpoProfit(this.json.player.playerClass, includeExpoFleetGains), this.getAmountOfExpeditionsPerDay() / 24);
        return this.addArrayValues(hourlyProd, hourlyExpo);
    }

    calcMinerProdHour() {
        let planets = this.json.player.planets;
        let metalProdMiner = 0, crystalProdMiner = 0, deutProdMiner = 0;

        planets.forEach(p => {
            let maxCrawlers = this.calcMaxCrawlers(p)
            let maxCrawlerBonus = Math.min(0.5, (maxCrawlers * (this.json.player.geologist ? 1.1 : 1)) * 0.00045);
            let extraCrawlersBonus = Math.min(0.5, maxCrawlerBonus - Math.min(p.crawlers, maxCrawlers) * 0.0002);

            metalProdMiner += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + 0.25 + extraCrawlersBonus + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProdMiner += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + 0.25 + extraCrawlersBonus + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProdMiner += (this.getRawProduction(p, "deut", p.deut) * (1 + 0.25 + extraCrawlersBonus + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;
        });

        console.log("minerprod: " + this.getBigNumber(metalProdMiner) + " - " + this.getBigNumber(crystalProdMiner) + " - " + this.getBigNumber(deutProdMiner));
        return [metalProdMiner, crystalProdMiner, deutProdMiner];
    }

    calcMinerMseBonusProfitHour() {
        let ratio = this.json.player.ratio;

        let minerProd = this.calcMinerProdHour();

        let planets = this.json.player.planets;
        let metalProdMiner = 0, crystalProdMiner = 0, deutProdMiner = 0;
        let metalProd = 0, crystalProd = 0, deutProd = 0;

        planets.forEach(p => {
            metalProd += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProd += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProd += (this.getRawProduction(p, "deut", p.deut) * (1 + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;
        });

        console.log("prod:" + this.getBigNumber(metalProd) + " - " + this.getBigNumber(crystalProd) + " - " + this.getBigNumber(deutProd));
        return minerProd[0] - metalProd + (minerProd[1] - crystalProd) * ratio[0] / ratio[1] + (minerProd[2] - deutProd) * ratio[0] / ratio[2]
    }

    /**
     * 
     * @returns the average MSE an expedition produces
     */
    calcExpoMseProfit(playerClass) {
        return this.getMSEValue(this.calcExpoProfit(playerClass, true));
    }

    calcExpoProfit(playerClass, includeExpoFleetGains) {
        //TODO: calc blackhole/fuelcost
        let blackHole, fuelCost;
        blackHole = [0,0,0]; // 1 in 300 chance
        fuelCost = [0,0,0];
        let ship = this.calcExpoShipProd(playerClass);
        let res = this.calcExpoResProd(playerClass)

        console.log("avg mse ship 1 expo: " + this.getBigNumber(this.getMSEValue(ship)));
        console.log("avg mse res 1 expo: " + this.getBigNumber(this.getMSEValue(res)));
        if(!includeExpoFleetGains) 
            return this.subtractArrayValues(res, fuelCost);
        else
        {
            let gains = this.addArrayValues(ship, res);
            let losses = this.addArrayValues(blackHole, fuelCost);
            return this.subtractArrayValues(gains, losses);
        }
    }

    GetAverageExpoFind(playerClass) {
        const topscore = this.json.settings.topscore;
        let maxBase;
        if (topscore < 10000) maxBase = 40000;
        else if (topscore < 100000) maxBase = 500000;
        else if (topscore < 1000000) maxBase = 1200000;
        else if (topscore < 5000000) maxBase = 1800000;
        else if (topscore < 25000000) maxBase = 2400000;
        else if (topscore < 50000000) maxBase = 3000000;
        else if (topscore < 75000000) maxBase = 3600000;
        else if (topscore < 100000000) maxBase = 4200000;
        else maxBase = 5000000;

        const naviFactor = 2;
        const explorerFactor = 1.5 * parseInt(this.json.settings.economySpeed);
        let max = maxBase * naviFactor * (playerClass == PLAYER_CLASS_EXPLORER ? explorerFactor : 1);
        let averageFactor = (0.89 * (10 + 50) + 0.1 * (50 + 100) + 0.01 * (100 + 200)) / 2;
        return max * averageFactor / 200;
    }

    calcBaseExpoResMseProd(playerClass) {
        return this.getMSEValue(this.calcBaseExpoResProd(playerClass));
    }

    calcBaseExpoResProd(playerClass) {
        let metalFind, crystalFind, deutFind;
        let averageFind = this.GetAverageExpoFind(playerClass ?? this.json.player.playerClass);
        metalFind = averageFind;
        crystalFind = averageFind / 2;
        deutFind = averageFind / 3;
        let res = [0.685 * metalFind, 0.24 * crystalFind, 0.075 * deutFind];
        return this.multiplyArray(res, 0.325);
    }

    calcExpoResMseProd(playerClass) {
        return this.calcBaseExpoResMseProd(playerClass) * (1 + this.calcExpoResBonus());
    }

    calcExpoResProd(playerClass) {
        return this.multiplyArray(this.calcBaseExpoResProd(playerClass), (1 + this.calcExpoResBonus()));
    }

    calcExpoResBonus() {
        if (this.json.settings.lifeforms) {
            let bonus = 0.0;
            this.json.player.planets.forEach(p => {
                const lifeformBonus = this.getLifeformBonus(p);
                if (p.lifeforms?.techs?.length > 0) {
                    p.lifeforms?.techs?.forEach(t => {
                        if (t.id == "14205" || t.id == "14211") {
                            bonus += 0.002 * this.getLevel(t.level) * (1 + lifeformBonus);
                        }
                    });
                }
            });
            return bonus;
        } else {
            return 0;
        }
    }

    calcExpoClassBoosterBonus() {
        if (this.json.settings.lifeforms) {
            let bonus = 0.0;
            this.json.player.planets.forEach(p => {
                const lifeformBonus = this.getLifeformBonus(p);
                if (p.lifeforms?.techs?.length > 0) {
                    p.lifeforms?.techs?.forEach(t => {
                        if (t.id == "14218") {
                            bonus += 0.002 * this.getLevel(t.level) * (1 + lifeformBonus);
                        }
                    });
                }
            });
            return bonus;
        } else {
            return 0;
        }
    }

    getLifeformBonus(planet) {
        let level = 0;
        let bonus = 0;
        switch (planet.lifeforms?.lifeformClass) {
            case LIFEFORM_CLASS_MENSEN:
                level = this.json.player.lifeformLevels?.mensen ?? 0;
                bonus += 0.005 * this.getLevel(planet.lifeforms.buildings.metropolis);
                break;
            case LIFEFORM_CLASS_ROCKTAL:
                level = this.json.player.lifeformLevels?.rocktal ?? 0;
                break;
            case LIFEFORM_CLASS_MECHA:
                level = this.json.player.lifeformLevels?.mecha ?? 0;
                bonus += 0.003 * this.getLevel(planet.lifeforms.buildings.chipMassProduction);
                bonus += 0.003 * this.getLevel(planet.lifeforms.buildings.highPerformanceTransformer);
                break;
            case LIFEFORM_CLASS_KAELESH:
                level = this.json.player.lifeformLevels?.kaelesh ?? 0;
                break;
            default:
                level = 0;
                break;
        }
        return bonus + level * 0.001;
    }

    calcExpoResProdPerType(resource) {
        let factor;
        switch (resource) {
            case "metal":
                factor = .685;
                break;
            case "crystal":
                factor = .24 / 2
                break;
            case "deut":
                factor = 0.075 / 3;
                break;
        }
        const resPercentage = .325;
        return this.GetAverageExpoFind(this.json.player.playerClass) * (1 + this.calcExpoResBonus()) * resPercentage * factor;
    }

    calcExpoShipResProdPerType(resource) {
        let factor;
        switch (resource) {
            case "metal":
                factor = .54;
                break;
            case "crystal":
                factor = .46
                break;
            case "deut":
                factor = 0.093;
                break;
        }
        const shipPercentage = .22;
        return this.GetAverageExpoFind(this.json.player.playerClass) * (1 + this.calcExpoShipBonus()) * shipPercentage * factor;
    }

    calcExpoShipMseProd(playerClass) {
        return this.calcBaseExpoShipMseProd(playerClass) * (1 + this.calcExpoShipBonus());
    }

    calcBaseExpoShipMseProd(playerClass) {
        return this.getMSEValue(this.calcBaseExpoShipProd(playerClass));
    }

    calcExpoShipProd(playerClass) {
        return this.multiplyArray(this.calcBaseExpoShipProd(playerClass), (1 + this.calcExpoShipBonus()));
    }

    calcBaseExpoShipProd(playerClass) {
        let expofleetValue = 1;
        if (this.json.player.expofleetValue) {
            expofleetValue = this.json.player.expofleetValue / 100;
        }
        let ship = [0.54, 0.46, 0.093];
        return this.multiplyArray(ship, this.GetAverageExpoFind(playerClass ?? this.json.player.playerClass) * 0.22 * expofleetValue);
    }

    calcExpoShipBonus() {
        if (this.json.settings.lifeforms) {
            let bonus = 0;
            this.json.player.planets.forEach(p => {
                const lifeformBonus = this.getLifeformBonus(p);
                if (p.lifeforms?.techs?.length > 0) {
                    p.lifeforms.techs.forEach(t => {
                        if (t.id == "14204") {
                            bonus += 0.002 * this.getLevel(t.level) * (1 + lifeformBonus);
                        }
                    });
                }
            });
            return bonus;
        } else {
            return 0;
        }
    }

    getBigNumber(number) {
        number = Math.round(number);
        number = number.toString();

        const isNegative = number[0] == '-';
        if (isNegative) number = number.substring(1, number.length);

        let digits = number.length;

        for (let d = 3, dotsplaced = 0; d < digits; d += 3, dotsplaced++) {
            number = number.substring(0, digits - d) + "." + number.substring(digits - d, digits + dotsplaced);
        }

        if (isNegative) number = "-" + number;
        return number;
    }

    calcMaxCrawlers(planet, verzamelaarVersterker = 0) {
        return (this.getLevel(planet.metal) + this.getLevel(planet.crystal) + this.getLevel(planet.deut)) * 8 * ((this.json.player.playerClass == PLAYER_CLASS_COLLECTOR && this.json.player.geologist) ? 1 + 0.1 * (1 + verzamelaarVersterker) : 1);
    }

    checkPage() {
        let currentPlanet = (document.querySelector(".smallplanet .active") || document.querySelector(".smallplanet .planetlink")).parentNode;
        let currentCoords = this.trimCoords(currentPlanet.querySelector(".planet-koords"));
        let currentHasMoon = currentPlanet.querySelector(".moonlink") ? true : false;
        let currentIsMoon = currentHasMoon && currentPlanet.querySelector(".moonlink.active") ? true : false;
     
        this.checkPlanets();
        
        let index = this.json.player.planets.findIndex(p => p.coords == currentCoords);
        
        this.checkResources(index, currentIsMoon);

        let resources = this.getTotalResourcesAvailable();

        console.log(this.getBigNumber(resources[0]));
        console.log(this.getBigNumber(resources[1]));
        console.log(this.getBigNumber(resources[2]));

        let rawURL = new URL(window.location.href);
        let page = rawURL.searchParams.get("component") || rawURL.searchParams.get("page");
        if (page === OVERVIEW) {
            this.checkBoosters();
            if (document.querySelector("#characterclass .explorer")) {
                this.json.player.playerClass = PLAYER_CLASS_EXPLORER;
            } else if (document.querySelector("#characterclass .warrior")) {
                this.json.player.playerClass = PLAYER_CLASS_GENERAL;
            } else if (document.querySelector("#characterclass .miner")) {
                this.json.player.playerClass = PLAYER_CLASS_COLLECTOR;
            } else {
                this.json.player.playerClass = PLAYER_CLASS_NONE;
            }
            if (!currentIsMoon) {
                console.log(textContent);
                if (this.json.player.planets[index]) {
                    this.json.player.planets[index].maxTemp = parseInt(textContent[3].split("°C")[1].split(" ")[2]);
                } else {
                    this.json.player.planets[index] = {
                        maxTemp: parseInt(textContent[3].split("°C")[1].split(" ")[2])
                    };
                }

                this.checkStaff();
                this.saveData();
            }
            this.createButtons();
        } else if (page === RESOURCES) {
            this.checkPlanets();
            if (!currentIsMoon) {
                console.log("update mines " + currentCoords);
                let index = this.json.player.planets.findIndex(p => p.coords == currentCoords);
                if (this.json.player.planets[index]) {
                    this.json.player.planets[index].metal = this.getTechnologyLevel("metalMine");
                    this.json.player.planets[index].crystal = this.getTechnologyLevel("crystalMine");
                    this.json.player.planets[index].deut = this.getTechnologyLevel("deuteriumSynthesizer");
                    this.json.player.planets[index].solar = this.getTechnologyLevel("solarPlant");
                    this.json.player.planets[index].fusion = this.getTechnologyLevel("fusionPlant");
                    this.json.player.planets[index].crawlers = document.querySelector(".technology.resbuggy .amount").getAttribute("data-value");
                    this.json.player.planets[index].satellite = document.querySelector(".technology.solarSatellite .amount").getAttribute("data-value");
                } else {
                    this.json.player.planets[index] = {
                        metal: this.getTechnologyLevel("metalMine"),
                        crystal: this.getTechnologyLevel("crystalMine"),
                        deut: this.getTechnologyLevel("deuteriumSynthesizer"),
                        solar: this.getTechnologyLevel("solarPlant"),
                        fusion: this.getTechnologyLevel("fusionPlant"),
                        crawlers: document.querySelector(".technology.resbuggy .amount").getAttribute("data-value"),
                        satellite: document.querySelector(".technology.solarSatellite .amount").getAttribute("data-value")
                    };
                }
                this.saveData();
            }
            this.createButtons(currentCoords);
            //TODO: GET FUSION/STORAGES
        } else if (page === FACILITIES) {
            this.checkPlanets();
            if (!currentIsMoon) {
                console.log("update facilities " + currentCoords);
                let index = this.json.player.planets.findIndex(p => p.coords == currentCoords);
                console.log(this.json.player.planets[index]);
                if (this.json.player.planets[index]) {
                    this.json.player.planets[index].roboticsFactory = this.getTechnologyLevel("roboticsFactory");
                    this.json.player.planets[index].shipyard = this.getTechnologyLevel("shipyard");
                    this.json.player.planets[index].researchlab = this.getTechnologyLevel("researchLaboratory");
                    this.json.player.planets[index].missileSilo = this.getTechnologyLevel("missileSilo");
                    this.json.player.planets[index].nanite = this.getTechnologyLevel("naniteFactory");
                } else {
                    this.json.player.planets[index] = {
                        roboticsFactory: this.getTechnologyLevel("roboticsFactory"),
                        shipyard: this.getTechnologyLevel("shipyard"),
                        researchlab: this.getTechnologyLevel("researchLaboratory"),
                        missileSilo: this.getTechnologyLevel("missileSilo"),
                        nanite: this.getTechnologyLevel("naniteFactory")
                    };
                }
                this.saveData();
            }
            this.createButtons(currentCoords);
        } else if (page === LIFEFORM) {
            let planetIndex = this.json.player.planets.findIndex(p => p.coords == currentCoords);
            let planet = this.checkCurrentLifeform(this.json.player.planets[planetIndex]);
            console.log("lifeform buildings");
            console.log(document.querySelectorAll(".technology"));
            let buildings = planet.lifeforms.buildings;
            if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN) {
                buildings.residentialSector = this.getTechnologyLevel("lifeformTech11101");
                buildings.biosphereFarm = this.getTechnologyLevel("lifeformTech11102");
                buildings.researchCentre = this.getTechnologyLevel("lifeformTech11103");
                buildings.academyOfSciences = this.getTechnologyLevel("lifeformTech11104");
                buildings.neuroCalibrationCentre = this.getTechnologyLevel("lifeformTech11105");
                buildings.highEnergySmelting = this.getTechnologyLevel("lifeformTech11106");
                buildings.foodSilo = this.getTechnologyLevel("lifeformTech11107");
                buildings.fusionPoweredProduction = this.getTechnologyLevel("lifeformTech11108");
                buildings.skyscraper = this.getTechnologyLevel("lifeformTech11109");
                buildings.biotechLab = this.getTechnologyLevel("lifeformTech11110");
                buildings.metropolis = this.getTechnologyLevel("lifeformTech11111");
                buildings.planetaryShield = this.getTechnologyLevel("lifeformTech11112");
            } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                buildings.meditationEnclave = this.getTechnologyLevel("lifeformTech12101");
                buildings.crystalFarm = this.getTechnologyLevel("lifeformTech12102");
                buildings.runeTechnologium = this.getTechnologyLevel("lifeformTech12103");
                buildings.runeForge = this.getTechnologyLevel("lifeformTech12104");
                buildings.oriktorium = this.getTechnologyLevel("lifeformTech12105");
                buildings.magmaForge = this.getTechnologyLevel("lifeformTech12106");
                buildings.disruptionChamber = this.getTechnologyLevel("lifeformTech12107");
                buildings.megalith = this.getTechnologyLevel("lifeformTech12108");
                buildings.crystalRefinery = this.getTechnologyLevel("lifeformTech12109");
                buildings.deuteriumSynthesizer = this.getTechnologyLevel("lifeformTech12110");
                buildings.mineralResearchCentre = this.getTechnologyLevel("lifeformTech12111");
                buildings.advancedRecyclingPlant = this.getTechnologyLevel("lifeformTech12112");
            } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                buildings.assemblyLine = this.getTechnologyLevel("lifeformTech13101");
                buildings.fusionCellFactory = this.getTechnologyLevel("lifeformTech13102");
                buildings.roboticsResearchCentre = this.getTechnologyLevel("lifeformTech13103");
                buildings.updateNetwork = this.getTechnologyLevel("lifeformTech13104");
                buildings.quantumComputerCentre = this.getTechnologyLevel("lifeformTech13105");
                buildings.automatisedAssemblyCentre = this.getTechnologyLevel("lifeformTech13106");
                buildings.highPerformanceTransformer = this.getTechnologyLevel("lifeformTech13107");
                buildings.microchipAssemblyLine = this.getTechnologyLevel("lifeformTech13108");
                buildings.productionAssemblyHall = this.getTechnologyLevel("lifeformTech13109");
                buildings.highPerformanceSynthesizer = this.getTechnologyLevel("lifeformTech13110");
                buildings.chipMassProduction = this.getTechnologyLevel("lifeformTech13111");
                buildings.nanoRepairBots = this.getTechnologyLevel("lifeformTech13112");
            } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_KAELESH) {
                buildings.sanctuary = this.getTechnologyLevel("lifeformTech14101");
                buildings.antimatterCondenser = this.getTechnologyLevel("lifeformTech14102");
                buildings.vortexChamber = this.getTechnologyLevel("lifeformTech14103");
                buildings.hallsOfRealisation = this.getTechnologyLevel("lifeformTech14104");
                buildings.forumOfTranscendence = this.getTechnologyLevel("lifeformTech14105");
                buildings.antimatterConvector = this.getTechnologyLevel("lifeformTech14106");
                buildings.cloningLaboratory = this.getTechnologyLevel("lifeformTech14107");
                buildings.chrysalisAccelerator = this.getTechnologyLevel("lifeformTech14108");
                buildings.bioModifier = this.getTechnologyLevel("lifeformTech14109");
                buildings.psionicModulator = this.getTechnologyLevel("lifeformTech14110");
                buildings.shipManufacturingHall = this.getTechnologyLevel("lifeformTech14111");
                buildings.supraRefractor = this.getTechnologyLevel("lifeformTech14112");
            }
            this.createButtons(currentCoords);
        } else if (page === LIFEFORM_RESEARCH) {
            let planetIndex = this.json.player.planets.findIndex(p => p.coords == currentCoords);
            let planet = this.checkCurrentLifeform(this.json.player.planets[planetIndex]);
            let techs = [];
            for (let s = 1; s <= 18; s++) {
                let tech = this.getTechnologyFromSlot(s);
                if (tech) techs.push(tech);
            }
            console.log(techs);
            planet.lifeforms.techs = techs;
            this.createButtons(currentCoords);
        } else if (page === LIFEFORM_SETTINGS) {
            let planet = this.json.player.planets.find(p => p.coords == currentCoords);
            let lf = document.querySelector(".lifeform-item-wrapper");
            let level = parseInt(lf.childNodes[9].innerHTML.split(' ')[1].split(':')[0]);
            console.log(planet.lifeforms.lifeformClass + " level " + level);
            if (!this.json.player.lifeformLevels)
                this.json.player.lifeformLevels = {};
            switch (planet.lifeforms.lifeformClass) {
                case LIFEFORM_CLASS_MENSEN:
                    this.json.player.lifeformLevels.mensen = level;
                    break;
                case LIFEFORM_CLASS_ROCKTAL:
                    this.json.player.lifeformLevels.rocktal = level;
                    break;
                case LIFEFORM_CLASS_MECHA:
                    this.json.player.lifeformLevels.mecha = level;
                    break;
                case LIFEFORM_CLASS_KAELESH:
                    this.json.player.lifeformLevels.kaelesh = level;
                    break;
            }
            console.log(this.json.player);
            this.saveData();
        } else if (page === FACILITIES) {
            //TODO: UPDATE FACILITIES
        } else if (page === RESEARCH) {
            this.json.player.energy = this.getTechnologyLevel("energyTechnology");
            this.json.player.laser = this.getTechnologyLevel("laserTechnology");
            this.json.player.ion = this.getTechnologyLevel("ionTechnology");
            this.json.player.plasma = this.getTechnologyLevel("plasmaTechnology");
            this.json.player.impuls = this.getTechnologyLevel("impulseDriveTechnology");
            this.json.player.spy = this.getTechnologyLevel("espionageTechnology");
            this.json.player.computer = this.getTechnologyLevel("computerTechnology");
            this.json.player.astro = this.getTechnologyLevel("astrophysicsTechnology");
            this.json.player.igon = this.getTechnologyLevel("researchNetworkTechnology");
            this.saveData();
            //TODO: UPDATE RESEARCH
        } else if (page === ALLIANCE) {
            setTimeout(() => {
                if (document.querySelector(".value.alliance_class.small.explorer")) {
                    console.log("ally explorer");
                    this.json.player.allyClass = ALLY_CLASS_EXPLORER;
                } else if (document.querySelector(".value.alliance_class.small.warrior")) {
                    console.log("ally warrior");
                    this.json.player.allyClass = ALLY_CLASS_WARRIOR;
                } else if (document.querySelector(".value.alliance_class.small.trader")) {
                    console.log("ally trader");
                    this.json.player.allyClass = ALLY_CLASS_TRADER;
                } else {
                    console.log("ally none");
                    this.json.player.allyClass = ALLY_CLASS_NONE;
                }
                this.saveData();
            }, 50);
        } else if (page === MESSAGES) {
            let messageAnalyzer = new MessageAnalyzer(UNIVERSE, this.json.player.ratio, this.getAmountOfExpeditionSlots(), this.json.settings.economySpeed);
            messageAnalyzer.doMessagesPage();
        }
    }

    checkResources(index, currentIsMoon){
        let resources = {};

        let metalElement = document.getElementById("resources_metal");
        resources.metal = metalElement.getAttribute("data-raw");
        let crystalElement = document.getElementById("resources_crystal");
        resources.crystal = crystalElement.getAttribute("data-raw");
        let deutElement = document.getElementById("resources_deuterium");
        resources.deut = deutElement.getAttribute("data-raw");
        resources.timestamp = GetCurrentUnixTimeInSeconds();

        if(this.json.player.planets[index].resources == undefined) this.json.player.planets[index].resources = {};
        
        if(currentIsMoon){
            this.json.player.planets[index].resources.moon = resources;
        } else {
            this.json.player.planets[index].resources.planet = resources;
        }
    }

    getTotalResourcesAvailable(){
        let metal = 0, crystal = 0, deut = 0;
        this.json.player.planets.forEach(p => {
            if(p.resources?.planet){
                metal += parseInt(p.resources.planet.metal);
                crystal += parseInt(p.resources.planet.crystal);
                deut += parseInt(p.resources.planet.deut);
            }
            if(p.resources?.moon){
                metal += parseInt(p.resources.moon.metal);
                crystal += parseInt(p.resources.moon.crystal);
                deut += parseInt(p.resources.moon.deut);
            }
        });

        return [metal, crystal, deut];
    }

    createButtons(coords = undefined) {
        let div = document.querySelector('.amortizationtableAbsolute');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent") || document.querySelector("#facilitiescomponent.maincontent") || document.querySelector("#lfbuildingscomponent.maincontent") || document.querySelector("#lfresearchcomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtable" }));
        div.addEventListener("click", () => this.createAmortizationTable(coords, "absolute"));
        div.appendChild(document.createTextNode("Absolute Amortization Table"));

        div = document.querySelector('.amortizationtableRecursive');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent") || document.querySelector("#facilitiescomponent.maincontent") || document.querySelector("#lfbuildingscomponent.maincontent") || document.querySelector("#lfresearchcomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtable" }));
        div.addEventListener("click", () => this.createAmortizationTable(coords, "recursive"));
        div.appendChild(document.createTextNode("Recursive Amortization Table"));

        if (coords == undefined) {
            div = document.querySelector('.accountproduction');
            div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent")).appendChild(this.createDOM("div", { class: "accountproduction" }));
            div.addEventListener("click", () => this.createAccountProduction());
            div.appendChild(document.createTextNode("Account Production"));

            div = document.querySelector('.upgradeslist');
            div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent")).appendChild(this.createDOM("div", { class: "upgradeslist" }));
            div.addEventListener("click", () => this.createUpgradesList());
            div.appendChild(document.createTextNode("Upgrades List"));
        }
    }

    openSettings() {
        let container = document.createElement("div");
        container.classList.add("popup-overlay");

        let ratioString = this.json.player.ratio[0] + "/" + this.json.player.ratio[1] + "/" + this.json.player.ratio[2];

        if (this.json.player.expofleetValue?.metalCrystal)
            this.json.player.expofleetValue = this.json.player.expofleetValue.metalCrystal;

        let popupTemplate = `
            <div class="popup">
                <div class="popup-header">
                    <div class="title">Calculator Settings</div>
                    <button settings-close-button class="close-button">&times;</button>
                </div>
                <div class="popup-body">
                    <table style="width:100%;margin-left:auto;margin-right:auto;">
                    <tr>    
                        <td><label for="Ratio">Ratio:</label></td>
                        <td><input type="text" id="Ratio" ratio="Ratio" style="width:100%" value="${ratioString}"></td>
                    </tr>
                    <tr>    
                        <td><label for="Exporounds">Override exporounds per day (set to -1 to read out expeditions messages):</label></td>
                        <td><input type="text" id="Exporounds" Exporounds="Exporounds" style="width:100%" value="${this.json.player.exporounds ?? -1}"></td>
                    </tr>
                    <tr>    
                        <td><label for="ExpoFleetValue">Expo fleet value (percentage):</label></td>
                        <td><input type="text" id="ExpoFleetValue" ExpoFleetValue="ExpoFleetValue" style="width:100%" value="${this.json.player.expofleetValue ?? 100}"></td>
                    </tr>
                    <tr>    
                        <td><label for="RecursiveListAmount">Amount of upgrades in recursive list:</label></td>
                        <td><input type="text" id="RecursiveListAmount" RecursiveListAmount="RecursiveListAmount" style="width:100%" value="${this.json.player.recursiveListAmount ?? 50}"></td>
                    </tr>
                    <tr>    
                        <td><label for="IncludeIndirectProductionBuildings">Indirect production upgrades in amortizationtable (true/false)(WIP, calculation times 5+ sec):</label></td>
                        <td><input type="text" id="IncludeIndirectProductionBuildings" IncludeIndirectProductionBuildings="IncludeIndirectProductionBuildings" style="width:100%" value="${this.json.player.includeIndirectProductionBuildings == "true" ?? "false"}"></td>
                    </tr>
                    <tr style="height:30px"></tr>
                    <tr>
                        <td></td>
                        <td><button class="save-button">Save</button></td>
                    </tr>
                    </table>
                </div>
            </div>
        `;

        container.innerHTML = popupTemplate;
        document.body.appendChild(container)

        this.openPopup(container);
    }

    saveSettings() {
        let newRatio = document.querySelector("#Ratio").value.replaceAll(",", ".");
        newRatio = newRatio.split("/");
        this.json.player.ratio = [parseFloat(newRatio[0]), parseFloat(newRatio[1]), parseFloat(newRatio[2])];
        this.json.player.exporounds = parseInt(document.querySelector("#Exporounds").value);
        if (!this.json.player.expofleetValue) {
            this.json.player.expofleetValue = {};
        }
        this.json.player.expofleetValue = parseInt(document.querySelector("#ExpoFleetValue").value);
        this.json.player.recursiveListAmount = parseInt(document.querySelector("#RecursiveListAmount").value);
        this.json.player.includeIndirectProductionBuildings = document.querySelector("#IncludeIndirectProductionBuildings").value;

        this.saveData();
    }

    openPopup(popup) {
        if (!popup) return;

        let button = document.querySelector(".close-button");
        button.addEventListener("click", () => this.closePopup(popup));

        button = document.querySelector(".save-button");
        button.addEventListener("click", () => { this.saveSettings(); this.closePopup(popup); });

        popup.classList.add("active");
    }

    closePopup(popup) {
        if (popup == null) return;

        popup.classList.remove("active");
        popup.classList.remove("popup-overlay");
        document.body.removeChild(popup);
    }

    removeButtons() {
        let div = document.querySelector('.amortizationtable');
        if (div) {
            div.remove();
        }

        div = document.querySelector('.amortizationtable');
        if (div) {
            div.remove();
        }

        div = document.querySelector('.accountproduction');
        if (div) {
            div.remove();
        }

        div = document.querySelector('.upgradeslist');
        if (div) {
            div.remove();
        }
    }

    getTechnologyLevel(technologysearch) {
        let level = document.querySelector(".technology." + technologysearch + " .level").getAttribute("data-value");
        if (document.querySelector(".technology." + technologysearch).getAttribute("data-status") == "active") {
            level = { level: parseInt(level) + 1, timeFinished: document.querySelector(".technology." + technologysearch).getAttribute("data-end") };
        }
        return level;
    }

    getTechnologyFromSlot(slot) {
        if (slot < 10) {
            slot = "0" + slot;
        }

        for (let i = 1; i <= 4; i++) {
            if (document.querySelector(".technology.lifeformTech1" + i + "2" + slot)) {
                return {
                    id: "1" + i + "2" + slot,
                    name: document.querySelector(".technology.lifeformTech1" + i + "2" + slot).getAttribute("title").split("<br/>")[0].replace("\n", ""),
                    level: this.getTechnologyLevel("lifeformTech1" + i + "2" + slot)
                }
            }
        }

        return undefined;
    }

    checkCurrentLifeform(planet) {
        let lifeformClass = "none";
        if (document.querySelector("#lifeform .lifeform1")) {
            lifeformClass = LIFEFORM_CLASS_MENSEN;
        } else if (document.querySelector("#lifeform .lifeform2")) {
            lifeformClass = LIFEFORM_CLASS_ROCKTAL;
        } else if (document.querySelector("#lifeform .lifeform3")) {
            lifeformClass = LIFEFORM_CLASS_MECHA;
        } else if (document.querySelector("#lifeform .lifeform4")) {
            lifeformClass = LIFEFORM_CLASS_KAELESH;
        } else {
            console.warn("Unknown lifeform: " + document.querySelector("#lifeform"));
        }

        if (lifeformClass == "none") return planet;


        if (!planet.lifeforms) planet.lifeforms = {};

        if (!planet.lifeforms.lifeformClass || lifeformClass != planet.lifeforms.lifeformClass) {
            planet.lifeforms.lifeformClass = lifeformClass;
            planet.lifeforms.buildings = {};
            planet.lifeforms.techs = [];
        }
        return planet;
    }

    getColor(colortype){
        switch(colortype){
            case "ready":
                return "#00ff00";
            case "soon":
                return "#ffff00";
            case "blocked":
                return "#ff0000";
            case "toUnlock":
                return "#ffa500";
            case "recommended":
                return "#add8e6";
        }
    }
}

(async () => {
    let helper = new OgameHelper();
    setTimeout(function () {
        helper.run();
    }, 0);
})();