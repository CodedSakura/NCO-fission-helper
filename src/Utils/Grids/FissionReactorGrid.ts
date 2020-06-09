import {dataMap, latestDM} from "../dataMap";
import {FissionReactorExport, FuelCellData, GridProblem, ModeratorData, Position} from "../types";
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
  priming: string
}

export class FissionReactorGrid {
  grid: GridTile[][][] = [];
  shieldsClosed: boolean = false;
  config: Config;
  dataMap: any = latestDM;

  constructor(config: Config, dataMapVersion?: string, _dataMap?: any) {
    this.config = config;
    if (!dataMapVersion) return;
    if (dataMapVersion !== "custom" && !(dataMapVersion in dataMap))
      throw new Error("unknown dataMap");
    this.dataMap = _dataMap ? _dataMap : dataMap[dataMapVersion];
  }

  setSize({width, depth, height}: Dimensions) {
    if ([width, depth, height].some(v => v < this.config.fissionReactor.minSize || v > this.config.fissionReactor.maxSize))
      throw new Error("reactor too small/large");
    const {indicatorOrder} = this.dataMap.fission;
    this.grid = [];
    for (let y = 0; y < height; y++) {
      this.grid.push([]);
      for (let z = 0; z < depth; z++) {
        this.grid[y].push([]);
        for (let x = 0; x < width; x++) {
          this.grid[y][z].push({type: "air", tile: "air", id: indicatorOrder.indexOf("air"), priming: "none"});
        }
      }
    }
  }

  setTile(pos: Position, type: string, tile: string = type) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const {indicatorOrder, components, indicatorBitCount} = this.dataMap.fission;
    if (indicatorOrder.indexOf(type) < 0) throw new Error(`type '${type}' is not valid`);
    if (components[type].indexOf(tile) < 0) throw new Error(`tile '${tile}' in not valid`);
    if (type === "cell") throw new Error("cells should be added using setCell");

    this.setGridTile(pos, {
      tile: tile, type: type, priming: "none",
      id: indicatorOrder.indexOf(type) | (components[type].indexOf(tile) << indicatorBitCount),
    });
  }
  setCell(pos: Position, fuelName: string, priming: string) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const {fuelTypes, fuelTypeOrder, fuelTypeBitCount, fuelBitCount} = this.dataMap.fuel;
    const {indicatorOrder, indicatorBitCount, neutronSourceOrder} = this.dataMap.fission;

    const fuel = this.config.fuels.find(v => v.name === fuelName);
    if (!fuel) throw new Error(`unknown fuel ${fuelName}`);

    if (neutronSourceOrder.indexOf(priming) < 0)
      throw new Error(`no such priming method '${priming}'`);

    this.setGridTile(pos, {
      type: "cell", tile: fuelName, priming: priming,
      id: indicatorOrder.indexOf("cell") | (
        (fuelTypeOrder.indexOf(fuel.type) | (
            (fuelTypes[fuel.type].indexOf(fuel.name) | (
                (neutronSourceOrder.indexOf(priming)
                ) << fuelBitCount)
            ) << fuelTypeBitCount)
        ) << indicatorBitCount)
    });
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
    const {indicatorOrder} = this.dataMap.fission;
    return ([[x+1, y, z], [x-1, y, z], [x, y+1, z], [x, y-1, z], [x, y, z+1], [x, y, z-1]] as Position[]).map(pos => {
      if (this.isOutsideGrid(pos)) {
        return {
          tile: {
            id: indicatorOrder.indexOf("wall"),
            tile: "wall",
            type: "wall",
            priming: "none",
          },
          pos: pos
        };
      } else {
        return {tile: this.getGridTile(pos), pos: pos};
      }
    });
  }

  private analyzeFuelCell(cell: FuelCellData, fuelCells: FuelCellData[], moderators: ModeratorData[]) {
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

            const mod = moderators.find(({pos}) => pos.every((v, i) => v === nCell.pos[i] - offset[i]));
            if (!mod) console.info(`moderator (offset: ${offset.map(v => -v)}) for cell @ ${nCell.pos} not found @ ${nCell.pos.map((v, i) => v - offset[i])}`);
            else mod.active = true;

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
          case "irradiator":
            break;
          default:
            moderatorPath = false;
        }
        if (!moderatorPath) break;
      }
      if (moderatorPath) {
        cell.flux += pathFlux;
        cell.checkedModerators.push(offset);

        const mod = moderators.find(({pos}) => pos.every((v, i) => v === cell.pos[i] + offset[i]));
        if (!mod) console.info(`moderator (offset: ${offset}) for cell @ ${cell.pos} not found @ ${cell.pos.map((v, i) => v + offset[i])}`);
        else mod.active = true;
      }
      // console.log(cell);
    });
    cell.calculated = true;
  }

  validate(): {valid: boolean, problems?: GridProblem[]} {
    const fuelCells: FuelCellData[] = [];
    const moderators: ModeratorData[] = [];
    this.grid.forEach((pane, y) => pane.forEach((line, z) => line.forEach((tile, x) => {
      switch (tile.type) {
        case "cell":
          const fuel = this.config.fuels.find(v => v.name === tile.tile)!;
          fuelCells.push({
            pos: [x, y, z],
            fuel: fuel,
            flux: 0,
            calculated: false,
            primed: tile.priming !== "none" || fuel.selfPriming,
            adjacentCells: 0,
            adjacentReflectors: 0,
            hasCasingConnection: false,
            heatMultiplier: 1,
            heatProduction: 0,
            positionalEff: 1,
            checkedModerators: [],
          });
          break;
        case "moderator":
          moderators.push({
            active: false,
            pos: [x, y, z],
            type: tile.tile
          });
          break;
      }
    })));

    const maxIterCount = fuelCells.reduce((s, v) => s + (v.primed ? 0 : 1), 1);
    for (let i = 0; i < maxIterCount; i++) {
      fuelCells.filter(v => !v.calculated && v.primed).forEach(c => this.analyzeFuelCell(c, fuelCells, moderators));
      if (fuelCells.every(v => v.calculated)) break;
    }

    const gridProblems: GridProblem[] = [];

    this.grid.forEach((v, y) => v.forEach((v, z) => v.forEach((tile, x) => {
      if (tile.type !== "sink") return;
      const ruleset = this.config.sinks.find(v => v.name === tile.tile)!.ruleSet;
      const neighbours = this.getNeighbourCells([x,y,z]);
      ruleset.forEach(rule => {
        const offsets: Position[] = [];
        neighbours.forEach(nCell => {
          switch (rule.relatedComp) {
            case "moderator":
              if (nCell.tile.type !== "moderator") break;
              if (!moderators.find(v => v.pos.every((p, i) => p === nCell.pos[i]))!.active)
                break;
              // fallthrough
            case "wall":
            case "cell":
              if (nCell.tile.type === rule.relatedComp)
                offsets.push([x, y, z].map((c, i) => nCell.pos[i] - c) as Position);
              break;
            default:
              if (nCell.tile.tile === rule.relatedComp)
                offsets.push([x, y, z].map((c, i) => nCell.pos[i] - c) as Position);
          }
        });

        if (offsets.length < rule.neededCount) {
          gridProblems.push({pos: [x,y,z], message: `not enough ${rule.relatedComp}s, at least ${rule.neededCount} needed`});
          return;
        }
        if (rule.requireExact && offsets.length !== rule.neededCount) {
          gridProblems.push({pos: [x,y,z], message: `wrong amount of ${rule.relatedComp}s, exactly ${rule.neededCount} needed`});
          return;
        }
        if (rule.axial) {
          // offsets.some(a => offsets.map());
          // TODO
        }
      });
    })));

    // TODO: finish validating

    console.log(fuelCells, moderators);
    return {valid: gridProblems.length === 0, ...{problems: gridProblems.length ? gridProblems : undefined}};
  }

  export(): FissionReactorExport {
    return {
      data: this.grid.map(v => v.map(v => v.map(v => v.id))),
      dataMap: this.dataMap.version,
    }
  }

  static import(data: number[][][], config: Config, dataMapVersion: string, _dataMap?: any) {
    if (dataMapVersion !== "custom" && !(dataMapVersion in dataMap))
      throw new Error("unknown dataMap");
    const dm = _dataMap ? _dataMap : dataMap[dataMapVersion];
    const r = new FissionReactorGrid(config, dataMapVersion, _dataMap);
    r.setSize({height: data.length, depth: data[0].length, width: data[0][0].length});
    for (let y = 0; y < data.length; y++) {
      for (let z = 0; z < data[y].length; z++) {
        for (let x = 0; x < data[y][z].length; x++) {
          let bytes = data[y][z][x];
          const type = dm.fission.indicatorOrder[bytes & ((1 << dm.fission.indicatorBitCount) - 1)];
          bytes >>= dm.fission.indicatorBitCount;
          if (!type) throw new Error("unknown type")
          if (type === "cell") {
            const fuelType = dm.fuel.fuelTypeOrder[bytes & ((1 << dm.fuel.fuelTypeBitCount) - 1)];
            bytes >>= dm.fuel.fuelTypeBitCount;
            const fuelName = dm.fuel.fuelTypes[fuelType][bytes & ((1 << dm.fuel.fuelBitCount) - 1)];
            bytes >>= dm.fuel.fuelBitCount;
            const priming = dm.fission.neutronSourceOrder[bytes];
            r.setCell([x, y, z], fuelName, priming);
          } else {
            r.setTile([x, y, z], type, dm.fission.components[type][bytes]);
          }
        }
      }
    }
    return r;
  }
}