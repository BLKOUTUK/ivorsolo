import { useState } from 'react'

interface TellIVORProps {
  onClose?: () => void
}

export function TellIVOR({ onClose }: TellIVORProps) {
  const [formData, setFormData] = useState({
    resourceUrl: '',
    resourceTitle: '',
    category: '',
    description: '',
    submitterName: '',
    submitterEmail: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'Mental Health',
    'Healthcare',
    'Housing',
    'Legal Support',
    'Community Resources',
    'Educational',
    'Career/Employment',
    'Financial Support',
    'Entertainment',
    'Wellness',
    'Other'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/tell-ivor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit resource')
      }

      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit resource. Please try again.')
      console.error('Tell IVOR submission error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-gradient-to-br from-emerald-900/50 to-cyan-900/50 rounded-3xl p-8 border border-emerald-500/20 backdrop-blur-sm text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Resource Submitted!</h2>
          <p className="text-gray-300 text-lg mb-6">
            Thank you for sharing this resource with the BLKOUT community. 
            Rob has been notified and will review your submission.
          </p>
          <p className="text-emerald-300 text-sm mb-6">
            Your contribution helps strengthen our community resources and supports Black queer liberation.
          </p>
          {onClose && (
            <button
              onClick={onClose}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-xl font-medium transition-colors"
            >
              Continue with I.V.O.R.
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-br from-purple-900/50 to-cyan-900/50 rounded-3xl p-8 border border-purple-500/20 backdrop-blur-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-400 mb-4">
            Tell I.V.O.R.
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Share valuable resources with the BLKOUT community
          </p>
          <p className="text-gray-400 text-sm">
            Found a helpful resource for Black queer liberation? Let us know and we'll consider adding it to I.V.O.R.'s knowledge base.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Resource URL */}
          <div>
            <label htmlFor="resourceUrl" className="block text-white font-medium mb-2">
              Resource URL *
            </label>
            <input
              type="url"
              id="resourceUrl"
              name="resourceUrl"
              value={formData.resourceUrl}
              onChange={handleInputChange}
              required
              placeholder="https://example.com/resource"
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all"
            />
          </div>

          {/* Resource Title */}
          <div>
            <label htmlFor="resourceTitle" className="block text-white font-medium mb-2">
              Resource Title *
            </label>
            <input
              type="text"
              id="resourceTitle"
              name="resourceTitle"
              value={formData.resourceTitle}
              onChange={handleInputChange}
              required
              placeholder="Brief title of the resource"
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-white font-medium mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-900">
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-white font-medium mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Why is this resource valuable for the Black queer community? What does it offer?"
              className="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all resize-none"
            />
          </div>

          {/* Submitter Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="submitterName" className="block text-white font-medium mb-2">
                Your Name (Optional)
              </label>
              <input
                type="text"
                id="submitterName"
                name="submitterName"
                value={formData.submitterName}
                onChange={handleInputChange}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all"
              />
            </div>
            <div>
              <label htmlFor="submitterEmail" className="block text-white font-medium mb-2">
                Your Email (Optional)
              </label>
              <input
                type="email"
                id="submitterEmail"
                name="submitterEmail"
                value={formData.submitterEmail}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-black/30 border border-purple-500/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-emerald-500/50 focus:bg-black/40 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4 justify-center pt-4">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Share Resource'}
            </button>
          </div>

          <div className="text-center text-gray-400 text-sm">
            <p>Submissions are reviewed by the BLKOUT team and may be added to I.V.O.R.'s knowledge base.</p>
          </div>
        </form>
      </div>
    </div>
  )
}