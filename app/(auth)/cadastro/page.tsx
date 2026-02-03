import { SignupForm } from '@/components/auth/signup-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cadastro - Finance Tracker',
  description: 'Crie sua conta gratuita',
}

export default function SignupPage() {
  return <SignupForm />
}
