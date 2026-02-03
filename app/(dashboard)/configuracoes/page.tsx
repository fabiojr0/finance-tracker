'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@/lib/hooks/use-user'
import { Skeleton } from '@/components/shared/skeleton'

function SkeletonSettingsCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-40" />
        </div>
        <Skeleton className="h-10 w-32 mt-4" />
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-72" />
        </div>
        {/* Cards Skeleton */}
        <SkeletonSettingsCard />
        <SkeletonSettingsCard />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-64 mb-4" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-200">Configurações</h1>
        <p className="text-neutral-400 mt-1">
          Gerencie suas preferências e informações pessoais
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="bg-neutral-800"
            />
            <p className="text-xs text-neutral-400 mt-1">
              O e-mail não pode ser alterado
            </p>
          </div>

          <div>
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              type="text"
              placeholder="Seu nome completo"
              disabled
            />
            <p className="text-xs text-neutral-400 mt-1">
              Funcionalidade em desenvolvimento
            </p>
          </div>

          <div className="pt-4">
            <Button disabled>Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currency">Moeda Padrão</Label>
            <select
              id="currency"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled
            >
              <option value="BRL">Real (R$)</option>
              <option value="USD">Dólar ($)</option>
              <option value="EUR">Euro (€)</option>
            </select>
            <p className="text-xs text-neutral-400 mt-1">
              Funcionalidade em desenvolvimento
            </p>
          </div>

          <div className="pt-4">
            <Button disabled>Salvar Preferências</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-400 mb-4">
            Ações irreversíveis que afetarão permanentemente sua conta.
          </p>
          <Button variant="destructive" disabled>
            Excluir Conta
          </Button>
          <p className="text-xs text-neutral-400 mt-2">
            Funcionalidade em desenvolvimento
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
