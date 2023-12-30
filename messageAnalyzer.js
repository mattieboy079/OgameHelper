import { GetPlayers, GetHighscore, GetUniverse, GetFactorForPos, GetAverageTemp, GetMseValue, GetExpeditionData } from "./functions.js";

let Universe;
let SavedInactives;
let InactivePlanets;
let Ratio;
let ExpeditionData;
let Exposlots;

export class MessageAnalyzer {
    constructor(universe, ratio, exposlots){
        Universe = universe;
        Ratio = ratio;
        Exposlots = exposlots;
    }

    getInactiveData(){
        return JSON.parse(localStorage.getItem("ogh-" + Universe + "-inactives"));
    }

    saveInactiveData(inactiveList){
        localStorage.setItem("ogh-" + Universe + "-inactives", JSON.stringify(inactiveList));
    }

    saveExpeditionData(expeditionData){
        localStorage.setItem("ogh-" + Universe + "-expeditions", JSON.stringify(expeditionData));
    }

    doMessagesPage(){
        if (document.querySelector("li[id=subtabs-nfFleet20].ui-state-active")){
            console.log("spy");
        //    this.doSpyTable();
        }
        else if (document.querySelector("li[id=subtabs-nfFleet21].ui-state-active")){
            console.log("fights");
        }
        else if (document.querySelector("li[id=subtabs-nfFleet22].ui-state-active")){
            console.log("expeditions");
            this.readExpeditions();
        }
        else if (document.querySelector("li[id=subtabs-nfFleet23].ui-state-active")){
            console.log("transport");
        }
        else if (document.querySelector("li[id=subtabs-nfFleet24].ui-state-active")){
            console.log("other");
        }

        setTimeout(() => {
            this.doMessagesPage();
        }, 200);
    }

    doSpyTable(){
        setTimeout(() => {
            if(!SavedInactives) SavedInactives = this.getInactiveData();
            console.log(SavedInactives);

            let saveDataChanged = false;

            let messageElements = document.querySelectorAll('.msg');
            if(messageElements){
                console.log(messageElements);
                messageElements.forEach(message => {
                    if(message.getAttribute('data-status') != 'inactive') return;
                    if(message.getAttribute('data-is-moon') == "1") return;

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


                    if(SavedInactives == null) SavedInactives = [];
                    let savedSpyIndex = SavedInactives?.findIndex(s => s.coords === coords);
                    let savedSpyReport = SavedInactives[savedSpyIndex];

                    if (savedSpyIndex != -1 && unixTimestamp <= savedSpyReport.timestamp) {
                        if(savedSpyReport.Plasmatechniek == undefined || savedSpyReport.Plasmatechniek == "-1"){
                            let button = message.querySelector('.fright.txt_link.msg_action_link.overlay');
                            button.addEventListener('click', () => { this.readOpenSpyReportContent(savedSpyReport) });    
                        }    
                        return;
                    };

                    let metal = message.getAttribute('data-metal');
                    let crystal = message.getAttribute('data-crystal');
                    let deut = message.getAttribute('data-deut');
 
                    let spyReport = {
                        msgId: message.dataset.msgId,
                        timestamp: unixTimestamp,
                        coords: coords,
                        metal: metal,
                        crystal: crystal,
                        deut: deut,
                    }
                    console.log(spyReport);

                    if(savedSpyIndex == -1){
                        SavedInactives.push(spyReport);
                        savedSpyIndex = SavedInactives.length - 1;
                        saveDataChanged = true;
                    } else {
                        if(SavedInactives[savedSpyIndex].msgId != spyReport.msgId){
                            SavedInactives[savedSpyIndex].msgId = spyReport.msgId;
                            SavedInactives[savedSpyIndex].timestamp = spyReport.timestamp;
                            SavedInactives[savedSpyIndex].metal = spyReport.metal;
                            SavedInactives[savedSpyIndex].crystal = spyReport.crystal;
                            SavedInactives[savedSpyIndex].deut = spyReport.deut;          
                            saveDataChanged = true;
                        }
                    }

                    let button = message.querySelector('.fright.txt_link.msg_action_link.overlay');
                    console.log(button);
                    button.addEventListener('click', () => { this.readOpenSpyReportContent(SavedInactives[savedSpyIndex]) });
                });
                console.log(SavedInactives);    
            }

            if(InactivePlanets == undefined){
                console.log("Get InactivePlanets");
                InactivePlanets == "Empty";
                this.getInactivePlanets().then(planets => {
                    InactivePlanets = planets;
                    SavedInactives = SavedInactives.filter(i => InactivePlanets.some(p => p.coords === i.coords));
                    this.saveInactiveData(SavedInactives);
                    console.log(InactivePlanets);
                    if(SavedInactives?.length > 0){
                        const unixNow = Math.floor(Date.now() / 1000);
                        let SpyTableObjects = [];
                        SavedInactives.forEach(inactive => {
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
                        SpyTableObjects.sort((a,b) => GetMseValue(Ratio, b.metal, b.crystal, b.deut) - GetMseValue(Ratio, a.metal, a.crystal, a.deut));
                        console.log(SpyTableObjects);
                    }        
                });
            }
        }, 1500);
    }

    async getInactivePlanets(){
        let players = await GetPlayers(Universe);
        let highscore = await GetHighscore(Universe, 1, 0);
        let inactives = players.filter(p => p.status?.toLowerCase() == 'i');
        inactives.forEach(player => {
            player.points = parseInt(highscore.find(p => p.id == player.id)?.score ?? -1);
        });
        inactives = inactives.filter(p => p.points > 100);
        let inactivePlanets = await this.getPlanetsByFilter(inactives);
        return inactivePlanets;
    }

    async getPlanetsByFilter(playerFilter){
        let planets = await GetUniverse(Universe);
        return planets.filter(planet => playerFilter.map(player => player.id).includes(planet.player));
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

        prod *= factor * (1 + bonus);
        return prod;
    }

    readOpenSpyReportContent(spyReport){
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

            let savedSpyIndex = SavedInactives?.findIndex(s => s.coords === spyReport.coords);
            if (savedSpyIndex == -1) return;

            SavedInactives[savedSpyIndex].Metaalmijn = spyReport.Metaalmijn;
            SavedInactives[savedSpyIndex].Kristalmijn = spyReport.Kristalmijn;
            SavedInactives[savedSpyIndex].Deuteriumfabriek = spyReport.Deuteriumfabriek;
            SavedInactives[savedSpyIndex].Metaalopslag = spyReport.Metaalopslag;
            SavedInactives[savedSpyIndex].Kristalopslag = spyReport.Kristalopslag;
            SavedInactives[savedSpyIndex].Deuteriumtank = spyReport.Deuteriumtank;
            SavedInactives[savedSpyIndex].Plasmatechniek = spyReport.Plasmatechniek;

            console.log(SavedInactives);
            this.saveInactiveData(SavedInactives);
        }, 1000);
    }

    readExpeditions(){
        let messageElements = document.querySelectorAll('.msg');
        if(messageElements){
            if (!ExpeditionData) ExpeditionData = GetExpeditionData(Universe);
            if (!ExpeditionData) ExpeditionData = {
                Startdate: new Date(),
                Expos: {}
            };

            if(!ExpeditionData.Expos[Exposlots]) ExpeditionData.Expos[Exposlots] = [];

            let saving = false;
            messageElements.forEach(message => {
                let expoType = message.querySelector('.msg_title').innerText.split(' ')[0];
                if(expoType == "Expeditieresultaat"){
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