import { generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { loadGatewayCredential } from '../_runtime-credentials.js';

export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'method_not_allowed'});
  try{
    const {apiKey,source}=await loadGatewayCredential();
    const gateway=createGateway(apiKey?{apiKey}:{});
    const prompt=String(req.body?.prompt||'').trim();
    if(!prompt) return res.status(400).json({error:'prompt_required'});
    const result=await generateText({model:gateway('openai/gpt-5-mini'),prompt,system:'Eres YoYo AI, asistente pedagógico de YoYoLetrasAI. Responde en español, con enfoque curricular chileno, PIE/NEE, DUA, inclusión y utilidad práctica.'});
    return res.status(200).json({ok:true,text:result.text,credentialSource:source});
  }catch(error){return res.status(503).json({ok:false,error:'ai_unavailable',message:error?.message||'AI unavailable'});}
}
