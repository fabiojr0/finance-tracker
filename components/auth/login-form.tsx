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
import { UI_TEXT } from '@/lib/constants/ui-text'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Ocorreu um erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  // TODO: Habilitar quando o Google OAuth estiver configurado no Supabase
  // const handleGoogleLogin = async () => {
  //   setIsLoading(true)
  //   setError(null)
  //
  //   try {
  //     const supabase = createClient()
  //     const { error: oauthError } = await supabase.auth.signInWithOAuth({
  //       provider: 'google',
  //       options: {
  //         redirectTo: `${window.location.origin}/api/auth/callback`,
  //       },
  //     })
  //
  //     if (oauthError) {
  //       setError(oauthError.message)
  //     }
  //   } catch (err) {
  //     setError('Ocorreu um erro ao fazer login com Google. Tente novamente.')
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-neutral-200 mb-6">
        {UI_TEXT.auth.loginTitle}
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(onSubmit)(e)
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="email">{UI_TEXT.auth.email}</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            {...register('email')}
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">{UI_TEXT.auth.password}</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Entrando...' : UI_TEXT.auth.login}
        </Button>
      </form>

      {/* TODO: Habilitar quando o Google OAuth estiver configurado no Supabase */}
      {/* <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-neutral-900 px-3 text-neutral-400">ou</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-neutral-700 rounded-md bg-neutral-800 hover:bg-neutral-700 transition-colors text-neutral-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continuar com Google
      </button> */}

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600">
          {UI_TEXT.auth.dontHaveAccount}{' '}
          <Link
            href="/cadastro"
            className="text-primary font-medium hover:underline"
          >
            {UI_TEXT.auth.signup}
          </Link>
        </p>
      </div>
    </div>
  )
}
