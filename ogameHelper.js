let PLAYER_CLASS_EXPLORER = "ontdekker";
let PLAYER_CLASS_WARRIOR = "generaal";
let PLAYER_CLASS_MINER = "verzamelaar";
let PLAYER_CLASS_NONE = "-";

let ALLY_CLASS_EXPLORER = "onderzoeker";
let ALLY_CLASS_WARRIOR = "krijger";
let ALLY_CLASS_MINER = "handelaar";
let ALLY_CLASS_NONE = "-";

let LIFEFORM_CLASS_MENSEN = "mensen";
let LIFEFORM_CLASS_ROCKTAL = "rocktal";
let LIFEFORM_CLASS_MECHA = "mechas";
let LIFEFORM_CLASS_KAELESH = "kaelesh";

let OVERVIEW = "overview";
let RESOURCES = "supplies";
let LIFEFORM = "lfbuildings";
let LIFEFORM_RESEARCH = "lfresearch";
let FACILITIES = "facilities";
let RESEARCH = "research";
let ALLIANCE = "alliance";

let METAALMIJN;
let KRISTALMIJN;
let DEUTFABRIEK;
let PLASMATECHNIEK;
let ASTROFYSICA;


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
            //this.json.player = undefined;
            if(!this.json.player){
                this.getPlayerInfo();
                this.saveData();
            }
            this.getServerSettings(UNIVERSE);
        } else {
            console.log("new")
            this.json = {};
            this.getPlayerInfo();
            this.getServerSettings(UNIVERSE);
            console.log(this.json);
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
                this.json.player.planets[index] = this.newPlanet(this.trimCoords(coords));
            }
        });

        console.log(this);
    }

    trimCoords(coords){
        if(coords.textContent.startsWith("[")){
            return coords.textContent.substring(1, coords.textContent.length - 1);
        } else {
            return coords.textContent;
        }
        
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

    getBonus(planet, resource){
        let verzamelaarBonus = this.json.player.playerClass === PLAYER_CLASS_MINER ? 0.25 : 0;
        let handelaarBonus = this.json.player.allianceClass === ALLY_CLASS_MINER ? 0.05 : 0;
        let plasmaFactor = resource === "metal" ? 0.01 : (resource === "crystal" ? 0.0066 : 0.0033);
        let plasmaBonus = this.json.player.plasma ? this.json.player.plasma * plasmaFactor : 0;
        let officerBonus = this.json.player.geologist ? (this.json.player.legerleiding ? 0.12 : 0.1) : 0;
        let processorBonus = planet.crawlers ? planet.crawlers * (this.json.player.playerClass === PLAYER_CLASS_MINER ? 0.00045 : 0.0002) : 0;
        let lifeformBonus = 0;
        if(planet.lifeforms && planet.lifeforms.lifeformClass){
            let lifeformBuilingBonus = 0;
            let lifeformTechBonus = 0;
            if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN){
                if(resource == "metal") lifeformBuilingBonus = 0.015 * planet.lifeforms.buildings.magmaForge;
                else if(resource == "crystal") lifeformBuilingBonus = 0.015 * planet.lifeforms.buildings.fusionPoweredProduction;
                else if(resource == "deut") lifeformBuilingBonus = 0.01 * planet.lifeforms.buildings.fusionPoweredProduction;
            } else if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                if(resource == "metal") lifeformBuilingBonus = 0.02 * planet.lifeforms.buildings.magmaForge;
                else if(resource == "crystal") lifeformBuilingBonus = 0.02 * planet.lifeforms.buildings.crystalRefinery;
                else if(resource == "deut") lifeformBuilingBonus = 0.02 * planet.lifeforms.buildings.deuteriumSynthesizer;
            } else if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                if(resource == "deut") lifeformBuilingBonus = 0.02 * planet.lifeforms.buildings.deuteriumSynthesizer;
            }
            lifeformBonus = lifeformBuilingBonus + lifeformTechBonus;
        }

        return verzamelaarBonus + handelaarBonus + plasmaBonus + officerBonus + processorBonus + lifeformBonus;
    }

    getPrerequisiteMSECosts(planet, upgradeType){
        let metalCost = 0;
        if (upgradeType === "plasma"){
            if(this.json.player.ion < 5){
                for(let l = this.json.player.ion; l < 5; l++){
                    metalCost += this.getMSECosts(planet, "ion", l);
                }
            }
            if(this.json.player.laser < 10){
                for(let l = this.json.player.laser; l < 10; l++){
                    metalCost += this.getMSECosts(planet, "laser", l);
                }
            }
            if(this.json.player.energy < 8){
                for(let l = this.json.player.energy; l < 8; l++){
                    metalCost += this.getMSECosts(planet, "energy", l);
                }
            }
        } else if (upgradeType === "astro"){
            if(this.json.player.impuls < 3){
                for(let l = this.json.player.impuls; l < 3; l++){
                    metalCost += this.getMSECosts(planet, "impuls", l);
                }
            }
            if(this.json.player.spy < 4 - this.json.player.technocrat ? 3 : 0){
                for(let l = this.json.player.spy; l < 4 - this.json.player.technocrat ? 3 : 0; l++){
                    metalCost += this.getMSECosts(planet, "spy", l);
                }
            }
            if(this.json.player.energy < 1){
                for(let l = this.json.player.energy; l < 1; l++){
                    metalCost += this.getMSECosts(planet, "energy", l);
                }
            }
        } else if (upgradeType === "high energy smelting"){
            if(parseInt(planet.lifeforms.buildings.researchCentre) < 5){
                for(let l = parseInt(planet.lifeforms.buildings.researchCentre); l < 5; l++){
                    metalCost += this.getMSECosts(planet, "research centre", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.residentialSector) < 12){
                for(let l = parseInt(planet.lifeforms.buildings.residentialSector); l < 12; l++){
                    metalCost += this.getMSECosts(planet, "residential sector", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.biosphereFarm) < 13){
                for(let l = parseInt(planet.lifeforms.buildings.biosphereFarm); l < 13; l++){
                    metalCost += this.getMSECosts(planet, "biosphere farm", l);
                }
            }
        } else if (upgradeType === "fusion powered production"){
            if(parseInt(planet.lifeforms.buildings.academyOfSciences) < 1){
                for(let l = parseInt(planet.lifeforms.buildings.academyOfSciences); l < 1; l++){
                    metalCost += this.getMSECosts(planet, "academy of sciences", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.residentialSector) < 40){
                for(let l = parseInt(planet.lifeforms.buildings.residentialSector); l < 40; l++){
                    metalCost += this.getMSECosts(planet, "residential sector", l);
                }
            }
        } else if (upgradeType === "magma forge") {
            if(parseInt(planet.lifeforms.buildings.runeTechnologium) < 5){
                for(let l = parseInt(planet.lifeforms.buildings.runeTechnologium); l < 5; l++){
                    metalCost += this.getMSECosts(planet, "rune technologium", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.meditationEnclave) < 12){
                for(let l = parseInt(planet.lifeforms.buildings.meditationEnclave); l < 12; l++){
                    metalCost += this.getMSECosts(planet, "meditation enclave", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.crystalFarm) < 13){
                for(let l = parseInt(planet.lifeforms.buildings.crystalFarm); l < 13; l++){
                    metalCost += this.getMSECosts(planet, "crystal farm", l);
                }
            }
        } else if (upgradeType === "crystal refinery") {
            if(parseInt(planet.lifeforms.buildings.megalith) < 1){
                for(let l = parseInt(planet.lifeforms.buildings.megalith); l < 1; l++){
                    metalCost += this.getMSECosts(planet, "megalith", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.runeForge) < 1){
                for(let l = parseInt(planet.lifeforms.buildings.runeForge); l < 1; l++){
                    metalCost += this.getMSECosts(planet, "rune forge", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.meditationEnclave) < 40){
                for(let l = parseInt(planet.lifeforms.buildings.meditationEnclave); l < 40; l++){
                    metalCost += this.getMSECosts(planet, "meditation enclave", l);
                }
            }
        } else if (upgradeType === "deuterium synthesizer") {
            if(parseInt(planet.lifeforms.buildings.megalith) < 2){
                for(let l = parseInt(planet.lifeforms.buildings.megalith); l < 2; l++){
                    metalCost += this.getMSECosts(planet, "megalith", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.runeForge) < 1){
                for(let l = parseInt(planet.lifeforms.buildings.runeForge); l < 1; l++){
                    metalCost += this.getMSECosts(planet, "rune forge", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.meditationEnclave) < 40){
                for(let l = parseInt(planet.lifeforms.buildings.meditationEnclave); l < 40; l++){
                    metalCost += this.getMSECosts(planet, "meditation enclave", l);
                }
            }
        } else if (upgradeType === "mineral research centre") {
            if(parseInt(planet.lifeforms.buildings.oriktorium) < 1){
                for(let l = parseInt(planet.lifeforms.buildings.oriktorium); l < 1; l++){
                    metalCost += this.getMSECosts(planet, "oriktorium", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.crystalRefinery) < 1){
                for(let l = parseInt(planet.lifeforms.buildings.crystalRefinery); l < 1; l++){
                    metalCost += this.getMSECosts(planet, "crystal refinery", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.megalith) < 1){
                for(let l = parseInt(planet.lifeforms.buildings.megalith); l < 1; l++){
                    metalCost += this.getMSECosts(planet, "megalith", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.runeForge) < 1){
                for(let l = parseInt(planet.lifeforms.buildings.runeForge); l < 1; l++){
                    metalCost += this.getMSECosts(planet, "rune forge", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.meditationEnclave) < 40){
                for(let l = parseInt(planet.lifeforms.buildings.meditationEnclave); l < 40; l++){
                    metalCost += this.getMSECosts(planet, "meditation enclave", l);
                }
            }
        } else if (upgradeType === "high performance synthesiser") {
            if(parseInt(planet.lifeforms.buildings.microchipAssemblyLine) < 2){
                for(let l = parseInt(planet.lifeforms.buildings.microchipAssemblyLine); l < 2; l++){
                    metalCost += this.getMSECosts(planet, "microchip assembly line", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.updateNetwork) < 1){
                for(let l = parseInt(planet.lifeforms.buildings.updateNetwork); l < 1; l++){
                    metalCost += this.getMSECosts(planet, "update network", l);
                }
            }
            if(parseInt(planet.lifeforms.buildings.assemblyLine) < 40){
                for(let l = parseInt(planet.lifeforms.buildings.assemblyLine); l < 40; l++){
                    metalCost += this.getMSECosts(planet, "assembly line", l);
                }
            }
        }
        return metalCost;
    }

    getMSECosts(planet, upgradeType, level){
        level = parseInt(level);
        let ratio = this.json.player.ratio ? this.json.player.ratio : [3, 2, 1];
        let metalCost = 0;
        let crystalCost = 0;
        let deutCost = 0;
        let resProdBuild = false;
        let rockTalBuild = false;
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
            resProdBuild = true;
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
            resProdBuild = true;
            rockTalBuild = true;
        } else if (upgradeType === "deuterium synthesizer") {
            metalCost = 120000 * Math.pow(1.4, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.4, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.4, level) * (level + 1);
            resProdBuild = true;
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
        } else if (upgradeType === "high performance synthesiser") {
            metalCost = 100000 * Math.pow(1.2, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.2, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.2, level) * (level + 1);
        } 

        //LIFEFORM TECHS
        else if (upgradeType === "High-Performance Extractors" || upgradeType === "Hoogwaardige Extractoren") {
            metalCost = 7000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "Acoustic Scanning" || upgradeType === "Akoestisch Scannen") {
            metalCost = 7500 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 12500 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "High Energy Pump Systems" || upgradeType === "Hoge Energie Pomp Systemen") {
            metalCost = 15000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "Magma-Powered Production"|| upgradeType == "Magma-Aangedreven Productie") {
            metalCost = 25000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "Catalyser Technology" || upgradeType == "Katalysatortechnologie") {
            metalCost = 10000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 6000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 1000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "Automated Transport Lines" || upgradeType == "Geautomatiseerde Transportlijnen") {
            metalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "Sulphide Process" || upgradeType == "Sulfideproces") {
            metalCost = 7500 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 12500 * Math.pow(1.5, level) * (level + 1);
            deutCost = 5000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "Telekinetic Tractor Beam" || upgradeType == "Telekinetische Tractorstraal") {
            metalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 15000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 7500 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "Enhanced Sensor Technology" || upgradeType == "Verbeterde Sensortechnologie") {
            metalCost = 25000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 20000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 10000 * Math.pow(1.5, level) * (level + 1);
        } 

        //LIFEFORMTECHS T2
        else if (upgradeType === "Depth Souding" || upgradeType == "Dieptepeiling"){
            metalCost = 70000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 40000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
        } else if (upgradeType === "Enhanced Production Technologies" || upgradeType == "Verbeterde Productie Technologiën"){
            metalCost = 80000 * Math.pow(1.5, level) * (level + 1);
            crystalCost = 50000 * Math.pow(1.5, level) * (level + 1);
            deutCost = 20000 * Math.pow(1.5, level) * (level + 1);
        }
        
        if(planet && this.json.settings.lifeforms && planet.lifeforms.lifeformClass === LIFEFORM_CLASS_ROCKTAL){
            let factor = 1;
            if(rockTalBuild) factor -= 0.01 * parseInt(planet.lifeforms.buildings.megalith);
            if(resProdBuild) factor -= 0.005 * parseInt(planet.lifeforms.buildings.mineralResearchCentre);
            metalCost *= factor;
            crystalCost *= factor;
            deutCost *= factor;
        }

        return (metalCost + crystalCost * ratio[0] / ratio[1] + deutCost * ratio[0] / ratio[2]); 
    }

    getMSEProduction(planet, productionType, level){
        level = parseInt(level);
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
                metalProd += this.getRawProduction(p, "metal", p.metal) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += this.getRawProduction(p, "crystal", p.crystal) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += this.getRawProduction(p, "deut", p.deut) * this.json.settings.economySpeed;
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
        } else if (productionType === "high performance synthesiser") {
            deutProd = 0.02 * this.getRawProduction(planet, "deut", planet.deut) * this.json.settings.economySpeed;
        } 
        
        //LIFEFORM TECHS
        else if (productionType == "High-Performance Extractors" || productionType == "Hoogwaardige Extractoren") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
        } else if (productionType == "Acoustic Scanning") {
            this.json.player.planets.forEach(p => {
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            });
        } else if (productionType == "High Energy Pump Systems") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
        } else if (productionType == "Magma-Powered Production" || productionType == "Magma-Aangedreven Productie") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
       } else if (productionType == "Catalyser Technology" || productionType == "Katalysatortechnologie") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
        } else if (productionType == "Automated Transport Lines" || productionType == "Geautomatiseerde Transportlijnen") {
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
        } else if (productionType == "Sulphide Process" || productionType == "Sulfideproces") {
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
        } else if (productionType == "Telekinetic Tractor Beam" || productionType == "Telekinetische Tractorstraal") {
            //TODO: Calc expo bonus
        } else if (productionType == "Enhanced Sensor Technology" || productionType == "Verbeterde Sensortechnologie") {
            //TODO: Calc expo bonus
        } 
        
        //LIFEFORMTECHS T2
        else if (productionType === "Depth Souding" || productionType == "Dieptepeiling"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            });
        } else if (productionType === "Enhanced Production Technologies" || productionType == "Verbeterde Productie Technologiën"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
        } 
        
        
        
        
        
        else {
            return 0;
        }  

        return (metalProd + crystalProd * ratio[0] / ratio[1] + deutProd * ratio[0] / ratio[2]);
    }

    getFactor(planet, productionType){
        let pos = parseInt(planet.coords.split(":")[2]);
        if(productionType === "metal"){
            if(pos === 8){
                return 1.35;
            } else if (pos === 7 || pos === 9){
                return 1.23;
            } else if (pos === 6 || pos === 10){
                return 1.1;
            } else {
                return 1;
            }
        } else if (productionType === "crystal"){
            if(pos === 1){
                return 1.4;
            } else if (pos === 2){
                return 1.3;
            } else if (pos === 3){
                return 1.2;
            } else {
                return 1;
            }
        } else {
            return 1;
        }
    }

    getRawProduction(planet, productionType, level){   
        if(productionType === "metal"){
            return 30 * level * Math.pow(1.1, level);
        } else if (productionType === "crystal"){
            return 20 * level * Math.pow(1.1, level);
        } else if (productionType === "deut"){
            if(planet.maxTemp) return 10 * level * Math.pow(1.1, level) * (1.36 - 0.004 * (planet.maxTemp - 20));
            else return 10 * level * Math.pow(1.1, level) * (1.36 - 0.004 * (50 - 20));
        } else {
            return 0;
        }
    }

    getExtraMSEProduction(planet, productionType, level){
        return this.getMSEProduction(planet, productionType, level + 1) - this.getMSEProduction(planet, productionType, level); 
    }

    run(){
        this.checkPage();
    }

    newPlanet(coords){
        if(this.json.settings.lifeforms){
            return {
                coords: coords,
                metal: 0,
                crystal: 0,
                deut: 0,
                solar: 0,
                fusion:0,
                satellite: 0,
                crawlers: 0,
                maxTemp: this.getAverageTemp(coords),
                lifeforms: {}        
            };
        } else {
            return {
                coords: coords,
                metal: 0,
                crystal: 0,
                deut: 0,
                solar: 0,
                fusion:0,
                satellite: 0,
                crawlers: 0,
                maxTemp: this.getAverageTemp(coords)        
            };
        }
    }

    remakePlanet(planet){
        if(this.json.settings.lifeforms){
            return {
                coords: planet.coords,
                metal: planet.metal ? planet.metal : 0,
                crystal: planet.crystal ? planet.crystal : 0,
                deut: planet.deut ? planet.deut : 0,
                solar: planet.solar ? planet.solar : 0,
                fusion: planet.fusion ? planet.fusion : 0,
                satellite: planet.satellite ? planet.satellite : 0,
                crawlers: planet.crawlers ? planet.crawlers : 0,
                maxTemp: planet.maxTemp ? planet.maxTemp : this.getAverageTemp(planet.coords),
                lifeforms: planet.lifeforms ? planet.lifeforms : {},
            };
        } else {
            console.log(planet);
            return {
                coords: planet.coords,
                metal: planet.metal ? planet.metal : 0,
                crystal: planet.crystal ? planet.crystal : 0,
                deut: planet.deut ? planet.deut : 0,
                solar: planet.solar ? planet.solar : 0,
                fusion: planet.fusion ? planet.fusion : 0,
                satellite: planet.satellite ? planet.satellite : 0,
                crawlers: planet.crawlers ? planet.crawlers : 0,
                maxTemp: planet.maxTemp ? planet.maxTemp : this.getAverageTemp(planet.coords)
            };
        }
    }

    getAverageTemp(coords){
        switch(parseInt(coords.split(":")[2])){
            case 1: return 240;
            case 2: return 190;
            case 3: return 140;
            case 4: return 90;
            case 5: return 80;
            case 6: return 70;
            case 7: return 60;
            case 8: return 50;
            case 9: return 40;
            case 10: return 30;
            case 11: return 20;
            case 12: return 10;
            case 13: return -30;
            case 14: return -70;
            case 15: return -110;
        }
    }

    checkPlanets(){
        console.log("checking planets");
        let changed = false;
        let planetList = document.querySelectorAll(".smallplanet");
        planetList.forEach((planet) => {
            let coords = planet.querySelector(".planet-koords");
            if(coords){
                let trimmedCoords = this.trimCoords(coords);
                if(!this.json.player.planets.find(p => p.coords == trimmedCoords)){
                    changed = true;
                    this.json.player.planets.push(this.newPlanet(trimmedCoords));
                } else {
                    let foundIndex = this.json.player.planets.findIndex(p => p.coords == trimmedCoords);
                    if(Object.keys(this.json.player.planets[foundIndex]).length != Object.keys(this.newPlanet(trimmedCoords)).length) {
                        changed = true;
                        this.json.player.planets[foundIndex] = this.remakePlanet(this.json.player.planets[foundIndex]);                
                    }
                }
            }
        });

        if(planetList.length < this.json.player.planets.length){
            let planetCoords = [];
            planetList.forEach(planet => {
                planetCoords.push(this.trimCoords(planet.querySelector(".planet-koords")))
            });
            let newPlanetList = [];
            this.json.player.planets.forEach((planet) => {
                if(planetCoords.find(p => p.coords == planet.coords)){
                    newPlanetList.push(planet);
                }
            });
            this.json.player.planets = newPlanetList;
            changed = true;
        }

        if(changed){
            console.log("savingdata");
            this.saveData();
        }
    }

    checkStaff(){
        this.json.player.geologist = document.querySelector(".geologist.on") ? true : false;
        this.json.player.engineer = document.querySelector(".engineer.on") ? true : false;
        this.json.player.technocrat = document.querySelector(".technocrat.on") ? true : false;
        this.json.player.admiral = document.querySelector(".admiral.on") ? true : false;
        this.json.player.commander = document.querySelector(".commander.on") ? true : false;
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

    createAmortizationWithPrerequisite(planet, upgradeType, level){
        //high energy smelting
        let mseProd = this.getMSEProduction(planet, upgradeType, parseInt(level));
        let mseCosts = this.getMSECosts(planet, upgradeType, level);
        let preMseCosts = this.getPrerequisiteMSECosts(planet, upgradeType);
        mseCosts += preMseCosts;
        let amor = mseCosts / mseProd;
        if(preMseCosts > 0) {
            let x = 1;
            while(this.getMSECosts(planet, upgradeType, level + x) / this.getMSEProduction(planet, upgradeType, parseInt(level) + x) < amor){
                mseCosts += this.getMSECosts(planet, upgradeType, level + x);
                mseProd += this.getMSEProduction(planet, upgradeType, parseInt(level) + x);
                amor = mseCosts / mseProd;
                x++;
            }
            console.log(planet.coords + " -- "+ upgradeType +" -- " + (x - 1) + " extra levels");
            if(x > 1) {
                return { coords: planet.coords, technology: upgradeType, level: (parseInt(level) + 1) + "-" + (parseInt(level) + x), amortization: amor / 24 };
            } else {
                return { coords: planet.coords, technology: upgradeType, level: (parseInt(level) + x), amortization: amor / 24 };
            }                    }
        else{
            return { coords: planet.coords, technology: upgradeType, level: (parseInt(level) + 1), amortization: amor / 24 };
        }
    }

    createAmortizationTable(coords = undefined){
        let totalAmortization = [];

        this.json.player.planets.forEach((planet) => {
            if(!coords || planet.coords == coords){
                totalAmortization.push({ coords: planet.coords, technology: "metal", level: (parseInt(planet.metal) + 1), amortization: this.getMSECosts(planet, "metal", planet.metal) / this.getExtraMSEProduction(planet, "metal", parseInt(planet.metal)) / 24 });
                totalAmortization.push({ coords: planet.coords, technology: "crystal", level: (parseInt(planet.crystal) + 1), amortization: this.getMSECosts(planet, "crystal", planet.crystal) / this.getExtraMSEProduction(planet, "crystal", parseInt(planet.crystal)) / 24});
                totalAmortization.push({ coords: planet.coords, technology: "deut", level: (parseInt(planet.deut) + 1), amortization: this.getMSECosts(planet, "deut", planet.deut) / this.getExtraMSEProduction(planet, "deut", parseInt(planet.deut)) / 24});
                
                if(this.json.settings.lifeforms && planet.lifeforms.lifeformClass){
                    if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN){
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "high energy smelting", planet.lifeforms.buildings.highEnergySmelting));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "fusion powered production", planet.lifeforms.buildings.fusionPoweredProduction));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "magma forge", planet.lifeforms.buildings.magmaForge));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "crystal refinery", planet.lifeforms.buildings.crystalRefinery));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "deuterium synthesizer", planet.lifeforms.buildings.deuteriumSynthesizer));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "mineral research centre", planet.lifeforms.buildings.mineralResearchCentre));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "high performance synthesiser", planet.lifeforms.buildings.highPerformanceSynthesizer));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_KAELESH) {
                    } else {
                        console.error("lifeform not found: " + planet.lifeforms.lifeformClass);
                    }
    
                    planet.lifeforms.techs.forEach(tech => {
                        let extraMSE = this.getMSEProduction(planet, tech.name, parseInt(tech.level));
                        if(extraMSE > 0){
                            let mseCost = this.getMSECosts(planet, tech.name, parseInt(tech.level));
                            totalAmortization.push({ coords: planet.coords, technology: tech.name, level: parseInt(tech.level) + 1, amortization: mseCost / extraMSE / 24});
                        }
                    });
                }    
            }
        });

        totalAmortization.push({ coords: "account", technology: "plasma technology", level: (parseInt(this.json.player.plasma) + 1), amortization: this.getMSECosts(undefined, "plasma", parseInt(this.json.player.plasma)) / this.getMSEProduction(undefined, "plasma", parseInt(this.json.player.plasma)) / 24});

        //astro
        let totalMSECostsAstro = 0;

        totalMSECostsAstro += this.getMSECosts(undefined, "astro", parseInt(this.json.player.astro));
        if(this.json.player.astro % 2 == 1){
            totalMSECostsAstro += this.getMSECosts(undefined, "astro", parseInt(this.json.player.astro) + 1);
        } 

        let highestMetal = 0, highestCrystal = 0, highestDeut = 0; 
        this.json.player.planets.forEach(planet => {
            if(planet.metal > highestMetal) highestMetal = planet.metal;
            if(planet.crystal > highestCrystal) highestCrystal = planet.crystal;
            if(planet.deut > highestDeut) highestDeut = planet.deut;
        });

        let p = this.newPlanet("1:1:8");

        for (let l = 0; l < highestMetal; l++){
            totalMSECostsAstro += this.getMSECosts(p, "metal", l);
        }

        for (let l = 0; l < highestCrystal; l++){
            totalMSECostsAstro += this.getMSECosts(p, "crystal", l);
        }

        for (let l = 0; l < highestDeut; l++){
            totalMSECostsAstro += this.getMSECosts(p, "deut", l);
        }


        let astroLevelString = (parseInt(this.json.player.astro) + 1)
        if(this.json.player.astro % 2 == 1){
            astroLevelString += " & " + (parseInt(this.json.player.astro) + 2);
        }

        totalAmortization.push({ coords: "account", technology: "astrophysics", level: astroLevelString, amortization: totalMSECostsAstro / this.getMSEProduction(undefined, "astro", undefined) / 24});
        totalAmortization.sort((a,b) => a.amortization - b.amortization);
        console.log(totalAmortization);
        
        let div = document.querySelector('.amortizationtableV9');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent")).appendChild(this.createDOM("div", { class: "amortizationtableV9"}));

        let table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');
        let tableBody = document.createElement('tbody');

        // document.getElementById('productionboxBottom').clientHeight / 15;
        // for(let i = 0; i < document.getElementById('productionboxBottom').clientHeight / 15; i++){
        //     let tr = document.createElement('tr');
        //     let td = document.createElement('td');
        //     tr.appendChild(td);
        //     tableBody.appendChild(tr);
        // }

        for(let r = 0; r < totalAmortization.length + 1; r++){
            let tr = document.createElement('tr');
            tr.style.marginLeft = 10;
            let coords, technology, level, amortization;

            if(r == 0){
                coords = "Coords";
                technology = "Technology";
                level = "Level";
                amortization = "Return of Investment";
            } else {
                coords = totalAmortization[r - 1].coords;
                technology = totalAmortization[r - 1].technology;
                level = totalAmortization[r - 1].level;
                
                amortization = Math.round(parseFloat(totalAmortization[r - 1].amortization) * 100) / 100 + " days";
            }

            let td1 = document.createElement('td');
            td1.appendChild(document.createTextNode(coords));
            tr.appendChild(td1);

            let td2 = document.createElement('td');
            td2.appendChild(document.createTextNode(technology));
            tr.appendChild(td2);

            let td3 = document.createElement('td');
            td3.appendChild(document.createTextNode(level));
            tr.appendChild(td3);

            let td4 = document.createElement('td');
            td4.appendChild(document.createTextNode(amortization));
            tr.appendChild(td4);

            tableBody.appendChild(tr);
        }
        table.appendChild(tableBody);
        div.appendChild(table);
        
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
                console.log(this.json.player.planets);
                console.log(currentCoords);
                let index = this.json.player.planets.findIndex(p => p.coords == currentCoords);
                console.log(index);
                if(this.json.player.planets[index]){
                    this.json.player.planets[index].maxTemp = parseInt(textContent[3].split("°C")[1].split(" ")[2]);
                } else {
                    this.json.player.planets[index] = {
                        maxTemp: parseInt(textContent[3].split("°C")[1].split(" ")[2])
                    };
                }
                
                console.log("savingdata");
                this.saveData();

                this.checkStaff();
            }
            this.createAmortizationTable();
            //TODO: CREATE AMORTIZATION TABLE
        } else if (page === RESOURCES){
            this.checkPlanets();
            if(!currentIsMoon){
                console.log("update mines");
                console.log("Planetindex: " + this.json.player.planets.findIndex(p => p.coords == currentCoords));
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
            this.createAmortizationTable(currentCoords);
            //TODO: GET FUSION/STORAGES
        } else if (page === LIFEFORM){
            let planetIndex = this.json.player.planets.findIndex(p => p.coords == currentCoords);
            let planet = this.checkCurrentLifeform(this.json.player.planets[planetIndex]);
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
            //TODO: UPDATE LIFEFORM BUILDINGS
        } else if (page === LIFEFORM_RESEARCH){
            let planetIndex = this.json.player.planets.findIndex(p => p.coords == currentCoords);
            let planet = this.checkCurrentLifeform(this.json.player.planets[planetIndex]);
            console.log(document.querySelectorAll(".technology"));
            let techs = [];
            for(let s = 1; s <= 18; s++){
                let tech = this.getTechnologyFromSlot(s);
                if(tech) techs.push(tech);
            }
            console.log(techs);
            planet.lifeforms.techs = techs;
            //TODO: UPDATE LIFEFORM RESEARCH
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
            console.log("ally");
            console.log(document.querySelector(".sprite.allianceclass"));
        }  
    }

    getTechnologyLevel(technologysearch){
        let level = document.querySelector(".technology." + technologysearch + " .level").getAttribute("data-value");
        if(document.querySelector(".technology." + technologysearch).getAttribute("data-status") == "active") level++;
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