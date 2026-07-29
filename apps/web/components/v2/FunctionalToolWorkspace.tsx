'use client'

import {useMemo,useState} from 'react'
import {
  Accessibility,
  Archive,
  AudioLines,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Copy,
  Download,
  Eye,
  FileImage,
  FileText,
  Filter,
  FolderKanban,
  Gamepad2,
  Image as ImageIcon,
  Layers3,
  Mic2,
  MonitorPlay,
  MoreHorizontal,
  Palette,
  Play,
  Plus,
  Save,
  Search,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  Upload,
  Users,
  Volume2,
  WandSparkles
} from 'lucide-react'
import {ModuleShell} from './ModuleShell'

type ToolMode='studio'|'pie'|'tasks'|'portfolios'|'media'

type Task={id:number;title:string;course:string;due:string;status:'Borrador'|'Asignada'|'Completada';progress:number}
type Evidence={id:number;student:string;title:string;type:string;date:string;status:string}
type Asset={id:number;name:string;type:'Imagen'|'Audio'|'Video'|'Documento';subject:string;size:string}

const initialTasks:Task[]=[
  {id:1,title:'Inferencias en el bosque',course:'3.º básico',due:'30 jul',status:'Asignada',progress:68},
  {id:2,title:'Valor posicional en la ciudad',course:'3.º básico',due:'1 ago',status:'Borrador',progress:0},
  {id:3,title:'Sistemas del cuerpo',course:'5.º básico',due:'4 ago',status:'Completada',progress:100}
]

const initialEvidence:Evidence[]=[
  {id:1,student:'Sofía Martínez',title:'Lectura guiada: El bosque',type:'Audio',date:'29 jul',status:'Revisada'},
  {id:2,student:'Javier Soto',title:'Respuesta inferencial',type:'Documento',date:'29 jul',status:'Pendiente'},
  {id:3,student:'Agustina Rojas',title:'Misión 3D completada',type:'Juego',date:'28 jul',status:'Revisada'}
]

const initialAssets:Asset[]=[
  {id:1,name:'Bosque nocturno accesible',type:'Imagen',subject:'Lenguaje',size:'1,8 MB'},
  {id:2,name:'Narración inferencias nivel 1',type:'Audio',subject:'Lenguaje',size:'2,4 MB'},
  {id:3,name:'Sistema circulatorio animado',type:'Video',subject:'Ciencias',size:'18 MB'},
  {id:4,name:'Tarjetas visuales de apoyo',type:'Documento',subject:'PIE',size:'740 KB'}
]

const supportProfiles=[
  {name:'Discapacidad intelectual',supports:['Una instrucción por vez','Menor cantidad de ítems','Modelado explícito','Apoyo concreto'],tone:'violet'},
  {name:'TDA/TDAH',supports:['Bloques breves','Temporizador visual','Pausa activa','Reducción de distractores'],tone:'amber'},
  {name:'TEA',supports:['Secuencia anticipada','Lenguaje literal','Opciones de pausa','Apoyos visuales'],tone:'blue'},
  {name:'Discapacidad visual',supports:['Alto contraste','Tipografía ampliada','Narración','Navegación por teclado'],tone:'mint'}
]

export function FunctionalToolWorkspace({mode}:{mode:ToolMode}){
  const[tasks,setTasks]=useState(initialTasks)
  const[evidence,setEvidence]=useState(initialEvidence)
  const[assets,setAssets]=useState(initialAssets)
  const[query,setQuery]=useState('')
  const[selected,setSelected]=useState(0)
  const[message,setMessage]=useState('')
  const[worldTitle,setWorldTitle]=useState('Bosque de las inferencias')
  const[worldSubject,setWorldSubject]=useState('Lenguaje')
  const[worldMission,setWorldMission]=useState('Encontrar una pista visual y justificar una inferencia.')
  const[ambience,setAmbience]=useState('Bosque nocturno')
  const[profile,setProfile]=useState(0)

  const meta={
    studio:{active:'Estudio inmersivo',eyebrow:'CREACIÓN 3D',title:'Estudio de experiencias inmersivas',description:'Diseña mundos curriculares, misiones, objetos interactivos, ambiente, narración y criterios de logro.',icon:Layers3},
    pie:{active:'Recursos PIE',eyebrow:'INCLUSIÓN',title:'Centro de recursos PIE',description:'Configura apoyos, perfiles de acceso y adaptaciones reutilizables para actividades, juegos y evaluaciones.',icon:Accessibility},
    tasks:{active:'Tareas',eyebrow:'TRABAJO ASIGNADO',title:'Gestión de tareas',description:'Crea, asigna y monitorea actividades para cursos, grupos o estudiantes específicos.',icon:ClipboardCheck},
    portfolios:{active:'Portafolios',eyebrow:'EVIDENCIAS',title:'Portafolios de aprendizaje',description:'Organiza audios, producciones, evaluaciones y evidencias generadas dentro de la plataforma.',icon:FolderKanban},
    media:{active:'Banco multimedia',eyebrow:'RECURSOS',title:'Banco multimedia institucional',description:'Administra imágenes, audio, video y documentos para reutilizarlos en recursos y experiencias.',icon:FileImage}
  }[mode]
  const Icon=meta.icon

  const filteredTasks=useMemo(()=>tasks.filter(item=>`${item.title} ${item.course}`.toLowerCase().includes(query.toLowerCase())),[tasks,query])
  const filteredEvidence=useMemo(()=>evidence.filter(item=>`${item.student} ${item.title}`.toLowerCase().includes(query.toLowerCase())),[evidence,query])
  const filteredAssets=useMemo(()=>assets.filter(item=>`${item.name} ${item.type} ${item.subject}`.toLowerCase().includes(query.toLowerCase())),[assets,query])

  function notify(text:string){setMessage(text);window.setTimeout(()=>setMessage(''),2200)}

  return <ModuleShell active={meta.active}>
    <section className="functional-tool-head">
      <div><span className="module-eyebrow"><Icon size={15}/> {meta.eyebrow}</span><h1>{meta.title}</h1><p>{meta.description}</p></div>
      <button onClick={()=>notify(mode==='studio'?'Mundo guardado como borrador':'Cambios guardados')}><Save/>Guardar cambios</button>
    </section>

    {message&&<div className="functional-toast"><CheckCircle2/>{message}</div>}

    {mode==='studio'&&<section className="studio-layout-v4">
      <aside className="studio-config-v4">
        <header><span><Settings2/></span><div><small>CONFIGURACIÓN DEL MUNDO</small><h2>Experiencia curricular</h2></div></header>
        <label>Título<input value={worldTitle} onChange={event=>setWorldTitle(event.target.value)}/></label>
        <div className="studio-two-v4"><label>Asignatura<select value={worldSubject} onChange={event=>setWorldSubject(event.target.value)}><option>Lenguaje</option><option>Matemática</option><option>Ciencias</option><option>Historia</option></select></label><label>Nivel<select><option>3.º básico</option><option>4.º básico</option><option>5.º básico</option></select></label></div>
        <label>Objetivo de la misión<textarea value={worldMission} onChange={event=>setWorldMission(event.target.value)} rows={4}/></label>
        <label>Ambiente<select value={ambience} onChange={event=>setAmbience(event.target.value)}><option>Bosque nocturno</option><option>Ciudad futurista</option><option>Laboratorio científico</option><option>Museo histórico</option></select></label>
        <div className="studio-feature-toggles-v4"><button className="active"><Volume2/>Sonido ambiental<Check/></button><button className="active"><Mic2/>Narración<Check/></button><button className="active"><MonitorPlay/>Profesor virtual<Check/></button><button><Gamepad2/>Controles táctiles<Plus/></button></div>
        <button className="studio-generate-v4" onClick={()=>notify('YOYO generó cinco misiones editables')}><WandSparkles/>Generar misiones con YOYO</button>
      </aside>
      <main className="studio-preview-v4">
        <header><div><i/><i/><i/><strong>Vista previa del mundo</strong></div><button><Play/>Probar experiencia</button></header>
        <div className={`studio-world-v4 world-${ambience.includes('Bosque')?'forest':ambience.includes('Ciudad')?'city':'lab'}`}><span className="studio-moon-v4"/><span className="studio-ground-v4"/><span className="studio-character-v4">🧑‍🚀</span><span className="studio-object-v4">💎</span><div><small>{worldSubject.toUpperCase()} · MISIÓN 1</small><h2>{worldTitle}</h2><p>{worldMission}</p><button><Play/>Iniciar prueba</button></div></div>
        <section className="studio-timeline-v4"><header><span>SECUENCIA DE MISIONES</span><button><Plus/>Agregar misión</button></header>{['Introducción del profesor virtual','Exploración del escenario','Desafío curricular','Retroalimentación y evidencia','Cierre y recompensa'].map((item,index)=><article key={item}><span>{index+1}</span><div><strong>{item}</strong><small>{index===0?'Voz + subtítulos':index===1?'Objetos interactivos':'Contenido editable'}</small></div><button><MoreHorizontal/></button></article>)}</section>
      </main>
    </section>}

    {mode==='pie'&&<section className="pie-workspace-v4">
      <aside>{supportProfiles.map((item,index)=><button className={profile===index?'active':''} onClick={()=>setProfile(index)} key={item.name}><span className={`tone-${item.tone}`}><Accessibility/></span><div><strong>{item.name}</strong><small>{item.supports.length} apoyos configurados</small></div><ChevronRight/></button>)}</aside>
      <main><header><div><span>PERFIL DE APOYO</span><h2>{supportProfiles[profile].name}</h2><p>Estos apoyos se pueden aplicar a cualquier recurso, evaluación o experiencia 3D.</p></div><button onClick={()=>notify('Perfil aplicado a 3.º básico')}><Users/>Aplicar a un grupo</button></header><div className="support-list-v4">{supportProfiles[profile].supports.map((support,index)=><article key={support}><span>{index+1}</span><div><strong>{support}</strong><small>Activo en actividades, juegos y evaluaciones</small></div><button className="enabled"><Check/></button></article>)}</div><section className="pie-preview-v4"><div><small>VISTA PREVIA DE ACCESO</small><h3>Comprensión lectora</h3><p>Lee o escucha el texto. Luego responde una pregunta usando la pista destacada.</p><button><Volume2/>Escuchar instrucción</button></div><div><Palette/><strong>Alto contraste</strong><small>Letra ampliada · instrucciones breves · foco visual</small></div></section></main>
    </section>}

    {mode==='tasks'&&<section className="task-workspace-v4">
      <header className="functional-toolbar-v4"><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar tarea..."/></label><button><Filter/>Filtrar</button><button onClick={()=>{const id=Date.now();setTasks(current=>[{id,title:'Nueva tarea sin título',course:'3.º básico',due:'Sin fecha',status:'Borrador',progress:0},...current]);notify('Nueva tarea creada')}}><Plus/>Nueva tarea</button></header>
      <div className="task-board-v4">{(['Borrador','Asignada','Completada'] as const).map(status=><section key={status}><header><span>{status}</span><em>{filteredTasks.filter(item=>item.status===status).length}</em></header>{filteredTasks.filter(item=>item.status===status).map(task=><article key={task.id}><div><strong>{task.title}</strong><small>{task.course} · vence {task.due}</small></div><span><i style={{width:`${task.progress}%`}}/></span><div><em>{task.progress}%</em><button onClick={()=>setTasks(current=>current.filter(item=>item.id!==task.id))}><Trash2/></button></div></article>)}</section>)}</div>
    </section>}

    {mode==='portfolios'&&<section className="portfolio-workspace-v4"><header className="functional-toolbar-v4"><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar estudiante o evidencia..."/></label><button><Filter/>Filtrar</button><button onClick={()=>{setEvidence(current=>[{id:Date.now(),student:'Nuevo estudiante',title:'Nueva evidencia',type:'Documento',date:'Hoy',status:'Pendiente'},...current]);notify('Evidencia añadida')}}><Plus/>Agregar evidencia</button></header><div className="portfolio-grid-v4">{filteredEvidence.map(item=><article key={item.id}><span className={`portfolio-type-v4 type-${item.type.toLowerCase()}`}>{item.type==='Audio'?<AudioLines/>:item.type==='Juego'?<Gamepad2/>:<FileText/>}</span><div><small>{item.student}</small><h3>{item.title}</h3><p>{item.type} · {item.date}</p></div><span className={item.status==='Revisada'?'reviewed':'pending'}>{item.status}</span><div><button><Eye/>Abrir</button><button><Download/></button><button onClick={()=>setEvidence(current=>current.filter(e=>e.id!==item.id))}><Trash2/></button></div></article>)}</div></section>}

    {mode==='media'&&<section className="media-workspace-v4"><header className="functional-toolbar-v4"><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar archivo..."/></label><button><Filter/>Tipo</button><button onClick={()=>{setAssets(current=>[{id:Date.now(),name:'Nuevo recurso multimedia',type:'Imagen',subject:'General',size:'0 KB'},...current]);notify('Archivo añadido al banco')}}><Upload/>Subir archivo</button></header><div className="media-layout-v4"><aside>{['Todos','Imagen','Audio','Video','Documento'].map((item,index)=><button className={selected===index?'active':''} onClick={()=>setSelected(index)} key={item}><span>{item==='Imagen'?<ImageIcon/>:item==='Audio'?<AudioLines/>:item==='Video'?<MonitorPlay/>:item==='Documento'?<FileText/>:<Archive/>}</span>{item}</button>)}</aside><main>{filteredAssets.filter(item=>selected===0||item.type===['Todos','Imagen','Audio','Video','Documento'][selected]).map(asset=><article key={asset.id}><div className={`media-thumb-v4 media-${asset.type.toLowerCase()}`}>{asset.type==='Imagen'?<ImageIcon/>:asset.type==='Audio'?<AudioLines/>:asset.type==='Video'?<MonitorPlay/>:<FileText/>}</div><div><strong>{asset.name}</strong><small>{asset.subject} · {asset.size}</small></div><div><button onClick={()=>notify(`${asset.name} añadido al recurso`)}><Plus/>Usar</button><button onClick={()=>navigator.clipboard.writeText(asset.name)}><Copy/></button><button onClick={()=>setAssets(current=>current.filter(item=>item.id!==asset.id))}><Trash2/></button></div></article>)}</main></div></section>}
  </ModuleShell>
}
