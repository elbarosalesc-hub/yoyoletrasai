import type {ReactNode} from 'react'

type ArtKind='forest'|'reading'|'math'|'writing'|'teacher'|'science'|'nature'|'sequence'

export function ForestHeroArtwork(){
 return <svg className="ref-forest-art" viewBox="0 0 980 470" role="img" aria-label="Niña exploradora en un bosque mágico">
  <defs>
   <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8fd0ef"/><stop offset=".52" stopColor="#c8edf0"/><stop offset="1" stopColor="#f9d999"/></linearGradient>
   <linearGradient id="hill1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4f9b69"/><stop offset="1" stopColor="#2f7651"/></linearGradient>
   <linearGradient id="hill2" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#356f55"/><stop offset="1" stopColor="#1b4c3d"/></linearGradient>
   <linearGradient id="path" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#f5d685"/><stop offset=".5" stopColor="#f9e4a9"/><stop offset="1" stopColor="#e7bc68"/></linearGradient>
   <linearGradient id="dress" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#8d65ff"/><stop offset="1" stopColor="#5d36ca"/></linearGradient>
   <radialGradient id="glow"><stop offset="0" stopColor="#fff6bd" stopOpacity=".9"/><stop offset="1" stopColor="#fff6bd" stopOpacity="0"/></radialGradient>
   <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#153b30" floodOpacity=".28"/></filter>
   <filter id="soft"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <rect width="980" height="470" rx="28" fill="url(#sky)"/>
  <circle cx="820" cy="82" r="44" fill="#ffd96e" opacity=".95"/>
  <circle cx="820" cy="82" r="92" fill="url(#glow)"/>
  <g fill="#fff" opacity=".82"><ellipse cx="150" cy="82" rx="70" ry="26"/><ellipse cx="215" cy="78" rx="48" ry="20"/><ellipse cx="668" cy="58" rx="58" ry="22"/><ellipse cx="719" cy="54" rx="38" ry="16"/></g>
  <path d="M0 240 C120 168 215 183 330 242 C435 296 515 166 650 210 C760 246 835 181 980 229 L980 470 L0 470Z" fill="url(#hill1)"/>
  <path d="M0 285 C110 220 235 265 348 313 C470 365 560 226 700 286 C820 336 885 251 980 280 L980 470 L0 470Z" fill="url(#hill2)"/>
  <path d="M418 470 C428 382 468 322 501 287 C538 326 584 382 598 470Z" fill="url(#path)" opacity=".96"/>
  <g opacity=".58" filter="url(#soft)"><ellipse cx="147" cy="403" rx="115" ry="38" fill="#d4f1aa"/><ellipse cx="810" cy="405" rx="128" ry="38" fill="#a7e28a"/></g>
  <g filter="url(#shadow)">
   <g transform="translate(70 152)"><rect x="38" y="75" width="30" height="150" rx="12" fill="#805332"/><circle cx="53" cy="60" r="65" fill="#3d8455"/><circle cx="16" cy="85" r="46" fill="#58a668"/><circle cx="91" cy="90" r="50" fill="#4d9760"/></g>
   <g transform="translate(805 148)"><rect x="43" y="90" width="28" height="146" rx="12" fill="#764b2d"/><circle cx="58" cy="67" r="72" fill="#397b50"/><circle cx="10" cy="103" r="48" fill="#4c9660"/><circle cx="106" cy="104" r="50" fill="#58a668"/></g>
   <g transform="translate(719 214)"><path d="M10 90 L90 26 L170 90Z" fill="#d35d54"/><rect x="30" y="88" width="120" height="96" rx="8" fill="#f3c37b"/><rect x="75" y="116" width="38" height="68" rx="5" fill="#8d5d3d"/><rect x="43" y="108" width="25" height="25" rx="3" fill="#6fc0d5"/><rect x="117" y="108" width="25" height="25" rx="3" fill="#6fc0d5"/></g>
  </g>
  <g transform="translate(433 135)" filter="url(#shadow)">
   <ellipse cx="75" cy="92" rx="58" ry="62" fill="#f5b778"/>
   <path d="M22 78 C12 20 46 -5 85 2 C127 8 142 38 126 83 C113 47 94 34 68 34 C46 34 32 48 22 78Z" fill="#4b2d2a"/>
   <path d="M19 67 C12 14 46 -15 92 4 C120 16 140 46 124 75 C109 42 90 30 64 31 C45 31 31 42 19 67Z" fill="#2f201f"/>
   <circle cx="52" cy="89" r="5" fill="#2a201d"/><circle cx="98" cy="89" r="5" fill="#2a201d"/>
   <path d="M58 111 Q76 124 94 111" fill="none" stroke="#a54f45" strokeWidth="4" strokeLinecap="round"/>
   <path d="M44 132 C23 151 20 210 31 274 L119 274 C131 212 127 154 105 132Z" fill="url(#dress)"/>
   <path d="M29 151 C10 169 -5 201 6 210 C18 218 34 187 42 166Z" fill="#f5b778"/>
   <path d="M112 151 C132 167 145 194 135 203 C124 213 111 187 103 166Z" fill="#f5b778"/>
   <rect x="43" y="265" width="27" height="82" rx="14" fill="#6c48d9"/><rect x="83" y="265" width="27" height="82" rx="14" fill="#6c48d9"/>
   <ellipse cx="57" cy="348" rx="25" ry="11" fill="#273f66"/><ellipse cx="96" cy="348" rx="25" ry="11" fill="#273f66"/>
   <path d="M43 139 Q75 159 108 138" fill="none" stroke="#bb9aff" strokeWidth="7" strokeLinecap="round"/>
   <circle cx="75" cy="15" r="12" fill="#8d65ff"/>
  </g>
  <g fill="#f9e67a"><circle cx="347" cy="205" r="4"/><circle cx="617" cy="170" r="4"/><circle cx="637" cy="256" r="3"/><circle cx="270" cy="322" r="3"/></g>
  <g stroke="#fff" strokeWidth="3" fill="none" opacity=".8"><path d="M333 190 q18 -18 36 0 q-18 18 -36 0Z"/><path d="M625 148 q18 -18 36 0 q-18 18 -36 0Z"/></g>
  <g transform="translate(205 372)"><circle cx="0" cy="0" r="7" fill="#f3ca57"/><circle cx="16" cy="-5" r="8" fill="#ed7e82"/><circle cx="34" cy="2" r="7" fill="#8d65ff"/><path d="M0 8 v28 M16 4 v32 M34 10 v26" stroke="#386b4b" strokeWidth="4"/></g>
  <g transform="translate(740 379)"><circle cx="0" cy="0" r="7" fill="#f3ca57"/><circle cx="18" cy="-4" r="8" fill="#ed7e82"/><circle cx="38" cy="4" r="7" fill="#8d65ff"/><path d="M0 8 v28 M18 4 v32 M38 10 v26" stroke="#386b4b" strokeWidth="4"/></g>
 </svg>
}

function CardFrame({children,from,to}:{children:ReactNode;from:string;to:string}){
 return <svg className="ref-card-art" viewBox="0 0 260 165" aria-hidden="true"><defs><linearGradient id={`g-${from.replace('#','')}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={from}/><stop offset="1" stopColor={to}/></linearGradient></defs><rect width="260" height="165" rx="20" fill={`url(#g-${from.replace('#','')})`}/>{children}</svg>
}

export function PremiumCardArtwork({kind}:{kind:ArtKind}){
 if(kind==='reading')return <CardFrame from="#dff3ea" to="#f9edc8"><circle cx="52" cy="41" r="18" fill="#efb16f"/><path d="M31 72 Q52 51 73 72 V118 H31Z" fill="#8259d9"/><path d="M72 75 Q111 58 132 77 V129 Q106 113 72 126Z" fill="#fff" stroke="#365f79" strokeWidth="4"/><path d="M132 77 Q153 58 192 75 V126 Q158 113 132 129Z" fill="#fff" stroke="#365f79" strokeWidth="4"/><path d="M86 88 h32 M86 100 h34 M146 88 h32 M146 100 h31" stroke="#8fb2c2" strokeWidth="4" strokeLinecap="round"/></CardFrame>
 if(kind==='math')return <CardFrame from="#efe6ff" to="#ffe6cc"><rect x="36" y="28" width="46" height="46" rx="12" fill="#6f50d8"/><rect x="91" y="28" width="46" height="46" rx="12" fill="#4fa3cf"/><rect x="146" y="28" width="46" height="46" rx="12" fill="#ed8a72"/><rect x="64" y="83" width="46" height="46" rx="12" fill="#58a56e"/><rect x="119" y="83" width="46" height="46" rx="12" fill="#f4c95e"/><g fill="#fff" fontFamily="Arial" fontWeight="800" fontSize="23" textAnchor="middle"><text x="59" y="59">1</text><text x="114" y="59">2</text><text x="169" y="59">3</text><text x="87" y="114">4</text><text x="142" y="114">5</text></g></CardFrame>
 if(kind==='writing')return <CardFrame from="#f6e4fb" to="#fff1c9"><path d="M67 120 C91 83 118 73 149 69" fill="none" stroke="#7b56cf" strokeWidth="6" strokeLinecap="round"/><path d="M86 119 q23 -37 46 0" fill="none" stroke="#7b56cf" strokeWidth="6" strokeLinecap="round"/><g transform="rotate(-34 163 72)"><rect x="119" y="57" width="99" height="22" rx="11" fill="#f4a760"/><polygon points="218,57 242,68 218,79" fill="#f8dfb6"/><polygon points="236,65 246,68 236,71" fill="#3b3b3b"/><rect x="119" y="57" width="18" height="22" rx="7" fill="#ee7383"/></g></CardFrame>
 if(kind==='teacher')return <CardFrame from="#e8f3ff" to="#fff2d6"><circle cx="75" cy="50" r="25" fill="#eab274"/><path d="M49 53 Q44 14 79 14 Q111 15 103 54 Q92 31 74 31 Q57 31 49 53Z" fill="#3e2a28"/><path d="M40 130 Q42 78 75 77 Q109 78 111 130Z" fill="#49a5a5"/><rect x="128" y="34" width="95" height="75" rx="12" fill="#fff"/><path d="M146 55 h60 M146 71 h48 M146 87 h55" stroke="#8eaeae" strokeWidth="6" strokeLinecap="round"/><circle cx="155" cy="128" r="17" fill="#f3ca60"/><path d="M146 128 l6 6 l12 -15" fill="none" stroke="#356d53" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></CardFrame>
 if(kind==='science')return <CardFrame from="#dff5f2" to="#e4edff"><path d="M103 29 h54 v12 h-8 v42 l34 58 H77 l34 -58 V41 h-8Z" fill="#fff" stroke="#32798d" strokeWidth="5"/><path d="M89 117 h82 l12 24 H77Z" fill="#62c9da"/><circle cx="114" cy="112" r="8" fill="#fff" opacity=".8"/><circle cx="145" cy="126" r="6" fill="#fff" opacity=".75"/><circle cx="133" cy="100" r="5" fill="#fff" opacity=".8"/></CardFrame>
 if(kind==='nature')return <CardFrame from="#dff3e7" to="#fff0c8"><path d="M37 132 L86 42 L136 132Z" fill="#2f7c53"/><rect x="80" y="126" width="12" height="25" rx="5" fill="#84502f"/><circle cx="190" cy="47" r="25" fill="#f5ce63"/><path d="M149 138 Q163 88 198 84 Q222 82 236 118 Q210 145 149 138Z" fill="#5ba76a"/><circle cx="176" cy="85" r="16" fill="#e9aa72"/><path d="M158 101 q18 -20 36 0 v34 h-36Z" fill="#7b56cf"/></CardFrame>
 if(kind==='sequence')return <CardFrame from="#e6efff" to="#fce8ec"><rect x="27" y="33" width="55" height="84" rx="13" fill="#fff"/><rect x="103" y="33" width="55" height="84" rx="13" fill="#fff"/><rect x="179" y="33" width="55" height="84" rx="13" fill="#fff"/><circle cx="54" cy="57" r="12" fill="#f4c861"/><path d="M39 98 q14 -28 30 0" fill="#5b9c6b"/><circle cx="130" cy="56" r="13" fill="#5b9c6b"/><path d="M116 97 q14 -30 29 0" fill="#8d65e6"/><circle cx="206" cy="55" r="13" fill="#ed8a72"/><path d="M190 97 q16 -30 31 0" fill="#4fa1c6"/><path d="M83 76 h16 M159 76 h16" stroke="#6a7c82" strokeWidth="5" strokeLinecap="round"/></CardFrame>
 return <CardFrame from="#e4f2ec" to="#fff0d5"><circle cx="130" cy="82" r="42" fill="#fff"/><path d="M105 83 h50 M130 58 v50" stroke="#6c59d9" strokeWidth="8" strokeLinecap="round"/></CardFrame>
}
