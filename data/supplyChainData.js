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
      cost: 100,
      quality: 100,
      leadTime: 18,
      image: '💎',
      description: 'Ultra-high purity quartz from the only viable source globally',
      shipping: {
        time: '2-3 weeks',
        cost: '$5/kg',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 5, reliability: 10, esg: 6, cyber: 3,
        geopolitical: 3, trade: 4, weather: 9,
        criticality: 10, substitutability: 10, obsolescence: 1,
        logistics: 7, concentration: 10, bom: 10
      },
      risk: 8.9,
      riskAnalysis: 'SINGLE GLOBAL SOURCE for ultra-high purity quartz required for semiconductor crucibles and optics. Spruce Pine mines supply 70-80% of world semiconductor-grade quartz. Hurricane Helene 2024 caused temporary shutdown demonstrating weather vulnerability. Unique geology makes these deposits irreplaceable - no known alternatives worldwide meet purity requirements (99.998%+). Single-point failure for entire global chip industry.'
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
      shipping: {
        time: '2-3 weeks',
        cost: '$5.50/kg',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 5, reliability: 10, esg: 6, cyber: 3,
        geopolitical: 3, trade: 4, weather: 9,
        criticality: 10, substitutability: 10, obsolescence: 1,
        logistics: 7, concentration: 10, bom: 10
      },
      risk: 8.9,
      riskAnalysis: 'Same Spruce Pine single-source bottleneck with identical risks. Hurricane Helene 2024 demonstrated systemic vulnerability of this geographic concentration. Alternative processing methods cannot overcome fundamental geology constraints - no viable substitutes worldwide meet required purity specifications.'
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
      shipping: {
        time: '2-3 weeks',
        cost: '$5/kg',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 5, reliability: 10, esg: 6, cyber: 3,
        geopolitical: 3, trade: 4, weather: 9,
        criticality: 10, substitutability: 10, obsolescence: 1,
        logistics: 7, concentration: 10, bom: 10
      },
      risk: 8.9,
      riskAnalysis: 'Memory-grade silicon wafers require identical ultra-high purity quartz from Spruce Pine deposits. No alternative sources exist globally that meet stringent contamination specifications for DRAM and NAND production. Geographic single-point-of-failure creates systemic risk across entire memory industry.'
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
      shipping: {
        time: '2-3 weeks',
        cost: '$5.50/kg',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 5, reliability: 10, esg: 6, cyber: 3,
        geopolitical: 3, trade: 4, weather: 9,
        criticality: 10, substitutability: 10, obsolescence: 1,
        logistics: 7, concentration: 10, bom: 10
      },
      risk: 8.9,
      riskAnalysis: 'Specialized processing for memory applications does not overcome fundamental geographic concentration at Spruce Pine. Memory-specific purity requirements even more stringent than logic applications. Any Spruce Pine disruption impacts global memory production capacity.'
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
      shipping: {
        time: '5-7 days',
        cost: '$15/liter',
        method: 'Air Freight (Hazmat)'
      },
      riskScores: {
        financial: 3, reliability: 7, esg: 4, cyber: 5,
        geopolitical: 6, trade: 7, weather: 8,
        criticality: 9, substitutability: 8, obsolescence: 2,
        logistics: 6, concentration: 8, bom: 8
      },
      risk: 6.8,
      riskAnalysis: 'Market leader in EUV photoresist chemistry with proven performance at 5nm and below. Japanese concentration creates earthquake, tsunami, and typhoon exposure. Export control restrictions affect technology transfer and China market access. Long qualification cycles (12-18 months) create switching barriers.'
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
      shipping: {
        time: '5-7 days',
        cost: '$14/liter',
        method: 'Air Freight (Hazmat)'
      },
      riskScores: {
        financial: 3, reliability: 6, esg: 4, cyber: 5,
        geopolitical: 6, trade: 6, weather: 8,
        criticality: 8, substitutability: 7, obsolescence: 2,
        logistics: 5, concentration: 7, bom: 7
      },
      risk: 6.5,
      riskAnalysis: 'Comprehensive photoresist portfolio across multiple technology nodes from mature to advanced. Kawasaki location in greater Tokyo area creates identical seismic and weather risks as other Japanese suppliers. Better availability due to less constrained capacity versus market leader.'
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
      shipping: {
        time: '3-4 days',
        cost: '$12/liter',
        method: 'Ground Freight (Hazmat)'
      },
      riskScores: {
        financial: 3, reliability: 5, esg: 3, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 7, substitutability: 6, obsolescence: 3,
        logistics: 3, concentration: 5, bom: 6
      },
      risk: 4.8,
      riskAnalysis: 'US-based photoresist manufacturing eliminates Asian geopolitical and natural disaster dependencies. Massachusetts location provides stable regulatory environment. Lower EUV market share reflects later technology entry versus Japanese incumbents. Growing investment in advanced photoresist chemistry supported by CHIPS Act.'
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
      shipping: {
        time: '7-10 days',
        cost: '$8/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 9, esg: 4, cyber: 4,
        geopolitical: 6, trade: 6, weather: 8,
        criticality: 10, substitutability: 9, obsolescence: 2,
        logistics: 6, concentration: 10, bom: 9
      },
      risk: 7.2,
      riskAnalysis: 'Near-monopoly with 90%+ market share in advanced IC substrates creates single-vendor dependency for global semiconductor packaging. Tokyo location exposes to earthquake, tsunami, and typhoon risks. Decades of R&D investment create insurmountable technical barriers. Critical for high-performance computing and AI accelerator packaging.'
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
      shipping: {
        time: '7-10 days',
        cost: '$8.50/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 4, reliability: 7, esg: 4, cyber: 4,
        geopolitical: 6, trade: 6, weather: 8,
        criticality: 8, substitutability: 8, obsolescence: 2,
        logistics: 6, concentration: 8, bom: 8
      },
      risk: 6.8,
      riskAnalysis: 'Secondary supplier attempting to break Ajinomoto monopoly but faces significant technical and market share gaps. Tokyo location creates identical natural disaster exposure. Long customer qualification cycles (2+ years) limit adoption velocity. Primarily serves as backup source rather than primary supplier.'
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
      shipping: {
        time: '5-7 days',
        cost: '$7/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 5, reliability: 6, esg: 5, cyber: 5,
        geopolitical: 6, trade: 5, weather: 5,
        criticality: 6, substitutability: 7, obsolescence: 3,
        logistics: 5, concentration: 6, bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Korean supplier provides geographic diversification from Japanese monopoly but performance gap remains. Cost competitiveness attractive but quality and reliability lag incumbents. Expanding capacity investments supported by Korean semiconductor ecosystem. Primarily qualified for mainstream applications rather than cutting-edge nodes.'
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
      shipping: {
        time: '6-8 days',
        cost: '$6/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 5, trade: 5, weather: 7,
        criticality: 7, substitutability: 6, obsolescence: 3,
        logistics: 5, concentration: 6, bom: 7
      },
      risk: 6.0,
      riskAnalysis: 'Premium CCL manufacturer with superior high-frequency performance for advanced applications. Kyoto location in seismically active region creates natural disaster exposure. Technical leadership in low-loss materials for high-speed signaling. Premium pricing reflects quality and performance characteristics.'
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
      shipping: {
        time: '6-8 days',
        cost: '$5.50/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 5, trade: 5, weather: 7,
        criticality: 7, substitutability: 6, obsolescence: 3,
        logistics: 5, concentration: 7, bom: 7
      },
      risk: 6.2,
      riskAnalysis: 'Vertically integrated materials capabilities provide cost advantages and supply security. Osaka location shares Kyoto seismic risks. Good availability and competitive pricing for mainstream applications. Limited cutting-edge capability versus specialized suppliers.'
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
      shipping: {
        time: '3-5 days',
        cost: '$5/sqm',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 4, reliability: 5, esg: 3, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 6, substitutability: 5, obsolescence: 3,
        logistics: 3, concentration: 4, bom: 6
      },
      risk: 4.5,
      riskAnalysis: 'US-based manufacturing eliminates Asian geopolitical and natural disaster dependencies. Chandler Arizona location benefits from semiconductor ecosystem. Faster delivery and responsive customer support. CHIPS Act and reshoring trends support growth prospects. Preferred supplier for defense and critical applications.'
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
      shipping: {
        time: '2-3 weeks',
        cost: '$2.50/kg',
        method: 'Ground/Rail Freight'
      },
      riskScores: {
        financial: 4, reliability: 5, esg: 5, cyber: 3,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 6, substitutability: 4, obsolescence: 2,
        logistics: 3, concentration: 4, bom: 6
      },
      risk: 4.2,
      riskAnalysis: 'Global aluminum leader with diversified production footprint. US headquarters provide supply chain stability. Energy-intensive operations sensitive to electricity costs. Environmental regulations increasing focus on low-carbon aluminum production. Multiple sourcing alternatives available in global aluminum market.'
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
      shipping: {
        time: '2-4 weeks',
        cost: '$3/kg',
        method: 'Ground/Rail Freight'
      },
      riskScores: {
        financial: 4, reliability: 5, esg: 6, cyber: 3,
        geopolitical: 3, trade: 4, weather: 5,
        criticality: 7, substitutability: 5, obsolescence: 2,
        logistics: 4, concentration: 5, bom: 6
      },
      risk: 4.8,
      riskAnalysis: 'Leading copper producer with high-purity grades suitable for semiconductor applications. Global mining operations create geographic diversification. Copper price volatility tied to industrial demand. Strong mining expertise and established refining capabilities. Commodity market liquidity provides multiple sourcing alternatives.'
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
      shipping: {
        time: '3-5 weeks',
        cost: '$2.80/kg',
        method: 'Ocean/Rail Freight'
      },
      riskScores: {
        financial: 4, reliability: 5, esg: 6, cyber: 4,
        geopolitical: 5, trade: 5, weather: 5,
        criticality: 6, substitutability: 5, obsolescence: 2,
        logistics: 5, concentration: 5, bom: 6
      },
      risk: 5.1,
      riskAnalysis: 'Globally diversified mining operations across multiple continents. Complex supply chain requires coordination across mining, refining, and logistics. Quality variability across deposits requires careful sourcing. ESG considerations increasingly important. Large scale provides supply reliability but operational complexity.'
    }
  ],

  // Stage 2: Component Fabrication
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
      shipping: {
        time: '1-2 weeks',
        cost: '$25/wafer',
        method: 'Specialized Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 7, esg: 4, cyber: 4,
        geopolitical: 4, trade: 5, weather: 4,
        criticality: 9, substitutability: 8, obsolescence: 3,
        logistics: 6, concentration: 8, bom: 8
      },
      risk: 6.7,
      riskAnalysis: 'Global market leader with 30%+ share in silicon wafers. Vancouver WA facility provides US production but company is Japanese-owned. Oligopoly market structure enables pricing power and allocation during shortages. 300mm wafer production requires $3-5B investment per fab limiting new entrants. Critical for all semiconductor manufacturing.'
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
      shipping: {
        time: '10-14 days',
        cost: '$28/wafer',
        method: 'Specialized Air Freight'
      },
      riskScores: {
        financial: 4, reliability: 7, esg: 4, cyber: 4,
        geopolitical: 6, trade: 5, weather: 8,
        criticality: 9, substitutability: 8, obsolescence: 3,
        logistics: 6, concentration: 8, bom: 8
      },
      risk: 6.9,
      riskAnalysis: 'Second-largest wafer supplier with 25%+ market share in global oligopoly. Imari facility in Kyushu region subject to earthquakes, tsunamis, and typhoons. Oligopoly structure enables allocation-based supply management during shortages. Geographic concentration in Japan creates correlated risk.'
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
      shipping: {
        time: '1 week',
        cost: '$22/wafer',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 4, reliability: 6, esg: 5, cyber: 4,
        geopolitical: 5, trade: 6, weather: 5,
        criticality: 8, substitutability: 7, obsolescence: 3,
        logistics: 6, concentration: 7, bom: 7
      },
      risk: 6.1,
      riskAnalysis: 'Third-largest wafer supplier expanding US production with CHIPS Act funding. Sherman TX facility reduces Taiwan concentration risk. Taiwan parent company creates some geopolitical consideration. Growing 300mm capacity addresses market needs. Quality improving through technology investments.'
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
      shipping: {
        time: '1-2 weeks',
        cost: '$24/wafer',
        method: 'Specialized Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 7, esg: 4, cyber: 4,
        geopolitical: 4, trade: 5, weather: 4,
        criticality: 9, substitutability: 8, obsolescence: 3,
        logistics: 6, concentration: 8, bom: 8
      },
      risk: 6.7,
      riskAnalysis: 'Memory-optimized wafer specifications require best-in-class uniformity and defect density. Vancouver WA production provides domestic supply security. Memory manufacturers require extremely tight specifications for DRAM and NAND yields. Technical expertise in crystal growth critical for memory applications.'
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
      shipping: {
        time: '7-10 days',
        cost: '$20/wafer',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 4, reliability: 6, esg: 5, cyber: 5,
        geopolitical: 6, trade: 5, weather: 5,
        criticality: 7, substitutability: 7, obsolescence: 3,
        logistics: 5, concentration: 6, bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Fifth-largest wafer supplier with strategic focus on memory applications. Gumi location benefits from Korean semiconductor ecosystem proximity to Samsung and SK Hynix. SK Group financial backing provides stability. Smaller scale versus top three suppliers but memory specialization creates niche.'
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
      shipping: {
        time: '10-14 days',
        cost: '$26/wafer',
        method: 'Specialized Air Freight'
      },
      riskScores: {
        financial: 4, reliability: 7, esg: 4, cyber: 4,
        geopolitical: 6, trade: 5, weather: 8,
        criticality: 9, substitutability: 8, obsolescence: 3,
        logistics: 6, concentration: 8, bom: 8
      },
      risk: 6.9,
      riskAnalysis: 'Established supplier to major memory manufacturers with proven quality track record. Large volume capability supports memory industry capacity needs. Memory-specific quality control processes ensure specification compliance. Geographic concentration in Japan limits diversification benefits.'
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
      shipping: {
        time: '5-7 days',
        cost: '$18/liter',
        method: 'Air Freight (Hazmat)'
      },
      riskScores: {
        financial: 3, reliability: 7, esg: 4, cyber: 5,
        geopolitical: 6, trade: 7, weather: 8,
        criticality: 9, substitutability: 8, obsolescence: 2,
        logistics: 6, concentration: 8, bom: 8
      },
      risk: 6.8,
      riskAnalysis: 'Market leader in EUV photoresist with best performance at cutting-edge nodes. Tokyo location creates earthquake, tsunami, and typhoon exposure. Export control restrictions affect China market access. Limited capacity creates allocation challenges. Premium pricing reflects technical leadership and supply constraints.'
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
      shipping: {
        time: '5-7 days',
        cost: '$16/liter',
        method: 'Air Freight (Hazmat)'
      },
      riskScores: {
        financial: 3, reliability: 6, esg: 4, cyber: 5,
        geopolitical: 6, trade: 6, weather: 8,
        criticality: 8, substitutability: 7, obsolescence: 2,
        logistics: 5, concentration: 7, bom: 7
      },
      risk: 6.5,
      riskAnalysis: 'Comprehensive photoresist portfolio across multiple technology nodes. Kawasaki location creates identical seismic and weather risks. Smaller market share in cutting-edge EUV applications. Better availability than JSR due to less constrained capacity. Japanese chemical industry expertise supports formulation development.'
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
      shipping: {
        time: '3-4 days',
        cost: '$14/liter',
        method: 'Ground Freight (Hazmat)'
      },
      riskScores: {
        financial: 3, reliability: 5, esg: 3, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 7, substitutability: 6, obsolescence: 3,
        logistics: 3, concentration: 5, bom: 6
      },
      risk: 4.8,
      riskAnalysis: 'US-based photoresist manufacturing eliminates Asian geopolitical and natural disaster dependencies. Massachusetts location provides stable regulatory environment. Lower EUV market share reflects later technology entry. Higher domestic manufacturing costs offset by supply chain security and faster delivery.'
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
      shipping: {
        time: '7-10 days',
        cost: '$10/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 9, esg: 4, cyber: 4,
        geopolitical: 6, trade: 6, weather: 8,
        criticality: 10, substitutability: 9, obsolescence: 2,
        logistics: 6, concentration: 10, bom: 9
      },
      risk: 7.2,
      riskAnalysis: 'Dominant market position with 90%+ share creates near-total dependency for advanced IC substrates globally. Tokyo location exposes to earthquake, tsunami, and typhoon risks. Allocation-based supply management during high demand. Critical enabler for high-performance computing and AI accelerators. Any significant disruption would halt global advanced packaging production.'
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
      shipping: {
        time: '7-10 days',
        cost: '$11/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 4, reliability: 7, esg: 4, cyber: 4,
        geopolitical: 6, trade: 6, weather: 8,
        criticality: 8, substitutability: 8, obsolescence: 2,
        logistics: 6, concentration: 8, bom: 8
      },
      risk: 6.8,
      riskAnalysis: 'Secondary supplier attempting to challenge Ajinomoto monopoly but faces significant technical and market share challenges. Tokyo location creates identical natural disaster exposure. Long customer qualification cycles (24+ months) limit market penetration velocity. Serves primarily as backup source.'
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
      shipping: {
        time: '5-7 days',
        cost: '$9/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 5, reliability: 6, esg: 5, cyber: 5,
        geopolitical: 6, trade: 5, weather: 5,
        criticality: 6, substitutability: 7, obsolescence: 3,
        logistics: 5, concentration: 6, bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Korean supplier provides critical geographic diversification from Japanese monopoly though performance and reliability gaps remain. Cost competitiveness attractive. Expanding capacity investments supported by Korean government. Primarily qualified for mainstream packaging applications. Represents best alternative for supply diversification strategy.'
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
      shipping: {
        time: '6-8 days',
        cost: '$7/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 5, trade: 5, weather: 7,
        criticality: 7, substitutability: 6, obsolescence: 3,
        logistics: 5, concentration: 6, bom: 7
      },
      risk: 6.0,
      riskAnalysis: 'Premium CCL manufacturer leveraging ceramic and advanced materials expertise for superior high-frequency performance. Kyoto location in Kansai region subject to Nankai Trough earthquake risk. Technical leadership in low-loss materials critical for high-speed server and networking applications. Premium pricing justified by electrical performance characteristics.'
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
      shipping: {
        time: '6-8 days',
        cost: '$6.50/sqm',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 5, trade: 5, weather: 7,
        criticality: 7, substitutability: 6, obsolescence: 3,
        logistics: 5, concentration: 7, bom: 7
      },
      risk: 6.2,
      riskAnalysis: 'Vertically integrated materials capabilities from resin chemistry through laminate production provide cost advantages and supply chain control. Osaka location shares Kansai region seismic vulnerability. Diversified electronics business provides financial stability but may result in capacity allocation trade-offs during component shortages. Good availability and competitive pricing.'
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
      shipping: {
        time: '3-5 days',
        cost: '$6/sqm',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 4, reliability: 5, esg: 3, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 6, substitutability: 5, obsolescence: 3,
        logistics: 3, concentration: 4, bom: 6
      },
      risk: 4.5,
      riskAnalysis: 'US-based laminate manufacturing eliminates Asian geopolitical dependencies. Chandler Arizona location benefits from established semiconductor ecosystem. Smaller market share in cutting-edge advanced packaging. Higher domestic labor costs impact pricing. Faster delivery times and responsive customer support. CHIPS Act funding supports growth. Preferred supplier for defense and aerospace applications.'
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
      shipping: {
        time: '7-10 days',
        cost: '$30/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 2, reliability: 8, esg: 4, cyber: 5,
        geopolitical: 6, trade: 6, weather: 5,
        criticality: 9, substitutability: 7, obsolescence: 2,
        logistics: 5, concentration: 8, bom: 8
      },
      risk: 6.2,
      riskAnalysis: 'Global DRAM market leader with cutting-edge process technology and largest production capacity. Pyeongtaek facility represents world\'s largest semiconductor fabrication site. Leading HBM technology for AI accelerators. North Korea proximity creates modest geopolitical consideration. Capacity constraints during AI boom create allocation challenges. Technology leadership in advanced DRAM nodes.'
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
      shipping: {
        time: '7-10 days',
        cost: '$28/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 8, esg: 4, cyber: 5,
        geopolitical: 6, trade: 6, weather: 5,
        criticality: 9, substitutability: 7, obsolescence: 2,
        logistics: 5, concentration: 8, bom: 8
      },
      risk: 6.4,
      riskAnalysis: 'Second-largest DRAM manufacturer with market-leading HBM technology position. Icheon campus concentration creates single-site dependency. Strong process yields and manufacturing excellence. HBM3E technology leadership critical for NVIDIA and AMD AI accelerator supply. Allocation-based supply management during high demand. SK Group financial backing provides stability.'
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
      shipping: {
        time: '3-5 days',
        cost: '$25/unit',
        method: 'Ground/Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 7, esg: 3, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 8, substitutability: 6, obsolescence: 2,
        logistics: 4, concentration: 6, bom: 7
      },
      risk: 5.1,
      riskAnalysis: 'Only US-headquartered major DRAM manufacturer providing critical supply chain diversification from Korean oligopoly. Boise Idaho headquarters with global manufacturing footprint. Smaller HBM market share but rapidly growing capabilities. Process technology lag versus Korean competitors but sufficient for most applications. No geopolitical risk from US ownership. CHIPS Act funding supports US manufacturing expansion.'
    }
  ],

  // Stage 3: Advanced Packaging Components
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
      shipping: {
        time: '7-10 days',
        cost: '$150/unit',
        method: 'Secured Air Freight'
      },
      riskScores: {
        financial: 2, reliability: 10, esg: 4, cyber: 5,
        geopolitical: 10, trade: 9, weather: 7,
        criticality: 10, substitutability: 10, obsolescence: 1,
        logistics: 7, concentration: 10, bom: 10
      },
      risk: 8.7,
      riskAnalysis: 'Absolute technology leadership in leading-edge logic manufacturing with proven 4nm/5nm process yields. Taiwan geopolitical risk from cross-strait tensions creates existential supply chain vulnerability. 90%+ market share for advanced AI accelerator production creates single-point-of-failure. Allocation-based supply management prioritizes strategic customers. No viable alternative exists for cutting-edge performance requirements. This represents THE critical bottleneck for AI infrastructure.'
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
      shipping: {
        time: '7-10 days',
        cost: '$140/unit',
        method: 'Secured Air Freight'
      },
      riskScores: {
        financial: 2, reliability: 7, esg: 4, cyber: 5,
        geopolitical: 6, trade: 6, weather: 5,
        criticality: 8, substitutability: 7, obsolescence: 2,
        logistics: 5, concentration: 7, bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Second-largest advanced foundry with growing 4nm/5nm capabilities but persistent yield challenges versus TSMC. South Korea location provides geopolitical diversification from Taiwan. Better availability than TSMC due to less constrained demand. Performance and power efficiency gap versus TSMC limits adoption. Represents best alternative for customers seeking TSMC alternatives despite technical limitations.'
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
      shipping: {
        time: '3-5 days',
        cost: '$130/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 4, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 6, substitutability: 6, obsolescence: 3,
        logistics: 3, concentration: 5, bom: 6
      },
      risk: 4.5,
      riskAnalysis: 'US-based advanced foundry eliminates geopolitical dependencies but limited third-party customer track record. Chandler Arizona operations benefit from established semiconductor ecosystem. Intel 4 process technology competitive but limited GPU manufacturing experience. Premium pricing reflects domestic manufacturing costs. CHIPS Act funding supports expansion but execution risk remains. Represents strategic option for customers prioritizing supply chain security.'
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
      shipping: {
        time: '8-10 days',
        cost: '$35/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 4, reliability: 7, esg: 4, cyber: 4,
        geopolitical: 5, trade: 5, weather: 8,
        criticality: 9, substitutability: 8, obsolescence: 3,
        logistics: 5, concentration: 8, bom: 7
      },
      risk: 6.5,
      riskAnalysis: 'Market leader in high-end IC substrates for processors with proprietary ALIVH (Any Layer Interstitial Via Hole) technology. Ogaki facility concentration creates single-point failure risk. Japan location subject to earthquake, tsunami, and typhoon exposure. Advanced any-layer via technology critical for high-performance computing thermal and electrical performance. Long-term supply agreements with Intel, AMD, and other processor manufacturers.'
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
      shipping: {
        time: '8-10 days',
        cost: '$33/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 5, trade: 5, weather: 7,
        criticality: 8, substitutability: 7, obsolescence: 3,
        logistics: 5, concentration: 7, bom: 7
      },
      risk: 6.0,
      riskAnalysis: 'Major IC substrate manufacturer leveraging ceramic and materials expertise for advanced packaging. Kyoto location in Kansai region creates similar seismic vulnerability as other Japanese suppliers. Fine-line lithography capabilities support high-density interconnect requirements. Good manufacturing capacity but still subject to industry-wide capacity constraints. Diversified ceramics and materials business provides financial stability.'
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
      shipping: {
        time: '10-14 days',
        cost: '$28/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 5, reliability: 6, esg: 6, cyber: 6,
        geopolitical: 4, trade: 4, weather: 6,
        criticality: 6, substitutability: 5, obsolescence: 4,
        logistics: 7, concentration: 5, bom: 6
      },
      risk: 5.5,
      riskAnalysis: 'Austrian company with strategic expansion into India providing critical geographic diversification from Asian concentration. Chennai facility part of broader "China Plus One" and supply chain resilience strategies. Infrastructure challenges including power reliability and logistics affect operational efficiency. Growing technical capabilities but still developing competencies for most advanced applications. Benefits from Indian government semiconductor manufacturing incentives.'
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
      shipping: {
        time: '7-10 days',
        cost: '$60/unit',
        method: 'Secured Air Freight'
      },
      riskScores: {
        financial: 2, reliability: 9, esg: 4, cyber: 5,
        geopolitical: 6, trade: 6, weather: 5,
        criticality: 10, substitutability: 9, obsolescence: 1,
        logistics: 6, concentration: 9, bom: 9
      },
      risk: 6.4,
      riskAnalysis: 'Market leader in HBM technology with highest bandwidth and most advanced packaging integration. Icheon campus concentration creates single-site dependency for majority of HBM3E production globally. Proven reliability and performance critical for NVIDIA H100/H200 supply. Tight allocation during AI boom creates severe supply constraints. Premium pricing reflects technology leadership and demand/supply imbalance. TSV technology and high-stack integration represent significant technical barriers.'
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
      shipping: {
        time: '7-10 days',
        cost: '$58/unit',
        method: 'Secured Air Freight'
      },
      riskScores: {
        financial: 2, reliability: 8, esg: 4, cyber: 5,
        geopolitical: 6, trade: 6, weather: 5,
        criticality: 9, substitutability: 8, obsolescence: 1,
        logistics: 5, concentration: 8, bom: 9
      },
      risk: 6.2,
      riskAnalysis: 'Second-largest HBM supplier with strong technology capabilities and large manufacturing capacity. Pyeongtaek facility concentration creates geographic dependency though different site than SK Hynix. Good process yields improving but initial qualification challenges with some customers. Technology roadmap competitive with SK Hynix. Korean concentration creates correlated geopolitical and natural disaster risk. Vertical integration advantages from DRAM leadership.'
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
      shipping: {
        time: '3-5 days',
        cost: '$55/unit',
        method: 'Ground/Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 7, esg: 3, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 7, substitutability: 7, obsolescence: 2,
        logistics: 4, concentration: 6, bom: 7
      },
      risk: 5.1,
      riskAnalysis: 'US-based HBM supplier providing critical geographic diversification from Korean oligopoly. Later market entry results in technology gap and smaller production capacity versus established competitors. Higher cost structure reflects domestic operations and development investments. No geopolitical risk from US ownership appeals to customers prioritizing supply chain security. Growing production capacity and customer qualifications but market share remains limited. CHIPS Act funding supports US manufacturing expansion.'
    }
  ],

  // Stage 4: Integration
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
      shipping: {
        time: '7-10 days',
        cost: '$80/unit',
        method: 'Secured Air Freight'
      },
      riskScores: {
        financial: 2, reliability: 10, esg: 4, cyber: 5,
        geopolitical: 10, trade: 9, weather: 7,
        criticality: 10, substitutability: 10, obsolescence: 1,
        logistics: 7, concentration: 10, bom: 10
      },
      risk: 8.7,
      riskAnalysis: 'ABSOLUTE MONOPOLY on advanced 2.5D/3D packaging technology - THE single point of failure for entire AI accelerator industry. CoWoS (Chip on Wafer on Substrate) capacity represents primary bottleneck for H100/H200 production globally, not wafer manufacturing. Capital intensity ($8-10B for new facility) and 24-30 month construction cycles severely limit expansion velocity. Taiwan concentration creates existential risk from cross-strait tensions, earthquakes, and typhoons. 70%+ market share for AI accelerator packaging with no viable short-term alternatives. This is THE critical chokepoint in global semiconductor supply chain.'
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
      shipping: {
        time: '7-10 days',
        cost: '$75/unit',
        method: 'Secured Air Freight'
      },
      riskScores: {
        financial: 2, reliability: 7, esg: 4, cyber: 5,
        geopolitical: 6, trade: 6, weather: 5,
        criticality: 8, substitutability: 7, obsolescence: 2,
        logistics: 5, concentration: 7, bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Secondary advanced packaging provider with I-Cube4 technology approaching CoWoS capabilities but execution gaps remain. South Korea location offers meaningful geopolitical diversification from Taiwan risk. Capacity constrained by capital allocation decisions prioritizing memory business over foundry services. Technical capabilities proven in lab but production scale and yield maturity lag TSMC. Customer qualification cycles extending 18-24 months limit rapid adoption. Represents best near-term alternative for customers seeking Taiwan risk mitigation.'
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
      shipping: {
        time: '3-5 days',
        cost: '$70/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 4, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 6, substitutability: 6, obsolescence: 3,
        logistics: 3, concentration: 5, bom: 6
      },
      risk: 4.5,
      riskAnalysis: 'US-based 3D packaging technology eliminates geopolitical dependencies but limited third-party foundry track record. Chandler operations benefit from established infrastructure. Foveros technology innovative for chiplet integration but less proven for GPU packaging. IFS strategy competes with internal priorities. Premium pricing reflects domestic costs and market positioning. CHIPS Act funding supports capacity expansion. Represents strategic option for customers prioritizing supply chain security over proven performance.'
    }
  ],

  // Stage 5: Final Assembly
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
      shipping: {
        time: '7-10 days',
        cost: '$20/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 7, esg: 4, cyber: 5,
        geopolitical: 8, trade: 7, weather: 7,
        criticality: 8, substitutability: 6, obsolescence: 2,
        logistics: 6, concentration: 8, bom: 7
      },
      risk: 7.2,
      riskAnalysis: 'Largest PCB manufacturer globally with leading technology for high-layer-count boards. Taipei location creates Taiwan concentration risk correlated with other critical components. Earthquake and typhoon exposure affects production continuity. Advanced HDI (High-Density Interconnect) capabilities essential for modern GPU cards. Market leader in server and high-end computing PCBs. Premium quality justifies higher pricing versus competitors.'
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
      shipping: {
        time: '7-10 days',
        cost: '$18/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 6, esg: 4, cyber: 5,
        geopolitical: 8, trade: 7, weather: 7,
        criticality: 7, substitutability: 6, obsolescence: 2,
        logistics: 6, concentration: 7, bom: 7
      },
      risk: 7.0,
      riskAnalysis: 'Major Taiwan PCB supplier with strong capabilities in multi-layer boards. Taoyuan location maintains Taiwan concentration risk. Good quality and competitive pricing for volume production. Faster turnaround than market leader. Technology capabilities sufficient for most GPU applications. Taiwan semiconductor ecosystem integration provides advantages. Same geopolitical and natural disaster exposure as Unimicron but different facility locations provide some risk mitigation.'
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
      shipping: {
        time: '3-5 days',
        cost: '$15/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 4, reliability: 5, esg: 3, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 6, substitutability: 5, obsolescence: 3,
        logistics: 3, concentration: 4, bom: 6
      },
      risk: 4.3,
      riskAnalysis: 'Largest North American PCB manufacturer providing domestic supply chain option. Santa Ana California operations eliminate Asian geopolitical dependencies. Higher domestic labor and regulatory costs impact pricing. Limited advanced capability for most complex GPU boards versus Taiwan leaders. Fast delivery and responsive engineering support for North American customers. Preferred supplier for defense and aerospace applications requiring domestic sourcing. ITAR compliance capabilities. Growing importance as customers seek supply chain resilience.'
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
      shipping: {
        time: '2-3 days',
        cost: '$8/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 4, reliability: 4, esg: 3, cyber: 3,
        geopolitical: 2, trade: 2, weather: 3,
        criticality: 5, substitutability: 4, obsolescence: 4,
        logistics: 3, concentration: 3, bom: 5
      },
      risk: 3.8,
      riskAnalysis: 'Leading thermal management supplier with extensive engineering expertise. New Hampshire US location provides stable operations and no geopolitical risk. Custom solution capabilities for high-power GPU cooling requirements. Excellent engineering support and rapid prototyping. Premium pricing reflects domestic manufacturing and engineering services. Fast delivery for North American customers. Preferred for complex thermal challenges requiring collaboration.'
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
      shipping: {
        time: '7-10 days',
        cost: '$10/unit',
        method: 'Ocean Freight'
      },
      riskScores: {
        financial: 3, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 7, trade: 6, weather: 6,
        criticality: 6, substitutability: 5, obsolescence: 3,
        logistics: 5, concentration: 6, bom: 6
      },
      risk: 6.5,
      riskAnalysis: 'Major cooling solutions manufacturer with high-volume production capabilities. Taipei location creates Taiwan concentration risk though less critical than semiconductors. Cost-effective solutions for standard cooling requirements. High-volume manufacturing expertise. Proven designs for consumer and commercial GPUs. Taiwan geopolitical risk consideration but cooling solutions have multiple alternatives. Standard solutions with limited customization options.'
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
      shipping: {
        time: '5-7 days',
        cost: '$12/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 4, reliability: 4, esg: 3, cyber: 3,
        geopolitical: 2, trade: 2, weather: 3,
        criticality: 4, substitutability: 4, obsolescence: 4,
        logistics: 4, concentration: 3, bom: 5
      },
      risk: 3.5,
      riskAnalysis:'Premium Austrian cooling specialist with exceptional performance and acoustics. Vienna location provides European supply chain stability with no geopolitical dependencies. Premium pricing reflects engineering excellence and low-volume specialized manufacturing. Exceptional thermal performance for high-power GPUs. Limited production capacity constrains availability for large-scale deployments. Preferred for premium and enthusiast applications where performance justifies cost.'
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
      shipping: {
        time: '10-14 days',
        cost: '$5/unit',
        method: 'Ocean Freight'
      },
      riskScores: {
        financial: 2, reliability: 8, esg: 6, cyber: 6,
        geopolitical: 9, trade: 10, weather: 5,
        criticality: 8, substitutability: 5, obsolescence: 2,
        logistics: 6, concentration: 7, bom: 7
      },
      risk: 7.5,
      riskAnalysis: 'Largest electronics manufacturer globally with unmatched scale and cost efficiency. Shenzhen location in China creates significant geopolitical risk from US-China trade tensions and potential export controls. Proven high-volume manufacturing processes and quality systems. Labor practice scrutiny and ESG concerns. Massive capacity enables rapid production ramp for large orders. Technology transfer and IP protection considerations. Export control compliance increasingly complex. Best cost structure but highest geopolitical risk profile.'
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
      shipping: {
        time: '7-10 days',
        cost: '$6/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 7, esg: 4, cyber: 5,
        geopolitical: 8, trade: 7, weather: 7,
        criticality: 7, substitutability: 6, obsolescence: 2,
        logistics: 5, concentration: 7, bom: 7
      },
      risk: 6.8,
      riskAnalysis: 'Major Taiwan-based assembler with strong capabilities in complex electronics. Taipei location creates Taiwan concentration risk correlated with semiconductor manufacturing. Good quality and competitive pricing for volume production. Flexible capacity allocation and responsive to customer needs. Cross-strait tensions create geopolitical consideration. Earthquake and typhoon exposure affects continuity planning. Better pricing than US alternatives but higher geopolitical risk. Integrated into Taiwan electronics ecosystem.'
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
      shipping: {
        time: '2-3 days',
        cost: '$4/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 3, reliability: 5, esg: 3, cyber: 4,
        geopolitical: 2, trade: 3, weather: 4,
        criticality: 6, substitutability: 5, obsolescence: 3,
        logistics: 3, concentration: 4, bom: 6
      },
      risk: 4.2,
      riskAnalysis: 'US-based manufacturing services provider eliminating Asian geopolitical dependencies. Austin Texas location benefits from established tech ecosystem and skilled workforce. Higher domestic labor costs impact pricing versus Asian alternatives. No export control restrictions or trade war exposure. Stable regulatory environment and strong IP protection. Quality focus and engineering collaboration capabilities. Fast delivery for North American customers. CHIPS Act and reshoring trends support growth. Preferred for defense, aerospace, and customers prioritizing supply chain security. Premium pricing justified by risk mitigation.'
    }
  ],

  // Additional component categories
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
      shipping: {
        time: '2-3 days',
        cost: '$3/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 2, reliability: 4, esg: 3, cyber: 3,
        geopolitical: 2, trade: 2, weather: 3,
        criticality: 7, substitutability: 5, obsolescence: 3,
        logistics: 3, concentration: 4, bom: 6
      },
      risk: 4.0,
      riskAnalysis: 'Market leader in power management with extensive product portfolio. Dallas headquarters with global manufacturing footprint including substantial US capacity. Excellent availability and competitive pricing. Long product lifecycles reduce obsolescence risk. Multiple alternative sources available for most applications. Strong technical support and design resources. Domestic manufacturing for critical components supported by CHIPS Act investments.'
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
      shipping: {
        time: '5-7 days',
        cost: '$4/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 3, reliability: 5, esg: 3, cyber: 3,
        geopolitical: 2, trade: 3, weather: 3,
        criticality: 6, substitutability: 5, obsolescence: 3,
        logistics: 4, concentration: 4, bom: 6
      },
      risk: 4.2,
      riskAnalysis: 'European power semiconductor leader with strong automotive and industrial heritage. Munich headquarters provides stable European supply chain. Premium efficiency and performance characteristics. Higher pricing reflects German engineering and manufacturing standards. Excellent technical support and co-development capabilities. European strategic autonomy initiatives support growth. Wide-bandgap semiconductor expertise positions well for next-generation power delivery.'
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
      shipping: {
        time: '2-4 days',
        cost: '$3/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 3, reliability: 5, esg: 3, cyber: 3,
        geopolitical: 2, trade: 2, weather: 3,
        criticality: 6, substitutability: 5, obsolescence: 3,
        logistics: 3, concentration: 4, bom: 5
      },
      risk: 3.9,
      riskAnalysis: 'US-based power and sensing solutions provider with competitive cost structure. Phoenix Arizona operations benefit from semiconductor ecosystem. Good availability and responsive customer support. Automotive qualification and reliability standards. Growing silicon carbide capabilities for high-efficiency applications. CHIPS Act funding supports US manufacturing expansion. Cost-effective alternative to premium European suppliers.'
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
      shipping: {
        time: '2-3 days',
        cost: '$2/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 3, reliability: 4, esg: 3, cyber: 3,
        geopolitical: 2, trade: 2, weather: 3,
        criticality: 5, substitutability: 4, obsolescence: 3,
        logistics: 3, concentration: 3, bom: 5
      },
      risk: 3.5,
      riskAnalysis: 'Global connectivity leader with comprehensive product portfolio. Pennsylvania headquarters with diversified global manufacturing. Excellent quality and reliability for critical applications. Multiple alternative connector solutions available in market. Strong design and engineering support. Automotive and aerospace qualifications demonstrate quality focus. Supply chain relatively low risk due to commoditized nature of many connector products.'
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
      shipping: {
        time: '3-4 days',
        cost: '$2/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 3, reliability: 4, esg: 3, cyber: 3,
        geopolitical: 2, trade: 2, weather: 3,
        criticality: 5, substitutability: 4, obsolescence: 3,
        logistics: 3, concentration: 3, bom: 5
      },
      risk: 3.5,
      riskAnalysis: 'Major connector manufacturer with broad product range and global presence. Illinois headquarters with extensive Asian manufacturing. Koch Industries ownership provides financial stability. Competitive pricing and good availability. Standard connector interfaces ensure multiple sourcing options. Fast delivery and responsive customer service for North American customers. Relatively low supply chain risk due to product commoditization and multiple alternatives.'
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
      shipping: {
        time: '2-3 days',
        cost: '$2.50/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 3, reliability: 4, esg: 3, cyber: 3,
        geopolitical: 2, trade: 2, weather: 3,
        criticality: 5, substitutability: 4, obsolescence: 3,
        logistics: 3, concentration: 3, bom: 5
      },
      risk: 3.5,
      riskAnalysis: 'High-performance connector specialist with focus on military, aerospace, and industrial applications. Connecticut headquarters with global manufacturing network. Premium quality and reliability justify higher pricing. Extensive engineering capabilities for custom solutions. Strong presence in defense and aerospace with ITAR compliance. Multiple sourcing alternatives available but premium applications may require specific Amphenol solutions. Overall supply chain risk remains moderate.'
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
      shipping: {
        time: '7-10 days',
        cost: '$1.50/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 2, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 5, trade: 5, weather: 7,
        criticality: 8, substitutability: 6, obsolescence: 2,
        logistics: 5, concentration: 7, bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Dominant MLCC (multilayer ceramic capacitor) manufacturer with 40%+ global market share. Kyoto location creates earthquake and typhoon exposure. Market leader in miniaturization and high-capacitance products. Allocation-based supply during capacity shortages. Critical for high-density GPU power delivery. Japanese concentration creates correlated risk with other key components. Premium quality commands premium pricing. Long lead times during tight markets.'
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
      shipping: {
        time: '7-10 days',
        cost: '$1.30/unit',
        method: 'Air Freight'
      },
      riskScores: {
        financial: 2, reliability: 6, esg: 4, cyber: 4,
        geopolitical: 6, trade: 5, weather: 5,
        criticality: 7, substitutability: 6, obsolescence: 2,
        logistics: 5, concentration: 6, bom: 7
      },
      risk: 5.6,
      riskAnalysis: 'Second-largest MLCC manufacturer with strong technology capabilities. Suwon location benefits from Samsung Group ecosystem. Competitive pricing and good availability. Technology roadmap competitive with Murata. Korean location provides some geographic diversification from Japan. Vertical integration with Samsung Electronics creates internal demand priority. Growing capacity investments support market growth. Alternative to Japanese suppliers for customers seeking diversification.'
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
      shipping: {
        time: '2-3 days',
        cost: '$1/unit',
        method: 'Ground Freight'
      },
      riskScores: {
        financial: 3, reliability: 5, esg: 3, cyber: 4,
        geopolitical: 4, trade: 4, weather: 4,
        criticality: 6, substitutability: 5, obsolescence: 3,
        logistics: 3, concentration: 5, bom: 6
      },
      risk: 4.5,
      riskAnalysis: 'US-based operations under Taiwan parent Yageo ownership. South Carolina manufacturing provides domestic supply option. Broader product portfolio including tantalum and polymer capacitors beyond MLCC focus. Smaller market share but better availability during allocation periods. Competitive pricing and fast delivery for North American customers. Taiwan parent creates modest geopolitical consideration. Good alternative for customers seeking supply chain diversification from Asian concentration.'
    }
  ]
};

// Export helper functions for component selection
export const componentChoices = {
  quartz_gpu: supplyChainData.quartz_gpu,
  quartz_memory: supplyChainData.quartz_memory,
  polymers_photoresist: supplyChainData.polymers_photoresist,
  polymers_abf: supplyChainData.polymers_abf,
  copper_resin: supplyChainData.copper_resin,
  aluminium_copper: supplyChainData.aluminium_copper,
  silicon_wafers_gpu: supplyChainData.silicon_wafers_gpu,
  silicon_wafers_memory: supplyChainData.silicon_wafers_memory,
  photoresist: supplyChainData.photoresist,
  abf_film: supplyChainData.abf_film,
  copper_clad_laminates: supplyChainData.copper_clad_laminates,
  dram_cells: supplyChainData.dram_cells,
  gpu_die: supplyChainData.gpu_die,
  substrate_abf: supplyChainData.substrate_abf,
  hbm3e: supplyChainData.hbm3e,
  packaging_merge: supplyChainData.packaging_merge,
  pcb_motherboard: supplyChainData.pcb_motherboard,
  coolers_heat_sinks: supplyChainData.coolers_heat_sinks,
  final_assembly: supplyChainData.final_assembly,
  power_delivery: supplyChainData.power_delivery,
  connectors_io: supplyChainData.connectors_io,
  capacitors_passives: supplyChainData.capacitors_passives
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