export async function GetPlayers(Universe){
    const xmlDoc = await getXMLDoc(await fetch(`https://${Universe}.ogame.gameforge.com/api/players.xml`));
    return getObjectsFromXmlDoc(xmlDoc, 'player')
}

export async function GetHighscore(Universe, category, type){
    const xmlDoc = await getXMLDoc(await fetch(`https://${Universe}.ogame.gameforge.com/api/highscore.xml?category=${category}&type=${type}`));
    return getObjectsFromXmlDoc(xmlDoc, 'player');
}

export async function GetAlliances(universe){
    return await getXMLDoc(await fetch(`https://${universe}.ogame.gameforge.com/api/alliances.xml`));
}

export async function GetUniverse(universe){    
    const xmlDoc = await getXMLDoc(await fetch(`https://${universe}.ogame.gameforge.com/api/universe.xml`));
    return getObjectsFromXmlDoc(xmlDoc, 'planet');
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

async function getXMLDoc(xml){
    const xmlText = await xml.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
   
    return xmlDoc;
}

export function GetFactorForPos(pos, productionType) {
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

export function GetAverageTemp(coords){
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

export function GetMseValue(ratio, metal, crystal, deut){
    return parseFloat(metal) + ratio[0] / ratio[1] * parseFloat(crystal) + ratio[0] / ratio[2] * parseFloat(deut);
}

export function GetDateString(date){
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

export function GetExpeditionData(universe){
    let data = JSON.parse(localStorage.getItem("ogh-" + universe + "-expeditions"));
    console.log(data);
    return data;
}