export type WorldTheme='forest'|'city'|'laboratory'

export type ImmersiveMission={
  id:string
  title:string
  objective:string
  narration:string
  question:string
  options:string[]
  answer:number
  hint:string
  evidence:string
  targetObject:'cabin'|'owl'|'orb'|'sign'|'bridge'|'crystal'
  xp:number
}

export type ImmersiveWorld={
  id:string
  title:string
  shortTitle:string
  emoji:string
  subject:string
  level:string
  skill:string
  description:string
  theme:WorldTheme
  sky:string
  fog:string
  ground:string
  accent:string
  ambientLabel:string
  missions:ImmersiveMission[]
}

export type RuntimeImmersiveMission=ImmersiveMission&{
  correct:number
  story:string
  guide:string
}

export type RuntimeImmersiveWorld=Omit<ImmersiveWorld,'missions'>&{
  objective:string
  missions:RuntimeImmersiveMission[]
}

export const immersiveWorlds:ImmersiveWorld[]=[
  {
    id:'forest-inferences',
    title:'Bosque de las inferencias',
    shortTitle:'Bosque Mágico',
    emoji:'🌲',
    subject:'Lenguaje',
    level:'3.º básico',
    skill:'Inferencias sencillas',
    description:'Explora un bosque nocturno, reúne pistas y justifica inferencias usando evidencia visual y textual.',
    theme:'forest',
    sky:'#08162f',fog:'#0b2438',ground:'#153f34',accent:'#79f0b5',ambientLabel:'Bosque nocturno',
    missions:[
      {id:'light',title:'La luz de la cabaña',objective:'Inferir una acción a partir de una pista visual.',narration:'Observa la cabaña. Una ventana encendida puede revelar información que no está escrita.',question:'¿Qué pista permite inferir que alguien está dentro de la cabaña?',options:['La ventana está iluminada','Hay árboles alrededor','La luna está alta'],answer:0,hint:'Busca una señal de actividad humana.',evidence:'La ventana iluminada indica que alguien probablemente encendió una luz en el interior.',targetObject:'cabin',xp:120},
      {id:'flashlight',title:'El sendero oscuro',objective:'Relacionar una acción con el ambiente.',narration:'Luma lleva una linterna mientras avanza. Relaciona el objeto con las condiciones del lugar.',question:'¿Por qué Luma lleva una linterna?',options:['Para decorar el bosque','Para ver en la oscuridad','Para llamar a los animales'],answer:1,hint:'Piensa en la hora del día y la visibilidad.',evidence:'Es de noche y el bosque está oscuro, por eso necesita iluminar el camino.',targetObject:'orb',xp:120},
      {id:'owl',title:'El mensaje del búho',objective:'Inferir una indicación a partir del movimiento de un personaje.',narration:'El búho mira a Luma y vuela hacia la cabaña. Su movimiento funciona como una pista.',question:'¿Qué puede estar indicando el búho al volar hacia la cabaña?',options:['Que allí está la siguiente pista','Que quiere esconderse de Luma','Que comenzará a llover'],answer:0,hint:'Relaciona el movimiento del búho con la meta de la misión.',evidence:'El búho guía a Luma hacia el lugar donde debe continuar la búsqueda.',targetObject:'owl',xp:140},
      {id:'bridge',title:'El puente mojado',objective:'Anticipar una consecuencia usando evidencia del ambiente.',narration:'El puente está mojado y el río corre con fuerza. Decide qué acción sería más segura.',question:'¿Qué debería hacer Luma antes de cruzar?',options:['Correr sin mirar','Comprobar si las tablas están firmes','Apagar la linterna'],answer:1,hint:'Observa el estado del puente y piensa en seguridad.',evidence:'Si está mojado puede estar resbaladizo, por eso conviene comprobar su estabilidad.',targetObject:'bridge',xp:150},
      {id:'sign',title:'La señal escondida',objective:'Justificar una inferencia con dos pistas.',narration:'Una señal tiene una flecha y pequeñas huellas que se alejan hacia el este.',question:'¿Qué indican juntas la flecha y las huellas?',options:['La ruta por donde alguien avanzó','El lugar donde termina el bosque','La dirección del viento'],answer:0,hint:'Une la información de ambos elementos.',evidence:'La flecha marca una dirección y las huellas confirman que alguien siguió ese camino.',targetObject:'sign',xp:170}
    ]
  },
  {
    id:'city-place-value',
    title:'Ciudad del valor posicional',
    shortTitle:'Ciudad Numérica',
    emoji:'🏙️',
    subject:'Matemática',
    level:'3.º básico',
    skill:'Unidades, decenas y centenas',
    description:'Recorre una ciudad futurista y activa edificios resolviendo desafíos de valor posicional.',
    theme:'city',
    sky:'#101638',fog:'#17274e',ground:'#27324e',accent:'#65d8ff',ambientLabel:'Ciudad futurista',
    missions:[
      {id:'hundreds',title:'Torre de las centenas',objective:'Reconocer el valor de una cifra según su posición.',narration:'La torre muestra el número 482. Observa dónde está ubicada cada cifra.',question:'¿Cuál es el valor de la cifra 4 en 482?',options:['4 unidades','40 decenas','400 unidades'],answer:2,hint:'La cifra 4 está en la posición de las centenas.',evidence:'Cuatro centenas equivalen a cuatrocientas unidades.',targetObject:'cabin',xp:120},
      {id:'compose',title:'Puerta 356',objective:'Componer un número a partir de centenas, decenas y unidades.',narration:'La puerta necesita tres centenas, cinco decenas y seis unidades.',question:'¿Qué número abre la puerta?',options:['356','365','536'],answer:0,hint:'Escribe primero centenas, luego decenas y al final unidades.',evidence:'3 centenas, 5 decenas y 6 unidades forman 356.',targetObject:'orb',xp:130},
      {id:'compare',title:'Dos estaciones',objective:'Comparar números naturales.',narration:'Dos estaciones muestran 507 y 570. Debes elegir la de mayor valor.',question:'¿Cuál número es mayor?',options:['507','570','Son iguales'],answer:1,hint:'Compara primero centenas y después decenas.',evidence:'Ambos tienen 5 centenas, pero 570 tiene 7 decenas y 507 tiene 0 decenas.',targetObject:'sign',xp:140},
      {id:'decompose',title:'Código de energía',objective:'Descomponer un número de forma aditiva.',narration:'El generador utiliza el código 624.',question:'¿Cuál es la descomposición correcta de 624?',options:['600 + 20 + 4','60 + 20 + 4','600 + 2 + 4'],answer:0,hint:'Identifica centenas, decenas y unidades.',evidence:'6 centenas son 600, 2 decenas son 20 y 4 unidades son 4.',targetObject:'bridge',xp:150},
      {id:'round',title:'Tren aproximado',objective:'Aproximar a la centena más cercana.',narration:'El tren está en el kilómetro 348 y debes aproximar su ubicación.',question:'348 se aproxima a la centena más cercana como:',options:['300','350','400'],answer:0,hint:'Mira la cifra de las decenas.',evidence:'La cifra de las decenas es 4, por lo que se aproxima hacia abajo a 300.',targetObject:'crystal',xp:170}
    ]
  },
  {
    id:'science-body',
    title:'Laboratorio del cuerpo humano',
    shortTitle:'Laboratorio Vital',
    emoji:'🧪',
    subject:'Ciencias',
    level:'5.º básico',
    skill:'Sistemas del cuerpo',
    description:'Activa estaciones científicas y relaciona órganos, funciones y hábitos saludables.',
    theme:'laboratory',
    sky:'#081d2d',fog:'#103343',ground:'#214951',accent:'#63f0dd',ambientLabel:'Laboratorio científico',
    missions:[
      {id:'heart',title:'Estación del corazón',objective:'Relacionar un órgano con su función.',narration:'El corazón impulsa la sangre por todo el cuerpo.',question:'¿Cuál es la función principal del corazón?',options:['Bombear sangre','Producir aire','Digestionar alimentos'],answer:0,hint:'Piensa en el sistema circulatorio.',evidence:'El corazón actúa como una bomba que impulsa la sangre.',targetObject:'crystal',xp:120},
      {id:'lungs',title:'Cámara respiratoria',objective:'Reconocer el intercambio gaseoso.',narration:'Los pulmones permiten incorporar oxígeno y eliminar dióxido de carbono.',question:'¿Qué gas incorporamos principalmente al respirar?',options:['Oxígeno','Dióxido de carbono','Vapor de agua'],answer:0,hint:'Es el gas que las células necesitan para obtener energía.',evidence:'El oxígeno pasa desde los pulmones hacia la sangre.',targetObject:'orb',xp:130},
      {id:'stomach',title:'Zona digestiva',objective:'Identificar una función del sistema digestivo.',narration:'El estómago mezcla los alimentos con jugos digestivos.',question:'¿Qué ocurre principalmente en el estómago?',options:['Los alimentos comienzan a descomponerse','La sangre se oxigena','Se forman los huesos'],answer:0,hint:'Relaciona el órgano con la digestión.',evidence:'El estómago transforma los alimentos mediante movimientos y jugos digestivos.',targetObject:'cabin',xp:140},
      {id:'exercise',title:'Simulador de actividad',objective:'Explicar un cambio corporal durante el ejercicio.',narration:'Al correr, aumenta la frecuencia cardíaca y respiratoria.',question:'¿Por qué respiramos más rápido al hacer ejercicio?',options:['Porque el cuerpo necesita más oxígeno','Porque el estómago deja de funcionar','Porque disminuye la circulación'],answer:0,hint:'Los músculos activos necesitan más energía.',evidence:'La respiración aumenta para llevar más oxígeno a los músculos.',targetObject:'bridge',xp:150},
      {id:'habits',title:'Panel de hábitos',objective:'Evaluar hábitos que protegen la salud.',narration:'Selecciona la combinación que favorece el funcionamiento de los sistemas del cuerpo.',question:'¿Qué combinación representa hábitos saludables?',options:['Dormir bien, alimentarse variado y moverse','Dormir poco y consumir solo azúcar','Evitar el agua y no realizar actividad'],answer:0,hint:'Busca equilibrio, descanso y movimiento.',evidence:'Una alimentación variada, descanso suficiente y actividad física protegen la salud.',targetObject:'sign',xp:170}
    ]
  }
]

export function getImmersiveWorld(id:string):RuntimeImmersiveWorld{
  const source=immersiveWorlds.find(world=>world.id===id)??immersiveWorlds[0]
  return {
    ...source,
    objective:source.description,
    missions:source.missions.map(mission=>({
      ...mission,
      correct:mission.answer,
      story:mission.narration,
      guide:mission.objective
    }))
  }
}
