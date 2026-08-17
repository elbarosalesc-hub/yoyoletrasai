do $$
declare
  v_user_id uuid;
  v_org_id uuid;
  v_quality jsonb := '{"curricularAlignment":true,"duaPie":true,"accessibility":true,"teacherVersion":true,"studentVersion":true,"answerKeyOrRubric":true,"editableReusable":true,"visualQuality":true}'::jsonb;
begin
  select id into v_user_id from auth.users where lower(email) = 'elba.rosalesc@gmail.com' limit 1;
  if v_user_id is null then return; end if;

  select organization_id into v_org_id
  from public.organization_memberships
  where user_id = v_user_id and is_active = true
  order by (role = 'platform_admin'::public.app_role) desc, created_at
  limit 1;
  if v_org_id is null then return; end if;

  insert into public.platform_resources (organization_id,created_by,resource_key,title,payload) values
  (v_org_id,v_user_id,'premium-reading-3b-bosque-nativo','Comprensión lectora premium · El bosque nativo',
   '{"type":"reading-comprehension","level":"3° básico","skill":"Comprender, inferir y justificar con evidencia","context":"Bosque nativo chileno","premium":true,"subject":"Lenguaje y Comunicación","duaPie":{"visualSupport":true,"responseOptions":["escrita","oral","selección apoyada"],"oneInstructionPerBlock":true},"accessibility":{"plainLanguage":true,"readAloudReady":true,"highContrastReady":true},"studentVersion":{"title":"Guardianes del bosque nativo","text":"En el bosque nativo chileno conviven árboles, aves, insectos y pequeños mamíferos. Cada especie cumple una función. Cuando cuidamos el suelo, evitamos incendios y respetamos los senderos, ayudamos a proteger este ecosistema.","activities":["Subraya dos acciones que ayudan a cuidar el bosque.","Explica por qué cada especie es importante.","¿Qué podría ocurrir si las personas salen de los senderos? Justifica con una pista del texto.","Escribe una acción que puedas realizar para cuidar un espacio natural."]},"teacherVersion":{"objective":"Comprender un texto informativo breve, localizar información, realizar inferencias y justificar respuestas con evidencia.","sequence":["Activación con imagen y predicciones","Lectura guiada con vocabulario destacado","Preguntas literal, inferencial y crítica","Cierre metacognitivo"]},"answerKey":["Evitar incendios y respetar senderos.","Porque cada una cumple una función en el ecosistema.","Podrían dañar suelo o seres vivos; se espera justificación con evidencia del texto.","Respuesta personal pertinente."]}'::jsonb),
  (v_org_id,v_user_id,'premium-math-4b-feria-escolar','Problemas matemáticos premium · La feria escolar',
   '{"type":"word-problems","level":"4° básico","context":"Feria escolar chilena","premium":true,"subject":"Matemática","duaPie":{"scaffolding":true,"concreteSupport":true,"representations":["dibujo","tabla","operación"]},"accessibility":{"readAloudReady":true,"reducedDistractors":true},"studentVersion":{"scenario":"Jugos $800, brochetas $1.200, libros usados $2.500 y lápices $500.","activities":["Calcula 2 jugos y 1 brocheta.","Calcula el vuelto de $5.000 al comprar un libro.","Calcula cuánto reúnen al vender 6 brochetas.","Crea una compra de $4.100 y explica tu estrategia."]},"teacherVersion":{"objective":"Resolver problemas contextualizados seleccionando operaciones, representando datos y explicando estrategias.","materials":["tabla de precios","dinero manipulable","recta numérica opcional"]},"answerKey":["$2.800","$2.500","$7.200","$4.100 = $2.500 + $800 + $800. Se acepta otra combinación correcta con explicación."]}'::jsonb),
  (v_org_id,v_user_id,'premium-assessment-5b-ecosistemas','Evaluación premium adaptada · Ecosistemas',
   '{"type":"assessment","level":"5° básico","context":"Ecosistemas de Chile","premium":true,"subject":"Ciencias Naturales","duaPie":{"visualSupport":true,"alternativeResponse":["escrita","oral","señalamiento apoyado"],"extendedTimeSuggested":true},"accessibility":{"plainLanguage":true,"oneTaskPerBlock":true,"screenReaderReady":true},"studentVersion":{"sections":[{"title":"Observa y reconoce","items":["Nombra dos componentes bióticos y dos abióticos de un ecosistema."]},{"title":"Explica","items":["¿Por qué las plantas son importantes para otros seres vivos?"]},{"title":"Aplica","items":["Si disminuye mucho el agua disponible, ¿qué cambios podrían ocurrir? Explica uno."]}]},"teacherVersion":{"purpose":"Evaluación formativa con criterios visibles","criteria":["reconoce componentes","explica relaciones","aplica a situación nueva"]},"answerKey":{"criteria":"Acepta ejemplos correctos y explicación causal simple","rubric":["Logrado","En desarrollo","Requiere apoyo"]}}'::jsonb),
  (v_org_id,v_user_id,'premium-graphomotor-kinder-trazos','Grafomotricidad premium · Ruta de trazos',
   '{"type":"graphomotor","level":"Kínder","context":"Aventura por una ciudad amable","premium":true,"subject":"Lenguaje / Motricidad fina","duaPie":{"sensoryBreaks":true,"thickPathOption":true,"largerFormatOption":true,"handOverHandOptional":true},"accessibility":{"leftHandFriendly":true,"highContrastPaths":true,"reducedVisualClutter":true},"studentVersion":{"missions":["Ayuda al ascensor con líneas verticales.","Conduce el bus por caminos horizontales.","Sigue rampas inclinadas.","Rodea la plaza con curvas y círculos.","Sigue el caracol con espirales.","Cruza el río con ondas.","Llega al parque usando zigzag, bucles y arcos."]},"teacherVersion":{"guidance":"Modelar desde movimientos amplios hacia control de muñeca y pinza, sin exigir velocidad.","progression":["vertical","horizontal","inclinado","curvo","circular","espiral","ondas","zigzag","bucles","arcos","combinaciones"]},"answerKey":{"observation":"Evaluar control, direccionalidad, continuidad y postura; no perfección estética."}}'::jsonb),
  (v_org_id,v_user_id,'premium-escape-6b-agua','Escape room premium · Misión agua',
   '{"type":"escape-room","level":"6° básico","context":"Comunidad con escasez hídrica","premium":true,"subject":"Ciencias Naturales","duaPie":{"roles":["lector","organizador","explorador","relator"],"hintLevels":3,"alternativeResponse":true},"accessibility":{"audioOptional":true,"captionsReady":true,"keyboardReady":true,"reducedMotionMode":true},"studentVersion":{"story":"La reserva de agua de una comunidad está bajando. El equipo debe recuperar cinco códigos resolviendo desafíos científicos.","challenges":["Ordena etapas del ciclo del agua.","Relaciona un cambio de estado con un ejemplo cotidiano.","Interpreta un gráfico simple de consumo.","Detecta dos prácticas de desperdicio.","Elige un plan de ahorro y justifica por qué funcionaría."]},"teacherVersion":{"teams":"3-4 estudiantes","stages":5,"duration":"35-45 minutos","debrief":"Cierre con decisiones personales y comunitarias sobre uso responsable del agua."},"answerKey":{"teacherCodes":["CICLO","VAPOR","CONSUMO","AHORRO","PLAN"],"feedback":"Cada desafío incluye tres niveles de pista antes de revelar respuesta."}}'::jsonb)
  on conflict (organization_id,resource_key) do update set title=excluded.title,payload=excluded.payload,updated_at=now();

  insert into public.resource_candidates (organization_id,created_by,resource_key,title,payload,quality_score,quality_report,status,published_resource_id,reviewed_at)
  select p.organization_id,p.created_by,p.resource_key,p.title,p.payload,
    case p.resource_key
      when 'premium-reading-3b-bosque-nativo' then 96
      when 'premium-math-4b-feria-escolar' then 94
      when 'premium-assessment-5b-ecosistemas' then 95
      when 'premium-graphomotor-kinder-trazos' then 97
      when 'premium-escape-6b-agua' then 96
    end,
    v_quality || case when p.resource_key='premium-reading-3b-bosque-nativo' then '{"reviewNotes":"Recurso inicial premium completo y editable."}'::jsonb else '{}'::jsonb end,
    'published',p.id,now()
  from public.platform_resources p
  where p.organization_id=v_org_id and p.resource_key in (
    'premium-reading-3b-bosque-nativo','premium-math-4b-feria-escolar','premium-assessment-5b-ecosistemas','premium-graphomotor-kinder-trazos','premium-escape-6b-agua'
  )
  on conflict (organization_id,resource_key) do update set
    title=excluded.title,payload=excluded.payload,quality_score=excluded.quality_score,quality_report=excluded.quality_report,status='published',published_resource_id=excluded.published_resource_id,reviewed_at=now();
end $$;
