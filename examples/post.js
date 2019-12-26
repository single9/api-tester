const ApiTester = require('../dist/index.js');

// Create your API schema
const schema = [
  {
    name: 'newPost',  // this is your api function name
    path: '/posts',
    method: 'post',
  },
  {
    name: 'getPost',
    path: '/posts/:postId',
    method: 'get',
  },
];

const api = new ApiTester(schema, {
  rootUrl: 'https://jsonplaceholder.typicode.com'
});

async function start() {
  try {
    const newPost = await api.newPost({
      body: {
        title: 'foo!!!!!!',
        body: 'bar!!',
        userId: 1
      }
    });

    console.log('newPost', newPost.body);

    const getPost = await api.getPost({
      pathParams: {
        postId: 1
      }
    });

    console.log('getPost', getPost.body);
  } catch (err) {
    console.error(err);
  }
}

start();
