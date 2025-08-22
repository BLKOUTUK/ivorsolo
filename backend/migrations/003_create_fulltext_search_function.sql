-- Create full-text search function for IVOR resources
-- This provides advanced search capabilities with ranking

CREATE OR REPLACE FUNCTION search_resources_fulltext(
  search_query TEXT,
  result_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title VARCHAR(200),
  description TEXT,
  content TEXT,
  website_url VARCHAR(500),
  phone VARCHAR(50),
  email VARCHAR(100),
  address TEXT,
  priority INTEGER,
  ivor_categories JSONB,
  ivor_resource_tags JSONB,
  search_rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    r.content,
    r.website_url,
    r.phone,
    r.email,
    r.address,
    r.priority,
    COALESCE(
      jsonb_build_object(
        'name', c.name,
        'icon', c.icon,
        'color', c.color
      ),
      '{}'::jsonb
    ) as ivor_categories,
    COALESCE(
      jsonb_agg(
        DISTINCT jsonb_build_object(
          'ivor_tags', jsonb_build_object('name', t.name)
        )
      ) FILTER (WHERE t.name IS NOT NULL),
      '[]'::jsonb
    ) as ivor_resource_tags,
    ts_rank(
      to_tsvector('english', r.title || ' ' || r.description || ' ' || r.content),
      plainto_tsquery('english', search_query)
    ) as search_rank
  FROM ivor_resources r
  LEFT JOIN ivor_categories c ON r.category_id = c.id
  LEFT JOIN ivor_resource_tags rt ON r.id = rt.resource_id
  LEFT JOIN ivor_tags t ON rt.tag_id = t.id
  WHERE 
    r.is_active = true
    AND (
      to_tsvector('english', r.title || ' ' || r.description || ' ' || r.content) 
      @@ plainto_tsquery('english', search_query)
      OR r.keywords && string_to_array(lower(search_query), ' ')
    )
  GROUP BY r.id, r.title, r.description, r.content, r.website_url, r.phone, 
           r.email, r.address, r.priority, c.name, c.icon, c.color
  ORDER BY search_rank DESC, r.priority DESC
  LIMIT result_limit;
END;
$$;