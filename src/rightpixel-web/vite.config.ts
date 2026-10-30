import { defineConfig } from 'vite';
export default defineConfig({server:{host:'localhost',port:5173,strictPort:true,proxy:{'/api':process.env.RIGHTPIXEL_API_PROXY??'http://localhost:5100'}}});
