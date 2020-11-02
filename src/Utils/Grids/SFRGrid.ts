import {dataMap, latestDM} from "../dataMap";
import {Dimensions, FissionReactorExport, GridProblem, Position} from "../types";
import {Config} from "../Config";
import {SFRTile} from "./SFRTile";
import {GenericGrid, PickerData} from "./GenericGrid";

export class SFRGrid extends GenericGrid {
  grid: SFRTile[][][] = [];
  config: Config;
  dataMap: any = latestDM;
  name = "Unnamed Reactor";

  pickerFiles: PickerData[];
  activeFuel: string|undefined;

  constructor(config: Config, size: Dimensions, dataMapVersion: string, _dataMap?: any) {
    super();
    this.config = config;
    if (!dataMapVersion || (dataMapVersion !== "custom" && !(dataMapVersion in dataMap)))
      throw new Error("unknown dataMap");
    this.dataMap = _dataMap ? _dataMap : dataMap[dataMapVersion];
    this.reset(size);
    this.pickerFiles = [
      {filepath: config.air.asset, type: "air", tile: "air"},
      {filepath: config.fuelCell.asset, type: "cell", tile: "cell"},
      ...config.moderators.map(v => ({filepath: v.asset, type: "moderator", tile: v.name})),
      ...config.sinks.map(v => ({filepath: v.asset, type: "sink", tile: v.name})),
      ...config.reflectors.map(v => ({filepath: v.asset, type: "reflector", tile: v.name})),
      ...config.shields.map(v => ({filepath: v.asset, type: "shield", tile: v.name})),
      {filepath: config.fissionWall.asset, type: "wall", tile: "wall"},
    ]
  }

  reset({width, depth, height}: Dimensions) {
    if ([width, depth, height].some(v => v < this.config.fissionReactor.minSize || v > this.config.fissionReactor.maxSize))
      throw new Error("reactor too small/large");
    this.grid = [];
    for (let y = 0; y < height; y++) {
      this.grid.push([]);
      for (let z = 0; z < depth; z++) {
        this.grid[y].push([]);
        for (let x = 0; x < width; x++) {
          this.grid[y][z].push(new SFRTile([x,y,z], this.config, "air"));
        }
      }
    }
  }

  setTile(pos: Position, type: string, tile: string = type) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const {indicatorOrder, components} = this.dataMap.fission;
    if (indicatorOrder.indexOf(type) < 0) throw new Error(`type '${type}' is not valid`);
    if (components[type].indexOf(tile) < 0) throw new Error(`tile '${tile}' in not valid`);
    if (type === "cell") throw new Error("cells should be added using setCell");

    this.setGridTile(pos, new SFRTile(pos, this.config, type, tile));
  }
  setFuelCell(pos: Position, fuelName: string, priming: string) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const {neutronSourceOrder} = this.dataMap.fission;

    const fuel = this.config.fuels.find(v => v.name === fuelName);
    if (!fuel) throw new Error(`unknown fuel ${fuelName}`);

    if (priming === "self") priming = "none";

    if (neutronSourceOrder.indexOf(priming) < 0)
      throw new Error(`no such priming method '${priming}'`);

    this.setGridTile(pos, new SFRTile(pos, this.config, "cell", fuelName, priming));
  }

  //<editor-fold desc="Shields">
  shieldsToggle() {
    this.grid.forEach(v => v.forEach(v => v.forEach(v => {
      if (v.tile.type === "shield") {
        v.tile.open = !v.tile.open;
      }
    })));
  }
  shieldsClose() {
    this.grid.forEach(v => v.forEach(v => v.forEach(v => {
      if (v.tile.type === "shield") {
        v.tile.open = false;
      }
    })));
  }
  shieldsOpen() {
    this.grid.forEach(v => v.forEach(v => v.forEach(v => {
      if (v.tile.type === "shield") {
        v.tile.open = true;
      }
    })));
  }
  //</editor-fold>

  private isOutsideGrid([x, y, z]: Position): boolean {
    return x < 0 || y < 0 || z < 0 || y >= this.grid.length || z >= this.grid[y].length || x >= this.grid[y][z].length;
  }

  private getGridTile(pos: Position): SFRTile {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    return this.grid[pos[1]][pos[2]][pos[0]];
  }
  private setGridTile(pos: Position, val: SFRTile) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    this.grid[pos[1]][pos[2]][pos[0]] = val;
  }

  private analyzeFuelCell(cell: SFRTile.FuelCell, fuelCells: SFRTile.FuelCell[], moderators: SFRTile.Moderator[]) {
    cell.getNeighbours(this.grid).filter(t => t.tile.type === "moderator" || t.tile.type === "shield").forEach(nb => {
      const offset = cell.pos.map((v, i) => nb.tile.pos[i] - v) as Position;
      if (cell.checkedModerators.some(p => p.every((v, i) => v === offset[i])))
        return;
      let pathFlux = 0;
      let moderatorPath = true;
      if (nb.tile.type === "moderator")
        pathFlux += nb.tile.data.fluxFactor;
      outer: for (let i = 1; i < this.config.fissionReactor.neutronReach+1; i++) {
        const pos = cell.pos.map((v, pi) => v + offset[pi]*i) as Position;
        if (this.isOutsideGrid(pos)) break;
        const tile = this.getGridTile(pos);
        switch (tile.tile.type) {
          case "cell":
            cell.adjacentCells++;
            const nCell = fuelCells.find(v => v.pos.every((v, i) => v === pos[i]))!;
            nCell.flux += pathFlux;
            nCell.checkedModerators.push(offset.map(v => -v) as Position);

            const mod = moderators.find(({pos}) => pos.every((v, i) => v === nCell.pos[i] - offset[i]));
            if (!mod || mod.type !== "moderator")
              console.info(`moderator (offset: ${offset.map(v => -v)}) for cell @ ${nCell.pos} not found @ ${nCell.pos.map((v, i) => v - offset[i])}`);
            else
              mod.active = true;

            if (nCell.flux > nCell.fuel.criticality) nCell.primed = true;
            break outer;
          case "moderator":
            pathFlux += tile.tile.data.fluxFactor;
            break;
          case "reflector":
            pathFlux *= 2*tile.tile.data.reflectivity;
            cell.adjacentReflectors++;
            break;
          case "shield":
            if (!tile.tile.open) moderatorPath = false;
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
        if (!mod || mod.type !== "moderator")
          console.info(`moderator (offset: ${offset}) for cell @ ${cell.pos} not found @ ${cell.pos.map((v, i) => v + offset[i])}`);
        else
          mod.active = true;
      }
      // console.log(cell);
    });
    cell.calculated = true;
  }


  validate(): {valid: boolean, problems?: GridProblem[]} {
    const fuelCells: SFRTile.FuelCell[] = [];
    const moderators: SFRTile.Moderator[] = [];
    this.grid.forEach(v => v.forEach(v => v.forEach(v => {
      switch (v.tile.type) {
        case "cell":
          fuelCells.push(v.tile);
          break
        case "moderator":
          moderators.push(v.tile);
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
      if (tile.tile.type !== "sink") return;
      const neighbours = tile.tile.getNeighbours(this.grid);
      tile.tile.data.ruleSet.rules.forEach(rule => {
        const offsets: Position[] = [];
        neighbours.forEach(nCell => {
          switch (rule.relatedComp) {
            // @ts-ignore
            case "moderator":
              if (nCell.tile.type !== "moderator") break;
              if (!nCell.tile.active)
                break;
            /* fallthrough */
            case "wall":
            case "cell":
              if (nCell.tile.type === rule.relatedComp)
                offsets.push([x, y, z].map((c, i) => nCell.tile.pos[i] - c) as Position);
              break;
            default:
              if (nCell.tile.type === rule.relatedComp)
                offsets.push([x, y, z].map((c, i) => nCell.tile.pos[i] - c) as Position);
          }
        });

        if (offsets.length < rule.neededCount) {
          gridProblems.push({pos: [x, y, z], message: `not enough ${rule.relatedComp}s, at least ${rule.neededCount} needed`});
          return;
        }
        if (rule.requireExact && offsets.length !== rule.neededCount) {
          gridProblems.push({pos: [x, y, z], message: `wrong amount of ${rule.relatedComp}s, exactly ${rule.neededCount} needed`});
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
      data: this.grid.map(v => v.map(v => v.map(v => v.tile.getId(this.dataMap)))),
      dataMap: this.dataMap.version,
    }
  }

  getStats(): string[] {
    return [];
  }

  getCellStats(pos: Position): string[] {
    return [];
  }

  pickerSelection(n: number) {
  }

  changeTile(pos: Position, n: number, symmetries: any) {
  }

  setData(name: string, data: string) {
  }

  static import(data: number[][][], config: Config, dataMapVersion: string, _dataMap?: any) {
    if (dataMapVersion !== "custom" && !(dataMapVersion in dataMap))
      throw new Error("unknown dataMap");
    const dm = _dataMap ? _dataMap : dataMap[dataMapVersion];
    const r = new SFRGrid(config, {height: data.length, depth: data[0].length, width: data[0][0].length}, dataMapVersion, _dataMap);
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
            r.setFuelCell([x, y, z], fuelName, priming);
          } else {
            r.setTile([x, y, z], type, dm.fission.components[type][bytes]);
          }
        }
      }
    }
    return r;
  }
}