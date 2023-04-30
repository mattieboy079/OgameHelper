import { Player } from './logic/player.js';

const PLAYER_CLASS_EXPLORER = "ontdekker";
const PLAYER_CLASS_WARRIOR = "generaal";
const PLAYER_CLASS_MINER = "verzamelaar";
const PLAYER_CLASS_NONE = "-";

const ALLY_CLASS_EXPLORER = "onderzoeker";
const ALLY_CLASS_WARRIOR = "krijger";
const ALLY_CLASS_MINER = "handelaar";
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

let METAALMIJN;
let KRISTALMIJN;
let DEUTFABRIEK;
let PLASMATECHNIEK;
let ASTROFYSICA;

const logging = "test"; //prod, dev, debug, test

function getXMLData(xml){
    xml.then((rep) => rep.text()).then((str) => new window.DOMParser().parseFromString(str, "text/xml")).then((xml) => {return xml});
}

function getServerSettingsURL(universe){
    return `https://${universe}.ogame.gameforge.com/api/serverData.xml`;
}

function getPlayers(universe){
    return getXMLData(fetch(`https://${universe}.ogame.gameforge.com/api/players.xml`));
}

function getAlliances(universe){
    return getXMLData(fetch(`https://${universe}.ogame.gameforge.com/api/alliances.xml`));
}

function getHighscore(universe, category, type){
    return getXMLData(fetch(`https://${universe}.ogame.gameforge.com/api/highscore.xml?category=${category}&type=${type}`));
}

function getUniverse(universe){
    return getXMLData(fetch(`https://${universe}.ogame.gameforge.com/api/universe.xml`));
}

const UNIVERSE = window.location.host.split(".")[0];
const CULTURE = UNIVERSE.split("-")[1];




function getLanguage(){
    fetch(`https://${UNIVERSE}.ogame.gameforge.com/api/localization.xml`)
    .then((rep) => rep.text())
    .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
    .then((xml) => {
        console.log(xml.querySelector("techs"));
        //METAALMIJN = xml.querySelector("")
    });
}


console.log(UNIVERSE);

class OgameHelper {
    constructor(){
        let data = localStorage.getItem("ogh-" + UNIVERSE);
        if(data && data !== "undefined"){   
            this.json = JSON.parse(data);
            console.log(this.json);
            let player = this.json.player;
            let newPlayer = new Player(this.json.player);
            console.log(newPlayer);
            this.getServerSettings(UNIVERSE);
            if(!this.json.player){
                this.getPlayerInfo();
                this.saveData();
            }
        } else {
            this.log("new");
            this.json = {};
            this.getServerSettings(UNIVERSE);
            this.getPlayerInfo();
            this.log(this.json);
        }
    }

    /**
     * 
     * @param {string} log 
     * @param {string} loglevel standard: dev
     */
    log(message, loglevel = "dev") {
        const levels = {
            prod: 1,
            dev: 2,
            debug: 3,
            test: 4
        };
      
        const loggingLevel = levels[logging] || 0;
        const messageLevel = levels[loglevel] || 0;
      
        if (loggingLevel === 4) {
            if (messageLevel === 4) {
                console.log(message);
            }
        } else if (loggingLevel >= messageLevel) {
          console.log(message);
        }
    }

    getPlayerInfo(){
        this.json.player = {};
        if (document.querySelector("#characterclass .explorer")) {
            this.json.player.playerClass = PLAYER_CLASS_EXPLORER;
        } else if (document.querySelector("#characterclass .warrior")) {
            this.json.player.playerClass = PLAYER_CLASS_WARRIOR;
        } else if (document.querySelector("#characterclass .miner")) {
            this.json.player.playerClass = PLAYER_CLASS_MINER;
        } else {
            this.json.player.playerClass = PLAYER_CLASS_NONE;
        }

        this.json.player.geologist = document.querySelector(".geologist.on") ? true : false;
        this.json.player.engineer = document.querySelector(".engineer.on") ? true : false;
        this.json.player.legerleiding = this.json.player.geologist && this.json.player.engineer && (document.querySelector(".commander.on") ? true : false) && (document.querySelector(".admiral.on") ? true : false) && (document.querySelector(".technocrat.on") ? true : false);

        this.json.player.allyClass = ALLY_CLASS_NONE;
        //TODO: GET ALLY CLASS
        
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
            if(coords){
                let name = planet.querySelector(".planet-name").textContent;
                this.json.player.planets[index] = this.newPlanet(this.trimCoords(coords), name);
            }
        });

        this.log(this);
    }

    trimCoords(coords){
        return coords.textContent.replace(/^\[|\]$/g, '');
    }

    async getServerSettings(universe){
        let url = getServerSettingsURL(universe);
        this.log(url, "debug");
        fetch(url)
        .then((rep) => rep.text())
        .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
        .then((xml) => {
            this.json.settings = {};
            this.json.settings.universe = universe,
            this.json.settings.lifeforms = xml.querySelector("lifeformSettings") ? true : false;
            this.json.settings.version = xml.querySelector("version").innerHTML,
            this.json.settings.economySpeed = xml.querySelector("speed").innerHTML,
            this.json.settings.peacefulFleetSpeed = xml.querySelector("speedFleetPeaceful").innerHTML,
            this.json.settings.deutUsageFactor = xml.querySelector("globalDeuteriumSaveFactor").innerHTML,
            this.json.settings.topscore = xml.querySelector("topScore").innerHTML    
            this.saveData();
        });
        this.log("settings");
        this.log(this.json.settings);
    }

    saveData(){
        this.log("data to save:");
        this.log(this.json);
        localStorage.setItem("ogh-" + UNIVERSE, JSON.stringify(this.json));
    }

    getBonus(planet, resource){
        let verzamelaarBonus = this.json.player.playerClass === PLAYER_CLASS_MINER ? 0.25 : 0;
        let handelaarBonus = this.json.player.allyClass === ALLY_CLASS_MINER ? 0.05 : 0;
        let plasmaFactor = resource === "metal" ? 0.01 : (resource === "crystal" ? 0.0066 : 0.0033);
        let plasmaLevel = this.json.player.plasma.level ?? this.json.player.plasma; 
        let plasmaBonus = plasmaLevel ? plasmaLevel * plasmaFactor : 0;
        let officerBonus = this.json.player.geologist ? (this.json.player.legerleiding ? 0.12 : 0.1) : 0;
        let processorBonus = planet.crawlers ? (planet.crawlers > this.calcMaxCrawlers(planet) ? this.calcMaxCrawlers(planet) : planet.crawlers) * (this.json.player.playerClass === PLAYER_CLASS_MINER ? 0.00045 : 0.0002) : 0;
        let lifeformBonus = 0;
        if(planet.lifeforms && planet.lifeforms.lifeformClass){
            let lifeformBuildingBonus = 0;
            let lifeformTechBonus = 0;
            const buildings = planet.lifeforms.buildings;
            this.log(buildings, "debug");
            if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN){
                if(resource == "metal") lifeformBuildingBonus = 0.015 * parseInt(buildings.highEnergySmelting.level ? buildings.highEnergySmelting.level : buildings.highEnergySmelting);
                else if(resource == "crystal") lifeformBuildingBonus = 0.015 * parseInt(buildings.fusionPoweredProduction.level ? buildings.fusionPoweredProduction.level : buildings.fusionPoweredProduction);
                else if(resource == "deut") lifeformBuildingBonus = 0.01 * parseInt(buildings.fusionPoweredProduction.level ? buildings.fusionPoweredProduction.level : buildings.fusionPoweredProduction);
            } else if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                if(resource == "metal") lifeformBuildingBonus = 0.02 * parseInt(buildings.magmaForge.level ? buildings.magmaForge.level : buildings.magmaForge);
                else if(resource == "crystal") lifeformBuildingBonus = 0.02 * parseInt(buildings.crystalRefinery.level ? buildings.crystalRefinery.level : buildings.crystalRefinery);
                else if(resource == "deut") lifeformBuildingBonus = 0.02 * parseInt(buildings.deuteriumSynthesizer.level ? buildings.deuteriumSynthesizer.level : buildings.deuteriumSynthesizer);
            } else if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                if(resource == "deut") lifeformBuildingBonus = 0.02 * parseInt(buildings.deuteriumSynthesizer.level ? buildings.deuteriumSynthesizer.level : buildings.deuteriumSynthesizer);
            }
            this.log(lifeformBuildingBonus, "debug");
            lifeformBonus = lifeformBuildingBonus + lifeformTechBonus;
        }
        //console.log(resource + ": " + verzamelaarBonus + " - " +  handelaarBonus + " - " + plasmaBonus + " - " + officerBonus + " - " + processorBonus + " - " + lifeformBonus);
        return verzamelaarBonus + handelaarBonus + plasmaBonus + officerBonus + processorBonus + lifeformBonus;
    }

    getPrerequisiteMSECosts(planet, upgradeType){
        let metalCost = 0;

        this.log("getPrerequisites of: " + upgradeType, "debug");

        const upgradeRequirements = {
            'plasma': {
                'ion': 5,
                'laser': 10,
                'energy': 8,
            },
            'astro': {
                'impuls': 3,
                'spy': 4,
                'energy': 1,
            },
            //human            
            'high energy smelting': {
                'researchCentre': 5,
                'residentialSector': 12,
                'biosphereFarm': 13,
            }, 
            'fusion powered production': {
                'academyOfSciences': 1,
                'residentialSector': 40,
            },
            //rocktal
            'magma forge': {
                'runeTechnologium': 5,
                'meditationEnclave': 12,
                'crystalFarm': 13,
            },
            'crystal refinery': {
                'megalith': 1,
                'runeForge': 1,
                'meditationEnclave': 40,
            },
            'deuterium synthesizer': {
                'megalith': 2,
                'runeForge': 1,
                'meditationEnclave': 40,
            },
            'mineral research centre': {
                'oriktorium': 1,
                'crystalRefinery': 1,
                'megalith': 1,
                'runeForge': 1,
                'meditationEnclave': 40,
            },
            //mecha
            'high performance synthesizer': {
                'microchipAssemblyLine': 2,
                'updateNetwork': 1,
                'assemblyLine': 40,
            },
        }

        if (!upgradeRequirements[upgradeType]) {
            return 0;
        }
    
        const requiredUpgrades = upgradeRequirements[upgradeType];
        for (const [building, level] of Object.entries(requiredUpgrades)) {
            const currentLevel = parseInt(planet.lifeforms.buildings[building].level ? planet.lifeforms.buildings[building].level : planet.lifeforms.buildings[building]);
            if (currentLevel < level) {
                for (let l = currentLevel; l < level; l++) {
                    metalCost += this.getMSECosts(planet, building, l);
                }
            }
        }
        
        return metalCost;
    }

    /**
     * Returns the cost calculated in metal of the given upgrade.
     *
     * @param {number} planet The corresponding planet.
     * @param {string} upgradeType The building or technology to upgrade.
     * @param {number} level The level the building is before upgrading.
     * @return {number} the cost calculated in MSE.
     */
    getMSECosts(planet, upgradeType, level){
        level = parseInt(level.level ? level.level : level);
        let ratio = this.json.player.ratio ? this.json.player.ratio : [3, 2, 1];
        let metalCost = 0;
        let crystalCost = 0;
        let deutCost = 0;
        let resProdBuild = false, rockTalBuild = false, techUpgrade = false;
        if(upgradeType === "metal"){
            metalCost = 60 * Math.pow(1.5, level);
            crystalCost = 15 * Math.pow(1.5, level);
            resProdBuild = true;
        } else if (upgradeType === "crystal"){
            metalCost = 48 * Math.pow(1.6, level);
            crystalCost = 24 * Math.pow(1.6, level);
            resProdBuild = true;
        } else if (upgradeType === "deut"){
            metalCost = 225 * Math.pow(1.5, level);
            crystalCost = 75 * Math.pow(1.5, level);
            resProdBuild = true;
        } else if (upgradeType === "ion"){
            metalCost = 1000 * Math.pow(2, level);
            crystalCost = 300 * Math.pow(2, level);
            deutCost = 100 * Math.pow(2, level);
        } else if (upgradeType === "laser"){
            metalCost = 200 * Math.pow(2, level);
            crystalCost = 100 * Math.pow(2, level);
        } else if (upgradeType === "energy"){
            crystalCost = 800 * Math.pow(2, level);
            deutCost = 400 * Math.pow(2, level);
        } else if (upgradeType === "impuls"){
            metalCost = 2000 * Math.pow(2, level);
            crystalCost = 4000 * Math.pow(2, level);
            deutCost = 600 * Math.pow(2, level);
        } else if (upgradeType === "spy"){
            metalCost = 200 * Math.pow(2, level);
            crystalCost = 1000 * Math.pow(2, level);
            deutCost = 200 * Math.pow(2, level);
        } else if (upgradeType === "plasma"){
            metalCost = 2000 * Math.pow(2, level);
            crystalCost = 4000 * Math.pow(2, level);
            deutCost = 1000 * Math.pow(2, level);
        } else if (upgradeType === "astro"){
            metalCost = 4000 * Math.pow(1.75, level);
            crystalCost = 8000 * Math.pow(1.75, level);
            deutCost = 4000 * Math.pow(1.75, level);
        } 
        // HUMANS
        else if (upgradeType === "residential sector") {
            metalCost = 7 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 2 * Math.pow(1.2, level) * (level + 1);
        } else if (upgradeType === "biosphere farm") {
            metalCost = 5 * Math.pow(1.23, level) * (level + 1);
            crystalCost = 2 * Math.pow(1.23, level) * (level + 1);
        } else if (upgradeType === "research centre") {
            metalCost = 20000 * Math.pow(1.3, level) * (level + 1);
            crystalCost = 25000 * Math.pow(1.3, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.3, level) * (level + 1);
        } else if (upgradeType === "academy of sciences") {
            metalCost = 5000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 3200 * Math.pow(1.7, level) * (level + 1);
            deutCost = 1500 * Math.pow(1.7, level) * (level + 1);
        } else if (upgradeType === "high energy smelting") {
            metalCost = 9000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 6000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 3000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "fusion powered production") {
            metalCost = 50000 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 25000 * Math.pow(1.2, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.2, level) * (level + 1);
        } 
        //ROCK'TAL
        else if (upgradeType === "meditation enclave") {
            metalCost = 9 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 3 * Math.pow(1.2, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "crystal farm") {
            metalCost = 7 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 2 * Math.pow(1.2, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "rune technologium") {
            metalCost = 40000 * Math.pow(1.3, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.3, level) * (level + 1);
            deutCost = 15000 * Math.pow(1.3, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "rune forge") {
            metalCost = 5000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 3800 * Math.pow(1.7, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.7, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "oriktorium") {
            metalCost = 50000 * Math.pow(1.65, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.65, level) * (level + 1);
            deutCost = 50000 * Math.pow(1.65, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "magma forge") {
            metalCost = 10000 * Math.pow(1.4, level) * (level + 1);
            crystalCost = 8000 * Math.pow(1.4, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.4, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "megalith") {
            metalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 35000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 15000 * Math.pow(1.5, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "crystal refinery") {
            metalCost = 85000 * Math.pow(1.4, level) * (level + 1);
            crystalCost = 44000 * Math.pow(1.4, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.4, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "deuterium synthesizer") {
            metalCost = 120000 * Math.pow(1.4, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.4, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.4, level) * (level + 1);
            rockTalBuild = true;
        } else if (upgradeType === "mineral research centre") {
            metalCost = 250000 * Math.pow(1.8, level) * (level + 1);
            crystalCost = 150000 * Math.pow(1.8, level) * (level + 1);
            deutCost = 100000 * Math.pow(1.8, level) * (level + 1);
            rockTalBuild = true;
        } 
        //MECHAS
        else if (upgradeType === "assembly line") {
            metalCost = 6 * Math.pow(1.21, level) * (level + 1);
            crystalCost = 2 * Math.pow(1.21, level) * (level + 1);
        } else if (upgradeType === "update network") {
            metalCost = 5000 * Math.pow(1.8, level) * (level + 1);
            crystalCost = 3800 * Math.pow(1.8, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.8, level) * (level + 1);
        } else if (upgradeType === "microchip assembly line") {
            metalCost = 50000 * Math.pow(1.07, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.07, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.07, level) * (level + 1);
        } else if (upgradeType === "high performance synthesizer") {
            metalCost = 100000 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.2, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.2, level) * (level + 1);
        } 

        //LIFEFORM TECHS
        else if (upgradeType === "High-Performance Extractors" || upgradeType === "Hoogwaardige Extractoren") {
            metalCost = 7000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Acoustic Scanning" || upgradeType === "Akoestisch Scannen") {
            metalCost = 7500 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 12500 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "High Energy Pump Systems" || upgradeType === "Hoge Energie Pomp Systemen") {
            metalCost = 15000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Magma-Powered Production"|| upgradeType == "Magma-Aangedreven Productie") {
            metalCost = 25000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Catalyser Technology" || upgradeType == "Katalysatortechnologie") {
            metalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 6000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Automated Transport Lines" || upgradeType == "Geautomatiseerde Transportlijnen") {
            metalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Sulphide Process" || upgradeType == "Sulfideproces") {
            metalCost = 7500 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 12500 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Telekinetic Tractor Beam" || upgradeType == "Telekinetische Tractorstraal") {
            metalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 15000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 7500 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Enhanced Sensor Technology" || upgradeType == "Verbeterde Sensortechnologie") {
            metalCost = 25000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } 

        //LIFEFORMTECHS T2
        else if (upgradeType === "Depth Souding" || upgradeType == "Dieptepeiling"){
            metalCost = 70000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Hardened Diamond Drill Heads" || upgradeType == "Verharde Diamanten Boorkoppen"){
            metalCost = 85000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 35000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Enhanced Production Technologies" || upgradeType == "Verbeterde Productie Technologiën"){
            metalCost = 80000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Improved Stellarator" || upgradeType == "Verbeterde Stellarator"){
            metalCost = 75000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 55000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Sixth Sense" || upgradeType == "Zesde Zintuig"){
            metalCost = 120000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 30000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Seismic Mining Technology" || upgradeType == "Seismische Mijntechnologie"){
            metalCost = 120000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 30000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Psychoharmoniser" || upgradeType == "Psychoharmonisator"){
            metalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Magma-Powered Pump Systems" || upgradeType == "Magma-aangedreven Pompsystemen"){
            metalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } 

        //LIFEFORMTECHS T3
        else if (upgradeType === "Artificial Swarm Intelligence" || upgradeType === "Artificiële Zwerm Intelligentie"){
            metalCost = 200000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 100000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Ion Crystal Modules" || upgradeType === ""){
            metalCost = 200000 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 100000 * Math.pow(1.2, level) * (level + 1);
            deutCost = 100000 * Math.pow(1.2, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Kaelesh Discoverer Enhancement" || upgradeType === ""){
            metalCost = 300000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 180000 * Math.pow(1.7, level) * (level + 1);
            deutCost = 120000 * Math.pow(1.7, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Rock’tal Collector Enhancement" || upgradeType === ""){
            metalCost = 300000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 180000 * Math.pow(1.7, level) * (level + 1);
            deutCost = 120000 * Math.pow(1.7, level) * (level + 1);
            techUpgrade = true;
        }
        
        
        if(techUpgrade){
            let factor = 1;
            switch(planet.lifeforms.lifeformClass){
                case LIFEFORM_CLASS_MENSEN:
                    if (planet.lifeforms.buildings.researchCentre > 1) {
                        factor -= planet.lifeforms.buildings.researchCentre * 0.005;
                    }
                    break;
                case LIFEFORM_CLASS_ROCKTAL:
                    if (planet.lifeforms.buildings.runeTechnologium > 1) {
                        factor -= planet.lifeforms.buildings.runeTechnologium * 0.005;
                    }
                    break;
                case LIFEFORM_CLASS_MECHA:
                    if (planet.lifeforms.buildings.roboticsResearchCentre > 1) {
                        factor -= planet.lifeforms.buildings.roboticsResearchCentre * 0.0025;
                    }
                    break;
                case LIFEFORM_CLASS_KAELESH:
                    if(planet.lifeforms.buildings.vortexChamber > 1){
                        factor -= planet.lifeforms.buildings.vortexChamber * 0.0025;
                    } 
                    break;
            }

            metalCost *= factor;
            crystalCost *= factor;
            deutCost *= factor;
        }

        if(planet && this.json.settings.lifeforms && planet.lifeforms.lifeformClass === LIFEFORM_CLASS_ROCKTAL){
            let factor = 1;
            if(rockTalBuild) factor -= 0.01 * parseInt(planet.lifeforms.buildings.megalith.level ? planet.lifeforms.buildings.megalith.level : planet.lifeforms.buildings.megalith);
            if(resProdBuild) factor -= 0.005 * parseInt(planet.lifeforms.buildings.mineralResearchCentre.level ? planet.lifeforms.buildings.mineralResearchCentre.level : planet.lifeforms.buildings.mineralResearchCentre);
            metalCost *= factor;
            crystalCost *= factor;
            deutCost *= factor;
        }

        return (metalCost + crystalCost * ratio[0] / ratio[1] + deutCost * ratio[0] / ratio[2]); 
    }

    /**
     * 
     * @param {planet} planet 
     * @param {string} productionType 
     * @param {number} level 
     * @returns the hourly mse production of the given type at the given level
     */
    getMSEProduction(planet, productionType, level){

        if(productionType != "astro"){
            level = parseInt(level.level ? level.level : level);
        }

        

        let ratio = this.json.player.ratio ? this.json.player.ratio : [3, 2, 1];
        let metalProd = 0;
        let crystalProd = 0;
        let deutProd = 0;   
        if(productionType === "metal"){
            metalProd = (30 + this.getRawProduction(planet, productionType, level) * (1 + this.getBonus(planet, productionType))) * this.json.settings.economySpeed * this.getFactor(planet, productionType);
        } else if (productionType === "crystal"){
            crystalProd = (15 + this.getRawProduction(planet, productionType, level) * (1 + this.getBonus(planet, productionType))) * this.json.settings.economySpeed * this.getFactor(planet, productionType);
        } else if (productionType === "deut"){
            deutProd = (this.getRawProduction(planet, productionType, level) * (1 + this.getBonus(planet, productionType))) * this.json.settings.economySpeed;
        } else if (productionType === "plasma"){
            this.json.player.planets.forEach(p => {
                metalProd += this.getRawProduction(p, "metal", p.metal.level ? p.metal.level : p.metal) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += this.getRawProduction(p, "crystal", p.crystal.level ? p.crystal.level : p.crystal) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += this.getRawProduction(p, "deut", p.deut.level ? p.deut.level : p.deut) * this.json.settings.economySpeed;
            });
            metalProd *= 0.01;
            crystalProd *= 0.0066;
            deutProd *= 0.0033;
        } else if (productionType === "astro"){
            let highestMetal = 0, highestCrystal = 0, highestDeut = 0; 
            this.json.player.planets.forEach(p => {
                if(p.metal > highestMetal) highestMetal = p.metal;
                if(p.crystal > highestCrystal) highestCrystal = p.crystal;
                if(p.deut > highestDeut) highestDeut = p.deut;
            });

            let p = {
                coords: "1:1:8",
                maxTemp: 50 // average temp for pos 8
            };

            metalProd += (30 + this.getRawProduction(p, "metal", highestMetal) * (1 + this.getBonus(p, productionType))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProd += (15 + this.getRawProduction(p, "crystal", highestCrystal) * (1 + this.getBonus(p, productionType))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProd += (this.getRawProduction(p, "deut", highestDeut) * (1 + this.getBonus(p, productionType))) * this.json.settings.economySpeed;
        } else if (productionType === "high energy smelting") {
            metalProd = 0.015 * this.getRawProduction(planet, "metal", planet.metal) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
        } else if (productionType === "fusion powered production") {
            crystalProd = 0.015 * this.getRawProduction(planet, "crystal", planet.crystal) * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
            deutProd = 0.01 * this.getRawProduction(planet, "deut", planet.deut) * this.json.settings.economySpeed;
        } else if (productionType === "magma forge") {
            metalProd = 0.02 * this.getRawProduction(planet, "metal", planet.metal) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
        } else if (productionType === "crystal refinery") {
            crystalProd = 0.02 * this.getRawProduction(planet, "crystal", planet.crystal) * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
        } else if (productionType === "deuterium synthesizer") {
            deutProd = 0.02 * this.getRawProduction(planet, "deut", planet.deut) * this.json.settings.economySpeed;
        } else if (productionType === "mineral research centre") {
            let perc = 0.005 / (1 - 0.005 * parseInt(level))
            this.json.player.planets.forEach(p => {
                metalProd += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + this.getBonus(p, productionType))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + this.getBonus(p, productionType))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += (this.getRawProduction(p, "deut", p.deut) * (1 + this.getBonus(p, productionType))) * this.json.settings.economySpeed;
            });

            metalProd *= perc / this.json.player.planets.length;
            crystalProd *= perc / this.json.player.planets.length;
            deutProd *= perc / this.json.player.planets.length;
        } else if (productionType === "high performance synthesizer") {
            deutProd = 0.02 * this.getRawProduction(planet, "deut", planet.deut) * this.json.settings.economySpeed;
        } 
        
        //LIFEFORM TECHS
        else if (productionType == "High-Performance Extractors" || productionType == "Hoogwaardige Extractoren") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Acoustic Scanning" || productionType == "Akoestisch Scannen") {
            this.json.player.planets.forEach(p => {
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "High Energy Pump Systems" || productionType == "Hoge Energie Pomp Systemen") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Magma-Powered Production" || productionType == "Magma-Aangedreven Productie") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
       } else if (productionType == "Catalyser Technology" || productionType == "Katalysatortechnologie") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Automated Transport Lines" || productionType == "Geautomatiseerde Transportlijnen") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Sulphide Process" || productionType == "Sulfideproces") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Telekinetic Tractor Beam" || productionType == "Telekinetische Tractorstraal") {
            metalProd = 0.002 * this.calcBaseExpoShipProd() * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformLevelBonus(planet));
        } else if (productionType == "Enhanced Sensor Technology" || productionType == "Verbeterde Sensortechnologie") {
            metalProd = 0.002 * this.calcBaseExpoResProd() * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformLevelBonus(planet));
        } 
        
        //LIFEFORMTECHS T2
        else if (productionType === "Depth Souding" || productionType == "Dieptepeiling"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Hardened Diamond Drill Heads" || productionType == "Verharde Diamanten Boorkoppen"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Enhanced Production Technologies" || productionType == "Verbeterde Productie Technologiën"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Sixth Sense" || productionType == "Zesde Zintuig"){
            metalProd = 0.002 * this.calcBaseExpoResProd() * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformLevelBonus(planet));
        } else if (productionType === "Seismic Mining Technology" || productionType == "Seismische Mijntechnologie"){
            this.json.player.planets.forEach(p => {
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Psychoharmoniser" || productionType == "Psychoharmonisator"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Magma-Powered Pump Systems" || productionType == "Magma-aangedreven Pompsystemen"){
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } 
        
        //LIFEFORMTECHS T3
        else if (productionType === "Artificial Swarm Intelligence" || productionType === "Artificiële Zwerm Intelligentie"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });           
        } else if (productionType === "Ion Crystal Modules" || productionType === ""){
            //TODO
            return 0;
        } else if (productionType === "Kaelesh Discoverer Enhancement" || productionType === ""){
            //TODO
            return 0;           
        } else if (productionType === "Rock’tal Collector Enhancement" || productionType === ""){
            //TODO
            return 0;           
        }
        
        
        
        
        else {
            return 0;
        }  

        return (metalProd + crystalProd * ratio[0] / ratio[1] + deutProd * ratio[0] / ratio[2]);
    }

    getAmountOfExpeditionsPerDay(){
        return this.json.player.exporounds * this.getAmountOfExpeditionSlots();
    }

    getAmountOfExpeditionSlots(){
        return Math.floor(Math.sqrt(parseInt(this.json.player.astro.level ? this.json.player.astro.level : this.json.player.astro))) + (this.json.player.playerClass == PLAYER_CLASS_EXPLORER ? 2 : 0) + (this.json.player.admiral ? 1 : 0) + parseInt(this.json.player.exposlots);
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
        if(level.level) level = level.level;
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

    getExtraMSEProduction(planet, productionType, level){
        if(level.level) level = level.level;
        return this.getMSEProduction(planet, productionType, level + 1) - this.getMSEProduction(planet, productionType, level); 
    }

    run(){
        this.checkPage();
        this.createSettingsButton();
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
            maxTemp: this.getAverageTemp(coords)
        };
      
        if (this.json.settings.lifeforms) {
          planet.lifeforms = {};
        }
      
        return planet;
    }

    remakePlanet(planet) {
        const newPlanet = {
            coords: planet.coords,
            metal: planet.metal || 0,
            crystal: planet.crystal || 0,
            deut: planet.deut || 0,
            solar: planet.solar || 0,
            fusion: planet.fusion || 0,
            satellite: planet.satellite || 0,
            crawlers: planet.crawlers || 0,
            maxTemp: planet.maxTemp || this.getAverageTemp(planet.coords)
        };
      
        if (this.json.settings.lifeforms) {
            newPlanet.lifeforms = planet.lifeforms || {};
        }
      
        return newPlanet;
    }

    getAverageTemp(coords){
        const averageTemperatures = {
            1: 240,
            2: 190,
            3: 140,
            4: 90,
            5: 80,
            6: 70,
            7: 60,
            8: 50,
            9: 40,
            10: 30,
            11: 20,
            12: 10,
            13: -30,
            14: -70,
            15: -110
        };
        return averageTemperatures[parseInt(coords.split(":")[2], 10)];
    }

    checkPlanets(){
        this.log("checking planets", "debug");
        let changed = false;
        const planetList = document.querySelectorAll(".smallplanet");
        const newPlanetList = [];

        planetList.forEach((planet) => {
            const coords = planet.querySelector(".planet-koords");
            if(coords){
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

        if(changed){
            this.json.player.planets = newPlanetList;
            this.saveData();
        }
    }

    checkStaff(){
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

    createAmortizationWithPrerequisite(planet, upgradeType, level, amorType, amorColor) {
        console.log(planet);
        console.log(upgradeType);
        console.log(level);
        console.log(amorType);
        console.log(amorColor);
        if(level.level) level = level.level;
        const startingLevel = parseInt(level);
        let mseProd = this.getMSEProduction(planet, upgradeType, startingLevel);
        const preMseCosts = this.getPrerequisiteMSECosts(planet, upgradeType);
        let mseCosts = this.getMSECosts(planet, upgradeType, startingLevel) + preMseCosts;
      
        let amortization = mseCosts / mseProd;
        let newLevel = startingLevel + 1;
        let x = 1;
        while (this.getMSECosts(planet, upgradeType, startingLevel + x) / this.getMSEProduction(planet, upgradeType, startingLevel + x) < amortization) {
            mseCosts += this.getMSECosts(planet, upgradeType, startingLevel + x);
            mseProd += this.getMSEProduction(planet, upgradeType, startingLevel + x);
            amortization = mseCosts / mseProd;
            x++;
        }
      
        if (x > 1) {
            newLevel = `${startingLevel + 1}-${startingLevel + x}`;
        }
      
        return {
            coords: planet.coords,
            name: planet.name,
            technology: upgradeType,
            level: newLevel,
            amortization: amortization / 24,
            msecost: mseCosts,
            type: amorType,
            color: amorColor
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
    //         this.log(`${planet.coords} -- ${upgradeType} -- ${(x - 1)} extra levels`, "debug");

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

    checkPlanetBlocks(){
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
            if(r.timeFinished) blocked.push({coords: "account", type: "research", timeFinished: r.timeFinished})
        });

        player.planets.forEach(planet => {
            const builds = [];
            builds.push(planet.metal);
            builds.push(planet.crystal);
            builds.push(planet.deut);
            builds.push(planet.solar);
            builds.push(planet.fusion);

            builds.forEach(b => {
                if(b.timeFinished) blocked.push({coords: planet.coords, type: "building", timeFinished: b.timeFinished})
            });

            if(planet.lifeforms){
                planet.lifeforms.techs.forEach(t => {
                    if(t.level.timeFinished) blocked.push({coords: planet.coords, type: "lifeformtech", timeFinished: t.level.timeFinished})
                })
            }
        });

        return blocked;
    }

    createAmortizationTable(coords = undefined, listType){
        let expoProfit = this.calcExpoProfit();
        this.log("expo: " + this.getBigNumber(expoProfit), "debug");

        const blocked = this.checkPlanetBlocks();

        this.log(blocked, "debug");

        //create table
        this.removeButtons();

        let div = document.querySelector('.amortizationtable');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtable"}));
        div.addEventListener("click", () => {
            let div = document.querySelector('.amortizationtable');
            div.remove();
            this.checkPage();
        })

        let table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');
        let tableBody = document.createElement('tbody');


        console.log("Hallo");
        let absoluteAmortization = this.createAbsoluteAmortizationList(blocked);
        if(this.json.settings.lifeforms){
            let costLoweringUpgrades = this.getCostLoweringUpgrades();
            //absoluteAmortization = this.addCostLoweringUpgradesToAmortization(absoluteAmortization, costLoweringUpgrades);
        }



        if(listType == "recursive"){
            //TODO: trim list for planet sided list
            let totalAmortization = this.createAmortizationListString(absoluteAmortization, 50);        

            for(let r = 0; r < totalAmortization.length + 1; r++){
                let tr = document.createElement('tr');
                tr.style.marginLeft = 10;
                let coords, name, technology, level, amortization, color;
    
                if(r == 0){
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
                    console.log(totalAmortization[r-1]);
                    
                    amortization = Math.round(totalAmortization[r - 1].amortization * 100) / 100 + " days";
                    if(technology == "Telekinetische Tractorstraal" || technology == "Verbeterde Sensortechnologie" || technology == "Zesde Zintuig")
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
            for(let r = 0; r < totalAmortization.length + 1; r++){
                let tr = document.createElement('tr');
                tr.style.marginLeft = 10;
                let coords, name, technology, level, amortization, color;
    
                if(r == 0){
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
                    if(technology == "Telekinetische Tractorstraal" || technology == "Verbeterde Sensortechnologie" || technology == "Zesde Zintuig")
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
        div.appendChild(table);
    }

    trimAmortizationList(amortizationList, coords){
        if(!coords) return amortizationList;

        let finalList = [];
        amortizationList.forEach(item => {
            if(coords == item.coords || item.coords == "account"){
                finalList.push(item);
            }
        });
        return finalList
    }

    getAmortizationColor(coords, type, blocked){
        const block = blocked.find(x => x.coords == coords && x.type == type);
        if(!block) return "#00ff00";

        const timeLeft = block.timeFinished - Date.now() / 1000;
        if(timeLeft > 3600 * 24) return "#ff0000";            
        if(timeLeft > 0) return "#ffff00";
        return "#00ff00"
    }

    /**
    * @param coords optional: the coords to create the list for, no coords means whole account
    */
    createAbsoluteAmortizationList(blocked, coords){
        this.log("ik ben hier", "test");
        this.log(blocked, "test");
        this.log(coords, "test");
        let totalAmortization = [];
        let amorColor;
        this.json.player.planets.forEach((planet) => {
            if(!coords || planet.coords == coords){
                amorColor = this.getAmortizationColor(planet.coords, "building", blocked);
                totalAmortization.push(this.createAmortization(planet, "metal", planet.metal, "productionbuilding", amorColor));
                totalAmortization.push(this.createAmortization(planet, "crystal", planet.crystal, "productionbuilding", amorColor));
                totalAmortization.push(this.createAmortization(planet, "deut", planet.deut, "productionbuilding", amorColor));


                if(this.json.settings.lifeforms && planet.lifeforms.lifeformClass){
                    amorColor = this.getAmortizationColor(planet.coords, "lifeformbuilding", blocked);
                    if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN){
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "high energy smelting", parseInt(planet.lifeforms.buildings.highEnergySmelting.level ? planet.lifeforms.buildings.highEnergySmelting.level : planet.lifeforms.buildings.highEnergySmelting), "-", amorColor));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "fusion powered production", parseInt(planet.lifeforms.buildings.fusionPoweredProduction.level ? planet.lifeforms.buildings.fusionPoweredProduction.level : planet.lifeforms.buildings.fusionPoweredProduction), "-", amorColor));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "magma forge", parseInt(planet.lifeforms.buildings.magmaForge.level ? planet.lifeforms.buildings.magmaForge.level : planet.lifeforms.buildings.magmaForge), "rocktalbuilding", amorColor));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "crystal refinery", parseInt(planet.lifeforms.buildings.crystalRefinery.level ? planet.lifeforms.buildings.crystalRefinery.level : planet.lifeforms.buildings.crystalRefinery), "rocktalbuilding", amorColor));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "deuterium synthesizer", parseInt(planet.lifeforms.buildings.deuteriumSynthesizer.level ? planet.lifeforms.buildings.deuteriumSynthesizer.level : planet.lifeforms.buildings.deuteriumSynthesizer), "rocktalbuilding", amorColor));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "high performance synthesizer", parseInt(planet.lifeforms.buildings.highPerformanceSynthesizer.level ? planet.lifeforms.buildings.highPerformanceSynthesizer.level : planet.lifeforms.buildings.highPerformanceSynthesizer), "-", amorColor));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_KAELESH) {
                    } else {
                        console.error("lifeform not found: " + planet.lifeforms.lifeformClass);
                    }
    
                    amorColor = this.getAmortizationColor(planet.coords, "lifeformtech", blocked);                
                    planet.lifeforms.techs.forEach(tech => {
                        const level = parseInt(tech.level.level ? tech.level.level : tech.level);
                        let extraMSE = this.getMSEProduction(planet, tech.name, level);
                        if(extraMSE > 0){
                            let mseCost = this.getMSECosts(planet, tech.name, level);
                            totalAmortization.push({
                                coords: planet.coords, 
                                name: planet.name, 
                                technology: tech.name, 
                                level: level + 1, 
                                amortization: mseCost / extraMSE / 24, 
                                msecost: mseCost,
                                type: "lifeformtech",
                                color: amorColor,
                            });
                        }
                    });
                }    
            }
        });

        amorColor = this.getAmortizationColor("account", "research", blocked);
        totalAmortization.push({
            coords: "account",
            name: "account",
            technology: "plasma",
            level: (parseInt(this.json.player.plasma.level ?? this.json.player.plasma) + 1),
            amortization: this.calculateAmortization(undefined, "plasma", parseInt(this.json.player.plasma.level ?? this.json.player.plasma)),
            msecost: this.getMSECosts(undefined, "plasma", parseInt(this.json.player.plasma.level ?? this.json.player.plasma)),
            type: "plasma",
            color: amorColor
        });

        totalAmortization.push(this.createAstroAmortizationObject());

        totalAmortization.sort((a,b) => a.amortization - b.amortization);
        this.log(totalAmortization, "debug");
        return totalAmortization;
    }

    createAstroAmortizationObject(){
        //astro
        let totalMSECostsAstroNewPlanet = 0;
        let totalMSECostsAstroNewExpo = 0;
        let totalMSEProdAstroNewPlanet = 0;
        let totalMSEProdAstroNewExpo = 0;
        
        const newPlanetProduction = this.getMSEProduction(undefined, "astro", undefined);
        const newExpoSlotProduction = this.calcExpoProfit() * this.json.player.exporounds / 24;

        totalMSECostsAstroNewPlanet += this.getMSECosts(undefined, "astro", parseInt(this.json.player.astro));
        if(this.json.player.astro % 2 == 1){
            totalMSECostsAstroNewPlanet += this.getMSECosts(undefined, "astro", parseInt(this.json.player.astro) + 1);
        } 

        let highestMetal = 0, highestCrystal = 0, highestDeut = 0; 
        this.json.player.planets.forEach(planet => {
            if(planet.metal > highestMetal) highestMetal = planet.metal;
            if(planet.crystal > highestCrystal) highestCrystal = planet.crystal;
            if(planet.deut > highestDeut) highestDeut = planet.deut;
        });

        const p = this.newPlanet("1:1:8", "temp");

        let newPlanetMSECost = 0;

        for (let l = 0; l < highestMetal; l++) newPlanetMSECost += this.getMSECosts(p, "metal", l);
        for (let l = 0; l < highestCrystal; l++) newPlanetMSECost += this.getMSECosts(p, "crystal", l);
        for (let l = 0; l < highestDeut; l++) newPlanetMSECost += this.getMSECosts(p, "deut", l);

        totalMSECostsAstroNewPlanet += newPlanetMSECost;
        totalMSEProdAstroNewPlanet += newPlanetProduction;

        let astroLevelStringNewPlanet = (parseInt(this.json.player.astro) + 1)
        
        if(this.json.player.astro % 2 == 1){
            astroLevelStringNewPlanet += " & " + (parseInt(this.json.player.astro) + 2);
        }

        //next astro level for expo
        let l = Math.floor(Math.sqrt(parseInt(this.json.player.astro))) + 1;

        let nextAstro = l*l;
        let newPlanets = 0;
        
        for(let a = parseInt(this.json.player.astro) + 1; a <= nextAstro; a++){
            if(a % 2 == 1){
                newPlanets++;
            }
            totalMSECostsAstroNewExpo += this.getMSECosts(undefined, "astro", a);
        }

        totalMSECostsAstroNewExpo += newPlanets * newPlanetMSECost;
        totalMSEProdAstroNewExpo += newPlanets * newPlanetProduction;
        totalMSEProdAstroNewExpo += newExpoSlotProduction;

        let astroLevelStringNewExpo = (parseInt(this.json.player.astro) + 1);
        if(parseInt(this.json.player.astro) + 1 < nextAstro){
            astroLevelStringNewExpo += " - " + nextAstro;
        }

        if(totalMSECostsAstroNewExpo / totalMSEProdAstroNewExpo < totalMSECostsAstroNewPlanet / totalMSEProdAstroNewPlanet){
            return {
                coords: "account",
                name: "account",
                technology: "astrophysics",
                level: astroLevelStringNewExpo,
                amortization: totalMSECostsAstroNewExpo / totalMSEProdAstroNewExpo / 24,
                msecost: totalMSECostsAstroNewExpo,
                type: "astro",
            };
        } else {
            return {
                coords: "account",
                name: "account",
                technology: "astrophysics",
                level: astroLevelStringNewPlanet,
                amortization: totalMSECostsAstroNewPlanet / totalMSEProdAstroNewPlanet / 24,
                msecost: totalMSECostsAstroNewPlanet,
                type: "astro",
            };
        }
    }

    createAmortizationListString(amortizationList, amount){
        let finalList = [];
        
        for(let i = 0; i < amount; i++){
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

            lastUpgrade.level =  parseInt(lastUpgrade.level.toString().includes("-") ? lastUpgrade.level.split("-")[1] : lastUpgrade.level);

            lastUpgrade.amortization = this.calculateAmortization(this.getPlanetByCoords(lastUpgrade.coords), lastUpgrade.technology, lastUpgrade.level);
            if(isNaN(lastUpgrade.amortization)){
                lastUpgrade.amortization = 1000000000;
            }

            lastUpgrade.level += 1;
            amortizationList[0] = lastUpgrade;
            amortizationList.sort((a,b) => a.amortization - b.amortization);
        }

        return finalList;
    }

    getPlanetByCoords(coords){
        return this.json.player.planets.find(p => p.coords == coords);
    }

    getCostLoweringUpgrades(){
        let costLoweringUpgrades = [];

        if(this.json.settings.lifeforms){
            this.json.player.planets.forEach(planet => {
                if(planet.lifeforms.lifeformClass === "rocktal"){
                    costLoweringUpgrades.push({
                        coords: planet.coords,
                        upgrade: "mineral research centre",
                        priority: 1,
                        affected: "productionbuilding",
                    });
                    costLoweringUpgrades.push({
                        coords: planet.coords,
                        upgrade: "rune technologium",
                        priority: 3,
                        affected: "lifeformtech",
                    });
                    costLoweringUpgrades.push({
                        coords: planet.coords,
                        upgrade: "megalith",
                        priority: 4,
                        affected: "rocktalbuilding",
                    });
                }
    
                planet.lifeforms.techs.forEach(tech => {
                    if(tech.name === "Verbeterde Stellarator"){
                        costLoweringUpgrades.push({
                            coords: planet.coords,
                            upgrade: tech.name,
                            priority: 2,
                            affected: "plasma",
                        })
                    }
                });
            });
        }

        costLoweringUpgrades = costLoweringUpgrades.sort((a,b) => a.priority - b.priority);
        this.log(costLoweringUpgrades, "test");
        return costLoweringUpgrades;
    }

    addCostLoweringUpgradesToAmortization(amortizationList, costLoweringUpgrades){
        let totalHourlyMseProd = this.calcTotalMseProduction();

        costLoweringUpgrades.forEach(upgrade => {
            this.log(upgrade, "test");
            let testAmortizationList = this.copyAmortizationArray(amortizationList);
            this.log(testAmortizationList, "test");
            let planet = this.getPlanetByCoords(upgrade.coords);
            let totalMseCost = 0;

            let curLevel;
            let upgradePercent;
            let amorType;

            if(upgrade.upgrade == "rune technologium"){
                curLevel = parseInt(planet.lifeforms.buildings.runeTechnologium);
                upgradePercent = 0.25;
                amorType = "rocktalbuilding";
            } else if (upgrade.upgrade == "Verbeterde Stellarator"){
                let index = planet.lifeforms.techs.findIndex(t => t.name == "Verbeterde Stellarator");
                curLevel = parseInt(planet.lifeforms.techs[index].level);
                upgradePercent = 0.15;
            } else if (upgrade.upgrade == "mineral research centre"){
                curLevel = parseInt(planet.lifeforms.buildings.mineralResearchCentre);
                upgradePercent = 0.5;
                amorType = "rocktalbuilding";
            } else if (upgrade.upgrade == "megalith"){
                curLevel = parseInt(planet.lifeforms.buildings.megalith);
                upgradePercent = 1;
                amorType = "rocktalbuilding";
            }

            if(curLevel.level) curLevel = curLevel.level;

            let savePercent = upgradePercent / (100 - upgradePercent * curLevel);
            let mseCost = this.getMSECosts(planet, upgrade.upgrade, curLevel);
            let mseToSpend = mseCost / savePercent;

            while(mseToSpend > 0){
                let item = testAmortizationList[0];
                this.log(item, "test");
                if(item.type == upgrade.affected && (item.coords == "account" || item.coords == upgrade.coords)){
                    this.log("yes", "test");
                    mseToSpend -= item.msecost;
                }
                totalMseCost += item.msecost;
                this.log(this.getBigNumber(mseToSpend) + " / " + this.getBigNumber(totalMseCost), "test");
                testAmortizationList[0] = this.upgradeAmortizationItem(item);
                testAmortizationList.sort((a,b) => a.amortization - b.amortization);
            }
            
            let amort = totalMseCost / totalHourlyMseProd / 24;
            amortizationList.push({
                coords: upgrade.coords, 
                name: this.getPlanetByCoords(upgrade.coords).name, 
                technology: upgrade.upgrade, 
                level: curLevel + 1, 
                amortization: amort,
                msecost: mseCost,
                type: amorType,
            });
            amortizationList.sort((a,b) => a.amortization - b.amortization);
            this.log(amortizationList, "test");
        });

        return amortizationList;
    }

    upgradeAmortizationItem(item){
        if(item.level.toString().includes("-")) {
            item.level = parseInt(item.level.split("-")[1]);
        } else {
            item.level = parseInt(item.level);
        }

        item.amortization = this.calculateAmortization(this.getPlanetByCoords(item.coords), item.technology, item.level);
        item.msecost = this.getMSECosts(this.getPlanetByCoords(item.coords), item.technology, item.level);
        if(isNaN(item.amortization)){
            item.amortization = 1000000000;
        }
        item.level += 1;
        return item;
    }

    copyAmortizationArray(arrayToCopy) {
        return arrayToCopy.map(element => ({ ...element }));
    }

    createAmortization(planet, technology, level, amorType, amorColor){
        if(level.level) level = level.level;
        return { 
            coords: planet.coords, 
            name: planet.name, 
            technology: technology, 
            level: (parseInt(level) + 1), 
            amortization: this.calculateAmortization(planet, technology, level),
            msecost: this.getMSECosts(planet, technology, parseInt(level)),
            type: amorType,
            color: amorColor
        };
    }

    calculateAmortization(planet, technology, level){
        if(level.level) level = level.level;
        if(technology == "astro"){
            //TODO: plasma and astro
        } else if (technology == "metal" || technology == "crystal" || technology == "deut"){
            return Math.round(this.getMSECosts(planet, technology, parseInt(level)) / this.getExtraMSEProduction(planet, technology, parseInt(level)) / 24 * 100) / 100;
        } else {
            return Math.round(this.getMSECosts(planet, technology, parseInt(level)) / this.getMSEProduction(planet, technology, parseInt(level)) / 24 * 100) / 100;
        }
    }

    createAccountProduction(){
        this.removeButtons();

        const pageContent = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent"));
        const accountProductionDiv = this.createDOM("div", { class: "accountproduction"});
        accountProductionDiv.addEventListener("click", () => {
            let div = document.querySelector('.accountproduction');
            div.remove();
            this.checkPage();
        })
        pageContent.appendChild(accountProductionDiv);

        const table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');
        const tableBody = document.createElement('tbody');

        let planets = this.json.player.planets;
        planets.sort((a,b) => parseInt(a.coords.split(":")[2]) - parseInt(b.coords.split(":")[2]));
        planets.sort((a,b) => parseInt(a.coords.split(":")[1]) - parseInt(b.coords.split(":")[1]));
        planets.sort((a,b) => parseInt(a.coords.split(":")[0]) - parseInt(b.coords.split(":")[0]));
        this.log(planets, "debug");

        let metalProd = 0, crystalProd = 0, deutProd = 0;

        planets.forEach(p => {
            let tr = document.createElement('tr');
            tr.style.marginLeft = 10;
            const metal = p.metal.level ? p.metal.level : p.metal;
            const crystal = p.crystal.level ? p.crystal.level : p.crystal;
            const deut = p.deut.level ? p.deut.level : p.deut;
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
        tr.appendChild(document.createTextNode("Plasmatechnology: " + this.json.player.plasma.level ?? this.json.player.plasma));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Astrophysics: " + this.json.player.astro.level ?? this.json.player.astro));
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
        tr.appendChild(document.createTextNode("Total Production:"));
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

        if(this.json.player.playerClass === PLAYER_CLASS_EXPLORER)
        {
            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("------"));
            tableBody.appendChild(tr);
            
            tr = document.createElement('tr');
            this.log("expoprofit: " + this.getBigNumber(this.calcExpoProfit()), "dev");
            this.log("miner per hour: " + this.getBigNumber(this.calcMinerBonusProfitHour()), "dev");
            this.log("expoprofit per hour: " + this.getBigNumber(this.calcExpoProfit() * this.getAmountOfExpeditionsPerDay() / 24), "dev");
            
            tr.appendChild(document.createTextNode("You should switch to " + PLAYER_CLASS_MINER + " when doing less then " + this.getBigNumber(this.calcMinerBonusProfitHour() * 24 * 7 / this.calcExpoProfit()) + " expeditions per week."));
            tableBody.appendChild(tr);    
        }

        table.appendChild(tableBody);
        accountProductionDiv.appendChild(table);
    }

    /**
     * @returns the total production per hour calculated in metal
     */
    calcTotalMseProduction(){
        let metalProd = 0, crystalProd = 0, deutProd = 0;
        this.json.player.planets.forEach(p => {
            metalProd += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProd += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProd += (this.getRawProduction(p, "deut", p.deut) * (1 + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;
        });

        let hourlyExpo = this.calcExpoProfit() * this.getAmountOfExpeditionsPerDay() / 24;

        let ratio = this.json.player.ratio;
        return metalProd + crystalProd / ratio[1] * ratio[0] + deutProd / ratio[2] * ratio[0] + hourlyExpo;
    }

    calcMinerBonusProfitHour(){
        let planets = this.json.player.planets;
        let ratio = this.json.player.ratio;
        let metalProdMiner = 0, crystalProdMiner = 0, deutProdMiner = 0;
        let metalProd = 0, crystalProd = 0, deutProd = 0;

        planets.forEach(p => {
            this.log(p.coords, "debug");
            this.log(this.calcMaxCrawlers(p), "debug");
            let maxCrawlerBonus = (this.calcMaxCrawlers(p) * (this.json.player.geologist ? 1.1 : 1)) * 0.00045;
            let extraCrawlersBonus = maxCrawlerBonus - (p.crawlers > this.calcMaxCrawlers(p) ? this.calcMaxCrawlers(p) : p.crawlers) * 0.0002;
            this.log(maxCrawlerBonus, "debug");
            this.log(extraCrawlersBonus, "debug");

            metalProd += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProd += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProd += (this.getRawProduction(p, "deut", p.deut) * (1 + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;

            metalProdMiner += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + 0.25 + extraCrawlersBonus + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProdMiner += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + 0.25 + extraCrawlersBonus + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProdMiner += (this.getRawProduction(p, "deut", p.deut) * (1 + 0.25 + extraCrawlersBonus + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;
        });

        this.log("minerprod: " + this.getBigNumber(metalProdMiner) + " - " + this.getBigNumber(crystalProdMiner) + " - " + this.getBigNumber(deutProdMiner), "dev");
        this.log("prod:" + this.getBigNumber(metalProd) + " - " + this.getBigNumber(crystalProd) + " - " + this.getBigNumber(deutProd), "dev");
        return metalProdMiner - metalProd + (crystalProdMiner - crystalProd) * ratio[0] / ratio[1] + (deutProdMiner - deutProd) * ratio[0] / ratio[2];
    }

    /**
     * 
     * @returns the average MSE an expedition produces
     */
    calcExpoProfit(){
        //TODO: calc blackhole/fuelcost
        let blackHoleMSE, fuelCostMSE;
        blackHoleMSE = 0;
        fuelCostMSE = 0;
        return this.calcExpoShipProd() + this.calcExpoResProd() - blackHoleMSE / 300 - fuelCostMSE; 
    }

    GetAverageFind(){
        const topscore = this.json.settings.topscore;
        let maxBase;
        if(topscore < 10000) maxBase = 40000; 
        else if(topscore < 100000) maxBase = 500000;
        else if(topscore < 1000000) maxBase = 1200000;
        else if(topscore < 5000000) maxBase = 1800000;
        else if(topscore < 25000000) maxBase = 2400000;
        else if(topscore < 50000000) maxBase = 3000000;
        else if(topscore < 75000000) maxBase = 3600000;
        else if(topscore < 100000000) maxBase = 4200000;
        else maxBase = 5000000;

        const naviFactor = 2;
        const explorerFactor = 1.5 * parseInt(this.json.settings.economySpeed);
        let max = maxBase * naviFactor * (this.json.player.playerClass == PLAYER_CLASS_EXPLORER ? explorerFactor : 1);
        let averageFactor = (0.89 * (10 + 50) + 0.1 * (52 + 100) + 0.01 * (102 + 200)) / 2;
        return max * averageFactor / 200;
    }

    calcBaseExpoResProd(){
        let ratio = this.json.player.ratio;
        let metalMSE, crystalMSE, deutMSE;
        metalMSE = this.GetAverageFind();
        crystalMSE = this.GetAverageFind() / 2 * ratio[0] / ratio[1];
        deutMSE = this.GetAverageFind() / 3 * ratio[0] / ratio[2];
        return 0.325 * (0.685 * metalMSE + 0.24 * crystalMSE + 0.075 * deutMSE);
    }

    calcExpoResProd(){
        return this.calcBaseExpoResProd() * (1 + this.calcExpoResBonus());
    }

    calcExpoResBonus(){
        if(this.json.settings.lifeforms){
            let bonus = 0;
            this.json.player.planets.forEach(p => {
                const lifeformBonus = this.getLifeformLevelBonus(p);
                p.lifeforms.techs.forEach(t => {
                    if(t.name == "Verbeterde Sensortechnologie" || t.name == "Zesde Zintuig"){
                        bonus += 0.002 * (t.level.level ? t.level.level : t.level) * (1 + lifeformBonus);
                    }
                });
            });
            return bonus;
        } else {
            return 0;
        }
    }

    getLifeformLevelBonus(planet){
        const level = 22; //fix
        return level * 0.001;
    }

    calcBaseExpoShipProd(){
        let ratio = this.json.player.ratio;
        let shipMSE = this.GetAverageFind() * (0.54 + .46 * ratio[0] / ratio[1] + 0.093 * ratio[0] / ratio[2]);
        return 0.22 * shipMSE
    }

    calcExpoShipProd(){
        return this.calcBaseExpoShipProd() * (1 + this.calcExpoShipBonus());
    }

    calcExpoShipBonus(){
        if(this.json.settings.lifeforms){
            let bonus = 0;
            this.json.player.planets.forEach(p => {
                const lifeformBonus = this.getLifeformLevelBonus(p);
                if(p.lifeforms.techs.length > 0){
                    p.lifeforms.techs.forEach(t => {
                        if(t.name == "Telekinetische Tractorstraal"){
                            bonus += 0.002 * (t.level.level ? t.level.level : t.level) * (1 + lifeformBonus);
                        }
                    });    
                }
            });
            return bonus;
        } else {
            return 0;
        }
    }

    getBigNumber(number){
        number = Math.round(number);
        number = number.toString();
        
        const isNegative = number[0] == '-';
        if(isNegative) number = number.substring(1, number.length);

        let digits = number.length;

        for(let d = 3, dotsplaced = 0; d < digits; d+=3, dotsplaced++){
            number = number.substring(0, digits - d) + "." + number.substring(digits - d, digits + dotsplaced);
        }

        if(isNegative) number = "-" + number;
        return number;
    }

    calcMaxCrawlers(planet){
        return ((parseInt(planet.metal.level ? planet.metal.level : planet.metal) + parseInt(planet.crystal.level ? planet.crystal.level : planet.crystal) + parseInt(planet.deut.level ? planet.deut.level : planet.deut)) * 8) * ((this.json.player.playerClass == PLAYER_CLASS_MINER && this.json.player.geologist) ? 1.1 : 1);
    }

    checkPage(){
        let currentPlanet = (document.querySelector(".smallplanet .active") || document.querySelector(".smallplanet .planetlink")).parentNode;
        let currentCoords = this.trimCoords(currentPlanet.querySelector(".planet-koords"));
        let currentHasMoon = currentPlanet.querySelector(".moonlink") ? true : false;
        let currentIsMoon = currentHasMoon && currentPlanet.querySelector(".moonlink.active") ? true : false;
    
        let rawURL = new URL(window.location.href);
        let page = rawURL.searchParams.get("component") || rawURL.searchParams.get("page");
        if(page === OVERVIEW){
            this.checkPlanets();
            if(!currentIsMoon){
                this.log(textContent, "debug");
                this.log(currentCoords);
                let index = this.json.player.planets.findIndex(p => p.coords == currentCoords);
                this.log("planetindex: " + index);
                if(this.json.player.planets[index]){
                    this.json.player.planets[index].maxTemp = parseInt(textContent[3].split("°C")[1].split(" ")[2]);
                } else {
                    this.json.player.planets[index] = {
                        maxTemp: parseInt(textContent[3].split("°C")[1].split(" ")[2])
                    };
                }
                
                this.saveData();

                this.checkStaff();
            }
            this.createButtons();
        } else if (page === RESOURCES){
            this.checkPlanets();
            if(!currentIsMoon){
                this.log("update mines");
                this.log("Planetindex: " + this.json.player.planets.findIndex(p => p.coords == currentCoords));
                let index = this.json.player.planets.findIndex(p => p.coords == currentCoords);
                if(this.json.player.planets[index]){
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
        } else if (page === LIFEFORM){
            let planetIndex = this.json.player.planets.findIndex(p => p.coords == currentCoords);
            let planet = this.checkCurrentLifeform(this.json.player.planets[planetIndex]);
            this.log("lifeform techs", "debug");
            this.log(document.querySelectorAll(".technology"), "debug");
            let buildings = planet.lifeforms.buildings;
            if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN){
                buildings.residentialSector = this.getTechnologyLevel("lifeformTech11101");
                buildings.biosphereFarm = this.getTechnologyLevel("lifeformTech11102");
                buildings.researchCentre = this.getTechnologyLevel("lifeformTech11103");
                buildings.academyOfSciences = this.getTechnologyLevel("lifeformTech11104");
                buildings.neuroCalibrationCentre = this.getTechnologyLevel("lifeformTech11105");
                buildings.highEnergySmelting = this.getTechnologyLevel("lifeformTech11106");
                buildings.foodSilo = this.getTechnologyLevel("lifeformTech11107");
                buildings.fusionPoweredProduction =this.getTechnologyLevel("lifeformTech11108");
                buildings.skyscraper = this.getTechnologyLevel("lifeformTech11109");
                buildings.biotechLab = this.getTechnologyLevel("lifeformTech11110");
                buildings.metropolis = this.getTechnologyLevel("lifeformTech11111");
                buildings.planetaryShield = this.getTechnologyLevel("lifeformTech11112");
            } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL){
                buildings.meditationEnclave = this.getTechnologyLevel("lifeformTech12101");
                buildings.crystalFarm = this.getTechnologyLevel("lifeformTech12102");
                buildings.runeTechnologium = this.getTechnologyLevel("lifeformTech12103");
                buildings.runeForge = this.getTechnologyLevel("lifeformTech12104");
                buildings.oriktorium = this.getTechnologyLevel("lifeformTech12105");
                buildings.magmaForge = this.getTechnologyLevel("lifeformTech12106");
                buildings.disruptionChamber = this.getTechnologyLevel("lifeformTech12107");
                buildings.megalith =this.getTechnologyLevel("lifeformTech12108");
                buildings.crystalRefinery = this.getTechnologyLevel("lifeformTech12109");
                buildings.deuteriumSynthesizer = this.getTechnologyLevel("lifeformTech12110");
                buildings.mineralResearchCentre = this.getTechnologyLevel("lifeformTech12111");
                buildings.advancedRecyclingPlant = this.getTechnologyLevel("lifeformTech12112");
            } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA){
                buildings.assemblyLine = this.getTechnologyLevel("lifeformTech13101");
                buildings.fusionCellFactory = this.getTechnologyLevel("lifeformTech13102");
                buildings.roboticsResearchCentre = this.getTechnologyLevel("lifeformTech13103");
                buildings.updateNetwork = this.getTechnologyLevel("lifeformTech13104");
                buildings.quantumComputerCentre = this.getTechnologyLevel("lifeformTech13105");
                buildings.automatisedAssemblyCentre = this.getTechnologyLevel("lifeformTech13106");
                buildings.highPerformanceTransformer = this.getTechnologyLevel("lifeformTech13107");
                buildings.microchipAssemblyLine =this.getTechnologyLevel("lifeformTech13108");
                buildings.productionAssemblyHall = this.getTechnologyLevel("lifeformTech13109");
                buildings.highPerformanceSynthesizer = this.getTechnologyLevel("lifeformTech13110");
                buildings.chipMassProduction = this.getTechnologyLevel("lifeformTech13111");
                buildings.nanoRepairBots = this.getTechnologyLevel("lifeformTech13112");
            } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_KAELESH){
                buildings.sanctuary = this.getTechnologyLevel("lifeformTech14101");
                buildings.antimatterCondenser = this.getTechnologyLevel("lifeformTech14102");
                buildings.vortexChamber = this.getTechnologyLevel("lifeformTech14103");
                buildings.hallsOfRealisation = this.getTechnologyLevel("lifeformTech14104");
                buildings.forumOfTranscendence = this.getTechnologyLevel("lifeformTech14105");
                buildings.antimatterConvector = this.getTechnologyLevel("lifeformTech14106");
                buildings.cloningLaboratory = this.getTechnologyLevel("lifeformTech14107");
                buildings.chrysalisAccelerator =this.getTechnologyLevel("lifeformTech14108");
                buildings.bioModifier = this.getTechnologyLevel("lifeformTech14109");
                buildings.psionicModulator = this.getTechnologyLevel("lifeformTech14110");
                buildings.shipManufacturingHall = this.getTechnologyLevel("lifeformTech14111");
                buildings.supraRefractor = this.getTechnologyLevel("lifeformTech14112");
            } 
        } else if (page === LIFEFORM_RESEARCH){
            let planetIndex = this.json.player.planets.findIndex(p => p.coords == currentCoords);
            let planet = this.checkCurrentLifeform(this.json.player.planets[planetIndex]);
            this.log("lifeform techs", "debug");
            this.log(document.querySelectorAll(".technology"), "debug");
            let techs = [];
            for(let s = 1; s <= 18; s++){
                let tech = this.getTechnologyFromSlot(s);
                if(tech) techs.push(tech);
            }
            this.log(techs, "debug");
            planet.lifeforms.techs = techs;
        } else if (page === LIFEFORM_SETTINGS){
            this.log(document.querySelector(".currentLevel"), "debug");
        } else if (page === FACILITIES){
            //TODO: UPDATE FACILITIES
        } else if (page === RESEARCH){
            this.json.player.plasma = this.getTechnologyLevel("plasmaTechnology");
            this.json.player.astro = this.getTechnologyLevel("astrophysicsTechnology");
            this.json.player.energy = this.getTechnologyLevel("energyTechnology");
            this.json.player.ion = this.getTechnologyLevel("ionTechnology");
            this.json.player.laser = this.getTechnologyLevel("laserTechnology");
            this.json.player.impuls = this.getTechnologyLevel("impulseDriveTechnology");
            this.json.player.spy = this.getTechnologyLevel("espionageTechnology");
            this.saveData();
            //TODO: UPDATE RESEARCH
        } else if (page === ALLIANCE) {
            if (document.querySelector(".value.alliance_class.small.explorer")) {
                this.log("ally ontdekker", "debug");
                this.json.player.allyClass = ALLY_CLASS_EXPLORER;
            } else if (document.querySelector(".value.alliance_class.small.warrior")) {
                this.log("ally generaal", "debug");
                this.json.player.allyClass = ALLY_CLASS_WARRIOR;
            } else if (document.querySelector(".value.alliance_class.small.trader")) {
                this.log("ally trader", "debug");
                this.json.player.allyClass = ALLY_CLASS_MINER;
            } else {
                this.log("ally geen", "debug");
                this.json.player.allyClass = ALLY_CLASS_NONE;
            }
            this.saveData();
        }  
    }

    createButtons(coords = undefined){
        let div = document.querySelector('.amortizationtableAbsolute');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtable"}));
        div.addEventListener("click", () => this.createAmortizationTable(coords, "absolute"));
        div.appendChild(document.createTextNode("Absolute Amortization Table"));

        div = document.querySelector('.amortizationtableRecursive');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtable"}));
        div.addEventListener("click", () => this.createAmortizationTable(coords, "recursive"));
        div.appendChild(document.createTextNode("Recursive Amortization Table"));

        if(coords == undefined){
            div = document.querySelector('.accountproduction');
            div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent")).appendChild(this.createDOM("div", { class: "accountproduction"}));
            div.addEventListener("click", () => this.createAccountProduction(coords));
            div.appendChild(document.createTextNode("Account Production"));    
        }
    }

    openSettings(){
        let container = document.createElement("div");
        container.classList.add("popup-overlay");

        let ratioString = this.json.player.ratio[0] + "/" + this.json.player.ratio[1] + "/" + this.json.player.ratio[2];

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
                        <td><label for="Exporounds">Expo rounds per day:</label></td>
                        <td><input type="text" id="Exporounds" Exporounds="Exporounds" style="width:100%" value="${this.json.player.exporounds ?? 0}"></td>
                    </tr>
                    <tr>    
                        <td><label for="Exposlots">Bonus Expo slots:</label></td>
                        <td><input type="text" id="Exposlots" Exposlots="Exposlots" style="width:100%" value="${this.json.player.exposlots ?? 0}"></td>
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
    
    openPopup(popup){
        if (!popup) return;
        
        let button = document.querySelector(".close-button");
        button.addEventListener("click", () => this.closePopup(popup));

        button = document.querySelector(".save-button");
        button.addEventListener("click", () => {this.saveSettings(); this.closePopup(popup);});

        popup.classList.add("active");
    }

    saveSettings(){
        let newRatio = document.querySelector("#Ratio").value.replaceAll(",", ".");

        newRatio = newRatio.split("/");
        newRatio.forEach(r => { r = parseFloat(r); });

        this.json.player.exporounds = parseFloat(document.querySelector("#Exporounds").value.replaceAll(",", "."));
        this.json.player.exposlots = parseInt(document.querySelector("#Exposlots").value);

        this.saveData();
    }

    closePopup(popup){
        if(popup == null) return;
        
        popup.classList.remove("active");
        popup.classList.remove("popup-overlay");
        document.body.removeChild(popup);
    }

    removeButtons(){
        let div = document.querySelector('.amortizationtable');
        if(div){
            div.remove();
        }

        div = document.querySelector('.amortizationtable');
        if(div){
            div.remove();
        }

        div = document.querySelector('.accountproduction');
        if(div){
            div.remove();
        }
    }

    getTechnologyLevel(technologysearch){
        let level = document.querySelector(".technology." + technologysearch + " .level").getAttribute("data-value");
        console.log(document.querySelector(".technology." + technologysearch));
        if(document.querySelector(".technology." + technologysearch).getAttribute("data-status") == "active") 
        {
            level = {level: parseInt(level) + 1, timeFinished: document.querySelector(".technology." + technologysearch).getAttribute("data-end")};
        }
        return level;
    }

    getTechnologyFromSlot(slot){
        if(slot < 10){
            slot = "0" + slot;
        }

        for(let i = 1; i <= 4; i++){
            if(document.querySelector(".technology.lifeformTech1" + i + "2" + slot)){
                return {
                    name: document.querySelector(".technology.lifeformTech1" + i + "2" + slot).getAttribute("title").split("<br/>")[0],
                    level: this.getTechnologyLevel("lifeformTech1" + i + "2" + slot)
                }
            }    
        }

        return undefined;
    }

    checkCurrentLifeform(planet){
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
            console.error("Unknown lifeform: " + document.querySelector("#lifeform"));
        }

        if(!planet.lifeforms) planet.lifeforms = {};

        if(!planet.lifeforms.lifeformClass || lifeformClass != planet.lifeforms.lifeformClass){
            planet.lifeforms.lifeformClass = lifeformClass;
            planet.lifeforms.buildings = {};
            planet.lifeforms.techs = [];
        }
        return planet;
    }
}

(async () => {
    let helper = new OgameHelper();
    setTimeout(function () {
        helper.run();
    }, 0);
  })();