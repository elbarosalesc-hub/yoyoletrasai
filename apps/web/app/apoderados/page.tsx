import {UserRoundCheck} from 'lucide-react'
import {PlatformModulePage} from '@/components/v2/PlatformModulePage'

export default function Apoderados(){
  return <PlatformModulePage active="Apoderados" eyebrow="Participación familiar" title="Portal de apoderados y familias" description="Comparte avances, acuerdos, recursos y alertas relevantes con una comunicación clara y protegida." icon={UserRoundCheck} actionLabel="Invitar apoderado" stats={[{value:'31',label:'familias vinculadas'},{value:'24',label:'reportes enviados'},{value:'5',label:'entrevistas próximas'},{value:'88%',label:'participación familiar'}]} cards={[{title:'Resumen de progreso mensual',description:'Síntesis positiva de avances, apoyos y próximos objetivos.',meta:'3.º básico · Julio',status:'Listo para enviar'},{title:'Acuerdos de apoyo en casa',description:'Lectura diaria breve, rutina de materiales y refuerzo de autonomía.',meta:'Grupo de apoyo PIE',status:'Activo'},{title:'Entrevistas y compromisos',description:'Registro de acuerdos, responsables y fecha de seguimiento.',meta:'5 entrevistas próximas',status:'En curso'}]}/>
}
