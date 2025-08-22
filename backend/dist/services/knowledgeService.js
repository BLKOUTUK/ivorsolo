import { createClient } from '@supabase/supabase-js';
// Knowledge Service for IVOR's dynamic resource management
class KnowledgeService {
    supabase;
    constructor(supabaseUrl, supabaseKey) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    // Search resources by keywords and content
    async searchResources(query, limit = 5) {
        const { data, error } = await this.supabase
            .from('ivor_resources')
            .select(`
        id,
        title,
        description,
        content,
        website_url,
        phone,
        email,
        address,
        priority,
        ivor_categories (
          name,
          icon,
          color
        ),
        ivor_resource_tags (
          ivor_tags (
            name
          )
        )
      `)
            .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%,keywords.cs.{${query}}`)
            .eq('is_active', true)
            .order('priority', { ascending: false })
            .limit(limit);
        if (error) {
            console.error('Error searching resources:', error);
            return [];
        }
        return data || [];
    }
    // Search resources by category
    async getResourcesByCategory(categoryName, limit = 5) {
        const { data, error } = await this.supabase
            .from('ivor_resources')
            .select(`
        id,
        title,
        description,
        content,
        website_url,
        phone,
        email,
        address,
        priority,
        ivor_categories!inner (
          name,
          icon,
          color
        ),
        ivor_resource_tags (
          ivor_tags (
            name
          )
        )
      `)
            .eq('ivor_categories.name', categoryName)
            .eq('is_active', true)
            .order('priority', { ascending: false })
            .limit(limit);
        if (error) {
            console.error('Error getting resources by category:', error);
            return [];
        }
        return data || [];
    }
    // Get resources by tags
    async getResourcesByTags(tags, limit = 5) {
        const { data, error } = await this.supabase
            .from('ivor_resources')
            .select(`
        id,
        title,
        description,
        content,
        website_url,
        phone,
        email,
        address,
        priority,
        ivor_categories (
          name,
          icon,
          color
        ),
        ivor_resource_tags!inner (
          ivor_tags!inner (
            name
          )
        )
      `)
            .in('ivor_resource_tags.ivor_tags.name', tags)
            .eq('is_active', true)
            .order('priority', { ascending: false })
            .limit(limit);
        if (error) {
            console.error('Error getting resources by tags:', error);
            return [];
        }
        return data || [];
    }
    // Get crisis/emergency resources
    async getCrisisResources() {
        return this.getResourcesByTags(['Crisis', 'Emergency', '24/7'], 3);
    }
    // Get all categories
    async getCategories() {
        const { data, error } = await this.supabase
            .from('ivor_categories')
            .select('*')
            .order('name');
        if (error) {
            console.error('Error getting categories:', error);
            return [];
        }
        return data || [];
    }
    // Advanced search with full-text search
    async fullTextSearch(query, limit = 5) {
        const { data, error } = await this.supabase
            .rpc('search_resources_fulltext', {
            search_query: query,
            result_limit: limit
        });
        if (error) {
            console.error('Error in full-text search:', error);
            // Fallback to regular search
            return this.searchResources(query, limit);
        }
        return data || [];
    }
    // Format resources for IVOR response
    formatResourcesForResponse(resources, context = '') {
        if (!resources || resources.length === 0) {
            return "I don't have specific resources for that request right now, but I'm here to help in other ways. You can also try contacting general support services like Samaritans (116 123) for immediate support.";
        }
        let response = context ? `${context}\n\n` : '';
        response += `Here are some resources that might help:\n\n`;
        resources.forEach((resource, index) => {
            const category = resource.ivor_categories;
            const tags = resource.ivor_resource_tags?.map((rt) => rt.ivor_tags?.name).filter(Boolean) || [];
            response += `**${resource.title}**${category ? ` (${category.name})` : ''}\n`;
            response += `${resource.description}\n`;
            if (resource.phone) {
                response += `📞 ${resource.phone}\n`;
            }
            if (resource.website_url) {
                response += `🌐 ${resource.website_url}\n`;
            }
            if (resource.email) {
                response += `📧 ${resource.email}\n`;
            }
            if (tags.length > 0) {
                response += `🏷️ ${tags.join(', ')}\n`;
            }
            response += '\n';
        });
        response += "💜 Remember, you're not alone and support is available. Is there anything specific you'd like to know more about?";
        return response;
    }
    // Create new resource (for admin interface)
    async createResource(resourceData) {
        const { data, error } = await this.supabase
            .from('ivor_resources')
            .insert([resourceData])
            .select();
        if (error) {
            console.error('Error creating resource:', error);
            return { error };
        }
        return { data: data[0] };
    }
    // Update resource (for admin interface)
    async updateResource(id, resourceData) {
        const { data, error } = await this.supabase
            .from('ivor_resources')
            .update(resourceData)
            .eq('id', id)
            .select();
        if (error) {
            console.error('Error updating resource:', error);
            return { error };
        }
        return { data: data[0] };
    }
    // Delete resource (for admin interface)
    async deleteResource(id) {
        const { data, error } = await this.supabase
            .from('ivor_resources')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('Error deleting resource:', error);
            return { error };
        }
        return { success: true };
    }
    // Get resource by ID (for admin interface)
    async getResourceById(id) {
        const { data, error } = await this.supabase
            .from('ivor_resources')
            .select(`
        id,
        title,
        description,
        content,
        website_url,
        phone,
        email,
        address,
        keywords,
        location,
        is_active,
        priority,
        created_at,
        updated_at,
        ivor_categories (
          id,
          name,
          icon,
          color
        ),
        ivor_resource_tags (
          ivor_tags (
            id,
            name
          )
        )
      `)
            .eq('id', id)
            .single();
        if (error) {
            console.error('Error getting resource by ID:', error);
            return null;
        }
        return data;
    }
    // Get all resources (for admin interface)
    async getAllResources(limit = 100) {
        const { data, error } = await this.supabase
            .from('ivor_resources')
            .select(`
        id,
        title,
        description,
        content,
        website_url,
        phone,
        email,
        address,
        keywords,
        location,
        is_active,
        priority,
        created_at,
        updated_at,
        ivor_categories (
          id,
          name,
          icon,
          color
        ),
        ivor_resource_tags (
          ivor_tags (
            id,
            name
          )
        )
      `)
            .order('priority', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) {
            console.error('Error getting all resources:', error);
            return [];
        }
        return data || [];
    }
}
export default KnowledgeService;
