import axios from 'axios';
import * as cheerio from 'cheerio';
class WebScrapingService {
    timeout = 10000; // 10 seconds
    userAgent = 'Mozilla/5.0 (compatible; IVOR-Bot/1.0; +https://ivor.blkout.uk)';
    async scrapeWebsite(url) {
        try {
            // Ensure URL has protocol
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            console.log(`Scraping website: ${url}`);
            const response = await axios.get(url, {
                timeout: this.timeout,
                headers: {
                    'User-Agent': this.userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Cache-Control': 'no-cache'
                },
                maxRedirects: 5,
                validateStatus: (status) => status < 400
            });
            const $ = cheerio.load(response.data);
            // Extract basic information
            const scrapedData = {
                title: this.extractTitle($),
                description: this.extractDescription($),
                content: this.extractContent($),
                phone: this.extractPhone($, response.data),
                email: this.extractEmail($, response.data),
                address: this.extractAddress($, response.data),
                keywords: this.extractKeywords($, response.data)
            };
            console.log('Scraped data:', scrapedData);
            return scrapedData;
        }
        catch (error) {
            console.error('Error scraping website:', error);
            throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    extractTitle($) {
        // Try multiple selectors for title
        const titleSelectors = [
            'title',
            'h1',
            '[property="og:title"]',
            '[name="title"]',
            '.site-title',
            '.page-title',
            '.hero-title'
        ];
        for (const selector of titleSelectors) {
            const element = $(selector).first();
            if (element.length) {
                const title = element.attr('content') || element.text();
                if (title && title.trim().length > 0) {
                    return title.trim().substring(0, 200);
                }
            }
        }
        return '';
    }
    extractDescription($) {
        // Try multiple selectors for description
        const descSelectors = [
            '[name="description"]',
            '[property="og:description"]',
            '[name="twitter:description"]',
            '.site-description',
            '.hero-description',
            '.about-text',
            'meta[name="description"]'
        ];
        for (const selector of descSelectors) {
            const element = $(selector).first();
            if (element.length) {
                const desc = element.attr('content') || element.text();
                if (desc && desc.trim().length > 0) {
                    return desc.trim().substring(0, 500);
                }
            }
        }
        // Fallback: first paragraph
        const firstP = $('p').first().text().trim();
        if (firstP.length > 0) {
            return firstP.substring(0, 500);
        }
        return '';
    }
    extractContent($) {
        // Look for main content areas
        const contentSelectors = [
            '.about',
            '.services',
            '.content',
            '.main-content',
            '.description',
            'main',
            '.page-content'
        ];
        for (const selector of contentSelectors) {
            const element = $(selector).first();
            if (element.length) {
                const content = element.text().trim();
                if (content.length > 50) {
                    return content.substring(0, 1000);
                }
            }
        }
        // Fallback: combine all paragraphs
        const allText = $('p').map((_, el) => $(el).text().trim()).get().join(' ');
        if (allText.length > 50) {
            return allText.substring(0, 1000);
        }
        return '';
    }
    extractPhone($, html) {
        // Look for phone numbers in various formats
        const phoneRegexes = [
            /(?:phone|tel|call)[:\s]*([+\d\s\-\(\)]{10,20})/gi,
            /([+]?[\d\s\-\(\)]{10,20})/g,
            /(\+44\s*\d{2,4}\s*\d{3,4}\s*\d{3,4})/g,
            /(0\d{2,4}\s*\d{3,4}\s*\d{3,4})/g,
            /(\d{3,4}[\s\-]\d{3,4}[\s\-]\d{3,4})/g
        ];
        // Check structured data
        const phoneEl = $('[itemprop="telephone"], [href^="tel:"], .phone, .telephone').first();
        if (phoneEl.length) {
            const phone = phoneEl.text().trim() || phoneEl.attr('href')?.replace('tel:', '');
            if (phone && phone.length > 0) {
                return this.cleanPhone(phone);
            }
        }
        // Search in HTML content
        for (const regex of phoneRegexes) {
            const matches = html.match(regex);
            if (matches && matches.length > 0) {
                for (const match of matches) {
                    const cleaned = this.cleanPhone(match);
                    if (cleaned.length >= 10 && cleaned.length <= 15) {
                        return cleaned;
                    }
                }
            }
        }
        return '';
    }
    extractEmail($, html) {
        // Look for email addresses
        const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
        // Check structured data
        const emailEl = $('[itemprop="email"], [href^="mailto:"], .email').first();
        if (emailEl.length) {
            const email = emailEl.text().trim() || emailEl.attr('href')?.replace('mailto:', '');
            if (email && this.isValidEmail(email)) {
                return email;
            }
        }
        // Search in HTML content
        const matches = html.match(emailRegex);
        if (matches && matches.length > 0) {
            for (const match of matches) {
                if (this.isValidEmail(match) && !match.includes('example.com') && !match.includes('placeholder')) {
                    return match;
                }
            }
        }
        return '';
    }
    extractAddress($, html) {
        // Look for addresses
        const addressSelectors = [
            '[itemprop="address"]',
            '.address',
            '.location',
            '.contact-address',
            '.street-address'
        ];
        for (const selector of addressSelectors) {
            const element = $(selector).first();
            if (element.length) {
                const address = element.text().trim();
                if (address.length > 10) {
                    return address.substring(0, 200);
                }
            }
        }
        // Look for UK postcode patterns
        const postcodeRegex = /([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})/gi;
        const postcodeMatches = html.match(postcodeRegex);
        if (postcodeMatches && postcodeMatches.length > 0) {
            // Find surrounding text that might be an address
            const lines = html.split('\n');
            for (const line of lines) {
                if (postcodeMatches.some(pc => line.includes(pc))) {
                    const cleanLine = line.replace(/<[^>]*>/g, '').trim();
                    if (cleanLine.length > 20 && cleanLine.length < 200) {
                        return cleanLine;
                    }
                }
            }
        }
        return '';
    }
    extractKeywords($, html) {
        const keywords = new Set();
        // Meta keywords
        const metaKeywords = $('[name="keywords"]').attr('content');
        if (metaKeywords) {
            metaKeywords.split(',').forEach((kw) => keywords.add(kw.trim().toLowerCase()));
        }
        // LGBTQ+ related terms
        const lgbtqTerms = [
            'lgbtq', 'lgbt', 'gay', 'lesbian', 'bisexual', 'transgender', 'trans', 'queer',
            'non-binary', 'pride', 'rainbow', 'equality', 'diversity', 'inclusion',
            'support', 'community', 'crisis', 'mental health', 'counselling', 'therapy',
            'housing', 'homeless', 'youth', 'young people', 'helpline', '24/7',
            'emergency', 'legal', 'advice', 'discrimination', 'rights', 'advocacy'
        ];
        const lowerHtml = html.toLowerCase();
        const text = $('body').text().toLowerCase();
        lgbtqTerms.forEach(term => {
            if (lowerHtml.includes(term) || text.includes(term)) {
                keywords.add(term);
            }
        });
        return Array.from(keywords).slice(0, 10); // Limit to 10 keywords
    }
    cleanPhone(phone) {
        return phone.replace(/[^\d+\s\-\(\)]/g, '').trim();
    }
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    // Bulk scraping for multiple URLs
    async bulkScrape(urls) {
        const results = [];
        for (const url of urls) {
            try {
                const data = await this.scrapeWebsite(url);
                results.push({ url, data });
                // Add delay between requests to be respectful
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            catch (error) {
                results.push({
                    url,
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        }
        return results;
    }
}
export default WebScrapingService;
