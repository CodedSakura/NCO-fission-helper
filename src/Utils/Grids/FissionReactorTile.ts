import {Position, Fuel, NeutronSource} from "../types";
import * as types from "../types";
import {Config} from "../Config";

export class FissionReactorTile {
  readonly tile: FissionReactorTile.Tile;

  readonly config: Config;

  constructor(pos: Position, cfg: Config, type: string, addition?: string, priming?: string) {
    if (!["cell","moderator","sink","reflector","shield","irradiator","air","wall"].includes(type))
      throw new Error(`unknown type '${type}'`);

    this.config = cfg;

    const filler: FissionReactorTile.BlankTile = {
      type: type,
      pos: pos,
      getId: this.getId,
      getNeighbours: this.getNeighbours
    };

    switch (type) {
      case "cell":
        const fuel = cfg.fuels.find(v => v.name === addition);
        if (!fuel) throw new FissionReactorTile.AdditionError(type, addition);
        const _priming = cfg.neutronSources.find(v => v.name === priming);
        if (!_priming) throw new FissionReactorTile.PrimingError(_priming);
        this.tile = {
          ...filler,
          type: "cell",

          priming: _priming,
          primed: fuel.selfPriming,
          fuel: fuel,
          cluster: undefined,

          adjacentCells: 0, adjacentReflectors: 0,
          heatMultiplier: 1, heatProduction: 0,
          positionalEff: 1,
          flux: 0,

          calculated: false,
          checkedModerators: []
        };
        break;
      case "moderator":
        const moderator = cfg.moderators.find(v => v.name === addition);
        if (!moderator) throw new FissionReactorTile.AdditionError(type, addition);
        this.tile = {
          ...filler,
          type: "moderator",

          active: false,
          data: moderator
        };
        break;
      case "sink":
        const sink = cfg.sinks.find(v => v.name === addition);
        if (!sink) throw new FissionReactorTile.AdditionError(type, addition);
        this.tile = {
          ...filler,
          type: "sink",

          data: sink,
          cluster: undefined
        };
        break;
      case "reflector":
        const reflector = cfg.reflectors.find(v => v.name === addition);
        if (!reflector) throw new FissionReactorTile.AdditionError(type, addition);
        this.tile = {
          ...filler,
          type: "reflector",

          data: reflector
        };
        break;
      case "irradiator":
        this.tile = {
          ...filler,
          type: "irradiator",

          flux: 0
        };
        break;
      case "shield":
        const shield = cfg.shields.find(v => v.name === addition);
        if (!shield) throw new FissionReactorTile.AdditionError(type, addition);
        this.tile = {
          ...filler,
          type: "shield",

          cluster: undefined,
          open: true,
          data: shield
        };
        break;
      default:
        this.tile = {...filler, type: type as "air"|"wall"};
    }
  }

  private getNeighbours = (grid: FissionReactorTile[][][]): FissionReactorTile[] => {

    const [x,y,z] = this.tile.pos;
    const isOutsideGrid = ([x,y,z]: Position) => x < 0 || y < 0 || z < 0 || y >= grid.length || z >= grid[y].length || x >= grid[y][z].length;
    return ([[x+1, y, z], [x-1, y, z], [x, y+1, z], [x, y-1, z], [x, y, z+1], [x, y, z-1]] as Position[]).map(pos => {
      if (isOutsideGrid(pos)) {
        return new FissionReactorTile(pos, this.config, "wall");
      } else {
        return grid[pos[1]][pos[2]][pos[1]];
      }
    });
  }

  private getId = (dm: any): number => {
    const {fuelTypes, fuelTypeOrder, fuelTypeBitCount, fuelBitCount} = dm.fuel;
    const {indicatorOrder, indicatorBitCount, neutronSourceOrder, components} = dm.fission;

    switch (this.tile.type) {
      case "cell": {
        const {fuel, priming} = (this.tile! as FissionReactorTile.FuelCell);
        return indicatorOrder.indexOf("cell") | (
          (fuelTypeOrder.indexOf(fuel.type) | (
              (fuelTypes[fuel.type].indexOf(fuel.name) | (
                  (priming.name === "self" ? 0 : neutronSourceOrder.indexOf(priming)
                  ) << fuelBitCount)
              ) << fuelTypeBitCount)
          ) << indicatorBitCount);
      }
      case "moderator": {
        const {data} = (this.tile! as FissionReactorTile.Moderator);
        return indicatorOrder.indexOf(this.tile.type) | (components[this.tile.type].indexOf(data.name) << indicatorBitCount);
      }
      case "sink": {
        const {data} = (this.tile! as FissionReactorTile.Sink);
        return indicatorOrder.indexOf(this.tile.type) | (components[this.tile.type].indexOf(data.name) << indicatorBitCount);
      }
      case "reflector": {
        const {data} = (this.tile! as FissionReactorTile.Reflector);
        return indicatorOrder.indexOf(this.tile.type) | (components[this.tile.type].indexOf(data.name) << indicatorBitCount);
      }
      case "shield": {
        const {data} = (this.tile! as FissionReactorTile.Shield);
        return indicatorOrder.indexOf(this.tile.type) | (components[this.tile.type].indexOf(data.name) << indicatorBitCount);
      }
      default: {
        return indicatorOrder.indexOf(this.tile.type);
      }
    }
  }

  static AdditionError = class extends Error {
    constructor(type: string, addition?: string) {
      super(`Did not find ${type} called '${addition}'!`);
    }
  }
  static PrimingError = class extends Error {
    constructor(priming?: string) {
      super(`'${priming}' is not valid priming!`);
    }
  }
}

// eslint-disable-next-line no-redeclare
export declare namespace FissionReactorTile {
  export interface Cluster {
    casingConnection: boolean
    heat: number
  }

  export interface BlankTile {
    type: string
    pos: Position
    getId: (dm: any) => number
    getNeighbours: (grid: FissionReactorTile[][][]) => FissionReactorTile[]
  }

  export interface FuelCell extends BlankTile {
    type: "cell"
    priming: NeutronSource
    primed: boolean
    fuel: Fuel
    cluster?: Cluster

    adjacentCells: number
    adjacentReflectors: number
    heatMultiplier: number
    heatProduction: number
    positionalEff: number
    flux: number

    calculated: boolean
    checkedModerators: Position[]
  }
  export interface Moderator extends BlankTile {
    type: "moderator"
    active: boolean
    data: types.Moderator
  }
  export interface Sink extends BlankTile {
    type: "sink"
    cluster?: Cluster
    data: types.Sink
  }
  export interface Reflector extends BlankTile {
    type: "reflector"
    data: types.Reflector
  }
  export interface Irradiator extends BlankTile {
    type: "irradiator"
    flux: number
  }
  export interface Shield extends BlankTile {
    type: "shield"
    data: types.Shield
    cluster?: Cluster
    open: boolean
  }
  export interface Wall extends BlankTile {
    type: "wall"
  }
  export interface Air extends BlankTile {
    type: "air"
  }

  export type Tile = Wall|Air|FuelCell|Moderator|Sink|Reflector|Irradiator|Shield;
}