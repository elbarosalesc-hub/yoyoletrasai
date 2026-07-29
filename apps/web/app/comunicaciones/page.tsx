import {MessageCircleMore} from 'lucide-react'
import {PlatformModulePage} from '@/components/v2/PlatformModulePage'

export default function Comunicaciones(){
  return <PlatformModulePage active="Comunicaciones" eyebrow="Vínculo institucional" title="Comunicaciones y seguimiento" description="Organiza mensajes, acuerdos, entrevistas, avisos y registros de comunicación con equipos y familias." icon={MessageCircleMore} actionLabel="Nueva comunicación" stats={[{value:'14',label:'mensajes pendientes'},{value:'6',label:'entrevistas agendadas'},{value:'9',label:'acuerdos activos'},{value:'96%',label:'familias contactadas'}]} cards={[{title:'Recordatorio de materiales',description:'Mensaje para familias de 3.º básico sobre materiales de la próxima actividad.',meta:'Programado para hoy · 17:00',status:'Programado'},{title:'Entrevista de seguimiento',description:'Revisión de avances, apoyos y acuerdos con familia y equipo PIE.',meta:'Mañana · 15:30',status:'Confirmado'},{title:'Síntesis de consejo',description:'Comunicación interna con acuerdos pedagógicos y responsables.',meta:'Actualizado ayer',status:'En revisión'}]}/>
}
