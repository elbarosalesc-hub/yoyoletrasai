'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Bot, BookOpenCheck, Boxes, Database, Gauge, Palette, Rocket, Settings2, ShieldCheck, UsersRound, WalletCards } from 'lucide-react'
import { OwnerKeyManager } from './OwnerKeyManager'
import styles from './owner-command-center.module.css'

type SectionKey = 'overview' | 'ai' | 'modules' | 'resources' | 'design' | 'plans' | 'release'

type Props = {
  ownerEmail: string
  plan: string
}

const sections: Array<{key:SectionKey; label:string}> = [
  {key:'overview',label:'Resumen'},
  {key:'ai',label:'YOYO IA'},
  {key:'modules',label:'Módulos'},
  {key:'resources',label:'Recursos'},
  {key:'design',label:'Diseño'},
  {key:'plans',label:'Planes y acceso'},
  {key:'release',label:'Publicación segura'},
]

const controls = {
  overview: [
    {title:'Gobierno central',description:'Vista maestra del estado de plataforma, IA, contenidos y release.',status:'Activo',href:'/propietaria'},
    {title:'Estado técnico',description:'Consulta la salud de la aplicación y servicios conectados.',status:'Disponible',href:'/estado'},
    {title:'QA y publicación',description:'Control de calidad previo a cualquier salida a producción.',status:'Protegido',href:'/qa'},
    {title:'Configuración general',description:'Acceso a las preferencias visibles ya existentes sin reemplazar la plataforma.',status:'Disponible',href:'/configuracion'},
  ],
  modules: [
    {title:'Navegación completa',description:'Los módulos existentes se conservan; este centro no elimina ni renombra nada automáticamente.',status:'Preservada',href:'/app'},
    {title:'Enseñanza',description:'Biblioteca, plan lector, profesor virtual, herramientas, caligrafía, pictogramas, juegos y simuladores.',status:'Preservada',href:'/biblioteca'},
    {title:'Gestión pedagógica',description:'Cursos, evaluaciones, seguimiento, progreso, familias, informes e institución.',status:'Preservada',href:'/cursos'},
    {title:'IA y creación',description:'YOYO IA, investigación, fuentes IA, planificaciones y creación asistida.',status:'Preservada',href:'/yoyo-ia'},
  ],
  resources: [
    {title:'Biblioteca institucional',description:'Punto de acceso a recursos pedagógicos vigentes y futuros.',status:'Operativa',href:'/biblioteca'},
    {title:'Planificaciones',description:'Área preparada para generación y gestión pedagógica alineada al trabajo docente.',status:'Operativa',href:'/planificaciones'},
    {title:'Evaluaciones',description:'Superficie actual para evaluación y seguimiento.',status:'Operativa',href:'/evaluaciones'},
    {title:'PIE y DUA',description:'Acceso directo al ecosistema de inclusión y apoyos.',status:'Operativa',href:'/inclusion'},
  ],
  design: [
    {title:'Interfaz aprobada',description:'La experiencia visual actual permanece como base; las mejoras se desarrollan aisladas.',status:'Bloqueada contra regresión',href:'/app'},
    {title:'Caligrafía',description:'Módulo completo con imprenta, manuscrita, progresión y trazado táctil.',status:'Protegida',href:'/caligrafia'},
    {title:'Accesibilidad',description:'Controles de navegación y estructura existentes se mantienen durante cada iteración.',status:'Preservada',href:'/inclusion'},
    {title:'Vista móvil',description:'La navegación móvil existente no se reemplaza desde este centro.',status:'Preservada',href:'/app'},
  ],
  plans: [
    {title:'Perfil propietaria',description:'Acceso administrativo reservado al perfil verificado.',status:'Activo',href:'/propietaria'},
    {title:'YOYO IA propietaria',description:'Sin cuotas mensuales internas para el perfil propietario; los límites técnicos por solicitud siguen siendo de seguridad.',status:'Ilimitada internamente',href:'/yoyo-ia'},
    {title:'Usuarios e institución',description:'La gestión de acceso permanece separada del release para reducir riesgo.',status:'Separada',href:'/institucion'},
    {title:'Integraciones',description:'Las integraciones existentes permanecen disponibles sin cambios automáticos.',status:'Preservadas',href:'/integraciones'},
  ],
  release: [
    {title:'Producción permanente',description:'No se modifica desde esta rama. No hay publicación automática ni reasignación de dominio.',status:'Protegida',href:'/estado'},
    {title:'Validación',description:'Cada lote debe pasar typecheck, build y comprobación de rutas antes de considerarse publicable.',status:'Obligatoria',href:'/qa'},
    {title:'Preview aislado',description:'Los cambios se prueban fuera del enlace permanente antes de cualquier release.',status:'Obligatorio',href:'/qa'},
    {title:'Release explícito',description:'Producción solo cambia mediante una acción deliberada posterior a validación.',status:'Manual',href:'/qa'},
  ],
}

function ControlGrid({items}:{items:Array<{title:string;description:string;status:string;href:string}>}){
  return <div className={styles.controlsGrid}>{items.map((item)=><article className={styles.controlCard} key={item.title}><h3>{item.title}</h3><p>{item.description}</p><div className={styles.controlFooter}><span className={styles.controlStatus}>{item.status}</span><Link className={styles.controlLink} href={item.href}>Abrir</Link></div></article>)}</div>
}

export function OwnerCommandCenter({ownerEmail,plan}:Props){
  const[section,setSection]=useState<SectionKey>('overview')
  const meta=useMemo(()=>({
    overview:{title:'Resumen propietario',description:'Centro único para supervisar la plataforma sin alterar automáticamente módulos, dominio ni producción.',badge:'Control maestro'},
    ai:{title:'YOYO IA propietaria',description:'Control de la credencial privada y del acceso propietario. La clave permanece del lado servidor.',badge:'Acceso propietario'},
    modules:{title:'Módulos de plataforma',description:'Mapa de superficies existentes. Aquí solo se supervisa; no se borran módulos ni se cambian rutas desde esta vista.',badge:'Sin regresión'},
    resources:{title:'Recursos educativos',description:'Accesos principales para biblioteca, planificación, evaluación e inclusión.',badge:'Pedagogía'},
    design:{title:'Diseño y experiencia',description:'La interfaz aprobada se mantiene como referencia estable mientras las mejoras evolucionan de forma aislada.',badge:'Interfaz protegida'},
    plans:{title:'Planes, acceso y gobierno',description:'Estado del perfil propietario y superficies institucionales sin exponer secretos.',badge:plan},
    release:{title:'Publicación segura',description:'Reglas que mantienen producción y dominio permanente fuera del ciclo de desarrollo cotidiano.',badge:'Release manual'},
  })[section],[section,plan])

  return <div className={styles.commandCenter}>
    <div className={styles.statusBar}>
      <div className={styles.statusCard}><span className={styles.statusDot}/><strong>Producción</strong><span>Protegida contra cambios desde esta rama.</span></div>
      <div className={styles.statusCard}><span className={styles.statusDot}/><strong>Dominio permanente</strong><span>Fuera del flujo de desarrollo.</span></div>
      <div className={styles.statusCard}><span className={styles.statusDot}/><strong>Perfil propietario</strong><span>{ownerEmail}</span></div>
      <div className={styles.statusCard}><span className={styles.statusDot}/><strong>YOYO IA</strong><span>Acceso propietario sin cuota mensual interna.</span></div>
    </div>

    <div className={styles.workspace}>
      <nav className={styles.navPanel} aria-label="Centro propietario">
        {sections.map((item)=><button key={item.key} type="button" onClick={()=>setSection(item.key)} className={`${styles.navButton} ${section===item.key?styles.navButtonActive:''}`}>{item.label}</button>)}
      </nav>

      <section className={styles.detailPanel}>
        <header className={styles.detailHeader}><div><h2>{meta.title}</h2><p>{meta.description}</p></div><span className={styles.badge}>{meta.badge}</span></header>

        {section==='ai'?<div className={styles.aiGrid}><OwnerKeyManager/><aside className={styles.controlCard}><Bot size={24}/><h3>Política de YOYO IA</h3><p>El perfil propietario conserva acceso sin cuota mensual interna. Las credenciales nunca deben guardarse en frontend, repositorio ni registros visibles.</p><div className={styles.safetyNote}>El centro solo administra superficies autorizadas. No declara independencia total de inferencia o almacenamiento hasta que exista infraestructura YOYO propia verificada.</div></aside></div>:<ControlGrid items={controls[section]}/>} 

        <div className={styles.safetyNote}>Regla permanente: desarrollo aislado → validación → preview → revisión → release explícito. Esta vista no contiene acciones para reasignar dominio, cambiar alias ni desplegar producción.</div>
      </section>
    </div>
  </div>
}
