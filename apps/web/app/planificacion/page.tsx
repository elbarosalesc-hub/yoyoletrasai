import {NotebookPen} from 'lucide-react'
import {PlatformModulePage} from '@/components/v2/PlatformModulePage'

export default function Planificacion(){
  return <PlatformModulePage active="Planificación" eyebrow="Organización pedagógica" title="Planificación curricular y diversificada" description="Organiza objetivos, experiencias, apoyos DUA, recursos y evidencias por curso y periodo." icon={NotebookPen} actionLabel="Nueva planificación" stats={[{value:'12',label:'planificaciones activas'},{value:'8',label:'OA en seguimiento'},{value:'5',label:'adaptaciones PIE'},{value:'92%',label:'avance del mes'}]} cards={[{title:'Lenguaje · 3.º básico',description:'Comprensión de narraciones, secuencia de hechos e inferencias sencillas.',meta:'Semana del 27 al 31 de julio',progress:82,status:'En curso'},{title:'Matemática · 5.º básico',description:'Multiplicación, división y resolución de problemas rutinarios.',meta:'Semana del 3 al 7 de agosto',progress:58,status:'Borrador'},{title:'Plan de apoyo PIE',description:'Lectura guiada, apoyos visuales y fortalecimiento de autonomía.',meta:'Actualizado hoy',progress:76,status:'En curso'}]}/>
}
