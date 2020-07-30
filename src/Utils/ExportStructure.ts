interface NCOHStructure { // NCO helper structure
  name: ""
  description?: string
  data: any
}

export interface ReactorSF extends NCOHStructure {
  data: number[][][]
}
export interface ReactorMS extends NCOHStructure {
  data: number[][][]
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
}

export interface AcceleratorLinear extends NCOHStructure {
  data: number[][][]
}
export interface AcceleratorSync extends NCOHStructure {
  data: number[][][]
}

export default interface ExportStructure {
  version: string
  configs?: {} // TODO; will be based on NC overhauled config layout, if none, assume default
  overrides?: {} // TODO; will be overrides for shifting, if none, assume default (currently located in dataMap.ts)

  reactorsSF?: ReactorSF[]
  reactorsMS?: ReactorMS[]

  turbines?: Turbine[]

  acceleratorsLinear?: AcceleratorLinear[]
  acceleratorsSync?: AcceleratorSync[]
};