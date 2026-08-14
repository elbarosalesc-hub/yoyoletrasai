import crypto from 'node:crypto'

function config(){
  return {
    endpoint:String(process.env.YOYO_STORAGE_ENDPOINT||'').replace(/\/$/,''),
    bucket:String(process.env.YOYO_STORAGE_BUCKET||'yoyo-private'),
    accessKey:String(process.env.YOYO_STORAGE_ACCESS_KEY||''),
    secretKey:String(process.env.YOYO_STORAGE_SECRET_KEY||''),
    region:String(process.env.YOYO_STORAGE_REGION||'yoyo-local'),
  }
}

export function yoyoStorageStatus(){
  const value=config()
  return { architecture:'YOYO Storage', mode:value.endpoint?'self-hosted-object-storage':'not-configured', configured:Boolean(value.endpoint&&value.bucket&&value.accessKey&&value.secretKey), bucket:value.bucket, region:value.region, ownership:'platform-controlled' }
}

export function storageObjectKey({organizationId,category='sources',filename='asset.bin'}:{organizationId:string;category?:string;filename?:string}){
  const clean=String(filename).replace(/[^a-zA-Z0-9._-]/g,'_').slice(-140)||'asset.bin'
  const digest=crypto.createHash('sha256').update(`${organizationId}:${Date.now()}:${clean}:${crypto.randomUUID()}`).digest('hex').slice(0,24)
  return `${organizationId}/${category}/${new Date().toISOString().slice(0,10)}/${digest}-${clean}`
}

function headers(method:string,objectKey:string,contentType:string){
  const value=config()
  if(!yoyoStorageStatus().configured)throw new Error('YOYO_STORAGE_NOT_CONFIGURED')
  const timestamp=new Date().toISOString()
  const canonical=[method,value.bucket,objectKey,timestamp].join('\n')
  const signature=crypto.createHmac('sha256',value.secretKey).update(canonical).digest('hex')
  return { value, timestamp, headers:{'Content-Type':contentType,'X-YOYO-Access-Key':value.accessKey,'X-YOYO-Timestamp':timestamp,'X-YOYO-Signature':signature} }
}

export async function putYoyoObject(objectKey:string,body:BodyInit,contentType='application/octet-stream'){
  const signed=headers('PUT',objectKey,contentType)
  const url=`${signed.value.endpoint}/${encodeURIComponent(signed.value.bucket)}/${objectKey.split('/').map(encodeURIComponent).join('/')}`
  const response=await fetch(url,{method:'PUT',headers:signed.headers,body,signal:AbortSignal.timeout(60000)})
  if(!response.ok)throw new Error(`YOYO_STORAGE_HTTP_${response.status}`)
  return {objectKey,provider:'yoyo_storage' as const}
}

export async function deleteYoyoObject(objectKey:string){
  const signed=headers('DELETE',objectKey,'application/octet-stream')
  const url=`${signed.value.endpoint}/${encodeURIComponent(signed.value.bucket)}/${objectKey.split('/').map(encodeURIComponent).join('/')}`
  const response=await fetch(url,{method:'DELETE',headers:signed.headers,signal:AbortSignal.timeout(60000)})
  if(!response.ok&&response.status!==404)throw new Error(`YOYO_STORAGE_HTTP_${response.status}`)
}
