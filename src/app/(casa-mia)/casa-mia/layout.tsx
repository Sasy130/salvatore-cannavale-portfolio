import type {Metadata,Viewport} from 'next';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource-variable/manrope';
import '@/features/casa-mia/owner.css';
export const metadata:Metadata={title:'CASA MIA — La tua casa, sotto controllo',description:'Area proprietario per calendario e prenotazioni CASA MIA.',robots:{index:false,follow:false},manifest:'/casa-mia/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'default',title:'CASA MIA'},icons:{icon:'/casa-mia/icon.svg',apple:'/casa-mia/icon-192.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#f4f5f0'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="it"><body className="cm-owner">{children}</body></html>}
