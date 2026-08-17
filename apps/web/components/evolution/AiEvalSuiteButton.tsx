'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrainCircuit, RefreshCw } from 'lucide-react'

export function AiEvalSuiteButton({ caseIds }: { caseIds: string[] }) {
  const router=useRouter();const[running,setRunning]=useState(false);const[progress,setProgress]=useState('')
  async function run(){if(running||!caseIds.length)return;setRunning(true);let completed=0;let failed=0
    for(const caseId of caseIds){setProgress(`Evaluando ${completed+failed+1}/${caseIds.length}...`);try{const response=await fetch('/api/evolution/ai-eval',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({caseId})});if(response.ok)completed++;else failed++}catch{failed++}}
    setProgress(`Batería terminada · ${completed} completadas · ${failed} con error`);setRunning(false);router.refresh()
  }
  return <div className="evolution-run-control"><button className="btn btn-soft" disabled={running||!caseIds.length} onClick={run}>{running?<RefreshCw size={16} className="spin"/>:<BrainCircuit size={16}/>} {running?'Evaluando YOYO IA...':'Ejecutar batería YOYO IA'}</button>{progress&&<small role="status">{progress}</small>}</div>
}
