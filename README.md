Api Tester
==========

A RESTful API tester

Installation
============

    npm i @single9/api-tester

Usage
============

```js
const { ApiTester } = require('@single9/api-tester');
```

Create APIs
------------
```js
const api = new ApiTester([
  {
    name: '<Api Name>',       // only allow certain words and digits
    path: '<Api Path>',       // e.g. /api/posts
    method: '<HTTP Method>',  // e.g. post
  },
], {
  rootUrl: '<API root URL>'   // e.g. https://jsonplaceholder.typicode.com
                              // Default: http://localhost:3000
  showResult: true            // set false to disable results console log
}).Apis;  // Don't forget this
```

Use Your Api
------------

### Usage

    ApiTester.Apis.<name>(params)

- **params**
  - queryString
  - pathParams
  - body
  - uploads
  - tester

#### params.queryString

Used for query string. e.g. /users?limit=100

```js
api.test({
  queryString: {
    key: value
  }
})
```

```js
api.test({
  queryString: [
    {
      name: string,
      value: string | number,
    }
  ]
})
```

#### params.pathParams

Used for path parameters. e.g. /user/:id

```js
api.test({
  pathParams: {
    key: value
  }
})
```

```js
api.test({
  pathParams: [
    {
      name: string,
      value: string | number,
    }
  ]
})
```

#### params.body

Used for request body.

```js
api.test({
  body: {
    key: value
  }
})
```

#### params.uploads

Used for upload files.

```js
api.test({
  uploads: [
    {
      fieldName: '<form feild name>',
      path: '<file path>'
      filename?: '<file name>',
    }
  ]
})
```

#### params.tester

Do some test after responded.

```js
api.test({
  tester: function (res) {
    assert(res === string);
  }
})
```

### Example

```js
const api = new ApiTester([
  {
    name: 'getPosts',
    path: '/api/posts',
    method: 'get',
  },
], {
  showResult: true            // set false to disable results console log
}).Apis;

api.getPosts()
  .then(result => console.log(result))
  .catch(err => console.error(err))
```

Upload File
-----------
```js
ApiTester.Apis.<ApiName>({
  uploads: [
    fieldName: '<Form Field Name>',
    path: '<File Path>',
    filename: '<File Name>',
  ]
})
```
```js
const path = require('path');
const api = new ApiTester([
  {
    name: 'uploadFile',
    path: '/api/upload',
    method: 'post',
  },
], {
  showResult: true            // set false to disable results console log
}).Apis;

const filePath = path.join(__dirname, 'image.jpg'),

api.uploadFile({
    uploads: [
      fieldName: 'file',
      path: filePath,
      filename: path.basename(filePath),
    ]
  })
  .then(result => console.log(result))
  .catch(err => console.error(err))
```

Example
------------

```js
const assert = require('assert').strict;
const { ApiTester } = require('@single9/api-tester');

// Create your API schema
const schema = [
  {
    name: 'newPost',  // this is your api function name
    path: '/posts',
    method: 'post',
  },
  {
    name: 'getTodo',
    path: '/todos/:todoId',  // path parameter
    method: 'get',
  },
];

const api = new ApiTester(schema, {
  rootUrl: 'https://jsonplaceholder.typicode.com',
  showResult: true
}).Apis;

async function start() {
  try {
    await api.newPost({
      // Post Body
      body: {
        title: 'foo!!!!!!',
        body: 'bar!!',
        userId: 1
      },
      // Tester
      tester: function(resp) {
        assert.equal(typeof(resp.id), 'number');
      }
    });

    await api.getTodo({
      pathParams: [{
        name: 'todoId', // replace `:todoId` in path
        value: 2
      }],
      tester: function(resp) {
        assert.equal(typeof(resp.title), 'string');
      }
    });
    
  } catch (err) {
    console.error(err);
  }
}

start();
```
