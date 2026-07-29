import {BarChart3} from 'lucide-react'
import {PlatformModulePage} from '@/components/v2/PlatformModulePage'

export default function Analitica(){
  return <PlatformModulePage active="Analítica" eyebrow="Inteligencia pedagógica" title="Analítica de aprendizaje" description="Visualiza tendencias, brechas, participación, evidencias y evolución por curso, grupo y habilidad." icon={BarChart3} actionLabel="Generar análisis" stats={[{value:'84%',label:'participación media'},{value:'+18%',label:'avance semanal'},{value:'7',label:'alertas detectadas'},{value:'126',label:'evidencias registradas'}]} cards={[{title:'Comprensión lectora',description:'Mejora sostenida en información explícita; inferencias aún requieren apoyo.',meta:'3.º básico · Lenguaje',progress:72,status:'Atención'},{title:'Operatorias básicas',description:'Progreso favorable en multiplicación; división necesita reforzamiento.',meta:'5.º básico · Matemática',progress:64,status:'En seguimiento'},{title:'Autonomía y participación',description:'Mayor iniciativa en actividades estructuradas y visuales.',meta:'Curso general',progress:81,status:'Favorable'}]}/>
}
