interface GenericPlacementRule {
  relatedComp: string
  neededCount: number
}

interface GenericSinkRule extends GenericPlacementRule {
  axial: boolean
  requireExact: boolean
}

interface AxialSink extends GenericSinkRule {
  axial: true
  neededCount: 2
}
interface NonAxialSink extends GenericSinkRule {
  axial: false
}

export type SinkRule = AxialSink | NonAxialSink;

export interface Sink {
  ruleSet: SinkRule[]
  cooling: number
  name: string
}
export interface Moderator {
  name: string
  fluxFactor: number
  efficiency: number
}
export interface Shield {
  name: string
  heatPerFlux: number
  efficiency: number
}
export interface Reflector {
  name: string
  reflectivity: number
  efficiency: number
}
export interface Fuel {
  name: string
  type: string
  efficiency: number
  heat: number
  criticality: number
  burnTime: number
  selfPriming: boolean
  radiation: number
}
export interface NeutronSource {
  name: string
  efficiency: number
}

export type Position = [number, number, number];
export interface FuelCellData {
  adjacentCells: number
  adjacentReflectors: number
  fuel: Fuel
  pos: Position
  heatMultiplier: number
  heatProduction: number
  positionalEff: number
  hasCasingConnection: boolean
  flux: number
  calculated: boolean
  primed: boolean
  checkedModerators: Position[]
}

interface GenericBlade {
  name: string
  stator: boolean
  expansion: number
  efficiency: number
}

interface StatorBlade extends GenericBlade {
  stator: true
  efficiency: 0
}
interface StandardBlade extends GenericBlade {
  stator: false
}

export interface CoilRule extends GenericPlacementRule {}

export type Blade = StatorBlade | StandardBlade;
export interface Coil {
  name: string
  conductivity: number
  ruleSet: GenericPlacementRule[]
}
export interface Steam {
  name: string
  powerPerMb: number
  expansion: number
}

interface Multiblock {
  maxSize: number
  minSize: number
}

export interface FissionReactorConfig extends Multiblock {
  fuelTimeMultiplier: number
  coolingEfficiencyLeniency: number
  sparsityPenaltyParams: number[]
  canOverheat: boolean
  neutronReach: number
}
export interface TurbineConfig extends Multiblock {
  mbPerBlade: number
  throughputEfficiencyLeniency: number
  tensionThroughputFactor: number
}