export type YoyoRuntimeSource={id?:string;url:string;title?:string}
export type YoyoRuntimeResult={text:string;runtime:'yoyo-native'|'external-fallback';usage?:unknown;modelRoute:string;sources:YoyoRuntimeSource[]}

export function yoyoRuntimeStatus(){
  const endpoint=String(process.env.YOYO_NATIVE_INFERENCE_URL||'').replace(/\/$/,'')
  return {configured:Boolean(endpoint),endpointConfigured:Boolean(endpoint),model:process.env.YOYO_NATIVE_MODEL||'yoyo-edu-cl',fallbackAllowed:process.env.YOYO_ALLOW_EXTERNAL_FALLBACK!=='false'}
}

export async function generateYoyoNative({system,prompt,maxOutputTokens,requireWebResearch=false,officialDomains=[]}:{system:string;prompt:string;maxOutputTokens:number;requireWebResearch?:boolean;officialDomains?:readonly string[]}):Promise<YoyoRuntimeResult>{
  const status=yoyoRuntimeStatus()
  const endpoint=String(process.env.YOYO_NATIVE_INFERENCE_URL||'').replace(/\/$/,'')
  if(!status.configured)throw new Error('YOYO_NATIVE_NOT_CONFIGURED')
  const response=await fetch(`${endpoint}/v1/generate`,{
    method:'POST',
    headers:{'Content-Type':'application/json',...(process.env.YOYO_NATIVE_INFERENCE_TOKEN?{Authorization:`Bearer ${process.env.YOYO_NATIVE_INFERENCE_TOKEN}`}:{})},
    body:JSON.stringify({
      model:status.model,
      system,
      prompt,
      maxOutputTokens,
      temperature:0.2,
      research:requireWebResearch?{
        enabled:true,
        webSearch:true,
        requireCitations:true,
        allowedDomains:[...officialDomains],
        rejectUnverifiedClaims:true,
      }:{enabled:false},
      dataPolicy:{training:false,retention:'ephemeral'},
    }),
    signal:AbortSignal.timeout(110000),
    cache:'no-store',
  })
  if(!response.ok)throw new Error(`YOYO_NATIVE_HTTP_${response.status}`)
  const data=await response.json() as {text?:string;usage?:unknown;model?:string;sources?:Array<{id?:string;url?:string;title?:string}>}
  if(!data.text)throw new Error('YOYO_NATIVE_EMPTY_RESPONSE')
  const sources=Array.isArray(data.sources)?data.sources.filter((source):source is {id?:string;url:string;title?:string}=>Boolean(source&&typeof source.url==='string'&&source.url)):[]
  return {text:data.text,runtime:'yoyo-native',usage:data.usage,modelRoute:data.model||status.model,sources}
}
