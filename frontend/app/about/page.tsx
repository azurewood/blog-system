export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-5xl font-display font-bold text-gray-900 mb-8">
        About This Blog
      </h1>

      <div className="prose prose-lg">
        <p className="text-xl text-gray-600 mb-6">
          Welcome to our blog! This is a modern, high-performance blogging platform built with cutting-edge technologies.
        </p>

        <h2 className="text-3xl font-display font-bold text-gray-900 mt-12 mb-4">
          Technology Stack
        </h2>

        <div className="grid md:grid-cols-2 gap-6 not-prose mb-8">
          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Frontend</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Next.js 14+ with App Router</li>
              <li>• React Server Components</li>
              <li>• TypeScript</li>
              <li>• Tailwind CSS</li>
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Backend</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Rust with Axum framework</li>
              <li>• Vercel Edge Functions</li>
              <li>• Turso (LibSQL) database</li>
              <li>• RESTful API</li>
            </ul>
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold text-gray-900 mt-12 mb-4">
          Features
        </h2>

        <ul className="space-y-2 text-gray-600">
          <li>✨ Lightning-fast page loads with static generation</li>
          <li>🔒 Type-safe backend with Rust</li>
          <li>📱 Fully responsive design</li>
          <li>🎨 Beautiful, modern UI</li>
          <li>📊 View tracking and analytics</li>
          <li>🏷️ Tag-based organization</li>
          <li>💬 Comment system (coming soon)</li>
        </ul>

        <h2 className="text-3xl font-display font-bold text-gray-900 mt-12 mb-4">
          Get in Touch
        </h2>

        <p className="text-gray-600">
          Have questions or feedback? We'd love to hear from you! Reach out to us at{' '}
          <a href="mailto:hello@example.com" className="text-blue-600 hover:text-blue-700">
            hello@example.com
          </a>
        </p>
      </div>
    </div>
  )
}
