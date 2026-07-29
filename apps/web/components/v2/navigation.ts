import type {LucideIcon} from 'lucide-react'
import {
  BarChart3,
  Bell,
  Bot,
  BookOpen,
  BookOpenCheck,
  Boxes,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  FileClock,
  FileText,
  FolderKanban,
  Gamepad2,
  GraduationCap,
  Home,
  Images,
  KeyRound,
  Library,
  MessageCircleMore,
  NotebookPen,
  Presentation,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  UniversalAccess,
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
      {label:'Tareas',icon:ClipboardCheck,href:'/tareas'},
      {label:'Evaluaciones',icon:BookOpenCheck,href:'/evaluaciones'},
      {label:'Portafolios',icon:FolderKanban,href:'/portafolios'},
      {label:'Recursos PIE',icon:UniversalAccess,href:'/recursos-pie'}
    ]
  },
  {
    label:'Experiencias',
    items:[
      {label:'Juegos 3D',icon:Gamepad2,href:'/juegos'},
      {label:'Estudio inmersivo',icon:Boxes,href:'/estudio-inmersivo'},
      {label:'Profesor virtual',icon:Presentation,href:'/profesor-virtual'},
      {label:'Audio y narración',icon:Volume2,href:'/audio'},
      {label:'Banco multimedia',icon:Images,href:'/multimedia'},
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
      {label:'Apoderados',icon:UserRoundCheck,href:'/apoderados'},
      {label:'Notificaciones',icon:Bell,href:'/notificaciones'}
    ]
  },
  {
    label:'Sistema',
    items:[
      {label:'Usuarios y roles',icon:ShieldCheck,href:'/usuarios'},
      {label:'Permisos',icon:KeyRound,href:'/permisos'},
      {label:'Auditoría',icon:FileClock,href:'/auditoria'},
      {label:'Configuración',icon:Settings,href:'/configuracion'}
    ]
  }
]

export const primaryMobileNavigation:NavigationItem[]=[
  {label:'Inicio',icon:Home,href:'/app'},
  {label:'Biblioteca',icon:Library,href:'/biblioteca'},
  {label:'Crear',icon:Sparkles,href:'/crear'},
  {label:'YOYO',icon:Bot,href:'/yoyo'},
  {label:'Más',icon:ClipboardList,href:'/cursos'}
]
