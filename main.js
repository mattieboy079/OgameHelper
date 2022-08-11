let PLAYER_CLASS_EXPLORER = 3;
let PLAYER_CLASS_WARRIOR = 2;
let PLAYER_CLASS_MINER = 1;
let PLAYER_CLASS_NONE = 0;

let ALLY_CLASS_EXPLORER = 3;
let ALLY_CLASS_WARRIOR = 2;
let ALLY_CLASS_MINER = 1;
let ALLY_CLASS_NONE = 0;

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
        fetch(`https://${UNIVERSE}.ogame.gameforge.com/api/serverData.xml`)
        .then((rep) => rep.text())
        .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
        .then((xml) => {
            console.log(xml.querySelector("speed").innerHTML;
        });
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
    }
}

class OgameHelper {
    constructor(){
        let settings = new ServerSettings(UNIVERSE);
        console.log("Economy:" + settings.economySpeed);
        this.player = new PlayerInfo();
        console.log("Class: " + this.player.playerClass);

    
        //serverSettings = new serverSettings()
        
        console.log(document.querySelector(".smallplanet .active").parentNode.querySelector(".planet-koords").textContent);
        
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