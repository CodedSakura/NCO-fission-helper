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
export type SinkRuleSet = {
  rules: SinkRule[]
  var: "||"|"&&"
}

export interface GenericComponent {
  name: string
  asset: string
}

export interface Sink extends GenericComponent {
  ruleSet: SinkRuleSet
  cooling: number
}
export interface Moderator extends GenericComponent {
  fluxFactor: number
  efficiency: number
}
export interface Shield extends GenericComponent {
  heatPerFlux: number
  efficiency: number
}
export interface Reflector extends GenericComponent {
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
export interface Dimensions {
  width: number
  height: number
  depth: number
}

export interface GridProblem {
  pos: Position
  message: string
}

interface GenericBlade extends GenericComponent {
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
export interface Coil extends GenericComponent {
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

export interface FissionReactorExport {
  name?: string
  dataMap: string
  data: number[][][]
}