export const supplyChainData = {
  gpus: [
    {
      id: 'h100',
      name: 'NVIDIA H100',
      image: '🎮',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc', 'samsung']
    },
    {
      id: 'h200',
      name: 'NVIDIA H200',
      image: '🎮',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc']
    },
    {
      id: 'mi300',
      name: 'AMD MI300',
      image: '💻',
      locations: [{ lat: 37.3894, lng: -121.9700, name: 'AMD HQ, Santa Clara, CA' }],
      next: ['tsmc', 'globalfoundries']
    },
    {
      id: 'mi250',
      name: 'AMD MI250',
      image: '💻',
      locations: [{ lat: 37.3894, lng: -121.9700, name: 'AMD HQ, Santa Clara, CA' }],
      next: ['tsmc', 'samsung']
    },
    {
      id: 'a100',
      name: 'NVIDIA A100',
      image: '🖥️',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc']
    },
    {
      id: 'l40s',
      name: 'NVIDIA L40S',
      image: '🖥️',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc', 'samsung']
    },
    {
      id: 'gaudi3',
      name: 'Intel Gaudi 3',
      image: '🔷',
      locations: [{ lat: 32.0853, lng: 34.7818, name: 'Intel Haifa, Israel' }],
      next: ['intel-fab', 'tsmc']
    },
    {
      id: 'trainium2',
      name: 'AWS Trainium2',
      image: '☁️',
      locations: [{ lat: 37.4220, lng: -122.0841, name: 'AWS, Palo Alto, CA' }],
      next: ['tsmc']
    },
    {
      id: 'tpu-v5',
      name: 'Google TPU v5',
      image: '🌐',
      locations: [{ lat: 37.4220, lng: -122.0841, name: 'Google, Mountain View, CA' }],
      next: ['tsmc', 'samsung']
    }
  ],
  packaging: [
    {
      id: 'tsmc',
      name: 'TSMC CoWoS',
      image: '📦',
      locations: [
        { lat: 24.7814, lng: 120.9978, name: 'TSMC, Hsinchu, Taiwan' },
        { lat: 24.1477, lng: 120.6736, name: 'TSMC, Taichung, Taiwan' },
        { lat: 22.9908, lng: 120.2133, name: 'TSMC, Tainan, Taiwan' }
      ],
      next: ['kyocera-eds', 'ibiden-eds', 'at&s-eds']
    },
    {
      id: 'samsung',
      name: 'Samsung I-Cube',
      image: '📦',
      locations: [
        { lat: 37.2636, lng: 127.0286, name: 'Samsung, Suwon, South Korea' },
        { lat: 37.5665, lng: 126.9780, name: 'Samsung, Seoul, South Korea' }
      ],
      next: ['kyocera-eds', 'unimicron-eds']
    },
    {
      id: 'intel-fab',
      name: 'Intel Foveros',
      image: '📦',
      locations: [
        { lat: 45.5425, lng: -122.9505, name: 'Intel, Hillsboro, OR' },
        { lat: 33.4484, lng: -112.0740, name: 'Intel, Chandler, AZ' }
      ],
      next: ['at&s-eds', 'ibiden-eds']
    },
    {
      id: 'globalfoundries',
      name: 'GlobalFoundries',
      image: '📦',
      locations: [
        { lat: 43.1030, lng: -73.7067, name: 'GlobalFoundries, Malta, NY' },
        { lat: 43.6532, lng: -79.3832, name: 'GlobalFoundries, Burlington, VT' }
      ],
      next: ['ibiden-eds', 'unimicron-eds']
    },
    {
      id: 'umc',
      name: 'UMC Packaging',
      image: '📦',
      locations: [{ lat: 24.7814, lng: 120.9978, name: 'UMC, Hsinchu, Taiwan' }],
      next: ['unimicron-eds', 'nan-ya-eds']
    }
  ],
  eds: [
    {
      id: 'kyocera-eds',
      name: 'Kyocera Substrate',
      image: '⚡',
      locations: [
        { lat: 35.0116, lng: 135.7681, name: 'Kyocera, Kyoto, Japan' },
        { lat: 34.6937, lng: 135.5023, name: 'Kyocera, Osaka, Japan' }
      ],
      next: ['tanaka-wire', 'heraeus-wire', 'johnson-matthey-wire']
    },
    {
      id: 'ibiden-eds',
      name: 'Ibiden PCB',
      image: '⚡',
      locations: [
        { lat: 35.4231, lng: 136.7606, name: 'Ibiden, Gifu, Japan' },
        { lat: 35.1815, lng: 136.9066, name: 'Ibiden, Ogaki, Japan' }
      ],
      next: ['tanaka-wire', 'hitachi-wire']
    },
    {
      id: 'unimicron-eds',
      name: 'Unimicron PCB',
      image: '⚡',
      locations: [
        { lat: 25.0330, lng: 121.5654, name: 'Unimicron, Taipei, Taiwan' },
        { lat: 24.1477, lng: 120.6736, name: 'Unimicron, Taoyuan, Taiwan' }
      ],
      next: ['tanaka-wire', 'heraeus-wire']
    },
    {
      id: 'at&s-eds',
      name: 'AT&S Substrate',
      image: '⚡',
      locations: [
        { lat: 47.0707, lng: 15.4395, name: 'AT&S, Leoben, Austria' },
        { lat: 13.0827, lng: 80.2707, name: 'AT&S, Chennai, India' }
      ],
      next: ['heraeus-wire', 'johnson-matthey-wire']
    },
    {
      id: 'nan-ya-eds',
      name: 'Nan Ya PCB',
      image: '⚡',
      locations: [{ lat: 25.0330, lng: 121.5654, name: 'Nan Ya, Taipei, Taiwan' }],
      next: ['tanaka-wire']
    }
  ],
  wiring: [
    {
      id: 'tanaka-wire',
      name: 'Tanaka Precious Metals',
      image: '🔌',
      locations: [
        { lat: 35.6762, lng: 139.6503, name: 'Tanaka, Tokyo, Japan' },
        { lat: 34.6937, lng: 135.5023, name: 'Tanaka, Osaka, Japan' }
      ],
      next: ['applied-deposition', 'lam-deposition', 'tokyo-deposition']
    },
    {
      id: 'heraeus-wire',
      name: 'Heraeus Electronics',
      image: '🔌',
      locations: [
        { lat: 50.1109, lng: 8.6821, name: 'Heraeus, Hanau, Germany' },
        { lat: 40.7128, lng: -74.0060, name: 'Heraeus, West Conshohocken, PA' }
      ],
      next: ['applied-deposition', 'amat-deposition']
    },
    {
      id: 'johnson-matthey-wire',
      name: 'Johnson Matthey',
      image: '🔌',
      locations: [{ lat: 51.5074, lng: -0.1278, name: 'Johnson Matthey, London, UK' }],
      next: ['applied-deposition', 'lam-deposition']
    },
    {
      id: 'hitachi-wire',
      name: 'Hitachi Metals',
      image: '🔌',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Hitachi, Tokyo, Japan' }],
      next: ['tokyo-deposition', 'screen-deposition']
    }
  ],
  deposition: [
    {
      id: 'applied-deposition',
      name: 'Applied Materials CVD',
      image: '💎',
      locations: [
        { lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' },
        { lat: 30.2672, lng: -97.7431, name: 'Applied Materials, Austin, TX' }
      ],
      next: ['lam-etch', 'tokyo-etch', 'applied-etch']
    },
    {
      id: 'lam-deposition',
      name: 'Lam Research ALD',
      image: '💎',
      locations: [
        { lat: 37.6688, lng: -121.7674, name: 'Lam Research, Fremont, CA' },
        { lat: 45.5425, lng: -122.9505, name: 'Lam Research, Tualatin, OR' }
      ],
      next: ['lam-etch', 'applied-etch']
    },
    {
      id: 'tokyo-deposition',
      name: 'Tokyo Electron PVD',
      image: '💎',
      locations: [
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo Electron, Tokyo, Japan' },
        { lat: 36.6953, lng: 137.2111, name: 'Tokyo Electron, Niigata, Japan' }
      ],
      next: ['tokyo-etch', 'hitachi-etch']
    },
    {
      id: 'amat-deposition',
      name: 'AMAT Endura',
      image: '💎',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' }],
      next: ['applied-etch', 'lam-etch']
    },
    {
      id: 'screen-deposition',
      name: 'SCREEN SPE',
      image: '💎',
      locations: [{ lat: 35.0116, lng: 135.7681, name: 'SCREEN, Kyoto, Japan' }],
      next: ['tokyo-etch', 'hitachi-etch']
    }
  ],
  etching: [
    {
      id: 'lam-etch',
      name: 'Lam Kiyo Etch',
      image: '🔬',
      locations: [
        { lat: 37.6688, lng: -121.7674, name: 'Lam Research, Fremont, CA' },
        { lat: 37.3541, lng: 127.9458, name: 'Lam Research, Seoul, South Korea' }
      ],
      next: ['asml-litho', 'nikon-litho', 'canon-litho']
    },
    {
      id: 'tokyo-etch',
      name: 'Tokyo Electron Etch',
      image: '🔬',
      locations: [
        { lat: 35.6762, lng: 139.6503, name: 'Tokyo Electron, Tokyo, Japan' },
        { lat: 35.4437, lng: 139.6380, name: 'Tokyo Electron, Yamanashi, Japan' }
      ],
      next: ['asml-litho', 'canon-litho']
    },
    {
      id: 'applied-etch',
      name: 'Applied Materials Etch',
      image: '🔬',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' }],
      next: ['asml-litho', 'nikon-litho']
    },
    {
      id: 'hitachi-etch',
      name: 'Hitachi High-Tech Etch',
      image: '🔬',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Hitachi, Tokyo, Japan' }],
      next: ['canon-litho', 'nikon-litho']
    }
  ],
  photolithography: [
    {
      id: 'asml-litho',
      name: 'ASML EUV Twinscan',
      image: '💡',
      locations: [
        { lat: 51.4416, lng: 5.4697, name: 'ASML, Veldhoven, Netherlands' },
        { lat: 37.7749, lng: -122.4194, name: 'ASML, San Diego, CA' }
      ],
      next: ['applied-oxidation', 'kokusai-oxidation']
    },
    {
      id: 'nikon-litho',
      name: 'Nikon NSR Litho',
      image: '💡',
      locations: [
        { lat: 35.6762, lng: 139.6503, name: 'Nikon, Tokyo, Japan' },
        { lat: 35.1815, lng: 136.9066, name: 'Nikon, Kumagaya, Japan' }
      ],
      next: ['applied-oxidation', 'tokyo-oxidation']
    },
    {
      id: 'canon-litho',
      name: 'Canon FPA Litho',
      image: '💡',
      locations: [
        { lat: 35.6762, lng: 139.6503, name: 'Canon, Tokyo, Japan' },
        { lat: 35.4437, lng: 139.6380, name: 'Canon, Utsunomiya, Japan' }
      ],
      next: ['applied-oxidation', 'tokyo-oxidation']
    }
  ],
  oxidation: [
    {
      id: 'applied-oxidation',
      name: 'Applied Materials Oxidation',
      image: '🌡️',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' }],
      next: ['shin-etsu-wafer', 'sumco-wafer', 'globalwafers']
    },
    {
      id: 'kokusai-oxidation',
      name: 'Kokusai Electric',
      image: '🌡️',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Kokusai, Tokyo, Japan' }],
      next: ['shin-etsu-wafer', 'sumco-wafer']
    },
    {
      id: 'tokyo-oxidation',
      name: 'Tokyo Electron Thermal',
      image: '🌡️',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Tokyo Electron, Tokyo, Japan' }],
      next: ['sumco-wafer', 'siltronic-wafer']
    }
  ],
  wafer: [
    {
      id: 'shin-etsu-wafer',
      name: 'Shin-Etsu Chemical',
      image: '⚪',
      locations: [
        { lat: 35.6762, lng: 139.6503, name: 'Shin-Etsu, Tokyo, Japan' },
        { lat: 36.6953, lng: 137.2111, name: 'Shin-Etsu, Niigata, Japan' },
        { lat: 47.6062, lng: -122.3321, name: 'Shin-Etsu, Vancouver, WA' }
      ],
      next: ['cadence-design', 'synopsys-design', 'mentor-design']
    },
    {
      id: 'sumco-wafer',
      name: 'SUMCO Corporation',
      image: '⚪',
      locations: [
        { lat: 35.6762, lng: 139.6503, name: 'SUMCO, Tokyo, Japan' },
        { lat: 34.3853, lng: 132.4553, name: 'SUMCO, Imari, Japan' }
      ],
      next: ['cadence-design', 'synopsys-design']
    },
    {
      id: 'globalwafers',
      name: 'GlobalWafers',
      image: '⚪',
      locations: [
        { lat: 24.1477, lng: 120.6736, name: 'GlobalWafers, Hsinchu, Taiwan' },
        { lat: 30.2672, lng: -97.7431, name: 'GlobalWafers, Sherman, TX' }
      ],
      next: ['cadence-design', 'mentor-design']
    },
    {
      id: 'siltronic-wafer',
      name: 'Siltronic AG',
      image: '⚪',
      locations: [
        { lat: 48.1351, lng: 11.5820, name: 'Siltronic, Munich, Germany' },
        { lat: 45.5425, lng: -122.9505, name: 'Siltronic, Portland, OR' }
      ],
      next: ['synopsys-design', 'cadence-design']
    },
    {
      id: 'sk-siltron',
      name: 'SK Siltron',
      image: '⚪',
      locations: [{ lat: 37.2636, lng: 127.0286, name: 'SK Siltron, Gumi, South Korea' }],
      next: ['cadence-design', 'synopsys-design']
    }
  ],
  design: [
    {
      id: 'cadence-design',
      name: 'Cadence Virtuoso',
      image: '🎨',
      locations: [
        { lat: 37.3688, lng: -121.9785, name: 'Cadence, San Jose, CA' },
        { lat: 30.2672, lng: -97.7431, name: 'Cadence, Austin, TX' }
      ],
      next: ['silicon-raw', 'polysilicon-raw', 'ultra-pure-silica']
    },
    {
      id: 'synopsys-design',
      name: 'Synopsys Fusion',
      image: '🎨',
      locations: [
        { lat: 37.4047, lng: -121.9467, name: 'Synopsys, Mountain View, CA' },
        { lat: 45.5425, lng: -122.9505, name: 'Synopsys, Hillsboro, OR' }
      ],
      next: ['silicon-raw', 'polysilicon-raw']
    },
    {
      id: 'mentor-design',
      name: 'Siemens EDA',
      image: '🎨',
      locations: [
        { lat: 45.5152, lng: -122.6784, name: 'Siemens EDA, Wilsonville, OR' },
        { lat: 37.3894, lng: -122.0819, name: 'Siemens EDA, Fremont, CA' }
      ],
      next: ['silicon-raw', 'ultra-pure-silica']
    },
    {
      id: 'ansys-design',
      name: 'Ansys RedHawk',
      image: '🎨',
      locations: [{ lat: 40.4406, lng: -79.9959, name: 'Ansys, Canonsburg, PA' }],
      next: ['polysilicon-raw', 'silicon-raw']
    }
  ],
  raw: [
    {
      id: 'silicon-raw',
      name: 'Quartz Mining',
      image: '💠',
      locations: [
        { lat: -23.5505, lng: -46.6333, name: 'Quartz Mines, São Paulo, Brazil' },
        { lat: 35.8617, lng: -78.5569, name: 'Quartz Mines, Spruce Pine, NC' },
        { lat: -33.9249, lng: 18.4241, name: 'Quartz Mines, Cape Town, South Africa' }
      ],
      next: []
    },
    {
      id: 'polysilicon-raw',
      name: 'Polysilicon Production',
      image: '💠',
      locations: [
        { lat: 39.9042, lng: 116.4074, name: 'Daqo New Energy, Xinjiang, China' },
        { lat: 48.7758, lng: 9.1829, name: 'Wacker Chemie, Burghausen, Germany' },
        { lat: 35.6762, lng: 139.6503, name: 'Tokuyama, Yamaguchi, Japan' }
      ],
      next: []
    },
    {
      id: 'ultra-pure-silica',
      name: 'Ultra-Pure Silica',
      image: '💠',
      locations: [
        { lat: 35.8617, lng: -78.5569, name: 'Sibelco, Spruce Pine, NC' },
        { lat: 60.1699, lng: 24.9384, name: 'Nordic Mining, Oslo, Norway' }
      ],
      next: []
    },
    {
      id: 'rare-earth',
      name: 'Rare Earth Elements',
      image: '💠',
      locations: [
        { lat: 40.8518, lng: 111.6706, name: 'Bayan Obo, Inner Mongolia, China' },
        { lat: -34.6037, lng: 149.2642, name: 'Nolans Project, Northern Territory, Australia' },
        { lat: 37.7749, lng: -122.4194, name: 'Mountain Pass, California, USA' }
      ],
      next: []
    },
    {
      id: 'copper-mining',
      name: 'Copper Mining',
      image: '💠',
      locations: [
        { lat: -22.9068, lng: -43.1729, name: 'Escondida, Chile' },
        { lat: -16.5000, lng: -68.1500, name: 'Collahuasi, Chile' },
        { lat: 33.2094, lng: -111.2653, name: 'Morenci, Arizona, USA' }
      ],
      next: []
    },
    {
      id: 'gold-mining',
      name: 'Gold Mining',
      image: '💠',
      locations: [
        { lat: -26.2041, lng: 28.0473, name: 'Witwatersrand, South Africa' },
        { lat: 64.7511, lng: -147.3494, name: 'Fort Knox, Alaska, USA' },
        { lat: -6.2088, lng: 106.8456, name: 'Grasberg, Papua, Indonesia' }
      ],
      next: []
    }
  ]
};