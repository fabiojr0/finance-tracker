'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  usePreferences,
  SUPPORTED_LOCALES,
  SUPPORTED_CURRENCIES,
} from '@/lib/contexts/preferences-context'
import { signupSchema } from '@/lib/utils/validation'
import { ArrowLeft, Languages, Coins } from 'lucide-react'
import Link from 'next/link'

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const router = useRouter()
  const { t, locale, currency, setLocale, setCurrency } = usePreferences()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const goToPreferences = async () => {
    const valid = await trigger(['full_name', 'email', 'password', 'confirmPassword'])
    if (valid) setStep(2)
  }

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      const fullName = data.full_name.trim().replace(/\s+/g, ' ')
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
          data: {
            full_name: fullName,
            language: locale,
            currency,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch {
      setError(t.auth.signupError)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-200">
          {step === 1 ? t.auth.signupTitle : t.auth.preferencesStepTitle}
        </h2>
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className={`h-1.5 w-6 rounded-full ${step === 1 ? 'bg-primary' : 'bg-neutral-700'}`} />
          <span className={`h-1.5 w-6 rounded-full ${step === 2 ? 'bg-primary' : 'bg-neutral-700'}`} />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
          <p className="text-sm text-green-600">{t.auth.checkEmail}</p>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(onSubmit)(e)
        }}
        className="space-y-4"
      >
        {/* Step 1 — account details */}
        <div className={step === 1 ? 'space-y-4' : 'hidden'}>
          <div>
            <Label htmlFor="full_name">{t.auth.fullName}</Label>
            <Input
              id="full_name"
              type="text"
              autoComplete="name"
              placeholder={t.auth.fullNamePlaceholder}
              {...register('full_name')}
              disabled={isLoading || success}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500 mt-1">{errors.full_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              placeholder={t.auth.emailPlaceholder}
              {...register('email')}
              disabled={isLoading || success}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              {...register('password')}
              disabled={isLoading || success}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder={t.auth.passwordPlaceholder}
              {...register('confirmPassword')}
              disabled={isLoading || success}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="button" className="w-full" onClick={goToPreferences} disabled={isLoading || success}>
            {t.auth.next}
          </Button>
        </div>

        {/* Step 2 — language & currency */}
        <div className={step === 2 ? 'space-y-4' : 'hidden'}>
          <p className="text-sm text-neutral-400">{t.auth.preferencesStepSubtitle}</p>

          <div>
            <Label htmlFor="signup-language" className="flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-neutral-400" />
              {t.settings.language}
            </Label>
            <select
              id="signup-language"
              value={locale}
              onChange={(e) => setLocale(e.target.value as (typeof SUPPORTED_LOCALES)[number])}
              disabled={isLoading || success}
              className="flex h-10 w-full rounded-md border border-input bg-neutral-800/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
            >
              {SUPPORTED_LOCALES.map((code) => (
                <option key={code} value={code}>
                  {t.languages[code]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="signup-currency" className="flex items-center gap-1.5">
              <Coins className="h-3.5 w-3.5 text-neutral-400" />
              {t.settings.defaultCurrency}
            </Label>
            <select
              id="signup-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              disabled={isLoading || success}
              className="flex h-10 w-full rounded-md border border-input bg-neutral-800/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1.5"
            >
              {SUPPORTED_CURRENCIES.map((code) => (
                <option key={code} value={code}>
                  {t.currencies[code]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="gap-1.5"
              onClick={() => setStep(1)}
              disabled={isLoading || success}
            >
              <ArrowLeft className="h-4 w-4" />
              {t.common.back}
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || success}>
              {isLoading ? t.auth.signingUp : t.auth.signup}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600">
          {t.auth.alreadyHaveAccount}{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            {t.auth.login}
          </Link>
        </p>
      </div>
    </div>
  )
}
