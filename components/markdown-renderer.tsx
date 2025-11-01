'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-body ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize heading styles
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mt-6 mb-4 pb-2 border-b" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mt-5 mb-3 pb-2 border-b" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-bold mt-4 mb-2" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-lg font-semibold mt-3 mb-2" {...props} />
          ),
          // Customize paragraph
          p: ({ node, ...props }) => (
            <p className="my-3 leading-7" {...props} />
          ),
          // Customize lists
          ul: ({ node, ...props }) => (
            <ul className="my-3 ml-6 list-disc space-y-1" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="my-3 ml-6 list-decimal space-y-1" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-7" {...props} />
          ),
          // Customize blockquote
          blockquote: ({ node, ...props }) => (
            <blockquote className="my-3 pl-4 border-l-4 border-gray-300 italic text-gray-700" {...props} />
          ),
          // Customize code blocks
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm font-mono text-red-600" {...props}>
                  {children}
                </code>
              )
            }
            return (
              <code className={`${className} block p-4 my-3 bg-gray-50 rounded-lg overflow-x-auto`} {...props}>
                {children}
              </code>
            )
          },
          // Customize pre (code block wrapper)
          pre: ({ node, ...props }) => (
            <pre className="my-3 overflow-x-auto" {...props} />
          ),
          // Customize links
          a: ({ node, ...props }) => (
            <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          // Customize tables
          table: ({ node, ...props }) => (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-100" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-300 px-4 py-2" {...props} />
          ),
          // Customize horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-t-2 border-gray-200" {...props} />
          ),
          // Customize images
          img: ({ node, ...props }) => (
            <img className="max-w-full h-auto my-3 rounded-lg" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

