import {createSupabaseServerClient} from './supabase/server'

export type DashboardSnapshot={
 source:'supabase'|'demo'
 teacherName:string
 activeStudents:number
 totalStudents:number
 completedActivities:number
 learningMinutes:number
 achievements:number
 participation:number
 weeklyGrowth:number
 activeGroups:number
}

const demo:DashboardSnapshot={source:'demo',teacherName:'Elba',activeStudents:28,totalStudents:32,completedActivities:15,learningMinutes:155,achievements:12,participation:85,weeklyGrowth:18,activeGroups:3}

export async function getDashboardSnapshot():Promise<DashboardSnapshot>{
 const supabase=await createSupabaseServerClient()
 if(!supabase)return demo
 try{
  const {data,error}=await supabase.rpc('teacher_dashboard_snapshot')
  if(error||!data)return demo
  const row=Array.isArray(data)?data[0]:data
  return {
   source:'supabase',
   teacherName:row.teacher_name??'Elba',
   activeStudents:Number(row.active_students??28),
   totalStudents:Number(row.total_students??32),
   completedActivities:Number(row.completed_activities??15),
   learningMinutes:Number(row.learning_minutes??155),
   achievements:Number(row.achievements??12),
   participation:Number(row.participation??85),
   weeklyGrowth:Number(row.weekly_growth??18),
   activeGroups:Number(row.active_groups??3)
  }
 }catch{return demo}
}
