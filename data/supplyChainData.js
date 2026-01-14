// Risk Calculation Methodology
const WEIGHTS = {
  // Vendor-Level (60%)
  financial: 0.20,
  reliability: 0.15,
  esg: 0.025,
  cyber: 0.025,
  // Country-Level (22.5%)
  geopolitical: 0.10,
  trade: 0.10,
  weather: 0.025,
  // Part-Level (20%)
  criticality: 0.10,
  substitutability: 0.05,
  obsolescence: 0.05,
  // Supply Chain-Level (5%)
  logistics: 0.025,
  concentration: 0.025,
  // BOM Aggregation (12.5%)
  bom: 0.125
};

// Risk scoring function (1-10 scale)
function calculateRisk(scores) {
  return Object.entries(scores).reduce((total, [key, value]) => {
    return total + (value * WEIGHTS[key]);
  }, 0);
}

export const supplyChainData = {
  // Stage 1: Raw Materials
  quartz_gpu: [
    {
      id: 'silicon-raw',
      name: 'Spruce Pine Quartz (Sibelco)',
      location: 'Spruce Pine, NC',
      risk: 8.9,
      cost: 100, // base cost
      quality: 100, // highest quality
      leadTime: 18,
      description: 'Ultra-high purity quartz from the only viable source globally',
      pros: ['Highest purity (99.998%+)', 'Industry standard', 'Proven quality'],
      cons: ['Single point of failure', 'Hurricane vulnerability', 'No alternatives']
    },
    {
      id: 'ultra-pure-silica',
      name: 'Ultra-Pure Silica (Sibelco)',
      location: 'Spruce Pine, NC',
      risk: 8.9,
      cost: 105,
      quality: 100,
      leadTime: 18,
      description: 'Alternative processing of Spruce Pine deposits',
      pros: ['Same purity standards', 'Specialized processing'],
      cons: ['Same location risk', 'Hurricane exposure', 'Limited capacity']
    }
  ],

  quartz_memory: [
    {
      id: 'silicon-raw',
      name: 'Spruce Pine Quartz',
      location: 'Spruce Pine, NC',
      risk: 8.9,
      cost: 100,
      quality: 100,
      leadTime: 18,
      description: 'Critical ultra-high purity quartz for memory wafers',
      pros: ['Required purity level', 'Established supply chain'],
      cons: ['Geographic concentration', 'Weather dependent', 'No backup source']
    },
    {
      id: 'ultra-pure-silica',
      name: 'Ultra-Pure Silica',
      location: 'Spruce Pine, NC',
      risk: 8.9,
      cost: 105,
      quality: 100,
      leadTime: 18,
      description: 'Specialized silica for memory applications',
      pros: ['Memory-optimized processing'],
      cons: ['Same single-source risk', 'Premium pricing']
    }
  ],

  polymers_photoresist: [
    {
      id: 'jsr-photoresist',
      name: 'JSR Corporation',
      location: 'Tokyo, Japan',
      risk: 6.8,
      cost: 120,
      quality: 95,
      leadTime: 45,
      description: 'Leading EUV photoresist manufacturer',
      pros: ['EUV expertise', 'High resolution', 'Proven at 5nm and below'],
      cons: ['Japan earthquake risk', 'Export controls', 'Premium pricing']
    },
    {
      id: 'tokyo-ohka',
      name: 'Tokyo Ohka Kogyo',
      location: 'Kawasaki, Japan',
      risk: 6.5,
      cost: 115,
      quality: 92,
      leadTime: 40,
      description: 'Major photoresist supplier with comprehensive portfolio',
      pros: ['Broad node coverage', 'Strong reliability', 'Good cost/performance'],
      cons: ['Japan concentration', 'Lower cutting-edge share']
    },
    {
      id: 'dupont-photoresist',
      name: 'DuPont Electronics',
      location: 'Marlborough, MA',
      risk: 4.8,
      cost: 125,
      quality: 90,
      leadTime: 35,
      description: 'US-based photoresist alternative',
      pros: ['Geographic diversity', 'US supply chain', 'Stable operations'],
      cons: ['Smaller EUV market share', 'Higher cost', 'Less mature EUV tech']
    }
  ],

  polymers_abf: [
    {
      id: 'ajinomoto-abf',
      name: 'Ajinomoto Build-up Film',
      location: 'Tokyo, Japan',
      risk: 7.2,
      cost: 110,
      quality: 98,
      leadTime: 50,
      description: 'Market leader in ABF film with 90%+ market share',
      pros: ['Industry standard', 'Superior reliability', 'Proven performance'],
      cons: ['Near monopoly', 'Japan concentration', 'Allocation constraints']
    },
    {
      id: 'mitsubishi-abf',
      name: 'Mitsubishi Gas Chemical',
      location: 'Tokyo, Japan',
      risk: 6.8,
      cost: 115,
      quality: 92,
      leadTime: 55,
      description: 'Secondary ABF film supplier',
      pros: ['Alternative source', 'Growing capacity'],
      cons: ['Same Japan risk', 'Limited market share', 'Qualification time']
    },
    {
      id: 'doosan-abf',
      name: 'Doosan Electronics',
      location: 'Seoul, South Korea',
      risk: 5.9,
      cost: 105,
      quality: 88,
      leadTime: 45,
      description: 'Emerging Korean ABF alternative',
      pros: ['Geographic diversity', 'Cost competitive', 'Expanding capacity'],
      cons: ['Less proven', 'Lower performance', 'Smaller scale']
    }
  ],

  copper_resin: [
    {
      id: 'kyocera-ccl',
      name: 'Kyocera Chemical',
      location: 'Kyoto, Japan',
      risk: 6.0,
      cost: 95,
      quality: 95,
      leadTime: 35,
      description: 'Premium copper clad laminate manufacturer',
      pros: ['High-frequency performance', 'Low loss', 'Thermal stability'],
      cons: ['Japan natural disaster risk', 'Premium pricing']
    },
    {
      id: 'panasonic-ccl',
      name: 'Panasonic',
      location: 'Osaka, Japan',
      risk: 6.2,
      cost: 90,
      quality: 93,
      leadTime: 40,
      description: 'Major CCL supplier with integrated materials',
      pros: ['Vertical integration', 'Good availability', 'Cost effective'],
      cons: ['Japan concentration', 'Earthquake exposure']
    },
    {
      id: 'isola-ccl',
      name: 'Isola Group',
      location: 'Chandler, AZ',
      risk: 4.5,
      cost: 100,
      quality: 90,
      leadTime: 30,
      description: 'US-based laminate manufacturer',
      pros: ['US supply chain', 'Stable operations', 'Fast delivery'],
      cons: ['Smaller high-end share', 'Higher domestic cost']
    }
  ],

  aluminium_copper: [
    {
      id: 'alcoa-metal',
      name: 'Alcoa Corporation',
      location: 'Pittsburgh, PA',
      risk: 4.2,
      cost: 85,
      quality: 92,
      leadTime: 25,
      description: 'Major aluminum producer with global operations',
      pros: ['Large scale', 'US-based', 'Reliable supply', 'Commodity pricing'],
      cons: ['Energy price sensitivity', 'Commodity market volatility']
    },
    {
      id: 'freeport-copper',
      name: 'Freeport-McMoRan',
      location: 'Phoenix, AZ',
      risk: 4.8,
      cost: 90,
      quality: 94,
      leadTime: 30,
      description: 'Leading copper producer',
      pros: ['High purity copper', 'Domestic source', 'Mining expertise'],
      cons: ['Price volatility', 'Environmental regulations']
    },
    {
      id: 'rio-tinto',
      name: 'Rio Tinto',
      location: 'Multiple Global',
      risk: 5.1,
      cost: 88,
      quality: 93,
      leadTime: 35,
      description: 'Diversified metals and mining',
      pros: ['Geographic diversity', 'Multiple commodities', 'Large scale'],
      cons: ['Complex supply chain', 'Geopolitical exposure', 'Variable quality']
    }
  ],

  // Stage 2: Component Fabrication
  silicon_wafers_gpu: [
    {
      id: 'shin-etsu-wafer',
      name: 'Shin-Etsu Chemical',
      location: 'Vancouver, WA',
      risk: 6.7,
      cost: 150,
      quality: 98,
      leadTime: 90,
      description: 'Global market leader with 30%+ share',
      pros: ['Highest quality', 'US production', 'Industry standard'],
      cons: ['Long lead times', 'Allocation system', 'Premium pricing']
    },
    {
      id: 'sumco-wafer',
      name: 'SUMCO Corporation',
      location: 'Imari, Japan',
      risk: 6.9,
      cost: 145,
      quality: 97,
      leadTime: 95,
      description: 'Second-largest wafer supplier',
      pros: ['High quality', 'Large capacity', 'Proven reliability'],
      cons: ['Japan earthquake risk', 'Allocation constraints', 'Long lead time']
    },
    {
      id: 'globalwafers',
      name: 'GlobalWafers',
      location: 'Sherman, TX',
      risk: 6.1,
      cost: 140,
      quality: 94,
      leadTime: 85,
      description: 'Third-largest with expanding US capacity',
      pros: ['US production', 'Shorter lead time', 'Growing capacity'],
      cons: ['Lower market share', 'Texas grid risk', 'Quality variance']
    }
  ],

  silicon_wafers_memory: [
    {
      id: 'shin-etsu-wafer',
      name: 'Shin-Etsu Chemical',
      location: 'Vancouver, WA',
      risk: 6.7,
      cost: 145,
      quality: 98,
      leadTime: 90,
      description: 'Premium wafers for memory applications',
      pros: ['Best uniformity', 'Low defect density', 'US supply'],
      cons: ['Capacity constraints', 'Premium cost']
    },
    {
      id: 'sk-siltron',
      name: 'SK Siltron',
      location: 'Gumi, South Korea',
      risk: 5.9,
      cost: 135,
      quality: 95,
      leadTime: 80,
      description: 'Korean supplier with memory focus',
      pros: ['Memory optimized', 'Good cost', 'Strong Korean ties'],
      cons: ['Korea geopolitical risk', 'Smaller scale']
    },
    {
      id: 'sumco-wafer',
      name: 'SUMCO Corporation',
      location: 'Imari, Japan',
      risk: 6.9,
      cost: 140,
      quality: 97,
      leadTime: 95,
      description: 'Established memory wafer supplier',
      pros: ['Proven quality', 'Large volume capability'],
      cons: ['Japan concentration', 'Natural disaster exposure']
    }
  ],

  photoresist: [
    {
      id: 'jsr-photoresist',
      name: 'JSR Corporation',
      location: 'Tokyo, Japan',
      risk: 6.8,
      cost: 200,
      quality: 96,
      leadTime: 45,
      description: 'EUV photoresist leader',
      pros: ['Best EUV performance', 'Cutting-edge capability', 'Line width control'],
      cons: ['Export controls', 'Capacity limited', 'High cost']
    },
    {
      id: 'tokyo-ohka',
      name: 'Tokyo Ohka Kogyo',
      location: 'Kawasaki, Japan',
      risk: 6.5,
      cost: 185,
      quality: 93,
      leadTime: 40,
      description: 'Comprehensive photoresist supplier',
      pros: ['Multi-node support', 'Good reliability', 'Better availability'],
      cons: ['Japan risk', 'Not EUV leader']
    },
    {
      id: 'dupont-photoresist',
      name: 'DuPont Electronics',
      location: 'Marlborough, MA',
      risk: 4.8,
      cost: 195,
      quality: 89,
      leadTime: 35,
      description: 'US alternative for advanced nodes',
      pros: ['US source', 'Faster delivery', 'Stable supply'],
      cons: ['Lower EUV maturity', 'Smaller market presence']
    }
  ],

  abf_film: [
    {
      id: 'ajinomoto-abf',
      name: 'Ajinomoto Build-up Film',
      location: 'Tokyo, Japan',
      risk: 7.2,
      cost: 180,
      quality: 98,
      leadTime: 50,
      description: 'Dominant ABF film supplier',
      pros: ['Industry standard', 'Best reliability', 'Proven at scale'],
      cons: ['Near monopoly risk', 'Allocation only', 'Japan concentration']
    },
    {
      id: 'mitsubishi-abf',
      name: 'Mitsubishi Gas Chemical',
      location: 'Tokyo, Japan',
      risk: 6.8,
      cost: 190,
      quality: 92,
      leadTime: 55,
      description: 'Alternative ABF supplier',
      pros: ['Backup source', 'Improving quality'],
      cons: ['Limited capacity', 'Same Japan risk', 'Less qualified']
    },
    {
      id: 'doosan-abf',
      name: 'Doosan Electronics',
      location: 'Seoul, South Korea',
      risk: 5.9,
      cost: 170,
      quality: 87,
      leadTime: 45,
      description: 'Emerging Korean supplier',
      pros: ['Cost effective', 'Korea location', 'Expanding'],
      cons: ['Less proven', 'Quality gaps', 'Qualification needed']
    }
  ],

  copper_clad_laminates: [
    {
      id: 'kyocera-ccl',
      name: 'Kyocera Chemical',
      location: 'Kyoto, Japan',
      risk: 6.0,
      cost: 160,
      quality: 96,
      leadTime: 35,
      description: 'Premium high-frequency laminates',
      pros: ['Best electrical performance', 'Low loss', 'High reliability'],
      cons: ['Japan earthquake risk', 'Higher cost']
    },
    {
      id: 'panasonic-ccl',
      name: 'Panasonic',
      location: 'Osaka, Japan',
      risk: 6.2,
      cost: 150,
      quality: 94,
      leadTime: 40,
      description: 'Integrated materials supplier',
      pros: ['Good performance', 'Better availability', 'Cost competitive'],
      cons: ['Japan concentration', 'Natural disaster exposure']
    },
    {
      id: 'isola-ccl',
      name: 'Isola Group',
      location: 'Chandler, AZ',
      risk: 4.5,
      cost: 165,
      quality: 91,
      leadTime: 30,
      description: 'US-based laminate manufacturer',
      pros: ['US supply chain', 'Fast lead time', 'Stable'],
      cons: ['Lower advanced packaging share', 'Performance gap']
    }
  ],

  dram_cells: [
    {
      id: 'samsung-dram',
      name: 'Samsung Electronics',
      location: 'Pyeongtaek, South Korea',
      risk: 6.2,
      cost: 200,
      quality: 97,
      leadTime: 60,
      description: 'Leading DRAM manufacturer',
      pros: ['Cutting-edge process', 'High volume', 'HBM expertise'],
      cons: ['Korea concentration', 'Capacity constraints']
    },
    {
      id: 'sk-hynix-dram',
      name: 'SK Hynix',
      location: 'Icheon, South Korea',
      risk: 6.4,
      cost: 195,
      quality: 96,
      leadTime: 65,
      description: 'Major HBM supplier',
      pros: ['HBM leader', 'Strong yields', 'Good availability'],
      cons: ['Korea risk', 'Allocation system']
    },
    {
      id: 'micron-dram',
      name: 'Micron Technology',
      location: 'Boise, ID',
      risk: 5.1,
      cost: 205,
      quality: 94,
      leadTime: 70,
      description: 'US-based memory manufacturer',
      pros: ['US supply chain', 'No geopolitical risk', 'Growing HBM'],
      cons: ['Smaller HBM share', 'Process lag', 'Higher cost']
    }
  ],

  // Stage 3: Advanced Packaging Components
  gpu_die: [
    {
      id: 'tsmc',
      name: 'TSMC (4nm/5nm)',
      location: 'Hsinchu, Taiwan',
      risk: 8.7,
      cost: 1000,
      quality: 99,
      leadTime: 120,
      description: 'Leading-edge GPU manufacturing',
      pros: ['Best process tech', 'Highest performance', 'Proven yields'],
      cons: ['Taiwan risk', 'Very long lead time', 'Allocation only', 'Maximum cost']
    },
    {
      id: 'samsung',
      name: 'Samsung Foundry (4nm/5nm)',
      location: 'Hwaseong, South Korea',
      risk: 5.9,
      cost: 950,
      quality: 95,
      leadTime: 110,
      description: 'Alternative advanced foundry',
      pros: ['Korea location', 'Growing capability', 'Better availability'],
      cons: ['Yield challenges', 'Less mature', 'Performance gap']
    },
    {
      id: 'intel-fab',
      name: 'Intel Foundry (Intel 4)',
      location: 'Chandler, AZ',
      risk: 4.5,
      cost: 1050,
      quality: 91,
      leadTime: 130,
      description: 'US-based advanced foundry',
      pros: ['US location', 'No geopolitical risk', 'Government support'],
      cons: ['Limited GPU experience', 'Newer to market', 'Premium pricing']
    }
  ],

  substrate_abf: [
    {
      id: 'ibiden-eds',
      name: 'Ibiden',
      location: 'Ogaki, Japan',
      risk: 6.5,
      cost: 220,
      quality: 98,
      leadTime: 75,
      description: 'Market leader in advanced substrates',
      pros: ['Highest quality', 'ALIVH technology', 'Proven reliability'],
      cons: ['Japan concentration', 'Single facility risk', 'Allocation constraints']
    },
    {
      id: 'kyocera-eds',
      name: 'Kyocera',
      location: 'Kyoto, Japan',
      risk: 6.0,
      cost: 210,
      quality: 96,
      leadTime: 70,
      description: 'Major substrate manufacturer',
      pros: ['High quality', 'Good capacity', 'Fine-line capability'],
      cons: ['Japan earthquake risk', 'Long lead time']
    },
    {
      id: 'at&s-eds',
      name: 'AT&S',
      location: 'Chennai, India',
      risk: 5.5,
      cost: 195,
      quality: 91,
      leadTime: 80,
      description: 'European company with Indian operations',
      pros: ['Geographic diversity', 'Growing capability', 'Cost competitive'],
      cons: ['India infrastructure challenges', 'Less mature', 'Longer logistics']
    }
  ],

  hbm3e: [
    {
      id: 'sk-hynix-hbm',
      name: 'SK Hynix HBM3E',
      location: 'Icheon, South Korea',
      risk: 6.4,
      cost: 400,
      quality: 98,
      leadTime: 90,
      description: 'HBM market leader',
      pros: ['Best HBM technology', 'Highest bandwidth', 'Proven reliability'],
      cons: ['Korea concentration', 'Tight allocation', 'Premium pricing']
    },
    {
      id: 'samsung-hbm',
      name: 'Samsung HBM3E',
      location: 'Pyeongtaek, South Korea',
      risk: 6.2,
      cost: 390,
      quality: 97,
      leadTime: 85,
      description: 'Major HBM supplier',
      pros: ['Strong technology', 'Large capacity', 'Good yields'],
      cons: ['Korea risk', 'Qualification time', 'Limited availability']
    },
    {
      id: 'micron-hbm',
      name: 'Micron HBM3E',
      location: 'Boise, ID',
      risk: 5.1,
      cost: 420,
      quality: 94,
      leadTime: 95,
      description: 'US-based HBM supplier',
      pros: ['US supply chain', 'No geopolitical risk', 'Growing production'],
      cons: ['Newer to HBM', 'Smaller capacity', 'Highest cost', 'Behind technology']
    }
  ],

  // Stage 4: Integration
  packaging_merge: [
    {
      id: 'tsmc',
      name: 'TSMC CoWoS',
      location: 'Taichung, Taiwan',
      risk: 8.7,
      cost: 500,
      quality: 99,
      leadTime: 150,
      description: 'Industry-leading 2.5D packaging',
      pros: ['Best technology', 'Highest yields', 'Proven at scale', 'Industry standard'],
      cons: ['THE bottleneck', 'Taiwan risk', 'Extreme lead times', 'Allocation only']
    },
    {
      id: 'samsung',
      name: 'Samsung I-Cube',
      location: 'Seoul, South Korea',
      risk: 5.9,
      cost: 480,
      quality: 94,
      leadTime: 140,
      description: 'Alternative advanced packaging',
      pros: ['Korea location', 'Growing capability', 'Better availability'],
      cons: ['Less mature', 'Limited capacity', 'Qualification time']
    },
    {
      id: 'intel-fab',
      name: 'Intel Foveros',
      location: 'Chandler, AZ',
      risk: 4.5,
      cost: 520,
      quality: 91,
      leadTime: 145,
      description: 'US-based 3D packaging',
      pros: ['US location', 'No geopolitical risk', 'Innovative tech'],
      cons: ['Limited GPU packaging experience', 'Smaller scale', 'Premium cost']
    }
  ],

  // Stage 5: Final Assembly
  pcb_motherboard: [
    {
      id: 'unimicron-pcb',
      name: 'Unimicron',
      location: 'Taipei, Taiwan',
      risk: 7.2,
      cost: 150,
      quality: 96,
      leadTime: 45,
      description: 'Largest PCB manufacturer globally',
      pros: ['Highest quality', 'Large scale', 'Advanced technology'],
      cons: ['Taiwan concentration', 'Earthquake risk']
    },
    {
      id: 'tripod-pcb',
      name: 'Tripod Technology',
      location: 'Taoyuan, Taiwan',
      risk: 7.0,
      cost: 145,
      quality: 94,
      leadTime: 40,
      description: 'Major Taiwan PCB supplier',
      pros: ['Good quality', 'Competitive pricing', 'Fast turnaround'],
      cons: ['Taiwan risk', 'Smaller scale']
    },
    {
      id: 'ttm-pcb',
      name: 'TTM Technologies',
      location: 'Santa Ana, CA',
      risk: 4.3,
      cost: 165,
      quality: 91,
      leadTime: 35,
      description: 'US-based PCB manufacturer',
      pros: ['US supply chain', 'Fast delivery', 'Stable operations'],
      cons: ['Higher cost', 'Limited advanced capability']
    }
  ],

  coolers_heat_sinks: [
    {
      id: 'aavid-thermal',
      name: 'Aavid Thermalloy',
      location: 'Laconia, NH',
      risk: 3.8,
      cost: 80,
      quality: 94,
      leadTime: 30,
      description: 'Leading thermal management supplier',
      pros: ['US-based', 'Excellent engineering', 'Custom solutions', 'Fast delivery'],
      cons: ['Premium pricing', 'Complex designs increase cost']
    },
    {
      id: 'cooler-master',
      name: 'Cooler Master',
      location: 'Taipei, Taiwan',
      risk: 6.5,
      cost: 65,
      quality: 92,
      leadTime: 35,
      description: 'Major cooling solutions manufacturer',
      pros: ['Cost effective', 'High volume', 'Proven designs'],
      cons: ['Taiwan risk', 'Standard solutions', 'Less customization']
    },
    {
      id: 'noctua',
      name: 'Noctua',
      location: 'Vienna, Austria',
      risk: 3.5,
      cost: 95,
      quality: 97,
      leadTime: 40,
      description: 'Premium cooling solutions',
      pros: ['Highest performance', 'European supply', 'Best acoustics'],
      cons: ['Highest cost', 'Longer lead time', 'Limited volume']
    }
  ],

  final_assembly: [
    {
      id: 'foxconn-assembly',
      name: 'Foxconn',
      location: 'Shenzhen, China',
      risk: 7.5,
      cost: 100,
      quality: 95,
      leadTime: 25,
      description: 'Largest electronics manufacturer',
      pros: ['Massive scale', 'Lowest cost', 'Fast ramp', 'Proven processes'],
      cons: ['China geopolitical risk', 'Export controls', 'Labor concerns']
    },
    {
      id: 'pegatron-assembly',
      name: 'Pegatron',
      location: 'Taipei, Taiwan',
      risk: 6.8,
      cost: 110,
      quality: 94,
      leadTime: 30,
      description: 'Major Taiwan-based assembler',
      pros: ['Good quality', 'Competitive pricing', 'Flexible capacity'],
      cons: ['Taiwan concentration', 'Cross-strait exposure']
    },
    {
      id: 'flex-assembly',
      name: 'Flex Ltd',
      location: 'Austin, TX',
      risk: 4.2,
      cost: 130,
      quality: 93,
      leadTime: 28,
      description: 'US-based manufacturing services',
      pros: ['US location', 'No export restrictions', 'Stable operations', 'Quality focus'],
      cons: ['Higher labor costs', 'Smaller scale', 'Premium pricing']
    }
  ]
};

// Helper function to get choices for a component
export function getComponentChoices(componentId) {
  return componentChoices[componentId] || [];
}

// Helper function to calculate total risk score
export function calculateTotalRisk(selections) {
  const risks = Object.values(selections).map(choice => choice.risk);
  return risks.reduce((sum, risk) => sum + risk, 0) / risks.length;
}

// Helper function to calculate total cost
export function calculateTotalCost(selections) {
  return Object.values(selections).reduce((sum, choice) => sum + choice.cost, 0);
}

// Helper function to get maximum lead time
export function getMaxLeadTime(selections) {
  return Math.max(...Object.values(selections).map(choice => choice.leadTime));
}