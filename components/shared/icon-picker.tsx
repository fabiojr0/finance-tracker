'use client'

import { useState } from 'react'
import {
  Wallet,
  CreditCard,
  Banknote,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  LineChart,
  BarChart3,
  DollarSign,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  Store,
  Package,
  Gift,
  Home,
  Building2,
  Car,
  Bus,
  Plane,
  Train,
  Fuel,
  Utensils,
  Coffee,
  Pizza,
  Beer,
  Wine,
  Apple,
  Salad,
  Sandwich,
  Heart,
  Activity,
  Pill,
  Stethoscope,
  Dumbbell,
  Bike,
  Gamepad2,
  Music,
  Film,
  Tv,
  Monitor,
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Book,
  GraduationCap,
  Briefcase,
  Building,
  Users,
  Baby,
  Dog,
  Cat,
  Shirt,
  Scissors,
  Sparkles,
  Wrench,
  Hammer,
  Lightbulb,
  Droplets,
  Flame,
  Wifi,
  Phone,
  Mail,
  FileText,
  Landmark,
  CircleDollarSign,
  Coins,
  BadgeDollarSign,
  HandCoins,
  Gem,
  Crown,
  Star,
  Zap,
  Sun,
  Moon,
  Cloud,
  Umbrella,
  TreePine,
  Flower2,
  Leaf,
  Mountain,
  Waves,
  Anchor,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export const AVAILABLE_ICONS: { name: string; icon: LucideIcon; category: string }[] = [
  // Finanças
  { name: 'wallet', icon: Wallet, category: 'Finanças' },
  { name: 'credit-card', icon: CreditCard, category: 'Finanças' },
  { name: 'banknote', icon: Banknote, category: 'Finanças' },
  { name: 'piggy-bank', icon: PiggyBank, category: 'Finanças' },
  { name: 'trending-up', icon: TrendingUp, category: 'Finanças' },
  { name: 'trending-down', icon: TrendingDown, category: 'Finanças' },
  { name: 'line-chart', icon: LineChart, category: 'Finanças' },
  { name: 'bar-chart', icon: BarChart3, category: 'Finanças' },
  { name: 'dollar-sign', icon: DollarSign, category: 'Finanças' },
  { name: 'receipt', icon: Receipt, category: 'Finanças' },
  { name: 'landmark', icon: Landmark, category: 'Finanças' },
  { name: 'circle-dollar', icon: CircleDollarSign, category: 'Finanças' },
  { name: 'coins', icon: Coins, category: 'Finanças' },
  { name: 'badge-dollar', icon: BadgeDollarSign, category: 'Finanças' },
  { name: 'hand-coins', icon: HandCoins, category: 'Finanças' },
  { name: 'gem', icon: Gem, category: 'Finanças' },

  // Compras
  { name: 'shopping-cart', icon: ShoppingCart, category: 'Compras' },
  { name: 'shopping-bag', icon: ShoppingBag, category: 'Compras' },
  { name: 'store', icon: Store, category: 'Compras' },
  { name: 'package', icon: Package, category: 'Compras' },
  { name: 'gift', icon: Gift, category: 'Compras' },

  // Moradia
  { name: 'home', icon: Home, category: 'Moradia' },
  { name: 'building2', icon: Building2, category: 'Moradia' },
  { name: 'lightbulb', icon: Lightbulb, category: 'Moradia' },
  { name: 'droplets', icon: Droplets, category: 'Moradia' },
  { name: 'flame', icon: Flame, category: 'Moradia' },
  { name: 'wifi', icon: Wifi, category: 'Moradia' },
  { name: 'wrench', icon: Wrench, category: 'Moradia' },
  { name: 'hammer', icon: Hammer, category: 'Moradia' },

  // Transporte
  { name: 'car', icon: Car, category: 'Transporte' },
  { name: 'bus', icon: Bus, category: 'Transporte' },
  { name: 'plane', icon: Plane, category: 'Transporte' },
  { name: 'train', icon: Train, category: 'Transporte' },
  { name: 'fuel', icon: Fuel, category: 'Transporte' },
  { name: 'bike', icon: Bike, category: 'Transporte' },

  // Alimentação
  { name: 'utensils', icon: Utensils, category: 'Alimentação' },
  { name: 'coffee', icon: Coffee, category: 'Alimentação' },
  { name: 'pizza', icon: Pizza, category: 'Alimentação' },
  { name: 'beer', icon: Beer, category: 'Alimentação' },
  { name: 'wine', icon: Wine, category: 'Alimentação' },
  { name: 'apple', icon: Apple, category: 'Alimentação' },
  { name: 'salad', icon: Salad, category: 'Alimentação' },
  { name: 'sandwich', icon: Sandwich, category: 'Alimentação' },

  // Saúde
  { name: 'heart', icon: Heart, category: 'Saúde' },
  { name: 'activity', icon: Activity, category: 'Saúde' },
  { name: 'pill', icon: Pill, category: 'Saúde' },
  { name: 'stethoscope', icon: Stethoscope, category: 'Saúde' },
  { name: 'dumbbell', icon: Dumbbell, category: 'Saúde' },

  // Lazer
  { name: 'gamepad', icon: Gamepad2, category: 'Lazer' },
  { name: 'music', icon: Music, category: 'Lazer' },
  { name: 'film', icon: Film, category: 'Lazer' },
  { name: 'tv', icon: Tv, category: 'Lazer' },

  // Tecnologia
  { name: 'monitor', icon: Monitor, category: 'Tecnologia' },
  { name: 'smartphone', icon: Smartphone, category: 'Tecnologia' },
  { name: 'laptop', icon: Laptop, category: 'Tecnologia' },
  { name: 'headphones', icon: Headphones, category: 'Tecnologia' },
  { name: 'camera', icon: Camera, category: 'Tecnologia' },

  // Educação/Trabalho
  { name: 'book', icon: Book, category: 'Educação' },
  { name: 'graduation-cap', icon: GraduationCap, category: 'Educação' },
  { name: 'briefcase', icon: Briefcase, category: 'Trabalho' },
  { name: 'building', icon: Building, category: 'Trabalho' },

  // Família
  { name: 'users', icon: Users, category: 'Família' },
  { name: 'baby', icon: Baby, category: 'Família' },
  { name: 'dog', icon: Dog, category: 'Família' },
  { name: 'cat', icon: Cat, category: 'Família' },

  // Pessoal
  { name: 'shirt', icon: Shirt, category: 'Pessoal' },
  { name: 'scissors', icon: Scissors, category: 'Pessoal' },
  { name: 'sparkles', icon: Sparkles, category: 'Pessoal' },
  { name: 'crown', icon: Crown, category: 'Pessoal' },
  { name: 'star', icon: Star, category: 'Pessoal' },

  // Serviços
  { name: 'phone', icon: Phone, category: 'Serviços' },
  { name: 'mail', icon: Mail, category: 'Serviços' },
  { name: 'file-text', icon: FileText, category: 'Serviços' },
  { name: 'zap', icon: Zap, category: 'Serviços' },

  // Natureza
  { name: 'sun', icon: Sun, category: 'Natureza' },
  { name: 'moon', icon: Moon, category: 'Natureza' },
  { name: 'cloud', icon: Cloud, category: 'Natureza' },
  { name: 'umbrella', icon: Umbrella, category: 'Natureza' },
  { name: 'tree', icon: TreePine, category: 'Natureza' },
  { name: 'flower', icon: Flower2, category: 'Natureza' },
  { name: 'leaf', icon: Leaf, category: 'Natureza' },
  { name: 'mountain', icon: Mountain, category: 'Natureza' },
  { name: 'waves', icon: Waves, category: 'Natureza' },
  { name: 'anchor', icon: Anchor, category: 'Natureza' },
]

export function getIconByName(name: string): LucideIcon | null {
  const found = AVAILABLE_ICONS.find((i) => i.name === name)
  return found?.icon || null
}

interface IconPickerProps {
  value?: string
  onChange: (iconName: string) => void
  disabled?: boolean
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedIcon = AVAILABLE_ICONS.find((i) => i.name === value)
  const SelectedIconComponent = selectedIcon?.icon

  const filteredIcons = search
    ? AVAILABLE_ICONS.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.category.toLowerCase().includes(search.toLowerCase())
      )
    : AVAILABLE_ICONS

  const groupedIcons = filteredIcons.reduce((acc, icon) => {
    if (!acc[icon.category]) {
      acc[icon.category] = []
    }
    acc[icon.category].push(icon)
    return acc
  }, {} as Record<string, typeof AVAILABLE_ICONS>)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          !value && 'text-neutral-400'
        )}
      >
        {SelectedIconComponent ? (
          <>
            <SelectedIconComponent className="h-4 w-4" />
            <span className="capitalize">{selectedIcon?.name.replace('-', ' ')}</span>
          </>
        ) : (
          <span>Selecione um ícone</span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-2 border-b border-neutral-800">
              <input
                type="text"
                placeholder="Buscar ícone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-neutral-800 border border-neutral-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {Object.entries(groupedIcons).map(([category, icons]) => (
                <div key={category} className="mb-3">
                  <p className="text-xs font-medium text-neutral-500 mb-2 px-1">
                    {category}
                  </p>
                  <div className="grid grid-cols-6 gap-1">
                    {icons.map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          onChange(name)
                          setIsOpen(false)
                          setSearch('')
                        }}
                        className={cn(
                          'p-2 rounded-md hover:bg-neutral-800 transition-colors flex items-center justify-center',
                          value === name && 'bg-primary/20 text-primary'
                        )}
                        title={name}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(groupedIcons).length === 0 && (
                <p className="text-center text-neutral-500 text-sm py-4">
                  Nenhum ícone encontrado
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
