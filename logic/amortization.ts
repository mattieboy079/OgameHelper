import { Upgradable } from "./upgradable.js";

export class Amortization {
    LocationName: string
    Upgrade: Upgradable;
    Amortization: number;
    MseCost: number;

    constructor(name: string, upgrade: Upgradable, amor: number, mseCost: number) {
        this.LocationName = name;
        this.Upgrade = upgrade;
        this.Amortization = amor;
        this.MseCost = mseCost;
    }
}