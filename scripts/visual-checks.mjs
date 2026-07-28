import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000'
const outputDir = 'artifacts/visual-validation'
await fs.mkdir(outputDir,{recursive:true})
const browser=await chromium.launch({headless:true})
const results=[]
const failures=[]

async function validateViewport(name,viewport){
 const page=await browser.newPage({viewport})
 const consoleErrors=[]
 page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())})
 page.on('pageerror',e=>consoleErrors.push(e.message))
 const record={name,viewport,checks:[]}
 try{
  const response=await page.goto(`${baseUrl}/app`,{waitUntil:'domcontentloaded',timeout:30000})
  record.status=response?.status()||null
  await page.locator('.approved-dashboard').waitFor({state:'visible',timeout:15000})
  await page.waitForTimeout(600)
  const required=['.approved-welcome-row','.approved-stats','.approved-featured','.approved-lower-grid','.approved-extra-grid']
  for(const selector of required){
   const count=await page.locator(selector).count()
   record.checks.push({check:selector,count})
   if(count!==1)throw new Error(`${name}: falta o se duplicó ${selector}`)
  }
  const metrics=await page.evaluate(()=>{
   const root=document.documentElement
   const body=document.body
   const stats=document.querySelector('.approved-stats')
   const lower=document.querySelector('.approved-lower-grid')
   const mobileNav=document.querySelector('.premium-mobile-nav')
   const hero=document.querySelector('.approved-featured')
   return{
    scrollWidth:Math.max(root.scrollWidth,body.scrollWidth),
    clientWidth:root.clientWidth,
    statsColumns:stats?getComputedStyle(stats).gridTemplateColumns:'',
    lowerColumns:lower?getComputedStyle(lower).gridTemplateColumns:'',
    mobileNavDisplay:mobileNav?getComputedStyle(mobileNav).display:'missing',
    heroHeight:hero?hero.getBoundingClientRect().height:0
   }
  })
  record.metrics=metrics
  if(metrics.scrollWidth>metrics.clientWidth+2)throw new Error(`${name}: existe desbordamiento horizontal`)
  if(metrics.heroHeight<360)throw new Error(`${name}: el juego destacado quedó demasiado pequeño`)
  if(name==='desktop'){
   const columns=v=>v.trim().split(/\s+/).filter(Boolean).length
   if(columns(metrics.statsColumns)<4)throw new Error('desktop: las métricas no están en cuatro columnas')
   if(columns(metrics.lowerColumns)<2)throw new Error('desktop: actividades y acciones rápidas no están en dos columnas')
   if(metrics.mobileNavDisplay!=='none')throw new Error('desktop: navegación móvil visible')
  }
  if(name==='mobile'){
   if(metrics.mobileNavDisplay==='none'||metrics.mobileNavDisplay==='missing')throw new Error('mobile: navegación inferior ausente')
   await page.locator('.mobile-menu-button').click()
   await page.locator('.premium-sidebar.sidebar-open').waitFor({state:'visible',timeout:5000})
   await page.locator('.sidebar-close').click()
  }
  await page.locator('.approved-feature-controls button').nth(1).click()
  await page.locator('.approved-preview').click()
  await page.locator('.ref-arrows button').nth(1).click()
  await page.screenshot({path:`${outputDir}/${name}-validated.png`,fullPage:true})
  const relevant=consoleErrors.filter(e=>!e.includes('favicon')&&!e.includes('Failed to load resource'))
  if(relevant.length)throw new Error(`${name}: errores de consola: ${relevant.join(' | ')}`)
  record.passed=true
 }catch(error){
  record.passed=false
  record.error=error instanceof Error?error.message:String(error)
  failures.push(record.error)
  try{await page.screenshot({path:`${outputDir}/${name}-failure.png`,fullPage:true})}catch{}
 }finally{
  results.push(record)
  await page.close()
  await fs.writeFile(`${outputDir}/results.json`,JSON.stringify({results,failures,generatedAt:new Date().toISOString()},null,2))
 }
}

try{
 await validateViewport('desktop',{width:1440,height:1000})
 await validateViewport('mobile',{width:390,height:844})
}finally{await browser.close()}
if(failures.length){console.error('Validación visual fallida:',failures);process.exit(1)}
console.log('Validación visual completada correctamente.')
