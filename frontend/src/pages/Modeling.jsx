import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/modeling.css'

export default function Modeling() {
  const navigate = useNavigate()
  const chatContainer = useRef(null)
  const [messages, setMessages] = useState([
    {
      type: 'ai',
      text: '안녕하세요! 시뮬레이션 모델링을 도와드리겠습니다.\n어떤 시스템을 시뮬레이션하고 싶으신가요?',
      suggestions: null
    }
  ])
  const [metrics, setMetrics] = useState([])
  const [targetSimulation, setTargetSimulation] = useState(null)
  const [progress, setProgress] = useState(0)

  const scrollToBottom = () => {
    if (chatContainer.current) {
      chatContainer.current.scrollTo({ top: chatContainer.current.scrollHeight, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fillAndSend = (text) => {
    handleInput(text)
  }

  const handleInput = (text = null) => {
    const input = document.getElementById('user-input')
    const messageText = text || input?.value.trim()
    if (!messageText) return

    // Add user message
    setMessages(prev => [...prev, { type: 'user', text: messageText }])
    if (input) input.value = ''
    
    setTimeout(() => {
      generateAIResponse(messageText)
    }, 800)
  }

  const generateAIResponse = (text) => {
    let responseText = ""
    let suggestions = []
    
    if (text.includes("반도체") || text.includes("공정") || text.includes("웨이퍼") || text.includes("Fab")) {
      setTargetSimulation('fab')
      responseText = "반도체 Fab 공정 시뮬레이션을 설계합니다. 핵심 성과 지표인 <strong>생산량(Throughput)</strong>과 <strong>수율(Yield)</strong> 분석 모델을 구성할까요?"
      suggestions = [
        { id: 'throughput', name: 'Throughput', desc: 'Wafer output per hour', icon: 'fa-box-open', color: 'text-green-400' },
        { id: 'yield', name: 'Yield Rate', desc: 'Defect analysis model', icon: 'fa-chart-pie', color: 'text-purple-400' },
        { id: 'bottleneck', name: 'Bottleneck Check', desc: 'Identify slowest step', icon: 'fa-triangle-exclamation', color: 'text-red-400' }
      ]
    } else if (text.includes("CPU") || text.includes("아키텍처") || text.includes("컴퓨터") || text.includes("하드웨어") || text.includes("성능")) {
      setTargetSimulation('cpu')
      responseText = "하드웨어 아키텍처 분석 모델을 설계합니다. <strong>코어 성능</strong>과 <strong>전력 효율</strong> 간의 트레이드오프 분석을 준비했습니다."
      suggestions = [
        { id: 'perf_score', name: 'Performance', desc: 'Compute capability score', icon: 'fa-microchip', color: 'text-blue-400' },
        { id: 'power_eff', name: 'Power (TDP)', desc: 'Watt consumption model', icon: 'fa-bolt', color: 'text-yellow-400' },
        { id: 'cost_eff', name: 'Unit Cost', desc: 'Manufacturing cost', icon: 'fa-dollar-sign', color: 'text-green-400' }
      ]
    } else {
      setTargetSimulation('fab')
      responseText = `"${text}"에 대한 모델링을 시작합니다. 먼저 분석하고 싶은 핵심 지표(KPI)를 선택해주세요.`
      suggestions = [
        { id: 'generic_time', name: 'Processing Time', desc: 'Time per task', icon: 'fa-stopwatch', color: 'text-slate-200' },
        { id: 'generic_cost', name: 'Operational Cost', desc: 'Cost per unit', icon: 'fa-dollar-sign', color: 'text-green-400' }
      ]
    }

    setMessages(prev => [...prev, { type: 'ai', text: responseText, suggestions }])
  }

  const addToStack = (id, name, desc, icon, color) => {
    if (metrics.find(m => m.id === id)) return

    const newMetrics = [...metrics, { id, name, desc, icon, color }]
    setMetrics(newMetrics)
    updateProgress(newMetrics.length)
  }

  const removeStack = (id) => {
    const newMetrics = metrics.filter(m => m.id !== id)
    setMetrics(newMetrics)
    updateProgress(newMetrics.length)
  }

  const updateProgress = (count) => {
    const max = 3
    const progressValue = Math.min(100, (count / max) * 100)
    setProgress(progressValue)
  }

  const handleGenerate = () => {
    if (!targetSimulation) {
      alert("시뮬레이션 주제가 명확하지 않습니다. (반도체 or CPU를 언급해주세요)")
      return
    }

    setTimeout(() => {
      if (targetSimulation === 'fab') {
        navigate('/fab-sim')
      } else {
        navigate('/hw-sim')
      }
    }, 1200)
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="bg-slate-900 border-b border-slate-700 h-16 shrink-0 px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-robot"></i>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">AI Architect <span className="text-slate-500 font-normal">| Modeling Assistant</span></h1>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-8">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>Model Completeness</span>
            <span className="text-blue-400 font-mono">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white transition">
          <i className="fa-solid fa-gear"></i>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col bg-slate-950 relative">
          <div ref={chatContainer} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-4 message-enter ${msg.type === 'user' ? 'justify-end' : ''}`}>
                {msg.type === 'ai' && (
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-microchip text-blue-400"></i>
                  </div>
                )}
                <div className={`flex flex-col gap-2 max-w-2xl ${msg.type === 'user' ? 'items-end' : ''}`}>
                  <div className={`${msg.type === 'user' ? 'bg-blue-600 text-white px-5 py-3 rounded-l-2xl rounded-tr-2xl' : 'bg-slate-800 border border-slate-700 p-4 rounded-r-xl rounded-bl-xl text-slate-300'} text-sm leading-relaxed shadow-sm`}>
                    <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                  </div>
                  {msg.suggestions && (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      {msg.suggestions.map(s => {
                        const isAdded = metrics.find(m => m.id === s.id)
                        return (
                          <button
                            key={s.id}
                            onClick={() => !isAdded && addToStack(s.id, s.name, s.desc, s.icon, s.color)}
                            disabled={isAdded}
                            className={`group flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-700/50 transition-all text-left min-w-[200px] shadow-sm ${
                              isAdded ? 'opacity-50 cursor-default' : 'cursor-pointer'
                            }`}
                          >
                            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center border border-slate-700 group-hover:border-blue-500/50 transition">
                              <i className={`fa-solid ${s.icon} ${s.color}`}></i>
                            </div>
                            <div>
                              <div className="text-slate-200 text-xs font-bold group-hover:text-white">{s.name}</div>
                              <div className="text-slate-500 text-[10px]">{s.desc}</div>
                            </div>
                            <i className={`fa-solid ${isAdded ? 'fa-check text-green-500' : 'fa-plus text-slate-600'} ml-auto group-hover:text-blue-400`}></i>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {idx === 0 && (
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => fillAndSend('반도체 Fab 공정 최적화 해줘')} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-full text-xs text-blue-400 hover:bg-slate-800 hover:border-blue-500 transition cursor-pointer">
                        + 반도체 Fab 공정
                      </button>
                      <button onClick={() => fillAndSend('CPU 아키텍처 성능 분석하고 싶어')} className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-full text-xs text-purple-400 hover:bg-slate-800 hover:border-purple-500 transition cursor-pointer">
                        + CPU 아키텍처
                      </button>
                    </div>
                  )}
                </div>
                {msg.type === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-user text-blue-400"></i>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="p-5 bg-slate-900 border-t border-slate-800">
            <div className="relative max-w-4xl mx-auto">
              <input
                type="text"
                id="user-input"
                className="w-full bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-xl pl-5 pr-12 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition shadow-lg"
                placeholder="시뮬레이션 요구사항을 입력하세요..."
                onKeyPress={(e) => e.key === 'Enter' && handleInput()}
              />
              <button onClick={() => handleInput()} className="absolute right-3 top-3 w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition shadow-lg shadow-blue-500/30">
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </main>

        <aside className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl z-20">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur">
            <div>
              <h2 className="font-bold text-white text-sm">Model Context</h2>
              <p className="text-xs text-slate-500 mt-0.5">Selected Metrics & Parameters</p>
            </div>
            <span className="bg-blue-900 text-blue-300 px-2 py-0.5 rounded text-xs font-bold border border-blue-800">{metrics.length}</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900">
            {metrics.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                <i className="fa-regular fa-clone text-4xl mb-3"></i>
                <p className="text-xs">No metrics selected yet.</p>
              </div>
            ) : (
              metrics.map((metric) => (
                <div key={metric.id} className="stack-item stack-enter bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-lg relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition cursor-pointer text-slate-500 hover:text-red-400" onClick={() => removeStack(metric.id)}>
                    <i className="fa-solid fa-xmark"></i>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 w-8 h-8 rounded bg-slate-900 flex items-center justify-center border border-slate-600/50">
                      <i className={`fa-solid ${metric.icon || 'fa-chart-line'} ${metric.color || 'text-blue-400'} text-sm`}></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{metric.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{metric.desc}</p>
                      <div className="mt-2 flex gap-1">
                        <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">Param</span>
                        <span className="text-[10px] bg-slate-900 text-blue-400 px-1.5 py-0.5 rounded border border-slate-700">Auto-Detected</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 border-t border-slate-800 bg-slate-900">
            <button
              onClick={handleGenerate}
              disabled={metrics.length === 0}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                metrics.length > 0
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 cursor-pointer'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Generate Simulation</span>
              {metrics.length > 0 && <i className="fa-solid fa-arrow-right"></i>}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
