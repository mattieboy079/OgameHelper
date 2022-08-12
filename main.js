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


    getData(coords){

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
                this.planets[index] = new Planet(coords.textContent)
        });

        console.log(this.planets);
    }



    saveData(){

    }
}

class OgameHelper {
    constructor(){
        this.settings = new ServerSettings(UNIVERSE);
        this.player = new PlayerInfo();
        console.log(this.player);

        console.log("Class: " + this.player.playerClass);
        console.log("Economy:" + this.settings.economySpeed);

        let rawURL = new URL(window.location.href);
        let page = rawURL.searchParams.get("component") || rawURL.searchParams.get("page");

        console.log(rawURL);
        console.log(page);

        console.log(this);
        //serverSettings = new serverSettings()
        
        // console.log(document.querySelectorAll(".planet-koords"));
        
        // console.log(document.querySelector(".technology.metalMine .level"));
        
        // let metal = document.querySelector(".technology.metalMine .level").getAttribute("data-value");
        // let crystal = document.querySelector(".technology.crystalMine .level").getAttribute("data-value");
        // let deut = document.querySelector(".technology.deuteriumSynthesizer .level").getAttribute("data-value");
        // let crawlers = document.querySelector(".technology.resbuggy .amount").getAttribute("data-value");
        
        // console.log("metal: " + metal);
        // console.log("crystal: " + crystal);
        // console.log("deut: " + deut);
        // console.log("crawlers: " + crawlers);
           
    }
}

(async () => {
    let helper = new OgameHelper();
    // setTimeout(function () {
    //     helper.init();
    //     helper.start();
    // }, 0);
  })();