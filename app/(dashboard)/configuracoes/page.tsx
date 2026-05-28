'use client'

import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUser } from '@/lib/hooks/use-user'
import { Skeleton } from '@/components/shared/skeleton'
import { createClient } from '@/lib/supabase/client'
import { fullNameSchema } from '@/lib/utils/validation'
import { usePreferences, SUPPORTED_LOCALES, SUPPORTED_CURRENCIES } from '@/lib/contexts/preferences-context'
import { User, AlertTriangle, Coins, Languages } from 'lucide-react'

const profileFormSchema = z.object({
  full_name: fullNameSchema,
})

type ProfileFormData = z.infer<typeof profileFormSchema>

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
  const { t, locale, currency, setLocale, setCurrency } = usePreferences()
  const [profileLoading, setProfileLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<
    { type: 'success' | 'error'; message: string } | null
  >(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { full_name: '' },
  })

  const loadProfile = useCallback(async (userId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single()

    if (!error && data) {
      reset({ full_name: data.full_name ?? '' })
    }
    setProfileLoading(false)
  }, [reset])

  useEffect(() => {
    if (!user) return
    void loadProfile(user.id)
  }, [user, loadProfile])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return
    setSaving(true)
    setFeedback(null)

    const fullName = data.full_name.trim().replace(/\s+/g, ' ')
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setFeedback({
        type: 'error',
        message: t.settings.saveError,
      })
      return
    }

    reset({ full_name: fullName })
    setFeedback({ type: 'success', message: t.settings.profileSaved })
  }

  if (loading || (user && profileLoading)) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-5 w-72" />
        </div>
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
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{t.settings.title}</h1>
        <p className="text-neutral-400 text-sm mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-blue-500/15 p-1.5">
              <User className="h-4 w-4 text-blue-400" />
            </div>
            <CardTitle className="text-base sm:text-lg">{t.settings.profile}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="email" className="text-neutral-300">{t.settings.email}</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-neutral-800/50 mt-1.5"
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                {t.settings.emailHint}
              </p>
            </div>

            <div>
              <Label htmlFor="full_name" className="text-neutral-300">
                {t.settings.fullName}
              </Label>
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder={t.settings.fullNamePlaceholder}
                disabled={saving}
                className="mt-1.5"
                {...register('full_name')}
              />
              {errors.full_name ? (
                <p className="text-xs text-red-500 mt-1.5">
                  {errors.full_name.message}
                </p>
              ) : (
                <p className="text-xs text-neutral-500 mt-1.5">
                  {t.settings.fullNameHint}
                </p>
              )}
            </div>

            {feedback && (
              <div
                className={
                  feedback.type === 'success'
                    ? 'rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400'
                    : 'rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400'
                }
              >
                {feedback.message}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={saving || !isDirty}>
                {saving ? t.common.saving : t.common.saveChanges}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-orange-500/15 p-1.5">
              <Coins className="h-4 w-4 text-orange-400" />
            </div>
            <CardTitle className="text-base sm:text-lg">{t.settings.preferences}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <div>
            <Label htmlFor="language" className="text-neutral-300 flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-neutral-400" />
              {t.settings.language}
            </Label>
            <select
              id="language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as (typeof SUPPORTED_LOCALES)[number])}
              className="flex h-10 w-full rounded-md border border-input bg-neutral-800/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
            >
              {SUPPORTED_LOCALES.map((code) => (
                <option key={code} value={code}>
                  {t.languages[code]}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1.5">
              {t.settings.languageHint}
            </p>
          </div>

          <div>
            <Label htmlFor="currency" className="text-neutral-300">{t.settings.defaultCurrency}</Label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-neutral-800/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
            >
              {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {t.currencies[code]}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500 mt-1.5">
              {t.settings.currencyHint}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-red-500/20">
        <CardHeader className="px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-red-500/15 p-1.5">
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </div>
            <CardTitle className="text-base sm:text-lg text-red-400">{t.settings.dangerZone}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <p className="text-sm text-neutral-400 mb-4">
            {t.settings.dangerZoneDesc}
          </p>
          <Button variant="destructive" disabled>
            {t.settings.deleteAccount}
          </Button>
          <p className="text-xs text-neutral-500 mt-2">
            {t.common.inDevelopment}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
