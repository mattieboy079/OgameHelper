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
            this.getServerSettings(UNIVERSE);
            if(!this.json.player){
                this.getPlayerInfo();
                this.saveData();
            }
        } else {
            console.log("new")
            this.json = {};
            this.getServerSettings(UNIVERSE);
            this.getPlayerInfo();
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
                let name = planet.querySelector(".planet-name").textContent;
                this.json.player.planets[index] = this.newPlanet(this.trimCoords(coords), name);
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
        let handelaarBonus = this.json.player.allyClass === ALLY_CLASS_MINER ? 0.05 : 0;
        let plasmaFactor = resource === "metal" ? 0.01 : (resource === "crystal" ? 0.0066 : 0.0033);
        let plasmaBonus = this.json.player.plasma ? this.json.player.plasma * plasmaFactor : 0;
        let officerBonus = this.json.player.geologist ? (this.json.player.legerleiding ? 0.12 : 0.1) : 0;
        let processorBonus = planet.crawlers ? (planet.crawlers > this.calcMaxCrawlers(planet) ? this.calcMaxCrawlers(planet) : planet.crawlers) * (this.json.player.playerClass === PLAYER_CLASS_MINER ? 0.00045 : 0.0002) : 0;
        let lifeformBonus = 0;
        if(planet.lifeforms && planet.lifeforms.lifeformClass){
            let lifeformBuilingBonus = 0;
            let lifeformTechBonus = 0;
            if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN){
                if(resource == "metal") lifeformBuilingBonus = 0.015 * planet.lifeforms.buildings.highEnergySmelting;
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
        //console.log(resource + ": " + verzamelaarBonus + " - " +  handelaarBonus + " - " + plasmaBonus + " - " + officerBonus + " - " + processorBonus + " - " + lifeformBonus);
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

    /**
     * Returns x raised to the n-th power.
     *
     * @param {number} planet The corresponding planet.
     * @param {string} upgradeType The building or technology to upgrade.
     * @param {number} level The level the building is before upgrading.
     * @return {number} the cost calculated in MSE.
     */
    getMSECosts(planet, upgradeType, level){
        level = parseInt(level);
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
            if(planet.lifeforms.lifeformClass === LIFEFORM_CLASS_MENSEN){
                if(planet.lifeforms.buildings.researchCentre > 1){
                    factor -= planet.lifeforms.buildings.researchCentre * 0.005;
                }
            } else if(planet.lifeforms.lifeformClass === LIFEFORM_CLASS_ROCKTAL){
                if(planet.lifeforms.buildings.runeTechnologium > 1){
                    factor -= planet.lifeforms.buildings.runeTechnologium * 0.005;
                } 
            } else if(planet.lifeforms.lifeformClass === LIFEFORM_CLASS_MECHA){
                if(planet.lifeforms.buildings.roboticsResearchCentre > 1){
                    factor -= planet.lifeforms.buildings.roboticsResearchCentre * 0.0025;
                } 
            } else if(planet.lifeforms.lifeformClass === LIFEFORM_CLASS_KAELESH){
                if(planet.lifeforms.buildings.vortexChamber > 1){
                    factor -= planet.lifeforms.buildings.vortexChamber * 0.0025;
                } 
            }
            metalCost *= factor;
            crystalCost *= factor;
            deutCost *= factor;
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
        if(productionType != "astro"){
            level = parseInt(level);
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

            if(level.toString().includes("-")){
                let levelString = level.split(" - ");
                level = levelString[0];
                let maxlevel = parseInt(levelString[1]);
                for(let i = parseInt(levelString[0]) + 1; i <= maxlevel; i++){
                    level += " & " + i;
                }
            }

            if(level.toString().includes("&")){
                level = level.split(" & ");
                level.forEach(l => {
                    l = parseInt(l);
                    for(let i = 1; i * i <= l; i++){
                        if(i * i == l){
                            metalProd += this.json.player.exporounds * this.calcExpoProfit() / 24;
                        }
                    }    
                });    
            }
            else{
                for(let i = 1; i * i <= level; i++){
                    if(i * i == level){
                        metalProd += this.json.player.exporounds * this.calcExpoProfit() / 24;
                    }
                }  
            }
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
        } else if (productionType == "Acoustic Scanning" || productionType == "Akoestisch Scannen") {
            this.json.player.planets.forEach(p => {
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            });
        } else if (productionType == "High Energy Pump Systems" || productionType == "Hoge Energie Pomp Systemen") {
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
            metalProd = 0.002 * this.calcExpoShipProd() * this.getAmountOfExpeditionsPerDay() / 24;
        } else if (productionType == "Enhanced Sensor Technology" || productionType == "Verbeterde Sensortechnologie") {
            metalProd = 0.002 * this.calcExpoResProd() * this.getAmountOfExpeditionsPerDay() / 24;
        } 
        
        //LIFEFORMTECHS T2
        else if (productionType === "Depth Souding" || productionType == "Dieptepeiling"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            });
        } else if (productionType === "Hardened Diamond Drill Heads" || productionType == "Verharde Diamanten Boorkoppen"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0008 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            });
        } else if (productionType === "Enhanced Production Technologies" || productionType == "Verbeterde Productie Technologiën"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
        } else if (productionType === "Improved Stellarator" || productionType == "Verbeterde Stellarator"){
            //TODO
            return 0;
        } else if (productionType === "Sixth Sense" || productionType == "Zesde Zintuig"){
            metalProd = 0.002 * this.calcExpoResProd() * this.getAmountOfExpeditionsPerDay() / 24;
        } else if (productionType === "Seismic Mining Technology" || productionType == "Seismische Mijntechnologie"){
            this.json.player.planets.forEach(p => {
                crystalProd += 0.0008 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            });
        } else if (productionType === "Psychoharmoniser" || productionType == "Psychoharmonisator"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
        } else if (productionType === "Magma-Powered Pump Systems" || productionType == "Magma-aangedreven Pompsystemen"){
            this.json.player.planets.forEach(p => {
                deutProd += 0.0008 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
            });
        } 
        
        //LIFEFORMTECHS T3
        else if (productionType === "Artificial Swarm Intelligence" || productionType === "Artificiële Zwerm Intelligentie"){
            this.json.player.planets.forEach(p => {
                metalProd += 0.0006 * (this.getRawProduction(p, "metal", p.metal)) * this.json.settings.economySpeed * this.getFactor(p, "metal");
                crystalProd += 0.0006 * (this.getRawProduction(p, "crystal", p.crystal)) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
                deutProd += 0.0006 * (this.getRawProduction(p, "deut", p.deut)) * this.json.settings.economySpeed;
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
        return Math.floor(Math.sqrt(parseInt(this.json.player.astro))) + (this.json.player.playerClass == PLAYER_CLASS_EXPLORER ? 2 : 0) + (this.json.player.admiral ? 1 : 0) + parseInt(this.json.player.exposlots);
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

    /**
     * 
     * @param {planet} planet 
     * @param {metal/crystal/deut} productionType 
     * @param {number} level 
     * @returns the hourly production of productionType at planet with the given level
     */
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
        this.createSettingsButton();
    }

    createSettingsButton(){
        let container = document.createElement("li");

        let btn = document.createElement("a");
        btn.classList.add("menubutton");
        btn.setAttribute("target", "_self");

        let label = document.createElement("span");
        label.classList.add("textlabel");
        label.innerHTML = "Calculator Settings";
        btn.appendChild(label);

        btn.addEventListener("click", () => this.openSettings());
        container.appendChild(btn);
        
        let div = document.querySelector("#menuTable");
        div.appendChild(container);
    }

    newPlanet(coords, name){
        if(this.json.settings.lifeforms){
            return {
                coords: coords,
                name: name,
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
                name: name,
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
                let name = planet.querySelector(".planet-name");
                name = name.textContent;
                let trimmedCoords = this.trimCoords(coords);
                if(!this.json.player.planets.find(p => p.coords == trimmedCoords)){
                    changed = true;
                    this.json.player.planets.push(this.newPlanet(trimmedCoords, name));
                } else {
                    let foundIndex = this.json.player.planets.findIndex(p => p.coords == trimmedCoords);
                    this.json.player.planets[foundIndex].name = name;
                    if(Object.keys(this.json.player.planets[foundIndex]).length != Object.keys(this.newPlanet(trimmedCoords, name)).length) {
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
                if(planetCoords.find(c => c == planet.coords)){
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

    createAmortizationWithPrerequisite(planet, upgradeType, level, amorType){
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
                return { 
                    coords: planet.coords, 
                    name: planet.name, 
                    technology: upgradeType, 
                    level: (parseInt(level) + 1) + "-" + (parseInt(level) + x), 
                    amortization: amor / 24,
                    msecost: mseCosts,
                    type: amorType,
                };
            } else {
                return { 
                    coords: planet.coords, 
                    name: planet.name, 
                    technology: upgradeType, 
                    level: (parseInt(level) + x), 
                    amortization: amor / 24,
                    msecost: mseCosts,
                    type: amorType,
                };
            }                    
        }
        else{
            return { 
                coords: planet.coords, 
                name: planet.name, 
                technology: upgradeType, 
                level: (parseInt(level) + 1), 
                amortization: amor / 24,
                msecost: mseCosts,
                type: amorType,
            };
        }
    }

    createAmortizationTable(coords = undefined, listType){
        let expoProfit = this.calcExpoProfit();
        console.log("expo: " + this.getBigNumber(expoProfit));

        

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

        let absoluteAmortization = this.createAbsoluteAmortizationList();
        if(this.json.settings.lifeforms){
            let costLoweringUpgrades = this.getCostLoweringUpgrades();
            absoluteAmortization = this.addCostLoweringUpgradesToAmortization(absoluteAmortization, costLoweringUpgrades);
        }



        if(listType == "recursive"){
            //TODO: trim list for planet sided list
            let totalAmortization = this.createAmortizationListString(absoluteAmortization, 50);        

            for(let r = 0; r < totalAmortization.length + 1; r++){
                let tr = document.createElement('tr');
                tr.style.marginLeft = 10;
                let coords, name, technology, level, amortization;
    
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
                tr.appendChild(td3);
    
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
                let coords, name, technology, level, amortization;
    
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
                tr.appendChild(td3);
    
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

    /**
    * @param coords optional: the coords to create the list for, no coords means whole account
    */
    createAbsoluteAmortizationList(coords){
        let totalAmortization = [];
        this.json.player.planets.forEach((planet) => {
            if(!coords || planet.coords == coords){
                totalAmortization.push(this.createAmortization(planet, "metal", planet.metal, "productionbuilding"));
                totalAmortization.push(this.createAmortization(planet, "crystal", planet.crystal, "productionbuilding"));
                totalAmortization.push(this.createAmortization(planet, "deut", planet.deut, "productionbuilding"));


                if(this.json.settings.lifeforms && planet.lifeforms.lifeformClass){
                    if(planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MENSEN){
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "high energy smelting", parseInt(planet.lifeforms.buildings.highEnergySmelting), "-"));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "fusion powered production", parseInt(planet.lifeforms.buildings.fusionPoweredProduction), "-"));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_ROCKTAL) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "magma forge", parseInt(planet.lifeforms.buildings.magmaForge), "rocktalbuilding, productionbuilding"));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "crystal refinery", parseInt(planet.lifeforms.buildings.crystalRefinery), "rocktalbuilding, productionbuilding"));
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "deuterium synthesizer", parseInt(planet.lifeforms.buildings.deuteriumSynthesizer), "rocktalbuilding, productionbuilding"));
//                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "mineral research centre", parseInt(planet.lifeforms.buildings.mineralResearchCentre)));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_MECHA) {
                        totalAmortization.push(this.createAmortizationWithPrerequisite(planet, "high performance synthesiser", parseInt(planet.lifeforms.buildings.highPerformanceSynthesizer), "-"));
                    } else if (planet.lifeforms.lifeformClass == LIFEFORM_CLASS_KAELESH) {
                    } else {
                        console.error("lifeform not found: " + planet.lifeforms.lifeformClass);
                    }
    
                    planet.lifeforms.techs.forEach(tech => {
                        let extraMSE = this.getMSEProduction(planet, tech.name, parseInt(tech.level));
                        if(extraMSE > 0){
                            let mseCost = this.getMSECosts(planet, tech.name, parseInt(tech.level));
                            totalAmortization.push({
                                coords: planet.coords, 
                                name: planet.name, 
                                technology: tech.name, 
                                level: parseInt(tech.level) + 1, 
                                amortization: mseCost / extraMSE / 24, 
                                msecost: mseCost,
                                type: "lifeformtech",
                            });
                        }
                    });
                }    
            }
        });

        totalAmortization.push({
            coords: "account",
            name: "account",
            technology: "plasma",
            level: (parseInt(this.json.player.plasma) + 1),
            amortization: this.calculateAmortization(undefined, "plasma", parseInt(this.json.player.plasma)),
            msecost: this.getMSECosts(undefined, "plasma", parseInt(this.json.player.plasma)),
            type: "plasma",
        });

        //astro
        let totalMSECostsAstro1 = 0;

        totalMSECostsAstro1 += this.getMSECosts(undefined, "astro", parseInt(this.json.player.astro));
        if(this.json.player.astro % 2 == 1){
            totalMSECostsAstro1 += this.getMSECosts(undefined, "astro", parseInt(this.json.player.astro) + 1);
        } 

        let highestMetal = 0, highestCrystal = 0, highestDeut = 0; 
        this.json.player.planets.forEach(planet => {
            if(planet.metal > highestMetal) highestMetal = planet.metal;
            if(planet.crystal > highestCrystal) highestCrystal = planet.crystal;
            if(planet.deut > highestDeut) highestDeut = planet.deut;
        });

        let p = this.newPlanet("1:1:8", "temp");

        for (let l = 0; l < highestMetal; l++){
            totalMSECostsAstro1 += this.getMSECosts(p, "metal", l);
        }

        for (let l = 0; l < highestCrystal; l++){
            totalMSECostsAstro1 += this.getMSECosts(p, "crystal", l);
        }

        for (let l = 0; l < highestDeut; l++){
            totalMSECostsAstro1 += this.getMSECosts(p, "deut", l);
        }

        let astroLevelString1 = (parseInt(this.json.player.astro) + 1)
        
        if(this.json.player.astro % 2 == 1){
            astroLevelString1 += " & " + (parseInt(this.json.player.astro) + 2);
        }

        let l = 1;
        //next astro level for expo
        for(let i = 1; i * i < parseInt(this.json.player.astro + 1); i++, l++);

        let nextAstro = l*l;
        let newPlanets = 0;
        let totalMSECostsAstro = 0;
        for(let a = parseInt(this.json.player.astro); a < nextAstro; a++){
            if(a % 2 == 0){
                newPlanets++;
            }
            totalMSECostsAstro += this.getMSECosts(undefined, "astro", a);
        }

        for (let l = 0; l < highestMetal; l++){
            totalMSECostsAstro += newPlanets * this.getMSECosts(p, "metal", l);
        }

        for (let l = 0; l < highestCrystal; l++){
            totalMSECostsAstro += newPlanets * this.getMSECosts(p, "crystal", l);
        }

        for (let l = 0; l < highestDeut; l++){
            totalMSECostsAstro += newPlanets * this.getMSECosts(p, "deut", l);
        }

        let astroLevelString = (parseInt(this.json.player.astro) + 1);
        if(parseInt(this.json.player.astro) + 1 < nextAstro){
            astroLevelString += " - " + nextAstro;
        }

        if(totalMSECostsAstro / this.getMSEProduction(undefined, "astro", astroLevelString) < totalMSECostsAstro1 / this.getMSEProduction(undefined, "astro", astroLevelString1)){
            totalAmortization.push({
                coords: "account",
                name: "account",
                technology: "astrophysics",
                level: astroLevelString,
                amortization: totalMSECostsAstro / this.getMSEProduction(undefined, "astro", astroLevelString) / 24,
                msecost: totalMSECostsAstro,
                type: "astro",
            });
        } else {
            totalAmortization.push({
                coords: "account",
                name: "account",
                technology: "astrophysics",
                level: astroLevelString1,
                amortization: totalMSECostsAstro1 / this.getMSEProduction(undefined, "astro", astroLevelString1) / 24,
                msecost: totalMSECostsAstro1,
                type: "astro",
            });
        }

        totalAmortization.sort((a,b) => a.amortization - b.amortization);
        console.log(totalAmortization);
        return totalAmortization;
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

            if(lastUpgrade.level.toString().includes("-")) {
                lastUpgrade.level = parseInt(lastUpgrade.level.split("-")[1]);
            } else {
                lastUpgrade.level = parseInt(lastUpgrade.level);
            }

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
        let index = this.json.player.planets.findIndex(p => p.coords == coords);
        return this.json.player.planets[index];
    }

    getCostLoweringUpgrades(){
        let costLoweringUpgrades = [];

        if(this.json.settings.lifeforms){
            this.json.player.planets.forEach(planet => {
                if(planet.lifeforms.lifeformClass === "rocktal"){
                    // costLoweringUpgrades.push({
                    //     coords: planet.coords,
                    //     upgrade: "mineral research centre",
                    //     priority: 1
                    //     affected: "productionbuilding",
                    // });
                    costLoweringUpgrades.push({
                        coords: planet.coords,
                        upgrade: "rune technologium",
                        priority: 3,
                        affected: "lifeformtech",
                    });
                    // costLoweringUpgrades.push({
                    //     coords: planet.coords,
                    //     upgrade: "megalith",
                    //     priority: 4,
                    //     affected: "rocktalbuilding",
                    // });
                }
    
                // planet.lifeforms.techs.forEach(tech => {
                //     if(tech.name === "verbeterde stellarator"){
                //         costLoweringUpgrades.push({
                //             coords: planet.coords,
                //             upgrade: tech.name,
                //             priority: 2,
                //             affected: "plasma",
                //         })
                //     }
                // });
            });
        }

        costLoweringUpgrades = costLoweringUpgrades.sort((a,b) => a.priority - b.priority);
        console.log(costLoweringUpgrades);
        return costLoweringUpgrades;
    }

    addCostLoweringUpgradesToAmortization(amortizationList, costLoweringUpgrades){
        let totalHourlyMseProd = this.calcTotalMseProduction();

        costLoweringUpgrades.forEach(upgrade => {
            console.log(upgrade);
            let testAmortizationList = this.copyAmortizationArray(amortizationList);
            console.log(testAmortizationList);
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
            }

            let savePercent = upgradePercent / (100 - upgradePercent * curLevel);
            let mseCost = this.getMSECosts(planet, upgrade.upgrade, curLevel);
            let mseToSpend = mseCost / savePercent;

            while(mseToSpend > 0){
                let item = testAmortizationList[0];
                console.log(item);
                if(item.type.includes(upgrade.affected) && (item.coords == undefined || item.coords == upgrade.coords)){
                    console.log("yes");
                    mseToSpend -= item.msecost;
                }
                totalMseCost += item.msecost;
                
                console.log(mseToSpend + " / " + totalMseCost);
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
            console.log(amortizationList);
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

    copyAmortizationArray(arrayToCopy){
        let newArray = [];
        arrayToCopy.forEach(element => {
            newArray.push({
                coords: element.coords, 
                name: element.name, 
                technology: element.technology, 
                level: element.level, 
                amortization: element.amortization,
                msecost: element.msecost,
                type: element.type,
            });
        }); 
        return newArray;
    }

    updateAmortizationList(amortizationList){
        let lastUpgrade = amortizationList[0];
        

        // for(let a = 1; a < amortizationList.length; a++){
        //     if(lastUpgrade.name == "metal"){
        //         if(a.name == "plasma" || a.name == "High-Performance Extractors" || a.name == "Magma-Powered Production" || a.name == "Automated Transport Lines" ||
        //         a.name == "Enhanced Production Technologies" || a.name == "Psychoharmoniser" || a.name == "Artificial Swarm Intelligence" || a.name == "Depth Sounding" ||
        //         a.name == "Hardened Diamond Drill Heads"){

        //         }
        //     } else if (lastUpgrade.name == "crystal"){
        //         if(a.name == "plasma" || a.name == "High-Performance Extractors" || a.name == "Magma-Powered Production" || a.name == "Automated Transport Lines" ||
        //         a.name == "Enhanced Production Technologies" || a.name == "Psychoharmoniser" || a.name == "Artificial Swarm Intelligence" || a.name == "Depth Sounding" ||
        //         a.name == "Hardened Diamond Drill Heads"){

        //         }
        //     } else if (lastUpgrade.name == "deut"){
        //         if(a.name == "plasma" || a.name == "High-Performance Extractors" || a.name == "Magma-Powered Production" || a.name == "Automated Transport Lines" ||
        //         a.name == "Enhanced Production Technologies" || a.name == "Psychoharmoniser" || a.name == "Artificial Swarm Intelligence" || a.name == "Depth Sounding" ||
        //         a.name == "Hardened Diamond Drill Heads"){

        //         }
        //     } else if (lastUpgrade.name == "high energy smelting" || lastUpgrade.name == "magma forge"){

        //     } else if (lastUpgrade.name == "fusion powered production") {

        //     } else if (lastUpgrade.name == "crystal refinery") {

        //     } else if (lastUpgrade.name == "deuterium synthesizer" || lastUpgrade.name == "high performance synthesiser") {

        //     } else if (lastUpgrade.name == "plasma") {

        //     } else if (lastUpgrade.name == "High-Performance Extractors" || lastUpgrade.name == "Magma-Powered Production" || lastUpgrade.name == "Automated Transport Lines" ||
        //     lastUpgrade.name == "Enhanced Production Technologies" || lastUpgrade.name == "Psychoharmoniser" || lastUpgrade.name == "Artificial Swarm Intelligence") {

        //     } else if (lastUpgrade.name == "Depth Sounding" || lastUpgrade.name == "Hardened Diamond Drill Heads") {

        //     } else if (lastUpgrade.name == "Acoustic Scanning" || lastUpgrade.name == "Seismic Mining Technology") {
                
        //     } else if (lastUpgrade.name == "Catalyser Technology" || lastUpgrade.name == "Sulphide Process" || lastUpgrade.name == "High Energy Pump Systems" ||
        //     lastUpgrade.name == "Magma-Powered Pump Systems") {
                
        //     } 
        // }
    }

    createAmortization(planet, technology, level, amorType){
        return { 
            coords: planet.coords, 
            name: planet.name, 
            technology: technology, 
            level: (parseInt(level) + 1), 
            amortization: this.calculateAmortization(planet, technology, level),
            msecost: this.getMSECosts(planet, technology, parseInt(level)),
            type: amorType,
        };
    }

    calculateAmortization(planet, technology, level){
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

        let div = document.querySelector('.accountproduction');
        div = (document.querySelector("#inhalt") || document.querySelector("#suppliescomponent.maincontent")).appendChild(this.createDOM("div", { class: "accountproduction"}));
        div.addEventListener("click", () => {
            let div = document.querySelector('.accountproduction');
            div.remove();
            this.checkPage();
        })

        let table = document.createElement('table');
        table.style.width = '100%';
        table.setAttribute('border', '1');
        let tableBody = document.createElement('tbody');

        let planets = this.json.player.planets;
        planets.sort((a,b) => parseInt(a.coords.split(":")[2]) - parseInt(b.coords.split(":")[2]));
        planets.sort((a,b) => parseInt(a.coords.split(":")[1]) - parseInt(b.coords.split(":")[1]));
        planets.sort((a,b) => parseInt(a.coords.split(":")[0]) - parseInt(b.coords.split(":")[0]));
        console.log(planets);

        let metalProd = 0, crystalProd = 0, deutProd = 0;

        planets.forEach(p => {
            let tr = document.createElement('tr');
            tr.style.marginLeft = 10;
            let text = p.coords + " - " + p.metal + "/" + p.crystal + "/" + p.deut + " - " + p.maxTemp + "°C - " + p.crawlers + "/" + this.calcMaxCrawlers(p) + " crawlers";
            
            metalProd += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProd += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProd += (this.getRawProduction(p, "deut", p.deut) * (1 + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;
            
            tr.appendChild(document.createTextNode(text));
            tableBody.appendChild(tr);
        });

        let tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("------"));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Plasmatechnology: " + this.json.player.plasma));
        tableBody.appendChild(tr);

        tr = document.createElement('tr');
        tr.appendChild(document.createTextNode("Astrophysics: " + this.json.player.astro));
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
            console.log(this.calcMinerBonusProfitHour());
            console.log(this.calcExpoProfit());
            tr.appendChild(document.createTextNode("You should switch to " + PLAYER_CLASS_MINER + " when doing less then " + this.getBigNumber(this.calcMinerBonusProfitHour() * 24 * 7 / this.calcExpoProfit()) + " expeditions per week."));
            tableBody.appendChild(tr);    
        }

        table.appendChild(tableBody);
        div.appendChild(table);
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

        let ratio = this.json.player.ratio;
        return metalProd + crystalProd / ratio[1] * ratio[0] + deutProd / ratio[2] * ratio[0];
    }

    calcMinerBonusProfitHour(){
        let planets = this.json.player.planets;
        let ratio = this.json.player.ratio;
        let metalProdMiner = 0, crystalProdMiner = 0, deutProdMiner = 0;
        let metalProd = 0, crystalProd = 0, deutProd = 0;

        planets.forEach(p => {
            console.log(p.coords);
            console.log(this.calcMaxCrawlers(p));
            let maxCrawlerBonus = (this.calcMaxCrawlers(p) * (this.json.player.geologist ? 1.1 : 1)) * 0.00045;
            let extraCrawlersBonus = maxCrawlerBonus - (p.crawlers > this.calcMaxCrawlers(p) ? this.calcMaxCrawlers(p) : p.crawlers) * 0.0002;
            console.log(maxCrawlerBonus);
            console.log(extraCrawlersBonus);

            metalProd += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProd += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProd += (this.getRawProduction(p, "deut", p.deut) * (1 + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;

            metalProdMiner += (30 + this.getRawProduction(p, "metal", p.metal) * (1 + 0.25 + extraCrawlersBonus + this.getBonus(p, "metal"))) * this.json.settings.economySpeed * this.getFactor(p, "metal");
            crystalProdMiner += (15 + this.getRawProduction(p, "crystal", p.crystal) * (1 + 0.25 + extraCrawlersBonus + this.getBonus(p, "crystal"))) * this.json.settings.economySpeed * this.getFactor(p, "crystal");
            deutProdMiner += (this.getRawProduction(p, "deut", p.deut) * (1 + 0.25 + extraCrawlersBonus + this.getBonus(p, "deut"))) * this.json.settings.economySpeed;
        });

        console.log(metalProdMiner + " - " + crystalProdMiner + " - " + deutProdMiner);
        console.log(metalProd + " - " + crystalProd + " - " + deutProd);
        return metalProdMiner - metalProd + (crystalProdMiner - crystalProd) * ratio[0] / ratio[1] + (deutProdMiner - deutProd) * ratio[0] / ratio[2];
    }

    calcExpoProfit(){
        let blackHoleMSE, fuelCostMSE;
        blackHoleMSE = 0;
        fuelCostMSE = 0;
        return this.calcExpoShipProd() + this.calcExpoResProd() - blackHoleMSE / 300 - fuelCostMSE; 
    }

    GetAverageFind(){
        let maxBase;
        let topscore = this.json.settings.topscore;
        if(topscore < 10000){ maxBase = 40000; }
        else if(topscore < 100000) {maxBase = 500000;}
        else if(topscore < 1000000) {maxBase = 1200000;}
        else if(topscore < 5000000) {maxBase = 1800000;}
        else if(topscore < 25000000) {maxBase = 2400000;}
        else if(topscore < 50000000) {maxBase = 3000000;}
        else if(topscore < 75000000) {maxBase = 3600000;}
        else if(topscore < 100000000) {maxBase = 4200000;}
        else {maxBase = 5000000;}

        let max = maxBase * 2 //pathfinder
        max *= (this.json.player.playerClass == PLAYER_CLASS_EXPLORER ? 1.5 * parseInt(this.json.settings.economySpeed) : 1)
        let averageFactor = (0.89 * (10 + 50) + 0.1 * (52 + 100) + 0.01 * (102 + 200)) / 2;

        return max * averageFactor / 200;

    }

    calcExpoResProd(){
        let ratio = this.json.player.ratio;
        let metalMSE, crystalMSE, deutMSE;
        metalMSE = this.GetAverageFind();
        crystalMSE = this.GetAverageFind() / 2 * ratio[0] / ratio[1];
        deutMSE = this.GetAverageFind() / 3 * ratio[0] / ratio[2];
        return 0.325 * (0.685 * metalMSE + 0.24 * crystalMSE + 0.075 * deutMSE) * (1 + this.calcExpoResBonus());
    }

    calcExpoResBonus(){
        if(this.json.settings.lifeforms){
            let bonus = 0;
            this.json.player.planets.forEach(p => {
                p.lifeforms.techs.forEach(t => {
                    if(t.name == "Verbeterde Sensortechnologie" || t.name == "Zesde Zintuig"){
                        bonus += 0.002 * t.level;
                    }
                });
            });
            return bonus;
        } else {
            return 0;
        }
    }

    calcExpoShipProd(){
        let ratio = this.json.player.ratio;
        let shipMSE = this.GetAverageFind() * (0.54 + .46 * ratio[0] / ratio[1] + 0.093 * ratio[0] / ratio[2]);
        return 0.22 * shipMSE * (1 + this.calcExpoShipBonus());
    }

    calcExpoShipBonus(){
        if(this.json.settings.lifeforms){
            let bonus = 0;
            this.json.player.planets.forEach(p => {
                p.lifeforms.techs.forEach(t => {
                    if(t.name == "Telekinetische Tractorstraal"){
                        bonus += 0.002 * t.level;
                    }
                });
            });
            return bonus;
        } else {
            return 0;
        }
    }

    getBigNumber(number){
        number = Math.round(number);
        number = number.toString();
        let digits = number.length;

        for(let d = 3, dotsplaced = 0; d < digits; d+=3, dotsplaced++){
            number = number.substring(0, digits - d) + "." + number.substring(digits - d, digits + dotsplaced);
        }

        return number;
    }

    calcMaxCrawlers(planet){
        return ((parseInt(planet.metal) + parseInt(planet.crystal) + parseInt(planet.deut)) * 8) * ((this.json.player.playerClass == PLAYER_CLASS_MINER && this.json.player.geologist) ? 1.1 : 1);
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
            this.createButtons();
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
            this.createButtons(currentCoords);
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
                console.log("ally ontdekker");
                this.json.player.allyClass = ALLY_CLASS_EXPLORER;
            } else if (document.querySelector(".value.alliance_class.small.warrior")) {
                console.log("ally generaal");
                this.json.player.allyClass = ALLY_CLASS_WARRIOR;
            } else if (document.querySelector(".value.alliance_class.small.trader")) {
                console.log("ally trader");
                this.json.player.allyClass = ALLY_CLASS_MINER;
            } else {
                console.log("ally geen");
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
        console.log("Button clicked");

        // let stylesheet = document.createElement("style");

        // let styles = `
        //     .overlay {
        //         position: fixed;
        //         display: none;
        //         top: 0;
        //         left: 0;
        //         right: 0;
        //         bottom: 0;
        //         background-color: rgba(0,0,0,.5);
        //         z-index: 9999;
        //     }
            
        //     .overlay-active {
        //         display: block;
        //     }
        // `;

        // stylesheet.innerHTML = styles;
        // document.body.appendChild(stylesheet);

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

        this.json.player.ratio = newRatio.split("/");
        this.json.player.exporounds = document.querySelector("#Exporounds").value.replaceAll(",", ".");
        this.json.player.exposlots = document.querySelector("#Exposlots").value;

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