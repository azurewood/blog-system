'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownPreviewProps {
    content: string
    className?: string
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
    return (
        <div className={`prose prose-lg max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={{
                    // Customize rendering
                    h1: ({ node, ...props }) => (
                        <h1 className="text-4xl font-bold mb-4 mt-8" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                        <h2 className="text-3xl font-bold mb-3 mt-6" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                        <h3 className="text-2xl font-bold mb-2 mt-4" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                        <p className="mb-4 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                        <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                        <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
                    ),
                    li: ({ node, ...props }) => (
                        <li className="ml-4" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
                    ),
                    //   code: ({ node, inline, ...props }) => (
                    //     inline ? (
                    //       <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                    //     ) : (
                    //       <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm" {...props} />
                    //     )
                    //   ),
                    code: ({ node, className, children, ...props }) => {
                        // In v9, we check for a class name to identify a code block
                        const isBlock = /language-(\w+)/.exec(className || '');

                        return isBlock ? (
                            <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm" {...props}>
                                {children}
                            </code>
                        ) : (
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                                {children}
                            </code>
                        );
                    },
                    // Note: Usually, pre tags wrap code blocks. 
                    // If you want your code block styling to apply to the container, 
                    // handle it here or in the code component above.
                    pre: ({ node, ...props }) => (
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                        <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
                    ),
                    img: ({ node, ...props }) => (
                        <img className="rounded-lg my-4 max-w-full h-auto" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                        <hr className="my-8 border-gray-300" {...props} />
                    ),
                    table: ({ node, ...props }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="min-w-full divide-y divide-gray-300" {...props} />
                        </div>
                    ),
                    thead: ({ node, ...props }) => (
                        <thead className="bg-gray-50" {...props} />
                    ),
                    tbody: ({ node, ...props }) => (
                        <tbody className="divide-y divide-gray-200 bg-white" {...props} />
                    ),
                    tr: ({ node, ...props }) => (
                        <tr {...props} />
                    ),
                    th: ({ node, ...props }) => (
                        <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                        <td className="px-3 py-2 text-sm text-gray-500" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}