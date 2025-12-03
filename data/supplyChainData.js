export const supplyChainData = {
  gpus: [
    {
      id: 'h100',
      name: 'NVIDIA H100',
      image: '🎮',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc', 'samsung'],
      risk: 8,
      riskAnalysis: 'Heavy dependence on TSMC and Samsung advanced packaging; geopolitical tensions around Taiwan; high demand with limited production capacity'
    },
    {
      id: 'h200',
      name: 'NVIDIA H200',
      image: '🎮',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc'],
      risk: 9,
      riskAnalysis: 'Single-source dependency on TSMC CoWoS packaging; cutting-edge technology with no alternative suppliers; Taiwan geopolitical risk'
    },
    {
      id: 'mi300',
      name: 'AMD MI300',
      image: '💻',
      locations: [{ lat: 37.3894, lng: -121.9700, name: 'AMD HQ, Santa Clara, CA' }],
      next: ['tsmc', 'globalfoundries'],
      risk: 7,
      riskAnalysis: 'Primary reliance on TSMC with GlobalFoundries as backup; advanced 3D chiplet design complexity; Taiwan concentration risk mitigated by dual sourcing'
    },
    {
      id: 'mi250',
      name: 'AMD MI250',
      image: '💻',
      locations: [{ lat: 37.3894, lng: -121.9700, name: 'AMD HQ, Santa Clara, CA' }],
      next: ['tsmc', 'samsung'],
      risk: 6,
      riskAnalysis: 'Mature technology with dual-source options; TSMC and Samsung both capable; moderate geopolitical risk with diversification'
    },
    {
      id: 'a100',
      name: 'NVIDIA A100',
      image: '🖥️',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc'],
      risk: 7,
      riskAnalysis: 'Single TSMC dependency; proven mature technology reduces technical risk; Taiwan geopolitical exposure remains concern'
    },
    {
      id: 'l40s',
      name: 'NVIDIA L40S',
      image: '🖥️',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc', 'samsung'],
      risk: 6,
      riskAnalysis: 'Dual-source manufacturing capability; mainstream technology node; moderate supply chain flexibility'
    },
    {
      id: 'gaudi3',
      name: 'Intel Gaudi 3',
      image: '🔷',
      locations: [{ lat: 32.0853, lng: 34.7818, name: 'Intel Haifa, Israel' }],
      next: ['intel-fab', 'tsmc'],
      risk: 7,
      riskAnalysis: 'Middle East geopolitical instability; Intel internal fab provides some independence; TSMC backup option available'
    },
    {
      id: 'trainium2',
      name: 'AWS Trainium2',
      image: '☁️',
      locations: [{ lat: 37.4220, lng: -122.0841, name: 'AWS, Palo Alto, CA' }],
      next: ['tsmc'],
      risk: 8,
      riskAnalysis: 'Single TSMC dependency for custom silicon; proprietary design limits alternatives; Taiwan geopolitical concentration'
    },
    {
      id: 'tpu-v5',
      name: 'Google TPU v5',
      image: '🌐',
      locations: [{ lat: 37.4220, lng: -122.0841, name: 'Google, Mountain View, CA' }],
      next: ['tsmc', 'samsung'],
      risk: 7,
      riskAnalysis: 'Dual-source manufacturing strategy; custom architecture limits fab flexibility; moderate geopolitical exposure'
    }
  ],
  packaging: [
    {
      id: 'tsmc',
      name: 'TSMC CoWoS',
      image: '📦',
      locations: [
        { lat: 24.1477, lng: 120.6736, name: 'TSMC, Taichung, Taiwan' },
      ],
      next: ['kyocera-eds', 'ibiden-eds', 'at&s-eds'],
      risk: 9,
      riskAnalysis: 'Near-monopoly on advanced CoWoS packaging; critical single point of failure; Taiwan Strait geopolitical tensions; earthquake and typhoon exposure'
    },
    {
      id: 'samsung',
      name: 'Samsung I-Cube',
      image: '📦',
      locations: [
        { lat: 37.5665, lng: 126.9780, name: 'Samsung, Seoul, South Korea' }
      ],
      next: ['kyocera-eds', 'unimicron-eds'],
      risk: 6,
      riskAnalysis: 'Strong alternative to TSMC; South Korea political stability; North Korea proximity creates some risk; proven technology capability'
    },
    {
      id: 'intel-fab',
      name: 'Intel Foveros',
      image: '📦',
      locations: [
        { lat: 33.4484, lng: -112.0740, name: 'Intel, Chandler, AZ' }
      ],
      next: ['at&s-eds', 'ibiden-eds'],
      risk: 5,
      riskAnalysis: 'US-based manufacturing reduces geopolitical risk; Intel vertical integration provides stability; established Arizona fab infrastructure'
    },
    {
      id: 'globalfoundries',
      name: 'GlobalFoundries',
      image: '📦',
      locations: [
        { lat: 43.1030, lng: -73.7067, name: 'GlobalFoundries, Malta, NY' },
      ],
      next: ['ibiden-eds', 'unimicron-eds'],
      risk: 5,
      riskAnalysis: 'US domestic production; diversified facility locations; mature node focus reduces technical complexity; stable regulatory environment'
    },
    {
      id: 'umc',
      name: 'UMC Packaging',
      image: '📦',
      locations: [{ lat: 24.7814, lng: 120.9978, name: 'UMC, Hsinchu, Taiwan' }],
      next: ['unimicron-eds', 'nan-ya-eds'],
      risk: 8,
      riskAnalysis: 'Taiwan concentration risk; significant earthquake vulnerability; geopolitical tensions with China; alternative to TSMC but same location risk'
    }
  ],
  eds: [
    {
      id: 'kyocera-eds',
      name: 'Kyocera Substrate',
      image: '⚡',
      locations: [
        { lat: 35.0116, lng: 135.7681, name: 'Kyocera, Kyoto, Japan' },
      ],
      next: ['tanaka-wire', 'heraeus-wire', 'johnson-matthey-wire'],
      risk: 6,
      riskAnalysis: 'Japan earthquake and tsunami exposure; established manufacturer with strong quality; limited alternative suppliers for high-end substrates'
    },
    {
      id: 'ibiden-eds',
      name: 'Ibiden PCB',
      image: '⚡',
      locations: [
        { lat: 35.1815, lng: 136.9066, name: 'Ibiden, Ogaki, Japan' }
      ],
      next: ['tanaka-wire', 'hitachi-wire'],
      risk: 7,
      riskAnalysis: 'Critical supplier for advanced PCBs; Japan natural disaster vulnerability; high technical barriers to entry; limited capacity expansion options'
    },
    {
      id: 'unimicron-eds',
      name: 'Unimicron PCB',
      image: '⚡',
      locations: [
        { lat: 25.0330, lng: 121.5654, name: 'Unimicron, Taipei, Taiwan' },
      ],
      next: ['tanaka-wire', 'heraeus-wire'],
      risk: 8,
      riskAnalysis: 'Taiwan geopolitical concentration; major PCB supplier with limited alternatives; earthquake vulnerability; critical chokepoint in supply chain'
    },
    {
      id: 'at&s-eds',
      name: 'AT&S Substrate',
      image: '⚡',
      locations: [
        { lat: 13.0827, lng: 80.2707, name: 'AT&S, Chennai, India' }
      ],
      next: ['heraeus-wire', 'johnson-matthey-wire'],
      risk: 6,
      riskAnalysis: 'Geographic diversification benefit; India emerging as supply chain alternative; monsoon and infrastructure challenges; growing manufacturing capability'
    },
    {
      id: 'nan-ya-eds',
      name: 'Nan Ya PCB',
      image: '⚡',
      locations: [{ lat: 25.0330, lng: 121.5654, name: 'Nan Ya, Taipei, Taiwan' }],
      next: ['tanaka-wire'],
      risk: 7,
      riskAnalysis: 'Taiwan geopolitical and natural disaster exposure; established PCB manufacturer; limited geographic diversification options'
    }
  ],
  wiring: [
    {
      id: 'tanaka-wire',
      name: 'Tanaka Precious Metals',
      image: '🔌',
      locations: [
        { lat: 34.6937, lng: 135.5023, name: 'Tanaka, Osaka, Japan' }
      ],
      next: ['applied-deposition', 'lam-deposition', 'tokyo-deposition'],
      risk: 7,
      riskAnalysis: 'Specialized precious metals expertise; Japan earthquake risk; limited suppliers for ultra-high purity materials; gold/silver supply chain dependencies'
    },
    {
      id: 'heraeus-wire',
      name: 'Heraeus Electronics',
      image: '🔌',
      locations: [
        { lat: 50.1109, lng: 8.6821, name: 'Heraeus, Hanau, Germany' },
      ],
      next: ['applied-deposition', 'amat-deposition'],
      risk: 5,
      riskAnalysis: 'European geographic diversification; stable political environment; established precious metals supplier; strong quality control systems'
    },
    {
      id: 'johnson-matthey-wire',
      name: 'Johnson Matthey',
      image: '🔌',
      locations: [{ lat: 51.5074, lng: -0.1278, name: 'Johnson Matthey, London, UK' }],
      next: ['applied-deposition', 'lam-deposition'],
      risk: 5,
      riskAnalysis: 'UK-based with global operations; diversified precious metals portfolio; stable regulatory environment; multiple production sites worldwide'
    },
    {
      id: 'hitachi-wire',
      name: 'Hitachi Metals',
      image: '🔌',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Hitachi, Tokyo, Japan' }],
      next: ['tokyo-deposition', 'screen-deposition'],
      risk: 6,
      riskAnalysis: 'Japan natural disaster exposure; strong technical capabilities; integrated with Japanese semiconductor ecosystem; earthquake preparedness protocols'
    }
  ],
  deposition: [
    {
      id: 'applied-deposition',
      name: 'Applied Materials CVD',
      image: '💎',
      locations: [
        { lat: 30.2672, lng: -97.7431, name: 'Applied Materials, Austin, TX' }
      ],
      next: ['lam-etch', 'tokyo-etch', 'applied-etch'],
      risk: 6,
      riskAnalysis: 'US-based equipment manufacturer; market leader with strong support; some dependency on Asian component suppliers; weather-related facility risks'
    },
    {
      id: 'lam-deposition',
      name: 'Lam Research ALD',
      image: '💎',
      locations: [
        { lat: 45.5425, lng: -122.9505, name: 'Lam Research, Tualatin, OR' }
      ],
      next: ['lam-etch', 'applied-etch'],
      risk: 6,
      riskAnalysis: 'US Pacific Northwest location; critical ALD technology provider; moderate supply chain complexity; limited alternative suppliers for advanced nodes'
    },
    {
      id: 'tokyo-deposition',
      name: 'Tokyo Electron PVD',
      image: '💎',
      locations: [
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo Electron, Tokyo, Japan' },
      ],
      next: ['tokyo-etch', 'hitachi-etch'],
      risk: 6,
      riskAnalysis: 'Japan earthquake and natural disaster exposure; major equipment supplier to Asian fabs; strong technical capabilities; geographic concentration concern'
    },
    {
      id: 'amat-deposition',
      name: 'AMAT Endura',
      image: '💎',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' }],
      next: ['applied-etch', 'lam-etch'],
      risk: 6,
      riskAnalysis: 'Silicon Valley location benefits from ecosystem; earthquake risk in California; critical deposition equipment supplier; established global support network'
    },
    {
      id: 'screen-deposition',
      name: 'SCREEN SPE',
      image: '💎',
      locations: [{ lat: 35.0116, lng: 135.7681, name: 'SCREEN, Kyoto, Japan' }],
      next: ['tokyo-etch', 'hitachi-etch'],
      risk: 7,
      riskAnalysis: 'Specialized equipment niche player; Japan natural disaster vulnerability; limited alternative suppliers for specific processes; long lead times'
    }
  ],
  etching: [
    {
      id: 'lam-etch',
      name: 'Lam Kiyo Etch',
      image: '🔬',
      locations: [
        { lat: 37.3541, lng: 127.9458, name: 'Lam Research, Seoul, South Korea' }
      ],
      next: ['asml-litho', 'nikon-litho', 'canon-litho'],
      risk: 6,
      riskAnalysis: 'South Korea location near major fabs; North Korea proximity risk; market-leading etch technology; strong local support infrastructure'
    },
    {
      id: 'tokyo-etch',
      name: 'Tokyo Electron Etch',
      image: '🔬',
      locations: [
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo Electron, Tokyo, Japan' },
        { lat: 35.4437, lng: 139.6380, name: 'Tokyo Electron, Yamanashi, Japan' }
      ],
      next: ['asml-litho', 'canon-litho'],
      risk: 6,
      riskAnalysis: 'Multiple Japan locations provide some redundancy; earthquake preparedness; major etch equipment supplier; close partnerships with Asian fabs'
    },
    {
      id: 'applied-etch',
      name: 'Applied Materials Etch',
      image: '🔬',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' }],
      next: ['asml-litho', 'nikon-litho'],
      risk: 5,
      riskAnalysis: 'US-based with global support network; market leader in etch equipment; diversified product portfolio reduces single-point failure risk'
    },
    {
      id: 'hitachi-etch',
      name: 'Hitachi High-Tech Etch',
      image: '🔬',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Hitachi, Tokyo, Japan' }],
      next: ['canon-litho', 'nikon-litho'],
      risk: 6,
      riskAnalysis: 'Tokyo earthquake and tsunami vulnerability; specialized etch solutions for specific applications; integrated Japanese supply chain dependencies'
    }
  ],
  photolithography: [
    {
      id: 'asml-litho',
      name: 'ASML EUV Twinscan',
      image: '💡',
      locations: [
        { lat: 51.4416, lng: 5.4697, name: 'ASML, Veldhoven, Netherlands' },
      ],
      next: ['applied-oxidation', 'kokusai-oxidation'],
      risk: 10,
      riskAnalysis: 'ABSOLUTE MONOPOLY on EUV lithography; no alternatives exist for sub-7nm nodes; complex machine with 100,000+ parts from global suppliers; single facility concentration; 12-18 month lead times'
    },
    {
      id: 'nikon-litho',
      name: 'Nikon NSR Litho',
      image: '💡',
      locations: [
        { lat: 35.1815, lng: 136.9066, name: 'Nikon, Kumagaya, Japan' }
      ],
      next: ['applied-oxidation', 'tokyo-oxidation'],
      risk: 7,
      riskAnalysis: 'DUV lithography for mature nodes; Japan earthquake exposure; losing market share to ASML; limited to non-leading edge applications'
    },
    {
      id: 'canon-litho',
      name: 'Canon FPA Litho',
      image: '💡',
      locations: [
        { lat: 35.4437, lng: 139.6380, name: 'Canon, Utsunomiya, Japan' }
      ],
      next: ['applied-oxidation', 'tokyo-oxidation'],
      risk: 7,
      riskAnalysis: 'DUV and i-line lithography for mature nodes; Japan natural disaster vulnerability; niche player with limited leading-edge capability'
    }
  ],
  oxidation: [
    {
      id: 'applied-oxidation',
      name: 'Applied Materials Oxidation',
      image: '🌡️',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' }],
      next: ['shin-etsu-wafer', 'sumco-wafer', 'globalwafers'],
      risk: 5,
      riskAnalysis: 'US-based equipment leader; mature thermal oxidation technology; multiple global service centers; relatively lower technical barriers allow alternatives'
    },
    {
      id: 'kokusai-oxidation',
      name: 'Kokusai Electric',
      image: '🌡️',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Kokusai, Tokyo, Japan' }],
      next: ['shin-etsu-wafer', 'sumco-wafer'],
      risk: 6,
      riskAnalysis: 'Japan-based thermal processing specialist; earthquake exposure; strong presence in Asian fabs; batch furnace technology expertise'
    },
    {
      id: 'tokyo-oxidation',
      name: 'Tokyo Electron Thermal',
      image: '🌡️',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Tokyo Electron, Tokyo, Japan' }],
      next: ['sumco-wafer', 'siltronic-wafer'],
      risk: 6,
      riskAnalysis: 'Tokyo location natural disaster risk; integrated thermal solutions provider; close customer relationships in Asia; established technology platform'
    }
  ],
  wafer: [
    {
      id: 'shin-etsu-wafer',
      name: 'Shin-Etsu Chemical',
      image: '⚪',
      locations: [
        { lat: 47.6062, lng: -122.3321, name: 'Shin-Etsu, Vancouver, WA' }
      ],
      next: ['cadence-design', 'synopsys-design', 'mentor-design'],
      risk: 7,
      riskAnalysis: 'Market leader in silicon wafers; US facility but Japanese parent company; oligopoly market structure; long lead times for capacity expansion'
    },
    {
      id: 'sumco-wafer',
      name: 'SUMCO Corporation',
      image: '⚪',
      locations: [
        { lat: 34.3853, lng: 132.4553, name: 'SUMCO, Imari, Japan' }
      ],
      next: ['cadence-design', 'synopsys-design'],
      risk: 7,
      riskAnalysis: 'Second-largest wafer supplier; Japan earthquake and natural disaster exposure; oligopoly pricing power; limited alternatives for advanced wafers'
    },
    {
      id: 'globalwafers',
      name: 'GlobalWafers',
      image: '⚪',
      locations: [
        { lat: 30.2672, lng: -97.7431, name: 'GlobalWafers, Sherman, TX' }
      ],
      next: ['cadence-design', 'mentor-design'],
      risk: 6,
      riskAnalysis: 'Third-largest wafer supplier; US Texas facility; Taiwan parent company adds geopolitical consideration; expanding US production capacity'
    },
    {
      id: 'siltronic-wafer',
      name: 'Siltronic AG',
      image: '⚪',
      locations: [
        { lat: 48.1351, lng: 11.5820, name: 'Siltronic, Munich, Germany' },
      ],
      next: ['synopsys-design', 'cadence-design'],
      risk: 5,
      riskAnalysis: 'European supplier provides geographic diversity; stable German manufacturing environment; smaller market share reduces concentration risk'
    },
    {
      id: 'sk-siltron',
      name: 'SK Siltron',
      image: '⚪',
      locations: [{ lat: 37.2636, lng: 127.0286, name: 'SK Siltron, Gumi, South Korea' }],
      next: ['cadence-design', 'synopsys-design'],
      risk: 6,
      riskAnalysis: 'South Korean producer; North Korea proximity concern; acquired DuPont wafer business strengthens position; growing market presence'
    }
  ],
  design: [
    {
      id: 'cadence-design',
      name: 'Cadence Virtuoso',
      image: '🎨',
      locations: [
        { lat: 37.3688, lng: -121.9785, name: 'Cadence, San Jose, CA' },
      ],
      next: ['silicon-raw', 'polysilicon-raw', 'ultra-pure-silica'],
      risk: 4,
      riskAnalysis: 'Software-based EDA tools; cloud deployment options; US-based with global development teams; limited physical supply chain dependencies'
    },
    {
      id: 'synopsys-design',
      name: 'Synopsys Fusion',
      image: '🎨',
      locations: [
        { lat: 37.4047, lng: -121.9467, name: 'Synopsys, Mountain View, CA' },
      ],
      next: ['silicon-raw', 'polysilicon-raw'],
      risk: 4,
      riskAnalysis: 'Market-leading EDA software; Silicon Valley location; software nature reduces physical risks; strong IP portfolio and customer lock-in'
    },
    {
      id: 'mentor-design',
      name: 'Siemens EDA',
      image: '🎨',
      locations: [
        { lat: 45.5152, lng: -122.6784, name: 'Siemens EDA, Wilsonville, OR' },
      ],
      next: ['silicon-raw', 'ultra-pure-silica'],
      risk: 4,
      riskAnalysis: 'Siemens backing provides stability; software-based tools minimize supply chain risk; US operations with European parent company; diversified EDA portfolio'
    },
    {
      id: 'ansys-design',
      name: 'Ansys RedHawk',
      image: '🎨',
      locations: [{ lat: 40.4406, lng: -79.9959, name: 'Ansys, Canonsburg, PA' }],
      next: ['polysilicon-raw', 'silicon-raw'],
      risk: 4,
      riskAnalysis: 'Simulation software specialist; Pennsylvania headquarters; software distribution model reduces physical dependencies; established in power analysis'
    }
  ],
  raw: [
    {
      id: 'silicon-raw',
      name: 'Quartz Mining',
      image: '💠',
      locations: [
        { lat: 35.8617, lng: -78.5569, name: 'Quartz Mines, Spruce Pine, NC' },
      ],
      next: [],
      risk: 8,
      riskAnalysis: 'SINGLE SOURCE for ultra-high purity quartz worldwide; Spruce Pine mines supply 70-80% of global semiconductor-grade quartz; hurricane and flood exposure; irreplaceable resource concentration'
    },
    {
      id: 'polysilicon-raw',
      name: 'Polysilicon Production',
      image: '💠',
      locations: [
        { lat: 39.9042, lng: 116.4074, name: 'Daqo New Energy, Xinjiang, China' },
      ],
      next: [],
      risk: 9,
      riskAnalysis: 'Xinjiang region geopolitical concerns; forced labor allegations; US import restrictions; China dominates 80% of global polysilicon production; energy-intensive process'
    },
    {
      id: 'ultra-pure-silica',
      name: 'Ultra-Pure Silica',
      image: '💠',
      locations: [
        { lat: 35.8617, lng: -78.5569, name: 'Sibelco, Spruce Pine, NC' },
      ],
      next: [],
      risk: 8,
      riskAnalysis: 'Same Spruce Pine single-source bottleneck; critical for crucibles and optics; Hurricane Helene 2024 caused temporary shutdown; no viable alternatives worldwide'
    },
    {
      id: 'rare-earth',
      name: 'Rare Earth Elements',
      image: '💠',
      locations: [
        { lat: -34.6037, lng: 149.2642, name: 'Nolans Project, Northern Territory, Australia' },
      ],
      next: [],
      risk: 7,
      riskAnalysis: 'China controls 60% of global rare earth production; Australia developing alternatives; complex refining process; environmental concerns; export restrictions risk'
    },
    {
      id: 'copper-mining',
      name: 'Copper Mining',
      image: '💠',
      locations: [
        { lat: -22.9068, lng: -43.1729, name: 'Escondida, Chile' },
      ],
      next: [],
      risk: 6,
      riskAnalysis: 'Chile supplies 30% of global copper; water scarcity concerns; labor strike history; relatively diversified global production; well-established commodity market'
    },
    {
      id: 'gold-mining',
      name: 'Gold Mining',
      image: '💠',
      locations: [
        { lat: -26.2041, lng: 28.0473, name: 'Witwatersrand, South Africa' },
      ],
      next: [],
      risk: 6,
      riskAnalysis: 'South Africa political stability concerns; deep mining operational challenges; gold used in bonding wires; diversified global gold production; commodity market availability'
    }
  ]
};