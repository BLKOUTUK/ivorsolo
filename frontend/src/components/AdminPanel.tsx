import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API_BASE = import.meta.env.VITE_API_BASE || ''

interface Resource {
  id: string
  title: string
  description: string
  content: string
  website_url?: string
  phone?: string
  email?: string
  address?: string
  category_id: string
  keywords: string[]
  location?: string
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
  ivor_categories?: {
    id: string
    name: string
    icon: string
    color: string
  }
  ivor_resource_tags?: Array<{
    ivor_tags: {
      id: string
      name: string
    }
  }>
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  color: string
}

interface BulkImportData {
  title: string
  description: string
  content: string
  website_url?: string
  phone?: string
  email?: string
  category_name: string
  tags: string[]
  priority?: number
}

const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'resources' | 'categories' | 'bulk' | 'analytics'>('resources')
  const [resources, setResources] = useState<Resource[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [bulkImportText, setBulkImportText] = useState('')
  const [scrapingUrl, setScrapingUrl] = useState('')
  const [isScrapingLoading, setIsScrapingLoading] = useState(false)
  const [importResults, setImportResults] = useState<string[]>([])

  // Form state for adding/editing resources
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    website_url: '',
    phone: '',
    email: '',
    address: '',
    category_id: '',
    keywords: '',
    location: '',
    priority: 5,
    tags: [] as string[],
    is_active: true
  })

  useEffect(() => {
    fetchCategories()
    fetchResources()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/categories`)
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory) params.append('category', selectedCategory)
      params.append('limit', '50')

      const response = await fetch(`${API_BASE}/api/admin/resources?${params}`)
      const data = await response.json()
      setResources(data.resources || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const resourceData = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
        priority: Number(formData.priority)
      }

      const url = editingResource ? `/api/admin/resources/${editingResource.id}` : '/api/admin/resources'
      const method = editingResource ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceData)
      })

      if (response.ok) {
        setShowAddForm(false)
        setEditingResource(null)
        resetForm()
        fetchResources()
      }
    } catch (error) {
      console.error('Error saving resource:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const response = await fetch(`${API_BASE}/api/admin/resources/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchResources()
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
    }
  }

  // Website scraping function
  const scrapeWebsite = async () => {
    if (!scrapingUrl.trim()) {
      alert('Please enter a website URL')
      return
    }

    if (!API_BASE) {
      alert('Backend API not configured. Scraping not available in production.')
      return
    }

    setIsScrapingLoading(true)
    try {
      const response = await fetch(`${API_BASE}/api/admin/scrape-website`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: scrapingUrl }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Auto-fill the form with scraped data
        setFormData({
          title: result.data.title || '',
          description: result.data.description || '',
          content: result.data.content || '',
          website_url: scrapingUrl,
          phone: result.data.phone || '',
          email: result.data.email || '',
          address: result.data.address || '',
          category_id: '',
          keywords: result.data.keywords ? result.data.keywords.join(', ') : '',
          location: '',
          priority: 5,
          tags: [],
          is_active: true
        })
        setShowAddForm(true)
      } else {
        alert('Failed to scrape website: ' + result.error)
      }
    } catch (error) {
      console.error('Failed to scrape website:', error)
      alert('Failed to scrape website')
    } finally {
      setIsScrapingLoading(false)
    }
  }

  const handleBulkImport = async () => {
    if (!bulkImportText.trim()) return

    setLoading(true)
    const results: string[] = []

    try {
      // Parse CSV or JSON format
      const lines = bulkImportText.split('\n').filter(line => line.trim())
      
      for (const line of lines) {
        try {
          // Try parsing as JSON first
          let data: BulkImportData
          if (line.startsWith('{')) {
            data = JSON.parse(line)
          } else {
            // Parse as CSV (title, description, website, phone, category, tags)
            const [title, description, website_url, phone, category_name, tagsStr] = line.split(',').map(s => s.trim())
            data = {
              title,
              description: description || `Information and support from ${title}`,
              content: description || `${title} provides support and resources for the LGBTQ+ community.`,
              website_url,
              phone,
              category_name: category_name || 'Support Groups',
              tags: tagsStr ? tagsStr.split(';').map(t => t.trim()) : ['LGBTQ+'],
              priority: 5
            }
          }

          // Find category ID
          const category = categories.find(c => c.name.toLowerCase() === data.category_name.toLowerCase())
          if (!category) {
            results.push(`❌ ${data.title}: Category "${data.category_name}" not found`)
            continue
          }

          const resourceData = {
            title: data.title,
            description: data.description,
            content: data.content,
            website_url: data.website_url,
            phone: data.phone,
            email: data.email,
            category_id: category.id,
            keywords: data.tags || ['LGBTQ+'],
            priority: data.priority || 5,
            is_active: true
          }

          const response = await fetch(`${API_BASE}/api/admin/resources`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resourceData)
          })

          if (response.ok) {
            results.push(`✅ ${data.title}: Added successfully`)
          } else {
            const error = await response.json()
            results.push(`❌ ${data.title}: ${error.error}`)
          }
        } catch (error) {
          results.push(`❌ Line "${line.substring(0, 50)}...": ${error}`)
        }
      }

      setImportResults(results)
      fetchResources()
    } catch (error) {
      console.error('Bulk import error:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      website_url: '',
      phone: '',
      email: '',
      address: '',
      category_id: '',
      keywords: '',
      location: '',
      priority: 5,
      tags: [],
      is_active: true
    })
  }

  const startEdit = (resource: Resource) => {
    setEditingResource(resource)
    setFormData({
      title: resource.title,
      description: resource.description,
      content: resource.content,
      website_url: resource.website_url || '',
      phone: resource.phone || '',
      email: resource.email || '',
      address: resource.address || '',
      category_id: resource.category_id,
      keywords: resource.keywords?.join(', ') || '',
      location: resource.location || '',
      priority: resource.priority,
      tags: resource.ivor_resource_tags?.map(rt => rt.ivor_tags.name) || [],
      is_active: resource.is_active !== false
    })
    setShowAddForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-2xl font-bold text-purple-400">🔧 IVOR Knowledge Base Admin</h1>
        <p className="text-gray-400 mt-1">Manage community resources and knowledge base content</p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-700 px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'resources', name: 'Resources', icon: '📚' },
            { id: 'categories', name: 'Categories', icon: '📁' },
            { id: 'bulk', name: 'Bulk Import', icon: '📦' },
            { id: 'analytics', name: 'Analytics', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={fetchResources}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
                >
                  🔍 Search
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium"
                >
                  ➕ Add Resource
                </button>
              </div>
            </div>

            {/* Website Scraping Section */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400">🌐 Auto-Fill from Website</h3>
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example-org.com"
                    value={scrapingUrl}
                    onChange={(e) => setScrapingUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <button
                  onClick={scrapeWebsite}
                  disabled={isScrapingLoading}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 rounded-lg font-medium"
                >
                  {isScrapingLoading ? '🔄 Scraping...' : '🕷️ Scrape & Fill'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Enter a website URL and we'll automatically extract the organization's information to pre-fill the form.
              </p>
            </div>

            {/* Resources List */}
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 bg-gray-700 font-medium text-sm">
                <div className="col-span-3">Resource</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Contact</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Priority</div>
                <div className="col-span-2">Actions</div>
              </div>
              
              {loading && (
                <div className="p-8 text-center text-gray-400">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Loading resources...
                </div>
              )}
              
              {!loading && resources.map((resource) => (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 hover:bg-gray-750"
                >
                  <div className="col-span-3">
                    <div className="font-medium">{resource.title}</div>
                    <div className="text-sm text-gray-400 truncate">{resource.description}</div>
                    {resource.website_url && (
                      <a href={resource.website_url} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-400 text-xs hover:underline">
                        🌐 Website
                      </a>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs" 
                          style={{ backgroundColor: resource.ivor_categories?.color + '20', color: resource.ivor_categories?.color }}>
                      {resource.ivor_categories?.icon} {resource.ivor_categories?.name}
                    </span>
                  </div>
                  <div className="col-span-2 text-sm">
                    {resource.phone && <div>📞 {resource.phone}</div>}
                    {resource.email && <div>📧 {resource.email}</div>}
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      resource.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {resource.is_active ? '✅ Active' : '⏸️ Inactive'}
                    </span>
                  </div>
                  <div className="col-span-1 text-center">
                    <span className="font-mono">{resource.priority}</span>
                  </div>
                  <div className="col-span-2 flex gap-2">
                    <button
                      onClick={() => startEdit(resource)}
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Import Tab */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">📦 Bulk Import Resources</h2>
              <p className="text-gray-400 mb-4">
                Import multiple resources at once. Support for CSV or JSON format.
              </p>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">CSV Format Example:</h3>
                <pre className="bg-gray-900 p-3 rounded text-sm text-green-400">
{`Organization Name, Description, Website, Phone, Category, Tags
LGBT Foundation, Support services, https://lgbt.foundation, 0345 330 3030, Support Groups, LGBTQ+;Support
Stonewall, Equality charity, https://stonewall.org.uk, 0800 050 2020, Legal Aid, LGBTQ+;Legal;Rights`}
                </pre>
              </div>

              <div className="mb-4">
                <h3 className="font-medium mb-2">JSON Format Example:</h3>
                <pre className="bg-gray-900 p-3 rounded text-sm text-blue-400">
{`{"title": "LGBT Foundation", "description": "Support services", "website_url": "https://lgbt.foundation", "phone": "0345 330 3030", "category_name": "Support Groups", "tags": ["LGBTQ+", "Support"], "priority": 8}`}
                </pre>
              </div>

              <textarea
                value={bulkImportText}
                onChange={(e) => setBulkImportText(e.target.value)}
                placeholder="Paste your CSV or JSON data here (one resource per line)..."
                className="w-full h-40 px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white font-mono text-sm"
              />

              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleBulkImport}
                  disabled={loading || !bulkImportText.trim()}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium"
                >
                  {loading ? '⏳ Importing...' : '📥 Import Resources'}
                </button>
                <button
                  onClick={() => setBulkImportText('')}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium"
                >
                  🗑️ Clear
                </button>
              </div>

              {importResults.length > 0 && (
                <div className="mt-6 bg-gray-900 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Import Results:</h3>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {importResults.map((result, index) => (
                      <div key={index} className={`text-sm ${result.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-800 rounded-lg p-4 border-l-4"
                  style={{ borderLeftColor: category.color }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="font-bold">{category.name}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{category.description}</p>
                  <div className="mt-3 flex gap-2">
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">
                      ✏️ Edit
                    </button>
                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs">
                      🗑️ Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2">📚 Total Resources</h3>
                <p className="text-3xl font-bold text-green-400">{resources.length}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2">📁 Categories</h3>
                <p className="text-3xl font-bold text-blue-400">{categories.length}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-2">✅ Active Resources</h3>
                <p className="text-3xl font-bold text-purple-400">
                  {resources.filter(r => r.is_active).length}
                </p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">📊 Resources by Category</h3>
              <div className="space-y-3">
                {categories.map((category) => {
                  const count = resources.filter(r => r.ivor_categories?.id === category.id).length
                  const percentage = resources.length > 0 ? (count / resources.length) * 100 : 0
                  
                  return (
                    <div key={category.id} className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-40">
                        <span>{category.icon}</span>
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: category.color 
                          }}
                        />
                      </div>
                      <span className="text-sm w-12 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Resource Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">
                {editingResource ? '✏️ Edit Resource' : '➕ Add New Resource'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Category *</label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg h-20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Content *</label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg h-32"
                    placeholder="Detailed information about this resource..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Website URL</label>
                    <input
                      type="url"
                      value={formData.website_url}
                      onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                      placeholder="City, Region, or 'Online'"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Keywords (comma-separated)</label>
                    <input
                      type="text"
                      value={formData.keywords}
                      onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                      placeholder="lgbtq+, support, housing, crisis"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority (1-10)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: Number(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg h-16"
                    placeholder="Physical address if applicable"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg font-medium"
                  >
                    {loading ? '⏳ Saving...' : editingResource ? '💾 Update Resource' : '➕ Add Resource'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingResource(null)
                      resetForm()
                    }}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminPanel