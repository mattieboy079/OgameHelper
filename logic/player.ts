class Player {
  admiral: boolean;
  allyClass: string;
  commander: boolean;
  engineer: boolean;
  geologist: boolean;
  legerleiding: boolean;
  planets: Planet[];
  playerClass: string;
  settings: PlayerSettings;
  technocrat: boolean;

  constructor(allyClass: string, playerClass: string, admiral: boolean, commander: boolean, engineer: boolean, geologist: boolean, technocrat: boolean, planets: Planet[], settings: PlayerSettings) {
    this.allyClass = allyClass;
    this.playerClass = playerClass;
    this.planets = planets;
    this.settings = settings;
    this.commander = commander;
    this.admiral = admiral;
    this.engineer = engineer;
    this.geologist = geologist;
    this.technocrat = technocrat;
    this.legerleiding = commander && admiral && engineer && geologist && technocrat;
  }
}