'use client'

import { useEffect, useRef } from 'react'
import MarkdownIt from 'markdown-it'
// import emoji from 'markdown-it-emoji'
import { full as emoji } from 'markdown-it-emoji'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css' // Choose your theme
import anchor from 'markdown-it-anchor'
import toc from 'markdown-it-table-of-contents'
import container from 'markdown-it-container'
import footnote from 'markdown-it-footnote'
import { imgSize, obsidianImgSize } from "@mdit/plugin-img-size"
import { sup } from "@mdit/plugin-sup"
import { sub } from "@mdit/plugin-sub"
import { ins } from '@mdit/plugin-ins'
import { mark } from '@mdit/plugin-mark'
import { tasklist } from "@mdit/plugin-tasklist"
import { dl } from "@mdit/plugin-dl"
import { abbr } from "@mdit/plugin-abbr"


interface MarkdownPreviewProps {
    content: string
    className?: string
}

export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!containerRef.current) return

        // Initialize markdown-it with options
        // const md = new MarkdownIt({
        //   html: true,
        //   linkify: true,
        //   typographer: true,
        //   breaks: true,
        //   highlight: function (str, lang) {
        //     if (lang && hljs.getLanguage(lang)) {
        //       try {
        //         return '<pre class="hljs"><code>' +
        //                hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
        //                '</code></pre>'
        //       } catch (__) {}
        //     }

        //     return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
        //   }
        // })
        const md: MarkdownIt = new MarkdownIt({
            html: true,
            linkify: true,
            typographer: true,
            breaks: true,
            highlight: function (str: string, lang: string): string { // Added : string here
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return '<pre><code class="hljs">' +
                            hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
                            '</code></pre>';
                    } catch (err) {
                        console.error(err);
                    }
                }

                // Use md.utils.escapeHtml to ensure safe string output
                return '<pre><code class="hljs">' + md.utils.escapeHtml(str) + '</code></pre>';
            }
        });

        // Add emoji plugin
        md.use(emoji)
            .use(anchor, {
                permalink: false,
                // permalinkBefore: true,
                // permalinkSymbol: '#'
            })
            .use(toc, {
                includeLevel: [1, 2, 3],
                containerClass: 'table-of-contents'
            })
            .use(container, 'warning')
            .use(container, 'info')
            .use(container, 'tip')
            .use(footnote)
            .use(imgSize)
            .use(obsidianImgSize)
            .use(sub)
            .use(sup)
            .use(ins)
            .use(mark)
            .use(tasklist)
            .use(dl)
            .use(abbr)

        // Custom link rendering to open in new tab
        const defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
            return self.renderToken(tokens, idx, options)
        }

        md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
            const aIndex = tokens[idx].attrIndex('target')

            if (aIndex < 0) {
                tokens[idx].attrPush(['target', '_blank'])
                tokens[idx].attrPush(['rel', 'noopener noreferrer'])
            } else {
                tokens[idx].attrs![aIndex][1] = '_blank'
            }

            return defaultRender(tokens, idx, options, env, self)
        }

        // Render markdown
        const rendered = md.render(content)

        // Set innerHTML
        containerRef.current.innerHTML = rendered

        // Apply syntax highlighting to code blocks
        if (containerRef.current) {
            containerRef.current.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block as HTMLElement)
            })
        }

    }, [content])

    return (
        <div
            ref={containerRef}
            className={`prose prose-lg max-w-none markdown-content ${className}`}
        />
    )
}

// 'use client'

// import { useEffect, useRef } from 'react'
// import MarkdownIt from 'markdown-it'
// // import emoji from 'markdown-it-emoji'
// import { full as emoji } from 'markdown-it-emoji';

// interface MarkdownPreviewProps {
//     content: string
//     className?: string
// }

// export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
//     const containerRef = useRef<HTMLDivElement>(null)

//     useEffect(() => {
//         if (!containerRef.current) return

//         // Initialize markdown-it
//         // const md = new MarkdownIt({
//         //   html: true,          // Enable HTML tags in source
//         //   linkify: true,       // Auto-convert URL-like text to links
//         //   typographer: true,   // Enable smartypants and other sweet transforms
//         //   breaks: true,        // Convert \n to <br>
//         //   quotes: '""''',      // Smart quotes
//         // })

//         const md = new MarkdownIt({
//             html: true,
//             linkify: true,
//             typographer: true,
//             breaks: true,
//             quotes: '“”‘’'
//         });

//         // Add emoji support
//         md.use(emoji)

//         // Render markdown to HTML
//         const rendered = md.render(content)

//         // Set innerHTML safely
//         containerRef.current.innerHTML = rendered

//     }, [content])

//     return (
//         <div
//             ref={containerRef}
//             className={`prose prose-lg max-w-none markdown-content ${className}`}
//         />
//     )
// }



// 'use client'

// import ReactMarkdown from 'react-markdown'
// import remarkGfm from 'remark-gfm'
// import rehypeRaw from 'rehype-raw'
// import rehypeSanitize from 'rehype-sanitize'

// interface MarkdownPreviewProps {
//     content: string
//     className?: string
// }

// export default function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
//     return (
//         <div className={`prose prose-lg max-w-none ${className}`}>
//             <ReactMarkdown
//                 remarkPlugins={[remarkGfm]}
//                 rehypePlugins={[rehypeRaw, rehypeSanitize]}
//                 components={{
//                     // Customize rendering
//                     h1: ({ node, ...props }) => (
//                         <h1 className="text-4xl font-bold mb-4 mt-8" {...props} />
//                     ),
//                     h2: ({ node, ...props }) => (
//                         <h2 className="text-3xl font-bold mb-3 mt-6" {...props} />
//                     ),
//                     h3: ({ node, ...props }) => (
//                         <h3 className="text-2xl font-bold mb-2 mt-4" {...props} />
//                     ),
//                     p: ({ node, ...props }) => (
//                         <p className="mb-4 leading-relaxed" {...props} />
//                     ),
//                     ul: ({ node, ...props }) => (
//                         <ul className="list-disc list-inside mb-4 space-y-2" {...props} />
//                     ),
//                     ol: ({ node, ...props }) => (
//                         <ol className="list-decimal list-inside mb-4 space-y-2" {...props} />
//                     ),
//                     li: ({ node, ...props }) => (
//                         <li className="ml-4" {...props} />
//                     ),
//                     blockquote: ({ node, ...props }) => (
//                         <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />
//                     ),
//                     //   code: ({ node, inline, ...props }) => (
//                     //     inline ? (
//                     //       <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
//                     //     ) : (
//                     //       <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm" {...props} />
//                     //     )
//                     //   ),
//                     code: ({ node, className, children, ...props }) => {
//                         // In v9, we check for a class name to identify a code block
//                         const isBlock = /language-(\w+)/.exec(className || '');

//                         return isBlock ? (
//                             <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 font-mono text-sm" {...props}>
//                                 {children}
//                             </code>
//                         ) : (
//                             <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
//                                 {children}
//                             </code>
//                         );
//                     },
//                     // Note: Usually, pre tags wrap code blocks. 
//                     // If you want your code block styling to apply to the container, 
//                     // handle it here or in the code component above.
//                     pre: ({ node, ...props }) => (
//                         <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props} />
//                     ),
//                     a: ({ node, ...props }) => (
//                         <a className="text-blue-600 hover:text-blue-800 underline" {...props} />
//                     ),
//                     img: ({ node, ...props }) => (
//                         <img className="rounded-lg my-4 max-w-full h-auto" {...props} />
//                     ),
//                     hr: ({ node, ...props }) => (
//                         <hr className="my-8 border-gray-300" {...props} />
//                     ),
//                     table: ({ node, ...props }) => (
//                         <div className="overflow-x-auto my-4">
//                             <table className="min-w-full divide-y divide-gray-300" {...props} />
//                         </div>
//                     ),
//                     thead: ({ node, ...props }) => (
//                         <thead className="bg-gray-50" {...props} />
//                     ),
//                     tbody: ({ node, ...props }) => (
//                         <tbody className="divide-y divide-gray-200 bg-white" {...props} />
//                     ),
//                     tr: ({ node, ...props }) => (
//                         <tr {...props} />
//                     ),
//                     th: ({ node, ...props }) => (
//                         <th className="px-3 py-2 text-left text-sm font-semibold text-gray-900" {...props} />
//                     ),
//                     td: ({ node, ...props }) => (
//                         <td className="px-3 py-2 text-sm text-gray-500" {...props} />
//                     ),
//                 }}
//             >
//                 {content}
//             </ReactMarkdown>
//         </div>
//     )
// }