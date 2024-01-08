const UNIVERSE = window.location.host.split(".")[0];

class OgameXHelper {
    constructor(){
        console.log(UNIVERSE);

        let data = localStorage.getItem("ogxh-" + UNIVERSE);
        if (data && data !== "undefined") {
            this.json = JSON.parse(data);
            console.log(this.json);
            let player = this.json.player;
            //let newPlayer = new Player(this.json.player);
            this.getServerSettings(UNIVERSE);
            if (!this.json.player) {
                this.getNewPlayerJson();
                this.saveData();
            }
        } else {
            console.log("new");
            this.json = {};
            this.getServerSettings(UNIVERSE);
            this.getNewPlayerJson();
            console.log(this.json);
        }
    }

    run() {
        this.checkPage();
        this.createSettingsButton();
    }
}

(async () => {
    let helper = new OgameXHelper();
    setTimeout(function () {
        helper.run();
    }, 0);
})();