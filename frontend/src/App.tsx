import { useState } from 'react'
import { ChatInterface } from './components/ChatInterface'
import { UserGuide } from './components/UserGuide'
import { IVORIntro } from './components/IVORIntro'
import { TellIVOR } from './components/TellIVOR'
import AdminPanel from './components/AdminPanel'

type View = 'intro' | 'chat' | 'guide' | 'tell-ivor' | 'admin'

function App() {
  const [currentView, setCurrentView] = useState<View>('intro')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black">
      {/* BLKOUT Header */}
      <header className="bg-black/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* BLKOUT Branding */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">B</span>
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    BLKOUT
                  </h1>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                    Community Platform
                  </p>
                </div>
              </div>
              
              <div className="w-px h-8 bg-purple-500/30"></div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                  <img 
                    src="/ivor.png" 
                    alt="I.V.O.R. Logo" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">I.V.O.R.</h2>
                  <p className="text-emerald-300 text-xs font-mono uppercase tracking-wider">
                    Intelligent Virtual Organizing Resource
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-2">
              <button
                onClick={() => setCurrentView('intro')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'intro'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                }`}
              >
                About
              </button>
              <button
                onClick={() => setCurrentView('guide')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'guide'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                }`}
              >
                User Guide
              </button>
              <button
                onClick={() => setCurrentView('tell-ivor')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'tell-ivor'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                }`}
              >
                Tell I.V.O.R.
              </button>
              <button
                onClick={() => setCurrentView('chat')}
                className={`px-6 py-2 rounded-lg font-medium transition-all bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-400 hover:to-cyan-400 shadow-lg ${
                  currentView === 'chat' ? 'ring-2 ring-emerald-400/50' : ''
                }`}
              >
                Start Chat
              </button>
              {import.meta.env.DEV && (
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentView === 'admin'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-red-600/20'
                  }`}
                  title="Admin Panel"
                >
                  ⚙️ Admin
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-[calc(100vh-140px)]">
        {currentView === 'intro' && <IVORIntro onStartChat={() => setCurrentView('chat')} />}
        {currentView === 'guide' && <UserGuide onStartChat={() => setCurrentView('chat')} />}
        {currentView === 'tell-ivor' && <TellIVOR onClose={() => setCurrentView('intro')} />}
        {currentView === 'chat' && <ChatInterface className="h-full" />}
        {currentView === 'admin' && (
          <div className="min-h-full bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">IVOR Admin Panel</h1>
                <button
                  onClick={() => setCurrentView('intro')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Back to IVOR
                </button>
              </div>
              <AdminPanel />
            </div>
          </div>
        )}
      </main>

      {/* BLKOUT Footer */}
      <footer className="bg-black/90 border-t border-purple-500/20 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-sm text-gray-400 text-center md:text-left">
                I.V.O.R. is part of the{' '}
                <a
                  href="https://blkout.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  BLKOUT community platform
                </a>
              </p>
              <span className="hidden md:inline text-gray-600">•</span>
              <p className="text-sm text-gray-400 text-center md:text-left">
                Built with care for Black queer liberation
              </p>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex items-center gap-3">
                <a 
                  href="https://blkouthub.com/invitation?code=BE862C" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xs px-3 py-1 rounded-full font-medium transition-all transform hover:scale-105"
                >
                  🌐 BLKOUTHUB
                </a>
                <a 
                  href="https://blkout.uk/newsletter" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-xs px-3 py-1 rounded-full font-medium transition-all transform hover:scale-105"
                >
                  📧 Newsletter
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Powered by AI</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
