export class Planet{
    coords: string;
    name: string;
    maxTemp: number;
    crawlers: number;
    satellite: number;
    metal: MetalMine;
    crystal: CrystalMine;
    deut: DeuteriumMine;
    fusion: number;
    solar: number;
    lifeforms: PlanetLifeforms;

    constructor(data: any){
        this.coords = data.coords;
        this.name = data.name;
        this.maxTemp = parseInt(data.maxTemp);
        this.crawlers = parseInt(data.crawlers);
        this.satellite = parseInt(data.satellite);
        this.metal = new MetalMine();
        this.crystal = new CrystalMine();
        this.deut = new DeuteriumMine();
        this.fusion = parseInt(data.fusion);
        this.solar = parseInt(data.solar);
        this.lifeforms = new PlanetLifeforms();
    }
}

class MetalMine{} class CrystalMine{} class DeuteriumMine{} class PlanetLifeforms{}