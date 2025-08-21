
interface IVORIntroProps {
  onStartChat: () => void
}

export function IVORIntro({ onStartChat }: IVORIntroProps) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl overflow-hidden">
            <img 
              src="/ivor.png" 
              alt="I.V.O.R. Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-left">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 mb-2">
              I.V.O.R.
            </h1>
            <p className="text-xl text-emerald-300 font-mono uppercase tracking-wider">
              Intelligent Virtual Organizing Resource
            </p>
          </div>
        </div>
        
        <p className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
          Your AI-powered companion for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-semibold">Black queer liberation</span>, 
          offering comprehensive life coaching, health guidance, and community resources.
        </p>
      </div>

      {/* Video Section */}
      <div className="mb-16">
        <div className="bg-gradient-to-br from-purple-900/50 to-cyan-900/50 rounded-3xl p-8 border border-purple-500/20 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Meet I.V.O.R.</h2>
          
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30">
            {/* YouTube Video Embed */}
            <iframe 
              className="w-full h-full rounded-2xl"
              src="https://www.youtube.com/embed/oSCyHKTSWf8"
              title="Ask I.V.O.R. - Introduction Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            >
            </iframe>
            
            {/* Fallback link for iframe issues */}
            <div className="absolute bottom-4 right-4 opacity-80 hover:opacity-100 transition-opacity">
              <a 
                href="https://youtu.be/oSCyHKTSWf8" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-emerald-500/90 hover:bg-emerald-400 text-white text-sm px-3 py-1 rounded-lg font-medium transition-colors shadow-lg backdrop-blur-sm"
              >
                Watch on YouTube →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-gradient-to-br from-emerald-900/50 to-cyan-900/50 rounded-2xl p-6 border border-emerald-500/20 backdrop-blur-sm">
          <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl">🌱</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Life Coaching</h3>
          <p className="text-gray-300 leading-relaxed">
            Six comprehensive services including wellness coaching, problem-solving, journaling, and career guidance 
            tailored for your liberation journey.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl">🏥</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Health Guidance</h3>
          <p className="text-gray-300 leading-relaxed">
            Evidence-based health advice covering mental health, sexual health, physical wellness, and 
            healthcare navigation for Black queer men.
          </p>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/50 to-blue-900/50 rounded-2xl p-6 border border-cyan-500/20 backdrop-blur-sm">
          <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center mb-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Community Resources</h3>
          <p className="text-gray-300 leading-relaxed mb-4">
            Immediate access to mental health support, housing assistance, legal guidance, and 
            QTIPOC community connections across the UK.
          </p>
          <div className="space-y-2">
            <a 
              href="https://blkouthub.com/invitation?code=BE862C" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-center py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              🌐 Visit BLKOUTHUB
            </a>
            <a 
              href="https://blkout.uk/newsletter" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white text-center py-2 px-4 rounded-lg font-medium transition-all transform hover:scale-105 shadow-lg"
            >
              📧 Join Newsletter
            </a>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <div className="bg-gradient-to-r from-emerald-900/30 to-cyan-900/30 rounded-3xl p-8 border border-emerald-500/20 backdrop-blur-sm mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Whether you need immediate support or want to explore comprehensive life coaching, 
            I.V.O.R. is here to support your authentic self and liberation goals.
          </p>
          
          <button
            onClick={onStartChat}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            <span className="text-2xl">💬</span>
            Start Conversation with I.V.O.R.
          </button>
        </div>

        <p className="text-sm text-gray-400">
          Part of the BLKOUT community ecosystem • 
          <a href="https://blkout.uk" className="text-purple-400 hover:text-purple-300 ml-1">
            Explore more resources →
          </a>
        </p>
      </div>
    </div>
  )
}