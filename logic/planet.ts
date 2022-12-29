import { LifeformBuilding } from './lifeformbuildings.js';
import { LifeformTech } from './lifeformtechs.js';
import { MetalMine, CrystalMine, DeutMine } from './mines.js';

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
        this.metal = new MetalMine(parseInt(data.metal));
        this.crystal = new CrystalMine(data.crystal);
        this.deut = new DeutMine(data.deut);
        this.fusion = parseInt(data.fusion);
        this.solar = parseInt(data.solar);
        if(data.lifeforms) this.lifeforms = new PlanetLifeforms(data.lifeforms);
    }
}

class PlanetLifeforms{
    class: string;
    buildings: LifeformBuilding[];
    techs: LifeformTech[];

    constructor(data: any){
        this.class = data.lifeformClass;
        switch(this.class){
            case "mensen":
                break;
            case "rocktal":
                this.buildings.push()
                break;
            case "mechas":
                break;
            case "kaelesh":
                break;
        }
    }
}