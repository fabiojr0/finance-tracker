import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('ai_reports')
    .select('id, start_date, end_date, period_label, custom_prompt, summary, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('AI reports list error:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar relatórios salvos' },
      { status: 500 }
    )
  }

  return NextResponse.json({ reports: data ?? [] })
}
