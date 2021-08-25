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

export const write = async ctx => {
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
  try {
    // Post model에서 특정 문서 or 인스턴스 찾기 => find() 
    // => 서버에 쿼리를 요청하기 위한 조건 exec()
    const posts = await Post.find().exec();
    ctx.body = posts;
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

export const remove = async ctx => {};
export const update = async ctx => {};

