
import { WordPressCredentials, WordPressPost, WordPressResponse } from "./types";

export const publishToWordPress = async (
  credentials: WordPressCredentials,
  post: WordPressPost
): Promise<WordPressResponse> => {
  try {
    const { url, username, appPassword } = credentials;
    
    const apiUrl = `${url.replace(/\/+$/, '')}/wp-json/wp/v2/posts`;
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

