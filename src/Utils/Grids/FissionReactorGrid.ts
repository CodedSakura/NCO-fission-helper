import {dataMap, latestDM} from "../dataMap";
import {FissionReactorExport, GridProblem, Position} from "../types";
import {Config} from "../Config";
import {FissionReactorTile} from "./FissionReactorTile";

interface Dimensions {
  width: number
  height: number
  depth: number
}

export class FissionReactorGrid {
  grid: FissionReactorTile[][][] = [];
  config: Config;
  dataMap: any = latestDM;

  constructor(config: Config, size: Dimensions, dataMapVersion?: string, _dataMap?: any) {
    this.config = config;
    if (!dataMapVersion) return;
    if (dataMapVersion !== "custom" && !(dataMapVersion in dataMap))
      throw new Error("unknown dataMap");
    this.dataMap = _dataMap ? _dataMap : dataMap[dataMapVersion];
    this.setSize(size);
  }

  setSize({width, depth, height}: Dimensions) {
    if ([width, depth, height].some(v => v < this.config.fissionReactor.minSize || v > this.config.fissionReactor.maxSize))
      throw new Error("reactor too small/large");
    this.grid = [];
    for (let y = 0; y < height; y++) {
      this.grid.push([]);
      for (let z = 0; z < depth; z++) {
        this.grid[y].push([]);
        for (let x = 0; x < width; x++) {
          this.grid[y][z].push(new FissionReactorTile([x,y,z], this.config, "air"));
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

    this.setGridTile(pos, new FissionReactorTile(pos, this.config, type, tile));
  }
  setCell(pos: Position, fuelName: string, priming: string) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    const {neutronSourceOrder} = this.dataMap.fission;

    const fuel = this.config.fuels.find(v => v.name === fuelName);
    if (!fuel) throw new Error(`unknown fuel ${fuelName}`);

    if (neutronSourceOrder.indexOf(priming) < 0)
      throw new Error(`no such priming method '${priming}'`);

    this.setGridTile(pos, new FissionReactorTile(pos, this.config, "cell", fuelName, priming));
  }

  shieldsToggle() {
    this.grid.forEach(v => v.forEach(v => v.forEach(v => {
      if (v.type === "shield") {
        const shield = v.tile as FissionReactorTile.Shield;
        shield.open = !shield.open;
      }
    })));
  }
  shieldsClose() {
    this.grid.forEach(v => v.forEach(v => v.forEach(v => {
      if (v.type === "shield") {
        (v.tile as FissionReactorTile.Shield).open = false;
      }
    })));
  }
  shieldsOpen() {
    this.grid.forEach(v => v.forEach(v => v.forEach(v => {
      if (v.type === "shield") {
        (v.tile as FissionReactorTile.Shield).open = true;
      }
    })));
  }

  private isOutsideGrid([x, y, z]: Position): boolean {
    return x < 0 || y < 0 || z < 0 || y >= this.grid.length || z >= this.grid[y].length || x >= this.grid[y][z].length;
  }

  private getGridTile(pos: Position): FissionReactorTile {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    return this.grid[pos[1]][pos[2]][pos[0]];
  }
  private setGridTile(pos: Position, val: FissionReactorTile) {
    if (this.isOutsideGrid(pos)) throw new Error("coordinates outside grid");
    this.grid[pos[1]][pos[2]][pos[0]] = val;
  }

  private analyzeFuelCell(cell: FissionReactorTile, fuelCells: FissionReactorTile[], moderators: FissionReactorTile[]) {
    const data = cell.tile as FissionReactorTile.FuelCell;
    cell.getNeighbours(this.grid).filter(t => t.type === "moderator" || t.type === "shield").forEach(nb => {
      const offset = cell.pos.map((v, i) => nb.pos[i] - v) as Position;
      if (data.checkedModerators.some(p => p.every((v, i) => v === offset[i])))
        return;
      let pathFlux = 0;
      let moderatorPath = true;
      if (nb.type === "moderators")
        pathFlux += (nb.tile as FissionReactorTile.Moderator).data.fluxFactor;
      outer: for (let i = 1; i < this.config.fissionReactor.neutronReach+1; i++) {
        const pos = cell.pos.map((v, pi) => v + offset[pi]*i) as Position;
        if (this.isOutsideGrid(pos)) break;
        const tile = this.getGridTile(pos);
        switch (tile.type) {
          case "cell":
            data.adjacentCells++;
            const nCell = fuelCells.find(v => v.pos.every((v, i) => v === pos[i]))!;
            const nData = cell.tile as FissionReactorTile.FuelCell;
            nData.flux += pathFlux;
            nData.checkedModerators.push(offset.map(v => -v) as Position);

            const mod = moderators.find(({pos}) => pos.every((v, i) => v === nCell.pos[i] - offset[i]));
            if (!mod) console.info(`moderator (offset: ${offset.map(v => -v)}) for cell @ ${nCell.pos} not found @ ${nCell.pos.map((v, i) => v - offset[i])}`);
            else (mod.tile as FissionReactorTile.Moderator).active = true;

            if (nData.flux > nData.fuel.criticality) nData.primed = true;
            break outer;
          case "moderator":
            pathFlux += (tile.tile as FissionReactorTile.Moderator).data.fluxFactor;
            break;
          case "reflector":
            pathFlux *= 2*(tile.tile as FissionReactorTile.Reflector).data.reflectivity;
            data.adjacentReflectors++;
            break;
          case "shield":
            if (!(tile.tile as FissionReactorTile.Shield).open) moderatorPath = false;
            break;
          case "irradiator":
            break;
          default:
            moderatorPath = false;
        }
        if (!moderatorPath) break;
      }
      if (moderatorPath) {
        data.flux += pathFlux;
        data.checkedModerators.push(offset);

        const mod = moderators.find(({pos}) => pos.every((v, i) => v === cell.pos[i] + offset[i]));
        if (!mod) console.info(`moderator (offset: ${offset}) for cell @ ${cell.pos} not found @ ${cell.pos.map((v, i) => v + offset[i])}`);
        else (mod.tile as FissionReactorTile.Moderator).active = true;
      }
      // console.log(cell);
    });
    data.calculated = true;
  }


  validate(): {valid: boolean, problems?: GridProblem[]} {
    const fuelCells: FissionReactorTile[] = [];
    const moderators: FissionReactorTile[] = [];
    this.grid.forEach(v => v.forEach(v => v.forEach(v => {
      switch (v.type) {
        case "cell":
          fuelCells.push(v);
          break
        case "moderator":
          moderators.push(v);
          break;
      }
    })));

    const maxIterCount = fuelCells.reduce((s, v) => s + ((v.tile as FissionReactorTile.FuelCell).primed ? 0 : 1), 1);
    for (let i = 0; i < maxIterCount; i++) {
      fuelCells.filter(v => !(v.tile as FissionReactorTile.FuelCell).calculated && (v.tile as FissionReactorTile.FuelCell).primed).forEach(c => this.analyzeFuelCell(c, fuelCells, moderators));
      if (fuelCells.every(v => (v.tile as FissionReactorTile.FuelCell).calculated)) break;
    }

    const gridProblems: GridProblem[] = [];

    this.grid.forEach((v, y) => v.forEach((v, z) => v.forEach((tile, x) => {
      if (tile.type !== "sink") return;
      const ruleset = (tile.tile as FissionReactorTile.Sink).data.ruleSet;
      const neighbours = tile.getNeighbours(this.grid);
      ruleset.forEach(rule => {
        const offsets: Position[] = [];
        neighbours.forEach(nCell => {
          switch (rule.relatedComp) {
            case "moderator":
              if (nCell.type !== "moderator") break;
              if (!(nCell.tile as FissionReactorTile.Moderator).active)
                break;
            // fallthrough
            case "wall":
            case "cell":
              if (nCell.type === rule.relatedComp)
                offsets.push([x, y, z].map((c, i) => nCell.pos[i] - c) as Position);
              break;
            default:
              if (nCell.type === rule.relatedComp)
                offsets.push([x, y, z].map((c, i) => nCell.pos[i] - c) as Position);
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
      data: this.grid.map(v => v.map(v => v.map(v => v.getId(this.dataMap)))),
      dataMap: this.dataMap.version,
    }
  }

  static import(data: number[][][], config: Config, dataMapVersion: string, _dataMap?: any) {
    if (dataMapVersion !== "custom" && !(dataMapVersion in dataMap))
      throw new Error("unknown dataMap");
    const dm = _dataMap ? _dataMap : dataMap[dataMapVersion];
    const r = new FissionReactorGrid(config, {height: data.length, depth: data[0].length, width: data[0][0].length}, dataMapVersion, _dataMap);
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