'use client'

import { Button } from '@/components/ui/button'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  title = 'No items found',
  description = 'Get started by creating a new item.',
  icon: Icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('py-12 text-center', className)}>
      {Icon && (
        <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      )}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
