// Utility for working with n8n webhooks for content generation
import { getItem, LOCAL_STORAGE_KEYS } from "./localStorageService";

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
  rawResponse?: any; // Lưu lại response gốc để debug
}

export const generateContent = async (
  params: ContentGenerationParams,
  webhookUrl: string = getItem(LOCAL_STORAGE_KEYS.WEBHOOK_URL, false) || import.meta.env.VITE_N8N_WEBHOOK_URL || ''
): Promise<WebhookResponse> => {
  try {
    if (!webhookUrl) {
      throw new Error('Không có URL webhook nào được cung cấp');
    }
    
    // Kiểm tra URL có đúng định dạng không
    try {
      new URL(webhookUrl);
    } catch (urlError) {
      console.error('URL không hợp lệ:', webhookUrl);
      return {
        status: 'error',
        error: 'URL webhook không hợp lệ. Vui lòng kiểm tra định dạng URL.'
      };
    }
    
    console.log('Gửi yêu cầu đến webhook:', webhookUrl);
    console.log('Tham số yêu cầu:', params);
    
    // Thiết lập timeout 10 phút
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 phút = 600000ms
    
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
      mode: 'cors', // Thiết lập CORS mode
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error('Phản hồi lỗi HTTP:', response.status, response.statusText);
      throw new Error(`Lỗi HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const responseText = await response.text();
    console.log('Phản hồi gốc từ server:', responseText);
    
    if (!responseText || responseText.trim() === '') {
      return {
        status: 'error',
        error: 'Máy chủ trả về phản hồi trống. Vui lòng kiểm tra cấu hình webhook.',
      };
    }
    
    try {
      const data = JSON.parse(responseText);
      console.log('Dữ liệu JSON đã parse:', data);
      
      // Xử lý trường hợp n8n webhook test
      if (Array.isArray(data)) {
        return {
          status: 'success',
          content: JSON.stringify(data, null, 2),
          rawResponse: data
        };
      }
      
      // Xử lý các response khác
      return {
        status: 'success',
        content: typeof data === 'string' ? data : JSON.stringify(data, null, 2),
        rawResponse: data
      };
      
    } catch (jsonError) {
      console.error('Lỗi parse JSON:', jsonError);
      return {
        status: 'success',
        content: responseText,
        error: 'Dữ liệu không ở định dạng JSON, hiển thị dưới dạng text.',
      };
    }
  } catch (error) {
    // Kiểm tra lỗi mạng
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Lỗi mạng - Không thể kết nối:', error);
      return {
        status: 'error',
        error: 'Không thể kết nối tới webhook URL. Vui lòng kiểm tra kết nối mạng và URL webhook.'
      };
    }
    
    // Kiểm tra timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      console.error('Yêu cầu hết thời gian chờ:', error);
      return {
        status: 'error',
        error: 'Yêu cầu quá thời gian chờ (10 phút). Vui lòng thử lại sau.'
      };
    }
    
    console.error('Lỗi khi gọi webhook:', error);
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
