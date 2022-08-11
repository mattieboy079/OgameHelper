function getXMLData(xml){
    return xml.then((rep) => rep.text()).then((str) => new window.DOMParser().parseFromString(str, "text/xml"));
}

function getServerSettings(universe){
    return getXMLData(fetch(`https://s${universe}.ogame.gameforge.com/api/serverData.xml`));
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