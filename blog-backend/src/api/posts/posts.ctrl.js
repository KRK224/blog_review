// let postId = 1; // id의 초깃값입니다.

// Mongo DB 연동 전 JS Array로 Data 구현
/* 
const posts = [
  {
    id:1,
    title: '제목',
    body: '내용',
  }
];

export const write = ctx => {
  // REST API의 request Body는 ctx.request.body에서 조회할 수 있다.
  const { title, body } = ctx.request.body;
  postId +=1;

  const post = {id: postId, title, body};
  posts.push(post);
  ctx.body = post;
};

export const list = ctx =>{
  ctx.body = posts;
};

export const read = ctx => {
  const {id} = ctx.params;
  const post = posts.find(p=>p.id.toString() ===id);

  if(!post){
    ctx.status = 404;
    ctx.body ={
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }
  ctx.body= post;
};

export const remove = (ctx) => {
  const { id } = ctx.params;
  const index = posts.findIndex((p) => p.id.toString() === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }

  posts.splice(index, 1);
  ctx.status = 204;
};

export const replace = (ctx) => {
  const { id } = ctx.params;
  const index = posts.findIndex((p) => p.id.toString() === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      message: '포스트가 존재하지 않습니다.',
    };
    return;
  }

  posts[index] = {
    id,
    ...ctx.request.body,
  };
  ctx.body = posts[index];
};

export const update = (ctx) => {
  const { id } = ctx.params;

  const index = posts.findIndex((p) => p.id.toString() === id);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = {
      messgae: '포스트가 존재하지 않습니다.',
    };

    return;
  }

  posts[index] = {
    ...posts[index],
    ...ctx.request.body,
  };

  ctx.body = posts[index];
}; 
*/

// MongoDB에 데이터 등록.


import Post from '../../models/post';
import mongoose from 'mongoose';
import Joi from 'joi';

const {ObjectId} = mongoose.Types;


export const checkID = (ctx, next) =>{
  const {id} = ctx.params;
  if(!ObjectId.isValid(id)){
    ctx.status = 400; // Bad Request
    return;
  }
  return next();
}

export const write = async ctx => {
  // Joi를 이용한 데이터 검증

  const schema = Joi.object().keys({
    title: Joi.string().required(),
    body: Joi.string().required(),
    tags: Joi.array()
    .items(Joi.string())
    .required(), // 문자열로 이루어진 배열
  });

  const result = schema.validate(ctx.request.body);
  if(result.error) {
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  const {title, body, tags } = ctx.request.body;
  // Post model에서 인스턴스(문서?) 생성.
  const post = new Post({
    title,
    body,
    tags
  });
  try {
    // 이를 MongoDB에 저장
    await post.save();
    ctx.body = post;
  } catch(e) {
    ctx.throw(500, e);
  }
};

export const list = async ctx => {

  const page = parseInt(ctx.query.page || '1', 10);
  
  if(page <1) {
    ctx.status = 400;
    return;
  }

  try {
    // Post model에서 특정 문서 or 인스턴스 찾기 => find() 
    // => 서버에 쿼리를 요청하기 위한 조건 exec()
    const posts = await Post.find()
    .sort({_id: -1})
    .limit(10)
    .skip((page-1)*10)
    .lean()
    .exec();

    // Header에 (key:value)값 지정 => ctx.set(key, value);
    const postCount = await Post.countDocuments().exec();
    ctx.set('Last-Page', Math.ceil(postCount/ 10));

    // 200자 이내로 자르기.
    // Mongoose의 model의 method find함수의 return값은 문서 인스턴스이다.
    // 따라서, JSON 형태로 전환 후 추가 전환이 필요.
    ctx.body = posts
    // .map(post => post.toJSON())
    .map(post => ({
      ...post,
      body:
      post.body.length <200? post.body : `${post.body.slice(0,200)}...`,
    }));
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const read = async ctx => {
  const {id} = ctx.params;
  try {
    const post =  await Post.findById(id).exec();
    if(!post) {
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

export const remove = async ctx => {
  const {id} = ctx.params;
  try {
    await Post.findByIdAndRemove(id).exec();
    ctx.status = 204; // No Content
  } catch (e) {
    ctx.throw(500,e);
  }
};

export const update = async ctx => {
  const {id} = ctx.params;
  
  // Joi를 이용한 데이터 검증.
  const schema = Joi.object.keys({
    title: Joi.string(),
    body: Joi.string(),
    tags: Joi.array().items(Joi.string()),
  });

  const result = schema.validate(ctx.request.body);

  if(result.error){
    ctx.status = 400;
    ctx.body = result.error;
    return;
  }

  try {
    const post = await Post.findByIdAndUpdate(id, ctx.request.body, {
      new: true, // 이 값을 설정하면 업데이트된 데이터를 반환합니다.
    }).exec();
    if(!post){
      ctx.status = 404;
      return;
    }
    ctx.body = post;
  } catch (e) {
    ctx.throw(500, e);
  }
};

