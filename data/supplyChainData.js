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
  gpus: [
    {
      id: 'h100',
      name: 'NVIDIA H100',
      image: '🎮',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc', 'samsung'],
      riskScores: {
        financial: 2, // NVIDIA strong financials, $1T+ market cap
        reliability: 9, // Single packaging source bottleneck (TSMC CoWoS)
        esg: 3, // Strong ESG reporting, supply chain transparency
        cyber: 4, // IP theft risk, export control compliance
        geopolitical: 7, // Taiwan dependency, US-China tensions
        trade: 8, // Export restrictions to China, CHIPS Act benefits
        weather: 4, // California earthquake, Taiwan typhoon exposure
        criticality: 10, // Highest demand AI accelerator globally
        substitutability: 9, // No equivalent alternatives exist
        obsolescence: 2, // Cutting-edge, not facing obsolescence
        logistics: 6, // Complex global distribution, air freight priority
        concentration: 9, // TSMC CoWoS monopoly for packaging
        bom: 8 // High downstream dependency
      },
      risk: 7.4,
      riskAnalysis: 'Critical dependency on TSMC 4N process node with CoWoS-S advanced packaging. Supply constrained by packaging capacity bottlenecks rather than wafer production. Cross-strait tensions create material geopolitical exposure. Samsung serves as secondary source but lacks equivalent packaging maturity. Lead times exceed 6-9 months with allocation-based supply management.'
    },
    {
      id: 'h200',
      name: 'NVIDIA H200',
      image: '🎮',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc'],
      riskScores: {
        financial: 2,
        reliability: 10, // Absolute single source (TSMC CoWoS-L)
        esg: 3,
        cyber: 4,
        geopolitical: 8, // Taiwan single source
        trade: 8,
        weather: 4,
        criticality: 10, // Most advanced AI chip
        substitutability: 10, // Zero alternatives
        obsolescence: 1, // Newest technology
        logistics: 7, // Extremely constrained allocation
        concentration: 10, // Single source packaging
        bom: 9
      },
      risk: 8.2,
      riskAnalysis: 'Single-source dependency on TSMC CoWoS-L packaging with HBM3e integration. No qualified alternative suppliers for this configuration. Taiwan geopolitical risk compounded by technical complexity and 12+ month lead times. Capacity expansion limited by clean room construction cycles and equipment availability. Represents highest concentration risk in AI accelerator portfolio.'
    },
    {
      id: 'mi300',
      name: 'AMD MI300',
      image: '💻',
      locations: [{ lat: 37.3894, lng: -121.9700, name: 'AMD HQ, Santa Clara, CA' }],
      next: ['tsmc', 'globalfoundries'],
      riskScores: {
        financial: 3, // Strong but less than NVIDIA
        reliability: 7, // Dual source but TSMC primary
        esg: 4,
        cyber: 4,
        geopolitical: 6, // Taiwan primary, US backup
        trade: 7,
        weather: 4,
        criticality: 8, // Strong H100 competitor
        substitutability: 7, // Limited alternatives
        obsolescence: 2,
        logistics: 5,
        concentration: 7, // TSMC dominant
        bom: 7
      },
      risk: 6.4,
      riskAnalysis: 'Primary reliance on TSMC 5nm/6nm with 3D chiplet integration using organic interposer technology. GlobalFoundries provides I/O die manufacturing at mature nodes, creating partial supply diversification. Multi-die architecture increases test complexity and yield challenges. Taiwan concentration for advanced nodes partially offset by domestic I/O production.'
    },
    {
      id: 'mi250',
      name: 'AMD MI250',
      image: '💻',
      locations: [{ lat: 37.3894, lng: -121.9700, name: 'AMD HQ, Santa Clara, CA' }],
      next: ['tsmc', 'samsung'],
      riskScores: {
        financial: 3,
        reliability: 5, // True dual source capability
        esg: 4,
        cyber: 4,
        geopolitical: 5, // Diversified Taiwan/Korea
        trade: 6,
        weather: 4,
        criticality: 6, // Mature generation
        substitutability: 6, // Some alternatives exist
        obsolescence: 4, // Aging architecture
        logistics: 4,
        concentration: 5, // Good diversification
        bom: 6
      },
      risk: 5.3,
      riskAnalysis: 'Manufactured on mature 7nm/6nm nodes with dual-source capability across TSMC and Samsung. Technology maturity reduces yield risk and enables faster capacity flex. Both foundries maintain qualified production lines. Geopolitical exposure moderated by South Korea alternative. Standard packaging requirements improve supply flexibility compared to advanced AI accelerators.'
    },
    {
      id: 'a100',
      name: 'NVIDIA A100',
      image: '🖥️',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc'],
      riskScores: {
        financial: 2,
        reliability: 6, // Single source but proven
        esg: 3,
        cyber: 4,
        geopolitical: 7, // Taiwan only
        trade: 7,
        weather: 4,
        criticality: 7, // Still widely deployed
        substitutability: 7, // Some alternatives
        obsolescence: 5, // Being replaced by H100
        logistics: 4,
        concentration: 8, // TSMC only
        bom: 7
      },
      risk: 6.3,
      riskAnalysis: 'Legacy architecture on TSMC 7nm with proven manufacturing processes. Single-source dependency offset by mature technology and established yield rates. Taiwan exposure remains but technical risk minimized through production experience. Capacity reallocation toward newer nodes may impact availability. Export control restrictions affect China market access.'
    },
    {
      id: 'l40s',
      name: 'NVIDIA L40S',
      image: '🖥️',
      locations: [{ lat: 37.3861, lng: -122.0839, name: 'NVIDIA HQ, Santa Clara, CA' }],
      next: ['tsmc', 'samsung'],
      riskScores: {
        financial: 2,
        reliability: 5,
        esg: 3,
        cyber: 4,
        geopolitical: 5,
        trade: 6,
        weather: 4,
        criticality: 6, // Inference focused
        substitutability: 6,
        obsolescence: 3,
        logistics: 4,
        concentration: 5,
        bom: 6
      },
      risk: 5.1,
      riskAnalysis: 'Inference-optimized architecture on mature process nodes enables dual-source manufacturing. Both TSMC and Samsung qualified for production with standard packaging requirements. Lower power envelope and mainstream technology reduce supply chain complexity. Geographic diversification across Taiwan and South Korea improves resilience. Less capacity constrained than training-focused GPUs.'
    },
    {
      id: 'gaudi3',
      name: 'Intel Gaudi 3',
      image: '🔷',
      locations: [{ lat: 32.0853, lng: 34.7818, name: 'Intel Haifa, Israel' }],
      next: ['intel-fab', 'tsmc'],
      riskScores: {
        financial: 4, // Intel financial pressures
        reliability: 6, // Internal fab + TSMC backup
        esg: 5,
        cyber: 5, // Israel cyber capabilities but target
        geopolitical: 9, // Active conflict zone
        trade: 5,
        weather: 3,
        criticality: 5, // Smaller market share
        substitutability: 5, // Many alternatives
        obsolescence: 4,
        logistics: 7, // Conflict disruption risk
        concentration: 6,
        bom: 6
      },
      risk: 6.0,
      riskAnalysis: 'Design center located in geopolitically volatile region with ongoing conflict affecting operations. Intel internal fabrication at Arizona and Oregon sites provides supply independence from Asian foundries. TSMC serves as backup foundry option. Vertical integration reduces third-party dependencies but limits capacity flexibility. Market adoption uncertainty affects production volume predictability.'
    },
    {
      id: 'trainium2',
      name: 'AWS Trainium2',
      image: '☁️',
      locations: [{ lat: 37.4220, lng: -122.0841, name: 'AWS, Palo Alto, CA' }],
      next: ['tsmc'],
      riskScores: {
        financial: 1, // Amazon backing
        reliability: 8, // Custom ASIC, single source
        esg: 3,
        cyber: 3, // AWS security expertise
        geopolitical: 7, // Taiwan only
        trade: 7,
        weather: 4,
        criticality: 7, // AWS internal critical
        substitutability: 9, // Proprietary design
        obsolescence: 2,
        logistics: 5,
        concentration: 9, // TSMC only
        bom: 8
      },
      risk: 6.8,
      riskAnalysis: 'Custom ASIC design exclusively manufactured by TSMC on advanced nodes. Proprietary architecture eliminates multi-sourcing options and creates vendor lock-in. Captive consumption model concentrates volume risk. Limited production experience relative to merchant silicon vendors. Taiwan geopolitical exposure without alternative supply chains. Design iteration cycles impact time-to-market flexibility.'
    },
    {
      id: 'tpu-v5',
      name: 'Google TPU v5',
      image: '🌐',
      locations: [{ lat: 37.4220, lng: -122.0841, name: 'Google, Mountain View, CA' }],
      next: ['tsmc', 'samsung'],
      riskScores: {
        financial: 1, // Google/Alphabet backing
        reliability: 6, // Dual source
        esg: 3,
        cyber: 3,
        geopolitical: 6, // Taiwan/Korea split
        trade: 7,
        weather: 4,
        criticality: 7, // Google internal critical
        substitutability: 9, // Custom architecture
        obsolescence: 2,
        logistics: 5,
        concentration: 6,
        bom: 7
      },
      risk: 6.0,
      riskAnalysis: 'Dual-source manufacturing strategy across TSMC and Samsung for custom tensor processing architecture. Internal-only deployment limits production scale and supply chain investment. Custom ISA creates foundry portability challenges despite dual-source approach. Packaging requirements less demanding than GPUs. Technology transition risk during generational upgrades with limited external validation.'
    }
  ],
  packaging: [
    {
      id: 'tsmc',
      name: 'TSMC CoWoS',
      image: '📦',
      locations: [{ lat: 24.1477, lng: 120.6736, name: 'TSMC, Taichung, Taiwan' }],
      next: ['kyocera-eds', 'ibiden-eds', 'at&s-eds'],
      riskScores: {
        financial: 2, // Extremely strong financials
        reliability: 9, // Single point of failure
        esg: 4,
        cyber: 5, // High value target
        geopolitical: 10, // Taiwan Strait crisis risk
        trade: 8, // Export controls, CHIPS competition
        weather: 7, // Typhoons, earthquakes
        criticality: 10, // Enables all leading AI chips
        substitutability: 10, // No alternatives at scale
        obsolescence: 1,
        logistics: 7, // Island logistics, air freight
        concentration: 10, // 70%+ market share
        bom: 9
      },
      risk: 8.7,
      riskAnalysis: 'Near-monopoly position in advanced 2.5D/3D packaging with 70%+ market share for AI accelerators. CoWoS capacity remains primary bottleneck for H100/H200 production. Capital intensity ($8-10B for new facility) and 2-3 year construction cycles limit expansion velocity. Taiwan concentration creates single point of failure for entire AI infrastructure buildout. Seismic activity and cross-strait tensions amplify risk profile.'
    },
    {
      id: 'samsung',
      name: 'Samsung I-Cube',
      image: '📦',
      locations: [{ lat: 37.5665, lng: 126.9780, name: 'Samsung, Seoul, South Korea' }],
      next: ['kyocera-eds', 'unimicron-eds'],
      riskScores: {
        financial: 2,
        reliability: 6, // Secondary but capable
        esg: 5,
        cyber: 5,
        geopolitical: 6, // North Korea proximity
        trade: 6,
        weather: 5, // Monsoons, typhoons
        criticality: 8, // Important alternative
        substitutability: 7, // Limited scale vs TSMC
        obsolescence: 2,
        logistics: 5,
        concentration: 7, // Smaller market share
        bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Secondary advanced packaging provider with I-Cube4 technology comparable to TSMC CoWoS. South Korea offers greater geopolitical stability than Taiwan. Capacity constrained by capital allocation prioritizing memory business. Technical capabilities proven but market share limited by customer qualification cycles. North Korea proximity and mandatory military service create operational considerations.'
    },
    {
      id: 'intel-fab',
      name: 'Intel Foveros',
      image: '📦',
      locations: [{ lat: 33.4484, lng: -112.0740, name: 'Intel, Chandler, AZ' }],
      next: ['at&s-eds', 'ibiden-eds'],
      riskScores: {
        financial: 4, // Intel financial challenges
        reliability: 6, // Internal priority conflicts
        esg: 4,
        cyber: 4,
        geopolitical: 2, // US domestic
        trade: 3, // Benefits from CHIPS Act
        weather: 4, // Arizona heat, water issues
        criticality: 6, // Intel products only
        substitutability: 6,
        obsolescence: 3,
        logistics: 3,
        concentration: 5,
        bom: 6
      },
      risk: 4.5,
      riskAnalysis: 'Domestic US manufacturing eliminates geopolitical risk associated with Asian dependencies. Foveros 3D die stacking technology suited for heterogeneous integration. Vertical integration provides supply security but limits capacity flexibility. Arizona infrastructure benefits from established semiconductor ecosystem. IFS (Intel Foundry Services) strategy may compete with internal product priorities for capacity allocation.'
    },
    {
      id: 'globalfoundries',
      name: 'GlobalFoundries',
      image: '📦',
      locations: [{ lat: 43.1030, lng: -73.7067, name: 'GlobalFoundries, Malta, NY' }],
      next: ['ibiden-eds', 'unimicron-eds'],
      riskScores: {
        financial: 5, // Standalone foundry challenges
        reliability: 5,
        esg: 4,
        cyber: 4,
        geopolitical: 2, // US/Europe operations
        trade: 3,
        weather: 4, // Winter storms
        criticality: 5, // Mature nodes only
        substitutability: 5,
        obsolescence: 6, // No leading edge
        logistics: 3,
        concentration: 4,
        bom: 5
      },
      risk: 4.4,
      riskAnalysis: 'US-based foundry focused on mature node production (12nm+) following strategic pivot from leading-edge development. Geographic diversification across Malta NY, Vermont, and Dresden Germany. Stable regulatory environment and CHIPS Act funding support expansion. Limited to mainstream packaging technologies; not qualified for advanced AI accelerator requirements. Serves as resilient option for legacy products and automotive applications.'
    },
    {
      id: 'umc',
      name: 'UMC Packaging',
      image: '📦',
      locations: [{ lat: 24.7814, lng: 120.9978, name: 'UMC, Hsinchu, Taiwan' }],
      next: ['unimicron-eds', 'nan-ya-eds'],
      riskScores: {
        financial: 4,
        reliability: 6,
        esg: 5,
        cyber: 5,
        geopolitical: 10, // Same Taiwan risk as TSMC
        trade: 7,
        weather: 7,
        criticality: 6,
        substitutability: 6,
        obsolescence: 5,
        logistics: 6,
        concentration: 7,
        bom: 7
      },
      risk: 6.7,
      riskAnalysis: 'Third-largest foundry concentrated in Taiwan with identical geopolitical exposure to TSMC. Hsinchu Science Park location creates clustering risk for earthquakes and regional events. Mature node focus (28nm+) limits applicability for advanced AI chips. Provides packaging services but lacks cutting-edge capabilities. Serves primarily as TSMC alternative for cost-sensitive applications, not performance-critical compute.'
    }
  ],
  eds: [
    {
      id: 'kyocera-eds',
      name: 'Kyocera Substrate',
      image: '⚡',
      locations: [{ lat: 35.0116, lng: 135.7681, name: 'Kyocera, Kyoto, Japan' }],
      next: ['tanaka-wire', 'heraeus-wire', 'johnson-matthey-wire'],
      riskScores: {
        financial: 3,
        reliability: 6,
        esg: 4,
        cyber: 4,
        geopolitical: 5, // Japan stable but China tensions
        trade: 5,
        weather: 7, // Earthquakes, tsunamis
        criticality: 8, // Critical substrate supplier
        substitutability: 7,
        obsolescence: 3,
        logistics: 5,
        concentration: 7,
        bom: 7
      },
      risk: 6.0,
      riskAnalysis: 'Leading manufacturer of FC-BGA and advanced IC substrates with 20%+ market share. Japan location exposes to earthquake (Ring of Fire), tsunami, and typhoon risks. Technical barriers include fine-line lithography capabilities below 2μm and high-layer-count build-up processes. Oligopoly market structure with limited new entrants. Capacity expansion requires 18-24 months and significant capital investment.'
    },
    {
      id: 'ibiden-eds',
      name: 'Ibiden PCB',
      image: '⚡',
      locations: [{ lat: 35.1815, lng: 136.9066, name: 'Ibiden, Ogaki, Japan' }],
      next: ['tanaka-wire', 'hitachi-wire'],
      riskScores: {
        financial: 4,
        reliability: 7, // Single facility concentration
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 8, // High earthquake risk
        criticality: 9, // Market leader
        substitutability: 8,
        obsolescence: 3,
        logistics: 5,
        concentration: 8,
        bom: 7
      },
      risk: 6.5,
      riskAnalysis: 'Market leader in high-end IC substrates for processors with 25%+ market share. Concentration in Ogaki facility creates single-point failure risk. Advanced any-layer via (ALIVH) technology critical for high-performance computing. Natural disaster exposure exacerbated by limited geographic diversification. Long-term supply agreements with major customers create inflexibility. Capacity allocation challenges during demand surges.'
    },
    {
      id: 'unimicron-eds',
      name: 'Unimicron PCB',
      image: '⚡',
      locations: [{ lat: 25.0330, lng: 121.5654, name: 'Unimicron, Taipei, Taiwan' }],
      next: ['tanaka-wire', 'heraeus-wire'],
      riskScores: {
        financial: 4,
        reliability: 7,
        esg: 5,
        cyber: 5,
        geopolitical: 9, // Taiwan concentration
        trade: 7,
        weather: 7,
        criticality: 9, // Largest PCB manufacturer
        substitutability: 7,
        obsolescence: 3,
        logistics: 6,
        concentration: 8,
        bom: 8
      },
      risk: 7.2,
      riskAnalysis: 'Largest PCB manufacturer globally with significant market share in IC substrates. Taiwan concentration creates correlated risk with foundry supply. Advanced substrate-like PCB (SLP) technology critical for mobile and AI applications. Earthquake vulnerability in northern Taiwan compounded by high facility concentration. Environmental regulations affect expansion in Taiwan. Labor shortages impact production capacity.'
    },
    {
      id: 'at&s-eds',
      name: 'AT&S Substrate',
      image: '⚡',
      locations: [{ lat: 13.0827, lng: 80.2707, name: 'AT&S, Chennai, India' }],
      next: ['heraeus-wire', 'johnson-matthey-wire'],
      riskScores: {
        financial: 5,
        reliability: 6, // Developing capabilities
        esg: 6, // India ESG challenges
        cyber: 6,
        geopolitical: 4, // India stability, China alternative
        trade: 4,
        weather: 6, // Monsoons, cyclones
        criticality: 6,
        substitutability: 5,
        obsolescence: 4,
        logistics: 7, // Infrastructure challenges
        concentration: 5,
        bom: 6
      },
      risk: 5.5,
      riskAnalysis: 'European company with strategic expansion into India providing geographic diversification from Asian concentration. Chennai facility part of "China Plus One" strategy. Infrastructure challenges including power reliability and logistics affect operational efficiency. Growing technical capabilities but still developing advanced substrate competencies. Monsoon season impacts construction and raw material logistics. Benefits from Indian government semiconductor incentives.'
    },
    {
      id: 'nan-ya-eds',
      name: 'Nan Ya PCB',
      image: '⚡',
      locations: [{ lat: 25.0330, lng: 121.5654, name: 'Nan Ya, Taipei, Taiwan' }],
      next: ['tanaka-wire'],
      riskScores: {
        financial: 4,
        reliability: 7,
        esg: 5,
        cyber: 5,
        geopolitical: 9,
        trade: 7,
        weather: 7,
        criticality: 7,
        substitutability: 7,
        obsolescence: 4,
        logistics: 6,
        concentration: 8,
        bom: 7
      },
      risk: 6.8,
      riskAnalysis: 'Formosa Plastics Group subsidiary with integrated materials supply chain. Taiwan geopolitical and seismic exposure mirrors Unimicron risks. Strong in mid-to-high-end substrates but limited cutting-edge capabilities. Vertical integration provides some cost advantages but reduces supply flexibility. Capacity constrained by environmental regulations limiting expansion in Taiwan. Serves primarily Asian customer base.'
    }
  ],
  wiring: [
    {
      id: 'tanaka-wire',
      name: 'Tanaka Precious Metals',
      image: '🔌',
      locations: [{ lat: 34.6937, lng: 135.5023, name: 'Tanaka, Osaka, Japan' }],
      next: ['applied-deposition', 'lam-deposition', 'tokyo-deposition'],
      riskScores: {
        financial: 4,
        reliability: 7,
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 6, // Gold supply chain dependencies
        weather: 8, // Nankai Trough earthquake risk
        criticality: 8,
        substitutability: 7,
        obsolescence: 3,
        logistics: 6, // Precious metals security
        concentration: 7,
        bom: 7
      },
      risk: 6.3,
      riskAnalysis: 'World leader in gold bonding wire and paste materials with 30%+ market share. Osaka location subject to Nankai Trough earthquake risk (magnitude 8-9 probability). Ultra-high purity requirements (99.99%+) create technical barriers to entry. Precious metals sourcing dependencies on mining and refining supply chains. Gold price volatility affects material costs. Limited alternatives for specialized semiconductor-grade materials. Quality control expertise built over decades.'
    },
    {
      id: 'heraeus-wire',
      name: 'Heraeus Electronics',
      image: '🔌',
      locations: [{ lat: 50.1109, lng: 8.6821, name: 'Heraeus, Hanau, Germany' }],
      next: ['applied-deposition', 'amat-deposition'],
      riskScores: {
        financial: 3,
        reliability: 5,
        esg: 3,
        cyber: 4,
        geopolitical: 3, // Germany/EU stability
        trade: 4,
        weather: 3,
        criticality: 7,
        substitutability: 6,
        obsolescence: 3,
        logistics: 4,
        concentration: 6,
        bom: 6
      },
      risk: 4.6,
      riskAnalysis: 'German precious metals leader with diversified global production network. European operations provide geopolitical stability and regulatory predictability. Vertically integrated from refining to finished products reduces supply chain dependencies. Hanau facility houses largest precious metals refinery. Energy costs in Europe impact competitiveness versus Asian producers. Strong quality systems and ISO certifications. Technical expertise in alternative materials (copper, palladium) reduces gold dependency.'
    },
    {
      id: 'johnson-matthey-wire',
      name: 'Johnson Matthey',
      image: '🔌',
      locations: [{ lat: 51.5074, lng: -0.1278, name: 'Johnson Matthey, London, UK' }],
      next: ['applied-deposition', 'lam-deposition'],
      riskScores: {
        financial: 4,
        reliability: 5,
        esg: 3,
        cyber: 4,
        geopolitical: 3, // UK stability
        trade: 5, // Post-Brexit considerations
        weather: 3,
        criticality: 6,
        substitutability: 6,
        obsolescence: 3,
        logistics: 4,
        concentration: 5,
        bom: 6
      },
      risk: 4.5,
      riskAnalysis: 'British multinational with 200+ years precious metals expertise and global manufacturing footprint. Geographic diversification across UK, US, and Asia mitigates regional risk. Post-Brexit trade considerations affect EU market access. Diversified business beyond semiconductors provides financial stability. Strong sustainability practices address conflict minerals concerns. Transition to platinum group metals expertise applicable to semiconductor materials. Moderate market share limits supply concentration risk.'
    },
    {
      id: 'hitachi-wire',
      name: 'Hitachi Metals',
      image: '🔌',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Hitachi, Tokyo, Japan' }],
      next: ['tokyo-deposition', 'screen-deposition'],
      riskScores: {
        financial: 4,
        reliability: 6,
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 7, // Tokyo earthquake risk
        criticality: 7,
        substitutability: 6,
        obsolescence: 3,
        logistics: 5,
        concentration: 6,
        bom: 6
      },
      risk: 5.6,
      riskAnalysis: 'Tokyo metropolitan area location with comprehensive earthquake preparedness protocols. Integrated materials company with specialty alloys and magnetic materials expertise. Close collaboration with Japanese semiconductor equipment manufacturers. Exposure to Tokyo area seismic risk despite preparedness. Limited global footprint compared to Western competitors. Strong technical capabilities in advanced materials development. Part of larger Hitachi conglomerate provides financial backing.'
    }
  ],
  deposition: [
    {
      id: 'applied-deposition',
      name: 'Applied Materials CVD',
      image: '💎',
      locations: [{ lat: 30.2672, lng: -97.7431, name: 'Applied Materials, Austin, TX' }],
      next: ['lam-etch', 'tokyo-etch', 'applied-etch'],
      riskScores: {
        financial: 2,
        reliability: 5,
        esg: 3,
        cyber: 4,
        geopolitical: 2,
        trade: 4,
        weather: 5, // Winter Storm Uri precedent
        criticality: 8,
        substitutability: 6,
        obsolescence: 3,
        logistics: 4,
        concentration: 7,
        bom: 7
      },
      risk: 5.0,
      riskAnalysis: 'Market leader in CVD equipment with 40%+ market share across segments. Austin operations supported by Texas semiconductor ecosystem and favorable business climate. Equipment complexity requires extensive spare parts inventory and service network. Asian component suppliers create moderate supply chain dependencies. Winter Storm Uri (2021) highlighted weather vulnerability. Global service network and installed base provide customer support resilience. 12-18 month lead times for new tools.'
    },
    {
      id: 'lam-deposition',
      name: 'Lam Research ALD',
      image: '💎',
      locations: [{ lat: 45.5425, lng: -122.9505, name: 'Lam Research, Tualatin, OR' }],
      next: ['lam-etch', 'applied-etch'],
      riskScores: {
        financial: 3,
        reliability: 6, // Specialized ALD technology
        esg: 3,
        cyber: 4,
        geopolitical: 2,
        trade: 4,
        weather: 4, // Pacific Northwest storms
        criticality: 9, // Critical for advanced nodes
        substitutability: 8, // Few ALD alternatives
        obsolescence: 2,
        logistics: 4,
        concentration: 8,
        bom: 7
      },
      risk: 5.8,
      riskAnalysis: 'Leading ALD equipment provider with specialized atomic layer deposition technology critical for advanced node manufacturing. Pacific Northwest location benefits from stable infrastructure. Limited competition in ALD space creates moderate concentration risk. Complex supply chain for precision components. 12-18 month tool delivery cycles. Strong service network supports global installed base.'
    },
    {
      id: 'tokyo-deposition',
      name: 'Tokyo Electron PVD',
      image: '💎',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Tokyo Electron, Tokyo, Japan' }],
      next: ['tokyo-etch', 'hitachi-etch'],
      riskScores: {
        financial: 3,
        reliability: 6,
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 8, // Tokyo earthquake/tsunami
        criticality: 8,
        substitutability: 7,
        obsolescence: 3,
        logistics: 5,
        concentration: 7,
        bom: 7
      },
      risk: 6.2,
      riskAnalysis: 'Major PVD equipment supplier with strong presence in Asian semiconductor fabs. Tokyo metropolitan location creates earthquake and tsunami exposure. Close customer relationships with TSMC, Samsung, and other Asian foundries. Comprehensive product portfolio reduces single-process dependency. Natural disaster preparedness protocols in place. Strong technical support infrastructure across Asia.'
    },
    {
      id: 'amat-deposition',
      name: 'AMAT Endura',
      image: '💎',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' }],
      next: ['applied-etch', 'lam-etch'],
      riskScores: {
        financial: 2,
        reliability: 5,
        esg: 3,
        cyber: 4,
        geopolitical: 2,
        trade: 4,
        weather: 5, // California earthquake
        criticality: 8,
        substitutability: 6,
        obsolescence: 3,
        logistics: 4,
        concentration: 7,
        bom: 7
      },
      risk: 5.0,
      riskAnalysis: 'Endura platform dominates physical vapor deposition for interconnect metals. Silicon Valley location provides access to engineering talent and semiconductor ecosystem. Earthquake preparedness mitigates seismic risk. Modular tool architecture enables flexibility. Global service network and spare parts inventory support uptime. Asian component suppliers create moderate dependencies.'
    },
    {
      id: 'screen-deposition',
      name: 'SCREEN SPE',
      image: '💎',
      locations: [{ lat: 35.0116, lng: 135.7681, name: 'SCREEN, Kyoto, Japan' }],
      next: ['tokyo-etch', 'hitachi-etch'],
      riskScores: {
        financial: 5,
        reliability: 7, // Niche specialization
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 7, // Kyoto earthquake risk
        criticality: 7,
        substitutability: 8, // Few alternatives for specialized processes
        obsolescence: 4,
        logistics: 6,
        concentration: 8,
        bom: 7
      },
      risk: 6.4,
      riskAnalysis: 'Specialized wet processing and coating equipment manufacturer. Kyoto location in seismically active region with historical earthquake impacts. Niche market position in specific deposition and cleaning processes. Limited scale compared to Applied Materials and Tokyo Electron. Long lead times for specialized tools. Strong technical relationships with Japanese semiconductor companies.'
    }
  ],
  etching: [
    {
      id: 'lam-etch',
      name: 'Lam Kiyo Etch',
      image: '🔬',
      locations: [{ lat: 37.3541, lng: 127.9458, name: 'Lam Research, Seoul, South Korea' }],
      next: ['asml-litho', 'nikon-litho', 'canon-litho'],
      riskScores: {
        financial: 3,
        reliability: 5,
        esg: 4,
        cyber: 5,
        geopolitical: 6, // North Korea proximity
        trade: 5,
        weather: 5,
        criticality: 9, // Market leader in etch
        substitutability: 7,
        obsolescence: 2,
        logistics: 5,
        concentration: 8,
        bom: 7
      },
      risk: 6.0,
      riskAnalysis: 'Market leader in plasma etch equipment with 50%+ share in leading-edge applications. South Korea location near major fabs enables close customer support. North Korea proximity creates geopolitical consideration but well-managed risk. Kiyo conductor etch systems critical for advanced patterning. Strong process know-how and customer collaboration. Seoul facility supports TSMC and Samsung.'
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
      riskScores: {
        financial: 3,
        reliability: 5, // Multiple facilities
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 7, // Japan earthquake exposure
        criticality: 8,
        substitutability: 7,
        obsolescence: 3,
        logistics: 5,
        concentration: 7,
        bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Second-largest etch equipment supplier with strong dielectric etch capabilities. Multiple Japan facilities provide operational redundancy. Close integration with Japanese and Asian fab customers. Earthquake preparedness protocols across facilities. Comprehensive etch portfolio from mature to advanced nodes. Competitive alternative to Lam Research in many applications.'
    },
    {
      id: 'applied-etch',
      name: 'Applied Materials Etch',
      image: '🔬',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' }],
      next: ['asml-litho', 'nikon-litho'],
      riskScores: {
        financial: 2,
        reliability: 5,
        esg: 3,
        cyber: 4,
        geopolitical: 2,
        trade: 4,
        weather: 5,
        criticality: 8,
        substitutability: 6,
        obsolescence: 3,
        logistics: 4,
        concentration: 6,
        bom: 7
      },
      risk: 4.9,
      riskAnalysis: 'Third-largest etch equipment supplier with diversified product portfolio. US-based operations benefit from stable infrastructure and skilled workforce. Silicon Valley ecosystem supports innovation. Global service network and extensive installed base. Multiple etch platforms (Centris, Sym3) address different applications. Generally lower concentration risk due to competitive market position.'
    },
    {
      id: 'hitachi-etch',
      name: 'Hitachi High-Tech Etch',
      image: '🔬',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Hitachi, Tokyo, Japan' }],
      next: ['canon-litho', 'nikon-litho'],
      riskScores: {
        financial: 4,
        reliability: 6,
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 8,
        criticality: 6,
        substitutability: 6,
        obsolescence: 4,
        logistics: 5,
        concentration: 6,
        bom: 6
      },
      risk: 5.7,
      riskAnalysis: 'Niche etch equipment supplier focused on specific applications and Japanese market. Tokyo location carries earthquake and natural disaster vulnerability. Smaller scale limits global support infrastructure. Specialized solutions for memory and logic applications. Part of larger Hitachi conglomerate provides financial stability. Primarily serves Japanese semiconductor ecosystem with limited global footprint.'
    }
  ],
  photolithography: [
    {
      id: 'asml-litho',
      name: 'ASML EUV Twinscan',
      image: '💡',
      locations: [{ lat: 51.4416, lng: 5.4697, name: 'ASML, Veldhoven, Netherlands' }],
      next: ['applied-oxidation', 'kokusai-oxidation'],
      riskScores: {
        financial: 2,
        reliability: 10, // Absolute monopoly
        esg: 3,
        cyber: 6, // High-value IP target
        geopolitical: 6, // Export controls to China
        trade: 9, // CHIPS Act competition, export restrictions
        weather: 3,
        criticality: 10, // Enables all leading-edge nodes
        substitutability: 10, // Zero alternatives for EUV
        obsolescence: 1,
        logistics: 8, // Complex global supply chain
        concentration: 10, // 100% monopoly
        bom: 10
      },
      risk: 8.9,
      riskAnalysis: 'ABSOLUTE MONOPOLY on EUV lithography technology - single point of failure for all sub-7nm semiconductor production globally. Each system costs $150-200M with 100,000+ parts from 5,000+ suppliers worldwide. 12-18 month lead times with limited production capacity (~50-60 systems/year). Export controls restrict China access. Netherlands location generally stable but supply chain spans globe. No alternative exists or will exist for next decade. This is THE critical bottleneck in advanced chip manufacturing.'
    },
    {
      id: 'nikon-litho',
      name: 'Nikon NSR Litho',
      image: '💡',
      locations: [{ lat: 35.1815, lng: 136.9066, name: 'Nikon, Kumagaya, Japan' }],
      next: ['applied-oxidation', 'tokyo-oxidation'],
      riskScores: {
        financial: 5, // Declining market position
        reliability: 6,
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 8, // Japan earthquake exposure
        criticality: 6, // Mature nodes only
        substitutability: 6,
        obsolescence: 6, // Losing relevance
        logistics: 5,
        concentration: 5,
        bom: 6
      },
      risk: 5.9,
      riskAnalysis: 'Former lithography leader now limited to DUV systems for mature nodes (28nm+). Lost EUV race to ASML, resulting in declining market share. Japan location creates earthquake and natural disaster vulnerability. Still relevant for mature node and specialty applications. Kumagaya facility concentration creates single-point risk. Financial pressures from reduced lithography revenue. Alternative to ASML only for non-leading-edge production.'
    },
    {
      id: 'canon-litho',
      name: 'Canon FPA Litho',
      image: '💡',
      locations: [{ lat: 35.4437, lng: 139.6380, name: 'Canon, Utsunomiya, Japan' }],
      next: ['applied-oxidation', 'tokyo-oxidation'],
      riskScores: {
        financial: 4, // Diversified company
        reliability: 6,
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 8,
        criticality: 5, // Niche player
        substitutability: 5,
        obsolescence: 6,
        logistics: 5,
        concentration: 5,
        bom: 5
      },
      risk: 5.6,
      riskAnalysis: 'Niche lithography player focused on i-line and DUV for mature nodes and packaging applications. Diversified company with camera and optics business provides financial stability. Utsunomiya location in seismically active region. Limited to specialty and legacy applications - not relevant for advanced logic. Serves primarily Japanese domestic market and packaging sector. Nanoimprint lithography research represents future potential.'
    }
  ],
  oxidation: [
    {
      id: 'applied-oxidation',
      name: 'Applied Materials Oxidation',
      image: '🌡️',
      locations: [{ lat: 37.3894, lng: -122.0819, name: 'Applied Materials, Santa Clara, CA' }],
      next: ['shin-etsu-wafer', 'sumco-wafer', 'globalwafers'],
      riskScores: {
        financial: 2,
        reliability: 4,
        esg: 3,
        cyber: 4,
        geopolitical: 2,
        trade: 4,
        weather: 5,
        criticality: 7,
        substitutability: 5,
        obsolescence: 4,
        logistics: 4,
        concentration: 6,
        bom: 6
      },
      risk: 4.6,
      riskAnalysis: 'Market leader in thermal oxidation and annealing equipment. Mature technology with multiple qualified suppliers reduces criticality. US-based manufacturing and support infrastructure. Silicon Valley location provides ecosystem benefits despite earthquake risk. Standard thermal processes enable competitive alternatives. Global installed base and service network. Lower technical barriers compared to lithography or advanced deposition.'
    },
    {
      id: 'kokusai-oxidation',
      name: 'Kokusai Electric',
      image: '🌡️',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Kokusai, Tokyo, Japan' }],
      next: ['shin-etsu-wafer', 'sumco-wafer'],
      riskScores: {
        financial: 4,
        reliability: 6,
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 8,
        criticality: 7,
        substitutability: 6,
        obsolescence: 4,
        logistics: 5,
        concentration: 7,
        bom: 6
      },
      risk: 6.0,
      riskAnalysis: 'Specialized thermal processing equipment manufacturer with strong batch furnace technology. Tokyo earthquake and tsunami exposure creates operational risk. Strong presence in Asian memory fabs. Vertical furnace expertise for oxidation, diffusion, and CVD processes. Acquired by Applied Materials but operates semi-independently. Limited geographic diversification concentrates risk in Japan.'
    },
    {
      id: 'tokyo-oxidation',
      name: 'Tokyo Electron Thermal',
      image: '🌡️',
      locations: [{ lat: 35.6762, lng: 139.6503, name: 'Tokyo Electron, Tokyo, Japan' }],
      next: ['sumco-wafer', 'siltronic-wafer'],
      riskScores: {
        financial: 3,
        reliability: 5,
        esg: 4,
        cyber: 4,
        geopolitical: 5,
        trade: 5,
        weather: 8,
        criticality: 7,
        substitutability: 6,
        obsolescence: 4,
        logistics: 5,
        concentration: 6,
        bom: 6
      },
      risk: 5.8,
      riskAnalysis: 'Integrated thermal solutions as part of Tokyo Electron portfolio. Benefits from comprehensive equipment lineup and customer relationships. Tokyo location creates correlated natural disaster risk with other Japanese suppliers. Competitive thermal processing technology across applications. Strong support for Asian fab customers. Part of larger equipment company diversifies business risk but maintains geographic concentration.'
    }
  ],
  wafer: [
    {
      id: 'shin-etsu-wafer',
      name: 'Shin-Etsu Chemical',
      image: '⚪',
      locations: [{ lat: 47.6062, lng: -122.3321, name: 'Shin-Etsu, Vancouver, WA' }],
      next: ['cadence-design', 'synopsys-design', 'mentor-design'],
      riskScores: {
        financial: 3,
        reliability: 7, // Market leader in oligopoly
        esg: 4,
        cyber: 4,
        geopolitical: 4, // US facility, Japanese parent
        trade: 5,
        weather: 4,
        criticality: 9, // Silicon wafer essential
        substitutability: 8, // Oligopoly structure
        obsolescence: 3,
        logistics: 6, // Long lead times
        concentration: 8, // 30%+ market share
        bom: 8
      },
      risk: 6.7,
      riskAnalysis: 'Global market leader with 30%+ share in silicon wafers. Vancouver WA facility provides US production but company is Japanese-owned. Oligopoly market structure with three major suppliers creates pricing power and allocation challenges. 18-24 month lead times for capacity expansion. 300mm wafer production requires massive capital investment ($3-5B per fab). Technical barriers and capital intensity limit new entrants. Critical for all semiconductor manufacturing.'
    },
    {
      id: 'sumco-wafer',
      name: 'SUMCO Corporation',
      image: '⚪',
      locations: [{ lat: 34.3853, lng: 132.4553, name: 'SUMCO, Imari, Japan' }],
      next: ['cadence-design', 'synopsys-design'],
      riskScores: {
        financial: 4,
        reliability: 7,
        esg: 4,
        cyber: 4,
        geopolitical: 6, // Japan concentration
        trade: 5,
        weather: 8, // Kyushu earthquake/typhoon
        criticality: 9,
        substitutability: 8,
        obsolescence: 3,
        logistics: 6,
        concentration: 8, // 25%+ market share
        bom: 8
      },
      risk: 6.9,
      riskAnalysis: 'Second-largest wafer supplier with 25%+ market share in global oligopoly. Imari facility in Kyushu region subject to earthquakes and typhoons. Joint venture with Mitsubishi provides financial backing. Oligopoly structure enables allocation-based supply management during shortages. Long-term supply agreements with major chipmakers. Geographic concentration in Japan creates correlated risk with other Japanese suppliers. Capital-intensive business limits flexibility.'
    },
    {
      id: 'globalwafers',
      name: 'GlobalWafers',
      image: '⚪',
      locations: [{ lat: 30.2672, lng: -97.7431, name: 'GlobalWafers, Sherman, TX' }],
      next: ['cadence-design', 'mentor-design'],
      riskScores: {
        financial: 4,
        reliability: 6,
        esg: 5,
        cyber: 4,
        geopolitical: 5, // Taiwan parent, US operations
        trade: 6, // CHIPS Act benefits
        weather: 5, // Texas winter storms
        criticality: 8,
        substitutability: 7,
        obsolescence: 3,
        logistics: 6,
        concentration: 7, // 15% market share
        bom: 7
      },
      risk: 6.1,
      riskAnalysis: 'Third-largest wafer supplier expanding US production with CHIPS Act funding. Sherman TX facility reduces Taiwan concentration risk. Failed Siltronic acquisition limited expansion plans. Taiwan parent company (GlobalWafers Taiwan) creates some geopolitical consideration. Winter Storm Uri demonstrated Texas grid vulnerability. Smaller market share provides less concentration risk versus top two suppliers. Growing 300mm capacity addresses market needs.'
    },
    {
      id: 'siltronic-wafer',
      name: 'Siltronic AG',
      image: '⚪',
      locations: [{ lat: 48.1351, lng: 11.5820, name: 'Siltronic, Munich, Germany' }],
      next: ['synopsys-design', 'cadence-design'],
      riskScores: {
        financial: 4,
        reliability: 6,
        esg: 3,
        cyber: 4,
        geopolitical: 3, // European stability
        trade: 4,
        weather: 3,
        criticality: 7,
        substitutability: 6,
        obsolescence: 3,
        logistics: 5,
        concentration: 6, // 10-12% market share
        bom: 7
      },
      risk: 5.2,
      riskAnalysis: 'Fourth-largest wafer supplier with European production base. Munich headquarters and Singapore operations provide geographic diversification. Smaller market share reduces concentration risk versus top three. Failed acquisition by GlobalWafers maintains independent operations. European location benefits from stable regulatory environment and skilled workforce. Energy costs in Germany impact competitiveness. Primarily serves European and US customers.'
    },
    {
      id: 'sk-siltron',
      name: 'SK Siltron',
      image: '⚪',
      locations: [{ lat: 37.2636, lng: 127.0286, name: 'SK Siltron, Gumi, South Korea' }],
      next: ['cadence-design', 'synopsys-design'],
      riskScores: {
        financial: 4,
        reliability: 6,
        esg: 5,
        cyber: 5,
        geopolitical: 6, // North Korea proximity
        trade: 5,
        weather: 5,
        criticality: 7,
        substitutability: 7,
        obsolescence: 3,
        logistics: 5,
        concentration: 6,
        bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Fifth-largest wafer supplier following DuPont SiC acquisition. Gumi location in South Korea benefits from semiconductor ecosystem. North Korea proximity creates geopolitical consideration. SK Group financial backing provides stability. Growing silicon carbide capabilities for power semiconductors. Smaller player in silicon wafer oligopoly reduces market concentration impact. Primarily serves Korean and Asian customers.'
    }
  ],
  design: [
    {
      id: 'cadence-design',
      name: 'Cadence Virtuoso',
      image: '🎨',
      locations: [{ lat: 37.3688, lng: -121.9785, name: 'Cadence, San Jose, CA' }],
      next: ['silicon-raw', 'polysilicon-raw', 'ultra-pure-silica'],
      riskScores: {
        financial: 2,
        reliability: 4,
        esg: 3,
        cyber: 5, // Software IP target
        geopolitical: 2,
        trade: 4, // Export controls to China
        weather: 5,
        criticality: 8, // Essential EDA tools
        substitutability: 7, // Limited EDA alternatives
        obsolescence: 2,
        logistics: 2, // Software distribution
        concentration: 7,
        bom: 7
      },
      risk: 4.8,
      riskAnalysis: 'Market leader in custom IC design and analog/mixed-signal tools with Virtuoso platform. Software-based business model minimizes physical supply chain risk. Silicon Valley location provides access to semiconductor design talent. Cloud deployment options improve availability. Subscription-based licensing creates customer lock-in. Export controls affect China market access. Cyber security critical for protecting customer IP. EDA oligopoly structure with Synopsys and Siemens.'
    },
    {
      id: 'synopsys-design',
      name: 'Synopsys Fusion',
      image: '🎨',
      locations: [{ lat: 37.4047, lng: -121.9467, name: 'Synopsys, Mountain View, CA' }],
      next: ['silicon-raw', 'polysilicon-raw'],
      riskScores: {
        financial: 2,
        reliability: 4,
        esg: 3,
        cyber: 5,
        geopolitical: 2,
        trade: 4,
        weather: 5,
        criticality: 9, // Market leader
        substitutability: 8, // Few alternatives
        obsolescence: 2,
        logistics: 2,
        concentration: 8,
        bom: 7
      },
      risk: 5.0,
      riskAnalysis: 'Market leader in digital design and verification tools with comprehensive EDA portfolio. Fusion Compiler and VCS simulation essential for advanced node design. Software model eliminates manufacturing dependencies. Strong IP portfolio and customer relationships create switching costs. AI-powered EDA tools represent next-generation capabilities. Export control compliance required for China operations. Cloud and on-premise deployment options. Dominant market position creates dependency risk.'
    },
    {
      id: 'mentor-design',
      name: 'Siemens EDA',
      image: '🎨',
      locations: [{ lat: 45.5152, lng: -122.6784, name: 'Siemens EDA, Wilsonville, OR' }],
      next: ['silicon-raw', 'ultra-pure-silica'],
      riskScores: {
        financial: 2, // Siemens backing
        reliability: 4,
        esg: 3,
        cyber: 5,
        geopolitical: 3, // US operations, German parent
        trade: 4,
        weather: 4,
        criticality: 7,
        substitutability: 6,
        obsolescence: 3,
        logistics: 2,
        concentration: 6,
        bom: 6
      },
      risk: 4.5,
      riskAnalysis: 'Third-largest EDA provider with Siemens Digital Industries backing. Calibre platform dominates physical verification market. Oregon location provides stable operations. European parent company Siemens provides financial strength and industrial IoT integration. Smaller EDA market share versus Cadence/Synopsys reduces concentration risk. Software distribution model minimizes supply chain complexity. Strong in automotive and IC packaging design.'
    },
    {
      id: 'ansys-design',
      name: 'Ansys RedHawk',
      image: '🎨',
      locations: [{ lat: 40.4406, lng: -79.9959, name: 'Ansys, Canonsburg, PA' }],
      next: ['polysilicon-raw', 'silicon-raw'],
      riskScores: {
        financial: 3,
        reliability: 4,
        esg: 3,
        cyber: 5,
        geopolitical: 2,
        trade: 4,
        weather: 4,
        criticality: 6, // Specialized tools
        substitutability: 6,
        obsolescence: 3,
        logistics: 2,
        concentration: 5,
        bom: 6
      },
      risk: 4.3,
      riskAnalysis: 'Simulation software specialist with RedHawk platform for power integrity and reliability analysis. Pennsylvania headquarters outside traditional semiconductor clusters. Diversified simulation portfolio beyond semiconductors reduces business concentration. Software model eliminates physical supply chain dependencies. Specialized tools for power analysis at advanced nodes. Acquisition strategy expands capabilities. Lower market concentration versus Big 3 EDA vendors reduces dependency risk.'
    }
  ],
  raw: [
    {
      id: 'silicon-raw',
      name: 'Quartz Mining',
      image: '💠',
      locations: [{ lat: 35.8617, lng: -78.5569, name: 'Quartz Mines, Spruce Pine, NC' }],
      next: [],
      riskScores: {
        financial: 5, // Small mining operations
        reliability: 10, // SINGLE SOURCE globally
        esg: 6,
        cyber: 3,
        geopolitical: 3, // US domestic
        trade: 4,
        weather: 9, // Hurricane/flood exposure
        criticality: 10, // Irreplaceable for semiconductors
        substitutability: 10, // No alternatives exist
        obsolescence: 1,
        logistics: 7,
        concentration: 10, // 70-80% global supply
        bom: 10
      },
      risk: 8.9,
      riskAnalysis: 'SINGLE GLOBAL SOURCE for ultra-high purity quartz required for semiconductor crucibles and optics. Spruce Pine mines supply 70-80% of world semiconductor-grade quartz. Hurricane Helene 2024 caused temporary shutdown demonstrating weather vulnerability. Unique geology makes these deposits irreplaceable - no known alternatives worldwide meet purity requirements (99.998%+). Single-point failure for entire global chip industry. Deep Appalachian location creates flooding and storm exposure. Absolutely critical and irreplaceable resource.'
    },
    {
      id: 'polysilicon-raw',
      name: 'Polysilicon Production',
      image: '💠',
      locations: [{ lat: 39.9042, lng: 116.4074, name: 'Daqo New Energy, Xinjiang, China' }],
      next: [],
      riskScores: {
        financial: 4,
        reliability: 7,
        esg: 9, // Forced labor concerns
        cyber: 5,
        geopolitical: 9, // Xinjiang, US-China tensions
        trade: 10, // US import bans, sanctions
        weather: 4,
        criticality: 9,
        substitutability: 8, // Limited non-China sources
        obsolescence: 2,
        logistics: 7,
        concentration: 9, // China 80% of global production
        bom: 9
      },
      risk: 8.5,
      riskAnalysis: 'China dominates 80% of global polysilicon production with concentration in Xinjiang region. Forced labor allegations led to US Uyghur Forced Labor Prevention Act restrictions. Geopolitical tensions create trade and sanctions risk. Energy-intensive production requires cheap electricity explaining Xinjiang location. Alternative sources exist (Hemlock, Wacker, OCI) but limited capacity. Polysilicon used for silicon wafer production and solar panels. Critical material with high geopolitical and ESG risk profile.'
    },
    {
      id: 'ultra-pure-silica',
      name: 'Ultra-Pure Silica',
      image: '💠',
      locations: [
        { lat: 35.8617, lng: -78.5569, name: 'Sibelco, Spruce Pine, NC' },
      ],
      next: [],
      riskScores: {
        financial: 5, // Small specialized operations
        reliability: 10, // Single source dependency
        esg: 6, // Mining environmental impact
        cyber: 3,
        geopolitical: 3, // US domestic
        trade: 4,
        weather: 9, // Hurricane/flood exposure
        criticality: 10, // Essential for crucibles/optics
        substitutability: 10, // No alternatives
        obsolescence: 1,
        logistics: 7,
        concentration: 10, // Spruce Pine dominance
        bom: 10
      },
      risk: 8.9,
      riskAnalysis: 'Same Spruce Pine single-source bottleneck as quartz mining; critical for crucibles and optics; Hurricane Helene 2024 caused temporary shutdown; no viable alternatives worldwide meet purity requirements'
    },
    {
      id: 'rare-earth',
      name: 'Rare Earth Elements',
      image: '💠',
      locations: [
        { lat: -34.6037, lng: 149.2642, name: 'Nolans Project, Northern Territory, Australia' },
      ],
      next: [],
      riskScores: {
        financial: 5,
        reliability: 8, // China concentration
        esg: 7, // Mining and refining environmental impact
        cyber: 4,
        geopolitical: 8, // China dominance, strategic resource
        trade: 9, // Export restrictions, strategic competition
        weather: 5, // Australian outback conditions
        criticality: 8, // Important for magnets, catalysts
        substitutability: 9, // Limited alternatives
        obsolescence: 2,
        logistics: 7, // Complex refining supply chain
        concentration: 9, // China 60% production
        bom: 8
      },
      risk: 7.8,
      riskAnalysis: 'China controls 60% of global rare earth production; Australia developing alternatives; complex refining process with environmental concerns; export restrictions risk; strategic resource in US-China competition'
    },
    {
      id: 'copper-mining',
      name: 'Copper Mining',
      image: '💠',
      locations: [
        { lat: -22.9068, lng: -43.1729, name: 'Escondida, Chile' },
      ],
      next: [],
      riskScores: {
        financial: 4, // Established commodity market
        reliability: 5, // Multiple global sources
        esg: 7, // Water usage, environmental impact
        cyber: 3,
        geopolitical: 6, // Chile political stability concerns
        trade: 5, // Commodity market trade
        weather: 6, // Water scarcity, regional climate
        criticality: 7, // Essential conductor material
        substitutability: 6, // Some alternatives (aluminum)
        obsolescence: 2,
        logistics: 5, // Global commodity logistics
        concentration: 6, // Chile 30% but diversified
        bom: 7
      },
      risk: 5.9,
      riskAnalysis: 'Chile supplies 30% of global copper; water scarcity concerns in mining regions; labor strike history; relatively diversified global production; well-established commodity market with trading infrastructure'
    },
    {
      id: 'gold-mining',
      name: 'Gold Mining',
      image: '💠',
      locations: [
        { lat: -26.2041, lng: 28.0473, name: 'Witwatersrand, South Africa' },
      ],
      next: [],
      riskScores: {
        financial: 5, // Deep mining cost pressures
        reliability: 5, // Diversified global production
        esg: 7, // Mining impact, labor issues
        cyber: 3,
        geopolitical: 7, // South Africa political/infrastructure
        trade: 4, // Global commodity market
        weather: 4,
        criticality: 6, // Used in bonding but alternatives exist
        substitutability: 6, // Copper alternatives for some uses
        obsolescence: 3,
        logistics: 4,
        concentration: 6, // Diversified production
        bom: 6
      },
      risk: 5.7,
      riskAnalysis: 'South Africa political stability and infrastructure concerns; deep mining operational challenges and costs; gold used in bonding wires and connectors; diversified global gold production; commodity market availability reduces supply risk'
    }
  ]}