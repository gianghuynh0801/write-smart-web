
// Utility for working with n8n webhooks for content generation

interface ContentGenerationParams {
  topic: string;
  keywords?: string;
  length?: 'short' | 'medium' | 'long';
  tone?: 'professional' | 'casual' | 'formal' | 'persuasive';
  language?: 'vietnamese' | 'english';
}

interface WebhookResponse {
  status: 'success' | 'error';
  content?: string;
  error?: string;
}

export const generateContent = async (
  params: ContentGenerationParams,
  webhookUrl: string = import.meta.env.VITE_N8N_WEBHOOK_URL || ''
): Promise<WebhookResponse> => {
  try {
    if (!webhookUrl) {
      throw new Error('No webhook URL provided');
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        timestamp: new Date().toISOString(),
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      status: 'success',
      content: data.content,
    };
  } catch (error) {
    console.error('Error calling webhook:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// WordPress integration services
interface WordPressCredentials {
  url: string;
  username: string;
  appPassword: string;
}

interface WordPressPost {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'publish' | 'draft' | 'pending' | 'private';
  categories?: number[];
  tags?: number[];
}

export const publishToWordPress = async (
  credentials: WordPressCredentials,
  post: WordPressPost
): Promise<{ status: 'success' | 'error', postId?: number, error?: string }> => {
  try {
    const { url, username, appPassword } = credentials;
    
    // Construct the WordPress REST API endpoint
    const apiUrl = `${url.replace(/\/+$/, '')}/wp-json/wp/v2/posts`;
    
    // Create the Authorization header using Basic Auth
    const authHeader = 'Basic ' + btoa(`${username}:${appPassword}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status || 'draft',
        categories: post.categories,
        tags: post.tags,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      status: 'success',
      postId: data.id,
    };
  } catch (error) {
    console.error('Error publishing to WordPress:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
