import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('ai_reports')
    .select('id, start_date, end_date, period_label, custom_prompt, report, summary, created_at')
    .eq('user_id', user.id)
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: 'Relatório não encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const { error } = await supabase
    .from('ai_reports')
    .delete()
    .eq('user_id', user.id)
    .eq('id', id)

  if (error) {
    console.error('AI report delete error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir relatório' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
