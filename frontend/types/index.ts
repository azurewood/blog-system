export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author_id: string;
  status: 'draft' | 'published' | 'archived';
  featured_image?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  views: number;
}

export interface PostWithAuthor extends Post {
  author: {
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  tags: Tag[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreatePostData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'archived';
  featured_image?: string;
  tags?: string[];
}
