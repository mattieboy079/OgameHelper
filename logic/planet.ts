import { Amortization } from './amortization.js';
import { LifeformBuilding } from './lifeformbuildings.js';
import { MeditationEnclave } from './lifeformbuildingsrocktal.js';
import { AutomatedTransportLines, LifeformTech } from './lifeformtechs.js';
import { MetalMine, CrystalMine, DeutMine } from './mines.js';
import { Player } from './player.js';

export class Planet{
    coords: string;
    name: string;
    maxTemp: number;
    crawlers: number;
    satellite: number;
    metal: MetalMine;
    crystal: CrystalMine;
    deut: DeutMine;
    fusion: number;
    solar: number;
    lifeforms: PlanetLifeforms;

    constructor(data: any){
        this.coords = data.coords;
        this.name = data.name;
        this.maxTemp = parseInt(data.maxTemp);
        this.crawlers = parseInt(data.crawlers);
        this.satellite = parseInt(data.satellite);
        this.metal = new MetalMine(parseInt(data.metal), this.coords);
        this.crystal = new CrystalMine(parseInt(data.crystal), this.coords);
        this.deut = new DeutMine(parseInt(data.deut), this.coords);
        this.fusion = parseInt(data.fusion);
        this.solar = parseInt(data.solar);
        if(data.lifeforms) this.lifeforms = new PlanetLifeforms(data.lifeforms, data.coords);
    }

    getAmortization(player: Player, ratio: number[]) : Amortization[]{
        let amors = new Array<Amortization>;
        amors.push(this.metal.getAmortization(player, ratio));
        amors.push(this.crystal.getAmortization(player, ratio));
        amors.push(this.deut.getAmortization(player, ratio)); 
        //amors.push(this.lifeforms.getAmortization());
        return amors;
    }

    getCrawlerBonus(): number {
        //TODO
        return 0;
    }

    getLifeformBuildingBonus(resource: string): number {
        //TODO
        return 0;
    }
}

class PlanetLifeforms{
    class: string;
    buildings: LifeformBuilding[];
    techs: LifeformTech[];

    constructor(data: any, coords: string){
        this.class = data.lifeformClass;
        switch(this.class){
            case "mensen":
                break;
            case "rocktal":
                this.buildings.push(new MeditationEnclave(data.buildings.MeditationEnclave, coords))
                break;
            case "mechas":
                break;
            case "kaelesh":
                break;
        }
    }
}