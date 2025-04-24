
export interface WordPressCredentials {
  url: string;
  username: string;
  appPassword: string;
}

export interface WordPressPost {
  title: string;
  content: string;
  excerpt?: string;
  status?: 'publish' | 'draft' | 'pending' | 'private';
  categories?: number[];
  tags?: number[];
}

export interface WordPressResponse {
  status: 'success' | 'error';
  postId?: number;
  error?: string;
}

