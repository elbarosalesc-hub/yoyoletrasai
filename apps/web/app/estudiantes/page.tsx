import {AlertCircle,ArrowUpRight,BookOpen,CheckCircle2,Filter,Search,ShieldCheck,TrendingUp,UserPlus,Users} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'
import {getStudentsOverview} from '@/lib/student-data'

function status(progress:number){
 if(progress>=70)return {label:'Avance esperado',tone:'good'}
 if(progress>=50)return {label:'En progreso',tone:'mid'}
 return {label:'Requiere apoyo',tone:'attention'}
}

export default async function StudentsPage(){
 const {source,students}=await getStudentsOverview()
 const onTrack=students.filter(student=>student.progress>=70).length
 const attention=students.filter(student=>student.progress<50||student.attendance<80).length
 const average=Math.round(students.reduce((sum,student)=>sum+student.progress,0)/Math.max(students.length,1))

 return <ModuleShell active="Estudiantes">
  <section className="students-head-v2">
   <div><span className="module-eyebrow"><Users size={15}/> Seguimiento inclusivo</span><h1>Estudiantes y grupos</h1><p>Revisa avances, apoyos, asistencia y evidencias desde una sola vista pedagógica.</p></div>
   <div className="students-head-actions-v2"><span className={`module-data-badge ${source}`}><i/>{source==='supabase'?'Datos sincronizados':'Vista demostrativa'}</span><button><UserPlus/>Agregar estudiante</button></div>
  </section>

  <section className="students-stats-v2">
   <article><span className="violet"><Users/></span><div><strong>{students.length}</strong><small>estudiantes visibles</small></div></article>
   <article><span className="mint"><CheckCircle2/></span><div><strong>{onTrack}</strong><small>con avance esperado</small></div></article>
   <article><span className="blue"><TrendingUp/></span><div><strong>{average}%</strong><small>progreso promedio</small></div></article>
   <article><span className="amber"><AlertCircle/></span><div><strong>{attention}</strong><small>requieren seguimiento</small></div></article>
  </section>

  <section className="students-toolbar-v2">
   <label><Search/><input placeholder="Buscar por nombre, grupo o apoyo..."/></label>
   <button><Filter/>Filtrar</button>
   <select aria-label="Seleccionar grupo"><option>Todos los grupos</option><option>Lectura inicial</option><option>Comprensión guiada</option><option>Autonomía lectora</option></select>
  </section>

  <section className="student-card-grid-v2">
   {students.map(student=>{const studentStatus=status(student.progress);return <article className="student-card-v2" key={student.id}>
    <header><span className="student-avatar-v2">{student.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</span><div><h2>{student.name}</h2><p>{student.level} · {student.group}</p></div><em className={studentStatus.tone}>{studentStatus.label}</em></header>
    <div className="student-progress-v2"><div><span>Progreso general</span><strong>{student.progress}%</strong></div><span><i style={{width:`${student.progress}%`}}/></span></div>
    <div className="student-mini-stats-v2"><span><strong>{student.attendance}%</strong><small>asistencia</small></span><span><strong>{student.evidenceCount}</strong><small>evidencias</small></span><span><strong>{student.lastObserved}</strong><small>último registro</small></span></div>
    <div className="student-support-v2"><span><ShieldCheck/></span><div><small>{student.supportCategory}</small><p>{student.supportSummary}</p></div></div>
    <footer><a href={`/estudiantes/${student.id}`}>Abrir perfil<ArrowUpRight/></a><button><BookOpen/>Asignar recurso</button></footer>
   </article>})}
  </section>
 </ModuleShell>
}
