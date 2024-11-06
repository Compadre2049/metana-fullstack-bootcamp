const express = require('express');

const app = express();

const http = require('http');

const fs = require('fs');

const port = 3000;

const server = http.createServer((req, res) => {
  console.log(req.url, req.method);

  res.setHeader('Content-Type', 'text/html');

  let path = './public/';
  switch (req.url) {
    case '/':
      path += 'index.html';
      break;
    case '/hello':
      path += 'hello.html';
      break;
    case '/blog':
      path += 'blog.html';
      break;
    case '/about':
      path += 'about.html';
      break;
  }

  fs.readFile(path, (err, data) => {
    if (err) {
      console.log(err);
      res.end();
    } else {
      res.end(data);
    }
  });
});

server.listen(3000, 'localhost', () =>
  console.log('listening for requests on port 3000')
);
