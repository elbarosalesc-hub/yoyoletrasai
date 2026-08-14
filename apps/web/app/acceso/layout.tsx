import Link from 'next/link'
import { Chrome } from 'lucide-react'

export default function AccessLayout({children}:{children:React.ReactNode}){
  return <>
    {children}
    <Link href="/auth/google?next=/app" aria-label="Continuar con Google" style={{position:'fixed',right:18,bottom:18,zIndex:60,display:'inline-flex',alignItems:'center',justifyContent:'center',gap:9,minHeight:48,padding:'0 18px',borderRadius:15,background:'#fff',border:'1px solid #dfe3ec',boxShadow:'0 12px 38px #17203324',color:'#263249',fontWeight:850,textDecoration:'none'}}>
      <Chrome size={19}/> Continuar con Google
    </Link>
  </>
}