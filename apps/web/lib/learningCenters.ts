export type LearningCenter={
 slug:string
 title:string
 eyebrow:string
 description:string
 image:string
 accent:string
 href:string
 tools:{title:string;description:string;tag:string;href:string}[]
}

export const learningCenters:LearningCenter[]=[
 {
  slug:'matematica',title:'MathLab interactivo',eyebrow:'Matemática',accent:'#6558e8',href:'/herramientas/aula',
  image:'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=85',
  description:'Manipulativos, cálculo, geometría, medición y resolución de problemas con progresión visual y apoyos concretos.',
  tools:[
   {title:'Bloques base diez',description:'Representa unidades, decenas, centenas y transformaciones con material visual.',tag:'Numeración',href:'/biblioteca/decimales-posicional'},
   {title:'Fracciones visuales',description:'Compara, compone y representa fracciones mediante círculos y barras.',tag:'Fracciones',href:'/biblioteca/fracciones-visuales'},
   {title:'Perímetro y área',description:'Construye figuras y observa cómo cambian sus medidas.',tag:'Geometría',href:'/biblioteca/perimetro-area'},
   {title:'Tablas 6 y 7',description:'Práctica graduada con desafíos, retroalimentación y registro de avance.',tag:'Cálculo',href:'/biblioteca/tablas-6-7'},
   {title:'Calculadoras docentes',description:'Nota, velocidad lectora, grupos, tiempo y selección equitativa.',tag:'Aula',href:'/herramientas/aula'},
  ]
 },
 {
  slug:'ciencias',title:'Laboratorio de Ciencias',eyebrow:'Ciencias',accent:'#1c9b73',href:'/simuladores',
  image:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85',
  description:'Exploraciones seguras y visuales sobre naturaleza, cuerpo humano, materia, energía, Tierra y universo.',
  tools:[
   {title:'Sistema solar',description:'Orden, movimiento y características de planetas mediante una experiencia guiada.',tag:'Universo',href:'/biblioteca/sistema-solar'},
   {title:'Ciclo del agua',description:'Secuencia interactiva con evaporación, condensación, precipitación y acumulación.',tag:'Tierra',href:'/biblioteca/ciclo-agua'},
   {title:'Cuerpo humano',description:'Relaciona órganos, sistemas y funciones con apoyos visuales claros.',tag:'Biología',href:'/biblioteca/cuerpo-humano'},
   {title:'Circuitos eléctricos',description:'Construye y prueba circuitos simples en un entorno sin riesgos.',tag:'Física',href:'/simuladores'},
   {title:'Ecosistemas',description:'Clasifica seres vivos y comprende relaciones alimentarias y ambientales.',tag:'Naturaleza',href:'/biblioteca/ecosystem'},
  ]
 },
 {
  slug:'caligrafia',title:'Taller de Caligrafía',eyebrow:'Escritura',accent:'#dd6b55',href:'/caligrafia',
  image:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85',
  description:'Modelos manuscritos, pauta configurable, direccionalidad, enlaces y práctica gradual lista para imprimir.',
  tools:[
   {title:'Abecedario manuscrito',description:'Mayúsculas y minúsculas con punto de inicio, dirección y pauta.',tag:'Inicial',href:'/caligrafia'},
   {title:'Generador de palabras',description:'Crea hojas personalizadas con nombres, vocabulario y frases.',tag:'Personalizable',href:'/caligrafia'},
   {title:'Escritura ligada',description:'Práctica progresiva de enlaces, tamaño, separación e inclinación.',tag:'Avanzado',href:'/caligrafia'},
   {title:'Pauta ampliada',description:'Formato de alto contraste y tamaño ajustable para baja visión.',tag:'Accesibilidad',href:'/caligrafia'},
  ]
 },
 {
  slug:'grafomotricidad',title:'Estudio Grafomotor',eyebrow:'Motricidad fina',accent:'#e39a35',href:'/caligrafia',
  image:'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=85',
  description:'Trazos preparatorios, coordinación visomotora, caminos, patrones y progresión desde movimientos amplios a precisos.',
  tools:[
   {title:'Trazos rectos y curvos',description:'Secuencias graduadas con inicio y final claramente señalados.',tag:'Nivel 1',href:'/caligrafia'},
   {title:'Caminos temáticos',description:'Recorridos con animales, naturaleza y objetos cotidianos realistas.',tag:'Motivación',href:'/caligrafia'},
   {title:'Patrones y simetría',description:'Continúa series gráficas y completa figuras de manera guiada.',tag:'Nivel 2',href:'/caligrafia'},
   {title:'Recorte y coordinación',description:'Líneas de corte, punzado y seguimiento visual progresivo.',tag:'Motricidad',href:'/caligrafia'},
  ]
 },
 {
  slug:'pictogramas',title:'Comunicador Visual',eyebrow:'Pictogramas',accent:'#3d87d5',href:'/inclusion',
  image:'https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=1200&q=85',
  description:'Rutinas, anticipadores, tableros de comunicación y apoyos visuales personalizables para aula, hogar y autonomía.',
  tools:[
   {title:'Agenda visual',description:'Organiza la jornada con pasos movibles, estados y anticipación de cambios.',tag:'Rutina',href:'/biblioteca/routine'},
   {title:'Primero y después',description:'Apoyo simple para secuencias, transición y finalización de tareas.',tag:'TEA',href:'/inclusion'},
   {title:'Semáforo emocional',description:'Identifica emociones, intensidad y estrategias de regulación.',tag:'Convivencia',href:'/biblioteca/semaforo-emociones'},
   {title:'Tablero de necesidades',description:'Comunicación funcional para pedir ayuda, pausa, agua o baño.',tag:'Comunicación',href:'/inclusion'},
   {title:'Historias sociales',description:'Plantillas editables para explicar situaciones y conductas esperadas.',tag:'Autonomía',href:'/inclusion'},
  ]
 },
 {
  slug:'plan-lector',title:'Plan Lector Inteligente',eyebrow:'Lectura',accent:'#a95bb8',href:'/biblioteca?subject=Lenguaje',
  image:'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85',
  description:'Rutas lectoras por nivel, fluidez, comprensión, vocabulario, inferencias, seguimiento y recomendaciones para cada estudiante.',
  tools:[
   {title:'Diagnóstico lector',description:'Registra precisión, velocidad, calidad, entonación y comprensión.',tag:'Evaluación',href:'/evaluaciones'},
   {title:'Lecturas graduadas',description:'Textos por extensión, complejidad, intereses y habilidades curriculares.',tag:'Biblioteca',href:'/biblioteca'},
   {title:'Comprensión explícita',description:'Localiza información, personajes, ambiente y secuencias.',tag:'Comprensión',href:'/biblioteca/personajes-ambiente'},
   {title:'Inferencias y vocabulario',description:'Interpreta pistas, significado contextual e idea principal.',tag:'Profundización',href:'/biblioteca/vocabulario-contexto'},
   {title:'Progreso lector',description:'Visualiza metas, evidencias, sesiones y próximos apoyos.',tag:'Seguimiento',href:'/progreso'},
  ]
 }
]
