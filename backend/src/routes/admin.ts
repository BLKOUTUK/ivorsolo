import express from 'express'
import KnowledgeService from '../services/knowledgeService.js'
import WebScrapingService from '../services/webScrapingService.js'

const router = express.Router()

// Initialize services lazily
let knowledgeService: KnowledgeService | null = null
let webScrapingService: WebScrapingService | null = null

function getKnowledgeService(): KnowledgeService {
  if (!knowledgeService) {
    knowledgeService = new KnowledgeService(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || ''
    )
  }
  return knowledgeService
}

function getWebScrapingService(): WebScrapingService {
  if (!webScrapingService) {
    webScrapingService = new WebScrapingService()
  }
  return webScrapingService
}

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await getKnowledgeService().getCategories()
    res.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

// Get all resources with pagination
router.get('/resources', async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query
    
    let resources = []
    
    if (search) {
      resources = await getKnowledgeService().searchResources(search as string, parseInt(limit as string))
    } else if (category) {
      resources = await getKnowledgeService().getResourcesByCategory(category as string, parseInt(limit as string))
    } else {
      // Get all resources - we'll need to implement this method
      resources = await getKnowledgeService().searchResources('', parseInt(limit as string))
    }
    
    res.json({ 
      resources,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: resources.length
      }
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    res.status(500).json({ error: 'Failed to fetch resources' })
  }
})

// Get specific resource by ID
router.get('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    // We'll need to implement getResourceById in KnowledgeService
    const resource = await getKnowledgeService().getResourceById(id)
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' })
    }
    
    res.json({ resource })
  } catch (error) {
    console.error('Error fetching resource:', error)
    res.status(500).json({ error: 'Failed to fetch resource' })
  }
})

// Create new resource
router.post('/resources', async (req, res) => {
  try {
    const resourceData = req.body
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'content', 'category_id']
    for (const field of requiredFields) {
      if (!resourceData[field]) {
        return res.status(400).json({ error: `${field} is required` })
      }
    }
    
    const result = await getKnowledgeService().createResource(resourceData)
    
    if (result.error) {
      return res.status(400).json({ error: result.error.message })
    }
    
    res.status(201).json({ resource: result.data })
  } catch (error) {
    console.error('Error creating resource:', error)
    res.status(500).json({ error: 'Failed to create resource' })
  }
})

// Update resource
router.put('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params
    const resourceData = req.body
    
    const result = await getKnowledgeService().updateResource(id, resourceData)
    
    if (result.error) {
      return res.status(400).json({ error: result.error.message })
    }
    
    res.json({ resource: result.data })
  } catch (error) {
    console.error('Error updating resource:', error)
    res.status(500).json({ error: 'Failed to update resource' })
  }
})

// Delete resource
router.delete('/resources/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await getKnowledgeService().deleteResource(id)
    
    if (result.error) {
      return res.status(400).json({ error: result.error.message })
    }
    
    res.json({ success: true })
  } catch (error) {
    console.error('Error deleting resource:', error)
    res.status(500).json({ error: 'Failed to delete resource' })
  }
})

// Bulk operations
router.post('/resources/bulk', async (req, res) => {
  try {
    const { action, resource_ids } = req.body
    
    if (!action || !resource_ids || !Array.isArray(resource_ids)) {
      return res.status(400).json({ error: 'Action and resource_ids array are required' })
    }
    
    const results = []
    
    for (const id of resource_ids) {
      if (action === 'delete') {
        const result = await getKnowledgeService().deleteResource(id)
        results.push({ id, success: !result.error, error: result.error })
      } else if (action === 'activate') {
        const result = await getKnowledgeService().updateResource(id, { is_active: true })
        results.push({ id, success: !result.error, error: result.error })
      } else if (action === 'deactivate') {
        const result = await getKnowledgeService().updateResource(id, { is_active: false })
        results.push({ id, success: !result.error, error: result.error })
      }
    }
    
    res.json({ results })
  } catch (error) {
    console.error('Error performing bulk operation:', error)
    res.status(500).json({ error: 'Failed to perform bulk operation' })
  }
})

// Analytics endpoints
router.get('/analytics/resources', async (req, res) => {
  try {
    // This would typically require analytics tracking in the knowledge service
    // For now, return basic counts
    
    const categories = await getKnowledgeService().getCategories()
    const analytics = {
      total_categories: categories.length,
      categories_breakdown: {} as any
    }
    
    for (const category of categories) {
      const resources = await getKnowledgeService().getResourcesByCategory(category.name, 1000)
      analytics.categories_breakdown[category.name] = {
        count: resources.length,
        active: resources.filter((r: any) => r.is_active).length
      }
    }
    
    res.json({ analytics })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Failed to fetch analytics' })
  }
})

// Search testing endpoint
router.post('/test-search', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' })
    }
    
    const results = await getKnowledgeService().searchResources(query, limit)
    const formatted = getKnowledgeService().formatResourcesForResponse(results, `Search results for "${query}":`)
    
    res.json({ 
      query,
      raw_results: results,
      formatted_response: formatted
    })
  } catch (error) {
    console.error('Error testing search:', error)
    res.status(500).json({ error: 'Failed to test search' })
  }
})

// Website scraping endpoint
router.post('/scrape-website', async (req, res) => {
  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }
    
    const scrapedData = await getWebScrapingService().scrapeWebsite(url)
    
    res.json({ 
      success: true,
      data: scrapedData,
      url: url
    })
  } catch (error) {
    console.error('Error scraping website:', error)
    res.status(500).json({ 
      error: 'Failed to scrape website', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

// Bulk website scraping endpoint
router.post('/bulk-scrape', async (req, res) => {
  try {
    const { urls } = req.body
    
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: 'URLs array is required' })
    }
    
    if (urls.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 URLs allowed per batch' })
    }
    
    const results = await getWebScrapingService().bulkScrape(urls)
    
    res.json({ 
      success: true,
      results: results,
      total: urls.length,
      successful: results.filter(r => !r.error).length,
      failed: results.filter(r => r.error).length
    })
  } catch (error) {
    console.error('Error in bulk scraping:', error)
    res.status(500).json({ 
      error: 'Failed to perform bulk scraping', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
})

export default router