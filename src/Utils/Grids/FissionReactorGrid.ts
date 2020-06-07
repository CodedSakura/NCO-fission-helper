import {dataMap, latestDM} from "../dataMap";
import {FissionReactorExport, Fuel, FuelCellData, Position} from "../types";
import {Config} from "../Config";

interface Dimensions {
  width: number
  height: number
  depth: number
}

interface GridTile {
  type: string
  tile: string
  id: number
}

export class FissionReactorGrid {
  grid: GridTile[][][] = [];
  neutronSources: {type: string, pos: Position, id: number}[] = [];
  shieldsClosed: boolean = false;
  config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  setSize({width, depth, height}: Dimensions) {
    if ([width, depth, height].some(v => v < this.config.fissionReactor.minSize || v > this.config.fissionReactor.maxSize))
      throw new Error("reactor too small/large");
    const {indicatorOrder} = latestDM.fission;
    this.grid = [];
    for (let y = 0; y < height; y++) {
      this.grid.push([]);
      for (let z = 0; z < depth; z++) {
        this.grid[y].push([]);
        for (let x = 0; x < width; x++) {
          this.grid[y][z].push({type: "air", tile: "air", id: indicatorOrder.indexOf("air")});
        }
      }
    }
  }

  setTile(pos: Position, type: string, tile: string = type) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const {indicatorOrder, components, indicatorBitCount} = latestDM.fission;
    if (indicatorOrder.indexOf(type) < 0) throw new Error(`type '${type}' is not valid`);
    if (components[type].indexOf(tile) < 0) throw new Error(`tile '${tile}' in not valid`);
    if (type === "cell") throw new Error("cells should be added using setCell");
    // FIXME unprime cell
    this.setGridTile(pos, {
      tile: tile, type: type,
      id: indicatorOrder.indexOf(type) | (components[type].indexOf(tile) << indicatorBitCount)
    });
  }
  setCell(pos: Position, fuel: Fuel) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const {fuelTypes, fuelTypeOrder, fuelTypeBitCount} = latestDM.fuel;
    const {indicatorOrder, indicatorBitCount} = latestDM.fission;
    // FIXME unprime cell
    this.setGridTile(pos, {
      type: "cell", tile: fuel.name,
      id: indicatorOrder.indexOf("cell") | ((fuelTypeOrder.indexOf(fuel.type) | (fuelTypes[fuel.type].indexOf(fuel.name) << fuelTypeBitCount)) << indicatorBitCount)
    });
  }

  isPrimed(pos: Position): boolean {
    const prevPrime = this.neutronSources.find(v => v.pos.every((p, i) => p === pos[i]));
    return !!prevPrime;
  }
  prime(pos: Position, neutronSource: string) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const {neutronSourceOrder} = latestDM.fission;
    if (neutronSourceOrder.indexOf(neutronSource) < 0) throw new Error(`invalid neutron source ${neutronSource}`);
    if (this.getGridTile(pos).type !== "cell") throw new Error(`tile @ ${pos} is not cell`);
    // FIXME check for self priming fuels
    const prevPrime = this.neutronSources.find(v => v.pos.every((p, i) => p === pos[i]));
    if (prevPrime) {
      this.neutronSources[this.neutronSources.indexOf(prevPrime)] = {
        pos: pos,
        type: neutronSource,
        id: neutronSourceOrder.indexOf(neutronSource)
      };
    } else {
      this.neutronSources.push({
        pos: pos,
        type: neutronSource,
        id: neutronSourceOrder.indexOf(neutronSource)
      });
    }
  }
  unPrime(pos: Position) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const prevPrime = this.neutronSources.find(v => v.pos.every((p, i) => p === pos[i]));
    if (!prevPrime) throw new Error(`cell @ ${pos} not primed`);
    this.neutronSources.splice(this.neutronSources.indexOf(prevPrime), 1);
  }

  toggleShields() {
    this.shieldsClosed = !this.shieldsClosed;
  }

  private isOutsideGrid([x, y, z]: Position): boolean {
    return x < 0 || y < 0 || z < 0 || y >= this.grid.length || z >= this.grid[y].length || x >= this.grid[y][z].length;
  }

  private getGridTile(pos: Position): GridTile {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    return this.grid[pos[1]][pos[2]][pos[0]];
  }
  private setGridTile(pos: Position, val: GridTile) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    this.grid[pos[1]][pos[2]][pos[0]] = val;
  }

  private getNeighbourCells(pos: Position): {tile: GridTile, pos: Position}[] {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const [x,y,z] = pos;
    const {indicatorOrder} = latestDM.fission;
    return ([[x+1, y, z], [x-1, y, z], [x, y+1, z], [x, y-1, z], [x, y, z+1], [x, y, z-1]] as Position[]).map(pos => {
      if (this.isOutsideGrid(pos)) {
        return {
          tile: {
            id: indicatorOrder.indexOf("wall"),
            tile: "wall",
            type: "wall"
          },
          pos: pos
        };
      } else {
        return {tile: this.getGridTile(pos), pos: pos};
      }
    });
  }

  private analyzeFuelCell(cell: FuelCellData, fuelCells: FuelCellData[]) {
    this.getNeighbourCells(cell.pos).filter(t => t.tile.type === "moderator" || t.tile.type === "shield").forEach(nb => {
      const offset = cell.pos.map((v, i) => nb.pos[i] - v) as Position;
      if (cell.checkedModerators.some(p => p.every((v, i) => v === offset[i])))
        return;
      let pathFlux = 0;
      let moderatorPath = true;
      if (nb.tile.type === "moderators")
        pathFlux += this.config.moderators.find(v => v.name === nb.tile.tile)!.fluxFactor;
      outer: for (let i = 1; i < this.config.fissionReactor.neutronReach+1; i++) {
        const pos = cell.pos.map((v, pi) => v + offset[pi]*i) as Position;
        if (this.isOutsideGrid(pos)) break;
        const tile = this.getGridTile(pos);
        switch (tile.type) {
          case "cell":
            cell.adjacentCells++;
            const nCell = fuelCells.find(v => v.pos.every((v, i) => v === pos[i]))!;
            nCell.flux += pathFlux;
            nCell.checkedModerators.push(offset.map(v => -v) as Position);
            if (nCell.flux > nCell.fuel.criticality) nCell.primed = true;
            break outer;
          case "moderator":
            pathFlux += this.config.moderators.find(v => v.name === tile.tile)!.fluxFactor;
            break;
          case "reflector":
            pathFlux *= 2*this.config.reflectors.find(v => v.name === tile.tile)!.reflectivity;
            cell.adjacentReflectors++;
            break;
          case "shield":
            if (this.shieldsClosed) moderatorPath = false;
            break;
          default:
            moderatorPath = false;
        }
        if (!moderatorPath) break;
      }
      if (moderatorPath) {
        cell.flux += pathFlux;
        cell.checkedModerators.push(offset);
      }
      // console.log(cell);
    });
    cell.calculated = true;
  }

  validate(): {valid: boolean, problems?: string[]} {
    const fuelCells: FuelCellData[] = [];
    this.grid.forEach((pane, y) => pane.forEach((line, z) => line.forEach((tile, x) => {
      if (tile.type !== "cell") return;
      fuelCells.push({
        pos: [x, y, z],
        fuel: this.config.fuels.find(v => v.name === tile.tile)!,
        flux: 0,
        calculated: false,
        primed: false,
        adjacentCells: 0,
        adjacentReflectors: 0,
        hasCasingConnection: false,
        heatMultiplier: 1,
        heatProduction: 0,
        positionalEff: 1,
        checkedModerators: [],
      });
    })));

    fuelCells.filter(cell => cell.fuel.selfPriming || this.isPrimed(cell.pos)).forEach(cell => {
      cell.primed = true;
      this.analyzeFuelCell(cell, fuelCells)
    });
    const maxIterCount = fuelCells.reduce((s, v) => s + (v.primed ? 0 : 1), 1);
    for (let i = 0; i < maxIterCount; i++) {
      fuelCells.filter(v => !v.calculated && v.primed).forEach(c => this.analyzeFuelCell(c, fuelCells));
      if (fuelCells.every(v => v.calculated)) break;
    }

    // TODO: finish validating

    console.log(fuelCells);
    return {valid: true};
  }

  export(): FissionReactorExport {
    const neutronMap: {[x: string]: number} = {};
    this.neutronSources.forEach(v => {
      neutronMap[v.pos.join(",")] = v.id;
    })
    const {indicatorOrder, indicatorBitCount} = latestDM.fission;
    const {fuelTypes, fuelTypeOrder, fuelTypeBitCount, fuelBitCount} = latestDM.fuel;
    return {
      data: this.grid.map((v, y) => v.map((v, z) => v.map((v, x) => {
        if (v.type === "cell") {
          const fuel = this.config.fuels.find(f => f.name === v.tile)!;
          // here lies my chances of writing readable code :'(
          return indicatorOrder.indexOf("cell") | (
            (fuelTypeOrder.indexOf(fuel.type) | (
              (fuelTypes[fuel.type].indexOf(fuel.name) | (
                (neutronMap[[x,y,z].join(",")]
                ) << fuelBitCount)
              ) << fuelTypeBitCount)
            ) << indicatorBitCount);
        }
        return v.id;
      }))),
      dataMap: latestDM.version,
    }
  }

  static import(data: number[][][], config: Config, dataMapVersion: string, _dataMap?: any) {
    if (dataMapVersion !== "custom" && !(dataMapVersion in dataMap))
      throw new Error("unknown dataMap");
    const dm = _dataMap ? _dataMap : dataMap[dataMapVersion];
    const r = new FissionReactorGrid(config);
    for (let y = 0; y < data.length; y++) {
      for (let z = 0; z < data[y].length; z++) {
        for (let x = 0; x < data[y][z].length; x++) {
          //
        }
      }
    }
  }
}

console.log(latestDM);