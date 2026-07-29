import type {LucideIcon} from 'lucide-react'
import {
  BarChart3,
  Bot,
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  FileText,
  Gamepad2,
  GraduationCap,
  Home,
  Library,
  MessageCircleMore,
  NotebookPen,
  Presentation,
  Settings,
  Sparkles,
  Trophy,
  UserRoundCheck,
  Users,
  Volume2
} from 'lucide-react'

export type NavigationItem={label:string;icon:LucideIcon;href:string}
export type NavigationGroup={label:string;items:NavigationItem[]}

export const navigationGroups:NavigationGroup[]=[
  {
    label:'Principal',
    items:[
      {label:'Inicio',icon:Home,href:'/app'},
      {label:'Biblioteca',icon:Library,href:'/biblioteca'},
      {label:'Crear',icon:Sparkles,href:'/crear'},
      {label:'YOYO',icon:Bot,href:'/yoyo'}
    ]
  },
  {
    label:'Aula',
    items:[
      {label:'Cursos y grupos',icon:GraduationCap,href:'/cursos'},
      {label:'Estudiantes',icon:Users,href:'/estudiantes'},
      {label:'Contenidos',icon:BookOpen,href:'/contenidos'},
      {label:'Planificación',icon:NotebookPen,href:'/planificacion'},
      {label:'Evaluaciones',icon:BookOpenCheck,href:'/evaluaciones'},
      {label:'Juegos 3D',icon:Gamepad2,href:'/juegos'},
      {label:'Profesor virtual',icon:Presentation,href:'/profesor-virtual'},
      {label:'Audio y narración',icon:Volume2,href:'/audio'},
      {label:'Gamificación',icon:Trophy,href:'/gamificacion'}
    ]
  },
  {
    label:'Seguimiento',
    items:[
      {label:'Calendario',icon:CalendarDays,href:'/calendario'},
      {label:'Informes',icon:FileText,href:'/informes'},
      {label:'Analítica',icon:BarChart3,href:'/analitica'},
      {label:'Comunicaciones',icon:MessageCircleMore,href:'/comunicaciones'},
      {label:'Apoderados',icon:UserRoundCheck,href:'/apoderados'}
    ]
  },
  {
    label:'Sistema',
    items:[{label:'Configuración',icon:Settings,href:'/configuracion'}]
  }
]

export const primaryMobileNavigation:NavigationItem[]=[
  {label:'Inicio',icon:Home,href:'/app'},
  {label:'Biblioteca',icon:Library,href:'/biblioteca'},
  {label:'Crear',icon:Sparkles,href:'/crear'},
  {label:'YOYO',icon:Bot,href:'/yoyo'},
  {label:'Más',icon:ClipboardList,href:'/cursos'}
]
