'use client'

import { Loader2, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  text?: string
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  )
}

interface LoadingCardProps {
  title?: string
  description?: string
  className?: string
}

export function LoadingCard({ title = 'Loading...', description, className }: LoadingCardProps) {
  return (
    <div className={cn('bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6', className)}>
      <div className="flex items-center space-x-4">
        <LoadingSpinner />
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface LoadingSkeletonProps {
  lines?: number
  className?: string
}

export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
          {i === lines - 1 && <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mt-2"></div>}
        </div>
      ))}
    </div>
  )
}

interface LoadingTableProps {
  rows?: number
  columns?: number
  className?: string
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <div className="animate-pulse">
        <div className="bg-gray-200 dark:bg-slate-700 h-12 w-full"></div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="border-b border-gray-200 dark:border-slate-700">
            <div className="h-16 flex items-center px-4">
              {Array.from({ length: columns }).map((_, j) => (
                <div key={j} className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  children: React.ReactNode
  loading?: boolean
  className?: string
  disabled?: boolean
}

export function LoadingButton({ children, loading = false, className, disabled, ...props }: LoadingButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
        'bg-primary text-primary-foreground hover:bg-primary/90',
        'h-10 px-4 py-2',
        loading && 'cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

interface StatusIndicatorProps {
  status: 'loading' | 'success' | 'error' | 'warning' | 'info'
  text?: string
  className?: string
}

export function StatusIndicator({ status, text, className }: StatusIndicatorProps) {
  const statusConfig = {
    loading: {
      icon: Loader2,
      iconClass: 'animate-spin text-blue-600',
      bgClass: 'bg-blue-100 dark:bg-blue-900/20',
      textClass: 'text-blue-800 dark:text-blue-200',
      defaultText: 'Loading...'
    },
    success: {
      icon: CheckCircle,
      iconClass: 'text-green-600',
      bgClass: 'bg-green-100 dark:bg-green-900/20',
      textClass: 'text-green-800 dark:text-green-200',
      defaultText: 'Success'
    },
    error: {
      icon: AlertCircle,
      iconClass: 'text-red-600',
      bgClass: 'bg-red-100 dark:bg-red-900/20',
      textClass: 'text-red-800 dark:text-red-200',
      defaultText: 'Error'
    },
    warning: {
      icon: AlertCircle,
      iconClass: 'text-yellow-600',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/20',
      textClass: 'text-yellow-800 dark:text-yellow-200',
      defaultText: 'Warning'
    },
    info: {
      icon: Clock,
      iconClass: 'text-gray-600',
      bgClass: 'bg-gray-100 dark:bg-gray-900/20',
      textClass: 'text-gray-800 dark:text-gray-200',
      defaultText: 'Info'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className={cn('inline-flex items-center px-3 py-1 rounded-full text-sm font-medium', config.bgClass, config.textClass, className)}>
      <Icon className={cn('h-4 w-4 mr-1', config.iconClass)} />
      {text || config.defaultText}
    </div>
  )
}

interface PageLoaderProps {
  message?: string
  className?: string
}

export function PageLoader({ message = 'Loading...', className }: PageLoaderProps) {
  return (
    <div className={cn('min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900', className)}>
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">{message}</p>
      </div>
    </div>
  )
}

interface InlineLoaderProps {
  message?: string
  className?: string
}

export function InlineLoader({ message = 'Loading...', className }: InlineLoaderProps) {
  return (
    <div className={cn('flex items-center justify-center py-8', className)}>
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

interface ProgressLoaderProps {
  progress: number
  message?: string
  className?: string
}

export function ProgressLoader({ progress, message, className }: ProgressLoaderProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-gray-700 dark:text-gray-300">{message || 'Loading...'}</span>
        <span className="text-gray-500 dark:text-gray-400">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  )
}