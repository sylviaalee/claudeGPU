export const supplyChainData = {
  gpus: [
    {
      id: 'h100',
      name: 'NVIDIA H100',
      image: '🎮',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara' }],
      next: ['tsmc', 'samsung']
    },
    {
      id: 'mi300',
      name: 'AMD MI300',
      image: '💻',
      locations: [{ lat: 37.3894, lng: -121.9700, name: 'AMD HQ, Santa Clara' }],
      next: ['tsmc', 'globalfoundries']
    },
    {
      id: 'a100',
      name: 'NVIDIA A100',
      image: '🖥️',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara' }],
      next: ['tsmc']
    }
  ],
  packaging: [
    {
      id: 'tsmc',
      name: 'TSMC Packaging',
      image: '📦',
      locations: [{ lat: 24.7814, lng: 120.9978, name: 'TSMC, Hsinchu, Taiwan' }],
      next: ['kyocera-eds', 'ibiden-eds']
    },
    {
      id: 'samsung',
      name: 'Samsung Packaging',
      image: '📦',
      locations: [{ lat: 37.2636, lng: 127.0286, name: 'Samsung, Suwon, South Korea' }],
      next: ['kyocera-eds']
    },
    {
      id: 'globalfoundries',
      name: 'GlobalFoundries',
      image: '📦',
      locations: [{ lat: 43.1030, lng: -73.7067, name: 'GlobalFoundries, Malta, NY' }],
      next: ['ibiden-eds']
    }
  ],
  eds: [
    {
      id: 'kyocera-eds',
      name: 'Kyocera EDS',
      image: '⚡',
      locations: [{ lat: 35.0116, lng: 135.7681, name: 'Kyocera, Kyoto, Japan' }],
      next: ['tanaka-wire', 'heraeus-wire']
    },
    {
      id: 'ibiden-eds',
      name: 'Ibiden EDS',
      image: '⚡',
      locations: [{ lat: 35.4231, lng: 136.7606, name: 'Ibiden, Gifu, Japan' }],
      next: ['tanaka-wire']
    }
  ],
  wiring: [
    {
      id: 'tanaka-wire',
      name: 'Tanaka Metals',
      image: '🔌',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Tanaka, Tokyo, Japan' }],
      next: ['applied-deposition', 'lam-deposition']
    },
    {
      id: 'heraeus-wire',
      name: 'Heraeus Metals',
      image: '🔌',
      locations: [{ lat: 50.1109, lng: 8.6821, name: 'Heraeus, Hanau, Germany' }],
      next: ['applied-deposition']
    }
  ],
  deposition: [
    {
      id: 'applied-deposition',
      name: 'Applied Materials',
      image: '💎',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara' }],
      next: ['lam-etch', 'tokyo-etch']
    },
    {
      id: 'lam-deposition',
      name: 'Lam Research',
      image: '💎',
      locations: [{ lat: 37.6688, lng: -121.7674, name: 'Lam Research, Fremont, CA' }],
      next: ['lam-etch']
    }
  ],
  etching: [
    {
      id: 'lam-etch',
      name: 'Lam Etching',
      image: '🔬',
      locations: [{ lat: 37.6688, lng: -121.7674, name: 'Lam Research, Fremont, CA' }],
      next: ['asml-litho', 'nikon-litho']
    },
    {
      id: 'tokyo-etch',
      name: 'Tokyo Electron',
      image: '🔬',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Tokyo Electron, Tokyo' }],
      next: ['asml-litho', 'canon-litho']
    }
  ],
  photolithography: [
    {
      id: 'asml-litho',
      name: 'ASML EUV',
      image: '💡',
      locations: [{ lat: 51.4416, lng: 5.4697, name: 'ASML, Veldhoven, Netherlands' }],
      next: ['applied-oxidation']
    },
    {
      id: 'nikon-litho',
      name: 'Nikon Lithography',
      image: '💡',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Nikon, Tokyo, Japan' }],
      next: ['applied-oxidation']
    },
    {
      id: 'canon-litho',
      name: 'Canon Lithography',
      image: '💡',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Canon, Tokyo, Japan' }],
      next: ['applied-oxidation']
    }
  ],
  oxidation: [
    {
      id: 'applied-oxidation',
      name: 'Applied Materials Oxidation',
      image: '🌡️',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara' }],
      next: ['shin-etsu-wafer', 'sumco-wafer']
    }
  ],
  wafer: [
    {
      id: 'shin-etsu-wafer',
      name: 'Shin-Etsu Wafers',
      image: '⚪',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Shin-Etsu, Tokyo, Japan' }],
      next: ['cadence-design', 'synopsys-design']
    },
    {
      id: 'sumco-wafer',
      name: 'SUMCO Wafers',
      image: '⚪',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'SUMCO, Tokyo, Japan' }],
      next: ['cadence-design']
    }
  ],
  design: [
    {
      id: 'cadence-design',
      name: 'Cadence Design',
      image: '🎨',
      locations: [{ lat: 37.3688, lng: -121.9785, name: 'Cadence, San Jose, CA' }],
      next: ['silicon-raw', 'polysilicon-raw']
    },
    {
      id: 'synopsys-design',
      name: 'Synopsys Design',
      image: '🎨',
      locations: [{ lat: 37.4047, lng: -121.9467, name: 'Synopsys, Mountain View, CA' }],
      next: ['silicon-raw']
    }
  ],
  raw: [
    {
      id: 'silicon-raw',
      name: 'Silicon Quartz',
      image: '💠',
      locations: [{ lat: -23.5505, lng: -46.6333, name: 'Quartz Mines, Brazil' }],
      next: []
    },
    {
      id: 'polysilicon-raw',
      name: 'Polysilicon',
      image: '💠',
      locations: [{ lat: 39.9042, lng: 116.4074, name: 'Polysilicon, China' }],
      next: []
    }
  ]
};