import {FissionReactorGrid} from "../Grids/FissionReactorGrid";
import {Config} from "../Config";
import {latestDM} from "../dataMap";

const HellrageHeatSinkMap: {[x: string]: string} = {
  Water: "water",
  Iron: "iron",
  Redstone: "redstone",
  Quartz: "quartz",
  Obsidian: "obsidian",
  NetherBrick: "nether_brick",
  Glowstone: "glowstone",
  Lapis: "lapis",
  Gold: "gold",
  Prismarine: "prismarine",
  Slime: "slime",
  EndStone: "end_stone",
  Purpur: "purpur",
  Diamond: "diamond",
  Emerald: "emerald",
  Copper: "copper",
  Tin: "tin",
  Lead: "lead",
  Boron: "boron",
  Lithium: "lithium",
  Magnesium: "magnesium",
  Manganese: "manganese",
  Aluminum: "aluminum",
  Silver: "silver",
  Fluorite: "fluorite",
  Villiaumite: "villiaumite",
  Carobbiite: "carobbiite",
  Arsenic: "arsenic",
  Nitrogen: "liquid_nitrogen",
  Helium: "liquid_helium",
  Enderium: "enderium",
  Cryotheum: "cryotheum"
}
const HellrageModeratorMap: {[x: string]: string} = {
  Graphite: "graphite",
  Beryllium: "beryllium",
  HeavyWater: "heavy_water",
}
const HellrageReflectorMap: {[x: string]: string} = {
  "Beryllium-Carbon": "beryllium_carbon",
  "Lead-Steel": "lead_steel",
}
const HellrageShieldMap: {[x: string]: string} = {
  "Boron-Silver": "boron_silver",
}

type HellrageConfig = {
  SaveVersion: {
    Major: number,
    Minor: number,
    Build: number,
    Revision: number,
    MajorRevision: number,
    MinorRevision: number
  },
  Data: {
    HeatSinks: {[x: string]: {X: number, Y: number, Z: number}[]}
    Moderators: {[x: string]: {X: number, Y: number, Z: number}[]}
    Conductors: {X: number, Y: number, Z: number}[]
    Reflectors: {[x: string]: {X: number, Y: number, Z: number}[]}
    FuelCells: {[x: string]: {X: number, Y: number, Z: number}[]}
    Irradiators: {[x: string]: {X: number, Y: number, Z: number}[]}
    NeutronShields: {[x: string]: {X: number, Y: number, Z: number}[]}
    InteriorDimensions: {X: number, Y: number, Z: number}
    CoolantRecipeName: "Water to High Pressure Steam"
    OverallStats: {[x: string]: number}
  }
}

export function getReactorFromHellrageConfig(data: any, config: Config) {
  const d = data as HellrageConfig;
  const r = new FissionReactorGrid(config, {width: d.Data.InteriorDimensions.X, height: d.Data.InteriorDimensions.Y, depth: d.Data.InteriorDimensions.Z}, latestDM.version);

  Object.keys(d.Data.FuelCells).forEach(v => {
    const processed = v.split(";")[0].match(/\[(?<subtype>.*)](?<fueltype>.*)/);

    if (!processed || !processed.groups) throw new Error(`unknown fuel ${v}`);

    const fuelName = processed.groups.fueltype.startsWith("M") ? processed.groups.fueltype : `${processed.groups.fueltype}-${processed.groups.subtype}`;

    const relevantCells = d.Data.FuelCells[v];
    const source = v.split(";")[2].toLowerCase().replace("-", "_");

    relevantCells.forEach(v => {
      r.setCell([v.X-1, v.Y-1, v.Z-1], fuelName, source);
    });
  });

  Object.keys(d.Data.HeatSinks).forEach(v => {
    if (!(v in HellrageHeatSinkMap)) throw new Error(`unknown heatsink ${v}`);
    d.Data.HeatSinks[v].forEach(t => {
      r.setTile([t.X-1, t.Y-1, t.Z-1], "sink", HellrageHeatSinkMap[v]);
    });
  });
  Object.keys(d.Data.Moderators).forEach(v => {
    if (!(v in HellrageModeratorMap)) throw new Error(`unknown moderator ${v}`);
    d.Data.Moderators[v].forEach(t => {
      r.setTile([t.X-1, t.Y-1, t.Z-1], "moderator", HellrageModeratorMap[v]);
    });
  });
  Object.keys(d.Data.Reflectors).forEach(v => {
    if (!(v in HellrageReflectorMap)) throw new Error(`unknown reflector ${v}`);
    d.Data.Reflectors[v].forEach(t => {
      r.setTile([t.X-1, t.Y-1, t.Z-1], "reflector", HellrageReflectorMap[v]);
    });
  });
  Object.keys(d.Data.NeutronShields).forEach(v => {
    if (!(v in HellrageShieldMap)) throw new Error(`unknown shield ${v}`);
    d.Data.NeutronShields[v].forEach(t => {
      r.setTile([t.X-1, t.Y-1, t.Z-1], "shield", HellrageShieldMap[v]);
    });
  });

  Object.keys(d.Data.Irradiators).forEach(v => {
    d.Data.Irradiators[v].forEach(v => {
      r.setTile([v.X-1, v.Y-1, v.Z-1], "irradiator", "irradiator");
    });
  });

  d.Data.Conductors.forEach(v => {
    r.setTile([v.X-1, v.Y-1, v.Z-1], "wall", "wall");
  });

  return r;
}