import {chromium, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import {defaults,quoteBooking} from '../../demo-sources/dimora-mia/server/booking.mjs';
const origin=process.env.DIMORA_TEST_URL||'http://127.0.0.1:4175';
const output='outputs/dimora-direct-booking';await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.DIMORA_TEST_BROWSER||'/usr/bin/chromium',args:['--no-sandbox']});
const errors=[],audits=[];
const year=new Date().getUTCFullYear()+1,start=`${year}-02-10`,end=`${year}-02-13`;
const config={...defaults,fullOnline:false,depositOnline:false,payOnArrival:true,manualConfirmation:false,assets:{}};
async function setup(page,{delayQuote=false}={}){
 const requests=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.route('**/api/casa-mia/**',async route=>{
  const request=route.request(),path=new URL(request.url()).pathname.split('/api/casa-mia/')[1];
  let body={};
  if(path==='status')body={enabled:true,paymentMode:'test'};
  else if(path==='availability')body={blocked:[end,`${year}-02-14`],config};
  else if(path==='quote'){
   const input=request.postDataJSON();requests.push({path,input});
   if(delayQuote)await new Promise(resolve=>setTimeout(resolve,500));
   body=quoteBooking(input,config);
  }else if(path==='book'){
   const input=request.postDataJSON();requests.push({path,input});
   body={id:'CM-UI-TEST',status:'confirmed',total:input.expectedTotal,emailSent:false};
  }else throw Error('Unexpected endpoint '+path);
  await route.fulfill({json:body});
 });
 return requests;
}
try{
 for(const [name,width,height] of [['desktop',1440,960],['mobile',390,844],['small',360,780]]){
  const page=await browser.newPage({viewport:{width,height},locale:'it-IT'});
  const requests=await setup(page);
  await page.goto(origin+'/demos/dimora-mia/');
  await expect(page.locator('.status-dot')).toHaveText('BOOKING TEST');
  await page.waitForTimeout(1300);
  await expect(page.locator('.hero-actions .direct-cta')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`${output}/${name}-hero.png`});
  // A booking shortcut remains available in the cinematic sequence, and hides in dialogs.
  await page.evaluate(()=>scrollTo({top:innerHeight*2,behavior:'instant'}));
  await expect(page.locator('.booking-dock')).toHaveAttribute('aria-hidden','false');
  await expect(page.locator('.explore-toggle')).toHaveCount(0);
  await expect(page.locator('.hero-seal')).toHaveCount(0);
  await expect(page.locator('.nav .book-link')).toHaveText(/^Prenota/);
  await page.locator('.editorial-gallery [data-gallery]').click();
  await expect(page.locator('.booking-dock')).toHaveAttribute('aria-hidden','true');
  await page.locator('#gallery-dialog .close-dialog').click();
  await expect(page.locator('.booking-dock')).toHaveAttribute('aria-hidden','true');
  await expect(page.locator('.image-card')).toHaveCount(2);
  if(width<700)expect(await page.locator('.image-grid').evaluate(e=>e.scrollWidth<=e.clientWidth)).toBe(true);
  await page.locator('.editorial-gallery').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${output}/${name}-diptych.png`});
  await page.locator('.nav .book-link').click();
  await expect(page.locator('.booking-dock')).toHaveAttribute('aria-hidden','true');
  await page.waitForTimeout(1000);
  expect(await page.locator('#booking-title').evaluate(e=>getComputedStyle(e).color)).toBe('rgb(52, 57, 46)');
  await page.screenshot({path:`${output}/${name}-booking.png`});
  if(width<700){
    const introHeight=await page.locator('.booking-heading').evaluate(element=>element.getBoundingClientRect().height);
    expect(introHeight).toBeLessThan(250);
  }
  await page.locator('[name=checkin]').fill(start);await page.locator('[name=checkin]').dispatchEvent('change');
  const date=new Date();const months=(year-date.getFullYear())*12+1-date.getMonth();
  for(let i=0;i<months;i++)await page.locator('#next-month').click();
  await expect(page.locator('#calendar-label')).toContainText(String(year));
  await page.locator(`[data-date="${start}"]`).click();
  await expect(page.locator(`[data-date="${end}"]`)).toBeEnabled();
  await page.locator(`[data-date="${end}"]`).click();
  await expect(page.locator('.range-start')).toContainText('ARRIVO');
  await expect(page.locator('.range-end')).toContainText('PARTENZA');
  await expect(page.locator('.range-end')).toHaveAttribute('aria-pressed','true');
  await page.locator('#availability-form .primary').click();
  await expect(page.locator('.quote-total')).toContainText('600');
  await page.locator('#availability-form .primary').click();
  await expect(page.locator('[name=name]')).toBeFocused();
  await page.locator('[name=name]').fill('Ospite di prova');
  await page.locator('[name=email]').fill('guest@example.test');
  await page.locator('.check-label input').check();
  await page.locator('#reservation-form .primary').click();
  await expect(page.locator('#checkout')).toContainText('CM-UI-TEST');
  expect(requests.filter(r=>r.path==='book')).toHaveLength(1);
  expect(requests.find(r=>r.path==='book').input.expectedTotal).toBe(60000);
  await page.screenshot({path:`${output}/${name}-confirmation.png`});
  // A single compositor panel reveals the room; no per-frame rounded mask.
  await page.evaluate(()=>scrollTo({top:document.querySelector('.journey').offsetTop+(document.querySelector('.journey').offsetHeight-innerHeight)*.48,behavior:'instant'}));
  await page.waitForTimeout(700);
  expect(await page.locator('.bedroom').evaluate(e=>getComputedStyle(e).clipPath)).toBe('none');
  await page.screenshot({path:`${output}/${name}-bedroom.png`});
  // Day/night follows the curve in both directions, with no jump at the start.
  await page.evaluate(()=>scrollTo({top:document.querySelector('.journey').offsetTop+(document.querySelector('.journey').offsetHeight-innerHeight)*.9,behavior:'instant'}));
  await page.waitForTimeout(800);
  const late=Number(await page.locator('.light-orb').getAttribute('cx'));
  await page.screenshot({path:`${output}/${name}-evening.png`});
  await page.evaluate(()=>scrollTo({top:document.querySelector('.journey').offsetTop+(document.querySelector('.journey').offsetHeight-innerHeight)*.72,behavior:'instant'}));
  await page.waitForTimeout(800);
  expect(Number(await page.locator('.light-orb').getAttribute('cx'))).toBeLessThan(late);
  // Reverse scroll must restore the arrival, not leave the final copy over the hero.
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(1000);
  expect(await page.locator('.copy-booking').evaluate(e=>getComputedStyle(e).visibility)).toBe('hidden');
  await page.locator('.closing-copy').scrollIntoViewIfNeeded();
  await expect(page.locator('.booking-dock')).toHaveAttribute('aria-hidden','true');
  await page.screenshot({path:`${output}/${name}-closing.png`});
  await page.close();
 }
 const reducedContext=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce',locale:'it-IT'});
 const reduced=await reducedContext.newPage();
 await setup(reduced,{delayQuote:true});await reduced.goto(origin+'/demos/dimora-mia/');
 await expect(reduced.locator('body')).toHaveClass(/reduced/);
 await reduced.locator('.hero-actions .direct-cta').click();
 await reduced.locator('[name=checkin]').fill(start);await reduced.locator('[name=checkout]').fill(end);
 await reduced.locator('#availability-form .primary').click();
 await reduced.locator('[name=checkout]').fill(`${year}-02-12`);await reduced.locator('[name=checkout]').dispatchEvent('change');
 await reduced.waitForTimeout(650);
 await expect(reduced.locator('.quote-total')).toHaveCount(0);
 await expect(reduced.locator('#availability-form .primary')).toContainText('Verifica disponibilità');
 const audit=await new AxeBuilder({page:reduced}).include('#booking').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 audits.push({name:'mobile-booking',violations:audit.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 await reduced.screenshot({path:`output/reduced-booking.png`.replace('output/',output+'/')});
 await reduced.close();
 if(errors.length)throw Error(JSON.stringify(errors));
 await writeFile(`${output}/audit.json`,JSON.stringify(audits,null,2));
 const serious=audits.flatMap(a=>a.violations).filter(v=>['critical','serious'].includes(v.impact));
 if(serious.length)throw Error(JSON.stringify(serious));
 console.log('Guest design verified: 3 viewports, direct booking, calendar boundary, shared API, server total, dialog shortcut, reverse scroll, stale quote, reduced motion and booking accessibility.');
}finally{await browser.close()}
