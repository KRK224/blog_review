require('dotenv').config();

import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import mongoose from 'mongoose';
import api from './api';

// const Koa = require('koa');
// const Router = require('koa-router');

// const bodyParser = require('koa-bodyparser');
// const mongoose = require('mongoose');
// const api = require('./api');

const {PORT, MONGO_URI} = process.env;

// mongoose랑 mongoDB랑 연동.
mongoose
.connect(MONGO_URI, {
  useNewUrlParser: true,
  useFindAndModify: false
}).then(()=>{
  console.log('Connected to MongoDB');
}).catch(e=>{
  console.log(e);
});


const app = new Koa();
const router = new Router();

router.use('/api', api.routes());
// api 라우트 적용

// app 인스턴스에 라우터 적용


// 라우터 적용 전에 bodyParser 적용
app.use(bodyParser());

// app 인스턴스에 router 적용
app.use(router.routes()).use(router.allowedMethods());

const port = PORT || 4000;

app.listen(port, () =>{
  console.log('Listening to port %d', port);
});