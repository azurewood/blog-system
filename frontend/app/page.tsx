import Link from 'next/link'
import { format } from 'date-fns'
import { fetchPosts } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const posts = await fetchPosts(10, 0)

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-5xl font-display font-bold text-gray-900 mb-4">
          Latest Posts
        </h1>
        <p className="text-xl text-gray-600">
          Thoughts, stories, and ideas from our writers
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No posts yet</h2>
          <p className="text-gray-600">Check back soon for new content!</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="card group hover:shadow-md transition-shadow">
              {post.featured_image && (
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={post.featured_image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              
              <div className="p-6">
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-display font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                
                {post.excerpt && (
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <time dateTime={post.published_at || post.created_at}>
                    {format(
                      new Date(post.published_at || post.created_at),
                      'MMM d, yyyy'
                    )}
                  </time>
                  <span>{post.views} views</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
