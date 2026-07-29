import {createServerClient} from '@supabase/ssr'
import {NextResponse,type NextRequest} from 'next/server'

const teacherRoutes=['/app','/biblioteca','/crear','/yoyo','/cursos','/estudiantes','/contenidos','/planificacion','/evaluaciones','/juegos','/profesor-virtual','/audio','/gamificacion','/calendario','/informes','/analitica','/comunicaciones','/apoderados','/notificaciones','/configuracion','/usuarios','/permisos','/auditoria']
const studentRoutes=['/estudiante']
const guardianRoutes=['/familia']

export async function proxy(request:NextRequest){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY??process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const pathname=request.nextUrl.pathname

  if(!url||!key)return NextResponse.next()

  let response=NextResponse.next({request})
  const supabase=createServerClient(url,key,{
    cookies:{
      getAll(){return request.cookies.getAll()},
      setAll(items){
        items.forEach(({name,value})=>request.cookies.set(name,value))
        response=NextResponse.next({request})
        items.forEach(({name,value,options})=>response.cookies.set(name,value,options))
      }
    }
  })

  const{data:{user}}=await supabase.auth.getUser()
  const isProtected=[...teacherRoutes,...studentRoutes,...guardianRoutes].some(route=>pathname===route||pathname.startsWith(`${route}/`))

  if(!user){
    if(isProtected){
      const target=request.nextUrl.clone();target.pathname='/login';target.searchParams.set('next',pathname)
      return NextResponse.redirect(target)
    }
    return response
  }

  const{data:profile}=await supabase.from('profiles').select('role').eq('id',user.id).maybeSingle()
  const role=profile?.role

  if(pathname==='/login'){
    const target=request.nextUrl.clone()
    target.pathname=role==='student'?'/estudiante':role==='guardian'?'/familia':'/app'
    target.search=''
    return NextResponse.redirect(target)
  }

  if(teacherRoutes.some(route=>pathname===route||pathname.startsWith(`${route}/`))&&!['admin','teacher'].includes(role??'')){
    const target=request.nextUrl.clone();target.pathname=role==='guardian'?'/familia':'/estudiante';target.search=''
    return NextResponse.redirect(target)
  }

  if(studentRoutes.some(route=>pathname===route||pathname.startsWith(`${route}/`))&&role!=='student'){
    const target=request.nextUrl.clone();target.pathname=role==='guardian'?'/familia':'/app';target.search=''
    return NextResponse.redirect(target)
  }

  if(guardianRoutes.some(route=>pathname===route||pathname.startsWith(`${route}/`))&&role!=='guardian'){
    const target=request.nextUrl.clone();target.pathname=role==='student'?'/estudiante':'/app';target.search=''
    return NextResponse.redirect(target)
  }

  return response
}

export const config={
  matcher:['/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
}
