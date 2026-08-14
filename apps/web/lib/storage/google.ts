import { Storage } from '@google-cloud/storage'

let client:Storage|undefined
function config(){return {projectId:process.env.GOOGLE_CLOUD_PROJECT_ID||'',bucket:process.env.GOOGLE_CLOUD_STORAGE_BUCKET||'',clientEmail:process.env.GOOGLE_CLOUD_CLIENT_EMAIL||'',privateKey:String(process.env.GOOGLE_CLOUD_PRIVATE_KEY||'').replace(/\\n/g,'\n')}}
export function googleStorageStatus(){const value=config();return {configured:Boolean(value.projectId&&value.bucket&&value.clientEmail&&value.privateKey),projectId:value.projectId||null,bucket:value.bucket||null,location:process.env.GOOGLE_CLOUD_STORAGE_LOCATION||'southamerica-west1',ownership:'google-cloud-private'}}
function bucket(){const value=config();if(!googleStorageStatus().configured)throw new Error('GOOGLE_STORAGE_NOT_CONFIGURED');if(!client)client=new Storage({projectId:value.projectId,credentials:{client_email:value.clientEmail,private_key:value.privateKey}});return client.bucket(value.bucket)}
export async function putGoogleObject(objectKey:string,body:Buffer,contentType:string){const file=bucket().file(objectKey);await file.save(body,{resumable:body.byteLength>8*1024*1024,metadata:{contentType,cacheControl:'private, no-store'},preconditionOpts:{ifGenerationMatch:0}});const [metadata]=await file.getMetadata();return {objectKey,provider:'google_cloud_storage' as const,size:Number(metadata.size||0),crc32c:metadata.crc32c||null}}
export async function deleteGoogleObject(objectKey:string){await bucket().file(objectKey).delete({ignoreNotFound:true})}
