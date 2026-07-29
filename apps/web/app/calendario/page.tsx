import {CalendarDays} from 'lucide-react'
import {PlatformModulePage} from '@/components/v2/PlatformModulePage'

export default function Calendario(){
  return <PlatformModulePage active="Calendario" eyebrow="Agenda institucional" title="Calendario pedagógico y de seguimiento" description="Centraliza clases, evaluaciones, reuniones, apoyos PIE y fechas institucionales." icon={CalendarDays} actionLabel="Agregar evento" stats={[{value:'8',label:'eventos esta semana'},{value:'3',label:'evaluaciones próximas'},{value:'2',label:'reuniones PIE'},{value:'1',label:'alerta pendiente'}]} cards={[{title:'Lectura guiada',description:'Sesión focalizada con grupo de comprensión guiada.',meta:'Hoy · 09:15',status:'Confirmado'},{title:'Consejo de evaluación',description:'Revisión cualitativa y cuantitativa del avance del curso.',meta:'Miércoles · 16:00',status:'Próximo'},{title:'Evaluación de Lenguaje',description:'Aplicación diversificada para 3.º básico.',meta:'Viernes · 10:30',status:'Pendiente'}]}/>
}
