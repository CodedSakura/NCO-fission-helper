import {
  Blade,
  Coil,
  CoilRule,
  FissionReactorConfig,
  Fuel, GenericComponent,
  Moderator,
  NeutronSource,
  Reflector,
  Shield,
  Sink,
  SinkRule,
  SinkRuleSet,
  Steam,
  TurbineConfig
} from "./types";
import {dataMap} from "./dataMap";
import {getAsset} from "./utils";

const numberMap = {
  "zero": 0,
  "one": 1,
  "two": 2,
  "three": 3,
  "four": 4,
  "five": 5,
  "six": 6,
}
function parseSinkRule(input: string): SinkRuleSet {
  const out: SinkRuleSet = {
    rules: [],
    var: input.includes("&&") ? "&&" : "||",
  };
  out.rules = input.split(out.var).map(v => {
    const o: Partial<SinkRule> = {
      requireExact: v.includes("exactly"),
      axial: v.includes("axial")
    }
    v.trim().split(" ").forEach(v => {
      if (v === "exactly" || v === "axial") return;
      if (numberMap.hasOwnProperty(v)) {
        // @ts-ignore
        o.neededCount = numberMap[v];
        return;
      }
      if (v === "sink" || v === "sinks") return;
      if (v === "casing" || v === "casings") o.relatedComp = "wall";
      else if (v === "cell" || v === "cells") o.relatedComp = "cell";
      else if (v === "moderator" || v === "moderators") o.relatedComp = "moderator";
      else if (v === "reflector" || v === "reflectors") o.relatedComp = "reflector";
      else o.relatedComp = v;
    });
    return o as SinkRule;
  });
  return out;
}

export class Config {
  static defaultCoilRules: {[x: string]: CoilRule[]} = {
    "magnesium": [{relatedComp: "bearing", neededCount: 1}],
    "beryllium": [{relatedComp: "magnesium", neededCount: 1}],
    "aluminum": [{relatedComp: "magnesium", neededCount: 2}],
    "gold": [{relatedComp: "aluminum", neededCount: 1}],
    "copper": [{relatedComp: "beryllium", neededCount: 1}],
    "silver": [{relatedComp: "gold", neededCount: 1}, {relatedComp: "copper", neededCount: 1}],
  };
  
  air: GenericComponent = {name: "air", asset: getAsset("/air.png")};

  sinks: Sink[] = [];
  moderators: Moderator[] = [];
  shields: Shield[] = [];
  reflectors: Reflector[] = [];
  fuels: Fuel[] = [];
  neutronSources: NeutronSource[] = [
    {efficiency: 0, name: "none"},
    {efficiency: 1, name: "self"}
  ];
  fissionWall: GenericComponent = {name: "wall", asset: getAsset("/fission/wall.png")};
  irradiator: GenericComponent = {name: "irradiator", asset: getAsset("/fission/irradiator.png")};
  fuelCell: GenericComponent = {name: "cell", asset: getAsset("/fission/cell.png")};

  blades: Blade[] = [];
  coils: Coil[] = [];
  steam: Steam[] = [];

  fissionReactor: FissionReactorConfig;
  turbine: TurbineConfig;

  constructor(text: string, dataMapVersion: string, _dataMap?: any) {
    if (dataMapVersion !== "custom" && !(dataMapVersion in dataMap))
      throw new Error("unknown dataMap");
    const dm = _dataMap ? _dataMap : dataMap[dataMapVersion];
    const {fissionReactor, turbine} = this.populateConfig(this.parseRawConfig(text), dm);
    this.fissionReactor = fissionReactor;
    this.turbine = turbine;
  }

  private parseRawConfig(text: string) {
    let usefulData = text.split("\n").map(v => v.trim()).filter(v => v && !v.startsWith("#"));
    let out: any = {};
    let category: string|undefined;
    let array: string|undefined;
    let arrayType: string = "S";
    usefulData.forEach(v => {
      if (v.endsWith(" {")) {
        v = v.substring(0, v.length-2)
        if (category !== undefined) throw new Error("category is not undefined");
        category = v;
        out[category] = {};
      }
      else if (v === "}") category = undefined;
      else if (v.endsWith(" <")) {
        arrayType = v[0];
        v = v.substring(2, v.length-2)
        if (category === undefined) throw new Error("category is undefined");
        array = v;
        out[category][array] = [];
      }
      else if (v === ">") array = undefined;
      else if (v.match("[A-Z]:.*")) {
        if (category === undefined) throw new Error("category is undefined");
        let prefix = v[0];
        v = v.substring(2);
        const [name, value] = v.split("=", 2);
        switch (prefix) {
          case "B":
            out[category][name] = value === "true";
            break;
          case "D":
            out[category][name] = parseFloat(value);
            break;
          case "I":
            out[category][name] = parseInt(value);
            break;
          case "S":
            out[category][name] = value;
            break;
          default:
            console.log(v);
            throw new Error(`unknown type '${prefix}'`);
        }
      } else if (array) {
        if (category === undefined) throw new Error("category is undefined");
        switch (arrayType) {
          case "B":
            out[category][array].push(v === "true");
            break;
          case "D":
            out[category][array].push(parseFloat(v));
            break;
          case "I":
            out[category][array].push(parseInt(v));
            break;
          case "S":
            out[category][array].push(v);
            break;
          default:
            console.log(v);
            throw new Error(`unknown array type '${arrayType}'`);
        }
      }
      else throw new Error(`unknown config operation "${v}"`);
    });
    return out;
  }

  private populateConfig(rawConf: any, dm: any) {
    if (!this.isValidOverhaul(rawConf)) throw new Error("Config is not Overhaul!");

    dm.fission.components.sink.forEach((v: string, i: number) => {
      this.sinks.push({
        name: v,
        asset: getAsset(`/fission/sink/${v}.png`),
        ruleSet: parseSinkRule(rawConf["fission"][dm.configs.fission.sinkRule][i]),
        cooling: rawConf["fission"][dm.configs.fission.sinkCooling][i],
      });
    });
    dm.fission.components.moderator.forEach((v: string, i: number) => {
      this.moderators.push({
        name: v,
        asset: getAsset(`/fission/moderator/${v}.png`),
        efficiency: rawConf["fission"][dm.configs.fission.moderatorEfficiency][i],
        fluxFactor: rawConf["fission"][dm.configs.fission.moderatorFluxFactor][i],
      });
    });
    dm.fission.components.shield.forEach((v: string, i: number) => {
      this.shields.push({
        name: v,
        asset: getAsset(`/fission/shield/${v}.png`),
        efficiency: rawConf["fission"][dm.configs.fission.shieldEfficiency][i],
        heatPerFlux: rawConf["fission"][dm.configs.fission.shieldHeatPerFlux][i],
      });
    });
    dm.fission.components.reflector.forEach((v: string, i: number) => {
      this.reflectors.push({
        name: v,
        asset: getAsset(`/fission/reflector/${v}.png`),
        efficiency: rawConf["fission"][dm.configs.fission.reflectorEfficiency][i],
        reflectivity: rawConf["fission"][dm.configs.fission.reflectorReflectivity][i],
      });
    });
    dm.fission.neutronSourceOrder.forEach((v: string, i: number) => {
      this.neutronSources.push({
        name: v,
        efficiency: rawConf["fission"][dm.configs.fission.sourceEfficiency][i],
      });
    });
    dm.fuel.fuelTypeOrder.forEach((f: string) => {
      dm.fuel.fuelTypes[f].forEach((v: string, i: number) => {
        this.fuels.push({
          name: v,
          type: f,
          burnTime: rawConf["fission"][dm.configs.fission.fuelConfigPatterns.fuelTime.replace("{name}", f)][i],
          criticality: rawConf["fission"][dm.configs.fission.fuelConfigPatterns.criticality.replace("{name}", f)][i],
          efficiency: rawConf["fission"][dm.configs.fission.fuelConfigPatterns.efficiency.replace("{name}", f)][i],
          heat: rawConf["fission"][dm.configs.fission.fuelConfigPatterns.heatGeneration.replace("{name}", f)][i],
          radiation: rawConf["fission"][dm.configs.fission.fuelConfigPatterns.radiation.replace("{name}", f)][i],
          selfPriming: rawConf["fission"][dm.configs.fission.fuelConfigPatterns.selfPriming.replace("{name}", f)][i],
        });
      });
    });

    dm.turbine.blade.bladeOrder.forEach((v: string, i: number) => {
      this.blades.push({
        name: v,
        asset: getAsset(`/turbine/rotor_blade/${v}.png`),
        efficiency: rawConf["turbine"][dm.configs.turbine.bladeEfficiency][i],
        expansion: rawConf["turbine"][dm.configs.turbine.bladeExpansion][i],
        stator: false
      });
    });
    this.blades.push({
      name: "stator",
      asset: getAsset(`/turbine/rotor_blade/stator.png`),
      stator: true,
      efficiency: 0,
      expansion: rawConf["turbine"][dm.configs.turbine.statorExpansion],
    })
    dm.turbine.coil.components.coil.forEach((v: string, i: number) => {
      this.coils.push({
        name: v,
        asset: getAsset(`/turbine/dynamo_coil/${v}.png`),
        conductivity: rawConf["turbine"][dm.configs.turbine.coilConductivity][i],
        ruleSet: Config.defaultCoilRules[v],
      });
    });
    dm.turbine.blade.steamOrder.forEach((v: string, i: number) => {
      this.steam.push({
        name: v,
        powerPerMb: rawConf["turbine"][dm.configs.turbine.powerPerMb][i],
        expansion: rawConf["turbine"][dm.configs.turbine.expansionLevel][i],
      });
    });

    return {
      fissionReactor: {
        fuelTimeMultiplier: rawConf["fission"][dm.configs.fission.fuelTimeMultiplier],
        coolingEfficiencyLeniency: rawConf["fission"][dm.configs.fission.coolingEfficiencyLeniency],
        neutronReach: rawConf["fission"][dm.configs.fission.neutronReach],
        maxSize: rawConf["fission"][dm.configs.fission.maxSize],
        minSize: rawConf["fission"][dm.configs.fission.minSize],
        canOverheat: rawConf["fission"][dm.configs.fission.canOverheat],
        sparsityPenaltyParams: rawConf["fission"][dm.configs.fission.sparsityPenaltyParams],
      }, turbine: {
        minSize: rawConf["turbine"][dm.configs.turbine.minSize],
        maxSize: rawConf["turbine"][dm.configs.turbine.maxSize],
        tensionThroughputFactor: rawConf["turbine"][dm.configs.turbine.tensionThroughputFactor],
        throughputEfficiencyLeniency: rawConf["turbine"][dm.configs.turbine.throughputEfficiencyLeniency],
        mbPerBlade: rawConf["turbine"][dm.configs.turbine.mbPerBlade],
      }
    }
  }

  isValidOverhaul(rawConf: any): boolean {
    return typeof rawConf === "object" &&
      rawConf.hasOwnProperty("fission") && typeof rawConf["fission"] === "object" &&
      rawConf["fission"].hasOwnProperty("fission_sink_cooling_rate") && Array.isArray(rawConf["fission"]["fission_sink_cooling_rate"]);
  }

}