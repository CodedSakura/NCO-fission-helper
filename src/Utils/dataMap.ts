export const dataMap: {[x: string]: any} = {
  "0.0.1": {
    version: "0.0.1",
    imageType: "png",
    fission: {
      indicatorBitCount: 4,
      indicatorOrder: ["air", "sink", "moderator", "reflector", "shield", "cell", "irradiator", "wall"],
      components: {
        air: ["air"],
        sink: ["water", "iron", "redstone", "quartz", "obsidian", "nether_brick", "glowstone", "lapis", "gold", "prismarine", "slime", "end_stone", "purpur", "diamond", "emerald", "copper", "tin", "lead", "boron", "lithium", "magnesium", "manganese", "aluminum", "silver", "fluorite", "villiaumite", "carobbiite", "arsenic", "liquid_nitrogen", "liquid_helium", "enderium", "cryotheum"],
        moderator: ["graphite", "beryllium", "heavy_water"],
        reflector: ["beryllium_carbon", "lead_steel"],
        shield: ["boron_silver"],
        cell: ["cell"],
        wall: ["wall"],
        irradiator: ["irradiator"]
      } as any,
      neutronSourceBitCount: 2,
      neutronSourceOrder: ["none", "ra_be", "po_be", "cf_252"]
    },
    turbine: {
      blade: {
        bladeOrder: ["steel", "extreme", "sic_sic_cmc"],
        steamOrder: ["high_pressure", "low_pressure", "standard"]
      },
      coil: {
        indicatorBitCount: 2,
        indicatorOrder: ["coils", "rotor_bearing", "wall"],
        components: {
          coil: ["magnesium", "beryllium", "aluminum", "gold", "copper", "silver"],
          rotor_bearing: ["rotor_bearing"],
          wall: ["wall"]
        } as any
      }
    },
    fuel: {
      fuelTypeBitCount: 4,
      fuelTypeOrder: ["thorium", "uranium", "neptunium", "plutonium", "mixed", "americium", "curium", "berkelium", "californium"],
      fuelBitCount: 5,
      fuelTypes: {
        thorium: ["TBU-TRISO", "TBU-OX", "TBU-NI", "TBU-ZA", "TBU-F4"],
        uranium: ["LEU-233-TRISO", "LEU-233-OX", "LEU-233-NI", "LEU-233-ZA", "LEU-233-F4", "HEU-233-TRISO", "HEU-233-OX", "HEU-233-NI", "HEU-233-ZA", "HEU-233-F4", "LEU-235-TRISO", "LEU-235-OX", "LEU-235-NI", "LEU-235-ZA", "LEU-235-F4", "HEU-235-TRISO", "HEU-235-OX", "HEU-235-NI", "HEU-235-ZA", "HEU-235-F4"],
        neptunium: ["LEN-236-TRISO", "LEN-236-OX", "LEN-236-NI", "LEN-236-ZA", "LEN-236-F4", "HEN-236-TRISO", "HEN-236-OX", "HEN-236-NI", "HEN-236-ZA", "HEN-236-F4"],
        plutonium: ["LEP-239-TRISO", "LEP-239-OX", "LEP-239-NI", "LEP-239-ZA", "LEP-239-F4", "HEP-239-TRISO", "HEP-239-OX", "HEP-239-NI", "HEP-239-ZA", "HEP-239-F4", "LEP-241-TRISO", "LEP-241-OX", "LEP-241-NI", "LEP-241-ZA", "LEP-241-F4", "HEP-241-TRISO", "HEP-241-OX", "HEP-241-NI", "HEP-241-ZA", "HEP-241-F4"],
        mixed: ["MTRISO-239", "MOX-239", "MNI-239", "MZA-239", "MF4-239", "MTRISO-241", "MOX-241", "MNI-241", "MZA-241", "MF4-241"],
        americium: ["LEA-242-TRISO", "LEA-242-OX", "LEA-242-NI", "LEA-242-ZA", "LEA-242-F4", "HEA-242-TRISO", "HEA-242-OX", "HEA-242-NI", "HEA-242-ZA", "HEA-242-F4"],
        curium: ["LECm-243-TRISO", "LECm-243-OX", "LECm-243-NI", "LECm-243-ZA", "LECm-243-F4", "HECm-243-TRISO", "HECm-243-OX", "HECm-243-NI", "HECm-243-ZA", "HECm-243-F4", "LECm-245-TRISO", "LECm-245-OX", "LECm-245-NI", "LECm-245-ZA", "LECm-245-F4", "HECm-245-TRISO", "HECm-245-OX", "HECm-245-NI", "HECm-245-ZA", "HECm-245-F4", "LECm-247-TRISO", "LECm-247-OX", "LECm-247-NI", "LECm-247-ZA", "LECm-247-F4", "HECm-247-TRISO", "HECm-247-OX", "HECm-247-NI", "HECm-247-ZA", "HECm-247-F4"],
        berkelium: ["LEB-248-TRISO", "LEB-248-OX", "LEB-248-NI", "LEB-248-ZA", "LEB-248-F4", "HEB-248-TRISO", "HEB-248-OX", "HEB-248-NI", "HEB-248-ZA", "HEB-248-F4"],
        californium: ["LECf-249-TRISO", "LECf-249-OX", "LECf-249-NI", "LECf-249-ZA", "LECf-249-F4", "HECf-249-TRISO", "HECf-249-OX", "HECf-249-NI", "HECf-249-ZA", "HECf-249-F4", "LECf-251-TRISO", "LECf-251-OX", "LECf-251-NI", "LECf-251-ZA", "LECf-251-F4", "HECf-251-TRISO", "HECf-251-OX", "HECf-251-NI", "HECf-251-ZA", "HECf-251-F4"],
      } as any
    },
    configs: {
      fission: {
        fuelTimeMultiplier: "fission_fuel_time_multiplier",
        sourceEfficiency: "fission_source_efficiency",
        sinkCooling: "fission_sink_cooling_rate",
        sinkRule: "fission_sink_rule",
        heaterCooling: "fission_heater_cooling_rate",
        heaterRule: "fission_heater_rule",
        moderatorEfficiency: "fission_moderator_efficiency",
        moderatorFluxFactor: "fission_moderator_flux_factor",
        reflectorEfficiency: "fission_reflector_efficiency",
        reflectorReflectivity: "fission_reflector_reflectivity",
        shieldHeatPerFlux: "fission_shield_heat_per_flux",
        shieldEfficiency: "fission_shield_efficiency",
        coolingEfficiencyLeniency: "fission_cooling_efficiency_leniency",
        sparsityPenaltyParams: "fission_sparsity_penalty_params",
        canOverheat: "fission_overheat",
        minSize: "fission_min_size",
        maxSize: "fission_max_size",
        neutronReach: "fission_neutron_reach",
        fuelConfigPatterns: {
          fuelTime: "fission_{name}_fuel_time",
          heatGeneration: "fission_{name}_heat_generation",
          efficiency: "fission_{name}_efficiency",
          criticality: "fission_{name}_criticality",
          selfPriming: "fission_{name}_self_priming",
          radiation: "fission_{name}_radiation",
        }
      },
      turbine: {
        minSize: "turbine_min_size",
        maxSize: "turbine_max_size",
        bladeEfficiency: "turbine_blade_efficiency",
        bladeExpansion: "turbine_blade_expansion",
        statorExpansion: "turbine_stator_expansion",
        coilConductivity: "turbine_coil_conductivity",
        powerPerMb: "turbine_power_per_mb",
        expansionLevel: "turbine_expansion_level",
        mbPerBlade: "turbine_mb_per_blade",
        throughputEfficiencyLeniency: "turbine_throughput_efficiency_leniency",
        tensionThroughputFactor: "turbine_tension_throughput_factor"
      }
    }
  },
}

export const latestDM = dataMap["0.0.1"];