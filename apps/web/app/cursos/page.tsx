'use client'

import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Plus,Search,Users,BookOpen,AlertTriangle,Accessibility,CheckCircle2} from 'lucide-react'

type Course={id:number;name:string;students:number;progress:number;oa:number;groups:{name:string;detail:string;students:number}[]}

const initialCourses:Course[]=[
 {id:1,name:'3.º Básico A',students:34,progress:82,oa:18,groups:[{name:'Avance autónomo',detail:'Profundización y producción',students:12},{name:'Avance con apoyo',detail:'Modelamiento y pistas',students:15},{name:'Apoyo intensivo',detail:'Lectura mediada e imágenes',students:7}]},
 {id:2,name:'5.º Básico',students:36,progress:76,oa:14,groups:[{name:'Avance autónomo',detail:'Resolución de desafíos',students:14},{name:'Avance con apoyo',detail:'Guías paso a paso',students:16},{name:'Apoyo intensivo',detail:'Material concreto y mediación',students:6}]},
 {id:3,name:'Grupo PIE',students:12,progress:88,oa:22,groups:[{name:'Apoyo transitorio',detail:'Estrategias focalizadas',students:5},{name:'Apoyo permanente',detail:'Adecuaciones y seguimiento',students:7}]}
]

export default function Cursos(){
 const[courses,setCourses]=useState<Course[]>(initialCourses)
 const[selectedId,setSelectedId]=useState(1)
 const[search,setSearch]=useState('')
 const[showCreate,setShowCreate]=useState(false)
 const[newName,setNewName]=useState('')
 const[newStudents,setNewStudents]=useState('30')
 const[selected,setSelected]=useMemo(()=>[courses.find(c=>c.id===selectedId),courses,selectedId],[courses,selectedId])
 const filtered=courses.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()))
 const createCourse=()=>{const name=newName.trim();if(!name)return;const next:Course={id:Date.now(),name,students:Math.max(1,Number(newStudents)||1),progress:0,oa:0,groups:[{name:'Avance autónomo',detail:'Profundización y producción',students:0},{name:'Avance con apoyo',detail:'Modelamiento y pistas',students:0},{name:'Apoyo intensivo',detail:'Mediación y apoyos visuales',students:0}]};setCourses(v=>[...v,next]);setSelectedId(next.id);setNewName('');setNewStudents('30');setShowCreate(false)}
 const adjustGroup=(index:number,delta:number)=>{setCourses(list=>list.map(course=>course.id!==selectedId?course:{...course,groups:course.groups.map((g,i)=>i===index?{...g,students:Math.max(0,g.students+delta)}:g)}))}
 return <AppShell active="Cursos y grupos"><div className="page-head"><div><h1>Cursos y grupos</h1><p>Organiza estudiantes, apoyos, OA y grupos flexibles desde un solo lugar.</p></div><div className="course-toolbar"><div className="search premium-search" style={{display:'flex'}}><Search size={17}/><input aria-label="Buscar curso" placeholder="Buscar curso..." value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="btn btn-primary" onClick={()=>setShowCreate(v=>!v)}><Plus size={17}/> Crear curso</button></div></div>
 {showCreate&&<section className="panel course-create-panel"><div className="course-create-grid"><label>Nombre del curso<input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Ej.: 4.º Básico B"/></label><label>Estudiantes<input type="number" min="1" value={newStudents} onChange={e=>setNewStudents(e.target.value)}/></label><label>Año escolar<select><option>2026</option><option>2027</option></select></label><button className="btn btn-primary" onClick={createCourse}>Guardar curso</button></div></section>}
 <section className="course-grid">{filtered.map(course=><article key={course.id} className={`premium-card course-card ${course.id===selectedId?'active':''}`} onClick={()=>setSelectedId(course.id)}><div className="course-card-head"><div><h3>{course.name}</h3><span>{course.students} estudiantes</span></div><span className="course-status">Activo</span></div><div className="course-progress"><i style={{width:`${course.progress}%`}}/></div><div className="course-card-meta"><div><b>{course.progress}%</b><span>progreso</span></div><div><b>{course.oa}</b><span>OA con evidencia</span></div><div><b>{course.groups.length}</b><span>grupos flexibles</span></div></div></article>)}</section>
 {!filtered.length&&<div className="panel course-empty">No se encontraron cursos con ese nombre.</div>}
 {selected&&<section className="course-workspace"><div className="premium-card course-section"><div className="course-section-head"><div><h2>Grupos de {selected.name}</h2><small>Ajusta la cantidad de estudiantes según necesidad de apoyo.</small></div><Users size={24}/></div><div className="group-list">{selected.groups.map((group,index)=><article className="group-card" key={group.name}><div className="group-icon"><Users size={21}/></div><div><h3>{group.name}</h3><p>{group.detail}</p></div><div className="group-controls"><button aria-label={`Quitar estudiante de ${group.name}`} onClick={()=>adjustGroup(index,-1)}>−</button><b>{group.students}</b><button aria-label={`Agregar estudiante a ${group.name}`} onClick={()=>adjustGroup(index,1)}>+</button></div></article>)}</div><div className="course-footer-actions"><button className="btn btn-soft"><BookOpen size={17}/> Asignar recurso</button><button className="btn btn-soft"><Plus size={17}/> Crear grupo</button></div></div><aside className="premium-card course-section"><div className="course-section-head"><div><h2>Alertas pedagógicas</h2><small>Priorizadas para la planificación.</small></div></div><div className="course-alerts"><div className="course-alert warning"><AlertTriangle size={20}/><div><h4>OA con bajo avance</h4><p>5 estudiantes requieren reforzamiento focalizado en comprensión lectora.</p></div></div><div className="course-alert info"><Accessibility size={20}/><div><h4>Accesibilidad</h4><p>2 recursos necesitan versión ampliada y mayor contraste.</p></div></div><div className="course-alert success"><CheckCircle2 size={20}/><div><h4>Seguimiento al día</h4><p>Las evidencias de esta semana están registradas en un 92%.</p></div></div></div></aside></section>}
 </AppShell>
}
