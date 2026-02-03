import { cn } from '@/lib/utils/cn'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-800 bg-neutral-900 p-8 text-center',
        className
      )}
    >
      {icon && <div className="mb-4 text-neutral-400">{icon}</div>}
      <h3 className="mb-2 text-lg font-semibold text-neutral-200">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-neutral-400">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
