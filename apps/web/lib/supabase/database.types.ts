export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole =
  | 'student'
  | 'guardian'
  | 'teacher'
  | 'pie'
  | 'utp'
  | 'principal'
  | 'institution_admin'
  | 'platform_admin'

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: { id: string; name: string; slug: string; organization_type: string; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; slug: string; organization_type?: string; created_at?: string; updated_at?: string }
        Update: { id?: string; name?: string; slug?: string; organization_type?: string; created_at?: string; updated_at?: string }
        Relationships: []
      }
      profiles: {
        Row: { id: string; first_name: string | null; last_name: string | null; display_name: string | null; avatar_url: string | null; locale: string; created_at: string; updated_at: string }
        Insert: { id: string; first_name?: string | null; last_name?: string | null; display_name?: string | null; avatar_url?: string | null; locale?: string; created_at?: string; updated_at?: string }
        Update: { id?: string; first_name?: string | null; last_name?: string | null; display_name?: string | null; avatar_url?: string | null; locale?: string; created_at?: string; updated_at?: string }
        Relationships: []
      }
      organization_memberships: {
        Row: { id: string; organization_id: string; user_id: string; role: AppRole; is_active: boolean; created_at: string }
        Insert: { id?: string; organization_id: string; user_id: string; role: AppRole; is_active?: boolean; created_at?: string }
        Update: { id?: string; organization_id?: string; user_id?: string; role?: AppRole; is_active?: boolean; created_at?: string }
        Relationships: [{ foreignKeyName: 'organization_memberships_organization_id_fkey'; columns: ['organization_id']; isOneToOne: false; referencedRelation: 'organizations'; referencedColumns: ['id'] }]
      }
      courses: {
        Row: { id: string; organization_id: string; name: string; level: string; academic_year: number; teacher_id: string | null; is_active: boolean; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; name: string; level: string; academic_year: number; teacher_id?: string | null; is_active?: boolean; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; name?: string; level?: string; academic_year?: number; teacher_id?: string | null; is_active?: boolean; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: 'courses_organization_id_fkey'; columns: ['organization_id']; isOneToOne: false; referencedRelation: 'organizations'; referencedColumns: ['id'] }]
      }
      students: {
        Row: { id: string; organization_id: string; first_name: string; last_name: string; preferred_name: string | null; external_reference: string | null; birth_date: string | null; status: string; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; first_name: string; last_name: string; preferred_name?: string | null; external_reference?: string | null; birth_date?: string | null; status?: string; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; first_name?: string; last_name?: string; preferred_name?: string | null; external_reference?: string | null; birth_date?: string | null; status?: string; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: [{ foreignKeyName: 'students_organization_id_fkey'; columns: ['organization_id']; isOneToOne: false; referencedRelation: 'organizations'; referencedColumns: ['id'] }]
      }
      course_enrollments: {
        Row: { id: string; organization_id: string; course_id: string; student_id: string; enrollment_status: string; enrolled_at: string; withdrawn_at: string | null; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; course_id: string; student_id: string; enrollment_status?: string; enrolled_at?: string; withdrawn_at?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; course_id?: string; student_id?: string; enrollment_status?: string; enrolled_at?: string; withdrawn_at?: string | null; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: 'course_enrollments_organization_id_fkey'; columns: ['organization_id']; isOneToOne: false; referencedRelation: 'organizations'; referencedColumns: ['id'] },
          { foreignKeyName: 'course_enrollments_course_id_fkey'; columns: ['course_id']; isOneToOne: false; referencedRelation: 'courses'; referencedColumns: ['id'] },
          { foreignKeyName: 'course_enrollments_student_id_fkey'; columns: ['student_id']; isOneToOne: false; referencedRelation: 'students'; referencedColumns: ['id'] }
        ]
      }
      student_support_profiles: {
        Row: { id: string; organization_id: string; student_id: string; support_status: string; strengths: string | null; barriers: string | null; interests: string | null; access_accommodations: string | null; objective_accommodations: string | null; assistive_technology: string | null; responsible_team: string | null; evidence_notes: string | null; sensitive_notes: string | null; created_by: string | null; updated_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; student_id: string; support_status?: string; strengths?: string | null; barriers?: string | null; interests?: string | null; access_accommodations?: string | null; objective_accommodations?: string | null; assistive_technology?: string | null; responsible_team?: string | null; evidence_notes?: string | null; sensitive_notes?: string | null; created_by?: string | null; updated_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; student_id?: string; support_status?: string; strengths?: string | null; barriers?: string | null; interests?: string | null; access_accommodations?: string | null; objective_accommodations?: string | null; assistive_technology?: string | null; responsible_team?: string | null; evidence_notes?: string | null; sensitive_notes?: string | null; created_by?: string | null; updated_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: 'student_support_profiles_organization_id_fkey'; columns: ['organization_id']; isOneToOne: false; referencedRelation: 'organizations'; referencedColumns: ['id'] },
          { foreignKeyName: 'student_support_profiles_student_id_fkey'; columns: ['student_id']; isOneToOne: true; referencedRelation: 'students'; referencedColumns: ['id'] }
        ]
      }
      learning_objectives: {
        Row: { id: string; organization_id: string; course_id: string | null; subject: string; code: string; title: string; description: string | null; academic_year: number; is_active: boolean; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; course_id?: string | null; subject: string; code: string; title: string; description?: string | null; academic_year: number; is_active?: boolean; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; course_id?: string | null; subject?: string; code?: string; title?: string; description?: string | null; academic_year?: number; is_active?: boolean; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: 'learning_objectives_organization_id_fkey'; columns: ['organization_id']; isOneToOne: false; referencedRelation: 'organizations'; referencedColumns: ['id'] },
          { foreignKeyName: 'learning_objectives_course_id_fkey'; columns: ['course_id']; isOneToOne: false; referencedRelation: 'courses'; referencedColumns: ['id'] }
        ]
      }
      learning_evidence: {
        Row: { id: string; organization_id: string; student_id: string; course_id: string | null; objective_id: string; evidence_type: string; description: string; achievement_level: string; support_used: string | null; autonomy_level: string | null; observed_at: string; created_by: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; organization_id: string; student_id: string; course_id?: string | null; objective_id: string; evidence_type: string; description: string; achievement_level: string; support_used?: string | null; autonomy_level?: string | null; observed_at?: string; created_by?: string | null; created_at?: string; updated_at?: string }
        Update: { id?: string; organization_id?: string; student_id?: string; course_id?: string | null; objective_id?: string; evidence_type?: string; description?: string; achievement_level?: string; support_used?: string | null; autonomy_level?: string | null; observed_at?: string; created_by?: string | null; created_at?: string; updated_at?: string }
        Relationships: [
          { foreignKeyName: 'learning_evidence_organization_id_fkey'; columns: ['organization_id']; isOneToOne: false; referencedRelation: 'organizations'; referencedColumns: ['id'] },
          { foreignKeyName: 'learning_evidence_student_id_fkey'; columns: ['student_id']; isOneToOne: false; referencedRelation: 'students'; referencedColumns: ['id'] },
          { foreignKeyName: 'learning_evidence_course_id_fkey'; columns: ['course_id']; isOneToOne: false; referencedRelation: 'courses'; referencedColumns: ['id'] },
          { foreignKeyName: 'learning_evidence_objective_id_fkey'; columns: ['objective_id']; isOneToOne: false; referencedRelation: 'learning_objectives'; referencedColumns: ['id'] }
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: { app_role: AppRole }
    CompositeTypes: Record<string, never>
  }
}
