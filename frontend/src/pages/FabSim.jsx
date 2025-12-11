import { useState, useEffect, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function FabSim() {
  const containerRef = useRef(null)
  const [inputRate, setInputRate] = useState(1.0)
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0)
  const [defectRate, setDefectRate] = useState(5)
  const [isRunning, setIsRunning] = useState(true)
  
  const [machines, setMachines] = useState([
    { id: 'dep', name: 'Deposition', x: 10, y: 40, width: 20, height: 20, processTime: 2000, queue: 0 },
    { id: 'litho', name: 'Lithography', x: 40, y: 40, width: 20, height: 20, processTime: 2500, queue: 0 },
    { id: 'etch', name: 'Etching', x: 70, y: 40, width: 20, height: 20, processTime: 1800, queue: 0 }
  ])
  
  const [totalInput, setTotalInput] = useState(0)
  const [totalCompleted, setTotalCompleted] = useState(0)
  const [totalDefects, setTotalDefects] = useState(0)
  const [costData, setCostData] = useState(Array(10).fill(0))

  // 원본 HTML처럼 직접 DOM 조작을 위한 ref들
  const wafersRef = useRef([])
  const machinesRef = useRef(machines)
  const lastSpawnTimeRef = useRef(0)
  const inputRateRef = useRef(1000)
  const speedMultiplierRef = useRef(1.0)
  const defectRateRef = useRef(0.05)

  useEffect(() => {
    machinesRef.current = machines
  }, [machines])

  useEffect(() => {
    inputRateRef.current = inputRate * 1000
  }, [inputRate])

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier
  }, [speedMultiplier])

  useEffect(() => {
    defectRateRef.current = defectRate / 100
  }, [defectRate])

  // 원본 HTML처럼 DOM 직접 조작
  const createWafer = () => {
    if (!containerRef.current) return

    const wafer = document.createElement('div')
    wafer.className = 'wafer'
    wafer.style.left = '0%'
    wafer.style.top = '50%'
    containerRef.current.appendChild(wafer)

    const data = {
      el: wafer,
      stage: -1,
      progress: 0,
      isDefect: false
    }
    wafersRef.current.push(data)
    setTotalInput(prev => prev + 1)
  }

  useEffect(() => {
    if (!isRunning || !containerRef.current) return

    let animationFrameId

    const updateSim = (timestamp) => {
      if (!isRunning) return

      const currentMachines = machinesRef.current

      // Spawning Logic (원본과 동일)
      if (timestamp - lastSpawnTimeRef.current > (inputRateRef.current / speedMultiplierRef.current)) {
        createWafer()
        lastSpawnTimeRef.current = timestamp
      }

      // Update Wafers (원본 HTML 로직 그대로)
      wafersRef.current.forEach((w, index) => {
        if (w.stage === 3) return // Completed

        const speed = 0.5 * speedMultiplierRef.current

        if (w.stage === -1) {
          // Moving to Machine 0 (원본과 동일)
          const dx = currentMachines[0].x - parseFloat(w.el.style.left || 0)
          if (Math.abs(dx) < 1) {
            w.stage = 0
            setMachines(prev => prev.map((m, idx) => 
              idx === 0 ? { ...m, queue: m.queue + 1 } : m
            ))
          }
        } else if (w.stage < currentMachines.length) {
          // Processing inside machine (원본과 동일)
          w.progress += speed
          w.el.style.top = (currentMachines[w.stage].y + 10 + Math.sin(Date.now()/100 + w.el.id)*2) + '%'
          w.el.style.left = (currentMachines[w.stage].x + 10 + Math.cos(Date.now()/100 + w.el.id)*2) + '%'

          const requiredTime = (currentMachines[w.stage].processTime / speedMultiplierRef.current) / 16

          if (w.progress > requiredTime) {
            // Process Finished
            setMachines(prev => prev.map((m, idx) => 
              idx === w.stage ? { ...m, queue: Math.max(0, m.queue - 1) } : m
            ))

            // Defect Check
            if (w.stage === 2) {
              if (Math.random() < defectRateRef.current) {
                w.isDefect = true
                w.el.classList.add('defect')
                setTotalDefects(prev => prev + 1)
              }
            }

            w.stage++
            w.progress = 0

            if (w.stage < currentMachines.length) {
              setMachines(prev => prev.map((m, idx) => 
                idx === w.stage ? { ...m, queue: m.queue + 1 } : m
              ))
            } else {
              // Simulation Complete
              setTotalCompleted(prev => prev + 1)
              w.el.remove()
              delete wafersRef.current[index]
            }
          }
        }

        if (w.stage === -1) {
          const currentLeft = parseFloat(w.el.style.left || 0)
          w.el.style.left = (currentLeft + speed) + '%'
        }
      })

      // Cleanup array
      wafersRef.current = wafersRef.current.filter(w => w !== undefined)

      animationFrameId = requestAnimationFrame(updateSim)
    }

    animationFrameId = requestAnimationFrame(updateSim)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isRunning])

  useEffect(() => {
    const yieldVal = totalCompleted > 0 
      ? ((totalCompleted - totalDefects) / totalCompleted * 100).toFixed(1)
      : 100

    const cost = (totalCompleted * 10) + (totalDefects * 50)

    if (Math.random() < 0.05) {
      setCostData(prev => {
        const newData = [...prev]
        newData.shift()
        newData.push(cost)
        return newData
      })
    }
  }, [totalCompleted, totalDefects])

  const resetSim = () => {
    wafersRef.current.forEach(w => w.el?.remove())
    wafersRef.current = []
    setTotalInput(0)
    setTotalCompleted(0)
    setTotalDefects(0)
    setMachines(prev => prev.map(m => ({ ...m, queue: 0 })))
  }

  const yieldVal = totalCompleted > 0 
    ? ((totalCompleted - totalDefects) / totalCompleted * 100).toFixed(1)
    : 100

  const costChartData = {
    labels: Array(10).fill(''),
    datasets: [{
      label: 'Cost ($)',
      data: costData,
      borderColor: '#3b82f6',
      tension: 0.4,
      pointRadius: 0,
      borderWidth: 2
    }]
  }

  const costChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0 }
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">W</div>
          <h1 className="text-xl font-bold tracking-tight">AI-WEBSIM <span className="text-slate-500 text-sm font-normal ml-2">| Fab Process Optimizer</span></h1>
        </div>
        <div className="flex gap-4 text-sm text-slate-400">
          <span>Status: <span className="text-green-400 font-mono">Running (SimPy Backend Emulation)</span></span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-slate-800 border-r border-slate-700 p-5 flex flex-col gap-6 overflow-y-auto shrink-0">
          <div className="bg-slate-900 p-3 rounded border border-slate-600">
            <h3 className="text-xs font-bold text-blue-400 mb-1 uppercase">LLM Generated Scenario</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              "반도체 웨이퍼 공정 시뮬레이션을 생성해줘. 공정은 Deposition, Lithography, Etching 순서야. 각 단계별 병목 현상을 확인하고 싶어."
            </p>
          </div>

          <hr className="border-slate-700" />

          <div>
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
              Parameter Control
            </h2>
            
            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Wafer Input Rate</label>
                <span className="text-sm font-mono text-blue-400">{inputRate.toFixed(1)}s</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={inputRate}
                onChange={(e) => setInputRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">투입 간격이 짧을수록 부하 증가</p>
            </div>

            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Process Speed (Global)</label>
                <span className="text-sm font-mono text-blue-400">x{speedMultiplier.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">장비 처리 속도 계수</p>
            </div>

            <div className="mb-5">
              <div className="flex justify-between mb-1">
                <label className="text-sm font-medium">Defect Rate (Etching)</label>
                <span className="text-sm font-mono text-red-400">{defectRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="20"
                step="1"
                value={defectRate}
                onChange={(e) => setDefectRate(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <p className="text-xs text-slate-500 mt-1">식각 공정 불량 발생 확률</p>
            </div>

            <button
              onClick={resetSim}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded transition border border-slate-500"
            >
              Reset Simulation
            </button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col p-5 gap-5 overflow-hidden">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-end mb-2">
              <h2 className="font-bold text-lg">Real-time Fab Visualization</h2>
              <div className="flex gap-4 text-xs font-mono">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-400"></div> Normal Wafer</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Defective</span>
              </div>
            </div>
            <div ref={containerRef} className="sim-canvas w-full h-full shadow-inner relative">
              {machines.map(m => (
                <div
                  key={m.id}
                  className={`machine ${m.queue > 5 ? 'bottleneck' : ''}`}
                  style={{
                    left: `${m.x}%`,
                    top: `${m.y}%`,
                    width: `${m.width}%`,
                    height: `${m.height}%`
                  }}
                >
                  <span className="text-xs font-bold text-blue-200">{m.name}</span>
                  <span className="text-xs mt-1 font-mono bg-slate-900 px-1 rounded">Q: {m.queue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-48 grid grid-cols-3 gap-5 shrink-0">
            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col justify-between">
              <h4 className="text-slate-400 text-sm font-semibold">Overall Yield</h4>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">{yieldVal}%</span>
                <span className="text-sm text-slate-500 mb-1">efficiency</span>
              </div>
              <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-green-500 h-full transition-all" style={{ width: `${yieldVal}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
              <h4 className="text-slate-400 text-sm font-semibold mb-2">Process Cost / Output</h4>
              <div className="relative h-24 w-full">
                <Line data={costChartData} options={costChartOptions} />
              </div>
            </div>

            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex flex-col justify-between">
              <h4 className="text-slate-400 text-sm font-semibold">Throughput (Wafers)</h4>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="bg-slate-900 p-2 rounded text-center">
                  <span className="block text-xs text-slate-500">Total Input</span>
                  <span className="text-xl font-mono font-bold">{totalInput}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded text-center">
                  <span className="block text-xs text-slate-500">Completed</span>
                  <span className="text-xl font-mono font-bold text-blue-400">{totalCompleted}</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-center text-red-400">Defects: <span>{totalDefects}</span></div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .sim-canvas {
          background: #1e293b;
          border-radius: 8px;
          border: 1px solid #334155;
          position: relative;
          overflow: hidden;
        }
        .machine {
          border: 2px solid #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .machine.bottleneck {
          border-color: #ef4444;
          background: rgba(239, 68, 68, 0.2);
          animation: pulse-red 1s ease-in-out infinite;
        }
        .wafer {
          width: 16px;
          height: 16px;
          background: #4ade80;
          border-radius: 50%;
          position: absolute !important;
          transition: left 0.1s linear, top 0.1s linear;
          box-shadow: 0 0 8px #4ade80, 0 0 12px rgba(74, 222, 128, 0.5);
          animation: wafer-glow 2s ease-in-out infinite;
          z-index: 10;
          pointer-events: none;
        }
        .wafer.defect {
          background: #ef4444;
          box-shadow: 0 0 8px #ef4444, 0 0 12px rgba(239, 68, 68, 0.5);
          animation: wafer-glow-red 2s ease-in-out infinite;
        }
        @keyframes pulse-red {
          0%, 100% {
            border-color: #ef4444;
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          50% {
            border-color: #dc2626;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0);
          }
        }
        @keyframes wafer-glow {
          0%, 100% {
            box-shadow: 0 0 5px #4ade80;
          }
          50% {
            box-shadow: 0 0 10px #4ade80, 0 0 15px #4ade80;
          }
        }
        @keyframes wafer-glow-red {
          0%, 100% {
          box-shadow: 0 0 5px #ef4444;
          }
          50% {
            box-shadow: 0 0 10px #ef4444, 0 0 15px #ef4444;
          }
        }
      `}</style>
    </div>
  )
}

