import {Fuel, Position, Moderator as ModeratorD, Sink as SinkD} from "../types";

import FuelCell = FRGridTile.FuelCell;
import Moderator = FRGridTile.Moderator;
import Sink = FRGridTile.Sink;

export class FRGridTile {
  readonly tile: string;
  readonly pos: Position;
  readonly priming: string;
  readonly data: undefined|FuelCell|Moderator|Sink;

  constructor(tile: string, addition: string, priming: string, pos: Position) {
    this.tile = tile;
    this.pos = pos;
    this.priming = priming;

    switch (this.tile) {
      default:
        this.data = undefined;
    }
  }
}

// eslint-disable-next-line no-redeclare
export namespace FRGridTile {
  export interface Cluster {
    casingConnection: boolean
  }

  export interface FuelCell {
    adjacentCells: number
    adjacentReflectors: number
    fuel: Fuel
    heatMultiplier: number
    heatProduction: number
    positionalEff: number
    primed: boolean
    flux: number
    cluster: Cluster

    calculated: boolean
    checkedModerators: Position[]
  }
  export interface Moderator {
    active: boolean
    data: ModeratorD
  }
  export interface Sink {
    data: SinkD
    cluster: Cluster
  }
}