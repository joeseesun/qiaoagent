'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, QrCode } from 'lucide-react'

interface SupportDialogProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: 'reward' | 'follow'
}

export function SupportDialog({ isOpen, onClose, initialTab = 'reward' }: SupportDialogProps) {
  const [activeTab, setActiveTab] = useState<'reward' | 'follow'>(initialTab)

  // Update active tab when dialog opens with new initialTab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog - Centered in viewport */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ pointerEvents: 'none' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ pointerEvents: 'auto' }}
              className="w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 border-b border-border">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 p-2 rounded-lg hover:bg-background/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gradient">支持项目</h2>
                  <p className="text-sm text-muted-foreground">感谢你的支持与关注</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('reward')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'reward'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  微信打赏
                </button>
                <button
                  onClick={() => setActiveTab('follow')}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === 'follow'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  关注公众号
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                {activeTab === 'reward' ? (
                  <motion.div
                    key="reward"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl" />
                      <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                        <img
                          src="/qr-codes/wechat-reward.jpg"
                          alt="微信打赏"
                          className="w-64 h-64 object-contain"
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">微信扫码打赏</h3>
                      <p className="text-sm text-muted-foreground">
                        你的支持是我持续更新的动力 ❤️
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="follow"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center"
                  >
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-2xl blur-xl" />
                      <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                        <img
                          src="/qr-codes/wechat-follow.jpg"
                          alt="关注公众号"
                          className="w-64 h-64 object-contain"
                        />
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">关注公众号</h3>
                      <p className="text-sm text-muted-foreground">
                        获取最新功能更新和使用技巧 🚀
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-muted/30 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                开源项目 · MIT License · 欢迎贡献代码
              </p>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

