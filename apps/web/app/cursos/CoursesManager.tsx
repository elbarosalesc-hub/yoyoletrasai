'use client'

import { useActionState, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Accessibility,
  AlertTriangle,
  Archive,
  BookOpen,
  CheckCircle2,
  Plus,
  Search,
  Users,
} from 'lucide-react'
import {
  archiveCourse,
  createCourse,
  initialCourseActionState,
} from './actions'

type Course = {
  id: string
  name: string
  level: string
  academic_year: number
  teacher_id: string | null
  is_active: boolean
}

type Props = {
  courses: Course[]
  canManage: boolean
  organizationName: string
}

export function CoursesManager({ courses, canManage, organizationName }: Props) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(createCourse, initialCourseActionState)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(courses[0]?.id ?? '')
  const [showCreate, setShowCreate] = useState(false)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [archiveError, setArchiveError] = useState('')
  const [isArchiving, startArchive] = useTransition()

  const filtered = useMemo(
    () => courses.filter((course) =>
      `${course.name} ${course.level} ${course.academic_year}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    ),
    [courses, search],
  )

  const selected = courses.find((course) => course.id === selectedId) ?? filtered[0] ?? null

  function handleArchive(courseId: string) {
    setArchiveError('')
    setArchivingId(courseId)
    startArchive(async () => {
      try {
        await archiveCourse(courseId)
        router.refresh()
      } catch (error) {
        setArchiveError(error instanceof Error ? error.message : 'No fue posible archivar el curso.')
      } finally {
        setArchivingId(null)
      }
    })
  }

  return (
    <>
      <div className="page-head">
        <div>
          <span className="eyebrow">{organizationName}</span>
          <h1>Cursos y grupos</h1>
          <p>Administra cursos reales, asociados a la institución activa y protegidos por permisos.</p>
        </div>
        <div className="course-toolbar">
          <div className="search premium-search" style={{ display: 'flex' }}>
            <Search size={17} />
            <input
              aria-label="Buscar curso"
              placeholder="Buscar por nombre, nivel o año..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          {canManage && (
            <button className="btn btn-primary" onClick={() => setShowCreate((value) => !value)}>
              <Plus size={17} /> Crear curso
            </button>
          )}
        </div>
      </div>

      {showCreate && canManage && (
        <section className="panel course-create-panel">
          <form action={formAction} className="course-create-grid">
            <label>
              Nombre del curso
              <input name="name" maxLength={120} required placeholder="Ej.: 4.º Básico B" />
            </label>
            <label>
              Nivel
              <input name="level" maxLength={80} required placeholder="Ej.: 4.º básico" />
            </label>
            <label>
              Año escolar
              <input name="academicYear" type="number" min="2000" max="2200" defaultValue="2026" required />
            </label>
            <button className="btn btn-primary" disabled={pending}>
              {pending ? 'Guardando…' : 'Guardar curso'}
            </button>
          </form>
          {state.message && (
            <p className={state.status === 'error' ? 'form-message error' : 'form-message success'} role="status">
              {state.message}
            </p>
          )}
        </section>
      )}

      {archiveError && <div className="panel course-empty" role="alert">{archiveError}</div>}

      <section className="course-grid">
        {filtered.map((course) => (
          <article
            key={course.id}
            className={`premium-card course-card ${course.id === selected?.id ? 'active' : ''}`}
            onClick={() => setSelectedId(course.id)}
          >
            <div className="course-card-head">
              <div>
                <h3>{course.name}</h3>
                <span>{course.level} · {course.academic_year}</span>
              </div>
              <span className="course-status">Activo</span>
            </div>
            <div className="course-progress"><i style={{ width: '12%' }} /></div>
            <div className="course-card-meta">
              <div><b>—</b><span>estudiantes</span></div>
              <div><b>0</b><span>OA con evidencia</span></div>
              <div><b>0</b><span>grupos flexibles</span></div>
            </div>
          </article>
        ))}
      </section>

      {!filtered.length && (
        <div className="panel course-empty">
          {courses.length
            ? 'No se encontraron cursos con ese criterio.'
            : 'La institución aún no tiene cursos activos.'}
        </div>
      )}

      {selected && (
        <section className="course-workspace">
          <div className="premium-card course-section">
            <div className="course-section-head">
              <div>
                <h2>{selected.name}</h2>
                <small>{selected.level} · Año escolar {selected.academic_year}</small>
              </div>
              <Users size={24} />
            </div>
            <div className="group-list">
              <article className="group-card">
                <div className="group-icon"><Users size={21} /></div>
                <div>
                  <h3>Estudiantes y grupos</h3>
                  <p>El siguiente avance incorporará matrícula, grupos flexibles y apoyos individuales.</p>
                </div>
              </article>
              <article className="group-card">
                <div className="group-icon"><BookOpen size={21} /></div>
                <div>
                  <h3>Recursos y evidencias</h3>
                  <p>El curso ya está preparado para recibir actividades, OA, evaluaciones y seguimiento.</p>
                </div>
              </article>
            </div>
            <div className="course-footer-actions">
              <button className="btn btn-soft" disabled><BookOpen size={17} /> Asignar recurso</button>
              {canManage && (
                <button
                  className="btn btn-soft"
                  disabled={isArchiving && archivingId === selected.id}
                  onClick={() => handleArchive(selected.id)}
                >
                  <Archive size={17} />
                  {isArchiving && archivingId === selected.id ? 'Archivando…' : 'Archivar curso'}
                </button>
              )}
            </div>
          </div>

          <aside className="premium-card course-section">
            <div className="course-section-head">
              <div>
                <h2>Estado del módulo</h2>
                <small>Datos provenientes de Supabase.</small>
              </div>
            </div>
            <div className="course-alerts">
              <div className="course-alert success">
                <CheckCircle2 size={20} />
                <div><h4>Curso persistente</h4><p>La información se guarda en la base institucional y respeta RLS.</p></div>
              </div>
              <div className="course-alert info">
                <Accessibility size={20} />
                <div><h4>Acceso por rol</h4><p>Solo personal autorizado puede crear o archivar cursos.</p></div>
              </div>
              <div className="course-alert warning">
                <AlertTriangle size={20} />
                <div><h4>Próximo bloque</h4><p>Falta incorporar matrícula, grupos, asignaciones y progreso real.</p></div>
              </div>
            </div>
          </aside>
        </section>
      )}
    </>
  )
}
