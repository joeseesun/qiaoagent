'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, Circle, AlertCircle, Copy, Download } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { Button } from '@/components/ui/button'

interface TimelineAgentProps {
  agent: string
  content: string
  status: 'waiting' | 'running' | 'completed' | 'error'
  timestamp: number
  isStreaming?: boolean
}

export function TimelineAgent({
  agent,
  content,
  status,
  timestamp,
  isStreaming = false
}: TimelineAgentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  // 移除自动滚动，让用户自己控制滚动
  // useEffect(() => {
  //   if (isStreaming && contentRef.current) {
  //     contentRef.current.scrollTop = contentRef.current.scrollHeight
  //   }
  // }, [content, isStreaming])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${agent}_${new Date().getTime()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  const getStatusIcon = () => {
    switch (status) {
      case 'waiting':
        return <Circle className="w-5 h-5 text-muted-foreground" />
      case 'running':
        return <Loader2 className="w-5 h-5 text-foreground animate-spin" />
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-foreground" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return 'border-border'
      case 'running':
        return 'border-foreground'
      case 'completed':
        return 'border-border'
      case 'error':
        return 'border-destructive'
    }
  }
  
  const getGlowColor = () => {
    switch (status) {
      case 'running':
        return 'shadow-sm'
      case 'completed':
        return ''
      case 'error':
        return 'shadow-sm shadow-destructive/20'
      default:
        return ''
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative flex gap-6 group"
    >
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        {/* Icon */}
        <div
          className={`
            relative z-10 flex items-center justify-center
            w-10 h-10 rounded-full border-2 bg-background
            transition-all duration-300
            ${getStatusColor()}
          `}
        >
          {getStatusIcon()}
        </div>
        
        {/* Vertical line */}
        <div className="w-0.5 flex-1 bg-border mt-2" />
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">
              {agent}
            </h3>
            {status === 'running' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-2 py-0.5 text-xs font-medium text-muted-foreground bg-muted rounded-full"
              >
                思考中...
              </motion.div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {content && status === 'completed' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 text-xs"
                >
                  <Copy className="w-3 h-3 mr-1" />
                  {copied ? '已复制' : '复制'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 px-2 text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  下载
                </Button>
              </>
            )}
            <span className="text-xs text-muted-foreground">
              {new Date(timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>
        
        {/* Content area */}
        {content && (
          <div
            className={`
              relative overflow-hidden rounded-lg border
              ${getStatusColor()}
              ${getGlowColor()}
              transition-colors duration-300
            `}
          >
              <div
                ref={contentRef}
                className={`
                  relative p-4 max-h-96 overflow-y-auto
                  bg-card
                  text-sm text-foreground/90 leading-relaxed
                `}
              >
                <div className="markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-2 mb-1" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                      li: ({node, ...props}) => <li className="ml-2" {...props} />,
                      code: ({node, inline, ...props}: any) =>
                        inline
                          ? <code className="px-1 py-0.5 bg-muted rounded text-xs font-mono" {...props} />
                          : <code className="block p-2 bg-muted rounded text-xs font-mono overflow-x-auto" {...props} />,
                      pre: ({node, ...props}) => <pre className="mb-2 overflow-x-auto" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-border pl-3 italic my-2" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                      em: ({node, ...props}) => <em className="italic" {...props} />,
                    }}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
                {isStreaming && status === 'running' && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block w-2 h-4 ml-1 bg-foreground rounded-sm"
                  />
                )}
              </div>
            </div>
        )}
      </div>
    </motion.div>
  )
}

