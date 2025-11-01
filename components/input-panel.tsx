'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Loader2, Heart, QrCode } from 'lucide-react'
import Link from 'next/link'

interface Workflow {
  id: string
  name: string
}

interface InputPanelProps {
  workflows: Workflow[]
  selectedWorkflow: string
  topic: string
  loading: boolean
  onWorkflowChange: (value: string) => void
  onTopicChange: (value: string) => void
  onGenerate: () => void
  onOpenSupport?: (tab: 'reward' | 'follow') => void
}

export function InputPanel({
  workflows,
  selectedWorkflow,
  topic,
  loading,
  onWorkflowChange,
  onTopicChange,
  onGenerate,
  onOpenSupport
}: InputPanelProps) {
  return (
    <div className="fixed left-0 top-0 h-screen w-[420px] border-r border-border bg-background overflow-y-auto">
      <div className="p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-semibold text-foreground">
              AI 创作工作流
            </h1>
            <Link href="/admin">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            多 Agent 协作，智能化内容创作
          </p>
        </motion.div>

        {/* Workflow Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-3"
        >
          <Label htmlFor="workflow" className="text-sm font-medium text-foreground">
            选择工作流
          </Label>
          <Select value={selectedWorkflow} onValueChange={onWorkflowChange} disabled={loading}>
            <SelectTrigger 
              id="workflow" 
              className="h-12 bg-background/50 border-border hover:border-purple-500/50 transition-colors"
            >
              <SelectValue placeholder="选择一个工作流" />
            </SelectTrigger>
            <SelectContent>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Content Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-3"
        >
          <Label htmlFor="topic" className="text-sm font-medium text-foreground">
            输入内容
          </Label>
          <Textarea
            id="topic"
            placeholder="例如：AI 在教育领域的应用"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            disabled={loading}
            className="min-h-[240px] bg-background border-border focus:border-foreground transition-colors resize-none"
          />
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            onClick={onGenerate}
            disabled={loading || !topic || !selectedWorkflow}
            className="w-full h-12 bg-foreground hover:bg-foreground/90 text-background font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                开始生成
              </>
            )}
          </Button>
        </motion.div>

        {/* Support Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-3"
        >
          <button
            onClick={() => onOpenSupport?.('reward')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
          >
            <Heart className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              打赏支持
            </span>
          </button>

          <button
            onClick={() => onOpenSupport?.('follow')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-border hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
          >
            <QrCode className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              关注公众号
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  )
}

