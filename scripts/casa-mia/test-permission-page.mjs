import {chromium,expect} from '@playwright/test';
const origin=process.env.CASA_MIA_TEST_URL||'http://127.0.0.1:4184';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});
try {
 for(const mode of ['callback','promise','external']){
  const context=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  await context.addInitScript(mode=>{let value='default';window.__requests=0;Object.defineProperty(Notification,'permission',{get:()=>value});Notification.requestPermission=callback=>{window.__requests++;if(mode==='callback'){queueMicrotask(()=>{value='granted';callback(value)});return undefined}if(mode==='promise'){value='granted';return Promise.resolve(value)}setTimeout(()=>{value='granted'},50);return new Promise(()=>{})};},mode);
  const page=await context.newPage();await page.route('**/api/casa-mia/admin/push/diagnostic',r=>r.fulfill({json:{ok:true}}));
  await page.goto(origin+'/casa-mia/consenso.html');
  await expect(page.getByText('Il sito non ha ancora ricevuto il consenso.',{exact:true})).toBeVisible();
  if(await page.evaluate(()=>window.__requests)!==0)throw Error('Permission was requested without a click');
  await expect(page.locator('dialog')).toHaveCount(0);
  await page.getByRole('button',{name:'Consenti notifiche',exact:true}).click();
  await expect(page.getByRole('link',{name:'Continua e collega il telefono →'})).toBeVisible();
  await expect(page.locator('#status')).toHaveText('Consenso ricevuto. Ora collega il telefono nell’app.');
  if(await page.evaluate(()=>window.__requests)!==1)throw Error('Permission requested more than once');
  await context.close();
 }
 console.log('Permission page passed: explicit click only, no app dialog, callback-only and Promise browsers, external permission changes, and separate server-registration step. Permission responses simulated.');
}finally{await browser.close()}
