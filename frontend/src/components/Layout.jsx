import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activePath, setActivePath] = useState(location.pathname)

  useEffect(() => {
    setActivePath(location.pathname)
  }, [location])

  const handleNavigation = (path) => {
    navigate(path)
  }

  const navItems = [
    { path: '/modeling', label: '1. AI Modeling', icon: 'fa-comments', section: 'Workflow' },
    { path: '/fab-sim', label: 'Fab Process (Yield)', icon: 'fa-industry', section: 'Simulation Engines' },
    { path: '/hw-sim', label: 'HW Architecture', icon: 'fa-microchip', section: 'Simulation Engines' },
  ]

  const sections = {}
  navItems.forEach(item => {
    if (!sections[item.section]) {
      sections[item.section] = []
    }
    sections[item.section].push(item)
  })

  return (
    <div className="h-screen flex overflow-hidden">
      <aside className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col shrink-0 z-50 shadow-xl">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            <i className="fa-solid fa-layer-group"></i>
          </div>
          <h1 className="font-bold text-lg tracking-tight">AI-WEBSIM</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {Object.entries(sections).map(([sectionName, items], sectionIndex) => (
            <div key={sectionName}>
              {sectionIndex > 0 && <div className="text-xs font-bold text-slate-500 px-3 py-2 uppercase mt-4">{sectionName}</div>}
              {sectionIndex === 0 && <div className="text-xs font-bold text-slate-500 px-3 py-2 uppercase mt-2">{sectionName}</div>}
              {items.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavigation(item.path)}
                  className={`nav-item w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all group ${
                    activePath === item.path ? 'active' : ''
                  }`}
                >
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center group-hover:bg-slate-700 transition">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg border border-slate-700">
            <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs">
              <i className="fa-solid fa-user"></i>
            </div>
            <div>
              <div className="text-xs font-bold text-white">Guest User</div>
              <div className="text-[10px] text-green-400">● Online</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 bg-slate-950 relative overflow-hidden">
        <div className="w-full h-full animate-fadeIn">
          {children}
        </div>
      </main>
    </div>
  )
}

