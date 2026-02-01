import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { fetchPostBySlug } from '@/lib/api'
import ShareButtons from '@/components/ShareButtons'
import Comments from '@/components/Comments'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      type: 'article',
      publishedTime: post.published_at || post.created_at,
      authors: ['Blog Author'],
      images: post.featured_image ? [
        {
          url: post.featured_image,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.content.substring(0, 160),
      images: post.featured_image ? [post.featured_image] : [],
    },
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await fetchPostBySlug(slug)

  if (!post) {
    notFound()
  }

  return (
    <article className="max-w-4xl mx-auto">
      {post.featured_image && (
        <div className="aspect-video bg-gray-200 rounded-xl overflow-hidden mb-8">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="text-5xl font-display font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-4 text-gray-600">
          <time dateTime={post.published_at || post.created_at}>
            {format(
              new Date(post.published_at || post.created_at),
              'MMMM d, yyyy'
            )}
          </time>
          <span>·</span>
          <span>{post.views} views</span>
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <ShareButtons 
          title={post.title}
          url={`/blog/${post.slug}`}
          description={post.excerpt}
        />
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <a
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to all posts
        </a>
      </div>

      <Comments postId={post.id} />
    </article>
  )
}
