import {createServer} from 'vite';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import {adapter} from '../server/sqlite.mjs';
import {handleAPI} from '../server/api.mjs';
mkdirSync('.local',{recursive:true});const sqlite=new DatabaseSync('.local/dimora.sqlite');sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
if(!sqlite.prepare("SELECT name FROM sqlite_master WHERE name='bookings'").get())sqlite.exec(readFileSync('drizzle/0000_dimora.sql','utf8'));
const args=process.argv,portIndex=args.indexOf('--port'),port=portIndex>=0?+args[portIndex+1]:4173,env={DB:adapter(sqlite),ADMIN_PASSWORD:process.env.ADMIN_PASSWORD||'dimora-local-demo',STRIPE_SECRET_KEY:process.env.STRIPE_SECRET_KEY,STRIPE_WEBHOOK_SECRET:process.env.STRIPE_WEBHOOK_SECRET,RESEND_API_KEY:process.env.RESEND_API_KEY,MAIL_FROM:process.env.MAIL_FROM};
const server=await createServer({server:{host:'0.0.0.0',port,strictPort:true,allowedHosts:true},plugins:[{name:'dimora-api',configureServer(server){server.middlewares.use(async(req,res,next)=>{if(!req.url.startsWith('/api/'))return next();try{const origin=`http://${req.headers.host}`;let data='';for await(const chunk of req){data+=chunk;if(data.length>20000){res.statusCode=413;res.end();return}}const request=new Request(new URL(req.url,origin),{method:req.method,headers:req.headers,...(req.method!=='GET'&&req.method!=='HEAD'?{body:data}:{})});const response=await handleAPI(request,env);res.statusCode=response.status;response.headers.forEach((v,k)=>res.setHeader(k,v));res.end(await response.text())}catch(e){res.statusCode=500;res.end(JSON.stringify({error:'Errore del server demo.'}));console.error(e)}})}}]});await server.listen();server.printUrls();
