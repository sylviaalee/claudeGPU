export const levelInfo = [
  {
    "stages": [
      {
        "id": "stage1",
        "name": "Raw Materials",
        "components": [
          {
            "id": "quartz_gpu",
            "name": "High purity quartz",
            "feedsInto": ["silicon_wafers_gpu"]
          },
          {
            "id": "quartz_memory",
            "name": "High purity quartz",
            "feedsInto": ["silicon_wafers_memory"]
          },
          {
            "id": "polymers_photoresist",
            "name": "Base polymers/solvents",
            "feedsInto": ["photoresist"]
          },
          {
            "id": "polymers_abf",
            "name": "Base polymers/solvents",
            "feedsInto": ["abf_film"]
          },
          {
            "id": "copper_resin",
            "name": "Copper and resin",
            "feedsInto": ["copper_clad_laminates"]
          },
          {
            "id": "aluminium_copper",
            "name": "Aluminium/copper",
            "feedsInto": ["coolers_heat_sinks"]
          }
        ]
      },
      {
        "id": "stage2",
        "name": "Component Fabrication",
        "components": [
          {
            "id": "silicon_wafers_gpu",
            "name": "Silicon wafers",
            "dependsOn": ["quartz_gpu"],
            "feedsInto": ["gpu_die"]
          },
          {
            "id": "silicon_wafers_memory",
            "name": "Silicon wafers",
            "dependsOn": ["quartz_memory"],
            "feedsInto": ["dram_cells"]
          },
          {
            "id": "photoresist",
            "name": "Photoresist",
            "dependsOn": ["polymers_photoresist"],
            "feedsInto": ["gpu_die"]
          },
          {
            "id": "abf_film",
            "name": "ABF film",
            "dependsOn": ["polymers_abf"],
            "feedsInto": ["substrate_abf"]
          },
          {
            "id": "copper_clad_laminates",
            "name": "Copper clad laminates",
            "dependsOn": ["copper_resin"],
            "feedsInto": ["substrate_abf"]
          },
          {
            "id": "dram_cells",
            "name": "DRAM cells",
            "dependsOn": ["silicon_wafers_memory"],
            "feedsInto": ["hbm3e"]
          }
        ]
      },
      {
        "id": "stage3",
        "name": "Advanced Packaging Components",
        "components": [
          {
            "id": "gpu_die",
            "name": "GPU die",
            "dependsOn": ["silicon_wafers_gpu", "photoresist"],
            "feedsInto": ["packaging_merge"]
          },
          {
            "id": "substrate_abf",
            "name": "The substrate (abf)",
            "dependsOn": ["abf_film", "copper_clad_laminates"],
            "feedsInto": ["packaging_merge"]
          },
          {
            "id": "hbm3e",
            "name": "HBM3e (memory)",
            "dependsOn": ["dram_cells"],
            "feedsInto": ["packaging_merge"]
          }
        ]
      },
      {
        "id": "stage4",
        "name": "Integration",
        "components": [
          {
            "id": "packaging_merge",
            "name": "2.5D advanced packaging merge",
            "dependsOn": ["gpu_die", "substrate_abf", "hbm3e"],
            "feedsInto": ["final_assembly"]
          }
        ]
      },
      {
        "id": "stage5",
        "name": "Final Assembly",
        "components": [
          {
            "id": "pcb_motherboard",
            "name": "PCB/motherboard",
            "feedsInto": ["final_assembly"]
          },
          {
            "id": "coolers_heat_sinks",
            "name": "Coolers/heat sinks",
            "dependsOn": ["aluminium_copper"],
            "feedsInto": ["final_assembly"]
          },
          {
            "id": "final_assembly",
            "name": "Final assembly and testing",
            "dependsOn": ["packaging_merge", "pcb_motherboard", "coolers_heat_sinks"]
          }
        ]
      }
    ]
  }
];