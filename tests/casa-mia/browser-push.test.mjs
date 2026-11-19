import test from 'node:test';
import assert from 'node:assert/strict';
import {waitForPushWorker, connectBrowserPush} from '../../src/features/casa-mia/browser-push.ts';
const turn=()=>new Promise(resolve=>setImmediate(resolve));
test('push registration waits for activated state even when an active worker already exists',async()=>{
 const registration=new EventTarget(),worker=new EventTarget();worker.state='activating';registration.active=worker;
 let settled=false;const ready=waitForPushWorker(registration).then(value=>{settled=true;return value});
 await turn();assert.equal(settled,false);
 worker.state='activated';worker.dispatchEvent(new Event('statechange'));assert.equal(await ready,registration);
});
test('concurrent retries reuse one pending Android subscription',async()=>{
 const prior=Object.getOwnPropertyDescriptor(globalThis,'navigator');let resolveSubscription,calls=0;
 const native=new Promise(resolve=>{resolveSubscription=resolve});
 const registration={active:{state:'activated'},pushManager:{getSubscription:async()=>null,subscribe:()=>{calls++;return native}}};
 Object.defineProperty(globalThis,'navigator',{configurable:true,value:{serviceWorker:{register:async()=>registration}}});
 try{
  const key=Buffer.from([4,...Array(64).fill(1)]).toString('base64url');
  const first=connectBrowserPush(key,()=>{}),second=connectBrowserPush(key,()=>{});
  await turn();assert.equal(calls,1);const subscription={endpoint:'test'};resolveSubscription(subscription);
  assert.equal(await first,subscription);assert.equal(await second,subscription);
 }finally{if(prior)Object.defineProperty(globalThis,'navigator',prior);else delete globalThis.navigator;}
});
