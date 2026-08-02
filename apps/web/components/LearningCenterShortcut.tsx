import Link from 'next/link'
import {Sparkles} from 'lucide-react'

export function LearningCenterShortcut(){
 return <Link className="learning-center-shortcut" href="/centros-aprendizaje" aria-label="Abrir centros de aprendizaje premium"><Sparkles size={18}/><span>Centros premium</span></Link>
}
