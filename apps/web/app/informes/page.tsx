import {AlertTriangle,ArrowUpRight,BarChart3,CalendarDays,CheckCircle2,Download,FileText,Filter,LineChart,Printer,TrendingUp,Users} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'
import {getReportsSnapshot} from '@/lib/student-data'

const trends=[
 {label:'Comprensión lectora',value:78,change:'+12%',tone:'violet'},
 {label:'Lectura fluida',value:69,change:'+8%',tone:'mint'},
 {label:'Escritura de respuestas',value:61,change:'+5%',tone:'blue'},
 {label:'Autonomía',value:74,change:'+9%',tone:'amber'}
]

const alerts=[
 {title:'6 estudiantes requieren seguimiento',detail:'Progreso inferior al 50% o asistencia bajo 80%.',tone:'attention'},
 {title:'4 perfiles sin evidencia reciente',detail:'No registran actividades durante los últimos siete días.',tone:'warning'},
 {title:'El grupo de lectura avanzó 12%',detail:'La mayor mejora se observa en localización de información explícita.',tone:'good'}
]

export default async function ReportsPage(){
 const report=await getReportsSnapshot()
 return <ModuleShell active="Informes">
  <section className="reports-head-v2">
   <div><span className="module-eyebrow"><BarChart3 size={15}/> Analítica pedagógica</span><h1>Informes y evidencias</h1><p>Transforma la información del curso en decisiones claras, seguimientos y reportes listos para compartir.</p></div>
   <div className="reports-actions-v2"><span className={`module-data-badge ${report.source}`}><i/>{report.source==='supabase'?'Datos sincronizados':'Vista demostrativa'}</span><button><Printer/>Imprimir</button><button className="primary"><Download/>Exportar informe</button></div>
  </section>

  <section className="reports-filter-v2"><div><CalendarDays/><span><small>PERIODO</small><strong>Julio 2026</strong></span></div><div><Users/><span><small>GRUPO</small><strong>Todos los grupos</strong></span></div><div><Filter/><span><small>ASIGNATURA</small><strong>Todas</strong></span></div><button>Actualizar reporte</button></section>

  <section className="reports-stats-v2">
   <article><span className="violet"><Users/></span><div><strong>{report.totalStudents}</strong><small>estudiantes analizados</small></div></article>
   <article><span className="mint"><CheckCircle2/></span><div><strong>{report.onTrack}</strong><small>con avance esperado</small></div></article>
   <article><span className="amber"><AlertTriangle/></span><div><strong>{report.needsAttention}</strong><small>requieren atención</small></div></article>
   <article><span className="blue"><FileText/></span><div><strong>{report.totalEvidence}</strong><small>evidencias registradas</small></div></article>
  </section>

  <section className="reports-main-grid-v2">
   <article className="panel-card progress-report-v2"><header><div><span>PROGRESO GENERAL</span><h2>Avance por habilidad</h2></div><em><TrendingUp/>+{Math.max(report.averageProgress-60,0)}% este mes</em></header><div className="trend-list-v2">{trends.map(item=><div key={item.label}><div><strong>{item.label}</strong><span>{item.change}</span></div><div><i className={item.tone} style={{width:`${item.value}%`}}/></div><em>{item.value}%</em></div>)}</div></article>

   <article className="panel-card summary-report-v2"><header><div><span>RESUMEN DEL CURSO</span><h2>Indicadores clave</h2></div><LineChart/></header><div className="summary-ring-v2" style={{'--value':`${report.averageProgress*3.6}deg`} as React.CSSProperties}><span><strong>{report.averageProgress}%</strong><small>progreso promedio</small></span></div><div className="summary-kpis-v2"><span><strong>{report.averageAttendance}%</strong><small>asistencia media</small></span><span><strong>{report.pendingEvidence}</strong><small>sin evidencia reciente</small></span></div></article>

   <article className="panel-card alerts-report-v2"><header><div><span>SEGUIMIENTO</span><h2>Alertas y oportunidades</h2></div></header><div>{alerts.map(alert=><article className={alert.tone} key={alert.title}><span>{alert.tone==='good'?<CheckCircle2/>:<AlertTriangle/>}</span><div><strong>{alert.title}</strong><p>{alert.detail}</p></div><button><ArrowUpRight/></button></article>)}</div></article>
  </section>

  <section className="report-templates-v2"><header><div><span>DOCUMENTOS</span><h2>Informes listos para generar</h2></div><a href="/crear">Crear plantilla personalizada<ArrowUpRight/></a></header><div><article><span>📊</span><div><strong>Informe de progreso mensual</strong><p>Resumen de avances, barreras, apoyos y próximos pasos.</p></div><button>Generar</button></article><article><span>🧩</span><div><strong>Informe PIE individual</strong><p>Fortalezas, necesidades de apoyo, estrategias y evidencias.</p></div><button>Generar</button></article><article><span>👨‍👩‍👧</span><div><strong>Informe para la familia</strong><p>Comunicación clara, positiva y comprensible para apoderados.</p></div><button>Generar</button></article></div></section>
 </ModuleShell>
}
