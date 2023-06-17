import { Upgradable } from "./upgradable.js";

export class Amortization {
    locationName: string
    upgrade: Upgradable;
    amortization: number;
    mseCost: number;

    constructor(name: string, upgrade: Upgradable, amor: number, mseCost: number) {
        this.locationName = name;
        this.upgrade = upgrade;
        this.amortization = amor;
        this.mseCost = mseCost;
    }
}