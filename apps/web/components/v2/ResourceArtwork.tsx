import {BookOpen,BrainCircuit,Cat,FlaskConical,Leaf,Lightbulb,PenLine,ShoppingCart,Sigma,TreePine,Workflow} from 'lucide-react'

const iconMap={
 forest:TreePine,
 reading:BookOpen,
 placevalue:Sigma,
 market:ShoppingCart,
 division:BrainCircuit,
 tracing:Leaf,
 letterm:PenLine,
 routine:Workflow,
 ecosystem:FlaskConical,
 circuit:Lightbulb,
 assessment:BookOpen,
 puzzle:Cat
} as const

export function ResourceArtwork({type}:{type:string}){
 const Icon=iconMap[type as keyof typeof iconMap]||BookOpen
 return <div className={`resource-artwork resource-artwork-${type}`} aria-hidden="true">
  <span className="resource-art-glow"/>
  <span className="resource-art-orbit orbit-a"/>
  <span className="resource-art-orbit orbit-b"/>
  <span className="resource-art-particle particle-a"/>
  <span className="resource-art-particle particle-b"/>
  <span className="resource-art-particle particle-c"/>
  <span className="resource-art-stage"><Icon strokeWidth={1.65}/></span>
  <span className="resource-art-floor"/>
 </div>
}
