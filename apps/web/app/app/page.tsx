import Link from 'next/link'
import {ArrowRight,BookOpen,Bot,Check,ClipboardCheck,Clock3,Download,GraduationCap,Layers3,Palette,PenTool,Play,Plus,School,Sparkles,Star,Target,UsersRound,WandSparkles} from 'lucide-react'
import {AppShell} from '@/components/AppShell'
import {ActivityArtwork,ForestHeroArt} from '@/components/dashboard/DashboardIllustrations'
import {resourceCatalog} from '@/lib/resourceCatalog'
import {requireOrganizationContext} from '@/lib/auth/organization-context'

export const dynamic='force-dynamic'
const actions=[
 ['Crear una guía premium','Currículum, DUA e imágenes listas para imprimir','/crear',WandSparkles,'purple'],
 ['Adaptar para NEE','Ajusta lenguaje, apoyos y evaluación','/inclusion',UsersRound,'coral'],
 ['Planificar una clase','Objetivo, secuencia y evidencias','/planificador',ClipboardCheck,'blue'],
] as const
const collections=[
 ['Grafomotricidad','Progresión completa de trazos','/biblioteca',PenTool,'violet'],
 ['Lectura y escritura','Fluidez, comprensión y producción','/plan-lector',BookOpen,'mint'],
 ['Matemática manipulativa','Material concreto y simuladores','/simuladores',Layers3,'amber'],
 ['PIE y DUA','Apoyos editables y multinivel','/inclusion',Target,'rose'],
] as const
const kinds=['forest','writing','math','science']

export default async function Dashboard(){
 const context=await requireOrganizationContext('/app')
 const {data:courses}=await context.supabase.from('courses').select('id,is_active').eq('organization_id',context.organization.id)
 const active=(courses??[]).filter(course=>course.is_active).length
 const featured=resourceCatalog.slice(0,4)
 return <AppShell active="Inicio"><div className="yoyo-premium-home">
  <section className="yoyo-welcome"><div><span className="yoyo-school"><School size={15}/>{context.organization.name}</span><h1>Hola, {context.displayName.split(' ')[0]} <span>✨</span></h1><p>¿Qué experiencia de aprendizaje quieres crear hoy?</p></div><div className="yoyo-welcome-actions"><Link href="/biblioteca" className="yoyo-secondary"><BookOpen size={17}/> Explorar biblioteca</Link><Link href="/crear" className="yoyo-primary"><Plus size={18}/> Crear con IA</Link></div></section>
  <section className="yoyo-hero-card"><ForestHeroArt/><div className="yoyo-hero-shade"/><div className="yoyo-hero-copy"><span className="yoyo-premium-pill"><Star size={13} fill="currentColor"/> Experiencia destacada</span><h2>Detectives del bosque nativo</h2><p>Una aventura interactiva para inferir, explorar pistas y justificar respuestas con apoyos DUA.</p><div className="yoyo-hero-tags"><span>Lenguaje · 3.º básico</span><span>OA 4</span><span><Clock3 size={13}/>35 min</span></div><div className="yoyo-hero-actions"><Link href="/biblioteca/bosque-inferencias"><Play size={17} fill="currentColor"/> Iniciar experiencia</Link><Link href="/biblioteca/bosque-inferencias">Vista docente <ArrowRight size={16}/></Link></div></div><div className="yoyo-hero-score"><strong>4.9</strong><span><Star size={12} fill="currentColor"/>Calidad pedagógica</span></div></section>
  <section><Heading eyebrow="ESTUDIO CREATIVO" title="De una idea a un recurso extraordinario" text="Diseña, adapta y evalúa con estándares pedagógicos reales." href="/crear"/><div className="yoyo-studio-grid">{actions.map(([title,detail,href,Icon,tone])=><Link href={href} className={`yoyo-studio-card ${tone}`} key={title}><span className="yoyo-studio-icon"><Icon/></span><div><strong>{title}</strong><p>{detail}</p></div><ArrowRight/></Link>)}</div></section>
  <section><Heading eyebrow="COLECCIONES PEDAGÓGICAS" title="Todo lo que necesitas, organizado para enseñar" href="/biblioteca"/><div className="yoyo-collection-grid">{collections.map(([title,detail,href,Icon,tone])=><Link href={href} className={`yoyo-collection-card ${tone}`} key={title}><span><Icon/></span><div><strong>{title}</strong><small>{detail}</small></div><ArrowRight/></Link>)}</div></section>
  <section><Heading eyebrow="SELECCIÓN PREMIUM" title="Recursos listos para transformar tu clase" text="Editables, imprimibles, interactivos y alineados al currículum chileno." href="/biblioteca"/><div className="yoyo-resource-grid">{featured.map((resource,index)=><article className="yoyo-resource-card" key={resource.slug}><Link href={`/biblioteca/${resource.slug}`} className="yoyo-resource-cover"><ActivityArtwork kind={kinds[index]}/><span className="yoyo-format">{resource.format}</span><span className="yoyo-favorite"><Star size={16}/></span></Link><div className="yoyo-resource-body"><div className="yoyo-resource-meta"><span>{resource.subject}</span><span>{resource.level}</span></div><h3><Link href={`/biblioteca/${resource.slug}`}>{resource.title}</Link></h3><p>{resource.summary}</p><div className="yoyo-supports">{resource.supports.slice(0,2).map(s=><span key={s}><Check size={11}/>{s}</span>)}</div><div className="yoyo-resource-foot"><span><Clock3 size={14}/>{resource.duration}</span><Link href={`/biblioteca/${resource.slug}`}>Abrir <ArrowRight size={14}/></Link></div></div></article>)}</div></section>
  <section className="yoyo-teacher-strip"><div className="yoyo-bot-avatar"><Bot/></div><div><span>PROFESOR VIRTUAL YOYO</span><h2>Tu copiloto pedagógico conoce tu curso y te ayuda a decidir</h2><p>Pregunta, modela una actividad o solicita una adaptación sin partir desde cero.</p></div><Link href="/profesor-virtual"><Sparkles size={17}/> Conversar con YOYO</Link></section>
  <section className="yoyo-progress-row"><Stat icon={GraduationCap} value={active||'Nuevo'} label={active?'cursos activos':'crea tu primer curso'} href="/cursos"/><Stat icon={Palette} value={resourceCatalog.length} label="recursos pedagógicos reales" href="/biblioteca"/><Stat icon={Download} value="4 formatos" label="interactivo, editable, PDF y aula" href="/crear"/></section>
 </div></AppShell>
}
function Heading({eyebrow,title,text,href}:{eyebrow:string;title:string;text?:string;href:string}){return <div className="yoyo-section-heading"><div><span>{eyebrow}</span><h2>{title}</h2>{text?<p>{text}</p>:null}</div><Link href={href}>Ver todo <ArrowRight size={16}/></Link></div>}
function Stat({icon:Icon,value,label,href}:{icon:typeof GraduationCap;value:string|number;label:string;href:string}){return <article><span><Icon/></span><div><strong>{value}</strong><small>{label}</small></div><Link href={href}>Abrir <ArrowRight size={14}/></Link></article>}
