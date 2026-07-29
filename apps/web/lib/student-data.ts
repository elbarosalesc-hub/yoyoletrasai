import {createSupabaseServerClient} from './supabase/server'

export type StudentOverview={
 id:string
 name:string
 group:string
 level:string
 supportCategory:string
 supportSummary:string
 attendance:number
 progress:number
 evidenceCount:number
 lastObserved:string
}

export type ReportsSnapshot={
 source:'supabase'|'demo'
 totalStudents:number
 onTrack:number
 needsAttention:number
 pendingEvidence:number
 averageProgress:number
 averageAttendance:number
 totalEvidence:number
}

const demoStudents:StudentOverview[]=[
 {id:'1',name:'Agustina M.',group:'Lectura inicial',level:'3.º básico',supportCategory:'Apoyo lector',supportSummary:'Avanza con lectura guiada y necesita reforzar confianza en sus respuestas.',attendance:94,progress:78,evidenceCount:12,lastObserved:'Hoy'},
 {id:'2',name:'Javier R.',group:'Comprensión guiada',level:'3.º básico',supportCategory:'TEA',supportSummary:'Responde mejor con anticipación, apoyos visuales y tareas breves.',attendance:82,progress:56,evidenceCount:9,lastObserved:'Ayer'},
 {id:'3',name:'Nataly P.',group:'Lectura inicial',level:'3.º básico',supportCategory:'Discapacidad intelectual',supportSummary:'Requiere instrucciones paso a paso, menor cantidad de ítems y material concreto.',attendance:91,progress:48,evidenceCount:11,lastObserved:'Hoy'},
 {id:'4',name:'Renato A.',group:'Autonomía lectora',level:'3.º básico',supportCategory:'TEA',supportSummary:'Comprende bien textos breves y necesita apoyo para sostener la escritura.',attendance:88,progress:84,evidenceCount:14,lastObserved:'Hace 2 días'},
 {id:'5',name:'Cataleya S.',group:'Comprensión guiada',level:'3.º básico',supportCategory:'TDAH',supportSummary:'Se beneficia de bloques breves, temporizador visual y pausas planificadas.',attendance:96,progress:63,evidenceCount:10,lastObserved:'Hoy'},
 {id:'6',name:'Valentina D.',group:'Lectura inicial',level:'3.º básico',supportCategory:'Apoyo lector',supportSummary:'Muestra avances sostenidos cuando trabaja con lectura acompañada y vocabulario anticipado.',attendance:93,progress:69,evidenceCount:8,lastObserved:'Ayer'}
]

export async function getStudentsOverview(){
 const supabase=await createSupabaseServerClient()
 if(!supabase)return {source:'demo' as const,students:demoStudents}
 try{
  const {data,error}=await supabase.rpc('teacher_students_overview')
  if(error||!data)return {source:'demo' as const,students:demoStudents}
  const students=(data as Record<string,unknown>[]).map((row,index)=>({
   id:String(row.student_id??index),
   name:String(row.full_name??'Estudiante'),
   group:String(row.group_name??'Sin grupo'),
   level:String(row.level??'Sin nivel'),
   supportCategory:String(row.support_category??'Apoyo general'),
   supportSummary:String(row.support_summary??'Sin observaciones registradas'),
   attendance:Number(row.attendance_rate??100),
   progress:Number(row.progress_percent??0),
   evidenceCount:Number(row.evidence_count??0),
   lastObserved:row.last_observed_at?new Date(String(row.last_observed_at)).toLocaleDateString('es-CL'):'Sin registro'
  }))
  return {source:'supabase' as const,students}
 }catch{return {source:'demo' as const,students:demoStudents}}
}

export async function getReportsSnapshot():Promise<ReportsSnapshot>{
 const supabase=await createSupabaseServerClient()
 const demo:ReportsSnapshot={source:'demo',totalStudents:32,onTrack:22,needsAttention:6,pendingEvidence:4,averageProgress:72,averageAttendance:91,totalEvidence:184}
 if(!supabase)return demo
 try{
  const {data,error}=await supabase.rpc('teacher_reports_snapshot')
  if(error||!data)return demo
  const row=Array.isArray(data)?data[0]:data
  return {
   source:'supabase',
   totalStudents:Number(row.total_students??0),
   onTrack:Number(row.on_track??0),
   needsAttention:Number(row.needs_attention??0),
   pendingEvidence:Number(row.pending_evidence??0),
   averageProgress:Number(row.average_progress??0),
   averageAttendance:Number(row.average_attendance??0),
   totalEvidence:Number(row.total_evidence??0)
  }
 }catch{return demo}
}
