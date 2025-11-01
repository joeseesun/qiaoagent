'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Copy, Download, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { MarkdownRenderer } from '@/components/markdown-renderer'
import { useState } from 'react'

interface Result {
  title: string
  article: string
  summary: string
}

interface ResultPanelProps {
  result: Result | null
  onCopy: (text: string) => void
  onDownload: () => void
}

export function ResultPanel({ result, onCopy, onDownload }: ResultPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [copiedSection, setCopiedSection] = useState<string | null>(null)
  
  const handleCopy = (text: string, section: string) => {
    onCopy(text)
    setCopiedSection(section)
    setTimeout(() => setCopiedSection(null), 2000)
  }
  
  if (!result) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed bg-card/95 backdrop-blur-xl shadow-2xl z-[9999] ${
        isExpanded ? 'top-0 bottom-0 left-[420px] right-0' : 'bottom-0 left-[420px] right-0'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-8 py-3 cursor-pointer hover:bg-card/50 transition-colors border-b border-border/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </motion.div>
          <p className="text-sm text-muted-foreground">
            {isExpanded ? '点击收起' : '点击展开完整结果'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              handleCopy(`# ${result.title}\n\n${result.article}\n\n---\n\n**摘要:** ${result.summary}`, 'all')
            }}
            className="hover:bg-purple-500/10 hover:text-purple-400"
          >
            {copiedSection === 'all' ? (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            复制全部
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDownload()
            }}
            className="hover:bg-blue-500/10 hover:text-blue-400"
          >
            <Download className="w-4 h-4 mr-2" />
            下载 Markdown
          </Button>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </div>
      
      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-hidden flex flex-col"
          >
            <div className="flex-1 px-8 py-6 overflow-y-auto">
              {/* Article Content - Direct Display */}
              <div className="prose prose-lg max-w-none">
                <MarkdownRenderer content={result.article} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

