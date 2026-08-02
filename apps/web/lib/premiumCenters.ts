export type PremiumCenterId='matematica'|'ciencias'|'caligrafia'|'grafomotricidad'|'pictogramas'|'plan-lector'

export type PremiumCenter={
 id:PremiumCenterId
 title:string
 shortTitle:string
 description:string
 audience:string
 photo:string
 accent:string
 tools:{title:string;description:string;route:string;tag:string}[]
 features:string[]
}

export const premiumCenters:PremiumCenter[]=[
 {
  id:'matematica',title:'Laboratorio Matemático',shortTitle:'Matemática',accent:'#6759e8',
  description:'Herramientas visuales, manipulativas e interactivas para comprender números, operaciones, geometría, medición, datos y resolución de problemas.',
  audience:'1.º básico a 4.º medio',photo:'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1400&q=86',
  features:['Material concreto digital','Explicación paso a paso','Modo sin límite de tiempo','Registro por habilidad'],
  tools:[
   {title:'Valor posicional interactivo',description:'Construye números con bloques base diez, tabla posicional y lectura guiada.',route:'/biblioteca/decimales-posicional',tag:'Manipulativo'},
   {title:'Fracciones visuales',description:'Representa, compara y opera fracciones con círculos, barras y situaciones cotidianas.',route:'/biblioteca/fracciones-visuales',tag:'Visual'},
   {title:'Perímetro y área',description:'Explora figuras, cuadrículas y procedimientos con retroalimentación inmediata.',route:'/biblioteca/perimetro-area',tag:'Geometría'},
   {title:'Tablas del 6 y 7',description:'Práctica progresiva, rompecabezas y desafío cooperativo.',route:'/biblioteca/tablas-6-7',tag:'Juego'},
  ]
 },
 {
  id:'ciencias',title:'Exploratorio de Ciencias',shortTitle:'Ciencias',accent:'#118b78',
  description:'Experiencias guiadas, modelos, simulaciones y fichas de observación para aprender ciencias investigando y explicando fenómenos.',
  audience:'Educación parvularia a 4.º medio',photo:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=86',
  features:['Método científico guiado','Simulaciones seguras','Vocabulario visual','Cuaderno de evidencias'],
  tools:[
   {title:'Sistema solar',description:'Modelo visual de planetas, movimientos y escalas adaptadas al nivel.',route:'/biblioteca/sistema-solar',tag:'Astronomía'},
   {title:'Ciclo del agua',description:'Secuencia interactiva, cambios de estado y preguntas de comprensión.',route:'/biblioteca/ciclo-agua',tag:'Tierra'},
   {title:'Cuerpo humano',description:'Explora sistemas, órganos y hábitos saludables con apoyos visuales.',route:'/biblioteca/cuerpo-humano',tag:'Biología'},
   {title:'Efectos del humo',description:'Recurso informativo accesible sobre componentes y consecuencias del cigarrillo.',route:'/biblioteca/humo-cigarrillo',tag:'Salud'},
  ]
 },
 {
  id:'caligrafia',title:'Taller de Caligrafía',shortTitle:'Caligrafía',accent:'#d55e77',
  description:'Generador de trazos, letras, palabras y textos con pauta personalizable, modelado animado y progresión desde imprenta a ligada.',
  audience:'Prekínder a 6.º básico',photo:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=86',
  features:['Pauta configurable','Mano dominante','Modelo animado','Impresión en alto contraste'],
  tools:[
   {title:'Abecedario progresivo',description:'Mayúscula, minúscula, imprenta y ligada con dirección del trazo.',route:'/caligrafia',tag:'Generador'},
   {title:'Nombre y palabras',description:'Crea fichas personalizadas con el nombre del estudiante y vocabulario funcional.',route:'/caligrafia',tag:'Personalizable'},
   {title:'Copia breve',description:'Oraciones graduadas con tamaño, interlineado y pauta adaptables.',route:'/caligrafia',tag:'Escritura'},
   {title:'Alta visibilidad',description:'Versión con contraste reforzado, letra ampliada y menor carga visual.',route:'/caligrafia',tag:'Accesible'},
  ]
 },
 {
  id:'grafomotricidad',title:'Estudio de Grafomotricidad',shortTitle:'Grafomotricidad',accent:'#e48b31',
  description:'Circuitos motores y fichas graduadas para fortalecer coordinación visomotora, control postural, presión y direccionalidad.',
  audience:'2 a 8 años y apoyos PIE',photo:'https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=1400&q=86',
  features:['Progresión por dificultad','Trazos amplios y limpios','Modo pantalla e impresión','Registro de desempeño'],
  tools:[
   {title:'Trazos iniciales',description:'Líneas rectas, curvas, ondas y espirales con recorrido visual claro.',route:'/biblioteca/grafomotricidad',tag:'Inicial'},
   {title:'Caminos y laberintos',description:'Recorridos temáticos con control de precisión y dificultad regulable.',route:'/biblioteca/grafomotricidad',tag:'Coordinación'},
   {title:'Formas pregráficas',description:'Patrones que preparan los movimientos necesarios para escribir letras.',route:'/biblioteca/grafomotricidad',tag:'Preescritura'},
   {title:'Motricidad fina',description:'Actividades complementarias de pinza, recorte, ensarte y modelado.',route:'/biblioteca/grafomotricidad',tag:'Manipulativo'},
  ]
 },
 {
  id:'pictogramas',title:'Banco de Pictogramas y Comunicación',shortTitle:'Pictogramas',accent:'#3587d4',
  description:'Comunicadores, agendas, instrucciones visuales y tableros de elección para anticipar, comprender y expresar necesidades.',
  audience:'Aula común, PIE y familias',photo:'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1400&q=86',
  features:['Lenguaje claro','Tableros editables','Rutinas visuales','Uso escolar y familiar'],
  tools:[
   {title:'Agenda visual diaria',description:'Organiza momentos, anticipa cambios y marca actividades completadas.',route:'/biblioteca/rutina-visual',tag:'Rutina'},
   {title:'Instrucciones por pasos',description:'Transforma una tarea en secuencias breves con apoyos visuales.',route:'/biblioteca/comprension-instrucciones',tag:'Comprensión'},
   {title:'Panel de emociones',description:'Reconoce intensidad emocional y selecciona estrategias de regulación.',route:'/biblioteca/semaforo-emociones',tag:'Autorregulación'},
   {title:'Tablero de comunicación',description:'Solicitar ayuda, descanso, materiales, baño o expresar preferencias.',route:'/inclusion',tag:'Comunicación'},
  ]
 },
 {
  id:'plan-lector',title:'Plan Lector Adaptativo',shortTitle:'Plan lector',accent:'#7c54bc',
  description:'Rutas de lectura por nivel con textos originales, lectura modelada, velocidad, vocabulario, comprensión y seguimiento individual.',
  audience:'1.º básico a 4.º medio',photo:'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=86',
  features:['Textos originales','Lectura en voz alta','Comprensión graduada','Panel de progreso lector'],
  tools:[
   {title:'Fluidez y velocidad',description:'Cronómetro, palabras por minuto, calidad, precisión y entonación.',route:'/herramientas/aula',tag:'Fluidez'},
   {title:'Secuencia del cuento',description:'Ordena acciones, reconoce inicio, desarrollo y cierre.',route:'/biblioteca/secuencia-cuento',tag:'Comprensión'},
   {title:'Personajes y ambiente',description:'Identifica rasgos, motivaciones, lugares y relaciones del texto.',route:'/biblioteca/personajes-ambiente',tag:'Análisis'},
   {title:'Idea principal',description:'Distingue información central, detalles y propósito del texto.',route:'/biblioteca/idea-principal',tag:'Estrategia'},
  ]
 }
]
