'use client'

type Props={onSelect:(id:string)=>void;active:string[];reducedMotion?:boolean}

const objects=[
 {id:'mochila',label:'Mochila',x:180,y:300,w:110,h:88},
 {id:'nota',label:'Nota',x:355,y:275,w:105,h:76},
 {id:'ave',label:'Ave',x:515,y:145,w:95,h:80},
 {id:'cabana',label:'Cabaña',x:610,y:245,w:145,h:120}
]

export default function Bosque3D({onSelect,active,reducedMotion}:Props){
 return <div className={'three-stage premium-svg-scene '+(reducedMotion?'reduced-motion':'')} role="application" aria-label="Bosque interactivo ilustrado">
  <svg viewBox="0 0 800 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
   <defs><linearGradient id="gameSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9fdcff"/><stop offset="1" stopColor="#edf8f3"/></linearGradient><linearGradient id="gameHill" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7cc075"/><stop offset="1" stopColor="#3e8150"/></linearGradient><filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#14372b" floodOpacity=".22"/></filter></defs>
   <rect width="800" height="520" rx="28" fill="url(#gameSky)"/>
   <circle cx="680" cy="84" r="40" fill="#ffd766" className="scene-sun-vector"/>
   <path d="M0 270 Q160 150 330 265 T800 225 V520 H0Z" fill="#a7d49a"/>
   <path d="M0 330 Q210 215 410 320 T800 285 V520 H0Z" fill="url(#gameHill)"/>
   <path d="M355 520 C390 420 402 330 398 220 C365 330 330 420 318 520Z" fill="#d8bd8d"/>
   <g transform="translate(65 120)" filter="url(#shadow)"><rect x="58" y="120" width="30" height="175" rx="10" fill="#7c5138"/><circle cx="73" cy="72" r="82" fill="#4e9b58"/><circle cx="20" cy="92" r="55" fill="#67b466"/><circle cx="128" cy="90" r="62" fill="#3f884d"/></g>
   <g transform="translate(650 115)" filter="url(#shadow)"><rect x="45" y="116" width="28" height="150" rx="10" fill="#754a34"/><path d="M58 0 L0 120 H116Z" fill="#2d8f52"/><path d="M58 40 L10 150 H106Z" fill="#3ca660"/></g>
   <g transform="translate(340 155)" filter="url(#shadow)"><circle cx="58" cy="54" r="38" fill="#efb383"/><path d="M20 53 Q58 10 96 53 V95 H20Z" fill="#5d4138"/><rect x="30" y="88" width="56" height="92" rx="24" fill="#6e4ae2"/><circle cx="47" cy="55" r="4" fill="#24313b"/><circle cx="70" cy="55" r="4" fill="#24313b"/><path d="M47 70 Q58 78 70 70" fill="none" stroke="#934f3f" strokeWidth="4" strokeLinecap="round"/></g>
   <g transform="translate(600 260)" filter="url(#shadow)"><path d="M0 40 Q70 -12 140 40 V136 H0Z" fill="#c77945"/><path d="M-10 45 L70 -20 L150 45" fill="none" stroke="#754734" strokeWidth="14"/><rect x="58" y="82" width="28" height="54" fill="#704b34"/><rect x="20" y="65" width="28" height="28" fill="#dff5ff"/><rect x="96" y="65" width="28" height="28" fill="#dff5ff"/></g>
   <g transform="translate(175 310)" filter="url(#shadow)"><path d="M0 35 Q55 -8 110 35 V118 H0Z" fill="#d95353"/><rect x="18" y="39" width="74" height="66" rx="12" fill="#ef6f5e"/><path d="M18 36 Q55 0 92 36" fill="none" stroke="#6c3e3e" strokeWidth="10"/><rect x="44" y="58" width="22" height="28" rx="5" fill="#ffd2b7"/></g>
   <g transform="translate(355 290)" filter="url(#shadow)"><rect width="110" height="78" rx="9" fill="#fffdf6" stroke="#d2c4a0" strokeWidth="4"/><path d="M18 20 H90 M18 37 H78 M18 54 H85" stroke="#87959a" strokeWidth="5" strokeLinecap="round"/></g>
   <g transform="translate(520 150)" filter="url(#shadow)"><ellipse cx="42" cy="36" rx="34" ry="23" fill="#4baed5"/><path d="M13 36 L-18 15 L-10 55Z" fill="#2f87b0"/><circle cx="62" cy="30" r="4" fill="#24313b"/><path d="M38 55 L31 78 M51 55 L58 78" stroke="#754c35" strokeWidth="6" strokeLinecap="round"/></g>
  </svg>
  <div className="scene-guide-label"><strong>Sofía</strong><span>Explora el bosque y encuentra las pistas.</span></div>
  {objects.map(o=><button key={o.id} type="button" className={'svg-hotspot '+(active.includes(o.id)?'found':'')} style={{left:`${o.x/8}%`,top:`${o.y/5.2}%`,width:`${o.w/8}%`,height:`${o.h/5.2}%`}} onClick={()=>onSelect(o.id)} aria-label={`Explorar ${o.label}`} aria-pressed={active.includes(o.id)}><span>{active.includes(o.id)?'✓':o.label}</span></button>)}
 </div>
}
