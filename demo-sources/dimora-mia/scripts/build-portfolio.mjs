import {build} from 'vite';import {resolve} from 'node:path';
await build({base:'/demos/dimora-mia/',define:{'import.meta.env.VITE_PORTFOLIO_LOCAL':JSON.stringify('true')},build:{outDir:resolve('../../public/demos/dimora-mia'),emptyOutDir:true,rollupOptions:{input:{main:resolve('index.html'),admin:resolve('admin.html')}}}});
