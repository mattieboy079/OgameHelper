//import { Player } from './logic/player.js';

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

let METAALMIJN;
let KRISTALMIJN;
let DEUTFABRIEK;
let PLASMATECHNIEK;
let ASTROFYSICA;

async function getXMLDoc(xml){
    const xmlText = await xml.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
   
    return xmlDoc;
}

function getObjectsFromXmlDoc(xmlDoc, objectName){
    const elements = xmlDoc.getElementsByTagName(objectName);
    const objects = [];

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];

      const attributes = {};
      for (let i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes[i];
        attributes[attribute.name] = attribute.value;
      }

      objects.push(attributes);
    }

    return objects;
}

function getServerSettingsURL(universe){
    return `https://${universe}.ogame.gameforge.com/api/serverData.xml`;
}

async function getPlayers(universe){
    const xmlDoc = await getXMLDoc(await fetch(`https://${universe}.ogame.gameforge.com/api/players.xml`));
    return getObjectsFromXmlDoc(xmlDoc, 'player')
}

async function getAlliances(universe){
    return await getXMLDoc(await fetch(`https://${universe}.ogame.gameforge.com/api/alliances.xml`));
}

async function getHighscore(universe, category, type){
    const xmlDoc = await getXMLDoc(await fetch(`https://${universe}.ogame.gameforge.com/api/highscore.xml?category=${category}&type=${type}`));
    return getObjectsFromXmlDoc(xmlDoc, 'player');
}

async function getUniverse(universe){    
    const xmlDoc = await getXMLDoc(await fetch(`https://${universe}.ogame.gameforge.com/api/universe.xml`));
    return getObjectsFromXmlDoc(xmlDoc, 'planet');
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

class OgameHelper {
    constructor(){
        let data = localStorage.getItem("ogh-" + UNIVERSE);
        if(data && data !== "undefined"){   
            this.json = JSON.parse(data);
            console.log(this.json);
            let player = this.json.player;
            //let newPlayer = new Player(this.json.player);
            this.getServerSettings(UNIVERSE);
            if(!this.json.player){
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

    getNewPlayerJson(){
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
            if(coords){
                let name = planet.querySelector(".planet-name").textContent;
                this.json.player.planets[index] = this.newPlanet(this.trimCoords(coords), name);
            }
        });

        console.log(this);
    }

    trimCoords(coords){
        return coords.textContent.replace(/^\[|\]$/g, '');
    }

    async getServerSettings(universe){
        let url = getServerSettingsURL(universe);
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
            this.json.settings.peacefulFleetSpeed = xml.querySelector("speedFleetPeaceful").innerHTML,
            this.json.settings.deutUsageFactor = xml.querySelector("globalDeuteriumSaveFactor").innerHTML,
            this.json.settings.topscore = xml.querySelector("topScore").innerHTML    
            this.saveData();
        });
        console.log(this.json.settings);
    }

    saveData(){
        console.log("data to save:");
        console.log(this.json);
        localStorage.setItem("ogh-" + UNIVERSE, JSON.stringify(this.json));
    }

    getInactiveData(){
        return JSON.parse(localStorage.getItem("ogh-" + UNIVERSE + "-inactives"));
    }

    saveInactiveData(inactiveList){
        localStorage.setItem("ogh-" + UNIVERSE + "-inactives", JSON.stringify(inactiveList));
    }

    getBonus(planet, resource, totalPlanets = this.json.player.planets){
        let verzamelaarBonus = this.json.player.playerClass == PLAYER_CLASS_COLLECTOR ? 0.25 : 0;
        let handelaarBonus = this.json.player.allyClass == ALLY_CLASS_TRADER ? 0.05 : 0;
        let plasmaFactor = resource === "metal" ? 0.01 : (resource === "crystal" ? 0.0066 : 0.0033);
        let plasmaLevel = this.getLevel(this.json.player.plasma); 
        let plasmaBonus = plasmaLevel ? plasmaLevel * plasmaFactor : 0;
        let officerBonus = this.json.player.geologist ? (this.json.player.legerleiding ? 0.12 : 0.1) : 0;
        let processorBonus = Math.min(0.5, planet.crawlers ? Math.min(planet.crawlers, this.calcMaxCrawlers(planet)) * (this.json.player.playerClass === PLAYER_CLASS_COLLECTOR ? 0.00045 : 0.0002) : 0);
        let lifeformBonus = 0;
        if(this.json.settings.lifeforms){
            let lifeformBuildingBonus = 0;
            let lifeformTechBonus = 0;
            if(planet.lifeforms && planet.lifeforms.lifeformClass){
                const buildings = planet.lifeforms.buildings;
                if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN){
                    if(resource == "metal") lifeformBuildingBonus = 0.015 * this.getLevel(buildings.highEnergySmelting);
                    else if(resource == "crystal") lifeformBuildingBonus = 0.015 * this.getLevel(buildings.fusionPoweredProduction);
                    else if(resource == "deut") lifeformBuildingBonus = 0.01 * this.getLevel(buildings.fusionPoweredProduction);
                } else if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                    if(resource == "metal") lifeformBuildingBonus = 0.02 * this.getLevel(buildings.magmaForge);
                    else if(resource == "crystal") lifeformBuildingBonus = 0.02 * this.getLevel(buildings.crystalRefinery);
                    else if(resource == "deut") lifeformBuildingBonus = 0.02 * this.getLevel(buildings.deuteriumSynthesizer);
                } else if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                    if(resource == "deut") lifeformBuildingBonus = 0.02 * this.getLevel(buildings.deuteriumSynthesizer);
                }
            }

            totalPlanets.forEach(p => {
                let HoogwaardigeExtractoren = p.lifeforms.techs.find(tech => tech.name == "High-Performance Extractors" || tech.name == "Hoogwaardige Extractoren" || tech.name == "Estrattori ad alto rendimento")
                if(HoogwaardigeExtractoren) lifeformTechBonus += 0.0006 * this.getLevel(HoogwaardigeExtractoren.level);
                let MagmaPoweredProduction = p.lifeforms.techs.find(tech => tech.name == "Magma-Powered Production" || tech.name == "Magma-Aangedreven Productie" || tech.name == "Tecniche estrattive magmatiche")
                if(MagmaPoweredProduction) lifeformTechBonus += 0.0008 * this.getLevel(MagmaPoweredProduction.level);
                let GeautomatiseerdeTransportlijnen = p.lifeforms.techs.find(tech => tech.name == "Automated Transport Lines" || tech.name == "Geautomatiseerde Transportlijnen" || tech.name == "Linee di trasporto automatizzate")
                if(GeautomatiseerdeTransportlijnen) lifeformTechBonus += 0.0006 * this.getLevel(GeautomatiseerdeTransportlijnen.level);
                let VerbeterdeProductieTechnologien = p.lifeforms.techs.find(tech => tech.name == "Enhanced Production Technologies" || tech.name == "Verbeterde Productie Technologiën" || tech.name == "Tecnologie di estrazione migliorate")
                if(VerbeterdeProductieTechnologien) lifeformTechBonus += 0.0006 * this.getLevel(VerbeterdeProductieTechnologien.level);
                let Psychoharmonisator = p.lifeforms.techs.find(tech => tech.name == "Psychoharmoniser" || tech.name == "Psychoharmonisator" || tech.name == "Armonizzatore psicologico")
                if(Psychoharmonisator) lifeformTechBonus += 0.0006 * this.getLevel(Psychoharmonisator.level);
                let ArtificialSwarmIntelligence = p.lifeforms.techs.find(tech => tech.name == "Artificial Swarm Intelligence" || tech.name === "Artificiële Zwerm Intelligentie" || tech.name == "Intelligenza collettiva artificiale")
                if(ArtificialSwarmIntelligence) lifeformTechBonus += 0.0006 * this.getLevel(ArtificialSwarmIntelligence.level);
                
                if(resource == "metal"){
                    let Dieptepeiling = p.lifeforms.techs.find(tech => tech.name == "Depth Souding" || tech.name == "Dieptepeiling" || tech.name == "Sondaggio da alte profondità")
                    if(Dieptepeiling) lifeformTechBonus += 0.0008 * this.getLevel(Dieptepeiling.level);
                    let VerhardeDiamantenBoorkoppen = p.lifeforms.techs.find(tech => tech.name == "Hardened Diamond Drill Heads" || tech.name == "Verharde Diamanten Boorkoppen" || tech.name == "Punte di diamante irrobustite")
                    if(VerhardeDiamantenBoorkoppen) lifeformTechBonus += 0.0008 * this.getLevel(VerhardeDiamantenBoorkoppen.level);
                }
                else if(resource == "crystal"){
                    let AkoestischScannen = p.lifeforms.techs.find(tech => tech.name == "Acoustic Scanning" || tech.name == "Akoestisch Scannen" || tech.name == "Sondaggio acustico")
                    if(AkoestischScannen) lifeformTechBonus += 0.0008 * this.getLevel(AkoestischScannen.level);
                    let SeismischeMijntechnologie = p.lifeforms.techs.find(tech => tech.name == "Seismic Mining Technology" || tech.name == "Seismische Mijntechnologie" || tech.name == "Tecnologie minerarie sismiche")
                    if(SeismischeMijntechnologie) lifeformTechBonus += 0.0008 * this.getLevel(SeismischeMijntechnologie.level);
                } else if (resource == "deut"){
                    let HogeEnergiePompSystemen = p.lifeforms.techs.find(tech => tech.name == "High Energy Pump Systems" || tech.name == "Hoge Energie Pomp Systemen" || tech.name == "Sistemi di pompaggio ad alta energia")
                    if(HogeEnergiePompSystemen) lifeformTechBonus += 0.0008 * this.getLevel(HogeEnergiePompSystemen.level);
                    let Katalysatortechnologie = p.lifeforms.techs.find(tech => tech.name == "Catalyser Technology" || tech.name == "Katalysatortechnologie" || tech.name == "Tecnologia Catalizzatore")
                    if(Katalysatortechnologie) lifeformTechBonus += 0.0008 * this.getLevel(Katalysatortechnologie.level);
                    let Sulfideproces = p.lifeforms.techs.find(tech => tech.name == "Sulphide Process" || tech.name == "Sulfideproces" || tech.name == "Tecnologia Processo al solfuro")
                    if(Sulfideproces) lifeformTechBonus += 0.0008 * this.getLevel(Sulfideproces.level);
                    let MagmaAangedrevenPompsystemen = p.lifeforms.techs.find(tech => tech.name == "Magma-Powered Pump Systems" || tech.name == "Magma-aangedreven Pompsystemen" || tech.name == "Sistema di pompaggio al magma")
                    if(MagmaAangedrevenPompsystemen) lifeformTechBonus += 0.0008 * this.getLevel(MagmaAangedrevenPompsystemen.level);
                }
            });
            lifeformTechBonus *= (1 + this.getLifeformLevelBonus(planet));
            lifeformBonus = lifeformBuildingBonus + lifeformTechBonus;
            //console.log(resource + ": " + verzamelaarBonus + " - " +  handelaarBonus + " - " + plasmaBonus + " - " + officerBonus + " - " + processorBonus + " - " + lifeformBuildingBonus + " - " + lifeformTechBonus);
        }
        return verzamelaarBonus + handelaarBonus + plasmaBonus + officerBonus + processorBonus + lifeformBonus;
    }

    getLevel(technologyLevel){
        return parseInt(technologyLevel?.level ?? technologyLevel ?? 0);
    }

    getPrerequisites(upgradeType){
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
            'highEnergySmelting': {
                'researchCentre': 5,
                'residentialSector': 12,
                'biosphereFarm': 13,
            }, 
            'fusionPoweredProduction': {
                'academyOfSciences': 1,
                'residentialSector': 40,
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

    getPrerequisiteMSECosts(planet, upgradeType){
        let metalCost = 0;

        const requiredUpgrades = this.getPrerequisites(upgradeType);
    
        if (!requiredUpgrades) {
            return 0;
        }
    
        for (const [building, level] of Object.entries(requiredUpgrades)) {
            const currentLevel = this.getLevel(planet.lifeforms.buildings[building]);
            if (currentLevel < level) {
                for (let l = currentLevel; l < level; l++) {
                    metalCost += this.getMSECosts(planet, building, l);
                }
            }
        }
        
        return metalCost;
    }

    getPrerequisiteMSEProd(planet, upgradeType){
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
     * Returns the cost calculated in metal of the given upgrade.
     *
     * @param {planet} planet The corresponding planet.
     * @param {string} upgradeType The building or technology to upgrade.
     * @param {number} level The level the building is before upgrading.
     * @return {number} the cost calculated in MSE.
     */
    getMSECosts(planet, upgradeType, level){
        level = this.getLevel(level);
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
            let factor = 1;
            if(this.json.settings.lifeforms){
                let verbeterdeStellaratorKorting = 0;
                this.json.player.planets.forEach(planet => {
                    let tech = planet.lifeforms.techs?.find(t => t.name == "Verbeterde Stellarator" || t.name == "Concentratore astrale");
                    if(tech) verbeterdeStellaratorKorting += this.getLevel(tech.level) * .0015 * (1 + this.getLifeformLevelBonus(planet));
                });
                factor -= Math.min(verbeterdeStellaratorKorting, 0.5);
            }
            metalCost = 2000 * Math.pow(2, level) * factor;
            crystalCost = 4000 * Math.pow(2, level) * factor;
            deutCost = 1000 * Math.pow(2, level) * factor;
        } else if (upgradeType === "astro"){
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
        } else if (upgradeType === "highEnergySmelting") {
            metalCost = 9000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 6000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 3000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "fusionPoweredProduction") {
            metalCost = 50000 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 25000 * Math.pow(1.2, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.2, level) * (level + 1);
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
        } else if (upgradeType === "updateNetwork") {
            metalCost = 5000 * Math.pow(1.8, level) * (level + 1);
            crystalCost = 3800 * Math.pow(1.8, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.8, level) * (level + 1);
        } else if (upgradeType === "microchipAssemblyLine") {
            metalCost = 50000 * Math.pow(1.07, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.07, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.07, level) * (level + 1);
        } else if (upgradeType === "highPerformanceSynthesizer") {
            metalCost = 100000 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.2, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.2, level) * (level + 1);
        } 

        //LIFEFORM TECHS
        else if (upgradeType === "High-Performance Extractors" || upgradeType === "Hoogwaardige Extractoren" || upgradeType == "Estrattori ad alto rendimento") {
            metalCost = 7000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Acoustic Scanning" || upgradeType === "Akoestisch Scannen" || upgradeType == "Sondaggio acustico") {
            metalCost = 7500 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 12500 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "High Energy Pump Systems" || upgradeType === "Hoge Energie Pomp Systemen" || upgradeType == "Sistemi di pompaggio ad alta energia") {
            metalCost = 15000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Magma-Powered Production"|| upgradeType == "Magma-Aangedreven Productie" || upgradeType == "Tecniche estrattive magmatiche") {
            metalCost = 25000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Catalyser Technology" || upgradeType == "Katalysatortechnologie" || upgradeType == "Tecnologia Catalizzatore") {
            metalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 6000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Automated Transport Lines" || upgradeType == "Geautomatiseerde Transportlijnen" || upgradeType == "Linee di trasporto automatizzate") {
            metalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Sulphide Process" || upgradeType == "Sulfideproces" || upgradeType == "Tecnologia Processo al solfuro") {
            metalCost = 7500 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 12500 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Telekinetic Tractor Beam" || upgradeType == "Telekinetische Tractorstraal" || upgradeType == "Raggio di trazione telecinetico") {
            metalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 15000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 7500 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Enhanced Sensor Technology" || upgradeType == "Verbeterde Sensortechnologie" || upgradeType == "Tecnologia Sensori migliorata") {
            metalCost = 25000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } 

        //LIFEFORMTECHS T2
        else if (upgradeType === "Depth Souding" || upgradeType == "Dieptepeiling" || upgradeType == "Sondaggio da alte profondità"){
            metalCost = 70000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Hardened Diamond Drill Heads" || upgradeType == "Verharde Diamanten Boorkoppen" || upgradeType == "Punte di diamante irrobustite"){
            metalCost = 85000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 35000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Enhanced Production Technologies" || upgradeType == "Verbeterde Productie Technologiën" || upgradeType == "Tecnologie di estrazione migliorate"){
            metalCost = 80000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;
        } else if (upgradeType === "Improved Stellarator" || upgradeType == "Verbeterde Stellarator" || upgradeType == "Concentratore astrale"){
            metalCost = 75000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 55000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Sixth Sense" || upgradeType == "Zesde Zintuig" || upgradeType == "Sesto senso"){
            metalCost = 120000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 30000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Seismic Mining Technology" || upgradeType == "Seismische Mijntechnologie" || upgradeType == "Tecnologie minerarie sismiche"){
            metalCost = 120000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 30000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 25000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Psychoharmoniser" || upgradeType == "Psychoharmonisator" || upgradeType == "Armonizzatore psicologico"){
            metalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Magma-Powered Pump Systems" || upgradeType == "Magma-aangedreven Pompsystemen" || upgradeType == "Sistema di pompaggio al magma"){
            metalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 30000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } 

        //LIFEFORMTECHS T3
        else if (upgradeType === "Artificial Swarm Intelligence" || upgradeType === "Artificiële Zwerm Intelligentie" || upgradeType == "Intelligenza collettiva artificiale"){
            metalCost = 200000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 100000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 100000 * Math.pow(1.5, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Ion Crystal Modules" || upgradeType === "Ionenkristal Modules" || upgradeType == "Moduli Cristalli ionici"){
            metalCost = 200000 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 100000 * Math.pow(1.2, level) * (level + 1);
            deutCost = 100000 * Math.pow(1.2, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Kaelesh Discoverer Enhancement" || upgradeType === "Kaelesh Ontdekker Verbetering" || upgradeType == "Rinforzo Esploratore Kaelesh"){
            metalCost = 300000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 180000 * Math.pow(1.7, level) * (level + 1);
            deutCost = 120000 * Math.pow(1.7, level) * (level + 1);
            techUpgrade = true;        
        } else if (upgradeType === "Rock’tal Collector Enhancement" || upgradeType === "Rock’tal Verzamelaar Verbetering" || upgradeType == "Potenziamento Collezionista Rock`tal"){
            metalCost = 300000 * Math.pow(1.7, level) * (level + 1);
            crystalCost = 180000 * Math.pow(1.7, level) * (level + 1);
            deutCost = 120000 * Math.pow(1.7, level) * (level + 1);
            techUpgrade = true;
        }
        
        
        if(techUpgrade){
            let factor = 1;
            switch(planet.lifeforms.lifeformClass){
                case LIFEFORM_CLASS_MENSEN:
                    const researchCentre = this.getLevel(planet.lifeforms.buildings.researchCentre);
                    if (researchCentre > 1) {
                        factor -= planet.lifeforms.buildings.researchCentre * 0.005;
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
                    if(vortexChamber > 1){
                        factor -= planet.lifeforms.buildings.vortexChamber * 0.0025;
                    } 
                    break;
            }

            metalCost *= factor;
            crystalCost *= factor;
            deutCost *= factor;
//            console.log(this.getBigNumber(metalCost) + " / " + this.getBigNumber(crystalCost) + " / " + this.getBigNumber(deutCost));
        }

        if(planet && this.json.settings.lifeforms && planet.lifeforms.lifeformClass === LIFEFORM_CLASS_ROCKTAL){
            let factor = 1;
            if(planet.lifeforms.buildings){
                if(rockTalBuild) factor -= 0.01 * this.getLevel(planet.lifeforms.buildings.megalith);
                if(resProdBuild) factor -= 0.005 * this.getLevel(planet.lifeforms.buildings.mineralResearchCentre);                    
            }
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
                metalProd += this.getRawProduction(p, "metal", this.getLevel(p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += this.getRawProduction(p, "crystal", this.getLevel(p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += this.getRawProduction(p, "deut", this.getLevel(p.deut)) * this.json.settings.economySpeed;
            });
            metalProd *= 0.01;
            crystalProd *= 0.0066;
            deutProd *= 0.0033;
        } else if (productionType === "astro"){
            let planets = this.copyArray(this.json.player.planets);
            planets.push(planet);

            this.json.player.planets.forEach(p => {
                metalProd += this.getRawProduction(p, "metal", p.metal) * (this.getBonus(p, "metal", planets) - this.getBonus(p, "metal", this.json.player.planets)) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
                crystalProd += this.getRawProduction(p, "crystal", p.crystal) * (this.getBonus(p, "crystal", planets) - this.getBonus(p, "crystal", this.json.player.planets))  * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
                deutProd += this.getRawProduction(p, "metal", p.metal) * (this.getBonus(p, "deut", planets) - this.getBonus(p, "deut", this.json.player.planets)) * this.json.settings.economySpeed;
                console.log(this.getBigNumber(metalProd) + " - " + this.getBigNumber(crystalProd) + " - " + this.getBigNumber(deutProd))
            });

            metalProd += (30 + this.getRawProduction(planet, "metal", planet.metal) * (1 + this.getBonus(planet, "metal", planets))) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
            crystalProd += (15 + this.getRawProduction(planet, "crystal", planet.crystal) * (1 + this.getBonus(planet, "crystal", planets))) * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
            deutProd += (this.getRawProduction(planet, "deut", planet.deut) * (1 + this.getBonus(planet, "deut", planets))) * this.json.settings.economySpeed;
            console.log(this.getBigNumber(metalProd) + " - " + this.getBigNumber(crystalProd) + " - " + this.getBigNumber(deutProd))
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
        } else if (productionType === "mineralResearchCentre") {
            let perc = 0.005 / (1 - 0.005 * parseInt(level))
            this.json.player.planets.forEach(p => {
                metalProd += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += (this.getRawProduction(p, "deut", p.deut) * (1 + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;
            });

            metalProd *= perc / this.json.player.planets.length;
            crystalProd *= perc / this.json.player.planets.length;
            deutProd *= perc / this.json.player.planets.length;
        } else if (productionType === "highPerformanceSynthesizer") {
            deutProd = 0.02 * this.getRawProduction(planet, "deut", planet.deut) * this.json.settings.economySpeed;
        } 
        
        //LIFEFORM TECHS
        else if (productionType == "High-Performance Extractors" || productionType == "Hoogwaardige Extractoren" || productionType == "Estrattori ad alto rendimento") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Acoustic Scanning" || productionType == "Akoestisch Scannen" || productionType == "Sondaggio acustico") {
            this.json.player.planets.forEach(p => {
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "High Energy Pump Systems" || productionType == "Hoge Energie Pomp Systemen" || productionType == "Sistemi di pompaggio ad alta energia") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Magma-Powered Production" || productionType == "Magma-Aangedreven Productie" || productionType == "Tecniche estrattive magmatiche") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
       } else if (productionType == "Catalyser Technology" || productionType == "Katalysatortechnologie" || productionType == "Tecnologia Catalizzatore") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Automated Transport Lines" || productionType == "Geautomatiseerde Transportlijnen" || productionType == "Linee di trasporto automatizzate") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Sulphide Process" || productionType == "Sulfideproces" || productionType == "Tecnologia Processo al solfuro") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType == "Telekinetic Tractor Beam" || productionType == "Telekinetische Tractorstraal" || productionType == "Raggio di trazione telecinetico") {
            metalProd = 0.002 * this.calcBaseExpoShipProd() * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformLevelBonus(planet));
        } else if (productionType == "Enhanced Sensor Technology" || productionType == "Verbeterde Sensortechnologie" || productionType == "Tecnologia Sensori migliorata") {
            metalProd = 0.002 * this.calcBaseExpoResProd() * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformLevelBonus(planet));
        } 
        
        //LIFEFORMTECHS T2
        else if (productionType === "Depth Souding" || productionType == "Dieptepeiling" || productionType == "Sondaggio da alte profondità"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Hardened Diamond Drill Heads" || productionType == "Verharde Diamanten Boorkoppen" || productionType == "Punte di diamante irrobustite"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Enhanced Production Technologies" || productionType == "Verbeterde Productie Technologiën" || productionType == "Tecnologie di estrazione migliorate"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Sixth Sense" || productionType == "Zesde Zintuig" || productionType == "Sesto senso"){
            metalProd = 0.002 * this.calcBaseExpoResProd() * this.getAmountOfExpeditionsPerDay() / 24 * (1 + this.getLifeformLevelBonus(planet));
        } else if (productionType === "Seismic Mining Technology" || productionType == "Seismische Mijntechnologie" || productionType == "Tecnologie minerarie sismiche"){
            this.json.player.planets.forEach(p => {
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Psychoharmoniser" || productionType == "Psychoharmonisator" || productionType == "Armonizzatore psicologico"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } else if (productionType === "Magma-Powered Pump Systems" || productionType == "Magma-aangedreven Pompsystemen" || productionType == "Sistema di pompaggio al magma"){
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });
        } 
        
        //LIFEFORMTECHS T3
        else if (productionType === "Artificial Swarm Intelligence" || productionType === "Artificiële Zwerm Intelligentie" || productionType == "Intelligenza collettiva artificiale"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal") * (1 + this.getLifeformLevelBonus(planet));
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal") * (1 + this.getLifeformLevelBonus(planet));
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed * (1 + this.getLifeformLevelBonus(planet));
            });           
        } else if (productionType === "Ion Crystal Modules" || productionType === "Ionenkristal Modules" || productionType == "Moduli Cristalli ionici"){
            //TODO
            return 0;
        } else if (productionType === "Kaelesh Discoverer Enhancement" || productionType === "Kaelesh Ontdekker Verbetering" || productionType == "Rinforzo Esploratore Kaelesh"){
            if(this.json.player.playerClass === PLAYER_CLASS_EXPLORER){
                metalProd = 0.002 * (this.calcExpoShipProd() + this.calcExpoResProd());
                return metalProd;
            }
            return 0;           
        } else if (productionType === "Rock’tal Collector Enhancement" || productionType === "Rock’tal Verzamelaar Verbetering" || productionType == "Potenziamento Collezionista Rock`tal"){
            if(this.json.player.playerClass === PLAYER_CLASS_COLLECTOR){
                metalProd = 0;
                return metalProd;
            }
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
        return Math.floor(Math.sqrt(this.getLevel(this.json.player.astro))) + (this.json.player.playerClass == PLAYER_CLASS_EXPLORER ? 2 : 0) + (this.json.player.admiral ? 1 : 0) + parseInt(this.json.player.exposlots);
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

    getFactorForPos(pos, productionType) {
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

    getExtraMSEProduction(planet, productionType, level){
        level = this.getLevel(level);
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
        return averageTemperatures[parseInt(coords.split(":")[2])];
    }

    checkPlanets(){
        console.log("checking planets");
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
                if(b.timeFinished) blocked.push({coords: planet.coords, type: "building", timeFinished: b.timeFinished});
            });

            
            if(planet.lifeforms){
                if(planet.lifeforms.buildings){
                    Object.entries(planet.lifeforms.buildings).forEach(([key, value]) => {
                        if(value.timeFinished) blocked.push({coords: planet.coords, type: "lifeformbuilding", timeFinished: value.timeFinished});                    
                    })    
                }

                if(planet.lifeforms.techs?.length > 0){
                    planet.lifeforms.techs.forEach(t => {
                        if(t.level.timeFinished) blocked.push({coords: planet.coords, type: "lifeformtech", timeFinished: t.level.timeFinished});
                    })    
                }
            }
        });

        return blocked;
    }

    createAmortizationTable(coords = undefined, listType){
        let expoProfit = this.calcExpoProfit();
        console.log("expo: " + this.getBigNumber(expoProfit));

        const blocked = this.checkPlanetBlocks();

        console.log(blocked);

        //create table
        this.removeButtons();

        let div = document.querySelector('.amortizationtable');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent") || document.querySelector("#lfbuildingscomponent.maincontent") || document.querySelector("#lfresearchcomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtable"}));
        
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
        if(this.json.settings.lifeforms){
            let costLoweringUpgrades = this.getIndirectProductionUpgrades();
            if(this.json.player.includeIndirectProductionBuildings == "true")
                absoluteAmortization = this.addIndirectProductionUpgradesToAmortization(absoluteAmortization, costLoweringUpgrades, blocked);
        }



        if(listType == "recursive"){
            //TODO: trim list for planet sided list
            let totalAmortization = this.createAmortizationListString(absoluteAmortization, this.json.player.recursiveListAmount ?? 50);        

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
                    if(technology == "Telekinetische Tractorstraal" || technology == "Verbeterde Sensortechnologie" || technology == "Zesde Zintuig" 
                    || technology == "Raggio di trazione telecinetico" || technology == "Tecnologia Sensori migliorata" || technology == "Sesto senso")
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
                    if(technology == "Telekinetische Tractorstraal" || technology == "Verbeterde Sensortechnologie" || technology == "Zesde Zintuig" 
                    || technology == "Raggio di trazione telecinetico" || technology == "Tecnologia Sensori migliorata" || technology == "Sesto senso")
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
        let totalAmortization = [];
        let amorColor;
        this.json.player.planets.forEach((planet) => {
            if(!coords || planet.coords == coords){
                amorColor = this.getAmortizationColor(planet.coords, "building", blocked);
                totalAmortization.push(this.createAmortization(planet, "metal", planet.metal, "productionbuilding", amorColor));
                totalAmortization.push(this.createAmortization(planet, "crystal", planet.crystal, "productionbuilding", amorColor));
                totalAmortization.push(this.createAmortization(planet, "deut", planet.deut, "productionbuilding", amorColor));


                if(this.json.settings.lifeforms && planet.lifeforms.lifeformClass){
                    let amorColorBuilding = this.getAmortizationColor(planet.coords, "lifeformbuilding", blocked);
                    if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN){
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "highEnergySmelting", this.getLevel(planet.lifeforms.buildings.highEnergySmelting), "-", amorColorBuilding));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "fusionPoweredProduction", this.getLevel(planet.lifeforms.buildings.fusionPoweredProduction), "-", amorColorBuilding));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "magmaForge", this.getLevel(planet.lifeforms.buildings.magmaForge), "rocktalbuilding", amorColorBuilding));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "crystalRefinery", this.getLevel(planet.lifeforms.buildings.crystalRefinery), "rocktalbuilding", amorColorBuilding));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "deuteriumSynthesizer", this.getLevel(planet.lifeforms.buildings.deuteriumSynthesizer), "rocktalbuilding", amorColorBuilding));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "highPerformanceSynthesizer", this.getLevel(planet.lifeforms.buildings.highPerformanceSynthesizer), "-", amorColorBuilding));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_KAELESH) {
                    } else {
                        console.warn("lifeform not found: " + planet.lifeforms.lifeformClass);
                    }
    
                    let amorColorTech = this.getAmortizationColor(planet.coords, "lifeformtech", blocked);
                    
                    for(let s = 0; s < 18; s++){
                        const tech = planet.lifeforms.techs[s];
                        if(tech){
                            const level = this.getLevel(tech.level);
                            let extraMSE = this.getMSEProduction(planet, tech.name, level);
                            if(s == 3 || s == 4 || s == 10)
                                console.log(s + ": " + this.getBigNumber(extraMSE));

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
                                    color: amorColorTech,
                                });
                            }
                        } else {
                            const possibleTechs = this.getTechsForSlot(s);
                            if(possibleTechs.length > 0){
                                let possibleTechsAmortizations = [];
                                const unlockPrerequisites = this.getUnlockPrerequisitesForTechSlot(s, planet);
                                const unlockCosts = this.getUnlockCostsForPrerequisites(planet, unlockPrerequisites);
                                possibleTechs.forEach(tech => {
                                    let level = 1;
                                    let gainMse = this.getMSEProduction(planet, tech, level);
                                    if(gainMse > 0){
                                        let totalCost = unlockCosts + this.getMSECosts(planet, tech, level);
                                        let currentROI = totalCost / gainMse;
                                        while(this.getMSECosts(planet, tech, level + 1) / this.getMSEProduction(planet, tech, level + 1) < currentROI){
                                            level++;
                                            gainMse += this.getMSEProduction(planet, tech, level);
                                            totalCost += this.getMSECosts(planet, tech, level);
                                            currentROI = totalCost / gainMse;
                                        }
    
                                        possibleTechsAmortizations.push({
                                            coords: planet.coords, 
                                            name: planet.name, 
                                            technology: tech  + " (slot " + (s + 1) + ")", 
                                            level: "1-" + (level + 1), 
                                            amortization: totalCost / gainMse / 24, 
                                            msecost: totalCost,
                                            type: "lifeformtech",
                                            color: amorColorTech,
                                        });
                                    }
                                });

                                possibleTechsAmortizations.sort((a,b) => a.amortization - b.amortization);
                                if(possibleTechsAmortizations.length > 0){
                                    if(unlockCosts > 0){
                                        let quarters = unlockPrerequisites.quarters;
                                        let food = unlockPrerequisites.food;
                                        let t2building = unlockPrerequisites.t2popBuilding;
                                        let t3building = unlockPrerequisites.t3popBuilding;

                                        if(quarters.level < quarters.levelNeeded){
                                            let level = parseInt(quarters.level) + 1 == quarters.levelNeeded 
                                            ? quarters.levelNeeded 
                                            : (parseInt(quarters.level) + 1) + "-" + quarters.levelNeeded
                                            totalAmortization.push({
                                                coords: planet.coords, 
                                                name: planet.name, 
                                                technology: /*possibleTechsAmortizations[0].technology + " => " + */ quarters.name, 
                                                level: level, 
                                                amortization: possibleTechsAmortizations[0].amortization, 
                                                msecost: possibleTechsAmortizations[0].msecost,
                                                type: "lifeformbuilding",
                                                color: amorColorBuilding,
                                            })
                                        }
                                        if(food.level < food.levelNeeded){
                                            let level = parseInt(food.level) + 1 == food.levelNeeded 
                                            ? food.levelNeeded 
                                            : (parseInt(food.level) + 1) + "-" + food.levelNeeded
                                            totalAmortization.push({
                                                coords: planet.coords, 
                                                name: planet.name, 
                                                technology: /*possibleTechsAmortizations[0].technology + " => " + */ food.name, 
                                                level: level, 
                                                amortization: possibleTechsAmortizations[0].amortization, 
                                                msecost: possibleTechsAmortizations[0].msecost,
                                                type: "lifeformbuilding",
                                                color: amorColorBuilding,
                                            })
                                        }
                                        if(t2building.level < t2building.levelNeeded){
                                            let level = parseInt(t2building.level) + 1 == t2building.levelNeeded 
                                            ? t2building.levelNeeded 
                                            : (parseInt(t2building.level) + 1) + "-" + t2building.levelNeeded
                                            totalAmortization.push({
                                                coords: planet.coords, 
                                                name: planet.name, 
                                                technology: /*possibleTechsAmortizations[0].technology + " => " + */ t2building.name, 
                                                level: level, 
                                                amortization: possibleTechsAmortizations[0].amortization, 
                                                msecost: possibleTechsAmortizations[0].msecost,
                                                type: "lifeformbuilding",
                                                color: amorColorBuilding,
                                            })
                                        }
                                        if(t3building.level < t3building.levelNeeded){
                                            let level = parseInt(t3building.level) + 1 == t3building.levelNeeded 
                                            ? t3building.levelNeeded 
                                            : (parseInt(t3building.level) + 1) + "-" + t3building.levelNeeded
                                            totalAmortization.push({
                                                coords: planet.coords, 
                                                name: planet.name, 
                                                technology: /*possibleTechsAmortizations[0].technology + " => " + */ t3building.name, 
                                                level: level, 
                                                amortization: possibleTechsAmortizations[0].amortization, 
                                                msecost: possibleTechsAmortizations[0].msecost,
                                                type: "lifeformbuilding",
                                                color: amorColorBuilding,
                                            })
                                        }
                                    } else {
                                        totalAmortization.push(possibleTechsAmortizations[0]);
                                    }
                                }
                            }
                        }
                    }            
                }    
            }
        });

        amorColor = this.getAmortizationColor("account", "research", blocked);
        totalAmortization.push({
            coords: "account",
            name: "account",
            technology: "plasma",
            level: (this.getLevel(this.json.player.plasma) + 1),
            amortization: this.calculateAmortization(undefined, "plasma", this.getLevel(this.json.player.plasma)),
            msecost: this.getMSECosts(undefined, "plasma", this.getLevel(this.json.player.plasma)),
            type: "plasma",
            color: amorColor
        });

        totalAmortization.push(this.createAstroAmortizationObject(blocked));

        totalAmortization.sort((a,b) => a.amortization - b.amortization);
        console.log(totalAmortization);
        return totalAmortization;
    }

    getAvgPlanet(){
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

        if(this.json.settings.lifeforms){
            planetToCreate = this.getMostCommonValue(planets.map(p => p.lifeforms.lifeformClass));
        }
        
        if(!planetToCreate || planetToCreate == "standard"){
            return avgPlanet;
        }

        avgPlanet.lifeforms = {
            lifeformClass: planetToCreate,
            techs: [],
            buildings: {},
        }

        for(let i = 0; i < 18; i++){
            let techname = this.getMostCommonValue(planets.map(p => this.getTechNameFromIndex(p.lifeforms.techs, i)));
            if(techname){
                let techLevel = this.calculateMedian(planets.filter(p => this.getTechNameFromIndex(p.lifeforms.techs, i) == techname).map(p => this.getLevel(p.lifeforms.techs.find(t => t.name == techname).level)));
                avgPlanet.lifeforms.techs.push({
                    name: techname,
                    level: techLevel,
                });
            }
        }
        console.log(avgPlanet);

        if(planetToCreate == LIFEFORM_CLASS_ROCKTAL){
            avgPlanet.lifeforms.buildings = {
                meditationEnclave: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.meditationEnclave))),
                crystalFarm: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.crystalFarm))),
                runeTechnologium: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.runeTechnologium))),
                runeForge: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.runeForge))),
                oriktorium: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.oriktorium))),
                magmaForge: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.magmaForge))),
                disruptionChamber: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.disruptionChamber))),
                megalith: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.megalith))),
                crystalRefinery: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.crystalRefinery))),
                deuteriumSynthesizer: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.deuteriumSynthesizer))),
                mineralResearchCentre: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.mineralResearchCentre))),
                advancedRecyclingPlant: this.calculateMedian(planets.map(p => this.getLevel(p.lifeforms.buildings.advancedRecyclingPlant))),
            }
        } else if(planetToCreate == LIFEFORM_CLASS_MENSEN){
            console.warn("Not implemented: avg Planet for humans");
        } else if(planetToCreate == LIFEFORM_CLASS_MECHA){
            console.warn("Not implemented: avg Planet for mecha");
        } else if(planetToCreate == LIFEFORM_CLASS_KAELESH){
            console.warn("Not implemented: avg Planet for kaelesh");
        }

        return avgPlanet;
    }

    getTechNameFromIndex(techs, index){
        if(techs.length > index && index >= 0) return techs[index].name;
        else return undefined;
    }

    getMostCommonValue(array){
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

    calculateMedian(numberArray){
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

    createAstroAmortizationObject(blocked){
        //astro
        let totalMSECostsAstroNewPlanet = 0;
        let totalMSECostsAstroNewExpo = 0;
        let totalMSEProdAstroNewPlanet = 0;
        let totalMSEProdAstroNewExpo = 0;
        let newPlanetExpoBoostProduction = 0;

        let avgPlanet = this.getAvgPlanet();
        
        const newPlanetProduction = this.getMSEProduction(avgPlanet, "astro", undefined);
        if(this.json.settings.lifeforms){
            newPlanetExpoBoostProduction = avgPlanet.lifeforms.techs[3].level * this.getMSEProduction(avgPlanet, "Telekinetische Tractorstraal", avgPlanet.lifeforms.techs[3].level);
            newPlanetExpoBoostProduction += avgPlanet.lifeforms.techs[4].level * this.getMSEProduction(avgPlanet, "Verbeterde Sensortechnologie", avgPlanet.lifeforms.techs[4].level);
            newPlanetExpoBoostProduction += avgPlanet.lifeforms.techs[10].level * this.getMSEProduction(avgPlanet, "Zesde Zintuig", avgPlanet.lifeforms.techs[10].level);    
        }

        const newExpoSlotProduction = this.calcExpoProfit() * this.json.player.exporounds / 24;

        const astro = this.getLevel(this.json.player.astro);

        totalMSECostsAstroNewPlanet += this.getMSECosts(undefined, "astro", parseInt(astro));
        if(astro % 2 == 1){
            totalMSECostsAstroNewPlanet += this.getMSECosts(undefined, "astro", parseInt(astro) + 1);
        } 

        let newPlanetMSECost = 0;

        console.log(this.getBigNumber(newPlanetMSECost));
        for (let l = 0; l < avgPlanet.metal; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "metal", l);
        console.log(this.getBigNumber(newPlanetMSECost));
        for (let l = 0; l < avgPlanet.crystal; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "crystal", l);
        console.log(this.getBigNumber(newPlanetMSECost));
        for (let l = 0; l < avgPlanet.deut; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "deut", l);
        console.log(this.getBigNumber(newPlanetMSECost));
        for (let l = 0; l < avgPlanet.solar; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "solar", l);
        console.log(this.getBigNumber(newPlanetMSECost));
        for (let l = 0; l < avgPlanet.roboticsFactory; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "roboticsFactory", l);
        console.log(this.getBigNumber(newPlanetMSECost));
        for (let l = 0; l < avgPlanet.shipyard; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "shipyard", l);
        console.log(this.getBigNumber(newPlanetMSECost));
        for (let l = 0; l < avgPlanet.researchlab; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "researchlab", l);
        console.log(this.getBigNumber(newPlanetMSECost));
        for (let l = 0; l < avgPlanet.missileSilo; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "missileSilo", l);
        console.log(this.getBigNumber(newPlanetMSECost));
        for (let l = 0; l < avgPlanet.nanite; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "nanite", l);
        console.log(this.getBigNumber(newPlanetMSECost));
        
        if(this.json.settings.lifeforms){
            console.log(avgPlanet.lifeforms.lifeformClass);
            avgPlanet.lifeforms.techs.forEach(t => {
                for (let l = 0; l < t.level; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, t.name, l);
                console.log(this.getBigNumber(newPlanetMSECost));
            });

            switch(avgPlanet.lifeforms.lifeformClass){
                case LIFEFORM_CLASS_ROCKTAL:
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.meditationEnclave; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "meditationEnclave", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.crystalFarm; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "crystalFarm", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.runeTechnologium; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "runeTechnologium", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.runeForge; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "runeForge", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.oriktorium; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "oriktorium", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.magmaForge; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "magmaForge", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.disruptionChamber; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "disruptionChamber", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.megalith; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "megalith", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.crystalRefinery; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "crystalRefinery", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.deuteriumSynthesizer; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "deuteriumSynthesizer", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.mineralResearchCentre; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "mineralResearchCentre", l);
                    console.log(this.getBigNumber(newPlanetMSECost));
                    for (let l = 0; l < avgPlanet.lifeforms.buildings.advancedRecyclingPlant; l++) newPlanetMSECost += this.getMSECosts(avgPlanet, "advancedRecyclingPlant", l);              
                    console.log(this.getBigNumber(newPlanetMSECost));
                    break;
            }                
        }

        totalMSECostsAstroNewPlanet += newPlanetMSECost;
        console.log(this.getBigNumber(totalMSECostsAstroNewPlanet));
        totalMSEProdAstroNewPlanet += newPlanetProduction + newPlanetExpoBoostProduction;
        console.log(this.getBigNumber(newPlanetProduction));
        console.log(this.getBigNumber(newPlanetExpoBoostProduction));
        console.log(this.getBigNumber(totalMSEProdAstroNewPlanet));
        
        let astroLevelStringNewPlanet = (parseInt(astro) + 1)
        
        if(astro % 2 == 1){
            astroLevelStringNewPlanet += " & " + (parseInt(astro) + 2);
        }

        //next astro level for expo
        let l = Math.floor(Math.sqrt(parseInt(astro))) + 1;

        let nextAstro = l*l;
        let newPlanets = 0;
        
        for(let a = parseInt(astro) + 1; a <= nextAstro; a++){
            if(a % 2 == 1){
                newPlanets++;
            }
            totalMSECostsAstroNewExpo += this.getMSECosts(undefined, "astro", a);
        }

        totalMSECostsAstroNewExpo += newPlanets * newPlanetMSECost;
        totalMSEProdAstroNewExpo += newPlanets * newPlanetProduction;
        totalMSEProdAstroNewExpo += newExpoSlotProduction;

        let astroLevelStringNewExpo = (parseInt(astro) + 1);
        if(parseInt(astro) + 1 < nextAstro){
            astroLevelStringNewExpo += " - " + nextAstro;
        }

        let amorColor = this.getAmortizationColor("account", "research", blocked);
        if(totalMSECostsAstroNewExpo / totalMSEProdAstroNewExpo < totalMSECostsAstroNewPlanet / totalMSEProdAstroNewPlanet){
            return {
                coords: "account",
                name: "account",
                technology: "astrophysics",
                level: astroLevelStringNewExpo,
                amortization: totalMSECostsAstroNewExpo / totalMSEProdAstroNewExpo / 24,
                msecost: totalMSECostsAstroNewExpo,
                type: "astro",
                color: amorColor,
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
                color: amorColor,
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

    getTechsForSlot(slot){
        switch(slot){
            case 0:
                return ["Catalyser Technology"];
            case 1:
                return ["Acoustic Scanning", "Sulphide Process"];
            case 2:
                return ["High Energy Pump Systems"];
            case 3:
                return ["Telekinetic Tractor Beam"];
            case 4:
                return ["Enhanced Sensor Technology", "Magma-Powered Production"];
            case 5: 
                return ["Automated Transport Lines"];
            case 6:
                return ["Depth Sounding"];
            case 7:
                return ["Enhanced Production Technologies"];
            case 8: 
                return ["Improved Stellarator"];
            case 9:
                return ["Hardened Diamond Drill Heads"];
            case 10:
                return ["Sixth Sense", "Seismic Mining Technology"];
            case 11:
                return ["Magma-Powered Pump Systems", "Psychoharmoniser"];
            case 12:
                return ["Artificial Swarm Intelligence", "Ion Crystal Modules"];
            case 17: 
                return ["Kaelesh Discoverer Enhancement", "Rock’tal Collector Enhancement"];
            default:
                return [];
    }
    }

    getUnlockPrerequisitesForTechSlot(slot, planet){
        let popNeeded = 0;
        slot = parseInt(slot);
        switch(slot){
            case 0:
                popNeeded = 200000;
            case 1:
                popNeeded = 300000;
            case 2:
                popNeeded = 400000;
            case 3:
                popNeeded = 500000;
            case 4:
                popNeeded = 750000;
            case 5: 
                popNeeded = 1000000;
            case 6:
                popNeeded = 1200000;
            case 7:
                popNeeded = 3000000;
            case 8: 
                popNeeded = 5000000;
            case 9:
                popNeeded = 7000000;
            case 10:
                popNeeded = 9000000;
            case 11:
                popNeeded = 11000000;
            case 12:
                popNeeded = 13000000;
            case 13: 
                popNeeded = 26000000;
            case 14: 
                popNeeded = 56000000;
            case 15: 
                popNeeded = 112000000;
            case 16: 
                popNeeded = 224000000;
            case 17: 
                popNeeded = 448000000;
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


        switch(planet.lifeforms.lifeformClass){
            case LIFEFORM_CLASS_MENSEN:
                console.warn("Lifeform '" + lifeform + "' not configured.");
                return 0;
            case LIFEFORM_CLASS_MECHA:
                console.warn("Lifeform '" + lifeform + "' not configured.");
                return 0;
            case LIFEFORM_CLASS_KAELESH:
                console.warn("Lifeform '" + lifeform + "' not configured.");
                return 0;
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
                console.warn("Lifeform '" + lifeform + "' not found.");
                return 0;
        }

        let traderFactor = this.json.player.allyClass == ALLY_CLASS_TRADER ? 1.1 : 1;
        let quartersLevelNeeded = 0;
        let foodLevelNeeded = 0;
        let t2popBuildingLevelNeeded = 0;
        let t3popBuildingLevelNeeded = 0;

        if(slot < 6){
            let quartersLevelNeeded = quartersLevel;
            let foodLevelNeeded = foodLevel;
            let t1cap = popCapacityBase * Math.pow(popCapacityFactor, quartersLevel) * (quartersLevel + 1)  * traderFactor;
            while(t1cap < popNeeded){
                quartersLevelNeeded++;
                t1cap = popCapacityBase * Math.pow(popCapacityFactor, quartersLevelNeeded) * (quartersLevelNeeded + 1)  * traderFactor;
            }

            let foodCons = foodConsBase * Math.pow(foodConsFactor, quartersLevelNeeded) * (quartersLevelNeeded + 1);
            let foodProd = foodProdBase * Math.pow(foodProdFactor, foodLevel) * (foodLevel + 1);

            while(t1cap / foodCons * foodProd < popNeeded){
                foodLevelNeeded++;
                foodProd = foodProdBase * Math.pow(foodProdFactor, foodLevelNeeded) * (foodLevelNeeded + 1);
            }
        } else if (slot < 18) {
            switch(slot){
                case 6:
                    quartersLevelNeeded = 43;
                    foodLevelNeeded = 43;
                    t2popBuildingLevelNeeded = 5;
                    break;
                case 7:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 46;
                        foodLevelNeeded = 46;
                        t2popBuildingLevelNeeded = 6;
                    } else {
                        quartersLevelNeeded = 46;
                        foodLevelNeeded = 47;
                        t2popBuildingLevelNeeded = 6;
                    }
                    break;
                case 8:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 47;
                        foodLevelNeeded = 48;
                        t2popBuildingLevelNeeded = 7;
                    } else {
                        quartersLevelNeeded = 47;
                        foodLevelNeeded = 48;
                        t2popBuildingLevelNeeded = 8;
                    }
                    break;
                case 9:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 48;
                        foodLevelNeeded = 49;
                        t2popBuildingLevelNeeded = 8;
                    } else {
                        quartersLevelNeeded = 48;
                        foodLevelNeeded = 50;
                        t2popBuildingLevelNeeded = 8;
                    }
                    break;
                case 10:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 49;
                        foodLevelNeeded = 51;
                        t2popBuildingLevelNeeded = 8;
                    } else {
                        quartersLevelNeeded = 50;
                        foodLevelNeeded = 51;
                        t2popBuildingLevelNeeded = 8;
                    }
                    break;
                case 11:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 50;
                        foodLevelNeeded = 52;
                        t2popBuildingLevelNeeded = 8;
                    } else {
                        quartersLevelNeeded = 51;
                        foodLevelNeeded = 52;
                        t2popBuildingLevelNeeded = 8;
                    }
                    break;
                case 12:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 61;
                        foodLevelNeeded = 64;
                        t2popBuildingLevelNeeded = 12;
                        t3popBuildingLevelNeeded = 7;
                    } else {
                        quartersLevelNeeded = 62;
                        foodLevelNeeded = 64;
                        t2popBuildingLevelNeeded = 12;
                        t3popBuildingLevelNeeded = 7;
                    }
                    break;
                case 13:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 64;
                        foodLevelNeeded = 67;
                        t2popBuildingLevelNeeded = 12;
                        t3popBuildingLevelNeeded = 8;
                    } else {
                        quartersLevelNeeded = 65;
                        foodLevelNeeded = 67;
                        t2popBuildingLevelNeeded = 12;
                        t3popBuildingLevelNeeded = 8;
                    }
                    break;
                case 14:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 67;
                        foodLevelNeeded = 69;
                        t2popBuildingLevelNeeded = 13;
                        t3popBuildingLevelNeeded = 9;
                    } else {
                        quartersLevelNeeded = 67;
                        foodLevelNeeded = 69;
                        t2popBuildingLevelNeeded = 14;
                        t3popBuildingLevelNeeded = 9;
                    }
                    break;
                case 15:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 69;
                        foodLevelNeeded = 72;
                        t2popBuildingLevelNeeded = 14;
                        t3popBuildingLevelNeeded = 10;
                    } else {
                        quartersLevelNeeded = 70;
                        foodLevelNeeded = 72;
                        t2popBuildingLevelNeeded = 14;
                        t3popBuildingLevelNeeded = 10;
                    }
                    break;
                case 16:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 72;
                        foodLevelNeeded = 75;
                        t2popBuildingLevelNeeded = 15;
                        t3popBuildingLevelNeeded = 10;
                    } else {
                        quartersLevelNeeded = 72;
                        foodLevelNeeded = 75;
                        t2popBuildingLevelNeeded = 15;
                        t3popBuildingLevelNeeded = 11;
                    }
                    break;
                case 17:
                    if(this.json.player.allyClass == ALLY_CLASS_TRADER){
                        quartersLevelNeeded = 75;
                        foodLevelNeeded = 78;
                        t2popBuildingLevelNeeded = 15;
                        t3popBuildingLevelNeeded = 11;
                    } else {
                        quartersLevelNeeded = 75;
                        foodLevelNeeded = 78;
                        t2popBuildingLevelNeeded = 16;
                        t3popBuildingLevelNeeded = 11;
                    }
                    break;
            }
        } else {
            console.error("slot higher than 18");
            return 0;    
        }

        return{
            'quarters': {
                'name': quartersName,
                'level': quartersLevel,
                'levelNeeded': quartersLevelNeeded,
            },
            'food': {
                'name': foodName,
                'level': foodLevel,
                'levelNeeded': foodLevelNeeded,
            },
            't2popBuilding': {
                'name': t2popBuildingName,
                'level': t2popBuildingLevel,
                'levelNeeded': t2popBuildingLevelNeeded,
            },
            't3popBuilding': {
                'name': t3popBuildingName,
                'level': t3popBuildingLevel,
                'levelNeeded': t3popBuildingLevelNeeded,
            },
        };
    }

    getUnlockCostsForPrerequisites(planet, prerequisites){
        let mseCosts = 0;
        for(let i = prerequisites.quarters.level; i < prerequisites.quarters.levelNeeded; i++){
            mseCosts += this.getMSECosts(planet, prerequisites.quarters.name, i);
        }
        for(let i = prerequisites.foodLevel; i < prerequisites.food.levelNeeded; i++){
            mseCosts += this.getMSECosts(planet, prerequisites.food.name, i);
        }
        for(let i = prerequisites.t2popBuilding.level; i < prerequisites.t2popBuilding.levelNeeded; i++){
            mseCosts += this.getMSECosts(planet, prerequisites.t2popBuilding.name, i);
        }
        for(let i = prerequisites.t3popBuilding.level; i < prerequisites.t3popBuilding.levelNeeded; i++){
            mseCosts += this.getMSECosts(planet, prerequisites.t3popBuilding.name, i);
        }
        return mseCosts
    }

    getPlanetByCoords(coords){
        return this.json.player.planets.find(p => p.coords == coords);
    }

    getIndirectProductionUpgrades(){
        let costLoweringUpgrades = [];

        if(this.json.settings.lifeforms){
            this.json.player.planets.forEach(planet => {
                if(planet.lifeforms.lifeformClass === "rocktal"){
                    costLoweringUpgrades.push({
                        coords: planet.coords,
                        upgrade: "mineralResearchCentre",
                        priority: 1,
                        affected: "productionbuilding",
                    });
                    if(planet.lifeforms.techs?.length > 0){
                        costLoweringUpgrades.push({
                            coords: planet.coords,
                            upgrade: "runeTechnologium",
                            priority: 3,
                            affected: "lifeformtech",
                        });
                    }
                    costLoweringUpgrades.push({
                        coords: planet.coords,
                        upgrade: "megalith",
                        priority: 4,
                        affected: "rocktalbuilding",
                    });
                }
                
                if(planet.lifeforms?.techs?.length > 0){
                    planet.lifeforms.techs.forEach(tech => {
                        if(tech.name === "Verbeterde Stellarator" || tech.name === "Concentratore astrale"){
                            costLoweringUpgrades.push({
                                coords: planet.coords,
                                upgrade: tech.name,
                                priority: 2,
                                affected: "plasma",
                            })
                        }
                    });    
                }
            });
        }

        // this.json.player.planets.forEach(planet => {
        //     costLoweringUpgrades.push({
        //         coords: planet.coords,
        //         upgrade: "nano",
        //         priority: 5,
        //         affected: "productionbuilding",
        //     })
        // });

        costLoweringUpgrades = costLoweringUpgrades.sort((a,b) => a.priority - b.priority);
        return costLoweringUpgrades;
    }

    addIndirectProductionUpgradesToAmortization(amortizationList, costLoweringUpgrades, blocked){
        let totalHourlyMseProd = this.calcTotalMseProduction();
        let maxMseProd = parseFloat(amortizationList[amortizationList.length - 1].amortization) * totalHourlyMseProd * 24;

        if(maxMseProd == Infinity){
            console.log(amortizationList);
            console.log(totalHourlyMseProd);
            console.error("maxMseProd is Infinity");
            maxMseProd = 0;
        }

        costLoweringUpgrades.forEach(upgrade => {
            let testAmortizationList = this.copyArray(amortizationList);
            let planet = this.getPlanetByCoords(upgrade.coords);
            let totalMseCost = 0;

            let curLevel;
            let upgradePercent;
            let amorType;
            let amorColor;

            let buildings = planet.lifeforms.buildings;

            if(upgrade.upgrade == "runeTechnologium"){
                curLevel = this.getLevel(buildings.runeTechnologium);
                upgradePercent = 0.25;
                amorType = "rocktalbuilding";
                amorColor = this.getAmortizationColor(upgrade.coords, "lifeformbuilding", blocked)
            } else if (upgrade.upgrade == "Verbeterde Stellarator" || upgrade.upgrade == "Concentratore astrale"){
                let index = planet.lifeforms.techs.findIndex(t => t.name == "Verbeterde Stellarator" || t.name == "Concentratore astrale");
                curLevel = this.getLevel(planet.lifeforms.techs[index].level);
                upgradePercent = 0.15;
                amorType = "lifeformtech";
                amorColor = this.getAmortizationColor(upgrade.coords, "lifeformtech", blocked)
            } else if (upgrade.upgrade == "mineralResearchCentre"){
                curLevel = this.getLevel(buildings.mineralResearchCentre);
                upgradePercent = 0.5;
                amorType = "rocktalbuilding";
                amorColor = this.getAmortizationColor(upgrade.coords, "lifeformbuilding", blocked)
            } else if (upgrade.upgrade == "megalith"){
                curLevel = this.getLevel(buildings.megalith);
                upgradePercent = 1;
                amorType = "rocktalbuilding";
                amorColor = this.getAmortizationColor(upgrade.coords, "lifeformbuilding", blocked)
            }

            let savePercent = upgradePercent / (100 - upgradePercent * curLevel);
            let mseProd = this.getPrerequisiteMSEProd(planet, upgrade.upgrade, curLevel);
            let mseCost = this.getPrerequisiteMSECosts(planet, upgrade.upgrade, curLevel);
            mseCost += this.getMSECosts(planet, upgrade.upgrade, curLevel);
            let mseToSpend = mseCost / savePercent;

            let maxMseSpend = maxMseProd;
            while(mseToSpend > 0 && maxMseSpend > 0){
                let item = testAmortizationList[0];
//                console.log(item);
                if(item.type == upgrade.affected && (item.coords == "account" || item.coords == upgrade.coords)){
                    mseToSpend -= item.msecost;
                }
                maxMseSpend -= item.msecost;
                totalMseCost += item.msecost;
//                console.log(this.getBigNumber(mseToSpend) + " / " + this.getBigNumber(maxMseSpend) + " / " + this.getBigNumber(totalMseCost));
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
                color: amorColor,
            });
            amortizationList.sort((a,b) => a.amortization - b.amortization);
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

    copyArray(arrayToCopy) {
        return arrayToCopy.map(element => ({ ...element }));
    }

    createAmortization(planet, technology, level, amorType, amorColor){
        level = this.getLevel(level);
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
        level = this.getLevel(level);
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

        const pageContent = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent") || document.querySelector("#lfbuildingscomponent.maincontent") || document.querySelector("#lfresearchcomponent.maincontent"));
        const accountProductionDiv = this.createDOM("div", { class: "accountproduction"});
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
        planets.sort((a,b) => parseInt(a.coords.split(":")[2]) - parseInt(b.coords.split(":")[2]));
        planets.sort((a,b) => parseInt(a.coords.split(":")[1]) - parseInt(b.coords.split(":")[1]));
        planets.sort((a,b) => parseInt(a.coords.split(":")[0]) - parseInt(b.coords.split(":")[0]));
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
            
            const minerProdPerHour = this.calcMinerProdHour();
            
            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Total Production as " + PLAYER_CLASS_COLLECTOR + ":"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Per hour: " + this.getBigNumber(minerProdPerHour[0]) + " metal, " + this.getBigNumber(minerProdPerHour[1]) + " crystal, " + this.getBigNumber(minerProdPerHour[2]) + " deut"));
            tableBody.appendChild(tr);
    
            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Per day: " + this.getBigNumber(minerProdPerHour[0] * 24) + " metal, " + this.getBigNumber(minerProdPerHour[1] * 24) + " crystal, " + this.getBigNumber(minerProdPerHour[2] * 24) + " deut"));
            tableBody.appendChild(tr);
    
            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("Per week: " + this.getBigNumber(minerProdPerHour[0] * 24 * 7) + " metal, " + this.getBigNumber(minerProdPerHour[1] * 24 * 7) + " crystal, " + this.getBigNumber(minerProdPerHour[2] * 24 * 7) + " deut"));
            tableBody.appendChild(tr);

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("------"));
            tableBody.appendChild(tr);

            const expoProfit = this.calcExpoProfit();
            const minerMseBonus = this.calcMinerMseBonusProfitHour()
            console.log("expoprofit: " + this.getBigNumber(expoProfit));
            console.log("miner per hour: " + this.getBigNumber(minerMseBonus));
            console.log("expoprofit per hour: " + this.getBigNumber(expoProfit * this.getAmountOfExpeditionsPerDay() / 24));

            tr = document.createElement('tr');
            tr.appendChild(document.createTextNode("You should switch to " + PLAYER_CLASS_COLLECTOR + " when doing less then " + this.getBigNumber(minerMseBonus * 24 * 7 / expoProfit) + " expeditions per week."));
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

    calcMinerProdHour(){
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

    calcMinerMseBonusProfitHour(){
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
    calcExpoProfit(){
        //TODO: calc blackhole/fuelcost
        let blackHoleMSE, fuelCostMSE;
        blackHoleMSE = 0;
        fuelCostMSE = 0;
        let ship = this.calcExpoShipProd();
        let res = this.calcExpoResProd()
        
        console.log("ship: " + this.getBigNumber(ship));
        console.log("res: " + this.getBigNumber(res));
        return ship + res - blackHoleMSE / 300 - fuelCostMSE; 
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
                if(p.lifeforms?.techs?.length > 0){
                    p.lifeforms?.techs?.forEach(t => {
                        if(t.name == "Verbeterde Sensortechnologie" || t.name == "Zesde Zintuig" 
                        || t.name == "Tecnologia Sensori migliorata" || t.name == "Sesto senso"){
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

    getLifeformLevelBonus(planet){
        let level;
        switch(planet.lifeforms.lifeformClass){
            case LIFEFORM_CLASS_MENSEN:
                level = this.json.player.lifeformLevels?.mensen ?? 0;
                break;
            case LIFEFORM_CLASS_ROCKTAL:
                level = this.json.player.lifeformLevels?.rocktal ?? 0;
                break;
            case LIFEFORM_CLASS_MECHA:
                level = this.json.player.lifeformLevels?.mecha ?? 0;
                break;
            case LIFEFORM_CLASS_KAELESH:
                level = this.json.player.lifeformLevels?.kaelesh ?? 0;
                break;
        }
        return level * 0.001;
    }

    calcBaseExpoShipProd(){
        let ratio = this.json.player.ratio;
        let expofleetValue = 1;
        if(this.json.player.expofleetValue)
        {
            expofleetValue = this.json.player.expofleetValue / 100;
        }

        let shipMSE = this.GetAverageFind() * (0.54 + .46 * ratio[0] / ratio[1] + 0.093 * ratio[0] / ratio[2]);
        return 0.22 * shipMSE * expofleetValue
    }

    calcExpoShipProd(){
        return this.calcBaseExpoShipProd() * (1 + this.calcExpoShipBonus());
    }

    calcExpoShipBonus(){
        if(this.json.settings.lifeforms){
            let bonus = 0;
            this.json.player.planets.forEach(p => {
                const lifeformBonus = this.getLifeformLevelBonus(p);
                if(p.lifeforms?.techs?.length > 0){
                    p.lifeforms.techs.forEach(t => {
                        if(t.name == "Telekinetische Tractorstraal" || t.name == "Raggio di trazione telecinetico"){
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
        return (this.getLevel(planet.metal) + this.getLevel(planet.crystal) + this.getLevel(planet.deut)) * 8 * ((this.json.player.playerClass == PLAYER_CLASS_COLLECTOR && this.json.player.geologist) ? 1.1 : 1);
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
                console.log(textContent);
                console.log(currentCoords);
                let index = this.json.player.planets.findIndex(p => p.coords == currentCoords);
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
                console.log("update mines " + currentCoords);
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
        } else if (page === FACILITIES){
            this.checkPlanets();
            if(!currentIsMoon){
                console.log("update facilities " + currentCoords);
                let index = this.json.player.planets.findIndex(p => p.coords == currentCoords);
                if(this.json.player.planets[index]){
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
        } else if (page === LIFEFORM){
            let planetIndex = this.json.player.planets.findIndex(p => p.coords == currentCoords);
            let planet = this.checkCurrentLifeform(this.json.player.planets[planetIndex]);
            console.log("lifeform buildings");
            console.log(document.querySelectorAll(".technology"));
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
            this.createButtons(currentCoords);
        } else if (page === LIFEFORM_RESEARCH){
            let planetIndex = this.json.player.planets.findIndex(p => p.coords == currentCoords);
            let planet = this.checkCurrentLifeform(this.json.player.planets[planetIndex]);
            console.log("lifeform techs");
            console.log(document.querySelectorAll(".technology"));
            let techs = [];
            for(let s = 1; s <= 18; s++){
                let tech = this.getTechnologyFromSlot(s);
                if(tech) techs.push(tech);
            }
            console.log(techs);
            planet.lifeforms.techs = techs;
            this.createButtons(currentCoords);
        } else if (page === LIFEFORM_SETTINGS){
            let planet = this.json.player.planets.find(p => p.coords == currentCoords);
            let lf = document.querySelector(".lifeform-item-wrapper");
            let level = parseInt(lf.childNodes[9].innerHTML.split(' ')[1].split(':')[0]);
            console.log(planet.lifeforms.lifeformClass + " level " + level);
            if (!this.json.player.lifeformLevels)
                this.json.player.lifeformLevels = {};
            switch(planet.lifeforms.lifeformClass){
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
            setTimeout(() => {
                let savedInactives = this.getInactiveData();
                console.log(savedInactives);

                let messageElements = document.querySelectorAll('.msg');
                if(messageElements){
                    console.log(messageElements);
                    messageElements.forEach(message => {
                        let isInactive = message.querySelector('.status_abbr_inactive') || message.querySelector('.status_abbr_longinactive');
                        if(!isInactive) return;

                        let title = message.querySelector('.msg_title.blue_txt a')
                        let href = title.getAttribute('href');
                        let coordinates = href.match(/galaxy=(\d+)&system=(\d+)&position=(\d+)/);
                        let x = coordinates[1];
                        let y = coordinates[2];
                        let z = coordinates[3];
                        let coords = x + ':' + y + ':' + z;

                        let timestamp = message.querySelector('.msg_date').textContent;
                        let [day, month, year, hours, minutes, seconds] = timestamp.split(/\.|:|\s/);
                        // Month value in JavaScript's Date object is zero-based, so subtract 1 from the month
                        let dateObject = new Date(year, month - 1, day, hours, minutes, seconds);                        
                        let unixTimestamp = dateObject.getTime() / 1000;


                        if(savedInactives == null) savedInactives = [];
                        let savedSpyIndex = savedInactives?.findIndex(s => s.coords === coords);
                        let savedSpyReport = savedInactives[savedSpyIndex];

                        if (savedSpyIndex != -1 && unixTimestamp <= savedSpyReport.timestamp) {
                            console.log(savedSpyReport.Plasmatechniek == undefined);
                            console.log(savedSpyReport.Plasmatechniek == "-1");
                            if(savedSpyReport.Plasmatechniek == undefined || savedSpyReport.Plasmatechniek == "-1"){
                                let button = message.querySelector('.fright.txt_link.msg_action_link.overlay');
                                console.log(button);
                                button.addEventListener('click', () => { this.readSpyReportContent(savedSpyReport) });    
                            }    
                            return;
                        };

                        let res = message.innerText.split('\n')[13].split(': ');
                        let metal = res[1].replace('Kristal', '');
                        let crystal = res[2].replace('Deuterium', '');
                        let deut = res[3];

                        if(metal.includes('M')) metal = parseFloat(metal.replace('M', '').replace(',', '.')) * 1000000; else metal = parseFloat(metal.replace('.', ''));
                        if(crystal.includes('M')) crystal = parseFloat(crystal.replace('M', '').replace(',', '.')) * 1000000; else crystal = parseFloat(crystal.replace('.', ''));
                        if(deut.includes('M')) deut = parseFloat(deut.replace('M', '').replace(',', '.')) * 1000000; else deut = parseFloat(deut.replace('.', ''));                        
                        
                        let spyReport = {
                            msgId: message.dataset.msgId,
                            timestamp: unixTimestamp,
                            coords: coords,
                            metal: metal,
                            crystal: crystal,
                            deut: deut,
                        }

                        if(savedSpyIndex == -1){
                            savedInactives.push(spyReport);
                            savedSpyIndex = savedInactives.length - 1;
                        } else {
                            savedInactives[savedSpyIndex].msgId = spyReport.msgId;
                            savedInactives[savedSpyIndex].timestamp = spyReport.timestamp;
                            savedInactives[savedSpyIndex].metal = spyReport.metal;
                            savedInactives[savedSpyIndex].crystal = spyReport.crystal;
                            savedInactives[savedSpyIndex].deut = spyReport.deut;          
                        }

                        let button = message.querySelector('.fright.txt_link.msg_action_link.overlay');
                        console.log(button);
                        button.addEventListener('click', () => { this.readSpyReportContent(savedInactives[savedSpyIndex]) });
                    });
                    console.log(savedInactives);    
                }

                this.getInactivePlanets().then(planets => {
                    console.log(planets);
                    if(savedInactives?.length > 0){
                        savedInactives = savedInactives.filter(i => planets.some(p => p.coords === i.coords));
                        this.saveInactiveData(savedInactives);
                        const unixNow = Math.floor(Date.now() / 1000);
                        let SpyTableObjects = [];
                        savedInactives.forEach(inactive => {
                            let hoursPast = unixNow - inactive.timestamp;
                            let spyTableObject = {};
                            spyTableObject.coords = inactive.coords;
                            let metal = parseInt(inactive.Metaalmijn ?? 0);
                            let crystal = parseInt(inactive.Kristalmijn ?? 0);
                            let deut = parseInt(inactive.Deuteriumfabriek ?? 0);
                            let plasma = parseInt(inactive.Plasmatechniek ?? 0);
                            spyTableObject.data = inactive.Plasmatechniek ? "complete" : "incomplete";
                            let metalHourlyProd = this.getProductionForInactive(inactive.coords, "metal", metal >= 0 ? metal : 0, plasma >= 0 ? plasma : 0, 0);
                            spyTableObject.metal = inactive.metal + metalHourlyProd / 3600 * hoursPast;
                            let crystalHourlyProd = this.getProductionForInactive(inactive.coords, "crystal", crystal >= 0 ? crystal : 0, plasma >= 0 ? plasma : 0, 0);
                            spyTableObject.crystal = inactive.crystal + crystalHourlyProd / 3600 * hoursPast;
                            let deutHourlyProd = this.getProductionForInactive(inactive.coords, "deut", deut >= 0 ? deut : 0, plasma >= 0 ? plasma : 0, 0);
                            spyTableObject.deut = inactive.deut + deutHourlyProd / 3600 * hoursPast;
                            SpyTableObjects.push(spyTableObject);
                        });
                        SpyTableObjects.sort((a,b) => this.getMseValue(this.json.player.ratio, b.metal, b.crystal, b.deut) - this.getMseValue(this.json.player.ratio, a.metal, a.crystal, a.deut));
                        console.log(SpyTableObjects);
                    }
                });
            }, 1500);
        }
    }

    getMseValue(ratio, metal, crystal, deut){
        return parseFloat(metal) + ratio[0] / ratio[1] * parseFloat(crystal) + ratio[0] / ratio[2] * parseFloat(deut);
    }

    readSpyReportContent(spyReport){
        setTimeout(() => {
            console.log("try reading spy report");

            let detailMsg = document.querySelector('.detail_msg');
            if(!detailMsg) return;

            let details = document.querySelectorAll('.detail_txt');
            details.forEach(detail => {
                if(detail.innerText.slice(0, 6) === "Klasse") spyReport.Klasse = detail.innerText.split(':')[1];
                if(detail.innerText.slice(0, 16) === "Alliantie Klasse") spyReport.AlliantieKlasse = detail.innerText.split(':')[1];
            });

            let detailLists = document.querySelectorAll('.detail_list');
            
            let information = [];
            detailLists.forEach(detail => {
                let elements = detail.innerText.split("\n");

                for (var i = 0; i < elements.length; i += 2) {
                  var name = elements[i];
                  var level = elements[i + 1];
                  information.push({ name: name, level: level });
                }
            });

            console.log(information);
            if(information[3] == '' && information[4] == '' && information[5] == '') return;
            spyReport.Metaalmijn = information.find(x => x.name == "Metaalmijn")?.level ?? "0";
            spyReport.Kristalmijn = information.find(x => x.name == "Kristalmijn")?.level ?? "0";
            spyReport.Deuteriumfabriek = information.find(x => x.name == "Deuteriumfabriek")?.level ?? "0";
            spyReport.Metaalopslag = information.find(x => x.name == "Metaalopslag")?.level ?? "0";
            spyReport.Kristalopslag = information.find(x => x.name == "Kristalopslag")?.level ?? "0";
            spyReport.Deuteriumtank = information.find(x => x.name == "Deuteriumtank")?.level ?? "0";
            spyReport.Plasmatechniek = information.find(x => x.name == "Plasmatechniek")?.level ?? "0";

            console.log(spyReport);

            let savedInactives = this.getInactiveData();
            let savedSpyIndex = savedInactives?.findIndex(s => s.coords === spyReport.coords);
            if (savedSpyIndex == -1) return;

            savedInactives[savedSpyIndex].Metaalmijn = spyReport.Metaalmijn;
            savedInactives[savedSpyIndex].Kristalmijn = spyReport.Kristalmijn;
            savedInactives[savedSpyIndex].Deuteriumfabriek = spyReport.Deuteriumfabriek;
            savedInactives[savedSpyIndex].Metaalopslag = spyReport.Metaalopslag;
            savedInactives[savedSpyIndex].Kristalopslag = spyReport.Kristalopslag;
            savedInactives[savedSpyIndex].Deuteriumtank = spyReport.Deuteriumtank;
            savedInactives[savedSpyIndex].Plasmatechniek = spyReport.Plasmatechniek;

            console.log(savedInactives);
            this.saveInactiveData(savedInactives);
        }, 1000);
    }

    async getInactivePlanets(){
        let players = await getPlayers(UNIVERSE);
        let highscore = await getHighscore(UNIVERSE, 1, 0);
        console.log(highscore);
        let inactives = players.filter(p => p.status?.toLowerCase() == 'i');
        inactives.forEach(player => {
            console.log(player);
            player.points = parseInt(highscore.find(p => p.id == player.id)?.score ?? -1);
        });
        inactives = inactives.filter(p => p.points > 100);
        console.log(inactives.sort((a,b) => b.points - a.points));
        let inactivePlanets = await this.getPlanetsByFilter(inactives);
        return inactivePlanets;
    }

    async getPlanetsByFilter(playerFilter){
        let planets = await getUniverse(UNIVERSE);
        return planets.filter(planet => playerFilter.map(player => player.id).includes(planet.player));
    }

    getProductionForInactive(coords, type, level, plasma, bonus){
        let pos = coords.split(':')[2];
        let prod;
        let factor = this.getFactorForPos(pos, type);

        switch(type){
            case "metal":
                prod = 30 * level * Math.pow(1.1, level);
                bonus += plasma * 0.01;
                break;
            case "crystal":
                prod = 20 * level * Math.pow(1.1, level);
                bonus += plasma * 0.066;
                break;
            case "deut":
                prod = 30 * level * Math.pow(1.1, level) * (1.36 - 0.004 * (this.getAverageTemp(coords) - 20));
                bonus += plasma * 0.033;
                break;
        }

        prod *= factor * (1 + bonus);
        return prod;
    }

    createSpyTable(){

    }

    createButtons(coords = undefined){
        let div = document.querySelector('.amortizationtableAbsolute');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent") || document.querySelector("#facilitiescomponent.maincontent") || document.querySelector("#lfbuildingscomponent.maincontent") || document.querySelector("#lfresearchcomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtable"}));
        div.addEventListener("click", () => this.createAmortizationTable(coords, "absolute"));
        div.appendChild(document.createTextNode("Absolute Amortization Table"));

        div = document.querySelector('.amortizationtableRecursive');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent") || document.querySelector("#facilitiescomponent.maincontent") || document.querySelector("#lfbuildingscomponent.maincontent") || document.querySelector("#lfresearchcomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtable"}));
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

        if(this.json.player.expofleetValue?.metalCrystal)
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
                        <td><label for="Exporounds">Expo rounds per day:</label></td>
                        <td><input type="text" id="Exporounds" Exporounds="Exporounds" style="width:100%" value="${this.json.player.exporounds ?? 0}"></td>
                    </tr>
                    <tr>    
                        <td><label for="Exposlots">Bonus Expo slots:</label></td>
                        <td><input type="text" id="Exposlots" Exposlots="Exposlots" style="width:100%" value="${this.json.player.exposlots ?? 0}"></td>
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

    saveSettings(){
        let newRatio = document.querySelector("#Ratio").value.replaceAll(",", ".");
        newRatio = newRatio.split("/");
        this.json.player.ratio = [parseFloat(newRatio[0]), parseFloat(newRatio[1]), parseFloat(newRatio[2])];
        this.json.player.exporounds = parseFloat(document.querySelector("#Exporounds").value.replaceAll(",", "."));
        this.json.player.exposlots = parseInt(document.querySelector("#Exposlots").value);
        if(!this.json.player.expofleetValue){
            this.json.player.expofleetValue = {};
        }
        this.json.player.expofleetValue = parseInt(document.querySelector("#ExpoFleetValue").value);
        this.json.player.recursiveListAmount = parseInt(document.querySelector("#RecursiveListAmount").value);
        this.json.player.includeIndirectProductionBuildings = document.querySelector("#IncludeIndirectProductionBuildings").value;

        this.saveData();
    }
    
    openPopup(popup){
        if (!popup) return;
        
        let button = document.querySelector(".close-button");
        button.addEventListener("click", () => this.closePopup(popup));

        button = document.querySelector(".save-button");
        button.addEventListener("click", () => {this.saveSettings(); this.closePopup(popup);});

        popup.classList.add("active");
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
                    name: document.querySelector(".technology.lifeformTech1" + i + "2" + slot).getAttribute("title").split("<br/>")[0].replace("\n", ""),
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
            console.warn("Unknown lifeform: " + document.querySelector("#lifeform"));
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