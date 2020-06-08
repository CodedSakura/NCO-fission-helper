import {Blade, Coil, CoilRule, FissionReactorConfig, Fuel, Moderator, NeutronSource, Reflector, Shield, Sink, SinkRule, Steam, TurbineConfig} from "./types";
import {dataMap, latestDM} from "./dataMap";

export class Config {
  static defaultSinkRules: {[x: string]: SinkRule[]} = {
    "water": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "cell"}],
    "iron": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "moderator"}],
    "redstone": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "cell"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "moderator"}],
    "quartz": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "redstone"}],
    "obsidian": [{axial: true, neededCount: 2, requireExact: false, relatedComp: "glowstone"}],
    "nether_brick": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "obsidian"}],
    "glowstone": [{axial: false, neededCount: 2, requireExact: false, relatedComp: "moderator"}],
    "lapis": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "cell"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "wall"}],
    "gold": [{axial: false, neededCount: 2, requireExact: true, relatedComp: "iron"}],
    "prismarine": [{axial: false, neededCount: 2, requireExact: false, relatedComp: "water"}],
    "slime": [{axial: false, neededCount: 1, requireExact: true, relatedComp: "water"}, {axial: false, neededCount: 2, requireExact: false, relatedComp: "lead"}],
    "end_stone": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "reflector"}],
    "purpur": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "iron"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "R"}],
    "diamond": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "gold"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "cell"}],
    "emerald": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "prismarine"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "moderator"}],
    "copper": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "water"}],
    "tin": [{axial: true, neededCount: 2, requireExact: false, relatedComp: "lapis"}],
    "lead": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "iron"}],
    "boron": [{axial: false, neededCount: 1, requireExact: true, relatedComp: "quartz"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "wall"}],
    "lithium": [{axial: true, neededCount: 2, requireExact: true, relatedComp: "lead"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "wall"}],
    "magnesium": [{axial: false, neededCount: 1, requireExact: true, relatedComp: "moderator"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "wall"}],
    "manganese": [{axial: false, neededCount: 2, requireExact: false, relatedComp: "cell"}],
    "aluminum": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "quartz"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "lapis"}],
    "silver": [{axial: false, neededCount: 2, requireExact: false, relatedComp: "glowstone"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "tin"}],
    "fluorite": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "gold"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "prismarine"}],
    "villiaumite": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "end_stone"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "redstone"}],
    "carobbiite": [{axial: false, neededCount: 1, requireExact: false, relatedComp: "copper"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "end_stone"}],
    "arsenic": [{axial: true, neededCount: 2, requireExact: false, relatedComp: "reflector"}],
    "liquid_nitrogen": [{axial: false, neededCount: 2, requireExact: false, relatedComp: "copper"}, {axial: false, neededCount: 1, requireExact: false, relatedComp: "purpur"}],
    "liquid_helium": [{axial: false, neededCount: 2, requireExact: true, relatedComp: "redstone"}],
    "enderium": [{axial: false, neededCount: 3, requireExact: false, relatedComp: "moderator"}],
    "cryotheum": [{axial: false, neededCount: 3, requireExact: false, relatedComp: "cell"}]
  };
  static defaultCoilRules: {[x: string]: CoilRule[]} = {
    "magnesium": [{relatedComp: "bearing", neededCount: 1}],
    "beryllium": [{relatedComp: "magnesium", neededCount: 1}],
    "aluminum": [{relatedComp: "magnesium", neededCount: 2}],
    "gold": [{relatedComp: "aluminum", neededCount: 1}],
    "copper": [{relatedComp: "beryllium", neededCount: 1}],
    "silver": [{relatedComp: "gold", neededCount: 1}, {relatedComp: "copper", neededCount: 1}],
  };

  sinks: Sink[] = [];
  moderators: Moderator[] = [];
  shields: Shield[] = [];
  reflectors: Reflector[] = [];
  fuels: Fuel[] = [];
  neutronSources: NeutronSource[] = [];

  blades: Blade[] = [];
  coils: Coil[] = [];
  steam: Steam[] = [];

  fissionReactor: FissionReactorConfig;
  turbine: TurbineConfig;

  constructor(text: string, dataMapVersion: string, _dataMap?: any, customSinkRules: {[x: string]: SinkRule[]} = Config.defaultSinkRules) {
    if (dataMapVersion !== "custom" && !(dataMapVersion in dataMap))
      throw new Error("unknown dataMap");
    const dm = _dataMap ? _dataMap : dataMap[dataMapVersion];
    const {fissionReactor, turbine} = this.populateConfig(this.parseRawConfig(text), customSinkRules, dm);
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

  private populateConfig(rawConf: any, sinkRules: {[x: string]: SinkRule[]}, dm: any) {
    if (!this.isValidOverhaul(rawConf)) throw new Error("Config is not Overhaul!");

    dm.fission.components.sink.forEach((v: string, i: number) => {
      this.sinks.push({
        name: v,
        ruleSet: sinkRules[v],
        cooling: rawConf["fission"][dm.configs.fission.sinkCooling][i],
      });
    });
    dm.fission.components.moderator.forEach((v: string, i: number) => {
      this.moderators.push({
        name: v,
        efficiency: rawConf["fission"][dm.configs.fission.moderatorEfficiency][i],
        fluxFactor: rawConf["fission"][dm.configs.fission.moderatorFluxFactor][i],
      });
    });
    dm.fission.components.shield.forEach((v: string, i: number) => {
      this.shields.push({
        name: v,
        efficiency: rawConf["fission"][dm.configs.fission.shieldEfficiency][i],
        heatPerFlux: rawConf["fission"][dm.configs.fission.shieldHeatPerFlux][i],
      });
    });
    dm.fission.components.reflector.forEach((v: string, i: number) => {
      this.reflectors.push({
        name: v,
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
        efficiency: rawConf["turbine"][dm.configs.turbine.bladeEfficiency][i],
        expansion: rawConf["turbine"][dm.configs.turbine.bladeExpansion][i],
        stator: false
      });
    });
    this.blades.push({
      name: "stator",
      stator: true,
      efficiency: 0,
      expansion: rawConf["turbine"][dm.configs.turbine.statorExpansion],
    })
    dm.turbine.coil.components.coil.forEach((v: string, i: number) => {
      this.coils.push({
        name: v,
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