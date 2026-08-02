'use client'

import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'
import { Search, UserPlus, Users, GraduationCap, ShieldCheck, ChevronRight } from 'lucide-react'
import { createStudent, initialStudentActionState } from './actions'

type Course = { id: string; name: string; level: string; academic_year: number }
type Enrollment = { course_id: string; enrollment_status: string; courses: { name: string; level: string } | null }
type Student = {
  id: string
  first_name: string
  last_name: string
  preferred_name: string | null
  external_reference: string | null
  status: string
  course_enrollments: Enrollment[] | null
}

export function StudentManager({ students, courses, canManage }: { students: Student[]; courses: Course[]; canManage: boolean }) {
  const [query, setQuery] = useState('')
  const [state, action, pending] = useActionState(createStudent, initialStudentActionState)

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return students
    return students.filter((student) => {
      const name = `${student.first_name} ${student.last_name} ${student.preferred_name ?? ''}`.toLowerCase()
      const course = student.course_enrollments?.map((item) => item.courses?.name ?? '').join(' ').toLowerCase() ?? ''
      return name.includes(normalized) || course.includes(normalized) || student.external_reference?.toLowerCase().includes(normalized)
    })
  }, [query, students])

  const active = students.filter((student) => student.status === 'active').length
  const enrolled = students.filter((student) => student.course_enrollments?.some((item) => item.enrollment_status === 'active')).length

  return (
    <div className="student-module">
      <section className="tracking-stats student-stats">
        <article><Users /><strong>{students.length}</strong><span>estudiantes registrados</span></article>
        <article><ShieldCheck /><strong>{active}</strong><span>fichas activas</span></article>
        <article><GraduationCap /><strong>{enrolled}</strong><span>con matrícula vigente</span></article>
        <article><UserPlus /><strong>{courses.length}</strong><span>cursos disponibles</span></article>
      </section>

      <div className="tracking-layout student-layout">
        <section className="evidence-center premium-card">
          <div className="section-title">
            <div><h2>Directorio de estudiantes</h2><p>Información institucional filtrada por organización y permisos.</p></div>
          </div>
          <label className="student-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, identificador o curso" /></label>
          <div className="student-table">
            <div className="student-table-head"><span>Estudiante</span><span>Curso</span><span>Identificador</span><span>Estado</span><span></span></div>
            {filtered.length ? filtered.map((student) => {
              const enrollment = student.course_enrollments?.find((item) => item.enrollment_status === 'active')
              return <article className="student-row" key={student.id}>
                <div className="student-identity"><span>{student.first_name[0]}{student.last_name[0]}</span><div><strong>{student.preferred_name || `${student.first_name} ${student.last_name}`}</strong>{student.preferred_name && <small>{student.first_name} {student.last_name}</small>}</div></div>
                <span>{enrollment?.courses ? `${enrollment.courses.name} · ${enrollment.courses.level}` : 'Sin matrícula activa'}</span>
                <span>{student.external_reference || 'Sin asignar'}</span>
                <em className={`student-status status-${student.status}`}>{student.status === 'active' ? 'Activo' : 'Inactivo'}</em>
                <Link href={`/seguimiento/${student.id}`} className="student-open-link" aria-label={`Abrir ficha de ${student.first_name} ${student.last_name}`}>Ver ficha <ChevronRight size={15} /></Link>
              </article>
            }) : <div className="command-empty"><Users /><strong>No hay resultados</strong><span>Ajusta la búsqueda o crea una nueva ficha.</span></div>}
          </div>
        </section>

        <aside className="tracking-side">
          {canManage ? (
            <form action={action} className="premium-card evidence-form student-form">
              <div><span className="eyebrow">Nueva ficha</span><h2>Agregar estudiante</h2><p>Los antecedentes PIE y DUA se gestionan por separado y con permisos restringidos.</p></div>
              <div className="form-two"><label>Nombres<input name="firstName" required maxLength={80} /></label><label>Apellidos<input name="lastName" required maxLength={120} /></label></div>
              <label>Nombre preferido<input name="preferredName" maxLength={120} placeholder="Opcional" /></label>
              <div className="form-two"><label>Identificador interno<input name="externalReference" maxLength={60} placeholder="RUT, matrícula u otro" /></label><label>Fecha de nacimiento<input name="birthDate" type="date" /></label></div>
              <label>Curso inicial<select name="courseId" defaultValue=""><option value="">Sin matrícula por ahora</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.name} · {course.level} · {course.academic_year}</option>)}</select></label>
              <button className="btn btn-primary" disabled={pending}><UserPlus size={17} />{pending ? 'Guardando…' : 'Crear estudiante'}</button>
              {state.message && <p className={`save-status ${state.status}`}>{state.message}</p>}
            </form>
          ) : (
            <section className="premium-card evidence-form student-form">
              <ShieldCheck size={28} />
              <div><span className="eyebrow">Acceso protegido</span><h2>Consulta institucional</h2><p>Tu rol no permite crear fichas ni matrículas. Los datos visibles continúan filtrados por organización.</p></div>
            </section>
          )}
        </aside>
      </div>
    </div>
  )
}
