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

function getServerSettings(universe){
    return getXMLData(fetch(`https://${universe}.ogame.gameforge.com/api/serverData.xml`));
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

class ServerSettings{
    constructor(universe){
        fetch(`https://${universe}.ogame.gameforge.com/api/serverData.xml`)
        .then((rep) => rep.text())
        .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
        .then((xml) => {
            this.universe = universe,
            this.economySpeed = xml.querySelector("speed").innerHTML,
            this.peacefulFleetSpeed = xml.querySelector("speedFleetPeaceful").innerHTML,
            this.deutUsageFactor = xml.querySelector("globalDeuteriumSaveFactor").innerHTML,
            this.topscore = xml.querySelector("topScore").innerHTML
        });
    }
}

class Planet {
    constructor(coords){
        this.coords = coords;
    }
}

class PlayerInfo {
    constructor(){
        if (document.querySelector("#characterclass .explorer")) {
            this.playerClass = PLAYER_CLASS_EXPLORER;
        } else if (document.querySelector("#characterclass .warrior")) {
            this.playerClass = PLAYER_CLASS_WARRIOR;
        } else if (document.querySelector("#characterclass .miner")) {
            this.playerClass = PLAYER_CLASS_MINER;
        } else {
            this.playerClass = PLAYER_CLASS_NONE;
        }
        
        this.planets = [];
        let planetList = document.querySelectorAll(".smallplanet");
        planetList.forEach((planet, index) => {
            let coords = planet.querySelector(".planet-koords");
            if(coords)
                this.planets[index] = new Planet(coords.textContent);
        });

        console.log(this.planets);
    }
}

class OgameHelper {
    constructor(){
        let data = localStorage.getItem("ogh-" + UNIVERSE);
        console.log(data);
        if(data){
            this.settings = new ServerSettings(UNIVERSE);
            this.json = JSON.parse(data);
            console.log(this);
        } else {
            this.settings = new ServerSettings(UNIVERSE);
            this.json = {};
            this.json.player = new PlayerInfo();
            console.log(this.json.player);
    
            console.log("Class: " + this.json.player.playerClass);
            console.log("Economy:" + this.settings.economySpeed);
             
            this.saveData();
        }
        
        // console.log(document.querySelectorAll(".planet-koords"));
        
        // console.log(document.querySelector(".technology.metalMine .level"));
        
        
        // console.log("metal: " + metal);
        // console.log("crystal: " + crystal);
        // console.log("deut: " + deut);
        // console.log("crawlers: " + crawlers);
           
    }

    saveData(){
        console.log("data to save:");
        console.log(this.json);   
        localStorage.setItem("ogh-" + UNIVERSE, JSON.stringify(this.json));
    }

    run(){
        this.checkPage();
    }

    checkPage(){
        let currentPlanet = (document.querySelector(".smallplanet .active") || document.querySelector(".smallplanet .planetlink")).parentNode;
        let currentCoords = currentPlanet.querySelector(".planet-koords").textContent;
        let currentIsMoon = currentPlanet.querySelector(".moonlink") ? true : false && currentPlanet.querySelector(".moonlink .active") ? true : false;
    

        let rawURL = new URL(window.location.href);
        let page = rawURL.searchParams.get("component") || rawURL.searchParams.get("page");
        console.log(page);
        console.log(currentIsMoon);
        if(!currentIsMoon){
            console.log("Got here");
            if(page === OVERVIEW){
                //TODO: CREATE AMORTIZATION TABLE
            } else if (page === RESOURCES){
                console.log("update mines");
                console.log(currentCoords);
                console.log(this.json.player.planets.findIndex(p => p.coords == currentCoords));
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
                        fusion: document.querySelector(".technology.fusionReactor .level").getAttribute("data-value"),
                        crawlers: document.querySelector(".technology.resbuggy .amount").getAttribute("data-value")
                    };
                }
                this.saveData();
                //TODO: UPDATE MINES
            } else if (page === LIFEFORM){
                //TODO: UPDATE LIFEFORM BUILDINGS
            } else if (page === LIFEFORM_RESEARCH){
                //TODO: UPDATE LIFEFORM RESEARCH
            } else if (page === FACILITIES){
                //TODO: UPDATE FACILITIES
            } else if (page === RESEARCH){
                //TODO: UPDATE RESEARCH
            }    
        }
    }
}

(async () => {
    let helper = new OgameHelper();
    setTimeout(function () {
        helper.run();
    }, 0);
  })();