export type StudentActionState = {
  status: 'idle' | 'success' | 'warning' | 'error'
  message: string
}

export const initialStudentActionState: StudentActionState = { status: 'idle', message: '' }
