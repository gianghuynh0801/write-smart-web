// Utility for working with n8n webhooks for content generation

interface ContentGenerationParams {
  keywords: {
    main: string;
    sub: string[];
    related: string[];
  };
  outline: Array<{
    heading: "H2" | "H3";
    title: string;
  }>;
  knowledge: {
    webConnection: boolean;
    reference: string;
  };
  format: {
    bold: boolean;
    italic: boolean;
    useList: boolean;
  };
  links: Array<{
    keyword: string;
    url: string;
  }>;
  images: {
    size: string;
  };
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
    
    console.log('Sending request to webhook:', webhookUrl);
    console.log('Request params:', params);
    
    // Set timeout to prevent infinite waiting
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        timestamp: new Date().toISOString(),
      }),
      signal: controller.signal,
      mode: 'cors', // Explicitly set CORS mode
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('HTTP error response:', response.status, response.statusText);
      throw new Error(`HTTP error: ${response.status} - ${response.statusText}`);
    }
    
    // Check if response has content before parsing JSON
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      console.log('Empty response received from webhook');
      return {
        status: 'success',
        content: 'Server returned an empty response. Content was not generated.',
      };
    }
    
    // Try to parse JSON from text response
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Invalid JSON response:', responseText);
      return {
        status: 'error',
        error: 'Server trả về định dạng không hợp lệ. Vui lòng thử lại sau.',
      };
    }
    
    console.log('Response data:', data);
    
    return {
      status: 'success',
      content: data.content || 'Content generated successfully, but empty response received.',
    };
  } catch (error) {
    // Check for specific network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Network error - Failed to fetch:', error);
      return {
        status: 'error',
        error: 'Không thể kết nối tới webhook URL. Vui lòng kiểm tra kết nối mạng và URL webhook.'
      };
    }
    
    // Check for timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Request timeout:', error);
      return {
        status: 'error',
        error: 'Yêu cầu quá thời gian chờ. Vui lòng thử lại sau.'
      };
    }
    
    console.error('Error calling webhook:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Lỗi không xác định khi gọi webhook',
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
