export type LearningCenter={
 slug:string
 title:string
 subtitle:string
 description:string
 image:string
 accent:string
 audiences:string[]
 tools:{title:string;description:string;href:string;badge:string}[]
 resources:string[]
 premium:string[]
}

export const learningCenters:LearningCenter[]=[
 {
  slug:'matematica',title:'MathLab',subtitle:'Matemática visual, manipulativa y adaptativa',description:'Herramientas para comprender, practicar y evaluar numeración, cálculo, geometría, medición, datos y resolución de problemas.',image:'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1600&q=85',accent:'indigo',audiences:['1.º básico a 4.º medio','PIE y DUA','Docentes y estudiantes'],
  tools:[
   {title:'Material base diez',description:'Construye, agrupa, canjea y descompone números con representación visual.',href:'/biblioteca/valor-posicional',badge:'Manipulativo'},
   {title:'Laboratorio de operaciones',description:'Resuelve adiciones, sustracciones, multiplicaciones y divisiones con modelado paso a paso.',href:'/biblioteca/division-paso-a-paso',badge:'Tutor guiado'},
   {title:'Geometría interactiva',description:'Explora ángulos, perímetro, área, cuerpos y transformaciones mediante modelos dinámicos.',href:'/biblioteca/perimetro-area',badge:'Simulador'},
   {title:'Juegos matemáticos',description:'Rompecabezas, desafíos, ruletas y misiones sin penalizar distintos ritmos de respuesta.',href:'/biblioteca/tabla-6-rompecabezas',badge:'Gamificación'}
  ],resources:['Numeración y valor posicional','Operatorias y cálculo mental','Fracciones y decimales','Geometría y medición','Datos y probabilidades','Problemas PAES'],premium:['Explicación visual de cada paso','Dificultad graduable','Modo sin tiempo','Pauta automática','Registro por habilidad']
 },
 {
  slug:'ciencias',title:'ScienceLab',subtitle:'Explorar, experimentar y explicar',description:'Experiencias científicas seguras con simulaciones, organizadores visuales, guías de indagación y registro de hipótesis.',image:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1600&q=85',accent:'emerald',audiences:['Educación básica y media','Laboratorio y aula','Aprendizaje basado en indagación'],
  tools:[
   {title:'Simuladores científicos',description:'Modifica variables y observa consecuencias en ecosistemas, circuitos, materia, fuerza y energía.',href:'/biblioteca/ecosistema-equilibrio',badge:'Simulación'},
   {title:'Cuaderno de indagación',description:'Formula preguntas, hipótesis, procedimiento, resultados y conclusiones con apoyos visuales.',href:'/crear',badge:'Creador'},
   {title:'Modelos del cuerpo humano',description:'Explora sistemas y funciones con lenguaje claro, capas visuales y glosario.',href:'/biblioteca/cuerpo-humano',badge:'Modelo visual'},
   {title:'Experimentos seguros',description:'Protocolos imprimibles con materiales, advertencias, variables y pauta de observación.',href:'/biblioteca/circuito-electrico',badge:'Guía práctica'}
  ],resources:['Seres vivos y ecosistemas','Cuerpo humano y salud','Materia y energía','Tierra y universo','Física y química','Método científico'],premium:['Simulación sin riesgo','Lectura mediada','Glosario visual','Registro de evidencia','Conclusión guiada']
 },
 {
  slug:'caligrafia',title:'Caligrafía',subtitle:'Trazos claros, progresivos y personalizables',description:'Secuencias de escritura en imprenta y manuscrita, con dirección del trazo, pauta graduable y versiones diestra y zurda.',image:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=85',accent:'rose',audiences:['Kínder a 4.º básico','Inicio lector','Apoyo psicopedagógico'],
  tools:[
   {title:'Abecedario completo',description:'Mayúsculas y minúsculas con punto de inicio, dirección, sonido y palabra asociada.',href:'/biblioteca/caligrafia-m',badge:'Interactivo'},
   {title:'Generador de pautas',description:'Crea hojas con pauta simple, doble, triple o cuadriculada y tamaño de letra ajustable.',href:'/crear',badge:'Generador'},
   {title:'Palabras y oraciones',description:'Práctica progresiva desde sílabas hasta oraciones breves con copia significativa.',href:'/biblioteca/vocabulario-contexto',badge:'Progresión'},
   {title:'Modo accesible',description:'Alto contraste, letra ampliada, menos estímulos y orientación para mano izquierda.',href:'/inclusion',badge:'DUA'}
  ],resources:['Vocales y consonantes','Imprenta y manuscrita','Sílabas y palabras','Oraciones y textos breves','Firma y escritura funcional','Pautas personalizadas'],premium:['Dirección animada del trazo','Corrección amable','Impresión en blanco y negro','Modo zurdo','Tipografía y pauta ajustables']
 },
 {
  slug:'grafomotricidad',title:'Grafomotricidad',subtitle:'Movimiento, coordinación y preparación para escribir',description:'Recorridos progresivos, patrones, laberintos y trazos temáticos que fortalecen coordinación visomotora y control manual.',image:'https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=1600&q=85',accent:'amber',audiences:['Prekínder a 2.º básico','Terapia ocupacional','Necesidades de apoyo motor'],
  tools:[
   {title:'Rutas y recorridos',description:'Líneas rectas, curvas, ondas, espirales y bucles con progresión de dificultad.',href:'/biblioteca/trazos-animales',badge:'Trazado'},
   {title:'Laberintos graduados',description:'Caminos amplios o estrechos con control de precisión y opción sin tiempo.',href:'/crear',badge:'Motricidad fina'},
   {title:'Patrones y simetría',description:'Completa secuencias visuales y figuras simétricas antes de pasar a grafías.',href:'/biblioteca/secuencia-cuento',badge:'Percepción visual'},
   {title:'Panel de progreso',description:'Registra agarre, dirección, presión, continuidad y autonomía sin calificación punitiva.',href:'/evidencias',badge:'Seguimiento'}
  ],resources:['Trazos horizontales y verticales','Curvas y ondas','Espirales y bucles','Laberintos','Patrones y simetría','Coordinación ojo-mano'],premium:['Grosor regulable','Punto de inicio visible','Flechas direccionales','Repetición ilimitada','Registro de progreso motor']
 },
 {
  slug:'pictogramas',title:'Pictogramas y comunicación',subtitle:'Comprender, anticipar, elegir y expresarse',description:'Sistema visual para rutinas, instrucciones, emociones, comunicación aumentativa y tableros personalizados.',image:'https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=1600&q=85',accent:'cyan',audiences:['TEA y TL','Comunicación aumentativa','Aula y hogar'],
  tools:[
   {title:'Constructor de rutinas',description:'Ordena pictogramas, agrega horarios, temporizador y refuerzo final.',href:'/biblioteca/rutina-visual',badge:'Secuencia'},
   {title:'Tablero de comunicación',description:'Crea paneles para pedir, elegir, expresar necesidades y participar en clases.',href:'/crear',badge:'CAA'},
   {title:'Emociones y autorregulación',description:'Identifica intensidad emocional y selecciona estrategias concretas de regulación.',href:'/biblioteca/semaforo-emociones',badge:'Bienestar'},
   {title:'Instrucciones visuales',description:'Convierte indicaciones extensas en pasos breves con imagen, texto y audio.',href:'/profesor-virtual',badge:'Adaptación IA'}
  ],resources:['Rutinas diarias','Normas y acuerdos','Emociones','Necesidades básicas','Secuencias de trabajo','Vocabulario escolar'],premium:['Texto simple y audio','Tableros editables','Impresión por tarjetas','Contraste regulable','Uso escolar y familiar']
 },
 {
  slug:'plan-lector',title:'Plan Lector',subtitle:'Leer con propósito, progresión y acompañamiento',description:'Módulo integral para organizar lecturas, medir fluidez, trabajar comprensión y acompañar el avance individual y grupal.',image:'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1600&q=85',accent:'violet',audiences:['1.º básico a 4.º medio','Lectura domiciliaria','Biblioteca escolar'],
  tools:[
   {title:'Rutas lectoras',description:'Organiza textos por extensión, complejidad, género, interés y habilidad prioritaria.',href:'/biblioteca/velocidad-lectora',badge:'Progresión'},
   {title:'Comprensión lectora',description:'Preguntas literales, inferenciales, críticas y creativas con retroalimentación explicativa.',href:'/biblioteca/bosque-inferencias',badge:'Comprensión'},
   {title:'Fluidez y velocidad',description:'Cronómetro opcional, precisión, entonación, registro personal y metas no comparativas.',href:'/biblioteca/velocidad-lectora',badge:'Seguimiento'},
   {title:'Club de lectura',description:'Bitácoras, recomendaciones, desafíos, conversación literaria y participación familiar.',href:'/planificador',badge:'Comunidad'}
  ],resources:['Lectura inicial','Fluidez y precisión','Comprensión literal','Inferencias','Vocabulario','Lectura crítica y literaria'],premium:['Texto, audio y lectura mediada','Metas individuales','Preguntas diversificadas','Bitácora lectora','Informe para familia']
 }
]

export const getLearningCenter=(slug:string)=>learningCenters.find(center=>center.slug===slug)
