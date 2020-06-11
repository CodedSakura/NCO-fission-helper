import {Position, Fuel, NeutronSource} from "../types";
import * as types from "../types";
import {Config} from "../Config";

export class FissionReactorTile {
  readonly type: string;
  readonly pos: Position;
  readonly tile: undefined | FissionReactorTile.Tile;

  readonly config: Config;

  constructor(pos: Position, cfg: Config, type: string, addition?: string, priming?: string) {
    this.type = type;
    this.pos = pos;

    this.config = cfg;

    switch (this.type) {
      case "cell":
        const fuel = cfg.fuels.find(v => v.name === addition);
        if (!fuel) throw new FissionReactorTile.AdditionError(type, addition);
        const priming = cfg.neutronSources.find(v => v.name === addition);
        if (!priming) throw new FissionReactorTile.PrimingError(priming);
        this.tile = {
          priming: fuel.selfPriming ? "self" : priming || "none",
          primed: fuel.selfPriming,
          fuel: fuel,
          cluster: undefined,

          adjacentCells: 0, adjacentReflectors: 0,
          heatMultiplier: 1, heatProduction: 0,
          positionalEff: 1,
          flux: 0,

          calculated: false,
          checkedModerators: []
        } as FissionReactorTile.FuelCell;
        break;
      case "moderator":
        const moderator = cfg.moderators.find(v => v.name === addition);
        if (!moderator) throw new FissionReactorTile.AdditionError(type, addition);
        this.tile = {
          active: false,
          data: moderator
        } as FissionReactorTile.Moderator;
        break;
      case "sink":
        const sink = cfg.sinks.find(v => v.name === addition);
        if (!sink) throw new FissionReactorTile.AdditionError(type, addition);
        this.tile = {
          data: sink,
          cluster: undefined
        } as FissionReactorTile.Sink;
        break;
      case "reflector":
        const reflector = cfg.reflectors.find(v => v.name === addition);
        if (!reflector) throw new FissionReactorTile.AdditionError(type, addition);
        this.tile = {
          data: reflector
        } as FissionReactorTile.Reflector;
        break;
      case "irradiator":
        this.tile = {
          flux: 0
        } as FissionReactorTile.Irradiator;
        break;
      case "shield":
        const shield = cfg.shields.find(v => v.name === addition);
        if (!shield) throw new FissionReactorTile.AdditionError(type, addition);
        this.tile = {
          cluster: undefined,
          open: true,
          data: shield
        } as FissionReactorTile.Shield;
        break;
    }
  }

  getNeighbours(grid: FissionReactorTile[][][]): FissionReactorTile[] {
    const [x,y,z] = this.pos;
    const isOutsideGrid = ([x,y,z]: Position) => x < 0 || y < 0 || z < 0 || y >= grid.length || z >= grid[y].length || x >= grid[y][z].length;
    return ([[x+1, y, z], [x-1, y, z], [x, y+1, z], [x, y-1, z], [x, y, z+1], [x, y, z-1]] as Position[]).map(pos => {
      if (isOutsideGrid(pos)) {
        return new FissionReactorTile(pos, this.config, "wall");
      } else {
        return grid[pos[1]][pos[2]][pos[1]];
      }
    });
  }

  getId(dm: any): number {
    const {fuelTypes, fuelTypeOrder, fuelTypeBitCount, fuelBitCount} = dm.fuel;
    const {indicatorOrder, indicatorBitCount, neutronSourceOrder, components} = dm.fission;

    switch (this.type) {
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
        return indicatorOrder.indexOf(this.type) | (components[this.type].indexOf(data.name) << indicatorBitCount);
      }
      case "sink": {
        const {data} = (this.tile! as FissionReactorTile.Sink);
        return indicatorOrder.indexOf(this.type) | (components[this.type].indexOf(data.name) << indicatorBitCount);
      }
      case "reflector": {
        const {data} = (this.tile! as FissionReactorTile.Reflector);
        return indicatorOrder.indexOf(this.type) | (components[this.type].indexOf(data.name) << indicatorBitCount);
      }
      case "shield": {
        const {data} = (this.tile! as FissionReactorTile.Shield);
        return indicatorOrder.indexOf(this.type) | (components[this.type].indexOf(data.name) << indicatorBitCount);
      }
      default: {
        return indicatorOrder.indexOf(this.type);
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
export namespace FissionReactorTile {
  export interface Cluster {
    casingConnection: boolean
    heat: number
  }

  export interface FuelCell {
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
  export interface Moderator {
    active: boolean
    data: types.Moderator
  }
  export interface Sink {
    cluster?: Cluster
    data: types.Sink
  }
  export interface Reflector {
    data: types.Reflector
  }
  export interface Irradiator {
    flux: number
  }
  export interface Shield {
    data: types.Shield
    cluster?: Cluster
    open: boolean
  }

  export type Tile = FuelCell|Moderator|Sink|Reflector|Irradiator|Shield;
}