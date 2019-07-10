Api Tester
==========

A RESTful API tester

Installation
============

    npm i @single9/api-tester

Usage
============

Example
------------

```js
const assert = require('assert').strict;
const ApiTester = require('@single9/api-tester');

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
    queryString: [{
      name: 'test',
      value: 'querystring_test'
    }],
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
      body: {
        title: 'foo!!!!!!',
        body: 'bar!!',
        userId: 1
      },
      tester: function(resp) {
        try {
          assert.equal(typeof(resp.id), 'number', 'Type of id is not equal to number');
          console.log('Done');
        } catch (err) {
          console.error(err);
        }
      }
    });

    await api.getTodo({
      pathParams: [{
        name: 'todoId', // replace `:todoId` in path
        value: 2
      }],
      tester: function(resp) {
        try {
          assert.equal(typeof(resp.title), 'string', 'Type of title is not equal to string');
          console.log('Done');
        } catch (err) {
          console.error(err);
        }
      }
    });
  } catch (err) {
    console.error(err);
  }
}

start();
```
