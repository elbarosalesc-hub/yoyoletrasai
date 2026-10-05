import { Suspense, type ReactNode } from 'react'

export default function ActivateAccountLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}
