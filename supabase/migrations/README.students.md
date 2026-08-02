# Modelo estudiantil

La migración `20260802191900_add_students_enrollments_and_support_profiles.sql` incorpora:

- `students`: identidad académica básica por institución.
- `course_enrollments`: matrícula por curso con estado y fechas.
- `student_support_profiles`: apoyos PIE/DUA separados de la ficha general.

Todas las tablas tienen RLS activa, acceso anónimo revocado e índices para filtros institucionales.
