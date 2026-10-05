import { Suspense, type ReactNode } from 'react'

export default function AccessLayout({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>
}
