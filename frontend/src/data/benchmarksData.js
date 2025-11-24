// BenchBox - Base de datos hardcodeada de benchmarks de medios digitales
// Basado en investigación de mercado 2024-2025
// Fuentes: Statista, WordStream, eMarketer, AgencyAnalytics

export const PLATAFORMAS = [
  'Facebook',
  'Instagram',
  'Google Ads',
  'TikTok',
  'LinkedIn',
  'YouTube',
  'Twitter/X'
]

export const INDUSTRIAS = [
  'Banca',
  'Telecomunicaciones',
  'E-commerce',
  'Retail',
  'Alimentos y Bebidas',
  'Automóviles',
  'Tecnología',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Inmobiliaria',
  'Turismo y Viajes'
]

export const OBJETIVOS = [
  'Traffic',
  'Conversions',
  'Lead Generation',
  'Video Views',
  'Brand Awareness',
  'App Installs',
  'Engagement',
  'Messages'
]

export const PAISES = [
  'Perú',
  'México',
  'Colombia',
  'Chile',
  'Argentina',
  'Brasil',
  'Global'
]

// Base de datos de benchmarks
// Cada registro incluye: plataforma, objetivo, industria, país, período, métricas
export const BENCHMARKS = [
  // ========== FACEBOOK - PERÚ ==========
  {
    plataforma: 'Facebook',
    objetivo: 'Traffic',
    industria: 'E-commerce',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 7.80,
    cpc: 1.65,
    cpv: null,
    cpa: 18.50,
    cpl: null,
    ctr: 0.85,
    conversionRate: 4.2,
    samples: 12
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Lead Generation',
    industria: 'Banca',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 8.50,
    cpc: 1.85,
    cpv: null,
    cpa: null,
    cpl: 12.50,
    ctr: 1.25,
    conversionRate: 8.5,
    samples: 15
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Conversions',
    industria: 'Retail',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 7.20,
    cpc: 1.55,
    cpv: null,
    cpa: 22.00,
    cpl: null,
    ctr: 0.92,
    conversionRate: 3.8,
    samples: 18
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Lead Generation',
    industria: 'Telecomunicaciones',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 9.20,
    cpc: 2.10,
    cpv: null,
    cpa: null,
    cpl: 15.80,
    ctr: 1.10,
    conversionRate: 7.2,
    samples: 10
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Video Views',
    industria: 'Entretenimiento',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 6.50,
    cpc: null,
    cpv: 0.08,
    cpa: null,
    cpl: null,
    ctr: 1.45,
    conversionRate: null,
    samples: 8
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Conversions',
    industria: 'Automóviles',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 11.50,
    cpc: 2.85,
    cpv: null,
    cpa: 185.00,
    cpl: null,
    ctr: 0.68,
    conversionRate: 1.2,
    samples: 6
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Traffic',
    industria: 'Alimentos y Bebidas',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 6.80,
    cpc: 1.45,
    cpv: null,
    cpa: 16.50,
    cpl: null,
    ctr: 0.95,
    conversionRate: 5.1,
    samples: 14
  },

  // ========== INSTAGRAM - PERÚ ==========
  {
    plataforma: 'Instagram',
    objetivo: 'Brand Awareness',
    industria: 'E-commerce',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 8.20,
    cpc: 3.20,
    cpv: null,
    cpa: null,
    cpl: null,
    ctr: 0.62,
    conversionRate: null,
    samples: 10
  },
  {
    plataforma: 'Instagram',
    objetivo: 'Conversions',
    industria: 'Retail',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 7.90,
    cpc: 3.45,
    cpv: null,
    cpa: 28.50,
    cpl: null,
    ctr: 0.58,
    conversionRate: 3.2,
    samples: 12
  },
  {
    plataforma: 'Instagram',
    objetivo: 'Engagement',
    industria: 'Alimentos y Bebidas',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 6.50,
    cpc: 2.80,
    cpv: null,
    cpa: null,
    cpl: null,
    ctr: 0.85,
    conversionRate: null,
    samples: 16
  },
  {
    plataforma: 'Instagram',
    objetivo: 'Video Views',
    industria: 'Entretenimiento',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 7.10,
    cpc: null,
    cpv: 0.12,
    cpa: null,
    cpl: null,
    ctr: 1.20,
    conversionRate: null,
    samples: 9
  },

  // ========== GOOGLE ADS - PERÚ ==========
  {
    plataforma: 'Google Ads',
    objetivo: 'Traffic',
    industria: 'E-commerce',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 12.50,
    cpc: 0.85,
    cpv: null,
    cpa: 15.20,
    cpl: null,
    ctr: 2.80,
    conversionRate: 5.8,
    samples: 20
  },
  {
    plataforma: 'Google Ads',
    objetivo: 'Lead Generation',
    industria: 'Banca',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 18.50,
    cpc: 1.65,
    cpv: null,
    cpa: null,
    cpl: 8.50,
    ctr: 3.20,
    conversionRate: 12.5,
    samples: 18
  },
  {
    plataforma: 'Google Ads',
    objetivo: 'Conversions',
    industria: 'Telecomunicaciones',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 22.00,
    cpc: 2.15,
    cpv: null,
    cpa: 35.00,
    cpl: null,
    ctr: 2.95,
    conversionRate: 6.8,
    samples: 14
  },
  {
    plataforma: 'Google Ads',
    objetivo: 'Lead Generation',
    industria: 'Educación',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 15.80,
    cpc: 1.25,
    cpv: null,
    cpa: null,
    cpl: 6.80,
    ctr: 3.85,
    conversionRate: 15.2,
    samples: 11
  },
  {
    plataforma: 'Google Ads',
    objetivo: 'Conversions',
    industria: 'Automóviles',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 28.50,
    cpc: 3.80,
    cpv: null,
    cpa: 220.00,
    cpl: null,
    ctr: 2.10,
    conversionRate: 1.5,
    samples: 7
  },

  // ========== TIKTOK - PERÚ ==========
  {
    plataforma: 'TikTok',
    objetivo: 'Video Views',
    industria: 'E-commerce',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 5.20,
    cpc: 0.95,
    cpv: 0.06,
    cpa: null,
    cpl: null,
    ctr: 0.90,
    conversionRate: null,
    samples: 8
  },
  {
    plataforma: 'TikTok',
    objetivo: 'Traffic',
    industria: 'Alimentos y Bebidas',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 4.80,
    cpc: 0.88,
    cpv: null,
    cpa: 12.50,
    cpl: null,
    ctr: 0.95,
    conversionRate: 6.2,
    samples: 10
  },
  {
    plataforma: 'TikTok',
    objetivo: 'Conversions',
    industria: 'Retail',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 5.50,
    cpc: 1.10,
    cpv: null,
    cpa: 18.80,
    cpl: null,
    ctr: 0.85,
    conversionRate: 4.5,
    samples: 12
  },
  {
    plataforma: 'TikTok',
    objetivo: 'Brand Awareness',
    industria: 'Entretenimiento',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 4.20,
    cpc: null,
    cpv: 0.05,
    cpa: null,
    cpl: null,
    ctr: 1.15,
    conversionRate: null,
    samples: 6
  },

  // ========== LINKEDIN - GLOBAL (para B2B) ==========
  {
    plataforma: 'LinkedIn',
    objetivo: 'Lead Generation',
    industria: 'Tecnología',
    pais: 'Global',
    periodo: 'Q4-2024',
    cpm: 35.00,
    cpc: 8.50,
    cpv: null,
    cpa: null,
    cpl: 45.00,
    ctr: 0.45,
    conversionRate: 12.8,
    samples: 25
  },
  {
    plataforma: 'LinkedIn',
    objetivo: 'Lead Generation',
    industria: 'Banca',
    pais: 'Global',
    periodo: 'Q4-2024',
    cpm: 38.50,
    cpc: 9.20,
    cpv: null,
    cpa: null,
    cpl: 52.00,
    ctr: 0.42,
    conversionRate: 11.5,
    samples: 18
  },
  {
    plataforma: 'LinkedIn',
    objetivo: 'Brand Awareness',
    industria: 'Telecomunicaciones',
    pais: 'Global',
    periodo: 'Q4-2024',
    cpm: 28.00,
    cpc: 6.80,
    cpv: null,
    cpa: null,
    cpl: null,
    ctr: 0.52,
    conversionRate: null,
    samples: 14
  },

  // ========== YOUTUBE - PERÚ ==========
  {
    plataforma: 'YouTube',
    objetivo: 'Video Views',
    industria: 'E-commerce',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 8.50,
    cpc: null,
    cpv: 0.15,
    cpa: null,
    cpl: null,
    ctr: 0.35,
    conversionRate: null,
    samples: 9
  },
  {
    plataforma: 'YouTube',
    objetivo: 'Brand Awareness',
    industria: 'Automóviles',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 12.00,
    cpc: null,
    cpv: 0.22,
    cpa: null,
    cpl: null,
    ctr: 0.28,
    conversionRate: null,
    samples: 7
  },
  {
    plataforma: 'YouTube',
    objetivo: 'Video Views',
    industria: 'Entretenimiento',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 7.20,
    cpc: null,
    cpv: 0.12,
    cpa: null,
    cpl: null,
    ctr: 0.45,
    conversionRate: null,
    samples: 11
  },

  // ========== TWITTER/X - GLOBAL ==========
  {
    plataforma: 'Twitter/X',
    objetivo: 'Engagement',
    industria: 'Tecnología',
    pais: 'Global',
    periodo: 'Q4-2024',
    cpm: 9.50,
    cpc: 1.85,
    cpv: null,
    cpa: null,
    cpl: null,
    ctr: 0.75,
    conversionRate: null,
    samples: 10
  },
  {
    plataforma: 'Twitter/X',
    objetivo: 'Traffic',
    industria: 'Entretenimiento',
    pais: 'Global',
    periodo: 'Q4-2024',
    cpm: 8.20,
    cpc: 1.55,
    cpv: null,
    cpa: 18.50,
    cpl: null,
    ctr: 0.82,
    conversionRate: 4.8,
    samples: 8
  },

  // ========== DATOS ADICIONALES - OTRAS REGIONES ==========
  {
    plataforma: 'Facebook',
    objetivo: 'Lead Generation',
    industria: 'Banca',
    pais: 'México',
    periodo: 'Q4-2024',
    cpm: 9.20,
    cpc: 2.10,
    cpv: null,
    cpa: null,
    cpl: 14.50,
    ctr: 1.15,
    conversionRate: 8.0,
    samples: 20
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Conversions',
    industria: 'E-commerce',
    pais: 'Colombia',
    periodo: 'Q4-2024',
    cpm: 7.50,
    cpc: 1.75,
    cpv: null,
    cpa: 19.80,
    cpl: null,
    ctr: 0.88,
    conversionRate: 4.5,
    samples: 16
  },
  {
    plataforma: 'Google Ads',
    objetivo: 'Lead Generation',
    industria: 'Banca',
    pais: 'Chile',
    periodo: 'Q4-2024',
    cpm: 20.50,
    cpc: 1.95,
    cpv: null,
    cpa: null,
    cpl: 9.80,
    ctr: 3.10,
    conversionRate: 11.8,
    samples: 15
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Lead Generation',
    industria: 'Banca',
    pais: 'Brasil',
    periodo: 'Q4-2024',
    cpm: 10.80,
    cpc: 2.85,
    cpv: null,
    cpa: null,
    cpl: 18.50,
    ctr: 0.98,
    conversionRate: 7.2,
    samples: 22
  },

  // Más industrias y combinaciones para Perú
  {
    plataforma: 'Facebook',
    objetivo: 'Conversions',
    industria: 'Salud',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 9.80,
    cpc: 2.25,
    cpv: null,
    cpa: 45.00,
    cpl: null,
    ctr: 0.72,
    conversionRate: 3.5,
    samples: 8
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Lead Generation',
    industria: 'Inmobiliaria',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 11.20,
    cpc: 2.65,
    cpv: null,
    cpa: null,
    cpl: 22.50,
    ctr: 0.95,
    conversionRate: 5.8,
    samples: 10
  },
  {
    plataforma: 'Facebook',
    objetivo: 'Traffic',
    industria: 'Turismo y Viajes',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 7.80,
    cpc: 1.68,
    cpv: null,
    cpa: 28.00,
    cpl: null,
    ctr: 0.98,
    conversionRate: 3.8,
    samples: 12
  },
  {
    plataforma: 'Google Ads',
    objetivo: 'Conversions',
    industria: 'Salud',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 25.50,
    cpc: 3.20,
    cpv: null,
    cpa: 65.00,
    cpl: null,
    ctr: 2.50,
    conversionRate: 4.2,
    samples: 9
  },
  {
    plataforma: 'Instagram',
    objetivo: 'Conversions',
    industria: 'Tecnología',
    pais: 'Perú',
    periodo: 'Q4-2024',
    cpm: 9.50,
    cpc: 3.85,
    cpv: null,
    cpa: 38.50,
    cpl: null,
    ctr: 0.55,
    conversionRate: 2.8,
    samples: 7
  }
]

// Función helper para filtrar benchmarks
export const filterBenchmarks = (filters) => {
  const { plataforma, objetivo, industria, pais } = filters

  return BENCHMARKS.filter(b => {
    if (plataforma && b.plataforma !== plataforma) return false
    if (objetivo && b.objetivo !== objetivo) return false
    if (industria && b.industria !== industria) return false
    if (pais && b.pais !== pais) return false
    return true
  })
}

// Función para calcular promedios de múltiples benchmarks
export const calculateAverages = (benchmarks) => {
  if (benchmarks.length === 0) return null

  const metrics = ['cpm', 'cpc', 'cpv', 'cpa', 'cpl', 'ctr', 'conversionRate']
  const totals = {}
  const counts = {}

  metrics.forEach(metric => {
    totals[metric] = 0
    counts[metric] = 0
  })

  benchmarks.forEach(b => {
    metrics.forEach(metric => {
      if (b[metric] !== null && b[metric] !== undefined) {
        totals[metric] += b[metric]
        counts[metric]++
      }
    })
  })

  const averages = {}
  metrics.forEach(metric => {
    averages[metric] = counts[metric] > 0
      ? parseFloat((totals[metric] / counts[metric]).toFixed(2))
      : null
  })

  return {
    ...averages,
    totalSamples: benchmarks.reduce((sum, b) => sum + (b.samples || 0), 0),
    recordCount: benchmarks.length
  }
}

// Función para obtener rango (min/max) de una métrica
export const getMetricRange = (benchmarks, metric) => {
  const values = benchmarks
    .map(b => b[metric])
    .filter(v => v !== null && v !== undefined)

  if (values.length === 0) return null

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((a, b) => a + b, 0) / values.length
  }
}
