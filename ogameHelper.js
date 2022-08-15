let PLAYER_CLASS_EXPLORER = "ontdekker";
let PLAYER_CLASS_WARRIOR = "generaal";
let PLAYER_CLASS_MINER = "verzamelaar";
let PLAYER_CLASS_NONE = "-";

let ALLY_CLASS_EXPLORER = "onderzoeker";
let ALLY_CLASS_WARRIOR = "krijger";
let ALLY_CLASS_MINER = "handelaar";
let ALLY_CLASS_NONE = "-";

let OVERVIEW = "overview";
let RESOURCES = "supplies";
let LIFEFORM = "lfbuildings";
let LIFEFORM_RESEARCH = "lfresearch";
let FACILITIES = "facilities";
let RESEARCH = "research";


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
console.log(UNIVERSE);

class OgameHelper {
    constructor(){
        let data = localStorage.getItem("ogh-" + UNIVERSE);
        //data = undefined;
        console.log(data);
        if(data && data !== "undefined"){   
            this.json = JSON.parse(data);
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
        
        
        this.run();
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

        this.json.player.geoloog = document.querySelector(".geologist.on") ? true : false;
        this.json.player.ingenieur = document.querySelector(".engineer.on") ? true : false;
        this.json.player.legerleiding = this.json.player.geoloog && this.json.player.ingenieur && (document.querySelector(".commander.on") ? true : false) && (document.querySelector(".admiral.on") ? true : false) && (document.querySelector(".technocrat.on") ? true : false);

        this.json.player.allyClass = ALLY_CLASS_NONE;
        //TODO: GET ALLY CLASS
        
        this.json.player.ratio = [3, 2, 1];
        this.json.player.astro = 0;
        this.json.player.plasma = 0;

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
            this.json.settings.version = xml.querySelector("version").innerHTML,
            this.json.settings.economySpeed = xml.querySelector("speed").innerHTML,
            this.json.settings.peacefulFleetSpeed = xml.querySelector("speedFleetPeaceful").innerHTML,
            this.json.settings.deutUsageFactor = xml.querySelector("globalDeuteriumSaveFactor").innerHTML,
            this.json.settings.topscore = xml.querySelector("topScore").innerHTML    
            this.saveData();
        });
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
        let officerBonus = this.json.player.geoloog ? (this.json.player.legerleiding ? 0.12 : 0.1) : 0;
        let processorBonus = planet.crawlers ? planet.crawlers * (this.json.player.playerClass === PLAYER_CLASS_MINER ? 0.00045 : 0.0002) : 0;

        return verzamelaarBonus + handelaarBonus + plasmaBonus + officerBonus + processorBonus;
    }

    getMSECosts(upgradeType, level){
        let ratio = this.json.player.ratio ? this.json.player.ratio : [3, 2, 1];
        let metalCost;
        let crystalCost;
        let deutCost;
        if(upgradeType === "metal"){
            metalCost = 60 * Math.pow(1.5, level);
            crystalCost = 15 * Math.pow(1.5, level);
            deutCost = 0;
        } else if (upgradeType === "crystal"){
            metalCost = 48 * Math.pow(1.6, level);
            crystalCost = 24 * Math.pow(1.6, level);
            deutCost = 0;
        } else if (upgradeType === "deut"){
            metalCost = 225 * Math.pow(1.5, level);
            crystalCost = 75 * Math.pow(1.5, level);
            deutCost = 0;
        } else if (upgradeType === "plasma"){
            metalCost = 2000 * Math.pow(2, level);
            crystalCost = 4000 * Math.pow(2, level);
            deutCost = 1000 * Math.pow(2, level);
        } else if (upgradeType === "astro"){
            metalCost = 4000 * Math.pow(1.75, level);
            crystalCost = 8000 * Math.pow(1.75, level);
            deutCost = 4000 * Math.pow(1.75, level);
        } else {
            return 0;
        }

        return (metalCost + crystalCost * ratio[0] / ratio[1] + deutCost * ratio[0] / ratio[2]); 
    }

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
            this.json.player.planets.forEach(planet => {
                metalProd += this.getRawProduction(planet, "metal", planet.metal) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
                crystalProd += this.getRawProduction(planet, "crystal", planet.crystal) * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
                deutProd += this.getRawProduction(planet, "deut", planet.deut) * this.json.settings.economySpeed;
            });
            metalProd *= 0.01 * level;
            crystalProd *= 0.0066 * level;
            deutProd *= 0.0033 * level;
        } else if (productionType === "astro"){
            let highestMetal = 0, highestCrystal = 0, highestDeut = 0; 
            this.json.player.planets.forEach(planet => {
                if(planet.metal > highestMetal) highestMetal = planet.metal;
                if(planet.crystal > highestCrystal) highestCrystal = planet.crystal;
                if(planet.deut > highestDeut) highestDeut = planet.deut;
            });

            let planet = {
                coords: "1:1:8",
                maxTemp: 50 // average temp for pos 8
            };

            metalProd += (30 + this.getRawProduction(planet, "metal", highestMetal) * (1 + this.getBonus(planet, productionType))) * this.json.settings.economySpeed * this.getFactor(planet, "metal");
            crystalProd += (15 + this.getRawProduction(planet, "crystal", highestCrystal) * (1 + this.getBonus(planet, productionType))) * this.json.settings.economySpeed * this.getFactor(planet, "crystal");
            deutProd += (this.getRawProduction(planet, "deut", highestDeut) * (1 + this.getBonus(planet, productionType))) * this.json.settings.economySpeed;
        } else {
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
        let newplanet = {
            coords: coords,
            metal: 0,
            crystal: 0,
            deut: 0,
            solar: 0,
            crawlers: 0,
            maxTemp: undefined        
        };
        return newplanet;
    }

    remakePlanet(planet){
        let newplanet = {
            coords: planet.coords,
            metal: planet.metal ? planet.metal : 0,
            crystal: planet.crystal ? planet.crystal : 0,
            deut: planet.deut ? planet.deut : 0,
            solar: planet.solar ? planet.solar : 0,
            crawlers: planet.crawlers ? planet.crawlers : 0,
            maxTemp: planet.maxTemp ? planet.maxTemp : undefined
        };
        return newplanet;
    }

    checkPlanets(){
        console.log("checking planets");
        let changed = false;
        let planetList = document.querySelectorAll(".smallplanet");
        planetList.forEach((planet) => {
            let coords = planet.querySelector(".planet-koords");
            if(coords){
                if(coords.textContent.startsWith("[")){
                    coords.textContent = coords.textContent.substring(1, coords.textContent.length - 1);
                }

                let trimmedCoords = this.trimCoords(coords);
                if(!this.json.player.planets.find(p => p.coords == trimmedCoords)){
                    changed = true;
                    this.json.player.planets.push(this.newPlanet(trimmedCoords));
                } else {
                    let foundIndex = this.json.player.planets.findIndex(p => p.coords == trimmedCoords);
                    if(Object.keys(this.json.player.planets[foundIndex]).length != Object.keys(this.newPlanet(trimmedCoords)).length) {
                        changed = true;
                        this.json.player.planets[foundIndex] = this.newPlanet(trimmedCoords);                
                    }
                }
            }
        });

        if(changed){
            console.log("savingdata");
            this.saveData();
        }
    }

    checkStaff(){
        this.json.player.geoloog = document.querySelector(".geologist.on") ? true : false;
        this.json.player.ingenieur = document.querySelector(".engineer.on") ? true : false;
        this.json.player.legerleiding = this.json.player.geoloog && this.json.player.ingenieur && (document.querySelector(".commander.on") ? true : false) && (document.querySelector(".admiral.on") ? true : false) && (document.querySelector(".technocrat.on") ? true : false);
    }

    createDOM(element, options, content) {
        let e = document.createElement(element);
        for (var key in options) {
            e.setAttribute(key, options[key]);
        }
        if (content || content == 0) e.html(content);
        return e;
    }

    createAmortizationTable(){
        let totalAmortization = [];

        this.json.player.planets.forEach((planet) => {
            totalAmortization.push({ coords: planet.coords, technology: "metal", level: (parseInt(planet.metal) + 1), amortization: this.getMSECosts("metal", planet.metal) / this.getExtraMSEProduction(planet, "metal", parseInt(planet.metal)) / 24 });
            totalAmortization.push({ coords: planet.coords, technology: "crystal", level: (parseInt(planet.crystal) + 1), amortization: this.getMSECosts("crystal", planet.crystal) / this.getExtraMSEProduction(planet, "crystal", parseInt(planet.crystal)) / 24});
            totalAmortization.push({ coords: planet.coords, technology: "deut", level: (parseInt(planet.deut) + 1), amortization: this.getMSECosts("deut", planet.deut) / this.getExtraMSEProduction(planet, "deut", parseInt(planet.deut)) / 24});
        });

        totalAmortization.push({ coords: "account", technology: "plasma", level: (parseInt(this.json.player.plasma) + 1), amortization: this.getMSECosts("plasma", parseInt(this.json.player.plasma)) / this.getExtraMSEProduction(undefined, "plasma", parseInt(this.json.player.plasma)) / 24});

        //astro
        let totalMSECostsAstro = 0;

        totalMSECostsAstro += this.getMSECosts("astro", parseInt(this.json.player.astro));
        if(this.json.player.astro % 2 == 1){
            totalMSECostsAstro += this.getMSECosts("astro", parseInt(this.json.player.astro) + 1);
        } 

        let highestMetal = 0, highestCrystal = 0, highestDeut = 0; 
        this.json.player.planets.forEach(planet => {
            if(planet.metal > highestMetal) highestMetal = planet.metal;
            if(planet.crystal > highestCrystal) highestCrystal = planet.crystal;
            if(planet.deut > highestDeut) highestDeut = planet.deut;
        });

        for (let l = 0; l < highestMetal; l++){
            totalMSECostsAstro += this.getMSECosts("metal", l);
        }

        for (let l = 0; l < highestCrystal; l++){
            totalMSECostsAstro += this.getMSECosts("crystal", l);
        }

        for (let l = 0; l < highestDeut; l++){
            totalMSECostsAstro += this.getMSECosts("deut", l);
        }


        let astroLevelString = (parseInt(this.json.player.astro) + 1)
        if(this.json.player.astro % 2 == 1){
            astroLevelString += " & " + (parseInt(this.json.player.astro) + 2);
        }

        totalAmortization.push({ coords: "account", technology: "astro", level: astroLevelString, amortization: totalMSECostsAstro / this.getMSEProduction(undefined, "astro", undefined) / 24});
        totalAmortization.sort((a,b) => a.amortization - b.amortization);
        console.log(totalAmortization);

        let div;
        if(this.json.settings.version && this.json.settings.version.startsWith("9")) {
            div = document.querySelector('.amortizationtableV9');
            div = document.querySelector("#inhalt").appendChild(this.createDOM("div", { class: "amortizationtableV9"}));
        } else {
            div = document.querySelector('.amortizationtable');
            div = document.querySelector("#inhalt").appendChild(this.createDOM("div", { class: "amortizationtable"}));
        }
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
                amortization = "Return of Interest";
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
        if(!currentIsMoon){
            if(page === OVERVIEW){
                this.checkPlanets();
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
                
                this.createAmortizationTable();
                //TODO: CREATE AMORTIZATION TABLE
            } else if (page === RESOURCES){
                this.checkPlanets();
                console.log("update mines");
                console.log("Planetindex: " + this.json.player.planets.findIndex(p => p.coords == currentCoords));
                let index = this.json.player.planets.findIndex(p => p.coords == currentCoords);
                if(this.json.player.planets[index]){
                    this.json.player.planets[index].metal = document.querySelector(".technology.metalMine .level").getAttribute("data-value");
                    this.json.player.planets[index].crystal = document.querySelector(".technology.crystalMine .level").getAttribute("data-value");
                    this.json.player.planets[index].deut = document.querySelector(".technology.deuteriumSynthesizer .level").getAttribute("data-value");
                    this.json.player.planets[index].solar = document.querySelector(".technology.solarPlant .level").getAttribute("data-value");
//                    this.json.player.planets[index].fusion = document.querySelector(".technology.fusionReactor .level").getAttribute("data-value");
                    this.json.player.planets[index].crawlers = document.querySelector(".technology.resbuggy .amount").getAttribute("data-value");    
                } else {
                    this.json.player.planets[index] = {
                        metal: document.querySelector(".technology.metalMine .level").getAttribute("data-value"),
                        crystal: document.querySelector(".technology.crystalMine .level").getAttribute("data-value"),
                        deut: document.querySelector(".technology.deuteriumSynthesizer .level").getAttribute("data-value"),
                        solar: document.querySelector(".technology.solarPlant .level").getAttribute("data-value"),
                        //fusion: document.querySelector(".technology.fusionReactor .level").getAttribute("data-value"),
                        crawlers: document.querySelector(".technology.resbuggy .amount").getAttribute("data-value")
                    };
                }
                console.log("savingdata");
                this.saveData();
                //TODO: GET FUSION/STORAGES
            } else if (page === LIFEFORM){
                //TODO: UPDATE LIFEFORM BUILDINGS
            } else if (page === LIFEFORM_RESEARCH){
                //TODO: UPDATE LIFEFORM RESEARCH
            } else if (page === FACILITIES){
                //TODO: UPDATE FACILITIES
            } else if (page === RESEARCH){
                console.log("update research");
                this.json.player.plasma = document.querySelector(".technology.plasmaTechnology .level").getAttribute("data-value");
                this.json.player.astro = document.querySelector(".technology.astrophysicsTechnology .level").getAttribute("data-value");
                this.saveData();
                console.log("savingdata");
                //TODO: UPDATE RESEARCH
            }    
        }
    }
}

(async () => {
    let helper = new OgameHelper();
    // setTimeout(function () {
    //     helper.run();
    // }, 0);
  })();