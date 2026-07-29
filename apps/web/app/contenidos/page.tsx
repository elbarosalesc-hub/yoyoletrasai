import {BookOpen,CheckCircle2,ChevronRight,Layers3,Sparkles,Target} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

const units=[
 {title:'Comprensión lectora',level:'3.º básico',progress:72,lessons:8,icon:'📚',items:['Idea principal','Secuencia de hechos','Inferencias sencillas']},
 {title:'Números y operaciones',level:'3.º básico',progress:64,lessons:10,icon:'🔢',items:['Valor posicional','Adición y sustracción','Resolución de problemas']},
 {title:'Cuerpo humano',level:'5.º básico',progress:48,lessons:6,icon:'🫀',items:['Sistemas del cuerpo','Hábitos saludables','Cuidado del organismo']}
]

export default function Contenidos(){
 return <ModuleShell active="Contenidos">
  <section className="content-hub-head"><div><span className="module-eyebrow"><Sparkles size={15}/> Secuencias curriculares completas</span><h1>Contenidos y rutas de aprendizaje</h1><p>Organiza objetivos, lecciones, recursos, juegos, evaluaciones y apoyos dentro de una misma secuencia.</p></div><a href="/crear"><Layers3/>Crear unidad</a></section>
  <section className="content-hub-grid">{units.map(unit=><article key={unit.title}><div className="content-unit-cover"><span>{unit.icon}</span><em>{unit.level}</em></div><div className="content-unit-body"><div><small>UNIDAD CURRICULAR</small><h2>{unit.title}</h2><p>{unit.lessons} lecciones · recursos editables · seguimiento</p></div><ul>{unit.items.map(item=><li key={item}><CheckCircle2/>{item}</li>)}</ul><div className="content-unit-progress"><span><i style={{width:`${unit.progress}%`}}/></span><strong>{unit.progress}%</strong></div><a href="/planificacion">Abrir secuencia<ChevronRight/></a></div></article>)}</section>
  <section className="content-map"><div><span><Target/></span><div><small>ALINEACIÓN PEDAGÓGICA</small><h2>Cada contenido se conecta con OA, habilidades y evidencias</h2><p>La plataforma relaciona automáticamente recursos, evaluaciones, juegos, apoyos DUA y seguimiento por estudiante.</p></div></div><a href="/analitica">Ver mapa curricular<ChevronRight/></a></section>
 </ModuleShell>
}
