import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Status = 'ACTIVE' | 'INACTIVE' | 'ALUMNI'

const statusColors: Record<Status, string> = {
  ACTIVE: 'bg-green-500 text-white',
  INACTIVE: 'bg-muted text-muted-foreground',
  ALUMNI: 'bg-secondary text-secondary-foreground',
}

const statusVariants: Record<Status, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  INACTIVE: 'outline',
  ALUMNI: 'secondary',
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant={statusVariants[status]}
      className={cn(statusColors[status], className)}
    >
      {status}
    </Badge>
  )
}
