import { useState, useEffect } from 'react'
import { Radar, Scatter } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  RadialLinearScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  RadialLinearScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function HWSim() {
  const [state, setState] = useState({
    workload: 'compute',
    cores: 8,
    clock: 3.0,
    cache: 32,
    bw: 200,
    perfScore: 0,
    cost: 0,
    power: 0
  })

  const BASE_COST = 50
  const COST_PER_CORE = 15
  const COST_PER_MB_CACHE = 1.5
  const COST_PER_GB_BW = 0.2
  const BASE_POWER = 30

  const calculateMetrics = () => {
    setState(prev => {
      let corePower = prev.cores * Math.pow(prev.clock, 2.8) * 0.8
      let uncorePower = (prev.cache * 0.2) + (prev.bw * 0.1)
      const power = Math.round(BASE_POWER + corePower + uncorePower)

      const cost = Math.round(BASE_COST + (prev.cores * COST_PER_CORE) + (prev.cache * COST_PER_MB_CACHE) + (prev.bw * COST_PER_GB_BW))

      let baseComputePerf = prev.cores * prev.clock * 100
      let requiredBW = (prev.workload === 'compute') ? baseComputePerf * 0.1 : baseComputePerf * 0.5
      let cacheHitBenefit = Math.min(1, Math.sqrt(prev.cache) / 15)
      let effectiveBWNeeded = requiredBW * (1 - cacheHitBenefit)
      
      let bwPenaltyFactor = 1.0
      if (effectiveBWNeeded > prev.bw) {
        bwPenaltyFactor = prev.bw / effectiveBWNeeded
        if (prev.workload === 'memory') bwPenaltyFactor = Math.pow(bwPenaltyFactor, 1.5)
      }

      const perfScore = Math.round(baseComputePerf * bwPenaltyFactor)

      return { ...prev, perfScore, cost, power }
    })
  }

  useEffect(() => {
    calculateMetrics()
  }, [state.cores, state.clock, state.cache, state.bw, state.workload])

  const updateUI = () => {
    // This will be handled by React state updates
  }

  const perfNorm = Math.min(100, state.perfScore / 250)
  const powerEffNorm = Math.min(100, (state.perfScore / state.power) * 2)
  const costEffNorm = Math.min(100, (state.perfScore / state.cost) * 3)

  const radarData = {
    labels: ['Performance', 'Power Efficiency', 'Cost Efficiency'],
    datasets: [{
      label: 'Current Design',
      data: [perfNorm, powerEffNorm, costEffNorm],
      backgroundColor: 'rgba(147, 51, 234, 0.2)',
      borderColor: 'rgba(147, 51, 234, 1)',
      pointBackgroundColor: 'rgba(147, 51, 234, 1)',
      borderWidth: 2
    }]
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false },
        grid: { color: '#334155' }
      }
    },
    plugins: { legend: { display: false } }
  }

  const tradeoffData = {
    datasets: [
      {
        label: 'Current Point',
        data: [{ x: state.cost, y: state.perfScore }],
        backgroundColor: '#4ade80',
        pointRadius: 8,
        pointHoverRadius: 10
      },
      {
        label: 'Reference Points',
        data: [
          { x: 300, y: 1500 },
          { x: 450, y: 3000 },
          { x: 600, y: 6000 },
          { x: 800, y: 12000 },
          { x: 150, y: 800 }
        ],
        backgroundColor: '#64748b',
        pointRadius: 4
      }
    ]
  }

  const tradeoffOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Cost ($)', color: '#94a3b8' },
        grid: { color: '#334155' },
        min: 0,
        max: 1200
      },
      y: {
        title: { display: true, text: 'Performance Score', color: '#94a3b8' },
        grid: { color: '#334155' },
        min: 0,
        max: 25000
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false }
    }
  }

  const heatIntensity = (state.clock - 2.0) / 3.0
  const cacheGrowFactor = 1 + (state.cache - 16) / 112 * 3
  const animDuration = 3.5 - (state.bw / 800) * 3
  const powerPercentage = Math.min(100, (state.power / 800) * 100)
  const cols = state.cores <= 8 ? 4 : (state.cores <= 16 ? 4 : 8)

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center font-bold text-white">A</div>
          <h1 className="text-xl font-bold tracking-tight">AI-WEBSIM <span className="text-slate-500 text-sm font-normal ml-2">| HW Architecture Analyst</span></h1>
        </div>
        <div className="text-sm text-slate-400">
          Mode: <span className="text-purple-400 font-mono">Trade-off Analysis</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-slate-800 border-r border-slate-700 p-5 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div>
            <h2 className="font-bold text-sm text-slate-300 mb-2">Target Workload Scenario</h2>
            <select
              value={state.workload}
              onChange={(e) => setState(prev => ({ ...prev, workload: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
            >
              <option value="compute">Compute Bound (e.g., Rendering, AI Inf)</option>
              <option value="memory">Memory Bound (e.g., Database, Big Data)</option>
            </select>
            <p className="text-xs text-slate-500 mt-2">
              {state.workload === 'compute'
                ? "연산 중심: 높은 클럭과 코어 수가 중요하며, 캐시 효율이 상대적으로 낮습니다."
                : "메모리 중심: 큰 캐시와 높은 메모리 대역폭이 성능 병목을 해소합니다."}
            </p>
          </div>

          <hr className="border-slate-700" />

          <div>
            <h2 className="font-bold text-sm text-blue-400 mb-4 flex items-center gap-2">CPU Compute Complex</h2>
            
            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium">Core Count</label>
                <span className="text-xs font-mono text-white">{state.cores} Cores</span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                step="4"
                value={state.cores}
                onChange={(e) => setState(prev => ({ ...prev, cores: parseInt(e.target.value) }))}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium">Clock Speed (GHz)</label>
                <span className="text-xs font-mono text-white">{state.clock.toFixed(1)} GHz</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="5.0"
                step="0.1"
                value={state.clock}
                onChange={(e) => setState(prev => ({ ...prev, clock: parseFloat(e.target.value) }))}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer"
              />
              {(state.clock > 4.0 || state.cores > 24) && (
                <p className="text-xs text-red-400 mt-1">⚠️ High power consumption expected</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-sm text-green-400 mb-4 flex items-center gap-2">Memory Hierarchy</h2>
            
            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium">L3 Cache Size (MB)</label>
                <span className="text-xs font-mono text-white">{state.cache} MB</span>
              </div>
              <input
                type="range"
                min="16"
                max="128"
                step="16"
                value={state.cache}
                onChange={(e) => setState(prev => ({ ...prev, cache: parseInt(e.target.value) }))}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <label className="text-xs font-medium">DRAM Bandwidth (GB/s)</label>
                <span className="text-xs font-mono text-white">{state.bw} GB/s</span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="100"
                value={state.bw}
                onChange={(e) => setState(prev => ({ ...prev, bw: parseInt(e.target.value) }))}
                className="w-full h-1 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col p-5 gap-5 overflow-hidden bg-slate-950">
          <div className="h-2/5 bg-slate-900 rounded-lg border border-slate-700 p-4 flex flex-col relative overflow-hidden">
            <h2 className="text-sm font-bold text-slate-400 mb-2 absolute top-4 left-4">Dynamic Architecture Block Diagram</h2>
            
            <div className="flex-1 flex gap-2 items-stretch justify-center pt-8 px-8 pb-2">
              <div className="flex-1 flex flex-col gap-1" style={{ flexBasis: '40%' }}>
                <div className={`flex-1 grid ${cols === 4 ? 'grid-cols-4' : 'grid-cols-8'} gap-1 bg-slate-800 p-1 rounded border border-blue-900/50 transition-all`}>
                  {Array.from({ length: state.cores }).map((_, i) => (
                    <div key={i} className="hw-block cpu-core text-[10px] text-blue-200 h-full relative overflow-hidden">
                      <div className="z-10">C{i}</div>
                      <div
                        className="heat-overlay"
                        style={{
                          opacity: heatIntensity * 0.8,
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle, rgba(239,68,68,0.6) 0%, rgba(239,68,68,0) 70%)',
                          pointerEvents: 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="text-xs text-center text-blue-400 font-mono mt-1">CPU Complex</div>
              </div>

              <div className="w-4 bg-slate-700 flex items-center justify-center">
                <div className="h-full w-1 bg-slate-500 animate-pulse"></div>
              </div>

              <div className="flex-1 flex flex-col gap-2" style={{ flexBasis: '50%' }}>
                <div className="hw-block cache-block flex-1" style={{ flexGrow: cacheGrowFactor }}>
                  <div className="z-10 flex flex-col">
                    <span>L3 Cache (Shared)</span>
                    <span className="text-xs font-mono">{state.cache}MB</span>
                  </div>
                </div>
                <div className="hw-block memory-block h-16 relative">
                  <div className="z-10 flex flex-col">
                    <span>DRAM Interface</span>
                    <span className="text-xs font-mono">{state.bw} GB/s</span>
                  </div>
                  <div
                    className="absolute inset-0 opacity-30 bg-[linear-gradient(90deg,transparent_0%,#f59e0b_50%,transparent_100%)] bg-[length:200%_100%]"
                    style={{
                      animation: `flow ${animDuration}s linear infinite`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-3/5 grid grid-cols-5 gap-5 shrink-0">
            <div className="col-span-2 grid grid-rows-3 gap-3">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col justify-center relative overflow-hidden">
                <h4 className="text-slate-400 text-xs font-semibold uppercase mb-1">Estimated Performance Score</h4>
                <div className="flex items-baseline gap-2 z-10">
                  <span className="text-4xl font-bold text-purple-400">{state.perfScore.toLocaleString()}</span>
                  <span className="text-xs text-slate-500">points</span>
                </div>
              </div>

              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col justify-center relative overflow-hidden">
                <h4 className="text-slate-400 text-xs font-semibold uppercase mb-1">Estimated Unit Cost</h4>
                <div className="flex items-baseline gap-2 z-10">
                  <span className="text-3xl font-bold text-green-400">{state.cost.toLocaleString()}</span>
                  <span className="text-xs text-slate-500">USD</span>
                </div>
              </div>

              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex flex-col justify-center relative overflow-hidden">
                <h4 className="text-slate-400 text-xs font-semibold uppercase mb-1">Estimated Power (TDP)</h4>
                <div className="flex items-baseline gap-2 z-10">
                  <span className="text-3xl font-bold text-red-400">{state.power}</span>
                  <span className="text-xs text-slate-500">Watts</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${powerPercentage >= 70 ? 'bg-purple-500' : 'bg-red-500'}`}
                    style={{ width: `${powerPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="col-span-1 bg-slate-800 p-3 rounded-lg border border-slate-700 flex items-center justify-center">
              <div className="w-full h-full relative">
                <Radar data={radarData} options={radarOptions} />
              </div>
            </div>

            <div className="col-span-2 bg-slate-800 p-3 rounded-lg border border-slate-700 relative">
              <h4 className="text-slate-400 text-xs font-semibold absolute top-3 left-3">Performance vs. Cost Trade-off</h4>
              <div className="w-full h-full pt-6">
                <Scatter data={tradeoffData} options={tradeoffOptions} />
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .hw-block {
          transition: all 0.3s ease;
          border: 2px solid #334155;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cpu-core {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
        }
        .cache-block {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
        }
        .memory-block {
          background: rgba(245, 158, 11, 0.2);
          border-color: #f59e0b;
        }
      `}</style>
    </div>
  )
}

