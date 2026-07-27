import type {ReactNode} from 'react'

export function ForestHeroArt(){return <svg className="dashboard-forest-art" viewBox="0 0 960 430" role="img" aria-label="Niña explorando un bosque mágico educativo">
 <defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fd7ff"/><stop offset="1" stopColor="#d9f3ff"/></linearGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b9c57"/><stop offset="1" stopColor="#123d2c"/></linearGradient>
  <linearGradient id="path" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f6d59d"/><stop offset="1" stopColor="#c99457"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stopColor="#fffbd2" stopOpacity=".95"/><stop offset="1" stopColor="#fffbd2" stopOpacity="0"/></radialGradient>
  <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="10" floodOpacity=".26"/></filter>
 </defs>
 <rect width="960" height="430" rx="28" fill="url(#sky)"/>
 <circle cx="760" cy="72" r="58" fill="#fff2a8" opacity=".9"/>
 <path d="M0 170 Q130 95 260 168 T520 160 T780 150 T960 165 V430 H0Z" fill="#4c9965" opacity=".8"/>
 <path d="M0 230 Q170 150 330 230 T650 215 T960 220 V430 H0Z" fill="url(#ground)"/>
 <path d="M430 430 C438 330 478 275 525 226 C560 192 606 180 640 171 C578 235 560 316 576 430Z" fill="url(#path)" opacity=".95"/>
 {[[90,120,1.05],[180,160,.86],[840,130,1.08],[760,175,.78],[650,120,.65]].map(([x,y,s],i)=><g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
  <rect x="-12" y="70" width="24" height="90" rx="9" fill="#6f4637"/>
  <path d="M0 0 L-58 90 H58Z" fill={i%2?'#1f6e43':'#2f8850'}/><path d="M0 30 L-50 110 H50Z" fill={i%2?'#2f8d53':'#267844'}/>
 </g>)}
 <g opacity=".9">{[[120,340],[180,330],[720,350],[810,315],[875,360],[265,365]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}><circle r="8" fill={['#ffd74f','#f59ac8','#8fe6ff'][i%3]}/><circle cx="-10" r="6" fill={['#fff4a8','#ffd3ea','#d4f6ff'][i%3]}/><circle cx="10" r="6" fill={['#fff4a8','#ffd3ea','#d4f6ff'][i%3]}/><rect x="-2" y="7" width="4" height="20" fill="#4d913f"/></g>)}</g>
 <ellipse cx="520" cy="245" rx="150" ry="120" fill="url(#glow)"/>
 <g transform="translate(458 182)" filter="url(#shadow)">
  <path d="M55 86 C20 100 8 145 24 190 L88 190 C104 145 92 100 55 86Z" fill="#7d4be5"/>
  <circle cx="55" cy="55" r="43" fill="#f3b277"/>
  <path d="M18 52 C18 12 43 -7 72 3 C98 12 105 38 94 66 C83 43 73 29 52 29 C37 29 28 38 18 52Z" fill="#5a382d"/>
  <circle cx="40" cy="57" r="4" fill="#252832"/><circle cx="70" cy="57" r="4" fill="#252832"/>
  <path d="M43 73 Q55 82 68 73" stroke="#b95d55" strokeWidth="4" fill="none" strokeLinecap="round"/>
  <path d="M22 106 L-4 138" stroke="#f3b277" strokeWidth="14" strokeLinecap="round"/><path d="M88 106 L113 132" stroke="#f3b277" strokeWidth="14" strokeLinecap="round"/>
  <path d="M39 188 L32 226" stroke="#4b377e" strokeWidth="18" strokeLinecap="round"/><path d="M73 188 L80 226" stroke="#4b377e" strokeWidth="18" strokeLinecap="round"/>
  <path d="M17 111 Q55 84 94 111" fill="#8f5cf0"/>
 </g>
 <g transform="translate(676 122)"><circle r="27" fill="#f5cf55"/><text textAnchor="middle" dominantBaseline="central" fontSize="25" fontWeight="800" fill="#4a3b12">1</text><rect x="38" y="-18" width="142" height="36" rx="18" fill="#133b2c" opacity=".88"/><text x="109" y="5" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">La nota secreta</text></g>
 <g transform="translate(750 220)"><circle r="27" fill="#f0ae3e"/><text textAnchor="middle" dominantBaseline="central" fontSize="25" fontWeight="800" fill="#4a2f0a">2</text><rect x="38" y="-18" width="150" height="36" rx="18" fill="#133b2c" opacity=".88"/><text x="113" y="5" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">El ave mensajera</text></g>
 <g transform="translate(708 326)"><circle r="27" fill="#b45ff0"/><text textAnchor="middle" dominantBaseline="central" fontSize="25" fontWeight="800" fill="white">3</text><rect x="38" y="-18" width="162" height="36" rx="18" fill="#133b2c" opacity=".88"/><text x="119" y="5" textAnchor="middle" fontSize="14" fontWeight="700" fill="white">La cabaña misteriosa</text></g>
 </svg>}

export function ActivityArtwork({kind}:{kind:string}){const map:Record<string,ReactNode>={
 forest:<svg viewBox="0 0 180 120"><rect width="180" height="120" rx="18" fill="#daf5e2"/><circle cx="138" cy="28" r="18" fill="#ffd866"/><path d="M0 86 Q45 48 90 84 T180 78 V120 H0Z" fill="#4ea668"/><path d="M78 120 Q83 84 102 62 Q115 48 130 42 Q110 77 113 120Z" fill="#d8b27a"/><path d="M30 18 L5 76 H55Z" fill="#287a49"/><rect x="26" y="67" width="8" height="30" fill="#744c37"/><circle cx="92" cy="67" r="20" fill="#f2b37d"/><path d="M72 68 Q78 37 101 43 Q118 48 112 76 Q102 60 89 58 Q79 58 72 68Z" fill="#5d3b30"/><path d="M72 87 Q92 74 112 87 L116 119 H68Z" fill="#7d4be5"/></svg>,
 reading:<svg viewBox="0 0 180 120"><rect width="180" height="120" rx="18" fill="#fff0d8"/><circle cx="88" cy="42" r="24" fill="#f2b27b"/><path d="M63 42 Q66 12 90 17 Q114 20 113 49 Q101 33 88 34 Q74 34 63 42Z" fill="#53372f"/><path d="M50 75 Q89 54 128 75 V120 H50Z" fill="#4b80d5"/><path d="M22 72 Q60 58 88 84 V116 Q56 92 22 106Z" fill="white" stroke="#54708f" strokeWidth="3"/><path d="M158 72 Q120 58 88 84 V116 Q121 92 158 106Z" fill="white" stroke="#54708f" strokeWidth="3"/></svg>,
 math:<svg viewBox="0 0 180 120"><rect width="180" height="120" rx="18" fill="#e9e0ff"/><g transform="translate(28 23)"><rect width="36" height="36" rx="7" fill="#7f5ad9"/><text x="18" y="24" textAnchor="middle" fill="white" fontSize="20" fontWeight="800">1</text></g><g transform="translate(72 23)"><rect width="36" height="36" rx="7" fill="#5d9ee8"/><text x="18" y="24" textAnchor="middle" fill="white" fontSize="20" fontWeight="800">2</text></g><g transform="translate(116 23)"><rect width="36" height="36" rx="7" fill="#e98c77"/><text x="18" y="24" textAnchor="middle" fill="white" fontSize="20" fontWeight="800">3</text></g><g transform="translate(50 67)"><rect width="36" height="36" rx="7" fill="#54a678"/><text x="18" y="24" textAnchor="middle" fill="white" fontSize="20" fontWeight="800">4</text></g><g transform="translate(94 67)"><rect width="36" height="36" rx="7" fill="#e8b64f"/><text x="18" y="24" textAnchor="middle" fill="white" fontSize="20" fontWeight="800">5</text></g></svg>,
 writing:<svg viewBox="0 0 180 120"><rect width="180" height="120" rx="18" fill="#f5e8ff"/><path d="M34 25 H146 V98 H34Z" fill="white" stroke="#d6c7ef" strokeWidth="3"/><path d="M48 47 H132 M48 70 H132" stroke="#d9dce4" strokeWidth="2"/><text x="62" y="83" fontSize="70" fontFamily="cursive" fill="#7650c8">m</text><path d="M124 21 l25 -10 -10 25 -44 44 -17 4 5 -17Z" fill="#f0a463"/></svg>,
 science:<svg viewBox="0 0 180 120"><rect width="180" height="120" rx="18" fill="#def4ff"/><path d="M78 18 H102 V50 L134 98 Q138 108 126 108 H54 Q42 108 47 98 L78 50Z" fill="white" stroke="#4b88a8" strokeWidth="4"/><path d="M58 86 Q90 66 122 86 L132 101 H49Z" fill="#65c3e8"/><circle cx="73" cy="80" r="7" fill="#bdf4ff"/><circle cx="104" cy="88" r="5" fill="#bdf4ff"/></svg>
 };return <div className="activity-artwork">{map[kind]||map.forest}</div>}
