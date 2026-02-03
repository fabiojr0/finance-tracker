import { LoginForm } from '@/components/auth/login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Finance Tracker',
  description: 'Faça login na sua conta',
}

export default function LoginPage() {
  return <LoginForm />
}
