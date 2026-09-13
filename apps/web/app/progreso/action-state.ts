export type ProgressActionState = { status: 'idle' | 'success' | 'error'; message: string }

export const initialProgressState: ProgressActionState = { status: 'idle', message: '' }
