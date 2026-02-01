import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-display font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">
        Go Back Home
      </Link>
    </div>
  )
}
