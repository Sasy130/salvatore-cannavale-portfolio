import {chromium,expect} from '@playwright/test';
import {demoData} from '../../src/features/casa-mia/demo.ts';
const origin=process.env.CASA_MIA_TEST_URL||'http://127.0.0.1:4183';
const browser=await chromium.launch({headless:true,executablePath:'/usr/bin/chromium'});
try {
 for(const samsung of [true,false]){
  const context=await browser.newContext({viewport:{width:390,height:844},userAgent:`Mozilla/5.0 (Linux; Android 16) AppleWebKit/537.36 Chrome/140.0.0.0 Mobile Safari/537.36${samsung?' SamsungBrowser/29.0':''}`,serviceWorkers:'block'});
  await context.addInitScript(()=>Object.defineProperty(Notification,'permission',{get:()=> 'default'}));
  const page=await context.newPage();await page.route('**/api/casa-mia/**',r=>{const p=new URL(r.request().url()).pathname;if(p.endsWith('/status'))return r.fulfill({json:{enabled:true,configured:true}});if(p.endsWith('/admin/console'))return r.fulfill({json:demoData()});if(p.endsWith('/admin/push/diagnostic'))return r.fulfill({json:{ok:true}});if(p.endsWith('/admin/push'))return r.fulfill({json:{configured:true,publicKey:'test',devices:[],deliveries:[]}});return r.abort()});
  await page.goto(origin+'/casa-mia/gestione?notifications=1');
  const link=page.getByRole('link',{name:'Apri in Google Chrome',exact:true});
  if(samsung){await expect(link).toBeVisible();const href=await link.getAttribute('href');if(!href.includes('package=com.android.chrome;')||!href.includes('notifications=1#Intent'))throw Error('Invalid Chrome handoff');await expect(page.getByText('I permessi dei due browser sono separati.',{exact:false})).toBeVisible();}
  else await expect(link).toHaveCount(0);
  await context.close();
 }
 console.log('Browser handoff passed: Samsung shows Chrome intent and explains separate permissions; Chrome does not show the handoff. Android native launch and real push reception still require device verification.');
}finally{await browser.close()}
