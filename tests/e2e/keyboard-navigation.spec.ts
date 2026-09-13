import {expect,test,type Page} from '@playwright/test'

const baseUrl='http://127.0.0.1:3000'

async function keyboardAudit(page:Page,minDistinct:number){
 const visited=new Set<string>()
 for(let index=0;index<30;index++){
  await page.keyboard.press('Tab')
  const state=await page.evaluate(()=>{
   const element=document.activeElement as HTMLElement|null
   if(!element||element===document.body)return null
   const style=window.getComputedStyle(element)
   const rect=element.getBoundingClientRect()
   const label=element.getAttribute('aria-label')||element.textContent?.trim()||element.getAttribute('name')||element.id||element.tagName
   return {
    key:`${element.tagName}:${label}`,
    tag:element.tagName,
    visible:rect.width>0&&rect.height>0&&style.visibility!=='hidden'&&style.display!=='none',
    focusIndicator:style.outlineStyle!=='none'||style.boxShadow!=='none',
   }
  })
  if(!state)continue
  expect(state.visible).toBeTruthy()
  expect(state.focusIndicator,`Falta indicador de foco en ${state.key}`).toBeTruthy()
  visited.add(state.key)
 }
 expect(visited.size).toBeGreaterThanOrEqual(minDistinct)
}

test.describe('navegación pública por teclado',()=>{
 test('portada expone sus destinos principales mediante Tab y foco visible',async({page})=>{
  await page.goto(`${baseUrl}/presentacion`,{waitUntil:'networkidle'})
  await keyboardAudit(page,8)
 })

 test('acceso permite recorrer controles esenciales sin mouse',async({page})=>{
  await page.goto(`${baseUrl}/acceso`,{waitUntil:'networkidle'})
  await keyboardAudit(page,6)
  await page.getByRole('textbox',{name:/Correo electrónico/i}).focus()
  await page.keyboard.type('docente@example.test')
  await page.keyboard.press('Tab')
  const tag=await page.evaluate(()=>document.activeElement?.tagName||'')
  expect(['INPUT','BUTTON','A']).toContain(tag)
 })

 test('enlace de entrada puede activarse con teclado',async({page})=>{
  await page.goto(`${baseUrl}/presentacion`,{waitUntil:'networkidle'})
  const link=page.getByRole('link',{name:/Entrar a la plataforma/i}).first()
  await link.focus()
  await expect(link).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/acceso/)
 })
})
