import express from 'express';
import {doubleCsrf} from 'csrf-csrf';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
    PORT,
    COOKIES_SECRET,
    CSRF_COOKIE_NAME,
    CSRF_SECRET
} from './config.js';

const app = express();

const {
    generateToken,
    doubleCsrfProtection
} = doubleCsrf({
    secret:CSRF_SECRET,
    cookieName:CSRF_COOKIE_NAME,
    cookieOptions:{
        sameSite:false,
        httpOnly:false,
        secure:false,
        signed:false
    },
    size:64,
    ignoredMethods:['GET','HEAD','OPTIONS'],
});

app.use(cookieParser(COOKIES_SECRET));
// app.use(cors());

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'../','index.html'));
});

app.get('/csrf-token',(req,res)=>{
    return res.json({
        token:generateToken(res,req)
    });
});

app.post('/protected_endpoint',doubleCsrfProtection,(req,res)=>{
    res.json({message:'form processed successfully'});
});

app.post('/unprotected_endpoint',(req,res)=>{
    res.json({message:'form processed successfully'});
});

app.listen(PORT,()=>{
    console.log(`listen on http://127.0.0.1:${PORT}`);
});
