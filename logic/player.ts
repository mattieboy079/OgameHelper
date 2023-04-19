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
  
  
}