'use client'

import { useActionState } from 'react'
import { Plus, UserRoundPlus } from 'lucide-react'
import { createStudent, initialStudentActionState } from './actions'

type CourseOption = {
  id: string
  name: string
  level: string
  academicYear: number
}

export function StudentCreateForm({ courses }: { courses: CourseOption[] }) {
  const [state, action, pending] = useActionState(createStudent, initialStudentActionState)

  return (
    <form action={action} className="student-create-form premium-card">
      <div className="student-form-heading">
        <span className="student-form-icon"><UserRoundPlus size={22} /></span>
        <div>
          <h2>Agregar estudiante</h2>
          <p>Crea una ficha institucional y, opcionalmente, matrícula al estudiante en un curso.</p>
        </div>
      </div>

      <div className="student-form-grid">
        <label>
          <span>Nombre *</span>
          <input name="firstName" required maxLength={80} autoComplete="off" />
        </label>
        <label>
          <span>Apellidos *</span>
          <input name="lastName" required maxLength={120} autoComplete="off" />
        </label>
        <label>
          <span>Nombre preferido</span>
          <input name="preferredName" maxLength={80} autoComplete="off" />
        </label>
        <label>
          <span>Identificador institucional</span>
          <input name="externalReference" maxLength={80} autoComplete="off" placeholder="Ej.: matrícula interna" />
        </label>
        <label>
          <span>Fecha de nacimiento</span>
          <input name="birthDate" type="date" />
        </label>
        <label>
          <span>Curso inicial</span>
          <select name="courseId" defaultValue="">
            <option value="">Sin matrícula por ahora</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name} · {course.level} · {course.academicYear}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="btn btn-primary student-submit" type="submit" disabled={pending}>
        <Plus size={17} /> {pending ? 'Guardando…' : 'Crear estudiante'}
      </button>

      {state.message && (
        <p className={`student-form-message ${state.status}`} role="status">
          {state.message}
        </p>
      )}
    </form>
  )
}
