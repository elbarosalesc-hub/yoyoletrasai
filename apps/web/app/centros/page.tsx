import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpenCheck,
  Calculator,
  CheckCircle2,
  FlaskConical,
  Images,
  PenLine,
  Shapes,
  Sparkles,
  Target,
} from 'lucide-react'
import {AppShell} from '@/components/AppShell'

type Centre={
 title:string
 label:string
 description:string
 image:string
 imageAlt:string
 href:string
 icon:typeof Calculator
 features:string[]
 actions:{label:string;href:string}[]
}

const centres:Centre[]=[
 {
  title:'Laboratorio Matemático',label:'Matemática',icon:Calculator,href:'/herramientas',
  description:'Material concreto, representaciones visuales, cálculo, geometría, medición, datos y resolución de problemas con progresión por nivel.',
  image:'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1400&q=85',imageAlt:'Material matemático real con números y elementos manipulativos',
  features:['Recta numérica y valor posicional','Fracciones, decimales y porcentajes','Geometría, perímetro y área','Tablas, cálculo mental y problemas'],
  actions:[{label:'Abrir herramientas',href:'/herramientas'},{label:'Ver recursos',href:'/biblioteca?area=matematica'}]
 },
 {
  title:'Laboratorio de Ciencias',label:'Ciencias',icon:FlaskConical,href:'/simuladores',
  description:'Experiencias guiadas, modelos, simuladores y actividades de observación para aprender ciencias mediante preguntas, evidencia y experimentación segura.',
  image:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=85',imageAlt:'Estudiantes realizando una experiencia científica en laboratorio',
  features:['Seres vivos y ecosistemas','Cuerpo humano y vida saludable','Materia, energía y fuerzas','Tierra, universo y ambiente'],
  actions:[{label:'Abrir simuladores',href:'/simuladores'},{label:'Explorar ciencias',href:'/biblioteca?area=ciencias'}]
 },
 {
  title:'Taller de Caligrafía',label:'Escritura',icon:PenLine,href:'/caligrafia',
  description:'Trazos graduados, letras, enlaces, palabras y producción escrita con modelos claros, pauta configurable y apoyos para distintas necesidades motoras.',
  image:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=85',imageAlt:'Mano escribiendo cuidadosamente en un cuaderno con lápiz',
  features:['Imprenta y manuscrita','Tamaño y pauta configurables','Modelado de direccionalidad','Versiones para impresión y pantalla'],
  actions:[{label:'Abrir caligrafía',href:'/caligrafia'},{label:'Crear una ficha',href:'/crear?tipo=caligrafia'}]
 },
 {
  title:'Taller Grafomotor',label:'Grafomotricidad',icon:Shapes,href:'/caligrafia',
  description:'Recorridos, patrones, coordinación visomotora y preparación para la escritura mediante secuencias graduadas, motivadoras y accesibles.',
  image:'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1400&q=85',imageAlt:'Niña trabajando con lápices y materiales de motricidad fina',
  features:['Líneas rectas, curvas y mixtas','Recorridos y laberintos','Coordinación ojo-mano','Progresión de amplitud y precisión'],
  actions:[{label:'Abrir taller',href:'/caligrafia?modo=grafomotricidad'},{label:'Ver fichas',href:'/biblioteca?area=grafomotricidad'}]
 },
 {
  title:'Banco de Pictogramas',label:'Comunicación visual',icon:Images,href:'/multimedia',
  description:'Apoyos visuales para anticipar, comprender instrucciones, comunicar necesidades y favorecer autonomía dentro y fuera del aula.',
  image:'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=1400&q=85',imageAlt:'Materiales visuales reales organizados para apoyar el aprendizaje',
  features:['Rutinas y secuencias visuales','Emociones y autorregulación','Normas e instrucciones','Tableros de comunicación'],
  actions:[{label:'Abrir pictogramas',href:'/multimedia'},{label:'Crear tablero',href:'/crear?tipo=pictogramas'}]
 },
 {
  title:'Plan Lector Inteligente',label:'Lectura',icon:BookOpenCheck,href:'/plan-lector',
  description:'Rutas lectoras personalizadas con fluidez, vocabulario, comprensión, inferencias y seguimiento del progreso para cada estudiante y curso.',
  image:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=85',imageAlt:'Estudiante leyendo un libro en un entorno escolar real',
  features:['Diagnóstico y nivel lector','Textos graduados por habilidad','Registro de palabras por minuto','Preguntas y retroalimentación'],
  actions:[{label:'Abrir plan lector',href:'/plan-lector'},{label:'Ver lecturas',href:'/biblioteca?area=lectura'}]
 },
]

const standards=['Fotografía real y contextualizada','Contenido original y revisable','Alineación curricular chilena','Adaptaciones DUA y PIE','Pauta o respuesta incluida','Vista digital e imprimible']

export default function CentrosPremium(){
 return <AppShell active="Centros Premium">
  <section className="centres-hero">
   <div className="centres-hero-copy">
    <span className="eyebrow"><Sparkles size={15}/> Ecosistema pedagógico premium</span>
    <h1>Herramientas y recursos que se adaptan a la forma real de aprender</h1>
    <p>Seis centros especializados reúnen actividades interactivas, material imprimible, apoyos visuales y seguimiento pedagógico en una experiencia integrada.</p>
    <div className="centres-hero-actions"><Link className="btn btn-primary" href="/biblioteca">Explorar biblioteca</Link><Link className="btn btn-soft" href="/crear">Crear recurso adaptado</Link></div>
   </div>
   <div className="centres-hero-panel">
    <div><strong>6</strong><span>centros especializados</span></div>
    <div><strong>100%</strong><span>recursos contextualizados</span></div>
    <div><strong>DUA</strong><span>adaptación incorporada</span></div>
   </div>
  </section>

  <section className="centres-quality premium-card">
   <div><span className="eyebrow"><Target size={15}/> Estándar de calidad</span><h2>Cada material debe ser pedagógicamente útil antes de ser visualmente atractivo</h2></div>
   <div className="centres-quality-grid">{standards.map(item=><span key={item}><CheckCircle2 size={17}/>{item}</span>)}</div>
  </section>

  <section className="centres-grid" aria-label="Centros pedagógicos">
   {centres.map(({icon:Icon,...centre},index)=><article className={`centre-card centre-tone-${index+1}`} key={centre.title}>
    <div className="centre-photo"><Image src={centre.image} alt={centre.imageAlt} fill sizes="(max-width: 900px) 100vw, 50vw"/><span><Icon size={18}/>{centre.label}</span></div>
    <div className="centre-body"><h2>{centre.title}</h2><p>{centre.description}</p><ul>{centre.features.map(feature=><li key={feature}><CheckCircle2 size={15}/>{feature}</li>)}</ul><div className="centre-actions">{centre.actions.map((action,actionIndex)=><Link className={actionIndex===0?'btn btn-primary':'btn btn-soft'} href={action.href} key={action.label}>{action.label}{actionIndex===0&&<ArrowRight size={16}/>}</Link>)}</div></div>
   </article>)}
  </section>

  <section className="centres-footer-callout premium-card"><div><span className="eyebrow">Biblioteca en crecimiento</span><h2>Un recurso puede transformarse en múltiples versiones sin perder su objetivo</h2><p>Desde cada centro podrás crear una versión estándar, una adaptación con apoyos visuales, una evaluación diversificada o una ficha lista para imprimir.</p></div><Link className="btn btn-primary" href="/crear"><Sparkles size={17}/>Crear con IA</Link></section>
 </AppShell>
}
