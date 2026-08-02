'use server'

import { revalidatePath } from 'next/cache'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export type AssessmentQuestion = {
  id: string
  prompt: string
  type: 'Selección múltiple' | 'Desarrollo' | 'Respuesta oral'
  points: number
  options?: string[]
}

export type AssessmentRubric = {
  id: string
  title: string
  description: string
  points: number
}

export type AssessmentDraftInput = {
  id?: string
  title: string
  level: string
  variant: string
  status: 'draft' | 'published'
  questions: AssessmentQuestion[]
  rubric: AssessmentRubric[]
}

type SaveAssessmentResult =
  | { ok: true; id: string; updatedAt: string }
  | { ok: false; error: string }

export async function saveAssessment(input: AssessmentDraftInput): Promise<SaveAssessmentResult> {
  const context = await requireOrganizationContext('/evaluaciones')
  const title = input.title.trim()

  if (!title) return { ok: false, error: 'Debes escribir un título.' }
  if (!input.questions.length) return { ok: false, error: 'La evaluación debe incluir al menos una pregunta.' }

  const totalPoints = input.questions.reduce((sum, question) => sum + Math.max(0, question.points), 0)
  const description = JSON.stringify({
    schemaVersion: 1,
    level: input.level,
    variant: input.variant,
    questions: input.questions,
    rubric: input.rubric,
  })

  const payload = {
    organization_id: context.organization.id,
    title,
    assessment_type: input.variant,
    description,
    status: input.status,
    total_points: totalPoints,
    created_by: context.userId,
    updated_at: new Date().toISOString(),
  }

  const supabase = context.supabase as any
  const query = input.id
    ? supabase.from('assessments').update(payload).eq('id', input.id).eq('organization_id', context.organization.id)
    : supabase.from('assessments').insert(payload)

  const { data, error } = await query.select('id, updated_at').single()
  if (error || !data?.id || !data?.updated_at) {
    return { ok: false, error: 'No fue posible guardar la evaluación.' }
  }

  revalidatePath('/evaluaciones')
  revalidatePath('/app')

  return { ok: true, id: String(data.id), updatedAt: String(data.updated_at) }
}
