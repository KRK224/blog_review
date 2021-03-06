import Router from 'koa-router';
import * as postsCtrl from './posts.ctrl';

// const Router = require('koa-router');
// const postsCtrl = require('./posts.ctrl');

const posts = new Router();

// const printInfo = (ctx) => {
//   // console.log('posts api working good');
//   ctx.body = {
//     method: ctx.method,
//     path: ctx.path,
//     params: ctx.params,
//   };
// };




posts.get('/', postsCtrl.list);
posts.post('/', postsCtrl.write);
posts.get('/:id', postsCtrl.checkID, postsCtrl.read);
posts.delete('/:id', postsCtrl.checkID, postsCtrl.remove);
// posts.put('/:id', postsCtrl.replace);
posts.patch('/:id', postsCtrl.checkID, postsCtrl.update);

// module.exports = posts;
export default posts;