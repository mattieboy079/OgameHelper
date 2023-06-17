import { Amortization } from './amortization.js';
import { Planet } from './planet.js';
import { Astrophysics, PlasmaTechnology } from './researches.js';

export class Player {
  allyClass: string;
  playerClass: string;
  commander: boolean;
  admiral: boolean;
  engineer: boolean;
  geologist: boolean;
  technocrat: boolean;
  legerleiding: boolean;
  ratio: number[];
  exporounds: number;
  exposlots: number;
  planets: Planet[];
  astro: Astrophysics;
  plasma: PlasmaTechnology;

  constructor(data: any) {
    this.allyClass = data.allyClass ?? "-";
    this.playerClass = data.playerClass ?? "-";
    this.commander = data.commander ?? false;
    this.admiral = data.admiral ?? false;
    this.engineer = data.engineer ?? false;
    this.geologist = data.geologist ?? false;
    this.technocrat = data.technocrat ?? false;
    this.legerleiding = this.commander && this.admiral && this.engineer && this.geologist && this.technocrat;
    this.ratio = data.ratio ? data.ratio.map(Number) : [3,2,1];
    this.exporounds = parseFloat(data.exporounds ?? 0);
    this.exposlots = parseInt(data.exposlots ?? 0);
    this.fillPlanets(data.planets);
    this.astro = new Astrophysics(data.astro ?? 0);
    this.plasma = new PlasmaTechnology(data.plasma ?? 0);
  }

  fillPlanets(data: any) {
    this.planets = [];
    data.forEach(planet => {
      this.planets.push(new Planet(planet))
    });
  }
  
  getAmortizationList(): Amortization[] {
    let amors: Amortization[] = new Array<Amortization>;

    this.planets.forEach(planet => {
      planet.getAmortization(this, this.ratio).forEach(amor => amors.push(amor));
    });

    return amors;
  }

  getPlanet(coords: string): Planet | undefined{
    return this.planets.find(p => p.coords === coords)
  }

  getPlayerProductionBonus(): number {
    return this.legerleiding ? 0.12 : this.geologist ? 0.02 : 0;
  }

  getLifeformTechnologyBonus(type: string): number {
    //TODO: 
    return 0;
  }
}