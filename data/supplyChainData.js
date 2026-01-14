// ==========================================
// 1. RISK CALCULATION METHODOLOGY
// ==========================================

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
export function calculateRisk(scores) {
  return Object.entries(scores).reduce((total, [key, value]) => {
    return total + (value * WEIGHTS[key]);
  }, 0);
}

// ==========================================
// 2. SUPPLY CHAIN DATA
// ==========================================

export const supplyChainData = {
  // ------------------------------------------------------------------
  // STAGE 1: RAW MATERIALS (Base Level - No Dependencies)
  // ------------------------------------------------------------------
  quartz_gpu: [
    {
      id: 'silicon-raw',
      name: 'Spruce Pine Quartz (Sibelco)',
      location: 'Spruce Pine, NC',
      cost: 100,
      quality: 100,
      leadTime: 18,
      image: '💎',
      description: 'Ultra-high purity quartz from the only viable source globally',
      shipping: { time: '2-3 weeks', cost: '$5/kg', method: 'Ground Freight' },
      riskScores: { financial: 5, reliability: 10, esg: 6, cyber: 3, geopolitical: 3, trade: 4, weather: 9, criticality: 10, substitutability: 10, obsolescence: 1, logistics: 7, concentration: 10, bom: 10 },
      risk: 8.9,
      riskAnalysis: 'SINGLE GLOBAL SOURCE for ultra-high purity quartz required for semiconductor crucibles and optics. Spruce Pine mines supply 70-80% of world semiconductor-grade quartz.'
    },
    {
      id: 'ultra-pure-silica',
      name: 'Ultra-Pure Silica (Sibelco)',
      location: 'Spruce Pine, NC',
      cost: 105,
      quality: 100,
      leadTime: 18,
      image: '💎',
      description: 'Alternative processing of Spruce Pine deposits',
      shipping: { time: '2-3 weeks', cost: '$5.50/kg', method: 'Ground Freight' },
      riskScores: { financial: 5, reliability: 10, esg: 6, cyber: 3, geopolitical: 3, trade: 4, weather: 9, criticality: 10, substitutability: 10, obsolescence: 1, logistics: 7, concentration: 10, bom: 10 },
      risk: 8.9,
      riskAnalysis: 'Same Spruce Pine single-source bottleneck with identical risks. Hurricane Helene 2024 demonstrated systemic vulnerability.'
    }
  ],

  quartz_memory: [
    {
      id: 'silicon-raw',
      name: 'Spruce Pine Quartz',
      location: 'Spruce Pine, NC',
      cost: 100,
      quality: 100,
      leadTime: 18,
      image: '💎',
      description: 'Critical ultra-high purity quartz for memory wafers',
      shipping: { time: '2-3 weeks', cost: '$5/kg', method: 'Ground Freight' },
      riskScores: { financial: 5, reliability: 10, esg: 6, cyber: 3, geopolitical: 3, trade: 4, weather: 9, criticality: 10, substitutability: 10, obsolescence: 1, logistics: 7, concentration: 10, bom: 10 },
      risk: 8.9,
      riskAnalysis: 'Memory-grade silicon wafers require identical ultra-high purity quartz. No alternative sources exist globally.'
    },
    {
      id: 'ultra-pure-silica',
      name: 'Ultra-Pure Silica',
      location: 'Spruce Pine, NC',
      cost: 105,
      quality: 100,
      leadTime: 18,
      image: '💎',
      description: 'Specialized silica for memory applications',
      shipping: { time: '2-3 weeks', cost: '$5.50/kg', method: 'Ground Freight' },
      riskScores: { financial: 5, reliability: 10, esg: 6, cyber: 3, geopolitical: 3, trade: 4, weather: 9, criticality: 10, substitutability: 10, obsolescence: 1, logistics: 7, concentration: 10, bom: 10 },
      risk: 8.9,
      riskAnalysis: 'Specialized processing for memory applications does not overcome fundamental geographic concentration.'
    }
  ],

  polymers_photoresist: [
    {
      id: 'jsr-photoresist',
      name: 'JSR Corporation',
      location: 'Tokyo, Japan',
      cost: 120,
      quality: 95,
      leadTime: 45,
      image: '🧪',
      description: 'Leading EUV photoresist manufacturer',
      shipping: { time: '5-7 days', cost: '$15/liter', method: 'Air Freight (Hazmat)' },
      riskScores: { financial: 3, reliability: 7, esg: 4, cyber: 5, geopolitical: 6, trade: 7, weather: 8, criticality: 9, substitutability: 8, obsolescence: 2, logistics: 6, concentration: 8, bom: 8 },
      risk: 6.8,
      riskAnalysis: 'Market leader in EUV photoresist chemistry. Japanese concentration creates earthquake risks.'
    },
    {
      id: 'tokyo-ohka',
      name: 'Tokyo Ohka Kogyo',
      location: 'Kawasaki, Japan',
      cost: 115,
      quality: 92,
      leadTime: 40,
      image: '🧪',
      description: 'Comprehensive photoresist supplier',
      shipping: { time: '5-7 days', cost: '$14/liter', method: 'Air Freight (Hazmat)' },
      riskScores: { financial: 3, reliability: 6, esg: 4, cyber: 5, geopolitical: 6, trade: 6, weather: 8, criticality: 8, substitutability: 7, obsolescence: 2, logistics: 5, concentration: 7, bom: 7 },
      risk: 6.5,
      riskAnalysis: 'Comprehensive photoresist portfolio. Kawasaki location in greater Tokyo area creates identical seismic risks.'
    },
    {
      id: 'dupont-photoresist',
      name: 'DuPont Electronics',
      location: 'Marlborough, MA',
      cost: 125,
      quality: 90,
      leadTime: 35,
      image: '🧪',
      description: 'US alternative for advanced nodes',
      shipping: { time: '3-4 days', cost: '$12/liter', method: 'Ground Freight (Hazmat)' },
      riskScores: { financial: 3, reliability: 5, esg: 3, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 7, substitutability: 6, obsolescence: 3, logistics: 3, concentration: 5, bom: 6 },
      risk: 4.8,
      riskAnalysis: 'US-based photoresist manufacturing eliminates Asian geopolitical dependencies. Lower EUV market share.'
    }
  ],

  polymers_abf: [
    {
      id: 'ajinomoto-abf',
      name: 'Ajinomoto Build-up Film',
      location: 'Tokyo, Japan',
      cost: 110,
      quality: 98,
      leadTime: 50,
      image: '📄',
      description: 'Market leader in ABF film with 90%+ market share',
      shipping: { time: '7-10 days', cost: '$8/sqm', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 9, esg: 4, cyber: 4, geopolitical: 6, trade: 6, weather: 8, criticality: 10, substitutability: 9, obsolescence: 2, logistics: 6, concentration: 10, bom: 9 },
      risk: 7.2,
      riskAnalysis: 'Near-monopoly with 90%+ market share in advanced IC substrates. Tokyo location exposes to earthquake risks.'
    },
    {
      id: 'mitsubishi-abf',
      name: 'Mitsubishi Gas Chemical',
      location: 'Tokyo, Japan',
      cost: 115,
      quality: 92,
      leadTime: 55,
      image: '📄',
      description: 'Secondary ABF film supplier',
      shipping: { time: '7-10 days', cost: '$8.50/sqm', method: 'Air Freight' },
      riskScores: { financial: 4, reliability: 7, esg: 4, cyber: 4, geopolitical: 6, trade: 6, weather: 8, criticality: 8, substitutability: 8, obsolescence: 2, logistics: 6, concentration: 8, bom: 8 },
      risk: 6.8,
      riskAnalysis: 'Secondary supplier facing significant technical barriers. Tokyo location creates identical natural disaster exposure.'
    },
    {
      id: 'doosan-abf',
      name: 'Doosan Electronics',
      location: 'Seoul, South Korea',
      cost: 105,
      quality: 88,
      leadTime: 45,
      image: '📄',
      description: 'Emerging Korean ABF alternative',
      shipping: { time: '5-7 days', cost: '$7/sqm', method: 'Air Freight' },
      riskScores: { financial: 5, reliability: 6, esg: 5, cyber: 5, geopolitical: 6, trade: 5, weather: 5, criticality: 6, substitutability: 7, obsolescence: 3, logistics: 5, concentration: 6, bom: 7 },
      risk: 5.9,
      riskAnalysis: 'Korean supplier provides geographic diversification but performance gap remains.'
    }
  ],

  copper_resin: [
    {
      id: 'kyocera-ccl',
      name: 'Kyocera Chemical',
      location: 'Kyoto, Japan',
      cost: 95,
      quality: 95,
      leadTime: 35,
      image: '🔶',
      description: 'Premium copper clad laminate manufacturer',
      shipping: { time: '6-8 days', cost: '$6/sqm', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 6, esg: 4, cyber: 4, geopolitical: 5, trade: 5, weather: 7, criticality: 7, substitutability: 6, obsolescence: 3, logistics: 5, concentration: 6, bom: 7 },
      risk: 6.0,
      riskAnalysis: 'Premium CCL manufacturer. Kyoto location in seismically active region.'
    },
    {
      id: 'panasonic-ccl',
      name: 'Panasonic',
      location: 'Osaka, Japan',
      cost: 90,
      quality: 93,
      leadTime: 40,
      image: '🔶',
      description: 'Major CCL supplier with integrated materials',
      shipping: { time: '6-8 days', cost: '$5.50/sqm', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 6, esg: 4, cyber: 4, geopolitical: 5, trade: 5, weather: 7, criticality: 7, substitutability: 6, obsolescence: 3, logistics: 5, concentration: 7, bom: 7 },
      risk: 6.2,
      riskAnalysis: 'Vertically integrated. Osaka location shares Kyoto seismic risks.'
    },
    {
      id: 'isola-ccl',
      name: 'Isola Group',
      location: 'Chandler, AZ',
      cost: 100,
      quality: 90,
      leadTime: 30,
      image: '🔶',
      description: 'US-based laminate manufacturer',
      shipping: { time: '3-5 days', cost: '$5/sqm', method: 'Ground Freight' },
      riskScores: { financial: 4, reliability: 5, esg: 3, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 6, substitutability: 5, obsolescence: 3, logistics: 3, concentration: 4, bom: 6 },
      risk: 4.5,
      riskAnalysis: 'US-based manufacturing eliminates Asian geopolitical dependencies. Chandler location benefits from ecosystem.'
    }
  ],

  aluminium_copper: [
    {
      id: 'alcoa-metal',
      name: 'Alcoa Corporation',
      location: 'Pittsburgh, PA',
      cost: 85,
      quality: 92,
      leadTime: 25,
      image: '⚙️',
      description: 'Major aluminum producer with global operations',
      shipping: { time: '2-3 weeks', cost: '$2.50/kg', method: 'Ground/Rail Freight' },
      riskScores: { financial: 4, reliability: 5, esg: 5, cyber: 3, geopolitical: 2, trade: 3, weather: 4, criticality: 6, substitutability: 4, obsolescence: 2, logistics: 3, concentration: 4, bom: 6 },
      risk: 4.2,
      riskAnalysis: 'Global aluminum leader. US headquarters provide supply chain stability.'
    },
    {
      id: 'freeport-copper',
      name: 'Freeport-McMoRan',
      location: 'Phoenix, AZ',
      cost: 90,
      quality: 94,
      leadTime: 30,
      image: '⚙️',
      description: 'Leading copper producer',
      shipping: { time: '2-4 weeks', cost: '$3/kg', method: 'Ground/Rail Freight' },
      riskScores: { financial: 4, reliability: 5, esg: 6, cyber: 3, geopolitical: 3, trade: 4, weather: 5, criticality: 7, substitutability: 5, obsolescence: 2, logistics: 4, concentration: 5, bom: 6 },
      risk: 4.8,
      riskAnalysis: 'Leading copper producer. Global mining operations create geographic diversification.'
    },
    {
      id: 'rio-tinto',
      name: 'Rio Tinto',
      location: 'Multiple Global',
      cost: 88,
      quality: 93,
      leadTime: 35,
      image: '⚙️',
      description: 'Diversified metals and mining',
      shipping: { time: '3-5 weeks', cost: '$2.80/kg', method: 'Ocean/Rail Freight' },
      riskScores: { financial: 4, reliability: 5, esg: 6, cyber: 4, geopolitical: 5, trade: 5, weather: 5, criticality: 6, substitutability: 5, obsolescence: 2, logistics: 5, concentration: 5, bom: 6 },
      risk: 5.1,
      riskAnalysis: 'Globally diversified mining operations. Complex supply chain requires coordination.'
    }
  ],

  // ------------------------------------------------------------------
  // STAGE 2: FABRICATION (Limited by Stage 3 choices)
  // ------------------------------------------------------------------
  silicon_wafers_gpu: [
    {
      id: 'shin-etsu-wafer',
      name: 'Shin-Etsu Chemical',
      location: 'Vancouver, WA',
      cost: 150,
      quality: 98,
      leadTime: 90,
      image: '⚫',
      description: 'Global market leader with 30%+ share',
      shipping: { time: '1-2 weeks', cost: '$25/wafer', method: 'Specialized Air Freight' },
      riskScores: { financial: 3, reliability: 7, esg: 4, cyber: 4, geopolitical: 4, trade: 5, weather: 4, criticality: 9, substitutability: 8, obsolescence: 3, logistics: 6, concentration: 8, bom: 8 },
      risk: 6.7,
      riskAnalysis: 'Global market leader. Vancouver WA facility provides US production but company is Japanese-owned.'
    },
    {
      id: 'sumco-wafer',
      name: 'SUMCO Corporation',
      location: 'Imari, Japan',
      cost: 145,
      quality: 97,
      leadTime: 95,
      image: '⚫',
      description: 'Second-largest wafer supplier',
      shipping: { time: '10-14 days', cost: '$28/wafer', method: 'Specialized Air Freight' },
      riskScores: { financial: 4, reliability: 7, esg: 4, cyber: 4, geopolitical: 6, trade: 5, weather: 8, criticality: 9, substitutability: 8, obsolescence: 3, logistics: 6, concentration: 8, bom: 8 },
      risk: 6.9,
      riskAnalysis: 'Second-largest wafer supplier. Imari facility in Kyushu region subject to earthquakes.'
    },
    {
      id: 'globalwafers',
      name: 'GlobalWafers',
      location: 'Sherman, TX',
      cost: 140,
      quality: 94,
      leadTime: 85,
      image: '⚫',
      description: 'Third-largest with expanding US capacity',
      shipping: { time: '1 week', cost: '$22/wafer', method: 'Ground Freight' },
      riskScores: { financial: 4, reliability: 6, esg: 5, cyber: 4, geopolitical: 5, trade: 6, weather: 5, criticality: 8, substitutability: 7, obsolescence: 3, logistics: 6, concentration: 7, bom: 7 },
      risk: 6.1,
      riskAnalysis: 'Sherman TX facility reduces Taiwan concentration risk. Taiwan parent company.'
    }
  ],

  silicon_wafers_memory: [
    {
      id: 'shin-etsu-wafer',
      name: 'Shin-Etsu Chemical',
      location: 'Vancouver, WA',
      cost: 145,
      quality: 98,
      leadTime: 90,
      image: '⚫',
      description: 'Premium wafers for memory applications',
      shipping: { time: '1-2 weeks', cost: '$24/wafer', method: 'Specialized Air Freight' },
      riskScores: { financial: 3, reliability: 7, esg: 4, cyber: 4, geopolitical: 4, trade: 5, weather: 4, criticality: 9, substitutability: 8, obsolescence: 3, logistics: 6, concentration: 8, bom: 8 },
      risk: 6.7,
      riskAnalysis: 'Memory-optimized wafer specifications require best-in-class uniformity.'
    },
    {
      id: 'sk-siltron',
      name: 'SK Siltron',
      location: 'Gumi, South Korea',
      cost: 135,
      quality: 95,
      leadTime: 80,
      image: '⚫',
      description: 'Korean supplier with memory focus',
      shipping: { time: '7-10 days', cost: '$20/wafer', method: 'Air Freight' },
      riskScores: { financial: 4, reliability: 6, esg: 5, cyber: 5, geopolitical: 6, trade: 5, weather: 5, criticality: 7, substitutability: 7, obsolescence: 3, logistics: 5, concentration: 6, bom: 7 },
      risk: 5.9,
      riskAnalysis: 'Fifth-largest wafer supplier. Gumi location benefits from Korean semiconductor ecosystem.'
    },
    {
      id: 'sumco-wafer',
      name: 'SUMCO Corporation',
      location: 'Imari, Japan',
      cost: 140,
      quality: 97,
      leadTime: 95,
      image: '⚫',
      description: 'Established memory wafer supplier',
      shipping: { time: '10-14 days', cost: '$26/wafer', method: 'Specialized Air Freight' },
      riskScores: { financial: 4, reliability: 7, esg: 4, cyber: 4, geopolitical: 6, trade: 5, weather: 8, criticality: 9, substitutability: 8, obsolescence: 3, logistics: 6, concentration: 8, bom: 8 },
      risk: 6.9,
      riskAnalysis: 'Established supplier to major memory manufacturers with proven quality track record.'
    }
  ],

  photoresist: [
    {
      id: 'jsr-photoresist',
      name: 'JSR Corporation',
      location: 'Tokyo, Japan',
      cost: 200,
      quality: 96,
      leadTime: 45,
      image: '🧪',
      description: 'EUV photoresist leader',
      shipping: { time: '5-7 days', cost: '$18/liter', method: 'Air Freight (Hazmat)' },
      riskScores: { financial: 3, reliability: 7, esg: 4, cyber: 5, geopolitical: 6, trade: 7, weather: 8, criticality: 9, substitutability: 8, obsolescence: 2, logistics: 6, concentration: 8, bom: 8 },
      risk: 6.8,
      riskAnalysis: 'Market leader in EUV photoresist. Tokyo location creates earthquake, tsunami risk.'
    },
    {
      id: 'tokyo-ohka',
      name: 'Tokyo Ohka Kogyo',
      location: 'Kawasaki, Japan',
      cost: 185,
      quality: 93,
      leadTime: 40,
      image: '🧪',
      description: 'Comprehensive photoresist supplier',
      shipping: { time: '5-7 days', cost: '$16/liter', method: 'Air Freight (Hazmat)' },
      riskScores: { financial: 3, reliability: 6, esg: 4, cyber: 5, geopolitical: 6, trade: 6, weather: 8, criticality: 8, substitutability: 7, obsolescence: 2, logistics: 5, concentration: 7, bom: 7 },
      risk: 6.5,
      riskAnalysis: 'Kawasaki location creates identical seismic and weather risks.'
    },
    {
      id: 'dupont-photoresist',
      name: 'DuPont Electronics',
      location: 'Marlborough, MA',
      cost: 195,
      quality: 89,
      leadTime: 35,
      image: '🧪',
      description: 'US alternative for advanced nodes',
      shipping: { time: '3-4 days', cost: '$14/liter', method: 'Ground Freight (Hazmat)' },
      riskScores: { financial: 3, reliability: 5, esg: 3, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 7, substitutability: 6, obsolescence: 3, logistics: 3, concentration: 5, bom: 6 },
      risk: 4.8,
      riskAnalysis: 'US-based photoresist manufacturing eliminates Asian geopolitical dependencies.'
    }
  ],

  abf_film: [
    {
      id: 'ajinomoto-abf',
      name: 'Ajinomoto Build-up Film',
      location: 'Tokyo, Japan',
      cost: 180,
      quality: 98,
      leadTime: 50,
      image: '📄',
      description: 'Dominant ABF film supplier',
      shipping: { time: '7-10 days', cost: '$10/sqm', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 9, esg: 4, cyber: 4, geopolitical: 6, trade: 6, weather: 8, criticality: 10, substitutability: 9, obsolescence: 2, logistics: 6, concentration: 10, bom: 9 },
      risk: 7.2,
      riskAnalysis: 'Dominant market position with 90%+ share. Critical enabler for high-performance computing.'
    },
    {
      id: 'mitsubishi-abf',
      name: 'Mitsubishi Gas Chemical',
      location: 'Tokyo, Japan',
      cost: 190,
      quality: 92,
      leadTime: 55,
      image: '📄',
      description: 'Alternative ABF supplier',
      shipping: { time: '7-10 days', cost: '$11/sqm', method: 'Air Freight' },
      riskScores: { financial: 4, reliability: 7, esg: 4, cyber: 4, geopolitical: 6, trade: 6, weather: 8, criticality: 8, substitutability: 8, obsolescence: 2, logistics: 6, concentration: 8, bom: 8 },
      risk: 6.8,
      riskAnalysis: 'Secondary supplier. Serves primarily as backup source.'
    },
    {
      id: 'doosan-abf',
      name: 'Doosan Electronics',
      location: 'Seoul, South Korea',
      cost: 170,
      quality: 87,
      leadTime: 45,
      image: '📄',
      description: 'Emerging Korean supplier',
      shipping: { time: '5-7 days', cost: '$9/sqm', method: 'Air Freight' },
      riskScores: { financial: 5, reliability: 6, esg: 5, cyber: 5, geopolitical: 6, trade: 5, weather: 5, criticality: 6, substitutability: 7, obsolescence: 3, logistics: 5, concentration: 6, bom: 7 },
      risk: 5.9,
      riskAnalysis: 'Korean supplier provides critical geographic diversification from Japanese monopoly.'
    }
  ],

  copper_clad_laminates: [
    {
      id: 'kyocera-ccl',
      name: 'Kyocera Chemical',
      location: 'Kyoto, Japan',
      cost: 160,
      quality: 96,
      leadTime: 35,
      image: '🔶',
      description: 'Premium high-frequency laminates',
      shipping: { time: '6-8 days', cost: '$7/sqm', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 6, esg: 4, cyber: 4, geopolitical: 5, trade: 5, weather: 7, criticality: 7, substitutability: 6, obsolescence: 3, logistics: 5, concentration: 6, bom: 7 },
      risk: 6.0,
      riskAnalysis: 'Premium CCL manufacturer. Kyoto location subject to Nankai Trough earthquake risk.'
    },
    {
      id: 'panasonic-ccl',
      name: 'Panasonic',
      location: 'Osaka, Japan',
      cost: 150,
      quality: 94,
      leadTime: 40,
      image: '🔶',
      description: 'Integrated materials supplier',
      shipping: { time: '6-8 days', cost: '$6.50/sqm', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 6, esg: 4, cyber: 4, geopolitical: 5, trade: 5, weather: 7, criticality: 7, substitutability: 6, obsolescence: 3, logistics: 5, concentration: 7, bom: 7 },
      risk: 6.2,
      riskAnalysis: 'Vertically integrated capabilities. Osaka location shares Kansai region seismic vulnerability.'
    },
    {
      id: 'isola-ccl',
      name: 'Isola Group',
      location: 'Chandler, AZ',
      cost: 165,
      quality: 91,
      leadTime: 30,
      image: '🔶',
      description: 'US-based laminate manufacturer',
      shipping: { time: '3-5 days', cost: '$6/sqm', method: 'Ground Freight' },
      riskScores: { financial: 4, reliability: 5, esg: 3, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 6, substitutability: 5, obsolescence: 3, logistics: 3, concentration: 4, bom: 6 },
      risk: 4.5,
      riskAnalysis: 'US-based laminate manufacturing. Chandler location benefits from ecosystem.'
    }
  ],

  dram_cells: [
    {
      id: 'samsung-dram',
      name: 'Samsung Electronics',
      location: 'Pyeongtaek, South Korea',
      cost: 200,
      quality: 97,
      leadTime: 60,
      image: '🧠',
      description: 'Leading DRAM manufacturer',
      shipping: { time: '7-10 days', cost: '$30/unit', method: 'Air Freight' },
      riskScores: { financial: 2, reliability: 8, esg: 4, cyber: 5, geopolitical: 6, trade: 6, weather: 5, criticality: 9, substitutability: 7, obsolescence: 2, logistics: 5, concentration: 8, bom: 8 },
      risk: 6.2,
      riskAnalysis: 'Global DRAM market leader. Pyeongtaek facility represents world\'s largest semi fab site.'
    },
    {
      id: 'sk-hynix-dram',
      name: 'SK Hynix',
      location: 'Icheon, South Korea',
      cost: 195,
      quality: 96,
      leadTime: 65,
      image: '🧠',
      description: 'Major HBM supplier',
      shipping: { time: '7-10 days', cost: '$28/unit', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 8, esg: 4, cyber: 5, geopolitical: 6, trade: 6, weather: 5, criticality: 9, substitutability: 7, obsolescence: 2, logistics: 5, concentration: 8, bom: 8 },
      risk: 6.4,
      riskAnalysis: 'Second-largest DRAM manufacturer. Icheon campus concentration creates single-site dependency.'
    },
    {
      id: 'micron-dram',
      name: 'Micron Technology',
      location: 'Boise, ID',
      cost: 205,
      quality: 94,
      leadTime: 70,
      image: '🧠',
      description: 'US-based memory manufacturer',
      shipping: { time: '3-5 days', cost: '$25/unit', method: 'Ground/Air Freight' },
      riskScores: { financial: 3, reliability: 7, esg: 3, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 8, substitutability: 6, obsolescence: 2, logistics: 4, concentration: 6, bom: 7 },
      risk: 5.1,
      riskAnalysis: 'Only US-headquartered major DRAM manufacturer. Boise headquarters with global footprint.'
    }
  ],

  // ------------------------------------------------------------------
  // STAGE 3: COMPONENT (Constrained by Packaging, Constrains Materials)
  // ------------------------------------------------------------------
  gpu_die: [
    {
      id: 'tsmc',
      name: 'TSMC (4nm/5nm)',
      location: 'Hsinchu, Taiwan',
      cost: 1000,
      quality: 99,
      leadTime: 120,
      image: '🔲',
      description: 'Leading-edge GPU manufacturing',
      shipping: { time: '7-10 days', cost: '$150/unit', method: 'Secured Air Freight' },
      riskScores: { financial: 2, reliability: 10, esg: 4, cyber: 5, geopolitical: 10, trade: 9, weather: 7, criticality: 10, substitutability: 10, obsolescence: 1, logistics: 7, concentration: 10, bom: 10 },
      risk: 8.7,
      riskAnalysis: 'Absolute technology leadership. Taiwan geopolitical risk is existential.',
      // Logic: TSMC only validates specific high-grade wafer/resist suppliers
      validSources: {
        silicon_wafers_gpu: ['shin-etsu-wafer', 'sumco-wafer'],
        photoresist: ['jsr-photoresist', 'tokyo-ohka']
      }
    },
    {
      id: 'samsung',
      name: 'Samsung Foundry (4nm/5nm)',
      location: 'Hwaseong, South Korea',
      cost: 950,
      quality: 95,
      leadTime: 110,
      image: '🔲',
      description: 'Alternative advanced foundry',
      shipping: { time: '7-10 days', cost: '$140/unit', method: 'Secured Air Freight' },
      riskScores: { financial: 2, reliability: 7, esg: 4, cyber: 5, geopolitical: 6, trade: 6, weather: 5, criticality: 8, substitutability: 7, obsolescence: 2, logistics: 5, concentration: 7, bom: 7 },
      risk: 5.9,
      riskAnalysis: 'Second-largest advanced foundry. South Korea location provides diversification.',
      // Logic: Samsung prioritizes Korean ecosystem and specific partners
      validSources: {
        silicon_wafers_gpu: ['sk-siltron', 'shin-etsu-wafer'],
        photoresist: ['tokyo-ohka', 'dupont-photoresist']
      }
    },
    {
      id: 'intel-fab',
      name: 'Intel Foundry (Intel 4)',
      location: 'Chandler, AZ',
      cost: 1050,
      quality: 91,
      leadTime: 130,
      image: '🔲',
      description: 'US-based advanced foundry',
      shipping: { time: '3-5 days', cost: '$130/unit', method: 'Ground Freight' },
      riskScores: { financial: 4, reliability: 6, esg: 4, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 6, substitutability: 6, obsolescence: 3, logistics: 3, concentration: 5, bom: 6 },
      risk: 4.5,
      riskAnalysis: 'US-based advanced foundry eliminates geopolitical dependencies.',
      // Logic: Intel certifies US/EU sources alongside top tier Asian suppliers
      validSources: {
        silicon_wafers_gpu: ['globalwafers', 'shin-etsu-wafer'],
        photoresist: ['dupont-photoresist', 'tokyo-ohka']
      }
    }
  ],

  substrate_abf: [
    {
      id: 'ibiden-eds',
      name: 'Ibiden',
      location: 'Ogaki, Japan',
      cost: 220,
      quality: 98,
      leadTime: 75,
      image: '📐',
      description: 'Market leader in advanced substrates',
      shipping: { time: '8-10 days', cost: '$35/unit', method: 'Air Freight' },
      riskScores: { financial: 4, reliability: 7, esg: 4, cyber: 4, geopolitical: 5, trade: 5, weather: 8, criticality: 9, substitutability: 8, obsolescence: 3, logistics: 5, concentration: 8, bom: 7 },
      risk: 6.5,
      riskAnalysis: 'Market leader in high-end IC substrates. Ogaki facility concentration.',
      // Logic: High-end substrates require Ajinomoto film
      validSources: {
        abf_film: ['ajinomoto-abf'],
        copper_clad_laminates: ['kyocera-ccl', 'panasonic-ccl']
      }
    },
    {
      id: 'kyocera-eds',
      name: 'Kyocera',
      location: 'Kyoto, Japan',
      cost: 210,
      quality: 96,
      leadTime: 70,
      image: '📐',
      description: 'Major substrate manufacturer',
      shipping: { time: '8-10 days', cost: '$33/unit', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 6, esg: 4, cyber: 4, geopolitical: 5, trade: 5, weather: 7, criticality: 8, substitutability: 7, obsolescence: 3, logistics: 5, concentration: 7, bom: 7 },
      risk: 6.0,
      riskAnalysis: 'Major IC substrate manufacturer. Kyoto location in Kansai region.',
      // Logic: Kyocera prefers internal CCL
      validSources: {
        abf_film: ['ajinomoto-abf', 'mitsubishi-abf'],
        copper_clad_laminates: ['kyocera-ccl']
      }
    },
    {
      id: 'at&s-eds',
      name: 'AT&S',
      location: 'Chennai, India',
      cost: 195,
      quality: 91,
      leadTime: 80,
      image: '📐',
      description: 'European company with Indian operations',
      shipping: { time: '10-14 days', cost: '$28/unit', method: 'Air Freight' },
      riskScores: { financial: 5, reliability: 6, esg: 6, cyber: 6, geopolitical: 4, trade: 4, weather: 6, criticality: 6, substitutability: 5, obsolescence: 4, logistics: 7, concentration: 5, bom: 6 },
      risk: 5.5,
      riskAnalysis: 'Austrian company with strategic expansion into India.',
      // Logic: AT&S certifies alternative sources for cost/diversity
      validSources: {
        abf_film: ['doosan-abf', 'mitsubishi-abf'],
        copper_clad_laminates: ['isola-ccl', 'panasonic-ccl']
      }
    }
  ],

  hbm3e: [
    {
      id: 'sk-hynix-hbm',
      name: 'SK Hynix HBM3E',
      location: 'Icheon, South Korea',
      cost: 400,
      quality: 98,
      leadTime: 90,
      image: '🧱',
      description: 'HBM market leader',
      shipping: { time: '7-10 days', cost: '$60/unit', method: 'Secured Air Freight' },
      riskScores: { financial: 2, reliability: 9, esg: 4, cyber: 5, geopolitical: 6, trade: 6, weather: 5, criticality: 10, substitutability: 9, obsolescence: 1, logistics: 6, concentration: 9, bom: 9 },
      risk: 6.4,
      riskAnalysis: 'Market leader in HBM technology. Proven reliability for NVIDIA H100.',
      // Logic: HBM leader demands top tier memory wafers
      validSources: {
        silicon_wafers_memory: ['sk-siltron', 'shin-etsu-wafer'],
        polymers_photoresist: ['jsr-photoresist']
      }
    },
    {
      id: 'samsung-hbm',
      name: 'Samsung HBM3E',
      location: 'Pyeongtaek, South Korea',
      cost: 390,
      quality: 97,
      leadTime: 85,
      image: '🧱',
      description: 'Major HBM supplier',
      shipping: { time: '7-10 days', cost: '$58/unit', method: 'Secured Air Freight' },
      riskScores: { financial: 2, reliability: 8, esg: 4, cyber: 5, geopolitical: 6, trade: 6, weather: 5, criticality: 9, substitutability: 8, obsolescence: 1, logistics: 5, concentration: 8, bom: 9 },
      risk: 6.2,
      riskAnalysis: 'Second-largest HBM supplier. Pyeongtaek facility concentration.',
      // Logic: Samsung internal stack
      validSources: {
        silicon_wafers_memory: ['sumco-wafer', 'sk-siltron'],
        polymers_photoresist: ['tokyo-ohka']
      }
    },
    {
      id: 'micron-hbm',
      name: 'Micron HBM3E',
      location: 'Boise, ID',
      cost: 420,
      quality: 94,
      leadTime: 95,
      image: '🧱',
      description: 'US-based HBM supplier',
      shipping: { time: '3-5 days', cost: '$55/unit', method: 'Ground/Air Freight' },
      riskScores: { financial: 3, reliability: 7, esg: 3, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 7, substitutability: 7, obsolescence: 2, logistics: 4, concentration: 6, bom: 7 },
      risk: 5.1,
      riskAnalysis: 'US-based HBM supplier providing critical geographic diversification.',
      // Logic: Micron supports US supply chain where possible
      validSources: {
        silicon_wafers_memory: ['shin-etsu-wafer', 'sumco-wafer'],
        polymers_photoresist: ['dupont-photoresist']
      }
    }
  ],

  // ------------------------------------------------------------------
  // STAGE 4: PACKAGING (Constrains Stage 3)
  // ------------------------------------------------------------------
  packaging_merge: [
    {
      id: 'tsmc',
      name: 'TSMC CoWoS',
      location: 'Taichung, Taiwan',
      cost: 500,
      quality: 99,
      leadTime: 150,
      image: '📦',
      description: 'Industry-leading 2.5D packaging',
      shipping: { time: '7-10 days', cost: '$80/unit', method: 'Secured Air Freight' },
      riskScores: { financial: 2, reliability: 10, esg: 4, cyber: 5, geopolitical: 10, trade: 9, weather: 7, criticality: 10, substitutability: 10, obsolescence: 1, logistics: 7, concentration: 10, bom: 10 },
      risk: 8.7,
      riskAnalysis: 'ABSOLUTE MONOPOLY on advanced 2.5D/3D packaging technology.',
      // Logic: CoWoS generally implies TSMC silicon and top-tier HBM
      validSources: {
        gpu_die: ['tsmc'],
        hbm3e: ['sk-hynix-hbm', 'micron-hbm'],
        substrate_abf: ['ibiden-eds']
      }
    },
    {
      id: 'samsung',
      name: 'Samsung I-Cube',
      location: 'Seoul, South Korea',
      cost: 480,
      quality: 94,
      leadTime: 140,
      image: '📦',
      description: 'Alternative advanced packaging',
      shipping: { time: '7-10 days', cost: '$75/unit', method: 'Secured Air Freight' },
      riskScores: { financial: 2, reliability: 7, esg: 4, cyber: 5, geopolitical: 6, trade: 6, weather: 5, criticality: 8, substitutability: 7, obsolescence: 2, logistics: 5, concentration: 7, bom: 7 },
      risk: 5.9,
      riskAnalysis: 'Secondary advanced packaging provider. South Korea location.',
      // Logic: Samsung I-Cube is flexible but optimized for Samsung
      validSources: {
        gpu_die: ['samsung'],
        hbm3e: ['samsung-hbm'],
        substrate_abf: ['kyocera-eds', 'at&s-eds']
      }
    },
    {
      id: 'intel-foveros',
      name: 'Intel Foveros',
      location: 'Chandler, AZ',
      cost: 520,
      quality: 91,
      leadTime: 145,
      image: '📦',
      description: 'US-based 3D packaging',
      shipping: { time: '3-5 days', cost: '$70/unit', method: 'Ground Freight' },
      riskScores: { financial: 4, reliability: 6, esg: 4, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 6, substitutability: 6, obsolescence: 3, logistics: 3, concentration: 5, bom: 6 },
      risk: 4.5,
      riskAnalysis: 'US-based 3D packaging technology eliminates geopolitical dependencies.',
      // Logic: Foveros is heterogenous, allowing Intel or TSMC die
      validSources: {
        gpu_die: ['intel-fab', 'tsmc'],
        hbm3e: ['sk-hynix-hbm'],
        substrate_abf: ['ibiden-eds', 'at&s-eds']
      }
    }
  ],

  // ------------------------------------------------------------------
  // STAGE 5: FINAL ASSEMBLY
  // ------------------------------------------------------------------
  pcb_motherboard: [
    {
      id: 'unimicron-pcb',
      name: 'Unimicron',
      location: 'Taipei, Taiwan',
      cost: 150,
      quality: 96,
      leadTime: 45,
      image: '🟩',
      description: 'Largest PCB manufacturer globally',
      shipping: { time: '7-10 days', cost: '$20/unit', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 7, esg: 4, cyber: 5, geopolitical: 8, trade: 7, weather: 7, criticality: 8, substitutability: 6, obsolescence: 2, logistics: 6, concentration: 8, bom: 7 },
      risk: 7.2,
      riskAnalysis: 'Largest PCB manufacturer globally. Taipei location creates Taiwan concentration risk.'
    },
    {
      id: 'tripod-pcb',
      name: 'Tripod Technology',
      location: 'Taoyuan, Taiwan',
      cost: 145,
      quality: 94,
      leadTime: 40,
      image: '🟩',
      description: 'Major Taiwan PCB supplier',
      shipping: { time: '7-10 days', cost: '$18/unit', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 6, esg: 4, cyber: 5, geopolitical: 8, trade: 7, weather: 7, criticality: 7, substitutability: 6, obsolescence: 2, logistics: 6, concentration: 7, bom: 7 },
      risk: 7.0,
      riskAnalysis: 'Major Taiwan PCB supplier. Taoyuan location maintains Taiwan concentration risk.'
    },
    {
      id: 'ttm-pcb',
      name: 'TTM Technologies',
      location: 'Santa Ana, CA',
      cost: 165,
      quality: 91,
      leadTime: 35,
      image: '🟩',
      description: 'US-based PCB manufacturer',
      shipping: { time: '3-5 days', cost: '$15/unit', method: 'Ground Freight' },
      riskScores: { financial: 4, reliability: 5, esg: 3, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 6, substitutability: 5, obsolescence: 3, logistics: 3, concentration: 4, bom: 6 },
      risk: 4.3,
      riskAnalysis: 'Largest North American PCB manufacturer. Higher domestic costs.'
    }
  ],

  coolers_heat_sinks: [
    {
      id: 'aavid-thermal',
      name: 'Aavid Thermalloy',
      location: 'Laconia, NH',
      cost: 80,
      quality: 94,
      leadTime: 30,
      image: '❄️',
      description: 'Leading thermal management supplier',
      shipping: { time: '2-3 days', cost: '$8/unit', method: 'Ground Freight' },
      riskScores: { financial: 4, reliability: 4, esg: 3, cyber: 3, geopolitical: 2, trade: 2, weather: 3, criticality: 5, substitutability: 4, obsolescence: 4, logistics: 3, concentration: 3, bom: 5 },
      risk: 3.8,
      riskAnalysis: 'Leading thermal management supplier. New Hampshire US location.'
    },
    {
      id: 'cooler-master',
      name: 'Cooler Master',
      location: 'Taipei, Taiwan',
      cost: 65,
      quality: 92,
      leadTime: 35,
      image: '❄️',
      description: 'Major cooling solutions manufacturer',
      shipping: { time: '7-10 days', cost: '$10/unit', method: 'Ocean Freight' },
      riskScores: { financial: 3, reliability: 6, esg: 4, cyber: 4, geopolitical: 7, trade: 6, weather: 6, criticality: 6, substitutability: 5, obsolescence: 3, logistics: 5, concentration: 6, bom: 6 },
      risk: 6.5,
      riskAnalysis: 'Major cooling solutions manufacturer. Taipei location creates Taiwan concentration risk.'
    },
    {
      id: 'noctua',
      name: 'Noctua',
      location: 'Vienna, Austria',
      cost: 95,
      quality: 97,
      leadTime: 40,
      image: '❄️',
      description: 'Premium cooling solutions',
      shipping: { time: '5-7 days', cost: '$12/unit', method: 'Air Freight' },
      riskScores: { financial: 4, reliability: 4, esg: 3, cyber: 3, geopolitical: 2, trade: 2, weather: 3, criticality: 4, substitutability: 4, obsolescence: 4, logistics: 4, concentration: 3, bom: 5 },
      risk: 3.5,
      riskAnalysis:'Premium Austrian cooling specialist. Vienna location provides European stability.'
    }
  ],

  final_assembly: [
    {
      id: 'foxconn-assembly',
      name: 'Foxconn',
      location: 'Shenzhen, China',
      cost: 100,
      quality: 95,
      leadTime: 25,
      image: '🏭',
      description: 'Largest electronics manufacturer globally',
      shipping: { time: '10-14 days', cost: '$5/unit', method: 'Ocean Freight' },
      riskScores: { financial: 2, reliability: 8, esg: 6, cyber: 6, geopolitical: 9, trade: 10, weather: 5, criticality: 8, substitutability: 5, obsolescence: 2, logistics: 6, concentration: 7, bom: 7 },
      risk: 7.5,
      riskAnalysis: 'Largest electronics manufacturer globally. Shenzhen location creates significant geopolitical risk.',
      // Logic: Foxconn works best with Taiwan/Asian supply chain
      validSources: {
        pcb_motherboard: ['unimicron-pcb', 'tripod-pcb']
      }
    },
    {
      id: 'pegatron-assembly',
      name: 'Pegatron',
      location: 'Taipei, Taiwan',
      cost: 110,
      quality: 94,
      leadTime: 30,
      image: '🏭',
      description: 'Major Taiwan-based assembler',
      shipping: { time: '7-10 days', cost: '$6/unit', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 7, esg: 4, cyber: 5, geopolitical: 8, trade: 7, weather: 7, criticality: 7, substitutability: 6, obsolescence: 2, logistics: 5, concentration: 7, bom: 7 },
      risk: 6.8,
      riskAnalysis: 'Major Taiwan-based assembler. Cross-strait tensions create geopolitical consideration.',
      validSources: {
        pcb_motherboard: ['unimicron-pcb', 'tripod-pcb']
      }
    },
    {
      id: 'flex-assembly',
      name: 'Flex Ltd',
      location: 'Austin, TX',
      cost: 130,
      quality: 93,
      leadTime: 28,
      image: '🏭',
      description: 'US-based manufacturing services',
      shipping: { time: '2-3 days', cost: '$4/unit', method: 'Ground Freight' },
      riskScores: { financial: 3, reliability: 5, esg: 3, cyber: 4, geopolitical: 2, trade: 3, weather: 4, criticality: 6, substitutability: 5, obsolescence: 3, logistics: 3, concentration: 4, bom: 6 },
      risk: 4.2,
      riskAnalysis: 'US-based manufacturing services provider. Higher domestic labor costs.',
      validSources: {
        pcb_motherboard: ['ttm-pcb']
      }
    }
  ],

  // ------------------------------------------------------------------
  // ANCILLARY COMPONENTS
  // ------------------------------------------------------------------
  power_delivery: [
    {
      id: 'ti-power',
      name: 'Texas Instruments',
      location: 'Dallas, TX',
      cost: 45,
      quality: 97,
      leadTime: 20,
      image: '⚡',
      description: 'Leading power management semiconductor',
      shipping: { time: '2-3 days', cost: '$3/unit', method: 'Ground Freight' },
      riskScores: { financial: 2, reliability: 4, esg: 3, cyber: 3, geopolitical: 2, trade: 2, weather: 3, criticality: 7, substitutability: 5, obsolescence: 3, logistics: 3, concentration: 4, bom: 6 },
      risk: 4.0,
      riskAnalysis: 'Market leader in power management. Dallas headquarters.'
    },
    {
      id: 'infineon-power',
      name: 'Infineon Technologies',
      location: 'Munich, Germany',
      cost: 50,
      quality: 96,
      leadTime: 25,
      image: '⚡',
      description: 'European power semiconductor leader',
      shipping: { time: '5-7 days', cost: '$4/unit', method: 'Air Freight' },
      riskScores: { financial: 3, reliability: 5, esg: 3, cyber: 3, geopolitical: 2, trade: 3, weather: 3, criticality: 6, substitutability: 5, obsolescence: 3, logistics: 4, concentration: 4, bom: 6 },
      risk: 4.2,
      riskAnalysis: 'European power semiconductor leader. Munich headquarters.'
    },
    {
      id: 'on-semi-power',
      name: 'onsemi',
      location: 'Phoenix, AZ',
      cost: 42,
      quality: 94,
      leadTime: 22,
      image: '⚡',
      description: 'US power and sensing solutions',
      shipping: { time: '2-4 days', cost: '$3/unit', method: 'Ground Freight' },
      riskScores: { financial: 3, reliability: 5, esg: 3, cyber: 3, geopolitical: 2, trade: 2, weather: 3, criticality: 6, substitutability: 5, obsolescence: 3, logistics: 3, concentration: 4, bom: 5 },
      risk: 3.9,
      riskAnalysis: 'US-based power and sensing solutions provider. Phoenix Arizona operations.'
    }
  ],

  connectors_io: [
    {
      id: 'te-connectivity',
      name: 'TE Connectivity',
      location: 'Harrisburg, PA',
      cost: 35,
      quality: 95,
      leadTime: 18,
      image: '🔌',
      description: 'Global connectivity and sensor leader',
      shipping: { time: '2-3 days', cost: '$2/unit', method: 'Ground Freight' },
      riskScores: { financial: 3, reliability: 4, esg: 3, cyber: 3, geopolitical: 2, trade: 2, weather: 3, criticality: 5, substitutability: 4, obsolescence: 3, logistics: 3, concentration: 3, bom: 5 },
      risk: 3.5,
      riskAnalysis: 'Global connectivity leader. Pennsylvania headquarters.'
    },
    {
      id: 'molex',
      name: 'Molex',
      location: 'Lisle, IL',
      cost: 32,
      quality: 93,
      leadTime: 20,
      image: '🔌',
      description: 'Major connector manufacturer',
      shipping: { time: '3-4 days', cost: '$2/unit', method: 'Ground Freight' },
      riskScores: { financial: 3, reliability: 4, esg: 3, cyber: 3, geopolitical: 2, trade: 2, weather: 3, criticality: 5, substitutability: 4, obsolescence: 3, logistics: 3, concentration: 3, bom: 5 },
      risk: 3.5,
      riskAnalysis: 'Major connector manufacturer. Illinois headquarters.'
    },
    {
      id: 'amphenol',
      name: 'Amphenol',
      location: 'Wallingford, CT',
      cost: 38,
      quality: 96,
      leadTime: 22,
      image: '🔌',
      description: 'High-performance connector specialist',
      shipping: { time: '2-3 days', cost: '$2.50/unit', method: 'Ground Freight' },
      riskScores: { financial: 3, reliability: 4, esg: 3, cyber: 3, geopolitical: 2, trade: 2, weather: 3, criticality: 5, substitutability: 4, obsolescence: 3, logistics: 3, concentration: 3, bom: 5 },
      risk: 3.5,
      riskAnalysis: 'High-performance connector specialist. Connecticut headquarters.'
    }
  ],

  capacitors_passives: [
    {
      id: 'murata',
      name: 'Murata Manufacturing',
      location: 'Kyoto, Japan',
      cost: 25,
      quality: 98,
      leadTime: 30,
      image: '🔋',
      description: 'Global MLCC market leader',
      shipping: { time: '7-10 days', cost: '$1.50/unit', method: 'Air Freight' },
      riskScores: { financial: 2, reliability: 6, esg: 4, cyber: 4, geopolitical: 5, trade: 5, weather: 7, criticality: 8, substitutability: 6, obsolescence: 2, logistics: 5, concentration: 7, bom: 7 },
      risk: 5.9,
      riskAnalysis: 'Dominant MLCC manufacturer. Kyoto location creates earthquake risk.'
    },
    {
      id: 'samsung-electro',
      name: 'Samsung Electro-Mechanics',
      location: 'Suwon, South Korea',
      cost: 23,
      quality: 96,
      leadTime: 28,
      image: '🔋',
      description: 'Major MLCC and passive component supplier',
      shipping: { time: '7-10 days', cost: '$1.30/unit', method: 'Air Freight' },
      riskScores: { financial: 2, reliability: 6, esg: 4, cyber: 4, geopolitical: 6, trade: 5, weather: 5, criticality: 7, substitutability: 6, obsolescence: 2, logistics: 5, concentration: 6, bom: 7 },
      risk: 5.6,
      riskAnalysis: 'Second-largest MLCC manufacturer. Suwon location benefits from Samsung ecosystem.'
    },
    {
      id: 'kemet-yageo',
      name: 'KEMET (Yageo)',
      location: 'Fort Mill, SC',
      cost: 27,
      quality: 93,
      leadTime: 25,
      image: '🔋',
      description: 'US operations with Taiwan parent',
      shipping: { time: '2-3 days', cost: '$1/unit', method: 'Ground Freight' },
      riskScores: { financial: 3, reliability: 5, esg: 3, cyber: 4, geopolitical: 4, trade: 4, weather: 4, criticality: 6, substitutability: 5, obsolescence: 3, logistics: 3, concentration: 5, bom: 6 },
      risk: 4.5,
      riskAnalysis: 'US-based operations. Taiwan parent creates modest geopolitical consideration.'
    }
  ]
};

// ==========================================
// 3. LOGIC & HELPERS
// ==========================================

export const componentChoices = Object.keys(supplyChainData).reduce((acc, key) => {
  acc[key] = supplyChainData[key];
  return acc;
}, {});

// Standard getter
export function getComponentChoices(componentId) {
  return componentChoices[componentId] || [];
}

/**
 * Calculates valid options for a specific component category based on 
 * selections made at higher levels of the supply chain.
 * @param {string} targetCategory - The category ID we want to populate (e.g., 'gpu_die')
 * @param {object} currentSelections - Key-value pair of category:selectedItemObj
 * @returns {array} - Array of valid component objects
 */
export function getFilteredComponents(targetCategory, currentSelections) {
  const allOptions = supplyChainData[targetCategory] || [];
  let allowedIds = null;

  // Scan current selections for constraints
  Object.values(currentSelections).forEach(selection => {
    if (selection && selection.validSources && selection.validSources[targetCategory]) {
      const constraint = selection.validSources[targetCategory];
      
      if (allowedIds === null) {
        allowedIds = new Set(constraint);
      } else {
        // Intersect constraints if multiple parents restrict the same child
        const intersection = new Set(
          constraint.filter(x => allowedIds.has(x))
        );
        allowedIds = intersection;
      }
    }
  });

  // If no constraints exist, return all options
  if (allowedIds === null) {
    return allOptions;
  }

  // Otherwise filter
  return allOptions.filter(item => allowedIds.has(item.id));
}

/**
 * Validates the entire chain for compatibility conflicts
 */
export function validateSupplyChain(selections) {
  let errors = [];
  
  Object.entries(selections).forEach(([category, item]) => {
    if (item && item.validSources) {
      Object.entries(item.validSources).forEach(([childCategory, allowedIds]) => {
        const childSelection = selections[childCategory];
        if (childSelection && !allowedIds.includes(childSelection.id)) {
          errors.push(`Conflict: ${item.name} requires specific ${childCategory}, but ${childSelection.name} was selected.`);
        }
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function calculateTotalRisk(selections) {
  const risks = Object.values(selections).filter(x => x).map(choice => choice.risk);
  if (risks.length === 0) return 0;
  return risks.reduce((sum, risk) => sum + risk, 0) / risks.length;
}

export function calculateTotalCost(selections) {
  return Object.values(selections).filter(x => x).reduce((sum, choice) => sum + choice.cost, 0);
}

export function getMaxLeadTime(selections) {
  const times = Object.values(selections).filter(x => x).map(choice => choice.leadTime);
  if (times.length === 0) return 0;
  return Math.max(...times);
}