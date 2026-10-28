// Payment preparation only. No HTTP route or live provider is connected.
// This module never imports or calls the scoring engine.
export interface PremiumConfig { priceCents:number; currency:'USD'; mode:'disabled'|'test'; ownerApprovalReference?:string }
export function premiumConfig(price='499'):PremiumConfig {
 const cents=Number(price);if(!Number.isInteger(cents)||cents<100||cents>10000)throw new Error('Invalid proposed premium price.');
 return {priceCents:cents,currency:'USD',mode:'disabled'};
}
export function requestLiveCheckout():never {throw new Error('Live checkout is not implemented or approved. Explicit owner approval and provider/security review are required.');}
export interface Quote {id:string;reportId:string;priceCents:number;currency:'USD';expires:number;accessHash:string}
export interface TestReceipt {eventId:string;quoteId:string;reportId:string;amount:number;currency:string;status:'paid'|'refunded';created:number}
export interface Entitlement {quoteId:string;reportId:string;accessHash:string;active:boolean}
export interface EntitlementStore { apply(eventId:string, entitlement:Entitlement):Promise<'applied'|'duplicate'> }
// Persistent adapters must apply this transition atomically with event consumption.
export function transitionEntitlement(previous:Entitlement|undefined,next:Entitlement):Entitlement {
 if(previous&&(previous.quoteId!==next.quoteId||previous.reportId!==next.reportId||previous.accessHash!==next.accessHash))throw new Error('Entitlement scope cannot change.');
 return previous&&!previous.active&&next.active?previous:next;
}
export function createTestQuote(reportId:string,accessHash:string,config:PremiumConfig,now=Date.now()):Quote {
 if(config.mode!=='test')throw new Error('Only explicitly enabled test mode can create a test quote.');
 if(!/^\d+:[a-f0-9]{40}:[\d.]+:[\d.]+:(library|application|cli|documentation|general)$/.test(reportId)||!/^[a-f0-9]{64}$/.test(accessHash))throw new Error('A versioned server report and capability hash are required.');
 return {id:crypto.randomUUID(),reportId,priceCents:config.priceCents,currency:config.currency,expires:now+30*60000,accessHash};
}
async function signature(body:string,secret:string){if(secret.length<32)throw new Error('A strong test webhook secret is required.');const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(body))),x=>x.toString(16).padStart(2,'0')).join('');}
export async function signTestReceipt(receipt:TestReceipt,secret:string){const body=JSON.stringify(receipt);return {body,signature:await signature(body,secret)};}
export async function authorizeTestReceipt(body:string,suppliedSignature:string,secret:string,quote:Quote,store:EntitlementStore,now=Date.now()) {
 if(body.length>2048||!/^[a-f0-9]{64}$/.test(suppliedSignature))throw new Error('Invalid test receipt.');
 const expected=await signature(body,secret);let difference=0;for(let n=0;n<64;n++)difference|=expected.charCodeAt(n)^suppliedSignature.charCodeAt(n);
 if(difference)throw new Error('Unauthenticated test receipt.');
 const receipt=JSON.parse(body) as TestReceipt;
 if(!/^[\w-]{1,100}$/.test(receipt.eventId)||receipt.quoteId!==quote.id||receipt.reportId!==quote.reportId||receipt.amount!==quote.priceCents||receipt.currency!==quote.currency||!['paid','refunded'].includes(receipt.status)||!Number.isSafeInteger(receipt.created)||Math.abs(now-receipt.created)>300000||receipt.status==='paid'&&now>quote.expires)throw new Error('Receipt does not match an active server quote.');
 return store.apply(receipt.eventId,{quoteId:quote.id,reportId:quote.reportId,accessHash:quote.accessHash,active:receipt.status==='paid'});
}
export function mayReadPremium(entitlement:Entitlement|undefined,reportId:string,accessHash:string){return !!entitlement&&entitlement.active&&entitlement.reportId===reportId&&entitlement.accessHash===accessHash;}
