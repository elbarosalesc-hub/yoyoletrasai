export function ForestScene(){
 return <svg className="forest-scene" viewBox="0 0 960 540" role="img" aria-label="Niña explorando un bosque mágico con una linterna">
  <defs>
   <linearGradient id="v3sky" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#172866"/><stop offset=".55" stopColor="#164d66"/><stop offset="1" stopColor="#0c2d49"/></linearGradient>
   <linearGradient id="v3back" x1="0" x2="1"><stop stopColor="#255f66"/><stop offset="1" stopColor="#183e58"/></linearGradient>
   <linearGradient id="v3front" x1="0" x2="1"><stop stopColor="#174c45"/><stop offset="1" stopColor="#0a293b"/></linearGradient>
   <radialGradient id="v3moon"><stop stopColor="#fff3a6" stopOpacity=".95"/><stop offset="1" stopColor="#fff3a6" stopOpacity="0"/></radialGradient>
   <radialGradient id="v3torch"><stop stopColor="#fffbd0" stopOpacity=".95"/><stop offset=".45" stopColor="#ffe76f" stopOpacity=".45"/><stop offset="1" stopColor="#ffe76f" stopOpacity="0"/></radialGradient>
   <filter id="v3shadow"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#020918" floodOpacity=".32"/></filter>
  </defs>
  <rect width="960" height="540" fill="url(#v3sky)"/>
  <circle cx="755" cy="95" r="104" fill="url(#v3moon)"/><circle cx="755" cy="95" r="43" fill="#fff0a8"/>
  <path d="M0 290c128-82 237-72 338-14 84 48 151 40 238-24 118-86 251-77 384 4v284H0Z" fill="url(#v3back)"/>
  <path d="M0 360c104-78 206-86 315-22 90 53 158 48 244-11 122-84 263-60 401 42v171H0Z" fill="url(#v3front)"/>
  <g opacity=".9"><g transform="translate(50 118)"><rect x="34" y="104" width="24" height="218" rx="12" fill="#12343c"/><path d="M46 0 0 125h92Z" fill="#0e4a48"/><path d="M46 45 5 161h82Z" fill="#0b3e42"/></g><g transform="translate(830 122)"><rect x="34" y="104" width="24" height="218" rx="12" fill="#12343c"/><path d="M46 0 0 125h92Z" fill="#0e4a48"/><path d="M46 45 5 161h82Z" fill="#0b3e42"/></g></g>
  <g transform="translate(675 236)" filter="url(#v3shadow)"><rect x="15" y="80" width="160" height="112" rx="8" fill="#7b443d"/><path d="M0 88 94 15l98 73-20 23-78-58-77 58Z" fill="#b35f4c"/><rect x="116" y="117" width="34" height="43" rx="4" fill="#ffe678"/><rect x="47" y="130" width="38" height="62" rx="19" fill="#4f3135"/></g>
  <ellipse cx="664" cy="376" rx="175" ry="138" fill="url(#v3torch)"/>
  <g transform="translate(520 214)" filter="url(#v3shadow)"><circle cx="82" cy="62" r="45" fill="#f3b27d"/><path d="M37 67c-3-42 23-69 63-63 27 4 44 22 48 49-18-15-36-21-55-18-20 3-34 15-56 32Z" fill="#33263e"/><circle cx="104" cy="62" r="4.5" fill="#292331"/><path d="M103 80c10 7 21 6 29-3" stroke="#b85c52" strokeWidth="4" fill="none" strokeLinecap="round"/><path d="M56 103c-24 16-38 43-40 77l3 95h117l5-95c-2-36-18-61-43-77Z" fill="#7441e5"/><path d="M122 125c25 22 48 36 80 42" stroke="#f3b27d" strokeWidth="15" fill="none" strokeLinecap="round"/><path d="M198 166 244 181" stroke="#9a7144" strokeWidth="8" strokeLinecap="round"/><circle cx="250" cy="183" r="15" fill="#ffe76f"/><circle cx="250" cy="183" r="30" fill="url(#v3torch)"/><path d="M55 276 46 340M111 276l17 64" stroke="#352c73" strokeWidth="20" strokeLinecap="round"/><path d="m26 341 48 1m32 0h51" stroke="#20253e" strokeWidth="18" strokeLinecap="round"/></g>
  <g fill="#ffe766"><circle cx="452" cy="315" r="4"/><circle cx="620" cy="176" r="3"/><circle cx="842" cy="338" r="4"/><circle cx="377" cy="232" r="3"/></g>
 </svg>
}
