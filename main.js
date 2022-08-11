let PLAYER_CLASS_EXPLORER = 3;
let PLAYER_CLASS_WARRIOR = 2;
let PLAYER_CLASS_MINER = 1;
let PLAYER_CLASS_NONE = 0;

let ALLY_CLASS_EXPLORER = 3;
let ALLY_CLASS_WARRIOR = 2;
let ALLY_CLASS_MINER = 1;
let ALLY_CLASS_NONE = 0;

if (document.querySelector("#characterclass .explorer")) {
    this.playerClass = PLAYER_CLASS_EXPLORER;
    console.log("ontdekker");
} else if (document.querySelector("#characterclass .warrior")) {
    this.playerClass = PLAYER_CLASS_WARRIOR;
    console.log("generaal");
} else if (document.querySelector("#characterclass .miner")) {
    this.playerClass = PLAYER_CLASS_MINER;
    console.log("verzamelaar");
} else {
    this.playerClass = PLAYER_CLASS_NONE;
    console.log("geen klasse");
}

console.log(document.querySelector(".smallplanet .active").parentNode.querySelector(".planet-koords").textContent);


let tooltips = [
    resourcesBar.resources.metal.tooltip,
    resourcesBar.resources.crystal.tooltip,
    resourcesBar.resources.deuterium.tooltip,
  ];
let metalProd, crystalProd, deuteriumProd;
tooltips.forEach((elem, i) => {
    let tooltip = this.createDOM("div", {});
    tooltip.html(elem);
    let lines = tooltip.querySelectorAll("tr");
    console.log(parseInt(this.removeNumSeparator(lines[1].querySelector("td").innerText)));
    console.log(parseInt(this.removeNumSeparator(lines[0].querySelector("td").innerText)));
    console.log(parseInt(this.removeNumSeparator(lines[2].querySelector("td").innerText)));
});
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

let settingsUrl = `https://s${this.universe}-${this.gameLang}.ogame.gameforge.com/api/serverData.xml`;
