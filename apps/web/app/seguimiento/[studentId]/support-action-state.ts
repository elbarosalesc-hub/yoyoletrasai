export type SupportActionState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export const initialSupportActionState: SupportActionState = { status: 'idle', message: '' }
