import { useState } from 'react'
import {
  PLATAFORMAS,
  INDUSTRIAS,
  OBJETIVOS,
  PAISES,
  filterBenchmarks,
  calculateAverages,
  getMetricRange
} from '../data/benchmarksData'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function BenchBox() {
  const [activeModule, setActiveModule] = useState('consulta') // 'consulta', 'calculadora', 'comparador'

  return (
    <div className="section-reset">
      <div className="container-reset max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-block mb-3">
            <span className="text-reset-purple text-xs sm:text-sm font-bold uppercase tracking-wider">
              // BENCHMARKING DE MEDIOS DIGITALES
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-reset-white mb-3 lg:mb-4 leading-tight">
            BENCH<span className="text-gradient-neon">BOX</span>
          </h1>
          <p className="text-reset-gray-light text-base lg:text-lg max-w-3xl">
            Consulta benchmarks de costos de medios digitales, calcula presupuestos y compara performance de campañas
          </p>
        </div>

        {/* Module Selector */}
        <div className="flex flex-wrap gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setActiveModule('consulta')}
            className={`px-6 py-3 rounded-reset-sm font-body font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
              activeModule === 'consulta'
                ? 'bg-reset-purple text-reset-black'
                : 'bg-reset-gray-dark text-reset-white hover:bg-reset-gray-medium border border-reset-gray-light/20'
            }`}
          >
            📊 Consultar Benchmarks
          </button>
          <button
            onClick={() => setActiveModule('calculadora')}
            className={`px-6 py-3 rounded-reset-sm font-body font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
              activeModule === 'calculadora'
                ? 'bg-reset-neon text-reset-black'
                : 'bg-reset-gray-dark text-reset-white hover:bg-reset-gray-medium border border-reset-gray-light/20'
            }`}
          >
            💰 Calculadora de Presupuesto
          </button>
          <button
            onClick={() => setActiveModule('comparador')}
            className={`px-6 py-3 rounded-reset-sm font-body font-semibold text-sm uppercase tracking-wide transition-all duration-200 ${
              activeModule === 'comparador'
                ? 'bg-reset-cyan text-reset-black'
                : 'bg-reset-gray-dark text-reset-white hover:bg-reset-gray-medium border border-reset-gray-light/20'
            }`}
          >
            📈 Comparador de Performance
          </button>
        </div>

        {/* Module Content */}
        {activeModule === 'consulta' && <ConsultaBenchmarks />}
        {activeModule === 'calculadora' && <CalculadoraPresupuesto />}
        {activeModule === 'comparador' && <ComparadorPerformance />}
      </div>
    </div>
  )
}

// ========== MÓDULO 1: CONSULTA DE BENCHMARKS ==========
function ConsultaBenchmarks() {
  const [plataforma, setPlataforma] = useState('')
  const [objetivo, setObjetivo] = useState('')
  const [industria, setIndustria] = useState('')
  const [pais, setPais] = useState('Perú')
  const [results, setResults] = useState(null)

  const handleSearch = () => {
    const filtered = filterBenchmarks({ plataforma, objetivo, industria, pais })

    if (filtered.length === 0) {
      setResults({ error: 'No se encontraron benchmarks con estos filtros' })
      return
    }

    const averages = calculateAverages(filtered)
    const ranges = {
      cpm: getMetricRange(filtered, 'cpm'),
      cpc: getMetricRange(filtered, 'cpc'),
      cpl: getMetricRange(filtered, 'cpl'),
      cpa: getMetricRange(filtered, 'cpa'),
      ctr: getMetricRange(filtered, 'ctr')
    }

    setResults({ averages, ranges, count: filtered.length, records: filtered })
  }

  return (
    <div className="space-y-6">
      {/* Info Box */}
      <div className="card-reset-shadow bg-reset-gray-dark border-l-4 border-reset-purple animate-fade-in-up">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-reset-purple bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-reset-purple text-xl">ℹ</span>
            </div>
          </div>
          <div>
            <h3 className="text-reset-white font-semibold mb-2 uppercase tracking-wide">
              Acerca de los Benchmarks
            </h3>
            <p className="text-reset-gray-light text-sm">
              Los benchmarks están basados en datos reales de la industria (Q4 2024).
              Incluyen métricas de CPM, CPC, CPV, CPA, CPL y CTR para múltiples plataformas,
              industrias y países de LATAM.
            </p>
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="font-display text-2xl lg:text-3xl text-reset-white mb-6 uppercase">
          Filtros de <span className="text-reset-purple">Búsqueda</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              Plataforma
            </label>
            <select
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              className="input-reset"
            >
              <option value="">Todas las plataformas</option>
              {PLATAFORMAS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              Objetivo de Campaña
            </label>
            <select
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              className="input-reset"
            >
              <option value="">Todos los objetivos</option>
              {OBJETIVOS.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              Industria
            </label>
            <select
              value={industria}
              onChange={(e) => setIndustria(e.target.value)}
              className="input-reset"
            >
              <option value="">Todas las industrias</option>
              {INDUSTRIAS.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              País
            </label>
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              className="input-reset"
            >
              {PAISES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="btn-primary w-full"
        >
          🔍 Buscar Benchmarks
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="card-reset-shadow animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {results.error ? (
            <div className="alert-error">
              <div className="flex items-center">
                <span className="mr-2 text-2xl">⚠</span>
                <span>{results.error}</span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl lg:text-3xl text-reset-white uppercase">
                  Resultados
                </h2>
                <div className="text-reset-gray-light text-sm">
                  <span className="font-semibold">{results.count}</span> benchmark(s) encontrado(s)
                  {results.averages.totalSamples > 0 && (
                    <span className="ml-2">
                      • <span className="font-semibold">{results.averages.totalSamples}</span> campañas analizadas
                    </span>
                  )}
                </div>
              </div>

              {/* Métricas en Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {results.averages.cpm && (
                  <MetricCard
                    title="CPM"
                    value={`$${results.averages.cpm.toFixed(2)}`}
                    range={results.ranges.cpm}
                    color="purple"
                  />
                )}
                {results.averages.cpc && (
                  <MetricCard
                    title="CPC"
                    value={`$${results.averages.cpc.toFixed(2)}`}
                    range={results.ranges.cpc}
                    color="cyan"
                  />
                )}
                {results.averages.cpl && (
                  <MetricCard
                    title="CPL"
                    value={`$${results.averages.cpl.toFixed(2)}`}
                    range={results.ranges.cpl}
                    color="neon"
                  />
                )}
                {results.averages.cpa && (
                  <MetricCard
                    title="CPA"
                    value={`$${results.averages.cpa.toFixed(2)}`}
                    range={results.ranges.cpa}
                    color="magenta"
                  />
                )}
                {results.averages.ctr && (
                  <MetricCard
                    title="CTR"
                    value={`${results.averages.ctr.toFixed(2)}%`}
                    range={results.ranges.ctr}
                    color="blue"
                  />
                )}
                {results.averages.conversionRate && (
                  <MetricCard
                    title="Conv. Rate"
                    value={`${results.averages.conversionRate.toFixed(2)}%`}
                    color="green"
                  />
                )}
              </div>

              {/* Gráfico de comparación si hay múltiples registros */}
              {results.records.length > 1 && (
                <div className="mt-8">
                  <h3 className="text-reset-white font-semibold mb-4 uppercase tracking-wide">
                    Comparación por Registro
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={results.records.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis
                        dataKey="plataforma"
                        stroke="#888"
                        tick={{ fill: '#888', fontSize: 12 }}
                      />
                      <YAxis stroke="#888" tick={{ fill: '#888' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #00FF94' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend wrapperStyle={{ color: '#888' }} />
                      {results.averages.cpc && <Bar dataKey="cpc" fill="#00FFFF" name="CPC ($)" />}
                      {results.averages.cpm && <Bar dataKey="cpm" fill="#B580FF" name="CPM ($)" />}
                      {results.averages.cpl && <Bar dataKey="cpl" fill="#00FF94" name="CPL ($)" />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ========== MÓDULO 2: CALCULADORA DE PRESUPUESTO ==========
function CalculadoraPresupuesto() {
  const [plataforma, setPlataforma] = useState('Facebook')
  const [objetivo, setObjetivo] = useState('Lead Generation')
  const [industria, setIndustria] = useState('Banca')
  const [pais, setPais] = useState('Perú')
  const [metaLeads, setMetaLeads] = useState(500)
  const [metaClicks, setMetaClicks] = useState('')
  const [metaImpresiones, setMetaImpresiones] = useState('')
  const [tipoMeta, setTipoMeta] = useState('leads') // 'leads', 'clicks', 'impresiones'
  const [resultado, setResultado] = useState(null)

  const calcularPresupuesto = () => {
    const filtered = filterBenchmarks({ plataforma, objetivo, industria, pais })

    if (filtered.length === 0) {
      setResultado({ error: 'No hay benchmarks disponibles para esta combinación' })
      return
    }

    const averages = calculateAverages(filtered)
    let presupuestoBase = 0
    let detalles = {}

    if (tipoMeta === 'leads' && metaLeads && averages.cpl) {
      presupuestoBase = metaLeads * averages.cpl
      detalles = {
        tipo: 'Leads',
        meta: metaLeads,
        costoPorUnidad: averages.cpl,
        impresionesEstimadas: averages.ctr ? Math.round((metaLeads / (averages.ctr / 100)) / (averages.conversionRate / 100)) : null,
        clicksEstimados: averages.conversionRate ? Math.round(metaLeads / (averages.conversionRate / 100)) : null
      }
    } else if (tipoMeta === 'clicks' && metaClicks && averages.cpc) {
      presupuestoBase = metaClicks * averages.cpc
      detalles = {
        tipo: 'Clicks',
        meta: metaClicks,
        costoPorUnidad: averages.cpc,
        impresionesEstimadas: averages.ctr ? Math.round(metaClicks / (averages.ctr / 100)) : null,
        leadsEstimados: averages.conversionRate ? Math.round(metaClicks * (averages.conversionRate / 100)) : null
      }
    } else if (tipoMeta === 'impresiones' && metaImpresiones && averages.cpm) {
      presupuestoBase = (metaImpresiones / 1000) * averages.cpm
      detalles = {
        tipo: 'Impresiones',
        meta: metaImpresiones,
        costoPorUnidad: averages.cpm,
        clicksEstimados: averages.ctr ? Math.round(metaImpresiones * (averages.ctr / 100)) : null,
        leadsEstimados: (averages.ctr && averages.conversionRate) ? Math.round(metaImpresiones * (averages.ctr / 100) * (averages.conversionRate / 100)) : null
      }
    } else {
      setResultado({ error: 'Métrica no disponible para esta combinación' })
      return
    }

    const presupuestoConMargen = presupuestoBase * 1.20
    const presupuestoOptimo = presupuestoBase * 1.25

    setResultado({
      presupuestoBase,
      presupuestoConMargen,
      presupuestoOptimo,
      detalles,
      benchmarkInfo: {
        plataforma,
        objetivo,
        industria,
        pais,
        samples: averages.totalSamples
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="card-reset-shadow animate-fade-in-up">
        <h2 className="font-display text-2xl lg:text-3xl text-reset-white mb-6 uppercase">
          Configuración de <span className="text-reset-neon">Campaña</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              Plataforma
            </label>
            <select
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              className="input-reset"
            >
              {PLATAFORMAS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              Objetivo
            </label>
            <select
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              className="input-reset"
            >
              {OBJETIVOS.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              Industria
            </label>
            <select
              value={industria}
              onChange={(e) => setIndustria(e.target.value)}
              className="input-reset"
            >
              {INDUSTRIAS.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              País
            </label>
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              className="input-reset"
            >
              {PAISES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-reset-gray-medium pt-6 mt-6">
          <h3 className="text-reset-white font-semibold mb-4 uppercase tracking-wide">
            Meta de Campaña
          </h3>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setTipoMeta('leads')}
              className={`flex-1 px-4 py-3 rounded-reset text-sm font-semibold uppercase ${
                tipoMeta === 'leads'
                  ? 'bg-reset-neon text-reset-black'
                  : 'bg-reset-gray-dark text-reset-white hover:bg-reset-gray-medium'
              }`}
            >
              Leads
            </button>
            <button
              onClick={() => setTipoMeta('clicks')}
              className={`flex-1 px-4 py-3 rounded-reset text-sm font-semibold uppercase ${
                tipoMeta === 'clicks'
                  ? 'bg-reset-cyan text-reset-black'
                  : 'bg-reset-gray-dark text-reset-white hover:bg-reset-gray-medium'
              }`}
            >
              Clicks
            </button>
            <button
              onClick={() => setTipoMeta('impresiones')}
              className={`flex-1 px-4 py-3 rounded-reset text-sm font-semibold uppercase ${
                tipoMeta === 'impresiones'
                  ? 'bg-reset-purple text-reset-black'
                  : 'bg-reset-gray-dark text-reset-white hover:bg-reset-gray-medium'
              }`}
            >
              Impresiones
            </button>
          </div>

          {tipoMeta === 'leads' && (
            <div>
              <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                Cantidad de Leads Deseados
              </label>
              <input
                type="number"
                value={metaLeads}
                onChange={(e) => setMetaLeads(e.target.value)}
                className="input-reset"
                placeholder="500"
              />
            </div>
          )}

          {tipoMeta === 'clicks' && (
            <div>
              <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                Cantidad de Clicks Deseados
              </label>
              <input
                type="number"
                value={metaClicks}
                onChange={(e) => setMetaClicks(e.target.value)}
                className="input-reset"
                placeholder="10000"
              />
            </div>
          )}

          {tipoMeta === 'impresiones' && (
            <div>
              <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                Cantidad de Impresiones Deseadas
              </label>
              <input
                type="number"
                value={metaImpresiones}
                onChange={(e) => setMetaImpresiones(e.target.value)}
                className="input-reset"
                placeholder="100000"
              />
            </div>
          )}
        </div>

        <button
          onClick={calcularPresupuesto}
          className="btn-primary w-full mt-6"
        >
          💰 Calcular Presupuesto
        </button>
      </div>

      {/* Resultados */}
      {resultado && (
        <div className="card-reset-shadow animate-fade-in-up">
          {resultado.error ? (
            <div className="alert-error">
              <div className="flex items-center">
                <span className="mr-2 text-2xl">⚠</span>
                <span>{resultado.error}</span>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl lg:text-3xl text-reset-white mb-6 uppercase">
                Presupuesto <span className="text-reset-neon">Recomendado</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card-reset bg-reset-gray-dark border-reset-purple">
                  <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider mb-2">
                    Presupuesto Base
                  </div>
                  <div className="text-reset-purple text-3xl font-display font-black">
                    ${resultado.presupuestoBase.toFixed(2)}
                  </div>
                  <div className="text-reset-gray-light text-xs mt-1">
                    Costo mínimo estimado
                  </div>
                </div>

                <div className="card-reset bg-reset-gray-dark border-reset-neon">
                  <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider mb-2">
                    Con Margen +20%
                  </div>
                  <div className="text-reset-neon text-3xl font-display font-black">
                    ${resultado.presupuestoConMargen.toFixed(2)}
                  </div>
                  <div className="text-reset-gray-light text-xs mt-1">
                    Margen de seguridad
                  </div>
                </div>

                <div className="card-reset bg-reset-gray-dark border-reset-cyan">
                  <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider mb-2">
                    Óptimo Recomendado
                  </div>
                  <div className="text-reset-cyan text-3xl font-display font-black">
                    ${resultado.presupuestoOptimo.toFixed(2)}
                  </div>
                  <div className="text-reset-gray-light text-xs mt-1">
                    Incluye margen + tests
                  </div>
                </div>
              </div>

              <div className="bg-reset-gray-dark border-l-4 border-reset-neon rounded-reset p-6">
                <h3 className="text-reset-white font-semibold mb-4 uppercase tracking-wide">
                  Proyecciones Estimadas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-reset-gray-light">Meta de {resultado.detalles.tipo}:</span>
                    <span className="text-reset-white font-semibold">{resultado.detalles.meta.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-reset-gray-light">Costo por unidad:</span>
                    <span className="text-reset-white font-semibold">${resultado.detalles.costoPorUnidad.toFixed(2)}</span>
                  </div>
                  {resultado.detalles.impresionesEstimadas && (
                    <div className="flex justify-between">
                      <span className="text-reset-gray-light">Impresiones estimadas:</span>
                      <span className="text-reset-neon font-semibold">{resultado.detalles.impresionesEstimadas.toLocaleString()}</span>
                    </div>
                  )}
                  {resultado.detalles.clicksEstimados && (
                    <div className="flex justify-between">
                      <span className="text-reset-gray-light">Clicks estimados:</span>
                      <span className="text-reset-cyan font-semibold">{resultado.detalles.clicksEstimados.toLocaleString()}</span>
                    </div>
                  )}
                  {resultado.detalles.leadsEstimados && (
                    <div className="flex justify-between">
                      <span className="text-reset-gray-light">Leads estimados:</span>
                      <span className="text-reset-purple font-semibold">{resultado.detalles.leadsEstimados.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-reset-gray-medium text-xs text-reset-gray-light">
                  <p>
                    💡 <strong>Basado en:</strong> {resultado.benchmarkInfo.plataforma} • {resultado.benchmarkInfo.objetivo} • {resultado.benchmarkInfo.industria} • {resultado.benchmarkInfo.pais}
                    {resultado.benchmarkInfo.samples > 0 && ` • ${resultado.benchmarkInfo.samples} campañas analizadas`}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ========== MÓDULO 3: COMPARADOR DE PERFORMANCE ==========
function ComparadorPerformance() {
  const [plataforma, setPlataforma] = useState('Facebook')
  const [objetivo, setObjetivo] = useState('Lead Generation')
  const [industria, setIndustria] = useState('Banca')
  const [pais, setPais] = useState('Perú')

  // Métricas del usuario
  const [userCPM, setUserCPM] = useState('')
  const [userCPC, setUserCPC] = useState('')
  const [userCPL, setUserCPL] = useState('')
  const [userCPA, setUserCPA] = useState('')
  const [userCTR, setUserCTR] = useState('')
  const [userConvRate, setUserConvRate] = useState('')

  const [comparacion, setComparacion] = useState(null)

  const compararPerformance = () => {
    const filtered = filterBenchmarks({ plataforma, objetivo, industria, pais })

    if (filtered.length === 0) {
      setComparacion({ error: 'No hay benchmarks disponibles para esta combinación' })
      return
    }

    const benchmarks = calculateAverages(filtered)
    const metricas = []

    // Comparar cada métrica
    if (userCPM && benchmarks.cpm) {
      const diff = ((parseFloat(userCPM) - benchmarks.cpm) / benchmarks.cpm) * 100
      metricas.push({
        nombre: 'CPM',
        tuValor: parseFloat(userCPM),
        benchmark: benchmarks.cpm,
        diferencia: diff,
        status: diff > 15 ? 'malo' : (diff > -5 ? 'ok' : 'bueno')
      })
    }

    if (userCPC && benchmarks.cpc) {
      const diff = ((parseFloat(userCPC) - benchmarks.cpc) / benchmarks.cpc) * 100
      metricas.push({
        nombre: 'CPC',
        tuValor: parseFloat(userCPC),
        benchmark: benchmarks.cpc,
        diferencia: diff,
        status: diff > 15 ? 'malo' : (diff > -5 ? 'ok' : 'bueno')
      })
    }

    if (userCPL && benchmarks.cpl) {
      const diff = ((parseFloat(userCPL) - benchmarks.cpl) / benchmarks.cpl) * 100
      metricas.push({
        nombre: 'CPL',
        tuValor: parseFloat(userCPL),
        benchmark: benchmarks.cpl,
        diferencia: diff,
        status: diff > 15 ? 'malo' : (diff > -5 ? 'ok' : 'bueno')
      })
    }

    if (userCPA && benchmarks.cpa) {
      const diff = ((parseFloat(userCPA) - benchmarks.cpa) / benchmarks.cpa) * 100
      metricas.push({
        nombre: 'CPA',
        tuValor: parseFloat(userCPA),
        benchmark: benchmarks.cpa,
        diferencia: diff,
        status: diff > 15 ? 'malo' : (diff > -5 ? 'ok' : 'bueno')
      })
    }

    if (userCTR && benchmarks.ctr) {
      const diff = ((parseFloat(userCTR) - benchmarks.ctr) / benchmarks.ctr) * 100
      metricas.push({
        nombre: 'CTR',
        tuValor: parseFloat(userCTR),
        benchmark: benchmarks.ctr,
        diferencia: diff,
        status: diff > 15 ? 'bueno' : (diff > -5 ? 'ok' : 'malo')
      })
    }

    if (userConvRate && benchmarks.conversionRate) {
      const diff = ((parseFloat(userConvRate) - benchmarks.conversionRate) / benchmarks.conversionRate) * 100
      metricas.push({
        nombre: 'Conv. Rate',
        tuValor: parseFloat(userConvRate),
        benchmark: benchmarks.conversionRate,
        diferencia: diff,
        status: diff > 15 ? 'bueno' : (diff > -5 ? 'ok' : 'malo')
      })
    }

    if (metricas.length === 0) {
      setComparacion({ error: 'Ingresa al menos una métrica para comparar' })
      return
    }

    // Generar recomendaciones
    const recomendaciones = []
    metricas.forEach(m => {
      if (m.status === 'malo') {
        if (m.nombre === 'CPM' || m.nombre === 'CPC' || m.nombre === 'CPL' || m.nombre === 'CPA') {
          recomendaciones.push(`${m.nombre} está ${Math.abs(m.diferencia).toFixed(1)}% sobre benchmark - considera optimizar targeting o creativos`)
        } else {
          recomendaciones.push(`${m.nombre} está ${Math.abs(m.diferencia).toFixed(1)}% bajo benchmark - revisa ${m.nombre === 'CTR' ? 'tus creativos' : 'tu landing page'}`)
        }
      }
    })

    setComparacion({ metricas, recomendaciones })
  }

  return (
    <div className="space-y-6">
      <div className="card-reset-shadow animate-fade-in-up">
        <h2 className="font-display text-2xl lg:text-3xl text-reset-white mb-6 uppercase">
          Configuración de <span className="text-reset-cyan">Comparación</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              Plataforma
            </label>
            <select
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              className="input-reset"
            >
              {PLATAFORMAS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              Objetivo
            </label>
            <select
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              className="input-reset"
            >
              {OBJETIVOS.map(o => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              Industria
            </label>
            <select
              value={industria}
              onChange={(e) => setIndustria(e.target.value)}
              className="input-reset"
            >
              {INDUSTRIAS.map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
              País
            </label>
            <select
              value={pais}
              onChange={(e) => setPais(e.target.value)}
              className="input-reset"
            >
              {PAISES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="border-t border-reset-gray-medium pt-6 mt-6">
          <h3 className="text-reset-white font-semibold mb-4 uppercase tracking-wide">
            Tus Métricas de Campaña
          </h3>
          <p className="text-reset-gray-light text-sm mb-4">
            Ingresa las métricas que quieras comparar (las que no ingreses se omitirán)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                CPM ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={userCPM}
                onChange={(e) => setUserCPM(e.target.value)}
                className="input-reset"
                placeholder="Ej: 8.50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                CPC ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={userCPC}
                onChange={(e) => setUserCPC(e.target.value)}
                className="input-reset"
                placeholder="Ej: 1.85"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                CPL ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={userCPL}
                onChange={(e) => setUserCPL(e.target.value)}
                className="input-reset"
                placeholder="Ej: 12.50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                CPA ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={userCPA}
                onChange={(e) => setUserCPA(e.target.value)}
                className="input-reset"
                placeholder="Ej: 25.00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                CTR (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={userCTR}
                onChange={(e) => setUserCTR(e.target.value)}
                className="input-reset"
                placeholder="Ej: 1.25"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-reset-white mb-2 uppercase tracking-wide">
                Conv. Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={userConvRate}
                onChange={(e) => setUserConvRate(e.target.value)}
                className="input-reset"
                placeholder="Ej: 8.5"
              />
            </div>
          </div>
        </div>

        <button
          onClick={compararPerformance}
          className="btn-primary w-full mt-6"
        >
          📈 Comparar con Benchmark
        </button>
      </div>

      {/* Resultados de Comparación */}
      {comparacion && (
        <div className="card-reset-shadow animate-fade-in-up">
          {comparacion.error ? (
            <div className="alert-error">
              <div className="flex items-center">
                <span className="mr-2 text-2xl">⚠</span>
                <span>{comparacion.error}</span>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl lg:text-3xl text-reset-white mb-6 uppercase">
                Análisis de <span className="text-reset-cyan">Performance</span>
              </h2>

              <div className="space-y-4 mb-8">
                {comparacion.metricas.map((metrica, idx) => (
                  <div key={idx} className="bg-reset-gray-dark rounded-reset p-4 border-l-4" style={{
                    borderColor: metrica.status === 'bueno' ? '#00FF94' : (metrica.status === 'malo' ? '#FF0080' : '#FFAA00')
                  }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-reset-white font-semibold text-lg">{metrica.nombre}</div>
                      <div className="flex items-center gap-2">
                        {metrica.status === 'bueno' && <span className="text-reset-neon text-xl">✓</span>}
                        {metrica.status === 'malo' && <span className="text-reset-magenta text-xl">⚠</span>}
                        {metrica.status === 'ok' && <span className="text-yellow-400 text-xl">○</span>}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-reset-gray-light mb-1">Tu Valor</div>
                        <div className="text-reset-white font-semibold text-xl">
                          {metrica.nombre.includes('Rate') || metrica.nombre === 'CTR'
                            ? `${metrica.tuValor.toFixed(2)}%`
                            : `$${metrica.tuValor.toFixed(2)}`
                          }
                        </div>
                      </div>
                      <div>
                        <div className="text-reset-gray-light mb-1">Benchmark</div>
                        <div className="text-reset-cyan font-semibold text-xl">
                          {metrica.nombre.includes('Rate') || metrica.nombre === 'CTR'
                            ? `${metrica.benchmark.toFixed(2)}%`
                            : `$${metrica.benchmark.toFixed(2)}`
                          }
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-reset-gray-medium">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-reset-gray-light">Diferencia:</span>
                        <span className={`font-semibold ${
                          metrica.status === 'bueno' ? 'text-reset-neon' :
                          metrica.status === 'malo' ? 'text-reset-magenta' :
                          'text-yellow-400'
                        }`}>
                          {metrica.diferencia > 0 ? '+' : ''}{metrica.diferencia.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {comparacion.recomendaciones.length > 0 && (
                <div className="bg-reset-gray-dark border-l-4 border-reset-magenta rounded-reset p-6">
                  <h3 className="text-reset-white font-semibold mb-4 uppercase tracking-wide flex items-center">
                    <span className="text-reset-magenta mr-2">💡</span>
                    Recomendaciones de Optimización
                  </h3>
                  <ul className="space-y-2">
                    {comparacion.recomendaciones.map((rec, idx) => (
                      <li key={idx} className="text-reset-gray-light text-sm flex items-start">
                        <span className="text-reset-cyan mr-2 mt-0.5">▶</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ========== COMPONENTE AUXILIAR: METRIC CARD ==========
function MetricCard({ title, value, range, color }) {
  const colorClasses = {
    purple: 'border-reset-purple text-reset-purple bg-reset-purple/10',
    cyan: 'border-reset-cyan text-reset-cyan bg-reset-cyan/10',
    neon: 'border-reset-neon text-reset-neon bg-reset-neon/10',
    magenta: 'border-reset-magenta text-reset-magenta bg-reset-magenta/10',
    blue: 'border-reset-blue text-reset-blue bg-reset-blue/10',
    green: 'border-green-500 text-green-500 bg-green-500/10'
  }

  return (
    <div className={`card-reset ${colorClasses[color] || colorClasses.purple}`}>
      <div className="text-reset-gray-light text-xs font-bold uppercase tracking-wider mb-2">
        {title}
      </div>
      <div className={`text-3xl font-display font-black mb-2 ${color === 'green' ? 'text-green-500' : color === 'blue' ? 'text-reset-blue' : ''}`}>
        {value}
      </div>
      {range && (
        <div className="text-reset-gray-light text-xs">
          Rango: ${range.min.toFixed(2)} - ${range.max.toFixed(2)}
        </div>
      )}
    </div>
  )
}
