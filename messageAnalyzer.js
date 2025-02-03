import { GetPlayers, GetHighscore, GetUniverse, GetFactorForPos, GetAverageTemp, GetMseValue, GetExpeditionData, GetStorageCapacityByLevel } from "./functions.js";

let Universe;
let SavedInactives;
let InactivePlanets;
let Ratio;
let ExpeditionData;
let Exposlots;
let Ecospeed;
let SpyTable;

let MessageIdsProcessed = [];
const ExcludeCoords = [
    "1:124:4", "1:272:12", "1:49:12", "1:163:14", "1:219:4", "1:163:13", "1:336:4", "1:272:6", "1:272:13", "1:272:14", "1:272:15", "1:139:4",
    "1:58:10", "1:58:11", "1:180:12", "1:180:14","1:300:13", "1:420:9", "1:420:10", "2:300:12", "2:300:14", "3:250:13", "3:250:14", "4:250:11", ":4:200:12"
]

export class MessageAnalyzer {
    constructor(universe, ratio, exposlots, ecospeed){
        Universe = universe;
        Ratio = ratio;
        Exposlots = exposlots;
        console.log("Slots: " + Exposlots);
        Ecospeed = ecospeed;
    }

    getInactiveData(){
        let data = JSON.parse(localStorage.getItem("ogh-" + Universe + "-inactives"));
        return data;
    }

    saveInactiveData(inactiveList){
        localStorage.setItem("ogh-" + Universe + "-inactives", JSON.stringify(inactiveList));
    }

    saveExpeditionData(expeditionData){
        localStorage.setItem("ogh-" + Universe + "-expeditions", JSON.stringify(expeditionData));
    }

    doMessagesPage(){
        const activeTab = document.querySelector('.innerTabItem.active');
        const selectedId = activeTab ? activeTab.getAttribute('data-subtab-id') : null;

        if (selectedId == 20){
            console.log("spy");
            this.doSpyTable();
        }
        else if (selectedId == 21){
            console.log("fights");
            SpyTable = false;
            this.readCombats();
        }
        else if (selectedId == 22){
            console.log("expeditions");
            SpyTable = false;
            this.readExpeditions();
        }
        else if (selectedId == 23){
            console.log("transport");
            SpyTable = false;
        }
        else if (selectedId == 24){
            console.log("other");
            SpyTable = false;
        }       
        
        setTimeout(() => {
            this.doMessagesPage();
        }, 200)
    }

    readCombats(){
        setTimeout(() => {
            let messageElements = document.querySelectorAll('.msg');
            if(messageElements){
                let saveDataChanged = false;
                let SavedInactives;

                messageElements.forEach(message => {
                    const msgId = message.getAttribute('data-msg-id').toString();
                    if(MessageIdsProcessed.includes(msgId))
                        return;

                    MessageIdsProcessed.push(msgId);

                    const rawData = message.querySelector('.rawMessageData');
                    if(!rawData)
                        return;
                        
                    let defenderInfo = rawData.getAttribute('data-raw-defenderspaceobject');
                    if(!defenderInfo)
                        return;

                    defenderInfo = JSON.parse(defenderInfo);
                    if(!defenderInfo.owner) 
                        return;

                    if(defenderInfo.owner.name == "Governor Leto")
                        return;

                    if(defenderInfo.type != "planet")
                        return;

                    const coords = rawData.getAttribute('data-raw-coords');

                    if(!SavedInactives){
                        SavedInactives = this.getInactiveData();
                    }

                    let spyReportIndex = SavedInactives.findIndex(s => s.coords === coords);
                    if(spyReportIndex == -1)
                        return;

                    let spyReport = SavedInactives[spyReportIndex];

                    if(spyReport.fights != undefined && spyReport.fights.some(f => f.id == msgId))
                        return;

                    let timeStamp = rawData.getAttribute('data-raw-timestamp');
                    if(timeStamp < spyReport.timestamp)
                        return;

                    const result = JSON.parse(rawData.getAttribute('data-raw-result'));
                    console.log(result);

                    const metalStolen = parseInt(result.loot.resources[0].amount);
                    const crystalStolen = parseInt(result.loot.resources[1].amount);
                    const deutStolen = parseInt(result.loot.resources[2].amount);

                    if(spyReport.fights == undefined){
                        spyReport.fights = [];
                    }

                    spyReport.fights.push({
                        id: msgId,
                        metal: metalStolen,
                        crystal: crystalStolen,
                        deuterium: deutStolen,
                        mseStolen: GetMseValue(Ratio, metalStolen, crystalStolen, deutStolen)
                    });
                    SavedInactives[spyReportIndex] = spyReport;
                    console.log(SavedInactives[spyReportIndex].fights);
                    saveDataChanged = true;
                });

                if(saveDataChanged)
                    this.saveInactiveData(SavedInactives);
            }
        }, 1500);
    }

    doSpyTable(){
        if(!SpyTable){
            SpyTable = true;
            setTimeout(() => {
                if(!SavedInactives) SavedInactives = this.getInactiveData();
                if(SavedInactives == null) SavedInactives = [];
                        
                let saveDataChanged = false;
    
                let messageElements = document.querySelectorAll('.msg');
                if(messageElements){
                    messageElements.forEach(message => {
                        let statusArray = JSON.parse(message.getAttribute('data-messages-filters-playerstatus'));
                        if(!statusArray.includes("longinactive") && !statusArray.includes("inactive")) return;
                        
                        if(statusArray.includes("banned")) return;

                        const rawData = message.querySelector('.rawMessageData');
                        //console.log(rawData);
                        if(!rawData)
                            return;

                        if(message.getAttribute('data-raw-targetplanettype') == "3") 
                            return;

                        let coords = rawData.getAttribute("data-raw-coordinates");
    
                        let unixTimestamp = rawData.getAttribute("data-raw-timestamp");    
    
                        let savedSpyIndex = SavedInactives?.findIndex(s => s.coords === coords);
                        if(savedSpyIndex == -1){
                            console.log("Add spy report " + coords);
                            let spyReport = this.createNewSpyReport(rawData);
                            spyReport.coords = coords;
                            spyReport.timestamp = unixTimestamp;

                            SavedInactives.push(spyReport);
                            saveDataChanged = true;
                        } else {
                            let savedSpyReport = SavedInactives[savedSpyIndex];
                            if(savedSpyReport.timestamp < unixTimestamp){
                                if(savedSpyReport.plasmatechniek == "-1"){
                                    savedSpyReport = this.createNewSpyReport(rawData);
                                } else {
                                    console.log("Update spy report " + coords);
                                    savedSpyReport.metal = rawData.getAttribute('data-raw-metal');
                                    savedSpyReport.crystal = rawData.getAttribute('data-raw-crystal');
                                    savedSpyReport.deuterium = rawData.getAttribute('data-raw-deuterium');
                                    savedSpyReport.fights = [];
                                    savedSpyReport.timestamp = unixTimestamp;
                                }
    
                                SavedInactives[savedSpyIndex] = savedSpyReport;
                                saveDataChanged = true;    
                            }
                        }
                    });
                    if(saveDataChanged)
                        this.saveInactiveData(SavedInactives);
                }
    
                if(!InactivePlanets){
                    console.log("Get InactivePlanets");
                    InactivePlanets == "Empty";
                    this.getInactivePlanets().then(planets => {
                        InactivePlanets = planets;
                        SavedInactives = SavedInactives.filter(i => InactivePlanets.some(p => p.coords === i.coords));
                        this.saveInactiveData(SavedInactives);
                        let notSeenInactives = InactivePlanets.filter(i => !SavedInactives.some(s => s.coords === i.coords));
                        console.log(notSeenInactives.sort(b => b.coords));
                        if(SavedInactives?.length > 0){
                            const unixNow = Math.floor(Date.now() / 1000);
                            let SpyTableObjects = [];
                            SavedInactives.forEach(inactive => {
                                let secondsPast = unixNow - inactive.timestamp;
                                let spyTableObject = {};
                                spyTableObject.coords = inactive.coords;
                                let metal = parseInt(inactive.metaalmijn ?? 0);
                                let crystal = parseInt(inactive.kristalmijn ?? 0);
                                let deut = parseInt(inactive.deuteriumfabriek ?? 0);
                                let plasma = parseInt(inactive.plasmatechniek ?? 0);
                                
                                let resourcesStolen = {metal: 0, crystal: 0, deut: 0};
                                if (inactive.fights != undefined && inactive.fights.length > 0){
                                    console.log(inactive.fights);
                                    console.log(inactive.coords);
                                    inactive.fights.forEach(fight => {
                                        resourcesStolen.metal += fight.metal;
                                        resourcesStolen.crystal += fight.crystal;
                                        resourcesStolen.deut += fight.deuterium;
                                    });
                                    console.log(resourcesStolen);
                                }

                                let metalHourlyProd = this.getProductionForInactive(inactive.coords, "metal", metal >= 0 ? metal : 0, plasma >= 0 ? plasma : 0, 0);
                                let tempMetal = parseInt(inactive.metal) + metalHourlyProd / 3600 * secondsPast - (resourcesStolen?.metal ?? 0);
                                let metalStorage = GetStorageCapacityByLevel(parseInt(inactive.metaalopslag));
                                if(tempMetal > metalStorage) tempMetal = metalStorage;

                                let crystalHourlyProd = this.getProductionForInactive(inactive.coords, "crystal", crystal >= 0 ? crystal : 0, plasma >= 0 ? plasma : 0, 0);
                                let tempCrystal = parseInt(inactive.crystal) + crystalHourlyProd / 3600 * secondsPast - (resourcesStolen?.crystal ?? 0);
                                let crystalStorage = GetStorageCapacityByLevel(parseInt(inactive.kristalopslag));
                                if (tempCrystal > crystalStorage) tempCrystal = crystalStorage;

                                let deutHourlyProd = this.getProductionForInactive(inactive.coords, "deut", deut >= 0 ? deut : 0, plasma >= 0 ? plasma : 0, 0);
                                let tempDeut = parseInt(inactive.deut) + deutHourlyProd / 3600 * secondsPast - (resourcesStolen?.deut ?? 0);
                                let deutStorage = GetStorageCapacityByLevel(parseInt(inactive.deuteriumtank));
                                if (tempDeut > deutStorage) tempDeut = deutStorage;
                                
                                let minutesPast = Math.floor(secondsPast / 60);
                                secondsPast = secondsPast % 60;
                                let hoursPast = Math.floor(minutesPast / 60);
                                minutesPast = minutesPast % 60;
                                spyTableObject.timePast = hoursPast + ":" + minutesPast + ":" + secondsPast;
                                spyTableObject.mseLoot = GetMseValue(Ratio, tempMetal, tempCrystal, tempDeut) * 0.75;
                                spyTableObject.resourcesStolen = resourcesStolen;
                                spyTableObject.metal = inactive.metal;
                                spyTableObject.crystal = inactive.crystal;
                                spyTableObject.deut = inactive.deut;                                
                                
                                spyTableObject.data = inactive.plasmatechniek ? "complete" : "incomplete";
                                SpyTableObjects.push(spyTableObject);
                            });
                            SpyTableObjects = SpyTableObjects.filter(b => b.mseLoot > 3000000 && !ExcludeCoords.includes(b.coords));
                            SpyTableObjects.sort((a,b) => b.mseLoot - a.mseLoot);
                            console.log(SpyTableObjects);
                        }        
                    });
                }
            }, 1500);    
        }
    }

    createNewSpyReport(rawData){
        let metal = rawData.getAttribute('data-raw-metal');
        let crystal = rawData.getAttribute('data-raw-crystal');
        let deuterium = rawData.getAttribute('data-raw-deuterium');

        let buildings = JSON.parse(rawData.getAttribute('data-raw-buildings'));
        let lfbuildings = JSON.parse(rawData.getAttribute('data-raw-lfbuildings'));
        let research = JSON.parse(rawData.getAttribute('data-raw-research'));
        let lfresearch = JSON.parse(rawData.getAttribute('data-raw-lfresearch'));

        return {
            metal: metal,
            crystal: crystal,
            deut: deuterium,
            metaalmijn: buildings["1"] ?? -1,
            kristalmijn: buildings["2"] ?? -1,
            deuteriumfabriek: buildings["3"] ?? -1,
            zonnecentrale: buildings["4"] ?? -1,
            fusiecentrale: buildings["12"] ?? -1,
            metaalopslag: buildings["22"] ?? -1,
            kristalopslag: buildings["23"] ?? -1,
            deuteriumtank: buildings["24"] ?? -1,
            plasmatechniek: research["122"] ?? -1,
            energietechniek: research["113"] ?? -1,
        }
    }

    async getInactivePlanets(){
        let players = await GetPlayers(Universe);
        let highscore = await GetHighscore(Universe, 1, 0);
        let inactives = players.filter(p => p.status?.toLowerCase() == 'i');
        inactives.forEach(player => {
            player.points = parseInt(highscore.find(p => p.id == player.id)?.score ?? -1);
        });
        inactives = inactives.sort((a, b) => b.points - a.points);
        let inactivePlanets = await this.getPlanetsByFilter(inactives);
        return inactivePlanets;
    }

    async getPlanetsByFilter(playerFilter){
        let planets = await GetUniverse(Universe);
        planets = planets.filter(planet => playerFilter.map(player => player.id).includes(planet.player));
        return planets.sort((a, b) => playerFilter.findIndex(p => p.id == a.player) - playerFilter.findIndex(p => p.id == b.player));
    }

    getProductionForInactive(coords, type, level, plasma, bonus){
        let pos = coords.split(':')[2];
        let prod;
        let factor = GetFactorForPos(pos, type);

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
                prod = 10 * level * Math.pow(1.1, level) * (1.36 - 0.004 * (GetAverageTemp(coords) - 20));
                bonus += plasma * 0.033;
                break;
        }

        prod *= factor * (1 + bonus) * Ecospeed;
        return prod;
    }

    readExpeditions(){
        let messageElements = document.querySelectorAll('.msg');
        if(messageElements){
            if (!Exposlots || Exposlots == NaN) return;
            if (!ExpeditionData) ExpeditionData = GetExpeditionData(Universe);
            if (!ExpeditionData) ExpeditionData = {
                Startdate: new Date(),
                Expos: {}
            };

            delete ExpeditionData[NaN];

            if (!ExpeditionData.Expos[Exposlots]) ExpeditionData.Expos[Exposlots] = [];

            let saving = false;
            messageElements.forEach(message => {
                const ExpeditionTypeTranslations = ["Expeditieresultaat", "Ekspeditionsresultat"];

                let expoType = message.querySelector('.msg_title').innerText.split(' ')[0];
                if(ExpeditionTypeTranslations.includes(expoType)){
                    let msgId = message.getAttribute('data-msg-id');
                    if(!ExpeditionData.Expos[Exposlots].some(expo => expo.MsgId === msgId)){
                        let dateTime = message.querySelector('.fright').innerText;
                        let date = dateTime.split(' ')[0];
                        let dateObjects = date.split('.');
                        let newStartDate = new Date(dateObjects[2], dateObjects[1] - 1, dateObjects[0], 3, 0, 0);
                        if(newStartDate < new Date(ExpeditionData.Startdate)) ExpeditionData.Startdate = newStartDate;
                        let content = message.querySelector('.msg_content').innerText;
                        
                        let newExpo = {
                            MsgId: msgId,
                            Date: dateTime,
                            Content: content
                        }
                        
                        console.log(newExpo);
                        ExpeditionData.Expos[Exposlots].push(newExpo);
                        saving = true;
                    }
                }
            });

            if (saving) this.saveExpeditionData(ExpeditionData);
        }
    }
}