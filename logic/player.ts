import { Planet } from './planet.js';

export class Player {
  admiral: boolean;
  allyClass: string;
  commander: boolean;
  engineer: boolean;
  geologist: boolean;
  legerleiding: boolean;
  planets: Planet[];
  playerClass: string;
  technocrat: boolean;
  ratio: number[];
  exporounds: number;
  exposlots: number;

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
  }

  fillPlanets(data: any) {
    this.planets = [];
    data.forEach(planet => {
      this.planets.push(new Planet(planet))
    });
  }
}