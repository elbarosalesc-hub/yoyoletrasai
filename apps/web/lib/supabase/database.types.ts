export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_entitlements: {
        Row: {
          assigned_by: string | null
          created_at: string
          credential_id: string
          organization_id: string
          period_end: string
          period_start: string
          plan_id: string
          quota_overrides: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          credential_id?: string
          organization_id: string
          period_end?: string
          period_start?: string
          plan_id: string
          quota_overrides?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          credential_id?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          plan_id?: string
          quota_overrides?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_entitlements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_entitlements_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "ai_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_eval_cases: {
        Row: {
          case_key: string
          category: string
          created_at: string
          description: string | null
          expected_criteria: Json
          id: string
          input_payload: Json
          is_active: boolean
          organization_id: string
          title: string
          updated_at: string
          weight: number
        }
        Insert: {
          case_key: string
          category: string
          created_at?: string
          description?: string | null
          expected_criteria: Json
          id?: string
          input_payload: Json
          is_active?: boolean
          organization_id: string
          title: string
          updated_at?: string
          weight?: number
        }
        Update: {
          case_key?: string
          category?: string
          created_at?: string
          description?: string | null
          expected_criteria?: Json
          id?: string
          input_payload?: Json
          is_active?: boolean
          organization_id?: string
          title?: string
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "ai_eval_cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_eval_runs: {
        Row: {
          case_id: string
          completed_at: string | null
          created_at: string
          criteria_scores: Json
          generation_id: string | null
          id: string
          input_tokens: number | null
          latency_ms: number | null
          model_route: string
          notes: string | null
          organization_id: string
          output_tokens: number | null
          prompt_version: string
          score: number | null
          status: string
          total_tokens: number | null
        }
        Insert: {
          case_id: string
          completed_at?: string | null
          created_at?: string
          criteria_scores?: Json
          generation_id?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_route: string
          notes?: string | null
          organization_id: string
          output_tokens?: number | null
          prompt_version: string
          score?: number | null
          status?: string
          total_tokens?: number | null
        }
        Update: {
          case_id?: string
          completed_at?: string | null
          created_at?: string
          criteria_scores?: Json
          generation_id?: string | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          model_route?: string
          notes?: string | null
          organization_id?: string
          output_tokens?: number | null
          prompt_version?: string
          score?: number | null
          status?: string
          total_tokens?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_eval_runs_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "ai_eval_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_eval_runs_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "ai_generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_eval_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_generations: {
        Row: {
          cache_source: string
          completed_at: string | null
          created_at: string
          created_by: string
          error_message: string | null
          estimated_cost_micros: number
          generation_key: string
          id: string
          input_payload: Json
          last_requested_at: string
          model: string
          organization_id: string
          output_payload: Json | null
          parent_generation_id: string | null
          progression_step: number
          prompt_version: string
          provider_metadata: Json | null
          request_count: number
          status: string
          token_usage: Json | null
        }
        Insert: {
          cache_source?: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          error_message?: string | null
          estimated_cost_micros?: number
          generation_key: string
          id?: string
          input_payload?: Json
          last_requested_at?: string
          model: string
          organization_id: string
          output_payload?: Json | null
          parent_generation_id?: string | null
          progression_step?: number
          prompt_version?: string
          provider_metadata?: Json | null
          request_count?: number
          status?: string
          token_usage?: Json | null
        }
        Update: {
          cache_source?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          error_message?: string | null
          estimated_cost_micros?: number
          generation_key?: string
          id?: string
          input_payload?: Json
          last_requested_at?: string
          model?: string
          organization_id?: string
          output_payload?: Json | null
          parent_generation_id?: string | null
          progression_step?: number
          prompt_version?: string
          provider_metadata?: Json | null
          request_count?: number
          status?: string
          token_usage?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_generations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_generations_parent_generation_id_fkey"
            columns: ["parent_generation_id"]
            isOneToOne: false
            referencedRelation: "ai_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_plans: {
        Row: {
          active: boolean
          allowed_modes: string[]
          created_at: string
          description: string
          id: string
          is_public: boolean
          max_file_bytes: number
          max_files_per_request: number
          max_output_tokens: number
          max_total_file_bytes: number
          model_tier: string
          monthly_ai_requests: number
          monthly_research_requests: number
          monthly_token_limit: number
          name: string
          rank: number
          unlimited_file_analysis: boolean
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_modes?: string[]
          created_at?: string
          description: string
          id: string
          is_public?: boolean
          max_file_bytes?: number
          max_files_per_request?: number
          max_output_tokens?: number
          max_total_file_bytes?: number
          model_tier: string
          monthly_ai_requests: number
          monthly_research_requests: number
          monthly_token_limit?: number
          name: string
          rank: number
          unlimited_file_analysis?: boolean
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_modes?: string[]
          created_at?: string
          description?: string
          id?: string
          is_public?: boolean
          max_file_bytes?: number
          max_files_per_request?: number
          max_output_tokens?: number
          max_total_file_bytes?: number
          model_tier?: string
          monthly_ai_requests?: number
          monthly_research_requests?: number
          monthly_token_limit?: number
          name?: string
          rank?: number
          unlimited_file_analysis?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ai_source_files: {
        Row: {
          actual_bytes: number | null
          checksum_crc32c: string | null
          created_at: string
          error_message: string | null
          expected_bytes: number
          file_name: string
          generation: string | null
          id: string
          media_type: string
          object_path: string
          organization_id: string
          plan_id: string
          status: string
          storage_provider: string
          updated_at: string
          uploaded_at: string | null
          user_id: string
        }
        Insert: {
          actual_bytes?: number | null
          checksum_crc32c?: string | null
          created_at?: string
          error_message?: string | null
          expected_bytes: number
          file_name: string
          generation?: string | null
          id?: string
          media_type: string
          object_path: string
          organization_id: string
          plan_id: string
          status?: string
          storage_provider: string
          updated_at?: string
          uploaded_at?: string | null
          user_id: string
        }
        Update: {
          actual_bytes?: number | null
          checksum_crc32c?: string | null
          created_at?: string
          error_message?: string | null
          expected_bytes?: number
          file_name?: string
          generation?: string | null
          id?: string
          media_type?: string
          object_path?: string
          organization_id?: string
          plan_id?: string
          status?: string
          storage_provider?: string
          updated_at?: string
          uploaded_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_source_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_source_files_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "ai_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_events: {
        Row: {
          completed_at: string | null
          created_at: string
          credential_id: string
          error_code: string | null
          file_bytes: number
          file_count: number
          id: string
          input_tokens: number
          mode: string
          model_route: string
          organization_id: string
          output_tokens: number
          plan_id: string
          reserved_tokens: number
          status: string
          token_usage: Json
          total_tokens: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credential_id: string
          error_code?: string | null
          file_bytes?: number
          file_count?: number
          id?: string
          input_tokens?: number
          mode: string
          model_route?: string
          organization_id: string
          output_tokens?: number
          plan_id: string
          reserved_tokens?: number
          status?: string
          token_usage?: Json
          total_tokens?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credential_id?: string
          error_code?: string | null
          file_bytes?: number
          file_count?: number
          id?: string
          input_tokens?: number
          mode?: string
          model_route?: string
          organization_id?: string
          output_tokens?: number
          plan_id?: string
          reserved_tokens?: number
          status?: string
          token_usage?: Json
          total_tokens?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_usage_events_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "ai_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          assessment_id: string
          correct_answer: Json | null
          created_at: string
          id: string
          options: Json
          organization_id: string
          points: number
          prompt: string
          question_type: string
          sort_order: number
          support_note: string | null
          updated_at: string
        }
        Insert: {
          assessment_id: string
          correct_answer?: Json | null
          created_at?: string
          id?: string
          options?: Json
          organization_id: string
          points?: number
          prompt: string
          question_type?: string
          sort_order?: number
          support_note?: string | null
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          correct_answer?: Json | null
          created_at?: string
          id?: string
          options?: Json
          organization_id?: string
          points?: number
          prompt?: string
          question_type?: string
          sort_order?: number
          support_note?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_questions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_results: {
        Row: {
          accommodations_used: string | null
          achievement_level: string | null
          assessment_id: string
          created_at: string
          evaluated_at: string | null
          evaluated_by: string | null
          feedback: string | null
          id: string
          organization_id: string
          score: number | null
          student_id: string
          updated_at: string
        }
        Insert: {
          accommodations_used?: string | null
          achievement_level?: string | null
          assessment_id: string
          created_at?: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          feedback?: string | null
          id?: string
          organization_id: string
          score?: number | null
          student_id: string
          updated_at?: string
        }
        Update: {
          accommodations_used?: string | null
          achievement_level?: string | null
          assessment_id?: string
          created_at?: string
          evaluated_at?: string | null
          evaluated_by?: string | null
          feedback?: string | null
          id?: string
          organization_id?: string
          score?: number | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          assessment_type: string
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          objective_id: string | null
          organization_id: string
          status: string
          title: string
          total_points: number
          updated_at: string
        }
        Insert: {
          assessment_type: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          objective_id?: string | null
          organization_id: string
          status?: string
          title: string
          total_points?: number
          updated_at?: string
        }
        Update: {
          assessment_type?: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          objective_id?: string | null
          organization_id?: string
          status?: string
          title?: string
          total_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_profiles: {
        Row: {
          auto_publish_resources: boolean
          categories: string[]
          created_at: string
          enabled: boolean
          factory_batch_size: number
          factory_running: boolean
          last_factory_at: string | null
          last_scan_at: string | null
          next_factory_at: string
          next_scan_at: string
          organization_id: string
          owner_id: string
          protected_scopes: string[]
          quality_threshold: number
          resource_factory_enabled: boolean
          scan_interval_months: number
          scan_running: boolean
          source_ids: string[]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          auto_publish_resources?: boolean
          categories?: string[]
          created_at?: string
          enabled?: boolean
          factory_batch_size?: number
          factory_running?: boolean
          last_factory_at?: string | null
          last_scan_at?: string | null
          next_factory_at?: string
          next_scan_at?: string
          organization_id: string
          owner_id: string
          protected_scopes?: string[]
          quality_threshold?: number
          resource_factory_enabled?: boolean
          scan_interval_months?: number
          scan_running?: boolean
          source_ids?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          auto_publish_resources?: boolean
          categories?: string[]
          created_at?: string
          enabled?: boolean
          factory_batch_size?: number
          factory_running?: boolean
          last_factory_at?: string | null
          last_scan_at?: string | null
          next_factory_at?: string
          next_scan_at?: string
          organization_id?: string
          owner_id?: string
          protected_scopes?: string[]
          quality_threshold?: number
          resource_factory_enabled?: boolean
          scan_interval_months?: number
          scan_running?: boolean
          source_ids?: string[]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_profiles_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_profiles_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_runtime_config: {
        Row: {
          cron_token_hash: string
          id: boolean
          updated_at: string
        }
        Insert: {
          cron_token_hash: string
          id?: boolean
          updated_at?: string
        }
        Update: {
          cron_token_hash?: string
          id?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string
          created_at: string
          created_by: string | null
          enrolled_at: string
          enrollment_status: string
          id: string
          organization_id: string
          student_id: string
          updated_at: string
          withdrawn_at: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          created_by?: string | null
          enrolled_at?: string
          enrollment_status?: string
          id?: string
          organization_id: string
          student_id: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          created_by?: string | null
          enrolled_at?: string
          enrollment_status?: string
          id?: string
          organization_id?: string
          student_id?: string
          updated_at?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          academic_year: number
          created_at: string
          id: string
          is_active: boolean
          level: string
          name: string
          organization_id: string
          teacher_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year: number
          created_at?: string
          id?: string
          is_active?: boolean
          level: string
          name: string
          organization_id: string
          teacher_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year?: number
          created_at?: string
          id?: string
          is_active?: boolean
          level?: string
          name?: string
          organization_id?: string
          teacher_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_actions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          area: string
          audit_run_id: string | null
          branch_name: string | null
          commit_sha: string | null
          created_at: string
          effort_score: number | null
          expected_impact: string | null
          finding_id: string | null
          id: string
          impact_score: number | null
          implemented_at: string | null
          organization_id: string
          priority: number
          problem: string
          pull_request_url: string | null
          recommendation: string
          risk_score: number | null
          status: string
          title: string
          updated_at: string
          validated_at: string | null
          validation: Json
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          area: string
          audit_run_id?: string | null
          branch_name?: string | null
          commit_sha?: string | null
          created_at?: string
          effort_score?: number | null
          expected_impact?: string | null
          finding_id?: string | null
          id?: string
          impact_score?: number | null
          implemented_at?: string | null
          organization_id: string
          priority?: number
          problem: string
          pull_request_url?: string | null
          recommendation: string
          risk_score?: number | null
          status?: string
          title: string
          updated_at?: string
          validated_at?: string | null
          validation?: Json
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          area?: string
          audit_run_id?: string | null
          branch_name?: string | null
          commit_sha?: string | null
          created_at?: string
          effort_score?: number | null
          expected_impact?: string | null
          finding_id?: string | null
          id?: string
          impact_score?: number | null
          implemented_at?: string | null
          organization_id?: string
          priority?: number
          problem?: string
          pull_request_url?: string | null
          recommendation?: string
          risk_score?: number | null
          status?: string
          title?: string
          updated_at?: string
          validated_at?: string | null
          validation?: Json
        }
        Relationships: [
          {
            foreignKeyName: "evolution_actions_audit_run_id_fkey"
            columns: ["audit_run_id"]
            isOneToOne: false
            referencedRelation: "evolution_audit_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolution_actions_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "innovation_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evolution_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_audit_runs: {
        Row: {
          accessibility_score: number | null
          ai_score: number | null
          benchmark_score: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          executive_summary: string | null
          games_score: number | null
          id: string
          metrics: Json
          organization_id: string
          overall_score: number | null
          platform_score: number | null
          resource_score: number | null
          scope: string
          started_at: string
          status: string
          triggered_by: string
        }
        Insert: {
          accessibility_score?: number | null
          ai_score?: number | null
          benchmark_score?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          executive_summary?: string | null
          games_score?: number | null
          id?: string
          metrics?: Json
          organization_id: string
          overall_score?: number | null
          platform_score?: number | null
          resource_score?: number | null
          scope: string
          started_at?: string
          status?: string
          triggered_by?: string
        }
        Update: {
          accessibility_score?: number | null
          ai_score?: number | null
          benchmark_score?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          executive_summary?: string | null
          games_score?: number | null
          id?: string
          metrics?: Json
          organization_id?: string
          overall_score?: number | null
          platform_score?: number | null
          resource_score?: number | null
          scope?: string
          started_at?: string
          status?: string
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "evolution_audit_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evolution_benchmarks: {
        Row: {
          capability: string
          category: string
          competitor: string
          competitor_score: number | null
          created_at: string
          evidence: string
          gap_score: number | null
          id: string
          metadata: Json
          organization_id: string
          source_name: string
          source_url: string
          status: string
          target_score: number | null
          updated_at: string
          verified_at: string
          yoyo_score: number | null
        }
        Insert: {
          capability: string
          category: string
          competitor: string
          competitor_score?: number | null
          created_at?: string
          evidence: string
          gap_score?: number | null
          id?: string
          metadata?: Json
          organization_id: string
          source_name: string
          source_url: string
          status?: string
          target_score?: number | null
          updated_at?: string
          verified_at?: string
          yoyo_score?: number | null
        }
        Update: {
          capability?: string
          category?: string
          competitor?: string
          competitor_score?: number | null
          created_at?: string
          evidence?: string
          gap_score?: number | null
          id?: string
          metadata?: Json
          organization_id?: string
          source_name?: string
          source_url?: string
          status?: string
          target_score?: number | null
          updated_at?: string
          verified_at?: string
          yoyo_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "evolution_benchmarks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation_findings: {
        Row: {
          accessibility_score: number
          can_generate_resource: boolean
          category: string
          comparison: string
          created_at: string
          evidence: string
          expected_impact: string
          id: string
          incorporated_at: string | null
          novelty_score: number
          organization_id: string
          pedagogical_score: number
          recommendation: string
          risk_score: number
          scan_id: string
          score: number
          source_name: string
          source_url: string
          status: string
          title: string
        }
        Insert: {
          accessibility_score: number
          can_generate_resource?: boolean
          category: string
          comparison: string
          created_at?: string
          evidence: string
          expected_impact: string
          id?: string
          incorporated_at?: string | null
          novelty_score: number
          organization_id: string
          pedagogical_score: number
          recommendation: string
          risk_score: number
          scan_id: string
          score: number
          source_name: string
          source_url: string
          status?: string
          title: string
        }
        Update: {
          accessibility_score?: number
          can_generate_resource?: boolean
          category?: string
          comparison?: string
          created_at?: string
          evidence?: string
          expected_impact?: string
          id?: string
          incorporated_at?: string | null
          novelty_score?: number
          organization_id?: string
          pedagogical_score?: number
          recommendation?: string
          risk_score?: number
          scan_id?: string
          score?: number
          source_name?: string
          source_url?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "innovation_findings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_findings_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "innovation_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation_scans: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          executive_summary: string | null
          findings_count: number
          id: string
          model: string | null
          organization_id: string
          provider_response_id: string | null
          sources_available: number
          sources_checked: number
          started_at: string
          status: string
          triggered_by: string
          usage: Json
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          executive_summary?: string | null
          findings_count?: number
          id?: string
          model?: string | null
          organization_id: string
          provider_response_id?: string | null
          sources_available?: number
          sources_checked?: number
          started_at?: string
          status: string
          triggered_by: string
          usage?: Json
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          executive_summary?: string | null
          findings_count?: number
          id?: string
          model?: string | null
          organization_id?: string
          provider_response_id?: string | null
          sources_available?: number
          sources_checked?: number
          started_at?: string
          status?: string
          triggered_by?: string
          usage?: Json
        }
        Relationships: [
          {
            foreignKeyName: "innovation_scans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      innovation_source_snapshots: {
        Row: {
          category: string
          created_at: string
          error_message: string | null
          excerpt: string
          fetched_at: string
          fingerprint: string
          id: string
          last_modified: string | null
          organization_id: string
          scan_id: string | null
          source_id: string
          source_name: string
          source_url: string
          status: string
        }
        Insert: {
          category: string
          created_at?: string
          error_message?: string | null
          excerpt?: string
          fetched_at: string
          fingerprint: string
          id?: string
          last_modified?: string | null
          organization_id: string
          scan_id?: string | null
          source_id: string
          source_name: string
          source_url: string
          status: string
        }
        Update: {
          category?: string
          created_at?: string
          error_message?: string | null
          excerpt?: string
          fetched_at?: string
          fingerprint?: string
          id?: string
          last_modified?: string | null
          organization_id?: string
          scan_id?: string | null
          source_id?: string
          source_name?: string
          source_url?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "innovation_source_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "innovation_source_snapshots_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "innovation_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_evidence: {
        Row: {
          achievement_level: string
          autonomy_level: string | null
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string
          evidence_type: string
          id: string
          objective_id: string
          observed_at: string
          organization_id: string
          student_id: string
          support_used: string | null
          updated_at: string
        }
        Insert: {
          achievement_level: string
          autonomy_level?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          evidence_type: string
          id?: string
          objective_id: string
          observed_at?: string
          organization_id: string
          student_id: string
          support_used?: string | null
          updated_at?: string
        }
        Update: {
          achievement_level?: string
          autonomy_level?: string | null
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          evidence_type?: string
          id?: string
          objective_id?: string
          observed_at?: string
          organization_id?: string
          student_id?: string
          support_used?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_evidence_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_evidence_objective_id_fkey"
            columns: ["objective_id"]
            isOneToOne: false
            referencedRelation: "learning_objectives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_evidence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_evidence_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_objectives: {
        Row: {
          academic_year: number
          code: string
          course_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          organization_id: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          academic_year: number
          code: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          organization_id: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          academic_year?: number
          code?: string
          course_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_objectives_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_objectives_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_memberships: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_type: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_type?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_type?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_resources: {
        Row: {
          created_at: string
          created_by: string
          id: string
          organization_id: string
          payload: Json
          resource_key: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          organization_id: string
          payload?: Json
          resource_key: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          organization_id?: string
          payload?: Json
          resource_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_resources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_secret_store: {
        Row: {
          auth_tag: string
          ciphertext: string
          configured_by: string | null
          created_at: string
          fingerprint: string
          id: string
          iv: string
          last_four: string
          updated_at: string
        }
        Insert: {
          auth_tag: string
          ciphertext: string
          configured_by?: string | null
          created_at?: string
          fingerprint: string
          id: string
          iv: string
          last_four: string
          updated_at?: string
        }
        Update: {
          auth_tag?: string
          ciphertext?: string
          configured_by?: string | null
          created_at?: string
          fingerprint?: string
          id?: string
          iv?: string
          last_four?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: string
          organization_id: string
          settings: Json
          updated_at: string
          updated_by: string
        }
        Insert: {
          id?: string
          organization_id: string
          settings?: Json
          updated_at?: string
          updated_by: string
        }
        Update: {
          id?: string
          organization_id?: string
          settings?: Json
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          locale: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          locale?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      release_staging_chunks: {
        Row: {
          created_at: string
          part_no: number
          payload: string
          release_id: string
        }
        Insert: {
          created_at?: string
          part_no: number
          payload: string
          release_id: string
        }
        Update: {
          created_at?: string
          part_no?: number
          payload?: string
          release_id?: string
        }
        Relationships: []
      }
      resource_assignments: {
        Row: {
          course_label: string
          created_at: string
          created_by: string
          due_date: string | null
          id: string
          local_key: string
          organization_id: string
          resource_payload: Json
        }
        Insert: {
          course_label: string
          created_at?: string
          created_by: string
          due_date?: string | null
          id?: string
          local_key: string
          organization_id: string
          resource_payload?: Json
        }
        Update: {
          course_label?: string
          created_at?: string
          created_by?: string
          due_date?: string | null
          id?: string
          local_key?: string
          organization_id?: string
          resource_payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "resource_assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_candidates: {
        Row: {
          created_at: string
          created_by: string
          factory_run_id: string
          finding_id: string | null
          id: string
          model: string | null
          organization_id: string
          payload: Json
          provider_response_id: string | null
          published_resource_id: string | null
          quality_report: Json
          quality_score: number
          resource_key: string
          reviewed_at: string | null
          status: string
          title: string
          usage: Json
        }
        Insert: {
          created_at?: string
          created_by: string
          factory_run_id: string
          finding_id?: string | null
          id?: string
          model?: string | null
          organization_id: string
          payload: Json
          provider_response_id?: string | null
          published_resource_id?: string | null
          quality_report?: Json
          quality_score: number
          resource_key: string
          reviewed_at?: string | null
          status: string
          title: string
          usage?: Json
        }
        Update: {
          created_at?: string
          created_by?: string
          factory_run_id?: string
          finding_id?: string | null
          id?: string
          model?: string | null
          organization_id?: string
          payload?: Json
          provider_response_id?: string | null
          published_resource_id?: string | null
          quality_report?: Json
          quality_score?: number
          resource_key?: string
          reviewed_at?: string | null
          status?: string
          title?: string
          usage?: Json
        }
        Relationships: [
          {
            foreignKeyName: "resource_candidates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_candidates_factory_run_id_fkey"
            columns: ["factory_run_id"]
            isOneToOne: false
            referencedRelation: "resource_factory_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_candidates_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "innovation_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_candidates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_candidates_published_resource_id_fkey"
            columns: ["published_resource_id"]
            isOneToOne: false
            referencedRelation: "platform_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_factory_runs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          generated_count: number
          id: string
          organization_id: string
          published_count: number
          requested_count: number
          started_at: string
          status: string
          triggered_by: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generated_count?: number
          id?: string
          organization_id: string
          published_count?: number
          requested_count: number
          started_at?: string
          status: string
          triggered_by: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          generated_count?: number
          id?: string
          organization_id?: string
          published_count?: number
          requested_count?: number
          started_at?: string
          status?: string
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_factory_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_criteria: {
        Row: {
          assessment_id: string
          created_at: string
          description: string | null
          id: string
          max_points: number
          organization_id: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          description?: string | null
          id?: string
          max_points: number
          organization_id: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          description?: string | null
          id?: string
          max_points?: number
          organization_id?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubric_criteria_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubric_criteria_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      student_support_profiles: {
        Row: {
          access_accommodations: string | null
          assistive_technology: string | null
          barriers: string | null
          created_at: string
          created_by: string | null
          evidence_notes: string | null
          id: string
          interests: string | null
          objective_accommodations: string | null
          organization_id: string
          responsible_team: string | null
          sensitive_notes: string | null
          strengths: string | null
          student_id: string
          support_status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          access_accommodations?: string | null
          assistive_technology?: string | null
          barriers?: string | null
          created_at?: string
          created_by?: string | null
          evidence_notes?: string | null
          id?: string
          interests?: string | null
          objective_accommodations?: string | null
          organization_id: string
          responsible_team?: string | null
          sensitive_notes?: string | null
          strengths?: string | null
          student_id: string
          support_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          access_accommodations?: string | null
          assistive_technology?: string | null
          barriers?: string | null
          created_at?: string
          created_by?: string | null
          evidence_notes?: string | null
          id?: string
          interests?: string | null
          objective_accommodations?: string | null
          organization_id?: string
          responsible_team?: string | null
          sensitive_notes?: string | null
          strengths?: string | null
          student_id?: string
          support_status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_support_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_support_profiles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          birth_date: string | null
          created_at: string
          created_by: string | null
          external_reference: string | null
          first_name: string
          id: string
          last_name: string
          organization_id: string
          preferred_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          created_by?: string | null
          external_reference?: string | null
          first_name: string
          id?: string
          last_name: string
          organization_id: string
          preferred_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          created_by?: string | null
          external_reference?: string | null
          first_name?: string
          id?: string
          last_name?: string
          organization_id?: string
          preferred_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      authorize_ai_request: {
        Args: {
          p_estimated_tokens?: number
          p_file_count?: number
          p_largest_file_bytes?: number
          p_mode: string
          p_total_file_bytes?: number
        }
        Returns: Json
      }
      complete_ai_request: {
        Args: {
          p_error_code?: string
          p_event_id: string
          p_input_tokens?: number
          p_model_route?: string
          p_output_tokens?: number
          p_status: string
          p_token_usage?: Json
          p_total_tokens?: number
        }
        Returns: boolean
      }
      is_platform_admin: { Args: never; Returns: boolean }
      owner_vault_read: { Args: { p_name: string }; Returns: string }
      owner_vault_status: { Args: { p_name: string }; Returns: Json }
      owner_vault_upsert: {
        Args: { p_description?: string; p_name: string; p_secret: string }
        Returns: {
          fingerprint: string
          last_four: string
        }[]
      }
      set_ai_entitlement: {
        Args: {
          p_period_end?: string
          p_plan_id: string
          p_status?: string
          p_user_id: string
        }
        Returns: string
      }
      yoyo_release_fetch_brotli_tmp: {
        Args: { p_token: string }
        Returns: string
      }
      yoyo_release_fetch_tmp: { Args: { p_token: string }; Returns: string }
      yoyo_release_stage_tmp: {
        Args: {
          p_part_no: number
          p_payload: string
          p_release_id: string
          p_token: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "student"
        | "guardian"
        | "teacher"
        | "pie"
        | "utp"
        | "principal"
        | "institution_admin"
        | "platform_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "student",
        "guardian",
        "teacher",
        "pie",
        "utp",
        "principal",
        "institution_admin",
        "platform_admin",
      ],
    },
  },
} as const
