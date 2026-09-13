export type EvidenceActionState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export const initialEvidenceActionState: EvidenceActionState = { status: 'idle', message: '' }
