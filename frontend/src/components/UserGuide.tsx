import { useState } from 'react'

interface UserGuideProps {
  onStartChat: () => void
}

type GuideSection = 'overview' | 'services' | 'health' | 'resources' | 'tips'

export function UserGuide({ onStartChat }: UserGuideProps) {
  const [activeSection, setActiveSection] = useState<GuideSection>('overview')

  const sections = [
    { id: 'overview' as const, name: 'Overview', icon: '📖' },
    { id: 'services' as const, name: 'Life Coaching Services', icon: '🌱' },
    { id: 'health' as const, name: 'Health Guidance', icon: '🏥' },
    { id: 'resources' as const, name: 'Community Resources', icon: '🤝' },
    { id: 'tips' as const, name: 'Usage Tips', icon: '💡' },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">How to Use I.V.O.R.</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                I.V.O.R. is designed to be your comprehensive AI companion, offering both immediate support and 
                deep, structured coaching tailored specifically for Black queer men in the UK.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-emerald-900/40 to-cyan-900/40 rounded-2xl p-6 border border-emerald-500/20">
                <h3 className="text-2xl font-bold text-emerald-300 mb-4">🚀 Quick Support</h3>
                <p className="text-gray-300 mb-4">
                  For immediate help, simply tell I.V.O.R. what you need:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• "I need mental health support"</li>
                  <li>• "Help with housing"</li>
                  <li>• "Legal advice for discrimination"</li>
                  <li>• "Crisis support"</li>
                  <li>• "Community events"</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-purple-300 mb-4">📚 Comprehensive Coaching</h3>
                <p className="text-gray-300 mb-4">
                  For structured personal development:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>• "I want wellness coaching"</li>
                  <li>• "Start problem solving"</li>
                  <li>• "Begin journaling"</li>
                  <li>• "Health advice"</li>
                  <li>• "Career guidance"</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-2xl p-6 border border-cyan-500/20">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4">🎯 How I.V.O.R. Responds</h3>
              <p className="text-gray-300 leading-relaxed">
                I.V.O.R. uses intelligent conversation flow to understand your needs. You can switch between 
                quick resource support and deep coaching at any time. Simply type "main menu" or "services" 
                to navigate between different areas of support.
              </p>
            </div>
          </div>
        )

      case 'services':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Life Coaching Services</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                I.V.O.R. offers six comprehensive coaching services designed for holistic personal development 
                and liberation-focused growth.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-2xl p-6 border border-green-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🌱</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-green-300 mb-3">Wellness & Habit Coaching</h3>
                    <p className="text-gray-300 mb-4">
                      Comprehensive 15-section wellness assessment and personalized plan development covering all 
                      aspects of holistic wellbeing.
                    </p>
                    <p className="text-sm text-green-200 font-mono">
                      Say: "I want wellness coaching" or "Start wellness plan"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🧩</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-blue-300 mb-3">Strategic Problem Solving</h3>
                    <p className="text-gray-300 mb-4">
                      Mental model-based approach using proven frameworks like First Principles Thinking, 
                      Inversion, and Systems Thinking to overcome complex challenges.
                    </p>
                    <p className="text-sm text-blue-200 font-mono">
                      Say: "I have a problem" or "Help me solve this challenge"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 rounded-2xl p-6 border border-yellow-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📖</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-yellow-300 mb-3">Transformational Journaling</h3>
                    <p className="text-gray-300 mb-4">
                      Structured morning and evening journaling rituals designed for daily growth, 
                      self-reflection, and intentional living.
                    </p>
                    <p className="text-sm text-yellow-200 font-mono">
                      Say: "Start journaling" or "Morning ritual"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 rounded-2xl p-6 border border-pink-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">💕</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-pink-300 mb-3">Relationship Coaching</h3>
                    <p className="text-gray-300 mb-4">
                      Navigate dating, build authentic friendships, and create supportive social connections 
                      within and beyond the QTIPOC community.
                    </p>
                    <p className="text-sm text-pink-200 font-mono">
                      Say: "Relationship advice" or "Help with dating"
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-purple-300 mb-3">Career & Professional Development</h3>
                    <p className="text-gray-300 mb-4">
                      Develop career strategies that honor your identity while advancing professional goals 
                      and economic liberation.
                    </p>
                    <p className="text-sm text-purple-200 font-mono">
                      Say: "Career guidance" or "Professional development"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'health':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Health & Wellbeing Guidance</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Comprehensive, evidence-based health advice addressing the unique health needs and challenges 
                faced by Black queer men, incorporating insights from specialized resources like Menrus.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-gradient-to-br from-green-900/40 to-teal-900/40 rounded-2xl p-6 border border-green-500/20">
                <h3 className="text-2xl font-bold text-green-300 mb-4">🧠 Mental Health Support</h3>
                <p className="text-gray-300 mb-4">
                  Understanding minority stress, building resilience, crisis support, and finding 
                  culturally competent mental health professionals.
                </p>
                <div className="bg-green-900/30 rounded-lg p-4">
                  <p className="text-sm text-green-200 font-mono mb-2">Try saying:</p>
                  <ul className="text-sm text-green-100 space-y-1">
                    <li>• "Mental health support"</li>
                    <li>• "I'm feeling depressed"</li>
                    <li>• "Find me a therapist"</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-900/40 to-pink-900/40 rounded-2xl p-6 border border-red-500/20">
                <h3 className="text-2xl font-bold text-red-300 mb-4">💊 Sexual Health & Wellbeing</h3>
                <p className="text-gray-300 mb-4">
                  HIV/STI prevention (PrEP, PEP), sexual health services, chemsex awareness, 
                  and comprehensive sexual wellbeing guidance.
                </p>
                <div className="bg-red-900/30 rounded-lg p-4">
                  <p className="text-sm text-red-200 font-mono mb-2">Try saying:</p>
                  <ul className="text-sm text-red-100 space-y-1">
                    <li>• "Sexual health advice"</li>
                    <li>• "PrEP information"</li>
                    <li>• "STI testing"</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-bold text-blue-300 mb-4">💪 Physical Health & Fitness</h3>
                <p className="text-gray-300 mb-4">
                  Holistic physical wellness, community fitness approaches, health inequalities awareness, 
                  and preventive care strategies.
                </p>
                <div className="bg-blue-900/30 rounded-lg p-4">
                  <p className="text-sm text-blue-200 font-mono mb-2">Try saying:</p>
                  <ul className="text-sm text-blue-100 space-y-1">
                    <li>• "Physical health advice"</li>
                    <li>• "Fitness guidance"</li>
                    <li>• "Health screening"</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-purple-300 mb-4">🏥 Healthcare Navigation</h3>
                <p className="text-gray-300 mb-4">
                  Finding LGBTQ+ affirming healthcare providers, effective communication with medical professionals, 
                  and understanding your rights as a patient.
                </p>
                <div className="bg-purple-900/30 rounded-lg p-4">
                  <p className="text-sm text-purple-200 font-mono mb-2">Try saying:</p>
                  <ul className="text-sm text-purple-100 space-y-1">
                    <li>• "Find LGBT friendly doctor"</li>
                    <li>• "Healthcare navigation"</li>
                    <li>• "Medical advocacy"</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/40 rounded-2xl p-6 border border-amber-500/20">
                <h3 className="text-2xl font-bold text-amber-300 mb-4">🍃 Substance Use & Harm Reduction</h3>
                <p className="text-gray-300 mb-4">
                  Evidence-based harm reduction, chemsex awareness, community-specific substance use context, 
                  and recovery resources.
                </p>
                <div className="bg-amber-900/30 rounded-lg p-4">
                  <p className="text-sm text-amber-200 font-mono mb-2">Try saying:</p>
                  <ul className="text-sm text-amber-100 space-y-1">
                    <li>• "Substance use help"</li>
                    <li>• "Chemsex support"</li>
                    <li>• "Recovery resources"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )

      case 'resources':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Community Resources</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                I.V.O.R. provides immediate access to culturally competent resources and services 
                specifically for QTIPOC communities across the UK.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-2xl p-6 border border-green-500/20">
                <h3 className="text-2xl font-bold text-green-300 mb-4">🧠 Mental Health Resources</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• <strong>Mind LGBTQ+</strong> - Free support</li>
                  <li>• <strong>Switchboard LGBT+</strong> - 24/7 helpline</li>
                  <li>• <strong>Pink Therapy</strong> - Specialist therapists</li>
                  <li>• <strong>BACP LGBT+ Division</strong> - Professional directory</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-bold text-blue-300 mb-4">🏠 Housing & Accommodation</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• <strong>Albert Kennedy Trust</strong> - LGBTQ+ housing</li>
                  <li>• <strong>Stonewall Housing</strong> - Safe accommodation</li>
                  <li>• <strong>The Outside Project</strong> - Crisis shelter</li>
                  <li>• Emergency accommodation guidance</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-purple-300 mb-4">⚖️ Legal Support</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• <strong>Stonewall</strong> - Legal guidance</li>
                  <li>• <strong>Liberty</strong> - Civil rights advocacy</li>
                  <li>• Discrimination support services</li>
                  <li>• Employment rights guidance</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-pink-900/40 to-rose-900/40 rounded-2xl p-6 border border-pink-500/20">
                <h3 className="text-2xl font-bold text-pink-300 mb-4">🌈 Community & Events</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• <strong>UK Black Pride</strong> - Community support</li>
                  <li>• <strong>Kaleidoscope Trust</strong> - International support</li>
                  <li>• Local QTIPOC meetups and events</li>
                  <li>• Community center connections</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-2xl p-6 border border-cyan-500/20">
              <h3 className="text-2xl font-bold text-cyan-300 mb-4">🆘 Crisis Support</h3>
              <p className="text-gray-300 mb-4">
                For immediate crisis support, I.V.O.R. can quickly connect you with:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-gray-300">
                  <li>• <strong>Samaritans:</strong> 116 123 (24/7)</li>
                  <li>• <strong>LGBT National Hotline:</strong> 1-888-843-4564</li>
                  <li>• <strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                </ul>
                <ul className="space-y-2 text-gray-300">
                  <li>• Emergency mental health services</li>
                  <li>• Domestic violence support</li>
                  <li>• Immediate housing assistance</li>
                </ul>
              </div>
            </div>
          </div>
        )

      case 'tips':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Usage Tips & Best Practices</h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Get the most out of your I.V.O.R. experience with these helpful tips and conversation strategies.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="bg-gradient-to-br from-emerald-900/40 to-teal-900/40 rounded-2xl p-6 border border-emerald-500/20">
                <h3 className="text-2xl font-bold text-emerald-300 mb-4">💬 Conversation Tips</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• <strong>Be specific:</strong> "I need help with anxiety" vs "I need help"</li>
                  <li>• <strong>Use natural language:</strong> Talk to I.V.O.R. like you would a friend</li>
                  <li>• <strong>Ask follow-up questions:</strong> I.V.O.R. can dive deeper into any topic</li>
                  <li>• <strong>Request examples:</strong> "Can you give me an example?" often helps</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-2xl p-6 border border-blue-500/20">
                <h3 className="text-2xl font-bold text-blue-300 mb-4">🧭 Navigation Commands</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200 font-semibold mb-2">Quick Navigation:</p>
                    <ul className="space-y-1 text-gray-300 text-sm font-mono">
                      <li>• "main menu"</li>
                      <li>• "services"</li>
                      <li>• "start over"</li>
                      <li>• "help"</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-blue-200 font-semibold mb-2">Service Switching:</p>
                    <ul className="space-y-1 text-gray-300 text-sm font-mono">
                      <li>• "switch to wellness"</li>
                      <li>• "need health advice"</li>
                      <li>• "quick resources"</li>
                      <li>• "back to main"</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-2xl p-6 border border-purple-500/20">
                <h3 className="text-2xl font-bold text-purple-300 mb-4">🎯 Getting Better Results</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• <strong>Share context:</strong> "As a Black queer man in London, I need..."</li>
                  <li>• <strong>Mention urgency:</strong> I.V.O.R. can prioritize immediate needs</li>
                  <li>• <strong>Be honest:</strong> I.V.O.R. provides judgment-free, confidential support</li>
                  <li>• <strong>Ask for resources:</strong> Request specific services, contacts, or links</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 rounded-2xl p-6 border border-amber-500/20">
                <h3 className="text-2xl font-bold text-amber-300 mb-4">📱 Session Management</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• <strong>Sessions persist:</strong> Your coaching progress is remembered across conversations</li>
                  <li>• <strong>Take breaks:</strong> You can pause any coaching session and return later</li>
                  <li>• <strong>Multiple services:</strong> Switch between different coaching areas anytime</li>
                  <li>• <strong>Privacy focused:</strong> Your conversations are confidential and secure</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-red-900/40 to-rose-900/40 rounded-2xl p-6 border border-red-500/20">
                <h3 className="text-2xl font-bold text-red-300 mb-4">⚠️ Important Reminders</h3>
                <ul className="space-y-3 text-gray-300">
                  <li>• <strong>Not a replacement:</strong> I.V.O.R. complements but doesn't replace professional medical care</li>
                  <li>• <strong>Crisis situations:</strong> For immediate danger, always call emergency services first</li>
                  <li>• <strong>Community resource:</strong> I.V.O.R. is here to support your liberation journey, not judge it</li>
                  <li>• <strong>Feedback welcome:</strong> Help improve I.V.O.R. by sharing your experience</li>
                </ul>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="flex gap-8">
        {/* Sidebar Navigation */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 rounded-2xl p-6 border border-purple-500/20 backdrop-blur-sm sticky top-8">
            <h2 className="text-xl font-bold text-white mb-6">User Guide Sections</h2>
            <nav className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    activeSection === section.id
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-purple-600/20'
                  }`}
                >
                  <span className="text-lg">{section.icon}</span>
                  <span className="font-medium">{section.name}</span>
                </button>
              ))}
            </nav>
            
            <div className="mt-8 pt-6 border-t border-purple-500/20">
              <button
                onClick={onStartChat}
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-3 rounded-lg font-medium hover:from-emerald-400 hover:to-cyan-400 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-lg">💬</span>
                Start Chat with I.V.O.R.
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 rounded-2xl p-8 border border-gray-700/30 backdrop-blur-sm">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}