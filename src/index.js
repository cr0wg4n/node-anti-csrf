import express from 'express';
import {doubleCsrf} from 'csrf-csrf';
import cookieParser from 'cookie-parser';
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
app.use(express.json());

const {
    invalidCsrfTokenError,
    generateToken,
    doubleCsrfProtection
} = doubleCsrf({
    getSecret:(req)=>req.secret,
    secret:CSRF_SECRET,
    cookieName:CSRF_COOKIE_NAME,
    cookieOptions:{
        sameSite:'strict',
        httpOnly:true,
        secure:true,
    },
    size:64,
    ignoredMethods:['GET','HEAD','OPTIONS'],
});

app.use(cookieParser(COOKIES_SECRET));

const csrfErrorHandler = (error,req,res,next) => {
    if(error==invalidCsrfTokenError){
        res.status(403).json({error:'csrf validation error'});
    }else{
        next();
    }
};

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname,'index.html'));
});

app.get('/csrf-token',(req,res)=>{
    return res.json({
        token:generateToken(res,req)
    });
});

app.post('/protected_endpoint',doubleCsrfProtection,csrfErrorHandler,(req,res)=>{
    console.log(req.body);
    res.json({protected_endpoint:'form processed successfully'});
});

// try with a HTTP client (is not protected from a CSRF attack)
app.post('/unprotected_endpoint',(req,res)=>{
    console.log(req.body);
    res.json({unprotected_endpoint:'form processed successfully'});
});

app.listen(PORT,()=>{
    console.log(`listen on http://127.0.0.1:${PORT}`);
});
