'use client'

import { getIconByName } from './icon-picker'
import { cn } from '@/lib/utils/cn'

interface CategoryIconProps {
  icon: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CategoryIcon({ icon, size = 'md', className }: CategoryIconProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  // Tenta obter o ícone do Lucide
  const IconComponent = icon ? getIconByName(icon) : null

  if (IconComponent) {
    return <IconComponent className={cn(sizeClasses[size], className)} />
  }

  // Se não for um ícone do Lucide, mostra como emoji (retrocompatibilidade)
  if (icon) {
    const emojiSizes = {
      sm: 'text-base',
      md: 'text-xl',
      lg: 'text-2xl',
    }
    return <span className={cn(emojiSizes[size], className)}>{icon}</span>
  }

  // Ícone padrão se não houver nenhum
  const DefaultIcon = getIconByName('wallet')
  return DefaultIcon ? <DefaultIcon className={cn(sizeClasses[size], className)} /> : null
}
