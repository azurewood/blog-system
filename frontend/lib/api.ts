import { Post, ApiResponse, CreatePostData } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchPosts(limit = 10, offset = 0): Promise<Post[]> {
  const response = await fetch(
    `${API_URL}/api/posts?limit=${limit}&offset=${offset}`,
    {
      next: { revalidate: 60 }, // Revalidate every 60 seconds
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  const result: ApiResponse<Post[]> = await response.json();
  return result.data || [];
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const response = await fetch(`${API_URL}/api/posts/by-slug/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error('Failed to fetch post');
  }

  const result: ApiResponse<Post> = await response.json();
  return result.data || null;
}

export async function createPost(data: CreatePostData): Promise<Post> {
  const response = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  const result: ApiResponse<Post> = await response.json();
  if (!result.data) {
    throw new Error('No data returned from create post');
  }
  return result.data;
}

export async function updatePost(
  id: string,
  data: Partial<CreatePostData>
): Promise<Post> {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update post');
  }

  const result: ApiResponse<Post> = await response.json();
  if (!result.data) {
    throw new Error('No data returned from update post');
  }
  return result.data;
}

export async function deletePost(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/posts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
}
