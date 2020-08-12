interface NCOHStructure { // NCO helper structure
  name: string
  description?: string
  data: any
}
interface NCOH3DStructure extends NCOHStructure {
  size: [number, number, number]
}

export interface ReactorSF extends NCOH3DStructure {
  data: number[][][]
  recipe: string
  stats: {
    output: number // mB/t

    heating: number
    cooling: number
    netHeat: number

    efficiency: number // %
    heatMultiplier: number // %
    sparsityPenaltyMultiplier: number // %

    totalIrradiation: number // neutron flux

    shutdownFactor: number // %
  }
}
export interface ReactorMS extends NCOH3DStructure {
  data: number[][][]
  stats: {
    outputs: {coolant: string, output: number}[] // mB/t

    heating: number
    cooling: number
    netHeat: number

    efficiency: number // %
    heatMultiplier: number // %
    sparsityPenaltyMultiplier: number // %

    totalIrradiation: number // neutron flux

    shutdownFactor: number // %
  }
}

export interface Turbine extends NCOHStructure {
  data: [
    number[], // blades
    number[][], // coils A
    number[][]  // coils B
  ] | [
    number[], // blades
    number[][] // coils A & B
  ]
  size: [number, number, number] // [w & h, depth, bearing]
  recipe: string
  stats: {
    inputMax: number // mB/t (safe)
    input: number // raw/calculated mB/t

    output: number // RF/t
    outputMaxSafe: number // RF/t with maxInput

    fluidPowerGen: number // RF/mB

    efficiencyDynamo: number // %
    efficiencyRotor: number // %

    expansion: number // %
    ratePowerBonus: number // %
  }
}

export interface AcceleratorLinear extends NCOH3DStructure {
  data: number[][][]
  stats: {} // fixme
}
export interface AcceleratorSync extends NCOH3DStructure {
  data: number[][][]
  stats: {} // fixme
}

export default interface ExportStructure {
  version: string
  name: string
  description: string

  configs?: Partial<{}> // TODO; will be based on NC overhauled config layout, if none, assume default
  overrides?: Partial<{}> // TODO; will be overrides for shifting, if none, assume default (currently located in dataMap.ts)

  reactorsSF?: ReactorSF[]
  reactorsMS?: ReactorMS[]

  turbines?: Turbine[]

  acceleratorsLinear?: AcceleratorLinear[]
  acceleratorsSync?: AcceleratorSync[]
};