import { ChatInterface } from './components/ChatInterface'

function App() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🤖</span>
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-white">I.V.O.R.</h1>
            <p className="text-emerald-300 text-sm font-mono uppercase tracking-wider">
              Intelligent Virtual Organizing Resource
            </p>
          </div>
          
          <div className="ml-auto">
            <a
              href="https://blkout.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              ← Back to BLKOUT
            </a>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <main className="flex-1 min-h-0">
        <ChatInterface className="h-full" />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800/30 border-t border-gray-700 py-3">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400">
            I.V.O.R. is part of the BLKOUT community platform • Built with care for Black queer liberation
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
