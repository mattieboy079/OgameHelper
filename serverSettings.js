class ServerSettings{
    constructor(serverSettingsXML){
        this.economySpeed = serverSettingsXML.querySelector("speed").innerHTML;
    }
}